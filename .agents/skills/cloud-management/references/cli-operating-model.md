# CLI Operating Model

In command examples below, `<skill-dir>` means the installed `cloud-management` skill directory and `<repo-root>` means the target repository root.

## Contents

- Non-negotiables
- Scope verification
- Repo discovery
- Execution loop
- Mutation discipline
- Multi-cloud operating model
- Deployment bias
- Incident loop

## Non-Negotiables

- Use the terminal as the control plane. Prefer `aws`, `az`, `gcloud`, and CLI-invoked IaC or deployment tools already present in the repo.
- Start read-only. Run discovery before mutation.
- Prefer the repo's existing state manager over ad hoc imperative drift.
- Prefer short-lived credentials and workload identity over static secrets.
- Ask only when ambiguity changes risk or architecture. Do not ask questions with obvious answers.
- Keep outputs structured. Use `--query`, `--output`, `--filter`, `--format`, or table views so findings are fast to scan.
- Finish every change with verification, rollback posture, and the exact commands used.

## Scope Verification

Verify scope before every write, especially in mixed-cloud estates.

| Provider | Minimum checks before mutation | Typical follow-up |
| --- | --- | --- |
| AWS | `aws sts get-caller-identity`, `aws configure list`, confirm `--profile` and `--region` | inspect account tags, active role, and target stack or cluster |
| Azure | `az account show`, confirm active cloud and subscription, confirm resource group | inspect tenant, extension availability, and deployment scope |
| GCP | `gcloud auth list`, `gcloud config list`, confirm named configuration and project | confirm enabled APIs, region, and target service account |

Do not rely on implicit defaults when the repo has multiple environments.

## Repo Discovery

Start with:

```bash
python <skill-dir>/scripts/detect_repo_stack.py <repo-root>
```

Then validate the result manually:

- CI system: GitHub Actions, GitLab CI, Azure Pipelines, Jenkins, Buildkite, or none
- state manager: Terraform, Bicep, CloudFormation, Pulumi, Helm, Kubernetes manifests, or ad hoc shell
- workload shape: static site, API, worker, websocket or realtime, scheduled jobs, serverless, or k8s-heavy
- cloud ownership by concern: runtime, database, storage, secrets, registry, DNS, monitoring
- environment boundaries: dev, staging, prod, sandbox, ephemeral preview
- likely primary cloud versus merely supported clouds
- runtime surfaces such as `web`, `worker`, `realtime`, `scheduler`, or admin-only processes
- operational risks such as startup migrations, mutable image tags, or multi-process containers

Prefer extending what already exists unless the user explicitly wants migration.

## Shared Execution Loop

1. Discover
   - inspect repo, CI, state manager, and live infra
2. Decide
   - choose the least-complex managed target that fits the workload
3. Preview
   - run `what-if`, `validate`, `plan`, or the provider's dry-run equivalent where available
4. Approve
   - request permission when cost, blast radius, identity, ingress, or reversibility demand it
5. Apply
   - execute exact CLI or CLI-driven IaC commands
6. Verify
   - wait for readiness, inspect logs, health, revisions, and dependency connectivity
7. Record
   - capture outputs, rollback path, and any residual risk

## Mutation Discipline

- Read first with `list`, `describe`, `show`, `get`, `graph`, `asset`, `logging`, or billing commands.
- Prefer structured output over raw console prose.
- Prefer waiters or revision readiness checks over arbitrary `sleep`.
- If the repo already uses declarative infra, do not patch the live resource manually unless the task is incident repair or break-glass remediation.
- Make the smallest effective change first, especially during incidents.
- Re-run read commands after every write to verify that the intended state landed.

## Multi-Cloud Operating Model

Treat each concern independently:

- runtime
- database
- cache or queue
- object storage
- secrets
- registry
- DNS and CDN
- observability
- CI identity

Rules:

- Keep stateful services close to the runtime unless the user explicitly wants split-cloud data paths.
- Keep one system of record for DNS per environment.
- Keep one system of record for secrets per environment whenever possible.
- Keep CI identity explicit. Do not let one workflow infer a default target across providers.
- Avoid partial migrations that strand data, IAM, or DNS between clouds without a clean operating model.

## Deployment Bias

Default to the least-complex managed service that fits the repo:

- static site or SPA: object storage plus CDN or provider-native static hosting
- containerized API: ECS Fargate, Azure Container Apps, or Cloud Run
- multi-service backend: separate web, worker, and socket or realtime runtimes
- scheduled or async work: provider-native queues, schedulers, jobs, or functions
- Kubernetes only when the repo already needs k8s primitives or lower-level control
- Prefer one long-running responsibility per service. If the repo currently runs migrations at startup or multiple daemons in one container, treat that as a constraint to manage carefully, not a default to copy.

Default to dev-sized capacity unless the user explicitly requests production-ready HA or multi-region.

## Incident Loop

When fixing errors:

1. confirm provider scope and environment
2. identify the failing boundary: deploy, network, secret, identity, data, or application
3. inspect recent deployment events and logs
4. inspect dependencies one layer down
5. make the smallest reversible change
6. re-check health, logs, and blast radius
7. capture the root cause and exact remediation commands

Common failure classes:

- wrong account, subscription, or project
- missing CLI extension or missing API enablement
- broken IAM, RBAC, federated identity, or secret reference
- registry auth or image tag mismatch
- unhealthy rollout, revision, task, or probe
- DNS, certificate, ingress, or private-network breakage
- data tier reachability or capacity failure
