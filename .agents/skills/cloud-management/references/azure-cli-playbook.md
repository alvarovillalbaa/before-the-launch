# Azure CLI Playbook

## Contents

- Scope and identity
- Command habits
- Discovery and inventory
- Deploy and provision
- Automatic deployments
- Troubleshooting
- Optimization
- Specialized Azure task routing
- Multi-runtime backend mapping

## Scope and Identity

Use cloud, tenant, subscription, and resource group consciously. Verify context before writes:

```bash
az login
az account list --output table
az account set --subscription "<subscription-id-or-name>"
az account show
az config set core.only_show_errors=true
```

For automation, prefer service principals with federated credentials or managed identity:

```bash
az login --identity
```

## Command Habits

- Read first with `az graph query`, `az resource list`, or service-specific `show` and `list`.
- Use `--subscription`, `--resource-group`, `--query`, and `-o table|json|tsv`.
- Discover commands with `az find` and `--help`.
- Use `az deployment ... what-if` before ARM or Bicep writes.
- Use `az init` and `az config` to keep defaults explicit.
- Use `az extension` or dynamic extension install when a command group is not present.
- Use `az rest` or `az resource` only when a first-class command group is missing.

## Discovery and Inventory

### Core Inventory

```bash
az graph query -q "Resources | summarize count() by type | order by count_ desc"
az group list -o table
az resource list -o table
az containerapp list -o table
az postgres flexible-server list -o table
az acr list -o table
az monitor activity-log list --max-events 20
az role assignment list --scope /subscriptions/<sub-id>
az policy assignment list
```

### Resource Graph

Use Resource Graph early for estate-wide inventory:

```bash
az graph query -q "Resources | project name, type, location, resourceGroup | limit 20"
```

## Deploy and Provision

### Default Managed Mapping

- registry: ACR
- runtime: Azure Container Apps
- data: Azure Database for PostgreSQL Flexible Server
- cache: Azure Cache for Redis
- storage: Blob Storage
- secrets: Key Vault

### Bicep or ARM Workflow

```bash
az deployment group what-if \
  --resource-group my-rg \
  --template-file main.bicep
az deployment group create \
  --resource-group my-rg \
  --template-file main.bicep
```

### Container Runtime Rollout

```bash
az acr build --registry myacr --image my-app:sha-123 .
az containerapp update \
  --resource-group my-rg \
  --name my-app \
  --image myacr.azurecr.io/my-app:sha-123
az containerapp show --resource-group my-rg --name my-app
```

### Logs

```bash
az containerapp logs show --resource-group my-rg --name my-app --follow
```

### Identity and Secret Setup

- use Key Vault references or managed identity for secret access
- keep deployment identity separate from runtime identity
- put DNS, ingress, and private endpoint changes behind explicit approval

## Automatic Deployments

Preferred pattern:

- CI uses federated credentials or a service principal
- CI builds into ACR
- CI deploys infra via `az deployment ...`
- CI rolls out the app via `az containerapp update`

Useful command surfaces:

- `az ad app` and related identity commands when federation must be created
- `az role assignment create` for least-privilege deploy identity
- `az containerapp update`
- `az monitor activity-log list`

## Troubleshooting

### Deployment and Runtime

```bash
az monitor activity-log list --max-events 20
az containerapp revision list --resource-group my-rg --name my-app -o table
az containerapp logs show --resource-group my-rg --name my-app
az resource show --ids <resource-id>
```

### Data and Network

```bash
az postgres flexible-server show --resource-group my-rg --name my-db
az network private-dns zone list -o table
az network public-ip list -o table
```

Common failure classes:

- wrong subscription or resource group
- missing CLI extension or resource provider registration
- broken managed identity or role assignment
- Container Apps revision is unhealthy or points to the wrong image
- Key Vault or private DNS wiring is incomplete

## Optimization

- use `az advisor recommendation list` as a starting point
- right-size Container Apps resources and scale rules from actual load
- review PostgreSQL Flexible Server sizing, HA, and storage tiers
- review Redis SKU and always-on non-prod caches
- clean up unused public IPs, NAT, gateways, and stale revisions
- keep Key Vault references and managed identity wiring consistent instead of duplicating secrets

## Specialized Azure Task Routing

Load the narrower reference before going deep on Azure-specific work:

- architecture diagrams and dependency maps: [azure-resource-visualization.md](./azure-resource-visualization.md)
- live diagnostics, Monitor queries, Container Apps or Functions triage: [azure-diagnostics-guide.md](./azure-diagnostics-guide.md)
- cost and savings analysis: [azure-cost-optimization-guide.md](./azure-cost-optimization-guide.md)
- storage tiers, blob or file operations, and data movement: [azure-storage-guide.md](./azure-storage-guide.md)
- VM or VMSS sizing, pricing, connectivity, and reservations: [azure-compute-guide.md](./azure-compute-guide.md)
- plan, tier, or SKU upgrades inside Azure: [azure-upgrade-guide.md](./azure-upgrade-guide.md)
- compliance posture, azqr, and Key Vault expiration scans: [azure-compliance-guide.md](./azure-compliance-guide.md)
- Entra app registration and OAuth wiring: [azure-entra-app-registration.md](./azure-entra-app-registration.md)
- Foundry projects, model quotas, agent deploys, and evaluation loops: [azure-foundry-guide.md](./azure-foundry-guide.md)

## Multi-Runtime Backend Mapping

- `web`: Azure Container App with ingress
- `worker`: Azure Container App without ingress
- `socket`: Azure Container App with websocket-compatible ingress
- `db`: Azure Database for PostgreSQL Flexible Server
- `cache`: Azure Cache for Redis
- `files`: Blob Storage
- `secrets`: Key Vault
- `events`: Event Grid or Service Bus
- `admin`: keep dashboards and internal control-plane surfaces private unless the user explicitly wants public exposure
