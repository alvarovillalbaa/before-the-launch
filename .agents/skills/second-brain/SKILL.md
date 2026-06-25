---
name: second-brain
description: Build and maintain a durable, storage-agnostic personal or team knowledge system from notes, meetings, docs, chats, research, code repos, datasets, images, and loose ideas. Use when the user wants to capture raw material, incrementally compile it into a maintained LLM wiki, preserve provenance, consolidate duplicates, run recurring health checks, challenge ideas against prior knowledge, answer complex questions against the maintained wiki, generate reports or rendered artifacts from an evolving knowledge base, or turn recent knowledge updates into recurring publishable outputs without depending on a specific tool such as Obsidian.
metadata:
  short-description: Build a storage-agnostic knowledge base and wiki
---

# Second Brain

Turn scattered raw material into a living knowledge system that is easy to retrieve, update, audit, reuse, and publish from.

This skill is storage-agnostic. Prefer plain folders and markdown or text files unless the user already has an existing tool, database, or knowledge system. Do not assume Obsidian, a plugin ecosystem, or any specific app. If the user already has a workable system, map the workflow onto it instead of forcing a migration.

When the user already works in an Obsidian vault or wants compatibility with one, keep the storage contract portable and load [references/obsidian_adapter.md](./references/obsidian_adapter.md). That reference adapts the second-brain model to Obsidian-style markdown, views, canvas files, CLI helpers, and clean web capture without making any of them required.

One useful mental model is:

- raw sources are collected into a durable source layer
- the assistant incrementally compiles those sources into a maintained markdown wiki
- the user interacts with the compiled knowledge through an editor, file browser, search UI, CLI tools, or another frontend
- answers, reports, slides, plots, or scripts generated from the wiki are treated as artifacts that can themselves be filed back into the system

The goal is not just to store notes. The goal is to make the knowledge base compound:

- new inputs should update existing knowledge, not just create more files
- important answers should flow back into the knowledge base
- important insights should be easy to republish into outputs such as reports, briefings, or daily videos
- contradictions should be surfaced instead of silently preserved
- patterns should be synthesized into durable pages before they disappear

Treat this as an incrementally maintained LLM wiki, not an upload-and-forget document workflow. Do not default to rereading the same raw sources from scratch for every question when a maintained canonical wiki can carry the synthesis forward. Query-time retrieval can still help, but the main asset is the wiki that compounds across ingests.

## The compound loop

For work sessions that involve planning, execution, or research, use this six-phase cycle. Each cycle makes the next one faster by returning structured knowledge to the base:

1. **Brainstorm** — accept raw input (notes, transcripts, problem statements); auto-search the knowledge base for relevant prior context before elaborating
2. **Plan** — structure the brainstorm into an actionable plan using conclusion-first (Pyramid Principle) format; launch parallel research agents to surface past work, knowledge base insights, and stale knowledge that may affect the plan
3. **Confidence** — assess what the system knows versus assumes versus does not know; produce a readiness level (high / medium / low) and specific gap-closing actions before proceeding
4. **Review** — run two parallel critics: one for strategic alignment (goal clarity, falsifiable hypotheses) and one for data accuracy (sourcing, baselines, freshness)
5. **Work** — execute the plan in dependency order; log progress back to the plan file; route decisions and insights into the knowledge base immediately
6. **Compound** — extract 1–3 durable learnings from the session, check for contradictions, save with YAML frontmatter, update indexes

See [references/compound_loop.md](./references/compound_loop.md) for the full workflow including research agents, review agents, and the YAML schema.

This loop is not required for every session. Use it when a session involves real decision-making, planning, or research that should inform future cycles. Skip it for simple lookups or minor ingest passes.

Another useful mental model from larger personal-brain systems is:

- the interface can change, but the knowledge contract should stay stable
- the harness can stay thin, while the workflow intelligence lives in the operating manual and skill
- canonical pages should separate current understanding from historical evidence instead of mixing both into one undifferentiated note

## AFS compatibility modes

This skill is AFS-first. AFS means Agentic File System, with a standard layout for memory, operational work, and source-of-truth content.

Support these modes:

- **Strict AFS**: if the user has no meaningful second-brain structure yet, create one and follow AFS directory names directly.
- **Partial adaptation**: if the user or company already has conventions that mostly work, keep them, but map them explicitly onto AFS in `BRAIN.md`.
- **Full adaptation**: if the user or company already has a mature structure, leave it in place and use `BRAIN.md` only to explain how it maps to AFS roles and how the assistant should behave inside it.

Rules:

- default to **Strict AFS** only when the target area has no existing second-brain contract
- prefer **Partial adaptation** over migration when the existing system is workable but inconsistent
- use **Full adaptation** only when the user's own standard is already the real source of truth
- every second brain should still have a discoverable `BRAIN.md` file, even in partial or full adaptation mode

## Brain boundaries and discovery

Treat each `BRAIN.md` as the root marker for one second brain.

Rules:

- a single repo, codebase, workspace, or database can contain more than one second brain
- detect this by counting `BRAIN.md` files before doing broad setup, migration, or cleanup work
- scope work to the nearest relevant `BRAIN.md` instead of assuming the entire repo is one brain
- if several `BRAIN.md` files exist, do not merge structures across them unless the user explicitly asks
- if no `BRAIN.md` exists for the target area, create one before large-scale second-brain work
- if the user already has `AGENTS.md`, `CLAUDE.md`, `README.md`, or another instruction file, reference it from `BRAIN.md` rather than replacing it blindly

## Use this skill for

- Building a personal or team knowledge base from documents, meetings, chats, bookmarks, screenshots, research, or loose notes.
- Building a research wiki from articles, papers, repositories, datasets, images, and derived notes.
- Converting a pile of raw inputs into a maintained wiki with topic pages and an index.
- Consolidating duplicate notes across people, tools, and time periods into canonical pages.
- Saving a conversation, work session, or meeting back into the knowledge base as linked updates instead of a single dump note.
- Restoring continuity at the start of a session by loading identity, current state, recent logs, and only the minimum deep context needed.
- Producing answers, reports, briefings, or research outputs grounded in the knowledge base.
- Running a full compound loop — brainstorm → plan → confidence → review → work → compound — to make each cycle accelerate the next.
- Assessing readiness before committing to a plan: knowing vs. assuming vs. missing.
- Extracting 1–3 durable learnings from a session and saving them in searchable YAML-fronted knowledge files.
- Producing markdown deliverables, slide decks, plots, or other rendered artifacts from the knowledge base instead of only returning terminal text.
- Exporting a portable snapshot or graph view of the knowledge base for other tools, agents, or review workflows.
- Turning idea fragments into scoped projects, plans, or operating procedures when the user wants execution structure, not just storage.
- Turning recent wiki changes into daily publishable outputs such as avatar-video scripts, video logs, narrated briefs, or other recurring media artifacts.
- Running recurring health checks to catch contradictions, unsupported claims, stale pages, or missing topics.
- Maintaining decision logs, reusable procedures, and unresolved questions without losing provenance.
- Challenging a current plan against prior notes, decisions, and failure history.
- Surfacing hidden patterns across days, projects, sources, or domains.

## Core philosophy

Most note systems make the user act as librarian and janitor. This skill inverts that. The assistant should do the organizing, linking, consolidation, synthesis, publication, and maintenance work so the user can focus on thinking and operating.

The human curates sources, asks questions, and decides what matters. The assistant maintains the wiki: summarizing sources, updating canonical pages, repairing cross-references, surfacing contradictions, and carrying insight forward into future sessions.

The assistant should operate as a writer and compiler of understanding, not as a filing clerk. The question is not only where a fact belongs. The question is what the source means, what it changes, and which maintained pages should become more coherent because of it.

Treat the second brain as a living system:

- It should get smarter after each ingest.
- Existing pages should be revised when new evidence arrives.
- The structure should stay navigable without relying on app-specific affordances.
- The system should preserve enough context that future sessions do not restart from zero.
- The system should be able to speak outward through repeatable outputs, not just sit as an archive.

Use the following mental model:

- the knowledge base is the codebase
- the operating manual is the schema and workflow contract
- the assistant is the maintainer that keeps the system coherent

Do not make the user carry the maintenance burden when the assistant can touch multiple files, propagate changes, and keep the wiki consistent in one pass.

## AFS-first architecture

There is still a logical architecture, but the physical default should be AFS.

The logical layers are:

- **Memory**: compact retained context such as logs, lessons, durable facts, and fixes
- **Operational**: active work areas such as audits, raw intake, plans, specs, and domain-specific operating folders
- **Source of truth**: canonical knowledge, references, guides, documentation, research, and monitored sources
- **Schema**: one `BRAIN.md` file per brain root that tells the assistant how this specific brain maps onto AFS

When the user has no existing structure, default to these top-level areas:

- `BRAIN.md`
- `logs/`
- `lessons/`
- `items/`
- `fixes/`
- `audits/`
- `raw/`
- `plans/`
- `specs/`
- `references/`
- `cookbook/`
- `knowledge/`
- `runbooks/`
- `research/`
- `official-documentation/`
- `sources/`

This is the default contract:

- `logs/` holds terse dated logs. Append to the latest `YYYY-MM-DD.md` file and keep each entry to two lines max.
- `lessons/` stores lessons learned from experience, especially engineering lessons that should change future behavior.
- `items/` stores durable facts about the user, team, company, customers, environments, and other factual context.
- `fixes/` stores reusable error solutions and debugging resolutions.
- `audits/` stores comprehensive reports and analytical audits, usually under timestamped folders such as `audits/YYYY-MM-DD/`.
- `raw/` is the intake queue for unprocessed material to be compiled into the brain.
- `plans/` stores implementation plans and plan-driven-development artifacts.
- `specs/` stores desired-state documents and spec-driven-development artifacts.
- `references/` stores code, API, and URL references in a flat non-timestamped layout.
- `cookbook/` stores "how we actually do this here" guides in a flat non-timestamped layout.
- `knowledge/` stores maintained timeless knowledge in a structured non-timestamped layout.
- `runbooks/` stores operational procedures in a flat non-timestamped layout.
- `research/` stores continuous research work in a flat non-timestamped layout.
- `official-documentation/` stores external official documentation in a flat non-timestamped layout.
- `sources/` stores URL-based source registries worth monitoring over time in a flat non-timestamped layout.

Use top-level domain folders only when the user already has them or when a domain genuinely needs its own operational surface, such as `health/` or `investing/`. Do not use them as a substitute for canonical knowledge when `knowledge/` is the better home.

Do not require a database. Prefer folders plus markdown or text files unless the user explicitly wants another storage mechanism.

Do not assume the knowledge base must live in Obsidian. A plain folder of markdown files is enough. If the user already uses Obsidian or another tool, treat it as the editor or interface around the files, not as a required architectural dependency.

Treat the interface layer separately from storage:

- storage is where the AFS folders and their files live
- frontend or IDE is whatever the user uses to browse, search, read, and render those files
- automation or helper CLIs are optional tools that operate on the stored knowledge but do not define the architecture

Architecture precedence:

- existing user or company architecture always wins
- existing repo or workspace conventions come next
- strict AFS is the default only when no workable second-brain standard already exists

Storage backends are interchangeable as long as the knowledge contract survives:

- plain markdown files are still the default because they are portable and easy to inspect
- a local database, structured store, or custom app is acceptable if the user already has one
- any richer backend should still preserve canonical pages, source provenance, history, and exportable artifacts without lock-in
- if the system has a CLI, MCP server, search index, or automation layer, treat that layer as replaceable plumbing around the maintained knowledge rather than as the knowledge model itself

## Knowledge taxonomy

For the maintained knowledge base and other non-timestamped canonical folders, standardize around nested subject taxonomy unless the user already has a better one.

Default pattern:

```text
knowledge/<domain>/<subject>/<topic>/<case>/
```

Examples:

```text
knowledge/engineering/backend/rate-limiting/provider-x/
knowledge/product/activation/onboarding/enterprise-trial/
knowledge/company/customers/acme/renewal-2026/
```

Rules:

- stop at the lowest level that adds real retrieval value; do not pre-create empty depth
- use stable human-readable slugs unless the user already has an established naming scheme
- keep canonical knowledge non-timestamped by default
- put dated evidence inside files or timeline sections rather than encoding every knowledge file by date
- keep `references/`, `cookbook/`, `runbooks/`, `research/`, `official-documentation/`, and `sources/` flat unless the user already relies on deeper structure
- when a canonical page does not justify its own folder, a single markdown file is enough inside the appropriate parent directory

Suggested logical subareas inside `knowledge/` when the user wants more structure:

- `knowledge/<domain>/sources/` for durable source summary pages
- `knowledge/<domain>/entities/` for people, companies, tools, teams, customers, or other named entities
- `knowledge/<domain>/concepts/` for themes, ideas, methods, technologies, or recurring concepts
- `knowledge/<domain>/projects/` for project or initiative pages
- `knowledge/<domain>/synthesis/` for cross-source comparisons, reviews, and durable analyses

These are optional categories, not required folders. Use them only when they improve retrieval and maintenance.

## Minimum viable setup

When the user is starting from zero, keep setup AFS-compliant but still small:

```text
my-second-brain/
  BRAIN.md
  logs/
  raw/
  references/
  knowledge/
```

Add the rest of the AFS folders lazily as the workflow actually needs them.

Default meaning of the minimum folders:

- `BRAIN.md` is the discovery file and operating contract for this brain
- `logs/` stores brief dated change logs
- `raw/` stores unprocessed material waiting for compilation
- `references/` stores flat references worth reusing directly
- `knowledge/` stores the maintained canonical knowledge

## Operating-manual file contract

Each second brain should have one `BRAIN.md` at its root.

`BRAIN.md` is the mandatory discovery marker. In partial or full adaptation modes, it can reference `AGENTS.md`, `CLAUDE.md`, `SCHEMA.md`, `SECOND_BRAIN.md`, `README.md`, or another instruction file the user already uses, but `BRAIN.md` should still exist so the assistant can detect the brain boundary reliably.

Its job is to make the assistant behave like a disciplined knowledge maintainer instead of a generic chatbot.

If the user already has an architecture, `BRAIN.md` should describe that architecture rather than replacing it with the default one.

`BRAIN.md` should define:

- what the brain is about
- which compatibility mode it uses: strict, partial, or full adaptation
- the root scope of the brain
- where raw inputs live
- where canonical knowledge lives
- where logs, plans, specs, audits, and domain folders live
- whether `raw/` is transient or retained after ingest
- the preferred link style
- required page structure or metadata
- the taxonomy rules for `knowledge/`
- the topics, people, projects, or domains that deserve extra attention
- propagation rules for updates
- maintenance rules for synthesis, reconciliation, health checks, and recurring publication
- any provider credentials or environment variables used for automated outputs

The operating manual should also define the default workflow for three recurring actions:

- ingesting a new source into `raw/` and propagating it into `knowledge/`, `references/`, `cookbook/`, `runbooks/`, or another AFS destination
- answering a question from the maintained canonical knowledge before falling back to raw sources
- linting or health-checking the brain for contradictions, stale claims, and orphan knowledge

If the user has no instruction file, use a template like this:

```md
# BRAIN

## Scope
A personal or team second brain about [TOPIC OR DOMAIN].

## Compatibility Mode
strict-afs

## Structure
- `logs/` contains brief dated change logs. Append to the current date file and keep entries to two lines max.
- `raw/` contains incoming source material waiting for compilation.
- `references/` contains flat code, API, and URL references.
- `knowledge/` contains canonical maintained knowledge using `knowledge/<domain>/<subject>/<topic>/<case>/...`.
- `plans/`, `specs/`, and `audits/` are used when the work produces those artifacts.
- `cookbook/`, `runbooks/`, `research/`, `official-documentation/`, and `sources/` are flat source-of-truth support areas.

## Writing Rules
- Search before creating a new page.
- Update canonical pages instead of creating near-duplicates.
- Preserve source references for non-obvious claims.
- Mark inferred statements explicitly.
- Clear or archive `raw/` according to the retention rule after successful compilation.

## Canonical Knowledge
- Every durable topic gets its own `.md` file or case folder inside `knowledge/`
- Every canonical knowledge file starts with a short summary paragraph
- Maintain `knowledge/INDEX.md`
- Append major operations to `logs/YYYY-MM-DD.md`
- Link related pages using the preferred project link style

## Focus Areas
- [INTEREST 1]
- [INTEREST 2]
- [INTEREST 3]
```

If the user already has instruction files, extend them rather than creating redundant parallel files.

## Context bootstrap files

When the system is active and the user wants continuity between sessions, maintain a small set of lightweight context files. Use only the files that add value for the user.

Recommended files:

- `knowledge/INDEX.md` — catalog of important pages and major topics
- `logs/YYYY-MM-DD.md` — append-only dated operation and change log
- `items/CRITICAL_FACTS.md` — tiny file for current, high-salience facts that matter in many sessions
- `items/IDENTITY.md` or `items/SOUL.md` — enduring role, preferences, values, and communication context
- `plans/CURRENT_STATE.md` — active priorities, open threads, and near-term focus
- `items/PINNED.md` — temporary task-specific facts or schemas that should survive a long working session or context compaction

Rules:

- keep `CRITICAL_FACTS.md` short and current
- use `knowledge/INDEX.md` as the first navigation aid before broad searching when it exists
- append to the current dated log file in `logs/`; do not rewrite history unless the user explicitly wants cleanup
- keep every log entry to two lines max
- keep `PINNED.md` short, task-specific, and disposable; clear or archive it when the task is done
- if the user already uses root-level continuity files, map the concept onto them instead of forcing new files blindly

If the user wants recurring published outputs, store the durable registry in the narrowest AFS-compatible destination, such as:

- `knowledge/communications/publishing/daily-videos/registry.md`
- `knowledge/communications/publishing/daily-briefs/registry.md`

Do not require a separate `outputs/` or `videos/` directory if the user's system already stores media logs elsewhere.

## Core operating model

Every captured item should be classified into one or more of these buckets:

- **Fact**: Something observed or stated that can be cited.
- **Decision**: A choice that was made, with owner and date when available.
- **Procedure**: A repeatable process, checklist, or SOP.
- **Insight**: A synthesis or interpretation derived from multiple facts.
- **Open question**: Something unresolved that needs follow-up.
- **Task**: A concrete next action when the user wants work tracking inside the second brain.

Prefer this model over generic meeting-note dumping.

## Canonical page contract

For durable topics, prefer a page model that separates current understanding from historical evidence.

- **Compiled truth**: the current best understanding of the topic. This section is rewritten when new evidence arrives.
- **Open threads**: unresolved questions, contradictions, missing data, or active follow-ups.
- **Timeline or evidence log**: append-only dated evidence, events, observations, or source-backed change notes.

This is the storage-agnostic equivalent of the "above the line / below the line" model:

- above the line is the maintained, rewritten synthesis
- below the line is the preserved historical evidence trail

Do not let canonical pages collapse into undifferentiated chronological dumps. The page should answer "what is true now" before it answers "how did we learn this."

When the user wants a concrete page schema, read [references/page_model.md](./references/page_model.md).

## Incremental wiki rules

Treat every new source as a trigger to improve the maintained wiki, not merely as retrieval fodder for later.

When new evidence arrives:

- preserve the source in the raw layer
- create or update a source summary page when durable ingestion is wanted
- update every relevant canonical page, not just one note
- strengthen cross-references between topics, entities, projects, and decisions
- note where new information confirms, extends, or contradicts earlier claims
- refresh the index, logs, and any affected synthesis pages

When answering questions:

- read the smallest useful set of wiki pages first
- use raw sources mainly to verify, deepen, or resolve ambiguity
- prefer answers grounded in already-maintained pages because that is where synthesis, contradiction handling, and cross-source structure should live
- if a valuable answer produces a reusable new synthesis, write it back into canonical knowledge or another narrow AFS-compatible destination

Do not treat query-time retrieval as the whole system. Retrieval is a helper. The maintained wiki is the compounding asset.

If the user is migrating from an older note system, a vault, a database, or an existing corpus, preserve these invariants:

- **lossless**: preserve all source content, metadata, and sidecars that matter
- **round-trippable**: prefer representations that can be exported back into legible files or the user's prior shape
- **verifiable**: validate counts, hashes, links, or other practical checks after migration when the corpus is large or important

## Input handling

Accept raw text, transcripts, document excerpts, task lists, URLs, screenshots, exports, audio transcripts, or existing notes.

Raw inputs can also include richer research artifacts such as:

- articles and papers
- repository snapshots or code excerpts
- dataset descriptions or analysis notes
- downloaded images and figures that the assistant may need to reference during synthesis
- derived outputs from prior runs such as reports, slide decks, or plots

Normalize immediately:

- Dates -> `YYYY-MM-DD`
- Names -> full name or canonical team label
- Sources -> explicit source label such as `Meeting`, `Doc`, `Slack`, `Email`, `Research`, `Bookmark`, `Screenshot`, `Recording`, or `First Brain`
- Status -> `active`, `superseded`, `open`, `archived`, or another project-local status when relevant

If the same claim appears in multiple places, keep one canonical statement and record supporting sources instead of duplicating the sentence.

If the knowledge already contains user-authored notes, statements, or durable pages written manually, treat that material as a first-class source labeled `First Brain`. Use `First Brain` to mean the user's own memory, judgment, handwritten notes, or prior durable knowledge.

Raw-input rules:

- Save originals to the input layer when the user wants durable ingestion.
- Treat `raw/` according to the retention rule in `BRAIN.md`. In strict AFS it is usually a transient staging area, not a permanent archive.
- A single ingest should often update several canonical pages, not just create one summary note.
- Do not confuse imported source preservation with synthesis.
- New sources should usually produce both a source-specific summary and changes to existing topic, entity, concept, project, or decision pages.

## Research compilation loop

When the user is building a serious research knowledge base, use this default loop:

1. Collect source material into the raw layer.
2. Normalize or convert it into portable local formats such as markdown, text, images, or lightweight metadata files when useful.
3. Incrementally compile the canonical wiki from the raw layer instead of treating the raw layer as the final system.
4. Update indexes, hub pages, backlinks, and synthesis pages so the wiki stays navigable as it grows.
5. Answer questions against the maintained wiki first, using raw sources mainly for verification, deeper inspection, or contradiction resolution.
6. File valuable outputs back into the system when they improve future retrieval or reasoning.

The assistant should behave like a compiler and maintainer for the wiki, not merely a chat layer over a bag of files.

## Detailed wiki-compiler playbook

For large compilation, cleanup, gap-finding, or reorganization work, read [references/wiki_compiler.md](./references/wiki_compiler.md). That reference imports the strongest parts of the external personal-wiki workflow while keeping them storage-agnostic.

For page-level structure, migration, and query semantics, also read [references/page_model.md](./references/page_model.md) when the task involves:

- designing or revising the canonical page schema
- migrating from another tool or storage backend
- preserving both current truth and historical evidence on the same topic
- adapting the skill to a database, MCP service, CLI, or other non-file interface without changing the knowledge contract

Load that reference when the task involves any of these modes:

- ingesting a batch of sources into the raw layer and propagating them through the wiki
- absorbing or compiling recent or historical material into canonical pages
- answering questions from the maintained wiki instead of rereading raw sources
- cleaning up a messy wiki that needs structural rewrites, not just local edits
- finding missing pages, missing themes, or missing relationships
- reorganizing taxonomy, splitting bloated pages, or merging overlapping pages

If the user explicitly mentions Obsidian, a vault, wikilinks, Bases, Canvas, or the Obsidian CLI, also read [references/obsidian_adapter.md](./references/obsidian_adapter.md). Use it to map the portable AFS contract onto those tools while keeping notes, metadata, provenance, and exports portable.

## Operational modes

When the user asks for a concrete action rather than a broad architecture discussion, load [references/operational_modes.md](./references/operational_modes.md).

Use that reference to interpret requests such as:

- initialize or bootstrap the knowledge base
- save this conversation, capture this meeting, or file this work session
- ingest this source or update the second brain with this document
- run a synthesis sweep, pattern scan, or contradiction pass
- create today's note, restore context, or load the world state
- export a portable snapshot or generate a graph, canvas, or atlas view
- challenge this idea, connect two domains, or graduate an idea into a project
- run a health audit, lint pass, or scheduled maintenance workflow
- assess confidence before committing to a plan (know vs. assume vs. missing)
- execute a plan with dependency tracking and execution logging
- extract learnings and compound them back into the knowledge base

Treat these as storage-agnostic modes, not slash-command requirements. If the user already has commands, scripts, or buttons for them, map the mode onto those entry points.

For work sessions that span all phases — brainstorm through execution and compound — load [references/compound_loop.md](./references/compound_loop.md).

Available commands in this plugin:

- `/ingest` — fetch any source (Twitter/xurl, YouTube, LinkedIn, web URL, PDF, or local file), save to `raw/`, and optionally compile into canonical knowledge immediately.
- `/compile-raw` — process all unprocessed files in `raw/` in one pass, handling mixed source types automatically.
- `/learning-sync` — capture durable engineering lessons and update repo-local learning artifacts.

## Multi-source ingestion

For source-specific fetch, parse, and normalize instructions, read [references/ingest_sources.md](./references/ingest_sources.md).

That reference covers all supported source types with concrete CLI commands:

- **Twitter / X** — fetch tweets, threads, and profile timelines via the `xurl` CLI. Use the 6-step research loop (Decompose → Search → Follow Threads → Deep-Dive → Synthesize → Save) for multi-angle topic research.
- **LinkedIn** — personal data export or page capture via `defuddle` or `agent-browser`.
- **Web URLs** — clean article extraction via `defuddle`, `curl`+`pandoc`, or `agent-browser` for dynamic pages. Supports batch ingestion from a URL list file.
- **YouTube** — transcript extraction via `yt-dlp --skip-download --write-auto-sub`. No download required. Supports single videos and full playlists.
- **Research papers and PDFs** — text extraction via `pdftotext` (poppler), `mutool`, or Python `pdfplumber`. Metadata via `pdfinfo`.
- **Images and screenshots** — OCR via `tesseract` when text content matters; otherwise inspect visually during compilation.
- **Plain markdown and text files** — direct absorb with frontmatter normalization.

All collected material is saved to `raw/YYYY-MM-DD_<source-type>_<slug>.md` with a standard frontmatter block before any compilation step.

For the raw/ compilation agent loop and type-detection heuristics when processing a mixed queue of file types, see `references/ingest_sources.md#raw-folder-compilation-agent-loop`.

## Optional automated source collection

If the user wants to pull web content directly into the knowledge base, treat browser automation or scraping as an optional collection layer, not as part of the storage model.

Collection rules:

- Save collected material into `raw/` or the user's equivalent source layer as plain text or markdown when possible.
- Prefer the lightest capture method that preserves the useful content:
  - direct markdown or text fetch when the source already exposes a clean format
  - clean article extraction for standard web pages
  - browser automation only when the page is dynamic, cluttered, or requires an authenticated session
- Do not bind the knowledge base to a single collector. The collector is replaceable; the folder structure and operating manual are the durable part.

For standard public web pages, prefer a clean markdown extractor before heavier browser automation. If `defuddle` or an equivalent cleaner is available, this is a good pattern:

```sh
defuddle parse https://example.com/article --md -o raw/2026-04-12_example-article.md
```

Treat that file as a captured source in `raw/`, then run normal absorb or compile steps against it. Clear or archive it afterward when the brain's retention rule says `raw/` should stay transient. If the source is already a `.md` file, fetch it directly instead of reprocessing it through an extractor.

If the environment supports `agent-browser` and the user wants a concrete CLI option, this is a reasonable example:

```sh
npm install -g agent-browser
agent-browser install
```

Typical flow:

```sh
agent-browser open https://example.com/article
agent-browser get text "article"
```

Use this kind of workflow to extract the page text, then save the result into `raw/` for normal ingest. If another browser automation tool or scraper is already available, adapt to it instead of forcing `agent-browser`.

If the user already uses a browser clipper, download helper, export script, or another ingestion utility, keep it. Treat these as replaceable ingest helpers. The durable system is the stored raw corpus plus the maintained wiki, not the collection mechanism.

When images or figures matter, prefer storing them locally alongside the captured source or in a nearby asset folder so the assistant can inspect and reference them during compilation.

## Frontend and editor stance

The user may prefer to browse the knowledge base through Obsidian, a plain editor, a repo UI, a file manager, a custom web app, or a terminal workflow. All of these are valid.

Rules:

- treat the frontend as a view over the files, not as the source of truth
- do not make the knowledge base dependent on editor-specific metadata or plugins unless the user explicitly wants that
- if the user already has a strong frontend preference such as Obsidian, support it without rewriting the storage model around it
- if a tool can render markdown, slides, diagrams, or images from the stored files, treat that as a convenience layer rather than a required dependency

If the user mentions Obsidian, Marp, or similar tools, position them as optional viewing and rendering frontends around a portable file-based knowledge base.

When the user wants a concrete Obsidian-oriented workflow, read [references/obsidian_adapter.md](./references/obsidian_adapter.md) and treat Obsidian-specific files as optional projections over the same durable source and knowledge layers.

## Living-system rules

Adopt these rules unless the user or repo conventions explicitly conflict:

- Search before creating.
- Prefer rewriting or extending an existing canonical page over creating a parallel near-duplicate.
- Never create a new page in isolation without checking where else it belongs.
- If a page keeps accreting subtopics, split it instead of endlessly appending.
- Do not confuse page creation with progress. A touched page should become more useful, not merely longer.
- Every meaningful write should propagate to other relevant pages such as indexes, project pages, decision logs, board views, or daily logs.
- Every meaningful answer derived from the knowledge base should usually produce two outputs:
  - the answer for the user
  - the durable update back into the knowledge base when the answer contains reusable insight
- Every recurring media output should leave a durable text trace even if the actual media asset lives in an external provider.
- When patterns emerge across multiple sources, create a synthesis page instead of leaving the pattern implicit.
- When a contradiction appears, resolve it explicitly or track it as an open conflict.
- Avoid orphan pages. Every durable page should be reachable from an index, a hub page, a project page, or related notes.

## Fact history and change tracking

When facts change over time, do not simply overwrite the old value. Preserve both:

- when the fact was true
- when the knowledge base learned it

Use a lightweight history block, timeline section, or structured metadata such as:

```md
## Fact History

- Fact: Architect at Example Co
  - Valid from: 2026-04-07
  - Valid until: present
  - Learned: 2026-04-07
  - Source: [[2026-04-07 meeting]]

- Fact: CTO at Example Co
  - Valid from: 2024-01-01
  - Valid until: 2026-04-07
  - Learned: 2026-02-23
  - Source: [[2026-02-23 notes]]
```

This is optional but strongly preferred for fast-changing roles, decisions, statuses, responsibilities, and beliefs.

Benefits:

- historical queries remain possible
- reconciliations can distinguish contradiction from evolution
- the user can trace when the system changed its view
- the system can keep current state without erasing history

## Wiki structure rules

Unless the user specifies otherwise:

- Create `knowledge/INDEX.md` first.
- Create one canonical page per durable topic, concept, project, customer, process, person, or decision area.
- Start each wiki page with a short summary paragraph.
- Follow the retention rule in `BRAIN.md` for `raw/`. In strict AFS, treat `raw/` as a transient ingest queue and clear or archive processed material once its knowledge has been propagated. In partial or full adaptation modes, preserve originals when the user's system requires it.
- Update existing pages when new evidence arrives instead of creating parallel near-duplicates.
- Mark superseded content explicitly rather than silently overwriting history.
- Preserve source references for non-obvious claims.
- When writing knowledge derived from `raw/`, include the source or sources in the written knowledge rather than leaving provenance implicit.
- When merging manually written prior knowledge, cite `First Brain` as the source unless the user identifies a more specific origin.

Use the link style that fits the user's environment:

- plain markdown links by default for portability
- wiki-links such as `[[topic-name]]` only if the user's system already prefers them

## Canonical page types

These are recommended defaults, not required folders:

- topic or concept page
- person or entity page
- project page
- decision page or decision section
- daily or session log page
- review page
- synthesis page
- task or board page if the user wants operational tracking

For repeated note types, prefer a consistent page schema over improvised prose.

For high-signal topic pages such as people, projects, companies, concepts, and decisions, strongly prefer a standard internal structure:

- short summary or current-state paragraph first
- compiled truth or current understanding near the top
- open threads near the middle if they matter
- timeline, evidence log, or fact history lower on the page
- provenance or source section that makes verification straightforward

## Output contract

Unless the user asks for a different format, produce these sections in order:

### 1. Summary

- What this knowledge bundle is about in 2-4 bullets
- The most important new information
- The single most important unresolved item

### 2. Canonical notes

- One note or page update per concept, project, customer, process, or decision area
- Each note starts with a one-line title
- Each note contains only material facts, decisions, procedures, insights, open questions, and optional tasks

### 3. Decision log

- `Date | Decision | Owner | Why | Source`

### 4. Open loops

- Outstanding questions, missing data, blocked dependencies, and next checks

### 5. Recommended maintenance

- What should be merged, rewritten, archived, or revisited next

For recurring media workflows, add these sections when relevant:

### 6. Publishable brief

- Topic title
- 60-second brief or script
- Why this topic was chosen now

### 7. Delivery log

- Output destination such as `knowledge/communications/publishing/daily-videos/registry.md`
- External URL or local artifact path
- Follow-up updates that should be written back into canonical knowledge

Do not assume the only useful output is terminal text. Depending on the request, the best artifact may be:

- a markdown note or report filed into `audits/`, `plans/`, `specs/`, or `knowledge/` depending on what it is
- a new or updated canonical wiki page
- a slide deck in markdown slide format such as Marp or another presentation format the user already uses
- an image, chart, or plot saved locally
- a structured comparison, checklist, or decision memo

When an output is useful beyond the immediate session, prefer rendering it into a durable file rather than only replying inline.

## Broadcast and daily-video workflow

Use this branch of the skill when the user wants the second brain to speak outward through a recurring artifact such as a daily video, narrated brief, or short post generated from the knowledge base.

### Topic-selection rules

- Read the operating-manual file first, then inspect the canonical knowledge layer rather than raw material alone.
- Prefer the single most interesting insight, update, or cross-topic connection added or changed in the last 24 hours.
- If nothing is recent, pick the most underexplored durable topic instead of repeating a recently covered one.
- Check the existing recurring-output registry such as `knowledge/communications/publishing/daily-videos/registry.md` before choosing a topic.
- Avoid topics already covered in the last 7 days unless the user explicitly wants a follow-up.

### Script rules

- Default to a 60-second script of roughly 120-170 words unless the user specifies a different length.
- Write in a direct, curious, first-person voice, like a smart friend sharing something genuinely interesting.
- End with one open question that makes the audience think.
- Output only the words to be spoken unless the user explicitly asks for production notes.
- Keep claims traceable to the wiki or mark them as inferred.

### Delivery rules

- Treat the media provider as replaceable. The second brain owns topic selection, script generation, logging, and feedback loops; the render provider is just a delivery mechanism.
- If the user specifies a provider such as HeyGen, follow that provider's API contract and use credentials from environment variables or another approved secret store.
- For HeyGen, use `HEYGEN_API_KEY` from `.env` or the existing environment when available, submit the script prompt to the video-generation endpoint, poll until completion, and capture the final video URL.
- Never commit secrets or write API keys into tracked files.
- Report progress at each major step when actively running the pipeline.

### Logging rules

- Append one durable entry per published artifact to the recurring-output registry.
- Prefer a format like `## YYYY-MM-DD | Topic Title` followed by `**Brief:**`, `**Video:**`, and optional `**Sources:**` lines.
- Never delete past entries; the log is cumulative.
- If the provider stores the media remotely, still keep the brief and URL locally so the next run can avoid repetition.
- If the script reveals a reusable synthesis, update the relevant wiki page and index as part of the same run.

## Build workflow

### 1. Gather first, organize second

When the user is starting from scratch or adding a new batch of material:

- Put everything into the raw/input layer first
- Do not spend time hand-organizing filenames unless retrieval truly depends on it
- Treat the raw layer as the inbox or junk drawer

### 2. Read the operating manual before writing

- Read the project operating-manual or schema file first
- Infer missing conventions from the existing knowledge base if the file is incomplete
- Inspect the user's current architecture and preserve it whenever it is already workable
- If no instruction file exists, create a minimal one before large-scale compilation
- Only introduce the default AFS layout when the user has no meaningful existing structure

### 2.5. Default compile prompt

When the user wants the assistant to perform the first compilation pass from a raw folder, a good default instruction is:

```text
Read everything in `raw/`. Then compile maintained knowledge following `BRAIN.md`. Create or refresh `knowledge/INDEX.md` first, then create or update canonical pages under `knowledge/<domain>/<subject>/<topic>/<case>/...` as needed. Link related pages. Summarize sources into durable knowledge. Preserve provenance. Update existing canonical pages instead of creating duplicates. Clear or archive processed `raw/` material if the brain's retention rule requires it.
```

Adapt the prompt to the user's real folder names when they already have a different layout.

### 3. Extract atomic items

Break the input into atomic units. A single paragraph may contain several items. Split aggressively when doing so improves later retrieval.

### 4. Classify

Assign each item to Fact, Decision, Procedure, Insight, Open question, and optionally Task.

### 5. Compile the wiki

When asked to build or refresh the knowledge base:

- read everything relevant in the raw/input layer
- create or refresh `knowledge/INDEX.md` or the mapped equivalent
- create or refresh source summary pages when durable source-level summaries add retrieval value
- create or update one page per major topic
- summarize each source into durable knowledge, not transcript sludge
- connect related pages
- keep provenance attached to claims
- write source-backed knowledge so a reader can tell whether a statement came from `raw/`, `First Brain`, or multiple sources
- rewrite the compiled-truth portions of touched pages so current understanding stays current
- append new evidence to timeline or evidence sections instead of rewriting history
- revise existing pages where the new source changes the system's understanding instead of appending untouched parallel notes
- record contradictions, supersessions, and strengthened consensus explicitly when sources disagree or evolve

### 6. Propagate updates

Whenever you create or update a durable page, also check:

- should `INDEX.md` change
- should the current dated file in `logs/` record this operation
- should a project page, decision page, or daily log reference it
- should a board or task list reflect new work
- should a synthesis page be created or refreshed
- should a recurring-output registry or media log be updated

Avoid single-file updates that leave the rest of the system stale.

### 7. Merge with existing knowledge

- Prefer updating an existing canonical page over creating a parallel one
- If two pages overlap, keep the clearer title and fold the weaker one into it
- Record contradictions rather than smoothing them away
- If the user already has a good wiki, preserve its stable page titles and link patterns instead of renaming everything to match a new template

### 7.5. Ingest workflow for a single new source

Use this concrete workflow when the user says things like "ingest this source", "add this document", or "update the second brain with this":

1. Preserve the source in the raw layer if durable ingestion is wanted.
2. Read the operating manual and the relevant index or hub pages before writing.
3. Extract key claims, entities, concepts, decisions, procedures, open questions, and dates.
4. Search the wiki for existing canonical pages that should absorb the new information.
5. Create or update a source summary page if the source deserves its own durable page.
6. Update every affected canonical page with rewritten current-state synthesis, citations, and contradiction notes where needed.
7. Append the dated supporting evidence to the timeline or evidence section instead of hiding it inside the summary.
8. Refresh `INDEX.md`, `LOG.md`, and any synthesis or output registries touched by the change.
9. Report what changed, what remains uncertain, and what new questions the source introduced.

### 8. Save generated work separately

- Put reports, briefings, comparisons, and Q&A outputs into the narrowest AFS-compatible destination
- Do not confuse generated outputs with canonical source-backed wiki pages
- If an output contains durable new insight, promote that insight back into canonical knowledge with a source marker
- For recurring video workflows, keep the cumulative registry in canonical knowledge or another mapped AFS destination even if render artifacts live externally

### 8.5. Make the system compound

- Ask questions against the maintained wiki before rereading all raw sources.
- Save valuable answers into the narrowest AFS-compatible destination or promote them into canonical knowledge pages when they contain reusable synthesis.
- Treat every good answer as a chance to make the next answer better.
- Run periodic health checks so mistakes do not silently compound across future updates and outputs.

## Query and thinking workflow

When the user wants a synthesis rather than raw note cleanup:

- start with the index, current-state files, and the smallest useful set of canonical wiki pages
- prefer current-state or compiled-truth sections before diving into timelines
- prefer using prebuilt wiki pages over rereading all raw documents from scratch
- drop to raw sources when the wiki lacks enough detail, when provenance needs verification, or when the user explicitly asks for direct source analysis
- collapse duplicates first
- group pages by theme, decision area, project, person, or timeframe
- pull forward only what matters now
- separate observation from recommendation
- end with what changed, what still matters, and what to do next

For many small-to-medium knowledge bases, do not assume a fancy RAG stack is required. A maintained wiki with good indexes, source summaries, and short canonical pages is often enough for the assistant to answer complex questions well. Retrieval tools can help, but they are helpers around the maintained wiki, not substitutes for it.

When the environment has richer retrieval or a structured backend, prefer this query order:

1. navigation artifacts such as indexes, current-state files, and hub pages
2. keyword or lexical matches across canonical pages
3. semantic or embedding-assisted retrieval when available
4. structured filters such as type, date, tag, entity, or source metadata

The skill should adapt to whichever layers exist. Do not require any one retrieval technology.

High-value thinking workflows:

- **Challenge**: test a current claim or plan against prior decisions, failures, reversals, and recorded doubts
- **Emerge**: scan recent material for unnamed patterns, recurring blockers, energy drains, or strategic themes
- **Connect**: bridge two domains by tracing shared people, patterns, concepts, or structures
- **Graduate**: turn a captured idea fragment into a scoped project, plan, or procedure
- **World**: load identity, current state, and active priorities from the smallest useful subset of files

Common high-value prompts and tasks:

- identify the biggest gaps in understanding on a topic
- compare two or more sources and surface disagreement
- write a briefing, memo, or report using only the knowledge base
- list unresolved questions that block better decisions
- extract SOPs or reusable playbooks from repeated evidence
- pressure-test a strategy with the user's own historical evidence
- surface patterns from the last week or month that the user has not named explicitly
- write a daily 60-second script from the most meaningful recent wiki change
- review recent video logs and pick the next undercovered topic
- identify which canonical topics have never been turned into a publishable output

## Continuity workflow

When the user wants the second brain to reduce session-reset cost, prefer a progressive context load:

- **L0 — tiny always-needed context**: load `CRITICAL_FACTS.md`, `PINNED.md`, and the shortest identity file available
- **L1 — navigation**: load `INDEX.md` and recent `LOG.md` entries
- **L2 — current state**: load `CURRENT_STATE.md`, today's daily/session note, recent daily logs, active projects, and open boards when they exist
- **L3 — deep context on demand**: only then load full project pages, raw sources, or dense topic pages needed for the current question
- if the task is complex enough that losing 10-20 facts would be expensive, propose or maintain a short `PINNED.md` with schemas, identifiers, or current decisions
- when the task is done, clear or archive the pinned material so the continuity layer stays lightweight

The goal is to avoid full-vault reads when a small set of curated files can restore context faster.

## Reviews, recaps, and schedules

The second brain can support recurring maintenance even without app-specific automations.

Suggested recurring workflows:

- daily note or session log refresh
- nightly consolidation of the day's changes
- daily video or narrated-brief generation from the wiki
- weekly review
- monthly review
- periodic health audit
- periodic synthesis sweep across recent sources

If the environment supports automation, common storage-agnostic schedules are:

- morning refresh: update today's note, pull due work, and summarize overnight changes
- nightly consolidation: close the day, reconcile contradictions, synthesize patterns, rescue orphans, and refresh indexes
- weekly review: summarize wins, blockers, decisions, and open loops
- periodic health run: audit links, duplicates, stale claims, concept gaps, and unsupported assertions

## Companion tools and extensions

As the knowledge base grows, the user may want lightweight helper tools around it. These are optional and should remain subordinate to the file-based wiki.

Useful examples:

- a small local search CLI over `knowledge/`, `references/`, and `raw/`
- scripts that collect or normalize source material into markdown and local assets
- renderers that turn wiki content into slides, charts, plots, or publishable briefs
- validators that check link integrity, missing metadata, empty sections, or unsupported claims
- a thin MCP or API layer that exposes search, read, write, ingest, and export workflows to other clients
- derived view layers such as Obsidian Bases or other queryable dashboards that sit on top of notes
- visual map layers such as Canvas or other graph boards that summarize relationships without replacing canonical pages

When such tools exist:

- use them as accelerators, not as replacements for the canonical wiki
- keep their inputs and outputs legible as files when possible
- prefer CLIs or simple scripts the assistant can call as part of larger workflows
- keep workflow intelligence in the operating manual, skill, and durable page contract rather than burying it entirely inside application code

Advanced frontier work such as synthetic data generation or fine-tuning may be worth exploring for very mature knowledge bases, but it is not the default. The first priority is a clean raw corpus, a well-maintained wiki, durable outputs, and recurring quality checks.

If the environment supports scheduled agents, background jobs, cron, or platform-native automations, the assistant can propose them. If not, keep the workflow manual or checklist-based. Do not assume hooks, MCP servers, or app-specific automation are available.

Conservative automation rules:

- safe autonomous work may add, update, link, summarize, or generate recurring scripts
- safe autonomous work may call approved delivery APIs and append output logs
- safe autonomous work may refresh daily notes, indexes, logs, synthesis pages, and lightweight graph exports when the user has explicitly enabled that maintenance loop
- destructive work such as merging, archiving, deleting, or resolving ambiguous contradictions should require explicit approval

If the user explicitly asks for an automated daily run:

- inspect the environment first and choose the scheduling mechanism that fits it best, such as `launchd`, `cron`, `systemd`, a repo-local workflow, or another platform-native scheduler
- schedule the same knowledge -> script -> delivery -> log pipeline, not a separate one-off shortcut
- keep the implementation storage-agnostic; wire it to the user's current knowledge-base layout instead of assuming a fixed folder naming scheme
- use environment variables or another approved secret store for API keys
- tell the user exactly what was created, where it lives, how often it runs, and how to disable it

## Recurring health check

Run a periodic health check on the knowledge base, especially after major imports or at least monthly for active systems.

The user may call this a health check, audit, or "lint the wiki". Treat these as the same core workflow.

The health check should:

- flag contradictions between wiki pages
- find topics that are mentioned but never actually explained
- list claims in the wiki that are not backed by a source in the raw/input layer
- identify stale pages that have not been updated after new evidence arrived
- identify orphan pages that are not linked from any useful hub, index, or project page
- flag required metadata or structure that is missing from repeated note types
- suggest a small number of new pages or source imports to close important gaps
- compare recurring-output logs against the wiki to find over-covered topics and untouched topics
- if the system uses search indexes, embeddings, or structured mirrors, verify they are still in sync with canonical content

When the audit is large enough to produce many findings, group them by severity:

- critical: contradictions, broken links in major hubs, unfilled template placeholders in canonical pages
- warning: stale claims, concept gaps, duplicates, missing metadata, overdue operational pages
- info: orphan pages, empty folders, weak cross-links, low-value clutter

Offer safe fixes automatically when they are clearly reversible or low-risk. Ask before destructive merges, archives, or ambiguity-heavy contradiction resolution.

Treat this as quality control. Errors compound when generated knowledge is reused without audit.

When the audit is broad rather than local, use the cleanup, breakdown, rebuild, and reorganize guidance from [references/wiki_compiler.md](./references/wiki_compiler.md) instead of treating the work as a simple note tidy-up.

## Provenance rules

- Every important claim should be traceable to a raw source or an explicitly marked inference
- Knowledge compiled from `raw/` should carry its source inline or in an adjacent source field, section, or citation block
- Existing manually written knowledge should be treated as sourced material under the label `First Brain`
- If a statement is supported by both user-authored knowledge and imported material, retain both sources rather than collapsing to one
- If a claim is inferred rather than directly stated, mark it `(inferred)` and explain why in one line
- Keep source labels lightweight but explicit
- Do not mix verbatim evidence and synthesis without marking the difference
- When a script or video brief is generated from multiple wiki pages, preserve the contributing pages in the log entry or adjacent notes

## Coverage review workflow

Use this when the user wants to close the loop between the canonical knowledge layer and recurring published outputs.

- Review the recurring-output registry together with canonical knowledge and the raw/input layer.
- List the topics that appear most often in recurring outputs.
- Identify durable wiki pages that have never appeared in a published output.
- Find the biggest gap where the user clearly cares about a topic in raw notes but has not yet promoted it into the wiki or outputs.
- Suggest the next raw inputs, wiki updates, or output topics that would close that gap.

## Failure modes to avoid

- treating the second brain like a transcript archive
- requiring a specific app or plugin stack when folders and files are enough
- requiring a specific storage tool such as Obsidian when a plain-folder system is already working
- cramming too much material into a few giant pages because they already exist
- creating lots of thin pages that never become useful
- repeating the same idea across multiple pages with slightly different wording
- dropping source context during cleanup
- hiding uncertainty by smoothing conflicting notes into one statement
- mixing canonical wiki pages with generated reports
- producing long prose when a durable page structure would be more reusable
- appending new notes forever without revising older canonical pages
- writing answers from the knowledge base without feeding durable insights back into it
- generating recurring media without logging what was published
- allowing orphan pages, stale indexes, or stale current-state files to accumulate

## Quality bar

- Every important claim is traceable
- Every decision has a date and owner when available
- Every unresolved topic lands in Open loops
- The resulting wiki is easier to retrieve from than the source material
- Existing pages become more accurate, connected, and current after new inputs
- Canonical pages read like coherent topic pages rather than event logs or transcript dumps
- Important reusable answers usually leave a durable trace in the knowledge base
- Recurring published outputs are selected intentionally rather than by repetition
- The storage layout stays portable and tool-agnostic unless the user explicitly wants a tool-specific implementation
