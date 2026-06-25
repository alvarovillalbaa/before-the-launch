---
name: cloud-management
description: Cross-cloud CLI-first cloud operations for AWS, Azure, and GCP. Use when the assistant needs to identify which cloud provider or multi-cloud estate a repo uses, deploy new resources or services, wire automatic deployments, inventory and optimize infrastructure, or diagnose and repair cloud failures entirely from the terminal, with explicit approval gates for high-cost, destructive, identity-sensitive, or hard-to-reverse changes. Covers AWS Amplify full-stack projects, serverless workloads (Lambda, API Gateway, Step Functions, SAM, CDK), and the full AWS database portfolio (RDS, Aurora, Aurora DSQL, DynamoDB, ElastiCache), as well as deep Azure references for diagnostics, storage, compute, compliance, identity, Foundry, and cross-cloud migrations.
---

# Cloud Management

Operate AWS, Azure, and GCP from the terminal as the control plane. Use provider CLIs plus terminal-invoked tools such as `docker`, `terraform`, `pulumi`, `kubectl`, `helm`, and CI runners. Do not fall back to a portal unless the user explicitly asks for a console workflow.

In command examples below, `<skill-dir>` means the installed `cloud-management` skill directory and `<repo-root>` means the target repository root.

## Non-Negotiables

1. Start read-only. Inspect the repo, current provider scope, existing IaC, and deployed state before proposing writes.
2. Treat cloud as a set of concerns, not a single logo. Runtime, database, storage, DNS, secrets, and observability may live on different providers.
3. Use CLI-only execution. Prefer `aws`, `az`, and `gcloud`, plus CLI-driven IaC or deployment tools already present in the repo.
4. Reuse the existing state manager. Extend Terraform, Bicep, CloudFormation, Pulumi, Helm, or repo-owned deploy scripts instead of creating a parallel path.
5. Default to the simplest managed service that fits the workload. Favor managed containers, managed databases, and managed queues over VMs or Kubernetes unless the repo already needs lower-level control.
6. Default to cost-conscious dev sizing unless the user explicitly asks for production-ready HA, multi-region, or higher compliance posture.
7. Require explicit approval before high-cost, destructive, public-ingress, org-scope, identity-sensitive, or hard-to-reverse changes.
8. Prefer short-lived credentials, SSO, managed identity, workload identity, or OIDC federation over static keys.
9. When a command surface is uncertain, inspect `--help`, provider docs, or existing repo automation before guessing.
10. Finish the loop: apply, verify, capture outputs, and record rollback posture.
11. Treat startup migrations and multi-process runtime containers as inherited constraints, not fresh defaults. Prefer one-off migration jobs and one long-running responsibility per service unless the repo already depends on a combined entrypoint.

## Start Sequence

1. Run `python <skill-dir>/scripts/detect_repo_stack.py <repo-root>`.
2. Read [cli-operating-model.md](./references/cli-operating-model.md) for the shared operating discipline.
3. Load only the references needed for the task:
   - greenfield architecture design or migration target design: [cloud-architecture-patterns.md](./references/cloud-architecture-patterns.md)
   - provider service selection by compute, data, identity, network, observability, or cost concern: [service-selection-matrix.md](./references/service-selection-matrix.md)
   - mixed-cloud selection and workload mapping: [provider-selection.md](./references/provider-selection.md)
   - approval gates and cost risk: [approval-policy.md](./references/approval-policy.md)
   - CI/CD and automatic deployments: [cicd-and-auto-deploy.md](./references/cicd-and-auto-deploy.md)
   - inventory, optimization, and incident repair: [inventory-optimization-remediation.md](./references/inventory-optimization-remediation.md)
   - provider-specific command runbooks:
     - [aws-cli-playbook.md](./references/aws-cli-playbook.md)
     - [azure-cli-playbook.md](./references/azure-cli-playbook.md)
     - [gcp-cli-playbook.md](./references/gcp-cli-playbook.md)
   - AWS deep-dive references when the task is AWS-specific:
     - Amplify full-stack projects (auth, data, storage, functions, hosting): [aws-amplify-guide.md](./references/aws-amplify-guide.md)
     - serverless workloads (Lambda, API Gateway, Step Functions, EventBridge, SAM, CDK): [aws-serverless-guide.md](./references/aws-serverless-guide.md)
     - database selection, schema design, migrations, and connection management: [aws-databases-guide.md](./references/aws-databases-guide.md)
   - Azure deep-dive references when the task is Azure-specific:
     - diagnostics and incident loops: [azure-diagnostics-guide.md](./references/azure-diagnostics-guide.md)
     - architecture diagrams and relationship mapping: [azure-resource-visualization.md](./references/azure-resource-visualization.md)
     - cost and savings analysis: [azure-cost-optimization-guide.md](./references/azure-cost-optimization-guide.md)
     - storage design and data movement: [azure-storage-guide.md](./references/azure-storage-guide.md)
     - VM and VMSS sizing or troubleshooting: [azure-compute-guide.md](./references/azure-compute-guide.md)
     - in-place service, plan, or SKU changes: [azure-upgrade-guide.md](./references/azure-upgrade-guide.md)
     - compliance, azqr, and Key Vault expiration audits: [azure-compliance-guide.md](./references/azure-compliance-guide.md)
     - Entra ID app registration and OAuth wiring: [azure-entra-app-registration.md](./references/azure-entra-app-registration.md)
     - Foundry project, agent, quota, and deployment flows: [azure-foundry-guide.md](./references/azure-foundry-guide.md)
4. Verify provider scope before any write:
   - AWS: profile or role, account, region
   - Azure: cloud, tenant, subscription, resource group
   - GCP: configuration, account, project, enabled APIs
5. Use the repo scan output to identify likely primary clouds, runtime surfaces such as `web`, `worker`, `realtime`, and scheduler roles, and operational risks such as startup migrations or mutable image tags.
6. For any non-trivial mutation, run the guard script before presenting or executing the change:

```bash
python <skill-dir>/scripts/cloud_change_guard.py \
  --provider aws \
  --environment prod \
  --operation "create ecs service, alb, and rds postgres instance" \
  --resource-type database \
  --monthly-cost-usd 180 \
  --stateful \
  --public-ingress \
  --dns-change \
  --format markdown
```

## Shared Execution Loop

Use this loop for every cloud task:

1. Discover: inspect repo shape, existing infra ownership, and live cloud state.
2. Decide: choose the least-complex provider-native mapping that fits the workload and current estate.
3. Preview: validate templates, inspect diffs, or run dry-run and what-if surfaces where available.
4. Approve: request permission when cost, blast radius, identity, ingress, data, or rollback risk justifies it.
5. Apply: execute exact CLI or CLI-driven IaC commands.
6. Verify: wait for health, deployment status, logs, revisions, and connectivity.
7. Record: capture outputs, rollback path, and any follow-up risks.

## Task Router

### Identify the Right Provider or Multi-Cloud Shape

1. Use `detect_repo_stack.py` to infer frameworks, CI, IaC, supported clouds, likely primary clouds, runtime surfaces, and operational risks.
2. Load [provider-selection.md](./references/provider-selection.md).
3. Determine ownership by concern:
   - runtime
   - data
   - storage
   - registry
   - secrets
   - DNS and CDN
   - CI identity
4. Preserve existing systems of record unless the user explicitly wants migration or consolidation.

### Design a Cloud Architecture

Use this path when the user asks what to build on AWS, Azure, or GCP, asks for a migration target, or needs service choices before provisioning.

1. Gather requirements: application type, expected users or RPS, budget, team cloud maturity, compliance, availability, region or residency, and existing estate constraints.
2. Run `scripts/architecture_designer.py` for a first-pass recommendation:

```bash
python <skill-dir>/scripts/architecture_designer.py \
  --provider gcp \
  --app-type saas \
  --users 50000 \
  --rps 150 \
  --budget 1200 \
  --team-size 4 \
  --compliance SOC2 GDPR \
  --format markdown
```

3. Load [cloud-architecture-patterns.md](./references/cloud-architecture-patterns.md) and [service-selection-matrix.md](./references/service-selection-matrix.md).
4. Validate the recommended pattern against budget, team maturity, compliance, data gravity, rollback expectations, and current IaC ownership.
5. Convert the approved pattern into the repo's existing IaC path. Use `terraform_scaffolder.py` only when no suitable module structure exists yet.
6. Run `cloud_change_guard.py` before any write that provisions cost, identity, public ingress, DNS, or stateful resources.

### Deploy New Resources or Services

1. Infer the workload shape and choose the least-complex managed target.
2. Estimate recurring and one-time cost before provisioning.
3. Run `cloud_change_guard.py` and request approval if required.
4. Prefer the repo's existing IaC path. If none exists, use the provider CLI or CLI-invoked IaC in the smallest reasonable footprint.
5. Split long-running concerns by role when the workload needs it: public web, background workers, realtime, schedulers, and admin-only surfaces should not collapse into one service unless the repo already operates that way.
6. Wait, verify, and return the exact endpoints, IDs, and health evidence.

### Choose a Deployment Strategy

Load [deployment-strategies.md](./references/deployment-strategies.md) when choosing between rolling, blue/green, canary, or recreate patterns. Contains:
- Strategy selection matrix (when to use each, rollback speed, risk, downtime)
- Provider-specific commands for each strategy (ECS, Container Apps, Cloud Run, Kubernetes)
- Health-check gate checklist before traffic cutover
- IaC tool selection guide (Terraform/OpenTofu default; Pulumi for code-preferring teams; provider-native tools only when fully committed to a single cloud)

Use `scripts/deployment_manager.py` to generate a provider-specific deployment plan with steps and rollback commands:

```bash
python <skill-dir>/scripts/deployment_manager.py <repo_root> \
  --provider aws \
  --strategy blue-green \
  --service my-service \
  --image 123456789.dkr.ecr.us-east-1.amazonaws.com/my-service:abc1234 \
  --dry-run
```

### Wire Automatic Deployments

1. Reuse the existing CI system when it exists.
2. Prefer OIDC, federated credentials, managed identity, or workload identity for CI-to-cloud auth.
3. Build immutable artifacts once, publish them to the provider registry, then roll out by reference.
4. Split infra deploys from runtime deploys when stateful resources or migrations are involved.
5. Load [cicd-and-auto-deploy.md](./references/cicd-and-auto-deploy.md).

**Bootstrapping a new CI pipeline:** If the repo has no CI workflow yet, use the `agentic-development` skill's stack-detection + pipeline-generation workflow to generate a baseline CI YAML first (`stack_detector.py` → `pipeline_generator.py`). Then return here to add cloud-specific deploy stages on top of that baseline.

### Inventory and Optimize

1. Inventory first with list, describe, graph, asset, billing, and deployment-state commands.
2. Review each layer independently: compute, ingress, database, cache, storage, identity, logging, and spend.
3. Look for obvious waste before redesign:
   - idle or duplicate resources
   - oversized data tiers
   - always-on non-prod capacity
   - needless NAT, egress, or public ingress
   - missing lifecycle rules, autoscaling, or concurrency limits
4. Load [inventory-optimization-remediation.md](./references/inventory-optimization-remediation.md).
5. For Azure-specific reviews, load the narrowest deep-dive instead of overloading the base inventory loop:
   - [azure-cost-optimization-guide.md](./references/azure-cost-optimization-guide.md) for cost queries, utilization, and savings reports
   - [azure-compliance-guide.md](./references/azure-compliance-guide.md) for azqr, policy posture, and Key Vault expiration scans
   - [azure-resource-visualization.md](./references/azure-resource-visualization.md) for resource-group architecture diagrams and dependency maps

### Diagnose and Fix Cloud Errors

1. Confirm provider scope and environment.
2. Reproduce or isolate the failing surface.
3. Inspect deployment history, logs, events, identity, secrets, network, and dependencies.
4. Prefer the smallest reversible change first.
5. Re-verify service health, rollout status, and rollback readiness.
6. Capture the root cause and the exact corrective command sequence.
7. For Azure incidents, load [azure-diagnostics-guide.md](./references/azure-diagnostics-guide.md) before going deep on Container Apps, Functions, AKS, Monitor, or resource-health evidence.

### Azure Storage Operations

When the task is about blobs, file shares, queues, tables, data lake paths, storage tiers, redundancy, or object transfer on Azure:

1. Load [azure-storage-guide.md](./references/azure-storage-guide.md).
2. Confirm account, resource group, region, and auth mode before listing or mutating data.
3. Prefer `az storage ... --auth-mode login` or repo-owned automation over account keys.
4. Request approval before deleting data, changing replication tiers, or moving large datasets across regions.

### Azure Compute and VM Decisions

When the task is about Azure VMs, VMSS, reserved capacity, or VM reachability:

1. Load [azure-compute-guide.md](./references/azure-compute-guide.md).
2. Separate recommendation work from break-fix work.
3. Use workload, scaling, statefulness, and budget to choose between VM, VMSS, and a more managed runtime.
4. For connectivity incidents, inspect instance view, NSGs, boot diagnostics, and network watcher evidence before changing the host.

### Azure Service Upgrades

When the task is an in-place Azure upgrade or migration within Azure, such as plan, tier, or SKU changes:

1. Load [azure-upgrade-guide.md](./references/azure-upgrade-guide.md).
2. Run the upgrade phases in order: assess, snapshot, choose target, preview, approve, execute, validate.
3. Never stop or delete the source app without explicit user approval.

### Azure Identity and App Registration

When the task is Microsoft Entra app registration, OAuth configuration, redirect URIs, service principals, or confidential-client auth:

1. Load [azure-entra-app-registration.md](./references/azure-entra-app-registration.md).
2. Reuse IaC when the repo already manages identity that way.
3. Prefer managed identity or certificates over long-lived client secrets.
4. Treat permission grants, admin consent, and credential creation as approval-worthy if they affect shared tenants or production apps.

### Azure Foundry and AI Agent Operations

When the task is Azure AI Foundry or Microsoft Foundry provisioning, agent deployment, model quota, evaluation, or agent runtime operations:

1. Load [azure-foundry-guide.md](./references/azure-foundry-guide.md).
2. Treat `.foundry/agent-metadata.yaml` as the source of truth when it exists.
3. Verify quota, model availability, RBAC, registry, and deployment target before building or shipping agents.
4. Request approval before new model deployments, quota-consuming capacity changes, external data-source hookups, or public agent ingress.

### AWS Amplify Full-Stack Projects

When the task is an Amplify project — authentication, data models, storage, Lambda functions, Amplify Hosting, or sandbox environments:

1. Load [aws-amplify-guide.md](./references/aws-amplify-guide.md).
2. Confirm the Amplify environment (`amplify env list`) and AWS profile before any write.
3. Prefer `amplify push` for Amplify-managed resources; do not introduce parallel Terraform or CloudFormation stacks for the same resources.
4. Evaluate whether the workload fits Amplify's service boundary. If it needs relational joins, private networking, ECS, or SQS, recommend graduating to direct AWS services.
5. Request approval before changing auth configuration or `@auth` rules on a User Pool with production data.

### AWS Serverless (Lambda, API Gateway, Step Functions)

When the task is Lambda functions, API Gateway REST/HTTP/WebSocket APIs, Step Functions workflows, EventBridge rules, or SAM/CDK serverless deployments:

1. Load [aws-serverless-guide.md](./references/aws-serverless-guide.md).
2. Confirm whether the project uses SAM, CDK, or Terraform. Extend the existing IaC path.
3. For Lambda-to-RDS connectivity, always check whether an RDS Proxy is in place before prescribing a connection pool pattern.
4. For API Gateway, establish HTTP API vs REST API tradeoff before prescribing authorizer, CORS, or throttle configuration.
5. Request approval before changing concurrency limits, reserved concurrency, or Lambda execution roles in production.

### AWS Databases (RDS, Aurora, DynamoDB, Aurora DSQL, ElastiCache)

When the task is database service selection, schema design, migrations, connection management, or operational incidents on any AWS database service:

1. Load [aws-databases-guide.md](./references/aws-databases-guide.md).
2. Identify the service type before issuing any command — RDS, Aurora cluster, Aurora DSQL, DynamoDB, or ElastiCache each have different CLI namespaces and operational models.
3. For DynamoDB, confirm access patterns exist before discussing schema.
4. For Aurora DSQL, use IAM token auth and confirm the application handles token refresh (900-second expiry).
5. Request approval before any destructive DDL, snapshot deletion, table deletion, DB class modification, or topology change.

## Architecture Bias

Favor the simplest managed platform that fits the repo:

- Static site or SPA: storage plus CDN, or the provider's lightweight static hosting path.
- Full-stack mobile or web app with a frontend-first team: AWS Amplify (auth, data, storage, functions, hosting) before wiring bare ECS or Lambda directly — only if the workload fits Amplify's service boundary.
- Containerized API: ECS Fargate, Azure Container Apps, or Cloud Run before Kubernetes.
- Serverless API or event handler: Lambda plus API Gateway or EventBridge before ECS, when cold-start tolerance, sub-15-minute duration, and provider lock-in are acceptable.
- Workflow orchestration: Step Functions (AWS) or Durable Functions (Azure) before hand-rolled retries or cron-inside-app patterns.
- Web plus worker plus websocket or realtime: split services by responsibility instead of forcing one long-running process shape.
- Event-driven jobs or schedulers: use provider-native schedulers and queues instead of cron inside app containers.
- Kubernetes: choose only when the repo already needs k8s primitives, advanced ingress, sidecars, daemon workloads, or node-level tuning.
- Azure-hosted AI agents: keep Foundry project, model deployment, retrieval layer, tracing, and runtime identity aligned unless the user explicitly wants a split control plane.
- AWS relational database: RDS or Aurora Cluster by default; Aurora Serverless v2 for scale-to-low traffic; Aurora DSQL only for distributed multi-region active-active SQL needs.

For multi-runtime backends, use this as the baseline example, not a hard requirement:

- separate `web`, `worker`, and `socket` or `realtime` runtime surfaces
- managed PostgreSQL, managed Redis or Valkey, object storage, registry, and secrets
- provider-native schedulers and queues
- registry push plus rolling or revision-based service updates, not hand-managed VMs
- internal admin or observability surfaces should stay private unless the user explicitly wants public exposure

## Approval Model

Always request explicit permission before:

- deleting, replacing, migrating, restoring, or resizing stateful resources
- changing DNS, TLS, public ingress, private networking, or auth trust
- creating likely expensive services such as HA databases, premium caches, NAT gateways, large load balancers, dedicated clusters, or cross-region replication
- changing org-scope policy, IAM, RBAC, or workload identity bindings
- performing production changes with downtime or restart risk

Use `cloud_change_guard.py` to classify risk and generate the checklist or approval request. Read [approval-policy.md](./references/approval-policy.md) for the full model.

## Bundled Scripts

- `scripts/architecture_designer.py`
  - Recommend an AWS, Azure, or GCP architecture pattern from workload requirements. Produces markdown or JSON with provider service stacks, cost estimate, tradeoffs, compliance notes, and next steps. Usage: `python <skill-dir>/scripts/architecture_designer.py --provider azure --app-type web_app --users 10000 --budget 500 --format json`
- `scripts/detect_repo_stack.py`
  - Inspect a repo and emit deploy-relevant signals: languages, frameworks, CI, IaC, cloud hints, identity hints, and recommended runtime bias.
- `scripts/cloud_change_guard.py`
  - Score change risk, determine whether approval is required, and emit a structured checklist or approval template before execution.
- `scripts/pipeline_generator.py`
  - Scaffold CI/CD workflow files (GitHub Actions or CircleCI) with build, test, security-scan, and **deploy** stages (OIDC auth, image build/push, cloud-specific rollout). Detects runtime signals from the repo. Usage: `python <skill-dir>/scripts/pipeline_generator.py <repo_root> --platform github-actions --dry-run`
  - **Note:** This script focuses on cloud deploy stages. For a baseline CI pipeline (lint/test/build) generated from stack signals, use the `agentic-development` skill's `scripts/stack_detector.py` + `scripts/pipeline_generator.py` instead.
- `scripts/deployment_manager.py`
  - Build a provider-specific deployment plan (rolling, blue/green, canary, recreate) with ordered CLI steps and a rollback command. Supports AWS, Azure, GCP, and Kubernetes. Usage: `python <skill-dir>/scripts/deployment_manager.py <repo_root> --provider gcp --strategy blue-green --service my-svc --image gcr.io/project/image:tag`
- `scripts/terraform_scaffolder.py`
  - Generate a Terraform/OpenTofu module scaffold (`versions.tf`, `variables.tf`, `main.tf`, `outputs.tf`, `README.md`) for AWS, Azure, or GCP. Optionally runs `terraform init + validate`. Usage: `python <skill-dir>/scripts/terraform_scaffolder.py <repo_root> --provider aws --module-name my-service --validate`
