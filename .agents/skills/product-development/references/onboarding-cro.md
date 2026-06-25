# Onboarding CRO

Use this reference when the user needs to improve activation, shorten time-to-value, or design what happens after signup.

This reference focuses on in-product activation and early retention, not the pre-click page and not the signup form itself.

---

## Initial Assessment

Read `.agents/product-marketing-context.md` first if it exists so the onboarding language, examples, and promises stay consistent with acquisition messaging.

Before recommending changes, establish:

1. **Product context**
- product type
- self-serve vs. sales-assisted
- B2B vs. B2C

2. **Activation definition**
- what behavior means the user "gets it"
- what earliest action correlates with retention

3. **Current state**
- what happens in the first session
- what happens in the first day / week
- where users stall or abandon

---

## Core Principles

### 1. Time-to-value wins

Strip away steps between signup and first real value. If a task does not increase the chance of activation, delay it.

### 2. One meaningful goal per session

The first session should aim at one clear success, not complete mastery.

### 3. Learning by doing beats explanation

Prefer guided action, example data, and task completion over product tours that explain without helping the user achieve anything.

### 4. Visible progress sustains momentum

Checklists, completion states, and lightweight celebration help users continue through the setup work.

---

## Defining Activation

Identify the earliest behavior that strongly predicts retention.

Examples:
- project tool: create the first project and invite a collaborator
- analytics tool: connect a source and view the first report
- design tool: create, export, or share the first asset
- marketplace: complete the first successful transaction

Track:
- activation rate
- time to activation
- steps to activation
- activation by acquisition source or segment

---

## First-Run Flow Design

### First 30 seconds

Choose the least-friction path that still gets users to real value:

- **Product-first** when the interface is simple and the user can act immediately
- **Guided setup** when basic personalization is required before value appears
- **Value-first** when demo or sample data can show the outcome instantly

Regardless of approach:
- one primary next action
- no dead ends
- clear progress when multi-step

### Onboarding checklist

Best for products with multiple setup tasks or discoverable features.

Rules:
- 3 to 7 items
- ordered by value, not by internal dependency unless necessary
- quick wins first
- dismissible
- progress visible
- completion acknowledged

### Empty states

Treat empty states as onboarding surfaces:
- explain what the area is for
- show what success looks like
- provide one clear action
- preload example data when it helps users understand the model

### Tours and tooltips

Use sparingly:
- only for non-obvious or high-value interactions
- keep to 3 to 5 steps
- always dismissible
- never replay endlessly for returning users

---

## Re-Engagement and Stalled Users

Define what "stalled" means:
- inactive for X days
- setup incomplete
- reached signup but not activation

Response options:
1. targeted lifecycle email tied to the missing action
2. resume-state messaging inside the product
3. human outreach for high-value or sales-assisted accounts

Lifecycle messaging should reinforce the missing action, not restate generic welcome copy.

---

## Measurement

Core metrics:
- activation rate
- time to activation
- onboarding completion rate
- day 1 / 7 / 30 retention
- drop-off by onboarding step

Recommended event map:
- `onboarding_started`
- `onboarding_step_viewed`
- `onboarding_step_completed`
- `activation_reached`
- `onboarding_dismissed`
- `resume_prompt_clicked`

Funnel template:

`Signup -> Step 1 -> Step 2 -> Activation -> Early retention`

Focus first on the largest drop before adding more surfaces or messaging.

---

## Deliverable Format

### Onboarding Audit

For each issue:
- **Finding**
- **Impact**
- **Recommendation**
- **Priority**

### Onboarding Flow Recommendation

Include:
- activation event definition
- first-session goal
- step-by-step flow
- checklist items if used
- empty-state guidance
- lifecycle trigger outline
- measurement plan

---

## Handoffs

- Use `signup-flow-cro.md` when the main problem is registration friction before account creation.
- Use `../../../../engineering/skills/frontend/references/signup-onboarding-flows.md` when the user needs implementation rules for checklist UI, tours, empty states, resume flows, or instrumentation.
