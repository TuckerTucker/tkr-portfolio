# YAML Compression Techniques for Context-Kit

**Target:** 40-60% token reduction while maintaining completeness
**Standard:** YAML 1.2 compliant
**Priority:** Accuracy > Compression

## Compression Strategy Overview

Apply compression techniques in this order:

1. **Define anchors** for repeated patterns
2. **Apply abbreviations** consistently
3. **Use compact notation** for simple structures
4. **Strategic omissions** of empty/default values
5. **Validate** anchor resolution and YAML syntax

## 1. Anchors and Aliases

### Basic Anchor Definition

Define an anchor with `&name`:

```yaml
# Define anchor
colors: &base-colors
  primary: "#0066cc"
  secondary: "#ff9900"

# Reference anchor
theme:
  light: *base-colors
```

### Merge Operator

Use `<<: *anchor` to merge and extend:

```yaml
# Define base
py_lang: &py
  lang: python
  ext: .py

# Merge and extend
files:
  - {p: "main.py", ln: 450, <<: *py, desc: "Entry point"}
  - {p: "utils.py", ln: 120, <<: *py, desc: "Utilities"}
```

### Multiple Anchors

Define multiple anchors for different patterns:

```yaml
# Language anchors
langs:
  py: &py {lang: python, ext: .py}
  js: &js {lang: javascript, ext: .js}
  ts: &ts {lang: typescript, ext: .ts}

# Reuse throughout
files:
  - {p: "main.py", <<: *py}
  - {p: "app.js", <<: *js}
  - {p: "index.ts", <<: *ts}
```

### Nested Anchors

Create hierarchical anchor structures:

```yaml
deps: &deps
  js: &js-deps
    prod: &js-prod
      react: &react-dep {id: "ctx7-12345", v: "^18.2.0"}
      react-dom: {id: "ctx7-12346", v: "^18.2.0"}

# Reference nested anchors
internal:
  ui-lib:
    peer_deps: *js-prod
```

### Common Anchor Patterns

**Dependency anchors:**
```yaml
deps: &deps
  js: &js-deps
    prod:
      typescript: &ts-dep {id: "ctx7-001", v: "^5.2.2"}
      vitest: &vitest {id: "ctx7-002", v: "^1.0.0"}
    dev:
      "@vitest/coverage-v8": {<<: *vitest}  # Reuse version info
```

**Color anchors:**
```yaml
design:
  tokens:
    color: &colors
      bg:
        primary: &bg-primary {val: "#f8fafc", type: color}
        surface: {val: "#ffffff", type: color}
      text:
        primary: &text-primary {val: "#1e293b", type: color}

  # Reference in accessibility
  a11y:
    focus: {style: "2px solid", color: *text-primary}
```

**Stack anchors:**
```yaml
meta:
  stack: &tech-stack "TypeScript + React + SQLite"

arch:
  stack: *tech-stack  # Reuse instead of duplicating
```

## 2. Standard Abbreviations

### Required Abbreviations

Apply these consistently throughout:

| Full Form | Abbreviated | Context |
|-----------|-------------|---------|
| dependencies | deps | Top-level section |
| structure | struct | Top-level section |
| components | comp | Design system |
| properties | props or p | Component props |
| description | desc | Descriptions |
| language | lang | Programming language |
| imports | imp | Import statements |
| exports | exp | Exported symbols |
| accessibility | a11y | Accessibility features |
| configuration | cfg | Configuration data |
| environment | env | Environment variables |
| states | s | Component states |

### Context-Specific Abbreviations

**Component specifications:**
```yaml
comp:
  Button:
    p: {variant: [primary, secondary], size: [sm, md, lg]}  # p = props
    s: [default, hover, active, disabled]                    # s = states
    a11y: {role: button, kbd: [Enter, Space]}               # a11y = accessibility
```

**File metadata:**
```yaml
files:
  - {p: "src/main.py", ln: 450, desc: "Entry point"}  # p = path, ln = lines
```

**Type counts:**
```yaml
struct:
  src:
    _: {n: 120, t: {ts: 40, tsx: 35, js: 45}}  # n = count, t = types
```

### When Not to Abbreviate

Keep full names when:
- It's a single occurrence
- Abbreviation reduces clarity significantly
- It's part of a standard API or specification
- Context requires explicit naming

## 3. Compact Notation

### Inline Arrays

Use for lists under 5 items:

```yaml
# ❌ Verbose
imports:
  - api.app
  - config
  - logging

# ✅ Compact
imp: [api.app, config, logging]
```

**Exception:** Use multi-line for readability when items are complex:

```yaml
# ✅ OK - complex items
cmds:
  - "./setup"
  - ".context-kit/scripts/setup-context-kit-mcp"
  - ".context-kit/scripts/start-all"
```

### Inline Objects

Use for simple key-value pairs:

```yaml
# ❌ Verbose
metadata:
  lines: 450
  classes: 5
  functions: 12

# ✅ Compact
meta: {ln: 450, cls: 5, fn: 12}
```

### Directory Aggregates

Use `_:` pattern for summary statistics:

```yaml
struct:
  src:
    _: {n: 120, t: {ts: 40, tsx: 35, js: 45}}  # Summary
    components:
      _: {n: 25}  # Subdirectory summary
      Button: [.tsx, .test.tsx, .module.css]
```

**Benefits:**
- Provides counts without listing every file
- Maintains file type distribution
- Token-efficient

### Mixed Notation

Combine inline and multi-line for optimal readability:

```yaml
design:
  tokens:
    spacing: &spacing
      xs: {val: "0.25rem", type: dimension, desc: "4px"}
      sm: {val: "0.5rem", type: dimension, desc: "8px"}
      md: {val: "1rem", type: dimension, desc: "16px"}
      lg: {val: "1.5rem", type: dimension, desc: "24px"}
      xl: {val: "2rem", type: dimension, desc: "32px"}
```

## 4. Strategic Omissions

### Omit Empty Values

```yaml
# ❌ Verbose
files:
  - path: "main.py"
    lines: 450
    exports: []
    imports: null
    description: null
    tests: null

# ✅ Optimized
files:
  - {p: "main.py", ln: 450}
```

### Omit Default Values

```yaml
# ❌ Verbose
comp:
  Button:
    props:
      disabled: false
      type: "button"
      variant: "primary"

# ✅ Optimized - only non-defaults
comp:
  Button:
    p: {variant: [primary, secondary, tertiary]}  # Only possible values
```

### Omit Redundant Information

```yaml
# ❌ Redundant
struct:
  src:
    _: {n: 120, t: {ts: 40, tsx: 35, js: 45}, total: 120}  # total = n

# ✅ No redundancy
struct:
  src:
    _: {n: 120, t: {ts: 40, tsx: 35, js: 45}}
```

### When to Keep "Empty" Values

Keep when they convey meaningful information:

```yaml
# ✅ Meaningful
deps:
  js:
    prod:
      react: {id: "ctx7-12345", v: "^18.2.0"}
      custom-lib: {id: null, v: "^1.0.0"}  # Keep null - indicates not in Context7
```

## 5. Complete Optimization Examples

### Dependencies Optimization

**Before (240 tokens):**
```yaml
repository:
  languages:
    python: 0.80
    javascript: 0.15
    sql: 0.05

files:
  - path: "src/main.py"
    lines: 450
    language: "python"
    description: "Application entry point"
    imports: ["api.app", "config", "logging"]
    exports: ["main", "initialize"]
  - path: "src/api/routes.py"
    lines: 680
    language: "python"
    description: "API endpoint definitions"
    imports: ["fastapi", "models", "auth"]
    exports: ["router", "health_check"]
  - path: "src/utils/helpers.py"
    lines: 120
    language: "python"
    description: "Utility functions"
    exports: ["format_date", "parse_json"]
```

**After (95 tokens, 60% reduction):**
```yaml
repository:
  langs: {py: 0.80, js: 0.15, sql: 0.05}

files:
  - &py {lang: python}
  - {p: "src/main.py", ln: 450, <<: *py, desc: "Entry point",
     imp: [api.app, config, logging], exp: [main, initialize]}
  - {p: "src/api/routes.py", ln: 680, <<: *py, desc: "API endpoints",
     imp: [fastapi, models, auth], exp: [router, health_check]}
  - {p: "src/utils/helpers.py", ln: 120, <<: *py,
     exp: [format_date, parse_json]}
```

### Component Optimization

**Before (180 tokens):**
```yaml
components:
  Button:
    properties:
      variant:
        - primary
        - secondary
        - tertiary
      size:
        - small
        - medium
        - large
      disabled: false
    states:
      - default
      - hover
      - active
      - disabled
    accessibility:
      role: button
      keyboard:
        - Enter
        - Space
```

**After (55 tokens, 69% reduction):**
```yaml
comp:
  Button:
    p: {variant: [primary, secondary, tertiary], size: [sm, md, lg]}
    s: [default, hover, active, disabled]
    a11y: {role: button, kbd: [Enter, Space]}
```

### Structure Optimization

**Before (200 tokens):**
```yaml
structure:
  source:
    total_files: 120
    file_types:
      typescript: 40
      tsx: 35
      javascript: 45
    components:
      total_files: 25
      files:
        - Button.tsx
        - Button.test.tsx
        - Button.module.css
    utilities:
      total_files: 15
      files:
        - api.ts
        - helpers.ts
```

**After (70 tokens, 65% reduction):**
```yaml
struct:
  src:
    _: {n: 120, t: {ts: 40, tsx: 35, js: 45}}
    comp:
      _: {n: 25}
      Button: [.tsx, .test.tsx, .module.css]
    utils:
      _: {n: 15}
      files: [api.ts, helpers.ts]
```

## 6. Validation and Quality Checks

### Pre-Write Validation

Before writing the YAML file:

1. **Check anchor definitions**
   ```bash
   # All anchors defined before use?
   grep -n '&' file.yml
   grep -n '*' file.yml
   ```

2. **Validate YAML syntax**
   ```bash
   # Does it parse?
   yq eval '.' file.yml > /dev/null
   ```

3. **Check quotes**
   ```bash
   # Timestamps and versions quoted?
   grep -E 'ts:|v:' file.yml
   ```

### Post-Write Validation

After generating:

1. **Anchor resolution**
   ```bash
   # Do all aliases resolve?
   yq eval '.deps.js.prod.react' file.yml
   ```

2. **Token count**
   ```bash
   # Achieved target reduction?
   wc -w file.yml
   ```

3. **Readability check**
   - Can you understand it without expanding?
   - Are abbreviations consistent?
   - Are comments helpful?

## 7. Anti-Patterns to Avoid

### Over-Compression

```yaml
# ❌ Too compressed - unclear
comp:
  Btn: {p: {v: [p, s, t], s: [s, m, l]}, s: [d, h, a, dis]}

# ✅ Balanced - clear
comp:
  Button:
    p: {variant: [primary, secondary, tertiary], size: [sm, md, lg]}
    s: [default, hover, active, disabled]
```

### Inconsistent Abbreviations

```yaml
# ❌ Inconsistent
struct:
  src:
    components: {n: 25}  # Full name
    comp: {n: 15}        # Abbreviated
    utils: {n: 10}       # Different abbreviation

# ✅ Consistent
struct:
  src:
    comp: {n: 25}
    utils: {n: 15}
    lib: {n: 10}
```

### Broken Anchors

```yaml
# ❌ Alias before anchor
arch:
  stack: *tech-stack  # Error: not yet defined

meta:
  stack: &tech-stack "TypeScript + React"

# ✅ Anchor before alias
meta:
  stack: &tech-stack "TypeScript + React"

arch:
  stack: *tech-stack
```

### Unquoted Strings

```yaml
# ❌ Unquoted - syntax errors
meta:
  ts: 2025-09-30T14:30:00Z
deps:
  js:
    prod:
      react: {id: ctx7-12345, v: ^18.2.0}

# ✅ Properly quoted
meta:
  ts: "2025-09-30T14:30:00Z"
deps:
  js:
    prod:
      react: {id: "ctx7-12345", v: "^18.2.0"}
```

## 8. Compression Checklist

Before finalizing your YAML:

- [ ] All repeated values use anchors
- [ ] Standard abbreviations applied consistently
- [ ] Arrays under 5 items use inline notation
- [ ] Simple objects use inline notation
- [ ] Directory aggregates use `_:` pattern
- [ ] Empty/null/default values omitted strategically
- [ ] All anchors defined before aliases
- [ ] Timestamps in ISO 8601 format with quotes
- [ ] Version strings quoted
- [ ] YAML 1.2 syntax validated
- [ ] Anchor resolution tested
- [ ] 40-60% token reduction achieved
- [ ] Readability maintained

## Token Reduction Metrics

### By Technique

| Technique | Token Reduction |
|-----------|-----------------|
| Anchors/aliases | 10-20% |
| Abbreviations | 15-25% |
| Compact notation | 10-15% |
| Strategic omissions | 5-15% |
| **Combined** | **40-60%** |

### By Section

| Section | Typical Reduction |
|---------|-------------------|
| Dependencies | 50-60% |
| Structure | 60-70% |
| Design tokens | 40-50% |
| Components | 60-70% |
| Metadata | 20-30% |

## See Also

- [specification.md](./specification.md) - Full format specification
- [examples.md](./examples.md) - Real-world examples
