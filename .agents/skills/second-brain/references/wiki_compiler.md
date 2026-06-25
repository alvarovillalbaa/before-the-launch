# Wiki Compiler Playbook

Use this reference when the user wants the second brain to behave like an actively maintained wiki compiler rather than a passive note store.

This playbook is storage-agnostic. It assumes a raw/source-intake layer and a canonical knowledge layer, but it does not require Obsidian, plugin metadata, or any specific frontend. Adapt filenames, link styles, and helper files to the user's existing system.

## Stance

The assistant is not a filing clerk. The assistant is a writer and maintainer of understanding.

The job is not to ask, "Where should this fact go?" The job is to ask:

- what this source means
- what it changes in the current understanding
- which existing pages should become richer
- which new pages are justified by repeated evidence

Every meaningful source should be absorbed somewhere in canonical knowledge. "Absorbed" does not mean appended to the nearest page. It means interpreted, connected, and woven into the maintained wiki.

## When to load this reference

Load this file when the task is any of the following:

- the first large compilation pass from a raw corpus
- ingesting a batch of sources and propagating them through the wiki
- answering questions against the maintained wiki instead of raw sources
- cleaning up a messy wiki
- finding missing pages, missing patterns, or broken structure
- reorganizing, splitting, or merging parts of the knowledge base

## Operational modes

Treat these as workflows, not slash commands. Use the names that fit the user's system.

### Ingest

Goal: convert or preserve source material so it can be compiled predictably.

Rules:

- preserve originals in the raw layer when durable ingestion is wanted
- normalize dates, names, and source labels early
- split compound exports into logical entries when that improves retrieval
- keep the ingest step mechanical where possible
- if the source has attachments or images that matter, keep them near the entry so they can be inspected during compilation

Typical source types:

- journals and personal notes
- markdown or text files
- chat logs and message exports
- emails
- CSV or spreadsheet rows
- article captures and bookmarks
- meeting transcripts
- repository notes, code excerpts, and research artifacts

### Absorb

Goal: compile raw material into maintained wiki pages.

Default loop:

1. Process entries in a stable order, usually chronological for diary-like material or source-grouped for research corpora.
2. Read the index and the most relevant existing pages before editing.
3. Re-read any page immediately before updating it.
4. Decide what the new source changes, clarifies, contradicts, or strengthens.
5. Update every affected canonical page, not just the most obvious one.
6. Create new pages only when repeated evidence or narrative weight justifies them.
7. Refresh indexes, backlinks, and logs at the end of the pass.

Inside each touched page, maintain the split between rewritten synthesis and preserved evidence:

- rewrite the compiled-truth or current-state section
- keep unresolved ambiguity in open threads
- append the dated supporting evidence to the timeline or evidence log

Questions to ask during absorption:

- what new facet does this source add
- what does this reveal about a person, project, decision, pattern, or tension
- what existing page should become more coherent because of this
- what emerging pattern now deserves its own page

### Query

Goal: answer from the maintained wiki first.

Rules:

- start from the index, hub pages, current-state files, and the smallest useful set of canonical pages
- consult raw sources mainly for verification, ambiguity resolution, or deeper inspection
- do not reread the entire raw corpus when maintained pages already carry the synthesis
- do not modify the wiki during a read-only query unless the user explicitly wants durable write-back

Good query behavior:

- lead with the answer
- cite the wiki pages used
- connect evidence across pages
- acknowledge gaps instead of guessing
- use timeline sections mainly when chronology or dispute resolution matters, not as the first thing the reader has to parse

### Cleanup

Goal: audit and enrich existing pages so the wiki becomes more coherent over time.

Common checks:

- diary-like structure instead of thematic structure
- bloated pages that hide subtopics
- stubs that should be merged or expanded
- missing links to already-existing pages
- broken or stale summaries
- unsupported claims
- pages that were updated mechanically but never rewritten into a coherent whole
- pages where current understanding and historical evidence have collapsed into one noisy section

Parallel cleanup is fine when available, but every worker should read the target page directly and judge it as a full article, not as an isolated paragraph patch.

### Breakdown

Goal: find and create missing pages.

Look for:

- named people, teams, companies, places, tools, and projects that appear repeatedly
- recurring themes, tensions, identities, or behavioral loops
- decisions, transitions, and experiments that have enough evidence to deserve their own page
- heavily linked or frequently mentioned topics that still have no canonical page

Do not create pages for trivial passing mentions. The test is whether the topic has enough material to say something non-obvious and useful.

### Rebuild

Goal: refresh machine-friendly navigation artifacts.

Examples:

- `knowledge/INDEX.md`
- `knowledge/BACKLINKS.json`
- `knowledge/ABSORB_LOG.json`

Use the user's actual filenames if they already have equivalents. These are helpers, not architecture requirements.

### Reorganize

Goal: step back and improve structure.

Use this mode when:

- several pages overlap heavily
- one page has become a dumping ground for multiple subtopics
- a category is too broad to stay navigable
- a pattern, tension, or relationship is trapped inside another page and deserves a page of its own

## What deserves its own page

Usually yes:

- people with repeated presence or a distinct role
- projects with meaningful commitment
- decisions with traceable reasoning
- transitions, eras, setbacks, and experiments
- recurring themes, philosophies, identities, and tensions
- source summaries for dense or strategically important sources

Usually not yet:

- a person or tool mentioned once in passing
- a topic with less than a few meaningful sentences of substance
- a generic technology unless the user has a real learning arc or operating history around it

## Anti-cramming and anti-thinning

Two failure modes matter:

- cramming: forcing new information into a few oversized pages because they already exist
- thinning: creating lots of shallow pages that never become useful

Use these counter-rules:

- if a page keeps accreting subtopics, split it
- if a new page cannot become substantively useful yet, keep the material on a parent page and wait
- every touched page should become meaningfully better, not just longer
- every new page should add navigational clarity or conceptual clarity

## Checkpoint cadence

During a large absorb pass, pause every 10-20 meaningful entries or at another sensible batch size and inspect the system:

- rebuild the index and backlinks if needed
- check whether zero new pages were created in the batch, which may indicate cramming
- inspect the most heavily edited pages as whole documents
- split pages that are becoming dumping grounds
- confirm the directory or taxonomy still reflects the material

## Optional taxonomy

Taxonomy should emerge from the corpus. Do not pre-create a huge directory tree unless the user wants it.

Common page families:

- `people/`
- `projects/`
- `places/`
- `companies/`
- `concepts/`
- `patterns/`
- `philosophies/`
- `tensions/`
- `identities/`
- `decisions/`
- `transitions/`
- `eras/`
- `experiments/`
- `setbacks/`
- `relationships/`
- `communities/`
- `strategies/`
- `techniques/`
- `ideas/`
- `artifacts/`

These are examples, not a mandate. Prefer the user's existing taxonomy when it already works.

## Writing standards

### Golden rule

The page is about the topic's role in the subject domain, not a generic encyclopedia entry about the topic in the abstract.

Examples:

- a book page is about what the book changed for the person or team
- a project page is about its conception, development, outcome, and consequences
- a person page is about their role, influence, and relationship over time

### Tone

Prefer a flat, factual, encyclopedic tone. Let evidence carry significance.

Avoid:

- hype
- editorial filler
- rhetorical questions
- vague intensifiers
- narration that reads like inspirational storytelling

Prefer:

- short factual sentences
- explicit attribution for subjective judgments
- dates, specifics, and source-backed claims
- direct quotes only when they carry real weight

### Narrative coherence

Every page should have a point. The reader should understand why the topic matters.

Bad pattern:

- page as chronological dump
- section headings based on isolated incidents

Better pattern:

- page organized by role, theme, phase, mechanism, or consequence

### Structure by page type

Recommended structures:

- person: role, relationship phases, influence, conflicts, later developments
- place: what happened there, what it enabled, what it came to represent
- project: conception, development, outcome, aftereffects
- decision: situation, options, reasoning, choice, consequences
- pattern: trigger, loop, costs, attempts to change it
- philosophy: thesis, development, tests, exceptions, tensions
- transition: what ended, the uncertain period, what emerged
- era: setting, key work, relationships, emotional tenor, turning points

### Quote discipline

Use quotes sparingly. One or two sharp quotes are usually enough for a page. The page should not turn into a stitched transcript.

### Provenance

Every non-obvious claim should have traceable support. Use source fields, citation blocks, or brief inline provenance markers that fit the user's system.

### Page-state discipline

When reviewing a mature page, ask:

- does the top of the page tell me the current truth quickly
- are unresolved threads explicit
- is history preserved lower on the page instead of smeared into the summary
- could this page be exported into another storage backend without losing meaning

## Concurrency and edit safety

When doing multi-file maintenance:

- never overwrite or delete a file you have not read
- re-read a page immediately before editing it
- do not rebuild indexes or backlink files until the end of the command or maintenance pass
- if several pages are being updated in parallel, keep ownership boundaries clear
