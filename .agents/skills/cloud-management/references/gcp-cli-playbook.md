# GCP CLI Playbook

## Contents

- Scope and identity
- Command habits
- Discovery and inventory
- Deploy and provision
- Automatic deployments
- Troubleshooting
- Optimization
- Multi-runtime backend mapping

## Scope and Identity

Use named configurations and explicit projects. Verify context before writes:

```bash
gcloud init
gcloud auth login
gcloud config configurations list
gcloud config configurations create work
gcloud config configurations activate work
gcloud config set project my-project
gcloud auth list
gcloud config list
```

Keep `gcloud` auth separate from Application Default Credentials. Use `gcloud auth application-default login` only when local app code needs ADC; it does not replace normal `gcloud` login behavior.

For new projects, enable APIs early:

```bash
gcloud services enable \
  run.googleapis.com \
  artifactregistry.googleapis.com \
  logging.googleapis.com
```

## Command Habits

- Read first with `list`, `describe`, `search`, and `logging read`.
- Use `--project`, `--filter`, and `--format`.
- Discover syntax with `gcloud help`, `gcloud <group> --help`, `gcloud topic filters`, and `gcloud topic formats`.
- Use named configurations to avoid wrong-project writes.
- Prefer service account impersonation or workload identity over long-lived keys.

## Discovery and Inventory

### Core Inventory

```bash
gcloud projects list
gcloud asset search-all-resources --scope=projects/my-project
gcloud run services list --project=my-project
gcloud compute instances list --project=my-project
gcloud sql instances list --project=my-project
gcloud redis instances list --region=us-central1 --project=my-project
gcloud storage ls --project=my-project
gcloud logging read 'severity>=ERROR' --limit=50 --project=my-project
gcloud billing budgets list --billing-account=BILLING_ACCOUNT_ID
```

### Structured Output

```bash
gcloud compute instances list \
  --filter='status=RUNNING' \
  --format='table(name,zone,machineType.basename(),networkInterfaces[0].networkIP)' \
  --project=my-project
```

## Deploy and Provision

### Default Managed Mapping

- registry: Artifact Registry
- runtime: Cloud Run
- data: Cloud SQL
- cache: Memorystore
- storage: Cloud Storage
- secrets: Secret Manager

### Container Runtime Rollout

```bash
gcloud artifacts repositories create app-images \
  --repository-format=docker \
  --location=us-central1 \
  --project=my-project
gcloud builds submit \
  --tag us-central1-docker.pkg.dev/my-project/app-images/my-app:sha-123
gcloud run deploy my-app \
  --image us-central1-docker.pkg.dev/my-project/app-images/my-app:sha-123 \
  --region=us-central1 \
  --project=my-project
gcloud run services describe my-app --region=us-central1 --project=my-project
```

### Source-Based Deploys

```bash
gcloud run deploy my-app --source . --region=us-central1 --project=my-project
```

### Identity and Secret Setup

- use Workload Identity Federation for CI
- use dedicated service accounts for runtime
- wire Secret Manager references before rollout
- enable required APIs before creating new services

## Automatic Deployments

Preferred pattern:

- CI uses Workload Identity Federation into a deployment service account
- CI builds into Artifact Registry
- CI deploys via `gcloud run deploy` or the repo's IaC path for infra-heavy changes

Useful command surfaces:

- workload identity pools and providers
- service accounts and IAM bindings
- Artifact Registry repositories
- Cloud Run service rollout commands

## Troubleshooting

### Runtime and Deploy

```bash
gcloud logging read 'resource.type="cloud_run_revision"' --limit=50 --project=my-project
gcloud run services describe my-app --region=us-central1 --project=my-project
gcloud run revisions list --service=my-app --region=us-central1 --project=my-project
```

### Data and Operations

```bash
gcloud compute operations list --project=my-project
gcloud sql operations list --instance=my-db --project=my-project
gcloud asset search-all-resources --scope=projects/my-project
```

Common failure classes:

- wrong active configuration or project
- missing API enablement
- Cloud Run service account lacks access to Secret Manager, Cloud SQL, or Artifact Registry
- deploy points to the wrong image or region
- traffic is pinned to a bad revision

## Optimization

- use Cloud Run concurrency, max instances, and min instances intentionally
- review Cloud SQL sizing, HA, and idle non-prod instances
- review Memorystore tier and always-on cost
- add bucket lifecycle rules and reduce cross-region egress
- use Cloud Asset Inventory to find stale resources and policy sprawl

## Multi-Runtime Backend Mapping

- `web`: Cloud Run service
- `worker`: Cloud Run service or job, or GKE if long-lived queue consumers need more control
- `socket`: Cloud Run service with websocket support, or GKE for more control
- `db`: Cloud SQL
- `cache`: Memorystore
- `files`: Cloud Storage
- `secrets`: Secret Manager
- `events`: Pub/Sub and Cloud Scheduler
- `admin`: keep dashboards and internal control-plane surfaces private unless the user explicitly wants public exposure
