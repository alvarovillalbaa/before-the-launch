#!/usr/bin/env python3

from __future__ import annotations

import argparse
import json
import re
from datetime import datetime, timezone
from pathlib import Path


ITEM_TYPES = (
    "observation",
    "failure",
    "fix",
    "decision",
    "discovery",
    "warning",
)
SESSION_PATTERN = re.compile(r"^(?P<date>\d{4}-\d{2}-\d{2})-(?P<seq>\d{3})$")


def now_utc() -> datetime:
    return datetime.now(timezone.utc).replace(microsecond=0)


def isoformat(value: datetime) -> str:
    return value.isoformat().replace("+00:00", "Z")


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(
        description="Append an item to learning/items for the current or chosen session."
    )
    parser.add_argument(
        "--path",
        default="learning",
        help="Learning directory (default: learning)",
    )
    parser.add_argument(
        "--type",
        choices=ITEM_TYPES,
        required=True,
        help="Item type",
    )
    parser.add_argument(
        "--summary",
        required=True,
        help="Short description of the signal",
    )
    parser.add_argument(
        "--detail",
        default=None,
        help="Optional longer detail",
    )
    parser.add_argument(
        "--tag",
        dest="tags",
        action="append",
        default=[],
        help="Tag to attach to the item; repeat as needed",
    )
    parser.add_argument(
        "--file",
        dest="files",
        action="append",
        default=[],
        help="Relevant file path; repeat as needed",
    )
    parser.add_argument(
        "--command",
        dest="commands",
        action="append",
        default=[],
        help="Relevant command; repeat as needed",
    )
    parser.add_argument(
        "--session",
        default=None,
        help="Explicit session id in YYYY-MM-DD-NNN form",
    )
    parser.add_argument(
        "--new-session",
        action="store_true",
        help="Create a new session id for today instead of using the latest one",
    )
    return parser.parse_args()


def require_learning_dir(path: Path) -> None:
    if not path.exists():
        raise SystemExit(f"{path}/ not found. Run init-learning first.")


def session_ids_for_day(learning_dir: Path, day: str) -> list[str]:
    session_ids: set[str] = set()
    locations = (
        learning_dir / "items",
        learning_dir / "episodes",
        learning_dir / "decision-traces",
    )
    for base in locations:
        if not base.exists():
            continue
        for child in base.iterdir():
            stem = child.stem
            if stem.startswith(day + "-") and SESSION_PATTERN.match(stem):
                session_ids.add(stem)
    return sorted(session_ids)


def choose_session(learning_dir: Path, explicit: str | None, new_session: bool) -> str:
    if explicit:
        if not SESSION_PATTERN.match(explicit):
            raise SystemExit("Invalid --session value. Use YYYY-MM-DD-NNN.")
        return explicit

    today = now_utc().strftime("%Y-%m-%d")
    existing = session_ids_for_day(learning_dir, today)
    if existing and not new_session:
        return existing[-1]

    next_seq = 1
    if existing:
        next_seq = max(int(session_id[-3:]) for session_id in existing) + 1
    return f"{today}-{next_seq:03d}"


def next_item_number(path: Path) -> int:
    if not path.exists():
        return 1
    with path.open(encoding="utf-8") as handle:
        return sum(1 for line in handle if line.strip()) + 1


def build_record(args: argparse.Namespace, session_id: str, ordinal: int) -> dict:
    record = {
        "version": 1,
        "id": f"{session_id}-{ordinal:04d}",
        "session": session_id,
        "type": args.type,
        "summary": args.summary,
        "ts": isoformat(now_utc()),
    }
    if args.detail:
        record["detail"] = args.detail
    if args.tags:
        record["tags"] = args.tags
    if args.files:
        record["files"] = args.files
    if args.commands:
        record["commands"] = args.commands
    return record


def main() -> None:
    args = parse_args()
    learning_dir = Path(args.path)
    require_learning_dir(learning_dir)

    items_dir = learning_dir / "items"
    items_dir.mkdir(parents=True, exist_ok=True)

    session_id = choose_session(learning_dir, args.session, args.new_session)
    item_path = items_dir / f"{session_id}.jsonl"
    ordinal = next_item_number(item_path)
    record = build_record(args, session_id, ordinal)

    with item_path.open("a", encoding="utf-8") as handle:
        handle.write(json.dumps(record, ensure_ascii=True) + "\n")

    print(f"Appended {record['id']} to {item_path}")


if __name__ == "__main__":
    main()
