# Next.js SEO Implementation Reference

Complete implementation guide for SEO in Next.js App Router applications.

---

## Metadata API (App Router)

### Static Metadata

```tsx
// app/page.tsx or any layout/page file
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Page Title — Brand Name',
  description: 'Page description 150-160 characters with primary keyword and value proposition.',
  keywords: ['keyword1', 'keyword2', 'keyword3'], // Lower SEO value, but used by some tools
  authors: [{ name: 'Author Name', url: 'https://yoursite.com/about' }],
  creator: 'Your Company Name',
  publisher: 'Your Company Name',
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  alternates: {
    canonical: 'https://www.yoursite.com/page',
    languages: {
      'en-US': 'https://www.yoursite.com/page',
      'fr-FR': 'https://www.yoursite.com/fr/page',
    },
  },
  openGraph: {
    type: 'website',
    url: 'https://www.yoursite.com/page',
    title: 'Page Title for Social Sharing',
    description: 'Description for social preview cards.',
    siteName: 'Your Site Name',
    images: [
      {
        url: 'https://www.yoursite.com/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'Alt text describing the OG image',
      },
    ],
    locale: 'en_US',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Page Title for Twitter',
    description: 'Description for Twitter preview cards.',
    creator: '@yourtwitterhandle',
    site: '@yoursitehandle',
    images: ['https://www.yoursite.com/twitter-card.jpg'],
  },
}
```

### Dynamic Metadata (for Dynamic Routes)

```tsx
// app/blog/[slug]/page.tsx
import type { Metadata, ResolvingMetadata } from 'next'

type Props = {
  params: { slug: string }
}

export async function generateMetadata(
  { params }: Props,
  parent: ResolvingMetadata
): Promise<Metadata> {
  const post = await fetchPost(params.slug)
  const parentOpenGraph = (await parent).openGraph

  return {
    title: `${post.title} — Your Site`,
    description: post.excerpt,
    alternates: {
      canonical: `https://www.yoursite.com/blog/${params.slug}`,
    },
    openGraph: {
      ...parentOpenGraph,
      title: post.title,
      description: post.excerpt,
      type: 'article',
      publishedTime: post.publishedAt,
      modifiedTime: post.updatedAt,
      authors: [post.author.url],
      images: [
        {
          url: post.ogImage,
          width: 1200,
          height: 630,
          alt: post.ogImageAlt,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: post.title,
      description: post.excerpt,
      images: [post.ogImage],
    },
  }
}
```

### Metadata Templates (Root Layout)

```tsx
// app/layout.tsx
import type { Metadata } from 'next'

export const metadata: Metadata = {
  metadataBase: new URL('https://www.yoursite.com'),
  title: {
    default: 'Your Site — Tagline',
    template: '%s — Your Site', // Page title becomes: "Page Title — Your Site"
  },
  description: 'Default site description if page-level description is missing.',
  openGraph: {
    siteName: 'Your Site',
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    site: '@yoursitehandle',
  },
}
```

---

## Robots and Sitemap Files

### robots.ts

```ts
// app/robots.ts
import { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: [
          '/admin/',
          '/api/',
          '/dashboard/',
          '/_next/',
          '/private/',
        ],
      },
      {
        userAgent: 'GPTBot',
        // Disallow if you don't want OpenAI to train on your content
        // Remove this rule if you want AI training inclusion
        disallow: ['/'],
      },
    ],
    sitemap: 'https://www.yoursite.com/sitemap.xml',
    host: 'https://www.yoursite.com',
  }
}
```

**Note on AI crawler disallowing:** Common AI training crawlers:
- `GPTBot` — OpenAI
- `Google-Extended` — Google AI training (separate from Googlebot)
- `CCBot` — Common Crawl (used by many AI training datasets)
- `anthropic-ai` — Anthropic
- `PerplexityBot` — Perplexity AI (also used for search)

Disallowing `PerplexityBot` will reduce GEO visibility in Perplexity search. Disallowing `GPTBot` affects ChatGPT training but not ChatGPT's browsing feature.

### sitemap.ts (Static)

```ts
// app/sitemap.ts
import { MetadataRoute } from 'next'

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    {
      url: 'https://www.yoursite.com',
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 1,
    },
    {
      url: 'https://www.yoursite.com/about',
      lastModified: new Date('2024-01-01'),
      changeFrequency: 'monthly',
      priority: 0.8,
    },
    {
      url: 'https://www.yoursite.com/blog',
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.9,
    },
  ]
}
```

### sitemap.ts (Dynamic — Fetching from CMS/Database)

```ts
// app/sitemap.ts
import { MetadataRoute } from 'next'

async function fetchAllPosts(): Promise<{ slug: string; updatedAt: string }[]> {
  // Replace with your actual data fetching
  const response = await fetch('https://api.yoursite.com/posts', {
    next: { revalidate: 3600 }, // Regenerate sitemap hourly
  })
  return response.json()
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const posts = await fetchAllPosts()

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: 'https://www.yoursite.com', lastModified: new Date(), priority: 1 },
    { url: 'https://www.yoursite.com/about', lastModified: new Date('2024-01-01'), priority: 0.7 },
    { url: 'https://www.yoursite.com/blog', lastModified: new Date(), priority: 0.9 },
  ]

  const postRoutes: MetadataRoute.Sitemap = posts.map(post => ({
    url: `https://www.yoursite.com/blog/${post.slug}`,
    lastModified: new Date(post.updatedAt),
    changeFrequency: 'monthly',
    priority: 0.8,
  }))

  return [...staticRoutes, ...postRoutes]
}
```

### Sitemap Index (for Large Sites)

For sites with 50,000+ URLs, split into multiple sitemaps:

```ts
// app/sitemap.ts — returns sitemap index
export default function sitemap(): MetadataRoute.Sitemap {
  // This is automatically handled by Next.js when multiple sitemap files exist
  // Split by type in separate files:
  // app/sitemap/blog.ts, app/sitemap/products.ts, etc.
}
```

---

## JSON-LD Schema Implementation

### JsonLd Server Component

The recommended pattern uses `next/script` with inline children — no additional HTML escaping props needed:

```tsx
// components/JsonLd.tsx
import Script from 'next/script'

interface JsonLdProps {
  data: Record<string, unknown>
  id?: string
}

// Safe: `data` is always a developer-defined static schema object, never user input.
// next/script handles safe injection of inline script children.
export function JsonLd({ data, id = 'schema-org' }: JsonLdProps) {
  return (
    <Script
      id={id}
      type="application/ld+json"
      strategy="beforeInteractive"
    >
      {JSON.stringify(data)}
    </Script>
  )
}
```

For multiple schemas on one page, use unique `id` props:
```tsx
<JsonLd id="article-schema" data={articleSchema} />
<JsonLd id="faq-schema" data={faqSchema} />
<JsonLd id="breadcrumb-schema" data={breadcrumbSchema} />
```

See `examples/nextjs-metadata.ts` for builder utilities (`buildArticleSchema`, `buildFaqSchema`, `buildBreadcrumbSchema`).

### Usage in Pages

```tsx
// app/blog/[slug]/page.tsx
import { JsonLd } from '@/components/JsonLd'

export default async function BlogPost({ params }: { params: { slug: string } }) {
  const post = await fetchPost(params.slug)

  const articleSchema = {
    "@context": "https://schema.org",
    "@type": "Article",
    "headline": post.title,
    "datePublished": post.publishedAt,
    "dateModified": post.updatedAt,
    "author": {
      "@type": "Person",
      "name": post.author.name,
      "url": post.author.profileUrl,
    },
    "publisher": {
      "@type": "Organization",
      "name": "Your Company",
    },
    "mainEntityOfPage": {
      "@type": "WebPage",
      "@id": `https://www.yoursite.com/blog/${params.slug}`,
    },
  }

  return (
    <>
      <JsonLd data={articleSchema} />
      {/* rest of page */}
    </>
  )
}
```

---

## Dynamic Open Graph Images

Next.js supports generating OG images programmatically with the ImageResponse API.

```tsx
// app/blog/[slug]/opengraph-image.tsx
import { ImageResponse } from 'next/og'

export const runtime = 'edge'
export const alt = 'Blog post title'
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

export default async function Image({ params }: { params: { slug: string } }) {
  const post = await fetchPost(params.slug)

  return new ImageResponse(
    (
      <div
        style={{
          background: '#0f172a',
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          padding: '60px',
        }}
      >
        <div style={{ fontSize: 64, fontWeight: 700, color: '#fff', lineHeight: 1.2 }}>
          {post.title}
        </div>
        <div style={{ fontSize: 32, color: '#94a3b8', marginTop: 24 }}>
          Your Site — {post.category}
        </div>
      </div>
    ),
    { ...size }
  )
}
```

---

## Image Optimization for SEO

### next/image Best Practices

```tsx
import Image from 'next/image'

// Hero/LCP image — high priority, no lazy loading
<Image
  src="/hero.webp"
  alt="Descriptive alt text for the hero image"
  width={1200}
  height={600}
  priority // Disables lazy loading — use for LCP element only
  quality={85}
  sizes="100vw"
/>

// Below-fold images — lazy loaded by default
<Image
  src="/feature-screenshot.webp"
  alt="Screenshot showing the dashboard with analytics charts"
  width={800}
  height={450}
  // No priority prop = lazy loaded automatically
  quality={80}
  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 800px"
/>
```

**Alt text guidelines:**
- Describe what's in the image specifically
- Include keyword naturally if it fits (don't force it)
- `alt=""` for purely decorative images (empty string, not missing)
- Maximum 125 characters
- No "Image of..." or "Picture of..." prefix

### Responsive Images with `sizes` Attribute

The `sizes` attribute tells the browser which source to use at different viewport widths:

```tsx
// Full-width image
sizes="100vw"

// Two-column layout
sizes="(max-width: 768px) 100vw, 50vw"

// Three-column layout with sidebar
sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"

// Fixed-size image (like an avatar)
sizes="64px"
```

---

## Core Web Vitals Optimization in Next.js

### LCP Optimization

```tsx
// 1. Preload critical fonts
// In app/layout.tsx <head>:
<link
  rel="preload"
  href="/fonts/inter-var.woff2"
  as="font"
  type="font/woff2"
  crossOrigin="anonymous"
/>

// 2. Next.js font optimization (avoids FOUT/CLS)
import { Inter } from 'next/font/google'
const inter = Inter({ subsets: ['latin'], display: 'swap' })

// 3. Priority on LCP image
<Image src="/hero.jpg" priority ... />
```

### CLS Prevention

```tsx
// Always specify width/height on images (next/image enforces this)
// For aspect-ratio-based containers:
<div style={{ aspectRatio: '16/9', position: 'relative' }}>
  <Image src="/image.jpg" fill alt="..." sizes="..." />
</div>

// Reserve space for dynamic content (ads, embeds):
<div style={{ minHeight: '250px' }}>
  {/* ad component loaded async */}
</div>
```

### INP Optimization

```tsx
// Code split non-critical components
import dynamic from 'next/dynamic'

const HeavyChart = dynamic(() => import('@/components/HeavyChart'), {
  loading: () => <div className="h-64 animate-pulse bg-gray-100" />,
  ssr: false, // Client-only if not needed for SEO
})

// Use React transitions for expensive updates
import { useTransition } from 'react'

const [isPending, startTransition] = useTransition()

const handleFilter = (value: string) => {
  startTransition(() => {
    setFilter(value) // Non-urgent update, won't block input
  })
}
```

---

## Canonical URL Handling

### Preventing Duplicate Content in Next.js

```tsx
// app/layout.tsx — set metadataBase to resolve relative URLs
export const metadata: Metadata = {
  metadataBase: new URL('https://www.yoursite.com'),
}

// Per-page canonical
export const metadata: Metadata = {
  alternates: {
    canonical: '/page-slug', // Resolved against metadataBase
  },
}
```

### Trailing Slash Consistency

In `next.config.js`:
```js
/** @type {import('next').NextConfig} */
const nextConfig = {
  trailingSlash: false, // or true — pick one, be consistent
}
module.exports = nextConfig
```

---

## Structured Data with generateMetadata

For pages where schema data depends on dynamic content, generate both metadata and schema together:

```tsx
// app/products/[slug]/page.tsx
export async function generateMetadata({ params }): Promise<Metadata> {
  const product = await fetchProduct(params.slug)

  return {
    title: `${product.name} — Buy Online`,
    description: product.description.slice(0, 160),
    openGraph: {
      title: product.name,
      images: [{ url: product.images[0], width: 1200, height: 630 }],
    },
  }
}

export default async function ProductPage({ params }) {
  const product = await fetchProduct(params.slug)

  const productSchema = {
    "@context": "https://schema.org",
    "@type": "Product",
    "name": product.name,
    "description": product.description,
    "offers": {
      "@type": "Offer",
      "price": product.price.toString(),
      "priceCurrency": "USD",
      "availability": product.inStock
        ? "https://schema.org/InStock"
        : "https://schema.org/OutOfStock",
    },
  }

  return (
    <>
      <JsonLd id="product-schema" data={productSchema} />
      <ProductDisplay product={product} />
    </>
  )
}
```

---

## Internationalization (i18n) with react-i18next

For multilingual sites, react-i18next is the standard React i18n library. Proper key naming and namespace structure are critical for maintainability.

### Key Naming Convention

Use **flat keys with dot notation** — not nested objects. Pattern: `{feature}.{context}.{action|status}`.

```typescript
// ✅ Correct — flat keys
export default {
  'nav.home.label': 'Home',
  'nav.home.aria': 'Go to homepage',
  'auth.login.submit': 'Sign in',
  'auth.login.error': 'Invalid credentials',
};

// ❌ Avoid — nested objects (causes type inference issues)
export default {
  nav: { home: { label: 'Home' } },
};
```

**Parameters:** Use `{{variableName}}` syntax for dynamic values:
```typescript
'pricing.plan.desc': 'Includes {{credits}} credits per month',
```

**Avoid key prefix conflicts** — a key cannot be both a leaf and a namespace prefix:
```typescript
// ❌ Conflict: 'user.profile' is both a value and a prefix
'user.profile': 'Profile',
'user.profile.edit': 'Edit Profile',

// ✅ Solution: add an explicit suffix on the leaf
'user.profile.label': 'Profile',
'user.profile.edit': 'Edit Profile',
```

### Namespace Strategy

Split translations by feature area to keep bundles small and avoid loading unused strings:

| Namespace | Contents |
|-----------|----------|
| `common` | Shared UI: buttons, labels, status messages |
| `auth` | Login, signup, password flows |
| `[feature]` | One namespace per major feature/route |
| `error` | Error messages and validation |

### Usage in Components

```tsx
import { useTranslation } from 'react-i18next';

// Single namespace
const { t } = useTranslation('common');
t('nav.home.label')
t('pricing.plan.desc', { credits: 1000 })

// Multiple namespaces
const { t } = useTranslation(['common', 'auth']);
t('common:nav.home.label')
t('auth:login.submit')
```

### Workflow for Adding Translations

1. Add keys to the source locale file (e.g., `locales/en.json` or your default language)
2. Export any new namespace in the locales index
3. **Auto-translate to all target languages** using the bundled script (see below)
4. Ensure `hreflang` alternates are updated when adding a new locale (see `technical-seo.md` → International SEO)

### Auto-Translating i18n Files with `translate_i18n.py`

The skill includes a standalone script at `scripts/translate_i18n.py` that uses an AI provider to translate an entire i18n JSON file while preserving structure, keys, and `{{placeholder}}` variables.

**Requirements:** `pip install requests` plus an API key for your chosen provider.

**Single language:**
```bash
python scripts/translate_i18n.py locales/en.json \
  --target-lang Spanish \
  --output locales/es.json
```

**All languages at once (outputs `locales/es.json`, `locales/fr.json`, etc.):**
```bash
python scripts/translate_i18n.py locales/en.json \
  --target-langs Spanish French German Portuguese Japanese \
  --output-dir locales/
```

**Using Anthropic Claude instead of OpenAI:**
```bash
python scripts/translate_i18n.py locales/en.json \
  --target-lang French \
  --output locales/fr.json \
  --provider anthropic
```

**Options:**

| Flag | Default | Description |
|------|---------|-------------|
| `--target-lang` | — | Single target language name (e.g. `Spanish`) |
| `--target-langs` | — | Multiple languages (space-separated) |
| `--output` / `-o` | — | Output file (single language) |
| `--output-dir` | — | Output directory (multi-language); files named `<code>.json` |
| `--source-lang` | `English` | Language of the source file |
| `--provider` | `openai` | Provider: `openai`, `anthropic`, `groq`, `perplexity`, `openrouter`, `deepseek`, `x` |
| `--model` | provider default | Override model (e.g. `gpt-4.1`, `claude-sonnet-4-6`) |
| `--api-key` | env variable | Override API key (falls back to `OPENAI_API_KEY`, `ANTHROPIC_API_KEY`, etc.) |
| `--verbose` / `-v` | off | Print each key as it is translated |

**What the script preserves:**
- JSON structure and all keys (keys are never translated)
- URLs (detected and skipped automatically)
- Numbers, booleans, and `null` values
- `{{placeholder}}` interpolation variables within strings

**Example source → output:**
```json
// locales/en.json (input)
{
  "hero": {
    "title": "Build faster with AI",
    "cta": "Get started",
    "learnMore": "Learn more about {{feature}}"
  }
}

// locales/es.json (output — Spanish)
{
  "hero": {
    "title": "Construye más rápido con IA",
    "cta": "Comenzar",
    "learnMore": "Aprende más sobre {{feature}}"
  }
}
```

**CI/CD integration** — run after adding new keys in the source locale:
```yaml
# .github/workflows/translate.yml
- name: Auto-translate new locale keys
  run: |
    python scripts/translate_i18n.py locales/en.json \
      --target-langs Spanish French German \
      --output-dir locales/ \
      --provider anthropic
  env:
    ANTHROPIC_API_KEY: ${{ secrets.ANTHROPIC_API_KEY }}
```

### Next.js App Router with i18n

For Next.js multilingual routing, combine react-i18next with locale-based routes:

```tsx
// app/[locale]/layout.tsx
import { notFound } from 'next/navigation'

const locales = ['en', 'fr', 'de']

export default async function LocaleLayout({
  children,
  params: { locale },
}: {
  children: React.ReactNode
  params: { locale: string }
}) {
  if (!locales.includes(locale)) notFound()

  return (
    <html lang={locale}>
      <body>{children}</body>
    </html>
  )
}
```

**Hreflang from dynamic locale routes:**
```tsx
// app/[locale]/page.tsx
export async function generateMetadata({ params: { locale } }: Props): Promise<Metadata> {
  return {
    alternates: {
      languages: {
        'en': '/en',
        'fr': '/fr',
        'de': '/de',
        'x-default': '/en',
      },
    },
  }
}
```

---

## Performance Checklist for Next.js SEO

- [ ] `metadataBase` set in root layout
- [ ] Title template configured (`%s — Brand`)
- [ ] Default OG image set (fallback for pages without custom OG)
- [ ] `robots.ts` configured — not blocking important paths
- [ ] `sitemap.ts` exists and contains all indexable pages
- [ ] LCP image uses `priority` prop
- [ ] No images without `width`/`height` (CLS prevention)
- [ ] Fonts loaded with `next/font` (avoids layout shift)
- [ ] Non-critical JS split with `dynamic()`
- [ ] API routes excluded from robots.txt
- [ ] Canonical set on all pages
- [ ] Hreflang configured if multi-language (see i18n section above)
- [ ] i18n: flat key naming with dot notation, no nested objects
- [ ] i18n: namespaces split by feature to avoid large bundles
- [ ] i18n: `lang` attribute on `<html>` matches active locale
- [ ] Schema markup on homepage (Organization, WebSite)
- [ ] Article schema on blog posts
- [ ] FAQPage schema where FAQ content exists
- [ ] Open Graph images minimum 1200x630px
