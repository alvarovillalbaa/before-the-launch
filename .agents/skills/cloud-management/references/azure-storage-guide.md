# Azure Storage Guide

Use this when the task is Azure Blob Storage, File Shares, Queue Storage, Table Storage, or Data Lake operations.

## Pick the Right Service

| Service | Use For | Typical CLI |
| --- | --- | --- |
| Blob Storage | objects, backups, static content, app uploads | `az storage blob` |
| File Shares | SMB file shares, lift-and-shift workloads | `az storage file` |
| Queue Storage | lightweight async work queues | `az storage queue` |
| Table Storage | simple key-value NoSQL data | `az storage table` |
| Data Lake | analytics workloads with hierarchical namespace | `az storage fs` |

## Operating Rules

- Prefer Azure AD auth over account keys: use `--auth-mode login` when possible.
- Confirm account, subscription, region, and target container or share before writes.
- Ask before deleting data, rotating replication posture, or changing access tiers on large datasets.
- For app-facing storage, keep secret handling in Key Vault or managed identity rather than embedding connection strings.

## Common Commands

```bash
az storage account list -o table
az storage container list --account-name <account> --auth-mode login -o table
az storage blob list --account-name <account> --container-name <container> --auth-mode login -o table
az storage blob download --account-name <account> --container-name <container> --name <blob> --file <local-path> --auth-mode login
az storage blob upload --account-name <account> --container-name <container> --name <blob> --file <local-path> --auth-mode login
```

Other service surfaces:

```bash
az storage file list --share-name <share> --account-name <account> --auth-mode login
az storage queue list --account-name <account> --auth-mode login
az storage table list --account-name <account> --auth-mode login
az storage fs list --account-name <account> --auth-mode login
```

## Tier and Redundancy Heuristics

Storage account tiers:

- Standard: default for most app and backup workloads
- Premium: use only for latency or IOPS-sensitive paths

Blob access tiers:

- Hot: frequent access
- Cool: infrequent access, at least 30 days
- Cold: rarer access, at least 90 days
- Archive: long retention with rehydration delay

Replication posture:

- LRS or ZRS for lower-cost local resilience
- GRS or GZRS only when cross-region durability is justified

Do not recommend a lower tier or weaker replication posture without checking recovery, compliance, and latency expectations.
