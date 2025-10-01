---
name: repo-review
description: Orchestrate comprehensive repository review across security, quality, performance, accessibility, testing, documentation, dependencies, architecture, and commit practices using specialized review agents
---

# Repository Review Orchestration Command

Executes a coordinated review workflow using 9 specialized review agents to provide comprehensive code quality, security, and compliance analysis with HTML reports.

## Execution Instructions

When this command is invoked, execute the following steps:

1. **Initialize Orchestration**: Create a todo list to track agent execution phases
2. **Configure Exclusions**: Instruct all agents to exclude the following paths from analysis:
   - `.claude/` - Claude Code configuration (agents, commands, hooks)
   - `.context-kit/` - Analysis reports and toolkit infrastructure
   - `claude.local.md` - User-specific instructions
   - Standard exclusions: `node_modules/`, `.git/`, `dist/`, `build/`, etc.
   - See `.context-kit/analysis/.review-exclusions` for complete list
3. **Execute Agents by Phase**: Use the Task tool to launch agents in dependency order:
   - Phase 1: Launch `security-agent`, `code-quality-agent`, `dependency-audit-agent` (parallel)
   - Phase 2: Launch `performance-agent`, `test-coverage-agent`, `accessibility-agent` (parallel)
   - Phase 3: Launch `architecture-consistency-agent`, `documentation-agent`, `commit-pr-quality-agent` (sequential)
4. **Wait for Completion**: Each phase must complete before dependent phases start
5. **Generate Reports**: Consolidate results and generate summary

## Usage
```bash
/repo-review [mode] [--output-dir <path>] [--validate]
```

### Parameters
- **mode**: Review focus
  - `full` - Complete review across all agents (default)
  - `security` - Security and dependency vulnerabilities only
  - `quality` - Code quality and architecture only
  - `performance` - Performance and test coverage only
  - `compliance` - Accessibility, documentation, commit quality
- **--output-dir <path>** - HTML report output directory (default: `.context-kit/analysis/reports`)
- **--validate** - Run validation checks after all agents complete

## Orchestration Workflow

The command will execute agents in the following phases using the Task tool:

**IMPORTANT**: All agents must be instructed to exclude these paths:
- `.claude/` and `.context-kit/` directories (configuration and analysis infrastructure)
- `claude.local.md` file (user-specific instructions)
- Standard exclusions: `node_modules/`, `.git/`, `dist/`, `build/`, `coverage/`
- Complete exclusion list: `.context-kit/analysis/.review-exclusions`

Include this in every agent prompt:
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

### Phase 1: Independent Analysis (Parallel)
Execute foundational analysis with no dependencies:

1. **Security Agent**
   - Agent: `security-agent`
   - Purpose: Detect credentials, injection vulnerabilities, CVEs in code
   - Output: HTML report with severity ratings
   - Execution: Launched via Task tool with exclusion instructions

2. **Code Quality Agent**
   - Agent: `code-quality-agent`
   - Purpose: Analyze complexity, detect DRY violations, identify code smells
   - Output: HTML report with refactoring priorities
   - Execution: Launched via Task tool (parallel to security-agent)

3. **Dependency Audit Agent**
   - Agent: `dependency-audit-agent`
   - Purpose: Scan for CVEs, verify license compliance, detect outdated packages
   - Output: HTML report with risk assessment
   - Execution: Launched via Task tool (parallel to others)

### Phase 2: Code-Dependent Analysis (Parallel)
Execute after Phase 1 completes:

4. **Performance Agent**
   ```bash
   Task: performance-agent
   Purpose: Analyze algorithmic complexity, memory leaks, bundle size
   Dependencies: Phase 1 completion
   Output: HTML report with performance metrics
   ```

5. **Test Coverage Agent**
   ```bash
   Task: test-coverage-agent
   Purpose: Calculate coverage metrics, assess test quality, detect flaky tests
   Dependencies: Phase 1 completion
   Output: HTML report with coverage trends
   ```

6. **Accessibility Agent**
   ```bash
   Task: accessibility-agent
   Purpose: Validate WCAG 2.1 AA compliance, semantic HTML, ARIA usage
   Dependencies: Phase 1 completion
   Output: HTML report with remediation priorities
   ```

### Phase 3: Meta-Analysis (Sequential)
Execute after Phase 2 completes:

7. **Architecture Consistency Agent**
   ```bash
   Task: architecture-consistency-agent
   Purpose: Validate IoC principles, DRY compliance, module boundaries
   Dependencies: Phases 1 & 2 completion
   Output: HTML report with architectural violations
   ```

8. **Documentation Agent**
   ```bash
   Task: documentation-agent
   Purpose: Measure JSDoc coverage, assess README completeness, validate examples
   Dependencies: Phases 1 & 2 completion
   Output: HTML report with documentation debt
   ```

9. **Commit & PR Quality Agent**
   ```bash
   Task: commit-pr-quality-agent
   Purpose: Analyze commit messages, review PR structure, calculate review metrics
   Dependencies: Phases 1 & 2 completion
   Output: HTML report with best practices
   ```

## Execution Strategy

### Sequential by Phase (Default)
Agents execute in 3 phases with dependencies:
1. Independent agents first (parallel within phase)
2. Code-dependent agents second (parallel within phase)
3. Meta-analysis agents last (sequential within phase)

### Mode-Specific Execution

**Security Mode**
- Phase 1: security-agent, dependency-audit-agent
- Skip: All other agents

**Quality Mode**
- Phase 1: code-quality-agent
- Phase 3: architecture-consistency-agent
- Skip: All other agents

**Performance Mode**
- Phase 2: performance-agent, test-coverage-agent
- Skip: All other agents

**Compliance Mode**
- Phase 2: accessibility-agent
- Phase 3: documentation-agent, commit-pr-quality-agent
- Skip: All other agents

## Configuration

### Agent Configuration
```yaml
agents:
  security-agent:
    priority: 1
    timeout: 180s
    retry: 2

  code-quality-agent:
    priority: 1
    timeout: 240s
    retry: 2

  dependency-audit-agent:
    priority: 1
    timeout: 180s
    retry: 2

  performance-agent:
    priority: 2
    dependencies: [phase1]
    timeout: 300s
    retry: 2

  test-coverage-agent:
    priority: 2
    dependencies: [phase1]
    timeout: 600s
    retry: 1

  accessibility-agent:
    priority: 2
    dependencies: [phase1]
    timeout: 180s
    retry: 2

  architecture-consistency-agent:
    priority: 3
    dependencies: [phase1, phase2]
    timeout: 240s
    retry: 2

  documentation-agent:
    priority: 3
    dependencies: [phase1, phase2]
    timeout: 120s
    retry: 2

  commit-pr-quality-agent:
    priority: 3
    dependencies: [phase1, phase2]
    timeout: 120s
    retry: 2
```

### Progress Tracking
Track orchestration progress and provide status updates:
- Real-time progress indicators via TodoWrite
- Agent execution status
- Error handling and retry logic
- Intermediate result summaries
- Final consolidated report

## Output Format

### Orchestration Summary
```
Repository Review Orchestration Report
======================================

Execution Mode: [full|security|quality|performance|compliance]
Total Agents: [count based on mode]
Execution Time: [duration]
Success Rate: [percentage]

Phase Results:
✅ Independent Analysis: 3/3 agents completed
✅ Code-Dependent Analysis: 3/3 agents completed
✅ Meta-Analysis: 3/3 agents completed

Reports Generated:
- Security Report: [output-dir]/security-report.html
- Code Quality Report: [output-dir]/code-quality-report.html
- Dependency Audit Report: [output-dir]/dependency-audit-report.html
- Performance Report: [output-dir]/performance-report.html
- Test Coverage Report: [output-dir]/test-coverage-report.html
- Accessibility Report: [output-dir]/accessibility-report.html
- Architecture Report: [output-dir]/architecture-report.html
- Documentation Report: [output-dir]/documentation-report.html
- Commit/PR Quality Report: [output-dir]/commit-pr-quality-report.html

Consolidated Summary: [output-dir]/consolidated-summary.html
```

### Agent Results Summary
```
Agent: security-agent
Status: ✅ Completed
Critical Issues: 2
High Issues: 5
Execution Time: 45s

Agent: code-quality-agent
Status: ✅ Completed
Complexity Hotspots: 12
DRY Violations: 8
Execution Time: 67s

[... similar for all agents]
```

### Recommendations
```
Repository Review Recommendations:
1. CRITICAL: Address 2 exposed credentials (security-agent)
2. HIGH: Fix 5 SQL injection vulnerabilities (security-agent)
3. HIGH: Update 8 packages with known CVEs (dependency-audit-agent)
4. MEDIUM: Refactor 12 high-complexity functions (code-quality-agent)
5. MEDIUM: Improve test coverage to 85% (test-coverage-agent)
```

## Error Handling

### Agent Failure Recovery
- Continue with remaining agents if one fails
- Log detailed error information to [output-dir]/orchestration.log
- Provide partial results and recommendations
- Suggest manual intervention steps

### Dependency Management
- Skip dependent agents if prerequisite phase fails
- Provide clear dependency chain information
- Support partial execution with warnings

### Retry Logic
- Automatic retry for transient failures (1 retry)
- Exponential backoff for rate limiting
- Manual retry options for persistent issues

## Usage Examples

### Full Review
```bash
/repo-review full --output-dir .context-kit/analysis/reports --validate
```
Executes complete review workflow with all 9 agents and validation.

### Security-Focused Review
```bash
/repo-review security --output-dir reports/security
```
Executes security and dependency audit agents only.

### Quality-Focused Review
```bash
/repo-review quality --output-dir reports/quality
```
Executes code quality and architecture consistency agents.

### Performance Review
```bash
/repo-review performance --output-dir reports/performance
```
Executes performance and test coverage agents.

### Compliance Review
```bash
/repo-review compliance --output-dir reports/compliance
```
Executes accessibility, documentation, and commit/PR quality agents.

This orchestration command provides a comprehensive, coordinated approach to repository review, ensuring all aspects of code quality, security, and compliance are properly analyzed and reported.
