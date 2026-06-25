# Web Interface Guidelines Review

Run a compliance review of UI code against the official Web Interface Guidelines. Use when asked to "review my UI", "check accessibility", "audit design", "review UX", or "check my site against best practices".

## Procedure

1. Fetch the latest guidelines before every review — never rely on cached or memorized rules:

   ```
   https://raw.githubusercontent.com/vercel-labs/web-interface-guidelines/main/command.md
   ```

2. Identify the files to review. If the user provided a file or glob pattern, use it. If not, ask which files or directory to target.

3. Read the specified files.

4. Apply every rule from the fetched guidelines to the code.

5. Output findings in the terse `file:line` format specified by the fetched guidelines. Group by severity when the guidelines define severity levels.

## Scope Notes

- This review is additive to the hard rules in [ui-constraints.md](./ui-constraints.md). Run both when the task is a full UI audit.
- For accessibility-only passes, still fetch the guidelines — they include the current accessibility rule set.
- Do not guess at rules. If the fetch fails, report the failure and ask the user whether to proceed with local heuristics or retry.
