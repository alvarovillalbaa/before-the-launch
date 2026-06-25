# Continuous Documentation Reference

Last updated: 2026-04-25

Continuous docs are maintained as part of normal work. They do not wait for a special documentation project.

## Development logs

### Location

```text
logs/YYYY/YYYY-MM-DD/*.md
```

### Rule

Always append to the latest existing file for the latest relevant date directory. Only create a new dated directory when needed.

### Format

One bullet per logical change. Two lines maximum.

```text
- [What changed] — [Why it changed or what problem it solved]
```

### Good examples

```text
- Fixed OAuth token refresh by adding redirect URI validation — silent mobile login failures stopped
- Refactored candidate serializer to use RetrievalLevelMixin — removed ad-hoc response shaping
- Updated PLAN.md and SPEC.md to separate historical plans from living behavior contracts
```

### Anti-patterns

```text
- Did some refactoring
- Fixed a bug
- Updated code per review
- WIP
```

### Finding the latest file

```bash
YEAR=$(ls logs/ | sort | tail -1)
DATE_DIR=$(ls logs/"$YEAR" | sort | tail -1)
FILE=$(ls logs/"$YEAR"/"$DATE_DIR" | sort | tail -1)
echo "- Your log entry here" >> logs/"$YEAR"/"$DATE_DIR"/"$FILE"
```

Or use `skills/code-documentation/scripts/find-docs.sh log`.

## Lessons

### Location

```text
lessons/YYYY/YYYY-MM-DD/*.md
```

### Use when

- the insight was verified by real work
- it should change future behavior
- it is broader than one incident note

Keep lessons concise, evidence-backed, and action-shaping.

## Items

### Location

```text
items/YYYY/YYYY-MM-DD/*.md
```

### Use when

- the fact is about the user, team, company, customer, environment, or project context
- future agents or engineers would make wrong assumptions without it
- the fact is not cleanly derivable from code alone

Do not use `items/` for transient requests or secrets.

## Fixes

### Location

```text
fixes/YYYY/YYYY-MM-DD/*.md
```

### Use when

- the error or symptom was non-obvious
- the fix is likely to recur
- the next person should not have to rediscover it from scratch

Each fix should capture the symptom, root cause, exact fix, and prevention note when useful.

## Plans

### Location

```text
plans/YYYY/YYYY-MM-DD/*.md
```

Plans are historical implementation artifacts. They explain how a specific change should be executed, tested, and verified at that time.

If the rule becomes durable and repo-wide, promote it into `PLAN.md`, `SPEC.md`, `runbooks/`, `cookbook/`, or `knowledge/`.

## Audits

### Location

```text
audits/YYYY/YYYY-MM-DD/*.md
```

Use for:

- technical reports
- ADRs
- post-mortems
- architecture audits
- dependency or security reviews
- release notes for engineers

These are historical by design. They should not become the only place where a lasting workflow or policy lives.

## Raw material

### Location

```text
raw/YYYY/YYYY-MM-DD/
```

`raw/` is intake, not the final home.

Use it for:

- copied source material
- imported notes
- scraped pages
- temporary ingest batches waiting for compilation

After ingest:

- promote durable knowledge into `knowledge/`, `references/`, `cookbook/`, `runbooks/`, or another canonical living destination
- clear or archive `raw/` according to the repo's second-brain rules

## Living docs

Living docs own the current truth and must include:

```markdown
Last updated: YYYY-MM-DD
```

This applies to:

- root instruction docs
- in-folder docs
- `specs/`
- `sources/`
- `lib/`
- `references/`
- `cookbook/`
- `knowledge/`
- `runbooks/`
- `research/`
- `official-documentation/`
- `context/`

### Examples of living destinations

- `SPEC.md` or `specs/` for desired behavior contracts
- `references/` for stable mappings or API facts
- `cookbook/` for repo-specific how-to guides
- `knowledge/` for timeless engineering or system knowledge
- `runbooks/` for exact repeatable procedures

## Changelogs

Two changelog audiences still exist:

- `CHANGELOG.md` for user-facing or package-facing release history
- `audits/YYYY/YYYY-MM-DD/release-notes.md` or PR descriptions for engineering release notes

If `CHANGELOG.md` is treated as a living repo doc, add `Last updated: YYYY-MM-DD` near the top.

## Conflict check

Before writing:

1. Check whether the same guidance already exists in a living doc.
2. If yes, update the living doc and keep the timestamped artifact as history only.
3. If the old location is obsolete, move or delete it instead of creating a second current source of truth.
