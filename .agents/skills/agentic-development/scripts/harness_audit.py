#!/usr/bin/env python3
"""Audit a repository for agent-first harness engineering readiness."""

from __future__ import annotations

import argparse
import json
import os
import re
import subprocess
from dataclasses import dataclass, field
from pathlib import Path
from typing import Iterable


PRUNE_DIRS = {
    ".git",
    ".hg",
    ".svn",
    ".venv",
    "venv",
    "__pycache__",
    "node_modules",
    ".next",
    "dist",
    "build",
    "coverage",
    "htmlcov",
    ".pytest_cache",
    ".mypy_cache",
    ".ruff_cache",
}

CODE_SUFFIXES = {
    ".py",
    ".js",
    ".jsx",
    ".ts",
    ".tsx",
    ".go",
    ".rs",
    ".java",
    ".kt",
    ".rb",
}

OBSERVABILITY_PATTERNS = {
    "sentry": r"sentry",
    "structured logging": r"structlog|loguru|winston|pino|logging\.getLogger|log_error|log_warning|SystemLog",
    "opentelemetry": r"opentelemetry|otel|trace_id|span_id",
    "metrics": r"prometheus|promql|statsd|datadog|counter|histogram|gauge",
    "traces": r"jaeger|honeycomb|traceql|langfuse|tracing",
    "analytics": r"posthog|amplitude|segment|mixpanel",
}


@dataclass
class Dimension:
    name: str
    max_score: int
    score: int = 0
    evidence: list[str] = field(default_factory=list)
    gaps: list[str] = field(default_factory=list)
    recommendations: list[str] = field(default_factory=list)

    def add(self, points: int, evidence: str) -> None:
        self.score = min(self.max_score, self.score + points)
        self.evidence.append(evidence)

    def gap(self, gap: str, recommendation: str | None = None) -> None:
        self.gaps.append(gap)
        if recommendation:
            self.recommendations.append(recommendation)


def run(cmd: list[str], cwd: Path) -> tuple[int, str]:
    try:
        completed = subprocess.run(cmd, cwd=cwd, text=True, capture_output=True, check=False)
    except FileNotFoundError:
        return 127, ""
    return completed.returncode, completed.stdout.strip()


def repo_root(path: Path) -> Path:
    code, output = run(["git", "rev-parse", "--show-toplevel"], path)
    if code == 0 and output:
        return Path(output).resolve()
    return path.resolve()


def walk_files(root: Path, suffixes: set[str] | None = None) -> Iterable[Path]:
    for dirpath, dirnames, filenames in os.walk(root):
        dirnames[:] = [name for name in dirnames if name not in PRUNE_DIRS]
        for filename in filenames:
            path = Path(dirpath) / filename
            if suffixes is None or path.suffix in suffixes:
                yield path


def rel(root: Path, path: Path) -> str:
    return str(path.relative_to(root))


def line_count(path: Path) -> int:
    try:
        return len(path.read_text(encoding="utf-8", errors="ignore").splitlines())
    except OSError:
        return 0


def read_text(path: Path) -> str:
    try:
        return path.read_text(encoding="utf-8", errors="ignore")
    except OSError:
        return ""


def has_any(root: Path, patterns: Iterable[str]) -> bool:
    return any((root / pattern).exists() for pattern in patterns)


def grep_files(root: Path, regex: str, paths: Iterable[Path]) -> list[str]:
    pattern = re.compile(regex, re.IGNORECASE)
    matches: list[str] = []
    for path in paths:
        text = read_text(path)
        if pattern.search(text):
            matches.append(rel(root, path))
    return matches


def shallow_named(root: Path, names: set[str], max_depth: int = 4) -> list[Path]:
    found: list[Path] = []
    for path in walk_files(root):
        try:
            depth = len(path.relative_to(root).parts)
        except ValueError:
            continue
        if depth <= max_depth and path.name in names:
            found.append(path)
    return sorted(found)


def nonempty_markdown_count(path: Path) -> int:
    if not path.exists():
        return 0
    count = 0
    for file_path in path.rglob("*.md"):
        if any(part in PRUNE_DIRS for part in file_path.parts):
            continue
        if len(read_text(file_path).strip()) > 80:
            count += 1
    return count


def file_effectively_empty(path: Path) -> bool:
    text = read_text(path)
    lines = [
        line.strip()
        for line in text.splitlines()
        if line.strip() and not line.strip().startswith("#")
    ]
    return len("\n".join(lines)) < 80


def detect_package_scripts(root: Path) -> dict[str, str]:
    package_json = root / "package.json"
    if not package_json.exists():
        return {}
    try:
        data = json.loads(read_text(package_json))
    except json.JSONDecodeError:
        return {}
    scripts = data.get("scripts", {})
    if not isinstance(scripts, dict):
        return {}
    return {str(key): str(value) for key, value in scripts.items() if isinstance(value, str)}


def score_context(root: Path) -> Dimension:
    dim = Dimension("Context architecture", 15)
    agents = root / "AGENTS.md"
    claude = root / "CLAUDE.md"
    if agents.exists():
        lines = line_count(agents)
        if lines <= 120:
            dim.add(5, f"Root AGENTS.md is concise ({lines} lines).")
        elif lines <= 180:
            dim.add(3, f"Root AGENTS.md is moderately sized ({lines} lines).")
            dim.gap("Root AGENTS.md is above the roughly 100-line map target.", "Extract detailed sections into docs/references or docs/cookbook and leave pointers.")
        else:
            dim.add(1, f"Root AGENTS.md exists but is large ({lines} lines).")
            dim.gap("Root AGENTS.md is acting like a manual.", "Slim it to a map and move detailed guidance into repo-local references.")
    elif claude.exists():
        dim.add(2, "CLAUDE.md exists but no root AGENTS.md was found.")
        dim.gap("No root AGENTS.md map found.", "Add a short AGENTS.md or make CLAUDE.md an explicit router to repo-local docs.")
    else:
        dim.gap("No root AGENTS.md or CLAUDE.md found.", "Add a short always-loaded instruction map.")

    doc_dirs = [
        "docs/references",
        "docs/cookbook",
        "docs/specs",
        "docs/plans",
        "docs/research",
        "docs/lessons",
        "docs/runbooks",
        "docs/audits",
        "docs/fixes",
        "docs/logs",
        "docs/knowledge",
    ]
    present = [path for path in doc_dirs if (root / path).exists()]
    if len(present) >= 6:
        dim.add(4, f"Docs taxonomy is broad ({len(present)} expected directories present).")
    elif len(present) >= 3:
        dim.add(2, f"Docs taxonomy exists but is partial ({len(present)} expected directories present).")
    else:
        dim.gap("Docs taxonomy is thin or missing.", "Create repo-local references, runbooks, plans, research, and lessons directories as needed.")

    local_agents = [path for path in shallow_named(root, {"AGENTS.md"}) if path != agents]
    if local_agents:
        dim.add(3, f"Found {len(local_agents)} subsystem AGENTS.md files.")
    else:
        dim.gap("No subsystem AGENTS.md files found.", "Add local AGENTS.md files for high-risk subsystems.")

    symlinked_roots = [
        path.name
        for path in root.iterdir()
        if path.is_symlink() and path.name in {"PLAN.md", "SPEC.md", "USER.md", "DESIGN.md", "PRODUCT.md"}
    ]
    if symlinked_roots:
        dim.gap(
            f"Root product/planning docs are symlinked: {', '.join(symlinked_roots)}.",
            "Add a repo-local product-context summary or document the symlink reliability contract.",
        )
    else:
        dim.add(1, "No common root product/planning symlink risk detected.")

    workflow_files = list((root / ".github" / "workflows").glob("*.yml")) + list((root / ".github" / "workflows").glob("*.yaml"))
    doc_link_checks = grep_files(root, r"AGENTS\.md|docs/.*exists|markdown-link|lychee|linkcheck", workflow_files)
    if doc_link_checks:
        dim.add(2, "CI appears to validate docs or instruction links.")
    else:
        dim.gap("No doc/instruction cross-link validation detected in CI.", "Add a fast check that paths referenced from instruction maps exist.")

    return dim


def score_mechanical(root: Path, text_files: list[Path]) -> Dimension:
    dim = Dimension("Mechanical enforcement", 15)
    if has_any(root, ["pyproject.toml", "ruff.toml", ".ruff.toml", ".eslintrc", ".eslintrc.js", "eslint.config.js", "eslint.config.mjs"]):
        dim.add(3, "Lint configuration detected.")
    else:
        dim.gap("No common lint configuration detected.", "Add language-appropriate linting as a baseline agent feedback loop.")

    scripts = detect_package_scripts(root)
    all_text = "\n".join(read_text(path) for path in text_files[:200])
    boundary_terms = r"eslint-plugin-boundaries|import-linter|layers?|forbidden import|analyze:cycles|madge|pydeps|structural"
    if re.search(boundary_terms, all_text, re.IGNORECASE) or any("cycle" in key or "boundary" in key for key in scripts):
        dim.add(4, "Boundary, cycle, or structural enforcement signals detected.")
    else:
        dim.gap("No structural boundary enforcement detected.", "Add import-boundary linting or structural tests for the highest-risk layer rule.")

    large_files = []
    for path in walk_files(root, CODE_SUFFIXES):
        lines = line_count(path)
        if lines > 500:
            large_files.append((rel(root, path), lines))
        if len(large_files) >= 10:
            break
    if large_files:
        dim.gap(
            f"Found oversized files over 500 lines, including {large_files[0][0]} ({large_files[0][1]} lines).",
            "Add a file-size report or gate and split high-churn oversized files first.",
        )
    else:
        dim.add(2, "No sampled code files over 500 lines detected.")

    if re.search(r"log_error|logger\.error|except .*:|catch\s*\(", all_text, re.IGNORECASE):
        dim.add(2, "Logging/error-handling patterns detected.")
    else:
        dim.gap("No strong logging/error-handling enforcement signal detected.", "Document and enforce structured error logging at service boundaries.")

    if re.search(r"ToolSpec|tool spec|zod|pydantic|schema validation|response envelope", all_text, re.IGNORECASE):
        dim.add(2, "Schema/tool-spec legibility patterns detected.")
    else:
        dim.gap("No tool/schema legibility enforcement detected.", "For agent-callable tools, validate specs, parameters, and response envelopes in CI.")

    if (root / "tests" / "unit" / "structural").exists() or (root / "tests" / "structural").exists():
        dim.add(2, "Structural tests directory detected.")
    else:
        dim.gap("No structural tests directory detected.", "Start with one test that rejects the most expensive forbidden import.")

    return dim


def score_ci(root: Path, text_files: list[Path]) -> Dimension:
    dim = Dimension("CI feedback", 10)
    workflows = list((root / ".github" / "workflows").glob("*.yml")) + list((root / ".github" / "workflows").glob("*.yaml"))
    ci_script = any(path.exists() for path in [root / "run_github_ci.sh", root / "scripts" / "run_github_ci.sh", root / "lib" / "utils" / "scripts" / "ci" / "run_github_ci.sh"])
    if workflows or ci_script:
        dim.add(3, "CI workflows or canonical CI script detected.")
    else:
        dim.gap("No CI workflow or canonical CI script detected.", "Add one repo-local verify entrypoint agents can run and CI can call.")

    ci_text = "\n".join(read_text(path) for path in workflows)
    scripts = detect_package_scripts(root)
    script_text = "\n".join([*scripts.keys(), *scripts.values(), ci_text])
    for label, regex, points in [
        ("lint", r"lint|ruff|eslint", 1),
        ("typecheck", r"typecheck|tsc|mypy|pyright", 1),
        ("tests", r"test|pytest|vitest|jest", 2),
        ("build", r"build|next build|vite build", 1),
        ("cycles/import checks", r"analyze:cycles|madge|pydeps|import-linter|boundary", 1),
        ("i18n/schema/generated checks", r"i18n|schema|makemigrations --check|generated", 1),
    ]:
        if re.search(regex, script_text, re.IGNORECASE):
            dim.add(points, f"{label} signal detected in scripts or CI.")
        else:
            dim.gap(f"No {label} signal detected in scripts or CI.")

    if re.search(r"GITHUB_STEP_SUMMARY|::error|junit|json|sarif|problem matcher", ci_text, re.IGNORECASE):
        dim.add(1, "CI has machine-readable or annotated output signals.")
    else:
        dim.gap("No machine-readable CI output convention detected.", "Emit path/line/rule annotations or summaries that agents can parse.")

    return dim


def score_tests_evals(root: Path, text_files: list[Path]) -> Dimension:
    dim = Dimension("Testing and evals", 15)
    if (root / "tests").exists() or (root / "__tests__").exists():
        dim.add(3, "Test directory detected.")
    else:
        dim.gap("No conventional test directory detected.", "Add focused tests near the behavior agents are expected to change.")

    if has_any(root, ["pytest.ini", ".coveragerc", "coverage.xml"]) or re.search(r"coverage|cov-fail-under|fail_under", "\n".join(read_text(path) for path in text_files), re.IGNORECASE):
        dim.add(2, "Coverage configuration or coverage CI signal detected.")
    else:
        dim.gap("No coverage signal detected.", "Add scoped coverage thresholds for high-risk service or agent code first.")

    eval_dirs = [path for path in [root / "evals", root / "tests" / "evals", root / "services" / "ai" / "agents" / "evals"] if path.exists()]
    if eval_dirs:
        dim.add(4, "Eval directory detected: " + ", ".join(rel(root, path) for path in eval_dirs))
    else:
        dim.gap("No evals directory detected.", "Create a small golden eval set for agent/tool/harness behavior.")

    if re.search(r"e2e|integration|smoke|playwright|cypress|selenium", "\n".join(read_text(path) for path in text_files), re.IGNORECASE):
        dim.add(2, "Integration/e2e/smoke testing signal detected.")
    else:
        dim.gap("No integration/e2e/smoke testing signal detected.", "Add at least one end-to-end proof path for critical agent-facing workflows.")

    if re.search(r"worktree|ephemeral|isolated|docker compose|redis namespace|test database|agent-worktree-up", "\n".join(read_text(path) for path in text_files), re.IGNORECASE):
        dim.add(2, "Worktree or isolated-environment signal detected.")
    else:
        dim.gap("No isolated worktree/test environment signal detected.", "Script per-worktree app/DB/cache isolation for agent runs (e.g. scripts/agent-worktree-up.sh).")

    if re.search(r"test first|red.*green|TDD|fails before implementation", "\n".join(read_text(path) for path in text_files), re.IGNORECASE):
        dim.add(2, "TDD or test-first protocol detected.")
    else:
        dim.gap("No test-first protocol detected.", "For high-risk tools, require new regression tests to fail before implementation.")

    return dim


def score_observability(root: Path, text_files: list[Path]) -> Dimension:
    dim = Dimension("Observability for agents", 10)
    searchable = list(walk_files(root, {".py", ".js", ".jsx", ".ts", ".tsx", ".json", ".toml", ".yaml", ".yml", ".md"}))
    found = []
    for name, regex in OBSERVABILITY_PATTERNS.items():
        if grep_files(root, regex, searchable[:500]):
            found.append(name)
    if found:
        dim.add(min(4, len(found)), "Observability signals detected: " + ", ".join(found[:6]))
    else:
        dim.gap("No common observability signals detected.", "Add or document logging, metrics, traces, and runtime error tracking.")

    all_text = "\n".join(read_text(path) for path in text_files)
    if re.search(r"query_system_logs|query_agent_metrics|query_.*logs|query_.*metrics|get_trace|get_trace_summary|LogQL|PromQL|TraceQL|Sentry", all_text, re.IGNORECASE):
        dim.add(3, "Agent-readable log/metric/trace query path detected.")
    else:
        dim.gap(
            "No agent-readable telemetry query path detected.",
            "Add agent-callable tools: query_system_logs(thread_id, error_type), query_agent_metrics(agent_type, signal_type), get_trace_summary(trace_id).",
        )

    if re.search(r"request[_-]?id|trace[_-]?id|span[_-]?id|run[_-]?id|thread[_-]?id", all_text, re.IGNORECASE):
        dim.add(2, "Correlation id conventions detected.")
    else:
        dim.gap("No correlation id convention detected.", "Standardize request/run/thread/trace ids across logs and spans.")

    if re.search(r"DevTools|DOM snapshot|screenshot|Playwright|debug[A-Z_]", all_text, re.IGNORECASE):
        dim.add(1, "Frontend debug or browser-driving signal detected.")
    else:
        dim.gap("No browser/DOM/screenshot debug path detected.", "For frontend repos, document browser-driven validation and debug flags.")

    return dim


def score_memory_quality(root: Path, text_files: list[Path]) -> Dimension:
    dim = Dimension("Persistent knowledge and continuous quality", 15)
    research_count = nonempty_markdown_count(root / "docs" / "research")
    lessons_count = nonempty_markdown_count(root / "docs" / "lessons")
    if research_count:
        dim.add(2, f"docs/research has {research_count} non-empty markdown files.")
    else:
        dim.gap("docs/research is missing or empty.", "Capture subsystem investigations as dated research docs.")
    if lessons_count:
        dim.add(2, f"docs/lessons has {lessons_count} non-empty markdown files.")
    else:
        dim.gap("docs/lessons is missing or empty.", "Write lessons after repeated mistakes or non-obvious fixes.")

    populated_failure_files = []
    for name in ("REGRESSIONS.md", "FRICTION.md"):
        path = root / name
        if path.exists() and not file_effectively_empty(path):
            populated_failure_files.append(name)
        elif path.exists():
            dim.gap(f"{name} exists but appears empty.", f"Populate {name} or remove it to avoid false confidence.")
    if populated_failure_files:
        dim.add(2, "Populated failure-tracking files: " + ", ".join(populated_failure_files))

    all_text = "\n".join(read_text(path) for path in text_files)
    if re.search(r"session protocol|session journal|docs/logs|session-end|living update", all_text, re.IGNORECASE):
        dim.add(2, "Session-end or living-update protocol detected.")
    else:
        dim.gap("No session-end learning protocol detected.", "Add a short routine for updating research, lessons, or instruction maps.")

    if has_any(
        root,
        [
            ".agents/skills/auto-improve",
            ".codex/skills/auto-improve",
            "engineering/skills/auto-improve",
            "learning-system/skills/auto-improve",
            "learning",
        ],
    ):
        dim.add(1, "Auto-improvement or learning infrastructure detected.")
    else:
        dim.gap("No auto-improvement or learning infrastructure detected.")

    all_repo_text = all_text.lower()
    if re.search(r"doc[- ]gardening|garbage collection|garbage.collection.agent|doc.gardening.agent|architecture drift|stale doc|quality score", all_repo_text):
        dim.add(3, "Continuous quality maintenance language detected.")
    else:
        dim.gap(
            "No doc-gardening or architecture-drift process detected.",
            "Add GarbageCollectionAgent (weekly: scans for oversized files, missing tests, stale docs) and DocGardeningAgent (post-merge: checks service docs and daily logs).",
        )

    workflows = list((root / ".github" / "workflows").glob("*.yml")) + list((root / ".github" / "workflows").glob("*.yaml"))
    workflow_text = "\n".join(read_text(path) for path in workflows)
    if re.search(r"schedule:|cron:", workflow_text, re.IGNORECASE):
        dim.add(2, "Scheduled CI workflow detected.")
    else:
        dim.gap("No scheduled quality workflow detected.", "Run non-blocking drift/doc/eval scans on a schedule.")

    if re.search(r"pull_request.*size|changed lines|diff.*500|PR size", workflow_text, re.IGNORECASE):
        dim.add(1, "PR-size signal detected.")
    else:
        dim.gap("No PR-size signal detected.", "Warn on oversized PRs to keep agent changes reviewable.")

    if (root / "docs" / "QUALITY_SCORE.md").exists() or (root / "QUALITY_SCORE.md").exists():
        dim.add(1, "Quality score artifact detected.")
    else:
        dim.gap("No quality score artifact detected.", "Track quality by domain or layer when agent throughput is high.")

    return dim


def score_execution_legibility(root: Path, text_files: list[Path]) -> tuple[Dimension, Dimension]:
    execution = Dimension("Execution harness", 10)
    all_text = "\n".join(read_text(path) for path in text_files)
    if re.search(r"harness|timeout|stall|token budget|HITL|human[- ]in[- ]the[- ]loop|guardrail|confirmation", all_text, re.IGNORECASE):
        execution.add(3, "Execution harness, guardrail, or HITL signals detected.")
    else:
        execution.gap("No execution harness or guardrail signal detected.", "Document timeouts, escalation points, and confirmation gates for autonomous loops.")
    if re.search(r"hook|pre-tool|post-tool|completion gate|stop hook|pre-commit|pre-push", all_text, re.IGNORECASE):
        execution.add(2, "Hook or local feedback signal detected.")
    else:
        execution.gap("No local hook feedback signal detected.", "Add hooks or pre-commit checks for fast local failures.")
    if re.search(r"reviewer|self-review|agent review|Ralph|builder.*reviewer", all_text, re.IGNORECASE):
        execution.add(1, "Agent review loop signal detected.")
    else:
        execution.gap("No builder/reviewer loop signal detected.", "Separate builder and reviewer contexts for larger changes.")
    if re.search(r"timeout|budget|max_run|six.hour|long run|max_run_seconds", all_text, re.IGNORECASE):
        execution.add(2, "Timeout or budget policy signal detected.")
    else:
        execution.gap("No timeout/budget policy detected.", "Define run budgets and per-agent-type escalation behavior for long-running tasks.")
    if re.search(r"gen_trace_id|trace_<|trace_[0-9a-f]{32}|TraceIntegrityHook|signal_telemetry|HarnessSignal", all_text, re.IGNORECASE):
        execution.add(2, "Trace integrity or signal telemetry signal detected.")
    else:
        execution.gap(
            "No trace integrity or harness signal telemetry detected.",
            "Use SDK utilities (gen_trace_id) for trace IDs, never raw UUIDs. Emit structured metrics when harness signals fire.",
        )

    legibility = Dimension("Agent legibility", 10)
    if re.search(r"schema|pydantic|zod|types?|interface|serializer|DTO", all_text, re.IGNORECASE):
        legibility.add(3, "Typed schema or boundary validation signals detected.")
    else:
        legibility.gap("No strong typed schema/boundary validation signal detected.", "Parse external data at boundaries with typed schemas or validators.")
    if re.search(r"ToolSpec|tool spec|response envelope|parameters|returns|errors", all_text, re.IGNORECASE):
        legibility.add(3, "Agent tool legibility signals detected.")
    else:
        legibility.gap("No agent tool specification pattern detected.", "For tools, document intent, parameters, return envelope, and error shapes.")
    if re.search(r"boring|stable API|inspectable|composable|repo-local|system of record", all_text, re.IGNORECASE):
        legibility.add(2, "Repo-local or inspectable-system language detected.")
    else:
        legibility.gap("No explicit agent-legibility principle detected.", "Favor boring, inspectable, repo-local abstractions over opaque magic in agent-heavy areas.")
    docs = shallow_named(root, {"README.md", "ARCHITECTURE.md"}, max_depth=4)
    if len(docs) >= 5:
        legibility.add(1, f"Found {len(docs)} README/ARCHITECTURE files.")
    else:
        legibility.gap("Sparse README/ARCHITECTURE coverage.", "Add local architecture docs for high-churn or high-risk modules.")
    if has_any(root, [".agents/skills", ".codex/skills", "engineering/skills"]):
        legibility.add(1, "Repo-local skills detected.")
    else:
        legibility.gap("No repo-local skills detected.", "Add skills only when repeated work benefits from a reusable procedure.")

    return execution, legibility


def build_report(root: Path) -> dict:
    text_files = list(walk_files(root, {".md", ".txt", ".yml", ".yaml", ".json", ".toml", ".ini", ".cfg"}))
    dimensions = [
        score_context(root),
        *score_execution_legibility(root, text_files),
        score_mechanical(root, text_files),
        score_tests_evals(root, text_files),
        score_observability(root, text_files),
        score_ci(root, text_files),
        score_memory_quality(root, text_files),
    ]
    total = sum(d.score for d in dimensions)
    max_total = sum(d.max_score for d in dimensions)
    return {
        "root": str(root),
        "score": total,
        "max_score": max_total,
        "dimensions": [
            {
                "name": d.name,
                "score": d.score,
                "max_score": d.max_score,
                "evidence": d.evidence,
                "gaps": d.gaps,
                "recommendations": d.recommendations,
            }
            for d in dimensions
        ],
    }


def print_report(report: dict) -> None:
    print("Harness Engineering Audit")
    print(f"Repository: {report['root']}")
    print(f"Score: {report['score']} / {report['max_score']}")
    print()
    for dim in report["dimensions"]:
        print(f"## {dim['name']} - {dim['score']} / {dim['max_score']}")
        if dim["evidence"]:
            print("Evidence:")
            for item in dim["evidence"][:5]:
                print(f"- {item}")
        if dim["gaps"]:
            print("Gaps:")
            for item in dim["gaps"][:5]:
                print(f"- {item}")
        if dim["recommendations"]:
            print("Recommended next:")
            for item in dim["recommendations"][:3]:
                print(f"- {item}")
        print()


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("path", nargs="?", default=".", help="repository path")
    parser.add_argument("--json", action="store_true", help="emit JSON")
    args = parser.parse_args()

    root = repo_root(Path(args.path).resolve())
    report = build_report(root)
    if args.json:
        print(json.dumps(report, indent=2, sort_keys=True))
    else:
        print_report(report)
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
