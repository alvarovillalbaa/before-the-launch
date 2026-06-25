# GEO and AEO Content Patterns

Reusable content block templates optimized for AI citation and answer engine extraction.

---

## AEO Patterns (Answer Engine Optimization)

These patterns help content appear in featured snippets, AI Overviews, voice search results, and answer boxes. See SKILL.md for the core Definition, Step-by-Step, Comparison Table, and FAQ patterns. Additional patterns below.

### Pros and Cons Block

Use for evaluation queries: "Is [X] worth it?", "Should I [X]?"

```markdown
## Advantages and Disadvantages of [Topic]

[1-sentence overview of the evaluation context]

### Pros

- **[Benefit category]**: [Specific explanation]
- **[Benefit category]**: [Specific explanation]
- **[Benefit category]**: [Specific explanation]

### Cons

- **[Drawback category]**: [Specific explanation]
- **[Drawback category]**: [Specific explanation]
- **[Drawback category]**: [Specific explanation]

**Verdict**: [1-2 sentence balanced conclusion with recommendation]
```

### Listicle Block

Use for "Best [X]", "Top [X]", "[Number] ways to [X]" queries.

```markdown
## [Number] Best [Items] for [Goal/Purpose]

[1-2 sentence intro establishing context and selection criteria]

### 1. [Item Name]

[Why it's included in 2-3 sentences with specific benefits]

### 2. [Item Name]

[Why it's included in 2-3 sentences with specific benefits]
```

---

## GEO Patterns (Generative Engine Optimization)

These patterns optimize content for citation by AI assistants. AI systems extract passages, not pages — every key claim should work as a standalone statement.

### Statistic Citation Block

Statistics increase AI citation rates by 15-30%. Always include sources.

```markdown
[Claim statement]. According to [Source/Organization], [specific statistic with number and timeframe]. [Context for why this matters].
```

**Example:**
```markdown
Mobile optimization is no longer optional for SEO success. According to Google's 2024 Core Web Vitals report, 70% of web traffic now comes from mobile devices, and pages failing mobile usability standards see 24% higher bounce rates. This makes mobile-first indexing a critical ranking factor.
```

### Expert Quote Block

Named expert attribution adds credibility and increases citation likelihood (+25-30% boost).

```markdown
"[Direct quote from expert]," says [Expert Name], [Title/Role] at [Organization]. [1 sentence of context or interpretation].
```

**Example:**
```markdown
"The shift from keyword-driven search to intent-driven discovery represents the most significant change in SEO since mobile-first indexing," says Rand Fishkin, Co-founder of SparkToro. This perspective highlights why content strategies must evolve beyond traditional keyword optimization.
```

### Authoritative Claim Block

Structure claims for easy AI extraction with clear attribution.

```markdown
[Topic] [is/has/requires/involves] [clear, specific claim]. [Source] [confirms/reports/found] that [supporting evidence]. This [explains/means/suggests] [implication or action].
```

**Example:**
```markdown
E-E-A-T is the cornerstone of Google's content quality evaluation. Google's Search Quality Rater Guidelines confirm that trust is the most critical factor, stating that "untrustworthy pages have low E-E-A-T no matter how experienced, expert, or authoritative they may seem." This means content creators must prioritize transparency and accuracy above all other optimization tactics.
```

### Self-Contained Answer Block

Create quotable, standalone statements that AI can extract directly. Optimal length: 40-60 words.

```markdown
**[Topic/Question]**: [Complete, self-contained answer that makes sense without additional context. Include specific details, numbers, or examples in 2-3 sentences.]
```

**Example:**
```markdown
**Ideal blog post length for SEO**: The optimal length for SEO blog posts is 1,500-2,500 words for competitive topics. This range allows comprehensive topic coverage while maintaining reader engagement. HubSpot research shows long-form content earns 77% more backlinks than short articles, directly impacting search rankings.
```

### Evidence Sandwich Block

Structure claims with layered evidence for maximum credibility.

```markdown
[Opening claim statement].

Evidence supporting this includes:
- [Data point 1 with source]
- [Data point 2 with source]
- [Data point 3 with source]

[Concluding statement connecting evidence to actionable insight].
```

---

## Domain-Specific GEO Tactics

Different content domains benefit from different authority signals.

### Technology Content
- Emphasize technical precision and correct terminology
- Include version numbers and dates for software/tools
- Reference official documentation
- Add code examples where relevant

### Health/Medical Content
- Cite peer-reviewed studies with publication details
- Include expert credentials (MD, RN, etc.)
- Note study limitations and context
- Add "last reviewed" dates

### Financial Content
- Reference regulatory bodies (SEC, FTC, etc.)
- Include specific numbers with timeframes
- Note that information is educational, not advice
- Cite recognized financial institutions

### Legal Content
- Cite specific laws, statutes, and regulations
- Reference jurisdiction clearly
- Include professional disclaimers
- Note when professional consultation is advised

### Business/Marketing Content
- Include case studies with measurable results
- Reference industry research and reports
- Add percentage changes and timeframes
- Quote recognized thought leaders

---

## Voice Search Optimization

Voice queries are conversational and question-based. Optimize for these patterns:

**Common voice query formats:**
- "What is..."
- "How do I..."
- "Where can I find..."
- "Why does..."
- "When should I..."
- "Who is..."

**Voice-optimized answer structure:**
- Lead with direct answer (under 30 words ideal)
- Use natural, conversational language
- Avoid jargon unless targeting expert audience
- Include local context where relevant
- Structure for a single spoken response
