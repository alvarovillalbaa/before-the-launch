#!/usr/bin/env bash
# find-docs.sh — Locate AFS documentation paths and detect legacy conflicts.
#
# Usage:
#   ./find-docs.sh             Print common doc targets and legacy conflicts
#   ./find-docs.sh log         Print path to latest log file
#   ./find-docs.sh audit       Print path for a new audit
#   ./find-docs.sh service     Print in-folder doc coverage for the current directory
#   ./find-docs.sh conflicts   Print legacy doc locations that conflict with AFS

set -euo pipefail

TODAY=$(date +%Y-%m-%d)
YEAR=$(date +%Y)
DATE_DIR=$(date +%Y-%m-%d)

find_repo_root() {
    local dir="$PWD"
    while [[ "$dir" != "/" ]]; do
        if [[ -d "$dir/.git" || -f "$dir/AGENTS.md" || -d "$dir/logs" || -d "$dir/audits" || -d "$dir/specs" || -d "$dir/docs" ]]; then
            echo "$dir"
            return
        fi
        dir="$(dirname "$dir")"
    done
    echo "$PWD"
}

REPO_ROOT=$(find_repo_root)

print_separator() {
    echo "────────────────────────────────────────────────"
}

latest_timestamped_file() {
    local base="$1"
    if [[ ! -d "$base" ]]; then
        return 1
    fi

    local latest_year latest_day latest_file
    latest_year=$(find "$base" -mindepth 1 -maxdepth 1 -type d -exec basename {} \; | sort | tail -1)
    [[ -n "$latest_year" ]] || return 1
    latest_day=$(find "$base/$latest_year" -mindepth 1 -maxdepth 1 -type d -exec basename {} \; | sort | tail -1)
    [[ -n "$latest_day" ]] || return 1
    latest_file=$(find "$base/$latest_year/$latest_day" -mindepth 1 -maxdepth 1 -type f -name "*.md" -exec basename {} \; | sort | tail -1)
    [[ -n "$latest_file" ]] || return 1

    echo "$base/$latest_year/$latest_day/$latest_file"
}

print_legacy_conflicts() {
    local found=0
    for legacy in \
        "$REPO_ROOT/docs/memories" \
        "$REPO_ROOT/docs/guides" \
        "$REPO_ROOT/docs/references" \
        "$REPO_ROOT/docs/cookbook" \
        "$REPO_ROOT/docs/plans" \
        "$REPO_ROOT/docs/specs" \
        "$REPO_ROOT/docs/audits"
    do
        if [[ -e "$legacy" ]]; then
            if [[ $found -eq 0 ]]; then
                echo "⚠️  LEGACY / CONFLICTING DOC TREES"
                found=1
            fi
            echo "   $legacy"
        fi
    done

    if [[ $found -eq 0 ]]; then
        echo "No legacy docs/* conflict surfaces detected."
    fi
}

cmd="${1:-all}"

case "$cmd" in
    log)
        LOG_DIR="$REPO_ROOT/logs"
        if path=$(latest_timestamped_file "$LOG_DIR"); then
            echo "Latest log: $path"
            echo ""
            echo "Append with:"
            echo "  echo '- Your log entry here' >> $path"
        else
            echo "No logs/ directory with dated markdown files found in repo root: $REPO_ROOT"
            echo "Create it with: mkdir -p $REPO_ROOT/logs/$YEAR/$DATE_DIR"
            echo "Then create:    touch $REPO_ROOT/logs/$YEAR/$DATE_DIR/dev.md"
        fi
        ;;

    audit)
        AUDIT_DIR="$REPO_ROOT/audits/$YEAR/$DATE_DIR"
        echo "New audit location: $AUDIT_DIR/"
        echo ""
        echo "Create with:"
        echo "  mkdir -p $AUDIT_DIR"
        echo "  touch $AUDIT_DIR/report-name.md"
        ;;

    service)
        CURRENT="$PWD"
        echo "In-folder docs for: $CURRENT"
        echo ""
        echo "Core:"
        for f in README.md ARCHITECTURE.md TESTS.md; do
            [[ -f "$CURRENT/$f" ]] && echo "  ✓ $f" || echo "  ✗ $f (missing)"
        done
        echo ""
        echo "Conditional:"
        for f in SETUP.md RUNBOOK.md CHANGELOG.md SECURITY.md; do
            [[ -f "$CURRENT/$f" ]] && echo "  ✓ $f" || echo "  ✗ $f (missing)"
        done
        echo ""
        echo "Rare:"
        for f in OVERVIEW.md FAQ.md DECISIONS.md DEPENDENCIES.md; do
            [[ -f "$CURRENT/$f" ]] && echo "  ✓ $f" || echo "  ✗ $f (missing)"
        done
        ;;

    conflicts)
        print_legacy_conflicts
        ;;

    all|*)
        print_separator
        echo "Code Documentation — AFS Locations"
        print_separator
        echo ""

        echo "📝 TIMESTAMPED HISTORY"
        for dir in logs lessons items fixes audits raw plans; do
            base="$REPO_ROOT/$dir"
            if path=$(latest_timestamped_file "$base" 2>/dev/null); then
                echo "   $dir: $path"
            else
                echo "   $dir: $base/$YEAR/$DATE_DIR/"
            fi
        done
        echo ""

        echo "📚 LIVING DOCS"
        for dir in specs sources lib references cookbook knowledge runbooks research official-documentation context; do
            base="$REPO_ROOT/$dir"
            if [[ -d "$base" ]]; then
                echo "   ✓ $base"
            else
                echo "   ✗ $base (missing)"
            fi
        done
        echo ""

        echo "🧭 ROOT INSTRUCTION DOCS"
        for f in AGENTS.md PLAN.md SPEC.md SOUL.md PRINCIPLES.md DESIGN.md; do
            [[ -f "$REPO_ROOT/$f" ]] && echo "   ✓ $REPO_ROOT/$f" || echo "   ✗ $REPO_ROOT/$f (missing)"
        done
        echo ""

        echo "📁 IN-FOLDER DOC CONTRACT"
        echo "   Core: README.md, ARCHITECTURE.md, TESTS.md"
        echo "   Conditional: SETUP.md, RUNBOOK.md, CHANGELOG.md, SECURITY.md"
        echo "   Rare: OVERVIEW.md, FAQ.md, DECISIONS.md, DEPENDENCIES.md"
        echo ""

        print_legacy_conflicts
        echo ""

        print_separator
        echo "Templates: skills/code-documentation/templates/"
        print_separator
        ;;
esac
