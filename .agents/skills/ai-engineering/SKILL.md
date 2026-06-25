---
name: ai-engineering
description: >-
  Use for AI and agent engineering work: system prompt design, tool call
  architecture, context engineering, memory and learning systems, multi-agent
  coordination, evals and regression gates, fine-tuning pipelines, RAG, vector
  stores (TurboPuffer/Pinecone/Azure), agent governance and safety, run
  steering, skill packages, prompt engineering patterns, constrained generation,
  ML pipelines, data engineering, and production AI infrastructure.
---

# AI Engineering

Production-grade guidance for building AI agents, LLM systems, and data infrastructure. This skill covers the full AI engineering stack: from system prompt architecture to eval gates, from memory systems to fine-tuning pipelines, from RAG to multi-agent coordination.

## Start Here

1. Identify the domain of your task using the **Workflow Router** below — load only relevant reference files.
2. For agent or prompt work: start with the system prompt architecture and tool design references before writing any prompt copy.
3. For quality and reliability: the eval system reference is required reading before shipping any agent capability change.
4. For data pipeline work: choose the processing model first (batch vs streaming, warehouse vs lakehouse).
5. Use `templates/` for copy-paste starting points — system prompts and eval contracts have templates.
6. Scripts in `scripts/` handle common operations; do not write boilerplate from scratch.

## Core Rules

### Agent Engineering
- System prompts are code. Version-control them. Eval-gate every change.
- Tool descriptions are the highest-leverage surface in agent design. Apply the Intern Test before shipping.
- Assign a persistence policy to every tool. Unmanaged tool output is the primary cause of context bloat.
- Every tool mutation must have a confirmation policy. Default to `always_ask` for writes.
- Memory tiers are not optional. Separate working_context / run_memory / cross_run_memory explicitly.
- Guardrails must rank by enforcement mechanism: guardrail service > prompt denial > confirmation gate > preference.
- Every confirmed production failure mode must have an eval case before the fix is merged.

### Context Engineering
- Context quality is an input-control problem, not a prompt-length problem.
- Fix distractor injection before extending reasoning chains.
- Hard constraints must survive every compaction pass.
- Tagger routing should be validated with eval cases, not assumed correct.

### Evals & Quality
- Small trusted eval suite > large untrusted suite. 10 well-maintained cases > 100 stale ones.
- `hard_fail` blocks CI. `soft_fail` warns. Use `hard_fail` for groundedness, safety, and policy violations.
- Fine-tune only after eval-scoring training data. The pipeline tier (0-20/20-40/40-60/60-100) ensures data quality.
- Run evals before and after every prompt change. Delta score is the signal; absolute score is not.

### Data Engineering
- Prefer incremental processing over full reloads. Design for reprocessability.
- Validate data at ingestion, not only at consumption. Catch quality issues at the source boundary.
- Exactly-once semantics are required for financial, compliance, or deduplication-sensitive pipelines.
- Dead Letter Queues are mandatory for streaming pipelines. Never silently drop records.
- Observable pipelines emit metrics, lineage events, and freshness signals by default.

---

## Workflow Router

### System prompt design (structure, capabilities, guardrails, memory blocks, SPL)

Read [system-prompt-architecture.md](./references/system-prompt-architecture.md) when designing or modifying an agent's system prompt — structuring the 8-block anatomy, writing capability allowlists, defining guardrail hierarchies, designing runtime memory injection blocks, applying System Prompt Learning (SPL), implementing Instruction Forwarding between agents, or reviewing anti-patterns (prose-only instructions, duplicate constraints, hard-coded user rules).

### Tool call design (schemas, categories, confirmation policies, persistence, debug)

Read [tool-call-design.md](./references/tool-call-design.md) when defining, auditing, or debugging a tool — applying the Intern Test to tool descriptions, assigning ToolCategory (read_objects, list_objects, update_confirmation, agent_as_a_tool, hosted_mcp_tool, etc.), setting confirmation policies (none / always_ask / always_auto / configurable), assigning persistence policies (ephemeral / session / short_term), configuring stream_policy and risk levels, or debugging wrong-tool-selection failures.

### Memory & learning system (STM, persistence tiers, compaction, reflection, fine-tuning)

Read [memory-and-learning-system.md](./references/memory-and-learning-system.md) when implementing or debugging memory — designing the memory taxonomy (working_context / run_memory / cross_run_memory), assigning persistence policies to tools, implementing session compaction strategy selection by context size, configuring the reflection and self-improvement loop (signal detection → draft → safety scan → eval gate → promotion), or setting up the fine-tuning pipeline (eval score tiers → dataset curation → job submission).

### Evals & regression gates (contracts, thresholds, CI gates, datasets, fine-tuning link)

Read [evals-system.md](./references/evals-system.md) when designing, running, or debugging evals — defining EvalItemContract and EvalSetContract, setting EvalThreshold with hard_fail_below, understanding the three-level gate cascade (evaluator → eval_set → CI), choosing evaluation mode (grader / labeler / hybrid) and implementation type, managing datasets (golden JSONL, synthetic inputs, gym contexts), integrating eval gates into CI, or applying the "when to add an eval" rules.

### Context engineering (context types, tagger routing, compaction, RAG assembly, debug)

Read [context-engineering.md](./references/context-engineering.md) when designing context assembly or debugging context failures — mapping the context type taxonomy (working_context, run_memory, cross_run_memory, input_contexts, CLO_documents), implementing tagger architecture for intent-to-context routing, setting context budgets (top_k, top_s, per-type limits), applying compaction strategies by context size, using multi-query patterns (step-back, parallel, sequential), assembling RAG contexts with freshness and diversity, or debugging wrong-context failures (distractor injection, constraint drift, recency bias).

### MCP engineering (server types, lifecycle, auth, security, tool filtering, hosted vs local)

Read [mcp-engineering.md](./references/mcp-engineering.md) when integrating MCP servers — choosing between `MCPServerStdio` (local process), `MCPServerStreamableHttp` (remote HTTP), and `HostedMCPTool` (OpenAI-managed); managing connection lifecycle and tool caching (`MCPCacheManager`, 5-min TTL); applying 401-driven OAuth flow; implementing DNS rebinding protection for HTTP servers; filtering tool exposure with `create_static_tool_filter`; attaching approval handlers for sensitive operations; or debugging MCP failures.

### AI observability (trace standard, correlation IDs, metrics, alerts, eval score monitoring)

Read [ai-observability.md](./references/ai-observability.md) when instrumenting or debugging AI systems — understanding the trace schema (version, agent, progress_updates, reasoning_chunks, context_summaries, usage), building the correlation ID chain (thread_id, run_id, trace_id, conversation_id, user_id, company_id), choosing AI-specific metrics (TTFT, token trends, tool success/failure rates, eval score trends), configuring alerts (score drop > 5 pts = critical, tool error > 10% = high), or diagnosing failures with trace + AICall + SystemLog correlation.

### Agent debug playbooks (wrong tool, RAG hallucination, latency regression, change checklist)

Read [agent-debug-playbooks.md](./references/agent-debug-playbooks.md) when diagnosing a production agent failure — step-by-step playbooks for: wrong tool selection (7 diagnostic steps from logging to eval case), RAG hallucination despite context (retrieval vs. generation failure diagnosis), latency spike or first-token regression (5 component-level diagnostics), and the agent change checklist (pre-change baseline, required artifacts, ship criteria).

### Fine-tuning (dataset curation, quality tiers, job launch, hyperparameters, post-training gate)

Read [fine-tuning.md](./references/fine-tuning.md) when setting up or managing a fine-tuning pipeline — determining whether to fine-tune vs. use SPL, applying the 4-tier dataset quality pipeline (eval score 0–20/20–40/40–60/60–100), building datasets from AICalls or golden examples, launching SFT jobs with method-based payloads, setting hyperparameters, applying post-training eval gates, or integrating with the outcome scoring system.

### Prompt engineering (patterns, few-shot, chain-of-thought, structured output, meta-prompting)

Read [prompt-engineering-patterns.md](./references/prompt-engineering-patterns.md) when writing or improving prompts — the full taxonomy covers zero-shot (including S2A, SimToM, RaR, RE2, Self-Ask), few-shot (KNN, Vote-K, prompt mining), thought generation (CoT, step-back, analogical, Auto-CoT, uncertainty-routed), ensembling (self-consistency, meta-CoT, prompt paraphrasing), self-criticism (verification, calibration, self-refinement, reverse CoT), and decomposition (least-to-most, plan-and-solve, program-of-thought, skeleton, recursive thought).

### Multi-agent systems (orchestration patterns, A2A, handoffs, coordination, lifecycles, steering, skill packages)

Read [agentic-system-design.md](./references/agentic-system-design.md) when designing multi-agent architectures — ReAct and Plan-Execute loops, function calling with ToolRegistry, multi-agent coordination (Manager-as-Tools vs Handoff vs Parallel Fan-Out vs Hierarchical), MCP/A2A/ACP protocol selection, agent lifecycle (request → Celery → orchestrator → streaming → ResultBus), guardrail types (Input/Output/session/confirmation), autonomy levels, coordination services (lease, anchor, conflict), RunSteeringService (mid-run correction injection), and AgentSkillPackageSpec (distributable skill bundles).

### RAG and vector stores (providers, indexes, filter DSL, embedding sync, failure modes)

Read [rag-and-vector-stores.md](./references/rag-and-vector-stores.md) when implementing or debugging RAG — choosing a vector store provider (aws/azure/pinecone/turbopuffer/openai), using the logical index taxonomy (objects/lessons/knowledge/canvas/files), writing cross-provider filters with `normalize_vector_filter()`, applying `with_active_vector_filter()` for active-document defaults, upsert and sync patterns, TurboPuffer-specific constraints (namespace naming, metadata types, tuple DSL, score conversion), or diagnosing retrieval failures.

### Agent governance and safety (risk taxonomy, control levers, safety gates, scope isolation)

Read [agent-governance-safety.md](./references/agent-governance-safety.md) when expanding agent autonomy or adding side-effecting tools — mapping the risk taxonomy (malicious use, accidents, security, systemic), applying governance levers (alignment, control, visibility, robustness), implementing constitutional safety principles (human rights, privacy, harmlessness, anti-impersonation), configuring production safety gates (action permissions, memory boundaries, eval gates, incident response), enforcing company/user/thread scope isolation, defending against prompt injection, and running the agent capability checklist before any autonomy expansion.

### LLM evaluation (metrics, A/B testing, RAG evaluation, benchmark datasets)

Read [llm-evaluation-frameworks.md](./references/llm-evaluation-frameworks.md) when measuring or comparing LLM output quality — choosing between BLEU, ROUGE, BERTScore, or semantic metrics; implementing human evaluation (Likert, side-by-side, LLM-as-judge); designing A/B tests for prompts; using benchmark datasets (MMLU, HumanEval, GSM8K); evaluating RAG context relevance and answer faithfulness; or designing automated evaluation pipelines.

### Constrained generation (regex, select, grammar-backed output)

Read [guidance-constrained-generation.md](./references/guidance-constrained-generation.md) when prompt-only formatting is too weak — implementing regex-constrained fields, finite-choice routing with `select`, grammar-backed JSON/code generation, Guidance functions with `@guidance`, token-healing-aware output control, backend setup for OpenAI/Anthropic/local models, or multi-step constrained workflows.

### Pipeline architecture (Lambda, Kappa, Medallion, Spark, Kafka)

Read [data-pipeline-architecture.md](./references/data-pipeline-architecture.md) when designing or implementing data pipeline architecture — choosing between Lambda/Kappa/Medallion patterns, configuring Spark batch jobs, setting up Kafka topics and consumer groups, implementing exactly-once semantics, handling late-arriving data with watermarks, using CDC or bulk ingestion patterns, or implementing Dead Letter Queue and Circuit Breaker error handling.

### Data modeling (dimensional, Data Vault, SCD, dbt, partitioning)

Read [data-modeling-patterns.md](./references/data-modeling-patterns.md) when designing data models — choosing between Star/Snowflake schema, One Big Table, or Data Vault; implementing Slowly Changing Dimensions; writing dbt models with incremental materialization; or managing schema evolution and data contracts.

### DataOps (testing, contracts, CI/CD, observability, cost)

Read [dataops-best-practices.md](./references/dataops-best-practices.md) for production data operations — setting up Great Expectations or dbt test suites, authoring data contracts with SLAs, wiring GitHub Actions CI/CD for data pipelines, emitting OpenLineage events, configuring Prometheus alerting, or running incident response runbooks.

### Statistical modeling & experiments (A/B testing, sample sizing, causal inference)

Read [statistical-modeling-experiments.md](./references/statistical-modeling-experiments.md) when designing or analyzing controlled experiments — calculating sample size, running two-proportion z-tests, applying multiple-testing corrections, detecting sample ratio mismatch, or estimating causal effects.

### Feature engineering for ML (Scikit-learn pipelines, encoding, leakage prevention)

Read [feature-engineering-ml.md](./references/feature-engineering-ml.md) when building feature pipelines — constructing Scikit-learn ColumnTransformer pipelines, choosing encoding strategies, extracting time features, preventing leakage, or selecting features with SHAP.

### Model evaluation & selection (cross-validation, AUC-ROC, MLflow, SHAP, calibration)

Read [model-evaluation.md](./references/model-evaluation.md) when training and evaluating classification or regression models — cross-validating with StratifiedKFold, choosing AUC-ROC vs AUC-PR, logging to MLflow, explaining with SHAP, or calibrating probabilities.

### Computer vision architectures (CNN, ViT, YOLO, DETR, segmentation, production)

Read [computer_vision_architectures.md](./references/computer_vision_architectures.md) for CV model architecture selection. Read [object_detection_optimization.md](./references/object_detection_optimization.md) for training and optimization. Read [production_vision_systems.md](./references/production_vision_systems.md) for ONNX/TensorRT export, edge deployment, Triton serving, and video pipelines.

---

## Scripts

```bash
# Analyze and optimize a prompt (token count, clarity score, suggestions)
python scripts/prompt_optimizer.py prompt.txt --analyze

# Generate optimized version of a prompt
python scripts/prompt_optimizer.py prompt.txt --optimize --output optimized.txt

# Evaluate RAG retrieval quality (context relevance, faithfulness, Precision@K)
python scripts/rag_evaluator.py \
  --contexts retrieved.json \
  --questions eval_set.json \
  --output report.json --verbose

# Validate and visualize an agent workflow definition
python scripts/agent_orchestrator.py agent.yaml --validate
python scripts/agent_orchestrator.py agent.yaml --visualize --format mermaid
python scripts/agent_orchestrator.py agent.yaml --estimate-cost --runs 100

# Generate pipeline orchestration config (Airflow, Prefect, or Dagster)
python scripts/pipeline_orchestrator.py generate \
  --type airflow --source postgres --destination snowflake --schedule "0 5 * * *"

# Validate data quality (schema, freshness, completeness, uniqueness)
python scripts/data_quality_validator.py validate \
  --input data/sales.parquet --schema schemas/sales.json \
  --checks freshness,completeness,uniqueness

# Analyze and optimize ETL performance
python scripts/etl_performance_optimizer.py analyze \
  --query queries/daily_aggregation.sql --engine spark --recommend

# Vision model training configuration
python scripts/vision_model_trainer.py models/ --task detection --arch yolov8m

# Inference optimization analysis
python scripts/inference_optimizer.py model.pt --benchmark --recommend --target gpu
```

---

## Templates

| Template | Use for |
|----------|---------|
| [system-prompt-template.md](./templates/system-prompt-template.md) | Starting a new agent system prompt |
| [eval-case-template.md](./templates/eval-case-template.md) | Defining a new eval contract and golden dataset |

## Examples

| Example | Shows |
|---------|-------|
| [agent-system-prompt-example.md](./examples/agent-system-prompt-example.md) | Full production HR agent system prompt (all 8 blocks) |
| [eval-contract-example.py](./examples/eval-contract-example.py) | Complete EvalItemContract + EvalSetContract + golden dataset entries |

---

## Tech Stack Quick Reference

| Domain | Stack |
|--------|-------|
| **LLM providers** | OpenAI, Anthropic, Groq, Mistral, Google GenAI |
| **Agent SDK** | OpenAI Agents SDK (Runner, SQLiteSession, AgentHooks) |
| **Orchestration** | Celery, Django Channels, A2A, ACP, MCP SDK |
| **Eval** | OpenAI Evals API + file-backed EvalItemContract / EvalSetContract |
| **Retrieval** | Embedding search, MMR diversification, TurboPuffer |
| **Data orchestration** | Airflow, Prefect, Dagster |
| **Transformation** | dbt, Spark, Flink |
| **Streaming** | Kafka, Kinesis, Pub/Sub |
| **Quality** | Great Expectations, dbt tests |
| **ML/DS** | Scikit-learn, XGBoost, MLflow, SHAP |
| **CV** | PyTorch, YOLOv8, Detectron2, ONNX, TensorRT |
