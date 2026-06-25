# Signup and Onboarding Flows

Use this reference when implementing browser-facing signup, trial, waitlist, verification, or onboarding flows.

This file translates CRO and activation strategy into concrete frontend requirements: states, component rules, validation behavior, instrumentation, accessibility, and mobile behavior.

Pair with:
- `../../../product/skills/product-development/references/signup-flow-cro.md` for flow strategy and field decisions
- `../../../product/skills/product-development/references/onboarding-cro.md` for activation and onboarding design

---

## Use This When

- building or refactoring signup forms
- implementing SSO or auth-option selection
- designing multi-step registration
- building verification or post-submit success screens
- adding onboarding checklists, empty states, or guided tours
- wiring activation analytics into the UI

---

## Implementation Principles

### 1. One primary action per view

Each screen or major panel should make the next step obvious. Secondary actions should support escape or recovery, not compete with the main task.

### 2. Preserve momentum

Never make users re-enter data after a recoverable failure. Save draft state across refreshes or route transitions when the flow is multi-step.

### 3. Validation should guide, not punish

- validate format close to the field
- reveal errors after blur or submit, not on every keystroke
- keep the error message actionable
- focus the first invalid field after submit

### 4. Product value must stay visible

Do not let the form or checklist become detached from the reason the user started. Supportive proof, outcome framing, or example state should stay visible when it meaningfully reduces drop-off.

---

## Signup Implementation Checklist

### Field behavior

- visible labels on every field
- semantic input types and `autocomplete`
- password show / hide toggle
- preserve entered values on error
- clear recovery path for existing-account errors
- do not block paste into password fields

### Flow structure

- separate auth buttons clearly from manual-entry fields
- use progress UI on multi-step flows
- allow back navigation without data loss
- reveal optional profile questions after the account is usable whenever possible

### Trust and reassurance

- place reassurance close to the CTA when it reduces hesitation
- do not bury verification, billing, or privacy details
- keep CTA labels specific to the next outcome

### Mobile behavior

- 44px+ touch targets
- single-column field layout
- appropriate keyboard for each field
- avoid sticky elements that cover inputs or errors
- ensure submit CTA remains reachable with the software keyboard open

---

## Required UI States

Every conversion-sensitive flow should explicitly implement:

- default
- focused
- invalid field
- submitting / pending
- success
- recoverable error
- timeout / offline
- resume state for returning users

If the flow is multi-step, also implement:
- in-progress step
- completed step
- blocked step with reason

---

## Onboarding Implementation Checklist

### First-run experience

- one clear next action
- no empty dead ends
- visible progress if setup spans multiple tasks

### Checklist components

- keep visible item count manageable
- show completion state clearly
- allow dismissal or defer
- order items by user value

### Empty states

- explain the purpose of the area
- show the first action
- include an example or preview when it clarifies the model

### Tours and guided hints

- only for non-obvious interactions
- short and dismissible
- never block core actions behind a forced tour
- do not show repeatedly after completion or dismissal

### Resume flows

- detect incomplete setup
- route users back to the most relevant unfinished action
- show "continue where you left off" style recovery rather than restarting the whole journey

---

## Instrumentation Requirements

Frontend should emit enough detail to diagnose friction without re-shipping the UI later.

Minimum signup events:
- `signup_viewed`
- `signup_started`
- `signup_step_viewed`
- `signup_step_completed`
- `signup_field_error`
- `signup_completed`

Minimum onboarding events:
- `onboarding_started`
- `onboarding_step_viewed`
- `onboarding_step_completed`
- `activation_reached`
- `onboarding_dismissed`

Useful properties:
- `step_id`
- `field_name`
- `auth_method`
- `error_type`
- `variant`
- `device_class`
- `source`

---

## Accessibility and Performance

Accessibility:
- keyboard reachable across the full flow
- errors announced through accessible semantics
- progress indicators exposed to screen readers
- icon-only auth buttons labelled

Performance:
- avoid large hero media or third-party scripts that delay form interaction
- keep first input interactive quickly
- reserve layout space so validation and async states do not cause major shift

---

## Component Boundaries

Prefer small, explicit pieces:
- auth option group
- form step container
- field with label / help / error
- progress indicator
- success state panel
- checklist item
- empty state card

Avoid monolithic "signup wizard" components that mix layout, validation, analytics, routing, and business logic in one file.

---

## Handoffs

- If the open question is which fields or steps should exist, route back to the product skill references before coding.
- If the problem is pre-click page messaging or CTA promise mismatch, route to `../../../product/skills/product-marketing/SKILL.md`.
