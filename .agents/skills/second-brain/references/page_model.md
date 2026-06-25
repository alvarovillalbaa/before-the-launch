# Canonical Page Model

Use this reference when the user wants the second brain to preserve the strongest parts of a compiled-knowledge system without binding it to Obsidian, SQLite, or any other single implementation.

This reference defines the knowledge contract. Storage can vary. The contract should not.

## Core idea

For durable topics, separate:

- current understanding
- unresolved threads
- historical evidence

The important distinction is not file versus database. The important distinction is rewritten synthesis versus append-only evidence.

Another way to say it:

- above the line: current compiled truth
- below the line: timeline or evidence log

The assistant rewrites the first. The assistant appends to the second.

## Canonical page sections

For important pages such as people, companies, projects, concepts, decisions, and source summaries, this default structure works well:

1. Title and optional metadata
2. Summary
3. Compiled truth
4. Open threads
5. Timeline or evidence log
6. Sources or provenance notes

Section names can change to match the user's system. The responsibilities should stay the same.

### Summary

- one short paragraph
- tells the reader why the topic matters
- should make sense even if the rest of the page is skipped

### Compiled truth

- current best understanding
- rewritten when new evidence changes the picture
- organized by role, theme, phase, mechanism, consequence, or other durable structure
- should read like a maintained article, not a running diary

Good content:

- what is true now
- what matters most
- what patterns have emerged
- what changed recently if it materially affects the current view

Avoid:

- long chronological dumps
- transcript fragments
- every event getting equal weight

### Open threads

Use this section when the topic has uncertainty, ambiguity, or active follow-up.

Typical items:

- unresolved contradiction
- missing source
- pending decision
- active investigation
- question that blocks a stronger conclusion

Keep this section short and actionable. Remove or downgrade entries when the page is no longer waiting on them.

### Timeline or evidence log

- append-only by default
- dated observations, events, or source-backed updates
- preserve the historical trail without forcing the page body to become chronological sludge
- each entry should help reconstruct why the compiled truth changed

Good entry shape:

```md
## Timeline

- 2026-04-05 | Meeting
  - Pedro said the rollout would slip by two weeks because vendor approval was blocked.
  - This weakens the previous assumption that launch could happen in April.
  - Source: [[sources/2026-04-05_vendor_sync]]
```

The interpretation can be brief. The goal is to retain the evidence trail and the directional effect on the page.

### Sources and provenance

Every non-obvious claim should be easy to verify.

You can express provenance with:

- inline source markers
- citation bullets
- a source section
- structured frontmatter or sidecar metadata
- database fields if the backend is structured

Use whatever fits the user's system. Do not make provenance disappear.

## Searchable frontmatter schema

For knowledge files in `knowledge/` and `lessons/`, use this YAML frontmatter to make pages greppable and filterable without depending on a specific app:

```yaml
---
type: insight  # insight | decision | procedure | fact | question
tags: [domain, subtopic]
confidence: high  # high | medium | low
created: YYYY-MM-DD
source: session | ingest | research | meeting | url
---
```

Field guidance:

- `type` classifies the page's epistemic role:
  - `insight` — a learned pattern or conclusion that generalizes beyond one event
  - `decision` — a recorded choice with rationale, context, and trade-offs
  - `procedure` — a repeatable how-to that should not need to be rediscovered
  - `fact` — a stable empirical claim with provenance
  - `question` — an open thread worth tracking until resolved
- `tags` — two or three terms: broad domain first, then specific subtopic
- `confidence` — `high` (verified, sourced), `medium` (plausible, partially sourced), `low` (hypothesis or early signal)
- `created` — ISO date when the page was first written
- `source` — the kind of session or input that produced this knowledge

This schema makes knowledge files queryable by shell tools, `grep`, `ripgrep`, or any tool that reads YAML frontmatter — without requiring an app or plugin. Compound mode uses this schema when saving new learnings.

## Write rules

When a new source changes a topic:

1. Preserve the source in the raw layer or source store.
2. Re-read the relevant canonical page.
3. Rewrite the compiled-truth section so it reflects the best current understanding.
4. Add or resolve open threads.
5. Append a dated timeline entry or evidence note.
6. Update indexes, logs, and linked pages that should change too.

This is the key discipline:

- do not only append
- do not only overwrite
- do both, in different sections with different responsibilities

## Fact evolution

When facts change over time, preserve both:

- when the fact was true
- when the system learned it

If roles, statuses, ownership, strategy, or beliefs change, the compiled truth should show the current state while the timeline preserves the transition.

## Storage-agnostic mappings

The same page model can live in:

- markdown files
- a local SQLite database
- a custom web app
- a CMS or notes tool
- a CLI plus export pipeline

Examples of equivalent mappings:

- `compiled_truth` can be a section in markdown or a field in a database
- `timeline` can be a markdown section, separate linked entries, or structured rows
- `frontmatter` can be YAML, JSON, database columns, or app metadata
- `sources` can be wiki pages, raw files, sidecars, structured references, or joined tables

The backend is allowed to change. The page responsibilities should remain recognizable.

## Migration invariants

When importing from an existing note corpus or moving between backends, preserve these guarantees:

- lossless: content and metadata survive
- round-trippable: export stays possible in a legible form
- verifiable: counts, links, hashes, or other practical checks can confirm integrity

If the user already has markdown files, sidecar JSON, or folder-based raw material, avoid designing a new system that traps them.

## Query behavior

When answering from the second brain:

1. Start with summary, compiled truth, indexes, and current-state files.
2. Read open threads when uncertainty matters.
3. Drop into the timeline or evidence log when chronology, justification, or dispute resolution matters.
4. Consult raw sources when the canonical layer is insufficient or needs verification.

This keeps the query path fast without erasing the evidence trail.
