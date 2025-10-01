# Test Coverage Review Agent - Technical Specification

## Overview

A Test Coverage Review Agent analyzes test suite quality, coverage metrics, and testing best practices. It ensures comprehensive test coverage, identifies untested code paths, detects flaky tests, and validates test quality standards.

**Mission**: Ensure robust test coverage that prevents regressions and builds confidence in code changes.

---

## Core Principles

- **Coverage is Necessary but Not Sufficient**: High coverage doesn't guarantee quality tests
- **Test Pyramid**: Balance unit, integration, and e2e tests appropriately
- **Fast Feedback**: Prioritize fast, reliable tests
- **Maintainability**: Tests should be readable and maintainable like production code

---

## Detection Strategies by Category

### 1. Coverage Metrics Analysis

#### Code Coverage Types

**Line Coverage**
```javascript
// Example: 2/3 lines covered (66%)
function divide(a, b) {
  if (b === 0) return 0;  // ✅ Covered
  return a / b;            // ✅ Covered
  // ❌ Missing: Test for edge case when b = 0 returns 0
}

// Test
test('divide numbers', () => {
  expect(divide(10, 2)).toBe(5);  // Only covers happy path
});
```

**Branch Coverage**
```javascript
// Example: 1/2 branches covered (50%)
function getUserStatus(user) {
  if (user.isPremium) {     // ✅ True branch covered
    return 'premium';
  } else {
    return 'free';          // ❌ False branch not covered
  }
}

// Test
test('premium user', () => {
  expect(getUserStatus({ isPremium: true })).toBe('premium');
  // Missing: Test for non-premium user
});
```

**Function Coverage**
```javascript
// Module with 3 functions, 2 tested (66%)
export function add(a, b) { return a + b; }       // ✅ Tested
export function subtract(a, b) { return a - b; }  // ✅ Tested
export function multiply(a, b) { return a * b; }  // ❌ Not tested
```

**Statement Coverage**
```javascript
// Example: All statements executed, but logic flawed
function isEven(n) {
  const result = n % 2 === 0;  // ✅ Executed
  return result;               // ✅ Executed
}

// Test (achieves 100% coverage but doesn't test odd numbers!)
test('even number', () => {
  expect(isEven(2)).toBe(true);
});
```

#### Agent Actions

- `Bash` runs coverage tools:
  - JavaScript: `jest --coverage --json`
  - TypeScript: `vitest --coverage --reporter=json`
  - Python: `pytest --cov --cov-report=json`
- Parse coverage JSON output
- Calculate coverage percentages by type (line, branch, function, statement)
- Identify uncovered code paths
- Generate coverage heat map

#### Coverage Thresholds

```yaml
coverage_requirements:
  critical:
    line: 90%
    branch: 85%
    function: 90%
  warning:
    line: 75%
    branch: 70%
    function: 80%
  files:
    utils/: 95%     # Core utilities require higher coverage
    api/: 85%       # API handlers
    components/: 70% # UI components (harder to test)
```

---

### 2. Uncovered Code Detection

#### Patterns Detected

**Untested Error Handlers**
```javascript
// ❌ Warning: Error path not tested
async function fetchUser(id) {
  try {
    const response = await api.get(`/users/${id}`);
    return response.data;  // ✅ Covered
  } catch (error) {
    logError(error);       // ❌ Not covered
    throw error;           // ❌ Not covered
  }
}

// Tests only cover success case
test('fetches user', async () => {
  mockApi.get.mockResolvedValue({ data: { id: 1 } });
  await fetchUser(1);
});
```

**Untested Edge Cases**
```javascript
// ❌ Warning: Edge cases not tested
function calculateDiscount(price, quantity) {
  if (quantity > 10) return price * 0.9;   // ✅ Covered
  if (quantity > 5) return price * 0.95;   // ❌ Not covered
  return price;                             // ✅ Covered
}

// Tests
test('bulk discount', () => {
  expect(calculateDiscount(100, 15)).toBe(90);  // Covers >10
});

test('regular price', () => {
  expect(calculateDiscount(100, 2)).toBe(100);  // Covers default
});
// Missing: Test for 6-10 quantity range
```

**Untested Integration Points**
```typescript
// ❌ Warning: Database integration not tested
class UserRepository {
  async save(user: User) {
    return this.db.insert('users', user);  // ❌ Not tested with real DB
  }
}

// Only unit tests with mocks exist
test('saves user', async () => {
  const mockDb = { insert: jest.fn() };
  const repo = new UserRepository(mockDb);
  await repo.save({ id: 1 });
  expect(mockDb.insert).toHaveBeenCalled();
});
// Missing: Integration test with actual database
```

#### Agent Actions

- Parse coverage reports to identify uncovered lines
- `Read` source files to understand uncovered code context
- Classify uncovered code:
  - Error handlers
  - Edge cases
  - Boundary conditions
  - Integration points
- Cross-reference with test files
- Generate prioritized uncovered code report

---

### 3. Test Quality Assessment

#### Test Smells

**Empty Tests**
```javascript
// ❌ Bad: Test that doesn't assert anything
test('processes payment', () => {
  processPayment(100, 'USD');
  // No assertion! Test always passes
});

// ✅ Good: Proper assertion
test('processes payment', async () => {
  const result = await processPayment(100, 'USD');
  expect(result.status).toBe('success');
  expect(result.transactionId).toBeDefined();
});
```

**Testing Implementation, Not Behavior**
```javascript
// ❌ Bad: Testing internal implementation
test('button click', () => {
  const button = render(<Button />);
  button.find('button').prop('onClick')();  // Testing internals
  expect(button.state.clicked).toBe(true);  // Checking internal state
});

// ✅ Good: Testing user behavior
test('button click', () => {
  const onClick = jest.fn();
  const { getByRole } = render(<Button onClick={onClick} />);
  fireEvent.click(getByRole('button'));
  expect(onClick).toHaveBeenCalled();
});
```

**Fragile Selectors**
```javascript
// ❌ Bad: Brittle CSS selectors
const button = wrapper.find('.btn.btn-primary.submit-button');

// ✅ Good: Semantic selectors
const button = getByRole('button', { name: /submit/i });
```

**Test Interdependence**
```javascript
// ❌ Bad: Tests depend on execution order
let userId;

test('creates user', () => {
  userId = createUser({ name: 'John' });  // Sets global state
});

test('updates user', () => {
  updateUser(userId, { name: 'Jane' });  // Depends on previous test!
});

// ✅ Good: Independent tests
test('updates user', () => {
  const userId = createUser({ name: 'John' });  // Self-contained
  updateUser(userId, { name: 'Jane' });
  expect(getUser(userId).name).toBe('Jane');
});
```

**Magic Numbers in Tests**
```javascript
// ❌ Bad: Unclear magic numbers
expect(calculateTax(100)).toBe(8.5);

// ✅ Good: Named constants with explanation
const SUBTOTAL = 100;
const TAX_RATE = 0.085;
const EXPECTED_TAX = SUBTOTAL * TAX_RATE;

expect(calculateTax(SUBTOTAL)).toBe(EXPECTED_TAX);
```

#### Agent Actions

- `Grep` for tests without assertions: `test\(.*\{[^}]*\}` without `expect`
- Detect tests accessing private/internal APIs
- Check for global state manipulation
- Validate test isolation
- Identify tests with unclear naming

---

### 4. Test Pyramid Compliance

#### Optimal Distribution

```
        /\
       /e2e\      5-10%  (Slow, expensive, end-to-end)
      /------\
     / Integ  \   15-25% (Medium speed, API/DB integration)
    /----------\
   /   Unit     \ 65-80% (Fast, isolated, comprehensive)
  /--------------\
```

**Anti-Pattern: Ice Cream Cone**
```
        /\
       /Unit\      10%   ❌ Too few unit tests
      /------\
     / Integ  \   20%   ❌ Disproportionate integration
    /----------\
   /    e2e     \ 70%   ❌ Too many slow e2e tests
  /--------------\
```

#### Agent Actions

- Count tests by type (unit, integration, e2e)
- Measure average test execution time by type
- Calculate test pyramid ratios
- Identify pyramid anti-patterns
- Recommend rebalancing

#### Detection Heuristics

```javascript
// Classify tests by characteristics
function classifyTest(testFile, testContent) {
  if (testContent.includes('page.goto') || testContent.includes('cy.visit')) {
    return 'e2e';  // Playwright/Cypress
  }
  if (testContent.includes('supertest') || testContent.includes('testcontainers')) {
    return 'integration';  // API or DB tests
  }
  return 'unit';  // Default to unit tests
}
```

---

### 5. Flaky Test Detection

#### Patterns Detected

**Time-Dependent Tests**
```javascript
// ❌ Flaky: Depends on current date
test('user age', () => {
  const user = new User({ birthYear: 1990 });
  expect(user.age).toBe(34);  // Fails in 2026!
});

// ✅ Fixed: Mock time
test('user age', () => {
  jest.useFakeTimers().setSystemTime(new Date('2024-01-01'));
  const user = new User({ birthYear: 1990 });
  expect(user.age).toBe(34);
});
```

**Timing Issues**
```javascript
// ❌ Flaky: Race condition
test('async operation', async () => {
  triggerAsync();
  await delay(100);  // Arbitrary delay
  expect(result).toBe('done');  // May fail if slow
});

// ✅ Fixed: Wait for condition
test('async operation', async () => {
  await triggerAsync();
  await waitFor(() => expect(result).toBe('done'));
});
```

**Random Data in Tests**
```javascript
// ❌ Flaky: Random can cause failures
test('sorts numbers', () => {
  const numbers = generateRandomNumbers();  // Unpredictable
  const sorted = sort(numbers);
  expect(sorted[0]).toBeLessThan(sorted[1]);  // May fail!
});

// ✅ Fixed: Deterministic data
test('sorts numbers', () => {
  const numbers = [5, 2, 8, 1];
  const sorted = sort(numbers);
  expect(sorted).toEqual([1, 2, 5, 8]);
});
```

#### Agent Actions

- Analyze test history for flakiness patterns
- `Grep` for time-dependent functions: `Date.now()`, `new Date()`
- Detect arbitrary `setTimeout`/`delay` calls
- Check for random data generation in tests
- Identify tests with inconsistent pass/fail rates

---

### 6. Test Performance

#### Slow Tests

**Identifying Bottlenecks**
```
Test Suite Analysis:
- Total tests: 2,847
- Total time: 4m 32s
- Average: 95ms/test

Slow Tests (>1s):
1. E2E: Checkout flow - 8.2s
2. Integration: Full user sync - 4.7s
3. Integration: Email sending - 3.1s
4. Unit: Complex calculation - 1.2s ⚠️ Unexpected!
```

**Parallel Execution**
```bash
# ❌ Slow: Sequential execution
jest --runInBand  # 4m 32s

# ✅ Fast: Parallel execution
jest --maxWorkers=4  # 1m 15s
```

#### Agent Actions

- Parse test execution times from test runner output
- Identify tests exceeding thresholds:
  - Unit: >500ms
  - Integration: >5s
  - E2E: >30s
- Calculate p95/p99 test duration
- Recommend parallelization strategies
- Detect database/network calls in unit tests

---

### 7. Missing Test Categories

#### Patterns Detected

**No Edge Case Tests**
```javascript
// Function handles edge cases
function divide(a, b) {
  if (b === 0) throw new Error('Division by zero');
  if (!Number.isFinite(a) || !Number.isFinite(b)) {
    throw new Error('Invalid numbers');
  }
  return a / b;
}

// ❌ Only happy path tested
test('divides numbers', () => {
  expect(divide(10, 2)).toBe(5);
});

// ✅ Comprehensive tests needed
describe('divide', () => {
  test('divides positive numbers', () => {
    expect(divide(10, 2)).toBe(5);
  });

  test('throws on division by zero', () => {
    expect(() => divide(10, 0)).toThrow('Division by zero');
  });

  test('throws on infinity', () => {
    expect(() => divide(Infinity, 2)).toThrow('Invalid numbers');
  });

  test('throws on NaN', () => {
    expect(() => divide(NaN, 2)).toThrow('Invalid numbers');
  });
});
```

**No Error Path Tests**
```javascript
// ❌ Missing: Tests for failure scenarios
async function createUser(data) {
  if (!data.email) throw new ValidationError('Email required');
  if (await userExists(data.email)) throw new ConflictError('User exists');
  return db.users.create(data);
}

// Only tests success path
test('creates user', async () => {
  const user = await createUser({ email: 'test@test.com' });
  expect(user).toBeDefined();
});

// Missing tests:
// - ValidationError when email missing
// - ConflictError when user exists
// - Database errors
```

#### Agent Actions

- Analyze functions with error handling
- Check if error paths have corresponding tests
- Identify boundary conditions without tests
- Detect validation logic without negative tests
- Generate missing test recommendations

---

## Tool Usage Pattern

```
Phase 1: Coverage Collection (Medium Speed)
├─ Bash: Run test suite with coverage
├─ Parse: Coverage report (JSON/LCOV)
├─ Calculate: Coverage metrics by file/function
└─ Output: Coverage statistics

Phase 2: Test Quality Analysis (Fast)
├─ Read: Test files
├─ Grep: Test patterns and smells
├─ Analyze: Test structure and assertions
└─ Output: Test quality issues

Phase 3: Test Classification (Fast)
├─ Read: Test file paths and content
├─ Classify: Unit vs Integration vs E2E
├─ Measure: Test execution times
└─ Output: Test pyramid analysis

Phase 4: Flaky Test Detection (Requires History)
├─ Read: Test execution history
├─ Calculate: Pass/fail rates per test
├─ Identify: Timing dependencies
└─ Output: Flaky test report

Phase 5: Gap Analysis (Medium)
├─ Cross-reference: Source code vs tests
├─ Identify: Untested functions/branches
├─ Prioritize: Critical untested code
└─ Output: Coverage gap recommendations
```

---

## Scoring System

### Test Coverage Score (0-100)

```
Coverage Score = (0.3 × line_coverage)
               + (0.3 × branch_coverage)
               + (0.2 × test_quality)
               + (0.1 × pyramid_compliance)
               + (0.1 × performance)

Thresholds:
90-100: Excellent
75-89:  Good
60-74:  Adequate
<60:    Insufficient
```

### Quality Deductions

- **Empty tests**: -5 pts each
- **Flaky tests**: -10 pts each
- **No error path tests**: -3 pts per function
- **Inverted test pyramid**: -20 pts

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
    <h1>Test Coverage Review Report</h1>
    <div class="score-badge good">84/100</div>
    <div class="coverage-metrics">
      <div class="metric">
        <h3>Line Coverage</h3>
        <div class="progress-bar" style="width: 87%">87%</div>
      </div>
      <div class="metric">
        <h3>Branch Coverage</h3>
        <div class="progress-bar" style="width: 79%">79%</div>
      </div>
      <div class="metric">
        <h3>Function Coverage</h3>
        <div class="progress-bar" style="width: 92%">92%</div>
      </div>
    </div>
    <div class="test-stats">
      <p>Total Tests: <strong>2,847</strong></p>
      <p>Test Suites: <strong>247</strong></p>
      <p>Execution Time: <strong>1m 15s</strong></p>
      <p>Flaky Tests: <strong>3</strong></p>
    </div>
  </section>

  <section class="coverage-gaps">
    <h2>📉 Critical Coverage Gaps</h2>
    <table>
      <thead>
        <tr>
          <th>File</th>
          <th>Line Coverage</th>
          <th>Branch Coverage</th>
          <th>Uncovered Lines</th>
          <th>Priority</th>
        </tr>
      </thead>
      <tbody>
        <tr class="critical">
          <td>src/services/payment.ts</td>
          <td>45%</td>
          <td>30%</td>
          <td>67-89, 102-145</td>
          <td><span class="badge critical">High</span></td>
        </tr>
        <tr class="warning">
          <td>src/utils/validation.ts</td>
          <td>68%</td>
          <td>55%</td>
          <td>23-34, 78-82</td>
          <td><span class="badge warning">Medium</span></td>
        </tr>
      </tbody>
    </table>

    <details>
      <summary>Uncovered Code: src/services/payment.ts:67-89</summary>
      <div class="coverage-detail">
        <pre><code class="language-typescript">
67  async function processRefund(transactionId, amount) {
68    try {
69 ❌   const transaction = await getTransaction(transactionId);
70 ❌   if (transaction.status !== 'completed') {
71 ❌     throw new Error('Cannot refund incomplete transaction');
72 ❌   }
73 ❌   const refund = await stripe.refunds.create({
74 ❌     charge: transaction.chargeId,
75 ❌     amount: amount
76 ❌   });
77 ❌   return refund;
78    } catch (error) {
79 ❌   logError('Refund failed', error);
80 ❌   throw error;
81    }
82  }
        </code></pre>

        <div class="recommendation">
          <h4>Recommended Tests</h4>
          <ul>
            <li>Test successful refund processing</li>
            <li>Test refund of incomplete transaction (error case)</li>
            <li>Test Stripe API error handling</li>
            <li>Test invalid transaction ID</li>
          </ul>
        </div>
      </div>
    </details>
  </section>

  <section class="test-pyramid">
    <h2>🔺 Test Pyramid Analysis</h2>
    <div class="pyramid-visual">
      <svg><!-- Pyramid visualization --></svg>
    </div>
    <table>
      <tr>
        <td>E2E Tests</td>
        <td>142 tests (5%)</td>
        <td>avg 4.2s</td>
        <td>✅ Optimal</td>
      </tr>
      <tr>
        <td>Integration Tests</td>
        <td>512 tests (18%)</td>
        <td>avg 850ms</td>
        <td>✅ Good</td>
      </tr>
      <tr>
        <td>Unit Tests</td>
        <td>2,193 tests (77%)</td>
        <td>avg 45ms</td>
        <td>✅ Excellent</td>
      </tr>
    </table>
  </section>

  <section class="test-quality">
    <h2>🏆 Test Quality Issues</h2>
    <ul>
      <li class="warning">
        <strong>5 tests without assertions</strong>
        <p>src/api/users.test.ts:45, 67, 89</p>
        <p>src/services/email.test.ts:23, 34</p>
      </li>
      <li class="warning">
        <strong>12 tests with magic numbers</strong>
        <p>Use named constants for better readability</p>
      </li>
      <li class="suggestion">
        <strong>23 tests longer than 50 lines</strong>
        <p>Consider breaking into smaller test cases</p>
      </li>
    </ul>
  </section>

  <section class="flaky-tests">
    <h2>⚠️ Flaky Tests</h2>
    <p>3 tests with inconsistent results detected</p>

    <details>
      <summary>Flaky: User session timeout test</summary>
      <div class="flaky-detail">
        <p><strong>File:</strong> src/auth/session.test.ts:67</p>
        <p><strong>Failure Rate:</strong> 15% (3/20 runs failed)</p>
        <p><strong>Root Cause:</strong> Time-dependent assertion</p>

        <pre><code class="language-typescript">
// Current (Flaky)
test('session expires after 1 hour', async () => {
  const session = createSession();
  await delay(3600000);  // ❌ Actual 1 hour wait!
  expect(session.isExpired()).toBe(true);
});

// Fixed (Reliable)
test('session expires after 1 hour', () => {
  jest.useFakeTimers();
  const session = createSession();
  jest.advanceTimersByTime(3600000);
  expect(session.isExpired()).toBe(true);
  jest.useRealTimers();
});
        </code></pre>
      </div>
    </details>
  </section>

  <section class="slow-tests">
    <h2>🐌 Slow Tests (>1s)</h2>
    <table>
      <thead>
        <tr>
          <th>Test</th>
          <th>Duration</th>
          <th>Recommendation</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td>E2E: Complete checkout flow</td>
          <td>8.2s</td>
          <td>✅ Expected for E2E</td>
        </tr>
        <tr>
          <td>Unit: Complex calculation</td>
          <td>1.2s</td>
          <td>⚠️ Too slow for unit test - check for network calls</td>
        </tr>
      </tbody>
    </table>
  </section>

  <section class="recommendations">
    <h2>💡 Priority Recommendations</h2>
    <ol>
      <li><strong>Critical:</strong> Add tests for payment service (currently 45% coverage)</li>
      <li><strong>High:</strong> Fix 3 flaky tests (causing CI pipeline failures)</li>
      <li><strong>Medium:</strong> Add assertions to 5 empty tests</li>
      <li><strong>Low:</strong> Improve test naming for clarity (23 tests with generic names)</li>
    </ol>
  </section>

  <section class="trend">
    <h2>📈 Coverage Trend</h2>
    <p><em>Compared to previous run:</em></p>
    <ul>
      <li>Line Coverage: 84% → 87% (+3%) ✅</li>
      <li>Branch Coverage: 76% → 79% (+3%) ✅</li>
      <li>Test Count: 2,785 → 2,847 (+62) ✅</li>
      <li>Flaky Tests: 5 → 3 (-2) ✅</li>
    </ul>
  </section>
</body>
</html>
```

---

## Integration with Orchestration System

### Dependency Chain

```
Phase 1: test-coverage-agent (INDEPENDENT)
         └─ Runs test suite and analyzes results

Phase 2: validation-agent
         └─ Validates coverage improvements
```

### Execution Time

**Variable** - Depends on test suite size:
- Small (<500 tests): 30s-1m
- Medium (500-2000 tests): 1-3m
- Large (>2000 tests): 3-10m

### Configuration

```yaml
agents:
  test-coverage-agent:
    priority: 3
    dependencies: []
    timeout: 600s  # Allow time for full test suite
    retry: 1
    thresholds:
      line: 80
      branch: 75
      function: 85
    test_pyramid:
      unit_min: 65
      unit_max: 80
      integration_min: 15
      integration_max: 25
      e2e_max: 10
```

---

## Best Practices

### Incremental Coverage

- Don't require 100% coverage immediately
- Set realistic thresholds and improve over time
- Focus on critical paths first (payment, auth, data integrity)
- Allow lower coverage for UI components (harder to test)

### Meaningful Coverage

- Coverage percentage is a metric, not a goal
- Ensure tests validate behavior, not just execute code
- Prefer thorough tests over high coverage numbers
- Test edge cases and error paths

---

## Output Files

```
.context-kit/analysis/
├─ test-coverage-report.html     # Interactive HTML report
├─ test-coverage-summary.json    # Machine-readable results
├─ coverage-gaps.csv             # Prioritized untested code
├─ flaky-tests.json              # Flaky test detection results
└─ test-pyramid.json             # Test distribution analysis
```

---

## Related Agents

- **code-quality-agent**: Test code quality overlaps
- **performance-agent**: Test performance optimization
- **architecture-consistency-agent**: Test organization patterns

---

## References

- [Test Pyramid - Martin Fowler](https://martinfowler.com/articles/practical-test-pyramid.html)
- [Jest Coverage Reports](https://jestjs.io/docs/configuration#collectcoverage-boolean)
- [Vitest Coverage](https://vitest.dev/guide/coverage.html)
- [Testing Library Best Practices](https://testing-library.com/docs/queries/about/#priority)
