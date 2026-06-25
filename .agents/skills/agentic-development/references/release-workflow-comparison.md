# Release Workflow Comparison

Compares the three most popular branching and release workflows: Git Flow, GitHub Flow, and Trunk-based Development. Use the decision matrix at the bottom as a starting point, then read the relevant sections for your workflow choice.

## Git Flow

### Structure
```
main (production)
  ↑
release/1.2.0 ← develop (integration) ← feature/user-auth
                    ↑                 ← feature/payment-api
                 hotfix/critical-fix
```

### Branch Types
- **main**: Production-ready code, tagged releases
- **develop**: Integration branch for the next release
- **feature/\***: Individual features, merged to develop
- **release/X.Y.Z**: Release preparation, branched from develop
- **hotfix/\***: Critical fixes, branched from main

### Typical Flow
1. Create feature branch from develop: `git checkout -b feature/login develop`
2. Work on feature, commit changes
3. Merge feature to develop when complete
4. When ready for release, create release branch from develop
5. Finalize release (version bump, changelog, bug fixes)
6. Merge release branch to both main and develop
7. Tag release: `git tag v1.2.0`
8. Deploy from main

### Advantages
- Clear separation between production and development code
- Stable main branch always represents production state
- Structured release process with dedicated release branches
- Built-in hotfix support without disrupting development
- Good for scheduled releases and traditional release cycles

### Disadvantages
- Complex workflow with many branch types
- Merge overhead from multiple integration points
- Delayed feedback from long-lived feature branches
- Integration conflicts when merging large features
- Not ideal for continuous deployment

### Best For
- Large teams (10+ developers)
- Products with scheduled release cycles (weekly/monthly)
- Enterprise software with formal testing phases
- Projects requiring multiple supported versions simultaneously

### Key Commands
```bash
# Start feature
git checkout develop && git checkout -b feature/user-auth

# Finish feature
git checkout develop
git merge --no-ff feature/user-auth
git branch -d feature/user-auth

# Start release
git checkout develop && git checkout -b release/1.2.0
# Version bump, changelog updates
git commit -am "chore: bump version to 1.2.0"

# Finish release
git checkout main
git merge --no-ff release/1.2.0
git tag -a v1.2.0 -m "Release version 1.2.0"
git checkout develop
git merge --no-ff release/1.2.0
git branch -d release/1.2.0

# Hotfix
git checkout main && git checkout -b hotfix/security-patch
git commit -am "fix: resolve security vulnerability"
git checkout main
git merge --no-ff hotfix/security-patch
git tag -a v1.2.1 -m "Hotfix 1.2.1"
git checkout develop
git merge --no-ff hotfix/security-patch
```

---

## GitHub Flow

### Structure
```
main ← feature/user-auth
    ← feature/payment-api
    ← hotfix/critical-fix
```

### Branch Types
- **main**: Production-ready code, deployed automatically on merge
- **feature/\***: All changes regardless of size or type

### Typical Flow
1. Create branch from main
2. Work on feature with regular commits and pushes
3. Open pull request for feedback
4. Deploy branch to staging for testing
5. Merge to main when approved and tested
6. Deploy main to production automatically
7. Delete feature branch

### Advantages
- Simple workflow with only two branch types
- Fast deployment with minimal process overhead
- Early feedback through pull request reviews
- Deploy from branches allows testing before merge
- Well-suited for continuous deployment

### Disadvantages
- Main can be unstable if testing is insufficient
- No coordinated release branches
- Requires strong CI/CD infrastructure
- Can be chaotic with many simultaneous features

### Best For
- Small to medium teams (3–10 developers)
- Web applications with continuous deployment
- Products with rapid iteration cycles
- Teams with strong automated testing

### Key Commands
```bash
# Start feature
git checkout main && git pull origin main
git checkout -b feature/user-auth

# Work and push
git commit -m "feat(auth): add login form validation"
git push origin feature/user-auth

# Emergency PR via CLI
gh pr create --title "HOTFIX: payment timeout" --reviewer eng-team --label hotfix

# Merge
git checkout main
git merge feature/user-auth
git push origin main
git branch -d feature/user-auth
```

---

## Trunk-based Development

### Structure
```
main ← short-branch (1-3 days max)
    ← direct-commits (for small changes)
```

### Branch Types
- **main**: The single source of truth, always deployable
- **Short-lived branches**: Optional, for changes requiring >1 day

### Typical Flow
1. Commit directly to main for small changes
2. Create short-lived branch for larger changes (max 2–3 days)
3. Merge to main frequently (multiple times per day)
4. Use feature flags to hide incomplete features in production
5. Release = enabling a feature flag, not a deployment event

### Advantages
- Simplest workflow with minimal branching
- Fastest integration cycle
- Reduced merge conflicts from short-lived branches
- Excellent for CI/CD and DevOps practices

### Disadvantages
- Requires discipline to keep main stable
- Needs feature flag infrastructure for in-progress work
- Requires mature automated testing
- Not suitable for junior developers without guardrails

### Best For
- Expert teams with strong DevOps culture
- Microservices architectures
- Organizations practicing continuous deployment
- Teams doing multiple deployments per day

### Key Commands
```bash
# Small change — direct to main
git checkout main && git pull origin main
git commit -m "fix(ui): resolve button alignment issue"
git push origin main

# Larger change — short branch
git checkout -b payment-integration
# Work 1–2 days max
git commit -m "feat(payment): add Stripe integration"
git push origin payment-integration

# Immediate merge
git checkout main && git merge payment-integration
git push origin main && git branch -d payment-integration

# Feature flag gating (example)
if (featureFlags.enabled('stripe_payments', userId)) {
  return renderStripePayment();
} else {
  return renderLegacyPayment();
}
```

---

## Feature Comparison Matrix

| Aspect | Git Flow | GitHub Flow | Trunk-based |
|--------|----------|-------------|-------------|
| **Complexity** | High | Medium | Low |
| **Learning Curve** | Steep | Moderate | Gentle |
| **Deployment Frequency** | Weekly/Monthly | Daily | Multiple/day |
| **Branch Lifetime** | Weeks/Months | Days/Weeks | Hours/Days |
| **Main Stability** | Very High | High | High* |
| **Release Coordination** | Excellent | Limited | Feature Flags |
| **Hotfix Support** | Built-in | Manual | Direct |
| **Merge Conflicts** | High | Medium | Low |
| **Team Size** | 10+ | 3–10 | Any |
| **CI/CD Requirements** | Medium | High | Very High |

*With proper feature flags and testing

---

## Decision Matrix

**Choose Git Flow if:**
- ✅ Team size > 10 developers
- ✅ Scheduled release cycles (weekly/monthly)
- ✅ Multiple versions supported simultaneously
- ✅ Formal testing and QA phases required
- ❌ Need rapid deployment
- ❌ Small team or startup

**Choose GitHub Flow if:**
- ✅ Team size 3–10 developers
- ✅ Web applications or APIs
- ✅ Strong CI/CD and automated testing
- ✅ Daily or continuous deployment
- ❌ Complex release coordination needed
- ❌ Multiple release branches required

**Choose Trunk-based Development if:**
- ✅ Expert development team
- ✅ Mature DevOps practices
- ✅ Microservices architecture
- ✅ Feature flag infrastructure in place
- ✅ Multiple deployments per day
- ❌ Junior developers
- ❌ Complex integration requirements

---

## Release Strategies per Workflow

### Git Flow
```bash
# Scheduled release
git checkout develop && git checkout -b release/2.3.0
npm version 2.3.0 --no-git-tag-version
git commit -am "chore: bump version to 2.3.0"
git checkout main && git merge --no-ff release/2.3.0
git tag -a v2.3.0 -m "Release 2.3.0"
```

### GitHub Flow
```bash
# Merge triggers auto-deploy via CI/CD
git checkout main && git merge feature/new-payment-method
# Optional tag for tracking
git tag -a v2.3.$(date +%Y%m%d%H%M) -m "Production deployment"
```

### Trunk-based
```bash
# Gradual rollout via feature flags
curl -X POST api/feature-flags/payment-v2/rollout/10   # 10%
# Monitor metrics...
curl -X POST api/feature-flags/payment-v2/rollout/50   # 50%
# Monitor metrics...
curl -X POST api/feature-flags/payment-v2/rollout/100  # Full rollout
# Remove flag code after successful rollout
```

---

## Migration Strategies

### Git Flow → GitHub Flow
1. Eliminate the develop branch; work directly from main
2. Increase deployment frequency to continuous
3. Strengthen automated test coverage and CI/CD
4. Limit feature branches to 1–2 weeks maximum

### GitHub Flow → Trunk-based
1. Implement feature flag infrastructure
2. Ensure all tests run in <10 minutes
3. Encourage multiple commits per day
4. Start committing small changes directly to main

### Trunk-based → Git Flow (scaling back)
1. Introduce develop and release branches
2. Move to scheduled release cycles
3. Allow longer feature development cycles
4. Add approval gates and testing phases

---

## Anti-patterns to Avoid

### Git Flow
- Long-lived feature branches (>2 weeks)
- Skipping release branches for small releases
- Direct commits to main bypassing develop
- Forgetting to merge hotfixes back to develop

### GitHub Flow
- Unstable main due to insufficient testing
- Long-lived feature branches defeating the purpose
- Skipping PR reviews for speed
- No rollback plan when deployments fail

### Trunk-based
- Committing broken code to main
- Feature branches lasting weeks
- No feature flags for incomplete features
- Insufficient automated testing
