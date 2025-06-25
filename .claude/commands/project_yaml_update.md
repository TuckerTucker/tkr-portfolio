# Project YAML Update

Update the project YAML file with current project state and structure.

## Description
This command systematically updates the `_project/_project.yml` file to accurately reflect the current project structure, dependencies, and configuration. It ensures the project documentation stays synchronized with acatual implementation by analyzing the codebase and updating all relevant sections.

## Usage
`project_yaml_update [section]`

## Variables
- PROJECT_ROOT: Starting directory for analysis (default: current directory)
- YAML_PATH: Path to project YAML file (default: _project/_project.yml)
- SECTION: Specific section to update (default: all sections)
- BACKUP: Create backup before updating (default: true)

## Parallel Agents
- Use an agent for each of the steps and run them in parallel

## Steps
1. **Analyze Current Project State**:
   - Review directory structure and file organization
   - Identify new files, directories, and components
   - Check for removed or relocated items
   - Document current project status and progress

2. **Update Project Metadata**:
   - Refresh version number if significant changes
   - Update description to reflect current scope
   - Modify status based on project progress
   - Update timestamp to current date

3. **Synchronize Directory Structure**:
   - Map actual directory tree vs documented structure
   - Add new directories and files discovered
   - Remove entries for deleted items
   - Update descriptions for modified areas

4. **Update Technology Stack** (if applicable):
   - Review package.json, requirements.txt, or similar files
   - Document new dependencies or frameworks
   - Update version constraints for key libraries
   - Note significant technology changes

5. **Refresh Purpose and Goals**:
   - Validate project summary against current scope
   - Update goals list based on completed/added objectives
   - Modify purpose statement if project focus has shifted
   - Ensure alignment with actual implementation

6. **Validate and Format**:
   - Check YAML syntax and structure
   - Ensure compliance with specification guide
   - Validate all paths and references
   - Format consistently with project standards

## Examples

### Example 1: Full project update
Complete refresh of project YAML after major structural changes or milestone completion.

### Example 2: Directory structure sync
Update just the directories section after reorganizing project files.

### Example 3: Metadata refresh
Update project metadata after version release or status change.

## Integration Points
- **Specification Guide**: Follow `/Volumes/tkr-riffic/@tkr-projects/prompt_rewriting/_project/_ref/tkr-project-yaml/specification-guide.md`
- **Context Prime**: Can be run after `context_prime` to update documentation based on findings
- **Version Control**: Consider committing YAML updates as documentation improvements

## Best Practices
- Always backup existing YAML before major updates
- Compare documented vs actual structure systematically
- Update descriptions to be accurate and helpful
- Maintain consistency with established naming conventions
- Validate YAML syntax after updates
- Consider impact on other team members relying on the documentation

## Notes
- Focus on accuracy over completeness - better to have correct partial documentation
- Pay attention to both explicit file structure and implicit project organization
- Update status to reflect actual project state, not aspirational goals
- Consider both technical structure and business context when updating purpose/goals