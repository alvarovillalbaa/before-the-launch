# Cloud Management

CLI-first cloud operations skill for AWS, Azure, and GCP.

## Use this for

- identifying which cloud estate a repo actually uses
- designing AWS, Azure, or GCP target architectures before provisioning
- deploying services or wiring CI/CD from the terminal
- inventory, optimization, and incident remediation
- cloud changes that need explicit approval gates and rollback thinking

## Install

```bash
npx -y skills add ./engineering/skills/cloud-management
mkdir -p ~/.codex/skills
cp -R engineering/skills/cloud-management ~/.codex/skills/
```

Codex `$skill-installer` path:

```text
https://github.com/alvarovillalbaa/plugins/tree/main/engineering/skills/cloud-management
```

## What is bundled

- `references/`
- `scripts/`

AWS deep-dive references:

- `references/aws-amplify-guide.md` — Amplify full-stack (auth, data, storage, functions, hosting, Gen 2)
- `references/aws-serverless-guide.md` — Lambda, API Gateway, Step Functions, EventBridge, SAM, CDK
- `references/aws-databases-guide.md` — RDS, Aurora, Aurora DSQL, DynamoDB, ElastiCache, connection management

Notable Azure-specific references:

- `references/azure-diagnostics-guide.md`
- `references/azure-resource-visualization.md`
- `references/azure-cost-optimization-guide.md`
- `references/azure-storage-guide.md`
- `references/azure-compute-guide.md`
- `references/azure-upgrade-guide.md`
- `references/azure-compliance-guide.md`
- `references/azure-entra-app-registration.md`
- `references/azure-foundry-guide.md`

Cross-cloud architecture references:

- `references/cloud-architecture-patterns.md`
- `references/service-selection-matrix.md`

Notable architecture tooling:

- `scripts/architecture_designer.py`
