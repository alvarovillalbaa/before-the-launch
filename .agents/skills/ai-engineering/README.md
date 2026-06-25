# AI Engineering

Full-stack AI engineering skill: agent architecture, system prompt design, tool call schemas, context engineering, memory systems, evals, fine-tuning, RAG, vector stores, prompt patterns, agent governance, ML pipelines, and data infrastructure.

## Use this for

- system prompt architecture, capability allowlists, guardrails, and SPL
- tool call design, ToolCategory taxonomy, confirmation and persistence policies
- context engineering: tagger routing, compaction strategies, RAG assembly
- memory and learning systems: STM/session/cross-run memory, reflection loops, fine-tuning
- evals and regression gates: EvalItemContract, EvalSetContract, CI gate cascade
- multi-agent systems: orchestration patterns, A2A, handoffs, lifecycle management, RunSteeringService
- RAG and vector stores: TurboPuffer, Pinecone, Azure AI Search, filter DSL, index taxonomy
- agent governance and safety: risk taxonomy, constitutional principles, scope isolation, safety gates
- prompt engineering patterns (zero-shot through meta-prompting)
- constrained generation, LLM evaluation frameworks
- data pipelines, ETL/ELT, streaming, and DataOps
- classical ML evaluation, experimentation, and feature engineering
- computer vision systems and model serving

## Install

```bash
npx -y skills add ./engineering/skills/ai-engineering
mkdir -p ~/.codex/skills
cp -R engineering/skills/ai-engineering ~/.codex/skills/
```

Codex `$skill-installer` path:

```text
https://github.com/alvarovillalbaa/plugins/tree/main/engineering/skills/ai-engineering
```

## What is bundled

| Path | Contents |
|------|----------|
| `references/system-prompt-architecture.md` | System prompt block anatomy, SPL, guardrail hierarchy, Instruction Forwarding |
| `references/tool-call-design.md` | Intern Test, ToolCategory taxonomy, confirmation/persistence policies, debug guide |
| `references/memory-and-learning-system.md` | Memory tiers, compaction strategies, reflection loop, fine-tuning pipeline |
| `references/evals-system.md` | Eval contracts, gate cascade, CI integration, dataset management |
| `references/context-engineering.md` | Context types, tagger architecture, compaction, RAG assembly, failure debug |
| `references/agentic-system-design.md` | ReAct, Plan-Execute, multi-agent patterns, A2A, orchestration, lifecycle, RunSteeringService, AgentSkillPackageSpec |
| `references/mcp-engineering.md` | Server types (Stdio/HTTP/Hosted), caching, auth, DNS rebinding, tool filtering |
| `references/ai-observability.md` | Trace standard, correlation IDs, AI-specific metrics, alerts, eval monitoring |
| `references/agent-debug-playbooks.md` | Wrong tool selection, RAG hallucination, latency debug, agent change checklist |
| `references/rag-and-vector-stores.md` | VectorStore interface, 6 providers, 13 logical indexes, filter DSL, TurboPuffer quirks, upsert/sync patterns |
| `references/agent-governance-safety.md` | Risk taxonomy, governance levers, constitutional principles, production safety gates, scope isolation |
| `references/fine-tuning.md` | Dataset quality tiers, outcome scoring, SFT job launch, post-training gates |
| `references/prompt-engineering-patterns.md` | Full taxonomy: zero-shot, few-shot, thought generation, ensembling, self-criticism, decomposition |
| `references/llm-evaluation-frameworks.md` | Metrics, A/B testing, LLM-as-judge, benchmarks |
| `references/guidance-constrained-generation.md` | Regex, select, grammar-backed output with Guidance |
| `references/data-pipeline-architecture.md` | Lambda/Kappa/Medallion, Spark, Kafka, exactly-once |
| `references/data-modeling-patterns.md` | Star schema, Data Vault, SCD, dbt, partitioning |
| `references/dataops-best-practices.md` | Testing, contracts, CI/CD, observability, cost |
| `references/statistical-modeling-experiments.md` | A/B testing, sample sizing, causal inference |
| `references/feature-engineering-ml.md` | Scikit-learn pipelines, encoding, leakage prevention |
| `references/model-evaluation.md` | Cross-validation, AUC, MLflow, SHAP, calibration |
| `references/computer_vision_architectures.md` | CNN, ViT, YOLO, DETR, segmentation |
| `references/object_detection_optimization.md` | NMS, anchors, loss functions, augmentation |
| `references/production_vision_systems.md` | ONNX, TensorRT, Triton, edge deployment |
| `templates/system-prompt-template.md` | Copy-paste system prompt skeleton with checklist |
| `templates/eval-case-template.md` | Eval contract + golden dataset + grader prompt templates |
| `examples/agent-system-prompt-example.md` | Full production HR agent system prompt (all 8 blocks) |
| `examples/eval-contract-example.py` | EvalItemContract + EvalSetContract + golden dataset entries |
| `scripts/` | Prompt optimizer, RAG evaluator, agent orchestrator, pipeline tools |
