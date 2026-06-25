# AEO + GEO Content Block Templates

Fill-in-the-blank templates for high-citation, answer-engine-optimized content.

---

## Template 1: Definition Block (Featured Snippet Target)

**Best for:** "What is X?" queries, conceptual topics, glossary entries
**Target length:** 40-60 words for the definition paragraph

```markdown
## What is [Term / Concept]?

[Term] is [specific, complete 1-sentence definition]. [1-2 sentences expanding on
how it works or why it matters]. [Optional: 1 sentence on who uses it or typical
applications].

### How [Term] Works

[Expand into more detail here — this section provides depth beyond the snippet]
```

**Example — filled in:**

```markdown
## What is Generative Engine Optimization?

Generative Engine Optimization (GEO) is the practice of structuring content to
be cited by AI-powered assistants like ChatGPT, Perplexity, and Google Gemini.
Unlike traditional SEO, GEO targets AI recommendation rather than search engine
ranking, focusing on content authority, clear structure, and citation-worthy claims.

### How GEO Works

When a user asks an AI assistant a question, the AI selects sources to cite based
on domain authority, content clarity, named attributions, and factual specificity...
```

---

## Template 2: Step-by-Step Process (HowTo AEO)

**Best for:** "How to X" queries, tutorials, guides
**Schema:** Add HowTo schema markup — see `references/structured-data.md`

```markdown
## How to [Achieve Goal]

[1-sentence overview of the process and expected outcome]

1. **[Verb + Noun — clear step name]**: [What to do. Why it matters. 1-2 sentences max]
2. **[Verb + Noun — clear step name]**: [What to do. What to look for. 1-2 sentences]
3. **[Verb + Noun — clear step name]**: [What to do. Common mistake to avoid. 1-2 sentences]
4. **[Verb + Noun — clear step name]**: [What to do. Expected result. 1-2 sentences]
5. **[Verb + Noun — clear step name]**: [What to do. How to verify success. 1-2 sentences]

**Expected outcome**: [Specific result with timeframe if applicable]
**Common mistake**: [Most frequent error to avoid]
```

**Example — filled in:**

```markdown
## How to Optimize a Page for Featured Snippets

Earning a featured snippet requires matching content format to the query type
and providing a direct, extractable answer.

1. **Identify the target query**: Find a question-format query where a snippet
   currently exists in Google SERP. These are easier to win than queries without
   existing snippets.
2. **Match the snippet format**: Check whether the current snippet is a paragraph,
   ordered list, or table — then create better content in that same format.
3. **Write a question-format H2**: Use the exact query as your H2 heading
   (e.g., "How long should a meta description be?")
4. **Answer immediately after the heading**: Place your 40-60 word answer in the
   very first sentence after the H2 — not after introductory context.
5. **Add supporting detail**: Expand with deeper explanation, examples, and data
   after the snippet-optimized paragraph.

**Expected outcome**: Snippet appearance within 2-8 weeks for pages already ranking
in positions 2-10.
**Common mistake**: Writing the answer after a paragraph of context. Google
extracts the first paragraph after a question heading.
```

---

## Template 3: Comparison Table (X vs Y AEO)

**Best for:** "[X] vs [Y]" queries, evaluation queries, "best for" decisions
**Schema:** No specific schema — the table format is what Google extracts

```markdown
## [Option A] vs [Option B]: [Core Comparison Dimension]

[1-2 sentence summary establishing the comparison context and who this is for]

| Factor | [Option A] | [Option B] |
|--------|------------|------------|
| [Criterion 1] | [Specific value/description] | [Specific value/description] |
| [Criterion 2] | [Specific value/description] | [Specific value/description] |
| [Criterion 3] | [Specific value/description] | [Specific value/description] |
| [Criterion 4] | [Specific value/description] | [Specific value/description] |
| Learning curve | [Easy/Moderate/Steep + context] | [Easy/Moderate/Steep + context] |
| Pricing | [Price range or free/paid] | [Price range or free/paid] |
| Best for | [Specific use case] | [Specific use case] |

**Choose [Option A] when**: [Specific condition that makes A the better choice]
**Choose [Option B] when**: [Specific condition that makes B the better choice]
```

**Example — filled in:**

```markdown
## SEO vs GEO: What's the Difference?

SEO and GEO both aim to increase content visibility, but target different
discovery systems. Most sites need both working together.

| Factor | SEO | GEO |
|--------|-----|-----|
| Target system | Google/Bing search engines | AI assistants (ChatGPT, Perplexity, Gemini) |
| Primary signal | Backlinks + on-page relevance | Named citations + content authority |
| Success metric | Organic traffic + rankings | Brand citations + AI mentions |
| Content format | Keyword-optimized, comprehensive | Self-contained, citation-worthy paragraphs |
| Timeline to results | 3-6 months | 6-12 months |
| Measurement | Search Console, Ahrefs | Manual AI queries, brand search volume |
| Best for | Traffic-focused goals | Brand awareness, research-phase buyers |

**Choose SEO when**: Your primary goal is driving website traffic and your
audience starts their research in search engines.
**Choose GEO when**: Your audience is early-stage researchers using AI to
narrow their choices, or when you want to build brand recognition.
```

---

## Template 4: FAQ Block (PAA and Voice Optimization)

**Best for:** Any topic with multiple common questions
**Schema:** Add FAQPage schema to the entire section

```markdown
## Frequently Asked Questions About [Topic]

### [Question phrased as users naturally ask it — include question words: what, how, why, when, who]?

[Direct answer in first sentence — this is what gets extracted]. [Additional context
in 2-3 sentences. Include specific details. Keep total to 50-100 words.]

### [Second question]?

[Direct answer first]. [Context]. [Specific example or data point].

### [Third question]?

[Direct answer first]. [Nuance or important caveat]. [When to seek more information].
```

**GEO note:** Each answer should make complete sense without reading other answers.

---

## Template 5: Statistics Citation Block (GEO Citation Magnet)

**Best for:** Any factual claim. Statistics with named sources increase AI citation rates 15-30%.

```markdown
[Topic area claim]. According to [Source Organization], [Specific Statistic with
Number, Percentage, or Comparison] as of [Year/Quarter]. [Practical implication
of this data in 1-2 sentences].
```

**Examples — filled in:**

```markdown
Mobile search dominance is accelerating. According to Google's 2024 Search
Trends Report, 65% of all Google searches now originate from mobile devices,
up from 58% in 2021. This makes mobile Core Web Vitals a critical ranking factor,
not an optional enhancement.

AI-mediated search is reshaping how content gets discovered. According to
Statista's 2024 Digital Consumer Report, 35% of internet users regularly use
AI assistants for information gathering, with this number growing 18% year-over-year.
Traditional SEO practitioners must now optimize for citation by AI systems, not
just ranking in search result pages.
```

---

## Template 6: Expert Quote Block (GEO Authority Signal)

**Best for:** Building topical authority, supporting controversial claims, adding credibility
**Rule:** Only use real quotes from real people — never fabricate

```markdown
"[Direct verbatim quote from the expert]," [says/wrote/notes] [Full Name], [Title]
at [Organization]. [1 sentence of context explaining why this perspective matters
or what it implies for your reader].
```

---

## Template 7: Evidence Sandwich (Maximum Credibility)

**Best for:** Contested claims, important recommendations, GEO citation targets

```markdown
[Opening claim as a declarative statement]

Evidence supporting this:
- [Specific data point 1 with named source]
- [Specific data point 2 with named source]
- [Specific data point 3 with named source]

[Conclusion connecting the evidence to a concrete, actionable implication]
```

**Example — filled in:**

```markdown
Content length is less important than comprehensiveness for SEO performance.

Evidence supporting this:
- Semrush's 2023 Content Marketing Study found that articles ranking #1 averaged
  1,447 words — not the 3,000+ often cited as optimal
- Backlinko's analysis of 912 million blog posts found no direct correlation
  between word count and backlinks
- Google's Gary Illyes stated in 2019 that Google has no target length for content

The implication: write until the topic is thoroughly covered and common questions
are answered — not until you hit an arbitrary word count.
```

---

## Template 8: Self-Contained Definition (AI Extraction Optimized)

**Best for:** Glossary pages, key concept explanations, anywhere AI might quote you
**Rule:** The statement must make sense when extracted without surrounding context

```markdown
**[Term or Concept]**: [Complete definition that makes sense in isolation, with
no pronouns referring to outside context. Include specific details that make
the definition useful: what it is, how it works, why it matters. Target 40-80 words.]
```

**Examples — filled in:**

```markdown
**Featured snippet**: A featured snippet is a short excerpt from a webpage that
Google displays directly in search results above the organic listings, in a
highlighted box. Snippets appear for informational queries and take the form of
paragraphs (40-60 words), ordered lists (steps), unordered lists (categories),
or tables. Winning a featured snippet can increase click-through rate by 5-30%
for the targeted keyword.

**Core Web Vitals**: Core Web Vitals are Google's three user experience metrics
that directly influence search ranking: Largest Contentful Paint (LCP, measures
loading performance, target under 2.5 seconds), Interaction to Next Paint (INP,
measures responsiveness, target under 200ms), and Cumulative Layout Shift (CLS,
measures visual stability, target under 0.1). Pages failing these thresholds
receive ranking penalties compared to passing competitors.
```

---

## Template 9: Voice Search Optimization Block

**Best for:** Local queries, simple factual queries, conversational topics

**Voice search response rules:**
- Answer must be 30 words or under (what a voice assistant reads aloud)
- Use natural conversational language
- Answer the question before providing supporting detail
- Include local context where relevant

```markdown
### [Full Natural-Language Question As User Would Ask It]?

[30-word or under direct answer, written in conversational language]. [Expand
with detail in subsequent paragraphs for readers who want more context]
```

**Example — filled in:**

```markdown
### What's the ideal length for an SEO meta description?

The ideal meta description is 150-160 characters. Google typically truncates
descriptions longer than 160 characters in search results, cutting off your
message mid-sentence.

For best results, include your primary keyword early, explain the specific value
of the page, and end with an implicit or explicit call to action. Avoid duplicate
descriptions across pages — Google often rewrites descriptions it considers
unhelpful or keyword-stuffed.
```

---

## Content Block Combination Guide

**For a comprehensive pillar page:**
1. Open with a Definition Block (Template 1)
2. Follow with a Step-by-Step Process (Template 2) for the main workflow
3. Add a Comparison Table (Template 3) if there are alternatives to evaluate
4. Include Statistics Citation Blocks (Template 5) throughout
5. Integrate Expert Quotes (Template 6) to support key claims
6. End with a FAQ Block (Template 4) targeting PAA questions

**For a blog post targeting AI citations:**
1. Definition Block at the top (what is this topic?)
2. Statistics Citation Blocks for every major claim
3. Evidence Sandwiches for your strongest recommendations
4. Self-Contained Definitions for any jargon
5. FAQ Block at the end

**For a landing page:**
1. Self-Contained Definition of your product/solution
2. Comparison Table (your product vs alternatives)
3. FAQ Block (common objections and questions)
4. No long-form AEO blocks — landing pages prioritize conversion, not snippets
