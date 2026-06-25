#!/usr/bin/env python3

from __future__ import annotations

import argparse
import json
import re
from datetime import datetime, timezone
from pathlib import Path


SESSION_PATTERN = re.compile(r"^(?P<date>\d{4}-\d{2}-\d{2})-(?P<seq>\d{3})$")


def now_iso() -> str:
    return datetime.now(timezone.utc).replace(microsecond=0).isoformat().replace("+00:00", "Z")


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(
        description="Refresh learning/README.md and learning/.state/index.json."
    )
    parser.add_argument(
        "--path",
        default="learning",
        help="Learning directory (default: learning)",
    )
    parser.add_argument(
        "--limit",
        type=int,
        default=5,
        help="How many recent artifacts to list (default: 5)",
    )
    return parser.parse_args()


def parse_frontmatter(path: Path) -> dict[str, str]:
    text = path.read_text(encoding="utf-8")
    if not text.startswith("---\n"):
        return {}
    parts = text.split("---\n", 2)
    if len(parts) < 3:
        return {}
    raw = parts[1]
    data: dict[str, str] = {}
    for line in raw.splitlines():
        if ":" not in line:
            continue
        key, value = line.split(":", 1)
        data[key.strip()] = value.strip()
    return data


def count_nonempty_lines(path: Path) -> int:
    if not path.exists():
        return 0
    with path.open(encoding="utf-8") as handle:
        return sum(1 for line in handle if line.strip())


def count_procedures(path: Path) -> int:
    if not path.exists():
        return 0
    return sum(1 for line in path.read_text(encoding="utf-8").splitlines() if line.startswith("## "))


def count_beliefs(path: Path) -> int:
    if not path.exists():
        return 0
    useful = [
        line for line in path.read_text(encoding="utf-8").splitlines()
        if line.startswith("- ")
        and "(unknown yet)" not in line
        and "(to be filled)" not in line
    ]
    return 1 if useful else 0


def recent_markdown(directory: Path, limit: int) -> list[dict[str, str]]:
    if not directory.exists():
        return []
    entries: list[dict[str, str]] = []
    for path in directory.glob("*.md"):
        meta = parse_frontmatter(path)
        title = meta.get("title") or path.stem
        date_value = meta.get("date") or path.stem[:10]
        entries.append(
            {
                "date": date_value,
                "title": title.strip(),
                "mtime": str(path.stat().st_mtime),
            }
        )
    entries.sort(key=lambda item: (item["date"], item["mtime"]), reverse=True)
    return entries[:limit]


def active_beliefs(path: Path, limit: int) -> list[str]:
    if not path.exists():
        return ["- (none yet)"]
    beliefs = [
        line for line in path.read_text(encoding="utf-8").splitlines()
        if line.startswith("- ")
        and "(unknown yet)" not in line
        and "(to be filled)" not in line
    ]
    return beliefs[:limit] or ["- (none yet)"]


def session_map(learning_dir: Path) -> dict[str, dict[str, str]]:
    sessions: dict[str, dict[str, str]] = {}
    locations = {
        "items": learning_dir / "items",
        "episode": learning_dir / "episodes",
        "decision_trace": learning_dir / "decision-traces",
    }
    for kind, directory in locations.items():
        if not directory.exists():
            continue
        for path in directory.iterdir():
            session_id = path.stem
            if not SESSION_PATTERN.match(session_id):
                continue
            sessions.setdefault(session_id, {})
            sessions[session_id][kind] = str(path)
    return dict(sorted(sessions.items()))


def file_inventory(learning_dir: Path) -> dict[str, dict[str, int | str]]:
    inventory: dict[str, dict[str, int | str]] = {}
    for path in sorted(learning_dir.rglob("*")):
        if not path.is_file():
            continue
        rel = str(path)
        parts = path.relative_to(learning_dir).parts
        kind = parts[0] if parts else "root"
        stat = path.stat()
        inventory[rel] = {
            "kind": kind,
            "mtimeMs": int(stat.st_mtime * 1000),
            "size": stat.st_size,
        }
    return inventory


def write_readme(
    learning_dir: Path,
    summary: dict[str, int],
    beliefs: list[str],
    recent_episodes: list[dict[str, str]],
    recent_lessons: list[dict[str, str]],
    recent_traces: list[dict[str, str]],
) -> None:
    lines = [
        "# Learning Index",
        "",
        f"Last updated: {now_iso()}",
        "",
        "## Summary",
        "",
        "| Memory Type | Count |",
        "|---|---|",
        f"| Items | {summary['items']} events |",
        f"| Episodes | {summary['episodes']} |",
        f"| Decision Traces | {summary['decision_traces']} |",
        f"| Triples | {summary['triples']} facts |",
        f"| Lessons | {summary['lessons']} |",
        f"| Collections | {summary['collections']} files |",
        f"| Procedures | {summary['procedures']} |",
        f"| Beliefs | {summary['beliefs']} snapshot |",
        "",
        "## Active Beliefs",
        "",
        *beliefs,
        "",
        "## Recent Episodes",
        "",
    ]

    if recent_episodes:
        lines.extend(f"- {entry['date']} - {entry['title']}" for entry in recent_episodes)
    else:
        lines.append("- (none yet)")

    lines.extend(["", "## Recent Lessons", ""])

    if recent_lessons:
        lines.extend(f"- {entry['date']} - {entry['title']}" for entry in recent_lessons)
    else:
        lines.append("- (none yet)")

    lines.extend(["", "## Recent Decision Traces", ""])

    if recent_traces:
        lines.extend(f"- {entry['date']} - {entry['title']}" for entry in recent_traces)
    else:
        lines.append("- (none yet)")

    lines.append("")
    (learning_dir / "README.md").write_text("\n".join(lines), encoding="utf-8")


def main() -> None:
    args = parse_args()
    learning_dir = Path(args.path)
    if not learning_dir.exists():
        raise SystemExit(f"{learning_dir}/ not found. Run init-learning first.")

    summary = {
        "items": sum(
            count_nonempty_lines(path)
            for path in (learning_dir / "items").glob("*.jsonl")
        ) if (learning_dir / "items").exists() else 0,
        "episodes": len(list((learning_dir / "episodes").glob("*.md")))
        if (learning_dir / "episodes").exists()
        else 0,
        "decision_traces": len(list((learning_dir / "decision-traces").glob("*.md")))
        if (learning_dir / "decision-traces").exists()
        else 0,
        "triples": count_nonempty_lines(learning_dir / "triples" / "facts.jsonl"),
        "lessons": len(list((learning_dir / "lessons").glob("*.md")))
        if (learning_dir / "lessons").exists()
        else 0,
        "collections": len(list((learning_dir / "collections").glob("*.md")))
        if (learning_dir / "collections").exists()
        else 0,
        "procedures": count_procedures(learning_dir / "procedures" / "index.md"),
        "beliefs": count_beliefs(learning_dir / "beliefs" / "current.md"),
    }

    beliefs = active_beliefs(learning_dir / "beliefs" / "current.md", args.limit)
    recent_episodes = recent_markdown(learning_dir / "episodes", args.limit)
    recent_lessons = recent_markdown(learning_dir / "lessons", args.limit)
    recent_traces = recent_markdown(learning_dir / "decision-traces", args.limit)

    write_readme(
        learning_dir,
        summary,
        beliefs,
        recent_episodes,
        recent_lessons,
        recent_traces,
    )

    state = {
        "version": 2,
        "lastRunAt": now_iso(),
        "summary": summary,
        "files": file_inventory(learning_dir),
        "sessions": session_map(learning_dir),
    }
    state_path = learning_dir / ".state" / "index.json"
    state_path.parent.mkdir(parents=True, exist_ok=True)
    state_path.write_text(json.dumps(state, indent=2) + "\n", encoding="utf-8")

    print(f"Refreshed {learning_dir / 'README.md'}")
    print(f"Refreshed {state_path}")


if __name__ == "__main__":
    main()
