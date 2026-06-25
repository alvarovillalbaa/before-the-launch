#!/usr/bin/env python3
"""Scaffold a code-slides deck from bundled templates."""

from __future__ import annotations

import argparse
import re
import shutil
import sys
from pathlib import Path

TEXT_EXTENSIONS = {
    ".html",
    ".css",
    ".js",
    ".json",
    ".md",
    ".ts",
    ".tsx",
    ".txt",
}


def slugify(value: str) -> str:
    value = value.strip().lower()
    value = re.sub(r"[^a-z0-9]+", "-", value)
    value = re.sub(r"-+", "-", value).strip("-")
    return value or "code-slides-deck"


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description="Scaffold a code-slides deck")
    parser.add_argument("--mode", choices=["html", "react-ts"], required=True)
    parser.add_argument("--output", required=True, help="Output directory for the deck")
    parser.add_argument("--title", default="Code Slides Deck")
    parser.add_argument("--deck-id", help="Deck identifier for remote sync")
    parser.add_argument("--nav-position", choices=["right", "bottom"], default="right")
    parser.add_argument(
        "--component-lib",
        choices=["none", "shadcn", "radix", "headless"],
        default="none",
        help="Only meaningful for react-ts mode",
    )
    parser.add_argument(
        "--force",
        action="store_true",
        help="Overwrite output directory if it already exists",
    )
    return parser.parse_args()


def ensure_output_dir(output_dir: Path, force: bool) -> None:
    if output_dir.exists():
        if not force:
            raise FileExistsError(
                f"Output directory already exists: {output_dir}. Use --force to overwrite."
            )
        shutil.rmtree(output_dir)
    output_dir.mkdir(parents=True, exist_ok=True)


def copy_template(template_dir: Path, output_dir: Path) -> None:
    for source in template_dir.rglob("*"):
        relative_path = source.relative_to(template_dir)
        destination = output_dir / relative_path
        if source.is_dir():
            destination.mkdir(parents=True, exist_ok=True)
            continue
        destination.parent.mkdir(parents=True, exist_ok=True)
        shutil.copy2(source, destination)


def apply_tokens(output_dir: Path, replacements: dict[str, str]) -> None:
    for path in output_dir.rglob("*"):
        if path.suffix.lower() not in TEXT_EXTENSIONS or not path.is_file():
            continue
        content = path.read_text(encoding="utf-8")
        for token, replacement in replacements.items():
            content = content.replace(token, replacement)
        path.write_text(content, encoding="utf-8")


def main() -> int:
    args = parse_args()

    script_dir = Path(__file__).resolve().parent
    skill_dir = script_dir.parent
    template_dir = skill_dir / "templates" / args.mode
    output_dir = Path(args.output).resolve()

    if not template_dir.exists():
        print(f"Template directory not found: {template_dir}", file=sys.stderr)
        return 1

    if args.mode == "html" and args.component_lib != "none":
        print("Warning: --component-lib is ignored in html mode.", file=sys.stderr)

    deck_id = args.deck_id or slugify(args.title)

    try:
        ensure_output_dir(output_dir, args.force)
    except FileExistsError as exc:
        print(exc, file=sys.stderr)
        return 1

    copy_template(template_dir, output_dir)

    replacements = {
        "__DECK_TITLE__": args.title,
        "__DECK_ID__": deck_id,
        "__NAV_POSITION__": args.nav_position,
        "__COMPONENT_LIBRARY__": args.component_lib,
    }
    apply_tokens(output_dir, replacements)

    print(f"Scaffolded {args.mode} deck at {output_dir}")
    print(f"Title: {args.title}")
    print(f"Deck ID: {deck_id}")
    print(f"Navigation position: {args.nav_position}")
    if args.mode == "react-ts":
        print(f"Component library preference: {args.component_lib}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
