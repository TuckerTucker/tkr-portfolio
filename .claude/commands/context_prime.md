# Context Prime

Rapidly establish project context by reading the consolidated _context-kit.yml file.

## Description
This command provides instant project context by reading the AI-optimized _context-kit.yml file that contains consolidated project information, architecture patterns, and key metadata. Simple and fast context loading in seconds.

## Usage
`context_prime [section]`

## Variables
- PROJECT_ROOT: Project directory (default: current directory)
- SECTION: Specific section to focus on - "structure", "stack", "patterns", "integrations" (default: all)

## Context Loading Strategy
- Primary source: `.context-kit/_context-kit.yml` - comprehensive project metadata
- Optional: Recent README.md files for supplementary context
- Graceful fallback if _context-kit.yml doesn't exist
- Focus on actionable information for immediate productivity

## Implementation

1. **Read Primary Source**:
   - Load `.context-kit/_context-kit.yml` as the authoritative project context
   - Parse structured sections: project, structure, patterns, stack, integrations, architecture
   
2. **Optional Supplementary Context**:
   - Main `README.md` if _context-kit.yml is missing or incomplete
   - Package.json/requirements.txt for dependency context
   
3. **Section Filtering** (if SECTION specified):
   - Extract only the requested section from _context-kit.yml
   - Useful for focused context when working on specific areas

## Expected _context-kit.yml Structure
The command expects these key sections in _context-kit.yml:
- `project`: Basic metadata (name, type, description, version)
- `structure`: Directory layout and key paths
- `patterns`: File naming, architecture patterns, conventions
- `stack`: Technology stack, languages, frameworks, key libraries
- `integrations`: External services, APIs, deployment targets
- `architecture`: Core patterns, design principles
- `task_locations`: Common task patterns and file locations
- `common_patterns`: Reusable solutions and approaches

## Examples

### Load full project context
```
/context_prime
```

### Focus on project structure
```
/context_prime structure
```

### Focus on technology stack
```
/context_prime stack
```

## Fallback Behavior
If `.context-kit/_context-kit.yml` doesn't exist:
1. Read main `README.md` for basic project understanding
2. Suggest running `/project-yaml` command to generate the consolidated YAML
3. Provide limited context from available documentation

## Implementation Notes
- Single-file primary source for maximum speed and simplicity
- _context-kit.yml should be generated/updated by project-yaml-builder agent
- Extensible design - additional sources can be added later
- Error handling for missing or malformed YAML files
- Clear messaging about context source and completeness