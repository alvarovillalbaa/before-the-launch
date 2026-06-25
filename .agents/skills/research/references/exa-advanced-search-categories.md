# Exa Advanced Search Categories

Load this reference when Exa MCP tools are available and the task needs
public-web company discovery, people lookup, expert finding, company-list
building, financial filings, research papers, or personal-site discovery.

## Objective

Use Exa to widen discovery without turning the workflow into an unbounded
search dump. The goal is still a decision artifact, ranked list, evidence
table, or compact brief with visible logic.

## Tool Routing

Prefer `web_search_advanced_exa` whenever the task fits one of Exa's specialized
categories. Use category support before inventing a broad web search pattern.

Use the lightest tool that fits the job:

- `web_search_advanced_exa`
  - default for category-driven discovery, freshness checks, profile lookup,
    paper search, filing retrieval, and personal-site search
- `deep_search_exa`
  - reserve for schema-controlled outputs, ICP inference from a target company,
    or multi-step synthesis after category discovery has already established the
    right candidate set

If Exa is unavailable, fall back to `references/web-research-collection.md`.

## Context Discipline

If the runtime supports task agents or subagents, isolate high-volume Exa work
there and return only compact JSON or distilled markdown. If not, keep the main
context clean by:

1. keeping a compact ledger instead of pasting raw results
2. searching in waves instead of one huge pass
3. deduplicating aggressively after each wave
4. escalating only the weakest remaining gap

## Dynamic Tuning

Do not hardcode result volume. Tune to the request:

- `a few` -> 10-20
- `comprehensive` -> 50-100
- explicit count -> match it
- ambiguous count-sensitive list build -> ask for the target volume

## Query Variation

Exa results change meaningfully with phrasing. For discovery work:

1. generate 2-3 query variations
2. run them in parallel when the runtime allows it
3. merge and deduplicate before synthesis
4. keep only rows that survive relevance review

For ranked lists or evidence tables, store which query surfaced the result.
That helps explain why coverage may be uneven.

## Category Routing

Use categories deliberately:

- `company`
  - primary mode for company discovery and initial account finding
  - good for homepages and rich company metadata such as location, headcount,
    funding, and revenue clues
- `people`
  - primary mode for public LinkedIn profiles and public professional bios
- `personal site`
  - use for portfolio sites, personal blogs, and about pages when profile
    detail or an independent practitioner perspective matters more than LinkedIn
    discovery
- `financial report`
  - use for SEC filings, earnings reports, annual reports, investor
    presentations, and other reporting-period evidence
- `research paper`
  - use for arXiv, OpenReview, PubMed, and academic or scientific literature
- `news`
  - use for press coverage, launches, funding, leadership changes, and
    time-bound momentum checks
- no category with `type: "auto"` or `type: "deep"`
  - use for broader context, deeper dives, or cross-source synthesis after
    specialized-category discovery

Start narrow, then widen:

1. use the specialized category that matches the evidence class
2. use `news` for freshness and timing
3. use uncategorized or deep search only for supporting context or synthesis

## Filter Rules

Respect category limits or searches will fail.

### `category: "company"`

- do not use `includeDomains` or `excludeDomains`
- do not use published-date or crawl-date filters
- use `company` for discovery first, then switch to `news` or uncategorized
  search if domain or date filtering is required

### `category: "people"`

- do not use published-date or crawl-date filters
- do not use `includeText` or `excludeText`
- do not use `excludeDomains`
- use `includeDomains` only for LinkedIn domains if required

### `category: "personal site"`

- supports domain filters, date filters, and text filters
- `subpages` and `subpageTarget` are useful for portfolios or multi-page
  personal sites

### `category: "research paper"`

- supports domain filters, date filters, and text filters
- use this when the user needs venue, methodology, recency, or literature
  coverage controls

### `category: "financial report"`

- supports domain filters and date filters
- `excludeText` is not supported
- `includeText` is supported and useful for targeted risk-factor or topic scans

### Universal text-filter rule

- whenever `includeText` or `excludeText` is supported, treat it as a
  single-item array only
- if the user needs multiple must-have or must-not-have terms, encode them in
  the main query string or run separate searches

## Company Research Pattern

Use this sequence:

1. discover candidate companies with `category: "company"`
2. run one `news` pass for freshness and momentum
3. deepen only the strongest candidates with uncategorized or deep search
4. add a `people` pass only after the company looks worth pursuing

Capture for each kept company:

- canonical company name
- homepage or strongest canonical source
- what it does
- why it is relevant
- dated momentum or timing signals
- confidence and key unknowns

## People Research Pattern

Use this sequence:

1. search by role plus domain, sector, geography, or problem space
2. create 2-3 phrasing variants
3. start with `category: "people"`
4. use `personal site` or uncategorized search only for deeper validation

Capture for each person:

- name
- current role
- company
- why they appear to match
- strongest supporting source
- confidence and ambiguity

Do not imply verified contact data or private access. Treat public LinkedIn or
bio discovery as candidate matching, not final CRM truth.

## Personal Site Pattern

Use this when the user needs practitioner views, portfolio evidence, personal
background detail, or independent tutorials rather than corporate pages.

Sequence:

1. start with `category: "personal site"`
2. use date filters if recency matters
3. use `excludeDomains` to remove aggregators when independent authorship
   matters
4. widen to uncategorized search only if the personal-site index is too thin

Capture for each kept result:

- title or page name
- author or site owner
- published date if visible
- key insight or why it matters
- likely expertise or bias
- confidence and gaps

## Research Paper Pattern

Use this when the job needs literature support, benchmark evidence,
methodological comparison, or recent scientific work.

Sequence:

1. start with `category: "research paper"`
2. use date filters when freshness matters
3. use `includeDomains` for venues such as `arxiv.org` or `openreview.net`
   only when source constraints are important
4. use `includeText` only as a single-item array for one must-have term
5. widen only after the paper search pass is exhausted

Capture for each kept paper:

- title
- authors
- venue or source
- published date
- abstract-level summary or method focus
- why it matters to the business or product question
- confidence and any conflicting findings

## Financial Report Pattern

Use this when the job needs reporting-period evidence rather than general news
or marketing pages.

Sequence:

1. start with `category: "financial report"`
2. use the filing type, company, and reporting period directly in the query
3. use date filters aggressively when the period matters
4. use `includeDomains` for `sec.gov` or investor-relations sites if needed
5. use `includeText` as a single-item array for one topic such as
   `cybersecurity`
6. do not use `excludeText`

Capture for each kept filing or report:

- company name
- filing or report type
- reporting period
- publication date
- why it matters
- key figures, risks, or management commentary
- confidence and any restatement or coverage gaps

## Lead Generation Pattern

Use this when the user wants a list of companies, targets, or leads rather than
just a single account brief.

### 1. Infer the ICP first

If the user says something like "find leads for {company}" and does not define
the ICP clearly:

1. run one small structured pass to infer the target company's product,
   customers, ICP, sub-verticals, and useful enrichments
2. present the inferred ICP before scaling the search
3. confirm or refine:
   - ICP wording
   - sub-verticals to add or remove
   - companies to exclude, especially competitors or existing customers
   - desired lead count
   - enrichment columns that matter

### 2. Expand into micro-verticals

Break a broad ICP into 6-12 mutually distinct micro-verticals or query
families. That improves coverage and reduces duplicate-heavy batches.

For each micro-vertical, define:

- the company pattern
- likely trigger or momentum signal
- exclusions
- useful follow-on people filters if needed

### 3. Search in batches

Run lead discovery in bounded batches by micro-vertical or segment. After each
batch or wave:

1. deduplicate by normalized company name
2. keep the stronger row when duplicates conflict
3. update the score or fit rationale
4. decide whether another wave is still worth running

### 4. Score visibly

Use a simple, explicit fit model. Common inputs:

1. company fit
2. timing or momentum
3. workflow or stack match
4. buyer relevance
5. disqualification risk

If you emit a numeric score such as `icp_fit_score`, explain what moves it up
or down.

### 5. Output discipline

Default to a ranked table first. Export to CSV only when the user asks for a
file or a downstream operational format.

For kept rows, include:

- company name
- what they do
- why they fit
- strongest evidence
- fit score or label
- next action

## Fallback Rules

Use non-Exa collection only when:

- the result set is too thin
- the strongest sources are auth-gated
- the page needs heavy JavaScript or interaction
- you need a bounded crawl across a site section

When falling back, keep the same evidence-class ordering instead of collapsing
back into one vague search.

## Non-Negotiables

- Do not paste raw Exa dumps into the main answer.
- Do not mix discovery results and validated results without saying so.
- Do not treat public-profile discovery as verified CRM truth.
- Do not scale lead generation before the ICP is explicit enough to defend.
- Do not use unsupported category filters just because they would be convenient.
- Do not return ranked lists without visible fit logic and deduplication.
