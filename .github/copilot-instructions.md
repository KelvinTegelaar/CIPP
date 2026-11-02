## Commit messages

Generate all commit messages in **Conventional Commits** format:

```
<type>(<optional scope>): <description>

[optional body]

[optional footer(s)]
```

**Rules:**

- **Type** is required and must be one of:
  - `feat` — a new feature
  - `fix` — a bug fix
  - `docs` — documentation only
  - `style` — formatting, whitespace, no code-behavior change
  - `refactor` — code change that neither fixes a bug nor adds a feature
  - `perf` — a performance improvement
  - `test` — adding or correcting tests
  - `build` — build system or dependency changes
  - `ci` — CI/CD configuration changes
  - `chore` — routine maintenance, no production code change
  - `revert` — reverts a previous commit
- **Scope** is optional and given in parentheses after the type (e.g. `feat(identity):`). Use a short, lowercase area name when it adds clarity.
- **Description** is a short, imperative-mood summary ("add", not "added"/"adds"), lowercase, no trailing period, ideally ≤ 72 characters.
- **Body** (optional) explains the *what* and *why*, not the *how*. Separate it from the description with one blank line.
- **Breaking changes** are indicated with a `!` before the colon (e.g. `feat!:`) and/or a `BREAKING CHANGE:` footer describing the change.
- Reference issues/PRs in the footer where relevant (e.g. `Closes #123`).

**Examples:**

```
feat(identity): add bulk user offboarding endpoint
fix(graph): handle expired token on retry
docs: update authentication model overview
refactor(standards)!: rename remediation parameter
```
