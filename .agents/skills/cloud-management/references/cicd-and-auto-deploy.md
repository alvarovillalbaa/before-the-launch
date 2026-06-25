# CI/CD and Automatic Deploy

## Contents

- Core rules
- Standard pipeline
- Identity for CI
- Runtime patterns
- Infra rollout
- Migration ordering
- Rollback expectations

## Core Rules

- Reuse the existing CI system if the repo already has one.
- Prefer OIDC, federated credentials, managed identity, or workload identity over static cloud credentials.
- Build immutable artifacts once, then deploy by reference.
- Validate infrastructure before applying it.
- Separate infra rollout from app rollout when stateful resources are involved.
- Keep environment selection explicit. Do not let CI infer prod accidentally from a branch name alone.

## Standard Pipeline

1. Verify repo context, provider context, and target environment.
2. Validate IaC or provider deployment manifest.
3. Build the artifact:
   - container image
   - static asset bundle
   - function package
4. Publish the artifact to the provider registry or storage target.
5. Apply infra changes if needed.
6. Trigger runtime rollout.
7. Wait for readiness, health checks, and logs.
8. Run smoke verification and prepare rollback.

## Identity for CI

- AWS: prefer OIDC from the CI runner into an IAM role rather than long-lived access keys.
- Azure: prefer federated credentials on an app registration or service principal, or managed identity when CI runs inside Azure.
- GCP: prefer Workload Identity Federation into a deployment service account.
- If the repo already has static credentials, preserve functionality but recommend a follow-up migration path rather than breaking deploys mid-task.

## Runtime Patterns

### Managed Containers

1. Build the image with `docker build` or a provider-native build surface.
2. Push to ECR, ACR, or Artifact Registry.
3. Trigger service update by CLI:
   - AWS: `aws ecs update-service --force-new-deployment`
   - Azure: `az containerapp update --image ...`
   - GCP: `gcloud run deploy ... --image ...`
4. Wait for revision, task, or service health and tail logs.

### Static Sites

1. Build the site.
2. Upload the final assets by CLI.
3. Invalidate the CDN or trigger the provider's site refresh flow.
4. Verify the final host, not just the artifact upload.

### Functions and Jobs

1. Package code or build the function image.
2. Push the artifact or update the function source.
3. Verify triggers, permissions, and environment variables.
4. Invoke a safe smoke path or inspect the first execution logs.

### Kubernetes

Use the repo's existing cluster workflow only if the repo already depends on Kubernetes. Do not introduce k8s only to solve a simple managed-container problem.

## Infra Rollout

- AWS: use `aws cloudformation deploy` or the repo's Terraform or Pulumi path.
- Azure: use `az deployment group|sub|mg|tenant what-if` before `create`.
- GCP: use `gcloud` for project, IAM, API, and service setup; reuse Terraform or another repo-owned IaC path when infra is already declarative.
- Do not mix imperative mutations into a declarative stack unless the change is incident repair or break-glass.

## Migration Ordering

When stateful resources are involved:

1. create or update shared infra first: registry, networking, secrets, database, cache
2. build and publish the artifact
3. run migrations in a one-off task or job
4. roll out background workers or queue consumers
5. roll out the API or web service
6. roll out websocket or realtime services
7. verify health, queue drain behavior, and logs

## Multi-Runtime Backend Rollout

For repos with separate web, worker, realtime, scheduler, or admin surfaces:

1. build the shared artifact once if the repo already uses one image for multiple roles
2. run migrations as a one-off job or controlled pre-deploy step
3. roll out workers before or alongside web only when queue compatibility requires it
4. roll out public web and realtime services independently so ingress and timeout changes stay isolated
5. keep admin-only surfaces such as Flower or dashboards private by default

If the repo currently runs migrations during service startup, treat each rollout as higher-risk and confirm rollback posture before deploying.

## Anti-Patterns to Flag

- mutable `latest` tags without a recorded immutable tag, digest, or commit SHA
- startup migrations inside the steady-state web service when a one-off job would be safer
- one long-running container process trying to serve public traffic, background work, and control-plane jobs at once
- public exposure for internal admin surfaces
- CI identity spread across static secrets when one short-lived identity flow would work

## CI System Notes

### GitHub Actions

- Keep deploy permissions scoped per environment.
- Prefer OIDC and provider-native auth actions or CLI login commands.
- Separate build and deploy jobs so failed deploys do not force rebuilds.

### GitLab CI, Azure Pipelines, Jenkins, Buildkite

- Use the same principles: short-lived cloud identity, immutable artifacts, explicit environment targeting, and post-deploy verification.
- If the repo already contains CI helpers, extend them instead of replacing them.

## Provider Notes

### AWS

- Common path: CI -> ECR -> ECS rolling update or CloudFormation deploy.
- Common extras: `aws sts get-caller-identity`, ECR auth, ECS service update, CloudWatch log verification.

### Azure

- Common path: CI -> ACR -> Container Apps rolling update.
- Common extras: `az account show`, `az acr build` or `az acr login`, `az deployment ... what-if`, Container Apps logs.

### GCP

- Common path: CI -> Artifact Registry -> Cloud Run deploy.
- Common extras: `gcloud auth list`, `gcloud config list`, API enablement, Cloud Logging verification.

## Rollback Expectations

- Keep the last known-good artifact reference.
- Keep the last known-good revision, task definition, or deploy manifest handy.
- Know whether rollback is:
  - deploy the previous artifact
  - route traffic back to the previous revision
  - revert IaC
  - restore from snapshot or backup
- For data migrations, know whether rollback is forward-fix only.
