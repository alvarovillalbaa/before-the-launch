# Service Selection Matrix

Use this reference when deciding between provider-native services. The goal is not feature parity; it is choosing the lowest-operational-risk service for the workload, budget, and team.

## Compute

| Need | AWS | Azure | GCP | Notes |
| --- | --- | --- | --- | --- |
| Static site | S3 + CloudFront | Static Web Apps or Storage + Front Door | Cloud Storage + Cloud CDN | Keep DNS and TLS ownership explicit. |
| Full-stack managed (frontend-first) | Amplify (Auth + Data + Storage + Hosting) | Static Web Apps + Functions | Firebase + Cloud Run | Use Amplify when the team wants a managed path and workload fits Auth/AppSync/DynamoDB/S3. |
| Function runtime | Lambda (SAM or CDK) | Functions (Durable for stateful) | Cloud Functions | Good for event handlers, short tasks, async jobs. Check timeout (29s API GW / 15m Lambda) and cold-start constraints. |
| Serverless API | API Gateway (HTTP API) + Lambda | Functions + API Management | Cloud Endpoints + Cloud Run | HTTP API is cheaper and faster; REST API adds usage plans and mapping templates. |
| Workflow orchestration | Step Functions | Durable Functions or Logic Apps | Cloud Workflows | Use for multi-step, retry-heavy, or human-approval workflows. |
| Managed containers | ECS Fargate | Container Apps | Cloud Run | Default for most containerized APIs and workers. |
| Kubernetes | EKS | AKS | GKE | Use for platform teams, service mesh, custom networking, or k8s-native repos. |
| VMs | EC2 | Virtual Machines or VMSS | Compute Engine or MIGs | Use only for legacy, host-level, or licensing constraints. |

## Database and Data

| Need | AWS | Azure | GCP | Notes |
| --- | --- | --- | --- | --- |
| PostgreSQL or MySQL | RDS or Aurora Cluster | Azure Database for PostgreSQL/MySQL | Cloud SQL | Default relational path. Confirm backups, HA, private access, and version. |
| Serverless relational (scale to low) | Aurora Serverless v2 | Azure SQL serverless | Cloud SQL edition choices | Serverless v2 does not pause to zero; verify min ACU and cold-start before using as a cost-saving measure. |
| Distributed serverless SQL (multi-region) | Aurora DSQL | Cosmos DB (PostgreSQL API) | AlloyDB Omni or Spanner | DSQL: PostgreSQL-compatible, active-active multi-region, IAM auth, no cluster sizing. Model for tenant isolation; no FK constraints across tenants. |
| Document or key-value | DynamoDB | Cosmos DB | Firestore | Model queries before schema. Good for predictable access patterns with high throughput. |
| Lambda-to-RDS connection pooling | RDS Proxy | — | Cloud SQL Auth Proxy | Required for Lambda + RDS/Aurora at scale; handles IAM auth token exchange and connection multiplexing. |
| Cache | ElastiCache (Valkey preferred) | Azure Cache for Redis | Memorystore | Keep private, size from metrics. Valkey is the open-source Redis successor. |
| Warehouse | Redshift or Athena | Synapse | BigQuery | Pricing model matters more than headline feature set. |
| Data lake | S3 | Data Lake Storage Gen2 | Cloud Storage | Add lifecycle, retention, encryption, and access boundaries early. |

## Messaging and Workflow

| Need | AWS | Azure | GCP | Notes |
| --- | --- | --- | --- | --- |
| Queue | SQS | Service Bus Queue | Pub/Sub | Decide ordering, retries, dedupe, and DLQ behavior explicitly. |
| Event bus | EventBridge | Event Grid | Eventarc or Pub/Sub | Good for loose coupling; document event schemas. |
| Workflow orchestration | Step Functions | Logic Apps or Durable Functions | Workflows | Use for business process visibility and retries. |
| Scheduler | EventBridge Scheduler | Container Apps Jobs or Functions Timer | Cloud Scheduler | Prefer provider schedulers over cron inside app containers. |

## Identity and Secrets

| Need | AWS | Azure | GCP | Notes |
| --- | --- | --- | --- | --- |
| CI federation | IAM OIDC role | Federated credential on Entra app or managed identity | Workload Identity Federation | Avoid static cloud keys in CI. |
| Runtime identity | IAM task or Lambda role | Managed identity | Service account | Grant least privilege to the runtime role, not the developer user. |
| Secrets | Secrets Manager or SSM Parameter Store | Key Vault | Secret Manager | Prefer secret references over copying values into environment variables. |
| Customer identity | Cognito | Entra External ID or Entra ID | Identity Platform | Validate tenant, callback, and consent model before implementation. |

## Network and Edge

| Need | AWS | Azure | GCP | Notes |
| --- | --- | --- | --- | --- |
| CDN | CloudFront | Front Door | Cloud CDN | Pair with WAF and certificate ownership when public. |
| Load balancing | ALB/NLB | Application Gateway, Front Door, Load Balancer | External HTTPS Load Balancer | Approval-worthy when changing public traffic. |
| Private service access | VPC endpoints, PrivateLink | Private Endpoints | Private Service Connect | Prefer for databases, storage, and secrets in production. |
| NAT egress | NAT Gateway | NAT Gateway | Cloud NAT | High recurring cost. Avoid in small non-prod unless required. |
| WAF | AWS WAF | WAF on Front Door/Application Gateway | Cloud Armor | Tune for false positives and logging before enforcement. |

## Observability and Governance

| Need | AWS | Azure | GCP | Notes |
| --- | --- | --- | --- | --- |
| Logs and metrics | CloudWatch | Azure Monitor + Log Analytics | Cloud Logging + Cloud Monitoring | Add dashboards and alert routing with the first production deploy. |
| Audit logs | CloudTrail | Activity Log + Entra audit logs | Cloud Audit Logs | Required for incident response and compliance evidence. |
| Policy guardrails | Organizations, SCPs, Config | Azure Policy, Management Groups | Organization Policy, Security Command Center | Treat org-scope policy changes as high-risk. |
| Cost management | Cost Explorer, Budgets | Cost Management, Advisor | Billing reports, Recommender | Always tag or label resources for owner and environment. |

## Cost Defaults

- Dev and staging should start single-region, low replica count, and no premium HA unless there is a realistic test requirement.
- Production can justify HA databases, WAF, private networking, and multi-zone runtime, but only after cost is shown.
- Commitment discounts should follow observed steady-state usage, not guesses during the first deployment.
- Storage lifecycle policies are usually safer first wins than resizing compute under load.
- Idle load balancers, NAT gateways, public IPs, oversized databases, and non-prod clusters are the first cost-review targets.
