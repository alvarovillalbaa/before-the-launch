# Azure Compliance Guide

Use this when the task is Azure compliance posture, best-practice scanning, Key Vault expiration auditing, or discovery of misconfigured resources.

## Primary Uses

- broad compliance review with Azure Quick Review
- Key Vault secret, key, and certificate expiration checks
- policy posture and misconfiguration discovery
- orphaned or suspicious resource review through Resource Graph

## Preconditions

```bash
az account show
az policy assignment list -o table
```

If `azqr` is installed, use it for broad assessments:

```bash
azqr version
```

## Assessment Order

1. Confirm scope: subscription, resource group, or vault.
2. Run the broadest read-only scan first.
3. Triage findings into critical, high, medium, and low.
4. Pull service-specific evidence before recommending remediation.
5. Ask before changing policy assignments, secrets, certificates, or network posture.

## Useful Commands

```bash
az policy assignment list -o table
az policy state list --query "[].{resource:resourceId, state:complianceState}" -o table
az graph query -q "Resources | project name, type, resourceGroup, location"
az keyvault secret list --vault-name <vault> -o table
az keyvault certificate list --vault-name <vault> -o table
az keyvault key list --vault-name <vault> -o table
```

For Key Vault expiration reviews, check:

- items already expired
- items expiring soon
- items missing expiration dates

## Reporting Pattern

Return:

- scope analyzed
- commands and tools used
- prioritized findings
- remediation suggestions
- which remediations need approval or owner validation
