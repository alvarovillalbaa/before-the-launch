#!/usr/bin/env bash
set -euo pipefail

working_dir="$(dirname "$0")/../memory/working"
mkdir -p "${working_dir}"

printf '{"ended_at":"%s"}\n' "$(date -u +%Y-%m-%dT%H:%M:%SZ)" \
  > "${working_dir}/session_end.json"

echo "[agentic-dev] Session ended — memory/working/session_end.json written" >&2
