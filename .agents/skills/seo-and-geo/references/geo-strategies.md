# GEO + AEO: Deep Strategies Reference

Generative Engine Optimization and Answer Engine Optimization — comprehensive strategies for AI-mediated discovery.

---

## The Shift: From Keywords to Conversations

Traditional SEO: User types `best crm software` → gets 10 blue links → clicks one.

AI-mediated search: User asks "What CRM should I use for a 10-person sales team?" → AI gives a direct recommendation citing 2-3 sources → user may or may not click.

**Implications:**
- Zero-click is now the norm for many queries (60%+ of searches end without a click)
- Brand citations in AI responses matter even without clicks
- The race is for AI recommendation, not just search ranking
- Long, conversational queries are growing faster than short keyword queries

---

## How AI Systems Select Content to Cite

AI assistants (ChatGPT, Claude, Perplexity, Gemini) select sources based on:

1. **Training data inclusion** — Was your content in the model's training set?
2. **Real-time retrieval** — Does your content appear in current web search? (Perplexity, Gemini's grounding, Bing Copilot)
3. **Authoritative sourcing** — Is your domain trusted? Are you cited by others?
4. **Extraction ease** — Is the information in a clear, extractable format?
5. **Recency** — For time-sensitive queries, fresh content wins

**GEO strategy:** Optimize for all five simultaneously.

---

## Platform-Specific GEO Strategies

### ChatGPT (OpenAI)

- **Training data cutoff:** Optimize for content that existed before the cutoff AND publish regularly for future updates
- **GPT-4 browsing:** When browsing is enabled, fresh content can be cited
- **Citation preference:** Prefers well-known domains, Wikipedia, official documentation
- **Format preference:** Clear prose with labeled facts; tables for comparisons
- **Tactic:** Build domain authority through backlinks from recognized publications

### Perplexity AI

- **Heavily real-time:** Crawls and cites current web content — most similar to search engines
- **Citation visible to users:** Every claim is linked to a source — users see and click your link
- **Format preference:** Structured content with clear headings wins; FAQ format scores well
- **Speed matters:** Fast-loading pages get crawled and cited more reliably
- **Tactic:** Optimize for Bing (Perplexity uses Bing index) — submit sitemap to Bing Webmaster Tools

### Google AI Overviews (formerly SGE)

- **Preferring ranked pages:** AI Overviews predominantly cite pages that already rank in top 10
- **Format preference:** Definition blocks, numbered lists, and FAQ sections are heavily extracted
- **Content quality signal:** E-E-A-T signals directly influence inclusion
- **Tactic:** Win the organic ranking first; AI Overviews follows organic authority

### Gemini (Google)

- **Tightly integrated with Google Search:** Content that ranks tends to get cited
- **Prefers structured answers:** Question-answer format, step-by-step instructions
- **Tactic:** Same as Google SEO + structured data markup

### Claude (Anthropic)

- **Training cutoff applies:** Cannot cite content after training cutoff in base model
- **Analysis-focused:** Prefers content with nuance, caveats, and balanced perspectives
- **Source quality:** Prefers peer-reviewed, official, or well-established sources
- **Tactic:** Publish thorough, balanced, well-cited content on stable facts

### Bing Copilot

- **Real-time Bing index:** Cites current web content like Perplexity
- **Highly structured preference:** Bullet lists, numbered steps, comparison tables cited frequently
- **Tactic:** Optimize for Bing — submit to Bing Webmaster Tools, use structured data

---

## The GEO Content Framework

### 1. Claim-Evidence-Implication (CEI) Structure

The most citation-worthy content structure:

```
Claim: [Clear, specific factual statement]
Evidence: According to [Source], [supporting statistic or finding].
Implication: This means [actionable insight or consequence].
```

**Example:**
```
Voice search now accounts for 27% of all mobile searches.
According to Google's 2023 Voice Search Report, 71% of consumers
prefer using voice search instead of typing for queries on the go.
This means content optimized for conversational queries — not just
short keywords — is essential for mobile audience reach.
```

### 2. The Authority Sandwich

```
[Opening claim positioned as established fact]
[Evidence from recognized source with attribution]
[Expert perspective from named individual with credentials]
[Practical implication with specificity]
```

### 3. Self-Contained Paragraph Design

Every paragraph should be quotable in isolation. AI systems extract paragraphs without surrounding context.

**Test:** Cover everything except one paragraph. Does it still make sense and have value? If not, rewrite.

**Before (context-dependent):**
> This is why the approach above works so well. The mechanism relies on the same principle.

**After (self-contained):**
> Structured data works well for AI citation because it communicates content meaning in a machine-readable format that AI systems can parse directly from the HTML, without relying on natural language interpretation.

---

## Featured Snippets: AEO Targeting

### Snippet Types and How to Win Each

**Paragraph snippets** (40-60 words)
- Trigger queries: "What is X", "Why is X", "Who is X"
- Win by: Writing a concise, complete definition immediately after a question-format H2/H3
- Format: 2-4 sentences, dense with information, no fluff

**Ordered list snippets** (numbered steps)
- Trigger queries: "How to X", "Steps to X", "How do you X"
- Win by: Using numbered lists with bold step names
- Format: 5-9 steps, each starting with a verb

**Unordered list snippets** (bullet points)
- Trigger queries: "Types of X", "Examples of X", "Best X", "X vs Y factors"
- Win by: Bullet lists under question-format headings
- Format: 5-9 bullets, consistent structure

**Table snippets**
- Trigger queries: "X vs Y", "Comparison of X", "X prices", "X specifications"
- Win by: Markdown or HTML tables with clear column headers
- Format: 3-8 rows, 2-4 columns, first column is the comparison dimension

### Featured Snippet Optimization Checklist

- [ ] Target question identified (exact phrase users search)
- [ ] H2 or H3 uses the exact question as heading
- [ ] Answer provided in FIRST SENTENCE after the heading
- [ ] Paragraph snippets: 40-60 words, complete sentence, specific
- [ ] List snippets: numbered for steps, bulleted for categories
- [ ] Table snippets: clear column headers, consistent data format
- [ ] FAQ schema added for FAQ-type content
- [ ] HowTo schema added for step-by-step content

### People Also Ask (PAA) Optimization

PAA boxes appear for most informational queries. Each PAA answer is a snippet opportunity.

**Workflow:**
1. Search your target keyword in Google
2. Screenshot all PAA questions
3. Expand each question to see the current answer source
4. Create H2/H3 headings matching each PAA question
5. Write 40-100 word answers optimized for each
6. These become natural FAQ section content

---

## AI Overview Optimization (Google)

Google AI Overviews appear above organic results for many queries. Key observations:

**Who gets cited:**
- Sites ranking in top 10 organic results
- Sites with high domain authority
- Sites with structured data markup
- Sites with clear, extractable answers

**Content format preferences:**
- Definition sections (H2: "What is X?" + 40-60 word definition)
- Step-by-step guides with numbered lists
- Comparison tables
- FAQ sections with FAQPage schema

**Avoid in AI Overview-targeted content:**
- Opinion-heavy or speculative content without evidence
- Paywall or login requirements on key content
- Content that changes frequently without dates
- Thin content (under 500 words)

---

## Voice Search Optimization

Voice queries are 29 words longer than typed queries on average and are phrased as natural speech.

### Conversational Query Patterns

**Typed:** `best crm small business`
**Voice:** `What's the best CRM software for a small business with 10 employees?`

**Typed:** `python vs javascript`
**Voice:** `Should I learn Python or JavaScript first for web development?`

### Voice Search Content Strategy

1. **Target long-tail conversational queries** — exact match how people speak
2. **Use question-format headings** — "What is X?" not "About X"
3. **Provide 30-word answers** — Voice assistants read one response aloud
4. **Local intent** — "near me" queries dominate voice; local schema critical
5. **Speakable schema** — Mark content appropriate for text-to-speech

**SpeakableSpecification implementation:**
```json
{
  "@context": "https://schema.org",
  "@type": "WebPage",
  "speakable": {
    "@type": "SpeakableSpecification",
    "cssSelector": [".article-body", ".summary"]
  }
}
```

---

## Domain-Specific GEO Tactics

### SaaS / Technology

**High-value content types for AI citation:**
- Definitive comparison guides (Your Tool vs Competitor)
- Technical tutorials with working code
- Benchmark data and performance comparisons
- Integration documentation
- Pricing transparency pages

**Citation signals:**
- Mention in tech review sites (G2, Capterra, ProductHunt)
- GitHub stars and open-source presence
- Developer documentation cited by Stack Overflow
- Analyst coverage (Gartner, Forrester)

### E-commerce / Retail

**High-value content types:**
- Best-of guides with editorial criteria
- Product comparison tables
- Buyer's guides with use-case segmentation
- User-generated reviews with structured markup

**Citation signals:**
- Product schema with ratings and price
- Merchant Center feed quality
- Press coverage and brand mentions
- Influencer and publisher partnerships

### Health / Medical / Wellness

**AI citation requirements** (YMYL — Your Money Your Life):
- Board-reviewed or expert-authored content
- Citations from peer-reviewed studies (PubMed, NEJM, Lancet)
- Publication dates and review dates visible
- Author credentials (MD, PhD) displayed
- Content review process documented

**Avoid:** Unsourced health claims. AI systems are cautious with YMYL content.

### Finance

**AI citation requirements:**
- CFA, CPA, or financial expert authorship
- Regulatory source citations (SEC, FDIC, IRS)
- Specific numbers with timeframes ("as of Q3 2024")
- Clear disclaimers (not investment advice)
- Transparent methodology for rankings

### Legal

**AI citation requirements:**
- Attorney authorship with bar association info
- Specific law/statute citations with jurisdiction
- "Last updated" dates (law changes)
- Geographic scope clearly stated
- Appropriate disclaimers

---

## Topical Authority: The Foundation of GEO

AI systems prefer to cite recognized authorities on topics. Building topical authority:

### Phase 1: Define Your Topic Cluster

Pick 3-5 core topics. For each:
- Create a comprehensive pillar page (2,000-5,000 words)
- Create 10-20 cluster pages covering subtopics
- Interlink all cluster pages to the pillar

### Phase 2: Content Depth

For each cluster topic:
- Cover every important subtopic
- Answer every major "what, how, why, when, who" question
- Include data, examples, case studies
- Update content when the topic evolves

### Phase 3: External Validation

Topical authority is confirmed when:
- Other sites link to your content as a source
- You're mentioned in "resources" or "further reading" sections
- Industry publications quote your research
- Google and AI systems cite you consistently

### Phase 4: Brand Presence in AI Training

For long-term GEO:
- Get covered by publications that are in AI training datasets (Wikipedia, major news, academic)
- Create original research that others cite
- Build brand mentions even without backlinks
- Publish consistently so future model training includes your content

---

## Zero-Click Strategy

Many queries will never drive traffic — the answer is displayed directly in the SERP or AI response. The strategy shifts from "drive clicks" to "build brand awareness through citations."

**Zero-click query types:**
- Calculator queries ("how many calories in X")
- Conversion queries ("100 dollars to euros")
- Direct fact queries ("who is the CEO of Apple")
- Local info ("what time does X close")
- Simple definitions ("what is capitalism")

**Zero-click optimization goals:**
- Brand name appears in the answer (even without click)
- Position "0" (featured snippet) shows brand
- AI response cites brand as source
- User remembers brand when they're ready to act

**Measure:** Track brand mention frequency in AI responses, not just clicks.

---

## Competitive GEO Analysis

### Find Who AI Cites for Your Topics

1. Open ChatGPT, Claude, Perplexity, Gemini
2. Ask your most important business questions
3. Note every source cited
4. Analyze those sources: what makes them citation-worthy?
5. Identify gaps: what do they have that you lack?

### Questions to Ask:
- "What is the best [your category] tool?"
- "How do I [your core use case]?"
- "What are the top [your category] options?"
- "Compare [your brand] vs [competitor]"

### Gap Analysis

| What competitors have | Your action |
|-----------------------|-------------|
| Comprehensive guide on Topic X | Create a better, more detailed guide |
| Original research data | Commission or conduct your own research |
| Expert quotes in content | Add real expert quotes with credentials |
| High domain authority | Build links from recognized publishers |
| Structured data markup | Implement full schema coverage |
| Active publishing cadence | Increase content frequency |
