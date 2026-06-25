# PPT Conversion

Use this workflow when the user provides a `.ppt` or `.pptx` file and wants a web-based deck.

## Workflow

1. Extract slide text, titles, notes, and embedded images with `python-pptx`.
2. Save images into an `assets/` directory next to the rebuilt deck.
3. Summarize the extracted slide structure for the user and confirm it matches the source.
4. Rebuild the deck in the chosen mode: single-file HTML, multi-file HTML, or React/TypeScript.
5. Preserve slide order, major hierarchy, and any meaningful speaker notes.
6. Re-apply style, viewport-fit, and navigation rules rather than copying PowerPoint layout mistakes directly.

## Extraction Example

```python
from pathlib import Path
from pptx import Presentation


def extract_pptx(file_path: str, output_dir: str) -> list[dict]:
    presentation = Presentation(file_path)
    output = Path(output_dir)
    assets_dir = output / "assets"
    assets_dir.mkdir(parents=True, exist_ok=True)
    slides = []

    for slide_index, slide in enumerate(presentation.slides, start=1):
        slide_data = {
            "number": slide_index,
            "title": "",
            "content": [],
            "images": [],
            "notes": "",
        }

        for shape in slide.shapes:
            if getattr(shape, "has_text_frame", False):
                text = shape.text.strip()
                if not text:
                    continue
                if shape == slide.shapes.title:
                    slide_data["title"] = text
                else:
                    slide_data["content"].append(text)

            if getattr(shape, "shape_type", None) == 13:
                image = shape.image
                image_name = f"slide{slide_index}_img{len(slide_data['images']) + 1}.{image.ext}"
                image_path = assets_dir / image_name
                image_path.write_bytes(image.blob)
                slide_data["images"].append(str(Path("assets") / image_name))

        if slide.has_notes_slide:
            slide_data["notes"] = slide.notes_slide.notes_text_frame.text.strip()

        slides.append(slide_data)

    return slides
```

## Confirmation Prompt

Before rebuilding, summarize the extracted structure in plain language, for example:

- `Slide 1: Title, 3 bullets, 1 image`
- `Slide 2: Feature comparison, no images`
- `Slide 3: Timeline, speaker notes present`

Then confirm whether to preserve the original pacing or tighten the story for the web version.
