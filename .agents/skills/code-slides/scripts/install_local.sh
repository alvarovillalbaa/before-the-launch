#!/usr/bin/env bash
set -euo pipefail

AGENT="all"
FORCE="false"
DRY_RUN="false"
SOURCE_DIR="$(cd "$(dirname "$0")/.." && pwd)"

usage() {
  cat <<USAGE
Usage: scripts/install_local.sh [--agent codex|claude|openclaw|all] [--source <skill-dir>] [--force] [--dry-run]

Copy this skill into local agent skill directories after a git clone.
USAGE
}

while [[ $# -gt 0 ]]; do
  case "$1" in
    --agent)
      AGENT="$2"
      shift 2
      ;;
    --source)
      SOURCE_DIR="$2"
      shift 2
      ;;
    --force)
      FORCE="true"
      shift
      ;;
    --dry-run)
      DRY_RUN="true"
      shift
      ;;
    --help|-h)
      usage
      exit 0
      ;;
    *)
      echo "Unknown argument: $1" >&2
      usage
      exit 1
      ;;
  esac
done

if [[ ! -f "$SOURCE_DIR/SKILL.md" ]]; then
  echo "Invalid skill source. Missing SKILL.md in: $SOURCE_DIR" >&2
  exit 1
fi

install_to() {
  local target_root="$1"
  local target_dir="$target_root/code-slides"

  if [[ "$DRY_RUN" == "true" ]]; then
    echo "[dry-run] install $SOURCE_DIR -> $target_dir"
    return
  fi

  mkdir -p "$target_root"
  if [[ -d "$target_dir" ]]; then
    if [[ "$FORCE" != "true" ]]; then
      echo "Target exists: $target_dir (use --force to overwrite)" >&2
      return 1
    fi
    rm -rf "$target_dir"
  fi

  cp -R "$SOURCE_DIR" "$target_dir"
  echo "Installed to $target_dir"
}

install_codex() {
  install_to "$HOME/.codex/skills"
}

install_claude() {
  install_to "$HOME/.claude/skills"
}

install_openclaw() {
  if [[ -d "$HOME/.openclaw" || ! -d "$HOME/.moltbot" ]]; then
    install_to "$HOME/.openclaw/skills"
  else
    install_to "$HOME/.moltbot/skills"
  fi
}

case "$AGENT" in
  codex)
    install_codex
    ;;
  claude)
    install_claude
    ;;
  openclaw)
    install_openclaw
    ;;
  all)
    install_codex
    install_claude
    install_openclaw
    ;;
  *)
    echo "Invalid --agent value: $AGENT" >&2
    exit 1
    ;;
esac
