# Git Commit Message

Generate a well-structured commit message based on staged changes.

## Description
This command analyzes staged git changes and creates a clear commit message following conventional commit standards. When used with the `context` argument, it also updates the knowledge graph and project.yml to maintain accurate project context.

## Usage
- `commit` - Standard commit without context updates
- `commit context` - Commit with automatic knowledge graph and project.yml updates

## Variables
- COMMIT_STYLE: Commit message format (default: conventional)
- INCLUDE_BODY: Add detailed body to message (default: true for complex changes)

## Steps

### Standard Commit (default)
1. Stage all changes with `git add .`
2. Run `git status` to see staged files
3. Review changes with `git diff --cached` if needed
4. Analyze the nature of changes:
   - Feature additions (feat:)
   - Bug fixes (fix:)
   - Documentation (docs:)
   - Style changes (style:)
   - Refactoring (refactor:)
   - Tests (test:)
   - Chores (chore:)
5. Write a commit message with:
   - Type and scope in subject line
   - Clear, imperative mood description
   - Body with "why" and "what" if needed
   - Footer with references if applicable
   - No references to Claude Code as a co-writer
   - No Emojis

### Context-Aware Commit (with 'context' argument)
1. Stage all changes with `git add .`
2. Run `git status` to see staged files
3. Get the diff for context agents: `git diff --cached`
4. Run context update agents in parallel:
   - Use Task tool to run kg-update agent with the diff
   - Use Task tool to run project-yaml-update agent with the diff
   - Wait for both agents to complete
5. Stage context updates:
   - `git add .context-kit/_context-kit.yml` (if updated)
   - Knowledge graph updates are persisted in SQLite (no staging needed)
6. Analyze the nature of all changes (code + context)
7. Write a commit message (same format as standard)
8. Create the commit with both code and context changes

## Examples
### Example 1: Simple feature commit
```
feat(auth): add password reset functionality

- Implement forgot password flow
- Add email notification service
- Create password reset tokens with 24h expiry
```

### Example 2: Bug fix commit
```
fix(api): resolve null pointer in user validation

Validation was failing when optional fields were undefined.
Added null checks before accessing nested properties.

Fixes #123
```

## Notes
- Follow project's commit conventions if they differ
- Keep subject line under 50 characters
- Use present tense ("add" not "added")
- Reference issues/PRs when relevant
- Do not add Claude Code signature to commit message
- Use `/commit context` for automatic context synchronization
- Context updates are included atomically with code changes when using 'context' argument
- If context agents fail, proceed with commit but warn user
- Large diffs may take time for context analysis
- Knowledge graph updates are automatic via MCP server when context mode is used 