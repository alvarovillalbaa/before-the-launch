# Example: Research Synthesis

**Method:** Mixed interviews plus support-ticket review  
**Participants:** 9 interviews, 63 support tickets  
**Date Range:** 2026-03-01 to 2026-04-15  
**Analyst:** business-ops research

## Executive Summary

- Mid-market RevOps users consistently struggle with workflow visibility during
  handoffs. Interviews show the issue as coordination friction, while tickets
  show it as reporting and ownership confusion.
- The problem is widespread enough to prioritize, but the evidence suggests two
  different segments: operators who want auditability and managers who want
  faster exception handling.
- The strongest near-term opportunity is better handoff tracking and clearer
  ownership views rather than a broad automation expansion.

## Key Themes

### Theme 1: Handoffs Break Because Ownership Is Implicit

- **Prevalence:** 7 of 9 interview participants and 21 of 63 tickets
- **Summary:** Teams assume the next owner is obvious, but exceptions and edge
  cases make the workflow ambiguous.
- **Supporting Evidence:**
  - "We only notice the miss when the customer follows up again." - Customer
    success manager
  - Ticket cluster: repeated requests for visibility into who owns the next
    step after approvals
- **Implication:** Workflow automation alone will not solve the problem without
  explicit ownership and visibility.

### Theme 2: Reporting Delays Hide Operational Risk

- **Prevalence:** 5 of 9 interview participants and 18 of 63 tickets
- **Summary:** Teams can recover from manual work, but they cannot recover
  quickly from delayed or fragmented reporting.
- **Supporting Evidence:**
  - "The process is annoying, but the real issue is that leadership sees the
    miss a week later." - RevOps lead
  - Ticket cluster: requests for faster exception reporting and delayed
    notifications
- **Implication:** Faster exception reporting may create more value than adding
  another automation branch.

## Insights To Opportunities

| Insight | Opportunity | Impact | Effort | Confidence |
| --- | --- | --- | --- | --- |
| Ownership is unclear at handoff points | Add explicit owner states and handoff checkpoints | High | Med | High |
| Reporting delays hide misses until they escalate | Add exception alerts and manager views | High | Med | High |
| Managers and operators have different needs | Split reporting by operator workflow vs manager oversight | Med | Med | Medium |

## Segments Or Meaningful Splits

| Segment | Characteristics | Needs | Size Or Prevalence |
| --- | --- | --- | --- |
| Operators | Live in the workflow daily | Clear ownership, fewer manual checks | Majority of interviews |
| Managers | Review exceptions and trends | Faster reporting, easier escalation visibility | Smaller but higher influence |

## Recommendations

1. **Prioritize explicit handoff ownership** - this is the most repeated pain
   point across interviews and tickets.
2. **Add exception reporting before expanding automation scope** - delayed
   detection appears more damaging than manual effort.
3. **Test segment-specific views** - operator and manager needs are related but
   not identical.

## Questions For Further Research

- How often do missed handoffs lead to customer-visible delay?
- Which segment is most willing to change workflow to gain visibility?

## Methodology Notes

- Data sources used: interview notes, ticket export, and account-manager call
  summaries
- Important limitations or biases: support-ticket data over-represents active
  escalations
- Evidence strength: medium to high for workflow friction, medium for exact
  segment sizing
