# Documentation Review Agent - Technical Specification

## Overview

A Documentation Review Agent analyzes code documentation quality, completeness, and accuracy. It ensures APIs are properly documented, inline comments are helpful, README files are comprehensive, and documentation stays synchronized with code changes.

**Mission**: Maintain high-quality documentation that enables developers to understand, use, and contribute to the codebase effectively.

---

## Core Principles

- **Documentation as Code**: Treat docs with same rigor as production code
- **Self-Documenting Code First**: Clear code reduces documentation needs
- **User-Centric**: Documentation serves readers, not just writers
- **Keep It Fresh**: Outdated docs are worse than no docs

---

## Detection Strategies by Category

### 1. API Documentation Coverage

#### Patterns Detected

**Missing JSDoc/TSDoc**
```typescript
// ❌ Bad: No documentation
export function calculateTax(amount: number, rate: number): number {
  return amount * rate;
}

// ✅ Good: Comprehensive documentation
/**
 * Calculates tax amount based on subtotal and tax rate
 *
 * @param amount - Subtotal before tax in cents (e.g., 1000 = $10.00)
 * @param rate - Tax rate as decimal (e.g., 0.085 for 8.5%)
 * @returns Tax amount in cents
 * @throws {ValidationError} If amount is negative or rate is invalid
 *
 * @example
 * ```typescript
 * const tax = calculateTax(1000, 0.085); // Returns 85 ($0.85 tax)
 * ```
 */
export function calculateTax(amount: number, rate: number): number {
  if (amount < 0) throw new ValidationError('Amount cannot be negative');
  if (rate < 0 || rate > 1) throw new ValidationError('Invalid tax rate');
  return Math.round(amount * rate);
}
```

**Incomplete Documentation**
```typescript
// ❌ Bad: Missing parameter descriptions
/**
 * Process user payment
 */
export function processPayment(userId, amount, currency, metadata) {
  // Missing: What do these parameters mean? What values are valid?
}

// ✅ Good: Complete parameter documentation
/**
 * Process a payment for a user
 *
 * @param userId - Unique user identifier (UUID v4 format)
 * @param amount - Payment amount in smallest currency unit (cents for USD)
 * @param currency - ISO 4217 currency code (e.g., 'USD', 'EUR')
 * @param metadata - Optional payment metadata
 * @param metadata.orderId - Associated order ID
 * @param metadata.description - Payment description
 * @returns Promise resolving to transaction ID
 * @throws {InsufficientFundsError} If user balance insufficient
 * @throws {InvalidCurrencyError} If currency not supported
 */
export async function processPayment(
  userId: string,
  amount: number,
  currency: string,
  metadata?: { orderId?: string; description?: string }
): Promise<string> {
  // ...
}
```

**Missing Return Documentation**
```typescript
// ❌ Bad: Return value not explained
/**
 * Get user by ID
 */
function getUser(id: string) {
  return db.users.find(id);
}

// ✅ Good: Return value documented
/**
 * Retrieve user by ID
 *
 * @param id - User identifier
 * @returns User object if found, undefined if not found
 */
function getUser(id: string): User | undefined {
  return db.users.find(id);
}
```

#### Agent Actions

- `Grep` for exported functions/classes without JSDoc: `export (function|class)`
- Parse JSDoc/TSDoc comments
- Check for required tags:
  - `@param` for all parameters
  - `@returns` for non-void functions
  - `@throws` for functions that throw
  - `@example` for complex APIs
- Validate parameter descriptions are meaningful (not just type restating)
- Calculate API documentation coverage percentage

#### Coverage Metrics

```yaml
documentation_coverage:
  public_api: 100%    # All exported functions/classes
  internal_api: 75%   # Internal but complex functions
  private: 0%         # Private functions optional

required_tags:
  - '@param' for all parameters
  - '@returns' for non-void functions
  - '@throws' for error cases
  - '@example' for public APIs
  - '@deprecated' for deprecated APIs
```

---

### 2. Inline Comment Quality

#### Patterns Detected

**Obvious Comments**
```javascript
// ❌ Bad: Comments state the obvious
// Increment counter
counter++;

// Add 1 to i
i = i + 1;

// Loop through users
for (const user of users) {
  // ...
}
```

**Commented-Out Code**
```javascript
// ❌ Bad: Large blocks of commented code
function process() {
  return newImplementation();

  // const old = processOldWay();
  // if (old.isValid) {
  //   return old.transform();
  // }
  // ... 50 lines of dead code
}

// ✅ Good: Use version control, remove dead code
function process() {
  return newImplementation();
}
```

**Misleading Comments**
```javascript
// ❌ Bad: Comment doesn't match code
// Calculate sum of all numbers
const result = numbers.filter(n => n > 0);  // Actually filtering!

// ✅ Good: Comment matches code
// Filter positive numbers only
const positiveNumbers = numbers.filter(n => n > 0);
```

**Good Comments (Explain Why, Not What)**
```javascript
// ✅ Good: Explains rationale
// Use exponential backoff to avoid overwhelming the API server
// after failures. Start with 1s delay, double each retry up to 32s max.
const delay = Math.min(1000 * Math.pow(2, retryCount), 32000);

// ✅ Good: Explains workaround
// HACK: react-select doesn't update when options change dynamically
// Force re-render by changing key. Fixed in v5.0.0, remove after upgrade.
<Select key={optionsHash} options={options} />

// ✅ Good: Explains business logic
// Per payment processor requirements, we must store the last 4 digits
// of the card for chargebacks, but full card number must never be persisted.
const cardLast4 = card.number.slice(-4);
```

#### Agent Actions

- `Grep` for obvious comments (comment text matches nearby code)
- Detect large commented-out code blocks: `//.*\n(//.*\n){5,}`
- Find TODO/FIXME/HACK comments
- Check for outdated comments (references removed functions/variables)
- Validate comments add value beyond code itself

---

### 3. README Completeness

#### Essential README Sections

**Minimum Viable README**
```markdown
# Project Name

Brief description (1-2 sentences)

## Features
- Key feature 1
- Key feature 2

## Installation
```bash
npm install
```

## Usage
```javascript
// Basic usage example
```

## Configuration
Environment variables or config file format

## Development
```bash
npm run dev
```

## Testing
```bash
npm test
```

## License
MIT
```

**Advanced README**
```markdown
# Project Name

[![Build Status](badge)](link)
[![Coverage](badge)](link)

## Table of Contents
- [Features](#features)
- [Installation](#installation)
- [Quick Start](#quick-start)
- [Documentation](#documentation)
- [API Reference](#api-reference)
- [Contributing](#contributing)
- [Changelog](#changelog)
- [License](#license)

## Features
Detailed feature list with links to docs

## Quick Start
5-minute tutorial to get started

## Architecture
High-level architecture overview (link to detailed docs)

## API Reference
Link to full API documentation

## Contributing
How to contribute (link to CONTRIBUTING.md)

## Troubleshooting
Common issues and solutions

## License
Full license text or link
```

#### Agent Actions

- `Read` README.md file
- Check for required sections:
  - Title and description
  - Installation instructions
  - Usage examples
  - Configuration
  - Development setup
- Validate code examples are syntax-highlighted
- Check for dead links
- Verify badge URLs are valid
- Ensure quick start guide exists

---

### 4. Examples & Code Samples

#### Patterns Detected

**Missing Examples**
```typescript
// ❌ Bad: Complex API without examples
/**
 * Advanced query builder with filtering, sorting, pagination
 */
export class QueryBuilder {
  filter(conditions: FilterConditions): this;
  sort(field: string, direction: SortDirection): this;
  paginate(page: number, perPage: number): this;
  execute<T>(): Promise<QueryResult<T>>;
}

// ✅ Good: Include usage examples
/**
 * Advanced query builder with filtering, sorting, pagination
 *
 * @example
 * ```typescript
 * // Basic query
 * const users = await new QueryBuilder()
 *   .filter({ status: 'active' })
 *   .sort('createdAt', 'desc')
 *   .paginate(1, 20)
 *   .execute<User>();
 *
 * // Complex query
 * const results = await new QueryBuilder()
 *   .filter({
 *     age: { gt: 18 },
 *     country: { in: ['US', 'CA'] }
 *   })
 *   .sort('lastName', 'asc')
 *   .execute<User>();
 * ```
 */
export class QueryBuilder {
  // ...
}
```

**Outdated Examples**
```typescript
// ❌ Bad: Example uses deprecated API
/**
 * @example
 * ```typescript
 * // Uses old API that no longer exists
 * const user = getUserSync(id);  // ❌ This function was removed!
 * ```
 */
export async function getUser(id: string): Promise<User> {
  // ...
}
```

#### Agent Actions

- Check for `@example` tags in public API documentation
- Parse code examples and validate syntax
- Cross-reference examples with actual API
- Detect usage of deprecated functions in examples
- Ensure examples are runnable (not pseudocode unless noted)

---

### 5. Type Documentation (TypeScript)

#### Patterns Detected

**Missing Interface Documentation**
```typescript
// ❌ Bad: Complex interface without documentation
export interface PaymentConfig {
  provider: string;
  apiKey: string;
  webhookSecret: string;
  retryAttempts: number;
  timeout: number;
}

// ✅ Good: Documented interface
/**
 * Configuration for payment processing
 */
export interface PaymentConfig {
  /** Payment provider name (e.g., 'stripe', 'paypal') */
  provider: string;

  /** API key for authentication (from provider dashboard) */
  apiKey: string;

  /** Webhook secret for signature verification */
  webhookSecret: string;

  /** Number of retry attempts on failure (recommended: 3) */
  retryAttempts: number;

  /** Request timeout in milliseconds (default: 30000) */
  timeout: number;
}
```

**Union Type Without Explanation**
```typescript
// ❌ Bad: Complex union without context
export type Status = 'pending' | 'processing' | 'completed' |
                     'failed' | 'cancelled' | 'refunded';

// ✅ Good: Documented with valid states
/**
 * Order status lifecycle
 *
 * State transitions:
 * - pending → processing → completed
 * - processing → failed
 * - completed → refunded
 * - Any state → cancelled
 */
export type Status =
  | 'pending'      // Order created, awaiting payment
  | 'processing'   // Payment received, fulfilling order
  | 'completed'    // Order fulfilled successfully
  | 'failed'       // Payment or fulfillment failed
  | 'cancelled'    // Order cancelled by user or system
  | 'refunded';    // Order refunded after completion
```

#### Agent Actions

- `Grep` for exported types/interfaces without documentation
- Check complex types (unions, intersections) have explanations
- Validate enum values are documented
- Ensure generic type parameters are explained

---

### 6. Changelog Maintenance

#### Patterns Detected

**Missing Changelog**
```
❌ Bad: No CHANGELOG.md file exists
```

**Incomplete Changelog**
```markdown
# Changelog

## [2.0.0] - 2024-01-15
- Updated dependencies
- Bug fixes

❌ Bad: Vague, non-actionable entries
```

**Good Changelog**
```markdown
# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [2.0.0] - 2024-01-15

### Added
- New `batchUpdate()` method for bulk operations (#234)
- TypeScript strict mode support (#245)

### Changed
- **BREAKING**: `getUser()` now returns Promise instead of sync (#256)
  - Migration: Change `const user = getUser(id)` to `const user = await getUser(id)`
- Improved error messages with actionable details (#267)

### Deprecated
- `getUserSync()` - Use async `getUser()` instead (will be removed in v3.0.0)

### Removed
- **BREAKING**: Removed deprecated `oldAPI()` method (#278)

### Fixed
- Race condition in concurrent updates (#289)
- Memory leak in WebSocket connections (#290)

### Security
- Updated dependencies to patch CVE-2024-1234 (#291)
```

#### Agent Actions

- Check if CHANGELOG.md exists
- Validate follows Keep a Changelog format
- Check for unreleased changes section
- Ensure breaking changes are clearly marked
- Verify version numbers match git tags
- Check PR/issue references are valid

---

### 7. Architectural Documentation

#### Patterns Detected

**Missing Architecture Docs**
```
❌ Bad: No docs/ directory or ARCHITECTURE.md
```

**Good Architecture Documentation**
```
docs/
├── ARCHITECTURE.md          # High-level overview
├── diagrams/
│   ├── system-context.png   # C4 Level 1
│   ├── containers.png       # C4 Level 2
│   └── components.png       # C4 Level 3
├── decisions/
│   ├── 001-use-postgres.md  # ADRs
│   ├── 002-event-sourcing.md
│   └── README.md
└── guides/
    ├── database-migrations.md
    ├── adding-new-api.md
    └── testing-strategy.md
```

**ARCHITECTURE.md Template**
```markdown
# Architecture

## Overview
High-level description of system purpose and design

## System Context
Who uses the system? What are external dependencies?

## Containers
What services/applications make up the system?

## Technology Stack
- Frontend: React 18 + TypeScript
- Backend: Node.js + Express
- Database: PostgreSQL
- Cache: Redis

## Design Principles
- Event-driven architecture
- CQRS for read/write separation
- DDD bounded contexts

## Data Flow
How does data move through the system?

## Security
Authentication, authorization, data protection strategies

## Scalability
How does the system scale?

## Deployment
CI/CD pipeline, infrastructure overview
```

#### Agent Actions

- Check for ARCHITECTURE.md or docs/architecture/
- Verify ADR (Architecture Decision Records) directory
- Check for diagrams (C4, sequence, component)
- Validate design principles documented
- Ensure technology stack is listed

---

### 8. Contributing Guidelines

#### Patterns Detected

**Missing CONTRIBUTING.md**
```markdown
# Contributing

## Development Setup
```bash
git clone repo
npm install
npm run dev
```

## Code Style
- Follow ESLint rules
- Run `npm run lint` before committing
- Use Prettier for formatting

## Testing
- Write tests for new features
- Maintain >80% coverage
- Run `npm test` before submitting PR

## Pull Request Process
1. Create feature branch from `main`
2. Make changes with clear commit messages
3. Update tests and documentation
4. Submit PR with description of changes
5. Address review feedback
6. Squash commits before merge

## Commit Message Format
```
type(scope): short description

- Bullet points for detailed changes

Closes #123
```

Types: feat, fix, docs, style, refactor, test, chore
```

#### Agent Actions

- Check if CONTRIBUTING.md exists
- Verify setup instructions present
- Check for code style guidelines
- Ensure PR process documented
- Validate commit message format specified

---

## Tool Usage Pattern

```
Phase 1: API Documentation Analysis (Fast)
├─ Grep: Find exported functions/classes
├─ Read: Parse JSDoc/TSDoc comments
├─ Validate: Check for required tags
└─ Output: API documentation coverage

Phase 2: Inline Comment Quality (Fast)
├─ Grep: Find TODO/FIXME/commented code
├─ Analyze: Comment usefulness
├─ Detect: Misleading or outdated comments
└─ Output: Comment quality issues

Phase 3: Documentation Files (Fast)
├─ Read: README.md, CHANGELOG.md, CONTRIBUTING.md
├─ Validate: Required sections present
├─ Check: Dead links, outdated info
└─ Output: Documentation completeness

Phase 4: Example Validation (Medium)
├─ Parse: Code examples from docs
├─ Validate: Syntax and API correctness
├─ Cross-reference: With actual implementation
└─ Output: Example quality report

Phase 5: Architecture Docs (Fast)
├─ Check: docs/ directory structure
├─ Validate: ADRs, diagrams, guides
└─ Output: Architecture documentation status
```

---

## Scoring System

### Documentation Score (0-100)

```
Score = (0.4 × api_coverage)
      + (0.2 × comment_quality)
      + (0.2 × readme_completeness)
      + (0.1 × changelog_quality)
      + (0.1 × architecture_docs)

Thresholds:
90-100: Excellent
75-89:  Good
60-74:  Adequate
<60:    Poor
```

### Coverage Metrics

```yaml
api_documentation_coverage:
  public_api: # Exported functions/classes
    required: 95%
    current: 87%  # ⚠️ Below threshold

  complex_functions: # Cyclomatic complexity >5
    required: 100%
    current: 92%

  types_interfaces:
    required: 80%
    current: 75%  # ⚠️ Below threshold
```

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
    <h1>Documentation Review Report</h1>
    <div class="score-badge good">81/100</div>
    <div class="coverage-metrics">
      <div class="metric">
        <h3>API Documentation</h3>
        <div class="progress-bar" style="width: 87%">87%</div>
      </div>
      <div class="metric">
        <h3>README Completeness</h3>
        <div class="progress-bar" style="width: 92%">92%</div>
      </div>
      <div class="metric">
        <h3>Comment Quality</h3>
        <div class="progress-bar" style="width: 74%">74%</div>
      </div>
    </div>
    <div class="quick-stats">
      <p>Documented APIs: <strong>87/100</strong></p>
      <p>Missing Examples: <strong>23</strong></p>
      <p>TODO Comments: <strong>47</strong></p>
      <p>Outdated Examples: <strong>5</strong></p>
    </div>
  </section>

  <section class="undocumented-apis">
    <h2>📝 Undocumented APIs</h2>
    <p><strong>13 public APIs</strong> missing documentation</p>

    <details>
      <summary>src/api/payments.ts</summary>
      <div class="api-list">
        <div class="undocumented-api">
          <p><strong>Line 45:</strong> <code>processRefund(transactionId, amount)</code></p>
          <p class="severity">Severity: <span class="badge critical">High</span> (Public API)</p>

          <pre><code class="language-typescript">
// Current (❌)
export async function processRefund(transactionId, amount) {
  // ...
}

// Suggested (✅)
/**
 * Process a refund for a completed transaction
 *
 * @param transactionId - Unique transaction identifier
 * @param amount - Refund amount in cents (must not exceed original transaction)
 * @returns Promise resolving to refund confirmation
 * @throws {TransactionNotFoundError} If transaction doesn't exist
 * @throws {InvalidRefundError} If refund amount exceeds transaction amount
 * @throws {RefundFailedError} If payment processor rejects refund
 *
 * @example
 * ```typescript
 * const refund = await processRefund('txn_123', 1000); // Refund $10.00
 * ```
 */
export async function processRefund(
  transactionId: string,
  amount: number
): Promise<RefundConfirmation> {
  // ...
}
          </code></pre>
        </div>
      </div>
    </details>
  </section>

  <section class="comment-issues">
    <h2>💬 Comment Quality Issues</h2>

    <h3>Commented-Out Code (12 instances)</h3>
    <ul>
      <li>src/utils/helpers.ts:67-89 (23 lines of dead code)</li>
      <li>src/components/Form.tsx:145-167 (23 lines of dead code)</li>
    </ul>

    <h3>TODO/FIXME Audit (47 items)</h3>
    <details>
      <summary>View all TODOs</summary>
      <ul>
        <li><strong>src/api/users.ts:34</strong> - TODO: Add caching</li>
        <li><strong>src/utils/data.ts:89</strong> - FIXME: Memory leak with large datasets</li>
        <li><strong>src/services/email.ts:12</strong> - HACK: Temporary workaround for smtp bug</li>
      </ul>
    </details>

    <h3>Misleading Comments (3 instances)</h3>
    <ul>
      <li>
        <strong>src/utils/calc.ts:23</strong>
        <p>Comment says "Calculate sum" but code filters array</p>
      </li>
    </ul>
  </section>

  <section class="readme-check">
    <h2>📄 README Completeness</h2>
    <table>
      <tr>
        <td>✅ Title and description</td>
        <td>Present</td>
      </tr>
      <tr>
        <td>✅ Installation instructions</td>
        <td>Present</td>
      </tr>
      <tr>
        <td>✅ Usage examples</td>
        <td>Present</td>
      </tr>
      <tr>
        <td>✅ Development setup</td>
        <td>Present</td>
      </tr>
      <tr>
        <td>⚠️ Troubleshooting section</td>
        <td>Missing (recommended)</td>
      </tr>
      <tr>
        <td>❌ Architecture overview</td>
        <td>Missing (link to ARCHITECTURE.md)</td>
      </tr>
    </table>
  </section>

  <section class="examples-validation">
    <h2>📚 Code Examples</h2>
    <p>✅ 78 examples found in documentation</p>
    <p>⚠️ 5 examples use outdated API</p>

    <h3>Outdated Examples</h3>
    <ul>
      <li>
        <strong>src/api/users.ts:23</strong> (@example tag)
        <p>Uses deprecated <code>getUserSync()</code> - update to <code>await getUser()</code></p>
      </li>
    </ul>
  </section>

  <section class="changelog">
    <h2>📋 Changelog</h2>
    <p>✅ CHANGELOG.md exists</p>
    <p>✅ Follows Keep a Changelog format</p>
    <p>⚠️ 23 merged PRs since last changelog entry</p>

    <div class="recommendation">
      <h4>Recommendation</h4>
      <p>Update CHANGELOG.md with recent changes from PRs #234-#256</p>
    </div>
  </section>

  <section class="architecture">
    <h2>🏗️ Architecture Documentation</h2>
    <p>⚠️ Limited architecture documentation found</p>

    <table>
      <tr>
        <td>❌ ARCHITECTURE.md</td>
        <td>Missing</td>
      </tr>
      <tr>
        <td>❌ Architecture Decision Records (ADRs)</td>
        <td>Missing</td>
      </tr>
      <tr>
        <td>✅ Contributing Guidelines</td>
        <td>CONTRIBUTING.md present</td>
      </tr>
    </table>

    <div class="recommendation">
      <h4>Recommended</h4>
      <p>Create ARCHITECTURE.md with system overview, design principles, and technology stack</p>
    </div>
  </section>

  <section class="recommendations">
    <h2>💡 Priority Recommendations</h2>
    <ol>
      <li><strong>High Priority:</strong> Document 13 public APIs (87% → 100% coverage)</li>
      <li><strong>Medium Priority:</strong> Remove 12 blocks of commented-out code</li>
      <li><strong>Medium Priority:</strong> Update 5 outdated code examples</li>
      <li><strong>Low Priority:</strong> Create ARCHITECTURE.md for system overview</li>
      <li><strong>Low Priority:</strong> Review and resolve 47 TODO comments</li>
    </ol>
  </section>

  <section class="trend">
    <h2>📈 Documentation Trend</h2>
    <p><em>Compared to previous analysis:</em></p>
    <ul>
      <li>API Coverage: 82% → 87% (+5%) ✅</li>
      <li>README Score: 85% → 92% (+7%) ✅</li>
      <li>TODO Count: 52 → 47 (-5) ✅</li>
      <li>Commented Code: 18 → 12 (-6 blocks) ✅</li>
    </ul>
  </section>
</body>
</html>
```

---

## Integration with Orchestration System

### Dependency Chain

```
Phase 1: documentation-agent (INDEPENDENT or after react-component-analyzer)
         └─ Can leverage component knowledge for documentation validation

Phase 2: validation-agent
         └─ Validates documentation improvements
```

### Execution Time

**~1-2 minutes** for medium codebase

### Configuration

```yaml
agents:
  documentation-agent:
    priority: 3
    dependencies: []
    timeout: 120s
    retry: 2
    thresholds:
      api_coverage: 90
      readme_score: 85
      examples_required: true
    check_links: true
    validate_examples: true
```

---

## Best Practices

### Documentation Debt

- Track documentation coverage over time
- Require docs for new public APIs (enforce in PR reviews)
- Periodic documentation sprints to catch up
- Use linters to enforce JSDoc on exports

### Documentation as Tests

- Include examples in automated tests (doctest pattern)
- Validate examples compile and run
- Catch outdated docs early

### Progressive Documentation

- Start with high-level README
- Add API docs for public interfaces first
- Expand to architecture docs as system matures
- Keep documentation close to code (co-location)

---

## Output Files

```
.context-kit/analysis/
├─ documentation-report.html     # Interactive HTML report
├─ documentation-summary.json    # Machine-readable results
├─ undocumented-apis.csv         # APIs needing documentation
├─ todo-audit.json               # TODO/FIXME tracking
└─ example-validation.json       # Code example validation results
```

---

## Related Agents

- **code-quality-agent**: Comment quality overlaps
- **architecture-consistency-agent**: Architecture documentation
- **test-coverage-agent**: Test documentation patterns

---

## References

- [JSDoc](https://jsdoc.app/)
- [TSDoc](https://tsdoc.org/)
- [Keep a Changelog](https://keepachangelog.com/)
- [Architecture Decision Records](https://adr.github.io/)
- [Docs as Code](https://www.writethedocs.org/guide/docs-as-code/)
