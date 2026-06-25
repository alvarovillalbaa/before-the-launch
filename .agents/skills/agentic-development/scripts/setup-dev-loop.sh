#!/bin/bash
#
# Setup script for agentic dev loops.
# Creates .claude/agentic-dev-loop.local.md — the state file read by the stop hook.
#
# Usage: setup-dev-loop.sh [TASK...] [--max-iterations N]
#                          [--completion-promise TEXT]
#                          [--verify-cmd CMD]
#                          [--spec-file PATH]
#

set -euo pipefail

TASK_PARTS=()
MAX_ITERATIONS=0
COMPLETION_PROMISE="null"
VERIFY_CMD=""
SPEC_FILE=""

while [[ $# -gt 0 ]]; do
  case $1 in
    -h|--help)
      cat << 'HELP_EOF'
Dev Loop - Agentic development self-improvement loop

USAGE:
  /dev-loop [TASK...] [OPTIONS]

ARGUMENTS:
  TASK...    Task description (multiple words, no quotes needed)

OPTIONS:
  --max-iterations <n>           Max iterations before auto-stop (default: unlimited)
  --completion-promise '<text>'  Promise phrase — output in <promise> tags when true
  --verify-cmd '<cmd>'           Verification command run each iteration
  --spec-file '<path>'           Spec or plan file re-read each iteration
  -h, --help                     Show this help

EXAMPLES:
  /dev-loop Fix the token refresh bug --completion-promise 'FIXED' --max-iterations 10
  /dev-loop Add test coverage --verify-cmd 'npm test' --completion-promise 'DONE'
  /dev-loop Improve the harness --spec-file TASK.md --max-iterations 20 --verify-cmd 'python scripts/harness_audit.py .'
HELP_EOF
      exit 0
      ;;
    --max-iterations)
      if [[ -z "${2:-}" ]]; then
        echo "❌ --max-iterations requires a number argument" >&2
        exit 1
      fi
      if [[ ! "$2" =~ ^[0-9]+$ ]]; then
        echo "❌ --max-iterations must be a non-negative integer, got: $2" >&2
        exit 1
      fi
      MAX_ITERATIONS="$2"
      shift 2
      ;;
    --completion-promise)
      if [[ -z "${2:-}" ]]; then
        echo "❌ --completion-promise requires a text argument" >&2
        exit 1
      fi
      COMPLETION_PROMISE="$2"
      shift 2
      ;;
    --verify-cmd)
      if [[ -z "${2:-}" ]]; then
        echo "❌ --verify-cmd requires a command string" >&2
        exit 1
      fi
      VERIFY_CMD="$2"
      shift 2
      ;;
    --spec-file)
      if [[ -z "${2:-}" ]]; then
        echo "❌ --spec-file requires a file path" >&2
        exit 1
      fi
      SPEC_FILE="$2"
      shift 2
      ;;
    *)
      TASK_PARTS+=("$1")
      shift
      ;;
  esac
done

TASK="${TASK_PARTS[*]:-}"

if [[ -z "$TASK" ]]; then
  echo "❌ No task provided." >&2
  echo "" >&2
  echo "   Examples:" >&2
  echo "     /dev-loop Fix the auth bug --max-iterations 10" >&2
  echo "     /dev-loop Add test coverage --verify-cmd 'npm test' --completion-promise 'DONE'" >&2
  exit 1
fi

mkdir -p .claude

# YAML-quote completion promise
if [[ -n "$COMPLETION_PROMISE" ]] && [[ "$COMPLETION_PROMISE" != "null" ]]; then
  CP_YAML="\"$COMPLETION_PROMISE\""
else
  CP_YAML="null"
fi

# Build per-iteration guidance block appended to the re-injected prompt
ITER_GUIDANCE=""
if [[ -n "$SPEC_FILE" ]]; then
  ITER_GUIDANCE="${ITER_GUIDANCE}
- Re-read \`$SPEC_FILE\` to orient before planning changes."
fi
if [[ -n "$VERIFY_CMD" ]]; then
  ITER_GUIDANCE="${ITER_GUIDANCE}
- Run the verification command: \`$VERIFY_CMD\`. All gates must pass before outputting the completion promise."
fi
if [[ "$COMPLETION_PROMISE" != "null" ]] && [[ -n "$COMPLETION_PROMISE" ]]; then
  ITER_GUIDANCE="${ITER_GUIDANCE}
- Only output \`<promise>$COMPLETION_PROMISE</promise>\` when the task is genuinely done and all gates pass. Do not lie to exit the loop."
fi

# Build the full prompt body re-injected each iteration
if [[ -n "$ITER_GUIDANCE" ]]; then
  PROMPT_BODY="${TASK}

## Each iteration
${ITER_GUIDANCE}"
else
  PROMPT_BODY="$TASK"
fi

# Write state file
cat > .claude/agentic-dev-loop.local.md << EOF
---
active: true
iteration: 1
max_iterations: $MAX_ITERATIONS
completion_promise: $CP_YAML
verify_cmd: "${VERIFY_CMD}"
spec_file: "${SPEC_FILE}"
started_at: "$(date -u +%Y-%m-%dT%H:%M:%SZ)"
---

$PROMPT_BODY
EOF

# Output setup summary
echo "🔄 Agentic dev loop activated!"
echo ""
echo "  Iteration:          1"
if [[ "$MAX_ITERATIONS" -gt 0 ]]; then
  echo "  Max iterations:     $MAX_ITERATIONS"
else
  echo "  Max iterations:     unlimited"
fi
if [[ "$COMPLETION_PROMISE" != "null" ]] && [[ -n "$COMPLETION_PROMISE" ]]; then
  echo "  Completion promise: $COMPLETION_PROMISE"
else
  echo "  Completion promise: none (runs forever)"
fi
[[ -n "$VERIFY_CMD" ]] && echo "  Verify command:     $VERIFY_CMD"
[[ -n "$SPEC_FILE" ]] && echo "  Spec file:          $SPEC_FILE"
echo ""
echo "  The stop hook will re-inject your task prompt each iteration."
echo "  File changes and git history persist across iterations."
echo "  To monitor: head -10 .claude/agentic-dev-loop.local.md"
echo "  To cancel:  /cancel-dev-loop"
echo ""

# Re-emit the prompt so the first iteration begins immediately
echo "$PROMPT_BODY"

# Completion promise reminder
if [[ "$COMPLETION_PROMISE" != "null" ]] && [[ -n "$COMPLETION_PROMISE" ]]; then
  echo ""
  echo "════════════════════════════════════════════════════"
  echo "COMPLETION: output <promise>$COMPLETION_PROMISE</promise>"
  echo "ONLY when the task is genuinely and verifiably complete."
  echo "Do not output a false promise to exit the loop."
  echo "════════════════════════════════════════════════════"
fi
