# Backlink Hunter: Automated Broken-Link Outreach

Full specification for running an automated broken-link backlink building campaign as an AI agent.

**Credit:** Inspired by [@alex_prompter](https://x.com/alex_prompter/status/2017044857764688132), implemented in [ClawFlows registry](https://github.com/Cluka-399/clawflows-registry/tree/main/automations/backlink-hunter).

---

## What It Does

1. Scans high-authority resource pages in your niche for broken outbound links
2. Matches each dead link to the most relevant page from your content library
3. Finds the site owner's contact information
4. Drafts personalized outreach emails using an LLM
5. Sends emails and schedules a follow-up after 3 days

> One user reported 47 backlinks in a month running this weekly.

---

## Agent Parameters

| Parameter | Required | Default | Description |
|-----------|----------|---------|-------------|
| `niche_keywords` | ✅ | — | Keywords describing your content domain |
| `your_content_urls` | ✅ | — | Comma-separated URLs of your best content to pitch |
| `min_domain_authority` | ❌ | 30 | Skip sites below this DA threshold |
| `max_pages` | ❌ | 5 | Max resource pages to scan per run |
| `max_links_per_page` | ❌ | 15 | Max outbound links to check per page |

---

## Step-by-Step Workflow

### Step 1: Search for Resource Pages

Use Brave Search API (or any web search tool) to find resource/link pages:

```
Search queries (run all, deduplicate results):
  "{niche_keywords}" inurl:resources
  "{niche_keywords}" inurl:links
  "{niche_keywords}" "useful resources"
  "{niche_keywords}" "further reading"
  "{niche_keywords}" "recommended tools"
```

**Filter results:** Keep only pages with domain authority ≥ `min_domain_authority`. Exclude social media platforms (twitter.com, linkedin.com, facebook.com), CDN domains (cdn.*, assets.*), and the user's own domain.

**Output schema per page:**
```json
{
  "title": "Page title",
  "url": "https://example.com/resources",
  "domain": "example.com"
}
```

---

### Step 2: Extract Outbound Links

For each resource page:
1. Fetch full HTML with `web_fetch`
2. Extract all `<a href="...">` elements with their anchor text
3. Filter: keep only external HTTP(S) links, skip same-domain links, skip known social/CDN domains

**Python extraction pattern:**
```python
import re
from urllib.parse import urlparse

def extract_links(html, host_domain):
    pattern = r'<a\s+[^>]*href=["\']([^"\']+)["\'][^>]*>(.*?)</a>'
    matches = re.findall(pattern, html, re.IGNORECASE | re.DOTALL)
    links = []
    for url, anchor in matches:
        if not url.startswith('http'):
            continue
        parsed = urlparse(url)
        if parsed.netloc == host_domain:
            continue
        if any(s in parsed.netloc for s in ['twitter.com','linkedin.com','facebook.com','youtube.com']):
            continue
        links.append({"url": url, "anchor": re.sub('<[^>]+>', '', anchor).strip()})
    return links[:max_links_per_page]
```

---

### Step 3: Check for Broken Links

For each extracted link, issue an HTTP HEAD request:

```bash
curl -sI --max-time 10 --location "{url}" | head -1
```

**Broken = any of:** `HTTP/1.1 404`, `HTTP/2 404`, `HTTP/1.1 410`, `HTTP/2 410`, connection timeout (exit code non-zero), empty response.

**Output schema per broken link:**
```json
{
  "source_page": "https://example.com/resources",
  "source_domain": "example.com",
  "source_page_title": "Page title",
  "dead_url": "https://old-site.com/deleted-article",
  "anchor_text": "Ultimate Guide to Content Marketing",
  "http_status": 404
}
```

---

### Step 4: Match to Your Content

For each broken link, use an LLM to find the best replacement from `your_content_urls`:

**Prompt:**
```
You are an SEO specialist. A resource page has a broken link with this context:
- Anchor text: "{anchor_text}"
- Dead URL: "{dead_url}"
- Source page topic: "{source_page_title}"

From this list of content URLs, which one is the best semantic replacement?
{your_content_urls}

Respond with ONLY the best matching URL from the list, or "no_match" if none are suitable.
Criteria: topical overlap must be strong. Do not force a weak match.
```

Discard any result returning "no_match".

---

### Step 5: Find Contact Information

For each matched opportunity:

```
Search: site:{domain} contact OR email OR "get in touch"
Search: site:{domain} about
```

Look for:
1. Dedicated `/contact` page with email or form
2. Author bio with email address
3. Footer contact email
4. WHOIS registration email (last resort)

**Pattern for email extraction:**
```python
import re
email_pattern = r'[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}'
emails = re.findall(email_pattern, page_html)
# Filter out noreply, info@, support@ unless no other option
```

If no contact found: skip this opportunity, log it, move on.

---

### Step 6: Draft Outreach Email

Use an LLM to draft a personalized email for each opportunity:

**Prompt:**
```
You are an expert SEO outreach specialist. Draft a short, friendly email
to report a broken link and suggest a replacement.

Context:
- Site: {source_domain}
- Page with broken link: {source_page_title} ({source_page_url})
- Broken link anchor text: "{anchor_text}"
- Dead URL: {dead_url}
- Replacement content URL: {your_content_url}
- Replacement content title: [fetch or infer from URL]

Requirements:
- Subject line: mention the broken link and page name
- Body: 3-4 short paragraphs max
- Tone: helpful and professional, NOT salesy
- Mention ONE specific reason why your content is a strong replacement
- Do NOT use generic flattery ("amazing website", "great content")
- Do NOT explicitly ask for a link — let the value speak for itself
- Sign off with [Your name]

Output as JSON: {"subject": "...", "body": "..."}
```

**Fallback template** (when LLM unavailable):
```
Subject: Broken link on {source_page_title}

Hi,

I was browsing your {topic} resources page and noticed the link to
"{anchor_text}" appears to be broken (returns a 404 error).

I recently published a comprehensive resource on the same topic that
might serve as a useful replacement: {your_content_url}

Either way, thought you'd want to know about the broken link.

Best,
[Your name]
```

---

### Step 7: Send and Follow Up

**Initial send:** Send via email tool immediately after drafting.

**Follow-up (3–4 days later):**
```
Subject: Re: Broken link on {source_page_title}

Hi again,

Just wanted to follow up on my previous note about the broken link on
your resources page. Happy to answer any questions about the content.

Best,
[Your name]
```

**Hard limits:**
- Maximum **2 emails** per contact (initial + one follow-up)
- Never contact the same domain twice within 30 days
- Persist contacted domains to state file to enforce this

---

## State Management

Track campaign state to avoid duplicate outreach:

```json
{
  "contacted": {
    "example.com": {
      "date": "2026-03-20",
      "page": "https://example.com/resources",
      "status": "sent"
    }
  },
  "pending_followup": [
    {
      "domain": "other.com",
      "contact_email": "owner@other.com",
      "send_after": "2026-03-24",
      "subject": "Re: Broken link on...",
      "body": "..."
    }
  ]
}
```

Default state file path: `/tmp/backlink-hunter-state.json`

---

## Runtime Requirements

| Dependency | Purpose | Notes |
|------------|---------|-------|
| `web_search` | Find resource pages | Brave Search API (`BRAVE_API_KEY`) or equivalent |
| `web_fetch` / `curl` | Extract links, check status | HEAD requests for link health |
| `email` | Send outreach | SMTP or email tool |
| LLM access | Draft outreach emails | Any model; use AI Gateway `anthropic/claude-sonnet-4.6` |
| `jq` + `python3` | JSON processing (shell variant) | Optional if using Python implementation |

---

## Scheduling (Agentic / Automated)

Run weekly to avoid re-checking the same pages too often:

```yaml
# vercel.json cron
{
  "crons": [
    {
      "path": "/api/backlink-hunter",
      "schedule": "0 6 * * 1"
    }
  ]
}
```

Or via automation YAML trigger:
```yaml
trigger:
  schedule: "0 6 * * 1"  # Every Monday at 6am
```

---

## Expected Results

- Typical: 5–15 outreach emails per weekly run
- Response rate: 5–15% for well-personalized emails
- Conversion to backlink: 2–8% of contacts
- With consistent weekly runs: 20–50 new backlinks per month

---

## Integration with Existing Scripts

Use `scripts/backlinks.py` to audit your domain's existing backlink profile before running outreach — this shows you which content already attracts links (good candidates for replacement pitches) and which competitors' links you could try to replicate.

```bash
python3 scripts/backlinks.py "yourdomain.com" --limit 50
```
