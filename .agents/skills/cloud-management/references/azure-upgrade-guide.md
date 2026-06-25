# Azure Upgrade Guide

Use this when the task is upgrading or migrating an existing Azure workload within Azure, such as a plan, tier, SKU, or hosting-service move.

## Upgrade Phases

1. Assess current state.
2. Snapshot current config and dependencies.
3. Choose and confirm the target plan or service.
4. Preview the change path.
5. Request approval if the move is destructive, stateful, or production-facing.
6. Execute the change with idempotent commands or IaC.
7. Validate reachability, monitoring, and rollback posture.

Do not skip the assessment phase.

## What to Capture Before Any Change

- current app settings and secret references
- identity assignments and RBAC
- network, DNS, ingress, and custom domain dependencies
- data dependencies and background jobs
- current SKU, region, and scale posture

Useful commands:

```bash
az functionapp show -g <rg> -n <app>
az webapp show -g <rg> -n <app>
az functionapp config appsettings list -g <rg> -n <app>
az webapp config appsettings list -g <rg> -n <app>
az deployment group what-if -g <rg> --template-file <main.bicep>
```

## Common Scenarios

- Functions Consumption to Flex Consumption
- App Service plan or SKU change
- App Service to Container Apps when the repo is already containerized
- database or cache tier changes

## Guardrails

- Confirm the exact target plan or SKU with the user before applying.
- Never delete or stop the original app without explicit approval.
- For cross-service moves, keep source and target coexistence long enough to verify traffic, auth, and background work.
- If the repo already uses Terraform, Bicep, or azd, land the durable change there rather than leaving a portal or CLI-only mutation behind.
