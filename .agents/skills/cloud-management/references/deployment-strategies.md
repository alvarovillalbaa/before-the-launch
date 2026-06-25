# Deployment Strategies

## Strategy Selection Matrix

| Strategy | When to Use | Rollback Speed | Risk | Zero Downtime |
|----------|-------------|---------------|------|---------------|
| Rolling | Standard stateless services, gradual risk reduction | Medium | Low-Medium | Yes |
| Blue/Green | Critical services, instant rollback required | Instant | Low | Yes |
| Canary | Large user bases, measure before committing | Instant | Lowest | Yes |
| Recreate | Stateful single-instance, non-critical dev environments | Slow | High | No |

Default to **rolling** for managed containers. Use **blue/green** when instant rollback is a hard requirement. Use **canary** when a behavioral change needs real-traffic validation before full rollout. Use **recreate** only for dev/staging non-HA workloads.

---

## Rolling Deployment

Replace instances gradually. The provider replaces old tasks/pods/containers in batches while keeping a fraction running at all times.

### Provider Commands

**AWS ECS:**
```bash
# Default is rolling (ECS manages minimum healthy percent)
aws ecs update-service \
  --cluster <cluster> \
  --service <service> \
  --force-new-deployment \
  --region <region>

aws ecs wait services-stable \
  --cluster <cluster> \
  --services <service>
```

**Azure Container Apps:**
```bash
az containerapp update \
  --name <app> \
  --resource-group <rg> \
  --image <registry>/<image>:<tag>

# Watch revision health
az containerapp revision list \
  --name <app> \
  --resource-group <rg> \
  --query "[].{name:name,active:properties.active,replicas:properties.replicas,healthState:properties.healthState}" \
  --output table
```

**GCP Cloud Run:**
```bash
# Deploy new revision — Cloud Run rolls traffic gradually by default
gcloud run deploy <service> \
  --image <region>-docker.pkg.dev/<project>/<repo>/<image>:<tag> \
  --region <region> \
  --platform managed
```

**Kubernetes:**
```bash
kubectl set image deployment/<name> <container>=<image>:<tag>
kubectl rollout status deployment/<name>
kubectl rollout history deployment/<name>
```

### Health Gate
Wait for the provider's health signal (service stable, revision healthy, rollout complete) before declaring success. Tail logs during the rollout window.

### Rollback
```bash
# ECS: redeploy the previous task definition revision
aws ecs update-service --cluster <c> --service <s> --task-definition <family>:<prev-rev>

# Azure Container Apps: activate the previous revision
az containerapp revision activate --revision <prev-revision-name> --name <app> --resource-group <rg>

# GCP Cloud Run: migrate traffic to a prior revision
gcloud run services update-traffic <service> --to-revisions=<prev-revision>=100 --region <region>

# Kubernetes
kubectl rollout undo deployment/<name>
```

---

## Blue/Green Deployment

Run two identical environments (blue = current, green = new). Switch traffic at the load balancer or DNS level after green is verified.

### Provider Approaches

**AWS (ALB target groups):**
```bash
# 1. Create green task definition
aws ecs register-task-definition --cli-input-json file://green-task-def.json

# 2. Update service to use green task def (behind the scenes — do NOT switch ALB yet)
aws ecs update-service --cluster <c> --service <s-green> --task-definition <family>:green-rev

# 3. Wait for green service to be stable
aws ecs wait services-stable --cluster <c> --services <s-green>

# 4. Verify green directly (internal health endpoint or test ALB rule)
curl http://<green-target-internal>/health

# 5. Switch ALB listener rule to forward to green target group
aws elbv2 modify-listener \
  --listener-arn <arn> \
  --default-actions Type=forward,TargetGroupArn=<green-tg-arn>

# Rollback: flip listener back to blue target group
aws elbv2 modify-listener \
  --listener-arn <arn> \
  --default-actions Type=forward,TargetGroupArn=<blue-tg-arn>
```

**Azure Container Apps (revisions with traffic weights):**
```bash
# Deploy new revision without sending it traffic yet
az containerapp update \
  --name <app> \
  --resource-group <rg> \
  --image <image>:<green-tag> \
  --revision-suffix green

# After verification, switch 100% traffic to green
az containerapp ingress traffic set \
  --name <app> \
  --resource-group <rg> \
  --revision-weight <app>--green=100

# Rollback: shift traffic back to blue
az containerapp ingress traffic set \
  --name <app> \
  --resource-group <rg> \
  --revision-weight <app>--blue=100
```

**GCP Cloud Run (traffic splits):**
```bash
# Deploy green revision without traffic
gcloud run deploy <service> \
  --image <image>:<green-tag> \
  --no-traffic \
  --tag green \
  --region <region>

# Verify via tagged URL (green---<service>-<hash>-<region>.run.app)
curl https://green---<service>-<hash>-<region>.run.app/health

# Shift traffic to green
gcloud run services update-traffic <service> \
  --to-tags green=100 \
  --region <region>

# Rollback
gcloud run services update-traffic <service> \
  --to-tags blue=100 \
  --region <region>
```

### Health Gate Before Traffic Switch
Always verify the new revision/environment against an internal or test-only path before switching production traffic. Minimum gates:
- `/health` or equivalent returns 200
- Smoke test on a key user-facing path
- No elevated error rate in logs during the soak period

---

## Canary Deployment

Send a small slice of traffic (1–10%) to the new version. Monitor metrics, then gradually shift more traffic until 100% or roll back.

### Traffic Split Pattern

**GCP Cloud Run:**
```bash
# Deploy canary without traffic
gcloud run deploy <service> \
  --image <image>:<canary-tag> \
  --no-traffic \
  --tag canary \
  --region <region>

# Send 5% to canary
gcloud run services update-traffic <service> \
  --to-tags canary=5,stable=95 \
  --region <region>

# Ramp to 50%, then 100%
gcloud run services update-traffic <service> \
  --to-tags canary=50,stable=50 \
  --region <region>

gcloud run services update-traffic <service> \
  --to-tags canary=100 \
  --region <region>
```

**Kubernetes (with Argo Rollouts or native):**
```bash
# Native: scale up canary deployment alongside stable
kubectl scale deployment <app>-canary --replicas=1   # 1 of 11 = ~9%
# After soak period
kubectl scale deployment <app>-canary --replicas=5   # ramp up
# After full validation
kubectl scale deployment <app>-stable --replicas=0   # drain stable
kubectl scale deployment <app>-canary --replicas=10  # canary becomes stable
```

### Canary Monitoring Gates
- Error rate below baseline threshold (e.g., < 0.1% increase)
- P99 latency within acceptable range
- No new log error patterns
- Business metric parity (conversion, throughput)

Automate these checks before each traffic ramp step. Roll back immediately if any gate fails.

---

## Recreate Deployment

Stop all old instances, then start new instances. Causes downtime. Only appropriate for:
- Single-instance dev/staging environments
- Services that cannot run two versions concurrently (schema-incompatible migrations, exclusive resource locks)
- Non-HA internal tools where a brief maintenance window is acceptable

```bash
# ECS: set desired count to 0, update task def, restore desired count
aws ecs update-service --cluster <c> --service <s> --desired-count 0
aws ecs wait services-stable --cluster <c> --services <s>
aws ecs update-service --cluster <c> --service <s> \
  --task-definition <family>:<new-rev> --desired-count <original>

# Kubernetes
kubectl delete deployment <name>
kubectl apply -f deployment.yaml
```

---

## IaC Tool Selection

| Tool | When to Use |
|------|-------------|
| Terraform / OpenTofu | Default for new projects and multi-cloud estates. Widest provider support; plan/apply separation. |
| Pulumi | Teams that prefer TypeScript, Python, or Go over HCL. Same plan/apply discipline, richer loop constructs. |
| Bicep / ARM | Azure-only, Azure-native feature parity. Only when committing to Azure exclusively and needing features Terraform cannot yet replicate. |
| CloudFormation / CDK | AWS-only, AWS-native parity. Only when fully committed to AWS and needing features Terraform cannot yet replicate. |
| Helm | Kubernetes-only configuration management. Use alongside Terraform for infra but not as an IaC replacement. |

**Default rule:** Use Terraform/OpenTofu unless the team is 100% committed to a single cloud AND that cloud-native tool offers a feature Terraform cannot replicate. Extend the existing IaC path before introducing a second tool.

---

## Deployment Checklist (Pre-Cutover)

Before switching traffic in any strategy:

- [ ] New artifact builds without error, pushed with immutable tag or digest
- [ ] Migrations (if any) completed successfully in a one-off job, not startup
- [ ] Background workers and queue consumers running at target revision
- [ ] `/health` or equivalent returns 200 on new revision/environment
- [ ] Smoke test on critical user-facing path passed
- [ ] Previous artifact reference and rollback command recorded
- [ ] Rollback posture confirmed: route traffic back (blue/green), rollout undo (Kubernetes), prior revision (ECS/Cloud Run/Container Apps)
- [ ] For data migrations: forward-fix-only rollback acknowledged and communicated
