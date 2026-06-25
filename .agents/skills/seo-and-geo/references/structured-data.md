# Structured Data: Complete Schema Markup Reference

JSON-LD templates for every major content type. Validate at: https://search.google.com/test/rich-results

For React/Next.js implementation code, see: [`../examples/nextjs-metadata.ts`](../examples/nextjs-metadata.ts)

---

## Implementation Overview

Schema markup is added as JSON-LD in a `<script type="application/ld+json">` tag.

**In Next.js:** The recommended pattern is a `JsonLd` server component that accepts a static schema object. See the examples file for the complete implementation pattern. The key point: the schema object is always developer-authored static data, never user-supplied content, making it safe to render directly.

**Validation tools:**
- Rich Results Test: https://search.google.com/test/rich-results
- Schema Markup Validator: https://validator.schema.org/
- Google Search Console → Enhancements (site-wide monitoring)

---

## Core Schemas (Implement on Every Site)

### Organization

Add to homepage. Establishes brand identity for Google and AI systems.

```json
{
  "@context": "https://schema.org",
  "@type": "Organization",
  "name": "Your Company Name",
  "url": "https://www.yoursite.com",
  "logo": {
    "@type": "ImageObject",
    "url": "https://www.yoursite.com/logo.png",
    "width": 600,
    "height": 60
  },
  "description": "What your company does in 1-2 sentences.",
  "foundingDate": "2020",
  "contactPoint": {
    "@type": "ContactPoint",
    "telephone": "+1-555-000-0000",
    "contactType": "customer service",
    "availableLanguage": "English"
  },
  "sameAs": [
    "https://twitter.com/yourhandle",
    "https://www.linkedin.com/company/yourcompany",
    "https://github.com/yourorg"
  ]
}
```

### WebSite with Sitelinks Search Box

Add to homepage alongside Organization schema.

```json
{
  "@context": "https://schema.org",
  "@type": "WebSite",
  "name": "Your Site Name",
  "url": "https://www.yoursite.com",
  "potentialAction": {
    "@type": "SearchAction",
    "target": {
      "@type": "EntryPoint",
      "urlTemplate": "https://www.yoursite.com/search?q={search_term_string}"
    },
    "query-input": "required name=search_term_string"
  }
}
```

### BreadcrumbList

Add to every page except homepage. Enables breadcrumb rich results.

```json
{
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  "itemListElement": [
    {
      "@type": "ListItem",
      "position": 1,
      "name": "Home",
      "item": "https://www.yoursite.com"
    },
    {
      "@type": "ListItem",
      "position": 2,
      "name": "Blog",
      "item": "https://www.yoursite.com/blog"
    },
    {
      "@type": "ListItem",
      "position": 3,
      "name": "Article Title",
      "item": "https://www.yoursite.com/blog/article-slug"
    }
  ]
}
```

---

## Content Schemas

### Article (Blog Post)

```json
{
  "@context": "https://schema.org",
  "@type": "Article",
  "headline": "Article Title (max 110 characters)",
  "description": "Brief description of the article (150-160 characters ideal).",
  "image": {
    "@type": "ImageObject",
    "url": "https://www.yoursite.com/blog/article-og-image.jpg",
    "width": 1200,
    "height": 630
  },
  "datePublished": "2024-01-15T08:00:00Z",
  "dateModified": "2024-06-01T10:00:00Z",
  "author": {
    "@type": "Person",
    "name": "Author Full Name",
    "url": "https://www.yoursite.com/authors/author-name",
    "sameAs": "https://twitter.com/authorhandle"
  },
  "publisher": {
    "@type": "Organization",
    "name": "Your Company",
    "logo": {
      "@type": "ImageObject",
      "url": "https://www.yoursite.com/logo.png"
    }
  },
  "mainEntityOfPage": {
    "@type": "WebPage",
    "@id": "https://www.yoursite.com/blog/article-slug"
  },
  "wordCount": 2500,
  "articleSection": "SEO",
  "keywords": "seo, content optimization, search rankings"
}
```

### FAQPage

Enables FAQ rich results in SERPs and is heavily extracted for AI Overviews.

```json
{
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "mainEntity": [
    {
      "@type": "Question",
      "name": "What is GEO (Generative Engine Optimization)?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "GEO (Generative Engine Optimization) is the practice of optimizing content to be cited and recommended by AI-powered search assistants like ChatGPT, Perplexity, Claude, and Google Gemini. Unlike traditional SEO which targets ranking in search result pages, GEO focuses on making content authoritative, clearly structured, and citation-worthy for AI systems."
      }
    },
    {
      "@type": "Question",
      "name": "How long does GEO take to show results?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "GEO results typically take 3-6 months for established sites and 6-12 months for newer domains. The timeline depends on domain authority, content quality, and how frequently AI models update their training data or search indexes."
      }
    }
  ]
}
```

### HowTo

Enables HowTo rich results. Excellent for AEO — Google extracts steps into AI Overviews.

```json
{
  "@context": "https://schema.org",
  "@type": "HowTo",
  "name": "How to Optimize Content for AI Search",
  "description": "Step-by-step guide to making content discoverable by AI assistants.",
  "totalTime": "PT2H",
  "estimatedCost": {
    "@type": "MonetaryAmount",
    "currency": "USD",
    "value": "0"
  },
  "tool": [
    { "@type": "HowToTool", "name": "Google Search Console" },
    { "@type": "HowToTool", "name": "Rich Results Test" }
  ],
  "step": [
    {
      "@type": "HowToStep",
      "position": 1,
      "name": "Audit existing content",
      "text": "Review your top-performing pages and identify which questions they answer. Note gaps where users ask questions your content doesn't directly address.",
      "image": "https://www.yoursite.com/images/step1.jpg"
    },
    {
      "@type": "HowToStep",
      "position": 2,
      "name": "Add question-format headings",
      "text": "Restructure headings to match how users ask questions: 'What is X?' instead of 'About X'.",
      "image": "https://www.yoursite.com/images/step2.jpg"
    },
    {
      "@type": "HowToStep",
      "position": 3,
      "name": "Write self-contained definitions",
      "text": "For each question heading, write a 40-60 word answer in the first paragraph that makes complete sense without surrounding context.",
      "image": "https://www.yoursite.com/images/step3.jpg"
    }
  ]
}
```

---

## Product and Commerce Schemas

### Product

```json
{
  "@context": "https://schema.org",
  "@type": "Product",
  "name": "Product Name",
  "description": "Product description with key features and benefits.",
  "image": [
    "https://www.yoursite.com/products/product-main.jpg",
    "https://www.yoursite.com/products/product-angle.jpg"
  ],
  "brand": {
    "@type": "Brand",
    "name": "Your Brand"
  },
  "sku": "PROD-001",
  "gtin13": "0123456789012",
  "offers": {
    "@type": "Offer",
    "url": "https://www.yoursite.com/products/product-slug",
    "priceCurrency": "USD",
    "price": "49.99",
    "priceValidUntil": "2024-12-31",
    "availability": "https://schema.org/InStock",
    "seller": {
      "@type": "Organization",
      "name": "Your Company"
    }
  },
  "aggregateRating": {
    "@type": "AggregateRating",
    "ratingValue": "4.7",
    "reviewCount": "243",
    "bestRating": "5",
    "worstRating": "1"
  }
}
```

### SoftwareApplication (for SaaS)

```json
{
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  "name": "Your App Name",
  "description": "What your software does in 1-2 sentences.",
  "applicationCategory": "BusinessApplication",
  "operatingSystem": "Web Browser",
  "url": "https://www.yourapp.com",
  "offers": {
    "@type": "Offer",
    "price": "0",
    "priceCurrency": "USD",
    "description": "Free tier available"
  },
  "aggregateRating": {
    "@type": "AggregateRating",
    "ratingValue": "4.8",
    "reviewCount": "1247"
  },
  "screenshot": "https://www.yourapp.com/screenshot.jpg",
  "featureList": "Feature 1, Feature 2, Feature 3"
}
```

---

## Local Business Schema

```json
{
  "@context": "https://schema.org",
  "@type": "LocalBusiness",
  "name": "Business Name",
  "description": "What the business does.",
  "url": "https://www.yourbusiness.com",
  "telephone": "+1-555-000-0000",
  "email": "contact@yourbusiness.com",
  "address": {
    "@type": "PostalAddress",
    "streetAddress": "123 Main Street",
    "addressLocality": "City",
    "addressRegion": "State",
    "postalCode": "12345",
    "addressCountry": "US"
  },
  "geo": {
    "@type": "GeoCoordinates",
    "latitude": 40.7128,
    "longitude": -74.0060
  },
  "openingHoursSpecification": [
    {
      "@type": "OpeningHoursSpecification",
      "dayOfWeek": ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
      "opens": "09:00",
      "closes": "17:00"
    }
  ],
  "priceRange": "$$",
  "aggregateRating": {
    "@type": "AggregateRating",
    "ratingValue": "4.6",
    "reviewCount": "89"
  }
}
```

---

## Media Schemas

### VideoObject

```json
{
  "@context": "https://schema.org",
  "@type": "VideoObject",
  "name": "Video Title",
  "description": "What this video covers in 1-2 sentences.",
  "thumbnailUrl": "https://www.yoursite.com/videos/thumbnail.jpg",
  "uploadDate": "2024-01-15T08:00:00Z",
  "duration": "PT5M30S",
  "contentUrl": "https://www.yoursite.com/videos/video.mp4",
  "embedUrl": "https://www.youtube.com/embed/VIDEO_ID",
  "publisher": {
    "@type": "Organization",
    "name": "Your Company",
    "logo": {
      "@type": "ImageObject",
      "url": "https://www.yoursite.com/logo.png"
    }
  },
  "interactionStatistic": {
    "@type": "InteractionCounter",
    "interactionType": "https://schema.org/WatchAction",
    "userInteractionCount": 15000
  }
}
```

---

## Person Schema (for Author Pages)

Required for E-E-A-T signals. Add to author profile pages and reference from Article schemas.

```json
{
  "@context": "https://schema.org",
  "@type": "Person",
  "name": "Author Full Name",
  "url": "https://www.yoursite.com/authors/author-slug",
  "image": "https://www.yoursite.com/authors/author-photo.jpg",
  "description": "Author bio: credentials, expertise, and experience in 2-3 sentences.",
  "jobTitle": "Senior SEO Strategist",
  "worksFor": {
    "@type": "Organization",
    "name": "Your Company"
  },
  "sameAs": [
    "https://twitter.com/authorhandle",
    "https://www.linkedin.com/in/authorname"
  ],
  "knowsAbout": ["SEO", "Content Marketing", "GEO", "Digital Marketing"]
}
```

---

## SpeakableSpecification (Voice Search)

Marks content segments appropriate for text-to-speech in voice results.

```json
{
  "@context": "https://schema.org",
  "@type": "WebPage",
  "speakable": {
    "@type": "SpeakableSpecification",
    "cssSelector": [".article-summary", ".key-definition", "h1", "h2"]
  },
  "url": "https://www.yoursite.com/page"
}
```

---

## Schema Validation and Testing

### Validation Workflow

1. Add schema markup to page
2. Test with Rich Results Test (single URL)
3. Test with Schema Markup Validator (detailed error view)
4. Deploy and check Search Console → Enhancements within 24-48 hours
5. Monitor Search Console for errors after deployment

### Common Validation Errors

| Error | Cause | Fix |
|-------|-------|-----|
| Missing required field | Required property not included | Add the missing required property |
| Invalid URL format | URL missing protocol or malformed | Ensure `https://` prefix, valid URL |
| Invalid date format | Wrong date format | Use ISO 8601: `2024-01-15T08:00:00Z` |
| Invalid price format | Price not a string | Use `"price": "49.99"` as a string |
| Image too small | OG image under 200x200px | Use minimum 1200x630px |
| Duplicate IDs | Multiple schemas with same `@id` | Use unique `@id` values per entity |

### Schema Priority by Page Type

| Page Type | Must-Have Schemas | Nice-to-Have |
|-----------|-------------------|--------------|
| Homepage | Organization, WebSite | LocalBusiness (if applicable) |
| Blog post | Article, BreadcrumbList | FAQPage (if has FAQs) |
| FAQ page | FAQPage, BreadcrumbList | — |
| Tutorial | HowTo, BreadcrumbList | Article |
| Product | Product, BreadcrumbList | VideoObject (if video exists) |
| Author page | Person | — |
| Video page | VideoObject, BreadcrumbList | — |
| SaaS product | SoftwareApplication, Organization | Product |
| Local business | LocalBusiness | Organization |

### Impact on AI Systems

Beyond rich results, schema markup helps AI systems understand content:
- `FAQPage` schema → Questions extracted for AI Overviews
- `HowTo` schema → Steps extracted for how-to AI answers
- `Article` with `datePublished` → Freshness signals for AI recency scoring
- `Person` with `knowsAbout` → Author authority signals for E-E-A-T
- `Organization` with `sameAs` → Brand entity recognition across platforms
