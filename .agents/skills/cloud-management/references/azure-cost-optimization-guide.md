# Azure Cost Optimization Guide

Use this when the task is Azure cost reduction, savings analysis, rightsizing, orphan cleanup, or a subscription-level optimization report.

## Preconditions

Verify the operator has the right permissions and tools:

```bash
az account show
az extension show --name costmanagement
az extension show --name resource-graph
az advisor recommendation list --refresh --output table
```

If `azqr` is installed, use it as a broad posture scan:

```bash
azqr version
```

Typical required roles:

- Reader
- Monitoring Reader
- Cost Management Reader

## Analysis Order

1. Confirm scope: subscription, management group, or resource group.
2. Query actual cost first.
3. Inventory obvious waste with Resource Graph and Advisor.
4. Pull utilization evidence before rightsizing.
5. Prioritize recommendations by savings, risk, and reversibility.
6. Ask before deleting resources, changing SKUs, or altering redundancy.

## Cost and Waste Queries

Start with a broad inventory:

```bash
az graph query -q "Resources | summarize count() by type | order by count_ desc"
az advisor recommendation list --category Cost -o table
```

Look for common waste:

```bash
az graph query -q "Resources | where type =~ 'microsoft.compute/disks' | where properties.diskState =~ 'Unattached' | project name, resourceGroup, location"
az graph query -q "Resources | where type =~ 'microsoft.network/publicipaddresses' | project name, resourceGroup, location, sku=tostring(sku.name)"
az graph query -q "Resources | where type =~ 'microsoft.network/networkinterfaces' | where isnull(properties.virtualMachine) | project name, resourceGroup"
```

If you need actual billed cost and the CLI surface is limited, use `az rest` against Cost Management rather than estimating.

## Utilization Checks

Use Azure Monitor or service-specific metrics before resizing:

```bash
az monitor metrics list --resource <resource-id> --metric "CpuPercentage"
az monitor metrics list --resource <resource-id> --metric "Requests"
```

For Azure-hosted databases and caches, inspect SKU, HA, and storage posture before recommending changes.

## Recommendation Patterns

Prioritize:

- unattached disks, orphan NICs, idle public IPs, stale gateways
- non-prod always-on capacity
- oversized databases, caches, and VM families
- excessive ingress, NAT, egress, or replication posture
- stale Container Apps revisions or unused ACR content

## Reporting

A useful report should include:

- current scope and analysis window
- top cost drivers
- evidence used for each recommendation
- estimated savings range
- exact implementation commands or IaC change points
- approval flags for destructive or stateful actions

Keep raw cost-query output or command transcripts when the user wants an audit trail.
