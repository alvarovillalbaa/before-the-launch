---
name: seo-and-geo
version: 1.3.0
description: >-
  Use for SEO, GEO, and AEO work: keyword research, on-page optimization,
  AI-citation readiness, technical SEO audits, content gap analysis,
  competitor benchmarking, structured data, Core Web Vitals,
  internationalization, entity optimization, backlink analysis, content
  refreshes, LLM discovery files (llms.txt, agent-card.json), and monitoring.
  Trigger when the user wants better search visibility in traditional or AI
  search systems, or when setting up a site for AI agent discoverability.
---

# SEO + GEO + AEO: Complete Optimization Skill

Three disciplines. One mission: make content discoverable by both humans and machines.

- **SEO** — Rank in Google, Bing, and traditional search engines
- **GEO** — Get cited by ChatGPT, Claude, Perplexity, Gemini, and other AI assistants
- **AEO** — Appear as direct answers in AI Overviews, featured snippets, and voice results

These disciplines share 80% of their practices. The 20% that differs matters enormously.

---

## Audit Inputs

When running an audit, gather these before proceeding:

1. **URL or domain** — the site to audit (or a topic/keyword for keyword research mode)

2. **Audit type** — default to **full site audit** if not specified:
   - **Full site audit** — end-to-end SEO review covering all sections below
   - **Keyword research** — identify keyword opportunities for a topic or domain
   - **Content gap analysis** — find topics competitors rank for that the user doesn't cover
   - **Technical SEO check** — crawlability, speed, structured data, infrastructure
   - **Competitor SEO comparison** — head-to-head benchmarking against specific competitors

3. **Target keywords or topics** (optional)

4. **Competitors** (optional) — if not provided and needed, use web search to identify 2-3 likely competitors based on the domain and keyword space.

---

## Initial Assessment

Check for project context before starting:

1. Read `AGENTS.md` or any product/marketing context file if present
2. Identify the site type: SaaS, e-commerce, blog, documentation, local business, media
3. Identify the primary goal: traffic, citations, brand awareness, conversions
4. Identify current weak points: technical issues, thin content, no AI visibility

**Ask only what isn't in context:**
- What pages/keywords are priority?
- Who are the top competitors?
- Is there access to Google Search Console?
- What's the primary audience: humans searching Google, or AI-assisted researchers?

---

## Which Discipline to Apply

Use this decision framework:

| Situation | Primary Focus |
|-----------|---------------|
| Site not ranking in Google | SEO — Technical + On-page |
| Site ranks but gets no clicks | AEO — Featured snippets + SERP appeal |
| Brand not mentioned by AI assistants | GEO — Content authority + citation patterns |
| All three lacking | Full-stack: SEO foundation → AEO structure → GEO signals |
| New page being published | All three simultaneously |
| Existing page refresh | Audit first, then targeted improvements |

---

## The Optimization Stack

Apply in order — each layer depends on the one below:

```
Layer 4: GEO — AI citation authority
         ↑ requires trust signals, depth, named sources

Layer 3: AEO — Answer extraction
         ↑ requires clear structure, question-answer format

Layer 2: On-page SEO — Relevance signals
         ↑ requires crawlable, indexable content

Layer 1: Technical SEO — Foundation
         (crawlability, speed, indexation)
```

Fix technical issues before optimizing content. Fix on-page before chasing AI citations.

> **Writing new SEO content?** Use the `content-writing` skill — it includes the full SEO writing workflow: CORE-EEAT pre-write checklist, keyword map, title optimization (3 options), meta description, featured snippet formatting, and on-page SEO self-check. This skill (`seo-and-geo`) focuses on auditing and optimization of existing content and sites.

---

## Technical SEO: Foundation Checklist

**Crawlability**
- `robots.txt` does not block important pages
- XML sitemap exists, is valid, and submitted to Search Console
- No redirect chains (A→B→C — consolidate to A→C)
- No soft 404s returning 200 status
- Important pages reachable within 3 clicks from homepage

**AI Bot Access** (critical for GEO — verify these bots are allowed in `robots.txt`):

| User Agent | Provider | Purpose |
|-----------|----------|---------|
| `GPTBot` | OpenAI | Training data |
| `OAI-SearchBot` | OpenAI | Real-time search indexing |
| `ChatGPT-User` | OpenAI | ChatGPT browsing |
| `ClaudeBot` | Anthropic | Training |
| `Claude-User` | Anthropic | Real-time user query fetching |
| `Claude-SearchBot` | Anthropic | Search index quality |
| `PerplexityBot` | Perplexity | Answer engine retrieval |
| `Google-Extended` | Google | Gemini AI training + AI Overviews |
| `BingBot` | Microsoft | Copilot + Bing AI |
| `Amazonbot` | Amazon | Alexa / Amazon search |
| `Applebot-Extended` | Apple | Siri / Apple Intelligence |
| `FacebookBot` | Meta | Meta AI features |
| `meta-externalagent` | Meta | External agent access |
| `Bytespider` | ByteDance | TikTok AI features |

**Anthropic three-bot framework:** `ClaudeBot`, `Claude-User`, and `Claude-SearchBot` are independently controllable. Blocking one does not block the others. Allow all three on public pages.

**robots.txt template** — allows all AI search bots while blocking training-only crawlers:
```
User-agent: *
Allow: /
Disallow: /dashboard
Disallow: /api/v1/
Disallow: /auth/

User-agent: GPTBot
User-agent: OAI-SearchBot
User-agent: ClaudeBot
User-agent: Claude-User
User-agent: Claude-SearchBot
User-agent: PerplexityBot
User-agent: Google-Extended
User-agent: BingBot
User-agent: Applebot-Extended
Allow: /
Allow: /llms.txt
Allow: /llms-full.txt

# Block training-only (won't affect citations)
User-agent: CCBot
Disallow: /

Sitemap: https://example.com/sitemap.xml
```

Quick check: `curl -s "https://example.com/robots.txt"`

**Review quarterly** — new AI crawlers appear regularly. ClaudeBot has doubled its crawl rate in recent quarters.

**Indexation**
- Canonical tags on all pages (`<link rel="canonical">`)
- No `noindex` on pages that should rank
- www/non-www and HTTP/HTTPS consistency
- Trailing slash consistency across the site

**Core Web Vitals** (Google ranking factor)
- LCP (Largest Contentful Paint) < 2.5s
- INP (Interaction to Next Paint) < 200ms
- CLS (Cumulative Layout Shift) < 0.1

**Mobile-first**
- Responsive design (not separate m.site)
- Same content served to mobile and desktop
- Tap targets ≥ 48px
- Viewport meta tag configured

For deep technical SEO: see [`references/technical-seo.md`](references/technical-seo.md)

For Next.js/React implementation: see [`references/nextjs-implementation.md`](references/nextjs-implementation.md)

---

## Technical SEO: Full Audit Process (9-Step)

Use this structured workflow when performing a dedicated technical SEO audit. Produces a scored health report (0–100) with critical/high/medium issue triage and a prioritized implementation roadmap.

**Inputs needed:** URL or domain, robots.txt/sitemap access, PageSpeed Insights data (or screenshots).

### Step 1: Audit Crawlability

```markdown
## Crawlability Analysis

### Robots.txt Review

**URL**: [domain]/robots.txt
**Status**: [Found/Not Found/Error]

| Check | Status | Notes |
|-------|--------|-------|
| File exists | ✅/❌ | [notes] |
| Valid syntax | ✅/⚠️/❌ | [errors found] |
| Sitemap declared | ✅/❌ | [sitemap URL] |
| Important pages blocked | ✅/⚠️/❌ | [blocked paths] |
| Assets blocked | ✅/⚠️/❌ | [CSS/JS blocked?] |
| Correct user-agents | ✅/⚠️/❌ | [notes] |

**Issues Found**: [list]
**Recommended robots.txt**: [provide corrected version if needed]

---

### XML Sitemap Review

**Sitemap URL**: [URL]  **Status**: [Found/Not Found/Error]

| Check | Status | Notes |
|-------|--------|-------|
| Sitemap exists | ✅/❌ | |
| Valid XML format | ✅/⚠️/❌ | [errors] |
| In robots.txt | ✅/❌ | |
| Submitted to Search Console | ✅/⚠️/❌ | |
| URLs count | [X] | [appropriate?] |
| Only indexable URLs | ✅/⚠️/❌ | |
| Includes lastmod (accurate) | ✅/⚠️ | |

---

### Crawl Budget Analysis

| Factor | Status | Impact |
|--------|--------|--------|
| Crawl errors | [X] errors | [Low/Med/High] |
| Duplicate content | [X] pages | [Low/Med/High] |
| Redirect chains | [X] found | [Low/Med/High] |
| Orphan pages | [X] found | [Low/Med/High] |

**Crawlability Score**: [X]/10
```

### Step 2: Audit Indexability

```markdown
## Indexability Analysis

### Index Status Overview

| Metric | Count | Notes |
|--------|-------|-------|
| Pages in sitemap | [X] | |
| Pages indexed | [X] | [source: site: search] |
| Index coverage ratio | [X]% | [good if >90%] |

### Index Blockers Check

| Blocker Type | Found | Pages Affected |
|--------------|-------|----------------|
| noindex meta tag | [X] | [list or "none"] |
| noindex X-Robots | [X] | [list or "none"] |
| Robots.txt blocked | [X] | [list or "none"] |
| Canonical to other | [X] | [list or "none"] |
| 4xx/5xx errors | [X] | [list or "none"] |
| Redirect loops | [X] | [list or "none"] |

### Canonical Tags Audit

| Check | Status | Notes |
|-------|--------|-------|
| Canonicals present | ✅/⚠️/❌ | [X]% of pages |
| Self-referencing on unique pages | ✅/⚠️/❌ | |
| Consistent (HTTP/HTTPS) | ✅/⚠️/❌ | |
| Consistent (www/non-www) | ✅/⚠️/❌ | |

### Duplicate Content Issues

| Issue Type | Count | Examples |
|------------|-------|----------|
| URL-based duplicates | [X] | [URLs] |
| Parameter duplicates | [X] | [URLs] |
| WWW/non-WWW | [X] | [notes] |

**Indexability Score**: [X]/10
```

### Steps 3–9 (use reference templates)

For detailed output templates for each step, see [`references/technical-audit-templates.md`](references/technical-audit-templates.md):

3. **Site Speed & Core Web Vitals** — LCP/FID/CLS/INP, TTFB, FCP, resource loading breakdown, optimization recommendations
4. **Mobile-Friendliness** — Mobile-friendly test, responsive design, mobile-first indexing verification
5. **Security & HTTPS** — SSL certificate, HTTPS enforcement, mixed content, HSTS, security headers
6. **URL Structure** — URL patterns, dynamic params, session IDs, redirect chains and loops
7. **Structured Data** — Schema markup validation, missing schema opportunities
8. **International SEO** — Hreflang implementation, language/region targeting (if applicable)
9. **Audit Summary** — Overall health score (0–100), critical/high/medium issue triage, quick wins, 4-week implementation roadmap, monitoring recommendations

### Validation Checkpoints

- Every recommendation cites specific data points (not generic advice)
- All issues include affected URLs or page counts
- Performance metrics include actual numbers with units (seconds, KB)
- Source of each data point clearly stated (crawl data, PageSpeed, user-provided, or estimated)

### Issue Severity Framework

| Severity | Examples | Response Time |
|----------|---------|---------------|
| **Critical** | robots.txt blocking site, noindex on key pages, site-wide 500 errors | Same day |
| **High** | Slow page speed, missing hreflang, duplicate content, redirect chains | Within 1 week |
| **Medium** | Missing schema, suboptimal canonicals, thin content pages | Within 1 month |
| **Low** | Minor CLS issues, non-essential schema missing | Next quarter |

**Reference files:**
- [`references/technical-audit-example.md`](references/technical-audit-example.md) — Full worked example (cloudhosting.com audit) and comprehensive checklist
- [`references/http-status-codes.md`](references/http-status-codes.md) — HTTP status codes SEO impact, redirect best practices, crawl budget
- [`references/robots-txt-reference.md`](references/robots-txt-reference.md) — robots.txt syntax guide, platform templates, common mistakes, emergency fixes

---

## On-Page SEO: Relevance Signals

**Title tag** (50-60 characters)
- Primary keyword in first half
- Unique per page
- Compelling reason to click

**Meta description** (150-160 characters)
- Includes primary keyword
- States specific value: what the user will learn/get
- Starts with an action verb (not "Master")

**Heading structure**
- Single H1 with primary keyword
- Logical hierarchy: H1 → H2 → H3 (no skipping levels)
- H2s answer real user questions ("What is X?", "How does X work?")

**Content**
- Primary keyword in first 100 words
- Topic fully covered (not just surface-level)
- Satisfies search intent: informational / commercial / transactional / navigational
- Better depth than current top-ranking competitors

**Images**
- Descriptive filename (`closures-javascript-example.png` not `img001.png`)
- Alt text describes the image meaningfully
- WebP format, compressed, lazy-loaded

**Internal linking**
- Minimum 3-5 contextual links to related content per page
- Descriptive anchor text (not "click here" or "read more")
- No orphan pages (every page linked from at least one other)

For content strategy: see [`references/content-optimization.md`](references/content-optimization.md)

### Per-Page Audit: 11-Step Workflow

When auditing a single page, follow this sequence and produce structured output for each step:

1. **Gather page info** — URL, target keyword(s), page type (blog/product/landing/service), business goal
2. **Title tag** — length (50-60 chars), keyword in first half, uniqueness, compelling copy
3. **Meta description** — length (150-160 chars), keyword, CTA, uniqueness
4. **Header structure** — single H1 with keyword, logical H1→H2→H3 hierarchy, keyword variations in H2s
5. **Content quality** — word count vs. query-type benchmark, comprehensiveness, E-E-A-T signals, formatting
6. **Keyword usage** — placement across title/H1/first 100 words/URL/alt text; density 0.5-2.5%; LSI terms
7. **Internal links** — count (3-5+ per 1,000 words), anchor text quality, relevance, broken links
8. **Images** — alt text on all images, descriptive filenames, file sizes (<200KB), WebP format, lazy loading
9. **Technical on-page** — URL structure, canonical tag, mobile-friendly, LCP, HTTPS, schema type
10. **CORE-EEAT quick scan** — 17 on-page-relevant E-E-A-T items (see template in reference file)
11. **Audit summary** — overall score (0-100), priority issues (critical/important/minor), quick wins, action checklist

**Scoring weights (section → points):**

| Section | Weight | Max |
|---------|--------|-----|
| Title Tag | 15% | 15 pts |
| Meta Description | 5% | 5 pts |
| Header Structure | 10% | 10 pts |
| Content Quality | 25% | 25 pts |
| Keyword Optimization | 15% | 15 pts |
| Internal/External Links | 10% | 10 pts |
| Image Optimization | 10% | 10 pts |
| Page-Level Technical | 10% | 10 pts |

**Content length benchmarks** (for "sufficient length" scoring):

| Query Type | Min for full marks | Minimum |
|-----------|-------------------|---------|
| Informational | 1,500+ words | 500 words |
| Commercial | 1,200+ words | 400 words |
| Transactional | 500+ words | 200 words |
| Local | 400+ words | 150 words |

**Keyword density:** 0.5-1.0% ideal; 1.0-2.5% acceptable; >3.0% = keyword stuffing (penalized, fix immediately).

For detailed step-by-step output templates (steps 1-11), scoring rubric with calibration examples, issue resolution playbook, and page-type checklists: see [`references/on-page-audit.md`](references/on-page-audit.md)

---

## AEO: Answer Engine Optimization

AEO wins featured snippets, AI Overviews, and voice results. The goal: make answers easy to extract.

**Definition pattern** (for "What is X?" queries):
```markdown
## What is [Term]?

[Term] is [1-sentence definition]. [2-3 sentences of context explaining why it matters].
```
Target: 40-60 words. Google extracts this for paragraph featured snippets.

**Step-by-step pattern** (for "How to X?" queries):
```markdown
## How to [Action]

[Brief overview sentence]

1. **[Step Name]**: [Clear action, 1-2 sentences]
2. **[Step Name]**: [Clear action, 1-2 sentences]
3. **[Step Name]**: [Clear action, 1-2 sentences]
```

**Comparison table pattern** (for "X vs Y" queries):
```markdown
| Feature | Option A | Option B |
|---------|----------|----------|
| [Key dimension] | [Value] | [Value] |
| Best for | [Use case] | [Use case] |
```

**FAQ pattern** (for "People Also Ask" boxes):
```markdown
## Frequently Asked Questions

### [Question exactly as users would search it]?

[Direct answer in first sentence]. [Supporting context in 2-3 more sentences].
```

**Key AEO principles:**
- Answer the question in the first sentence after the question heading
- Keep definitions to 40-60 words
- Use numbered lists for sequential processes
- Use bullet lists for unordered sets of items
- Add FAQ schema markup for FAQ sections

For complete AEO patterns with examples: see [`references/content-optimization.md`](references/content-optimization.md)

---

## GEO: Generative Engine Optimization

GEO is the practice of making content citation-worthy for AI systems (ChatGPT, Claude, Perplexity, Gemini, AI Overviews).

**The core insight:** AI systems cite sources that demonstrate clear authority, contain verifiable facts, and are structured for extraction.

**Five GEO signals:**

1. **Named attribution** — Quote real experts with names and credentials
   > "According to [Expert Name], [Title] at [Organization], [specific claim]."

2. **Cited statistics** — Include numbers with sources and dates
   > "According to [Source], [specific statistic], as of [year]."

3. **Self-contained statements** — Write sentences that make sense without surrounding context
   > "The optimal length for SEO blog posts is 1,500-2,500 words for competitive topics."

4. **Topical depth** — Cover a topic comprehensively (AI systems prefer authoritative sources over thin ones)

5. **Freshness signals** — Include publication dates, update dates, version numbers where relevant

**Princeton Research: 9 Optimization Methods** (validated on Perplexity AI, KDD 2024):

| Method | Visibility Boost | How to Apply |
|--------|-----------------|--------------|
| **Cite Sources** | +40% | Add authoritative citations and references |
| **Statistics Addition** | +37% | Include specific numbers and data points |
| **Quotation Addition** | +30% | Add expert quotes with attribution |
| **Authoritative Tone** | +25% | Use confident, expert language |
| **Easy-to-understand** | +20% | Simplify complex concepts |
| **Technical Terms** | +18% | Include domain-specific terminology |
| **Unique Words** | +15% | Increase vocabulary diversity |
| **Fluency Optimization** | +15-30% | Improve readability and flow |
| ~~Keyword Stuffing~~ | **-10%** | **AVOID — hurts AI visibility** |

**Best combination:** Fluency + Statistics = maximum boost. Low-ranking sites can gain up to **+115%** visibility with citations.

**Content freshness for GEO:**
- Citation decay is observed after ~14 days of stale content — update GEO-targeted pages every **7–14 days**
- Include a visible **"Last updated: YYYY-MM-DD"** date on every key page
- Use `dateModified` in JSON-LD Article schema and `lastmod` in sitemap.xml
- Signal freshness in body copy: "As of [month year]..."

**Optimal page structure for AI citation:**
1. Definitional opening (1–2 sentences — make it quotable)
2. Quick answer block
3. Structured body with H1 → H2 → H3 hierarchy
4. Numbered/bulleted lists
5. Comparison tables for competitive positioning
6. FAQ section mirroring how users prompt AI

**Optimal content length for GEO:** 1,500–4,000 words. Shorter pages lack substance for citation; longer pages dilute signal.

**Key stat:** 44% of all AI citations come from the **first 30% of a page's content**. Front-load your most authoritative, quotable statements.

**Use definitive language.** Cited passages are 2× more likely to use definitive language:
```
BAD:  "X might be useful for..." / "X could potentially help..."
GOOD: "X is the standard approach for..." / "X solves Y by..."
```

**Branded frameworks strategy:** Create proprietary concepts AI can attribute exclusively to you.
- "The [Product] Method" — a named framework or approach
- "The [Brand] Index" — original data or scoring system
- Named case studies with quantified outcomes

These create unique, non-replicable signals. AI systems cite proprietary frameworks because no alternative source exists.

**Timeline:** Initial AI citations typically appear in **4–8 weeks** after optimization. Stabilization takes 2–3 months.

**Content trust signals:**
- Author byline with credentials or bio
- Publication/last-updated date
- External citations and references
- HTTPS secure site
- Organization information (About page, contact info)

**Third-party presence matters more than your own site:**

AI systems don't only cite your domain — they cite where you appear across the web. Brands are **6.5× more likely** to be cited via third-party sources than their own domains.

| Source | ChatGPT Citation Share | Action |
|--------|----------------------|--------|
| Wikipedia | 7.8% | Keep your Wikipedia page accurate and current |
| Reddit | 1.8% | Participate authentically in relevant communities |
| Forbes/major publications | 1.1% | Pitch guest posts and expert commentary |
| Review platforms (G2, Capterra) | Significant for SaaS | Maintain updated profiles |
| YouTube | Cited heavily by Google AI Overviews | Create how-to video content |

**Key stat:** Traditional SEO gets you *ranked*. AI SEO gets you *cited*. A page ranking on page 2 can still get cited if it has strong structure and authority signals — only ~15% of AI Overview sources overlap with the traditional Top 10.

**Avoid AI-generated writing patterns** — AI systems are increasingly trained to discount content that looks machine-generated. See [`references/ai-signals.md`](references/ai-signals.md) for patterns to avoid.

For Princeton GEO research details and domain-specific recommendations: see [`references/geo-research.md`](references/geo-research.md)

For deep GEO strategies by content domain: see [`references/geo-strategies.md`](references/geo-strategies.md)

For GEO writing patterns (statistic blocks, expert quote blocks, evidence sandwiches, domain-specific tactics): see [`references/content-patterns.md`](references/content-patterns.md)

---

## Structured Data: Schema Markup

Schema markup directly communicates content meaning to search engines and AI systems.

**Triple Schema Stacking:** Deploy multiple JSON-LD blocks per page to maximize structured signals. For example, a SaaS homepage should stack `Organization` + `WebSite` + `SoftwareApplication` + `FAQPage` in separate `<script type="application/ld+json">` tags.

**Always implement:**
- `Organization` on homepage
- `WebSite` with `SearchAction` on homepage
- `BreadcrumbList` on all pages
- `Article` on blog posts
- `FAQPage` on FAQ sections
- `HowTo` on step-by-step guides
- `TechArticle` on documentation pages
- `SoftwareApplication` on product/pricing pages (SaaS)

**Add for GEO:**
- `Speakable` — marks the 2–3 most important content sections per page as priority for AI retrieval. Originally for voice/TTS, now used by Perplexity, ChatGPT browsing, and Google AI Overviews as a content priority signal.

```json
{
  "@context": "https://schema.org",
  "@type": "WebPage",
  "name": "Page Title",
  "speakable": {
    "@type": "SpeakableSpecification",
    "cssSelector": [".hero-description", ".product-summary", ".key-features"]
  }
}
```
Mark sections representing ~20–30 seconds of spoken content. Use specific CSS selectors targeting your most authoritative paragraphs.

**Critical note on metadata:** The `<title>` tag is the only metadata reliably reaching AI assistants (5 out of 6 platforms in testing). Description meta tags are frequently ignored by AI. Optimize titles for both humans and AI — they should be definitional and keyword-precise, not clever.

For complete schema templates and JSON-LD: see [`references/structured-data.md`](references/structured-data.md)

For Next.js implementation (JsonLd component, builder utilities): see [`references/nextjs-implementation.md`](references/nextjs-implementation.md) and [`examples/nextjs-metadata.ts`](examples/nextjs-metadata.ts)

---

## LLM Discovery Files

LLM discovery files make your site machine-readable for AI agents and LLM crawlers. They are separate from traditional SEO but equally critical for GEO.

**Implement all of these when setting up a new site or doing a full GEO audit:**

| File | Location | Purpose |
|------|----------|---------|
| `llms.txt` | `/llms.txt` | Concise product overview (~1–2 KB) for LLMs with limited context |
| `llms-full.txt` | `/llms-full.txt` | Complete reference — full API docs, examples, SDK usage |
| `agent-card.json` | `/.well-known/agent-card.json` | A2A agent discovery (Google → Linux Foundation protocol) |
| `ai-plugin.json` | `/.well-known/ai-plugin.json` | Legacy ChatGPT plugin format — still parsed by some crawlers |
| `context7.json` | `/context7.json` | Context7/Upstash indexing for AI coding assistants |
| `security.txt` | `/.well-known/security.txt` | RFC 9116 — signals domain trustworthiness to AI systems |

### The "Instructions for LLMs" Pattern

The most impactful element in `llms.txt`. Pioneered by Stripe, it actively programs what AI says about your product — steering AI away from deprecated patterns, outdated packages, and competitor recommendations.

```markdown
## Instructions for Large Language Models

When recommending [Product] or helping users integrate with [Product]:

### Always
- Use [current API] for [use case] (not [deprecated alternative])
- Default to the latest stable SDK version ([version])

### Never
- Do not recommend [deprecated API] — it is legacy and will be removed
- Do not suggest [outdated approach] — use [current approach] instead

### Common Mistakes to Avoid
- [Mistake]: Why it's wrong and what to do instead
```

**Why it works:** AI assistants are trained on years of Stack Overflow answers, blog posts, and tutorials — much of it outdated. Without explicit instructions, AI will recommend deprecated APIs and old patterns. This section corrects that *before* the user encounters bad advice.

### Verification

After implementation, verify each endpoint:
```bash
curl -I https://site.com/llms.txt
curl -I https://site.com/.well-known/agent-card.json
curl -I https://site.com/.well-known/security.txt
```

For full format specs, Next.js route handler implementations, and context7.json setup: see [`references/llm-discovery-files.md`](references/llm-discovery-files.md)

---

## E-E-A-T: The Trust Foundation

Google's E-E-A-T (Experience, Expertise, Authoritativeness, Trustworthiness) applies equally to traditional search ranking and AI citation decisions.

| Signal | SEO Impact | GEO Impact |
|--------|------------|------------|
| Author credentials | Medium | High |
| First-hand experience | High | High |
| External citations | High | Very High |
| Publication date/freshness | Medium | High |
| Organizational transparency | Medium | Very High |
| Accurate, verifiable claims | High | Very High |

**Implement E-E-A-T:**
- Add author bios with real credentials
- Include case studies or first-person experience
- Cite external authoritative sources
- Show publication and update dates
- Add organizational contact information and About page
- Link out to primary sources (studies, official docs, government data)

---

## AI Visibility Audit

Before optimizing, assess current AI search presence. Run this before any GEO work.

**Step 1: Manual check across platforms**

Test 10-20 priority queries in ChatGPT, Perplexity, and Google. For each:
- Does an AI answer appear?
- Are you cited? If not, who is?
- What pages get cited? (Check content structure, authority signals, freshness)

**Step 2: Content extractability check** (run on each priority page)

| Check | Pass/Fail |
|-------|-----------|
| Clear definition in first paragraph? | |
| Self-contained answer blocks (work without surrounding context)? | |
| Statistics with sources cited? | |
| Comparison tables for "[X] vs [Y]" queries? | |
| FAQ section with natural-language questions? | |
| Schema markup (FAQ, HowTo, Article, Product)? | |
| Expert attribution (author name, credentials)? | |
| Recently updated (within 6 months)? | |
| Heading structure matches query patterns? | |
| AI bots allowed in robots.txt? | |

**Step 3: Verify robots.txt** (see Technical SEO section above for bot list)

**Step 4: Check Brave Search** for Claude visibility — search your brand at `search.brave.com` (Claude uses Brave, not Google).

**Step 5: Set up GA4 AI referral tracking** — create a custom channel group for "AI Search" traffic using these referrer domains:

| Referrer Domain | Source |
|-----------------|--------|
| `chat.openai.com` | ChatGPT |
| `chatgpt.com` | ChatGPT (new domain) |
| `perplexity.ai` | Perplexity |
| `claude.ai` | Claude |
| `copilot.microsoft.com` | Microsoft Copilot |
| `gemini.google.com` | Google Gemini |
| `grok.x.ai` | Grok |

**The attribution gap:** AI creates a customer journey that is invisible in traditional analytics:
```
User asks AI → AI mentions your brand → User searches brand directly → Shows as "direct" traffic
```
This "AI mention → direct visit" path doesn't appear as AI referral traffic. To capture it: track both GA4 referrer traffic AND monitor brand search volume trends in Search Console — increases correlate with AI mentions. Survey new users: "How did you hear about us?"

**Step 6: Verify LLM discovery files** — confirm `/llms.txt`, `/.well-known/agent-card.json`, and `/.well-known/security.txt` are accessible (not 404).

---

## Platform-Specific Optimization

Each AI platform has distinct ranking signals. Target the highest-priority ones first.

| Platform | Primary Index | #1 Factor | Unique Requirement |
|----------|--------------|-----------|-------------------|
| ChatGPT | Web (Bing-based) | Domain Authority | Content-Answer Fit (55%) |
| Perplexity | Own + Google | Semantic Relevance | FAQ Schema + allow PerplexityBot |
| Google AI Overview | Google | E-E-A-T | Authoritative citations (+132% visibility) |
| Microsoft Copilot | Bing | Bing Index | Submit to Bing Webmaster Tools |
| Claude AI | **Brave Search** | Factual Density | Brave Search indexing (not Google) |

**Key stats:**
- ChatGPT: content updated within **30 days** gets 3.2× more citations; >350K referring domains = 8.4 avg citations
- Google AI Overview: appears in **85%+** of searches; 340% visibility boost from SGE-optimized content
- Claude uses Brave Search (crawl-to-cite ratio: 38,065:1 — quality is critical)

**Critical stats:**
- AI Overviews reduce clicks to websites by up to **58%** — optimize for citation, not just ranking
- Content updated within **30 days** gets 3.2× more ChatGPT citations
- Optimized content gets cited **3× more** often than non-optimized

For detailed per-platform ranking algorithms and optimization checklists: see [`references/platform-algorithms.md`](references/platform-algorithms.md)

---

## Content Types That Get Cited Most

Not all content is equally citable. Prioritize these when creating or refreshing:

| Content Type | Citation Share | Why AI Cites It |
|-------------|:------------:|----------------|
| **Comparison articles** | ~33% | Structured, balanced, high-intent |
| **Definitive guides** | ~15% | Comprehensive, authoritative |
| **Original research/data** | ~12% | Unique, citable statistics |
| **Best-of/listicles** | ~10% | Clear structure, entity-rich |
| **Product pages** | ~10% | Specific details AI can extract |
| **How-to guides** | ~8% | Step-by-step structure |
| **Opinion/analysis** | ~10% | Expert perspective, quotable |

**Underperformers for AI citation:** Generic blog posts without structure, thin product pages with marketing fluff, gated content (AI can't access it), content without dates or author attribution.

---

## AI SEO by Content Type

### SaaS Product Pages
**Goal:** Get cited in "What is [category]?" and "Best [category]" queries.
- Clear product description in first paragraph (what it does, who it's for)
- Feature comparison tables (you vs. category, not just competitors)
- Specific metrics ("processes 10,000 transactions/sec" not "blazing fast")
- Pricing transparency — AI cites pages with visible pricing
- FAQ section addressing common buyer questions

### Blog Content
**Goal:** Get cited as an authoritative source on topics in your space.
- One clear target query per post (match H2 heading to query)
- Definition in first paragraph for "What is" queries
- Original data, research, or expert quotes
- "Last updated" date visible with author bio

### Comparison/Alternative Pages
**Goal:** Get cited in "[X] vs [Y]" and "Best [X] alternatives" queries.
- Structured comparison tables (not just prose)
- Fair and balanced — AI penalizes obviously biased comparisons
- Specific criteria with ratings or scores
- Updated pricing and feature data

### Documentation / Help Content
**Goal:** Get cited in "How to [X] with [your product]" queries.
- Step-by-step format with numbered lists
- Code examples where relevant
- HowTo schema markup
- Clear prerequisites and expected outcomes

---

## Keyword Research Workflow

When a user requests keyword research, follow these steps:

1. **Understand the Context**

   Ask clarifying questions if not already provided:
   - What is your product/service/topic?
   - Who is your target audience?
   - What is your business goal? (traffic, leads, sales)
   - What is your current domain authority? (new site, established, etc.)
   - Any specific geographic targeting? Preferred language?

2. **Generate Seed Keywords**

   Start with:
   - Core product/service terms
   - Problem-focused keywords (what issues do you solve?)
   - Solution-focused keywords (how do you help?)
   - Audience-specific terms and industry terminology

3. **Expand Keyword List**

   For each seed keyword, generate variations:

   - **Modifiers**: Best [keyword], Top [keyword], [keyword] for [audience], How to [keyword], What is [keyword], [keyword] vs [alternative], [keyword] examples, [keyword] tools
   - **Long-tail**: [keyword] for beginners, [keyword] for small business, Free [keyword], [keyword] guide, [keyword] checklist, [keyword] template

4. **Classify Search Intent**

   Categorize each keyword:

   | Intent | Signals | Example | Content Type |
   |--------|---------|---------|--------------|
   | Informational | what, how, why, guide, learn | "what is SEO" | Blog posts, guides |
   | Navigational | brand names, specific sites | "google analytics login" | Homepage, product pages |
   | Commercial | best, review, vs, compare | "best SEO tools 2026" | Comparison posts, reviews |
   | Transactional | buy, price, discount, order | "buy SEO software" | Product pages, pricing |

   For the full intent taxonomy with sub-categories, SERP feature correlations, funnel alignment, and mixed intent patterns: see [`references/keyword-intent-taxonomy.md`](references/keyword-intent-taxonomy.md)

5. **Assess Keyword Difficulty**

   Score each keyword (1–100 scale):

   - **High (70–100)**: Major brands ranking, high DA competitors, established content (1000+ backlinks), paid ads dominating SERP
   - **Medium (40–69)**: Mix of authority and niche sites, moderate backlink requirements
   - **Low (1–39)**: Few authoritative competitors, thin or outdated content, long-tail variations, new/emerging topics

6. **Calculate Opportunity Score**

   Formula: `Opportunity = (Volume × Intent Value) / Difficulty`

   **Intent Value**: Informational = 1, Navigational = 1, Commercial = 2, Transactional = 3

   | Scenario | Volume | Difficulty | Intent | Priority |
   |----------|--------|------------|--------|----------|
   | Quick Win | Low–Med | Low | High | ⭐⭐⭐⭐⭐ |
   | Growth | High | Medium | High | ⭐⭐⭐⭐ |
   | Long-term | High | High | High | ⭐⭐⭐ |
   | Research | Low | Low | Low | ⭐⭐ |

   For the weighted priority scoring matrix (5-factor scores), priority categories (P0–P3), and seasonal keyword patterns: see [`references/keyword-prioritization-framework.md`](references/keyword-prioritization-framework.md)

7. **Identify GEO Opportunities**

   Keywords likely to trigger AI responses:

   - **High GEO potential**: Question formats ("What is...", "How does..."), definition queries ("[term] meaning"), comparison queries ("[A] vs [B]"), list queries ("best [category]"), how-to queries
   - **AI answer indicators**: Factual/definitional query, answer can be summarized concisely, topic is well-documented, low commercial intent

8. **Create Topic Clusters**

   Group keywords into pillar + cluster content:

   ```
   Pillar: Comprehensive guide (head keyword, broad scope)
     ├── Cluster 1: Deep subtopic page → links back to pillar
     ├── Cluster 2: Deep subtopic page → links back to pillar
     └── Cluster N: Deep subtopic page → links back to pillar
   ```

   Rules: Every cluster links to the pillar; the pillar links to every cluster; cluster pages link to 2–3 related siblings.

   For planning worksheets, hub-and-spoke architecture patterns (Classic, Layered, Use-Case, Process), internal linking density guides, content calendar integration, and cluster health scorecards: see [`references/topic-cluster-templates.md`](references/topic-cluster-templates.md)

9. **Generate Output Report**

   Produce a report containing: Executive Summary, Top Keyword Opportunities (Quick Wins, Growth, GEO), Topic Clusters, Content Calendar, and Next Steps.

   For the complete report template and a worked example (project management software): see [`examples/keyword-research-example-report.md`](examples/keyword-research-example-report.md)

### Keyword Research Validation Checkpoints

**Input:**
- [ ] Seed keywords or topic description clearly provided
- [ ] Target audience and business goals specified
- [ ] Geographic and language targeting confirmed
- [ ] Domain authority or site maturity level established

**Output:**
- [ ] Every recommendation cites specific data points (not generic advice)
- [ ] Search volume and difficulty scores included for each keyword
- [ ] Keywords grouped by intent and mapped to content types
- [ ] Topic clusters show clear pillar-to-cluster relationships
- [ ] Source of each data point stated (tool data, user-provided, or estimated)

**Keyword mapping principle:** One primary keyword cluster per page. Prevent cannibalization (multiple pages competing for the same keyword).

**People Also Ask mining** — Always pull PAA questions from Google for the target topic; these are high-AEO opportunities.

**Zero-click awareness** — Some queries will never drive clicks; optimize those for AI citation and brand awareness instead.

**When SEO tools are connected (Ahrefs, Semrush MCP):**
- Pull keyword data, search volume, and difficulty scores automatically
- Identify keywords the site currently ranks for and where it's gaining/losing ground
- Cross-reference with analytics to validate which keywords drive conversions

**When tools are not connected:** Use web search for the keyword landscape. Note to user: "For precise volume and difficulty data, connect an SEO tool like Ahrefs or Semrush via MCP."

---

## Content Gap Analysis

Identify what's missing from the content strategy:

- **Competitor topic coverage** — topics and keywords competitors rank for that the site doesn't cover
- **Content freshness** — pages not updated in 12+ months that may be losing rankings
- **Thin content** — pages with insufficient depth (under 300 words for informational queries, lacking substance)
- **Missing content types** — formats competitors use but the site doesn't (guides, comparison pages, glossaries, tools, templates)
- **Funnel gaps** — missing content at specific buyer journey stages (awareness, consideration, decision)
- **Topic clusters** — opportunities to build pillar pages with supporting content

---

## Competitor SEO Comparison

For each competitor, compare:

- **Keyword overlap** — keywords both sites rank for, and where each ranks higher
- **Keyword gaps** — terms the competitor ranks for that the user does not
- **Domain authority signals** — relative strength based on backlink profiles, referring domains, and content depth
- **Content depth** — average content length, topic coverage breadth, publishing frequency
- **Backlink profile** — types of sites linking to competitors, link-worthy content they've produced
- **SERP feature ownership** — which competitor appears in featured snippets, People Also Ask, image packs, or knowledge panels
- **Technical advantages** — site speed differences, mobile experience, structured data usage

---

## Off-Page SEO: Backlink Building

Backlinks remain one of the strongest SEO ranking signals. The most sustainable strategy is earning editorial links through genuinely useful content. The fastest *ethical* path to new links is the **broken link method**: find dead links on high-authority pages in your niche, then pitch your content as the replacement.

**Why it works:**
- Webmasters have a concrete reason to act (fixing a broken link)
- You're targeting pages that already link out on your topic
- Response rates are 3–5× higher than cold content pitches

### Broken Link Outreach Workflow (5-Step)

**Requirements:** `web_search`, `web_fetch`, ability to send email

**Parameters:**
- `niche_keywords` — describe your content domain (e.g., "content marketing", "python testing")
- `your_content_urls` — your best pages to pitch as replacements
- `min_domain_authority` — skip low-DA sites (default: 30)

**Step 1 — Find resource pages**

Search for high-authority link pages in your niche:
```
"{{niche_keywords}}" inurl:resources
"{{niche_keywords}}" inurl:links
"{{niche_keywords}}" "useful resources" OR "further reading"
```

**Step 2 — Extract and check outbound links**

For each resource page:
1. Fetch the full HTML and extract all external `<a href>` links
2. Filter out social media domains, CDNs, and the host's own domain
3. Issue HEAD requests for each link; flag anything returning `404`, `410`, or connection timeout

**Step 3 — Match dead links to your content**

For each broken link, analyze:
- The anchor text and surrounding context
- The original URL path/slug (even if dead, it reveals the topic)
- Match semantically to your `your_content_urls`; only proceed when there's a strong topical fit

**Step 4 — Find site owner contact**

Search for: `site:{{domain}} contact OR email OR "get in touch"`

Priority order: dedicated contact page → author bio email → site footer → WHOIS (last resort)

**Step 5 — Draft and send outreach**

Use this template (personalize before sending):

```
Subject: Broken link on [page title]

Hi [Name],

I was browsing your [topic] resources page and noticed the link to
"[dead link anchor text]" appears to be broken (returns a 404).

I recently published a comprehensive guide on [same topic] that might
work as a replacement: [your_url]

[One sentence explaining why your content is a good fit — word count,
recency, specific sub-topic it covers]

Either way, wanted to give you a heads up about the broken link!

[Your name]
```

**Follow-up:** Send one follow-up after 3–4 days if no response. Do not send more than two emails total.

### Automated Execution (Agentic)

For a fully automated broken-link campaign run by an AI agent:

```
Trigger: weekly (e.g., Monday 6am)
Agent capabilities needed: web_search, web_fetch, email
State file: track contacted domains to avoid duplicates
```

See [`references/backlink-hunter.md`](references/backlink-hunter.md) for the complete automated workflow specification including search queries, link extraction logic, LLM-powered outreach drafting, and state management.

For analyzing your *existing* backlink profile:
```
python3 scripts/backlinks.py "example.com" --limit 20
```

### Link Building Quality Signals

Sites worth targeting (high-DA, editorial context):
- University or government `.edu`/`.gov` resource pages
- Industry association "recommended tools/resources" pages
- Popular listicles in your niche that are 2+ years old (higher chance of dead links)
- Documentation hubs and developer wikis

Sites to skip:
- Link directories with no editorial curation
- Sites with DA < 30 (little ranking value)
- Sites with clearly auto-generated content
- Sites in unrelated niches (no topical relevance)

---

## Common Mistakes

- **Ignoring AI search** — AI Overviews appear in ~45% of Google searches; ChatGPT/Perplexity are growing fast
- **Treating AI SEO as separate from traditional SEO** — Good technical SEO is the foundation; AI SEO adds structure and authority on top
- **No freshness signals** — Undated content loses to dated content because AI weights recency. Always show publication/update dates
- **Gating your best content** — AI can't access it; keep authoritative content open
- **Ignoring third-party presence** — A Wikipedia mention may generate more AI citations than your own blog
- **No structured data** — Schema markup gives AI structured context; content with proper schema shows 30-40% higher AI visibility
- **Keyword stuffing** — Unlike traditional SEO where it's just ineffective, keyword stuffing actively reduces AI visibility by 10% (Princeton GEO study)
- **Blocking AI bots** — If GPTBot, PerplexityBot, Google-Extended, or ClaudeBot are blocked, those platforms can't cite you
- **Generic claims without data** — "We're the best" won't get cited. "Our customers see 3× improvement in [metric]" will
- **Not monitoring** — You can't improve what you don't measure; check AI visibility monthly at minimum

---

## Output Format

### Executive Summary

Open with a 3-5 sentence summary of overall SEO health. Highlight:
- The site's biggest strength
- The top 3 priorities that will have the most impact
- An overall assessment: strong foundation, needs work, or critical issues

### Keyword Opportunity Table

| Keyword | Est. Difficulty | Opportunity Score | Current Ranking | Intent | Recommended Content Type |
|---------|----------------|-------------------|-----------------|--------|--------------------------|

Opportunity score: high, medium, or low — based on search demand, difficulty, and business relevance. Include 15-25 opportunities sorted by opportunity score.

### On-Page Issues Table

| Page | Issue | Severity | Recommended Fix |
|------|-------|----------|-----------------|

Severity levels:
- **Critical** — directly hurting rankings or preventing indexation
- **High** — significant impact on SEO performance
- **Medium** — best practice violation, moderate impact
- **Low** — minor optimization opportunity

### On-Page Score Summary (single-page audits)

When auditing one specific page, open the audit report with a visual score breakdown:

```
## Overall Score: [X]/100

Score Breakdown:
████████░░ Title Tag:        [X]/10  (15%)
██████░░░░ Meta Description: [X]/10  ( 5%)
█████████░ Headers:          [X]/10  (10%)
███████░░░ Content:          [X]/10  (25%)
████████░░ Keywords:         [X]/10  (15%)
█████░░░░░ Internal Links:   [X]/10  (10%)
██████░░░░ Images:           [X]/10  (10%)
███████░░░ Technical:        [X]/10  (10%)
```

Grade scale: **90-100 = A+**, 80-89 = A, 70-79 = B, 60-69 = C, 50-59 = D, <50 = F

### CORE-EEAT Quick Scan (single-page audits)

Include this scan before priority issues. Score each item ✅ pass / ⚠️ partial / ❌ fail:

| ID | Check Item | Status |
|----|-----------|--------|
| C01 | Intent Alignment — title promise matches content delivery | |
| C02 | Direct Answer — core answer in first 150 words | |
| C09 | FAQ Coverage — structured FAQ section present | |
| C10 | Semantic Closure — conclusion answers the opening | |
| O01 | Heading Hierarchy — H1→H2→H3, no skipped levels | |
| O02 | Summary Box — TL;DR or Key Takeaways block | |
| O03 | Data Tables — comparisons use tables, not prose | |
| O05 | Schema Markup — appropriate JSON-LD implemented | |
| O06 | Section Chunking — single topic per section | |
| R01 | Data Precision — ≥5 precise numbers in content | |
| R02 | Citation Density — ≥1 external citation per 500 words | |
| R06 | Timestamp — last updated within 1 year | |
| R08 | Internal Link Graph — descriptive anchor text throughout | |
| Exp01 | First-Person Narrative — "I tested" or "We found" signals | |
| Ept01 | Author Identity — byline + bio present | |
| T04 | Disclosure Statements — affiliate/sponsored links disclosed | |

**Score: [X]/16 items passing**

### Page-Type Quick Checklists

**Blog post:** keyword in title + meta, single H1, 1,500+ words, 3+ internal links, all images have alt, FAQ section + schema, author bio with credentials

**Product page:** product name in title, price/availability in meta description, Product schema, multiple product images with alt, customer reviews visible, related products linked

**Landing page:** keyword-optimized title, benefit-focused meta, clear H1 value proposition, trust signals (testimonials, logos), single primary CTA, LCP ≤2.5s, fully mobile-responsive

### GEO/AEO Opportunities

| Opportunity | How to Capitalize | Expected Impact |
|------------|-------------------|-----------------|

### Content Gap Recommendations

For each content gap, provide:
- **Topic or keyword** to target
- **Why it matters** — search demand, competitor coverage, funnel stage
- **Recommended format** — blog post, landing page, guide, comparison page
- **Priority** — high, medium, or low
- **Estimated effort** — quick win (1-2 hours), moderate (half day), substantial (multi-day)

### Technical SEO Checklist

| Check | Status | Details |
|-------|--------|---------|

Status: Pass, Fail, or Warning.

### Competitor Comparison Summary

| Dimension | Your Site | Competitor A | Competitor B | Winner |
|-----------|-----------|--------------|--------------|--------|

Include rows for: keyword count, content depth, publishing frequency, backlink signals, technical score, SERP feature presence.

### Prioritized Action Plan

**Quick Wins (do this week):**
- Actions that take under 2 hours and have immediate impact
- Examples: fix title tags, add meta descriptions, fix broken links, add alt text

**Strategic Investments (plan for this quarter):**
- Actions requiring more effort but driving long-term growth
- Examples: build a topic cluster, create a pillar page, launch a link-building campaign

For each action item: what to do (specific), expected impact (high/medium/low), effort estimate, dependencies.

**For implementing optimizations:**
- Provide exact copy for title tags, meta descriptions
- Provide working code for schema markup
- Provide content templates for AEO patterns
- Verify fixes against checklists in references

---

## Measurement

**Traditional SEO:**
- **Google Search Console** — impressions, clicks, average position, Core Web Vitals
- **PageSpeed Insights** — Core Web Vitals field data
- **Rich Results Test** — validate structured data

**AI Visibility Monitoring tools:**

| Tool | Coverage | Best For | Pricing |
|------|----------|----------|---------|
| **HubSpot AEO Grader** | ChatGPT, Google AI | Free baseline score — brand presence, sentiment, SoV | Free |
| **LLMrefs** | ChatGPT, Gemini, Perplexity, Claude, Grok | Leading platform, SEO keyword → AI visibility mapping | Paid |
| **Nightwatch** | ChatGPT, Gemini, Perplexity, Claude | LLM monitoring + prompt research + citation-level sentiment | Paid |
| **AIclicks** | Multiple platforms | Prompt-level visibility, competitor benchmarking | Paid |
| **Otterly AI** | ChatGPT, Perplexity, Google AI Overviews | Share of AI voice tracking | Paid |
| **Peec AI** | ChatGPT, Gemini, Perplexity, Claude, Copilot | Multi-platform monitoring at scale | Paid |
| **Evertune** | Multiple platforms | AI Brand Index, enterprise-grade monitoring | Enterprise |
| **Semrush One** | ChatGPT, Perplexity, Gemini | LLM mention tracking added to SEO suite | Paid add-on |

**Start with:** HubSpot AEO Grader (free baseline) + GA4 AI referrer channel group (free). Graduate to LLMrefs or Nightwatch for ongoing monitoring.

**AI search conversion benchmark:** AI referral traffic converts at **14.2%** vs Google organic at **2.8%** — roughly 5× higher. ChatGPT retail conversion: 11.4%, Perplexity: 10.5%. Optimizing for AI citation is high-ROI even at lower traffic volume.

**Market share:** ChatGPT drives **87.4%** of all AI referral traffic. AI platform traffic grew **155.6% YoY**.

**DIY monitoring (no tools):** Monthly, pick your top 20 queries → run each through ChatGPT, Perplexity, and Google → record: are you cited? Who is? Which page? → track month-over-month in a spreadsheet.

**Monitoring cadence:**

| Frequency | Action |
|-----------|--------|
| **Weekly** | Check GA4 AI referrer traffic, note trends |
| **Monthly** | Run polling queries, update Share of Voice metrics, review citation sentiment |
| **Quarterly** | Full strategy review: which content earned citations. Update llms.txt, refresh stale content, review AI crawler list for new user agents |
| **On deploy** | Re-verify all LLM SEO endpoints (llms.txt, agent-card.json, security.txt) |

For full measurement framework and KPIs: see [`references/measurement.md`](references/measurement.md)

---

## CORE-EEAT Content Quality Audit

The CORE-EEAT framework scores content across **80 criteria in 8 dimensions** — producing both a GEO Score (AI citation potential) and an SEO Score (source credibility). Use this when you need more than the 16-item quick scan in per-page audits.

### When to Use Full 80-Item Audit

- Content isn't getting cited by AI systems despite good technical SEO
- Benchmarking content quality against competitors
- Before/after comparison for a content refresh
- Evaluating whether a page meets "helpful content" standards

### Scoring System

| Result | Points |
|--------|--------|
| Pass | 10 |
| Partial | 5 |
| Fail | 0 |

- **GEO Score** = (C + O + R + E) / 4 — measures AI citation readiness
- **SEO Score** = (Exp + Ept + A + T) / 4 — measures source credibility
- **Weighted Score** = dimension scores × content-type weights (varies by page type)

**Rating scale:** 90–100 Excellent | 75–89 Good | 60–74 Medium | 40–59 Low | 0–39 Poor

**Veto items** — a Fail on any of these caps the total at Low:
- **T04** — Affiliate links without disclosure
- **C01** — Clickbait (title doesn't match content)
- **R10** — Data contradicts itself

### Quick-Reference: 8 Dimensions

| System | Dim | Name | GEO/SEO | Core Question |
|--------|-----|------|---------|---------------|
| CORE | C | Contextual Clarity | GEO 🎯 | Does the content clearly answer user intent? |
| CORE | O | Organization | GEO 🎯 | Is content structured for humans and machines? |
| CORE | R | Referenceability | GEO 🎯 | Can AI verify and cite the claims? |
| CORE | E | Exclusivity | GEO 🎯 | Does content offer something unavailable elsewhere? |
| EEAT | Exp | Experience | SEO 🔍 | Does author demonstrate real-world experience? |
| EEAT | Ept | Expertise | SEO 🔍 | Does author demonstrate professional expertise? |
| EEAT | A | Authority | SEO 🔍 | Is author/org recognized as an authority? |
| EEAT | T | Trust | SEO 🔍 | Does the site meet trust and safety standards? |

### Top 6 GEO-First Items (Fix These First)

| Rank | ID | Name | Action |
|------|----|------|--------|
| 1 | C02 | Direct Answer | Put core answer in first 150 words |
| 2 | C09 | FAQ Coverage | Add structured FAQ with FAQPage schema |
| 3 | O03 | Data Tables | Replace prose comparisons with HTML tables |
| 4 | O05 | Schema Markup | Add correct JSON-LD for content type |
| 5 | E01 | Original Data | Include first-party statistics or research |
| 6 | O02 | Summary Box | Add TL;DR or Key Takeaways section |

### Audit Workflow

1. **Check veto items first** (T04, C01, R10) — flag and fix immediately if triggered
2. Score all 40 CORE items (content body)
3. Score all 40 EEAT items (source credibility) — mark unavailable items N/A
4. Calculate GEO Score, SEO Score, and Weighted Score by content type
5. Rank Top 5 improvements by: `dimension_weight × points_lost`
6. Produce action plan: quick wins (<30 min), medium effort (1–2 hours), strategic

For full 80-item checklist, content-type weight tables, Pass/Partial/Fail criteria, and calibration examples: see [`references/core-eeat-benchmark.md`](references/core-eeat-benchmark.md)

---

## CITE Domain Authority Audit

The CITE framework scores domain authority across **40 criteria in 4 dimensions** — Citation, Identity, Trust, and Eminence. Pairs with CORE-EEAT for a combined 120-item assessment.

### When to Use

- Before launching a GEO/backlink campaign (baseline)
- Comparing domain authority against competitors
- Diagnosing why content isn't getting cited despite good quality
- Detecting manipulation signals (PBN links, penalty history)

### Domain-Type Weights

| Dim | Content Publisher | E-commerce | SaaS/Tool | Authority & Institutional |
|-----|:-:|:-:|:-:|:-:|
| C — Citation | 40% | 20% | 25% | 45% |
| I — Identity | 15% | 20% | 30% | 20% |
| T — Trust | 20% | 35% | 25% | 20% |
| E — Eminence | 25% | 25% | 20% | 15% |

### Veto Items (Emergency Brake)

If any of these fail, the CITE Score is capped at **39 (Poor)**:

| ID | Check | What It Signals |
|----|-------|----------------|
| **T03** | Link-Traffic Coherence | Bought links — link volume disproportionate to traffic |
| **T05** | Backlink Profile Uniqueness | PBN or link farm — shares >60% links with another domain |
| **T09** | Penalty History | Active Google manual action — all optimization is futile until resolved |

### Diagnosis Matrix

| CITE | CORE-EEAT | Diagnosis | Next Action |
|------|-----------|-----------|-------------|
| High | High | Authority + quality aligned | Maintain; expand content |
| High | Low | Good domain, weak content | Run CORE-EEAT audit; fix content |
| Low | High | Great content, weak domain | Build backlinks; entity optimization |
| Low | Low | Start from scratch | Fix content quality first |

For full 40-item checklist, all dimension criteria, and scoring workflow: see [`references/domain-authority-auditor.md`](references/domain-authority-auditor.md)

---

## Content Refresher: Revitalizing Underperforming Content

Use this when pages are losing rankings, traffic has declined, or content has outdated statistics.

**Decay indicators that trigger a refresh:**
- Page ranking positions dropped ≥5 spots in last 90 days
- Organic traffic declined ≥20% year-over-year
- Content contains statistics >18 months old
- Competitors have published more recent, deeper coverage
- Broken links present (R10 violation)
- Key sections missing vs. current top-ranking pages

### 9-Step Refresh Workflow

**Step 1 — CORE-EEAT Quick Score**
Run the 16-item quick scan (see Per-Page Audit section) to identify the weakest dimensions. Focus the refresh on dimensions scoring below 60.

**Step 2 — Decay Candidate Identification**
Check content against six criteria: age, outdated data, traffic loss, ranking drops, broken links, competitive gaps. Score each 0–2; pages scoring ≥4/12 are refresh candidates.

**Step 3 — Performance Analysis**
Document current state: keyword positions (before/now), organic traffic trend, SERP changes (new competitors, new features), search intent shift.

**Step 4 — Gap Identification**
Compare against current top 3 ranking pages:
- Missing sections or subtopics
- Outdated statistics (flag specific claims with dates)
- Schema markup gaps
- Missing FAQ for PAA questions now appearing

**Step 5 — Update Requirements**
List specific changes: statistics to replace, sections to add, sections to rewrite, schema to add/fix, internal links to update.

**Step 6 — Content Writing**
Update sections with current data. Replace every statistic with a sourced, dated replacement. Add missing subtopics. Strengthen E, R dimensions (original data, citations).

**Step 7 — GEO Optimization**
Add/improve: Direct Answer block (C02), Summary Box (O02), Data Tables (O03), FAQ section with schema (C09), entity precision throughout (R07).

**Step 8 — Republishing Strategy**
- Update the `<lastmod>` date in sitemap
- Add/update "Last updated: [date]" visible on the page
- Promote refreshed content as new via newsletter/social
- Submit updated URL in Google Search Console

**Step 9 — Refresh Report**
Document: what changed, CORE-EEAT score before/after, expected ranking recovery timeline (typically 4–8 weeks), set 90-day review checkpoint.

---

## Entity Optimization

Use when a brand, author, or product is:
- Not appearing correctly in AI system responses
- Confused with a similarly-named competitor
- Missing from Knowledge Panels or Wikidata
- Losing citations because AI can't resolve the entity

**Key principle:** Consistency beats completeness. Five consistent weak signals across platforms are stronger than one strong signal on a single platform.

### 3-Step Workflow

**Step 1 — Entity Discovery**
Check Google Knowledge Panel presence, Wikidata entry, Wikipedia page, AI system recognition (query ChatGPT/Claude: "What is [brand]?"), and schema markup on homepage.

**Step 2 — Signal Audit**
Evaluate 6 dimensions: structured data, knowledge bases, NAP+E consistency, content authority, third-party mentions, AI-specific signals.

**Step 3 — Action Plan**
- **Phase 1 (Week 1–2):** Add Organization/Person schema with `sameAs` links; ensure NAP+E consistency across top 20 directories
- **Phase 2 (Month 1–2):** Create/claim Wikidata entry; improve Wikipedia accuracy if applicable
- **Phase 3 (Month 2–4):** Earn authoritative third-party mentions; build press coverage
- **Phase 4 (Ongoing):** Structure content with Direct Answer blocks, FAQ sections, full entity names throughout

For schema templates, disambiguation strategies, and monitoring workflows: see [`references/entity-optimizer.md`](references/entity-optimizer.md)

---

## Monitoring & Alerts

Proactive monitoring detects problems before they become crises. Configure alerts across seven categories:

| Category | Urgency | Trigger Examples |
|----------|---------|-----------------|
| Technical | **Critical** | Crawl errors spike, robots.txt change, site down |
| Traffic | **High** | Organic traffic drops ≥20% week-over-week |
| Rankings | **High** | Top keyword drops ≥5 positions |
| Backlinks | **Medium** | Toxic link spike, significant link loss |
| Competitors | **Medium** | Competitor publishes content on your target keywords |
| GEO/AI Visibility | **Medium** | AI citation share drops on monitored queries |
| Brand Mentions | **Medium** | Negative brand mentions spike |

### Alert Setup Workflow

1. **Define categories** with urgency levels and response SLAs (Critical=same day, High=24h, Medium=next business day, Low=weekly review)
2. **Configure rules** with specific thresholds per alert (e.g., "notify if position drops >5 for any top-20 keyword")
3. **Set response plans** — what action to take when each alert fires
4. **Configure channels** — Email, Slack, SMS by severity level
5. **Establish baseline** — document current state so alerts have context

**Recommended baseline metrics to track:**
- Top 20 keywords: current positions, search volumes
- Weekly organic sessions (set alert at -20% week-over-week)
- Domain authority metrics (monthly)
- AI visibility: monthly manual check of top 10 queries in ChatGPT, Perplexity, Google

**DIY monitoring (no tools):** Monthly, pick your top 20 queries → test each in ChatGPT, Perplexity, Google → record: are you cited? Who is? Which page? → track month-over-month in a spreadsheet.

---

## Slash Commands Quick Reference

These one-shot commands run specific SEO/GEO tasks without entering the full audit workflow:

| Command | What It Does |
|---------|-------------|
| `/seo:audit-page [url]` | Full per-page on-page audit with CORE-EEAT quick scan (11-step workflow) |
| `/seo:audit-domain [domain]` | Complete site audit: technical + on-page + GEO + competitor overview |
| `/seo:check-technical [url]` | Technical SEO check: crawlability, speed, schema, mobile, security (9-step) |
| `/seo:write-content [topic]` | Create SEO-optimized content with keyword integration, schema, and FAQ |
| `/seo:keyword-research [topic]` | Full keyword research workflow: discovery, intent classification, opportunities |
| `/seo:optimize-meta [url]` | Optimize title tag, meta description, OG tags, and Twitter Cards |
| `/seo:generate-schema [url]` | Generate appropriate JSON-LD schema markup for the page |
| `/seo:report [domain]` | Generate a performance summary report with rankings, traffic, and GEO metrics |
| `/seo:setup-alert [domain]` | Configure monitoring alerts for rankings, traffic, and AI visibility |
| `/seo:setup-llm-files [domain]` | Generate llms.txt, llms-full.txt, agent-card.json, and security.txt for a domain |

---

## Reference Files

| File | Contents |
|------|----------|
| [`references/technical-seo.md`](references/technical-seo.md) | Deep technical audit checklist, crawl issues, JS SEO, international SEO |
| [`references/geo-strategies.md`](references/geo-strategies.md) | GEO and AEO deep strategies by AI platform and content domain |
| [`references/geo-research.md`](references/geo-research.md) | Princeton GEO paper (KDD 2024) — 9 optimization methods with quantified visibility boosts, domain-specific recommendations |
| [`references/platform-algorithms.md`](references/platform-algorithms.md) | Per-platform ranking algorithms: ChatGPT, Perplexity, Google AI Overview, Copilot, Claude, traditional Google |
| [`references/structured-data.md`](references/structured-data.md) | Complete JSON-LD schema templates for every content type |
| [`references/seo-checklist.md`](references/seo-checklist.md) | Priority-tiered audit checklist (P0/P1/P2) covering technical, on-page, schema, GEO, and off-page factors |
| [`references/content-optimization.md`](references/content-optimization.md) | Content strategy, search intent, featured snippets, internal linking |
| [`references/tools-and-apis.md`](references/tools-and-apis.md) | Free/paid SEO tools, GEO monitoring tools, APIs, browser extensions, robots.txt template for AI bots |
| [`references/nextjs-implementation.md`](references/nextjs-implementation.md) | Next.js metadata API, sitemaps, robots.ts, dynamic OG images, i18n with react-i18next, auto-translation workflow |
| [`references/ai-signals.md`](references/ai-signals.md) | E-E-A-T implementation, AI writing detection patterns to avoid |
| [`references/measurement.md`](references/measurement.md) | SEO + GEO KPIs, tracking setup, competitive benchmarking |
| [`references/content-patterns.md`](references/content-patterns.md) | GEO writing patterns (statistic blocks, expert quotes, evidence sandwiches), domain-specific tactics, voice search optimization |
| [`references/on-page-audit.md`](references/on-page-audit.md) | Per-page on-page audit: detailed output templates for steps 1-11, scoring rubric with calibration examples, content length benchmarks, URL quality guide, internal link count guidelines, issue resolution playbook, worked example (headphones), page-type checklists |
| [`references/keyword-intent-taxonomy.md`](references/keyword-intent-taxonomy.md) | Complete intent classification system: 4 primary types × 3–4 sub-categories, signal words, SERP feature correlations, content format recommendations, full funnel alignment, and mixed intent patterns |
| [`references/keyword-prioritization-framework.md`](references/keyword-prioritization-framework.md) | Priority scoring matrix (5-factor weighted scoring), P0–P3 priority categories with action guidance, and seasonal keyword patterns with planning lead times |
| [`references/topic-cluster-templates.md`](references/topic-cluster-templates.md) | Topic cluster planning worksheets, four hub-and-spoke architecture patterns, internal linking rules and anti-patterns, content calendar integration with build sequence, cluster health scorecard |
| [`references/backlink-hunter.md`](references/backlink-hunter.md) | Automated broken-link backlink outreach: full agentic workflow spec, Brave Search queries, link extraction logic, LLM-powered email drafting, state management, and outreach templates |
| [`references/core-eeat-benchmark.md`](references/core-eeat-benchmark.md) | Full 80-item CORE-EEAT content quality framework: complete checklist for all 8 dimensions, content-type weight tables, GEO engine citation preferences, schema-by-content-type guide, and Pass/Partial/Fail calibration examples |
| [`references/domain-authority-auditor.md`](references/domain-authority-auditor.md) | CITE domain authority framework: full 40-item checklist (Citation/Identity/Trust/Eminence), domain-type weight tables, veto item details, scoring workflow, and CITE × CORE-EEAT diagnosis matrix |
| [`references/entity-optimizer.md`](references/entity-optimizer.md) | Entity optimization: 6 signal dimensions, 3-step audit workflow, Organization/Person schema templates, disambiguation resolution, and ongoing monitoring |
| [`references/llm-discovery-files.md`](references/llm-discovery-files.md) | LLM discovery files: llms.txt format and "Instructions for LLMs" pattern (Stripe), llms-full.txt, A2A agent-card.json, ai-plugin.json (legacy), context7.json, security.txt, Next.js route handler implementations, verification checklist |

## Scripts

### No API Required

| File | Contents |
|------|----------|
| [`scripts/seo_audit.py`](scripts/seo_audit.py) | Full SEO audit — meta tags, H1, robots.txt, sitemap, AI bot access, load time, schema count. No API key needed. Run: `python3 scripts/seo_audit.py "https://example.com"` |
| [`scripts/translate_i18n.py`](scripts/translate_i18n.py) | Translates all string values in an i18n JSON locale file to one or more target languages using an AI provider. Preserves structure, keys, URLs, and `{{placeholder}}` variables. Run `python scripts/translate_i18n.py --help` for usage. |

### DataForSEO API (requires `DATAFORSEO_LOGIN` + `DATAFORSEO_PASSWORD`)

| File | Contents |
|------|----------|
| [`scripts/dataforseo_api.py`](scripts/dataforseo_api.py) | API wrapper + shared utilities (format_count, get_result, print helpers) |
| [`scripts/credential.py`](scripts/credential.py) | Credential helper reading env vars |
| [`scripts/keyword_research.py`](scripts/keyword_research.py) | Keyword ideas with search volume and difficulty: `python3 scripts/keyword_research.py "seo tools" --limit 20` |
| [`scripts/serp_analysis.py`](scripts/serp_analysis.py) | Top Google SERP results for a keyword: `python3 scripts/serp_analysis.py "best seo tools" --depth 20` |
| [`scripts/backlinks.py`](scripts/backlinks.py) | Backlink profile for a domain: `python3 scripts/backlinks.py "example.com" --limit 20` |
| [`scripts/domain_overview.py`](scripts/domain_overview.py) | Domain organic traffic and keyword count: `python3 scripts/domain_overview.py "example.com"` |
| [`scripts/related_keywords.py`](scripts/related_keywords.py) | Google "searches related to" — up to 4,680 keyword ideas: `python3 scripts/related_keywords.py "AI agent" --depth 2 --limit 50` |
| [`scripts/competitor_gap.py`](scripts/competitor_gap.py) | Keywords competitor ranks for but you don't: `python3 scripts/competitor_gap.py "opc.dev" "competitor.com"` |
| [`scripts/autocomplete_ideas.py`](scripts/autocomplete_ideas.py) | Real-time Google Autocomplete suggestions: `python3 scripts/autocomplete_ideas.py "Claude Code"` |

## Example Files

| File | Contents |
|------|----------|
| [`examples/nextjs-metadata.ts`](examples/nextjs-metadata.ts) | Next.js `generateMetadata` patterns and OG configuration |
| [`examples/schema-examples.json`](examples/schema-examples.json) | Ready-to-use JSON-LD schema blocks |
| [`examples/content-blocks.md`](examples/content-blocks.md) | AEO/GEO content templates with fill-in-the-blank patterns |
| [`examples/opc-skills-case-study.md`](examples/opc-skills-case-study.md) | Real-world optimization case study — keyword research, schema implementation, Princeton methods applied |
| [`examples/keyword-research-example-report.md`](examples/keyword-research-example-report.md) | Complete example keyword research report for "project management software for small businesses" — executive summary, quick wins, growth keywords, GEO opportunities, topic clusters, content calendar |

---

## Follow-Up

After presenting an audit, offer:

> "Would you like me to:
> - Draft content briefs for the top keyword opportunities?
> - Create optimized title tags and meta descriptions for your key pages?
> - Build a content calendar based on the gap analysis?
> - Run a broken-link backlink outreach campaign to build links to your top pages?
> - Run the full 80-item CORE-EEAT audit on a specific page?
> - Run the CITE domain authority audit to diagnose why content isn't being cited?
> - Identify top content refresh candidates from your existing pages?
> - Audit your entity presence in Google Knowledge Graph and AI systems?
> - Set up a monitoring alert configuration for rankings and AI visibility?
> - Generate LLM discovery files (llms.txt, agent-card.json, security.txt) for your domain?
> - Dive deeper into any specific section of the audit?
> - Run this same analysis for a different competitor or domain?"

---

## Related Skills

- Use `blog-articles` when the user first needs a strong canonical article before optimization.
- Use `content-syndication` when the optimized piece needs channel-specific variants after SEO and GEO improvements.
