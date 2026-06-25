# Land and Deploy

Structured workflow for merging a PR, waiting for CI and deploy, and verifying production health. Picks up after the PR is created and approved. Use when the user says "merge", "land", "deploy", "merge and verify", "land it", or "ship it to production".

---

## Step 0: Detect platform and base branch

```bash
git remote get-url origin 2>/dev/null
```

- URL contains "github.com" → platform is **GitHub**
- URL contains "gitlab" → platform is **GitLab**
- Otherwise check: `gh auth status 2>/dev/null` (GitHub), `glab auth status 2>/dev/null` (GitLab)
- Neither → **unknown** (git-native only)

Determine the target branch:

**GitHub:** `gh pr view --json baseRefName -q .baseRefName` → fallback `gh repo view --json defaultBranchRef -q .defaultBranchRef.name`

**GitLab:** `glab mr view -F json 2>/dev/null` → extract `target_branch` → fallback `glab repo view -F json 2>/dev/null` → extract `default_branch`

**Git-native fallback:**
```bash
git symbolic-ref refs/remotes/origin/HEAD 2>/dev/null | sed 's|refs/remotes/origin/||'
# fallback: main → master
```

**GitLab / unknown platform:** Stop with "GitLab/unknown platform — merge via the web UI, then run canary verification separately."

---

## Step 1: Pre-flight

1. Check GitHub CLI auth: `gh auth status` — if not authenticated, stop.
2. Detect PR from current branch (or use provided `#NNN`):
   ```bash
   gh pr view --json number,state,title,url,mergeStateStatus,mergeable,baseRefName,headRefName
   ```
3. Validate state: `MERGED` → already done; `CLOSED` → stop; `OPEN` → continue.
4. Tell the user: "Found PR #NNN — '{title}' (branch → base)."

---

## Step 1.5: Deploy infrastructure detection (first run or config change)

Run this check once per project. Skip if a confirmed deploy config already exists and hasn't changed.

```bash
# Read persisted config
grep -A 20 "## Deploy Configuration" CLAUDE.md 2>/dev/null || echo "NO_CONFIG"

# Auto-detect platform
[ -f fly.toml ]                                    && echo "PLATFORM:fly"
[ -f render.yaml ]                                 && echo "PLATFORM:render"
([ -f vercel.json ] || [ -d .vercel ])             && echo "PLATFORM:vercel"
[ -f netlify.toml ]                                && echo "PLATFORM:netlify"
[ -f Procfile ]                                    && echo "PLATFORM:heroku"
([ -f railway.json ] || [ -f railway.toml ])       && echo "PLATFORM:railway"

# Detect deploy workflows
for f in $(find .github/workflows -maxdepth 1 \( -name '*.yml' -o -name '*.yaml' \) 2>/dev/null); do
  [ -f "$f" ] && grep -qiE "deploy|release|production|cd" "$f" && echo "DEPLOY_WORKFLOW:$f"
  [ -f "$f" ] && grep -qiE "staging"                          "$f" && echo "STAGING_WORKFLOW:$f"
done
```

Build a validation table showing: detected platform, app name, production URL, CLI availability, deploy workflow, staging detection, and the exact merge-and-deploy sequence that will execute.

Present to the user on first run and ask for confirmation before proceeding. Record the confirmation so subsequent runs skip straight to readiness checks.

Detect staging environments from:
1. `CLAUDE.md` Deploy Configuration section
2. GitHub Actions workflows containing "staging"
3. PR checks with names containing "vercel", "netlify", or "preview"

---

## Test Failure Ownership Triage

When running tests at any stage and failures are found, classify each failure before deciding how to respond.

### Classify each failure

1. Get files changed on this branch: `git diff origin/<base>...HEAD --name-only`
2. Classify the failure:
   - **In-branch** if: the failing test file was modified on this branch, OR the test output references code changed on this branch, OR the failure traces to a branch change.
   - **Likely pre-existing** if: neither the test file nor the code it tests was modified on this branch, AND the failure is unrelated to any branch change.
   - **When ambiguous, default to in-branch.** Safer to stop the developer than to let a broken test ship.

### In-branch failures

**STOP.** These are your failures. Show them and do not proceed. Fix them before continuing.

### Pre-existing failures

Response depends on whether this is a solo or collaborative repo. Check `CLAUDE.md` or the commit/blame history — one active contributor = solo, multiple = collaborative.

**Solo repo:** Offer to investigate and fix now (complete, but takes time), add as P0 TODO (defer after this ships), or skip with explicit user acknowledgment.

**Collaborative repo:** Offer to investigate and fix now, blame + assign a GitHub issue to the author who broke it (use `git log -1 -- <file>` to find them), add as P0 TODO, or skip. Creating an assigned issue is usually right — the person who broke it has the most context.

**After triage:** If any in-branch failures remain unfixed, STOP. If all pre-existing failures were handled (fixed, TODOed, assigned, or skipped with acknowledgment), continue.

---

## Step 2: Pre-merge checks

```bash
gh pr checks --json name,state,status,conclusion
gh pr view --json mergeable -q .mergeable
```

- Any required check **FAILING** → stop.
- Any required check **PENDING** → proceed to Step 3 (wait for CI).
- All checks **PASSING** → skip Step 3.
- `CONFLICTING` → stop: resolve conflicts first.

---

## Step 3: Wait for CI

```bash
gh pr checks --watch --fail-fast
```

Timeout: 15 minutes. Fail and report specific failing check names if CI fails. Stop if >15 min with advice to check the Actions tab.

---

## Step 3.5: Pre-merge readiness gate

**This is the last gate before an irreversible merge.** Collect all evidence, emit a readiness report, and get explicit user confirmation.

### Review staleness

Check when the most recent code review was run and how many commits have landed since then:

```bash
git log --oneline <stored-review-commit>..HEAD
```

Staleness rules:
- 0 commits since review → **CURRENT**
- 1–3 commits → **RECENT** (yellow if those commits touch code)
- 4+ commits → **STALE** (red — review may not reflect current code)
- No review on record → **NOT RUN**

If review is STALE or NOT RUN, offer: (A) run a quick review of the diff now (~2 min), (B) stop and run a full review skill first, or (C) skip with user acknowledgment.

If any inline fixes are made, commit them and stop — ask the user to re-run land-and-deploy.

### Test results

Run unit/integration tests now:
```bash
# Read test command from CLAUDE.md; fallback to bun test / npm test / pytest
```
Failing tests are a **blocker** — do not merge.

Check for E2E or eval results from today (if the project runs them). Missing E2E results are a **warning**, not a blocker.

### PR body accuracy

Compare the PR description against the actual commit log:
```bash
git log --oneline <base>..HEAD | head -20
gh pr view --json body -q .body
```

Flag: missing features, stale descriptions, wrong version references.

### Documentation check

Check whether `CHANGELOG.md`, `VERSION`, or key doc files were updated alongside code changes:
```bash
git diff --name-only <base>...HEAD -- README.md CHANGELOG.md ARCHITECTURE.md VERSION
```

If new features land without a CHANGELOG/VERSION update, emit a **warning**.

### Readiness report

```
╔══════════════════════════════════════════════════════════╗
║              PRE-MERGE READINESS REPORT                  ║
╠══════════════════════════════════════════════════════════╣
║  PR: #NNN — title                                        ║
║  Branch: feature → main                                  ║
║                                                          ║
║  REVIEWS                                                 ║
║  ├─ Eng Review:    CURRENT / STALE (N commits) / —       ║
║  └─ Inline fix:    applied N fixes / skipped             ║
║                                                          ║
║  TESTS                                                   ║
║  ├─ Unit/integration: PASS / FAIL (blocker)              ║
║  └─ E2E:           N/N pass (Xm ago) / NOT RUN           ║
║                                                          ║
║  DOCUMENTATION                                           ║
║  ├─ CHANGELOG: Updated / NOT UPDATED                     ║
║  └─ VERSION:   bumped / NOT BUMPED                       ║
║                                                          ║
║  PR BODY:     Current / STALE                            ║
║                                                          ║
║  WARNINGS: N  |  BLOCKERS: N                             ║
╚══════════════════════════════════════════════════════════╝
```

Offer: (A) merge — everything looks good; (B) hold — fix warnings first; (C) merge anyway — user acknowledges warnings.

Blockers (failing tests) must be resolved before proceeding. Warnings can be overridden with explicit user acknowledgment.

---

## Step 4: Merge

Try auto-merge first (respects merge queues):
```bash
gh pr merge --auto --delete-branch
```

If auto-merge is unavailable:
```bash
gh pr merge --squash --delete-branch
```

Record the merge commit SHA and whether the merge went via merge queue or direct.

**Merge queue:** if the PR stays `OPEN` after `--auto`, it is queued. Poll every 30 seconds up to 30 minutes. Show progress every 2 minutes. Stop if the PR is removed from the queue (CI failed on the merge commit).

After merge, check for a triggered deploy workflow:
```bash
gh run list --branch <base> --limit 5 --json name,status,workflowName,headSha
```

If a deploy workflow is found, proceed to Step 6 (wait for deploy). Otherwise, proceed to Step 5 to determine deploy strategy.

---

## Step 5: Deploy strategy

Classify the diff scope (frontend, backend, docs, config) to calibrate canary depth later.

```bash
git diff --name-only <base>..HEAD
```

Decision tree (evaluate in order):

1. User provided a production URL → use it for canary.
2. GitHub Actions deploy workflow detected → monitor it (Step 6).
3. Docs-only change → skip verification. Done.
4. No workflow and no URL → ask: web app (provide URL) or library/CLI (no deploy needed)?

**Staging-first option:** if a staging environment was detected in Step 1.5, offer to verify on staging before production. Running staging first is the safest path — if staging breaks, production is untouched.

---

## Step 6: Wait for deploy

**GitHub Actions workflow:**
```bash
gh run list --branch <base> --limit 10 --json databaseId,headSha,status,conclusion,workflowName
gh run view <run-id> --json status,conclusion
```
Poll every 30 seconds. Timeout: 20 minutes.

**Platform CLI:**
- Fly.io: `fly status --app {app}`
- Heroku: `heroku releases --app {app} -n 1`
- Render/Vercel/Netlify: poll production URL until 200 response (these auto-deploy on merge).

**Custom hooks:** if CLAUDE.md specifies a deploy status command, run it.

If deploy fails, offer: (A) examine logs, (B) revert immediately, or (C) continue to health checks anyway (useful for flaky deploy steps).

---

## Step 7: Canary verification

Use the diff scope from Step 5 to calibrate depth:

| Diff scope | Canary depth |
|-----------|-------------|
| Docs only | Already skipped |
| Config only | Smoke: HTTP 200 check |
| Backend only | Console errors + load time |
| Frontend (any) | Full: console + load time + screenshot |
| Mixed | Full canary |

**Full canary sequence** (use the `agent-browser` skill or `curl` for headless checks):

1. Load the page — verify HTTP 200 and non-blank content.
2. Check console for critical errors (`Error`, `Uncaught`, `Failed to load`, `TypeError`, `ReferenceError`). Ignore warnings.
3. Verify load time under 10 seconds.
4. Take a screenshot as evidence.

Health verdicts:
- All pass → **HEALTHY**
- Minor issues (console warnings, slow load) → **DEGRADED**
- Page down or critical JS errors → offer revert

If any check fails, show the evidence and ask: (A) expected — site warming up; (B) broken — revert; (C) investigate more first.

---

## Step 8: Revert (if needed)

```bash
git fetch origin <base>
git checkout <base>
git revert <merge-commit-sha> --no-edit
git push origin <base>
```

If the base has push protections:
```bash
gh pr create --title "revert: <original PR title>"
```

Merge the revert PR to roll back.

If revert has conflicts, explain: other commits landed on the base after the merge. The user must resolve manually.

---

## Step 9: Deploy report

```
LAND & DEPLOY REPORT
═════════════════════
PR:           #<number> — <title>
Branch:       <head> → <base>
Merged:       <timestamp> (<method>)
Merge SHA:    <sha>
Merge path:   auto-merge / direct / merge queue

Timing:
  CI wait:    <duration>
  Queue:      <duration or "direct merge">
  Deploy:     <duration or "no workflow">
  Staging:    <duration or "skipped">
  Canary:     <duration or "skipped">
  Total:      <end-to-end>

Reviews:
  Status:     CURRENT / STALE / NOT RUN
  Inline fix: yes (N fixes) / no / skipped

CI:           PASSED / SKIPPED
Deploy:       PASSED / FAILED / NO WORKFLOW
Staging:      VERIFIED / SKIPPED / N/A
Verification: HEALTHY / DEGRADED / SKIPPED / REVERTED
  Scope:      FRONTEND / BACKEND / CONFIG / DOCS / MIXED
  Console:    N errors or "clean"
  Load time:  Xs
  Screenshot: <path or "none">

VERDICT: DEPLOYED AND VERIFIED / DEPLOYED (UNVERIFIED) / STAGING VERIFIED / REVERTED
```

Save to `.gstack/deploy-reports/{date}-pr{number}-deploy.md` or a project-local `deploy-reports/` directory.

---

## Step 10: Follow-ups

- **DEPLOYED AND VERIFIED:** "Your changes are live and verified."
- **DEPLOYED (UNVERIFIED):** "Merged and deploying — check it manually when you can."
- **REVERTED:** "Merge was reverted. Branch is still available to fix and re-ship."

Suggest: `/canary <url>` for extended monitoring, `/benchmark <url>` for perf analysis, or `/document-release` to sync CHANGELOG and docs.

---

## Verification Gate — Iron Law

**No completion claims without fresh verification evidence.**

Before pushing or merging, re-verify if code changed after the last test run:

1. **If ANY code changed after the most recent test run** (review fixes, bug fixes — not CHANGELOG edits): re-run the full test suite. Paste fresh output. Stale output from an earlier run is not acceptable.
2. **If the project has a build step**: run it and paste output.

Rationalizations that are never acceptable:
- "Should work now" → run it.
- "I'm confident" → confidence is not evidence.
- "I already tested earlier" → code changed since then, test again.
- "It's a trivial change" → trivial changes break production.

Claiming work is complete without verification is dishonesty, not efficiency.

---

## Hard Rules

- Never force push.
- Never skip CI. Failing checks are a hard blocker.
- Narrate every step — no silent gaps between stages.
- Auto-detect everything (PR number, merge method, deploy strategy, staging). Only ask when information genuinely cannot be inferred.
- Poll at 30-second intervals. Do not hammer the API.
- Revert is always an option at any failure point.
- Delete the feature branch after merge (`--delete-branch`).
- First run = teacher mode: explain each check and why it matters, confirm before proceeding.
- Subsequent runs = efficient mode: brief status updates, no re-explanations.
