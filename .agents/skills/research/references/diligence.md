# Diligence

Use this lane when the user is deciding whether to buy from, partner with,
integrate with, invest in, or otherwise depend on a company, product, or
market.

## Objective

Produce a directional decision:

- `go`
- `conditional go`
- `no-go`
- `needs more diligence`

Do not end with a pile of facts and no decision.

## Scope

Clarify:

- what decision is on the table
- what the company or asset is
- what type of diligence matters most
- who will read the output
- which risks are intolerable

Common diligence types:

- vendor diligence
- partner diligence
- product or platform diligence
- acquisition or investment diligence
- strategic market diligence

## Diligence Dimensions

Use these five default dimensions unless the user gives a better frame:

1. commercial viability
2. product and operational credibility
3. customer evidence and traction
4. team, concentration, or execution risk
5. structural risks, missing evidence, and unknowns

If legal, security, or financial review is essential but not fully covered by
the available evidence, say so explicitly rather than implying clean diligence.

## Source Stack

Prefer:

1. official site, product docs, pricing, and terms
2. customer references, case studies, integration docs, SLAs, and status pages
3. funding, hiring, press, and public statements
4. review sites and community sentiment
5. analyst or market context if it affects the decision

If there is no direct evidence on a critical dimension, mark the gap as a
diligence blocker.

## What To Extract

Capture:

- what the company claims
- how clearly the product appears scoped and credible
- proof of adoption or traction
- evidence of reliability or maturity
- likely dependency, switching, or concentration risk
- signs of execution quality or execution fragility
- what is still unverified

## Risk Scoring

Use this severity scale:

- `red` - material risk or blocker
- `yellow` - meaningful concern or uncertainty
- `green` - appears acceptable based on current evidence

Use this evidence scale:

- `strong` - direct or repeated evidence
- `moderate` - indirect but plausible evidence
- `weak` - thin, promotional, or inferred evidence

Never mark a finding `green` if the evidence is weak on a critical dimension.

## Mandatory Output

### 1. Executive summary

Include:

- the decision being supported
- your recommendation
- the 2-4 most material reasons

### 2. Diligence table

Use these columns:

| Dimension | Finding | Severity | Evidence strength | Why it matters | Follow-up |
| --- | --- | --- | --- | --- | --- |

### 3. Red flags

Always isolate:

- blockers
- missing evidence on critical areas
- concentration or single-point-of-failure risks
- claims that appear stronger than the proof behind them

### 4. Unknowns

Call out the unanswered questions that materially affect the recommendation.

### 5. Recommendation

Use one of:

- `go`
- `conditional go`
- `no-go`
- `needs more diligence`

Then list the exact next actions required to move the decision forward.

## Judgment Rules

- missing proof is itself a finding
- a polished website is not evidence of operational maturity
- if customer proof is thin, say so
- if switching cost or dependency risk looks high, make that explicit
- when evidence is incomplete, recommend conditional progress rather than fake certainty

## Recommended Close

End with:

1. decision
2. highest-severity risk
3. what evidence would change the recommendation
4. who should own the next diligence step
