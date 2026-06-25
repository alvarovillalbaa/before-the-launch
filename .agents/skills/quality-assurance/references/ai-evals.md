# AI Evals Reference

Traditional testing is deterministic: given input X, expect output Y. LLM-based systems are nondeterministic — the same prompt can produce different outputs. **Evals** are structured tests that measure AI system performance despite this variability.

> Source: OpenAI Evals documentation — https://github.com/openai/evals

---

## When to use evals (not unit tests)

Add an eval whenever a system prompt, tool call, agent handoff, RAG retrieval, or LLM output is part of the behavior under test. Deterministic code paths (parsers, formatters, business logic) still get unit/integration tests.

| Behavior | Test type |
|----------|-----------|
| JSON parser that extracts order ID | Unit test |
| LLM that categorizes the order intent | Eval |
| Tool selection in an agent | Eval |
| Agent handoff from triage to order agent | Eval |
| Database query that fetches order details | Integration test |
| Full checkout flow (user → LLM → DB → response) | E2E + eval |

---

## Eval types

### Metric-based evals
Quantitative, automated, fast. Use as regression gates in CI.

- **Exact / string match** — output equals expected label exactly
- **ROUGE / BLEU** — n-gram overlap for summarization tasks
- **BERTScore** — semantic similarity for paraphrase-tolerant tasks
- **Function call accuracy** — tool was selected and called with correct args
- **Executable evals** — run generated code or SQL and check behavior

**Limitations:** May miss nuance; over-relying on BLEU/ROUGE for open-ended generation is an anti-pattern.

### Human evals
Highest quality, slowest and most expensive.

- Blinded pairwise ranking by domain experts
- Score 1–5 with anchor examples at each level
- Include pass/fail threshold in addition to the numerical score
- Aggregate multiple reviewers by consensus vote

### LLM-as-judge (model graders)
Cheaper and more scalable than human evals. Strong models (o3, GPT-4.1) achieve >80% agreement with human raters.

**Grader patterns:**
- **Pairwise comparison** — present two responses, ask which is better against a rubric
- **Single answer grading** — score one response in isolation against predefined criteria
- **Reference-guided grading** — compare response to a gold-standard answer

**Best practices:**
- Use pairwise or pass/fail for reliability; avoid raw 1–10 scores without anchors
- Use the most capable model as judge (o3 or equivalent)
- Add chain-of-thought reasoning *before* the score — it improves eval accuracy
- Control for verbosity bias (LLMs prefer longer responses in general)
- Calibrate LLM judge against a human-labeled holdout set before scaling

---

## Eval design process

1. **Define eval objective** — what is the success criterion? (e.g., "model returns correct category for 95% of tickets")
2. **Collect dataset** — mix of: production data, domain expert labels, synthetic edge cases, historical logs. Use o3/GPT-4.1 to generate diverse edge cases including adversarial inputs.
3. **Define eval metrics** — choose grader(s) that directly measure the objective (not a proxy like perplexity)
4. **Run and compare** — iterate prompts, models, and configurations against the same eval set
5. **Continuously evaluate (CE)** — run evals on every change, monitor for new failure modes, grow the eval set over time

---

## Architecture-matched eval strategies

### Single-turn interactions
| Nondeterminism source | What to eval | Example question |
|---|---|---|
| Developer + user inputs | Instruction following | Does the model stay focused despite an off-topic user prompt? |
| Model output | Functional correctness | Does the classification match the expected label? |

### Workflow (chained model calls)
Eval each step in isolation. Focus: per-step accuracy and end-to-end correctness of the final response.

### Single-agent (tool-using agent)
| Nondeterminism source | What to eval |
|---|---|
| Inputs | Instruction following |
| Outputs | Functional correctness |
| Tool selection | Does the agent invoke the correct tool? |
| Tool arguments | Are arguments extracted correctly from conversation history? |

### Multi-agent (handoffs between specialized agents)
Adds one new source of nondeterminism on top of single-agent:

| Nondeterminism source | What to eval |
|---|---|
| Agent handoff | Does the triage agent route to the correct downstream agent? |
| Circular handoffs | Does the system recover gracefully from A → B → A loops? |

> Start with a single-agent architecture and let evals drive the decision to move to multi-agent. Multi-agent adds complexity — only adopt it when evals show a single agent struggling.

---

## Edge case categories

**Input variability**
- Non-English or multilingual inputs
- Non-text formats (JSON, XML, Markdown, CSV)
- Different input modalities (images, audio)

**Contextual complexity**
- Multiple questions or intents in one request
- Typos, misspellings, or abbreviations
- Minimal context (e.g., user says only "returns")
- Long-running conversations or very long context
- Ambiguous tool call arguments (e.g., `"on: 123"` as an order number)

**Personalization and jailbreak**
- Jailbreak attempts to override system behavior
- Formatting override requests ("respond in JSON only")
- Conflicting user prompt vs. system prompt

---

## OpenAI Evals API quickstart

```typescript
// 1. Create an eval with a data schema and grader
const evalObj = await openai.evals.create({
  name: "IT Ticket Categorization",
  data_source_config: {
    type: "custom",
    item_schema: {
      type: "object",
      properties: {
        ticket_text: { type: "string" },
        correct_label: { type: "string" },
      },
      required: ["ticket_text", "correct_label"],
    },
    include_sample_schema: true,
  },
  testing_criteria: [
    {
      type: "string_check",
      name: "Match output to human label",
      input: "{{ sample.output_text }}",
      operation: "eq",
      reference: "{{ item.correct_label }}",
    },
  ],
});

// 2. Upload test data (JSONL format)
// { "item": { "ticket_text": "My monitor won't turn on!", "correct_label": "Hardware" } }
const file = await openai.files.create({
  file: fs.createReadStream("tickets.jsonl"),
  purpose: "evals",
});

// 3. Create an eval run with your prompt
const run = await openai.evals.runs.create(evalObj.id, {
  name: "Categorization run v1",
  data_source: {
    type: "responses",
    model: "gpt-4.1",
    input_messages: {
      type: "template",
      template: [
        { role: "developer", content: "Categorize the ticket into Hardware, Software, or Other. Respond with one word." },
        { role: "user", content: "{{ item.ticket_text }}" },
      ],
    },
    source: { type: "file_id", id: file.id },
  },
});
// run.report_url → view results in OpenAI dashboard
```

**JSONL dataset format:**
```jsonl
{ "item": { "ticket_text": "My monitor won't turn on!", "correct_label": "Hardware" } }
{ "item": { "ticket_text": "I'm in vim and I can't quit!", "correct_label": "Software" } }
{ "item": { "ticket_text": "Best restaurants in Cleveland?", "correct_label": "Other" } }
```

**Retrieve run status:**
```typescript
const run = await openai.evals.runs.retrieve(runId, { eval_id: evalId });
// run.result_counts: { total, passed, failed, errored }
// run.per_testing_criteria_results: [...{ testing_criteria, passed, failed }]
```

---

## Continuous evaluation (CE)

- Run evals in CI on every PR that touches prompts, model config, or agent logic
- Set pass-rate thresholds as merge gates (e.g., "≥95% of cases must pass")
- Subscribe to `eval.run.succeeded` / `eval.run.failed` webhooks for async notification
- Grow the eval set over time: every production failure is a new eval case
- Use production logs to mine for new edge cases and nondeterminism patterns

---

## Anti-patterns

| Anti-pattern | Why it fails |
|---|---|
| "Vibe-based evals" — it seems like it's working | No measurement, no regression safety |
| Biased dataset — only happy-path examples | Misses real production distribution |
| Over-relying on BLEU/perplexity | Poor proxy for task-specific quality |
| Ignoring human calibration | LLM judge drift goes undetected |
| Single eval score without human spot-checks | Scores can look good while quality degrades |
| Eval set that never grows | Old cases miss newly discovered failure modes |

---

## Integrating evals into the test pyramid

For AI systems, extend the standard pyramid with two additional layers:

```
                    ┌──────────────────────┐
                    │   Human / Red-team   │  (manual, periodic)
                    ├──────────────────────┤
                    │  E2E agent workflows │  (Playwright + eval assertions)
                    ├──────────────────────┤
                    │   Offline AI evals   │  (LLM-as-judge, PromptFoo, Ragas, OpenAI Evals API)
                    ├──────────────────────┤
                    │  Contract / Integr.  │  (test DB, schema contracts, tool call validation)
                    ├──────────────────────┤
                    │   Deterministic unit │  (pure functions, parsers, formatters)
                    └──────────────────────┘
```

**Tools:** PromptFoo, Ragas, DeepEval, OpenAI Evals API — all viable for the offline eval layer. Choose based on your model provider and infrastructure.
