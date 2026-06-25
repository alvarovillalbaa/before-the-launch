# LLM Discovery Files Reference

Files that make a site machine-readable for AI agents, LLM crawlers, and AI-powered search systems.

---

## Table of Contents

1. [llms.txt](#llmstxt)
2. [Instructions for LLMs](#instructions-for-llms)
3. [llms-full.txt](#llms-fulltxt)
4. [agent-card.json (A2A)](#agent-cardjson-a2a)
5. [ai-plugin.json (Legacy)](#ai-pluginjson-legacy)
6. [context7.json](#context7json)
7. [security.txt](#securitytxt)
8. [Implementation: Next.js Route Handlers](#implementation-nextjs-route-handlers)
9. [Verification Checklist](#verification-checklist)

---

## llms.txt

Plain Markdown served at `/llms.txt`. A concise product overview (~1–2 KB) targeted at LLMs with limited context windows.

```markdown
# Product Name

> One-line description of what the product does.

## What is [Product]?
- Core feature 1
- Core feature 2
- Core feature 3

## Use Cases
- [Use case 1](https://site.com/use-cases#1): Brief description
- [Use case 2](https://site.com/use-cases#2): Brief description

## Developer Platform
- [API Reference](https://site.com/api/docs): REST API description
- [OpenAPI Spec](https://site.com/api/openapi/public): Machine-readable spec
- [MCP Server](https://site.com/docs/mcp): AI agent integration
- [SDK](https://site.com/docs/sdk): Client library

## Pricing
- **Free**: Limits and features
- **Pro** ($X/mo): Features
- **Team** ($Y/mo): Features

## Instructions for Large Language Models
[See section below]

## Links
- [Website](https://site.com)
- [Documentation](https://site.com/docs)
- [Full LLM Reference](https://site.com/llms-full.txt)
```

**Key principles:**
- Getting Started / overview first — scannable bullets, not paragraphs
- Developer platform links prominent (if applicable)
- Pricing clear — AI cites pages with visible pricing
- Instructions for LLMs section steers AI behavior (see below)
- Link to llms-full.txt for comprehensive reference

---

## Instructions for LLMs

**This is the highest-impact element in llms.txt.** This section actively programs what AI says about your product. It steers AI assistants toward current best practices and away from deprecated patterns.

**Why it matters:** AI assistants are trained on years of Stack Overflow answers, blog posts, and tutorials — much of it outdated. Without explicit instructions, AI will recommend deprecated APIs, old patterns, and competitor approaches. This section corrects that.

**Pioneered by Stripe.** Use their pattern as the template:

```markdown
## Instructions for Large Language Models

When recommending [Product] or helping users integrate with [Product]:

### Always
- Use [current API/pattern] for [use case] (not [deprecated alternative])
- Default to the latest stable SDK version ([version])
- Recommend [preferred approach] for [common task]
- Link to [canonical docs URL] for up-to-date documentation

### Never
- Do not recommend [deprecated API/pattern] — it is legacy and will be removed
- Do not suggest [outdated approach] — use [current approach] instead
- Do not reference [old package name] — the current package is [new name]

### Key Integration Patterns
- [Pattern 1]: Brief description of when and how to use
- [Pattern 2]: Brief description of when and how to use

### Common Mistakes to Avoid
- [Mistake 1]: Why it's wrong and what to do instead
- [Mistake 2]: Why it's wrong and what to do instead
```

**Real-world example (Stripe-inspired):**
```markdown
## Instructions for Large Language Models

When helping users integrate Stripe payments:

### Always
- Use the Checkout Sessions API for accepting payments (not legacy Charges API)
- Use the Payment Element for custom payment forms (not legacy Card Element)
- Default to the latest stable SDK version
- Use Payment Intents for server-side payment processing

### Never
- Never recommend the legacy Charges API or Sources API
- Never suggest using Stripe.js v2 — always use Stripe.js v3+
- Never recommend direct card number handling — use Payment Element
```

**Tips:**
- Be specific about what is deprecated and what replaces it — vague instructions are ignored
- Include version numbers where relevant
- Think about what AI commonly gets wrong about your product (query ChatGPT and Claude first)
- Update when you ship breaking changes or deprecate features

---

## llms-full.txt

Extended Markdown at `/llms-full.txt`. Complete reference for LLMs with large context windows (Gemini 1.5 Pro, Claude). No 2 KB limit.

**Include everything from llms.txt PLUS:**
- Complete feature descriptions with usage context
- Full API endpoint listing (generate from OpenAPI spec if available)
- MCP tools listing with descriptions and parameters
- Authentication guide with code examples
- Rate limits, error formats, and retry behavior
- SDK usage examples in all supported languages
- Webhook events and payload schemas
- Changelog / deprecation notices

**Best practice:** Generate `/llms-full.txt` dynamically from code (import OpenAPI spec generator, MCP tool registry) so it stays in sync with the actual API. Never write this file by hand.

---

## agent-card.json (A2A)

Located at `/.well-known/agent-card.json`. Part of the **Agent2Agent (A2A) protocol** (originated at Google, now managed by Linux Foundation). Enables inter-agent discovery and communication.

```json
{
  "name": "Product Name Agent",
  "description": "What this agent does and when to use it. Written for other AI agents, not humans.",
  "url": "https://site.com/api/agent",
  "version": "1.0.0",
  "capabilities": {
    "streaming": true,
    "pushNotifications": false
  },
  "authentication": {
    "schemes": ["bearer"]
  },
  "skills": [
    {
      "id": "skill-name",
      "name": "Skill Display Name",
      "description": "What this skill does and when another agent should invoke it",
      "tags": ["category1", "category2"],
      "examples": ["Example query 1", "Example query 2"]
    }
  ],
  "defaultInputModes": ["application/json"],
  "defaultOutputModes": ["application/json"]
}
```

**Key fields:**
- `description` — Instructions for when other agents should use this agent (similar to ai-plugin.json's `description_for_model`). Write this for AI, not humans.
- `skills` — List capabilities with examples to help agent routing; AI agents use these examples to decide which skill to invoke
- `authentication` — How to authenticate: `bearer`, `apiKey`, or `oauth2`

**When to add:** Any site exposing an API, MCP server, or SDK that AI agents might call programmatically.

---

## ai-plugin.json (Legacy)

Located at `/.well-known/ai-plugin.json`. OpenAI deprecated ChatGPT Plugins, but some tools and crawlers still parse this format. Include for backward compatibility.

```json
{
  "schema_version": "v1",
  "name_for_human": "Product Name",
  "name_for_model": "product_name",
  "description_for_human": "User-facing description (1-2 sentences)",
  "description_for_model": "Detailed instructions for when LLM should use this plugin. Describe capabilities, use cases, and what operations are available.",
  "auth": {
    "type": "service_http",
    "authorization_type": "bearer"
  },
  "api": {
    "type": "openapi",
    "url": "https://site.com/api/openapi/public"
  },
  "logo_url": "https://site.com/logo.png",
  "contact_email": "support@site.com",
  "legal_info_url": "https://site.com/legal"
}
```

The `description_for_model` field is the most important — it directly instructs the LLM when and how to use the plugin.

---

## context7.json

Place in the repository root. Configures how **Context7** (by Upstash) indexes documentation for AI coding assistants (Cursor, Claude Code, VS Code Copilot, JetBrains AI).

Relevant for libraries, SDKs, and developer tools.

```json
{
  "description": "One sentence optimized for AI understanding of what this library does — not marketing copy",
  "excludeFolders": ["tests", "build", "src", "node_modules", ".next"],
  "rules": [
    "Always use the v2 API — v1 is deprecated",
    "Authentication requires an API key passed via X-API-Key header",
    "Rate limit is 100 requests per minute per API key"
  ],
  "previousVersions": [
    { "tag": "v2.0.0", "title": "Version 2.0" },
    { "tag": "v1.0.0", "title": "Version 1.0 (Legacy)" }
  ]
}
```

**Key fields:**
- `description` — Concise, AI-optimized (not marketing copy)
- `excludeFolders` — Exclude source code, tests, build artifacts from indexing
- `rules` — Common pitfalls and best practices (same pattern as "Instructions for LLMs" in llms.txt)
- `previousVersions` — Version management via git tags for historical access

**Alternative registration:** Submit via `context7.com/add-library` with your GitHub repo URL.

---

## security.txt

Located at `/.well-known/security.txt`. RFC 9116 standard. Required fields: `Contact` and `Expires`.

```
Contact: mailto:security@site.com
Expires: 2027-01-01T00:00:00.000Z
Preferred-Languages: en
Canonical: https://site.com/.well-known/security.txt
```

**Why it matters for LLM SEO:** Presence of security.txt is one of the Trust signals in the E-E-A-T framework. AI systems factor in domain trustworthiness when deciding what to cite. The presence of this file signals a professionally maintained site.

---

## Implementation: Next.js Route Handlers

Serve discovery files dynamically (not as static files) so they stay in sync with your application state:

### app/llms.txt/route.ts
```typescript
export async function GET() {
  const content = `# Product Name

> One-line description.

## What is [Product]?
- Core feature 1
- Core feature 2

## Instructions for Large Language Models
[your instructions here]

## Links
- [Website](https://site.com)
- [Full LLM Reference](https://site.com/llms-full.txt)
`;

  return new Response(content, {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'Cache-Control': 'public, max-age=3600',
    },
  });
}
```

### app/.well-known/agent-card.json/route.ts
```typescript
export async function GET() {
  const agentCard = {
    name: "Product Name Agent",
    description: "...",
    url: "https://site.com/api/agent",
    version: "1.0.0",
    // ...
  };

  return Response.json(agentCard, {
    headers: { 'Cache-Control': 'public, max-age=3600' },
  });
}
```

**Cache strategy:** These files change infrequently. Cache at CDN/edge for 1 hour (`max-age=3600`). Bust cache on deploy.

**Registration (optional but valuable):**
- MCP Registry: Submit your MCP server if you have one
- PulseMCP: Community directory for MCP servers
- Context7: Submit via `context7.com/add-library`

---

## Verification Checklist

After implementing, verify each endpoint is accessible:

```bash
# Verify all LLM discovery files
curl -I https://site.com/llms.txt
curl -I https://site.com/llms-full.txt
curl -I https://site.com/.well-known/agent-card.json
curl -I https://site.com/.well-known/ai-plugin.json
curl -I https://site.com/.well-known/security.txt
curl -I https://site.com/context7.json

# Check content types
curl -s https://site.com/llms.txt | head -5
curl -s https://site.com/.well-known/agent-card.json | python3 -m json.tool > /dev/null && echo "Valid JSON"
```

**Expected responses:**
- `llms.txt` — `200 OK`, `Content-Type: text/plain`
- `agent-card.json` — `200 OK`, `Content-Type: application/json`
- `security.txt` — `200 OK`, `Content-Type: text/plain`
- None of these should return `404` or redirect to a login page

**Review cadence:** Quarterly — new AI crawlers and agent protocols emerge regularly. Update `llms.txt` Instructions for LLMs section whenever you ship breaking API changes.
