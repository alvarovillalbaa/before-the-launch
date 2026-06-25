# Web Research Collection

Load this overlay when the task needs current public web evidence and a
Firecrawl-style search, scrape, map, crawl, or interact tool is available.

## Objective

Collect web evidence in a way that is:

- reproducible
- bounded
- credit-aware
- easy to audit later

This overlay is about collection discipline. It does not replace the primary
business-research lane.

## Preflight

Before doing large web collection runs:

1. confirm the collection tool is installed and authenticated
2. check remaining credits and concurrency if the tool exposes them
3. create a `.firecrawl/` working directory if one does not already exist
4. check for existing saved outputs before fetching again

For Firecrawl CLI specifically:

```bash
firecrawl --status
mkdir -p .firecrawl
```

## Escalation Pattern

Default to the lightest command that can answer the question:

| Need | Command | Use when |
| --- | --- | --- |
| Discover sources | `search` | You do not have a URL yet |
| Discover and capture top results in one pass | `search --scrape` | You need search results plus full-page content |
| Extract one known page | `scrape` | The exact URL is known |
| Find the right page on a known site | `map --search` then `scrape` | The site is known but the exact page is not |
| Extract a bounded site section | `crawl` | You need many pages from a section such as `/docs/` or `/blog/` |
| Reveal content behind interaction | `scrape` then `interact` | Clicks, forms, login, pagination, or delayed JS block the evidence |

Hard rules:

- search first when there is no URL
- scrape before interact
- never use interact for web search
- map before crawl when you are not yet sure which pages actually matter
- crawl only bounded sections, not whole sites by default

## Output Hygiene

Unless the user explicitly wants everything inline, save web outputs to
`.firecrawl/`.

Recommended naming patterns:

```text
.firecrawl/search-{query}.json
.firecrawl/search-{query}-scraped.json
.firecrawl/{site}-{path}.md
.firecrawl/{site}-{section}-crawl.json
```

Always quote URLs in shell commands.

Prefer incremental inspection over reading whole files:

```bash
wc -l .firecrawl/file.md
head -50 .firecrawl/file.md
grep -n "pricing" .firecrawl/file.md
jq -r '.data.web[].url' .firecrawl/search.json
```

If `search --scrape` already captured full content, do not re-scrape those
same URLs unless you need:

- a different output format
- fresher capture
- a page that failed in the original scrape pass

## Command Patterns

### Search

Use for discovery, freshness checks, and source finding.

```bash
firecrawl search "acme pricing enterprise" -o .firecrawl/search-acme-pricing.json --json
firecrawl search "acme pricing enterprise" --scrape -o .firecrawl/search-acme-pricing-scraped.json --json
firecrawl search "acme funding" --sources news --tbs qdr:m -o .firecrawl/search-acme-news.json --json
```

Use `--scrape` when the top results themselves are likely to be the evidence
you need.

### Scrape

Use when the exact page is known.

```bash
firecrawl scrape "https://example.com/pricing" --only-main-content -o .firecrawl/example-pricing.md
firecrawl scrape "https://example.com/docs/auth" --wait-for 3000 -o .firecrawl/example-auth.md
```

Prefer plain scrape to question-answer mode when you need reusable evidence.

### Map

Use when the site is known but the subpage is not.

```bash
firecrawl map "https://docs.example.com" --search "authentication" -o .firecrawl/example-docs-auth.txt
firecrawl map "https://example.com" --limit 500 --json -o .firecrawl/example-urls.json
```

Map plus scrape is the standard pattern for large sites:

1. map the site for the relevant page
2. scrape the specific URLs that matter

### Crawl

Use only when the answer needs many pages from a bounded site section.

```bash
firecrawl crawl "https://docs.example.com" --include-paths /docs --limit 50 --wait -o .firecrawl/example-docs-crawl.json
firecrawl crawl "https://example.com" --include-paths /security,/trust --max-depth 2 --wait --progress -o .firecrawl/example-trust-crawl.json
```

Rules:

- always use `--wait` when you need the results now
- use `--include-paths` and `--limit` to keep the crawl bounded
- use `--max-depth` only as deep as needed
- check credit usage before large crawls

### Interact

Use only when scraping a page still misses the needed evidence because the page
requires user actions.

```bash
firecrawl scrape "https://app.example.com/login" --profile example-app
firecrawl interact --prompt "Click the pricing tab and extract the visible plans"
firecrawl interact stop
```

Rules:

- interact depends on a previous scrape
- stop the session when done
- use profiles only when login state or persistent browser state matters

## Lane Plays

### Competitor Intelligence

Preferred collection pattern:

1. `search` competitor plus pricing, docs, release notes, reviews, and
   comparisons
2. `scrape` homepage, pricing, product pages, changelog, and case studies
3. `map --search` on docs or resource centers when the right page is not
   obvious
4. `crawl` only bounded docs or changelog sections when many pages matter

Avoid crawling the whole marketing site when a few product, pricing, and docs
pages answer the decision.

### Diligence

Preferred collection pattern:

1. `search` company plus pricing, trust, security, status, customers, and
   terms
2. `scrape` official product, pricing, security, SLA, terms, and status pages
3. `map --search` for policy or compliance pages hidden in trust centers
4. `crawl` bounded `/security/`, `/docs/`, or `/legal/` sections only when one
   page is not enough

Use web evidence to find blockers, not to create false certainty.

### ICP Research

Preferred collection pattern:

1. `search` segment terms, competitors, and trigger events
2. `scrape` representative company and product pages from likely-fit segments
3. `map --search` on large ecosystems, partner directories, or docs sites
4. `crawl` only if the segment logic depends on many pages in a controlled set

The goal is to learn who to target and who to exclude, not to exhaust the web.

### Account Research And Prospecting

Preferred collection pattern:

1. normalize the company or domain first
2. `search` company plus recent news, funding, hiring, launches, and
   leadership changes
3. `scrape` homepage, about, product, pricing, careers, docs, and proof pages
4. `map --search` when the site is large and you need specific pages such as
   integrations, security, or case studies
5. `interact` only if pricing, product, or customer proof is hidden behind tabs
   or flows

Company-first sequencing still applies. Do not jump to person-level research
before the company looks worth pursuing.

### Customer Research

Public web collection is secondary here. Start with product docs, tickets,
account history, and internal notes first.

Use web collection only to supplement or verify:

- official docs
- release notes
- public product artifacts
- status or trust pages

If public web evidence conflicts with internal sources, preserve the conflict
and escalate instead of blending them.

## Evidence Capture

For every collected web item, preserve:

- the query or discovery path that found it
- the final URL
- the capture mode: search, search-scrape, scrape, map, crawl, or interact
- the capture date
- why the page was included
- whether the claim is direct evidence or later inference

For crawl outputs, also preserve:

- include or exclude paths used
- page limit
- depth limit
- whether the crawl completed fully or was manually bounded

## Failure Modes

- treating search snippets as if they were full evidence
- re-scraping pages already captured by `search --scrape`
- crawling whole sites when only one section matters
- using interact when plain scrape would work
- collecting many pages without a reason each page matters
- loading massive output files directly into context
- mixing stale captures with fresh ones without labeling dates
