---
name: frontend
description: >-
  Use for frontend engineering work such as components, routes, state
  management, accessibility, performance, design-system integration, and
  browser-facing debugging or refactors.
---

# Frontend

This skill owns browser-facing implementation depth. Use it together with [`../agentic-development/SKILL.md`](../agentic-development/SKILL.md): `agentic-development` handles repo orientation, planning, and execution model; this skill handles UI/component/framework detail.

## Start Here

1. Pair with [`../agentic-development/SKILL.md`](../agentic-development/SKILL.md) for repo orientation and proof planning.
2. Map framework boundaries, route ownership, state owners, design-system sources, analytics seams, and error-reporting seams before editing.
3. Choose the right artifact level before coding: primitive, composed control, domain component, page section, hook, store, or route.
4. Confirm accessibility, responsive behavior, loading/empty/error states, and performance expectations before implementation.
5. If the change requires API, auth, database, caching, queues, or service work, pull in [`../backend/SKILL.md`](../backend/SKILL.md) for that slice instead of inventing server logic from the client side.

## Core Rules

- Frontend work is product behavior, not decoration.
- Preserve existing router conventions, state ownership, primitives, and design-system rules.
- Prefer composition, slots, and subcomponents over boolean-heavy APIs.
- Keep business logic and async orchestration out of leaf UI where possible.
- Treat loading, empty, error, success, keyboard, and mobile states as part of the implementation.
- Performance and accessibility are part of correctness, not post-hoc polish.
- Signup, auth, and onboarding flows must treat validation, recovery, instrumentation, and mobile behavior as part of correctness.
- Landing pages and trial-entry surfaces must treat CTA visibility, trust placement, form friction, mobile responsiveness, and page speed as explicit acceptance criteria.
- For cross-domain features, keep this skill focused on the browser-facing slice and use [`../backend/SKILL.md`](../backend/SKILL.md) for server-side changes.

## Workflow Router

### Delivery workflow

Read [frontend-development.md](./references/frontend-development.md) for the main delivery loop: framework boundary detection, reusable component design, refactor workflow, async UX, accessibility, responsiveness, performance priorities, analytics, and the frontend helper scripts.

Read [frontend-best-practices.md](./references/frontend-best-practices.md) for TypeScript patterns, Tailwind+CVA patterns, feature structure, barrel-export guidance, and common security guardrails for frontend code.

### React and Next.js depth

Read [react-patterns.md](./references/react-patterns.md) for concrete React composition, hooks, state management, and anti-pattern examples.

Read [react-performance-rules.md](./references/react-performance-rules.md) and [`references/react-rules/`](./references/react-rules/) when performance, bundle size, render churn, caching, or rendering cost matters.

Read [no-use-effect.md](./references/no-use-effect.md) whenever writing or reviewing React components that might drift into defensive `useEffect` usage.

Read [nextjs-optimization-guide.md](./references/nextjs-optimization-guide.md) for rendering strategies, streaming, caching, dynamic imports, and Core Web Vitals work.

Read [next-best-practices.md](./references/next-best-practices.md) and [`references/next-best-practices/`](./references/next-best-practices/) when writing or reviewing Next.js code.

### Components and design systems

Read [building-components.md](./references/building-components.md) when designing component APIs, primitives, accessibility patterns, composition systems, or library distribution.

Read [component-refactoring.md](./references/component-refactoring.md) when reducing component complexity or extracting hooks and structure.

Read [design-system.md](./references/design-system.md) when auditing or extending a design system itself.

Read [shadcn.md](./references/shadcn.md) and [`references/shadcn/`](./references/shadcn/) for shadcn/ui component work, theming, registry usage, and update workflows.

### Signup and onboarding implementation

Read [signup-onboarding-flows.md](./references/signup-onboarding-flows.md) when implementing signup forms, auth selection, verification states, onboarding checklists, empty states, guided tours, or activation instrumentation.

### UI constraints, design quality, and polish

Read [ui-constraints.md](./references/ui-constraints.md) for hard MUST/NEVER/SHOULD rules around stack defaults, accessible primitives, motion budget, layout discipline, glassmorphism technique, and design guardrails.

Read [design-engineering.md](./references/design-engineering.md) for animation decisions, interaction polish, gestures, and perceived performance. The Quick Decision table at the top is the fastest path to the right easing and duration.

Read [transitions.md](./references/transitions.md) for the CSS micro-transition pattern library: nine drop-in transitions (card resize, number pop-in, notification badge, text swap, dropdown, modal, panel reveal, page slide, icon swap) with semantic CSS custom properties and a decision tree for picking the right one.

Read [anti-slop.md](./references/anti-slop.md) for forbidden AI design patterns, the brand-mode vs product-mode register system, and the pre-ship anti-slop checklist. Apply before shipping any UI to avoid recognizable AI clichés.

Read [ui-ux-guidelines.md](./references/ui-ux-guidelines.md) for broader UX rules across accessibility, forms, navigation, charts, interaction design, audio feedback, predictive prefetching, and the named Laws of UX (Fitts', Hick's, Miller's, Jakob's, von Restorff, Zeigarnik, and 13 others).

Read [web-design-guidelines.md](./references/web-design-guidelines.md) when auditing UI code or validating a page against best practices.

Read [pre-shipping-polish.md](./references/pre-shipping-polish.md) for final visual and interaction cleanup before shipping.

### Design creation and review workflows

Read [design-consultation.md](./references/design-consultation.md) when creating a design system or visual direction from scratch.

Read [design-critique.md](./references/design-critique.md) for structured feedback on mockups, screenshots, or Figma designs.

Read [design-review.md](./references/design-review.md) for live-site visual QA and iterative polish.

### Cinematic / immersive web work

Read [`references/epic-design/`](./references/epic-design/) when the task is cinematic, scroll-driven, premium, or immersive. The asset pipeline, depth system, motion system, accessibility, and performance references in that folder should be treated as a required bundle for scrollytelling work.

## Bundled Scripts

- `scripts/component_generator.py` for consistent component scaffolding.
- `scripts/bundle_analyzer.py` for pre/post change JS bundle analysis.
- `scripts/frontend_scaffolder.py` for route/page/feature scaffolding.
- `scripts/inspect-assets.py` for asset inspection in design-heavy or cinematic work.
- `scripts/validate-layers.js` for validating layered cinematic builds.

## Standard Loop

1. Orient with [`../agentic-development/SKILL.md`](../agentic-development/SKILL.md).
2. Map component, route, state, and design-system ownership.
3. Choose the correct artifact boundary.
4. Implement with accessibility, responsiveness, and performance in scope.
5. Pull in [`../backend/SKILL.md`](../backend/SKILL.md) for any server-side dependency instead of faking it in the client.
6. Verify with the right proof: tests, screenshots, bundle diff, or live interaction checks.

## Skill Orchestration

- Use [`../backend/SKILL.md`](../backend/SKILL.md) for API contracts, auth, persistence, queues, caching, schema design, and service logic.
- Use [`../agentic-development/SKILL.md`](../agentic-development/SKILL.md) when the work needs execution-mode selection, repo-wide planning, PR/review handling, or coordinated frontend/backend delivery.
- Use `quality-assurance` when verification strategy, flaky tests, or passive security review becomes the bottleneck.
