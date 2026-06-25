# Multi-Agent Review

Use this pattern for launch videos and any substantial video before final handoff. Deploy four parallel critics, each with a single axis of evaluation. This compensates for human review fatigue — no single reviewer can hold design, copy, pacing, and brand alignment in mind at the same time.

## When to use

- Product launch videos
- Feature announcement videos
- Any video with 3 or more scenes
- Before delivering to a stakeholder or publishing

## The four critics

### 1. Design / Layout critic

Evaluate:
- Spacing and alignment — do elements have consistent margin? Are any elements clipping the frame edge?
- Safe areas — is copy within the subtitle-safe zone? Does the UI respect edge padding?
- Visual hierarchy — can the eye move through each scene in the intended order?
- Overlaps — do caption layers, UI overlays, or animated elements occlude each other at any frame?

Report: specific frame ranges and what breaks.

### 2. Text / Readability critic

Evaluate:
- Does every text element read clearly at 720p (the lowest platform resolution for social)?
- Is the copy too dense for the scene duration? A viewer can process roughly 3–4 words per second on screen.
- Does any text clip, overflow, or disappear before it is fully readable?
- Are burned-in captions present on all social export compositions?
- Do captions match the voiceover or product copy exactly — no invented paraphrasing?

Report: timestamps and lines that fail readability.

### 3. Narrative / Pacing critic

Evaluate:
- Does each scene earn its runtime? Cut anything that does not advance the argument.
- Does the video establish the product identity within 3 seconds?
- Does the before/after sequence stagger (not simultaneously appear)?
- Does the differentiating feature get the most screen time?
- Does the CTA arrive with enough time for the viewer to act?
- Would a viewer watching on mute still understand the video's core message?

Report: beats that drag, scenes that are unclear without audio, structural problems.

### 4. Brand alignment critic

Evaluate:
- Are brand colors, fonts, and logo usage consistent with the inputs provided?
- Are there any silently introduced generic defaults (Inter, Roboto, indigo, dark glass cards)?
- Does the visual system look distinct, or would it be interchangeable after a logo swap?
- Is the product UI from real screenshots, not invented labels?
- Do any copy lines contradict or misrepresent the product's actual features?

Report: specific violations and the brand rule each one breaks.

## How to run

Invoke all four critics in a single parallel call. Each receives:
- the storyboard table
- the approved plan
- the rendered output or Studio preview link
- its own evaluation axis only (do not give each critic the other critics' axes)

Collect findings, de-duplicate, and address before final handoff. Prioritize: text clipping, invented UI copy, and hook timing failures first, then polish items second.
