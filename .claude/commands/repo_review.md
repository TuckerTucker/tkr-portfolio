# Repository Review Complete

Execute comprehensive parallel repository analysis and consolidate findings into unified reports.

## Description
This command performs a complete repository analysis workflow by running specialized AI agents in parallel, then automatically consolidating their findings into executive summaries and comprehensive reports. It combines the parallel execution and merge phases into a single streamlined operation.

## Usage
`rr_complete [target_repo] [agents]`

## Variables
- REPO_PATH: Repository to analyze (default: current directory)
- TARGET_REPO: Specific target path (default: ${REPO_PATH})
- MAX_DEPTH: Analysis depth limit (default: 3)
- AGENTS: Comma-separated agent list (default: "overview,security,quality,deps")
- OUTPUT_FORMAT: Report format (default: "markdown+json")

## Parallel Agents
- Execute all analysis agents concurrently for maximum efficiency
- Use single agent for consolidation phase after all analyses complete

## Steps

### Phase 1: Setup and Configuration
1. **Create Analysis Configuration**:
   - Generate shared config at `${REPO_PATH}/_project/repo-review/reports/analysis.config.json`
   - Set analysis date, output format, and selected agents
   - Initialize directory structure for reports

### Phase 2: Parallel Analysis Execution
2. **Execute Specialized Agents Concurrently**:
   - **Overview Agent**: Architecture and structure analysis
   - **Security Agent**: Vulnerability and security pattern scanning
   - **Quality Agent**: Code quality and technical debt assessment  
   - **Dependencies Agent**: Package and license analysis
   
   Each agent produces:
   - `analysis-report.md` (human-readable findings)
   - `findings.json` (structured data for aggregation)
   - `metrics.json` (performance and coverage metrics)

3. **Monitor Execution Progress**:
   - Track completion status of each parallel task
   - Log execution timestamps and metrics
   - Ensure all agents complete before proceeding

### Phase 3: Consolidation and Reporting
4. **Verify Agent Completion**:
   - Check for required output files from each agent
   - Log warnings for any missing analyses
   - Validate JSON structure and completeness

5. **Aggregate Structured Findings**:
   - Merge all `findings.json` files using jq aggregation
   - Calculate summary statistics (total issues by severity)
   - Organize findings by agent type for cross-referencing
   - Extract and deduplicate recommendations

6. **Generate Executive Summary**:
   - Create high-level overview with key metrics
   - Highlight critical and high-priority findings
   - Include actionable recommendations
   - Provide navigation links to detailed reports

7. **Consolidate Full Report**:
   - Combine all agent reports into comprehensive document
   - Add table of contents with section links
   - Maintain agent-specific formatting and structure
   - Include cross-references between related findings

8. **Create Metrics Dashboard**:
   - Aggregate performance metrics from all agents
   - Include execution times, file coverage, and analysis depth
   - Generate analysis efficiency statistics

9. **Build Navigation Index**:
   - Create master index of all generated artifacts
   - Provide descriptions and direct links to reports
   - Include analysis configuration and timestamp

## Output Structure
```
${REPO_PATH}/_project/repo-review/reports/
├── analysis.config.json                 # Analysis configuration
├── execution-metrics.json              # Execution tracking
├── agents/                             # Individual agent outputs
│   ├── overview/
│   ├── security/
│   ├── quality/
│   └── deps/
├── consolidated/                       # Merged results
│   ├── aggregated-findings.json       # Structured data
│   ├── executive-summary.md           # High-level overview
│   ├── full-report.md                 # Complete analysis
│   └── analysis-metrics.json          # Performance data
└── index.md                           # Navigation hub
```

## Examples

### Example 1: Full analysis
```bash
rr_complete /path/to/repo
```
Runs all default agents (overview, security, quality, deps) with complete consolidation.

### Example 2: Security-focused review
```bash
rr_complete /path/to/repo "security,quality"
```
Runs only security and quality analyses with targeted reporting.

### Example 3: Deep analysis
```bash
MAX_DEPTH=5 rr_complete /path/to/repo
```
Performs comprehensive deep analysis with extended file traversal.

## Integration Points
- **Repository Review Agents**: Uses all specialized analysis agents
- **Knowledge Graph**: Can feed findings into MCP knowledge graph
- **Project YAML**: Complements project documentation updates
- **Context Prime**: Can be run after context establishment

## Workflow Optimization
- **Parallel Execution**: All agents run simultaneously for speed
- **Incremental Processing**: Only rerun agents if source changes detected
- **Smart Caching**: Reuse analysis data when possible
- **Progress Tracking**: Real-time status updates during execution

## Quality Assurance
- **Validation Checks**: Verify all expected outputs are generated
- **Error Handling**: Graceful degradation if individual agents fail
- **Consistency**: Standardized output formats across all agents
- **Completeness**: Ensure no critical findings are lost in aggregation

## Best Practices
- Run after significant code changes or before releases
- Review executive summary first, then dive into specific agent reports
- Use findings to prioritize development tasks and technical debt
- Archive reports for historical comparison and trend analysis
- Integrate findings into development workflow and planning

## Notes
- All agents work on the same repository without creating copies
- Execution time scales with repository size and selected agents
- JSON outputs enable programmatic integration with other tools
- Markdown reports provide human-readable analysis and recommendations
- Configuration allows customization for different project types and needs