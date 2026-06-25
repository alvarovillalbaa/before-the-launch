# Azure Resource Visualization

Use this when the user wants to understand how an Azure resource group fits together, needs an architecture diagram, or wants a dependency map before a change or incident review.

## Workflow

1. Identify the target resource group. If it is not obvious, ask for it.
2. Inventory every resource in the group.
3. Pull deeper configuration only for resources that participate in network, data, identity, or ingress relationships.
4. Map relationships and external dependencies.
5. Produce a Mermaid diagram plus a short markdown inventory.

## Discovery Commands

```bash
az group list -o table
az resource list -g <rg> -o table
az graph query -q "Resources | where resourceGroup =~ '<rg>' | project name, type, location, id"
```

Then fetch only the relationship-heavy resources:

```bash
az network vnet show -g <rg> -n <vnet-name>
az network private-endpoint list -g <rg> -o table
az containerapp show -g <rg> -n <app>
az keyvault show -g <rg> -n <vault>
az postgres flexible-server show -g <rg> -n <server>
```

## Grouping Pattern

Use logical layers rather than provider type order:

- Network
- Compute
- Data
- Security and Identity
- Monitoring and Operations

Call out:

- public ingress versus private-only resources
- managed identities and secret dependencies
- app-to-database and app-to-storage paths
- external resources in other groups, subscriptions, or providers

## Output Shape

Create a markdown file under `docs/` if it exists, otherwise at repo root:

- filename: `<resource-group>-architecture.md`
- include a resource inventory table
- include a `mermaid` code block
- include assumptions and unverified external dependencies

## Mermaid Rules

- Prefer `graph LR` for wide service topologies and `graph TB` for stacked environments.
- Use descriptive labels on edges, not generic arrows.
- Include SKU or tier only when it affects architecture or cost.
- If the group is large, split diagrams by layer instead of emitting one unreadable graph.

## Boundaries

- This is read-only analysis.
- Do not invent relationships you did not verify.
- Do not skip “boring” resources like DNS zones, identity objects, or monitoring workspaces when they affect the topology.
