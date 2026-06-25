#!/usr/bin/env bash
set -euo pipefail

tool_name="${1:-unknown}"
tool_input="${2:-}"

echo "[agentic-dev] PreToolUse: ${tool_name}" >&2
if [[ -n "${tool_input}" ]]; then
  echo "[agentic-dev] Input: ${tool_input}" >&2
fi
