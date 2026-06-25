#!/usr/bin/env bash
#
# Stop hook: dual-mode completion gate.
#
# Loop mode:  If .claude/agentic-dev-loop.local.md exists, run a structured
#             agentic-dev loop — re-inject the original prompt each iteration,
#             detect <promise> completion tags, enforce max iterations.
#             Activated by /dev-loop or /harness-loop commands.
#
# Gate mode:  If no loop is active, run the standalone completeness check —
#             scan the transcript tail for incomplete signals, unchecked boxes,
#             or recent tool errors and block premature exit.
#
# Set AGENTIC_DEV_MAX to change the standalone gate's max continuation count
# (default: 10, 0 = infinite). Not used in loop mode (loop has its own limit).
#
set -euo pipefail

INPUT=$(cat)
SESSION_ID=$(echo "$INPUT" | jq -r '.session_id')
TRANSCRIPT=$(echo "$INPUT" | jq -r '.transcript_path')
STOP_HOOK_ACTIVE=$(echo "$INPUT" | jq -r '.stop_hook_active // false')

STATE_FILE=".claude/agentic-dev-loop.local.md"

# ─── LOOP MODE ──────────────────────────────────────────────────────────────

if [ -f "$STATE_FILE" ]; then
  # Parse YAML frontmatter (content between first pair of --- delimiters)
  FRONTMATTER=$(sed -n '/^---$/,/^---$/{ /^---$/d; p; }' "$STATE_FILE")
  ITERATION=$(echo "$FRONTMATTER" | grep '^iteration:' | sed 's/iteration: *//')
  MAX_ITERATIONS=$(echo "$FRONTMATTER" | grep '^max_iterations:' | sed 's/max_iterations: *//')
  COMPLETION_PROMISE=$(echo "$FRONTMATTER" | grep '^completion_promise:' | sed 's/completion_promise: *//' | sed 's/^"\(.*\)"$/\1/')
  SPEC_FILE=$(echo "$FRONTMATTER" | grep '^spec_file:' | sed 's/spec_file: *//' | sed 's/^"\(.*\)"$/\1/')

  # Validate numeric fields before arithmetic
  if [[ ! "$ITERATION" =~ ^[0-9]+$ ]]; then
    echo "⚠️  Dev loop: state file corrupted (iteration: '$ITERATION'). Stopping." >&2
    echo "   Run /dev-loop again to start fresh." >&2
    rm "$STATE_FILE"
    exit 0
  fi

  if [[ ! "$MAX_ITERATIONS" =~ ^[0-9]+$ ]]; then
    echo "⚠️  Dev loop: state file corrupted (max_iterations: '$MAX_ITERATIONS'). Stopping." >&2
    rm "$STATE_FILE"
    exit 0
  fi

  # Enforce max iterations
  if [[ "$MAX_ITERATIONS" -gt 0 ]] && [[ "$ITERATION" -ge "$MAX_ITERATIONS" ]]; then
    echo "🛑 Dev loop: max iterations ($MAX_ITERATIONS) reached. Stopping." >&2
    rm "$STATE_FILE"
    exit 0
  fi

  # Require transcript
  if [[ ! -f "$TRANSCRIPT" ]]; then
    echo "⚠️  Dev loop: transcript not found at $TRANSCRIPT. Stopping." >&2
    rm "$STATE_FILE"
    exit 0
  fi

  # Extract last assistant message from JSONL transcript
  if ! grep -q '"role":"assistant"' "$TRANSCRIPT"; then
    echo "⚠️  Dev loop: no assistant messages in transcript. Stopping." >&2
    rm "$STATE_FILE"
    exit 0
  fi

  LAST_LINE=$(grep '"role":"assistant"' "$TRANSCRIPT" | tail -1)
  LAST_OUTPUT=$(echo "$LAST_LINE" | jq -r '
    .message.content |
    map(select(.type == "text")) |
    map(.text) |
    join("\n")
  ' 2>/dev/null || echo "")

  # Check for completion promise tag
  if [[ "$COMPLETION_PROMISE" != "null" ]] && [[ -n "$COMPLETION_PROMISE" ]]; then
    PROMISE_TEXT=$(echo "$LAST_OUTPUT" | \
      perl -0777 -pe 's/.*?<promise>(.*?)<\/promise>.*/$1/s; s/^\s+|\s+$//g; s/\s+/ /g' \
      2>/dev/null || echo "")
    # Use = (literal match) not == (glob) to avoid issues with special chars
    if [[ -n "$PROMISE_TEXT" ]] && [[ "$PROMISE_TEXT" = "$COMPLETION_PROMISE" ]]; then
      echo "✅ Dev loop: completion promise detected. Loop complete." >&2
      rm "$STATE_FILE"
      exit 0
    fi
  fi

  # Continue loop: increment iteration counter in state file
  NEXT_ITERATION=$((ITERATION + 1))
  TEMP_FILE="${STATE_FILE}.tmp.$$"
  sed "s/^iteration: .*/iteration: $NEXT_ITERATION/" "$STATE_FILE" > "$TEMP_FILE"
  mv "$TEMP_FILE" "$STATE_FILE"

  # Extract the prompt body (everything after the closing --- of frontmatter)
  PROMPT_TEXT=$(awk '/^---$/{i++; next} i>=2' "$STATE_FILE")

  if [[ -z "$PROMPT_TEXT" ]]; then
    echo "⚠️  Dev loop: no prompt text found in state file. Stopping." >&2
    rm "$STATE_FILE"
    exit 0
  fi

  # Build system message with iteration context
  if [[ "$MAX_ITERATIONS" -gt 0 ]]; then
    ITER_LABEL="iteration $NEXT_ITERATION/$MAX_ITERATIONS"
  else
    ITER_LABEL="iteration $NEXT_ITERATION"
  fi

  SPEC_REMINDER=""
  if [[ -n "$SPEC_FILE" ]] && [[ "$SPEC_FILE" != "null" ]]; then
    SPEC_REMINDER=" Re-read $SPEC_FILE before starting this iteration."
  fi

  if [[ "$COMPLETION_PROMISE" != "null" ]] && [[ -n "$COMPLETION_PROMISE" ]]; then
    SYSTEM_MSG="🔄 Dev loop $ITER_LABEL |${SPEC_REMINDER} Output <promise>$COMPLETION_PROMISE</promise> ONLY when task is genuinely complete and all gates pass. Do not lie to exit."
  else
    SYSTEM_MSG="🔄 Dev loop $ITER_LABEL |${SPEC_REMINDER} No completion promise set — loop continues indefinitely."
  fi

  jq -n \
    --arg prompt "$PROMPT_TEXT" \
    --arg msg "$SYSTEM_MSG" \
    '{decision: "block", reason: $prompt, systemMessage: $msg}'
  exit 0
fi

# ─── GATE MODE (standalone completeness check) ──────────────────────────────

COUNTER_DIR="${TMPDIR:-/tmp}/agentic-development"
mkdir -p "$COUNTER_DIR"
COUNTER_FILE="${COUNTER_DIR}/${SESSION_ID}"
MAX=${AGENTIC_DEV_MAX:-10}

COUNT=0
if [ -f "$COUNTER_FILE" ]; then
  COUNT=$(cat "$COUNTER_FILE")
fi

if [ "$MAX" -gt 0 ] && [ "$COUNT" -ge "$MAX" ]; then
  rm -f "$COUNTER_FILE"
  exit 0
fi

HAS_INCOMPLETE_SIGNALS=false

if [ -f "$TRANSCRIPT" ]; then
  TAIL=$(tail -80 "$TRANSCRIPT" 2>/dev/null || true)

  if echo "$TAIL" | grep -qi '"status":[[:space:]]*"in_progress"\|"status":[[:space:]]*"pending"' 2>/dev/null; then
    HAS_INCOMPLETE_SIGNALS=true
  fi

  if echo "$TAIL" | grep -qi '"is_error":[[:space:]]*true' 2>/dev/null; then
    HAS_INCOMPLETE_SIGNALS=true
  fi

  if echo "$TAIL" | grep -q '\- \[ \]' 2>/dev/null; then
    HAS_INCOMPLETE_SIGNALS=true
  fi

  if [ "$STOP_HOOK_ACTIVE" = "true" ] && [ "$HAS_INCOMPLETE_SIGNALS" = false ]; then
    rm -f "$COUNTER_FILE"
    exit 0
  fi
fi

NEXT=$((COUNT + 1))
echo "$NEXT" > "$COUNTER_FILE"

if [ "$HAS_INCOMPLETE_SIGNALS" = true ]; then
  PREAMBLE="Incomplete tasks, unchecked boxes, or recent tool errors were detected."
else
  PREAMBLE="Verify the task is genuinely complete before stopping."
fi

if [ "$MAX" -gt 0 ]; then
  LABEL="AGENTIC_DEV (${NEXT}/${MAX})"
else
  LABEL="AGENTIC_DEV (${NEXT})"
fi

REASON="${LABEL}: ${PREAMBLE}

Before stopping, do each of these checks:

1. RE-READ THE ORIGINAL USER MESSAGE(S). List every discrete request, acceptance criterion, and constraint.
2. CHECK REPO POLICY. Confirm that repo-local instruction files and workflow rules were followed.
3. CHECK PLAN OR SPEC STATE. Any pending plan item, open checkbox, unresolved requirement, or unanswered blocker means you are not done.
4. CHECK REVIEW AND CI FOLLOW-UPS. If review comments, PR feedback, or failing checks were part of the task, confirm each one is resolved or explicitly called out.
5. CHECK VERIFICATION EVIDENCE. Do not claim fixed, passing, or complete without fresh evidence. If you did not run a needed verification, say so plainly instead of implying success.
6. CHECK GIT STATE AND CLEANUP. Confirm whether the branch, worktree, and staged changes are in the intended final state for this task.

IMPORTANT: If the user explicitly said to stop, defer work, skip verification, or leave integration steps for later, respect that instruction. Otherwise, continue working instead of narrating what remains."

jq -n --arg reason "$REASON" '{ decision: "block", reason: $reason }'
