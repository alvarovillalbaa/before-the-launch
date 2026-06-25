# AWS CLI Playbook

## Contents

- Scope and identity
- Command habits
- Discovery and inventory
- Deploy and provision
- Serverless operations
- Amplify operations
- Automatic deployments
- Troubleshooting
- Optimization
- Multi-runtime backend mapping

## Scope and Identity

Use profiles and regions explicitly. Verify scope before writes:

```bash
aws configure sso
aws sso login --profile my-dev
aws sts get-caller-identity --profile my-dev
aws configure list --profile my-dev
```

Prefer IAM Identity Center or other short-lived credentials over long-lived user keys. Use `AWS_PROFILE` or `--profile` deliberately in multi-account work.

## Command Habits

- Read first with `list-*`, `describe-*`, or `get-*`.
- Use `--profile`, `--region`, `--query`, and `--output table|json`.
- Inspect help with `aws help`, `aws <service> help`, or `aws <service> <command> help`.
- Prefer waiters over `sleep`.
- Use pagination controls such as `--page-size` or `--max-items` when large list calls are slow or noisy.
- Use `--generate-cli-skeleton` plus `--cli-input-json` for complex write operations when precision matters.
- Prefer CLI-driven IaC for repeatable infrastructure: `aws cloudformation deploy` or the repo's Terraform or Pulumi path.

## Discovery and Inventory

### Core Inventory

```bash
aws ec2 describe-instances --profile my-dev
aws ecs list-clusters --profile my-dev
aws ecs list-services --cluster app --profile my-dev
aws rds describe-db-instances --profile my-dev
aws elasticache describe-cache-clusters --profile my-dev
aws ecr describe-repositories --profile my-dev
aws s3 ls --profile my-dev
aws cloudformation list-stacks --profile my-dev
aws logs describe-log-groups --profile my-dev
```

### Output Shaping

```bash
aws ec2 describe-instances \
  --filters "Name=instance-state-name,Values=running" \
  --query "Reservations[].Instances[].{Id:InstanceId,Type:InstanceType,AZ:Placement.AvailabilityZone}" \
  --output table \
  --profile my-dev
```

### Cost and Governance

```bash
aws ce get-cost-and-usage \
  --time-period Start=2026-03-01,End=2026-03-31 \
  --granularity MONTHLY \
  --metrics UnblendedCost \
  --profile my-dev
aws iam list-roles --profile my-dev
aws organizations list-accounts --profile my-dev
```

## Deploy and Provision

### Default Managed Mapping

- registry: ECR
- runtime: ECS Fargate
- ingress: ALB
- data: RDS
- cache or broker: ElastiCache
- storage: S3
- secrets: Secrets Manager or Parameter Store

### Container Runtime Rollout

```bash
aws ecr get-login-password --region eu-west-1 --profile my-dev | \
  docker login --username AWS --password-stdin <account>.dkr.ecr.eu-west-1.amazonaws.com
docker build -t my-app:sha-123 .
docker tag my-app:sha-123 <account>.dkr.ecr.eu-west-1.amazonaws.com/my-app:sha-123
docker push <account>.dkr.ecr.eu-west-1.amazonaws.com/my-app:sha-123
aws ecs update-service \
  --cluster app \
  --service web \
  --force-new-deployment \
  --profile my-dev
aws ecs describe-services --cluster app --service web --profile my-dev
```

Prefer immutable tags or image digests for rollouts when the repo allows it. If the repo still deploys mutable `latest` tags, record the commit SHA and rollout command so rollback stays concrete.

### Static Sites

```bash
aws s3 sync ./dist s3://my-site-bucket --delete --profile my-dev
aws cloudfront create-invalidation \
  --distribution-id DIST_ID \
  --paths '/*' \
  --profile my-dev
```

### Declarative Infrastructure

```bash
aws cloudformation deploy \
  --template-file infra.yaml \
  --stack-name my-stack \
  --capabilities CAPABILITY_NAMED_IAM \
  --profile my-dev
aws cloudformation describe-stack-events --stack-name my-stack --profile my-dev
```

### Data and Secret Setup

- RDS before app rollout if the service is stateful
- ElastiCache before workers if queues or cache are required
- Secrets Manager or Parameter Store before task definition updates
- Route53 and ACM only behind approval when public ingress changes

## Serverless Operations

For full serverless workflows, load [aws-serverless-guide.md](./aws-serverless-guide.md). Quick-reference CLI commands:

```bash
# Lambda: list and inspect
aws lambda list-functions --profile my-dev
aws lambda get-function-configuration --function-name my-function --profile my-dev
aws lambda get-function --function-name my-function --profile my-dev

# Lambda: deploy a new code package
aws lambda update-function-code \
  --function-name my-function \
  --image-uri <account>.dkr.ecr.<region>.amazonaws.com/my-function:sha-123 \
  --profile my-dev
aws lambda wait function-updated --function-name my-function --profile my-dev

# Lambda: tail logs
aws logs tail /aws/lambda/my-function --follow --profile my-dev

# API Gateway v2 (HTTP / WebSocket)
aws apigatewayv2 get-apis --profile my-dev
aws apigatewayv2 get-routes --api-id <id> --profile my-dev
aws apigatewayv2 get-integrations --api-id <id> --profile my-dev

# Step Functions
aws stepfunctions list-state-machines --profile my-dev
aws stepfunctions start-execution \
  --state-machine-arn arn:aws:states:<region>:<account>:stateMachine:<name> \
  --input '{}' \
  --profile my-dev
aws stepfunctions describe-execution --execution-arn <arn> --profile my-dev

# EventBridge Scheduler
aws scheduler list-schedules --profile my-dev
aws scheduler get-schedule --name my-job --profile my-dev

# SAM
sam build
sam deploy --guided
sam local invoke MyFunction --event events/event.json
```

## Amplify Operations

For full Amplify workflows, load [aws-amplify-guide.md](./aws-amplify-guide.md). Quick-reference commands:

```bash
# Status and environment
amplify status
amplify env list
amplify env get --name dev

# Inspect underlying CloudFormation stacks
aws cloudformation list-stacks --profile my-dev \
  --query "StackSummaries[?starts_with(StackName, 'amplify-')].[StackName,StackStatus]" \
  --output table

# Deploy backend changes
amplify push --yes

# Deploy backend + publish frontend via Amplify Hosting
amplify publish

# Gen 2 sandbox (ephemeral personal environment)
npx ampx sandbox
npx ampx sandbox delete

# Amplify Hosting: list apps and branches
aws amplify list-apps --profile my-dev
aws amplify list-branches --app-id <app-id> --profile my-dev
aws amplify get-branch --app-id <app-id> --branch-name main --profile my-dev
```

## Automatic Deployments

Preferred pattern:

- CI uses OIDC to assume an IAM role
- CI builds and pushes to ECR
- CI deploys via `aws cloudformation deploy`, `aws ecs update-service`, or `aws lambda update-function-code`
- CI verifies rollout via ECS, CloudFormation, ALB, and CloudWatch surfaces

Useful command surfaces:

- `aws sts get-caller-identity`
- `aws iam get-role`
- `aws ecr describe-repositories`
- `aws ecs register-task-definition`
- `aws ecs update-service`
- `aws lambda update-function-code`
- `buildspec.yml` when AWS CodeBuild drives multi-image builds or deploy steps

## Troubleshooting

### ECS and ALB

```bash
aws ecs describe-services --cluster app --service web --profile my-dev
aws ecs list-tasks --cluster app --service-name web --profile my-dev
aws ecs describe-tasks --cluster app --tasks <task-id> --profile my-dev
aws elbv2 describe-target-health --target-group-arn <tg-arn> --profile my-dev
aws logs tail /aws/ecs/my-app --follow --profile my-dev
```

### Infrastructure

```bash
aws cloudformation describe-stack-events --stack-name my-stack --profile my-dev
aws cloudformation detect-stack-drift --stack-name my-stack --profile my-dev
```

### Data and Identity

```bash
aws rds describe-db-instances --db-instance-identifier my-db --profile my-dev
aws secretsmanager list-secrets --profile my-dev
aws iam simulate-principal-policy --policy-source-arn <role-arn> --action-names ecs:UpdateService --profile my-dev
```

Common failure classes:

- wrong profile or region
- task definition references a missing image tag or secret
- ECS tasks cannot reach RDS, Redis, or ALB targets
- CloudFormation stack is blocked by IAM or immutable-resource constraints
- ALB idle timeout or target-group wiring breaks websocket or long-poll traffic

## Optimization

- right-size ECS task CPU and memory from CloudWatch metrics
- remove idle ALBs, NAT gateways, or Elastic IPs
- review RDS class, storage, backup retention, and multi-AZ need
- review ElastiCache node size and always-on non-prod caches
- add S3 lifecycle and reduce unnecessary retention
- use VPC endpoints when egress or NAT cost is the problem

## Multi-Runtime Backend Mapping

### Managed Container Path (default for most backends)

- `web`: ECS Fargate service behind ALB
- `worker`: ECS Fargate service without public ingress
- `socket`: ECS Fargate service with websocket-friendly ingress
- `db`: RDS PostgreSQL or Aurora Cluster
- `cache`: ElastiCache Redis or Valkey
- `files`: S3
- `secrets`: Secrets Manager
- `scheduler`: EventBridge Scheduler
- `admin`: keep Flower, dashboards, or internal control-plane surfaces private unless the user explicitly wants public access

### Serverless Path (event-driven or low-ops APIs)

- `api`: API Gateway HTTP API + Lambda
- `websocket`: API Gateway WebSocket API + Lambda + DynamoDB (connection store)
- `worker`: SQS + Lambda (event source mapping)
- `workflow`: Step Functions
- `scheduler`: EventBridge Scheduler → Lambda
- `db`: DynamoDB (key-value / document) or RDS via RDS Proxy (relational)
- `distributed-db`: Aurora DSQL (serverless distributed SQL, multi-region)
- `files`: S3
- `secrets`: Secrets Manager (referenced by ARN in Lambda env, not plaintext)

### Amplify Full-Stack Path (frontend-first teams)

- `auth`: Amplify Auth → Cognito User Pool
- `api`: Amplify Data → AppSync + DynamoDB
- `files`: Amplify Storage → S3
- `functions`: Amplify Function → Lambda
- `hosting`: Amplify Hosting (CI/CD + CDN)
