# Provider Selection

## Contents

- What to collect first
- Decision framework
- Multi-cloud rule set
- Workload mapping
- Service topology cues
- Managed-service bias
- Existing estate versus greenfield
- Multi-runtime backend example

## What to Collect First

- repo shape: static site, API, monolith, worker fleet, websocket or realtime service, scheduled jobs, or k8s-heavy app
- current ownership: Terraform, Bicep, CloudFormation, Pulumi, Helm, raw manifests, or ad hoc shell
- current providers already in use for runtime, database, cache, storage, secrets, DNS, CDN, email, and observability
- environment expectations: dev only, staging plus prod, HA, compliance, latency, residency, or private networking
- team reality: operator familiarity, CI system, identity model, and change cadence
- cost posture: cost-sensitive dev default or production-grade availability

## Decision Framework

Score providers by concern instead of picking one winner globally:

1. Existing footprint
   - Is the concern already owned cleanly by one provider?
2. Workload fit
   - Does the repo want managed containers, serverless, Kubernetes, or VMs?
3. Operational simplicity
   - Which option minimizes bespoke networking, secrets drift, and deployment friction?
4. Latency and data gravity
   - Can runtime stay close to its database and cache?
5. Security and identity
   - Can CI and runtime use short-lived or federated identity cleanly?
6. Cost
   - Which option avoids always-on clusters, needless NAT, or premium services for the target environment?

Prefer the provider already operating that concern unless the improvement from moving is clear and material.

## Multi-Cloud Rule Set

- Do not assume one provider for everything.
- Model runtime, data, storage, DNS, secrets, and observability independently when the estate is mixed.
- Keep stateful services close to the runtime unless the user explicitly wants split-cloud data paths.
- Keep one system of record for DNS per environment.
- Keep one system of record for secrets per environment.
- Keep one explicit CI identity flow per provider and environment.
- Reuse the provider already operating a concern when the switching cost is higher than the improvement.
- Avoid partial migrations that leave DNS, data, or credentials stranded across providers without an explicit operating model.

## Default Service Mapping by Workload

| Workload | AWS default | Azure default | GCP default |
| --- | --- | --- | --- |
| Static site or SPA | S3 + CloudFront | Static Web Apps or Storage + Front Door | Cloud Storage + Cloud CDN |
| Containerized web API | ECS Fargate + ALB | Container Apps | Cloud Run |
| Web plus worker plus websocket | ECS services split by role | Container Apps split by role | Cloud Run services or GKE if long-running workers need more control |
| Event-driven jobs | Lambda or ECS tasks + EventBridge + SQS | Functions or Container Apps Jobs + Event Grid or Service Bus | Cloud Run Jobs or Functions + Pub/Sub + Cloud Scheduler |
| Stateful relational DB | RDS PostgreSQL or MySQL | Azure Database for PostgreSQL or MySQL | Cloud SQL |
| Cache or broker | ElastiCache | Azure Cache for Redis | Memorystore |
| Registry | ECR | ACR | Artifact Registry |
| Secrets | Secrets Manager or Parameter Store | Key Vault | Secret Manager |
| K8s-heavy repo | EKS | AKS | GKE |

## Service Topology Cues

- public web traffic and internal workers usually deserve separate runtimes
- websocket or realtime traffic often wants its own service, timeout policy, and scaling rules
- schedulers and admin-only surfaces should be isolated from user-facing ingress
- if the repo already runs several long-lived responsibilities inside one image, keep the runtime split explicit even when the build artifact is shared
- if migrations run during steady-state startup, treat every rollout as higher-risk and prefer moving to a one-off migration job when the repo permits it

## Managed-Service Bias

- Prefer managed containers over VMs for modern apps unless the repo depends on VM-specific behavior.
- Prefer provider-native schedulers and queues over cron inside a long-running app container.
- Prefer one registry plus rolling or revision-based service updates over SSH-based deploys.
- Prefer dev-sized single-zone or single-region defaults until the user asks for production-ready HA.
- Prefer Kubernetes only when the repo already needs ingress controllers, custom networking, node tuning, sidecars, daemon workloads, or service mesh patterns.

## Concern-by-Concern Guidance

### Runtime

- API or web service: ECS Fargate, Container Apps, or Cloud Run
- background workers: separate service or job, not a second command stuffed into the web process
- websocket or realtime: separate service with the right ingress behavior
- static frontend: object storage plus CDN or provider-native static hosting

### Data

- relational first: managed PostgreSQL or MySQL
- cache or broker: managed Redis or provider-native async services
- object files: provider-native object storage

### Identity and Secrets

- CI: OIDC, federated credentials, or workload identity
- runtime: task role, managed identity, or service account
- secrets: provider-native secret store over repo or pipeline secrets where possible

### Network and Edge

- Keep public ingress explicit.
- Prefer private access from runtime to database and cache.
- Keep DNS ownership centralized per environment.

## Existing Estate vs Greenfield

- Greenfield: choose the simplest cohesive provider-native path and keep the stack boring.
- Existing estate: extend the current account, subscription, or project footprint unless there is a clear reason to split or migrate.
- Migration: do not split data, secrets, DNS, or identity across providers without a deliberate steady-state design.

## Multi-Runtime Backend Example

For a Django or API backend with worker queues, websocket traffic, Redis, PostgreSQL, file storage, and scheduled jobs:

- split runtime roles into `web`, `worker`, and `socket` or `realtime`
- use managed PostgreSQL, managed Redis, object storage, registry, and a secrets system
- keep migrations separate from steady-state rollout
- default mappings:
  - AWS: ECS Fargate + RDS + ElastiCache + S3 + ECR + Secrets Manager + EventBridge
  - Azure: Container Apps + PostgreSQL Flexible Server + Azure Cache for Redis + Blob Storage + ACR + Key Vault + Event Grid or Service Bus
  - GCP: Cloud Run + Cloud SQL + Memorystore + Cloud Storage + Artifact Registry + Secret Manager + Pub/Sub or Cloud Scheduler

## Read Before Changing

- approval rules and cost hotspots: [approval-policy.md](./approval-policy.md)
- automatic deploy design: [cicd-and-auto-deploy.md](./cicd-and-auto-deploy.md)
- inventory and incident loops: [inventory-optimization-remediation.md](./inventory-optimization-remediation.md)
