# Second Brain

Build and maintain an AFS-aligned, storage-agnostic knowledge base that compounds over time instead of resetting each session.

## Use this for

- turning scattered notes, meetings, chats, research, and files into a maintained wiki
- routing that wiki through `BRAIN.md` boundaries so one workspace can host multiple second brains safely
- consolidating duplicates and preserving provenance
- restoring continuity at the start of a session
- generating outputs, reports, or artifacts grounded in a living knowledge base

## Install

```bash
npx -y skills add ./learning-system/skills/second-brain
mkdir -p ~/.codex/skills
cp -R learning-system/skills/second-brain ~/.codex/skills/
```

Codex `$skill-installer` path:

```text
https://github.com/alvarovillalbaa/plugins/tree/main/learning-system/skills/second-brain
```

## What is bundled

- `references/` — operational modes, page model, wiki compiler, Obsidian adapter, and **ingest sources** (Twitter/xurl, YouTube, LinkedIn, web URLs, PDFs, images)
- `agents/openai.yaml` — Second Brain agent definition
- `commands/ingest.md` — `/ingest` command for any source type
- `commands/compile-raw.md` — `/compile-raw` command for batch processing the `raw/` folder

This skill is one of the strongest starting points in the learning-system plugin. Read [`SKILL.md`](./SKILL.md) before adapting it to any tool-specific setup.
