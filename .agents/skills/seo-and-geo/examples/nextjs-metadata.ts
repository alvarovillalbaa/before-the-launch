/**
 * Next.js SEO Implementation Examples
 *
 * Copy-paste patterns for metadata, schema markup, and SEO utilities.
 * All examples use Next.js 14+ App Router.
 */

import type { Metadata } from 'next'

// ============================================================
// 1. ROOT LAYOUT METADATA (app/layout.tsx)
// ============================================================

export const rootMetadata: Metadata = {
  metadataBase: new URL('https://www.yoursite.com'),
  title: {
    default: 'Your Site — Tagline Here',
    template: '%s — Your Site', // Page-level titles become "Page Title — Your Site"
  },
  description: 'Default site description. 150-160 characters. Used when a page has no custom description.',
  keywords: ['primary keyword', 'secondary keyword'],
  authors: [{ name: 'Your Company', url: 'https://www.yoursite.com' }],
  creator: 'Your Company',
  publisher: 'Your Company',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
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
  openGraph: {
    type: 'website',
    siteName: 'Your Site',
    locale: 'en_US',
  },
  twitter: {
    card: 'summary_large_image',
    site: '@yoursitehandle',
    creator: '@yoursitehandle',
  },
  verification: {
    google: 'your-google-search-console-verification-code',
    yandex: 'your-yandex-verification-code',
    // bing: 'your-bing-verification-code', // Note: Bing uses meta tags differently
  },
}


// ============================================================
// 2. STATIC PAGE METADATA (any page.tsx)
// ============================================================

export const staticPageMetadata: Metadata = {
  title: 'Page Title (50-60 chars)',
  description: 'Page description with primary keyword. 150-160 characters. Explain what value the reader gets.',
  alternates: {
    canonical: 'https://www.yoursite.com/page-slug',
    languages: {
      'en-US': 'https://www.yoursite.com/page-slug',
      'fr-FR': 'https://www.yoursite.com/fr/page-slug',
      'x-default': 'https://www.yoursite.com/page-slug',
    },
  },
  openGraph: {
    title: 'OG Title — Can be slightly different from title tag',
    description: 'OG description for social sharing cards.',
    url: 'https://www.yoursite.com/page-slug',
    type: 'website',
    images: [
      {
        url: '/og-image.jpg', // Resolved against metadataBase
        width: 1200,
        height: 630,
        alt: 'Alt text describing the OG image — used by screen readers',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Twitter Card Title',
    description: 'Twitter card description.',
    images: ['/twitter-card.jpg'],
  },
}


// ============================================================
// 3. DYNAMIC METADATA (blog/[slug]/page.tsx)
// ============================================================

type BlogPost = {
  title: string
  excerpt: string
  slug: string
  publishedAt: string
  updatedAt: string
  author: { name: string; url: string }
  ogImage: string
  ogImageAlt: string
  tags: string[]
}

// Simulated fetch — replace with your actual data fetching
async function fetchPost(slug: string): Promise<BlogPost> {
  // Your CMS/API call here
  return {} as BlogPost
}

export async function generateBlogMetadata(
  slug: string,
): Promise<Metadata> {
  const post = await fetchPost(slug)

  return {
    title: post.title,
    description: post.excerpt,
    keywords: post.tags,
    authors: [{ name: post.author.name, url: post.author.url }],
    alternates: {
      canonical: `https://www.yoursite.com/blog/${slug}`,
    },
    openGraph: {
      title: post.title,
      description: post.excerpt,
      url: `https://www.yoursite.com/blog/${slug}`,
      type: 'article',
      publishedTime: post.publishedAt,
      modifiedTime: post.updatedAt,
      authors: [post.author.url],
      tags: post.tags,
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


// ============================================================
// 4. ROBOTS.TS (app/robots.ts)
// ============================================================

// import { MetadataRoute } from 'next'
//
// export default function robots(): MetadataRoute.Robots {
//   return {
//     rules: [
//       {
//         userAgent: '*',
//         allow: '/',
//         disallow: ['/admin/', '/api/', '/dashboard/', '/private/'],
//       },
//       // Uncomment to block AI training crawlers (impacts GEO visibility):
//       // { userAgent: 'GPTBot', disallow: ['/'] },
//       // { userAgent: 'Google-Extended', disallow: ['/'] },
//       // { userAgent: 'CCBot', disallow: ['/'] },
//     ],
//     sitemap: 'https://www.yoursite.com/sitemap.xml',
//   }
// }


// ============================================================
// 5. SITEMAP.TS (app/sitemap.ts)
// ============================================================

// import { MetadataRoute } from 'next'
//
// export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
//   const posts = await fetchAllPosts() // Your data source
//
//   const staticRoutes: MetadataRoute.Sitemap = [
//     {
//       url: 'https://www.yoursite.com',
//       lastModified: new Date(),
//       changeFrequency: 'weekly',
//       priority: 1,
//     },
//     {
//       url: 'https://www.yoursite.com/about',
//       lastModified: new Date('2024-01-01'),
//       changeFrequency: 'monthly',
//       priority: 0.7,
//     },
//     {
//       url: 'https://www.yoursite.com/blog',
//       lastModified: new Date(),
//       changeFrequency: 'daily',
//       priority: 0.9,
//     },
//   ]
//
//   const postRoutes: MetadataRoute.Sitemap = posts.map(post => ({
//     url: `https://www.yoursite.com/blog/${post.slug}`,
//     lastModified: new Date(post.updatedAt),
//     changeFrequency: 'monthly' as const,
//     priority: 0.8,
//   }))
//
//   return [...staticRoutes, ...postRoutes]
// }


// ============================================================
// 6. SCHEMA MARKUP COMPONENT (components/JsonLd.tsx)
// ============================================================
//
// The recommended pattern for injecting JSON-LD in Next.js Server Components.
// Schema data is always static developer-authored content, not user input,
// so serializing and rendering it as a script tag is safe.
//
// import Script from 'next/script'
//
// interface JsonLdProps {
//   data: Record<string, unknown>
//   id?: string
// }
//
// export function JsonLd({ data, id = 'schema-org' }: JsonLdProps) {
//   return (
//     <Script
//       id={id}
//       type="application/ld+json"
//       strategy="beforeInteractive"
//     >
//       {JSON.stringify(data)}
//     </Script>
//   )
// }
//
// Usage:
// import { JsonLd } from '@/components/JsonLd'
// <JsonLd data={articleSchema} />
// <JsonLd id="faq-schema" data={faqSchema} />


// ============================================================
// 7. ARTICLE SCHEMA BUILDER UTILITY
// ============================================================

type ArticleSchemaInput = {
  title: string
  description: string
  slug: string
  publishedAt: string
  updatedAt: string
  authorName: string
  authorUrl: string
  ogImageUrl: string
  wordCount?: number
  section?: string
  tags?: string[]
  siteName: string
  siteUrl: string
  logoUrl: string
}

export function buildArticleSchema(input: ArticleSchemaInput): Record<string, unknown> {
  return {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: input.title,
    description: input.description,
    image: {
      '@type': 'ImageObject',
      url: input.ogImageUrl,
      width: 1200,
      height: 630,
    },
    datePublished: input.publishedAt,
    dateModified: input.updatedAt,
    author: {
      '@type': 'Person',
      name: input.authorName,
      url: input.authorUrl,
    },
    publisher: {
      '@type': 'Organization',
      name: input.siteName,
      logo: {
        '@type': 'ImageObject',
        url: input.logoUrl,
      },
    },
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': `${input.siteUrl}/blog/${input.slug}`,
    },
    ...(input.wordCount && { wordCount: input.wordCount }),
    ...(input.section && { articleSection: input.section }),
    ...(input.tags && { keywords: input.tags.join(', ') }),
  }
}


// ============================================================
// 8. FAQ SCHEMA BUILDER UTILITY
// ============================================================

type FAQItem = {
  question: string
  answer: string
}

export function buildFaqSchema(faqs: FAQItem[]): Record<string, unknown> {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map(faq => ({
      '@type': 'Question',
      name: faq.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: faq.answer,
      },
    })),
  }
}


// ============================================================
// 9. BREADCRUMB SCHEMA BUILDER UTILITY
// ============================================================

type BreadcrumbItem = {
  name: string
  url: string
}

export function buildBreadcrumbSchema(items: BreadcrumbItem[]): Record<string, unknown> {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: item.url,
    })),
  }
}

// Usage:
// const breadcrumbs = buildBreadcrumbSchema([
//   { name: 'Home', url: 'https://yoursite.com' },
//   { name: 'Blog', url: 'https://yoursite.com/blog' },
//   { name: 'Article Title', url: 'https://yoursite.com/blog/article-slug' },
// ])


// ============================================================
// 10. OPEN GRAPH IMAGE GENERATION (app/blog/[slug]/opengraph-image.tsx)
// ============================================================

// import { ImageResponse } from 'next/og'
//
// export const runtime = 'edge'
// export const alt = 'Blog post open graph image'
// export const size = { width: 1200, height: 630 }
// export const contentType = 'image/png'
//
// export default async function OgImage({ params }: { params: { slug: string } }) {
//   const post = await fetchPost(params.slug)
//
//   return new ImageResponse(
//     (
//       <div
//         style={{
//           background: 'linear-gradient(135deg, #0f172a, #1e293b)',
//           width: '100%',
//           height: '100%',
//           display: 'flex',
//           flexDirection: 'column',
//           justifyContent: 'space-between',
//           padding: '60px',
//         }}
//       >
//         <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
//           {/* eslint-disable-next-line @next/next/no-img-element */}
//           <img src="https://yoursite.com/logo-white.png" height="40" alt="" />
//           <span style={{ color: '#94a3b8', fontSize: 24 }}>Your Site</span>
//         </div>
//
//         <div>
//           <div style={{ fontSize: 64, fontWeight: 700, color: '#f8fafc', lineHeight: 1.1, maxWidth: 900 }}>
//             {post.title}
//           </div>
//           <div style={{ fontSize: 28, color: '#94a3b8', marginTop: 24 }}>
//             {post.category} — {new Date(post.publishedAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
//           </div>
//         </div>
//       </div>
//     ),
//     { ...size }
//   )
// }
