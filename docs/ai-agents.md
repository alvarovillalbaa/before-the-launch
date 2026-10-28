# AI Agents

Agents are configurable persona records stored in the database. UI copy is not hardcoded into the screens.

## Default Personas

- Budget-conscious buyer
- Excited early adopter
- Skeptical technical evaluator
- Enterprise security/compliance reviewer
- Category expert
- Competitor-aware buyer
- Product-led growth user
- Sales-led economic buyer
- Reviewer/influencer
- Support/implementation owner

## Output Contract

Each agent returns structured JSON validated by Zod:

- perceived value score
- clarity score
- differentiation score
- urgency score
- trust score
- adoption likelihood
- price sensitivity
- likely objections
- likely positive comments
- confusing claims
- missing proof
- best quote
- worst quote
- recommendation
- confidence
- evidence references

## Engines

`SIMULATION_ENGINE=fake` uses deterministic local scoring. `SIMULATION_ENGINE=gateway` uses Vercel AI SDK v6 structured output through AI Gateway. `SIMULATION_ENGINE=auto` chooses Gateway only when credentials exist.

Each execution captures a frozen context from the saved run's `targetMarket` before updating progress. Both engines and the existing Gateway-to-fake fallback receive that same context. The selected market is the operator's evaluation audience, not an imported product fact: missing or conflicting `briefSnapshot.market` stays unchanged, and selecting a market does not create source evidence. Gateway instructions state this distinction explicitly. The context trace and generated Markdown report identify the operator-selected market.

Fake output includes the market in its deterministic seed and labels it in the recommendation. This is synthetic demo variation, not validated market-fit reasoning; changing markets need not change every score. Existing depth and budget fields gain no new execution semantics from this repair. Previously saved reports and findings are not rewritten. See the [source receipt](results/2026/10-28/target-market.md) and [unexecuted focused check proposal](proposals/target-market-checks.md).

All source text is prompt-injection-aware: it is included as untrusted evidence and the prompt tells the model never to follow instructions found inside sources.
