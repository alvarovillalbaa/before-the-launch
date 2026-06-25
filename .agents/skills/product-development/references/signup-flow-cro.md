# Signup Flow CRO

Use this reference when the user needs to improve account creation, trial signup, waitlist capture, or registration completion.

This is a post-click conversion reference. Use `../product-marketing/` for the page that leads into signup; use this file for the flow itself.

---

## Initial Assessment

Read `.agents/product-marketing-context.md` first if it exists so the field labels, reassurance, and CTA language stay aligned with the product promise.

Before recommending changes, establish:

1. **Flow type**
- Free trial
- Freemium signup
- Paid account creation
- Waitlist / early access
- B2B vs. B2C

2. **Current flow**
- Number of steps or screens
- Required fields
- Social auth or SSO availability
- Verification requirements
- Where users currently drop

3. **Business constraints**
- Data genuinely required before product use
- Compliance or fraud constraints
- What happens immediately after submit

---

## Core Principles

### 1. Minimize required input

Every field adds friction. Challenge each one:
- Is it required before first value?
- Can it be collected later?
- Can it be inferred from auth, domain, or product behavior?

Typical field priority:
- essential: email or auth provider, password when needed
- situational: name
- usually deferrable: company, role, team size, phone, address

### 2. Show value before asking for commitment

- Let users see the payoff before the form when possible
- Avoid asking for information unrelated to immediate product access
- Keep the perceived trade small relative to the promised value

### 3. Reduce perceived effort

- Keep each step visually small
- Group related fields
- Use sensible defaults and autofill
- Reveal only what is needed now

### 4. Remove uncertainty

- State how long signup takes
- State what happens after submit
- Avoid hidden verification, pricing, or setup surprises

---

## Field-by-Field Guidance

### Email

- One email field only
- Validate format inline
- Catch obvious domain typos when possible
- If the account already exists, provide the recovery path immediately

### Password

- Show requirements before failure
- Allow paste
- Add show / hide toggle
- Prefer flexible strength guidance over arbitrary rigid rules
- Consider passwordless or magic-link flows when they reduce friction

### Name

- Require only if it powers immediate personalization or collaboration
- Test one full-name field against first/last split

### Social Auth / SSO

- Make the relevant provider prominent for the audience
- Separate auth options clearly from manual entry
- Keep button copy explicit: `Continue with Google`, not `Use Google`

### Phone

- Defer unless necessary for verification, routing, or regulated workflows
- If required, explain why

### Company / Role / Use Case

- Prefer progressive profiling after account creation
- If one question is needed for routing or personalization, ask only one

---

## Flow Shape

### Single-step fits when

- three or fewer required fields
- low-complexity products
- high-intent traffic

### Multi-step fits when

- multiple types of information must be collected
- the product needs light segmentation before first value
- the audience tolerates a longer flow because the reward is high

### Multi-step rules

- show progress
- lead with easy fields
- save progress
- allow back navigation
- make every step feel finishable in seconds

Recommended progressive commitment pattern:
1. Lowest-friction entry: email or SSO
2. Account completion: password and name if needed
3. Personalization questions after the user is committed

---

## Trust and Friction Reduction

Place reassurance where doubt happens, not only in a footer FAQ.

Useful trust elements:
- `No credit card required` when true
- trial length or free-plan clarity
- privacy reassurance
- social proof near the form
- security / compliance markers when relevant

### Error handling rules

- validate close to the field
- never clear the whole form after an error
- focus the first broken field after submit
- explain the fix, not just the failure

### Microcopy rules

- visible labels, not placeholder-only forms
- concise helper text only when necessary
- CTA labels should describe the next value or step

---

## Mobile Considerations

- single-column layout
- 44px+ touch targets
- correct keyboard types
- autofill support
- reduced typing wherever possible
- sticky or consistently visible primary CTA on long steps

---

## Post-Submit Experience

The submit event is not the end of the conversion flow.

### Success state

- confirm the account was created
- show the immediate next action
- explain email verification only if it is required now

### Verification flows

- delay verification until it is necessary when possible
- provide resend and email-change paths
- let users continue when risk allows instead of blocking all progress

---

## Measurement

Track:
- page-to-form start rate
- form completion rate
- drop-off by step
- drop-off by field
- error rate by field
- mobile vs. desktop completion
- auth method split

Minimum event map:
- `signup_viewed`
- `signup_started`
- `signup_step_completed`
- `signup_field_error`
- `signup_completed`
- `verification_completed`

---

## Deliverable Format

### Signup Audit

For each issue:
- **Issue**
- **Impact**
- **Recommended fix**
- **Priority**

### Recommended Flow

Include:
- recommended field set
- field order
- single-step vs. multi-step recommendation
- reassurance copy
- post-submit path
- instrumentation requirements

### Experiment Backlog

Organize into:
1. quick wins
2. high-impact changes
3. test hypotheses

---

## Handoffs

- Use `onboarding-cro.md` for what happens after account creation.
- Use `../../../../engineering/skills/frontend/references/signup-onboarding-flows.md` when the request shifts to browser implementation details, states, instrumentation, or accessibility.
