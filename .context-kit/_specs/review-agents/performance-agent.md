# Performance Review Agent - Technical Specification

## Overview

A Performance Review Agent is a **static analysis + runtime profiling hybrid** that examines code patterns without executing the application, but can optionally trigger benchmarks for validation. It identifies performance bottlenecks, memory leaks, inefficient algorithms, and bundle size issues across the codebase.

---

## Core Mechanics

The agent operates in three progressive phases:

1. **Static Analysis** (Primary) - Pattern detection without code execution
2. **Build Analysis** (Optional) - Bundle size and compilation metrics
3. **Runtime Profiling** (Advanced) - Real-world performance measurements

---

## Detection Strategies by Category

### 1. Memory Leak Detection (Static Analysis)

#### Patterns Detected

**Event Listeners Without Cleanup**
```javascript
// ❌ Bad: Memory leak
useEffect(() => {
  window.addEventListener('scroll', handler);
  // Missing: return () => window.removeEventListener('scroll', handler);
}, []);
```

**Timers Without Cleanup**
```javascript
// ❌ Bad: Memory leak
useEffect(() => {
  const interval = setInterval(() => {...}, 1000);
  // Missing: return () => clearInterval(interval);
}, []);
```

**Dangling DOM References**
```javascript
// ❌ Bad: Stale references
const nodeRef = useRef();
// Missing: cleanup of DOM references in unmount
```

#### Agent Actions

- `Grep` for `addEventListener`, `setInterval`, `setTimeout` patterns
- `Read` files to analyze `useEffect` return statements
- Check if cleanup functions exist
- Parse dependency arrays for missing dependencies (stale closures)

#### Detection Logic

```
IF (useEffect contains addEventListener/setInterval/setTimeout)
  AND (no return statement with cleanup)
  AND (empty dependency array [])
THEN flag as "Potential Memory Leak"
```

---

### 2. Inefficient Algorithms (Computational Complexity)

#### Patterns Detected

**O(n²) Nested Loops**
```javascript
// ❌ Bad: Quadratic complexity
data.forEach(item => {
  data.forEach(other => {
    if (item.id === other.id) {...}
  });
});
```

**Inefficient Array Operations**
```javascript
// ❌ Bad: Repeated filtering in loop
for (let i = 0; i < items.length; i++) {
  filtered.push(...items.filter(x => x.type === items[i].type));
}
```

**Non-Indexed Lookups**
```javascript
// ❌ Bad: O(n) when Map/Object would be O(1)
const result = bigArray.find(x => x.id === targetId);
```

#### Agent Actions

- `Grep` for nested loop patterns: `forEach.*forEach`, `for.*for`
- Parse AST to detect loop nesting depth
- Identify array methods inside loops (`.filter`, `.find`, `.map`)
- Check for repeated operations on static data

#### Metrics Calculated

- **Cyclomatic Complexity Score** per function
- **Estimated Time Complexity** (O(n), O(n²), O(n log n))
- **Hot Path Frequency** (functions called in tight loops)

---

### 3. React-Specific Performance Issues

#### Unnecessary Re-renders

**Non-Memoized Expensive Calculations**
```javascript
// ❌ Bad: Runs every render
function Component({ data }) {
  const processed = expensiveOperation(data);
  // Should use: useMemo(() => expensiveOperation(data), [data])
}
```

**Inline Object/Array Creation in JSX**
```javascript
// ❌ Bad: New references every render
<Child config={{theme: 'dark'}} items={[1,2,3]} />
```

**Missing React.memo for Expensive Components**
```javascript
// ❌ Bad: Re-renders even if items unchanged
export function ExpensiveList({ items }) {
  // Should wrap with React.memo()
}
```

#### Agent Actions

- `Grep` for function calls in component bodies (not in hooks)
- Detect object/array literals in JSX props
- Check if expensive components use `React.memo`
- Analyze prop drilling patterns (excessive prop passing)

#### Inefficient State Updates

**Cascading Renders from Multiple setState Calls**
```javascript
// ❌ Bad: Triggers 3 separate renders
const [a, setA] = useState();
const [b, setB] = useState();
const [c, setC] = useState();

function update() {
  setA(1); // Render 1
  setB(2); // Render 2
  setC(3); // Render 3
  // Should batch or use useReducer
}
```

#### Detection

- Multiple `setState` calls in same function scope
- State updates inside loops
- Derived state that should be computed (not stored)

---

### 4. Bundle Size & Code Splitting

#### Patterns Detected

**Heavy Imports Without Code Splitting**
```javascript
// ❌ Bad: Imports everything
import * as LargeLib from 'entire-library';
```

**Missing Dynamic Imports for Routes**
```javascript
// ❌ Bad: Eager loading
import HeavyPage from './HeavyPage';
// Should use: React.lazy(() => import('./HeavyPage'))
```

**Entire Locale Imports**
```javascript
// ❌ Bad: 300KB+ when only need date formatting
import moment from 'moment';
```

#### Agent Actions

- `Bash` runs `npm run build` or `webpack-bundle-analyzer`
- Parse build output for bundle sizes
- `Grep` for large library imports (`lodash`, `moment`, `@mui/icons-material`)
- Check for `React.lazy()` usage in route definitions
- Analyze `package.json` for heavy dependencies

#### Metrics

- Total bundle size
- Largest chunks
- Duplicate dependencies
- Tree-shaking effectiveness

---

### 5. Database/API N+1 Problems

#### Patterns Detected

**N+1 Query Pattern**
```javascript
// ❌ Bad: N queries instead of 1 JOIN
async function getPostsWithAuthors(postIds) {
  const posts = await db.query('SELECT * FROM posts WHERE id IN (?)', [postIds]);

  for (const post of posts) {
    post.author = await db.query('SELECT * FROM users WHERE id = ?', [post.author_id]);
  }
}
```

**Sequential API Calls**
```javascript
// ❌ Bad: Sequential instead of parallel
for (const user of users) {
  await fetch(`/api/user/${user.id}/details`);
}
// Should use: Promise.all(users.map(user => fetch(...)))
```

#### Agent Actions

- `Grep` for `await` inside loops
- Detect database query patterns without JOINs
- Find repeated fetch calls with similar patterns
- Analyze GraphQL resolvers for missing DataLoader

---

### 6. Image/Asset Optimization

#### What It Checks

- Large image files (>500KB) without compression
- Missing `width`/`height` attributes (causes layout shift)
- No lazy loading for below-fold images
- Unoptimized formats (PNG when WebP/AVIF available)

#### Agent Actions

- `Glob` for image files, check file sizes via `Bash` (ls -lh)
- `Grep` for `<img>` tags without `loading="lazy"`
- Check for Next.js `Image` component usage (or equivalent)

---

## Tool Usage Pattern

```
Phase 1: Static Analysis (No Code Execution)
├─ Grep: Pattern detection (loops, hooks, imports)
├─ Read: File parsing for AST analysis
├─ Glob: Find all relevant files (*.tsx, *.ts, *.js)
└─ Output: Pattern-based issues

Phase 2: Build Analysis (Optional)
├─ Bash: npm run build (with bundle analyzer)
├─ Bash: npm run test:perf (if performance tests exist)
└─ Output: Bundle sizes, build metrics

Phase 3: Runtime Profiling (Advanced, Optional)
├─ Bash: Start dev server
├─ Bash: Run Lighthouse/Playwright performance tests
├─ Parse performance.json output
└─ Output: Real-world metrics (FCP, LCP, TTI)
```

---

## Scoring System

### Performance Score (0-100)

```
Score = 100 - (critical_issues × 15)
            - (warnings × 5)
            - (suggestions × 1)

Thresholds:
90-100: Excellent
70-89:  Good
50-69:  Needs Improvement
<50:    Critical Issues
```

### Issue Severity Classification

- **Critical (15 pts)**: O(n²) in hot paths, memory leaks, huge bundles (>1MB)
- **Warning (5 pts)**: Missing memoization, unoptimized images, N+1 queries
- **Suggestion (1 pt)**: Minor optimizations, best practice improvements

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
    <h1>Performance Review Report</h1>
    <div class="score-badge">78/100</div>
    <div class="quick-stats">
      <span class="critical">3 Critical Issues</span>
      <span class="warning">12 Warnings</span>
      <span class="suggestion">24 Suggestions</span>
    </div>
  </section>

  <section class="critical-issues">
    <h2>🔴 Critical Issues</h2>
    <details open>
      <summary>Memory Leak: Missing cleanup in useEffect</summary>
      <div class="issue-card">
        <p><strong>File:</strong> src/components/Dashboard.tsx:45</p>
        <pre><code class="language-typescript">
// Current Code (❌)
useEffect(() => {
  window.addEventListener('resize', handleResize);
}, []); // Missing cleanup!

// Fixed Code (✅)
useEffect(() => {
  window.addEventListener('resize', handleResize);
  return () => window.removeEventListener('resize', handleResize);
}, []);
        </code></pre>
        <p><strong>Impact:</strong> Event listeners accumulate on component remount, consuming memory</p>
        <p><strong>Remediation:</strong> Add cleanup function to remove event listener</p>
      </div>
    </details>
  </section>

  <section class="metrics">
    <h2>📊 Performance Metrics</h2>
    <table>
      <tr><td>Bundle Size</td><td>847 KB</td><td>⚠️ Above 500KB threshold</td></tr>
      <tr><td>Largest Chunk</td><td>moment.js (288KB)</td><td>Consider date-fns alternative</td></tr>
      <tr><td>Components Analyzed</td><td>47</td><td></td></tr>
      <tr><td>Hot Paths (O(n²))</td><td>3 found</td><td>See details below</td></tr>
    </table>
  </section>

  <section class="recommendations">
    <h2>💡 Top Recommendations</h2>
    <ol>
      <li>Replace moment.js with date-fns (-280KB bundle reduction)</li>
      <li>Add React.memo to ExpensiveList component</li>
      <li>Implement code splitting for admin routes</li>
    </ol>
  </section>
</body>
</html>
```

---

## Integration with Orchestration System

### Dependency Chain

```
Phase 1: react-component-analyzer ✅ (existing)
         ↓
Phase 2: performance-agent (NEW)
         ├─ Analyzes components from Phase 1
         ├─ Uses knowledge graph entity metadata
         └─ Cross-references with import relationships

Phase 3: validation-agent ✅ (existing)
         └─ Validates performance recommendations
```

### Execution Time

**~2-5 minutes** for medium codebase (100-500 files)

### Configuration

```yaml
agents:
  performance-agent:
    priority: 3
    dependencies: [react-component-analyzer]
    timeout: 300s
    retry: 2
    modes:
      - static_only    # Fast: Pattern detection only
      - with_build     # Medium: Include bundle analysis
      - full_profile   # Slow: Include runtime profiling
```

---

## Key Features

### 1. Static + Optional Dynamic

The agent works **primarily through static analysis** (no code execution needed), making it:
- **Fast** - No need to run tests
- **Safe** - No risk of executing malicious code
- **Comprehensive** - Analyzes patterns across entire codebase

But can **optionally trigger**:
- Build process (for bundle analysis)
- Performance benchmarks (if available)
- Lighthouse audits (for deployed apps)

### 2. Context-Aware Analysis

Leverages knowledge graph data:
- Component relationships (from import-relationship-mapper)
- Hook usage patterns (from react-hooks-analyzer)
- Data flow architecture (from data-flow-analyzer)

### 3. Actionable Recommendations

Every issue includes:
- File path and line number
- Code snippet showing the problem
- Fixed code example
- Impact assessment
- Remediation steps

---

## Output Files

```
.context-kit/analysis/
├─ performance-report.html       # Interactive HTML report
├─ performance-summary.json      # Machine-readable results
└─ performance-metrics.csv       # Time-series tracking
```

---

## Best Practices

### For Agent Implementation

- **Incremental Analysis**: Support analyzing only changed files
- **Configurable Thresholds**: Allow projects to customize severity levels
- **False Positive Handling**: Support inline comments to suppress warnings
- **Performance Tracking**: Compare reports over time to track improvements

### For Report Consumption

- **Prioritize Critical Issues**: Focus on high-impact fixes first
- **Batch Similar Issues**: Group related problems for efficient fixing
- **Validate Suggestions**: Use optional build analysis to confirm impact
- **Track Metrics Over Time**: Monitor performance score trends

---

## Future Enhancements

1. **Machine Learning Integration**: Learn from past fixes to improve accuracy
2. **Auto-Fix Capabilities**: Generate PRs for common issues (via code-writer agent)
3. **Real-User Monitoring**: Integrate with RUM tools for production data
4. **Performance Budget Enforcement**: Block builds exceeding thresholds
5. **Cross-Repository Benchmarking**: Compare against similar projects

---

## Related Agents

- **security-agent**: Complements with security-focused analysis
- **code-quality-agent**: Overlaps with complexity metrics
- **test-coverage-agent**: Performance tests validation
- **architecture-consistency-agent**: Validates architectural patterns

---

## References

- [Web Vitals](https://web.dev/vitals/)
- [React Performance Optimization](https://react.dev/learn/render-and-commit)
- [Lighthouse Performance Scoring](https://web.dev/performance-scoring/)
- [Chrome DevTools Performance](https://developer.chrome.com/docs/devtools/performance/)
