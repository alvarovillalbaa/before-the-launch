# Cloud Architecture Patterns

Use this reference when the task is to design a target architecture before provisioning. It consolidates the AWS, Azure, and GCP architecture workflows into one cloud-management operating model.

## Requirements Intake

Collect the same inputs before recommending services:

- application type: static site, web app, mobile backend, SaaS, microservices, data pipeline, ML platform, internal tool
- expected scale: users, requests per second, event volume, data volume, latency target
- budget: monthly ceiling, dev versus production sizing, willingness to buy commitments
- team context: size, provider experience, current CI/CD maturity, on-call ownership
- compliance: GDPR, HIPAA, SOC 2, ISO 27001, data residency, audit evidence
- availability: SLA, RPO, RTO, multi-region need, maintenance window tolerance
- existing estate: accounts, subscriptions, projects, IaC, DNS, registries, secrets, observability

Do not skip the intake because serverless and managed platforms make the first deploy easy. The wrong data, identity, or traffic model is expensive to unwind later.

## Pattern Matrix

| Pattern | AWS | Azure | GCP | Use When |
| --- | --- | --- | --- | --- |
| Serverless web/API | S3, CloudFront, API Gateway, Lambda, DynamoDB, Cognito | Static Web Apps or Front Door, Functions, Cosmos DB, Key Vault, Entra ID | Cloud Storage, Cloud CDN, Cloud Run, Firestore, Identity Platform | MVPs, mobile backends, low-ops APIs, spiky traffic |
| Managed containers | ECS Fargate, ALB, RDS, ElastiCache, ECR, Secrets Manager | Container Apps, PostgreSQL Flexible Server, Azure Cache for Redis, ACR, Key Vault | Cloud Run, Cloud SQL, Memorystore, Artifact Registry, Secret Manager | Containerized APIs, web plus workers, SaaS backends, moderate scale |
| Kubernetes microservices | EKS, ALB Controller, RDS, ElastiCache, ECR | AKS, Application Gateway or API Management, Cosmos DB or PostgreSQL, Service Bus | GKE Autopilot, Cloud SQL, Memorystore, Pub/Sub | Service mesh, custom networking, platform teams, sidecars, node-level requirements |
| Event-driven processing | EventBridge, SQS, Lambda, Step Functions, DynamoDB | Event Grid, Service Bus, Functions, Container Apps Jobs, Cosmos DB | Pub/Sub, Cloud Run Jobs, Cloud Functions, Workflows, Firestore | Async jobs, order workflows, scheduled tasks, bursty processing |
| Data pipeline | Kinesis, Glue, S3, Athena, Redshift | Event Hubs, Data Factory, Data Lake Storage, Synapse, Power BI | Pub/Sub, Dataflow, Cloud Storage, BigQuery, Looker | Analytics, ETL, event ingestion, warehouses, data lakes |
| ML platform | SageMaker, S3, ECR, Lambda, CloudWatch | Azure AI Foundry, Machine Learning, Blob Storage, Container Apps, Monitor | Vertex AI, Cloud Storage, BigQuery, Cloud Functions, Cloud Monitoring | Model training, hosted inference, feature pipelines |

## Selection Rules

- Start with the simplest managed pattern that satisfies the workload and the team's operating maturity.
- Prefer managed containers over Kubernetes unless the repo already has Kubernetes primitives or needs sidecars, custom ingress, daemon workloads, service mesh, or node tuning.
- Prefer serverless only when function limits, cold starts, event semantics, and provider lock-in are acceptable.
- Keep relational workloads on managed relational databases unless the access model is explicitly document, key-value, or analytics-oriented.
- Split runtime roles: public web, worker, scheduler, realtime, and admin surfaces should be independently deployable unless the repo has a deliberate monolith runtime model.
- Keep stateful resources close to runtime unless the user explicitly asks for a split-cloud or migration design.
- Treat public ingress, DNS, identity, and data-plane changes as approval-worthy design decisions.

## IaC Bias

- AWS: reuse Terraform, CDK, CloudFormation, or SAM already present in the repo.
- Azure: prefer Bicep for Azure-native projects and Terraform for mixed-cloud or team-standard modules.
- GCP: prefer Terraform for durable infrastructure, `gcloud` scripts for narrow operations, and Cloud Build or Cloud Deploy for release automation.
- Multi-cloud: do not introduce two IaC systems for the same concern. Extend the current state manager or explicitly document the migration boundary.

## Validation Checkpoint

Before generating IaC or running a write command, confirm:

- the pattern matches the workload and team maturity
- monthly and one-time costs fit the stated budget
- compliance and residency constraints map to concrete provider controls
- rollback exists for runtime and traffic changes
- stateful changes have backup, restore, and migration posture
- CI identity uses OIDC, workload identity, managed identity, or short-lived credentials

Use `scripts/architecture_designer.py` to generate a first-pass recommendation, then validate it manually against these checkpoints.

## Anti-Patterns

| Anti-Pattern | Why It Fails | Better Approach |
| --- | --- | --- |
| Kubernetes for a small API with no platform team | Burns cost and operational attention | ECS Fargate, Container Apps, or Cloud Run |
| One container process for web, workers, schedulers, and realtime | Rollouts, health checks, and scaling become coupled | Split services by runtime responsibility |
| Public database, cache, or storage endpoints | Expands attack surface and complicates compliance | Private networking, managed identity, and explicit ingress |
| Secrets in app settings, CI variables, or source files | Weak rotation and broad visibility | Secrets Manager, Key Vault, or Secret Manager |
| Mutable `latest` image deploys | Rollback and audit trails are ambiguous | Immutable tags or image digests |
| No tagging or labels | Cost and ownership are opaque | Standard tags: environment, app, owner, cost-center, managed-by |
| BigQuery or warehouse on-demand for heavy predictable use | Unbounded query spend | Capacity reservations or query controls |
| AWS NAT Gateway, Azure NAT Gateway, or Cloud NAT in non-prod by default | Recurring egress cost surprises | Avoid until private egress requirement is explicit |
