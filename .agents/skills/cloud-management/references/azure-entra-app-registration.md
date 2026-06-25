# Azure Entra App Registration Guide

Use this when the task is Microsoft Entra ID app registration, OAuth configuration, API permissions, service principals, or MSAL integration planning.

## Collect Before Changing Anything

- application type: web, SPA, native, daemon, API
- tenant and supported account types
- redirect URIs or reply URLs
- required API permissions and whether admin consent is needed
- credential choice: managed identity, certificate, or client secret

If the repo already manages identity in Terraform or Bicep, prefer extending that path instead of hand-creating registrations.

## Core CLI Flow

```bash
az ad app create --display-name "<name>"
az ad sp create --id <app-id>
az ad app credential reset --id <app-id>
az ad app permission add --id <app-id> --api <api-app-id> --api-permissions <permission-id>=Role
az ad app permission grant --id <app-id> --api <api-app-id>
```

Use CLI or IaC to:

- create the app registration
- create the service principal
- add redirect URIs and platform settings
- configure API permissions
- issue a certificate or secret only when managed identity is not an option

## Security Rules

- never hardcode secrets
- prefer managed identity for Azure-hosted workloads
- prefer certificates over long-lived secrets for confidential clients
- request least-privilege permissions
- track tenant ID, client ID, redirect URIs, and consent requirements in repo-owned config

## Approval Boundaries

Ask before:

- creating or rotating production credentials
- granting admin-consent permissions
- changing redirect URIs for shared or live applications
- introducing multi-tenant auth or broader account-type exposure
