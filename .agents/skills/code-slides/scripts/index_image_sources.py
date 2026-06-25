#!/usr/bin/env python3
"""Index local and external image sources in a repository."""

from __future__ import annotations

import argparse
import json
import re
from pathlib import Path

IMAGE_EXTENSIONS = {
    ".png",
    ".jpg",
    ".jpeg",
    ".gif",
    ".svg",
    ".webp",
    ".avif",
    ".bmp",
}

TEXT_EXTENSIONS = {
    ".md",
    ".txt",
    ".html",
    ".css",
    ".js",
    ".ts",
    ".tsx",
    ".jsx",
    ".json",
    ".yml",
    ".yaml",
    ".py",
    ".go",
    ".rb",
    ".java",
    ".kt",
    ".swift",
    ".vue",
    ".svelte",
}

IGNORED_DIRS = {
    ".git",
    "node_modules",
    ".next",
    "dist",
    "build",
    "coverage",
}

URL_PATTERN = re.compile(r"https?://[^\s\"'<>]+")


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description="Index image assets in a repository")
    parser.add_argument("--repo-root", required=True, help="Repository root path")
    parser.add_argument("--output", help="JSON output file path (prints to stdout if omitted)")
    parser.add_argument(
        "--max-file-size",
        type=int,
        default=1_000_000,
        help="Skip text files larger than this size in bytes",
    )
    return parser.parse_args()


def should_skip(path: Path) -> bool:
    return any(part in IGNORED_DIRS for part in path.parts)


def looks_like_image_url(url: str) -> bool:
    lowered = url.lower()
    if any(lowered.endswith(ext) for ext in IMAGE_EXTENSIONS):
        return True

    image_host_markers = (
        "images.",
        "img.",
        "cloudfront.net",
        "s3.amazonaws.com",
        "blob.core.windows.net",
        "storage.googleapis.com",
        "res.cloudinary.com",
    )
    return any(marker in lowered for marker in image_host_markers)


def index_local_images(root: Path) -> list[str]:
    results: list[str] = []
    for path in root.rglob("*"):
        if should_skip(path):
            continue
        if path.is_file() and path.suffix.lower() in IMAGE_EXTENSIONS:
            results.append(str(path.relative_to(root)))
    return sorted(set(results))


def index_external_images(root: Path, max_file_size: int) -> list[dict[str, str]]:
    results: list[dict[str, str]] = []
    for path in root.rglob("*"):
        if should_skip(path):
            continue
        if not path.is_file() or path.suffix.lower() not in TEXT_EXTENSIONS:
            continue
        if path.stat().st_size > max_file_size:
            continue

        try:
            content = path.read_text(encoding="utf-8")
        except UnicodeDecodeError:
            continue

        for url in URL_PATTERN.findall(content):
            if looks_like_image_url(url):
                results.append(
                    {
                        "url": url,
                        "found_in": str(path.relative_to(root)),
                    }
                )

    deduped = {(item["url"], item["found_in"]): item for item in results}
    return sorted(deduped.values(), key=lambda i: (i["url"], i["found_in"]))


def main() -> int:
    args = parse_args()
    root = Path(args.repo_root).resolve()

    if not root.exists() or not root.is_dir():
        raise SystemExit(f"Invalid --repo-root: {root}")

    report = {
        "repo_root": str(root),
        "local_images": index_local_images(root),
        "external_image_urls": index_external_images(root, args.max_file_size),
    }
    report["counts"] = {
        "local_images": len(report["local_images"]),
        "external_image_urls": len(report["external_image_urls"]),
    }

    output_json = json.dumps(report, indent=2)

    if args.output:
        Path(args.output).write_text(output_json + "\n", encoding="utf-8")
        print(f"Wrote image index to {args.output}")
    else:
        print(output_json)

    return 0


if __name__ == "__main__":
    raise SystemExit(main())
