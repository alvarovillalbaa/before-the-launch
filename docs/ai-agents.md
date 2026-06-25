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

All source text is prompt-injection-aware: it is included as untrusted evidence and the prompt tells the model never to follow instructions found inside sources.
