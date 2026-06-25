# AWS Amplify Guide

Use this when the task involves building or operating a full-stack application with AWS Amplify — authentication, data models, storage, Lambda functions, or Amplify Hosting deployments.

## When Amplify Is the Right Choice

Choose Amplify when:
- The team is frontend-first and wants a managed path to AWS backends without direct CloudFormation or Terraform ownership.
- The workload fits the Amplify service boundary: auth, data (AppSync/DynamoDB), storage (S3), and functions (Lambda).
- Supported frontend: React, Next.js, Vue, Angular, React Native, Flutter, Swift, or Android.

Graduate out of Amplify toward direct AWS services when:
- The data model needs relational joins, transactions across multiple tables, or Aurora Postgres.
- The backend needs custom VPC, private networking, or multi-service orchestration beyond what Amplify manages.
- The team already owns Terraform or CDK and wants unified IaC.
- The workload needs ECS, SQS, Step Functions, or other services not in Amplify's managed surface.

## CLI Setup and Scope Verification

```bash
npm install -g @aws-amplify/cli
amplify configure
amplify whoami
```

Verify the AWS profile and region in use before any write:

```bash
aws sts get-caller-identity --profile my-dev
amplify env list
amplify status
```

## Project Initialization

```bash
amplify init
```

Prompts: project name, environment name (dev, staging, prod), default editor, app type, framework, source/dist/build paths, start command, and AWS profile.

For an existing Amplify project:

```bash
amplify pull --appId <app-id> --envName dev
```

## Environments

Amplify environments map to isolated cloud backends. Treat `dev` as sandbox, not a shared state.

```bash
amplify env add staging
amplify env checkout staging
amplify env list
```

Use `amplify sandbox` (Gen 2) for fully disposable personal dev environments:

```bash
npx ampx sandbox
npx ampx sandbox delete
```

## Authentication

Add Cognito-backed auth:

```bash
amplify add auth
amplify push
```

Default choices: User Pool with email sign-in. Choose "Manual configuration" to add MFA, custom attributes, or social providers.

Key decisions:
- Email vs phone vs username sign-in. Lock this in early; it is hard to change.
- Hosted UI vs custom UI.
- Social providers require an app registration per provider (Facebook, Google, Apple).
- MFA: TOTP or SMS. SMS adds cost; TOTP is preferred.

Do not use Amplify Auth alongside a separately managed Cognito pool in the same app unless the user owns and understands the pool manually.

## Data (AppSync + DynamoDB)

```bash
amplify add api
# choose GraphQL, then Amazon Cognito User Pool for auth
amplify push
```

Schema lives in `amplify/backend/api/<name>/schema.graphql`. Amplify codegen generates typed queries, mutations, and subscriptions.

```bash
amplify codegen
```

Key decisions:
- Model queries before the schema. DynamoDB access patterns are hard to change.
- Use `@hasMany`, `@belongsTo`, `@manyToMany` relationships only when the access pattern requires joins at the AppSync layer.
- Add `@auth` directives to every type or field that needs ownership or group-based access control.
- Use `@index` to add GSIs for non-primary-key access patterns.

Limitations:
- AppSync+DynamoDB does not support relational joins or multi-table transactions. Use RDS (via custom resolvers or direct Lambda) when the model needs them.
- Large payloads over AppSync subscriptions are expensive. Use S3 pre-signed URLs for file content.

## Storage

```bash
amplify add storage
amplify push
```

Amplify provisions an S3 bucket with IAM policies scoped to authenticated and guest users. Use `@predictions` or Lambda triggers when files need server-side processing.

Approval-worthy: changing access levels from private to protected or public on existing buckets.

## Lambda Functions

```bash
amplify add function
amplify push
```

Functions are Node.js or Python by default. Amplify wires the Lambda execution role to Amplify-provisioned resources automatically.

For custom runtimes or complex packaging, prefer direct Lambda deployment outside Amplify or use CDK with `NodejsFunction` or `PythonFunction` constructs alongside Amplify.

```bash
amplify function invoke <function-name>   # local invoke
```

## Deployment

### Sandbox (Gen 2)

```bash
npx ampx sandbox
```

Deploys a personal ephemeral backend. Clean up with `npx ampx sandbox delete`.

### Shared Environments

```bash
amplify push --yes          # deploy current environment
amplify publish             # deploy + build and publish frontend via Amplify Hosting
```

### Amplify Hosting CI/CD

Amplify Hosting has a built-in CI/CD service triggered by git pushes. Prefer this for frontend + Amplify-backend projects. Set up in the Amplify Console or via:

```bash
amplify add hosting
# choose "Amplify Console" for CI/CD or "Amazon CloudFront and S3" for manual
```

For projects already using GitHub Actions or another CI system, export Amplify backend outputs and handle frontend builds separately.

### Amplify Gen 2 (CDK-based)

Amplify Gen 2 uses CDK under the hood. The `amplify/` directory contains TypeScript backend definitions. Existing CDK constructs can be added alongside Amplify's managed resources:

```typescript
// amplify/backend.ts
import { defineBackend } from '@aws-amplify/backend';
import { auth } from './auth/resource';
import { data } from './data/resource';

export const backend = defineBackend({ auth, data });
```

Use `backend.addOutput(...)` to expose custom resource outputs to the frontend config.

## Inspecting Amplify State

```bash
amplify status              # show category status vs deployed state
amplify env get --name dev  # show env metadata including stack name
amplify console             # open Amplify Console for the current app
```

Underlying CloudFormation stacks follow the pattern `amplify-<app>-<env>-<random>`:

```bash
aws cloudformation list-stacks --profile my-dev \
  --query "StackSummaries[?starts_with(StackName, 'amplify-')].[StackName,StackStatus]" \
  --output table
```

## Troubleshooting

Common failure classes:
- `amplify push` fails due to IAM permission mismatch → verify the CLI user or role has `CloudFormation:*`, `IAM:*`, `AppSync:*`, `DynamoDB:*`, `Cognito:*`, and `Lambda:*` in the environment.
- Schema deployment fails on `@auth` missing → every type that has user data must have an `@auth` directive.
- Frontend cannot call AppSync → check `amplifyconfiguration.json` is bundled and the `Amplify.configure(...)` call fires before any data access.
- Auth redirect loop → verify redirect URIs match exactly including trailing slashes.

## Approval Gates

Request explicit approval before:
- Changing auth configuration on a production User Pool (email/username change is destructive).
- Changing `@auth` rules on types already holding customer data.
- Running `amplify delete` or `amplify env remove` on shared environments.
- Switching Amplify Hosting branch mappings that affect production traffic.
