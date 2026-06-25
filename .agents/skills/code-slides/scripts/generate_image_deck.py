#!/usr/bin/env python3
"""Generate AI-image slide deck assets from markdown or JSON content specs."""

from __future__ import annotations

import argparse
import base64
import json
import os
import re
import sys
import time
import urllib.request
from pathlib import Path

STYLE_PRESETS = {
    "whiteboard": (
        "Hand-drawn whiteboard illustration style presentation slide. "
        "Black ink sketch on clean white background. Orange accent color for highlights. "
        "Bold hand-lettered headers. Simple stick figures and icons. "
        "No photos, no gradients, no 3D effects. Minimalist sketch aesthetic. "
    ),
    "corporate": (
        "Clean professional corporate presentation slide. "
        "Navy blue and white color scheme with gold accents. Modern sans-serif typography. "
        "Flat design icons. Subtle geometric patterns in background. Professional data visualization style. "
        "No clip art. "
    ),
    "minimalist": (
        "Ultra-minimalist presentation slide. Pure white background. Single accent color in electric blue. "
        "Large bold sans-serif text. Maximum negative space. One idea per slide. "
        "No decorative elements. Keynote-style restraint. "
    ),
    "dark-tech": (
        "Dark-themed tech presentation slide. Near-black background. Neon green accent color. "
        "Monospace accents with clean supporting typography. Terminal and developer-tool aesthetic. "
        "Subtle grid lines. Futuristic but readable. "
    ),
    "playful": (
        "Colorful playful presentation slide. Bright pastel color palette. Rounded shapes and soft edges. "
        "Fun hand-drawn doodle elements. Friendly sans-serif font. Energetic but not childish. "
        "Modern startup aesthetic. "
    ),
    "editorial": (
        "Editorial magazine-style presentation slide. Black and white with one red spot color. "
        "Strong typographic hierarchy. Pull-quote style layouts. Thin serif headers with clean sans-serif body. "
        "High contrast and premium print feel. "
    ),
}


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description="Generate AI-image slide deck assets")
    parser.add_argument("--content", required=True, help="Markdown or JSON slide spec")
    parser.add_argument("--style", default="whiteboard", help="Preset name or custom style prefix")
    parser.add_argument("--title", default="Generated Image Deck", help="Deck title")
    parser.add_argument("--aspect", default="16:9", help="Image aspect ratio")
    parser.add_argument(
        "--model",
        default="imagen-4.0-generate-001",
        help="Imagen model name used for rendering",
    )
    parser.add_argument("--output-dir", default="./generated-slides", help="Output directory")
    parser.add_argument("--slides", help="Comma-separated slide numbers to regenerate")
    parser.add_argument(
        "--dry-run",
        action="store_true",
        help="Write normalized content and prompt plan without rendering images",
    )
    parser.add_argument(
        "--api-key-env",
        default="GEMINI_API_KEY",
        help="Environment variable holding the Gemini API key",
    )
    return parser.parse_args()


def slugify(value: str) -> str:
    value = value.strip().lower()
    value = re.sub(r"[^a-z0-9]+", "-", value)
    value = re.sub(r"-+", "-", value).strip("-")
    return value or "slide"


def stringify(value: object) -> str:
    if value is None:
        return ""
    if isinstance(value, str):
        return value.strip()
    if isinstance(value, list):
        parts = [stringify(entry) for entry in value]
        return "; ".join(part for part in parts if part)
    return str(value).strip()


def parse_markdown_slides(content: str) -> list[dict[str, str]]:
    sections = [section.strip() for section in re.split(r"(?m)^\s*---\s*$", content) if section.strip()]
    slides: list[dict[str, str]] = []

    for index, section in enumerate(sections, start=1):
        title = ""
        body_lines: list[str] = []
        visual_cues = ""

        for raw_line in section.splitlines():
            line = raw_line.strip()
            if not line:
                continue
            if line.startswith("#") and not title:
                title = line.lstrip("#").strip()
                continue
            if line.lower().startswith("visual cues:"):
                visual_cues = line.split(":", 1)[1].strip()
                continue
            body_lines.append(line.lstrip("-* ").strip())

        slides.append(
            {
                "name": f"{index:02d}-{slugify(title or f'slide-{index}')}",
                "title": title or f"Slide {index}",
                "body": " ".join(part for part in body_lines if part),
                "visual_cues": visual_cues,
            }
        )

    return slides


def load_slides(path: Path) -> list[dict[str, object]]:
    if path.suffix.lower() == ".json":
        payload = json.loads(path.read_text(encoding="utf-8"))
        if isinstance(payload, dict):
            payload = payload.get("slides", [])
        if not isinstance(payload, list):
            raise ValueError("JSON content must be a list or an object with a top-level 'slides' list.")
        return payload

    return parse_markdown_slides(path.read_text(encoding="utf-8"))


def normalize_slide(index: int, raw_slide: dict[str, object]) -> dict[str, object]:
    title = stringify(raw_slide.get("title")) or f"Slide {index}"
    body = stringify(raw_slide.get("body"))
    visual_cues = stringify(
        raw_slide.get("visual_cues")
        or raw_slide.get("visualCues")
        or raw_slide.get("visual")
        or raw_slide.get("notes")
        or raw_slide.get("layout")
    )
    prompt = stringify(raw_slide.get("prompt"))

    if not prompt:
        prompt_parts = [f'Title: "{title}".']
        if body:
            prompt_parts.append(f"Body: {body}.")
        if visual_cues:
            prompt_parts.append(f"Visual cues: {visual_cues}.")
        prompt_parts.append("Compose this as a presentation slide with clear hierarchy and readable text.")
        prompt = " ".join(prompt_parts)

    return {
        "index": index,
        "name": stringify(raw_slide.get("name")) or f"{index:02d}-{slugify(title)}",
        "title": title,
        "body": body,
        "visual_cues": visual_cues,
        "prompt": prompt,
    }


def resolve_style_prefix(style: str) -> str:
    return STYLE_PRESETS.get(style, style.strip() + " ")


def selected_indexes(raw: str | None) -> set[int] | None:
    if not raw:
        return None
    values = {int(item.strip()) for item in raw.split(",") if item.strip()}
    return values or None


def render_prompt_plan(title: str, style: str, aspect: str, slides: list[dict[str, object]]) -> str:
    lines = [
        "# Prompt Plan",
        "",
        f"- Title: {title}",
        f"- Style: {style}",
        f"- Aspect: {aspect}",
        "",
    ]
    for slide in slides:
        lines.extend(
            [
                f"## Slide {slide['index']}: {slide['name']}",
                "",
                f"- Title: {slide['title']}",
                f"- Visual cues: {slide['visual_cues'] or '(none supplied)'}",
                f"- Prompt: {slide['full_prompt']}",
                "",
            ]
        )
    return "\n".join(lines).rstrip() + "\n"


def generate_image(api_key: str, model: str, prompt: str, output_path: Path, aspect: str) -> int:
    url = f"https://generativelanguage.googleapis.com/v1beta/models/{model}:predict?key={api_key}"
    payload = {
        "instances": [{"prompt": prompt}],
        "parameters": {"sampleCount": 1, "aspectRatio": aspect},
    }
    request = urllib.request.Request(
        url,
        data=json.dumps(payload).encode("utf-8"),
        headers={"Content-Type": "application/json"},
        method="POST",
    )
    with urllib.request.urlopen(request, timeout=120) as response:
        data = json.load(response)

    predictions = data.get("predictions", [])
    if not predictions:
        raise ValueError(f"No predictions returned: {json.dumps(data)[:200]}")

    image_b64 = predictions[0].get("bytesBase64Encoded")
    if not image_b64:
        raise ValueError("Prediction did not contain image bytes.")

    output_path.write_bytes(base64.b64decode(image_b64))
    return output_path.stat().st_size


def main() -> int:
    args = parse_args()
    content_path = Path(args.content).resolve()
    output_dir = Path(args.output_dir).resolve()
    output_dir.mkdir(parents=True, exist_ok=True)

    if not content_path.exists():
        print(f"Content file not found: {content_path}", file=sys.stderr)
        return 1

    try:
        raw_slides = load_slides(content_path)
    except Exception as exc:
        print(f"Failed to load content: {exc}", file=sys.stderr)
        return 1

    slides = [normalize_slide(index, slide) for index, slide in enumerate(raw_slides, start=1)]
    chosen_indexes = selected_indexes(args.slides)
    style_prefix = resolve_style_prefix(args.style)

    selected_slides: list[dict[str, object]] = []
    for slide in slides:
        slide["full_prompt"] = style_prefix + str(slide["prompt"])
        if chosen_indexes and int(slide["index"]) not in chosen_indexes:
            continue
        selected_slides.append(slide)

    normalized_payload = {
        "title": args.title,
        "style": args.style,
        "aspect": args.aspect,
        "slides": slides,
    }
    (output_dir / "normalized-content.json").write_text(
        json.dumps(normalized_payload, indent=2),
        encoding="utf-8",
    )
    (output_dir / "prompt-plan.md").write_text(
        render_prompt_plan(args.title, args.style, args.aspect, selected_slides),
        encoding="utf-8",
    )

    summary = {
        "title": args.title,
        "style": args.style,
        "aspect": args.aspect,
        "model": args.model,
        "content": str(content_path),
        "output_dir": str(output_dir),
        "slides_total": len(slides),
        "slides_selected": [slide["index"] for slide in selected_slides],
        "dry_run": bool(args.dry_run),
        "images": [],
    }

    if args.dry_run:
        (output_dir / "summary.json").write_text(json.dumps(summary, indent=2), encoding="utf-8")
        print(f"Wrote prompt artifacts to {output_dir}")
        return 0

    api_key = os.environ.get(args.api_key_env)
    if not api_key:
        print(
            f"Missing API key. Set {args.api_key_env} or rerun with --dry-run.",
            file=sys.stderr,
        )
        return 1

    for slide in selected_slides:
        filename = f"{slide['name']}.png"
        output_path = output_dir / filename
        print(f"Generating slide {slide['index']}: {slide['name']}")
        try:
            size = generate_image(api_key, args.model, str(slide["full_prompt"]), output_path, args.aspect)
        except Exception as exc:
            print(f"Failed on slide {slide['index']}: {exc}", file=sys.stderr)
            continue

        summary["images"].append({"slide": slide["index"], "path": str(output_path), "bytes": size})
        time.sleep(1)

    (output_dir / "summary.json").write_text(json.dumps(summary, indent=2), encoding="utf-8")
    print(f"Wrote outputs to {output_dir}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
