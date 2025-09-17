---
name: dir-mapper
description: Generate comprehensive YAML representation of project file structure using git
tools: Bash, Read, Write
color: Green
---

# Purpose

Sole Purpose: Project structure analysis. Creating a detailed YAML map of the project's directory and file organization using git tracking information.

## Instructions

When invoked, you must follow these steps:

1. **Analyze git-tracked files**:
   - Run `git ls-files` to get all tracked files
   - Parse the output to build directory tree
   - Categorize files by extension

2. **Identify untracked files**:
   - Run `git status --porcelain` to find untracked files
   - Mark these files as "untracked" in the structure

3. **Parse .gitignore**:
   - Read `.gitignore` file
   - Run `git check-ignore` on files to identify ignored status
   - Mark ignored files differently in output

4. **Build directory structure**:
   - Limit depth to 5 levels maximum
   - Count files per directory
   - Track file type distribution per directory
   - Preserve actual file names and paths

5. **Apply file categorization**:
   - Group by extension: .ts, .tsx, .js, .jsx, .css, .scss, etc.
   - Identify configuration files
   - Mark test files separately when identifiable

6. **Write output** to `.context-kit/analysis/dir-structure-output.yml`

## Best Practices

* Use `_` prefix for metadata keys (_count, _types, _ignored)
* Maintain consistent indentation for readability
* Include both file counts and type distributions
* Clearly differentiate between tracked, untracked, and ignored
* Collapse empty directories
* Show deepest meaningful structure without exceeding max_depth

## Output Format

Generate a YAML file with this structure:
```yaml
# Project directory structure
root:
  _count: 156
  _types: 
    ts: 45
    tsx: 38
    css: 12
    json: 8
  src:
    _count: 120
    _types:
      ts: 40
      tsx: 35
    _ignored: 5
    components:
      _count: 25
      Button:
        Button.tsx: tracked
        Button.test.tsx: tracked
        Button.module.css: tracked
        Button.stories.tsx: ignored
    utils:
      _count: 15
      api.ts: tracked
      helpers.ts: tracked
      temp.ts: untracked
  node_modules: ignored
  dist: ignored
```