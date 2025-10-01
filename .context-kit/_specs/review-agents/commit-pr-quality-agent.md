# Commit & PR Quality Review Agent - Technical Specification

## Overview

A Commit & PR Quality Review Agent analyzes version control history, commit messages, pull request structure, and change management practices. It ensures commits are atomic, messages are descriptive, PRs are appropriately sized, and changes follow contribution guidelines.

**Mission**: Maintain clean version control history that enables effective code review, debugging, and project archaeology.

---

## Core Principles

- **Atomic Commits**: One logical change per commit
- **Descriptive Messages**: Explain why, not what
- **Reviewable PRs**: Right-sized for effective review
- **Clean History**: Meaningful, bisectable commits

---

## Detection Strategies by Category

### 1. Commit Message Quality

#### Patterns Detected

**Non-Descriptive Messages**
```bash
# ❌ Bad: Vague, non-actionable
git commit -m "fix stuff"
git commit -m "updates"
git commit -m "wip"
git commit -m "asdf"

# ✅ Good: Clear and descriptive
git commit -m "fix(auth): resolve session timeout bug on token refresh

Users were experiencing premature logouts when their tokens expired
during active sessions. This fix ensures the refresh token mechanism
properly extends the session without requiring re-authentication.

Fixes #234"
```

**Missing Context**
```bash
# ❌ Bad: What changed, but not why
git commit -m "Add caching"

# ✅ Good: Explains rationale
git commit -m "feat(api): add Redis caching for user profile queries

Profile queries were hitting the database on every request, causing
slow response times (avg 450ms). Adding Redis cache reduces this to
15ms for subsequent requests.

Impact: 30x faster profile loads
Benchmark: Before 450ms, After 15ms"
```

**Breaking Changes Not Highlighted**
```bash
# ❌ Bad: Breaking change buried in description
git commit -m "Update user API"

# ✅ Good: BREAKING CHANGE clearly marked
git commit -m "feat(api): change user endpoint response format

BREAKING CHANGE: User API now returns snake_case instead of camelCase
for consistency with other endpoints.

Migration guide:
- Update client code to use user.first_name instead of user.firstName
- Run migration script: npm run migrate:user-response

Closes #456"
```

#### Commit Message Format (Conventional Commits)

```
<type>(<scope>): <short description>

<optional body with detailed explanation>

<optional footer with breaking changes, issues, co-authors>

Types:
- feat: New feature
- fix: Bug fix
- docs: Documentation only
- style: Formatting (no code change)
- refactor: Code restructuring (no behavior change)
- perf: Performance improvement
- test: Adding/updating tests
- chore: Build process, dependencies, tooling

Examples:
feat(auth): add OAuth2 support for GitHub login
fix(api): prevent race condition in concurrent user updates
docs(readme): add troubleshooting section for Windows
refactor(db): extract query builder to separate module
perf(search): optimize full-text search with indexes
```

#### Agent Actions

- `Bash` runs `git log --format='%h|%s|%b' -n 100`
- Parse commit messages
- Validate format (Conventional Commits, custom format)
- Check message length (subject <50 chars, body wrapped at 72)
- Detect non-descriptive patterns (wip, fix, update, etc.)
- Check for issue/PR references
- Validate breaking change notation

---

### 2. Commit Atomicity

#### Patterns Detected

**Non-Atomic Commits (Multiple Unrelated Changes)**
```bash
# ❌ Bad: Multiple unrelated changes in one commit
git show abc123
Modified files:
  src/auth/login.ts          # Fix login bug
  src/api/posts.ts           # Add new posts endpoint
  docs/README.md             # Update installation docs
  package.json               # Bump dependency versions

# ✅ Good: Separate atomic commits
Commit 1: fix(auth): resolve login redirect issue
Commit 2: feat(api): add posts pagination endpoint
Commit 3: docs: update Node.js requirement to v18
Commit 4: chore(deps): update dependencies to latest
```

**God Commits (Massive Changes)**
```bash
# ❌ Bad: 150 files changed in one commit
git show def456
150 files changed, 8,234 insertions(+), 3,456 deletions(-)

# ✅ Good: Break into logical commits
Commit 1: refactor(types): extract shared types to core module
Commit 2: refactor(services): update services to use new types
Commit 3: refactor(api): update API routes to use new types
Commit 4: test: update tests for refactored code
```

**Incomplete Commits (Broken State)**
```bash
# ❌ Bad: Commit leaves codebase in broken state
git show ghi789
Added: src/api/users.ts
Missing: Import statements, type definitions referenced

# ✅ Good: Each commit leaves codebase working
Commit builds successfully, tests pass
```

#### Agent Actions

- `Bash` runs `git log --numstat --format='%h|%s' -n 50`
- Parse changed files per commit
- Calculate commit size (files changed, lines changed)
- Detect unrelated file changes in single commit
- Check if commit subject reflects all changes
- Validate commit builds/tests pass (`git bisect` friendly)

#### Atomicity Metrics

```yaml
commit_size_thresholds:
  optimal:
    files: 1-10
    lines: 1-200
    status: ✅ Reviewable

  acceptable:
    files: 11-30
    lines: 201-500
    status: ⚠️ Large but manageable

  too_large:
    files: 31+
    lines: 501+
    status: ❌ Should be split
```

---

### 3. Pull Request Structure

#### Patterns Detected

**PR Too Large**
```
PR #234: "Add user management feature"
Files changed: 87
Insertions: 4,523
Deletions: 1,234

❌ Bad: Too large for effective review
⏱️ Estimated review time: 4+ hours
```

**PR Too Small (Noise)**
```
PR #456: "Fix typo in comment"
Files changed: 1
Insertions: 1
Deletions: 1

⚠️ Questionable: Could be combined with other changes
```

**Multiple Unrelated Changes in One PR**
```
PR #678: "Various updates"
- Adds new authentication feature
- Fixes unrelated bug in billing
- Updates dependencies
- Refactors database module

❌ Bad: Should be 4 separate PRs
```

**Missing PR Description**
```
PR #789: "Update user service"
Description: (empty)

❌ Bad: No context for reviewers
```

#### Good PR Structure

```markdown
## PR Title
feat(auth): add two-factor authentication support

## Description
Implements TOTP-based 2FA for user accounts to improve security.
Users can enable 2FA in account settings, which requires a 6-digit
code from an authenticator app on each login.

## Changes
- Add TOTP generation and validation logic
- Create 2FA setup UI component
- Update login flow to check for 2FA
- Add database migration for 2FA fields

## Testing
- [ ] Unit tests pass
- [ ] Integration tests pass
- [ ] Manually tested 2FA setup flow
- [ ] Manually tested login with 2FA enabled
- [ ] Tested recovery code flow

## Screenshots
[Attach screenshots of UI changes]

## Breaking Changes
None

## Related Issues
Closes #234
Related to #189

## Migration Guide
No migration required for existing users. 2FA is optional.

## Checklist
- [x] Code follows project style guidelines
- [x] Self-review completed
- [x] Comments added for complex logic
- [x] Documentation updated
- [x] Tests added/updated
- [x] No new warnings generated
```

#### Agent Actions

- `Bash` runs `gh pr list --json number,title,body,additions,deletions,files`
- Parse PR size (files, lines changed)
- Check PR description completeness
- Validate PR title format
- Detect multiple unrelated changes
- Check for linked issues
- Validate checklist completion

#### PR Size Guidelines

```yaml
pr_size_categories:
  tiny:
    lines: 1-10
    review_time: < 5 min
    notes: "Minor fixes, typos, documentation"

  small:
    lines: 11-50
    review_time: 5-15 min
    notes: "Bug fixes, small features"

  medium:
    lines: 51-200
    review_time: 15-30 min
    notes: "Standard features, refactorings"

  large:
    lines: 201-500
    review_time: 30-60 min
    notes: "Larger features - consider splitting"

  huge:
    lines: 501+
    review_time: 60+ min
    notes: "⚠️ Should be split into multiple PRs"
```

---

### 4. Branch Naming Conventions

#### Patterns Detected

**Non-Descriptive Branch Names**
```bash
# ❌ Bad: Vague names
git branch test
git branch fix
git branch new-feature
git branch johns-branch

# ✅ Good: Descriptive with type and ID
git branch feature/234-add-oauth-login
git branch fix/456-resolve-memory-leak
git branch refactor/789-extract-user-service
git branch docs/update-api-reference
```

**Branch Naming Convention**
```
<type>/<ticket-id>-<brief-description>

Types:
- feature/ or feat/
- fix/ or bugfix/
- refactor/
- docs/
- test/
- chore/

Examples:
feature/123-user-authentication
fix/456-login-redirect-bug
refactor/789-database-connection-pool
docs/update-contributing-guide
```

#### Agent Actions

- `Bash` runs `git branch --list --format='%(refname:short)'`
- Validate branch naming convention
- Check for ticket/issue ID reference
- Detect generic branch names

---

### 5. Merge Strategy Consistency

#### Patterns Detected

**Inconsistent Merge Strategies**
```bash
# Project mixes:
- Merge commits (preserves history)
- Squash merges (clean history)
- Rebase merges (linear history)

❌ Bad: Inconsistent, confusing history
✅ Good: Choose one strategy and document it
```

**Merge Commit Messages**
```bash
# ❌ Bad: Default merge message
Merge pull request #234 from user/branch

# ✅ Good: Descriptive merge commit
Merge PR #234: Add OAuth2 authentication

Implements OAuth2 flow for GitHub, Google, and Twitter login.
Includes unit tests and integration tests.

Closes #189
```

#### Agent Actions

- Analyze git history for merge patterns
- Detect merge commit, squash, rebase usage
- Validate consistency across project
- Check merge commit message quality

---

### 6. Commit Hygiene

#### Patterns Detected

**Fixup Commits**
```bash
# ❌ Bad: Fixup commits in main branch history
abc123 feat: add user service
def456 fix typo
ghi789 actually fix the bug
jkl012 oops, forgot to add file

# ✅ Good: Squashed before merge
abc123 feat(users): add user management service

Includes validation, error handling, and comprehensive tests.
```

**Force Push to Shared Branches**
```bash
# ❌ Dangerous: Force push to main/master
git push --force origin main

# ⚠️ Warning: Force push to shared feature branch
git push --force origin feature/shared-feature

# ✅ Safe: Force push to personal feature branch
git push --force origin feature/my-work
```

**Secrets in History**
```bash
# ❌ Critical: API key committed then removed
git log --all --full-history | grep -i "api.key"

# Found in commit abc123, removed in def456
# ⚠️ Key still in git history!
```

#### Agent Actions

- `Grep` commit history for fixup/wip commits
- Detect force pushes to protected branches
- Scan history for secrets (even if later removed)
- Check for `git-secrets` or `trufflehog` usage

---

### 7. Code Review Metrics

#### Patterns Detected

**Self-Approving PRs**
```
PR #234 created by: user-a
PR #234 approved by: user-a
❌ Bad: Author approved own PR
```

**PRs Without Reviews**
```
PR #456 merged without approvals
⚠️ Warning: No code review performed
```

**Stale PRs**
```
PR #678 created: 45 days ago
Last update: 30 days ago
Status: Open

⚠️ Stale PR - needs attention or closure
```

#### Agent Actions

- `Bash` runs `gh pr list --json number,createdAt,updatedAt,reviews`
- Check for self-approvals
- Detect PRs merged without review
- Identify stale PRs (>14 days old)
- Calculate review turnaround time

---

## Tool Usage Pattern

```
Phase 1: Commit History Analysis (Fast)
├─ Bash: git log --format='%h|%s|%b' -n 100
├─ Parse: Commit messages
├─ Validate: Format, atomicity, descriptiveness
└─ Output: Commit quality issues

Phase 2: PR Analysis (Medium)
├─ Bash: gh pr list --json (full details)
├─ Parse: PR size, description, changes
├─ Validate: Structure, size, linked issues
└─ Output: PR quality report

Phase 3: Branch Analysis (Fast)
├─ Bash: git branch --list
├─ Validate: Naming conventions
├─ Check: Branch age, staleness
└─ Output: Branch hygiene issues

Phase 4: Code Review Metrics (Fast)
├─ Bash: gh pr list with review data
├─ Calculate: Approval rates, turnaround time
├─ Detect: Self-approvals, stale PRs
└─ Output: Review process health

Phase 5: History Hygiene (Fast)
├─ Grep: Search for secrets, fixup commits
├─ Check: Force push history
└─ Output: History cleanliness report
```

---

## Scoring System

### Commit/PR Quality Score (0-100)

```
Score = (0.3 × commit_message_quality)
      + (0.2 × commit_atomicity)
      + (0.2 × pr_structure_quality)
      + (0.15 × code_review_health)
      + (0.15 × branch_hygiene)

Thresholds:
90-100: Excellent
75-89:  Good
60-74:  Needs Improvement
<60:    Poor Practices
```

### Issue Severity

- **Critical (25 pts)**: Secrets in history, force push to main
- **High (10 pts)**: Non-atomic commits, missing PR descriptions
- **Medium (5 pts)**: Vague commit messages, large PRs
- **Low (2 pts)**: Minor formatting issues, branch naming

---

## HTML Report Output Structure

```html
<!DOCTYPE html>
<html>
<head>
  <style>/* Uses W3C design tokens */</style>
</head>
<body>
  <section class="executive-summary">
    <h1>Commit & PR Quality Report</h1>
    <div class="score-badge good">79/100</div>
    <div class="metrics-grid">
      <div class="metric">
        <h3>Recent Commits</h3>
        <div class="count">156</div>
        <small>Last 30 days</small>
      </div>
      <div class="metric">
        <h3>Open PRs</h3>
        <div class="count">12</div>
        <small>3 stale (>14 days)</small>
      </div>
      <div class="metric">
        <h3>Avg PR Size</h3>
        <div class="count">187 lines</div>
        <small>Medium (optimal)</small>
      </div>
      <div class="metric">
        <h3>Review Time</h3>
        <div class="count">18 hours</div>
        <small>Median turnaround</small>
      </div>
    </div>
  </section>

  <section class="commit-quality">
    <h2>📝 Commit Message Quality</h2>

    <div class="quality-breakdown">
      <table>
        <tr>
          <td>✅ Well-formatted</td>
          <td>112 (72%)</td>
        </tr>
        <tr>
          <td>⚠️ Missing body</td>
          <td>28 (18%)</td>
        </tr>
        <tr>
          <td>❌ Non-descriptive</td>
          <td>16 (10%)</td>
        </tr>
      </table>
    </div>

    <h3>Non-Descriptive Commit Messages (16)</h3>
    <ul>
      <li>
        <code>abc1234</code> - "fix stuff" (Author: john-doe)
        <p><em>Should explain what was fixed and why</em></p>
      </li>
      <li>
        <code>def5678</code> - "updates" (Author: jane-smith)
        <p><em>Should describe specific changes and rationale</em></p>
      </li>
    </ul>

    <h3>Best Commit Messages (Examples)</h3>
    <ul>
      <li>
        <code>xyz9012</code> - "fix(auth): resolve session timeout on token refresh"
        <p>✅ Clear type, scope, and concise description</p>
      </li>
    </ul>
  </section>

  <section class="commit-atomicity">
    <h2>⚛️ Commit Atomicity</h2>

    <h3>Commit Size Distribution</h3>
    <table>
      <thead>
        <tr>
          <th>Size Category</th>
          <th>Count</th>
          <th>Percentage</th>
          <th>Status</th>
        </tr>
      </thead>
      <tbody>
        <tr class="good">
          <td>Small (1-10 files)</td>
          <td>98</td>
          <td>63%</td>
          <td>✅ Optimal</td>
        </tr>
        <tr class="acceptable">
          <td>Medium (11-30 files)</td>
          <td>42</td>
          <td>27%</td>
          <td>⚠️ Acceptable</td>
        </tr>
        <tr class="warning">
          <td>Large (31+ files)</td>
          <td>16</td>
          <td>10%</td>
          <td>❌ Should be split</td>
        </tr>
      </tbody>
    </table>

    <h3>Large Commits Requiring Split</h3>
    <ul>
      <li>
        <strong>Commit abc1234:</strong> "Refactor user module"
        <p>87 files changed, 3,456 insertions, 1,234 deletions</p>
        <p><em>Recommendation: Split by component (service, repository, types, tests)</em></p>
      </li>
    </ul>
  </section>

  <section class="pr-analysis">
    <h2>🔀 Pull Request Analysis</h2>

    <h3>PR Size Distribution</h3>
    <div class="pr-sizes">
      <ul>
        <li>Tiny (1-10 lines): 8 PRs (17%)</li>
        <li>Small (11-50 lines): 15 PRs (31%)</li>
        <li>Medium (51-200 lines): 18 PRs (38%)</li>
        <li>Large (201-500 lines): 5 PRs (10%)</li>
        <li>Huge (501+ lines): 2 PRs (4%) ⚠️</li>
      </ul>
    </div>

    <h3>Large PRs Needing Review</h3>
    <ul>
      <li>
        <strong>PR #234:</strong> "Add payment processing"
        <p>Files: 43, Lines: +892, -234</p>
        <p>⏱️ Estimated review time: 90+ minutes</p>
        <p><em>Recommendation: Split into setup, core logic, UI, tests</em></p>
      </li>
    </ul>

    <h3>PRs Missing Descriptions (5)</h3>
    <ul>
      <li>PR #456 - "Update user service" (no description)</li>
      <li>PR #567 - "Fix bug" (no context provided)</li>
    </ul>
  </section>

  <section class="review-metrics">
    <h2>👥 Code Review Health</h2>

    <div class="review-stats">
      <ul>
        <li>Avg Review Turnaround: <strong>18 hours</strong></li>
        <li>PRs With Reviews: <strong>89%</strong></li>
        <li>PRs Self-Approved: <strong>3</strong> ⚠️</li>
        <li>Stale PRs (>14 days): <strong>3</strong></li>
      </ul>
    </div>

    <h3>Self-Approved PRs (3)</h3>
    <ul>
      <li>PR #789 - Author: john-doe, Approved by: john-doe ❌</li>
    </ul>

    <h3>Stale PRs (3)</h3>
    <ul>
      <li>PR #345 - Created 28 days ago, Last update 21 days ago</li>
      <li>PR #456 - Created 17 days ago, Last update 15 days ago</li>
    </ul>
  </section>

  <section class="branch-hygiene">
    <h2>🌿 Branch Hygiene</h2>

    <h3>Branch Naming Compliance</h3>
    <ul>
      <li>✅ Following convention: 78% (35/45 branches)</li>
      <li>❌ Non-compliant: 22% (10/45 branches)</li>
    </ul>

    <h3>Non-Compliant Branch Names</h3>
    <ul>
      <li><code>test</code> → Should be <code>test/description</code></li>
      <li><code>johns-work</code> → Should be <code>feature/ticket-description</code></li>
      <li><code>fix</code> → Should be <code>fix/ticket-description</code></li>
    </ul>

    <h3>Stale Branches (>30 days old)</h3>
    <ul>
      <li><code>feature/old-feature</code> - Last commit 45 days ago</li>
    </ul>
  </section>

  <section class="recommendations">
    <h2>💡 Recommendations</h2>
    <ol>
      <li><strong>High Priority:</strong> Improve 16 non-descriptive commit messages (use Conventional Commits format)</li>
      <li><strong>High Priority:</strong> Split 2 huge PRs into smaller, reviewable chunks</li>
      <li><strong>Medium Priority:</strong> Add descriptions to 5 PRs missing context</li>
      <li><strong>Medium Priority:</strong> Address 3 stale PRs (review or close)</li>
      <li><strong>Low Priority:</strong> Rename 10 non-compliant branches</li>
      <li><strong>Process:</strong> Enforce PR template usage to ensure descriptions</li>
      <li><strong>Process:</strong> Add commit message linting (commitlint)</li>
    </ol>
  </section>

  <section class="best-practices">
    <h2>✨ Best Practices to Adopt</h2>
    <ul>
      <li>Use Conventional Commits format for all commit messages</li>
      <li>Keep PRs under 200 lines when possible</li>
      <li>Require at least one approval before merging</li>
      <li>Use PR templates to ensure complete descriptions</li>
      <li>Set up commitlint in CI to enforce message format</li>
      <li>Close stale PRs after 30 days of inactivity</li>
      <li>Delete merged branches automatically</li>
    </ul>
  </section>

  <section class="trend">
    <h2>📈 Quality Trend</h2>
    <p><em>Compared to previous period:</em></p>
    <ul>
      <li>Commit Quality Score: 72 → 79 (+7) ✅</li>
      <li>Avg PR Size: 245 lines → 187 lines (-58) ✅</li>
      <li>Review Turnaround: 24h → 18h (-6h) ✅</li>
      <li>Stale PRs: 7 → 3 (-4) ✅</li>
    </ul>
  </section>
</body>
</html>
```

---

## Integration with Orchestration System

### Dependency Chain

```
Phase 1: commit-pr-quality-agent (INDEPENDENT)
         └─ Analyzes git history and PR data

Phase 2: validation-agent
         └─ Validates commit/PR improvements
```

### Execution Time

**~30s-1m** for typical repository

### Configuration

```yaml
agents:
  commit-pr-quality-agent:
    priority: 3
    dependencies: []
    timeout: 120s
    retry: 2
    commit_history_depth: 100
    enforce_conventional_commits: true
    pr_size_threshold: 200
    stale_pr_days: 14
```

---

## Best Practices

### Commit Discipline

- Write commit messages for future maintainers
- Make commits atomic and logical
- Use interactive rebase to clean up before pushing
- Never force push to shared branches

### PR Excellence

- Keep PRs focused on one change
- Write comprehensive PR descriptions
- Link related issues/tickets
- Self-review before requesting review
- Respond to feedback promptly

---

## Output Files

```
.context-kit/analysis/
├─ commit-pr-quality-report.html # Interactive HTML report
├─ commit-quality-summary.json   # Machine-readable results
├─ pr-analysis.csv               # PR metrics
└─ commit-history.json           # Commit quality data
```

---

## Related Agents

- **documentation-agent**: CHANGELOG maintenance overlaps
- **code-quality-agent**: Review quality correlates with code quality

---

## References

- [Conventional Commits](https://www.conventionalcommits.org/)
- [How to Write a Git Commit Message](https://chris.beams.io/posts/git-commit/)
- [GitHub PR Best Practices](https://github.com/blog/1943-how-to-write-the-perfect-pull-request)
- [commitlint](https://commitlint.js.org/)
