# Distribution and Installation

Package this skill so users can adopt it through tooling or manual install.

## Vercel Skills CLI (`npx skills add`)

Use repository URLs that contain `skills/code-slides/SKILL.md`.

```bash
npx skills add https://github.com/<owner>/<repo>
```

If the CLI shows multiple skills, select `code-slides`.

## Git Clone + Manual Install

```bash
git clone https://github.com/<owner>/<repo>.git
cd <repo>
```

Copy `skills/code-slides` into the local skill registry used by your assistant runtime.

Use `scripts/install_local.sh` only when your environment supports that workflow.

## Validation

Run skill validation before publishing. Use the validator bundled with your local skill-authoring toolchain.

If you maintain repo-specific install or validation commands, document them in a separate integration guide rather than here.

## Publishing Checklist

1. Confirm `SKILL.md` frontmatter is valid.
2. Confirm `agents/openai.yaml` is up to date.
3. Confirm scripts run with `python3`/`bash` without external assumptions.
4. Confirm template assets include both HTML default and React/TS explicit-mode starters.
5. Confirm the AI image deck flow ships `scripts/generate_image_deck.py` plus its references/examples.
