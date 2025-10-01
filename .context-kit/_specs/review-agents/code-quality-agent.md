# Code Quality Review Agent - Technical Specification

## Overview

A Code Quality Review Agent enforces coding standards, detects anti-patterns, and assesses maintainability through static code analysis. It focuses on improving developer productivity, reducing technical debt, and ensuring long-term codebase health.

**Mission**: Maintain high code quality standards while fostering maintainable, readable, and consistent codebases.

---

## Core Principles

- **Consistency Over Perfection**: Uniform style is more important than any single approach
- **Actionable Feedback**: Every issue includes concrete improvement suggestions
- **Context-Aware**: Different standards for tests vs production code
- **Progressive Enhancement**: Support incremental improvements, not just perfect scores

---

## Detection Strategies by Category

### 1. Code Complexity Analysis

#### Cyclomatic Complexity

**High Complexity Functions**
```javascript
// ❌ Warning: Complexity = 15 (threshold: 10)
function processOrder(order, user, inventory, pricing, discounts) {
  if (order.items.length === 0) {
    return { error: 'Empty order' };
  }

  for (const item of order.items) {
    if (!inventory[item.id]) {
      return { error: 'Out of stock' };
    }

    if (user.isPremium) {
      if (discounts.premium[item.category]) {
        // ... 15 more conditional branches
      }
    }
  }
  // ... complex logic continues
}

// ✅ Good: Refactored into smaller functions
function processOrder(order, user, inventory, pricing, discounts) {
  validateOrder(order);
  checkInventory(order, inventory);
  applyDiscounts(order, user, discounts);
  calculateTotal(order, pricing);
}
```

#### Cognitive Complexity

**Deeply Nested Logic**
```javascript
// ❌ Warning: Cognitive complexity too high
function analyzeData(data) {
  for (const item of data) {
    if (item.isValid) {
      for (const subItem of item.children) {
        if (subItem.active) {
          for (const detail of subItem.details) {
            if (detail.value > 0) {
              // 4 levels of nesting!
            }
          }
        }
      }
    }
  }
}

// ✅ Good: Flattened with early returns
function analyzeData(data) {
  for (const item of data) {
    if (!item.isValid) continue;
    processValidItem(item);
  }
}
```

#### Agent Actions

- `Bash` runs ESLint with complexity rules: `eslint --format json`
- Parse complexity metrics from output
- Calculate cognitive complexity scores
- `Read` functions and analyze control flow
- Identify functions exceeding thresholds (cyclomatic: 10, cognitive: 15)

#### Metrics

- **Cyclomatic Complexity**: Branch count (if/else, loops, switch cases)
- **Cognitive Complexity**: Mental burden to understand code
- **Nesting Depth**: Maximum indentation levels
- **Function Length**: Lines of code per function

---

### 2. Code Duplication (DRY Violations)

#### Patterns Detected

**Copy-Paste Code**
```typescript
// ❌ Warning: Duplicated logic
function validateEmail(email: string) {
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!regex.test(email)) {
    throw new Error('Invalid email');
  }
}

function validateUserEmail(email: string) {
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;  // Duplicate!
  if (!regex.test(email)) {
    throw new Error('Invalid email');
  }
}

// ✅ Good: Single source of truth
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
function validateEmail(email: string) {
  if (!EMAIL_REGEX.test(email)) {
    throw new Error('Invalid email');
  }
}
```

**Similar Code Blocks**
```javascript
// ❌ Warning: Similar structure, should be abstracted
function createUser(data) {
  const user = new User();
  user.name = data.name;
  user.email = data.email;
  user.save();
}

function createProduct(data) {
  const product = new Product();
  product.name = data.name;
  product.price = data.price;
  product.save();
}

// ✅ Good: Generic factory pattern
function createEntity(EntityClass, data) {
  const entity = new EntityClass();
  Object.assign(entity, data);
  entity.save();
}
```

#### Agent Actions

- `Bash` runs jscpd (copy-paste detector): `jscpd --format json`
- Calculate token-based similarity between code blocks
- `Grep` for repeated regex patterns, constants
- Identify similar function structures
- Report duplication percentage and locations

#### Thresholds

- **Critical**: >20% code duplication across files
- **Warning**: >10% code duplication
- **Suggestion**: 5-10% duplication (may be acceptable)

---

### 3. Naming Conventions

#### Patterns Detected

**Unclear Variable Names**
```javascript
// ❌ Warning: Non-descriptive names
function calc(a, b, c) {
  const x = a + b;
  const y = x * c;
  return y;
}

// ✅ Good: Descriptive names
function calculateTotalWithTax(subtotal, shipping, taxRate) {
  const totalBeforeTax = subtotal + shipping;
  const totalWithTax = totalBeforeTax * taxRate;
  return totalWithTax;
}
```

**Inconsistent Naming**
```typescript
// ❌ Warning: Inconsistent conventions
const user_name = 'John';      // snake_case
const UserEmail = 'j@e.com';   // PascalCase
const USERPHONE = '123';       // UPPER_CASE

// ✅ Good: Consistent camelCase
const userName = 'John';
const userEmail = 'j@e.com';
const userPhone = '123';
```

**Magic Numbers/Strings**
```javascript
// ❌ Warning: Magic numbers
if (status === 404) {
  setTimeout(retry, 5000);
}

// ✅ Good: Named constants
const HTTP_NOT_FOUND = 404;
const RETRY_DELAY_MS = 5000;

if (status === HTTP_NOT_FOUND) {
  setTimeout(retry, RETRY_DELAY_MS);
}
```

#### Agent Actions

- `Bash` runs ESLint with naming rules
- `Grep` for single-letter variables (except loop counters)
- `Grep` for magic numbers: `(?<!\w)\d{3,}(?!\w)`
- Check naming consistency (camelCase, PascalCase, UPPER_SNAKE_CASE)
- Validate minimum variable name length (>2 chars)

---

### 4. Function Quality

#### Long Functions

**Too Many Lines**
```javascript
// ❌ Warning: Function is 150 lines (threshold: 50)
function processData(input) {
  // ... 150 lines of logic
}

// ✅ Good: Broken into smaller functions
function processData(input) {
  const validated = validateInput(input);
  const transformed = transformData(validated);
  const enriched = enrichWithMetadata(transformed);
  return formatOutput(enriched);
}
```

#### Too Many Parameters

**Parameter Count**
```javascript
// ❌ Warning: 7 parameters (threshold: 4)
function createReport(title, author, date, data, format, options, callback) {
  // ...
}

// ✅ Good: Use options object
function createReport(config) {
  const { title, author, date, data, format, options, callback } = config;
  // ...
}
```

#### No Return Type (TypeScript)

```typescript
// ❌ Warning: Missing return type
function getUser(id: string) {
  return database.users.find(u => u.id === id);
}

// ✅ Good: Explicit return type
function getUser(id: string): User | undefined {
  return database.users.find(u => u.id === id);
}
```

#### Agent Actions

- Calculate lines per function
- Count function parameters
- Check TypeScript return type annotations
- Validate function cohesion (single responsibility)

---

### 5. Dead Code Detection

#### Patterns Detected

**Unused Variables**
```javascript
// ❌ Warning: 'temp' is declared but never used
function calculate(a, b) {
  const temp = a + b;
  const result = a * b;
  return result;
}
```

**Unreachable Code**
```javascript
// ❌ Warning: Unreachable code after return
function process() {
  return true;
  console.log('This never runs');  // Unreachable
}
```

**Unused Imports**
```typescript
// ❌ Warning: 'lodash' imported but not used
import _ from 'lodash';
import { useState } from 'react';

export function Component() {
  const [state, setState] = useState();
  // lodash never used
}
```

**Commented-Out Code**
```javascript
// ❌ Warning: Large blocks of commented code
function process() {
  return data;

  // const old = processOldWay();
  // if (old.isValid) {
  //   return old.transform();
  // }
  // ... 50 lines of commented code
}
```

#### Agent Actions

- `Bash` runs ESLint with no-unused-vars
- `Grep` for large commented code blocks: `//.*\n(//.*\n){5,}`
- Parse AST to detect unreachable statements
- Check import usage

---

### 6. Code Smells

#### Long Parameter Lists

**Parameter Coupling**
```javascript
// ❌ Code Smell: Related parameters should be grouped
function drawRectangle(x, y, width, height, color, borderWidth, borderColor) {
  // ...
}

// ✅ Better: Group related parameters
function drawRectangle(position, dimensions, style) {
  const { x, y } = position;
  const { width, height } = dimensions;
  const { color, borderWidth, borderColor } = style;
}
```

#### Feature Envy

**Method Accessing Too Much External Data**
```javascript
// ❌ Code Smell: Feature envy
class ShoppingCart {
  calculateTotal() {
    return this.items.reduce((sum, item) =>
      sum + item.product.price * item.quantity, 0
    );
  }
}

// ✅ Better: Move logic to appropriate class
class CartItem {
  getSubtotal() {
    return this.product.price * this.quantity;
  }
}

class ShoppingCart {
  calculateTotal() {
    return this.items.reduce((sum, item) => sum + item.getSubtotal(), 0);
  }
}
```

#### Primitive Obsession

**Using Primitives Instead of Objects**
```javascript
// ❌ Code Smell: Primitive obsession
function sendEmail(toEmail, toName, subject, body) {
  // ...
}

// ✅ Better: Use value objects
class EmailAddress {
  constructor(email, name) {
    this.email = email;
    this.name = name;
  }
}

function sendEmail(recipient, subject, body) {
  // recipient is EmailAddress object
}
```

#### Agent Actions

- Detect parameter lists >4 items
- Analyze method call patterns for feature envy
- Identify primitive type overuse in domain logic
- Check class cohesion (LCOM4 metric)

---

### 7. Comment Quality

#### Patterns Detected

**Missing JSDoc/TSDoc**
```typescript
// ❌ Warning: Public function lacks documentation
export function processPayment(amount, currency) {
  // ...
}

// ✅ Good: Documented
/**
 * Process a payment transaction
 * @param amount - Payment amount in smallest currency unit (e.g., cents)
 * @param currency - ISO 4217 currency code (e.g., 'USD')
 * @returns Transaction ID on success
 * @throws {PaymentError} If payment fails
 */
export function processPayment(amount: number, currency: string): string {
  // ...
}
```

**Obvious Comments**
```javascript
// ❌ Warning: Comment states the obvious
// Increment counter by 1
counter++;

// Loop through all users
for (const user of users) {
  // ...
}
```

**TODO/FIXME Audit**
```javascript
// ⚠️ Information: 47 TODO comments found
// TODO: Implement caching
// FIXME: Memory leak here
// HACK: Temporary workaround
```

#### Agent Actions

- `Grep` for TODO, FIXME, HACK comments
- Check public API documentation coverage
- Identify obvious comments (comment ≈ code)
- Validate JSDoc/TSDoc syntax

---

### 8. TypeScript-Specific Quality

#### Type Safety Issues

**Using 'any' Type**
```typescript
// ❌ Warning: 'any' disables type checking
function process(data: any) {
  return data.something.nested.value;  // No type safety!
}

// ✅ Good: Proper typing
interface DataStructure {
  something: {
    nested: {
      value: string;
    };
  };
}

function process(data: DataStructure) {
  return data.something.nested.value;
}
```

**Type Assertions Without Validation**
```typescript
// ❌ Warning: Unsafe type assertion
const user = response as User;  // What if it's not?

// ✅ Good: Runtime validation
function isUser(obj: unknown): obj is User {
  return typeof obj === 'object' &&
         obj !== null &&
         'id' in obj &&
         'email' in obj;
}

const user = isUser(response) ? response : null;
```

#### Agent Actions

- Count 'any' type usage
- Detect 'as' type assertions
- Check for non-null assertions (`!`)
- Validate strict mode enabled

---

## Tool Usage Pattern

```
Phase 1: Linting (Fast)
├─ Bash: eslint --format json
├─ Bash: prettier --check
├─ Parse: ESLint JSON output
└─ Output: Style violations, basic errors

Phase 2: Complexity Analysis (Medium)
├─ Bash: eslint --rule 'complexity: [warn, 10]'
├─ Calculate: Cognitive complexity metrics
├─ Read: Functions for deep analysis
└─ Output: Complexity hotspots

Phase 3: Duplication Detection (Medium)
├─ Bash: jscpd --min-tokens 50
├─ Parse: Duplication reports
└─ Output: Copy-paste violations

Phase 4: Dead Code Detection (Fast)
├─ Bash: ts-prune (for TypeScript)
├─ Grep: Commented code blocks
└─ Output: Unused exports, dead code

Phase 5: Type Safety Analysis (TypeScript only)
├─ Bash: tsc --noEmit
├─ Grep: 'any' type usage
└─ Output: Type safety score
```

---

## Scoring System

### Code Quality Score (0-100)

```
Base Score = 100

Deductions:
- Critical issues (15 pts each): Complexity >20, >30% duplication
- Warnings (5 pts each): Complexity >10, >10% duplication, long functions
- Suggestions (1 pt each): Missing docs, TODO comments, minor style issues

Thresholds:
90-100: Excellent
75-89:  Good
60-74:  Needs Improvement
<60:    Poor Quality
```

### Quality Metrics

- **Maintainability Index**: 0-100 scale (complexity, volume, documentation)
- **Technical Debt Ratio**: Hours to fix issues / Hours to rewrite from scratch
- **Code Coverage**: Percentage of code exercised by tests
- **Documentation Coverage**: Percentage of public APIs documented

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
    <h1>Code Quality Review Report</h1>
    <div class="score-badge good">82/100</div>
    <div class="metrics-grid">
      <div class="metric">
        <h3>Maintainability Index</h3>
        <div class="score">78/100</div>
      </div>
      <div class="metric">
        <h3>Code Duplication</h3>
        <div class="score">6.2%</div>
      </div>
      <div class="metric">
        <h3>Avg Complexity</h3>
        <div class="score">4.8</div>
      </div>
      <div class="metric">
        <h3>Documentation</h3>
        <div class="score">71%</div>
      </div>
    </div>
    <div class="quick-stats">
      <span class="critical">2 Critical Issues</span>
      <span class="warning">15 Warnings</span>
      <span class="suggestion">43 Suggestions</span>
    </div>
  </section>

  <section class="complexity-hotspots">
    <h2>🔥 Complexity Hotspots</h2>
    <table>
      <thead>
        <tr>
          <th>Function</th>
          <th>File</th>
          <th>Cyclomatic</th>
          <th>Cognitive</th>
          <th>Lines</th>
          <th>Priority</th>
        </tr>
      </thead>
      <tbody>
        <tr class="critical">
          <td><code>processOrder</code></td>
          <td>src/services/orders.ts:145</td>
          <td>18</td>
          <td>27</td>
          <td>187</td>
          <td><span class="badge critical">High</span></td>
        </tr>
        <tr class="warning">
          <td><code>validateInput</code></td>
          <td>src/utils/validation.ts:23</td>
          <td>12</td>
          <td>15</td>
          <td>98</td>
          <td><span class="badge warning">Medium</span></td>
        </tr>
      </tbody>
    </table>
  </section>

  <section class="duplication">
    <h2>📋 Code Duplication</h2>
    <div class="duplication-summary">
      <p>Found <strong>23 duplicated blocks</strong> across <strong>12 files</strong></p>
      <p>Total duplicated lines: <strong>487</strong> (6.2% of codebase)</p>
    </div>

    <details>
      <summary>Duplicated Block: Email validation (3 instances)</summary>
      <div class="duplication-card">
        <p><strong>Duplicated in:</strong></p>
        <ul>
          <li>src/utils/validators.ts:45-52</li>
          <li>src/components/LoginForm.tsx:89-96</li>
          <li>src/services/user.ts:123-130</li>
        </ul>

        <pre><code class="language-typescript">
// Duplicated Code
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
if (!emailRegex.test(email)) {
  throw new Error('Invalid email format');
}
        </code></pre>

        <div class="remediation">
          <h4>Suggested Fix</h4>
          <p>Extract to shared utility function:</p>
          <pre><code class="language-typescript">
// src/utils/validators.ts
export function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}
          </code></pre>
        </div>
      </div>
    </details>
  </section>

  <section class="dead-code">
    <h2>💀 Dead Code</h2>
    <ul>
      <li>
        <strong>src/utils/deprecated.ts</strong>
        <p>Entire file unused (exported functions have no imports)</p>
        <p><em>Suggestion: Remove file or document if intentionally deprecated</em></p>
      </li>
      <li>
        <strong>src/components/OldModal.tsx:12</strong>
        <p>Variable <code>legacyConfig</code> declared but never used</p>
      </li>
    </ul>
  </section>

  <section class="type-safety">
    <h2>🛡️ TypeScript Type Safety</h2>
    <div class="type-metrics">
      <p>Type Safety Score: <strong>84/100</strong></p>
      <ul>
        <li>23 uses of <code>any</code> type (⚠️ reduces type safety)</li>
        <li>12 type assertions without validation</li>
        <li>5 non-null assertions (<code>!</code>)</li>
      </ul>
    </div>
  </section>

  <section class="todo-audit">
    <h2>📝 TODO/FIXME Audit</h2>
    <p>Found <strong>47 TODO comments</strong> across the codebase</p>
    <details>
      <summary>View all TODOs</summary>
      <ul>
        <li>src/api/users.ts:34 - <code>// TODO: Add caching</code></li>
        <li>src/utils/data.ts:89 - <code>// FIXME: Memory leak with large datasets</code></li>
        <li>src/components/Chart.tsx:156 - <code>// HACK: Temporary workaround for react-chartjs-2 bug</code></li>
      </ul>
    </details>
  </section>

  <section class="recommendations">
    <h2>💡 Top Recommendations</h2>
    <ol>
      <li><strong>Refactor processOrder function</strong> - Break into smaller functions (complexity: 18 → target: <10)</li>
      <li><strong>Extract duplicated validation logic</strong> - Create shared validators module (-487 lines)</li>
      <li><strong>Add JSDoc to public APIs</strong> - 28 exported functions lack documentation</li>
      <li><strong>Reduce 'any' type usage</strong> - Replace with proper types for better type safety</li>
      <li><strong>Review and resolve TODOs</strong> - 47 pending tasks indicate incomplete work</li>
    </ol>
  </section>

  <section class="trend">
    <h2>📈 Quality Trend</h2>
    <p><em>Compared to previous analysis:</em></p>
    <ul>
      <li>Code Quality Score: 78 → 82 (+4) ✅</li>
      <li>Average Complexity: 5.2 → 4.8 (-0.4) ✅</li>
      <li>Code Duplication: 8.1% → 6.2% (-1.9%) ✅</li>
      <li>TODO Count: 52 → 47 (-5) ✅</li>
    </ul>
  </section>
</body>
</html>
```

---

## Integration with Orchestration System

### Dependency Chain

```
Phase 1: code-quality-agent (INDEPENDENT or after react-component-analyzer)
         ├─ Can run standalone
         └─ Or leverage component knowledge graph

Phase 2: validation-agent
         └─ Validates quality improvements
```

### Execution Time

**~2-4 minutes** for medium codebase (linting is fast, duplication detection is slower)

### Configuration

```yaml
agents:
  code-quality-agent:
    priority: 2
    dependencies: []  # Independent
    timeout: 240s
    retry: 2
    thresholds:
      complexity:
        cyclomatic: 10
        cognitive: 15
      duplication:
        critical: 20  # % of codebase
        warning: 10
      function_length: 50
      parameters: 4
    exclusions:
      - '**/*.test.ts'
      - '**/*.spec.ts'
      - '**/generated/**'
```

---

## Best Practices

### Progressive Improvement

- Don't require perfect scores immediately
- Track trend over time (improving vs declining)
- Focus on high-impact fixes first (complexity hotspots)
- Set project-specific thresholds

### Context Awareness

- Relax rules for test files
- Allow higher complexity in integration points
- Consider generated code exclusions
- Different standards for prototypes vs production

---

## Output Files

```
.context-kit/analysis/
├─ code-quality-report.html      # Interactive HTML report
├─ code-quality-summary.json     # Machine-readable results
├─ complexity-hotspots.csv       # Functions needing refactoring
├─ duplication-report.json       # Copy-paste violations
└─ quality-trend.json            # Historical tracking
```

---

## Related Agents

- **security-agent**: Security-focused code patterns
- **performance-agent**: Performance anti-patterns overlap
- **architecture-consistency-agent**: High-level design patterns
- **test-coverage-agent**: Test quality metrics

---

## References

- [Clean Code by Robert C. Martin](https://www.oreilly.com/library/view/clean-code-a/9780136083238/)
- [Refactoring by Martin Fowler](https://refactoring.com/)
- [Cognitive Complexity Paper](https://www.sonarsource.com/docs/CognitiveComplexity.pdf)
- [ESLint Rules](https://eslint.org/docs/rules/)
