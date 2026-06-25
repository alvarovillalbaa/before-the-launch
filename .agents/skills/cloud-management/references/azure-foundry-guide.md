# Azure Foundry Guide

Use this when the task is Azure AI Foundry or Microsoft Foundry setup, agent deployment, model quota, retrieval, evaluation, or agent troubleshooting.

## Foundry Operating Model

Treat Foundry work as a lifecycle, not a single command:

1. Discover project, resource, model, and runtime scope.
2. Confirm quota, RBAC, and model availability.
3. Build or package the agent runtime.
4. Deploy or update the agent.
5. Invoke and verify.
6. Evaluate, trace, and improve.

If `.foundry/agent-metadata.yaml` exists in the repo, treat it as the source of truth for names, targets, datasets, and evaluation posture.

## Pre-Checks

Verify:

- Azure subscription, tenant, and region
- Foundry project or AI Services resource
- model availability and quota
- ACR, runtime target, and deployment identity
- telemetry surface such as App Insights or equivalent tracing

Useful commands:

```bash
az account show
az extension list -o table
az acr list -o table
az cognitiveservices account list -o table
az resource list --resource-type Microsoft.MachineLearningServices/workspaces -o table
```

## Typical Task Routing

- create project or resource: provisioning workflow
- deploy or redeploy agent code: build, push, deploy, verify
- invoke or test agent: runtime verification workflow
- quota or model-capacity issue: quota and regional availability workflow
- prompt quality or regression review: evaluation and trace workflow
- RBAC or identity issue: managed identity, service principal, or role workflow

## Practical Rules

- keep model deployment, retrieval layer, and runtime identity aligned unless the user explicitly wants a split design
- ask before new model deployments, major quota changes, or external knowledge-source hookups
- keep evaluation artifacts and datasets versioned when the repo already does this
- if the repo already uses `azd`, Bicep, or Terraform for Foundry-related infra, reuse it instead of inventing a parallel deploy path
