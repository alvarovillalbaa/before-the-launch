# Entity Optimization

Entities — the people, organizations, products, and concepts that search engines and AI systems recognize as distinct things — are the foundation of how both Google and LLMs decide *what a brand is*.

**Key principle:** Consistency beats completeness. Five weak but consistent signals together are stronger than one strong but isolated signal.

---

## Why Entities Matter for GEO

When an AI assistant is asked about your brand, product, or topic, it draws on its training data and real-time retrieval. Whether it "knows" you as a distinct entity affects:

- Whether it recommends you vs. a competitor
- Whether it mentions you correctly (vs. confusing you with a similar-named brand)
- Whether it cites your content as authoritative

A brand with a Knowledge Panel, Wikidata entry, and consistent schema markup is 6× more likely to be cited than one without.

---

## The 6 Entity Signal Dimensions

| Dimension | What It Is | Key Action |
|-----------|-----------|-----------|
| **Structured Data** | Schema.org markup declaring your entity | Implement Organization schema on homepage |
| **Knowledge Bases** | Wikipedia, Wikidata, Google Knowledge Graph | Create/claim Wikidata entry; ensure Wikipedia accuracy |
| **NAP+E Consistency** | Name, Address, Phone + Entity attributes consistent across web | Audit all directories, profiles, and citations |
| **Content Authority** | On-site content that demonstrates topical authority | Publish primary research; build topic clusters |
| **Third-Party Validation** | Mentions, citations, reviews on other sites | Earn press coverage, guest posts, directory listings |
| **AI-Specific Signals** | Content structured for AI extraction | Direct Answer (C02), FAQ sections (C09), entity precision (R07) |

---

## 3-Step Entity Audit Workflow

### Step 1: Entity Discovery

Map current presence across:

**Search visibility:**
```
site:[domain] — how many pages are indexed
[brand name] — does a Knowledge Panel appear?
[brand name] site:wikipedia.org — any Wikipedia page?
```

**Knowledge Graph:**
- Search brand name in Google → does a Knowledge Panel appear?
- Check `search.google.com/structured-data/testing-tool` for schema detection
- Search `wikidata.org` for existing entries

**AI system recognition:**
- Query ChatGPT, Claude, Perplexity: "What is [brand]?"
- Note: does the response mention you? Is the info accurate?
- Check for disambiguation issues (confused with similar entities)

### Step 2: Signal Audit

Score each dimension (Strong / Weak / Missing):

| Signal | Status | Gap |
|--------|--------|-----|
| Organization schema on homepage | | |
| Wikidata entry exists | | |
| Wikipedia entry exists (if notable) | | |
| Google Knowledge Panel appears | | |
| NAP+E consistent across top 20 mentions | | |
| Author schema on all bylined content | | |
| "sameAs" links to Wikidata, LinkedIn, official profiles | | |
| AI systems describe brand accurately | | |
| No disambiguation confusion with similar entities | | |

### Step 3: Prioritized Action Plan

**Phase 1 — Foundation (Week 1–2):**
- Add/fix `Organization` schema with `sameAs` links to Wikidata, LinkedIn, Crunchbase, official social profiles
- Ensure NAP+E consistency across top directories (Google Business, LinkedIn, Crunchbase)
- Create or claim Wikidata entry if one doesn't exist

**Phase 2 — Knowledge Base (Month 1–2):**
- Create Wikidata entry with all relevant properties (name, website, founded, industry, key people)
- If notable enough, create or improve Wikipedia page (requires notability per Wikipedia guidelines)
- Submit structured data via Google Search Console

**Phase 3 — Third-Party Validation (Month 2–4):**
- Earn mentions on authoritative sites (.edu, .gov, major publications)
- Ensure all author bylines link to a consistent author profile page with Person schema
- Build press kit with official brand assets for consistent use by media

**Phase 4 — AI-Specific (Ongoing):**
- Structure on-site content with Direct Answer blocks (C02) for key queries
- Add FAQ sections answering "What is [brand]?", "Who founded [brand]?", "What does [brand] do?"
- Use entity precision (R07): always use full brand name consistently, never abbreviate without defining first

---

## Schema Markup for Entity Optimization

### Organization Schema (homepage)

```json
{
  "@context": "https://schema.org",
  "@type": "Organization",
  "name": "[Brand Name]",
  "url": "https://example.com",
  "logo": "https://example.com/logo.png",
  "description": "[1-2 sentence description]",
  "foundingDate": "[year]",
  "sameAs": [
    "https://www.wikidata.org/wiki/Q[ID]",
    "https://www.linkedin.com/company/[slug]",
    "https://twitter.com/[handle]",
    "https://www.crunchbase.com/organization/[slug]"
  ]
}
```

### Person Schema (author pages)

```json
{
  "@context": "https://schema.org",
  "@type": "Person",
  "name": "[Author Name]",
  "url": "https://example.com/authors/[slug]",
  "jobTitle": "[Title]",
  "worksFor": {
    "@type": "Organization",
    "name": "[Brand Name]"
  },
  "sameAs": [
    "https://www.linkedin.com/in/[slug]",
    "https://twitter.com/[handle]"
  ]
}
```

---

## Disambiguation Resolution

When AI systems confuse your entity with another:

1. **Identify the conflict** — search your brand name to find the competing entity
2. **Add disambiguation signals** in schema: use specific identifiers (`leiCode`, `taxID`, or location-based attributes)
3. **Publish disambiguation content** — a clear "About" page explaining what makes your entity distinct
4. **Build entity-specific citations** — earn mentions on pages that also cite the conflicting entity but distinguish between them
5. **Use Wikidata** — add an entry with a disambiguation note if applicable

---

## Monitoring Entity Health

Check monthly:
- Google Knowledge Panel accuracy — report corrections via Google's feedback link
- Wikidata entry accuracy — edit directly or request corrections
- AI system responses — query ChatGPT/Claude/Perplexity for brand queries; note accuracy and citation frequency
- NAP+E consistency — audit top 20 third-party mentions for name/description consistency
