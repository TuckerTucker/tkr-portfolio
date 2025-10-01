# Security Review Agent - Technical Specification

## Overview

A Security Review Agent performs **defensive security analysis** to identify vulnerabilities, credential leaks, and attack vectors in the codebase. It focuses on static code analysis to detect security anti-patterns, insecure configurations, and potential exploits without executing code.

**Mission**: Identify security vulnerabilities before they reach production while maintaining developer productivity.

---

## Core Principles

- **Defensive Security Only**: Focus on protecting systems, not attacking them
- **Static Analysis First**: No code execution required for safety
- **Zero False Negatives for Criticals**: Better to warn than miss a credential leak
- **Actionable Remediation**: Every finding includes fix guidance

---

## Detection Strategies by Category

### 1. Credential & Secret Detection

#### Patterns Detected

**Hardcoded API Keys**
```javascript
// ❌ Critical: Exposed API key
const API_KEY = 'sk_live_51H7xQ2eZvKYlo2C...';
const STRIPE_SECRET = 'whsec_abc123...';

// ❌ Critical: AWS credentials
const AWS_ACCESS_KEY_ID = 'AKIAIOSFODNN7EXAMPLE';
```

**Hardcoded Passwords**
```javascript
// ❌ Critical: Database credentials
const dbConfig = {
  password: 'MyS3cr3tP@ssw0rd',
  connectionString: 'mongodb://admin:password123@localhost'
};
```

**Private Keys in Code**
```javascript
// ❌ Critical: Private key material
const privateKey = `-----BEGIN PRIVATE KEY-----
MIIEvQIBADANBgkqhkiG9w0BAQEFAASC...
-----END PRIVATE KEY-----`;
```

**OAuth Tokens**
```javascript
// ❌ Critical: OAuth token
const GITHUB_TOKEN = 'ghp_1234567890abcdef...';
const SLACK_WEBHOOK = 'https://hooks.slack.com/services/T00/B00/XXXX';
```

#### Agent Actions

- `Grep` with regex patterns for common secret formats:
  - API keys: `(?i)(api[_-]?key|apikey)[\s]*=[\s]*['"][a-z0-9]{20,}['"]`
  - AWS keys: `AKIA[0-9A-Z]{16}`
  - Private keys: `-----BEGIN (RSA |EC |DSA )?PRIVATE KEY-----`
  - JWT tokens: `eyJ[a-zA-Z0-9_-]+\.eyJ[a-zA-Z0-9_-]+\.[a-zA-Z0-9_-]+`
  - GitHub tokens: `ghp_[a-zA-Z0-9]{36}`, `gho_[a-zA-Z0-9]{36}`
- `Read` .env, config files, and constants files
- Check for `.env` files committed to git
- Validate environment variable usage patterns

#### Detection Logic

```
IF (file matches secret pattern)
  AND (file is not in .gitignore)
  AND (file is tracked by git OR staged)
THEN flag as "Critical: Exposed Credential"

EXCEPTION: Allow in test fixtures if clearly marked as fake
```

---

### 2. Injection Vulnerabilities

#### SQL Injection

**Unsafe Query Construction**
```javascript
// ❌ Critical: SQL injection vulnerability
const query = `SELECT * FROM users WHERE id = ${userId}`;
db.query(query);

// ❌ Critical: String concatenation
const sql = "DELETE FROM posts WHERE id = '" + postId + "'";
```

**Safe Pattern**
```javascript
// ✅ Good: Parameterized query
db.query('SELECT * FROM users WHERE id = ?', [userId]);
```

#### Command Injection

**Unsafe Shell Execution**
```javascript
// ❌ Critical: Command injection
exec(`git clone ${userProvidedUrl}`);
child_process.exec('ls ' + userInput);

// ❌ Critical: Eval usage
eval(userProvidedCode);
new Function(untrustedInput)();
```

#### Agent Actions

- `Grep` for SQL query string concatenation: `SELECT.*\${`, `INSERT.*\+`
- `Grep` for unsafe exec patterns: `exec\(.*\$\{`, `eval\(`
- `Read` database query files to validate parameterization
- Check for ORM usage vs raw SQL

---

### 3. Cross-Site Scripting (XSS)

#### Patterns Detected

**Dangerous HTML Rendering**
```javascript
// ❌ Critical: XSS vulnerability
element.innerHTML = userInput;
dangerouslySetInnerHTML={{__html: untrustedData}}

// ❌ Warning: Unescaped user content
<div>{userComment}</div>  // If userComment contains <script>
```

**Unsafe DOM Manipulation**
```javascript
// ❌ Critical: XSS via href
<a href={`javascript:${userInput}`}>Click</a>

// ❌ Warning: User-controlled URLs
<a href={userProvidedUrl}>Link</a>  // Should validate protocol
```

#### Agent Actions

- `Grep` for `dangerouslySetInnerHTML`, `.innerHTML =`
- `Grep` for `javascript:` protocol in href attributes
- Check React/Vue components for unescaped user input
- Validate sanitization library usage (DOMPurify, xss)

---

### 4. Authentication & Authorization Issues

#### Patterns Detected

**Weak Password Requirements**
```javascript
// ❌ Warning: Weak password validation
if (password.length < 6) return false;

// ❌ Warning: No complexity requirements
const passwordRegex = /^.{8,}$/;
```

**Insecure Session Management**
```javascript
// ❌ Critical: Hardcoded session secret
app.use(session({
  secret: 'keyboard cat',  // Never hardcode!
  resave: false
}));

// ❌ Warning: No secure flag on cookies
res.cookie('token', jwt, { httpOnly: true }); // Missing secure: true
```

**Missing Authorization Checks**
```javascript
// ❌ Critical: No auth check
app.delete('/api/users/:id', (req, res) => {
  deleteUser(req.params.id);  // Anyone can delete any user!
});
```

#### Agent Actions

- `Grep` for authentication middleware usage
- Check route definitions for authorization guards
- Validate JWT implementation patterns
- Check cookie security flags

---

### 5. Cryptographic Issues

#### Patterns Detected

**Weak Hashing Algorithms**
```javascript
// ❌ Critical: MD5 is cryptographically broken
const hash = crypto.createHash('md5').update(password).digest('hex');

// ❌ Critical: SHA1 is deprecated
const hash = crypto.createHash('sha1');
```

**Insufficient Salt/Rounds**
```javascript
// ❌ Warning: Low bcrypt rounds
bcrypt.hash(password, 4, callback);  // Should be 10+

// ❌ Critical: No salt
const hash = sha256(password);  // Vulnerable to rainbow tables
```

**Weak Random Number Generation**
```javascript
// ❌ Warning: Math.random() is not cryptographically secure
const token = Math.random().toString(36);

// ✅ Good: Use crypto.randomBytes
const token = crypto.randomBytes(32).toString('hex');
```

#### Agent Actions

- `Grep` for weak hash algorithms: `md5`, `sha1`
- Check bcrypt/argon2 rounds configuration
- Validate random number generation for security tokens
- Check encryption algorithm choices (AES-256, not DES)

---

### 6. Dependency Vulnerabilities

#### Patterns Detected

**Known CVEs in Dependencies**
```json
// ❌ Critical: Known vulnerable version
{
  "dependencies": {
    "lodash": "4.17.15",  // CVE-2019-10744
    "axios": "0.18.0"      // CVE-2020-28168
  }
}
```

#### Agent Actions

- `Bash` runs `npm audit` or `yarn audit`
- Parse audit JSON output
- Cross-reference with CVE databases
- Check for available patches

---

### 7. Information Disclosure

#### Patterns Detected

**Verbose Error Messages**
```javascript
// ❌ Warning: Stack traces in production
app.use((err, req, res, next) => {
  res.status(500).json({ error: err.stack });  // Exposes internals
});
```

**Debug Mode in Production**
```javascript
// ❌ Warning: Debug enabled
const DEBUG = true;
if (DEBUG) console.log('User:', user, 'Password:', password);
```

**Exposed Configuration**
```javascript
// ❌ Warning: Exposing system details
res.json({
  environment: process.env,  // Leak secrets
  dbHost: config.database.host
});
```

#### Agent Actions

- `Grep` for `console.log`, `console.error` with sensitive data
- Check production configurations for debug flags
- Validate error handling patterns

---

### 8. CORS & Security Headers

#### Patterns Detected

**Permissive CORS**
```javascript
// ❌ Critical: Allows any origin
app.use(cors({
  origin: '*',
  credentials: true  // Dangerous combination!
}));
```

**Missing Security Headers**
```javascript
// ❌ Warning: No security headers
// Missing: helmet middleware or manual headers
```

#### Agent Actions

- `Grep` for CORS configuration
- Check for helmet or security header middleware
- Validate CSP (Content Security Policy) settings

---

### 9. Path Traversal

#### Patterns Detected

**Unsafe File Access**
```javascript
// ❌ Critical: Path traversal vulnerability
const filePath = path.join(__dirname, userInput);
fs.readFile(filePath);  // User could provide '../../etc/passwd'

// ❌ Critical: Direct path concatenation
app.get('/files', (req, res) => {
  res.sendFile('./uploads/' + req.query.filename);
});
```

#### Agent Actions

- `Grep` for file system operations with user input
- Check for path normalization/validation
- Validate use of `path.resolve` vs `path.join`

---

### 10. Race Conditions & TOCTOU

#### Patterns Detected

**Check-Then-Use Patterns**
```javascript
// ❌ Warning: Time-of-check to time-of-use race
if (fs.existsSync(tempFile)) {
  // Race condition window here
  fs.unlinkSync(tempFile);
}
```

#### Agent Actions

- `Grep` for file existence checks followed by operations
- Check for proper file locking mechanisms

---

## Tool Usage Pattern

```
Phase 1: Credential Scanning (Fast)
├─ Grep: Secret pattern matching across all files
├─ Read: .env, config files, constants
├─ Bash: git log --all --full-history (check history)
└─ Output: Critical credential exposures

Phase 2: Vulnerability Detection (Medium)
├─ Grep: Injection patterns, XSS, command injection
├─ Read: Route handlers, database queries, API endpoints
└─ Output: Code-level vulnerabilities

Phase 3: Dependency Audit (Fast)
├─ Bash: npm audit --json
├─ Parse: package.json, package-lock.json
└─ Output: Known CVEs and upgrade paths

Phase 4: Configuration Review (Fast)
├─ Read: Security-related config files
├─ Grep: CORS, headers, authentication setup
└─ Output: Misconfiguration warnings
```

---

## Scoring System

### Security Score (0-100)

```
Score = 100 - (critical_issues × 25)
            - (high_issues × 10)
            - (medium_issues × 3)
            - (low_issues × 1)

Thresholds:
95-100: Excellent
80-94:  Good
60-79:  Needs Attention
<60:    Critical Issues
```

### Issue Severity Classification

- **Critical (25 pts)**: Exposed credentials, SQL injection, remote code execution
- **High (10 pts)**: XSS, authentication bypass, weak cryptography
- **Medium (3 pts)**: Missing security headers, weak password policy
- **Low (1 pt)**: Information disclosure, verbose logging

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
    <h1>Security Review Report</h1>
    <div class="score-badge critical">45/100</div>
    <div class="quick-stats">
      <span class="critical">2 Critical Issues</span>
      <span class="high">5 High Severity</span>
      <span class="medium">8 Medium</span>
      <span class="low">12 Low</span>
    </div>
    <div class="alert">
      ⚠️ IMMEDIATE ACTION REQUIRED: Exposed credentials detected
    </div>
  </section>

  <section class="critical-issues">
    <h2>🔴 Critical Issues (IMMEDIATE FIX REQUIRED)</h2>
    <details open>
      <summary>Exposed API Key in Source Code</summary>
      <div class="issue-card">
        <p><strong>File:</strong> src/config/api.ts:12</p>
        <p><strong>Severity:</strong> <span class="badge critical">CRITICAL</span></p>
        <p><strong>CWE:</strong> <a href="https://cwe.mitre.org/data/definitions/798.html">CWE-798: Use of Hard-coded Credentials</a></p>

        <pre><code class="language-typescript">
// Current Code (❌)
const STRIPE_SECRET_KEY = 'sk_live_51H7xQ2eZvKYlo2C...';

// Fixed Code (✅)
const STRIPE_SECRET_KEY = process.env.STRIPE_SECRET_KEY;
// Add to .env file (NOT committed to git):
// STRIPE_SECRET_KEY=sk_live_...
        </code></pre>

        <div class="impact">
          <h4>Impact</h4>
          <p>Exposed Stripe API key allows unauthorized charges, refunds, and customer data access.
             If this code is public, key is compromised and must be rotated immediately.</p>
        </div>

        <div class="remediation">
          <h4>Remediation Steps</h4>
          <ol>
            <li>Immediately rotate the exposed key in Stripe dashboard</li>
            <li>Move key to environment variable</li>
            <li>Add .env to .gitignore</li>
            <li>Remove key from git history: <code>git filter-branch --force --index-filter...</code></li>
            <li>Audit access logs for unauthorized usage</li>
          </ol>
        </div>
      </div>
    </details>

    <details open>
      <summary>SQL Injection Vulnerability</summary>
      <div class="issue-card">
        <p><strong>File:</strong> src/api/users.ts:45</p>
        <p><strong>Severity:</strong> <span class="badge critical">CRITICAL</span></p>
        <p><strong>CWE:</strong> <a href="https://cwe.mitre.org/data/definitions/89.html">CWE-89: SQL Injection</a></p>

        <pre><code class="language-typescript">
// Current Code (❌)
const query = `SELECT * FROM users WHERE email = '${email}'`;
db.query(query);

// Fixed Code (✅)
const query = 'SELECT * FROM users WHERE email = ?';
db.query(query, [email]);
        </code></pre>

        <div class="impact">
          <h4>Impact</h4>
          <p>Attacker can execute arbitrary SQL commands, potentially reading, modifying, or deleting database contents.
             Example payload: <code>'; DROP TABLE users; --</code></p>
        </div>

        <div class="remediation">
          <h4>Remediation Steps</h4>
          <ol>
            <li>Use parameterized queries (prepared statements)</li>
            <li>Never concatenate user input into SQL</li>
            <li>Consider using an ORM (Prisma, TypeORM, Sequelize)</li>
            <li>Implement input validation as defense-in-depth</li>
          </ol>
        </div>
      </div>
    </details>
  </section>

  <section class="high-issues">
    <h2>🟠 High Severity Issues</h2>
    <!-- Similar structure for high severity issues -->
  </section>

  <section class="dependency-audit">
    <h2>📦 Dependency Vulnerabilities</h2>
    <table>
      <thead>
        <tr>
          <th>Package</th>
          <th>Version</th>
          <th>Severity</th>
          <th>CVE</th>
          <th>Fix</th>
        </tr>
      </thead>
      <tbody>
        <tr class="critical">
          <td>lodash</td>
          <td>4.17.15</td>
          <td><span class="badge critical">Critical</span></td>
          <td><a href="https://nvd.nist.gov/vuln/detail/CVE-2019-10744">CVE-2019-10744</a></td>
          <td>Upgrade to 4.17.21+</td>
        </tr>
      </tbody>
    </table>
  </section>

  <section class="security-checklist">
    <h2>✓ Security Checklist</h2>
    <ul class="checklist">
      <li class="fail">❌ No hardcoded credentials (2 violations)</li>
      <li class="fail">❌ Input validation on all endpoints (5 missing)</li>
      <li class="pass">✅ HTTPS enforced</li>
      <li class="pass">✅ Security headers configured</li>
      <li class="fail">❌ Dependencies up to date (8 vulnerabilities)</li>
    </ul>
  </section>

  <section class="recommendations">
    <h2>💡 Security Recommendations</h2>
    <ol>
      <li><strong>Immediate:</strong> Rotate exposed API keys and audit access logs</li>
      <li><strong>Short-term:</strong> Fix SQL injection vulnerabilities</li>
      <li><strong>Medium-term:</strong> Update dependencies with known CVEs</li>
      <li><strong>Long-term:</strong> Implement automated security scanning in CI/CD</li>
    </ol>
  </section>

  <section class="resources">
    <h2>📚 Security Resources</h2>
    <ul>
      <li><a href="https://owasp.org/www-project-top-ten/">OWASP Top 10</a></li>
      <li><a href="https://cheatsheetseries.owasp.org/">OWASP Cheat Sheets</a></li>
      <li><a href="https://cwe.mitre.org/">CWE Database</a></li>
    </ul>
  </section>
</body>
</html>
```

---

## Integration with Orchestration System

### Dependency Chain

```
Phase 1: security-agent (INDEPENDENT)
         └─ Runs early in review pipeline

Phase 2: Other review agents
         └─ Can reference security findings

Phase 3: validation-agent
         └─ Validates security fixes
```

### Execution Time

**~1-3 minutes** for medium codebase (credent scanning is fast, dependency audit depends on package count)

### Configuration

```yaml
agents:
  security-agent:
    priority: 1  # Run first due to critical nature
    dependencies: []  # Independent
    timeout: 180s
    retry: 1
    modes:
      - credential_scan  # Fast: Secret detection only
      - code_analysis    # Medium: Include vulnerability patterns
      - full_audit       # Slow: Include dependency audit
    exclusions:
      - '**/*.test.ts'   # Test fixtures may contain fake secrets
      - '**/fixtures/**'
      - '**/mocks/**'
```

---

## Best Practices

### False Positive Management

**Inline Suppression**
```javascript
// security-ignore: test-fixture
const FAKE_API_KEY = 'sk_test_fake_for_testing_only';
```

**Configuration File** (`.security-ignore.yml`)
```yaml
patterns:
  - pattern: 'DEMO_'
    reason: 'Demo credentials clearly marked'

files:
  - path: 'src/fixtures/**'
    reason: 'Test fixtures with intentional fake data'
```

### Continuous Monitoring

- Run security agent on every commit (pre-commit hook)
- Block CI/CD pipeline on critical findings
- Weekly full audits including dependency checks
- Track security score over time

---

## Output Files

```
.context-kit/analysis/
├─ security-report.html          # Interactive HTML report
├─ security-summary.json         # Machine-readable results
├─ security-cve-list.json        # Dependency vulnerabilities
└─ security-credentials-found.txt # Sensitive findings (encrypted)
```

---

## Related Agents

- **code-quality-agent**: Complements with code smell detection
- **dependency-audit-agent**: Deep dive into supply chain security
- **architecture-consistency-agent**: Validates security patterns

---

## References

- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [CWE/SANS Top 25](https://cwe.mitre.org/top25/)
- [Node.js Security Best Practices](https://nodejs.org/en/docs/guides/security/)
- [npm Security Best Practices](https://docs.npmjs.com/security-best-practices/)
