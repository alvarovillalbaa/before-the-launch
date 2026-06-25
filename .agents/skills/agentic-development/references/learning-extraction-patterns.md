# Extraction Patterns

Use this guide to decide what to capture, what to promote, and what to ignore.

## Capture-first rule

When in doubt during work, capture an `item` first. Synthesis belongs at the end of the session.

## High-signal indicators

These usually deserve at least an item, an episode mention, and one or more promoted artifacts:

| Signal | Typical outputs |
|---|---|
| Real root cause differs from initial symptom | item, episode, triple, lesson or debugging collection |
| Choice between two plausible approaches | item, episode, decision trace, architecture collection |
| Repeated failed attempts before the fix | item, episode, lesson candidate |
| User says "remember this", "always do this", or equivalent | item, AGENTS candidate, maybe lesson |
| Discovered owner or boundary of a subsystem | item, triple, architecture collection, belief |
| Non-obvious test setup or tooling workaround | item, testing or tools collection, procedure |
| Durable documentation gap found and fixed | episode, doc promotion, maybe AGENTS fact |

## Low-signal indicators

Usually keep these inside the episode only:

- straightforward implementation of an already-known pattern
- formatting-only changes
- one-off task logistics
- transient local environment flukes

## Promotion ladder

Process meaningful sessions in this order:

```text
item
  -> episode
  -> decision trace (if reasoning-heavy)
  -> triple (if atomic fact)
  -> collection or procedure (if topical or repeatable)
  -> belief (if enough evidence accumulates)
  -> lesson (only if all lesson gates pass)
  -> AGENTS / docs (only if the knowledge is source-of-truth worthy)
```

## Lesson gates

Promote to `lessons/` only when all are true:

1. Outcome was clear.
2. Solution is reusable.
3. Knowledge was non-trivial.
4. The result was verified in real work.

If any gate fails, prefer a collection entry or triple.

## Decision trace gates

Write a `decision-trace` when any of these happened:

- two or more plausible approaches were compared
- the session involved ambiguous evidence
- bias, uncertainty, or risk had to be managed explicitly
- follow-up risk remains even after implementation
- the session would be hard to reconstruct later from the episode alone

## Triple extraction patterns

Good triple candidates look like:

- `[module] owns [responsibility]`
- `[service] depends-on [component]`
- `[tool] fails-when [condition]`
- `[workflow] requires [precondition]`
- `[system] not-supported [limitation]`

Avoid:

- vague summaries
- ephemeral task state
- anything sensitive

## Collection routing

| Knowledge type | Target |
|---|---|
| architecture or ownership | `collections/architecture.md` |
| debugging symptom to cause | `collections/debugging.md` |
| coding idiom or anti-pattern | `collections/patterns.md` |
| tooling quirk or CLI usage | `collections/tools.md` |
| testing strategy or fixture rule | `collections/testing.md` |
| deploy or runtime operational quirk | `collections/deployment.md` |
| external API behavior | `collections/api.md` |

Add repo-specific collections when these defaults stop being useful.

## Belief updates

Update `beliefs/current.md` when multiple triples and episodes point to the same structural understanding. Beliefs are synthesized state, not raw evidence.

## Identity or doc update signals

Promote beyond `learning/` when:

- the agent should change future behavior
- teammates should know the information without reading `learning/`
- the same fact or rule has appeared more than once

If the signal is useful only for search and recall, keep it inside `learning/`.
