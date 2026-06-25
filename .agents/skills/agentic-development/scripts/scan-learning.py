#!/usr/bin/env python3
"""
scan-learning.py
Search the learning/ folder for a topic and return matching excerpts.

Usage:
    python .agents/skills/continuous-learning/scripts/scan-learning.py "auth middleware"
    python .agents/skills/continuous-learning/scripts/scan-learning.py --type items "race condition"
    python .agents/skills/continuous-learning/scripts/scan-learning.py --type triples "BooleanModel"
    python .agents/skills/continuous-learning/scripts/scan-learning.py --type lessons "race condition"
    python .agents/skills/continuous-learning/scripts/scan-learning.py --expired   # Show expired triples
"""

import argparse
import json
import sys
from datetime import date
from pathlib import Path


LEARNING_DIR = Path("learning")
MEMORY_DIRS = {
    "items": LEARNING_DIR / "items",
    "episodes": LEARNING_DIR / "episodes",
    "decision-traces": LEARNING_DIR / "decision-traces",
    "lessons": LEARNING_DIR / "lessons",
    "collections": LEARNING_DIR / "collections",
    "procedures": LEARNING_DIR / "procedures",
    "beliefs": LEARNING_DIR / "beliefs",
}
TRIPLES_FILE = LEARNING_DIR / "triples" / "facts.jsonl"
ITEMS_DIR = LEARNING_DIR / "items"


def search_markdown_files(directory: Path, query: str) -> list[dict]:
    """Search markdown files in a directory for query terms."""
    results = []
    if not directory.exists():
        return results

    terms = query.lower().split()
    for md_file in sorted(directory.glob("**/*.md")):
        try:
            content = md_file.read_text(encoding="utf-8")
        except (OSError, UnicodeDecodeError):
            continue

        content_lower = content.lower()
        if not all(t in content_lower for t in terms):
            continue

        # Extract matching lines with context
        lines = content.splitlines()
        matches = []
        for i, line in enumerate(lines):
            if any(t in line.lower() for t in terms):
                start = max(0, i - 1)
                end = min(len(lines), i + 2)
                context = "\n".join(f"  {l}" for l in lines[start:end])
                matches.append(context)
            if len(matches) >= 3:
                break

        if matches:
            results.append({
                "file": str(md_file.relative_to(LEARNING_DIR)),
                "excerpts": matches,
            })

    return results


def search_items(query: str) -> list[dict]:
    """Search item JSONL files for query terms."""
    results = []
    if not ITEMS_DIR.exists():
        return results

    terms = query.lower().split()
    for item_file in sorted(ITEMS_DIR.glob("*.jsonl")):
        matches = []
        try:
            with item_file.open(encoding="utf-8") as f:
                for line_num, line in enumerate(f, 1):
                    line = line.strip()
                    if not line:
                        continue
                    try:
                        item = json.loads(line)
                    except json.JSONDecodeError:
                        continue
                    summary = item.get("summary") or item.get("content", "")
                    detail = item.get("detail", "")
                    haystack = f"{summary} {detail}".lower()
                    if all(t in haystack for t in terms):
                        matches.append({
                            "line": line_num,
                            "type": item.get("type", "?"),
                            "summary": summary[:120],
                            "detail": detail[:120],
                            "ts": item.get("ts", "?"),
                        })
        except (OSError, UnicodeDecodeError):
            continue

        if matches:
            results.append({
                "file": str(item_file.relative_to(LEARNING_DIR)),
                "matches": matches,
            })

    return results


def print_item_results(results: list[dict]) -> None:
    if not results:
        return
    count = sum(len(r["matches"]) for r in results)
    print(f"\n{'='*60}")
    print(f"  ITEMS ({count} match(es) across {len(results)} file(s))")
    print(f"{'='*60}")
    for r in results:
        print(f"\n  [{r['file']}]")
        for m in r["matches"]:
            print(f"  line {m['line']:4d} [{m['type']:12s}] {m['summary']}")
            if m["detail"]:
                print(f"            detail: {m['detail']}")
            print(f"            ts: {m['ts']}")


def search_triples(query: str, show_expired: bool = False) -> list[dict]:
    """Search triples JSONL for query terms."""
    results = []
    if not TRIPLES_FILE.exists():
        return results

    terms = query.lower().split() if query else []
    today = date.today().isoformat()

    with TRIPLES_FILE.open(encoding="utf-8") as f:
        for line_num, line in enumerate(f, 1):
            line = line.strip()
            if not line:
                continue
            try:
                triple = json.loads(line)
            except json.JSONDecodeError:
                continue

            # Handle expired check
            valid_until = triple.get("valid_until")
            is_expired = valid_until and valid_until < today

            if show_expired:
                if is_expired:
                    results.append({"line": line_num, "triple": triple, "expired": True})
                continue

            if is_expired:
                continue

            # Search filter
            if terms:
                haystack = " ".join([
                    triple.get("s", ""),
                    triple.get("p", ""),
                    triple.get("o", ""),
                ]).lower()
                if not all(t in haystack for t in terms):
                    continue

            results.append({"line": line_num, "triple": triple, "expired": False})

    return results


def print_markdown_results(results: list[dict], memory_type: str) -> None:
    if not results:
        return
    print(f"\n{'='*60}")
    print(f"  {memory_type.upper()} ({len(results)} file(s))")
    print(f"{'='*60}")
    for r in results:
        print(f"\n  [{r['file']}]")
        for excerpt in r["excerpts"]:
            print(excerpt)


def print_triple_results(results: list[dict], show_expired: bool = False) -> None:
    if not results:
        return
    label = "EXPIRED TRIPLES" if show_expired else "TRIPLES"
    print(f"\n{'='*60}")
    print(f"  {label} ({len(results)} match(es))")
    print(f"{'='*60}")
    for r in results:
        t = r["triple"]
        expired_marker = " [EXPIRED]" if r.get("expired") else ""
        print(
            f"  line {r['line']:4d} | {t.get('s','')} "
            f"—[{t.get('p','')}]→ {t.get('o','')}"
            f"  ({t.get('confidence','?')}{expired_marker}, {t.get('date','?')})"
        )


def main() -> None:
    parser = argparse.ArgumentParser(
        description="Search the learning/ folder for a topic."
    )
    parser.add_argument("query", nargs="?", default="", help="Search terms")
    parser.add_argument(
        "--type",
        choices=["items", "episodes", "decision-traces", "triples", "lessons", "collections", "procedures", "beliefs", "all"],
        default="all",
        help="Memory type to search (default: all)",
    )
    parser.add_argument(
        "--expired",
        action="store_true",
        help="Show expired triples instead of searching",
    )
    args = parser.parse_args()

    if not LEARNING_DIR.exists():
        print(f"Error: {LEARNING_DIR}/ not found. Run init-learning.sh first.", file=sys.stderr)
        sys.exit(1)

    query = args.query
    total_results = 0

    if args.expired:
        results = search_triples("", show_expired=True)
        print_triple_results(results, show_expired=True)
        total_results += len(results)
    else:
        if not query:
            parser.print_help()
            sys.exit(0)

        search_types = list(MEMORY_DIRS.keys()) + ["triples"] if args.type == "all" else [args.type]

        for mem_type in search_types:
            if mem_type == "triples":
                results = search_triples(query)
                print_triple_results(results)
                total_results += len(results)
            elif mem_type == "items":
                results = search_items(query)
                print_item_results(results)
                total_results += sum(len(r["matches"]) for r in results)
            elif mem_type in MEMORY_DIRS:
                results = search_markdown_files(MEMORY_DIRS[mem_type], query)
                print_markdown_results(results, mem_type)
                total_results += len(results)

    print(f"\n{'='*60}")
    if args.expired:
        print(f"  Total expired triples: {total_results}")
    else:
        print(f"  Total matches for '{query}': {total_results}")
    print(f"{'='*60}\n")


if __name__ == "__main__":
    main()
