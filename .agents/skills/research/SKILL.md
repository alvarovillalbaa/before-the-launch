---
name: research
description: >-
  Business research for competitor intelligence, diligence, ICP research,
  account research, customer research, prospect enrichment, and evidence
  synthesis. Use when Codex needs to turn an ambiguous business question,
  target list, customer issue, interview set, or public-web trail into a
  scoped brief, comparison, ranked queue, customer-safe answer, or
  recommendation with dated evidence, explicit confidence, visible decision
  logic, and clear next actions. Also use for public-web company or people
  discovery, account or lead list building, expert-finding, financial filing
  retrieval, research-paper discovery, practitioner-blog or portfolio research,
  and community or market sentiment research when the answer must stay
  evidence-backed. Run short iterative research loops, not a one-shot source
  dump.
---

# Research

Turn ambiguity into a decision artifact. Run short explicit research loops. Do
not produce a search dump.

Default to one primary lane. Add overlays only when they materially improve the
answer.

## Output Contract (Read Before Synthesizing)

Every citation in the final artifact must be an inline markdown link `[name](url)`.
Never emit a trailing `Sources:` or `References:` block. Never emit raw URLs.
If a source genuinely has no URL, fall back to plain text for that one item only.

- **Good:** `per [r/devops](https://reddit.com/r/devops)`,
  `per [TechCrunch](https://techcrunch.com/…)`
- **Bad (raw URL):** `per https://techcrunch.com/…`
- **Bad (plain name when URL exists):** `per TechCrunch`
- **Bad (trailing block):** `Sources:\n- TechCrunch\n- Reddit`

Do a post-synthesis self-check before finalizing any artifact. Scan for:

1. trailing `Sources:` / `References:` / `Citations:` blocks — delete them
2. claims that lack a date where freshness matters — add `(as of YYYY-MM)` or
   downgrade confidence
3. inference presented as directly observed fact — label it explicitly
4. a ranking or score without visible logic — add the logic or remove the rank
5. an artifact that ends without a recommendation, constraint, or next action —
   add one

## Query Quality Pre-Flight

Before building the source plan, check for these traps:

- **Keyword trap.** A query like "sales tools" or "AI" is too broad to route to
  a useful lane. Reframe by asking: what decision does this support? For which
  buyer, segment, or account?
- **False freshness request.** The user says "recent" but the actual decision
  does not require fresh evidence (e.g., "recent history of CRM pricing models"
  only needs the last major shift). Calibrate the freshness window to the
  decision, not the word "recent."
- **Scope mismatch.** The brief says "research this company" but the actual need
  is "prepare for a meeting with their head of engineering." Narrow the scope
  before sourcing.

If the brief has a keyword trap or scope mismatch, ask one clarifying question
before starting. Do not research a badly framed question and then apologize
afterward.

## Operating Pattern

Use this default loop:

1. run the query quality pre-flight
2. parse the brief
3. choose the lane and artifact
4. build the minimum credible source plan
5. run a direct-evidence pass
6. run one targeted gap-closing pass
7. synthesize the answer or recommendation
8. run a reviewer pass and repair only the weakest dimension once
9. run the post-synthesis self-check from the Output Contract

Keep a compact working ledger while researching. At minimum, track:

- `claim_or_fact`
- `source`
- `source_type`
- `published_or_observed_at`
- `why_it_matters`
- `confidence_or_gap`

Do not keep browsing just because more information exists. Stop when the
decision is answerable, the evidence is fresh enough, and the review pass has
no blocker. If one targeted repair pass still leaves critical gaps, downgrade
confidence and say exactly what is missing.

## Route The Job

Pick one primary lane before sourcing:

- `competitor intelligence`
  - compare vendors, products, positioning, pricing, proof points, launches,
    or weaknesses
  - read `references/competitor-intelligence.md`

- `diligence`
  - support a buy, partner, invest, renew, or vendor-risk decision
  - read `references/diligence.md`

- `ICP research`
  - define segments, titles, triggers, exclusions, and account filters
  - read `references/icp-research.md`

- `account research`
  - prepare for outreach, meetings, prioritization, or account planning
  - read `references/account-research.md`

- `customer research`
  - answer a customer or account question with evidence and caveats
  - read `references/customer-research.md`

Load these overlays in addition to the primary lane when needed:

- `references/research-synthesis.md`
  - interviews, surveys, support tickets, usability notes, CRM notes, call
    transcripts, open-ended feedback, behavioral data, or study planning

- `references/prospect-enrichment-and-qualification.md`
  - email or domain enrichment, company-first lead research, inbound triage,
    follow-up ranking, or pain-point matching to a product context

- `references/web-research-collection.md`
  - current public-web evidence, multi-page site extraction, or reproducible
    collection using a crawl or scrape tool

- `references/exa-advanced-search-categories.md`
  - when Exa MCP tools are available and the job needs public-web company or
    people discovery, LinkedIn or public-bio lookup, company-list building,
    financial filings, research papers, independent practitioner writing, or
    structured lead generation at scale

- `references/social-signal-pass.md`
  - when current community reaction, operator sentiment, or market discourse
    is a material input — covering Reddit, X, Hacker News, YouTube, and
    GitHub as primary signal sources
  - load when the brief mentions "what people are saying", "community
    reaction", "practitioner sentiment", "adoption friction", or "buzz"
  - also add as a layer to competitor intelligence when promotional evidence
    needs third-party discourse corroboration

Do not blur lanes unless the actual decision spans them.

## Intake Contract

Establish these before deep research:

1. `decision_or_question`
2. `entity_or_scope`
3. `audience`
4. `internal_or_external`
5. `freshness_requirement`
6. `artifact`

If one field is missing, infer the most likely assumption and state it. Ask
only the minimum questions needed to avoid researching the wrong thing.

At minimum, the brief must contain:

- a subject, company, market, segment, customer issue, or target universe
- a practical decision, use case, or answerable question

## Request Shapes

Classify the job before sourcing. Use the smallest artifact that fits.

- `rapid brief`
  - one focused market, company, account, or segment question

- `comparison`
  - competitors, vendors, segments, or options

- `ranked universe`
  - targets, leads, accounts, risks, or opportunities

- `recommendation memo`
  - go or no-go style decision support

- `account brief`
  - compact pre-outreach, pre-meeting, or pre-prioritization brief

- `enrichment brief`
  - company-first brief from an email, domain, company name, or sparse lead row

- `people slate`
  - shortlist of people, experts, buyers, champions, or candidate profiles

- `follow-up queue`
  - ranked queue with explicit `hot`, `warm`, `cold`, or `spam` buckets

- `customer answer`
  - customer-safe answer with caveats and evidence

- `study plan`
  - research plan, interview guide, survey, or method recommendation

- `synthesis memo`
  - themes, contradictions, segments, and opportunity areas from mixed
    evidence

## Artifact Requirements

Every final artifact must contain:

- the direct answer, recommendation, or ranking first
- the visible logic behind that answer
- dated evidence for important time-sensitive claims
- confidence, caveats, and unresolved unknowns
- an exact next action, decision constraint, or escalation path

Keep the working ledger out of the main answer unless it helps the user audit a
specific claim. Use it to make the logic visible, not to flood the output.

## Execution Protocol

### 1. Pre-Flight And Parse The Brief

Capture:

- `objective`
- `primary_lane`
- `request_shape`
- `entities`
- `geography`
- `timeframe`
- `must_include`
- `must_exclude`
- `available_materials`

Also capture lane-specific details:

- ICP work: industry, size, stage, geography, tech stack, triggers, excluded
  segments, titles, committee roles, desired list size, and required
  enrichments if the output will feed prospecting
- account work: target company or person, meeting or outreach goal, known
  relationship context, buying roles of interest, and whether company
  discovery, people discovery, or both are needed
- enrichment work: input type, normalized company, channel, product context,
  scoring rules, disqualifiers, desired count, export format, and excluded
  companies or people
- customer work: customer question, workflow or issue, account context,
  blockers, and whether the answer can be shared externally
- synthesis work: research question, methods already used, participant or
  segment coverage, source materials, and deliverable expectations

### 2. Build A Source Plan

Choose the minimum credible source set for the decision.

Preferred source order:

1. direct sources
   - company sites, docs, pricing, product artifacts, tickets, call notes, CRM
     history, internal documents, first-party statements
2. high-quality secondary sources
   - trusted press, review sites, analyst notes, public datasets, industry
     reports
3. tertiary summaries
   - only when they point to stronger evidence

When Exa MCP tools are available and the task is public-web company or people
discovery, filing retrieval, research-paper search, or independent-blog or
portfolio discovery, load `references/exa-advanced-search-categories.md` and
use its category, filter, query-variation, and structured-output rules instead
of inventing a fresh search pattern mid-task.

If the evidence class is already obvious, route narrowly before widening:

1. `category: "research paper"` for academic papers, arXiv preprints,
   scientific methods, benchmarks, or literature review support
2. `category: "financial report"` for SEC filings, earnings reports, annual
   reports, investor decks, risk factors, or reporting-period evidence
3. `category: "personal site"` for practitioner blogs, portfolios, about
   pages, tutorials, and independent analysis
4. `category: "company"` or `category: "people"` for entity discovery and
   profile finding
5. `category: "news"` or uncategorized search for freshness, momentum, or
   cross-source context

If public-web evidence is required and a collection tool exists, use the
lightest collection mode that can answer the question:

1. search when no URL exists yet
2. search plus scrape when discovery and capture should happen together
3. scrape when the URL is known
4. map plus scrape when the site is known but the exact page is not
5. crawl only when many pages from a bounded site section are required
6. interact only when clicks, forms, pagination, or rendering block static
   capture

If current operator or market reaction matters, load
`references/social-signal-pass.md` and run a targeted discourse pass after
the direct-source pass. The reference file defines platform routing (Reddit,
X, HN, YouTube, GitHub), query decomposition into 3-5 targeted sub-queries,
synthesis-by-theme rules, and the specific failure modes to avoid.

Treat discourse as signal, not ground truth.

### 3. Gather Evidence

Normalize every captured item into:

- `entity`
- `claim_or_fact`
- `source`
- `source_type`
- `published_or_observed_at`
- `context`
- `why_it_matters`

For qualitative or mixed evidence, also capture:

- `observation`
- `quote_or_signal`
- `behavior_vs_stated_preference`
- `frequency_or_prevalence`
- `contradictions`

For enrichment or qualification work, also capture:

- `normalized_company`
- `company_description`
- `recent_activity`
- `momentum_signals`
- `key_people`
- `stack_or_environment_clues`
- `likely_pain_points`
- `outreach_hooks`
- `score_inputs`

Do not interpret too early. Stabilize the facts before synthesizing.

### 4. Run A Gap-Closing Pass

After the first evidence pass, identify the 1-3 missing dimensions that still
block the decision.

Common blockers:

- freshness is too weak
- comparison rows are not like-for-like
- the answer is still mostly promotional or anecdotal
- a customer-safe claim lacks direct support
- the ranking logic is missing one decisive input

Research only those blockers. Do not restart the whole project. If the gaps
remain after this pass, mark the evidence as limited and proceed with the
appropriate caveats.

### 5. Check Evidence Sufficiency

Use `rich evidence` when:

- key decision dimensions have direct support
- comparisons are like-for-like
- freshness needs are satisfied
- customer or account answers are source-backed

Use `limited evidence` when:

- key decision dimensions are missing
- claims are mostly promotional, indirect, or anecdotal
- evidence is stale for the question
- account or customer context is incomplete or contradictory

If evidence is limited, downgrade the artifact. Do not simulate certainty.

### 6. Compare, Score, Or Answer

Use explicit labels:

- fit labels: `Strong`, `Good`, `Partial`
- answer confidence: `High`, `Medium`, `Low`, `Unable to determine`
- lead priority: `hot`, `warm`, `cold`, `spam`

Always show what drives the ranking or confidence.

### 7. Synthesize

Every major finding should include:

- what appears true
- the evidence behind it
- confidence
- why it matters

When the materials are qualitative or mixed:

1. code observations before collapsing them into conclusions
2. group related codes into themes
3. note prevalence, segment differences, and outliers
4. separate behaviors from stated preferences
5. preserve contradictions until synthesis
6. triangulate across methods where possible

### 8. Run The Review Panel

Before finalizing, run one self-review pass using these lenses:

1. `decision owner`
   - does this answer the actual business decision or customer question
2. `skeptic`
   - which claims are inferred, stale, or still weakly supported
3. `source auditor`
   - are key claims dated, attributable, and like-for-like
4. `external-safety reviewer`
   - what cannot safely be said to a customer or prospect yet
5. `operator`
   - what should someone do next Monday morning

Check these dimensions:

- `decision_fit`
- `evidence_strength`
- `freshness`
- `caveat_discipline`
- `actionability`

Label each dimension:

- `pass`
  - ready to ship
- `tighten`
  - repair before finalizing
- `block`
  - unsafe or too weak to present as-is

Repair only the weakest dimension once. If a blocker remains after repair,
state the blocker plainly and downgrade the recommendation or answer.

### 9. Present The Artifact

Only include sections the evidence supports. Omit empty sections.

Use these default output shapes:

- `comparison`
  - question and scope
  - matrix or evidence table
  - implications, risks, and unknowns
  - recommendation
  - next actions

- `ranked universe`
  - use a ranked table with `Rank`, `Item`, `Why it matches or matters`,
    `Evidence`, `Confidence`, `Next step`

- `account brief`
  - use `templates/account-enrichment-brief.md`

- `people slate`
  - use a ranked table with `Rank`, `Person`, `Current role or company`, `Why
    they match`, `Evidence`, `Confidence`, `Next step`

- `follow-up queue`
  - use `templates/lead-follow-up-queue.md`

- `synthesis memo`
  - use `templates/research-synthesis-report.md`

- `study plan`
  - research question and decision
  - recommended method and why
  - participant or sample plan
  - guide or survey outline
  - timeline and deliverables
  - synthesis plan

- `customer answer`
  - direct answer
  - confidence and caveats
  - supporting evidence
  - account-specific implications or blockers
  - recommendation, workaround, or escalation path

When the evidence is thin, use a limited-evidence note:

1. question and scope
2. what was found
3. what is still missing
4. provisional read or decision constraint
5. exact next research steps

## Non-Negotiables

- Do not produce a source dump.
- Date-stamp time-sensitive claims.
- Distinguish observed facts from inference.
- Prefer primary evidence over commentary about that evidence.
- Preserve contradictions until synthesis instead of flattening them away.
- Do not rank items without visible logic.
- Do not present an external-safe answer unless the evidence supports it.
- Do not run more than one unfocused extra research pass.
- End with a recommendation, a decision constraint, or an exact next action.

## Minimum Clarification Rules

If you need only one or two questions, use these:

- What decision or customer question should this research support?
- Which geography, segment, account, or timeframe matters most?
- Do you want a brief, matrix, ranked list, answer, study plan, or
  recommendation memo?
- If this is prospecting or inbound triage, what counts as a strong signal and
  what counts as disqualifying noise?

Avoid long setup interviews. If a sensible assumption still produces useful
work, proceed and label it.

## Failure Modes To Avoid

- answering a different business question than the one the user actually has
- collecting sources without converting them into a decision or answer
- mixing stale and fresh evidence without saying so
- forcing confidence where evidence is thin
- presenting inference as customer-safe fact
- repairing every weakness at once instead of the one blocking the artifact
- keeping template sections that the evidence does not support
- ending with "it depends" when a directional recommendation is possible

### Named Antipatterns

These specific failure modes have recurred. Know them by name.

**Source dump without synthesis.** Running 10 searches, pasting snippets, and
calling it a brief. The output contract requires a decision artifact with visible
logic, not a reading list.

**Confidence collapse.** Every claim marked "medium" or "low" confidence because
the researcher is hedging instead of distinguishing what is well-supported from
what is thin. Strong claims with good primary evidence deserve `High` confidence.

**Stale-fresh blend.** Mixing a 2022 pricing page with a 2025 press release in
the same evidence row without labeling the date gap. Always date-stamp
time-sensitive claims.

**Inference laundering.** Summarizing a marketing page and presenting it as an
independent finding. Primary sources describe themselves; they are not neutral
evidence about themselves. Label the source type.

**Discourse-as-ground-truth.** Treating one upvoted Reddit thread as
representative consensus. Social signal is corroboration, not primary evidence.
Always cross-platform corroborate before elevating a community signal.

**Missing-the-actual-question.** Producing a thorough piece about the company
when the user asked about a specific product feature, a specific competitor, or
a specific decision. Parse the `decision_or_question` from the intake contract
before sourcing.

**Endless gap-closing.** Running five research passes because "more information
exists." The loop is capped: one gap-closing pass, then downgrade confidence
and proceed. Research debt is acceptable; infinite loops are not.

## Quality Bar

- The primary lane is explicit.
- The request shape is explicit.
- The decision or question is explicit.
- The relevant overlays are explicit.
- The source plan matches the job.
- The working ledger can explain any important claim.
- The evidence mode is explicit when data is thin or stale.
- Important claims are source-backed and date-aware.
- Ranking logic is visible when ranking is used.
- Confidence, caveats, and unknowns are explicit.
- The review pass finds no unresolved blocker.
- The output ends with a recommendation, a decision constraint, or an exact
  next action.
