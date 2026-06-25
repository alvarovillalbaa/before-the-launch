#!/usr/bin/env bash
set -euo pipefail

tool_output="${1:-}"
exit_code="${2:-0}"

echo "[agentic-dev] PostToolUse: exit=${exit_code}" >&2

if [[ "${exit_code}" != "0" ]]; then
  # Persist error context so the self-improvement loop can inspect it
  working_dir="$(dirname "$0")/../memory/working"
  mkdir -p "${working_dir}"
  printf '{"exit_code":%s,"output":%s,"timestamp":"%s"}\n' \
    "${exit_code}" \
    "$(printf '%s' "${tool_output}" | python3 -c 'import json,sys; print(json.dumps(sys.stdin.read()))' 2>/dev/null || echo '""')" \
    "$(date -u +%Y-%m-%dT%H:%M:%SZ)" \
    > "${working_dir}/last_error.json"
  echo "[agentic-dev] Error context saved to memory/working/last_error.json" >&2
fi
