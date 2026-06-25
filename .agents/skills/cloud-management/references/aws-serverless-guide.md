# AWS Serverless Guide

Use this when the task involves Lambda functions, API Gateway, Step Functions, EventBridge, SAM, or CDK serverless constructs. For ECS-based container workloads, use the main aws-cli-playbook instead.

## When Serverless Is the Right Choice

Choose serverless when:
- Event-driven execution: S3 events, SQS messages, EventBridge rules, API calls, scheduled runs, stream consumers.
- Spiky or low-sustained traffic where Lambda's per-invocation pricing beats always-on containers.
- Short task duration (Lambda max 15 minutes; typical API handlers under 5 seconds).
- Operational simplicity matters more than runtime portability.

Prefer containers (ECS Fargate or Container Apps/Cloud Run) when:
- The function needs persistent connections, longer durations, or websocket streams.
- Cold-start latency is customer-visible and provisioned concurrency cost is not justified.
- The workload is a long-running worker consuming a queue at sustained throughput.
- The team needs consistent local dev parity (Docker matches prod more closely than `sam local`).

## IaC Tools

| Tool | Use When |
|---|---|
| SAM (`template.yaml`) | Lambda-first projects; simpler YAML than raw CloudFormation; `sam local` is the best local invoke story |
| CDK (`NodejsFunction`, `PythonFunction`) | When the team already owns CDK; better for complex dependency graphs and shared constructs |
| Terraform `aws_lambda_function` | When infra is already Terraform and adding Lambda is incremental |
| Raw CloudFormation | Avoid unless the project has no SAM/CDK path; use SAM instead |

Always extend the IaC system already in the repo.

## Lambda Fundamentals

### Deployment Package

```bash
# SAM deploy
sam build
sam deploy --guided        # first time, creates samconfig.toml
sam deploy                 # subsequent deploys

# CDK deploy
cdk synth
cdk deploy --require-approval never
```

### Function Configuration Defaults

- Memory: start at 512 MB. Right-size from CloudWatch Lambda Insights or `aws lambda get-function-configuration`.
- Timeout: set conservatively. An API Gateway Lambda should be under 29 seconds (API GW hard limit). Background processors under 15 minutes.
- Concurrency: set reserved concurrency on critical functions to prevent noisy-neighbor burst exhaustion.
- Environment variables: inject via Secrets Manager references or SSM Parameter Store, not plaintext values.

### IAM Role (Least Privilege)

Every Lambda must have an execution role. Grant only what the function calls:

```bash
aws iam get-role --role-name my-function-role --profile my-dev
aws iam list-role-policies --role-name my-function-role --profile my-dev
aws iam simulate-principal-policy \
  --policy-source-arn arn:aws:iam::<account>:role/my-function-role \
  --action-names dynamodb:PutItem \
  --profile my-dev
```

Do not use `AdministratorAccess` or `AWSLambdaFullAccess` on Lambda roles in production.

## API Gateway

### HTTP API vs REST API

| Feature | HTTP API | REST API |
|---|---|---|
| Cost | ~70% cheaper | Higher |
| Latency | Lower | Higher |
| Lambda authorizers | Supported | Supported |
| Usage plans / throttling | Not supported | Supported |
| Request/response transformation | Not supported | Supported via Mapping Templates |
| WebSocket | Not supported | Not supported (use separate WebSocket API) |
| OIDC/JWT auth | Native, no Lambda needed | Requires custom Lambda authorizer |

**Default: HTTP API** unless you need usage plans, throttling per-stage, or Mapping Templates.

### Common CLI Operations

```bash
# List APIs
aws apigatewayv2 get-apis --profile my-dev                         # HTTP + WebSocket
aws apigateway get-rest-apis --profile my-dev                      # REST

# Describe a stage and its throttle settings
aws apigateway get-stage \
  --rest-api-id <id> --stage-name prod --profile my-dev

# Check Lambda integration
aws apigatewayv2 get-integrations --api-id <id> --profile my-dev
```

### CORS

CORS on API Gateway is separate from CORS headers your Lambda returns. Set it at the API level:

```bash
aws apigatewayv2 update-api \
  --api-id <id> \
  --cors-configuration AllowOrigins='["https://app.example.com"]',AllowMethods='["GET","POST","OPTIONS"]',AllowHeaders='["Content-Type","Authorization"]' \
  --profile my-dev
```

### Custom Domains

```bash
aws apigatewayv2 get-domain-names --profile my-dev
aws apigateway get-domain-names --profile my-dev
```

Custom domains require an ACM certificate in `us-east-1` for edge-optimized APIs; same region as the API for regional.

### Lambda Authorizers

Use for JWT validation, API key logic, or request transformation before the function runs. For JWT-only auth on HTTP APIs, use the native JWT authorizer instead (zero Lambda cold start):

```yaml
# SAM template snippet
Auth:
  Authorizers:
    MyJwtAuthorizer:
      JwtConfiguration:
        issuer: https://cognito-idp.us-east-1.amazonaws.com/<pool-id>
        audience:
          - <client-id>
      IdentitySource: $request.header.Authorization
```

### Troubleshooting 4xx / 5xx

```bash
aws logs tail /aws/apigateway/<api-id>/<stage> --follow --profile my-dev
aws logs tail /aws/lambda/<function-name> --follow --profile my-dev
```

Common causes:
- `403 Missing Authentication Token`: path mismatch (trailing slash, wrong method).
- `502 Bad Gateway`: Lambda returned a malformed response object (must have `statusCode`, `body`).
- `504 Gateway Timeout`: Lambda exceeded 29-second API GW hard timeout; optimize or use async pattern.
- CORS error in browser: CORS is set on Lambda response headers but not on the API GW level for OPTIONS preflight.

## WebSocket APIs

Use API Gateway WebSocket APIs for real-time bidirectional communication:

```bash
aws apigatewayv2 get-apis \
  --query "Items[?ProtocolType=='WEBSOCKET']" \
  --profile my-dev
```

Route keys: `$connect`, `$disconnect`, `$default`, plus custom routes. Each connects to a Lambda. Store `connectionId` in DynamoDB. Push to clients with the management endpoint:

```bash
aws apigatewaymanagementapi post-to-connection \
  --endpoint-url https://<api-id>.execute-api.<region>.amazonaws.com/<stage> \
  --connection-id <id> \
  --data '{"message":"hello"}' \
  --profile my-dev
```

## Step Functions

Use Step Functions for multi-step workflows needing visibility, retries, error handling, or human approval steps.

### Express vs Standard Workflows

| | Standard | Express |
|---|---|---|
| Execution duration | Up to 1 year | Up to 5 minutes |
| Execution history | CloudWatch + SF console | CloudWatch only |
| Idempotency | At-least-once | At-least-once |
| Cost | Per state transition | Per invocation + duration |
| Use for | Long-lived business flows, audit trails | High-volume event processing, IoT |

### Common Patterns

**Saga pattern** (distributed transaction rollback):
- Each step has a compensating transaction defined in `Catch`.
- On failure, execute compensating steps in reverse order.
- Never use Step Functions Saga when the workflow is synchronous and caller-facing — latency is too high.

**Wait for callback** (task token pattern):
- Pass `taskToken` to an external system (SQS, SNS, HTTP endpoint).
- External system calls `SendTaskSuccess` or `SendTaskFailure`.
- Useful for human approval steps or long-running external jobs.

**Parallel and Map states**:
- Use `Map` to fan out over arrays with concurrency control (`MaxConcurrency`).
- Use `Parallel` for independent branches that must all succeed before continuing.

```bash
# Start execution
aws stepfunctions start-execution \
  --state-machine-arn arn:aws:states:<region>:<account>:stateMachine:<name> \
  --input '{"key":"value"}' \
  --profile my-dev

# Check execution status
aws stepfunctions describe-execution \
  --execution-arn <arn> \
  --profile my-dev

# Get execution history (first 25 events)
aws stepfunctions get-execution-history \
  --execution-arn <arn> \
  --max-results 25 \
  --profile my-dev
```

## EventBridge

EventBridge decouples event producers from consumers. Use for:
- Scheduled tasks (prefer EventBridge Scheduler over cron-in-Lambda for reliability and timezone support).
- Cross-service events (S3 → Lambda, CodePipeline → Lambda notifications).
- Custom application events (publish domain events; multiple Lambda consumers subscribe independently).

```bash
# List event buses
aws events list-event-buses --profile my-dev

# List rules on the default bus
aws events list-rules --event-bus-name default --profile my-dev

# Publish a test event
aws events put-events \
  --entries '[{"Source":"myapp","DetailType":"OrderPlaced","Detail":"{\"orderId\":\"123\"}","EventBusName":"default"}]' \
  --profile my-dev
```

EventBridge Scheduler for reliable cron:

```bash
aws scheduler list-schedules --profile my-dev
aws scheduler get-schedule --name my-job --profile my-dev
```

## Local Development

```bash
# SAM local invoke (single invocation)
sam local invoke MyFunction --event events/event.json

# SAM local API Gateway emulation
sam local start-api --port 3000

# SAM local generate test event
sam local generate-event s3 put > events/s3-event.json
sam local generate-event apigateway aws-proxy > events/apigw-event.json
```

For Step Functions local testing, use `sam local` with the `--env-vars` flag or AWS Step Functions Local (Docker image):

```bash
docker run -p 8083:8083 amazon/aws-stepfunctions-local
```

## Connection Management: Lambda to Databases

Lambda reuses execution environments between invocations but does not hold a persistent connection the way a long-running server does. Mitigate connection exhaustion:

- **RDS Proxy**: Put an RDS Proxy in front of RDS or Aurora. The Proxy pools connections and handles IAM auth. Required for Lambda + RDS at scale.
- **DynamoDB**: Connection is HTTP/HTTPS with no persistent TCP. No connection pool needed.
- **ElastiCache**: Use a Valkey/Redis client with a module-level connection initialized outside the handler. Reuses the connection across warm invocations.

```bash
# Check RDS Proxy status
aws rds describe-db-proxies --profile my-dev
aws rds describe-db-proxy-endpoints --db-proxy-name my-proxy --profile my-dev
```

## Observability

```bash
# CloudWatch Logs Insights for Lambda errors
aws logs start-query \
  --log-group-name /aws/lambda/my-function \
  --start-time $(date -d '-1 hour' +%s) \
  --end-time $(date +%s) \
  --query-string 'fields @timestamp, @message | filter @message like /ERROR/ | sort @timestamp desc | limit 50' \
  --profile my-dev

# X-Ray traces
aws xray get-trace-summaries \
  --time-range-type LastNMinutes \
  --time-value 30 \
  --profile my-dev
```

Lambda Insights (enhanced metrics: memory, init duration, cold starts):

```bash
aws lambda get-function-configuration \
  --function-name my-function \
  --query 'Layers[*].Arn' \
  --profile my-dev
```

The Lambda Insights layer ARN follows the pattern `arn:aws:lambda:<region>:580247275435:layer:LambdaInsightsExtension:*`.

## Deployment Checklist Before Production

- Reserved concurrency set on critical functions (prevents account-level burst exhaustion).
- Dead-letter queue (DLQ) or on-failure destination configured for async invocations.
- RDS Proxy in front of any RDS/Aurora database.
- Environment variables reference Secrets Manager ARNs, not plaintext credentials.
- X-Ray active tracing enabled.
- CloudWatch alarms on error rate and throttle rate.
- API Gateway throttle limits set per stage and per route.
- SAM/CDK stack name and region confirmed before `sam deploy` or `cdk deploy`.
