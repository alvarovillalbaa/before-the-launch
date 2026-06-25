# Ingest Sources Playbook

Use this reference when an AI agent needs to fetch, parse, or compile content from a specific source type into the `raw/` intake layer before compiling it into the knowledge base.

Each section documents the preferred CLI toolchain, the normalized output format, and the downstream compilation contract. All collected material lands in `raw/` first. Compilation against `BRAIN.md` happens in a separate pass.

## General contract

For every source:

1. Fetch or extract the raw content using the source-appropriate tool.
2. Save the result to `raw/` as a plain markdown or text file with a descriptive slug: `raw/YYYY-MM-DD_source-type_slug.md`.
3. Prepend a short frontmatter block:
   ```
   source: <type>
   url: <original URL or ID>
   fetched: YYYY-MM-DD
   status: unprocessed
   ```
4. Run the standard absorb or compile pass against `BRAIN.md` to propagate the content into canonical knowledge pages.
5. After compilation, update the status field to `processed` or archive the file per the brain's retention rule.

---

## Twitter / X

Preferred CLI: `xurl`

`xurl` is a command-line interface for fetching X (Twitter) content via the X API v2. Install or verify with `which xurl`.

### Fetch commands

```sh
# Fetch a single tweet by ID
xurl tweet <tweet-id>

# Fetch a full conversation thread
xurl thread <tweet-id>

# Fetch recent tweets from a user
xurl profile <username> --limit 20

# Search recent tweets
xurl search "<query>" --limit 50

# Search with quality filter (high engagement only)
xurl search "<query>" --min-likes 10 --sort likes
```

### Research loop (adapted from x-research-skill)

When doing a multi-angle research pass rather than a single fetch:

1. **Decompose** — break the topic into 3–5 distinct sub-queries.
2. **Search** — run each sub-query with `xurl search "<q>" --limit 50 --min-likes 5`.
3. **Follow threads** — for high-engagement tweets, fetch the full thread with `xurl thread <id>`.
4. **Deep-dive linked content** — for tweets with URLs, fetch those URLs using the web or PDF ingestion pattern below.
5. **Synthesize** — compile results into one themed markdown research document.
6. **Save** — write the synthesis to `raw/YYYY-MM-DD_x-research_<slug>.md`.

### Noise reduction

- Append `-is:retweet` to all search queries unless retweets are explicitly wanted.
- Append `-is:reply` in quick-scan mode.
- Filter out crypto/spam topics by adding negation operators: `-bitcoin -nft -giveaway`.
- Use `--min-likes 10` as the default quality threshold; lower to 3 for niche topics.

### Watchlist pattern

For recurring monitoring, maintain a watchlist file at `raw/watchlist.json`:

```json
{
  "accounts": [
    { "username": "example", "note": "Why we follow", "addedAt": "YYYY-MM-DD" }
  ]
}
```

Poll watchlist on a schedule:

```sh
xurl profile $(jq -r '.accounts[].username' raw/watchlist.json) --limit 10
```

### Output format

Save each Twitter ingest to `raw/` as markdown:

```md
---
source: twitter
url: https://x.com/username/status/ID
fetched: YYYY-MM-DD
status: unprocessed
---

**@username** · YYYY-MM-DD · ❤️ N · 👁 N

Tweet text here.

[Tweet URL](https://x.com/username/status/ID)

---
[Thread or linked tweets below if applicable]
```

---

## LinkedIn

LinkedIn does not offer a public API for post or profile scraping. Use one of these approaches depending on access:

### Personal data export (recommended)

Download your own LinkedIn data from `Settings → Data Privacy → Get a copy of your data`. Unzip and find `posts.csv`, `messages.csv`, `connections.csv`, and `profile.json`. Place the relevant files in `raw/` for compilation.

### URL page capture

For any public LinkedIn post or profile URL, use `defuddle` or `curl` to capture the readable text:

```sh
defuddle parse "https://www.linkedin.com/posts/username_slug" --md \
  -o raw/YYYY-MM-DD_linkedin_slug.md
```

If `defuddle` cannot render the page (login wall), use `agent-browser` with an authenticated session:

```sh
agent-browser open "https://www.linkedin.com/posts/username_slug"
agent-browser get text "article"
```

Save the extracted text to `raw/` with the standard frontmatter and `source: linkedin`.

### Notes

- Respect LinkedIn's terms of service. Use these tools for your own content or for public research purposes only.
- LinkedIn profile pages often require login; prefer the data export for personal content.

---

## Web URLs

Preferred tool: `defuddle`

`defuddle` extracts the main article body from a web page and outputs clean markdown.

```sh
# Basic URL capture
defuddle parse "https://example.com/article" --md \
  -o raw/YYYY-MM-DD_web_slug.md

# Multiple URLs from a list file
while IFS= read -r url; do
  slug=$(echo "$url" | sed 's|https\?://||;s|/|-|g' | cut -c1-60)
  defuddle parse "$url" --md -o "raw/$(date +%F)_web_${slug}.md"
done < raw/pending-urls.txt
```

Fallback when `defuddle` is unavailable:

```sh
curl -s "https://example.com/article" | pandoc -f html -t markdown \
  -o raw/YYYY-MM-DD_web_slug.md
```

For dynamic or authenticated pages use `agent-browser`:

```sh
agent-browser open "https://example.com/dashboard"
agent-browser get text "main"
```

### Bookmarks batch ingestion

If you export browser bookmarks (e.g., Netscape HTML format), convert them:

```sh
# Extract all URLs from a bookmarks HTML file
grep -oP 'HREF="\K[^"]+' bookmarks.html > raw/pending-urls.txt
```

Then run the URL capture loop above.

---

## YouTube Videos

Preferred tool: `yt-dlp`

Install: `pip install yt-dlp` or `brew install yt-dlp`

### Transcript extraction (preferred — no download needed)

```sh
# Fetch auto-generated subtitles as SRT
yt-dlp --skip-download --write-auto-sub --sub-lang en \
  --sub-format srt -o "raw/%(upload_date)s_youtube_%(title)s" \
  "https://www.youtube.com/watch?v=VIDEO_ID"

# Convert SRT to plain text (strip timestamps)
sed '/^[0-9]/d;/^$/d;s/<[^>]*>//g' raw/*.srt > raw/YYYY-MM-DD_youtube_slug.txt
```

### Metadata only

```sh
yt-dlp --dump-json --no-download "https://www.youtube.com/watch?v=VIDEO_ID" \
  | jq '{title, uploader, upload_date, description, duration, view_count, like_count}' \
  > raw/YYYY-MM-DD_youtube_meta_slug.json
```

### Playlist ingestion

```sh
yt-dlp --skip-download --write-auto-sub --sub-lang en \
  --sub-format srt --yes-playlist \
  -o "raw/%(upload_date)s_%(title)s" \
  "https://www.youtube.com/playlist?list=PLAYLIST_ID"
```

### Output format

After extraction, prepend the standard frontmatter to the transcript file:

```md
---
source: youtube
url: https://www.youtube.com/watch?v=VIDEO_ID
title: Video Title
channel: Channel Name
published: YYYY-MM-DD
fetched: YYYY-MM-DD
duration_min: N
status: unprocessed
---

[Transcript follows]
```

During compilation, treat each logical section of the transcript (typically every 3–5 minutes of spoken content) as a separate extractable segment.

---

## Research Papers and PDFs

Preferred tools: `pdftotext` (poppler), `mutool` (mupdf), or Python `pdfplumber`

### Text extraction

```sh
# Single PDF — plain text
pdftotext input.pdf raw/YYYY-MM-DD_paper_slug.txt

# Single PDF — preserve layout (useful for tables)
pdftotext -layout input.pdf raw/YYYY-MM-DD_paper_slug.txt

# Using mutool (mupdf)
mutool draw -F txt input.pdf > raw/YYYY-MM-DD_paper_slug.txt
```

Python fallback using `pdfplumber`:

```python
import pdfplumber, sys, pathlib
pdf = pathlib.Path(sys.argv[1])
out = pathlib.Path("raw") / f"{pdf.stem}.txt"
with pdfplumber.open(pdf) as p:
    out.write_text("\n\n".join(page.extract_text() or "" for page in p.pages))
```

### Metadata extraction

```sh
pdfinfo input.pdf  # title, author, subject, keywords, pages, date
```

### Output format

```md
---
source: pdf
original_file: filename.pdf
title: Paper Title
authors: Author 1, Author 2
published: YYYY-MM-DD
doi: 10.xxxx/yyyy
fetched: YYYY-MM-DD
pages: N
status: unprocessed
---

[Extracted text follows]
```

### Compilation notes for papers

When absorbing a research paper into the knowledge base:

- Extract: abstract, problem statement, key claims, methods, results, limitations, and citations.
- Create or update a `knowledge/<domain>/papers/<slug>.md` page with the paper's canonical summary.
- Link cited papers that already exist as canonical pages.
- Note whether the paper's claims confirm, extend, or contradict existing canonical knowledge.

---

## Images and Figures

When raw material includes images, screenshots, charts, or figures that carry semantic content:

1. Store images alongside the corresponding markdown file in `raw/assets/`.
2. Reference them in the markdown file using a relative path: `![Alt text](assets/filename.png)`.
3. During compilation, the assistant should inspect the image and extract key information (labels, data, layout) into the canonical page text so the knowledge is not image-locked.

For screenshots of text (e.g., Twitter screenshots, PDF screenshots):

```sh
# macOS OCR via Shortcuts or tesseract
tesseract screenshot.png raw/YYYY-MM-DD_ocr_slug -l eng
```

---

## Plain Markdown and Text Files

For `.md`, `.txt`, and `.rst` files already in `raw/`:

- These are the simplest case — no extraction step needed.
- Ensure the standard frontmatter block is present; add it if missing.
- Proceed directly to the compile pass against `BRAIN.md`.

For bulk file imports:

```sh
# Add frontmatter to all .md files in raw/ that are missing it
for f in raw/*.md; do
  head -1 "$f" | grep -q "^---" && continue
  tmp=$(mktemp)
  printf -- "---\nsource: import\nfetched: $(date +%F)\nstatus: unprocessed\n---\n\n" | cat - "$f" > "$tmp"
  mv "$tmp" "$f"
done
```

---

## Raw Folder Compilation Agent Loop

When an AI agent should process the entire `raw/` folder and compile everything into canonical knowledge, use this loop:

```
1. List all files in raw/ where status != processed.
2. For each file:
   a. Detect type from the source field or file extension.
   b. If text/markdown: proceed to extract.
   c. If PDF: run pdftotext and write extracted text into raw/ alongside the original.
   d. If SRT/transcript: strip timestamps and clean.
   e. If JSON: parse fields.
3. Extract: entities, concepts, claims, decisions, procedures, open questions, dates.
4. Read BRAIN.md and relevant INDEX.md pages.
5. Search for existing canonical pages that should absorb the new information.
6. Update or create canonical pages under knowledge/.
7. Refresh INDEX.md, logs/YYYY-MM-DD.md, and any synthesis pages.
8. Mark each raw/ file as processed.
9. Report: files processed, pages created, pages updated, contradictions found, open threads.
```

### Type detection heuristics

| Extension / source field | Action |
|---|---|
| `.md`, `.txt`, `.rst` | Direct absorb |
| `.pdf` | `pdftotext` → absorb |
| `.srt`, `.vtt` | Strip timestamps → absorb |
| `.json` | Parse fields → absorb |
| `.csv` | Convert rows → absorb |
| `.png`, `.jpg`, `.gif` | OCR or vision inspect → absorb |
| `source: twitter` | Treat as tweet corpus |
| `source: youtube` | Treat as transcript |
| `source: linkedin` | Treat as professional content |
| `source: pdf` | Already extracted text |
| `source: web` | Article body text |

---

## Ingestion Priority Rules

When the raw/ queue is large, prioritize in this order:

1. Items flagged with `priority: high` in frontmatter.
2. Items with the most recent `fetched` date.
3. Items from primary sources (papers, official docs) before secondary (social media commentary).
4. Items directly linked from existing canonical pages (they extend something already known).
5. Items on watchlist accounts or monitored topics.
