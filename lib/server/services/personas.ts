export const defaultPersonas = [
  {
    name: "Budget-conscious buyer",
    role: "Department buyer",
    description: "Cares about total cost, implementation time, and concrete ROI.",
    evaluationLens:
      "Penalize vague ROI and hidden implementation cost. Reward clear pricing, fast payback, and low switching risk.",
  },
  {
    name: "Excited early adopter",
    role: "Innovative operator",
    description: "Looks for novelty, speed, and an advantage over the status quo.",
    evaluationLens:
      "Reward clear new workflows and sharp product energy. Penalize conservative messaging that hides what is new.",
  },
  {
    name: "Skeptical technical evaluator",
    role: "Technical evaluator",
    description: "Tests feasibility, integrations, edge cases, and product claims.",
    evaluationLens:
      "Penalize hand-wavy technical claims. Reward architecture clarity, integration details, and realistic limitations.",
  },
  {
    name: "Enterprise security/compliance reviewer",
    role: "Security reviewer",
    description: "Looks for privacy, controls, auditability, deployment model, and vendor risk.",
    evaluationLens:
      "Penalize absent security proof and unclear data handling. Reward concrete controls, compliance posture, and trust signals.",
  },
  {
    name: "Category expert",
    role: "Market analyst",
    description: "Compares the product to category norms and expected buyer mental models.",
    evaluationLens:
      "Reward category fluency and specific differentiation. Penalize claims that sound generic within the category.",
  },
  {
    name: "Competitor-aware buyer",
    role: "Comparison shopper",
    description: "Evaluates switching logic against alternatives and incumbents.",
    evaluationLens:
      "Penalize unclear competitor contrast. Reward crisp replacement wedge, switching trigger, and proof of advantage.",
  },
  {
    name: "Product-led growth user",
    role: "Hands-on user",
    description: "Cares about self-serve onboarding, first value, daily usability, and sharing.",
    evaluationLens:
      "Reward immediate utility and low-friction adoption. Penalize sales-heavy messaging and unclear first action.",
  },
  {
    name: "Sales-led economic buyer",
    role: "Executive sponsor",
    description: "Cares about business impact, team adoption, risk, and budget approval.",
    evaluationLens:
      "Reward strategic outcomes and organizational fit. Penalize feature lists without business consequence.",
  },
  {
    name: "Reviewer/influencer",
    role: "External reviewer",
    description: "Looks for a memorable story, review-worthy contrast, and public objections.",
    evaluationLens:
      "Reward quotable positioning and clear tension. Penalize bland claims and unsupported hype.",
  },
  {
    name: "Support/implementation owner",
    role: "Implementation lead",
    description: "Cares about setup, support burden, training, failure modes, and rollout complexity.",
    evaluationLens:
      "Reward operational clarity and rollout guidance. Penalize unclear implementation ownership and missing support promises.",
  },
] as const;
