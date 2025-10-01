# Repository Review Exclusions

This directory contains configuration for excluding paths from repository review analysis.

## Files

### `.review-exclusions`
Central configuration file listing all paths and patterns to exclude from repository reviews.

**Format:**
- One pattern per line
- Lines starting with `#` are comments
- Supports glob patterns
- Trailing slashes are normalized

**Default Exclusions:**
- `.claude/` - Claude Code configuration (agents, commands, hooks)
- `.context-kit/` - Analysis infrastructure and reports
- `claude.local.md` - User-specific instructions
- `node_modules/` - Dependencies
- `.git/` - Version control
- `dist/`, `build/`, `out/` - Build artifacts
- `coverage/` - Test coverage reports

### `exclusion-helper.sh`
Bash helper script that provides functions for generating exclusion flags for different tools.

**Functions:**
- `get_grep_exclusions()` - Returns `--exclude-dir` flags for grep
- `get_find_exclusions()` - Returns `-path` conditions for find
- `get_rg_exclusions()` - Returns `--glob` flags for ripgrep
- `should_exclude(path)` - Checks if a path should be excluded

**Usage:**
```bash
# Source the helper
source .context-kit/analysis/exclusion-helper.sh

# Use in grep command
grep -r "pattern" . $GREP_EXCLUSIONS

# Use in find command
find . $FIND_EXCLUSIONS -name "*.ts"

# Check if path should be excluded
if should_exclude ".claude/agents/test.md"; then
    echo "Excluded"
fi
```

## How It Works

### 1. Command-Level Instructions
The `/repo-review` command includes explicit exclusion instructions that are passed to each agent via their prompts.

### 2. Agent Implementation
Each review agent should:
- Add exclusion flags to Grep commands: `--exclude-dir=.claude --exclude-dir=.context-kit`
- Filter Glob patterns to avoid excluded directories
- Add exclusion flags to Bash commands (grep, find, rg)

### 3. Automatic Enforcement
The orchestration prompt includes a template that agents must follow:

```
**Scope Exclusions:**
You must exclude the following paths from all analysis:
- .claude/ (Claude Code configuration)
- .context-kit/ (analysis infrastructure)
- claude.local.md (user instructions)
- node_modules/, .git/, dist/, build/, coverage/
When using Grep, add: --exclude-dir=.claude --exclude-dir=.context-kit --exclude-dir=node_modules --exclude-dir=.git
When using Glob, avoid patterns that match these directories.
When using Bash commands (grep, find), add appropriate exclusion flags.
```

## Why These Exclusions?

### `.claude/` Directory
Contains Claude Code configuration that should not be analyzed:
- Agents (markdown specifications)
- Commands (slash command definitions)
- Hooks (shell scripts for automation)
- Settings (user preferences)

**Reason:** Analyzing the analyzers creates circular references and noise.

### `.context-kit/` Directory
Contains the analysis infrastructure itself:
- Analysis reports (HTML files)
- Templates (report templates)
- Scripts (analysis orchestration)
- Knowledge graph data

**Reason:** Don't analyze the analysis! Reports would reference themselves, creating confusion.

### `claude.local.md`
User-specific instructions and prompts for Claude Code.

**Reason:** This file contains meta-instructions that shouldn't be treated as code to review.

### Standard Exclusions
Common directories that should never be analyzed:
- `node_modules/` - Third-party dependencies (analyzed separately by dependency-audit-agent)
- `.git/` - Version control metadata
- `dist/`, `build/`, `out/` - Generated artifacts, not source code
- `coverage/` - Test coverage reports (generated, not source)

## Adding New Exclusions

To add a new exclusion pattern:

1. Edit `.context-kit/analysis/.review-exclusions`
2. Add the pattern on a new line
3. Add a comment explaining why it's excluded
4. Commit the change

Example:
```bash
# Custom exclusions
.storybook/
storybook-static/
```

## Verification

To verify exclusions are working:

1. Run `/repo-review` and check agent outputs
2. Verify no files from `.claude/` or `.context-kit/` appear in reports
3. Check individual agent HTML reports for unexpected file references

## Troubleshooting

**Problem:** Agent still analyzing excluded paths

**Solution:**
1. Check the agent's prompt includes the exclusion template
2. Verify the agent uses Grep/Glob tools correctly
3. Check bash commands include `--exclude-dir` flags
4. Review agent output for manual file selection

**Problem:** Legitimate files being excluded

**Solution:**
1. Check `.review-exclusions` for overly broad patterns
2. Remove or narrow the pattern
3. Restart the review

## Future Enhancements

- [ ] Auto-generate exclusion flags from `.gitignore`
- [ ] Per-agent custom exclusions
- [ ] Exclusion validation in orchestration
- [ ] Report section showing what was excluded
- [ ] Integration with `.reviewignore` files