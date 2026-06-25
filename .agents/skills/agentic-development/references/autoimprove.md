# Autoimprove — Autonomous Skill Refinement Loop

Run this reference when: a reference file or skill prompt has inconsistent output quality (e.g., passes its own quality checks only 50–70% of the time); the user says "run autoresearch on [reference]", "autoimprove", or "optimize this skill autonomously"; or the self-improvement loop has identified the same recurring failure pattern 3+ times and reactive patching hasn't fixed it.

> Method origin: Karpathy's "autoresearch" — let an agent test and refine a prompt in a loop instead of fixing it manually. A landing page copy skill went from 56% → 92% pass rate with zero manual work.

---

## Mental Model

```
You have a reference file that works 6 out of 10 times.
Instead of rewriting it from scratch, you change one thing,
test 10 outputs, check if the pass rate went up, keep or revert,
then change the next thing. After 50 rounds, it works 9.5/10.

"Recipe"  = the reference file being optimized
"Cooking" = running the skill against a test prompt
"Tasting" = scoring the output against a binary checklist
```

The only thing you must define up front is the checklist — what "good" means for this specific reference.

---

## Step 1 — Choose a Target Reference

Pick the reference file that:
- Has the most recurring failures in `memory/semantic-patterns.json`
- Produces noticeably inconsistent output quality across sessions
- Has a clear, scoreable purpose (not pure explanation — something with measurable output)

Good candidates: `../frontend/references/ui-constraints.md`, `specs-plans-tests.md`, `reviews-and-comments.md`, or any reference that drives artifact creation.

Not a good candidate: `repo-orientation.md` (pure discovery procedure — hard to score with binary criteria).

---

## Step 2 — Define the Scoring Checklist

Design **3–6 binary (yes/no) questions** that together define what a good output from this reference looks like.

**Rules for good checklist items:**

| Rule | Example of BAD item | Example of GOOD item |
|------|---------------------|----------------------|
| Binary — yes or no, never a rating | "Is the spec well-structured?" | "Does the spec include a 'Non-Goals' section?" |
| Specific — no interpretation needed | "Is the code clean?" | "Does every function have a single responsibility (< 20 lines)?" |
| Independent — one thing per item | "Is it clear and complete?" | Split into two: clarity check, completeness check |
| Necessary — failure here is actually bad | "Is it formatted nicely?" | Only if formatting is a real pain point |

**Sweet spot: 3–6 items.** More than 6 and the skill starts gaming the checklist — hitting every check without producing actually good output.

**Template:**

```markdown
## Checklist: [Reference Name]

Test prompt: "[The input used to exercise the reference — be specific]"

Items:
1. [Yes/No question — specific, binary, necessary]
2. [Yes/No question]
3. [Yes/No question]
4. [Yes/No question — optional]
5. [Yes/No question — optional]

Pass threshold: 90% (4+ items passing on every run)
Target: 95%+ on 3 consecutive runs
```

Use `templates/autoimprove-checklist.md` to fill this out before starting the loop.

---

## Step 3 — Establish a Baseline

Before making any changes:

1. Run the reference against the test prompt **10 times** (10 independent outputs).
2. Score each output against the checklist.
3. Record: `baseline_score = (total passes) / (runs × checklist items)`.
4. Log which items fail most often — these are the optimization targets.

```
Baseline run: 10 outputs × 5 checklist items = 50 total checks
Passes: 28 / 50 = 56%

Failure breakdown:
  Item 2 — "Specific number in headline": 8/10 failing  ← biggest opportunity
  Item 4 — "No buzzwords": 6/10 failing
  Item 1 — "Pain point in opener": 2/10 failing
```

---

## Step 4 — The Autoimprove Loop

Each iteration:

```
1. ANALYZE  — Which checklist item has the most failures this round?
2. HYPOTHESIZE — What one change to the reference could fix it?
              (add a rule, add an example, ban specific language, tighten a constraint)
3. CHANGE   — Make exactly one edit to the reference file
4. TEST     — Run 5–10 outputs against the test prompt
5. SCORE    — Calculate pass rate for this round
6. DECIDE:
     score improved → KEEP the change, log it as "kept"
     score same or worse → REVERT the change, log it as "reverted"
7. REPEAT   — Go to step 1 with the (possibly unchanged) reference
```

**When to stop:**
- Pass rate ≥ 95% on 3 consecutive rounds → **converged, done**
- No improvement after 5 consecutive rounds → **plateau, stop and report**
- User explicitly stops it

**Change strategies, in order of preference:**

1. **Add a specific rule** for the most-failing item: `"Your headline must include a specific number or result. Never use vague promises."`
2. **Add a concrete worked example** showing good vs bad for the failing item
3. **Add a banned list** for common failure modes: `"NEVER use: vague, comprehensive, robust, seamless"`
4. **Tighten a constraint** (word count, section count, required fields)
5. **Restructure the guidance order** if later steps are crowding out earlier ones

---

## Step 5 — Outputs

When the loop stops, produce:

### `memory/autoimprove/[reference-name]-improved.md`
The optimized version of the reference file. The original stays untouched at `references/[reference-name].md`.

### `memory/autoimprove/[reference-name]-changelog.md`
A log of every round:

```markdown
## Changelog: [Reference Name]
Started: YYYY-MM-DD | Baseline: 56% | Final: 92% | Rounds: 12

### Round 1 — KEPT (+12%)
Change: Added specific rule for headline format
Reason: Item 2 was failing 8/10 runs
Result: 56% → 68%

### Round 2 — KEPT (+9%)
Change: Added banned buzzwords list
Reason: Item 4 was failing 6/10 runs
Result: 68% → 77%

### Round 3 — REVERTED (-3%)
Change: Tightened word count to 100 words
Reason: Tried to reduce verbosity
Result: 77% → 74% — CTA quality suffered, reverted

### Round 4 — KEPT (+15%)
Change: Added worked example of strong intro + CTA
Reason: Items 1 and 3 still failing ~3/10
Result: 74% → 89%
```

### `memory/autoimprove/[reference-name]-results.json`
Machine-readable round log for future agents to resume from:

```json
{
  "target": "../frontend/references/ui-constraints.md",
  "test_prompt": "Build a modal confirmation dialog for a destructive action",
  "checklist": ["item1", "item2", "item3"],
  "baseline": 0.56,
  "final": 0.92,
  "rounds": [
    { "round": 1, "change": "...", "score": 0.68, "decision": "kept" },
    { "round": 3, "change": "...", "score": 0.74, "decision": "reverted" }
  ],
  "status": "converged"
}
```

---

## When to Deploy the Improved Version

Do **not** automatically overwrite `references/[reference-name].md`. Instead:
1. Show the user the diff and the score improvement.
2. Ask: "Deploy improved version to `references/[reference-name].md`? (original backed up to `memory/autoimprove/[reference-name]-original.md`)"
3. On confirmation, swap the files and update `memory/semantic-patterns.json` with a note that the reference was autoimproved.

---

## Checklist Design Walkthrough

If the user hasn't defined a checklist yet, walk them through it:

```
1. "What does a good output from this reference look like? Describe in plain language."
2. "What's the most common failure you've seen? What specific thing was wrong?"
3. "If I showed you two outputs — one good, one bad — what's the first thing you'd check?"
4. "Now let's make that a yes/no question: '[condition]?' Yes or no?"
5. Repeat for 3–6 items. Stop when the checklist covers the main failure modes.
```

---

## Relationship to Self-Improvement Loop

Autoimprove is the **high-autonomy, batch mode** of self-improvement:

| Mode | When | Autonomy | Speed |
|------|------|----------|-------|
| Self-improvement (reactive) | After each session, on errors | Low — you review each pattern | Slow — accumulates over days |
| Autoimprove (proactive) | On demand, targets one reference | High — runs unattended | Fast — dozens of rounds in one session |

Use self-improvement for **ongoing learning** from real sessions. Use autoimprove when you want to **rapidly fix a known quality problem** in a specific reference.

---

## Anti-Patterns to Avoid

- **Changing multiple things per round** — you lose the ability to know which change helped
- **Vague checklist items** — the agent scores inconsistently and the loop churns without converging
- **Too many checklist items (> 6)** — the reference starts hitting each check in isolation, losing overall coherence
- **Deploying without user review** — always show the diff and score delta; never auto-deploy
- **Optimizing a reference that doesn't produce artifacts** — discovery procedures and orientation guides don't have scoreable outputs
