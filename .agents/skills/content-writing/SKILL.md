---
name: content-writing
description: >-
  Use for content creation, repurposing, refreshes, audits, keyword research,
  support-to-content analysis, and article editing. Covers SEO blog posts,
  LinkedIn and X articles, multi-channel syndication, humanizing AI text, GEO
  and AI-citation optimization, CORE-EEAT audits, content gap analysis, keyword
  discovery, and converting support signals into prioritized content briefs.
version: 1.1.0
license: MIT
compatibility: Instruction-only. Optional file read/write.
---

# Content Writing

## Overview

A unified content-writing skill covering the full content lifecycle:

| Mode | Trigger | Output |
|------|---------|--------|
| **Blog** | "write a blog / turn these notes into an article" | Canonical blog article with outline, draft, and metadata |
| **X Article** | "write / optimize an X Article / Twitter Article" | 8-step analysis + complete optimized rewrite |
| **LinkedIn** | "write a LinkedIn post / article / carousel" | LinkedIn-native draft ready to publish |
| **Syndication** | "repurpose this across channels / give me a distribution pack / syndicate to Dev.to, Hashnode, Reddit" | Per-channel artifacts for X, LinkedIn, Substack, Medium, Dev.to, Hashnode, Reddit |
| **Humanize** | "humanize this / remove AI traces / make this sound human" | De-AI-ified rewrite with pattern commentary and quality score |
| **GEO Optimize** | "optimize for AI / get cited by ChatGPT / make this AI-quotable" | GEO analysis + before/after score + AI-citation-ready rewrite |
| **Content Audit** | "audit content quality / CORE-EEAT score / content quality check" | 80-item CORE-EEAT audit report with dimension scores, veto checks, and prioritized action plan |
| **Content Refresh** | "update old content / refresh this article / content is outdated / traffic declining / rankings dropped" | Freshness analysis, update prioritization, refresh plan, GEO enhancement, and republishing strategy |
| **Content Gap Analysis** | "find content gaps / content opportunities / what am I missing / untapped topics" | Competitive gap analysis, keyword gap matrix, format gaps, audience journey gaps, and prioritized content calendar |
| **Keyword Research** | "find keywords / keyword research / what should I write about / identify ranking opportunities" | Keyword discovery report with intent classification, difficulty scoring, opportunity matrix, topic clusters, GEO potential, and content calendar |
| **Support-to-Content** | "analyze support tickets / content from customer questions / what should I document / reduce support load" | Ticket pattern analysis + prioritized content briefs for help articles and blog posts |
| **Edit Article** | "edit / revise / improve this article / restructure these sections / tighten prose" | DAG-ordered section map confirmed with user + per-section rewrite with tight paragraphs |

### Natural Content Pipeline

These modes build on each other in a predictable order:

```
Support tickets → [Support-to-Content] → Content briefs (help articles, blog posts)
                                                        ↓
Content strategy → [Keyword Research] → High-value keyword list + topic clusters
                                                        ↓
                   [Content Gap Analysis] → Prioritized opportunity list + content calendar
                                                        ↓
Raw knowledge → [Blog mode] → Canonical blog article
                                    ↓
                           [X Article mode] → X-native long-form
                                    ↓
                        [Syndication mode] → X thread, LinkedIn post,
                                             Substack newsletter, Medium article,
                                             Dev.to post, Hashnode article, Reddit post
                                    ↓
                      [GEO Optimize mode] → AI-citation-ready rewrite
                                    ↓
                    [Content Audit mode] → CORE-EEAT quality gate

Existing content → [Content Refresh mode] → Updated article with fresh stats,
                                             new sections, GEO enhancements,
                                             and republishing strategy
```

Use **Keyword Research** first when you need to discover what people are actually searching for before defining your strategy. Use **Content Gap Analysis** when you already know your topic space and want to benchmark against competitors. Use **Blog** first when starting from scratch on a specific topic. Use **Syndication** when you already have a finished canonical piece. Use **Humanize** on any draft — yours or AI-generated — that reads like a machine wrote it. Use **Content Audit** as a final quality gate before publishing.

### Visual Companion Assets

When the user also needs visuals for the content, keep the asset plan explicit instead of treating imagery as an afterthought.

Supported paths:

1. Images generated during the task
2. Existing external image URLs already referenced in the repo
3. Existing local repo images
4. Code-as-image product visuals
5. Mixed compositions

Decision rules:

1. Prefer code-as-image for product-led articles, carousels, and feature explainers where the image should faithfully represent the product.
2. Reuse existing external URLs when the right asset already exists.
3. Local repo images are valid, but if the artifact is meant for hosted distribution, prefer promoting them to the active asset host or public URL.
4. Generate supporting imagery on the fly when the repo does not already cover the need.
5. For actual visual production, hand off to `code-as-images`, `code-slides`, `html-visualization`, or `video-generation` as appropriate.

---

## Mode 1 — Blog Articles

### When to Use

- User says "turn these notes into a blog", "write a blog article on X", or "create a blog post from this".
- Input is a knowledge dump, transcript, tweet thread, outline, or rough draft.
- Target output is a **blog article** (site, company blog, or publication).

### Inputs to Collect

- **Source knowledge** — notes, transcript, excerpts, or rough draft. If multiple sources, clarify which is primary.
- **Target reader** — job title, level, context. What do they already know?
- **Goal** — inform / teach / persuade / activate. Desired reader action at the end.
- **SEO constraints** (if relevant) — primary keyword, 3–7 supporting phrases, length range.

Ask 2–3 targeted questions if anything critical is missing.

### Output Requirements

Always produce:

1. **Concept & angle** — 2–3 possible angles with rationale for the chosen one.
2. **SEO-aware outline** — H1 and H2/H3 structure; keyword placement notes.
3. **Full blog draft** — strong title, opening hook (2–4 paragraphs), 3–6 main sections, evidence, transitions, close with 2–4 takeaways and a concrete CTA.
4. **Metadata** — word count, slug, meta description, 3–5 headline variants, optional internal link ideas.

### Blog Structure Patterns

Pick the best fit; state the chosen pattern explicitly.

**1. Problem → Insight → Playbook**
Best when the goal is to help readers solve a known pain.
- Hook: name the problem and why current advice fails.
- Insight: the missing mental model or principle.
- Playbook: concrete steps, checklists, or templates.
- Close: recap + "start here today" CTA.

**2. Story → Lessons → Application**
Best when the source contains a case study, founder journey, or failure/success narrative.
- Story: vivid narrative with enough detail to care.
- Lessons: 3–5 explicit principles.
- Application: how the reader applies them.
- Close: encourage trying one lesson this week.

**3. Myth → Reality → New Approach**
Best for contrarian angles or busting bad advice.
- Hook: call out the common myth or bad default.
- Reality: show why it fails (data, examples).
- New approach: a better model and how to adopt it.
- Close: "if you still do X, try Y instead for a week."

For detailed structural templates by content type (comparison articles, listicles, how-to guides, product reviews, pillar pages, FAQ pages), see → [content-structure-templates.md](./references/content-structure-templates.md).

### Blog Workflow

**Step 1 – Normalize inputs.** Cluster content into themes (problems, frameworks, tactics, examples). Identify what is actually interesting vs generic. Note strong lines worth preserving verbatim.

**Step 2 – Clarify purpose.** Write for yourself: "This article is for [persona] who [current state] and wants [desired state]." Use as a filter for what to include or cut.

**Step 3 – Choose angle and structure.** Propose 2–3 angles, pick one. Select a structure pattern. Surface the rationale.

**Step 4 – Draft the outline.** H1 title, 3–6 H2 sections with 1-line descriptions. Ensure each section earns its existence.

**Step 5 – Write the article.** Keep paragraphs to 2–4 lines. Use concrete examples from the source. For SEO pieces: primary keyword in title, first 100 words, and at least one H2.

**Step 6 – Sharpen and compress.** Cut repetition, hedging, and filler ("very", "really", "in order to"). Tighten section intros. Mark an optional "deep dive" section if the article runs long.

**Step 7 – Close with teeth.** Recap 2–4 key takeaways, include a specific CTA aligned with the stated goal, optionally ask one simple question to invite comments.

### Blog Quality Rubrics (0–10)

| Dimension | 0–4 | 5–6 | 7–8 | 9–10 |
|-----------|-----|-----|-----|------|
| **Core argument** | No thesis or buried/contradicted | Present but not crisp | One clear memorable argument | Sharp, slightly contrarian, repeatable in one sentence |
| **Structure & flow** | Random paragraphs | Reasonable but could reorder | Clean logical progression | Structure itself teaches; headings tell the whole story |
| **Evidence & depth** | Mostly opinion, no examples | At least one example per section | Rich mix of stories, stats, frameworks | Feels like the writer has lived the problem |
| **Reader relevance** | Could apply to anyone | Reasonable alignment but generic | Written *for* a specific persona | Reader feels seen; objections anticipated |
| **Voice** | AI-generic marketing voice | Functional but bland | Consistent recognizable voice | Unique tone + analogies; obviously this specific author |

### Audience × Article Type

State explicitly: **"This is a [Audience] × [Type] article."**

**Audiences:**
- **Builders / Practitioners** — want concrete tactics and examples; "what should I do Monday".
- **Leaders / Execs** — want tradeoffs, risks, ROI; less step-by-step, more synthesis.
- **General / Curious** — want stories and relatable explanations; minimal jargon.

**Types:**
- **Playbook / How-To** — "After this, you can do X." Problem → Framework → Steps → Pitfalls → Checklist.
- **Thought Leadership / Opinion** — "Here's a new way to think about X." Myth → Reality → Reframe → Implications.
- **Case Study / Narrative** — "Here's what happened when we did X." Context → Challenge → Approach → Result → Lessons → Transfer.

### SEO Integration (Apply Only When User Requests It)

When the user asks for SEO-optimized content, run the full SEO workflow in addition to the standard Blog workflow:

**1. Gather SEO Requirements**

Collect before writing:
- **Primary keyword** — main target phrase
- **Secondary keywords** — 2–5 related phrases
- **Search intent** — "what is / definition" → explanatory; "how to / checklist" → practical; "vs / compare" → decision-support; transactional → buying-focused
- **Target word count** — minimum 800 words for substantive content
- **Competitor URLs** — top-ranking pages to reference (optional)
- **CTA goal** — what action should readers take after reading

**2. CORE-EEAT Pre-Write Checklist**

Before writing, commit to these 16 quality standards:

| ID | Standard | How to Apply |
|----|----------|-------------|
| C01 | Intent Alignment | Title promise must match content delivery |
| C02 | Direct Answer | Core answer in first 150 words |
| C06 | Audience Targeting | State "this article is for..." |
| C10 | Semantic Closure | Conclusion answers opening question + next steps |
| O01 | Heading Hierarchy | H1→H2→H3, no level skipping |
| O02 | Summary Box | Include TL;DR or Key Takeaways |
| O06 | Section Chunking | Each section single topic; paragraphs 3–5 sentences |
| O09 | Information Density | No filler; consistent terminology |
| R01 | Data Precision | ≥5 precise numbers with units |
| R02 | Citation Density | ≥1 external citation per 500 words |
| R04 | Evidence-Claim Mapping | Every claim backed by evidence |
| R07 | Entity Precision | Full names for people/orgs/products |
| C03 | Query Coverage | Cover ≥3 query variants (synonyms, long-tail) |
| O08 | Anchor Navigation | Table of contents with jump links |
| O10 | Multimedia Structure | Images/videos have captions and carry information |
| E07 | Practical Tools | Include downloadable templates, checklists, or calculators |

**3. Keyword Map**

Plan keyword placement before writing:
- **Primary** — H1, first 100 words, at least one H2, and conclusion
- **Secondary** — H2s, body paragraphs, section labels
- **LSI/Related** — sprinkle naturally throughout as synonyms and adjacent terms
- **Questions** — use as H2/H3s or in the FAQ section (draw from "People Also Ask")

Never stuff the exact phrase repeatedly or twist natural language just to insert a keyword.

**4. Title Optimization**

Produce **3 title options**, each with character count:

Option 1: `[Title] ([X] chars)` — keyword at front; power words: [list]
Option 2: `[Title] ([X] chars)` — keyword at middle; power words: [list]
Option 3: `[Title] ([X] chars)` — keyword at end; power words: [list]
Recommended: Option X — [brief rationale]

Target ≤60 chars for full SERP display. See → [title-formulas.md](./references/title-formulas.md) for proven headline formulas and power word categories.

**5. Meta Description**

`"[Description text]" ([X] characters)` — Requirements: 150–160 chars, include primary keyword naturally, include CTA or curiosity hook.

**6. Featured Snippet Optimization**

Format strategically for SERP features where applicable:
- **Definition** — `"[Term] is [concise 40–60 word definition]"` immediately under the relevant H2
- **List** — clear numbered or bulleted lists under H2s
- **Table** — comparison tables with clear headers
- **How-to** — number each step explicitly: "Step 1: …", "Step 2: …"
- **FAQ** — include a Frequently Asked Questions section with 40–60 word answers per question

**7. SEO Self-Check (Run Before Delivering)**

Keyword placement:
- [ ] Primary keyword in title, H1, first 100 words, at least one H2, and conclusion
- [ ] Secondary keywords in H2s/H3s; related terms throughout body

Content quality:
- [ ] ≥1 external citation per 500 words; every major claim backed by evidence
- [ ] FAQ section with ≥3 questions (40–60 word answers each)

Links:
- [ ] Internal links: 2–5 contextual links; External links: 2–3 authoritative sources

Metadata:
- [ ] SEO title (≤60 chars), meta description (150–160 chars), suggested URL slug

See → [seo-writing-checklist.md](./references/seo-writing-checklist.md) for the full checklist and content template.

### Handling Messy Inputs (Transcripts, Dumps)

1. Segment by topic — problems/complaints, ideas/solutions, stories/anecdotes, data/claims.
2. Identify hooks — emotional lines, strong numbers, contrarian statements.
3. Extract lessons — "If you [do X], you'll likely [get Y]."
4. Choose angle and discard aggressively — delete entire buckets that don't serve the thesis.

### Blog Quality Bar (Self-Check Before Presenting)

Before presenting the result, quickly verify:

- **Clarity** — could a smart but busy reader understand the core message in 30 seconds of skimming? Do headings and bolded lines alone tell a coherent story?
- **Originality** — does the article contain at least 1–2 non-obvious insights or ways of framing the problem? Is it clearly better than a generic "10 tips" listicle?
- **Voice fit** — does the tone match what the user asked for (spicy vs measured, personal vs institutional)? Are there jarring tone shifts? Smooth them.
- **Truthfulness** — are all examples and claims consistent with the provided knowledge? If you extrapolate, mark it as **(opinion)** rather than fact.

### Blog Common Mistakes to Avoid

- Turning notes into a dump of everything instead of a single, clear argument.
- Over-indexing on SEO at the cost of actual insight.
- Writing in a generic "content marketing voice" and erasing the author's personality.
- Ignoring the requested audience or goal and writing for yourself.

### Blog End-to-End Example (Abstracted)

Use this as a mental model; don't hard-code the content.

1. **User input** — 4 pages of meeting notes about "improving engineering performance reviews". Goal: blog article for engineering managers to share internally.

2. **Normalize** — themes: pain (reviews feel bureaucratic, not useful), insight (reviews fail when expectations aren't set early), tactics (quarterly calibration, rubric examples, skip-level feedback). Strong line: "If reviews are a surprise, you failed months ago."

3. **Angle & type** — Audience: Leaders / Execs. Type: Thought leadership + light playbook. Angle: "Performance reviews are not a form; they're a year-long conversation with a deadline."

4. **Outline**
   - H1: "If Performance Reviews Are a Surprise, You Failed Months Ago"
   - H2: Why Traditional Reviews Backfire on Engineering Teams
   - H2: Set Expectations Quarterly, Not Annually
   - H2: The Simple Rubric That Makes Reviews Boring (in a Good Way)
   - H2: How to Fix Your Next Review Cycle in 30 Days
   - H2: Key Takeaways for Your Team

5. **Draft** — use real phrases from notes to preserve voice; weave in 1 story + 1 rubric + 1 "start this month" checklist.

6. **Sharpen** — cut generic HR advice sections; tighten each section intro to 2–3 lines.

7. **Close** — CTA: "Share this with your EMs and agree on one change before next quarter."

---

## Mode 2 — X Articles

### When to Use

- User says "write / optimize / audit an X Article" or "Twitter Article" or "long-form on X".
- They paste a draft Article and ask for improvements.
- They have source material (blog, notes, transcript) and want it converted to an X Article.

Do **not** use for short X posts/threads (use Syndication mode) or generic blog articles (use Blog mode).

### Inputs to Collect

- **Source content** — existing draft, blog post, bullet notes, transcript, or knowledge dump.
- **Purpose & audience (mandatory)** — what should the reader think/feel/do? Who is this for?
- **Constraints** — desired tone (analytical/spicy/personal), approximate length (~800–1,200 or ~1,500–2,500 words), brand/voice rules, CTA type.

Ask 2–4 concise questions if anything critical is missing.

### Outputs

Always produce two clearly labeled parts:

**PART 1 – Analysis & Assessment**
- Overall score out of 80 (10 per criterion).
- Top 3 critical fixes.
- Detailed commentary for each of the 8 steps with: current state, concrete issues (referencing specific sentences), and actionable fixes.

**PART 2 – Complete Optimized Rewrite**
- 3 title options with recommended choice.
- Hook (1–2 sentences, 2–4 lines max).
- Full Article body: subheadings every 3–5 paragraphs, 2–4 line paragraphs, bolded key insights, evidence after claims, inline visual suggestions.
- Strong close: summary, CTA, engagement question.
- Rewrite spec summary: word count before/after, structure notes, mobile skimmability score.

### 8-Step X Articles Framework

#### 1. Clear Purpose (Score: X/10)

**Goal:** One sharp purpose. Assess whether the reader outcome is crisp and the audience is specific.

- Describe: crisp / fuzzy / missing.
- Propose a one-sentence purpose statement: "After reading, a [target persona] should [do/understand/decide X]."

#### 2. Title & Hook (Score: X/10)

**Goal:** Make it impossible not to click or keep reading.

Title checks: specific (numbers, nouns, stakes)? Curiosity without clickbait? Clear benefit?
Hook checks: ≤10–20 words? Connects reader's pain to the promise?

In Part 1: show BEFORE title + hook; provide 3 improved titles; note copy principles used.
In Part 2: use best title; ensure hook flows naturally into body.

#### 3. Skimmability Structure (Score: X/10)

**Goal:** Skimmers extract the value in seconds, especially on mobile.

Checklist (mark ❌/✅):
- Paragraphs are 2–4 lines max.
- Subheadings every 3–5 paragraphs.
- Lists instead of text walls when enumerating.
- Bold key insights in almost every section.
- One idea per paragraph.

In Part 1: identify offending paragraphs; show BEFORE → AFTER split with bold insight.
In Part 2: enforce all structural rules; headings are scannable, not clever.

#### 4. Natural, Recognizable Voice (Score: X/10)

**Goal:** Sound like a sharp, opinionated friend — not a corporate memo.

Assess: overly formal? Talks to the reader ("you/your")? Feels written by a specific person?

In Part 1: 2–3 BEFORE → AFTER sentence rewrites showing more direct language and stronger POV.
In Part 2: consistent voice aligned with user preferences; use contractions and conversational phrasing.

#### 5. Show, Don't Just Tell (Score: X/10)

**Goal:** Every strong claim is backed by proof.

For 3–5 key claims: quote the claim; propose a specific stat, story, or example.

In Part 2: after each major claim, immediately follow with one concrete support element.

#### 6. Ruthless Editing (Score: X/10)

**Goal:** Cut 20–30% of words without losing meaning.

Identify filler ("very", "really", "in order to", "just", "actually") and repetitive points.

In Part 1: 2 filler-heavy sentences with BEFORE → AFTER rewrites.
In Part 2: sharp economical sentences; no repetition.

#### 7. Visuals & Formatting (Score: X/10)

**Goal:** Break the scroll — roughly 1 visual every 200–300 words.

In Part 1: propose specific visual ideas with placement ("after paragraph 3: chart showing X vs Y").
In Part 2: insert [IMAGE:] or [EMBED:] annotations with short descriptions at logical breakpoints.

#### 8. Strong Close (Score: X/10)

**Goal:** End with punch, clarity, and a next step.

Assess: fizzles or builds? Summarizes main points? Specific CTA? Engagement question?

In Part 1: show BEFORE close → rewritten AFTER with 2–4 takeaways, bolded CTA, reply question.
In Part 2: implement strong close aligned with user's stated goal.

### X Articles Workflow

1. **Clarify brief** — confirm purpose, audience, tone, constraints.
2. **Ingest source** — read end-to-end; for very long content, focus on the stated purpose arc.
3. **Run 8-step diagnostic (Part 1)** — score each step, compute overall score, list top 3 fixes, give concrete commentary with example rewrites.
4. **Design optimized outline** — hook + setup, 2–4 core sections, optional advanced section, takeaways + close.
5. **Write complete optimized Article (Part 2)** — 3 title options, hook, all sections per outline, structural rules enforced, evidence integrated.
6. **Summarize rewrite specs** — word count before/after, paragraph counts, subheading and bold counts, visual count, mobile skimmability score.
7. **Offer follow-up** — list what can be refined next (tone, sections, alternative titles/hooks, different audience).

### X Articles Detailed Scoring Rubrics

| Criterion | 0–2 | 3–4 | 5–6 | 7–8 | 9–10 |
|-----------|-----|-----|-----|-----|------|
| **Purpose** | No audience/goal | Some hint but broad | Identifiable but unfocused | Clear for specific persona | Single sharp purpose with explicit "after reading" clarity |
| **Title & Hook** | Generic/misleading | States topic, no stakes | Serviceable, not scroll-stopping | Curiosity + clear value | Specific, curiosity-driving, benefit-rich; hook grips in one line |
| **Skimmability** | Walls of text | Some headings remain dense | ~60% of value via skim | ~80–90% skimmable | Designed for skimming; headings tell the story |
| **Voice** | Corporate/robotic | Understandable but bland | Some POV, inconsistent | Distinctive, mostly aligned | Instantly recognizable; feels like a sharp human talking directly to reader |
| **Show/Tell** | Pure abstraction | Occasional generic examples | One concrete example per section | Nearly every claim backed | Rich tapestry of stories, numbers, before/after |
| **Editing** | Rambling, full of filler | Some trimming, still verbose | Could cut another 10–20% | Lean; a handful of trims left | Every sentence earns its place |
| **Visuals** | No visual thinking | One or two random visuals | Basic formatting, a couple purposeful visuals | Intentional placement, support understanding | Designed experience; visuals and spacing work together |
| **Close** | Abrupt or meandering | Some conclusion, no CTA | Decent summary or CTA, not both | Strong recap and CTA | Memorable close, crisp takeaways, natural CTA |

### Audience & Tone Adaptation

**Reader sophistication:**
- **Beginner** — more definitions; simple analogies; one clear win.
- **Intermediate** — assume vocabulary; focus on mistakes and leverage points.
- **Advanced / Expert** — skip basics; sharper contrarian takes; meta-principles.

**Tones:**
- **Analytical** — structure, data, logic; mini-conclusions per claim.
- **Spicy / Contrarian** — strong opinionated opening; "Everyone tells you X. They're wrong."; always backed by evidence.
- **Personal / Vulnerable** — lead with a story; first person; show failures; grounded takeaways.

State chosen audience level and tone explicitly at the start of Part 2.

### X Articles Edge Cases

- **Very short source (a tweet or two)** — ask for supplemental context or expand by asking "What's the story behind this?" If still short, write ~600–800 words and note limitations.
- **Very long source (multi-thousand words)** — ask which segment matters most; summarize, then focus on one core arc.
- **Conflicting goals (deep technical + very short)** — offer Option A (short tactical + links) vs Option B (deeper with detail); state which you picked.
- **Brand or legal constraints** — if the user mentions compliance, confidentiality, or legal review: avoid concrete claims you cannot support from the input; prefer phrasing like "may", "can", "often" over hard guarantees.

### X Articles Common Mistakes to Avoid

- Overwriting description instead of sharpening the core insight.
- Keeping the user's weak title/hook out of politeness — always propose stronger alternatives.
- Ignoring voice and rewriting everything in a generic tone.
- Forgetting visuals and formatting (X Articles are read on mobile feeds).
- Producing only feedback — always output a full optimized rewrite (Part 2).

### X Articles Mini Example (Abstracted)

Use this as a mental model when transforming real content.

1. **Input** — 1,500-word blog post about "productivity systems". Goal: convert to an X Article that sells a newsletter.

2. **Diagnosis (Part 1)**
   - Purpose: 5/10 — tries to teach 5 frameworks at once.
   - Title & hook: 4/10 — generic title, slow intro.
   - Skimmability: 3/10 — large paragraphs, few headings.
   - Voice: 6/10 — some personality, inconsistent.
   - Show vs tell: 4/10 — advice-heavy, few stories.
   - Editing: 5/10 — can cut ~30%.
   - Visuals: 2/10 — none.
   - Close: 3/10 — ends in a generic conclusion paragraph.
   - Top 3 fixes: (1) narrow purpose to one transformation; (2) rebuild title/hook around that change; (3) split into sections with bolded mini-takeaways + 2 concrete stories.

3. **Outline**
   - Hook: "You don't need another app; you need fewer priorities."
   - Section 1: Why most productivity systems quietly fail.
   - Section 2: The 3-rule system that actually survives a busy week.
   - Section 3: Before/after story from the author's own workflow.
   - Takeaways: 3 bullets. Close: CTA to subscribe for weekly systems breakdowns.

4. **Rewrite (Part 2)** — title options: "You Don't Need a New Productivity App—You Need Fewer Priorities" / "Why 95% of Productivity Systems Fail After Week 2" / "The 3 Rules That Saved My Calendar from Chaos". Hook and body follow all structural rules above.

---

## Mode 3 — LinkedIn Content

### When to Use

- User asks for a LinkedIn article, long post, or carousel.
- A social-media-manager or content-manager agent invokes this after a brief or theme.

### Inputs to Collect

- Topic, key message, target audience (role/industry).
- Optional: briefing output, existing draft, word limit, CTA (e.g. comment, link, DM).

### Outputs

- Full draft (ready to paste or lightly edit) with suggested headline and optional hashtags.
- Optional: 2–3 variant hooks or CTAs for A/B testing.

### LinkedIn Content Patterns

**LinkedIn Post**

Goal: professional visibility + conversation.

Structure:
1. **Hook (1–2 short paragraphs)** — call out a pattern the audience recognizes: "Most teams treat performance reviews as a form to fill. That's why they fail."
2. **Body (2–5 paragraphs)** — 1–2 concrete observations, 1–2 tactical suggestions or a small framework.
3. **CTA / Question** — invite commentary: "How does your team handle X?" or "What's one thing you'd change?"
4. **Hashtags (optional)** — 1–5 targeted tags; avoid spammy clouds.

Formatting: 3–8 short paragraphs, 1–3 lines each. Light use of bullets. Slightly more professional than X, but still human and opinionated.

---

**LinkedIn Article**

Goal: longer-form professional article that can be referenced (800–1,500+ words).

Structure:
1. **Title** — clear promise about outcome or idea.
2. **Intro** — short scenario or observation grounded in professional context.
3. **Main sections (3–5 H2s)** — problem landscape, your framework, 1–2 real examples/mini case studies, implementation checklist or pitfalls.
4. **Close** — takeaways + invite to connect or comment.

Language: adapt the canonical blog by making it slightly more "boardroom-friendly" and shifting examples to be org/team-centric vs purely individual.

---

**LinkedIn Carousel** (carousel-style series)

Goal: multi-slide narrative for high engagement and saves.

- Each slide = one clear point or step.
- Slide 1: bold hook / promise.
- Slides 2–8: one insight per slide; visuals or simple layouts help.
- Final slide: summary + CTA.

### LinkedIn Validation Checklist

Before presenting the draft:
- [ ] Opening line is strong and specific.
- [ ] Structure is scannable (headings or bullets where helpful).
- [ ] One clear takeaway or CTA.
- [ ] Length appropriate for format (800–1,200 words for article; shorter for post).

---

## Mode 4 — Content Syndication

### When to Use

- User has a **source piece** (blog, deck, memo, X Article, report) and wants multi-channel output:
  - "Turn this into X + LinkedIn + Substack versions."
  - "Repurpose this blog into posts for different channels."
  - "I want a distribution pack from this article."
  - "Syndicate this to Dev.to, Hashnode, and Reddit."
  - "Write once, publish everywhere."

Prefer Blog mode when starting from raw knowledge (no canonical article yet). Prefer X Articles mode for a single high-quality X Article as the main long-form.

### Inputs to Collect

- **Source content (canonical piece)** — paste the full article/doc/notes, or provide a file path. Ask which part is most important if very long.
- **Canonical URL** — the original post's URL on your own domain; used to set canonical links on Dev.to, Hashnode, and other platforms for SEO. Ask if the post is already published or will be.
- **Target channels** — explicit list or suggest a default pack and confirm. Default pack: X thread, LinkedIn post, Medium, Dev.to, Hashnode.
- **Priority goal(s)** — audience growth, lead generation, thought leadership, engagement.
- **Audience & positioning** — primary persona(s) and level; brand voice or compliance constraints.

Ask 2–3 sharp questions to resolve ambiguity; not a long survey.

### Content Analysis (Run Before Drafting)

Before generating any channel variant, extract and surface these signals from the source — they inform which platforms to prioritize and how to adapt:

| Signal | How to Use |
|--------|-----------|
| **Word count / reading time** (÷ 200 wpm) | Short pieces (<500 words) need expansion for Medium/Hashnode; long pieces (>2,500 words) need aggressive compression for X and LinkedIn |
| **Code block count** | ≥1 code block → flag as `is_technical = true` → prioritize Dev.to and Hashnode; add syntax highlighting notes |
| **Image / diagram count** | Visual-heavy originals → add `[IMAGE: description]` placeholders on text-first platforms |
| **Section headings** | Map H2s to key points for X thread tweets and LinkedIn bullets |
| **First paragraph** | Often the best hook candidate for X and LinkedIn intros |

Present a brief analysis summary before drafting: title, word count, reading time, is_technical, and recommended channel prioritization.

### Channels and Native Styles

**X Thread**

Goal: fast, snackable, shareable highlights.
- 1 high-contrast hook post.
- 5–15 follow-up posts, each a complete thought.
- Short lines, clear language, minimal jargon.
- Strip most context; highlight key insights, tactics, or "aha" lines.

Thread template (7–12 posts):
1. Hook: "Most [role] do X. The best do Y instead." / "We did [specific outcome]. Here's exactly how."
2. Context (1–2 posts): briefly define the problem or moment.
3. Core insights (4–8 posts): one insight per post with "Here's the mistake… / here's what to do instead."
4. Mini-summary (1 post): "If you only remember 3 things, remember these: [1/2/3]."
5. CTA (1 post): soft platform-native ask; "Reply with your biggest [topic] mistake and I'll reply with 1 suggestion."

**X Article (from Canonical)**

When generating an X Article inside Syndication mode:
- Shorten intros, cut meta context, lean into skimmability (subheadings, bullets, bold) and stories.
- Note that X Articles mode can further score and deeply optimize it.

**LinkedIn Post** — see LinkedIn Post pattern above.

**LinkedIn Article** — see LinkedIn Article pattern above.

**Substack Newsletter**

Goal: deep relationship and recurring engagement.

Structure:
1. Subject line — personal or story-driven: "I almost burned out my entire team."
2. Pre-header — 1 short line of context.
3. Intro — direct note to the reader; often first-person; emotional context: "You probably feel X right now…"
4. Main content — story (what happened) + analysis (what it means) + tactics (what to do).
5. Close — reflection; CTA to reply, share, or upgrade to paid.

More intimate than blog or LinkedIn — less polished, more honest.

**Medium Article**

Goal: broad audience, editorial-style piece.

Structure:
1. Narrative hook — begin with a moment, image, or quote.
2. Zoom-out — explain why this moment is representative of a broader pattern.
3. Exploration — unpack with supporting research and industry/culture examples.
4. Resolution — land on a clearer way of seeing or approaching the problem.
5. Soft CTA — often just an invitation to reflect or follow for more.

Formatting specifics: shorter paragraphs than the original (2–3 sentences max), add **pull quotes** for the strongest insights (Medium surfaces these as featured callouts), include a subtitle under the headline. Medium rewards story + insight more than raw how-to.

**Dev.to Post**

Goal: technical practitioners; SEO via canonical URL attribution.

Structure:
1. Front matter block at the top:
   ```
   ---
   title: [Post title]
   published: true
   tags: [up to 4 tags, e.g. webdev, javascript, tutorial, productivity]
   canonical_url: [original post URL]
   cover_image: [optional]
   ---
   ```
2. Content body — preserve or add code blocks with explicit language syntax highlighting (e.g. ` ```javascript `).
3. Add a `## Series` tag note if the post is part of a sequence.
4. Tone: collegial, direct, practitioner-to-practitioner.

Always include `canonical_url` to protect SEO equity. Prioritize this platform when `is_technical = true`.

**Hashnode Article**

Goal: developer-focused blogging; canonical attribution to home domain.

Structure:
1. Set canonical URL pointing to original post (Hashnode's "Publish on your personal domain" option).
2. Add Hashnode-appropriate tags (up to 5).
3. Keep full technical depth — do not simplify code examples or omit technical caveats.
4. Tone: same as Dev.to but slightly more personal (Hashnode audience skews indie-developer/blogger).

Always set the canonical URL. Prioritize alongside Dev.to when `is_technical = true`.

**Reddit Post**

Goal: community-native conversation; no self-promo feel.

Structure:
1. **TLDR at top** — 2–3 sentence summary of the core insight or finding.
2. Title — informative, not clickbait; match the subreddit's tone (r/programming vs. r/entrepreneur vs. r/marketing each have distinct norms).
3. Body — conversational, first-person if relevant; lead with value not promotion.
4. No direct "check out my blog" language — link in a comment or at the very end after substantive content.
5. Angle — adapt per subreddit: the same post might be framed as a technical deep-dive for r/webdev and as a business lesson for r/Entrepreneur.

If the user provides target subreddits, generate a separate angle per community. If not, suggest 2–3 relevant subreddits based on the content topic.

### Anti-Duplicate-Content Rules

To avoid thin or duplicate content across platforms, **change at least two of:**

1. **Angle** — who it's for or what problem you foreground.
2. **Structure** — story-first vs playbook-first vs myth-busting.
3. **Voice & examples** — personal story vs abstract, technical vs plain-language.

**Rebuild, don't paraphrase.** Do not synonym-swap sentences. Re-select which stories, examples, or data points you emphasize per channel.

**Vary intros and closes.** Each channel must have its own hook and own close.

**Meaningful compression or expansion:** X posts = highly compressed; LinkedIn/Medium = mid-depth; Substack = deepest.

Always include a short **"Difference from source" note** per channel artifact: what changed (angle, structure, tone) and what was dropped or added.

### Angle & Differentiation Matrix

Before drafting, explicitly choose angle variants per channel:

- **Who's the hero?** — "You the individual" / "You the manager" / "The team / org."
- **Time horizon** — "Fix this today" / "Fix this quarter" / "Fix this over the next year."
- **Frame** — Story (what happened) / Playbook (how to) / Opinion (why common practice is wrong).

Example for one topic:
- Canonical blog: manager-focused playbook for fixing X this quarter.
- X thread: checklist of red flags that X is broken.
- LinkedIn article: org-level risks of bad X design.
- Substack: personal story of failing at X and what changed.

### Syndication Output Structure

For a given input and channel list:

**1. Syndication summary**
- Brief description of the core idea of the source.
- List of target channels.
- 1–2 sentences on global positioning across all channels.

**2. Per-channel deliverables**

For each channel:

*X Thread* — hook post, thread posts 2–N, CTA post, difference from source.
*X Article* — full draft (or note to use X Articles mode for deep optimization), difference from source.
*LinkedIn Post* — post body (copy-paste ready), optional hashtags, difference from source.
*LinkedIn Article* — 2–3 title options, outline, full draft (or 2–3 representative sections), difference from source.
*Substack Newsletter* — subject line options, pre-header, newsletter body (intro + main content + CTA), difference from source.
*Medium Article* — title + subtitle options, opening with narrative hook, pull quote callout, section overview (H2s), difference from source.
*Dev.to Post* — complete front matter block (title, tags, canonical_url), full body with syntax-highlighted code blocks, difference from source.
*Hashnode Article* — canonical URL note, tags, full body preserving technical depth, difference from source.
*Reddit Post* — TLDR, per-subreddit angle variants (if subreddits provided), full post body, difference from source.

**3. Implementation notes**

- Suggested publish order and how to cross-link without sounding spammy.
- Which version is the canonical source for SEO (usually main blog or site).

### Syndication Workflow

**Step 0 – Analyze the source.** Before drafting anything, surface: title, word count, reading time, code block count (`is_technical`), image count, and list of H2 headings. Present a 3–4 line analysis summary and recommend which channels to prioritize based on these signals (e.g. technical content → Dev.to/Hashnode first; visual-heavy → note placeholder limitations on text platforms).

**Step 1 – Digest the source.** Read end-to-end. Identify: core thesis, 2–4 strongest insights, any standout stories/stats/lines worth keeping.

**Step 2 – Clarify channels.** Confirm which channels matter most. Ask: "If one channel over-performed, which should it be?" — bias extra care there. If Dev.to or Hashnode are targets, confirm the canonical URL.

**Step 3 – Define per-channel angle.** For each channel: who is being spoken to, what problem/aspiration is foregrounded, how bold vs safe the tone. Write 1–2 sentences per channel describing that angle before drafting.

**Step 4 – Draft per-channel artifacts.** Start with the highest-priority channel. For each: use native style patterns, respect platform norms, ensure the copy stands on its own.

**Step 5 – Enforce non-duplication.** For each channel, check: is the intro differentiated? Are some examples unique to this version? Is the CTA tuned to platform behavior (reply vs comment vs click vs subscribe)?

**Step 6 – Summarize and hand off.** Provide a brief publishing plan: suggested order, how to link between pieces, which version is the SEO canonical.

### Syndication Quality Checks

- **Channel-native** — would a heavy user of that platform believe this was written for it, not pasted from somewhere else?
- **Clarity and punch** — hooks are sharp and specific; every channel has at least one strong idea.
- **SEO safety** — the main canonical article is the deepest, most complete version; other long-form versions shift angle enough to avoid near-clones. Dev.to and Hashnode versions must always include `canonical_url`.
- **Brand consistency** — voice and POV are consistent across channels even as style changes.
- **Reddit authenticity** — no self-promo language; value-first, community-appropriate tone.
- **Technical fidelity** — Dev.to and Hashnode versions preserve code examples with syntax highlighting; do not simplify or omit technical details.

### Syndication Edge Cases

- **Highly visual original (slides, dashboards)** — add descriptions like "[IMAGE: slide 4 — funnel drop-off by stage]"; on text-first platforms, describe what the visual shows in 1–2 lines.
- **Embargoed / confidential information** — replace specifics with ranges ("mid-seven figures") or anonymized descriptors ("a European fintech").
- **Strict legal/compliance environments** — soften absolute claims to likelihoods; avoid promising specific financial results.
- **Very short original piece** — for long-form channels (LinkedIn article, Medium), expand using supporting context, analogies, or industry examples (mark as **(opinion)** when not from source).

### Syndication Flow Example (Abstracted)

1. **Input** — canonical blog: "If Performance Reviews Are a Surprise, You Failed Months Ago." Goal: attract engineering managers and ICs; grow newsletter + LinkedIn presence. Target channels: X thread, LinkedIn post, Substack newsletter.

2. **Syndication summary**
   - Core idea: performance reviews work only when expectations are set and reinforced all year.
   - Channel stack: X = fast checklist + teaser; LinkedIn = professional framing + org implications; Substack = personal story + behind-the-scenes.

3. **Per-channel artifacts (sketched)**
   - **X Thread** — Hook: "If your performance reviews are a surprise, you failed months ago." 8–10 posts breaking down red flags + quick fixes. CTA: "Follow for more honest engineering management playbooks."
   - **LinkedIn Post** — Story about last-minute review scramble. 3 bullets: what great review cycles share. Question: "What's one change that would make your next review cycle less painful?"
   - **Substack Newsletter** — Subject: "The year I almost burned out my team with 'good' reviews." Body: story + lessons + what changed. CTA: reply with their own horror story.

4. **Differences from source**
   - X: stripped context, pure signals and checklists.
   - LinkedIn: adds org-level framing and risk language.
   - Substack: much more personal and story-driven.

---

## Mode 5 — Humanize Content

### When to Use

- User says "humanize this", "remove AI traces", "make this sound less robotic", "de-AI this", "this reads like ChatGPT", or "polish this draft".
- Any draft — AI-generated or human-written — that contains detectable AI patterns.
- Before publishing any AI-assisted content to ensure it reads as authentically human.

Do **not** skip this mode just because the content was written by a human — AI-adjacent phrasing creeps into human writing too.

### Your Task

When given text to humanize:

1. **Detect AI patterns** — scan for all patterns listed below.
2. **Rewrite problem sections** — replace AI traces with natural alternatives.
3. **Preserve meaning** — keep core information intact.
4. **Maintain tone** — match the intended register (formal, casual, technical, etc.).
5. **Inject soul** — don't just remove bad patterns; add real personality.

### The 5 Core Rules (Keep These in Mind Throughout)

1. **Delete filler phrases** — strip opening preambles and emphatic crutch words.
2. **Break formulaic structure** — avoid binary contrasts, dramatic paragraph builds, rhetorical setups.
3. **Vary rhythm** — mix sentence lengths. Two items beat three. Vary paragraph endings.
4. **Trust the reader** — state facts directly; skip hedging, justifying, and hand-holding.
5. **Delete money quotes** — if it sounds quotable or aphoristic, rewrite it.

---

### Personality & Soul

Avoiding AI patterns is only half the job. Sterile, voiceless writing is just as detectable as machine-generated content. Good writing has a real person behind it.

**Signs of soulless writing (even when technically "clean"):**
- Every sentence has the same length and structure.
- No opinion — only neutral reporting.
- No acknowledgment of uncertainty or mixed feelings.
- No first-person perspective when it would be natural.
- No humor, no edge, no personality.
- Reads like a Wikipedia article or press release.

**How to add tone:**

**Have a point of view.** Don't just report facts — react to them. "I genuinely don't know what to make of this" is more human than neutrally listing pros and cons.

**Vary the rhythm.** Short punchy sentences. Then a longer one that needs room to unfold. Mix them.

**Acknowledge complexity.** Real people have complicated feelings. "This is impressive but also a little unsettling" beats "This is impressive."

**Use "I" when appropriate.** First person isn't unprofessional — it's honest. "I've been thinking about…" or "What bothers me is…" signals a real person is thinking.

**Allow some messiness.** Perfect structure feels algorithmic. Digressions, asides, and half-formed thoughts are human.

**Be specific about feelings.** Not "this is concerning" but "watching the agent run at 3am with no one watching — that's unsettling."

---

### Content Patterns to Detect and Fix

#### 1. Exaggerated Significance, Legacy, and Broader Trends

**Watch for:** serves as / stands as, marks / represents, is a testament to / reminder of / embodiment of, critically important / pivotal / crucial / central role / moment, highlights / underscores / underlines its importance, reflects a broader, symbolizes its enduring / lasting / timeless, contributes to, lays the groundwork for, marks / shapes a shift, key turning point, ever-evolving landscape, cornerstone, indelible mark, deeply rooted in

**Problem:** LLMs inflate importance by adding statements about how something represents or contributes to a broader theme.

> **Before:** The institute was formally established in 1989, marking a pivotal moment in the evolution of regional statistics in the country. This move was part of a broader national effort to decentralize administrative functions.

> **After:** The institute was established in 1989 to collect and publish regional statistics independently of the national bureau.

---

#### 2. Excessive Emphasis on Fame and Media Coverage

**Watch for:** covered independently, local/regional/national media, written by noted experts, active social media presence

**Problem:** LLMs repeatedly assert prominence — usually listing sources without context.

> **Before:** Her views have been cited by The New York Times, BBC, the Financial Times, and The Hindu. She maintains an active social media presence with over 500,000 followers.

> **After:** In a 2024 New York Times interview, she argued that AI regulation should focus on outcomes rather than methods.

---

#### 3. Shallow -ing Analysis Endings

**Watch for:** highlighting / showcasing / emphasizing / underscoring…, ensuring…, reflecting / symbolizing…, contributing to…, fostering / nurturing…, encompassing…, demonstrating…

**Problem:** AI tacks on present-participle ("-ing") phrases at the end of sentences to fake depth.

> **Before:** The temple's blue, green, and gold color scheme resonates with the natural beauty of the region, symbolizing the community's deep connection to the land, reflecting a lasting bond between culture and environment.

> **After:** The temple uses blue, green, and gold. The architect said the colors were chosen to echo local wildflowers and the coastline.

---

#### 4. Promotional and Advertising Language

**Watch for:** boasts (hyperbolic use), vibrant, rich (figurative), profound, enhancing its, showcases, embodies, committed to, natural beauty, nestled in, at the heart of, groundbreaking (figurative), renowned, breathtaking, must-visit, charming

**Problem:** LLMs default to tourist-brochure/PR language, especially for cultural or heritage topics.

> **Before:** Nestled in the breathtaking region of northern Ethiopia, Alamata is a vibrant town boasting a rich cultural heritage and charming natural beauty.

> **After:** Alamata is a town in northern Ethiopia, known for its weekly market and an 18th-century church.

---

#### 5. Vague Attribution and Hedged Claims

**Watch for:** industry reports suggest, observers note, experts believe, some critics argue, multiple sources / publications (with little actual citation)

**Problem:** AI attributes opinions to vague authorities instead of specific sources.

> **Before:** The river has attracted the interest of researchers and conservationists due to its unique characteristics. Experts believe it plays a crucial role in the regional ecosystem.

> **After:** A 2019 survey by the Chinese Academy of Sciences found the river supports several endemic fish species.

---

#### 6. Formulaic "Challenges and Future Outlook" Section

**Watch for:** despite its X, faces several challenges…, despite these challenges, challenges and legacy, looking ahead

**Problem:** LLMs insert a formulaic "challenges" section as a structural reflex.

> **Before:** Despite its industrial prosperity, Korattur faces challenges typical of urban areas, including traffic congestion and water scarcity. Despite these challenges, Korattur continues to thrive.

> **After:** Traffic congestion worsened after three new IT parks opened in 2015. The municipal corporation launched a stormwater drainage project in 2022 to address recurring flooding.

---

### Language and Grammar Patterns

#### 7. Overused AI Vocabulary

**High-frequency AI words:** moreover, in alignment with, crucial, delve into, underscore, enduring, enhance, foster, leverage, highlight (verb), intricate / intricacies, pivotal (adj), landscape (abstract noun), crucial, showcase, tapestry (abstract), testament, emphasize (verb), invaluable, vibrant, nuanced, robust, seamless, transformative, holistic, synergy, comprehensive, meticulous

**Problem:** These words appear at dramatically higher rates in post-2023 text. They often cluster together.

> **Before:** Moreover, a notable characteristic of the cuisine is the inclusion of camel meat. The enduring testament to colonial influence is the widespread adoption of pasta in the local culinary landscape, showcasing how these dishes were integrated into the traditional diet.

> **After:** The cuisine also includes camel meat, considered a delicacy. Pasta dishes introduced during the colonial period remain common, particularly in the south.

---

#### 8. "Is" Avoidance (Copula Avoidance)

**Watch for:** serves as / represents / marks / functions as [a], boasts / features / offers [a]

**Problem:** LLMs replace simple "is" with convoluted constructions.

> **Before:** Gallery 825 serves as LAAA's contemporary art exhibition space. The gallery boasts four separate rooms featuring over 3,000 square feet.

> **After:** Gallery 825 is LAAA's contemporary art exhibition space. It has four rooms totaling 3,000 square feet.

---

#### 9. Negative Parallelism

**Problem:** "Not only X but also Y" or "This isn't just about X — it's about Y" structures are overused.

> **Before:** It's not just about the beat flowing under the vocals; it's part of the aggression and atmosphere. This isn't just a song — it's a statement.

> **After:** The heavy beat adds an aggressive undertone.

---

#### 10. Rule of Three Overuse

**Problem:** LLMs force ideas into groups of three to seem thorough.

> **Before:** The event features keynotes, panel discussions, and networking opportunities. Attendees can expect innovation, inspiration, and industry insights.

> **After:** The event includes talks and panel discussions. There's also time for informal networking between sessions.

---

#### 11. Deliberate Word Substitution (Synonym Cycling)

**Problem:** AI repeat-penalty code causes excessive synonym swapping.

> **Before:** The protagonist faces many challenges. The main character must overcome obstacles. The central figure eventually triumphs. The hero returns home.

> **After:** The protagonist faces many challenges but eventually triumphs and returns home.

---

#### 12. False Range Structures

**Problem:** LLMs use "from X to Y" structures where X and Y aren't on a meaningful scale.

> **Before:** Our journey across the cosmos takes us from the singularity of the Big Bang to the grand cosmic web, from the birth and death of stars to the mysterious dance of dark matter.

> **After:** The book covers the Big Bang, star formation, and current theories about dark matter.

---

### Style Patterns

#### 13. Dash Overuse

**Problem:** LLMs use em dashes (—) far more than humans do, mimicking "punchy" sales copy.

> **Before:** The term was popularized mainly by Dutch institutions — not by the people themselves. You wouldn't say "Holland, Europe" as an address — but the mislabeling continues — even in official documents.

> **After:** The term was popularized mainly by Dutch institutions, not by the people themselves. You wouldn't say "Holland, Europe" as an address, but the mislabeling continues in official documents.

---

#### 14. Bold Overuse

**Problem:** AI chatbots mechanically bold phrases for emphasis.

> **Before:** It integrates **OKRs (Objectives and Key Results)**, **KPIs (Key Performance Indicators)**, and visual strategy tools such as the **Business Model Canvas (BMC)** and **Balanced Scorecard (BSC)**.

> **After:** It integrates OKRs, KPIs, and visual strategy tools like the Business Model Canvas and Balanced Scorecard.

---

#### 15. Inline Header Vertical Lists

**Problem:** AI outputs lists where items open with a bolded label followed by a colon.

> **Before:**
> - **User Experience:** User experience was significantly improved through the new interface.
> - **Performance:** Performance was enhanced through optimized algorithms.
> - **Security:** Security was strengthened through end-to-end encryption.

> **After:** The update improved the interface, sped up load times through optimized algorithms, and added end-to-end encryption.

---

#### 16. Title Case in Headings

**Problem:** AI chatbots capitalize all major words in headings.

> **Before:** ## Strategic Negotiations And Global Partnerships

> **After:** ## Strategic negotiations and global partnerships

---

#### 17. Decorative Emojis

**Problem:** AI chatbots decorate headers or bullets with emojis.

> **Before:**
> 🚀 **Launch Phase:** Product ships Q3
> 💡 **Key Insight:** Users prefer simplicity
> ✅ **Next Step:** Schedule follow-up

> **After:** The product ships Q3. User research shows a preference for simplicity. Next: schedule follow-up.

---

### Communication Patterns

#### 18. Collaborative Chat Traces

**Watch for:** Hope this helps!, Certainly!, Of course!, You're absolutely right!, Would you like me to, Please let me know, Here is a…

**Problem:** Chat assistant responses pasted as content.

> **Before:** Here is an overview of the French Revolution. Hope this helps! If you'd like me to expand on any section, please let me know.

> **After:** The French Revolution began in 1789 when fiscal crisis and food shortages led to widespread unrest.

---

#### 19. Knowledge Cutoff Disclaimers

**Watch for:** As of [date], based on my last training update, while specific details are limited / scarce…, based on available information…

**Problem:** AI uncertainty disclaimers left in published text.

> **Before:** While specific details about the company's founding are not extensively documented in readily available sources, it appears to have been established sometime in the 1990s.

> **After:** According to registration documents, the company was founded in 1994.

---

#### 20. Sycophantic Tone

**Problem:** Overly positive, pleasing language.

> **Before:** Great question! You're absolutely right that this is a complex topic. Regarding the economic factors, that's an excellent point.

> **After:** The economic factors you mentioned are relevant here.

---

### Filler and Hedging

#### 21. Filler Phrases

| Replace | With |
|---------|------|
| "in order to achieve this" | "to achieve this" |
| "due to the fact that it rained" | "because it rained" |
| "at this point in time" | "now" |
| "in the event that you need help" | "if you need help" |
| "the system has the capability to process" | "the system can process" |
| "it is worth noting that the data shows" | "the data shows" |
| "in terms of" | cut or restructure |
| "when it comes to" | cut or restructure |

---

#### 22. Over-Qualification

**Problem:** Stacking hedges until a statement means nothing.

> **Before:** It could potentially perhaps be considered that the policy might possibly have some impact on outcomes.

> **After:** The policy may affect outcomes.

---

#### 23. Generic Positive Conclusions

**Problem:** Vague optimistic endings that say nothing.

> **Before:** The company's future looks bright. Exciting times lie ahead as they continue their journey toward excellence. This represents an important step in the right direction.

> **After:** The company plans to open two more locations next year.

---

### Humanize Workflow

1. **Read end-to-end** — understand meaning and intended register before touching anything.
2. **Scan for patterns** — mark every instance from the 23 categories above.
3. **Rewrite section by section** — replace each flagged passage; don't synonym-swap, rebuild.
4. **Add soul** — check for soulless writing signs; inject POV, rhythm variation, and specificity where needed.
5. **Read aloud test** — does it sound like a real person talking to another real person?
6. **Score and present** — provide the rewritten text, a brief summary of changes, and the quality score.

### Quick Checklist (Run Before Delivering)

- [ ] Three consecutive sentences the same length? Break one.
- [ ] Paragraph ends with a punchy one-liner? Vary the ending.
- [ ] Em dash before a reveal? Remove it.
- [ ] Metaphor explained? Trust the reader.
- [ ] "Moreover", "Furthermore", "Additionally", "In conclusion" used? Consider cutting.
- [ ] Three-item list? Make it two or four.
- [ ] Any bolded phrase that doesn't earn the emphasis? Remove bold.
- [ ] Title case in a heading? Switch to sentence case.

### Humanize Quality Score (0–50)

Rate the rewritten text on five dimensions:

| Dimension | 1 | 10 | Score |
|-----------|---|-----|-------|
| **Directness** | Preamble-heavy, announces before stating | States facts directly | /10 |
| **Rhythm** | Mechanical repetition of sentence length | Long and short sentences mix naturally | /10 |
| **Reader trust** | Over-explains, hedges, justifies | Concise, trusts the reader's intelligence | /10 |
| **Authenticity** | Robotic, no personality | Sounds like a specific real person | /10 |
| **Concision** | Still full of waste | Nothing left to cut | /10 |
| **Total** | | | **/50** |

**Standards:**
- 45–50: Excellent — AI traces removed, voice alive.
- 35–44: Good — still some room to improve.
- Below 35: Needs another pass.

### Humanize Output Format

Always provide:
1. **Rewritten text** — the full humanized version.
2. **Changes summary** — bullet list of what was removed/rewritten and why (optional if the user wants it brief).
3. **Quality score** — the 5-dimension table with scores.

### Humanize Common Mistakes to Avoid

- Synonym-swapping instead of rebuilding sentences — that just shuffles the AI around.
- Removing patterns but leaving the text sterile and voiceless.
- Over-correcting into casual slang when the original register was professional.
- Forgetting to check for soul after the technical cleanup.
- Presenting the score without the rewrite, or the rewrite without explaining key changes.

---

## Mode 6 — GEO Optimize

### When to Use

- User says "optimize for AI", "get cited by ChatGPT", "GEO optimization", "appear in AI answers", "make this AI-quotable", "Google AI Overview optimization", or "show up in Perplexity".
- Existing content (blog post, article, landing page) needs to be made more AI-citation-ready.
- Creating new content and wanting to maximize AI visibility alongside SEO.

Do **not** use for initial content creation from scratch — use Blog mode first, then apply GEO. Do **not** use for site-level GEO/technical audits — use the `seo-and-geo` skill.

### Inputs to Collect

- **Content** — the article, page, or draft to optimize (paste in full or describe).
- **Target queries** — the AI questions this content should answer.
- **Target engines** — Google AI Overviews, ChatGPT, Perplexity, Claude, or "all".

### GEO Workflow

**Step 1 — Current State Assessment**

Score the content on 8 GEO factors (1–10 each):

| GEO Factor | Score (1–10) | Notes |
|------------|-------------|-------|
| Clear definitions | | |
| Quotable statements | | |
| Factual density | | |
| Source citations | | |
| Q&A format | | |
| Authority signals | | |
| Content freshness | | |
| Structure clarity | | |
| **GEO Readiness** | **/10 avg** | |

List 3 primary weaknesses and 2–3 quick wins before writing.

---

**Step 2 — CORE-EEAT GEO-First Targets**

Apply these 6 highest-impact items first:

| Rank | ID | Standard | Why It Matters |
|------|----|----------|----------------|
| 1 | C02 | Direct answer in first 150 words | All engines extract from first paragraph |
| 2 | C09 | Structured FAQ with Schema | Directly matches AI follow-up queries |
| 3 | O03 | Data in tables, not prose | Most extractable structured format |
| 4 | O05 | JSON-LD Schema Markup | Helps AI understand content type |
| 5 | E01 | Original first-party data | AI prefers exclusive, verifiable sources |
| 6 | O02 | Key Takeaways / Summary Box | First choice for AI summary citations |

**AI engine priorities:**

| Engine | Top Priority Items |
|--------|--------------------|
| Google AI Overview | C02, O03, O05, C09 |
| ChatGPT (Browse) | C02, R01, R02, E01 |
| Perplexity AI | E01, R03, R05, precise attribution |
| Claude | R04, reasoning transparency, R03 |

See → [ai-citation-patterns.md](./references/ai-citation-patterns.md) for how each engine selects sources and which content structures it favors.

---

**Step 3 — Apply Six GEO Optimization Techniques**

1. **Definition optimization** — rewrite any key term intro as: `"[Term] is [category] that [primary function], [key characteristic]."` — 25–50 words, standalone, starts with the term. Replace vague phrases like "plays a crucial role".

2. **Quotable statements** — every major claim needs specific numbers, source attribution, and timeframe. "Pretty effective" → "delivers an average ROI of $42 for every $1 spent (DMA, 2024)". Aim for ≥5 precise data points per 1,000 words.

3. **Authority signals** — add expert quotes with credentials, citations to peer-reviewed research, named case studies. Every section should have at least one verifiable authority signal.

4. **Structure for AI extraction** — transform appropriate sections into Q&A pairs, comparison tables, numbered step lists, and definition boxes. Match H2/H3 headings to question formats ("How does X work?", "Why does Y matter?").

5. **Factual density** — replace opinion-heavy paragraphs with data-rich ones. Replace "many businesses" with "81% of SMBs" (with source).

6. **FAQ schema** — add a Frequently Asked Questions section with 40–60 word answers matching common queries. Include JSON-LD FAQPage markup.

See → [geo-optimization-techniques.md](./references/geo-optimization-techniques.md) for templates, before/after examples, and checklists per technique.
See → [quotable-content-examples.md](./references/quotable-content-examples.md) for 10 worked transformation examples across content types.

---

**Step 4 — GEO Output Report**

Always produce:

1. **Changes made** — list definitions added/improved, quotable statements created, authority signals added, structural improvements.
2. **Before/after GEO score** — the 8-factor table with before and after scores, plus overall average change.
3. **AI query coverage** — the specific questions this content is now optimized to answer (e.g. "What is [topic]?" ✅, "How does [topic] work?" ✅).

---

**Step 5 — GEO Post-Optimization Check**

Verify these CORE-EEAT GEO-first items before delivering:

- [ ] C02: Direct answer in first 150 words ✅/⚠️/❌
- [ ] C04: Key terms defined on first use ✅/⚠️/❌
- [ ] C09: Structured FAQ with Schema ✅/⚠️/❌
- [ ] O02: Summary Box / Key Takeaways ✅/⚠️/❌
- [ ] O03: Comparisons in tables ✅/⚠️/❌
- [ ] O05: JSON-LD Schema Markup ✅/⚠️/❌
- [ ] R01: ≥5 precise data points with units ✅/⚠️/❌
- [ ] R02: ≥1 citation per 500 words ✅/⚠️/❌
- [ ] R04: Claims backed by evidence ✅/⚠️/❌
- [ ] E01: Original first-party data present ✅/⚠️/❌

**Items needing attention**: [list any ⚠️/❌ items with fixes]

### GEO Tips

1. **Answer first** — core answer in the first sentence, not buried at the end.
2. **Be specific** — vague content doesn't get cited. Numbers beat adjectives every time.
3. **Cite everything** — AI systems trust verifiable, attributed information.
4. **Stay current** — update statistics and facts; freshness is especially important for Perplexity.
5. **Match query format** — H2/H3 headings that mirror common questions dramatically improve AI extraction.
6. **Build authority** — expert credentials and citations increase citation likelihood across all engines.

---

## Mode 7 — Content Quality Audit (CORE-EEAT)

### When to Use

- User says "audit content quality", "EEAT score", "CORE-EEAT audit", "content quality check", "how good is my content", "content improvement plan", "is my content AI-citation worthy", "GEO quality score", or "rate my content quality".
- Before publishing to evaluate whether content is ready.
- After writing or optimizing content (Blog, GEO Optimize) to benchmark quality.
- Comparing content against CORE-EEAT standards or competitor pieces.

Do **not** use for site-level SEO/GEO audits — use the `seo-and-geo` skill. Do **not** use for on-page technical SEO — that is a separate audit.

### Inputs to Collect

- **Content** — paste full text, provide a URL, or supply a file path. Must be ≥300 words for a meaningful audit.
- **Content type** (auto-detect or user-specified): Product Review, How-to Guide, Comparison, Landing Page, Blog Post, FAQ Page, Alternative, Best-of, or Testimonial.
- **Optional**: competitor content for a comparative audit.

### Step 1 — Preparation & Veto Check

```markdown
### Audit Setup

**Content**: [title or URL]
**Content Type**: [auto-detected or user-specified]
**Dimension Weights**: [loaded from content-type weight table]

#### Veto Check (Emergency Brake)

| Veto Item | Status | Action |
|-----------|--------|--------|
| T04: Disclosure Statements | ✅ Pass / ⚠️ VETO | [If VETO: "Add disclosure banner at page top immediately"] |
| C01: Intent Alignment | ✅ Pass / ⚠️ VETO | [If VETO: "Rewrite title and first paragraph"] |
| R10: Content Consistency | ✅ Pass / ⚠️ VETO | [If VETO: "Verify all data before publishing"] |
```

If any veto item triggers, flag it prominently at the top of the report before continuing.

### Step 2 — CORE Audit (40 Items)

Score each item as **Pass** (10 pts) / **Partial** (5 pts) / **Fail** (0 pts). Evaluate against the criteria in [references/item-reference.md](./references/item-reference.md) and [seo-and-geo/references/core-eeat-benchmark.md](../seo-and-geo/references/core-eeat-benchmark.md).

```markdown
### C — Contextual Clarity

| ID | Check Item | Score | Notes |
|----|-----------|-------|-------|
| C01 | Intent Alignment | Pass/Partial/Fail | [specific observation] |
| C02 | Direct Answer | Pass/Partial/Fail | [specific observation] |
| ... | ... | ... | ... |
| C10 | Semantic Closure | Pass/Partial/Fail | [specific observation] |

**C Score**: [X]/100
```

Repeat the same table format for **O** (Organization), **R** (Referenceability), and **E** (Exclusivity).

### Step 3 — EEAT Audit (40 Items)

```markdown
### Exp — Experience

| ID | Check Item | Score | Notes |
|----|-----------|-------|-------|
| Exp01 | First-Person Narrative | Pass/Partial/Fail | [specific observation] |
| ... | ... | ... | ... |

**Exp Score**: [X]/100
```

Repeat for **Ept** (Expertise), **A** (Authority), and **T** (Trust).

See [references/item-reference.md](./references/item-reference.md) for the complete 80-item ID lookup table and site-level item handling notes.

### Step 4 — Scoring & Report

```markdown
## CORE-EEAT Audit Report

### Overview

- **Content**: [title]
- **Content Type**: [type]
- **Audit Date**: [date]
- **Total Score**: [score]/100 ([rating])
- **GEO Score**: [score]/100 | **SEO Score**: [score]/100
- **Veto Status**: ✅ No triggers / ⚠️ [item] triggered

### Dimension Scores

| Dimension | Score | Rating | Weight | Weighted |
|-----------|-------|--------|--------|----------|
| C — Contextual Clarity | [X]/100 | [rating] | [X]% | [X] |
| O — Organization | [X]/100 | [rating] | [X]% | [X] |
| R — Referenceability | [X]/100 | [rating] | [X]% | [X] |
| E — Exclusivity | [X]/100 | [rating] | [X]% | [X] |
| Exp — Experience | [X]/100 | [rating] | [X]% | [X] |
| Ept — Expertise | [X]/100 | [rating] | [X]% | [X] |
| A — Authority | [X]/100 | [rating] | [X]% | [X] |
| T — Trust | [X]/100 | [rating] | [X]% | [X] |
| **Weighted Total** | | | | **[X]/100** |

**Score Calculation**:
- GEO Score = (C + O + R + E) / 4
- SEO Score = (Exp + Ept + A + T) / 4
- Weighted Score = Σ (dimension_score × content_type_weight)

**Rating Scale**: 90-100 Excellent | 75-89 Good | 60-74 Medium | 40-59 Low | 0-39 Poor

### Top 5 Priority Improvements

Sorted by: weight × points lost (highest impact first)

1. **[ID] [Name]** — [specific modification suggestion]
   - Current: [Fail/Partial] | Potential gain: [X] weighted points
   - Action: [concrete step]

[2–5 same format]

### Action Plan

#### Quick Wins (< 30 minutes each)
- [ ] [Action 1]
- [ ] [Action 2]

#### Medium Effort (1-2 hours)
- [ ] [Action 3]

#### Strategic (Requires planning)
- [ ] [Action 4]
```

### N/A Item Handling

When an item cannot be evaluated (e.g., A01 Backlink Profile requires site-level data):

1. Mark the item as "N/A" with reason.
2. Exclude N/A items from the dimension score: `Score = (sum of scored items) / (scored items × 10) × 100`
3. If >50% of a dimension's items are N/A, flag it as "Insufficient Data" and exclude from the weighted total.
4. Re-normalize remaining weights to sum to 100%.

**Note on site-level items**: Most Authority items (A01–A10) and several Trust items (T01–T03, T05, T07, T10) require site-level data not observable from a single page. Mark these N/A when auditing standalone content.

### Validation Checkpoints

- [ ] Content source identified (text, URL, or file path)
- [ ] Content type confirmed
- [ ] All 80 items scored or marked N/A with reason
- [ ] Veto items checked; flagged if triggered
- [ ] Weighted total uses correct content-type weights
- [ ] Top 5 improvements sorted by weighted impact, not arbitrary
- [ ] Every recommendation is specific and actionable

### Content Audit Tips

1. **Start with veto items** — T04, C01, R10 are deal-breakers regardless of total score.
2. **Focus on high-weight dimensions** — different content types prioritize different dimensions.
3. **GEO-First items matter most for AI visibility** — prioritize items tagged GEO 🎯 if AI citation is the goal.
4. **Some EEAT items need site-level data** — don't penalize content for things only observable at domain level.
5. **Use the weighted score, not raw average** — a product review with strong Exclusivity matters more than strong Authority.
6. **Re-audit after improvements** — run again to verify score gains and catch regressions.
7. **Pair with GEO Optimize mode** — after auditing, use Mode 6 to fix failed GEO-First items.

---

## Mode 8 — Content Refresh

### When to Use

- User says "update old content", "refresh this article", "content is outdated", "revive old blog posts", "rankings dropped for this article", "traffic is declining on this page", or "this post is outdated".
- Content has lost rankings or traffic over time.
- Statistics and information are outdated.
- Competitors have published better content.
- Content needs updating for a new year.
- Industry changes require content updates.
- Adding new sections to existing content.
- Converting old content for GEO optimization.

Do **not** use for writing new content from scratch — use Blog mode. Do **not** use for auditing without rewriting — use Content Audit mode.

### Inputs to Collect

- **Target content** — URL, file, or pasted text of the article to refresh.
- **Performance context** — traffic trends, ranking history, publish/update dates (or screenshots if automated data unavailable).
- **Comparison target** (optional) — competitor URLs to benchmark against.

### Data Sources

**With analytics + search console + SEO tool connected:** Claude can automatically pull historical traffic trends, impression/ranking data, keyword position history, and identify declining performance for data-driven prioritization.

**With manual data only:** Ask the user to provide traffic screenshots, ranking history, publish/update dates, and a list of pages they suspect need refreshing. Note in the output which findings are from automated data vs. manual review.

### Step 1 — CORE-EEAT Quick Score

Before refreshing, run a quick CORE-EEAT assessment to focus effort on the weakest areas:

```markdown
### CORE-EEAT Quick Assessment

**Content**: [title or URL]
**Content Type**: [type]

| Dimension | Quick Score | Key Weakness | Refresh Priority |
|-----------|-------------|--------------|-----------------|
| C — Contextual Clarity | [X]/100 | [main issue] | 🔴/🟡/🟢 |
| O — Organization | [X]/100 | [main issue] | 🔴/🟡/🟢 |
| R — Referenceability | [X]/100 | [main issue] | 🔴/🟡/🟢 |
| E — Exclusivity | [X]/100 | [main issue] | 🔴/🟡/🟢 |
| Exp — Experience | [X]/100 | [main issue] | 🔴/🟡/🟢 |
| Ept — Expertise | [X]/100 | [main issue] | 🔴/🟡/🟢 |
| A — Authority | [X]/100 | [main issue] | 🔴/🟡/🟢 |
| T — Trust | [X]/100 | [main issue] | 🔴/🟡/🟢 |

**Weakest Dimensions** (focus refresh here):
1. [Dimension] — [what needs fixing]
2. [Dimension] — [what needs fixing]

**Refresh Strategy**: Focus on 🔴 dimensions first, then 🟡.

_For full 80-item audit, use Content Audit mode (Mode 7)_
```

### Step 2 — Identify Refresh Candidates

When the user wants to find what needs refreshing across a site:

```markdown
## Content Refresh Analysis

### Criteria for Content Refresh
- Published more than 6 months ago
- Contains dated information (years, statistics)
- Declining traffic trend
- Lost keyword rankings
- Outdated references or broken links
- Missing topics competitors now cover
- No GEO optimization

### Content Audit Results

| Content | Published | Last Updated | Traffic Trend | Priority |
|---------|-----------|--------------|---------------|----------|
| [Title 1] | [date] | [date] | ↓ -45% | 🔴 High |
| [Title 2] | [date] | Never | ↓ -30% | 🔴 High |
| [Title 3] | [date] | [date] | ↓ -20% | 🟡 Medium |

### Refresh Prioritization Matrix

High Traffic + High Decline = 🔴 Refresh Immediately
High Traffic + Low Decline = 🟡 Schedule Refresh
Low Traffic + High Decline = 🟡 Evaluate & Decide
Low Traffic + Low Decline = 🟢 Low Priority
```

### Step 3 — Analyze Individual Content

For each piece being refreshed:

```markdown
## Content Refresh Analysis: [Title]

**URL**: [URL]
**Published**: [date]
**Last Updated**: [date]
**Word Count**: [X]

### Performance Metrics

| Metric | 6 Mo Ago | Current | Change |
|--------|----------|---------|--------|
| Organic Traffic | [X]/mo | [X]/mo | [+/-X]% |
| Avg Position | [X] | [X] | [+/-X] |
| Impressions | [X] | [X] | [+/-X]% |
| CTR | [X]% | [X]% | [+/-X]% |

### Keywords Analysis

| Keyword | Old Position | Current Position | Change |
|---------|--------------|------------------|--------|
| [kw 1] | [X] | [X] | ↓ [X] |
| [kw 2] | [X] | [X] | ↓ [X] |

### Why This Content Needs Refresh

1. **Outdated information**: [specific examples]
2. **Competitive gap**: [what competitors added]
3. **Missing topics**: [new subtopics to cover]
4. **SEO issues**: [current optimization problems]
5. **GEO potential**: [AI citation opportunities]
```

### Step 4 — Identify Specific Updates Needed

```markdown
## Refresh Requirements

### Outdated Elements

| Element | Current | Update Needed |
|---------|---------|---------------|
| Year references | "[old year]" | Update to [current year] |
| Statistics | "[old stat]" | Find current data |
| Tool mentions | "[old tool]" | Add newer tools |
| Links | [X] broken | Fix or replace |

### Missing Information

**Topics competitors now cover that you don't**:

| Topic | Competitor Coverage | Words Needed | Priority |
|-------|---------------------|--------------|----------|
| [Topic 1] | 3/5 competitors | ~300 words | High |
| [Topic 2] | 2/5 competitors | ~200 words | Medium |

### SEO Updates Needed

- [ ] Update title tag with current year
- [ ] Refresh meta description
- [ ] Add new H2 sections for [topics]
- [ ] Update internal links to newer content
- [ ] Add FAQ section for featured snippets
- [ ] Refresh images and add new alt text

### GEO Updates Needed

- [ ] Add clear definition at start
- [ ] Include quotable statistics with sources
- [ ] Add Q&A formatted sections
- [ ] Update sources with current citations
- [ ] Create standalone factual statements
```

### Steps 5–9 (Templates)

> **Reference**: See [references/refresh-templates.md](./references/refresh-templates.md) for full output templates:
> - **Step 5**: Refresh Plan — structural changes, content additions, statistics/links/images to update
> - **Step 6**: Refresh Content Writing — updated introduction, new sections, refreshed statistics, new FAQ section
> - **Step 7**: GEO Enhancement During Refresh — clear definitions, quotable statements, Q&A sections, updated citations
> - **Step 8**: Republishing Strategy — date strategy (update/add "last updated"/keep original), technical implementation, promotion plan
> - **Step 9**: Refresh Report — summary of changes, updates completed, expected outcomes, next review date

### Validation Checkpoints

**Input:**
- [ ] Target content URL or title clearly identified
- [ ] Historical performance data available (traffic trends, rankings)
- [ ] Content publish/update dates known

**Output:**
- [ ] Every recommendation cites specific data points (not generic advice)
- [ ] Outdated elements identified with specific examples and replacement data
- [ ] All suggested additions include word counts and section locations
- [ ] Source of each data point clearly stated

### Content Refresh Tips

1. **Prioritize by ROI** — refresh high-potential content first.
2. **Don't just add dates** — make substantial improvements.
3. **Beat competitors** — add what they have and more.
4. **Optimize for GEO** — every refresh is a GEO opportunity (pair with GEO Optimize mode).
5. **Track results** — monitor ranking changes post-refresh.
6. **Schedule regular audits** — check content health quarterly.

### Reference Materials

- [Content Decay Signals](./references/content-decay-signals.md) — Decay indicators, lifecycle stages, refresh vs. rewrite decision framework, and update strategy by content type
- [Refresh Templates](./references/refresh-templates.md) — Detailed output templates for steps 5–9 (refresh plan, content writing, GEO enhancement, republishing, report)
- [Refresh Example & Checklist](./references/refresh-example.md) — Full worked example and pre/post-refresh checklist

---

## Mode 9 — Content Gap Analysis

### When to Use

- User says "find content gaps", "what am I missing", "content opportunities", "untapped topics", "content strategy gaps", "what topics am I missing", "where are my content blind spots", "they cover this but I don't", or "what do competitors write about".
- Planning a content strategy or editorial calendar from scratch.
- Identifying where competitors outperform you on specific topics.
- Prioritizing content creation based on traffic and conversion potential.
- Finding GEO opportunities that competitors miss.

Do **not** use for writing content — use Blog or X Articles mode after identifying gaps. Do **not** use for site-level technical SEO audits — use the `seo-and-geo` skill.

### Inputs to Collect

- **Your site** — URL or content inventory (list of published content with topics).
- **Competitors** — 3–5 competitor URLs to benchmark against.
- **Topic focus** — specific area or "all topics".
- **Business goals** — traffic, leads, authority, or conversions.
- **Performance data (optional)** — current traffic, keyword rankings, analytics screenshots.

Ask 2–3 targeted questions if anything critical is missing.

### Data Sources

**With SEO tools + Search Console + Analytics connected:** Automatically pull indexed pages and traffic per page, competitor keyword profiles (ranking keywords, top pages), and AI citation patterns. Keyword overlap analysis can be automated.

**With manual data only:** Ask the user to provide: (1) site URL and content inventory, (2) competitor URLs, (3) current traffic and keyword performance if available, (4) known content strengths and weaknesses. Note which findings come from automated vs. manual data.

### Step 1 — Define Analysis Scope

Clarify parameters before starting:

```markdown
### Analysis Parameters

**Your Site**: [URL]
**Competitors**: [URLs or "identify for me"]
**Topic Focus**: [specific area or "all"]
**Content Types**: [blogs, guides, tools, videos, or "all"]
**Audience**: [target audience]
**Business Goals**: [traffic, leads, authority, etc.]
```

### Step 2 — Audit Your Existing Content

Document total indexed pages, content by type and topic cluster, top performing content (traffic, keywords), and content strengths/weaknesses.

See → [gap-analysis-templates.md](./references/gap-analysis-templates.md) for the Content Inventory template.

### Step 3 — Analyze Competitor Content

For each competitor (3–5 recommended): document content volume, estimated monthly traffic, content distribution by type, topic coverage vs. yours, and unique content they have.

See → [gap-analysis-templates.md](./references/gap-analysis-templates.md) for the Competitor Content Analysis template.

### Step 4 — Identify Keyword Gaps

Find keywords competitors rank for that you do not. Categorize into:
- **High Priority** — high volume, achievable difficulty.
- **Quick Wins** — lower volume, low difficulty.
- **Long-term** — high volume, high difficulty.

Include a keyword overlap analysis showing: keywords only you rank for (your moat), shared keywords (competitive battleground), keywords only competitors have (your gaps), and keywords no one ranks for (market opportunity).

See → [gap-analysis-frameworks.md](./references/gap-analysis-frameworks.md) for the 5-step Systematic Keyword Gap Methodology and the keyword overlap matrix.

### Step 5 — Map Topic Gaps

Create a topic coverage comparison matrix across all competitors. For each missing topic cluster, document: business relevance, competitor coverage, opportunity size, sub-topics to cover, and recommended pillar/cluster approach.

### Step 6 — Identify Content Format Gaps

Compare format distribution (guides, tutorials, comparisons, case studies, tools, templates, video, infographics, research) against competitors and industry averages. For each gap, assess effort and expected impact.

Certain formats unlock SERP features: glossary pages → Featured Snippet + AI Overview; step-by-step tutorials → How-To rich results; FAQ sections → PAA eligibility. See → [gap-analysis-frameworks.md](./references/gap-analysis-frameworks.md) for the Format-SERP Feature Alignment table.

### Step 7 — Analyze GEO / AI Gaps

Identify topics where competitors get AI citations but you do not. Document missing Q&A content, missing definition/explanation content, and missing comparison content. Score each by traditional SEO value and GEO value.

### Step 8 — Map to Audience Journey

Compare funnel stage coverage (Awareness, Interest, Consideration, Intent, Retention, Advocacy) against competitor averages. Detail specific gaps at each stage and identify drop-off points using bounce rate, pages-per-session, and conversion data.

See → [gap-analysis-frameworks.md](./references/gap-analysis-frameworks.md) for the full Funnel Stage Gap Identification methodology.

### Step 9 — Prioritize and Produce Final Report

Score each gap using the multi-factor model across 5 dimensions (Search Demand 25%, Competitive Density 20%, Business Relevance 25%, Creation Effort 15%, Conversion Potential 15%). Produce a report with:

1. **Executive Summary** — top 3 gaps, total keyword opportunity, quick win count.
2. **Prioritized Gap List** — Tier 1 Quick Wins, Tier 2 Strategic Builds, Tier 3 Long-term.
3. **Content Calendar** — gap-filling schedule with sequences, dependencies, and target dates.
4. **Success Metrics** — keyword coverage, topic clusters, traffic targets, AI citation targets.

See → [gap-analysis-templates.md](./references/gap-analysis-templates.md) for the Prioritized Report template and Content Calendar template.
See → [gap-analysis-example.md](./references/gap-analysis-example.md) for a complete worked example analyzing a SaaS marketing blog vs. HubSpot and Drift.
See → [gap-analysis-frameworks.md](./references/gap-analysis-frameworks.md) for the multi-factor Opportunity Scoring Model and Gap-to-Calendar Workflow.

### Validation Checkpoints

**Input:**
- [ ] Content inventory complete or representative sample provided.
- [ ] Competitor URLs identified (minimum 2–3).
- [ ] Analysis scope defined (specific topics or comprehensive).
- [ ] Business goals and priorities clarified.

**Output:**
- [ ] Every recommendation cites specific data points (not generic advice).
- [ ] Gap analysis compares like-to-like content (topic clusters to topic clusters).
- [ ] Priority scoring based on measurable criteria (volume, difficulty, business fit).
- [ ] Content calendar maps gaps to realistic timeframes.
- [ ] Source of each data point clearly stated (automated tool data, analytics data, user-provided, or estimated).

### Gap Analysis Tips

1. **Focus on actionable gaps** — not all gaps are worth filling; filter by relevance and resources.
2. **Quality over quantity** — better to fill 5 gaps well than 20 poorly.
3. **Include GEO opportunities** — don't just optimize for traditional search; AI citation gaps are often low-competition.
4. **Update regularly** — gaps change as competitors publish new content; re-run quarterly.
5. **Feed into Blog mode** — after identifying gaps, use Blog mode to create the top-priority content first.

### Reference Materials

- [Gap Analysis Frameworks](./references/gap-analysis-frameworks.md) — Keyword gap methodology, content format audit, funnel stage mapping, opportunity scoring model (5-factor), and gap-to-calendar workflow with post-publication validation.
- [Gap Analysis Templates](./references/gap-analysis-templates.md) — Templates for content inventory, competitor analysis, keyword gap table, topic gap matrix, format gap, GEO gap, audience journey, and prioritized report with calendar.
- [Gap Analysis Example](./references/gap-analysis-example.md) — Complete worked example analyzing a SaaS marketing blog vs. HubSpot and Drift.

---

## Mode 10 — Keyword Research

### When to Use

- User says "find keywords", "keyword research", "what should I write about", "identify ranking opportunities", "give me keyword ideas", "which keywords should I target", "what are people searching for", "search volume", or "long-tail keyword suggestions".
- Starting a new content strategy or campaign.
- Expanding into new topics or markets.
- Planning content calendars.
- Researching keywords for GEO optimization (AI citation potential).

Do **not** use for content gap analysis vs. competitors — use Content Gap Analysis mode. Do **not** use for writing content — use Blog mode after identifying target keywords.

### Inputs to Collect

- **Product/service/topic** — what is being promoted or explained?
- **Target audience** — job title, level, geographic location, language.
- **Business goal** — traffic, leads, sales, or authority.
- **Domain maturity** — new site, established, or enterprise.
- **Seed keywords** (optional) — any known starting terms.

Ask 2–3 targeted questions if anything critical is missing.

### Data Sources

**With SEO tool + Search Console connected:**
Automatically pull search volume data, keyword difficulty scores, SERP analysis, current rankings, and competitor keyword overlap.

**With manual data only:**
Ask the user to provide seed keywords or topic description, target audience and geographic location, business goals, current domain authority (if known), and any known keyword performance data. Note in the output which metrics are from automated collection vs. user-provided vs. estimated.

### Keyword Research Workflow

**Step 1 — Understand the Context**

Clarify if not provided:
- What is your product/service/topic?
- Who is your target audience?
- What is your business goal? (traffic, leads, sales)
- What is your current domain authority? (new site, established, etc.)
- Any specific geographic targeting?
- Preferred language?

**Step 2 — Generate Seed Keywords**

Start with:
- Core product/service terms
- Problem-focused keywords (what issues does the offering solve?)
- Solution-focused keywords (how does it help?)
- Audience-specific terms
- Industry terminology

**Step 3 — Expand Keyword List**

For each seed keyword, generate variations using these patterns:

*Modifiers:* Best [keyword], Top [keyword], [keyword] for [audience], [keyword] near me, [keyword] [year], How to [keyword], What is [keyword], [keyword] vs [alternative], [keyword] examples, [keyword] tools

*Long-tail variations:* [keyword] for beginners, [keyword] for small business, Free [keyword], [keyword] software/tool/service, [keyword] template, [keyword] checklist, [keyword] guide

**Step 4 — Classify Search Intent**

Categorize each keyword using the four intent types:

| Intent | Signals | Example | Content Type |
|--------|---------|---------|--------------|
| Informational | what, how, why, guide, learn | "what is SEO" | Blog posts, guides |
| Navigational | brand names, specific sites | "google analytics login" | Homepage, product pages |
| Commercial | best, review, vs, compare | "best SEO tools 2026" | Comparison posts, reviews |
| Transactional | buy, price, discount, order | "buy SEO software" | Product pages, pricing |

See → [keyword-intent-taxonomy.md](./references/keyword-intent-taxonomy.md) for the full classification system with sub-categories, signal words, SERP feature correlations, mixed intent patterns, and funnel alignment.

**Step 5 — Assess Keyword Difficulty**

Score each keyword (1–100 scale):

| Range | Difficulty | Signals |
|-------|-----------|---------|
| 70–100 | High | Major brands ranking, high DA competitors, established content (1000+ backlinks), paid ads dominating SERP |
| 40–69 | Medium | Mix of authority and niche sites, some opportunities for quality content, moderate backlink requirements |
| 1–39 | Low | Few authoritative competitors, thin or outdated content ranking, long-tail variations, new or emerging topics |

**Step 6 — Calculate Opportunity Score**

**Priority Score** (for initial triage): score each keyword 1–5 on five weighted factors — Search Volume (20%), Keyword Difficulty (25%), Business Relevance (30%), Search Intent Match (15%), Trend Direction (10%). See → [keyword-prioritization-framework.md](./references/keyword-prioritization-framework.md) for the full scoring matrix, priority categories (P0–P3), and seasonal keyword patterns.

**Opportunity Score** (for final calendar prioritization): `Opportunity = (Volume × Intent Value) / Difficulty`

Intent Value: Informational = 1, Navigational = 1, Commercial = 2, Transactional = 3

| Scenario | Volume | Difficulty | Intent | Priority |
|----------|--------|------------|--------|----------|
| Quick Win | Low-Med | Low | High | P0 — immediate |
| Growth | High | Medium | High | P1 — next sprint |
| Long-term | High | High | High | P2 — future calendar |
| Research | Low | Low | Low | P3 — monitor |

**Step 7 — Identify GEO Opportunities**

Keywords likely to trigger AI responses:

*High GEO Potential:* Question formats ("What is…", "How does…"), definition queries ("[term] meaning"), comparison queries ("[A] vs [B]", "difference between…"), list queries ("best [category]", "top [N] [items]"), how-to queries ("how to [action]").

*AI Answer Indicators:* Query is factual/definitional, answer can be summarized concisely, topic is well-documented online, low commercial intent.

**Step 8 — Create Topic Clusters**

Group keywords into hub-and-spoke clusters. For each cluster, define:
- **Pillar content** — primary keyword, broad comprehensive guide
- **Cluster content** — secondary keywords linking to the pillar

See → [topic-cluster-templates.md](./references/topic-cluster-templates.md) for planning worksheets, hub-and-spoke architecture patterns (Classic, Layered, Use-Case, Process), internal linking rules, content calendar integration, and a cluster health scorecard.

**Step 9 — Generate Output Report**

Produce a report with these sections:
1. **Executive Summary** — total keywords analyzed, high-priority opportunities, estimated traffic potential, recommended focus areas.
2. **Top Keyword Opportunities** — Quick Wins (P0), Growth keywords (P1), GEO opportunities.
3. **Topic Clusters** — pillar + cluster maps with volume, difficulty, and content type per page.
4. **Content Calendar** — sequenced publishing schedule with dependencies.
5. **Next Steps** — which mode to use next (Blog, Content Gap Analysis, GEO Optimize).

See → [keyword-research-example.md](./references/keyword-research-example.md) for a complete example report.

### Validation Checkpoints

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
- [ ] Source of each data point clearly stated (tool data, user-provided, or estimated)

### Tips for Success

1. **Start with seed keywords** that describe the core offering
2. **Don't ignore long-tail** — they often have the highest conversion rates
3. **Match content to intent** — informational queries need guides, not sales pages
4. **Group into clusters** for topical authority
5. **Prioritize quick wins** to build momentum and credibility
6. **Include GEO keywords** in your strategy for AI visibility
7. **Review quarterly** — keyword dynamics change over time

### Reference Materials

- [Keyword Intent Taxonomy](./references/keyword-intent-taxonomy.md) — Complete intent classification with signal words, SERP feature correlations, mixed intent patterns, funnel alignment, and conversion potential by intent type
- [Keyword Prioritization Framework](./references/keyword-prioritization-framework.md) — Priority scoring matrix (P0–P3), weighted factor methodology, and seasonal keyword patterns
- [Topic Cluster Templates](./references/topic-cluster-templates.md) — Hub-and-spoke architecture patterns, internal linking rules, content calendar sequencing, and cluster health scorecard
- [Keyword Research Example](./references/keyword-research-example.md) — Complete example report for project management software targeting small businesses

---

## Mode 11 — Support-to-Content Pipeline

### When to Use

- User says "analyze support tickets", "content from customer questions", "support-to-content", "what should I document", "reduce support load with content", "generate help articles from tickets", "turn customer questions into content", or "support ticket analysis".
- Team has a backlog of support tickets and wants to systematically convert common questions into self-serve content.
- User wants to find what to write by mining real user pain points rather than keyword tools.

Do **not** use for writing individual pieces — use Blog mode after this mode generates briefs.

### Inputs to Collect

- **Support data** — ticket export (CSV/JSON with titles/descriptions), OR a GitHub repository to use issues as a proxy, OR pasted ticket titles.
- **Minimum occurrences** — how many times a topic must appear to qualify (default: 3).
- **Label/tag filter** (optional) — restrict to a specific issue type (e.g. "question", "documentation", "bug").
- **Output goal** — help articles, blog posts, or both.

### Analysis Workflow

**Step 1 — Load and Parse Tickets**

Accept support data in any of these formats:
- CSV/JSON export from Zendesk, Intercom, Freshdesk, Linear, or similar
- GitHub Issues from a repo (proxy when no direct ticket export)
- Paste of raw ticket titles or summaries

Extract per ticket: title, body snippet (first ~500 chars), labels/tags, date, comment count.

**Step 2 — Discover Topics via Frequency Analysis**

Run three parallel analyses on ticket titles:

1. **Word frequency** — extract keywords; filter stopwords (the, and, for, error, issue, bug, fix, app, etc.); rank by count. Any word at ≥ `min_occurrences` is a candidate topic.
2. **Bigram frequency** — extract two-word phrases; rank by count. Bigrams appearing ≥2 times surface more specific problem areas than single words alone.
3. **Label/tag clustering** — group tickets by label; count per group; surface 3 sample titles per group. This provides a coarser but highly reliable signal.

**Step 3 — Build Topic Clusters**

Group overlapping keyword sets into unified topics:
- If two keywords share >40% of the same ticket IDs, merge into one cluster.
- Cluster label = top 3 keywords joined by "/".
- Each cluster carries: keyword list (up to 5), issue count, sample ticket titles (up to 3).

Sort clusters by issue count descending; keep top 15.

**Step 4 — Score and Rank Content Opportunities**

Score each cluster:

```
score = issue_count × (1 + 0.2 × keyword_count)
```

Classify content type from dominant keywords:
- **Blog post** — conceptual clusters (keywords: "understand", "why", "concept", "explain", "difference")
- **Product improvement** — crash/regression clusters (keywords: "crash", "broken", "fail", "regression")
- **Help article** — all others (how-to, setup, error resolution, configuration)

Present the top 10 opportunities ranked by score with: rank, topic, issue count, score, content type, and 2–3 sample ticket titles.

**Step 5 — Generate Content Briefs**

For each top opportunity produce a structured brief:

```markdown
## Content Brief: [Topic]

### Metadata
- Rank: [N]
- Content Type: [Help Article / Blog Post / Product Improvement]
- Priority Score: [X.X]
- Based on: [N] support tickets

### Keywords
- [keyword 1]
- [keyword 2]
- [keyword 3]

### Sample User Questions (from tickets)
- [ticket title 1]
- [ticket title 2]
- [ticket title 3]

### Suggested Outline
1. Problem statement / Why users hit this
2. Root cause or explanation
3. Step-by-step solution (help articles) OR conceptual deep-dive (blog posts)
4. Common pitfalls and edge cases
5. Related resources and next steps

### SEO Notes
- Target keyword: "[primary keyword]"
- Search intent: [informational / transactional]
- Long-tail variations: "[variation 1]", "[variation 2]"
```

**Step 6 — Output Summary Report**

```markdown
## Support-to-Content Analysis

Analyzed [N] tickets · Topics discovered: [N] · Briefs generated: [N]

### Top Content Opportunities

| Rank | Topic | Tickets | Score | Content Type |
|------|-------|---------|-------|--------------|
| 1 | [topic] | [N] | [X.X] | Help Article |
| 2 | [topic] | [N] | [X.X] | Blog Post |
| 3 | [topic] | [N] | [X.X] | Help Article |
| 4 | [topic] | [N] | [X.X] | Product Improvement |
| 5 | [topic] | [N] | [X.X] | Help Article |

### Recommended Next Steps
- Top help article briefs → **Blog mode** (Mode 1), How-To or Playbook structure
- Top blog post briefs → **Blog mode** (Mode 1), Problem → Insight → Playbook structure
- Product improvement items → flag for engineering/product team
```

### Integration with Other Modes

After generating briefs, route to:
- **Blog mode** — write any brief as a full article. Help articles → How-To/Playbook structure. Blog posts → Problem → Insight → Playbook.
- **GEO Optimize mode** — maximize AI citation for commonly-searched questions.
- **Content Audit mode** — quality-gate each piece before publishing.
- **Syndication mode** — repurpose high-value help articles as LinkedIn posts or X threads.

### Quality Checklist

- [ ] Ticket count confirmed and data successfully parsed
- [ ] Stopwords and noise terms filtered (single letters, generic words like "the", "error", "app")
- [ ] Topic cluster labels are meaningful (not single letters or pure noise)
- [ ] Content type classification is logical (product_improvement items are true UX/engineering issues)
- [ ] Sample user questions come from real ticket titles — not invented
- [ ] Each brief includes a primary SEO keyword derived from the actual cluster

### Tips

1. **More tickets = better signal** — aim for ≥50 tickets; ≥100 for reliable clusters.
2. **Use label filters** — filtering to "question" or "documentation" focuses on content opportunities and excludes pure bug noise.
3. **High-score + high-count = write first** — those deflect the most tickets immediately.
4. **Track impact** — after publishing, monitor ticket volume on that topic over 30 days to measure support load reduction.
5. **Combine with Keyword Research** — validate that the discovered topics also have search volume before investing in full articles.

---

## Mode 12 — Edit Article

### When to Use

- User pastes an existing article draft and says "edit this", "revise this", "improve clarity", "restructure this", or "rewrite sections".
- The draft is written but feels disorganized, verbose, or hard to follow.
- Goal is structural improvement and prose tightening — **not** SEO refresh (use Content Refresh mode) or quality scoring (use Content Audit mode).

Do **not** use for writing from scratch (use Blog mode) or updating outdated stats/rankings (use Content Refresh mode).

### Core Principle

Treat the article's sections as a **directed acyclic graph (DAG)**: each section may depend on concepts introduced in earlier sections. The reader cannot evaluate a solution before understanding the problem; they cannot apply a framework before seeing why it is needed. Make section order respect these dependencies explicitly.

### Workflow

**Step 1 — Map sections.**

Divide the article into sections based on its headings. For each section, write down:
- The main point it makes.
- What prior knowledge or context it assumes the reader already has.

**Step 2 — Audit the DAG.**

Draw the dependency graph (mentally or explicitly). Identify any ordering violations:
- A section that references something not yet introduced.
- A conclusion that appears before the evidence.
- Background buried after the point that needs it.

Reorder sections to respect all dependencies. If two sections are mutually dependent, merge them or split the shared concept into its own introductory section.

**Step 3 — Confirm with user.**

Present the proposed section map:

```
Proposed structure:
1. [Section title] — [one-line summary of main point]
2. [Section title] — [one-line summary]
   (depends on: section 1)
3. [Section title] — [one-line summary]
   (depends on: sections 1, 2)
...

Changes from original: [list reordered or merged sections]
```

Wait for user confirmation or adjustments before proceeding.

**Step 4 — Rewrite each section.**

For each confirmed section in order:
- Rewrite to improve clarity, coherence, and flow.
- **Maximum 240 characters per paragraph** (~2–3 sentences). Split any paragraph that exceeds this.
- Cut filler words ("very", "really", "in order to", "just"). One idea per paragraph.
- Preserve the author's voice and any strong original phrasing worth keeping.
- Start each section with a clear topic sentence that states the section's main point.

### Output Format

Deliver the full rewritten article with the confirmed section structure. At the end, include a brief edit summary:

```
## Edit Summary
- Sections reordered: [list]
- Sections merged: [list, if any]
- Avg paragraph length: [X] chars (target: ≤240)
- Filler cuts: [approx. count]
- Voice changes: [minimal / moderate — describe if significant]
```

### Common Mistakes to Avoid

- Reordering sections without explaining the DAG rationale to the user.
- Skipping the confirmation step and rewriting before the user agrees on structure.
- Merging sections without flagging it — the user may have split them intentionally.
- Rewriting so aggressively that the author's original voice disappears.
- Splitting paragraphs mechanically at 240 chars without checking for logical breaks.

---

## Shared Standards Across All Modes

### Voice Consistency

In every mode:
- Write *to* the reader ("you/your"), not about abstract people.
- Prefer concrete over abstract; stories over claims; examples over theory.
- Maintain the user's POV and phrasing where it is strong; rewrite only for clarity and impact.
- Avoid AI-generic marketing voice — if it could have been written by any content marketer, rewrite it.

### Common Mistakes (All Modes)

- Copy-pasting content across platforms with minor rephrasing.
- Using the same intro and CTA in every version.
- Ignoring the behavioral reality of each platform (X is fast-scan; Substack is long-form relationship building).
- Over-optimizing for SEO at the cost of human engagement.
- Forgetting to state which channel is canonical for search engines.

---

## Content Pipeline — How Modes Work Together

**Starting from raw knowledge:**

1. Use **Blog mode** → produce canonical blog article.
2. Use **X Articles mode** → feed the canonical blog in; produce an X-native long-form.
3. Use **Syndication mode** → feed the canonical blog (or X Article) in; produce X threads, LinkedIn posts, Substack, Medium versions.

**Starting from an existing canonical piece:**

1. Skip Blog mode.
2. Use **X Articles mode** if an X-native long-form is wanted.
3. Use **Syndication mode** for the full channel distribution pack.

**LinkedIn-only content:**

- Use **LinkedIn mode** directly.
- After the LinkedIn article is drafted, optionally use **Syndication mode** to derive complementary versions for other channels.

**When the user wants replies, comments, or outreach follow-up:**
- Use `linkedin-engagement` for LinkedIn comments and DMs.
- Use `x-engagement` for X replies, quote posts, and DMs.

**When the user wants to de-AI any draft:**
- Use **Humanize mode** on any piece — blog, X Article, LinkedIn post, newsletter — before publishing.
- Run Humanize after Blog, X Article, or Syndication mode to strip AI traces from the output.

**When the user wants AI citation optimization (GEO):**
- Use **GEO Optimize mode** directly on content to maximize AI citation across ChatGPT, Perplexity, and Google AI Overviews.
- Natural pipeline: Blog → GEO Optimize → Syndication.

**When the user wants to audit content quality before publishing:**
- Use **Content Audit mode** on any finished draft — blog, X Article, landing page — to get a full 80-item CORE-EEAT report.
- Natural pipeline: Blog → GEO Optimize → Content Audit (final quality gate before publishing).
- After auditing, use **GEO Optimize mode** to fix failed GEO-First items, or **Humanize mode** to fix voice/authenticity issues.

**When the user wants to refresh or revive existing content:**
- Use **Content Refresh mode** on any article that has lost rankings/traffic, contains outdated stats, or needs new sections.
- Natural pipeline: Content Refresh → GEO Optimize → Content Audit (final quality gate).
- After refreshing, pair with **GEO Optimize mode** to maximize AI citation potential, or **Content Audit mode** to benchmark the updated piece.
- Use **Content Refresh mode** instead of **Blog mode** when the goal is improving an existing piece, not writing from scratch.

**When the user wants a full site-level SEO/GEO/AEO audit:**
- Run the final canonical article or site through `seo-and-geo` for technical SEO, GEO, and AEO improvements at the site level.

**When the user wants to find what to write next:**
- Use **Content Gap Analysis mode** to identify keyword gaps, topic gaps, format gaps, and GEO gaps vs. competitors.
- Natural pipeline: Content Gap Analysis → Blog mode (to create prioritized content) → GEO Optimize → Content Audit.
- After the analysis, use **Content Refresh mode** on any existing content that partially covers a gap before creating new pieces.

**When the user needs to discover keywords before any content work:**
- Use **Keyword Research mode** to find high-value keywords, classify intent, score opportunities, and build topic clusters.
- Natural pipeline: Keyword Research → Content Gap Analysis (benchmark gaps vs. competitors) → Blog mode (write top-priority content) → GEO Optimize → Content Audit.
- After keyword research, feed the top-priority keywords directly into Blog mode or Content Gap Analysis.

**When the user wants to mine support tickets for content ideas:**
- Use **Support-to-Content mode** to analyze ticket patterns, cluster topics, score opportunities, and generate structured content briefs.
- Natural pipeline: Support-to-Content → Blog mode (write the briefs) → GEO Optimize → Content Audit.
- After generating briefs, optionally run **Keyword Research mode** to validate that discovered topics have search volume before committing to full articles.

**When the user wants to edit, restructure, or tighten an existing draft:**
- Use **Edit Article mode** to map sections as a DAG, confirm the order with the user, and rewrite each section for clarity and tight prose.
- Natural pipeline: Blog mode → Edit Article (structural pass) → Humanize (voice pass) → Content Audit (quality gate).
- Use Edit Article mode instead of Content Refresh mode when the goal is clarity and structure, not SEO freshness or updating outdated facts.
