# Azure Diagnostics Guide

Use this when the task is Azure incident response, production debugging, log analysis, or root-cause isolation for Container Apps, Functions, AKS, or Azure-hosted dependencies.

## Diagnostic Loop

1. Confirm scope.
2. Check Azure health and recent control-plane changes.
3. Inspect service-specific logs, revisions, and metrics.
4. Inspect one dependency layer down: identity, secret store, registry, network, or data tier.
5. Make the smallest reversible change.
6. Re-check health, logs, rollout state, and blast radius.
7. Record the root cause and exact corrective commands.

## Scope Verification

```bash
az account show
az configure --list-defaults
az extension list -o table
```

Always pin subscription and resource group in follow-up commands when the repo has multiple environments.

## First Commands to Run

```bash
az monitor activity-log list -g <rg> --max-events 20 -o table
az resource show --ids <resource-id>
```

If the incident is broad, list related resources first:

```bash
az resource list -g <rg> -o table
```

## Service-Specific Triage

### Container Apps

```bash
az containerapp show -g <rg> -n <app>
az containerapp revision list -g <rg> -n <app> -o table
az containerapp logs show -g <rg> -n <app> --follow
```

Check for:

- wrong image tag or registry auth failure
- unhealthy revision or bad ingress target port
- missing secrets or broken Key Vault references
- managed identity missing required roles

### Function Apps

```bash
az functionapp show -g <rg> -n <app>
az functionapp config appsettings list -g <rg> -n <app>
az monitor app-insights query --apps <app-insights-name> -g <rg> \
  --analytics-query "traces | where timestamp > ago(1h) | order by timestamp desc | take 50"
```

Check for:

- missing app settings or connection strings
- cold start, timeout, or binding errors
- storage account connectivity problems
- deployment package mismatch

### AKS

```bash
az aks show -g <rg> -n <cluster>
az aks get-credentials -g <rg> -n <cluster> --overwrite-existing
kubectl get nodes
kubectl get pods -A
kubectl describe pod <pod> -n <ns>
kubectl logs <pod> -n <ns> --previous
```

Check for:

- crash loops, OOM kills, or probe failures
- image pull errors
- scheduling, DNS, or ingress issues
- node pool upgrade or capacity problems

## Dependency Checks

Run the narrowest dependency command that matches the symptom:

```bash
az acr repository list -n <acr-name> -o table
az keyvault secret list --vault-name <kv-name> -o table
az postgres flexible-server show -g <rg> -n <server>
az network private-endpoint list -g <rg> -o table
az network private-dns zone list -g <rg> -o table
```

## Common Failure Classes

- wrong subscription, resource group, or region
- missing CLI extension or unregistered resource provider
- broken managed identity, RBAC, or federated credential
- stale image tag or registry pull failure
- unhealthy revision, probe mismatch, or bad startup command
- DNS, TLS, ingress, or private networking breakage
- data tier unavailable, blocked, or undersized

## Remediation Discipline

- Prefer config fixes, rollback, or a single revision change before larger re-provisioning.
- If the repo uses Bicep, Terraform, or azd, land the final fix there after the incident patch.
- Treat secret rotation, RBAC grants, ingress changes, and data operations as approval-worthy when shared or production-facing.
