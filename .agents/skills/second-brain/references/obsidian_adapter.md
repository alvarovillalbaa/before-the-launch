# Obsidian Adapter

Use this reference when the user already keeps their second brain in an Obsidian vault, wants to import from one, or wants Obsidian-compatible outputs without making the system depend on Obsidian.

This reference incorporates the useful ideas from `kepano/obsidian-skills` while keeping the second-brain contract storage-agnostic.

## Core stance

Treat Obsidian as an optional interface and automation layer around a portable knowledge system.

Keep the durable contract the same:

- raw sources stay preserved
- canonical knowledge pages stay source-backed and assistant-maintained
- reports, plans, audits, and other deliverables stay separate from canonical knowledge unless the brain explicitly stores them under `knowledge/`
- metadata, links, and exports should remain legible outside Obsidian

Do not redesign the knowledge base around vault-specific affordances unless the user explicitly wants that tradeoff.

## Mapping the second-brain model onto a vault

Reasonable folder mappings inside an Obsidian vault:

- `raw/` or `Sources/` for intake material
- `knowledge/` or domain folders for canonical topic pages
- `references/`, `cookbook/`, `runbooks/`, `research/`, `official-documentation/`, and `sources/` for the rest of the AFS source-of-truth layer
- `audits/`, `plans/`, and `specs/` for operational artifacts
- `attachments/` or nearby asset folders for images, PDFs, and figures

If the vault already has a different layout, adapt to it. The important mapping is logical, not nominal:

- source layer
- canonical knowledge layer
- operational artifact layer
- optional view or automation layer

## Obsidian Markdown

When working in a vault, Obsidian-flavored markdown is acceptable, but portability still matters.

Use these rules:

- prefer normal markdown structure first: headings, lists, links, and fenced code blocks
- use wikilinks such as `[[Topic Name]]` for internal vault links only when the user's vault already prefers them
- use normal markdown links for external URLs
- keep essential metadata in simple frontmatter or other fields that can survive export
- treat embeds, callouts, and inline adornments as presentation helpers, not as the only place critical facts live
- preserve provenance in the page body or metadata, not only in plugin-specific indexes

Good portable metadata fields:

- `type`
- `status`
- `source`
- `sources`
- `updated`
- `aliases`
- `tags`

Keep metadata shallow and legible. Avoid creating a dense property schema unless the user already relies on one.

## Bases as derived views

Obsidian Bases are useful when the user wants database-like views over notes.

Use Bases for:

- task or work queues
- source coverage dashboards
- review lists
- recent-note indexes
- reading lists
- publication backlogs

Keep this boundary clear:

- notes and canonical pages hold the knowledge
- `.base` files are derived views over that knowledge

Do not treat a Base as the authoritative home of facts that are missing from the notes themselves.

When designing a Base:

- scope it narrowly with filters
- rely on note properties that already exist or are easy to maintain
- use formulas only for derived convenience fields
- remember that `.base` files are YAML views, so validate quoting and field references carefully
- validate the YAML carefully

Equivalent non-Obsidian mapping:

- a Base is conceptually the same as a saved query, spreadsheet-like dashboard, or database view on top of the canonical notes

## Canvas as a visual layer

JSON Canvas files are useful for relationship maps, project landscapes, research clusters, and synthesis boards.

Concrete contract:

- `.canvas` files are JSON
- the top-level shape is typically `{"nodes": [], "edges": []}`
- nodes and edges should have unique IDs and valid references

Use Canvas for:

- visual overviews of a domain
- comparing options or hypotheses
- mapping relationships between people, projects, and concepts
- planning narrative flow for a briefing or presentation

Rules:

- keep the important durable conclusions in canonical pages too
- link canvas nodes back to canonical pages when possible
- do not let a canvas become the only location of important reasoning
- treat canvas files as projections, not as the primary store of truth

Equivalent non-Obsidian mapping:

- a canvas is conceptually the same as a whiteboard, graph map, or visual synthesis artifact generated from the same knowledge base

## CLI and automation

If the user already has the Obsidian CLI or similar vault tooling, use it as a convenience layer for:

- capture
- file moves or renames
- plugin or theme operations when relevant
- bulk vault operations

Do not require the CLI for ordinary second-brain work. File-level workflows should still succeed without it.

Automation rules:

- automation can accelerate capture, indexing, and export
- automation should not hide the canonical knowledge in opaque state
- the operating manual should still define the workflow, not the CLI alone

Equivalent non-Obsidian mapping:

- any repo-local script, MCP server, or helper CLI can fill the same role

## Web capture and Defuddle-style extraction

For standard public web pages, prefer clean markdown extraction over full browser automation when possible.

This is a good pattern when `defuddle` or an equivalent extractor is available:

```sh
defuddle parse https://example.com/article --md -o raw/2026-04-12_example-article.md
```

Use this workflow:

1. preserve the cleaned markdown in the raw layer
2. store the source URL and capture date in the file or nearby metadata
3. absorb the source into canonical pages under `knowledge/` or another mapped canonical area
4. keep any figures or attachments that materially affect the synthesis

If the source is already markdown, fetch it directly.

If the page is dynamic or requires login, fall back to browser automation or another capture method the user already trusts.

## Daily notes, templates, and operational notes

In Obsidian-heavy workflows, users often already have daily notes and templates. Support them, but classify them correctly:

- daily notes are usually raw or first-brain material until compiled
- templates are helpers for repeated structures, not the knowledge model itself
- meeting notes and journals should usually feed canonical pages rather than remain the final destination

If a user has a strong daily-note habit, the assistant should compile those notes into durable topic pages, decision logs, and current-state files instead of leaving the vault as a chronological pile.

## Migration and lock-in rules

When importing from or exporting to an Obsidian vault:

- preserve markdown files and frontmatter
- preserve attachments and local asset references that matter
- preserve link relationships as much as practical
- keep important views and canvases exportable or reconstructable
- avoid introducing structures that only work inside one plugin

The vault can be the current home of the knowledge base. It should not become a trap.
