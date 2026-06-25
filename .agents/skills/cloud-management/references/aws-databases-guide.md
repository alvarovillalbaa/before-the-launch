# AWS Databases Guide

Use this when the task involves AWS database service selection, schema design, migrations, connection management, or operational issues across RDS, Aurora, Aurora DSQL, DynamoDB, or ElastiCache.

## Service Selection

| Workload | Service | Notes |
|---|---|---|
| Relational (PostgreSQL/MySQL) | RDS or Aurora Cluster | Default path. RDS for simplicity; Aurora for performance, global tables, or Serverless v2. |
| Serverless relational | Aurora Serverless v2 | Scales to zero. Cold-start pause behavior must be acceptable. Not suitable for latency-sensitive APIs on the first request. |
| Distributed serverless SQL | Aurora DSQL | PostgreSQL-compatible, multi-region active-active, no cluster management. Use for multi-tenant SaaS or globally distributed reads/writes. |
| Document / key-value | DynamoDB | Model queries before schema. High throughput, predictable latency. Joins and transactions are constrained. |
| Cache / session | ElastiCache (Redis or Valkey) | Keep private. Size from metrics. Valkey preferred for new deployments (open-source Redis fork). |
| Analytics / OLAP | Redshift or Athena | Not covered here — see cloud-architecture-patterns.md for data pipeline patterns. |

## RDS

### Setup Checklist

- Private subnets only. No public accessibility unless there is an explicit user requirement.
- DB subnet group spans at least two AZs.
- Security group allows access only from known app subnets or specific task role IDs.
- Automated backups enabled (7–35 days retention).
- Parameter group tuned for the workload (e.g., `max_connections`, `work_mem`).
- Performance Insights enabled.
- Enhanced monitoring enabled (1-second granularity for production).

```bash
aws rds describe-db-instances --profile my-dev
aws rds describe-db-instances \
  --db-instance-identifier my-db \
  --query 'DBInstances[0].{Class:DBInstanceClass,Engine:Engine,Version:EngineVersion,MultiAZ:MultiAZ,Storage:AllocatedStorage,PubliclyAccessible:PubliclyAccessible}' \
  --profile my-dev
```

### Common Operations

```bash
# Create a snapshot before any destructive change
aws rds create-db-snapshot \
  --db-instance-identifier my-db \
  --db-snapshot-identifier my-db-pre-migration-$(date +%Y%m%d) \
  --profile my-dev

# Check snapshot status
aws rds describe-db-snapshots \
  --db-instance-identifier my-db \
  --profile my-dev

# Modify instance class (requires approval)
aws rds modify-db-instance \
  --db-instance-identifier my-db \
  --db-instance-class db.t3.medium \
  --apply-immediately \
  --profile my-dev

# View pending maintenance
aws rds describe-pending-maintenance-actions --profile my-dev
```

### Connection Management

RDS has a hard `max_connections` ceiling based on instance class. Exceeding it causes `too many connections` errors:

| Instance class | max_connections (PostgreSQL default) |
|---|---|
| db.t3.micro | ~60 |
| db.t3.small | ~130 |
| db.t3.medium | ~250 |
| db.r6g.large | ~1700 |

Mitigations:
- **Application-level connection pool** (PgBouncer in transaction mode, or framework pooling like Knex / SQLAlchemy).
- **RDS Proxy** for Lambda-to-RDS or serverless-to-RDS traffic. The Proxy pools connections and handles IAM auth token exchange.

```bash
aws rds describe-db-proxies --profile my-dev
aws rds create-db-proxy \
  --db-proxy-name my-proxy \
  --engine-family POSTGRESQL \
  --auth '[{"AuthScheme":"SECRETS","SecretArn":"arn:aws:secretsmanager:<region>:<account>:secret:my-db-credentials","IAMAuth":"REQUIRED"}]' \
  --role-arn arn:aws:iam::<account>:role/my-proxy-role \
  --vpc-subnet-ids subnet-abc subnet-def \
  --no-require-tls \
  --profile my-dev
```

## Aurora

Aurora shares the RDS management API but has cluster-level concepts: a cluster endpoint (read/write), a reader endpoint (read replicas), and optionally custom endpoints.

```bash
aws rds describe-db-clusters --profile my-dev
aws rds describe-db-clusters \
  --db-cluster-identifier my-cluster \
  --query 'DBClusters[0].{Endpoint:Endpoint,ReaderEndpoint:ReaderEndpoint,Engine:Engine,Version:EngineVersion,Status:Status,MultiAZ:MultiAZ}' \
  --profile my-dev
```

### Aurora Serverless v2

Aurora Serverless v2 scales capacity in ACU increments (0.5 ACU = ~1 GB RAM). Configure min/max ACU:

```bash
aws rds modify-db-cluster \
  --db-cluster-identifier my-cluster \
  --serverless-v2-scaling-configuration MinCapacity=0.5,MaxCapacity=16 \
  --apply-immediately \
  --profile my-dev
```

Pause behavior: Aurora Serverless v2 does not pause to zero by default. Only Aurora Serverless v1 pauses. Verify the expected behavior before choosing it as a cost-saving measure.

### Aurora Global Database

For multi-region active-passive or active-active:

```bash
aws rds describe-global-clusters --profile my-dev
```

Approval-worthy: adding or removing regions from a global cluster, promoting a secondary region.

## Aurora DSQL

Aurora DSQL is a serverless, distributed, PostgreSQL-compatible database with multi-region active-active writes. No cluster sizing, no instance management.

### When to Use Aurora DSQL

- Multi-tenant SaaS where tenant data must be regionally isolated but globally queryable.
- Applications that need distributed writes without managing Aurora Global Database replication lag.
- Serverless PostgreSQL workloads where Aurora Serverless v1 pause behavior or Serverless v2 minimum ACU costs are too high.

### Key Constraints

- PostgreSQL-compatible but not identical: some extensions, COPY commands, and DDL behaviors differ.
- No foreign key constraints across tenants. Model for tenant isolation at the application layer.
- IAM token authentication is the primary auth mechanism (no static passwords by default).
- DDL is non-transactional relative to DML — plan migrations carefully.

### Cluster Management

```bash
# List DSQL clusters
aws dsql list-clusters --profile my-dev

# Get cluster details
aws dsql get-cluster --identifier <cluster-id> --profile my-dev

# Create a cluster (approval required)
aws dsql create-cluster \
  --tags '{"Environment":"dev","Owner":"backend"}' \
  --profile my-dev
```

### IAM Authentication

DSQL uses IAM auth tokens instead of static passwords. Generate a token:

```bash
aws dsql generate-auth-token \
  --hostname <cluster-id>.dsql.<region>.on.aws \
  --region <region> \
  --profile my-dev
```

Use the token as the PostgreSQL password:

```bash
PGPASSWORD=$(aws dsql generate-auth-token --hostname <cluster-id>.dsql.<region>.on.aws --region us-east-1 --profile my-dev) \
  psql -h <cluster-id>.dsql.<region>.on.aws -U admin -d postgres
```

Rotate IAM tokens before expiry (default 900 seconds). In application code, refresh the token before each connection or use the AWS SDK's `DsqlSigner` helper.

### Schema Management

```bash
# Apply DDL
psql -h <cluster-id>.dsql.<region>.on.aws -U admin -d postgres \
  -c "CREATE TABLE users (id UUID PRIMARY KEY, tenant_id UUID NOT NULL, email TEXT NOT NULL);"

# List tables
psql ... -c "\dt"

# Run a migration file
psql ... -f migrations/001_initial_schema.sql
```

Multi-tenant schema pattern:
- Row-level tenant isolation: `tenant_id` column on every table, filtered in all queries.
- Schema-per-tenant: DSQL supports multiple schemas. Use `CREATE SCHEMA tenant_<id>` for strict isolation when tenant count is bounded.

### MySQL to Aurora DSQL Migration

1. Export schema from MySQL:
   ```bash
   mysqldump --no-data --single-transaction mydb > schema.sql
   ```
2. Convert MySQL DDL to PostgreSQL-compatible syntax (data types, `AUTO_INCREMENT` → sequences, ticks → double quotes).
3. Apply converted schema to DSQL cluster.
4. Export data:
   ```bash
   mysqldump --no-create-info --single-transaction mydb > data.sql
   # or use AWS DMS for live migration
   ```
5. Load data into DSQL (use `COPY` where supported, or INSERT batches).
6. Validate row counts and spot-check query results.

## DynamoDB

### Access Pattern First

Model queries before the table schema. DynamoDB is fast when queries hit the partition key. Every other access pattern needs a GSI (Global Secondary Index) or an application-side scan (expensive).

Collect access patterns before designing:
- What are the primary read queries? By what key?
- What are the primary write operations?
- Do any queries need sorting (sort key)?
- Are there secondary access patterns that need their own GSI?

```bash
aws dynamodb describe-table --table-name my-table --profile my-dev
aws dynamodb list-tables --profile my-dev
```

### Common Operations

```bash
# Point-in-time recovery status
aws dynamodb describe-continuous-backups \
  --table-name my-table \
  --profile my-dev

# Get item
aws dynamodb get-item \
  --table-name my-table \
  --key '{"pk":{"S":"user#123"},"sk":{"S":"profile"}}' \
  --profile my-dev

# Query (uses partition key)
aws dynamodb query \
  --table-name my-table \
  --key-condition-expression "pk = :pk" \
  --expression-attribute-values '{":pk":{"S":"user#123"}}' \
  --profile my-dev
```

### Capacity Modes

- **On-demand**: pay per request. Best for unpredictable or spiky traffic. No capacity planning.
- **Provisioned**: set RCU/WCU. Use with auto-scaling for steady-state workloads. Cheaper at high sustained throughput.

```bash
aws dynamodb update-table \
  --table-name my-table \
  --billing-mode PAY_PER_REQUEST \
  --profile my-dev
```

### DynamoDB Streams and Triggers

Streams emit a change log of item modifications. Attach Lambda to process changes:

```bash
aws dynamodb describe-table \
  --table-name my-table \
  --query 'Table.StreamSpecification' \
  --profile my-dev

aws lambda list-event-source-mappings \
  --function-name my-function \
  --profile my-dev
```

## ElastiCache (Redis / Valkey)

Valkey is the open-source successor to Redis. Prefer Valkey for new clusters.

```bash
aws elasticache describe-cache-clusters --profile my-dev
aws elasticache describe-replication-groups --profile my-dev
```

### Connection Limits

Redis/Valkey has a default `maxclients` of 65000 but the effective client limit depends on instance class. Lambda functions do not maintain persistent connections by default; initialize the client at module level to reuse connections across warm invocations:

```python
import redis
# Module-level: initialized once per Lambda execution environment
client = redis.Redis.from_url(os.environ["REDIS_URL"])

def handler(event, context):
    client.set("key", "value")
```

### Cluster Mode

Cluster mode shards data across multiple nodes. Not compatible with all client commands (cross-slot multi-key operations fail). Confirm the application supports cluster mode before enabling it.

### Security

ElastiCache should always be in a private subnet. Use:
- Auth tokens (Redis AUTH) for in-transit auth.
- Encryption in-transit and at-rest.
- Security groups that allow only app subnets.

```bash
aws elasticache describe-cache-clusters \
  --cache-cluster-id my-cluster \
  --show-cache-node-info \
  --query 'CacheClusters[0].{Engine:Engine,Class:CacheNodeType,NumNodes:NumCacheNodes,EncryptionAtRest:AtRestEncryptionEnabled,EncryptionInTransit:TransitEncryptionEnabled}' \
  --profile my-dev
```

## Secrets and Credentials

Never pass database credentials as plaintext environment variables. Use:

```bash
# Store in Secrets Manager
aws secretsmanager create-secret \
  --name prod/myapp/db \
  --secret-string '{"username":"app","password":"<generate>","host":"my-db.xyz.rds.amazonaws.com","port":5432,"dbname":"app"}' \
  --profile my-dev

# Retrieve in application
aws secretsmanager get-secret-value \
  --secret-id prod/myapp/db \
  --query SecretString \
  --output text \
  --profile my-dev
```

For Lambda, reference the secret by ARN in the task definition or function configuration. For Aurora DSQL, use IAM token auth instead of static secrets.

## Approval Gates

Request explicit approval before:
- Taking or deleting manual snapshots in production.
- Modifying DB instance class, storage type, or enabling/disabling Multi-AZ.
- Running `DROP TABLE`, `TRUNCATE`, or schema migrations that are not backward-compatible.
- Deleting a DynamoDB table (always destructive; no soft-delete).
- Changing ElastiCache node type or cluster topology.
- Enabling or disabling DynamoDB Streams.
- Creating or promoting Aurora Global Database secondary regions.
