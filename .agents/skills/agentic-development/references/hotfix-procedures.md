# Hotfix Procedures

Emergency release management for critical production issues that cannot wait for the regular release cycle. Use when the user reports a production incident, asks about hotfix workflow, or needs to deploy a fix outside the normal process.

---

## Severity Classification

### P0 — Critical (Production Down)

**Definition:** Complete system outage, data corruption, or active security breach affecting all users.

**Examples:** Server crashes preventing all access, database corruption, security vulnerability under active exploit, authentication failure.

**SLA:** Fix deployed within **2 hours**

**Approval:** Engineering Lead + On-call Manager (verbal acceptable)

**Process:** Emergency deployment bypassing normal gates

**Post-incident:** Review required within 24 hours

**Escalation:**
- Page on-call engineer immediately
- Escalate to Engineering Lead within 15 minutes
- Notify CTO if resolution exceeds 4 hours

---

### P1 — High (Major Feature Broken)

**Definition:** Critical functionality broken affecting a significant portion of users.

**Examples:** Core user workflow broken, payment processing failures >50%, API returning 500s on main endpoints, mobile app crashes on startup.

**SLA:** Fix deployed within **24 hours**

**Approval:** Engineering Lead + Product Manager

**Process:** Expedited review and testing

**Post-incident:** Root cause analysis within 48 hours

**Escalation:**
- Notify on-call engineer within 30 minutes
- Escalate to Engineering Lead within 2 hours
- Daily updates to Product/Business stakeholders

---

### P2 — Medium (Minor Issues)

**Definition:** Non-critical functionality issues with limited user impact.

**Examples:** Cosmetic UI issues, non-essential features broken, minor performance degradation, analytics inaccuracies.

**SLA:** Include in **next regular release**

**Approval:** Standard PR review

**Process:** Normal development and testing cycle

---

## Hotfix Workflows

### Git Flow

```bash
# 1. Branch from main (not develop)
git checkout main && git pull origin main
git checkout -b hotfix/security-patch

# 2. Implement minimal fix + tests
git add . && git commit -m "fix: resolve SQL injection vulnerability"

# 3. Version bump (patch increment)
echo "1.2.4" > VERSION
git commit -am "chore: bump version to 1.2.4"

# 4. Run test suite
npm test && npm audit

# 5. Deploy to staging for validation
git push origin hotfix/security-patch
# Trigger staging deployment via CI/CD, validate

# 6. Merge to main and tag
git checkout main
git merge --no-ff hotfix/security-patch
git tag -a v1.2.4 -m "Hotfix: Security vulnerability patch"
git push origin main --tags

# 7. Merge back to develop (CRITICAL — do not skip)
git checkout develop
git merge --no-ff hotfix/security-patch
git push origin develop

# 8. Clean up
git branch -d hotfix/security-patch
git push origin --delete hotfix/security-patch
```

---

### GitHub Flow

```bash
# 1. Branch from main
git checkout main && git pull origin main
git checkout -b hotfix/payment-gateway-fix

# 2. Fix and push
git commit -m "fix(payment): resolve gateway timeout issue"
git push origin hotfix/payment-gateway-fix

# 3. Emergency PR
gh pr create --title "HOTFIX: Payment gateway timeout" \
             --body "Critical fix for payment processing failures" \
             --reviewer engineering-team \
             --label hotfix

# 4. Deploy branch to staging
./deploy.sh hotfix/payment-gateway-fix staging
# Run smoke tests

# 5. Merge (after approval)
gh pr merge --squash
# Automatic deployment to production via CI/CD
```

---

### Trunk-based

```bash
# Small fixes: commit directly to main
git checkout main && git pull origin main
git commit -m "fix: resolve memory leak in user session handling"
git push origin main
# Automatic deployment triggers

# Feature-related issues: disable via feature flag
curl -X POST api/feature-flags/new-search/disable
# Verify issue resolved, then plan a proper fix for the next deployment
```

---

## Emergency Response Phases

| Phase | Duration | Actions |
|-------|----------|---------|
| Detection | 0–5 min | Monitor alert fires or user report arrives; assess severity |
| Team Assembly | 5–10 min | Page on-call engineer; open incident channel |
| Investigation | 10–30 min | Create incident ticket; identify root cause; apply mitigations |
| Fix Development | 30 min–2 h | Hotfix branch; minimal targeted fix; tests |
| Deployment | 15–30 min | Staging validation; production deploy |
| Verification | 15–30 min | Confirm resolution; update stakeholders; close incident |

---

## Communication Templates

### P0 Initial Alert
```
🚨 CRITICAL INCIDENT — Production Down

Status: Investigating
Impact: Complete service outage / [specific scope]
Affected Users: All users / [percentage]
Started: [UTC timestamp]
Incident Commander: @[name]

Current Actions:
- Investigating root cause
- Preparing emergency fix
- Updates every 15 minutes

Status Page: [url]
Incident Channel: #incident-[id]
```

### P0 Resolution Notice
```
✅ RESOLVED — Production Restored

Status: Resolved
Resolution Time: [duration]
Root Cause: [brief explanation]
Fix: [what was done]

Timeline:
[HH:MM UTC] – Issue detected
[HH:MM UTC] – Root cause identified
[HH:MM UTC] – Fix deployed
[HH:MM UTC] – Full functionality restored

Post-incident review: [date/time]
```

### P1 Status Update
```
⚠️ Issue Update — [Feature Name]

Status: Fix deployed, monitoring
Impact: [metric] reduced from [X]% to <[Y]%
ETA: Complete resolution within [N] hours

Actions taken:
- [action 1]
- [action 2]

Next update in 30 minutes or when resolved.
```

---

## Rollback Procedures

### When to Rollback
- Fix does not resolve the issue
- Fix introduces new problems
- System stability is compromised
- Data corruption is detected

### Rollback Execution

```bash
# Option 1: Git revert (preferred — keeps history clean)
git checkout main
git revert HEAD
git push origin main

# Option 2: Container rollback
kubectl rollout undo deployment/app

# Option 3: Load balancer switch
aws elbv2 modify-target-group \
  --target-group-arn [previous-version-arn]
```

### Confirm Rollback
```bash
curl -f https://api.yourapp.com/health
kubectl logs deployment/app --tail=100
# Check key error metrics
```

### Rollback Communication
```
🔄 ROLLBACK COMPLETE

The hotfix has been rolled back due to [reason].
System is now stable on previous version.
Investigating the issue — updates to follow.
```

---

## Testing Strategy for Hotfixes

### Pre-deployment Checklist
```bash
# Full test suite
npm test && npm audit

# Security scan (if applicable)
bandit -r src/

# Integration tests
./run_integration_tests.sh
```

### Manual Verification
- [ ] Core user workflow functions correctly
- [ ] Authentication and authorization working
- [ ] Payment processing (if applicable)
- [ ] Data integrity maintained
- [ ] No new error logs or exceptions
- [ ] Performance within acceptable range

### Staging Validation
```bash
./deploy.sh hotfix/critical-fix staging
curl -f https://staging.yourapp.com/api/health
./smoke_tests.sh
```

---

## Post-deployment Monitoring

### Immediate (first 30 minutes)
- Error rate and count
- Response time and latency
- CPU and memory usage
- Database connection counts
- Key business metrics (e.g., conversion, payment success rate)

### Extended (first 24 hours)
- User activity patterns
- Feature usage statistics
- Customer support ticket volume
- Security log analysis

### Monitoring Script
```bash
#!/bin/bash
# monitor_hotfix.sh

echo "=== Post-Hotfix Monitoring $(date) ==="

echo "--- Application Health ---"
curl -s https://api.yourapp.com/health | jq '.'

echo "--- Active DB Connections ---"
psql -h db.yourapp.com -U readonly -c \
  "SELECT count(*) FROM pg_stat_activity;"
```

---

## Incident Report Template

```markdown
# Incident Report: [Brief Description]

## Summary
- **Severity:** P0/P1/P2
- **Start Time:** [UTC]
- **End Time:** [UTC]
- **Duration:** [H:MM]
- **Impact:** [users/revenue affected]

## Root Cause
[What went wrong and why]

## Timeline
| Time (UTC) | Event |
|------------|-------|
| HH:MM | Issue detected |
| HH:MM | Root cause identified |
| HH:MM | Fix developed and tested |
| HH:MM | Fix deployed to production |
| HH:MM | Issue confirmed resolved |

## Resolution
[What was done to fix the issue]

## Lessons Learned
### What went well
- [item]

### What could be improved
- [item]

## Action Items
- [ ] Improve monitoring for [area] — owner: @[name], due: [date]
- [ ] Add automated test for [scenario] — owner: @[name], due: [date]
- [ ] Update runbook for [process] — owner: @[name], due: [date]
```

---

## Post-Incident Review Process

1. **Schedule** within 24–48 hours; include all key participants; 60–90 minute session
2. **Blameless analysis** — focus on systems and processes, not individuals
3. **Action plan** — concrete tasks, assignable owners, realistic timelines
4. **Follow-up** — track completion; share learnings with the broader team; update procedures

---

## Common Pitfalls

❌ **Over-engineering the fix** — Make only the minimal targeted change. Save refactoring for regular releases.

❌ **Skipping automated tests** — Time pressure is not a reason to skip. A bad hotfix makes the incident worse.

❌ **Poor communication** — Notify stakeholders promptly with regular updates. Announce resolution clearly.

❌ **No post-deployment monitoring** — Watch system health for at least 30 minutes after every hotfix deployment.

❌ **Forgetting to merge hotfix back to develop** (Git Flow) — This causes the fix to regress at the next release.
