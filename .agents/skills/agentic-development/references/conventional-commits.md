# Conventional Commits

Conventional Commits is a specification for adding human and machine readable meaning to commit messages. It provides an easy set of rules for creating an explicit commit history, enabling automated version management, changelog generation, and release planning.

## Basic Format

```
<type>[optional scope]: <description>

[optional body]

[optional footer(s)]
```

## Commit Types

### Primary Types

- **feat**: A new feature for the user (correlates with MINOR in semantic versioning)
- **fix**: A bug fix for the user (correlates with PATCH in semantic versioning)

### Secondary Types

- **build**: Changes that affect the build system or external dependencies (webpack, npm, etc.)
- **ci**: Changes to CI configuration files and scripts
- **docs**: Documentation only changes
- **perf**: A code change that improves performance
- **refactor**: A code change that neither fixes a bug nor adds a feature
- **style**: Changes that do not affect the meaning of the code (whitespace, formatting, semicolons)
- **test**: Adding missing tests or correcting existing tests
- **chore**: Other changes that don't modify src or test files
- **revert**: Reverts a previous commit

### Breaking Changes

Any commit can introduce a breaking change by:
1. Adding `!` after the type: `feat!: remove deprecated API`
2. Including `BREAKING CHANGE:` in the footer

## Scopes

Scopes provide additional contextual information. Use nouns describing a section of the codebase:

- `auth` — Authentication and authorization
- `api` — API changes
- `ui` — User interface
- `db` — Database related changes
- `config` — Configuration changes
- `deps` — Dependency updates

## Examples

### Simple Feature
```
feat(auth): add OAuth2 integration

Integrate OAuth2 authentication with Google and GitHub providers.
Users can now log in using their existing social media accounts.
```

### Bug Fix
```
fix(api): resolve race condition in user creation

When multiple requests tried to create users with the same email
simultaneously, duplicate records were sometimes created. Added
proper database constraints and error handling.

Fixes #234
```

### Breaking Change with `!`
```
feat(api)!: remove deprecated /v1/users endpoint

The deprecated /v1/users endpoint has been removed. All clients
should migrate to /v2/users which provides better performance
and additional features.

BREAKING CHANGE: /v1/users endpoint removed, use /v2/users instead
```

### Breaking Change with Footer
```
feat(auth): implement new authentication flow

Add support for multi-factor authentication and improved session
management. This change requires all users to re-authenticate.

BREAKING CHANGE: Authentication tokens issued before this release
are no longer valid. Users must log in again.
```

### Performance Improvement
```
perf(image): optimize image compression algorithm

Replaced PNG compression with WebP format, reducing image sizes
by 40% on average while maintaining visual quality.

Closes #456
```

### Dependency Update
```
build(deps): upgrade React to version 18.2.0

Updates React and related packages to latest stable versions.
Includes performance improvements and new concurrent features.
```

### Revert
```
revert: feat(payment): add cryptocurrency support

This reverts commit 667ecc1654a317a13331b17617d973392f415f02.

Reverting due to security concerns identified in code review.
The feature will be re-implemented with proper security measures.
```

## Multi-paragraph Body

```
feat(search): implement advanced search functionality

Add support for complex search queries including:
- Boolean operators (AND, OR, NOT)
- Field-specific searches (title:, author:, date:)
- Fuzzy matching with configurable threshold
- Search result highlighting

The search index has been restructured to support these new
features while maintaining backward compatibility with existing
simple search queries.

Performance testing shows less than 10ms impact on search
response times even with complex queries.

Closes #789, #823, #901
```

## Footers

### Issue References
```
Fixes #123
Closes #234, #345
Resolves #456
```

### Co-authors
```
Co-authored-by: Jane Doe <jane@example.com>
```

## Automation Benefits

### Automatic Version Bumping
- `fix` commits → PATCH bump (1.0.0 → 1.0.1)
- `feat` commits → MINOR bump (1.0.0 → 1.1.0)
- `BREAKING CHANGE` → MAJOR bump (1.0.0 → 2.0.0)

### Changelog Generation
```markdown
## [1.2.0] - 2024-01-15

### Added
- OAuth2 integration (auth)
- Advanced search functionality (search)

### Fixed
- Race condition in user creation (api)

### Breaking Changes
- Authentication tokens issued before this release are no longer valid
```

## Best Practices

### Writing Good Descriptions
- Use imperative mood: "add feature" not "added feature"
- Start with lowercase letter
- No period at the end
- Limit to 50 characters when possible

### Good vs. Bad
```
# Good
feat(auth): add password reset functionality
fix(ui): resolve mobile navigation menu overflow
perf(db): optimize user query with proper indexing

# Bad
feat: stuff
fix: bug
update: changes
```

### Body Guidelines
- Separate subject from body with a blank line
- Wrap body at 72 characters
- Explain what and why, not how
- Reference issues and PRs when relevant

## Tools and Integration

### Git Hooks (commitizen)
```bash
npm install -g commitizen cz-conventional-changelog
echo '{ "path": "cz-conventional-changelog" }' > ~/.czrc
git cz
```

### Automated Validation (commitlint)
```javascript
// commitlint.config.js
module.exports = {
  extends: ['@commitlint/config-conventional'],
  rules: {
    'type-enum': [
      2, 'always',
      ['feat', 'fix', 'docs', 'style', 'refactor', 'perf', 'test', 'build', 'ci', 'chore', 'revert']
    ],
    'subject-case': [2, 'always', 'lower-case'],
    'subject-max-length': [2, 'always', 50]
  }
};
```

### CI/CD Integration
- **semantic-release**: Automated version management and package publishing
- **standard-version**: Generate changelog and tag releases
- **release-please**: Google's release automation tool

## Common Mistakes

### Mixing Multiple Changes
```
# Bad: Multiple unrelated changes in one commit
feat: add login page and fix CSS bug and update dependencies

# Good: Separate commits
feat(auth): add login page
fix(ui): resolve CSS styling issue
build(deps): update React to version 18
```

### Missing Breaking Change Indicators
```
# Bad: Breaking change not marked
feat(api): update user authentication

# Good: Properly marked
feat(api)!: update user authentication

BREAKING CHANGE: All API clients must now include authentication
headers in every request. Anonymous access is no longer supported.
```

## Team Setup Checklist

1. **Define scope vocabulary**: Create a list of approved scopes for the project
2. **Document examples**: Provide team-specific examples of good commits
3. **Set up tooling**: Use commitlint + husky to enforce standards in CI
4. **Review process**: Include commit message quality in code reviews
5. **Training**: Ensure all team members understand the format

### Scope Examples by Project Type
- **Web Application**: `auth`, `ui`, `api`, `db`, `config`, `deploy`
- **Library/SDK**: `core`, `utils`, `docs`, `examples`, `tests`
- **Mobile App**: `ios`, `android`, `shared`, `ui`, `network`, `storage`
