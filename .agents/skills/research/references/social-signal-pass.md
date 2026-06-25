# Social Signal Pass

Load this overlay when current operator reaction, community sentiment, or
market discourse is a material input to the research question.

This overlay is about evidence class and collection discipline. It does not
replace the primary business-research lane. Treat social signal as corroboration
or gap-filler, not as ground truth.

## When To Load This Overlay

Load when the question has any of these characteristics:

- the decision depends on how practitioners or buyers actually perceive a
  product, vendor, category, or person — not just what they claim
- the brief asks for "what people are saying", "community reaction",
  "operator sentiment", "buzz", or "adoption friction"
- you need to validate or challenge promotional evidence with third-party
  discourse
- the competitor intelligence, diligence, or ICP lane needs a sentiment layer
  beyond review sites
- the account or person you are researching has a meaningful public presence
  that discourse platforms would surface

## Platform Routing

Route by where the evidence is likely to live.

### Reddit

Best for: practitioner frustration, workaround culture, comparison threads,
"I switched from X to Y because…", adoption blockers, job-to-be-done signals.

- find the 3-5 most relevant subreddits for the topic (product category,
  industry vertical, role, or tool ecosystem)
- search for the company name, product name, or category term
- prioritize threads with high comment counts or controversial flairs
- look for: pain complaints, workarounds, alternatives mentioned, positive
  advocates, repeated keywords

### X / Twitter

Best for: founder statements, launch reactions, practitioner takes, pricing
complaints, feature requests surfaced in the open.

- search for company `@handle`, product name, and competitors in parallel
- use `from:@handle` to get what the company or founder actually said
- look for: reply threads, quote-tweets with critique, recency-weighted by
  engagement

### Hacker News

Best for: technical practitioners, "Show HN" launches, deep critique of
architectures, pricing or business-model commentary, honest teardowns.

- search `site:news.ycombinator.com "{company}"` or `"{product}"` or
  `"{category}"` via WebSearch or available HN search tool
- look for: top-comment arguments, founder replies, sentiment in thread titles
- threads with 50+ comments are usually high-signal

### YouTube

Best for: product walkthroughs and reviews from independent creators, tutorial
gaps revealing friction, comparison videos surfacing positioning weaknesses,
developer or practitioner channel commentary.

- search for product name plus "review", "tutorial", "vs", or "walkthrough"
- check view count and publish date — prefer recent high-engagement videos
- skim the comment section for recurring complaints or praise

### GitHub

Best for: open-source projects or products with a public repo — issues reveal
real blockers, discussions reveal practitioner workarounds, star growth
indicates momentum.

- check the repo's Issues tab for frequency of specific complaint types
- check Discussions for "how do I" patterns that reveal adoption friction
- check Stars over time via GitHub API or public tools for momentum signal

## Collection Discipline

Run a decomposed pass — do not use one broad query and accept the noise.

1. decompose the research question into 3-5 targeted sub-queries
   - direct mentions and branded queries
   - pain point or complaint queries ("X not working", "X pricing too high")
   - comparison queries ("X vs Y", "switched from X")
   - praise or advocacy queries ("X great for…", "why I use X")
   - category or job-to-be-done queries where the product is unnamed

2. run each sub-query on the most relevant 1-2 platforms
3. refine noisy queries — if results are junk, rephrase before accepting them
4. follow high-signal threads into linked primary sources
5. stop when the marginal new result is not changing the picture

## Synthesis Rules

Synthesize by theme, not by platform or query.

- group signals into: adoption friction, praise or advocacy, feature gaps,
  comparison perception, pricing reaction, trust concerns, workaround culture
- note whether a theme is isolated or cross-platform
- separate high-frequency signals from one-off outliers
- flag contradictions between platform signals (e.g., Reddit loves it but X
  practitioners complain about pricing)
- preserve contradiction until synthesis — do not average it away

## Evidence Capture

For each signal captured, record:

- `platform` — Reddit, X, HN, YouTube, GitHub
- `source` — specific subreddit, thread URL, handle, video URL, or issue link
- `signal_type` — pain, praise, comparison, workaround, skepticism, or neutral
- `observed_at` — approximate date if visible
- `quote_or_summary` — verbatim where useful, paraphrased otherwise
- `engagement` — upvotes, comments, likes, or view count where available
- `why_it_matters` — what decision dimension this affects

## What Social Signal Cannot Do

- It cannot substitute for primary evidence about features, pricing, or
  capabilities.
- It cannot establish whether a claim is contractually or technically accurate.
- Discourse platforms oversample loud voices. High volume ≠ representative.
- Recency bias is real. A recent Reddit post does not mean a historic pattern.
- Adversarial commentary (planted reviews, competitor astroturfing) exists.
  Look for cross-platform corroboration before treating strong sentiment as
  definitive.

## Failure Modes

- treating a single upvoted thread as representative community consensus
- running one generic search and calling it a discourse pass
- synthesizing by platform or query instead of by theme
- blending social signal and primary evidence without labeling the difference
- quoting practitioners without capturing publication date
- using social signal to construct certainty where primary evidence is missing
