# Instruction File Design

How you structure CLAUDE.md, AGENTS.md, and rule/skill files determines how much useful context your agents receive — and how much noise competes with it.

---

## CLAUDE.md as a Logical Router

The most common instruction-file mistake is treating CLAUDE.md as a documentation dump: all preferences, all rules, all context, inlined directly. Every token in an always-loaded file is a token competing with the task at hand.

**The router pattern:** CLAUDE.md should be a minimal IF-ELSE directory that says where to find context, not what the context is.

```markdown
# BAD — documentation dump (everything always in context)
When coding, always use TypeScript. Prefer functional components.
Avoid class components. Always add JSDoc comments. Use PascalCase
for components. Use camelCase for variables. Run tests before
committing. Use semantic versioning. [200 more lines...]

# GOOD — logical router (load only what's needed)
Before coding: read coding-rules.md
When writing tests: read coding-test-rules.md
When tests are failing: read test-recovery.md
When deploying: read deployment-checklist.md
```

The router form keeps the always-loaded file minimal. Agents load only the branch relevant to their current task. Unrelated guidance never enters context.

**Nesting is supported and encouraged.** A rule file can itself point to deeper files:

```markdown
# coding-rules.md
For backend code: read backend-patterns.md
For frontend code: read frontend-patterns.md
If using async/await: read async-patterns.md
```

This creates a conditional reference tree. The agent loads exactly the branch it needs, nothing more.

## Harness-Ready AGENTS.md

In agent-first repos, `AGENTS.md` is part of the harness, not a contributor handbook. Keep it close to 100 lines and use it as a map to repo-local, versioned artifacts.

It should contain:

- one paragraph objective
- instruction hierarchy and required skills
- the few commands agents must know immediately
- pointers to architecture, testing, CI, product context, and runbooks
- short Always / Ask / Never boundaries

It should not contain full architecture manuals, complete command encyclopedias, code style tutorials, or long framework examples. Move those into `docs/references/`, `docs/cookbook/`, or subsystem-local docs and link to them.

For large repos, add subsystem `AGENTS.md` files beside high-risk code. Each local file should state the interface/protocol, critical invariants, anti-patterns, debug paths, and when to load specialized skills. A good subsystem guide prevents agents from inferring invisible rules from nearby code alone.

Make the map enforceable: add CI that checks referenced files exist, stale links are reported, and required subsystem guides are present for known high-risk directories.

---

## Rules vs Skills

These are conceptually distinct. Mixing them into the same file degrades both.

| | Rules | Skills |
|---|---|---|
| **Encode** | Preferences and constraints | Recipes and procedures |
| **Answer** | "What should I always/never do?" | "How do I accomplish X?" |
| **Form** | Declarative: "Always X", "Never Y" | Procedural: "Step 1, Step 2, Step 3..." |
| **Example** | "Never expose API keys in logs" | "When implementing auth: JWT with bcrypt-12, refresh rotation with 7-day expiry..." |
| **Loaded** | Conditionally by scenario | Conditionally by task type |

**What goes wrong when they're mixed:**

- Rule files that grow to spec size consume context before the agent even starts — the agent reads 200 lines of constraints before seeing the task.
- Skill files that become preference lists lose their procedural clarity — agents treat them as style guides rather than step-by-step recipes.

**Practical separation:**

```
coding-rules.md         ← rules: what to always/never do when coding
auth-implementation.md  ← skill: step-by-step approach to implementing auth
test-rules.md           ← rules: testing constraints and non-negotiables
tdd-workflow.md         ← skill: the exact TDD cycle to follow
```

CLAUDE.md points to the right file type for the current scenario:

```markdown
Before coding: read coding-rules.md
When implementing auth: read auth-implementation.md
When writing tests: read test-rules.md, then read tdd-workflow.md
```

---

## Separating Research from Implementation

When an agent explores alternatives to decide on an approach, that exploration context — all the options considered, their trade-offs, the reasoning for what was rejected — has no value in the implementing agent's context. It is noise that competes with implementation signal.

**Pattern:**

```
Session A — Research agent
  Brief: "Research approaches for X. Compare options Y and Z.
          Recommend one with rationale."
  Output: recommendation + condensed rationale

            ↓  human reviews, approves approach

Session B — Implementation agent (fresh context)
  Brief: "Implement X using approach Z.
          Specifics: [condensed chosen-approach details only]"
  Context: only what's needed to implement the chosen path
```

The implementation agent never sees the alternatives. It only knows what to build.

**When you already know the approach**, skip the research session entirely. The more specific the implementation brief, the less research context bleeds in:

```
# Vague (forces research, risks context pollution)
"Implement authentication"

# Specific (implementation can start immediately, fresh context stays clean)
"Implement JWT authentication with bcrypt-12 password hashing,
 refresh token rotation with 7-day expiry, RS256 signing"
```

---

## Prompting for Discovery vs Confirmation

Agents are designed to comply with requests. Ask for a bug and you will get one — even if the agent has to manufacture it. This is not a defect; it is a feature that becomes a problem in diagnostic contexts.

**Biased prompts (avoid for discovery):**

```
"Find a bug in the database logic."
"What's wrong with this component?"
"Identify security vulnerabilities in this file."
```

Each of these primes the agent to confirm an assumed problem exists. The agent will find something to give you, because that's what the prompt asked for.

**Neutral prompts (use for discovery):**

```
"Trace through the database logic component by component
 and report all findings."

"Review this component and describe what it does and
 any observations you have."

"Walk through this file's security surface and report
 what you see."
```

Neutral prompts sometimes surface bugs; sometimes they confirm the code is correct. Both outcomes are honest and valid. The goal is accurate results, not confirming a hypothesis.

**When you want comprehensive discovery and can tolerate false positives**, bias the prompt intentionally and follow up with an adversarial filter — see the Three-Agent Verification Trio in [reviews-and-comments.md](./reviews-and-comments.md). The sycophancy that makes biased discovery prompts unreliable is the same property that makes a penalty-weighted adversarial agent effective at filtering a superset.

---

## Iterating on Rules and Skills

Start lean. A bare-bones CLAUDE.md with no rules or skills will still produce useful results — the agent applies its general knowledge. Add rules and skills when you observe specific behaviors you want to change or preserve.

**When to add a rule:** you saw the agent do something you didn't want, or you want to guarantee a specific behavior without having to ask for it every session.

**When to add a skill:** you want the agent to approach a category of work in a specific, repeatable way — especially when you've already discovered a good approach and want to encode it before the agent encounters that problem in production.

**When to consolidate:** performance degrades, rules contradict each other, or the same guidance appears in multiple files. See the Periodic Consolidation Pass in [self-improvement.md](./self-improvement.md).

The ideal instruction-file library is never "complete." It is a living artifact that gets leaner and more precise as contradictions get resolved and low-value guidance gets removed.
