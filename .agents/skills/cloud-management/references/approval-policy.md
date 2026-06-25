# Approval Policy

In command examples below, `<skill-dir>` means the installed `cloud-management` skill directory.

## Mandatory Approval Cases

Require explicit user confirmation before executing commands that:

- delete, replace, purge, restore, fail over, or migrate stateful resources
- change production DNS, ingress, certificates, or public exposure
- change IAM, RBAC, org policy, subscription-level policy, project-level policy, or trust relationships
- create likely expensive resources or materially increase recurring spend
- resize or replatform databases, caches, clusters, NAT, gateways, or load balancers
- carry downtime risk in production
- rotate or replace automation identities, secrets, workload identity bindings, or deploy credentials

## Risk Levels

| Level | Meaning | Approval |
| --- | --- | --- |
| `low` | Read-only discovery or trivial reversible writes in non-prod | No extra approval beyond task intent |
| `medium` | Routine deploys or safe config updates with limited blast radius | Approval if the task intent is ambiguous |
| `high` | Production writes, public ingress, identity changes, migrations, or notable recurring cost | Explicit approval required |
| `critical` | Data-destructive, org-scope, irreversible, or clearly expensive changes | Explicit approval with rollback and backup confirmation |

## Cost Hotspots

Treat these as approval-worthy even before you have exact pricing:

- AWS: NAT gateways, ALBs or NLBs, multi-AZ RDS, large ElastiCache nodes, dedicated EKS clusters, cross-region transfer, always-on GPU instances
- Azure: NAT Gateway, Application Gateway, Front Door Premium, PostgreSQL Flexible Server HA, Premium or Enterprise Redis, AKS node pools, private endpoints at scale
- GCP: Cloud SQL HA, external HTTPS load balancers, Cloud NAT, GKE clusters, high min-instance Cloud Run services, cross-region traffic, always-on GPUs

## Irreversible or High-Blast-Radius Actions

- database engine upgrades, restores, failovers, destructive schema changes, or one-way migrations
- bucket, blob container, or image registry deletion, purge, retention changes, or lifecycle cleanup that removes needed data
- DNS zone, certificate, or public-routing changes
- removing private networking or opening broad ingress
- replacing auth providers, trust policies, workload identity bindings, or admin roles
- changing secrets in a way that forces app restarts or breaks automation

## What to Show the User Before Running

- provider, account or subscription or project, region, and environment
- exact resources being changed
- exact commands or IaC apply command that will run
- expected monthly cost delta or the fact that cost is still uncertain
- one-time migration or data-movement cost if relevant
- blast radius: service, app, resource group, project, subscription, or org
- rollback or restore path
- whether downtime, restart, or data movement is expected
- whether migrations run as a one-off job or inside a steady-state runtime rollout

## Use the Guard Script

Example:

```bash
python <skill-dir>/scripts/cloud_change_guard.py \
  --provider azure \
  --environment prod \
  --operation "update container app ingress and dns" \
  --resource-type ingress \
  --monthly-cost-usd 35 \
  --public-ingress \
  --dns-change \
  --downtime-risk \
  --format markdown
```

The script returns:

- `risk_level`
- `approval_required`
- `strong_approval_required`
- reasons to show the user
- preflight checks
- required confirmation fields
- an approval request template

## Approval Request Template

Use this shape when approval is required:

```text
Provider and scope: AWS prod in account 123456789012, eu-west-1
Change: Create ALB, ECS service, and RDS instance for the API
Why: Existing repo has a containerized web API plus worker and no runtime infra
Cost: Estimated +$180 per month before data transfer
Risk: High because this creates public ingress and a new stateful database
Rollback: Delete ECS service and ALB, restore DB from snapshot if data was written
Approval needed: Confirm the commands, environment, budget tolerance, and downtime expectations
```
