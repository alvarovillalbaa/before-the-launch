# Inventory, Optimization, and Remediation

## Contents

- Read-first workflow
- Inventory surfaces
- Optimization checklist
- Incident repair loop
- Common failure classes
- Mixed-cloud risks

## Read-First Workflow

1. Verify identity and scope.
2. Inventory resources before changing them.
3. Group findings by layer:
   - compute and containers
   - networking and ingress
   - databases and caches
   - object storage
   - secrets and identity
   - logs, metrics, and alerts
   - billing and waste
4. Make the smallest effective change first.

## Cross-Provider Inventory Surfaces

| Goal | AWS | Azure | GCP |
| --- | --- | --- | --- |
| Who am I? | `aws sts get-caller-identity` | `az account show` | `gcloud auth list && gcloud config list` |
| Broad resource inventory | `list-*`, `describe-*`, tagging APIs | `az graph query`, `az resource list` | `gcloud asset search-all-resources` |
| Deployment state | ECS, Lambda, CloudFormation, EKS | Container Apps, App Service, deployments, AKS | Cloud Run, GKE, Compute, deployment state |
| Logs and metrics | CloudWatch, `aws logs tail` | Azure Monitor, Activity Log, Container Apps logs | Cloud Logging and Monitoring |
| Cost surface | Cost Explorer, Budgets, Trusted Advisor | Cost Management and Advisor | Billing budgets and recommender surfaces |

## Inventory by Layer

### Compute and Containers

- enumerate all services, tasks, revisions, nodes, or VMs
- confirm desired count versus actual healthy count
- identify idle or stale services, revisions, and images

### Databases and Caches

- enumerate engines, tiers, HA settings, storage, replicas, and backup posture
- inspect connection pressure and actual utilization before resizing
- flag idle non-prod databases or caches that run 24 by 7

### Storage and CDN

- enumerate buckets or containers, lifecycle rules, versioning, retention, and replication
- check whether CDN is attached where static assets or downloads justify it
- inspect cross-region transfer and stale artifacts

### Networking and Edge

- enumerate public IPs, NAT, gateways, load balancers, ingress, DNS, certificates, and private endpoints
- verify ingress rules match the actual application boundary
- flag public exposure or wide CIDR rules that look accidental

### Identity and Secrets

- enumerate deploy identities, runtime identities, secret stores, and key references
- check for drift between runtime secret references and CI secret injection
- verify least privilege before broadening permissions

### Observability

- confirm each runtime has a fast path to logs and recent deployment events
- verify log retention is intentional
- inspect alerts for noise versus SLO relevance

## Optimization Checklist

### Compute and Containers

- remove idle or stale services, revisions, images, and instances
- right-size CPU and memory from actual metrics, not guesses
- turn off always-on non-prod workloads when possible
- use autoscaling and concurrency instead of fixed overprovisioning
- prefer rolling or revision-based deploys over replacement-heavy cutovers

### Databases and Caches

- right-size instance classes and storage tiers
- confirm HA and replicas are actually needed for the environment
- check connection pressure before scaling up
- keep backups and retention intentional
- clean up forgotten dev databases, read replicas, or premium cache tiers

### Storage and CDN

- add lifecycle rules for artifacts, logs, and backups
- use CDN for static assets and reduce origin egress
- review versioning, retention, and replication costs
- avoid expensive cross-region data paths without a clear reason

### Networking

- remove unused public IPs, NAT, gateways, and load balancers
- keep databases and caches private by default
- put DNS, certificates, and public-exposure changes behind explicit approval

### Identity and Security

- replace static credentials with short-lived or federated identity where feasible
- collapse duplicate secret copies into provider-native secret systems
- remove stale deploy principals and unused role bindings

## Incident Repair Loop

1. Confirm scope and blast radius.
2. Inspect the last deployment or resource event.
3. Inspect logs and health for the failing runtime.
4. Inspect dependent resources: database, cache, secrets, DNS, ingress, queues.
5. Make the smallest reversible change.
6. Re-check logs, metrics, health endpoints, and deployment state.
7. Capture the exact command sequence and root cause.

## Role-Specific Checks for Multi-Runtime Backends

### Web

- health endpoint, target registration, ingress, and recent deploy events
- dependency reachability to database, cache, secrets, and storage

### Worker

- queue depth, retry storms, consumer concurrency, and memory pressure
- secret, database, and cache reachability without public ingress assumptions

### Realtime

- websocket or stream connection health, timeout settings, and backplane or cache reachability
- load balancer and proxy behavior for long-lived connections

### Scheduler and Admin

- trigger history, missed runs, and least-privilege identity
- keep dashboards and admin UIs private unless there is an explicit reason to expose them

## Common Failure Classes

### Wrong Context

- wrong account, subscription, or project
- wrong profile, subscription, or active gcloud configuration

### Tooling Surface Missing

- missing API enablement on GCP
- missing Azure CLI extension
- wrong AWS region or missing service permission

### Identity and Secrets

- broken IAM, RBAC, or federated identity
- secret mismatch or missing secret reference
- runtime identity lacks registry, database, or secret access

### Deployment and Runtime

- registry auth failure or wrong image tag
- failed rollout, unhealthy revision, task, or health probe
- mismatched environment variables between revision and dependency

### Network and Edge

- broken ingress or private-network path
- DNS or certificate drift
- public exposure that bypasses the intended edge layer

### Data Tier

- database, cache, or queue reachability failure
- connection exhaustion
- storage or disk pressure

## Mixed-Cloud Risks

- cross-cloud latency between runtime and database
- separate secret systems with drift
- CI deploying to the wrong target because provider context is implicit
- DNS or CDN pointing to the wrong environment during migration
- provider-native identity assumptions breaking when workloads move clouds

## Read Next

- AWS commands: [aws-cli-playbook.md](./aws-cli-playbook.md)
- Azure commands: [azure-cli-playbook.md](./azure-cli-playbook.md)
- GCP commands: [gcp-cli-playbook.md](./gcp-cli-playbook.md)
