# Research Synthesis

Load this overlay when the work uses interviews, surveys, support tickets, call
notes, usability sessions, CRM notes, open-ended feedback, or mixed qualitative
and quantitative evidence.

Use it to turn raw inputs into themes, segments, opportunity areas, and
recommendations that support a real decision.

## What This Overlay Accepts

- interview transcripts or notes
- survey data or survey summaries
- usability test notes
- support tickets or feedback exports
- call notes, CRM notes, and success-manager notes
- NPS or CSAT comments
- app store reviews
- mixed evidence from multiple sources

## Output Contract

When the user asks for a synthesis memo, use
`templates/research-synthesis-report.md`.

The default deliverable is:

1. study name, method, participant count, date range, and analyst
2. executive summary
3. key themes with prevalence, summary, evidence, and implication
4. insights-to-opportunities table
5. segments or meaningful splits
6. recommendations
7. open questions for further research
8. methodology notes and limitations

If the evidence is thin, keep the structure but reduce certainty and make the
gaps explicit.

## Working Method

### Thematic Analysis

Use this sequence:

1. familiarization
   - read all material end to end before coding
2. initial coding
   - tag each observation, quote, or data point with descriptive codes
3. theme development
   - group related codes into candidate themes
4. theme review
   - test whether each theme has enough evidence and a clear boundary
5. theme refinement
   - define each theme in 1-2 sentences
6. report
   - write up findings with supporting evidence

### Affinity Mapping

Use when the input is messy and observation-heavy:

1. one observation per note
2. cluster without pre-defining categories
3. label clusters clearly
4. split oversized clusters
5. preserve outliers instead of forcing fit

### Triangulation

Strengthen findings by combining:

- methodological triangulation
  - same question, different methods
- source triangulation
  - same method, different segments or participants
- temporal triangulation
  - the same issue across time

When sources disagree, treat that as signal. It may reveal segments, timing
effects, or a measurement problem.

## What To Extract

For each interview, ticket cluster, or note set, identify:

- `observations`
  - what the participant or customer did, experienced, or described
- `direct_quotes`
  - vivid evidence attributed by role or segment, not by private identity
- `behaviors_vs_preferences`
  - what they actually do versus what they say they want
- `signals_of_intensity`
  - emotional language, effort, frequency, and consequence
- `context`
  - who, when, where, how often, and under what constraints

After processing individual materials, identify:

- repeated patterns
- segment differences
- contradictions
- surprises that challenge prior assumptions

## Survey And Quant Rules

- check response rate and representativeness
- inspect distributions, not just averages
- segment responses before generalizing
- be cautious with small samples and tiny differences
- treat open-ended responses like mini interview notes

Common mistakes to avoid:

- reporting averages without distributions
- ignoring non-response bias
- over-interpreting small changes
- confusing correlation with causation

## Mixed-Method Synthesis

Use this loop:

1. qualitative evidence reveals what is happening and why
2. quantitative evidence sizes how many users and how much impact
3. follow-up qualitative work explains anomalies

When combining evidence:

- use quantitative data to prioritize qualitative findings
- use qualitative data to explain quantitative anomalies
- present combined evidence explicitly instead of implying false precision

## Opportunity Sizing

For each opportunity or problem area, estimate:

- users affected
- frequency
- severity
- evidence strength
- strategic alignment
- feasibility

Use ranges instead of false precision. Show the logic behind the estimate.

## Study Planning

When the request is for a study plan, produce:

1. research question
2. recommended method and why
3. participant criteria
4. sample size
5. guide or survey outline
6. timeline
7. synthesis plan
8. deliverables

Use these method defaults:

| Method | Best for | Typical sample | Typical timeline |
| --- | --- | --- | --- |
| User interviews | Deep needs and motivations | 5-8 | 2-4 weeks |
| Usability testing | Evaluating a specific flow or concept | 5-8 | 1-2 weeks |
| Surveys | Quantifying attitudes and preferences | 100+ | 1-2 weeks |
| Card sorting | Information architecture decisions | 15-30 | 1 week |
| Diary studies | Understanding behavior over time | 10-15 | 2-8 weeks |
| A/B testing | Comparing specific choices at scale | Significant traffic | 1-4 weeks |

## Judgment Rules

- a quote is evidence, not a finding
- behavior is usually stronger evidence than stated preference
- outliers matter when they reveal a different segment or context
- themes should emerge from the data, not from the stakeholder wish list
- if the evidence base is small or biased, say so explicitly
