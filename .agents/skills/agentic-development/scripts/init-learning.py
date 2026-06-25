#!/usr/bin/env python3

from __future__ import annotations

import argparse
import json
from datetime import datetime, timezone
from pathlib import Path


DEFAULT_COLLECTIONS = [
    "architecture",
    "debugging",
    "patterns",
    "tools",
    "testing",
    "deployment",
    "api",
]


def now_iso() -> str:
    return datetime.now(timezone.utc).replace(microsecond=0).isoformat().replace("+00:00", "Z")


def titleize(name: str) -> str:
    return name.replace("-", " ").replace("_", " ").title()


def write_if_missing(path: Path, content: str) -> bool:
    if path.exists():
        return False
    path.write_text(content, encoding="utf-8")
    return True


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(
        description="Initialize a repo-local learning/ folder."
    )
    parser.add_argument(
        "--path",
        default="learning",
        help="Target learning directory (default: learning)",
    )
    parser.add_argument(
        "--repo-name",
        default=None,
        help="Optional repo name shown in the README",
    )
    parser.add_argument(
        "--collections",
        default=",".join(DEFAULT_COLLECTIONS),
        help="Comma-separated collection file basenames",
    )
    parser.add_argument(
        "--force-readme",
        action="store_true",
        help="Rewrite learning/README.md even if it already exists",
    )
    return parser.parse_args()


def initial_readme(repo_name: str | None, collection_count: int) -> str:
    repo_line = f"Repo: {repo_name}\n\n" if repo_name else ""
    timestamp = now_iso()
    return (
        "# Learning Index\n\n"
        f"{repo_line}"
        f"Last updated: {timestamp}\n\n"
        "## Summary\n\n"
        "| Memory Type | Count |\n"
        "|---|---|\n"
        "| Items | 0 events |\n"
        "| Episodes | 0 |\n"
        "| Decision Traces | 0 |\n"
        "| Triples | 0 facts |\n"
        "| Lessons | 0 |\n"
        f"| Collections | {collection_count} files |\n"
        "| Procedures | 0 |\n"
        "| Beliefs | 1 snapshot |\n\n"
        "## Active Beliefs\n\n"
        "- (none yet)\n\n"
        "## Recent Episodes\n\n"
        "- (none yet)\n\n"
        "## Recent Lessons\n\n"
        "- (none yet)\n\n"
        "## Recent Decision Traces\n\n"
        "- (none yet)\n"
    )


def collection_template(name: str) -> str:
    title = titleize(name)
    return (
        f"# {title} Knowledge\n\n"
        "<!-- Add sections as knowledge accumulates. -->\n"
        "<!-- Use: ## Topic, bullet points, When this applies, Evidence -->\n"
    )


def procedures_template() -> str:
    return (
        "# Procedures\n\n"
        "<!-- Add reusable workflows here. -->\n"
        "<!-- Use: ## Name, When to use, Last verified, numbered steps -->\n"
    )


def beliefs_template() -> str:
    return (
        "# Current Repo Beliefs\n\n"
        f"Last updated: {now_iso()}\n\n"
        "## Architecture\n\n"
        "- (unknown yet)\n\n"
        "## Key Modules\n\n"
        "- (to be filled)\n\n"
        "## Known Constraints\n\n"
        "- (to be filled)\n\n"
        "## Known Gotchas\n\n"
        "- (to be filled)\n\n"
        "## Confidence Map\n\n"
        "| Area | Confidence | Last Verified |\n"
        "|---|---|---|\n"
        "| (none yet) | - | - |\n"
    )


def initial_state() -> dict:
    return {
        "version": 2,
        "lastRunAt": None,
        "summary": {
            "items": 0,
            "episodes": 0,
            "decision_traces": 0,
            "triples": 0,
            "lessons": 0,
            "collections": 0,
            "procedures": 0,
            "beliefs": 1,
        },
        "files": {},
        "sessions": {},
    }


def main() -> None:
    args = parse_args()
    learning_dir = Path(args.path)
    collection_names = [
        name.strip()
        for name in args.collections.split(",")
        if name.strip()
    ]

    created: list[str] = []

    for relative in (
        ".state",
        "items",
        "episodes",
        "decision-traces",
        "triples",
        "lessons",
        "collections",
        "procedures",
        "beliefs",
    ):
        target = learning_dir / relative
        if not target.exists():
            target.mkdir(parents=True, exist_ok=True)
            created.append(str(target))

    state_path = learning_dir / ".state" / "index.json"
    if write_if_missing(
        state_path,
        json.dumps(initial_state(), indent=2) + "\n",
    ):
        created.append(str(state_path))

    triples_path = learning_dir / "triples" / "facts.jsonl"
    if not triples_path.exists():
        triples_path.touch()
        created.append(str(triples_path))

    for name in collection_names:
        path = learning_dir / "collections" / f"{name}.md"
        if write_if_missing(path, collection_template(name)):
            created.append(str(path))

    procedures_path = learning_dir / "procedures" / "index.md"
    if write_if_missing(procedures_path, procedures_template()):
        created.append(str(procedures_path))

    beliefs_path = learning_dir / "beliefs" / "current.md"
    if write_if_missing(beliefs_path, beliefs_template()):
        created.append(str(beliefs_path))

    readme_path = learning_dir / "README.md"
    if args.force_readme or not readme_path.exists():
        readme_path.write_text(
            initial_readme(args.repo_name, len(collection_names)),
            encoding="utf-8",
        )
        created.append(str(readme_path))

    print(f"Initialized {learning_dir}/")
    if created:
        print("Created:")
        for path in created:
            print(f"  - {path}")
    else:
        print("No files created; learning/ was already initialized.")


if __name__ == "__main__":
    main()
