# Technical SEO: Deep Reference

Complete technical audit checklist and implementation patterns.

---

## Crawlability Audit

### robots.txt

**Location:** `https://yourdomain.com/robots.txt`

**Check:**
- Does not disallow important pages (product pages, blog posts, landing pages)
- Does not disallow CSS/JS files that render important content
- References sitemap location
- No wildcard rules that accidentally block valuable content

**Common mistakes:**
```
# Bad: blocks CSS/JS needed for rendering
Disallow: /assets/

# Bad: accidentally blocks product pages
Disallow: /product

# Good: only blocks admin and session URLs
User-agent: *
Disallow: /admin/
Disallow: /checkout/cart
Disallow: /*?session_id=
Sitemap: https://yourdomain.com/sitemap.xml
```

**For Next.js:** Use `robots.ts` in the app directory:
```ts
// app/robots.ts
import { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/admin/', '/api/'],
    },
    sitemap: 'https://yourdomain.com/sitemap.xml',
  }
}
```

### XML Sitemap

**Requirements:**
- Maximum 50,000 URLs per sitemap file
- Maximum 50MB uncompressed
- All URLs use canonical versions (https, www or non-www consistently)
- Only indexable pages (no noindex, no 301s, no 404s)
- `<lastmod>` dates are accurate, not just today's date
- Submitted to Google Search Console and Bing Webmaster Tools

**Sitemap index for large sites:**
```xml
<?xml version="1.0" encoding="UTF-8"?>
<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <sitemap>
    <loc>https://yourdomain.com/sitemap-blog.xml</loc>
    <lastmod>2024-01-01</lastmod>
  </sitemap>
  <sitemap>
    <loc>https://yourdomain.com/sitemap-products.xml</loc>
    <lastmod>2024-01-01</lastmod>
  </sitemap>
</sitemapindex>
```

**For Next.js:** Use `sitemap.ts`:
```ts
// app/sitemap.ts
import { MetadataRoute } from 'next'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const posts = await fetchAllPosts()

  return [
    {
      url: 'https://yourdomain.com',
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 1,
    },
    ...posts.map(post => ({
      url: `https://yourdomain.com/blog/${post.slug}`,
      lastModified: new Date(post.updatedAt),
      changeFrequency: 'monthly' as const,
      priority: 0.8,
    })),
  ]
}
```

### Redirect Chains

**Problem:** A→B→C wastes crawl budget and dilutes link equity.

**Detection:** Screaming Frog → Response Codes → filter 3xx → check "Redirect To" column for chains

**Fix:** Update the original redirect to point directly to the final destination:
- A→B→C becomes A→C
- Update internal links pointing to A or B to point to C
- Update any external link sources if possible

**Common causes:**
- HTTP → HTTPS + www → non-www in separate rules
- Old CMS slugs not updated after migration
- Marketing campaign URLs never cleaned up

### Crawl Budget Optimization

Only relevant for large sites (50,000+ pages).

**Crawl budget wasters to eliminate:**
- Faceted navigation without noindex/canonical (`/category?color=red&size=large`)
- Session IDs in URLs (`/page?PHPSESSID=abc123`)
- Infinite scroll with no pagination
- Print-friendly versions of pages
- Staging/development pages indexed accidentally
- Duplicate content from trailing slash inconsistency

**Solutions:**
- Use `rel="canonical"` on faceted navigation pages pointing to the main category
- Block session ID parameters in robots.txt and Search Console URL parameters
- Implement proper pagination with `?page=N` and link pagination pages

---

## Indexation Audit

### Canonical Tags

**Purpose:** Tell search engines which version of a page is the "official" one.

**Implementation:**
```html
<link rel="canonical" href="https://www.example.com/page/" />
```

**Rules:**
- Every page must have a canonical tag (self-referencing on unique pages)
- HTTP pages must canonical to HTTPS versions
- www must canonical to non-www (or vice versa — pick one and be consistent)
- Paginated pages: `/blog/page/2` canonicals to itself, NOT to page 1
- Filtered/sorted versions: `/products?sort=price` canonicals to `/products`

**Common canonical mistakes:**
- Canonical to a 404 page
- Canonical loop (A canonicals to B, B canonicals to A)
- Canonical to the wrong page (cross-page canonical)
- Missing canonical entirely

### Duplicate Content Detection

**Types:**
1. **URL-based duplicates** — Same content on `http://`, `https://`, `www.`, non-www, with/without trailing slash
2. **Parameter duplicates** — Tracking parameters creating duplicate URLs (`?utm_source=email`)
3. **Near-duplicates** — Product pages with minor variations
4. **Syndicated content** — Content published elsewhere points canonically to original

**Detection:**
- `site:domain.com` in Google to spot unexpected indexed URLs
- Screaming Frog crawl → filter duplicates
- Search Console → Coverage → Duplicate without user-selected canonical

**Solutions:**
- Canonical tags for parameter variants
- 301 redirect alternate URL versions to canonical
- `<meta name="robots" content="noindex">` for truly valueless duplicates
- Hreflang for region-based duplicates (see International SEO below)

### Soft 404s

**Definition:** Pages that return HTTP 200 but display "not found" content.

**Detection:** Search Console → Coverage → "Soft 404"

**Common causes:**
- Out-of-stock products still served with 200
- Empty search result pages indexed
- "No results found" pages indexed
- CMS template pages with no content

**Fix:** Return proper 404 or 410 status, or add `noindex` + remove from sitemap.

---

## Core Web Vitals: Detailed Guide

### LCP — Largest Contentful Paint (< 2.5s)

**What is it:** Time until the largest visible element (image, video, or text block) loads.

**Common LCP elements:**
- Hero image
- Above-the-fold background image
- Large text paragraph

**Optimization:**
1. **Preload LCP image:**
   ```html
   <link rel="preload" as="image" href="/hero.webp" fetchpriority="high">
   ```
2. **Remove lazy loading from LCP image:**
   ```html
   <!-- Wrong: LCP image should NOT be lazy loaded -->
   <img src="/hero.webp" loading="lazy">

   <!-- Right: LCP image loads eagerly (default behavior) -->
   <img src="/hero.webp" fetchpriority="high">
   ```
3. **Eliminate render-blocking resources** — move non-critical CSS to deferred loading
4. **Use a CDN** — reduce geographic distance to first byte
5. **Optimize server response time (TTFB)** — target < 800ms

### INP — Interaction to Next Paint (< 200ms)

**What is it:** Worst-case delay between user interaction (click, tap, keypress) and next visual update.

**Optimization:**
1. **Break up long tasks** — no single JS task should exceed 50ms
2. **Defer non-critical JavaScript** — use `defer` or dynamic import
3. **Reduce JavaScript bundle size** — code-split by route
4. **Use web workers** for CPU-intensive calculations
5. **Avoid layout thrashing** — batch DOM reads/writes

### CLS — Cumulative Layout Shift (< 0.1)

**What is it:** Sum of unexpected layout shifts during page lifetime.

**Common causes and fixes:**

| Cause | Fix |
|-------|-----|
| Images without dimensions | Always set `width` and `height` on `<img>` |
| Ads that expand | Reserve space with min-height |
| Late-loading fonts | Use `font-display: optional` or preload fonts |
| Dynamically injected content above existing | Only inject below the fold |
| Animations that affect layout | Use `transform` and `opacity` only |

**In Next.js with `next/image`:** CLS is handled automatically because `next/image` requires `width` and `height` props.

---

## JavaScript SEO

JavaScript-heavy sites (React, Next.js, Vue) have special SEO considerations.

### Rendering Modes and Their SEO Impact

| Mode | How Content Arrives | SEO Status | When to Use |
|------|-------------------|------------|-------------|
| Static HTML | Fully rendered in source | Excellent | Mostly static content |
| SSR (Server-Side Rendering) | Rendered on each request | Excellent | Dynamic, personalized |
| ISR (Incremental Static Regeneration) | Cached, periodically refreshed | Excellent | Semi-dynamic |
| CSR (Client-Side Rendering) | Blank HTML + JS renders content | Risky | Never for SEO-critical pages |

**The CSR problem:** Googlebot renders JavaScript but there's a 2-stage crawl process. Content in the rendered HTML (SSR/static) is processed faster and more reliably than CSR content.

**Rule:** Ensure SEO-critical content (headings, body text, internal links, structured data) is in the initial HTML, not JavaScript-rendered.

**Verify with:** `curl -s "https://yourdomain.com/page" | grep -i "your headline"` — if not found, content is JS-rendered and risky.

### Dynamic Rendering (Workaround for Legacy CSR Apps)

Serve SSR to crawlers, CSR to users:
- Detect crawler user agents (Googlebot, Bingbot)
- Serve pre-rendered HTML to crawlers
- Serve normal SPA to users
- Tools: Rendertron, Prerender.io

**Not recommended for new builds** — use SSR or SSG natively instead.

---

## URL Structure Best Practices

**Format:** lowercase, hyphens, keyword-rich, short

```
Good: /blog/seo-guide-2024
Bad: /blog/SEO_Guide_2024?id=12345

Good: /products/running-shoes
Bad: /products/category/subcategory/item/12345/running-shoes-blue-size-10

Good: /about
Bad: /p/about-us-our-company-story
```

**Depth:** Keep pages within 3-4 URL segments of root:
- `/blog/category/post-title` — good
- `/blog/category/subcategory/year/month/post-title` — too deep

**Parameters to avoid in canonical URLs:**
- Session IDs: `?sid=abc`
- Tracking-only parameters: include in canonical-excluding rules
- Sorting/filtering: use canonical to base URL

---

## International SEO

### Hreflang Tags

Tell search engines which language/region version to serve to which audience.

**Formats:**
- Language only: `hreflang="en"`, `hreflang="fr"`
- Language + region: `hreflang="en-US"`, `hreflang="en-GB"`, `hreflang="fr-FR"`

**Implementation in page `<head>`:**
```html
<link rel="alternate" hreflang="en" href="https://example.com/page" />
<link rel="alternate" hreflang="fr" href="https://example.com/fr/page" />
<link rel="alternate" hreflang="de" href="https://example.com/de/page" />
<link rel="alternate" hreflang="x-default" href="https://example.com/page" />
```

**Rules:**
- Every page in the hreflang cluster must include ALL other pages in the cluster
- Must be bidirectional (if EN points to FR, FR must point back to EN)
- `x-default` is the fallback for unmatched regions
- Can also be implemented in sitemap or HTTP headers

### URL Structures for International

| Structure | Example | Pros | Cons |
|-----------|---------|------|------|
| ccTLD | example.de | Strongest geo-signal | Expensive, multiple sites |
| Subdomain | de.example.com | Easy to geo-target | Dilutes domain authority |
| Subdirectory | example.com/de/ | Shares domain authority | Harder geo-targeting |
| Parameters | example.com?lang=de | Easy to implement | Weakest signal, discouraged |

**Recommendation:** Subdirectory (`/de/`, `/fr/`) for most sites. ccTLD for market-critical countries.

---

## HTTPS and Security

**Requirements:**
- HTTPS everywhere (no mixed content)
- Valid SSL certificate (not expired)
- HSTS header: `Strict-Transport-Security: max-age=31536000; includeSubDomains`
- HTTP → HTTPS 301 redirect (not 302)
- www → non-www (or vice versa) 301 redirect

**Mixed content:** HTTPS page loading HTTP resources. Browser blocks them. Fix:
- Update all resource URLs in code to HTTPS or protocol-relative (`//cdn.example.com/asset.js`)
- Update database records with stored absolute URLs
- Use CSP headers to detect/report mixed content

---

## Site Architecture

### Topical Clusters

Organize content in hub-and-spoke model:

```
[Pillar Page: Ultimate SEO Guide]
    ↓ links to and from ↓
[Cluster: Technical SEO]   [Cluster: On-Page SEO]   [Cluster: Link Building]
    ↓                          ↓                          ↓
[Sub: robots.txt]          [Sub: Title Tags]          [Sub: Guest Posting]
[Sub: Sitemaps]            [Sub: Meta Descriptions]   [Sub: Broken Link Building]
[Sub: Core Web Vitals]     [Sub: Heading Structure]   [Sub: Digital PR]
```

**Benefits:**
- Signals topical authority to search engines
- Distributes link equity efficiently
- Improves user navigation
- Reduces keyword cannibalization

### Internal Link Architecture

**PageRank flow:** Links pass authority. Pages linked from many high-authority pages become more authoritative.

**Priority linking:**
1. Homepage → Most important pages
2. Pillar pages → Cluster pages
3. Cluster pages → Sub-topic pages + back to pillar
4. Blog posts → related posts + relevant product/service pages

**Anchor text distribution:**
- 60% exact-match or close variation
- 30% related/contextual phrases
- 10% branded or generic ("learn more about our X feature")

---

## Tools Reference

| Tool | Purpose | Cost |
|------|---------|------|
| Google Search Console | Indexation, performance, issues | Free |
| Bing Webmaster Tools | Bing indexation, keywords | Free |
| Google PageSpeed Insights | Core Web Vitals field + lab data | Free |
| WebPageTest | Detailed waterfall, filmstrip | Free |
| Rich Results Test | Structured data validation | Free |
| Screaming Frog SEO Spider | Full site crawl and audit | Freemium |
| Ahrefs / Semrush | Keyword research, backlinks | Paid |
| Sitebulb | Technical audit with visualizations | Paid |
| ContentKing | Real-time site monitoring | Paid |
