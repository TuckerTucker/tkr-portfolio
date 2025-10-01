# Architecture Consistency Review Agent - Technical Specification

## Overview

An Architecture Consistency Review Agent validates adherence to architectural principles, design patterns, and project-specific conventions. It ensures IoC (Inversion of Control) compliance, DRY (Don't Repeat Yourself) principles, module boundaries, and consistent design patterns across the codebase.

**Mission**: Maintain architectural integrity and consistency as the codebase evolves, preventing architectural drift and technical debt.

---

## Core Principles (From CLAUDE.md)

- **Inversion of Control (IoC)**: Business logic in core, interfaces consume from core
- **DRY (Don't Repeat Yourself)**: Shared core architecture, no duplication
- **Modularity**: Clear separation of concerns
- **Extensibility**: New features don't require core changes

---

## Detection Strategies by Category

### 1. IoC Principle Violations

#### Patterns Detected

**Business Logic in Interface Layer**
```typescript
// ❌ Bad: Business logic in API route handler
// File: api/users/route.ts
export async function POST(request: Request) {
  const { email, password } = await request.json();

  // ❌ Business logic here instead of core!
  const hashedPassword = await bcrypt.hash(password, 10);
  const user = await db.users.create({
    email,
    password: hashedPassword,
    createdAt: new Date()
  });

  return Response.json({ user });
}

// ✅ Good: Business logic in core
// File: core/user-service.ts
export class UserService {
  async createUser(email: string, password: string): Promise<User> {
    const hashedPassword = await this.hashPassword(password);
    return this.repository.create({ email, password: hashedPassword });
  }
}

// File: api/users/route.ts
export async function POST(request: Request) {
  const { email, password } = await request.json();
  const user = await userService.createUser(email, password);
  return Response.json({ user });
}
```

**Direct Database Access from Interface**
```typescript
// ❌ Bad: API route directly accessing database
// File: api/posts/route.ts
import { db } from '@/db';

export async function GET() {
  const posts = await db.posts.findMany();  // ❌ Bypassing core!
  return Response.json(posts);
}

// ✅ Good: Through repository in core
// File: core/repositories/post-repository.ts
export class PostRepository {
  async findAll(): Promise<Post[]> {
    return this.db.posts.findMany();
  }
}

// File: api/posts/route.ts
export async function GET() {
  const posts = await postRepository.findAll();
  return Response.json(posts);
}
```

**Core Depending on Interface**
```typescript
// ❌ Bad: Core importing from API layer
// File: core/user-service.ts
import { validateRequest } from '../api/middleware';  // ❌ Wrong direction!

// ✅ Good: Core is independent
// File: core/user-service.ts
// No imports from api/, mcp/, or tools/
```

#### Agent Actions

- `Grep` for database imports in API/interface files
- Analyze import statements for dependency direction
- Check core modules don't import from api/, mcp/, tools/
- Detect business logic patterns in interface layers
- Validate repository pattern usage
- Check for service layer existence

#### Dependency Rules

```yaml
allowed_dependencies:
  api/:
    can_import: ['core/', 'shared/']
    cannot_import: ['api/', 'mcp/', 'tools/']

  mcp/:
    can_import: ['core/', 'shared/']
    cannot_import: ['api/', 'mcp/', 'tools/']

  tools/:
    can_import: ['core/', 'shared/']
    cannot_import: ['api/', 'mcp/', 'tools/']

  core/:
    can_import: ['core/', 'shared/']
    cannot_import: ['api/', 'mcp/', 'tools/']  # Core is independent!

  shared/:
    can_import: []  # Shared has no dependencies
    cannot_import: ['*']
```

---

### 2. DRY Violations (Code Duplication)

#### Patterns Detected

**Duplicated Logic Across Interfaces**
```typescript
// ❌ Bad: Validation logic duplicated in API and MCP
// File: api/users/route.ts
function validateEmail(email: string) {
  if (!email.includes('@')) throw new Error('Invalid email');
}

// File: mcp/tools/user-tool.ts
function validateEmail(email: string) {  // ❌ Duplicate!
  if (!email.includes('@')) throw new Error('Invalid email');
}

// ✅ Good: Shared in core
// File: core/validators/email.ts
export function validateEmail(email: string): void {
  if (!email.includes('@')) throw new Error('Invalid email');
}

// Both interfaces import from core
```

**Duplicated Data Models**
```typescript
// ❌ Bad: User type defined in multiple places
// File: api/types.ts
interface User {
  id: string;
  email: string;
  name: string;
}

// File: mcp/types.ts
interface User {  // ❌ Duplicate!
  id: string;
  email: string;
  name: string;
}

// ✅ Good: Single source of truth in core
// File: core/types/user.ts
export interface User {
  id: string;
  email: string;
  name: string;
}
```

#### Agent Actions

- Run jscpd to detect code duplication
- Check for duplicate type definitions
- Identify similar function implementations
- Cross-reference validation logic across modules
- Suggest extraction to core module

---

### 3. Module Boundary Violations

#### Patterns Detected

**Circular Dependencies**
```typescript
// ❌ Bad: Circular dependency
// File: modules/user/service.ts
import { OrderService } from '../order/service';

// File: modules/order/service.ts
import { UserService } from '../user/service';  // ❌ Circular!

// ✅ Good: Use events or dependency injection
// File: modules/user/service.ts
export class UserService {
  constructor(private eventBus: EventBus) {}

  async createUser(data: UserData) {
    const user = await this.repository.create(data);
    this.eventBus.emit('user.created', user);  // Decouple
  }
}

// File: modules/order/service.ts
export class OrderService {
  constructor(private eventBus: EventBus) {
    this.eventBus.on('user.created', this.handleUserCreated);
  }
}
```

**Deep Module Coupling**
```typescript
// ❌ Bad: Reaching deep into another module's internals
// File: modules/billing/service.ts
import { getUserById } from '../../user/repository';  // ❌ Bypassing service layer

// ✅ Good: Use public API
// File: modules/billing/service.ts
import { userService } from '../../user';  // Public interface only
```

#### Agent Actions

- Build module dependency graph
- Detect circular dependencies using `madge` or similar
- Analyze import depth (shouldn't reach into internals)
- Validate module public API usage
- Check for proper module exports

---

### 4. Inconsistent Design Patterns

#### Patterns Detected

**Mixed Repository Patterns**
```typescript
// ❌ Bad: Inconsistent repository implementations
// File: core/repositories/user-repository.ts
export class UserRepository {
  async findById(id: string) { /* ... */ }
  async create(data: UserData) { /* ... */ }
}

// File: core/repositories/post-repository.ts
export const postRepository = {  // ❌ Different pattern!
  getById: (id: string) => { /* ... */ },
  add: (data: PostData) => { /* ... */ }  // ❌ Different naming!
};

// ✅ Good: Consistent pattern
// All repositories use:
// - Class-based
// - Consistent naming: findById, create, update, delete
// - Implement IRepository interface
```

**Inconsistent Error Handling**
```typescript
// ❌ Bad: Mixed error handling approaches
// File: core/services/user-service.ts
async getUser(id: string) {
  const user = await this.repo.findById(id);
  if (!user) throw new Error('User not found');  // Throws
  return user;
}

// File: core/services/post-service.ts
async getPost(id: string) {
  const post = await this.repo.findById(id);
  return post || null;  // ❌ Returns null instead of throwing!
}

// ✅ Good: Consistent error handling
// Project standard: Throw domain-specific errors
class UserNotFoundError extends AppError { /* ... */ }
```

**Mixed Async Patterns**
```typescript
// ❌ Bad: Mixing callbacks, promises, async/await
function getUser(id, callback) {  // Callbacks
  db.users.find(id, callback);
}

async function getPost(id) {  // ❌ Async/await
  return await db.posts.find(id);
}

function getComment(id) {  // ❌ Promises
  return db.comments.find(id).then(/* ... */);
}

// ✅ Good: Consistent async/await throughout
```

#### Agent Actions

- Check for consistent use of classes vs functions
- Validate naming conventions across similar modules
- Detect mixed async patterns (callbacks vs promises vs async/await)
- Check error handling consistency
- Validate design pattern adherence (factory, repository, etc.)

---

### 5. Layer Violation Detection

#### Expected Architecture Layers

```
┌─────────────────────────────────┐
│   Interface Layer (API/MCP/CLI) │  ← Thin adapters
├─────────────────────────────────┤
│      Application Services       │  ← Use case orchestration
├─────────────────────────────────┤
│       Domain Logic (Core)       │  ← Business rules
├─────────────────────────────────┤
│    Infrastructure (DB/External) │  ← Technical details
└─────────────────────────────────┘

Dependencies flow: Top → Bottom only
```

**Layer Violations**
```typescript
// ❌ Bad: Domain layer depending on infrastructure
// File: core/domain/user.ts
import { db } from '../../infrastructure/database';  // ❌ Wrong direction!

class User {
  async save() {
    await db.users.create(this);  // ❌ Domain knows about DB!
  }
}

// ✅ Good: Dependency injection, repository pattern
// File: core/domain/user.ts
class User {
  // No infrastructure dependencies
}

// File: core/services/user-service.ts
class UserService {
  constructor(private userRepository: IUserRepository) {}  // Injected

  async saveUser(user: User) {
    return this.userRepository.save(user);
  }
}
```

#### Agent Actions

- Build layered architecture map
- Detect upward dependencies (violations)
- Check for proper dependency injection
- Validate interface/implementation separation

---

### 6. Naming Convention Consistency

#### Patterns Detected

**Inconsistent File Naming**
```
❌ Bad: Mixed conventions
src/
  UserService.ts       # PascalCase
  post-repository.ts   # kebab-case
  comment_model.ts     # snake_case
  Order.service.ts     # Mixed

✅ Good: Consistent kebab-case
src/
  user-service.ts
  post-repository.ts
  comment-model.ts
  order-service.ts
```

**Inconsistent Function Naming**
```typescript
// ❌ Bad: Mixed conventions
function GetUser() { }        // PascalCase
function create_post() { }    // snake_case
function updateComment() { }  // camelCase
function DeleteOrder() { }    // PascalCase

// ✅ Good: Consistent camelCase
function getUser() { }
function createPost() { }
function updateComment() { }
function deleteOrder() { }
```

#### Agent Actions

- Analyze file naming patterns
- Check function/method naming conventions
- Validate class naming (PascalCase)
- Check constant naming (UPPER_SNAKE_CASE)
- Detect inconsistencies across modules

---

### 7. Configuration Management

#### Patterns Detected

**Hardcoded Configuration**
```typescript
// ❌ Bad: Hardcoded values scattered throughout
// File: api/users/route.ts
const MAX_USERS = 1000;  // ❌ Hardcoded

// File: core/services/user-service.ts
const MAX_USERS = 1000;  // ❌ Duplicate!

// ✅ Good: Centralized configuration
// File: core/config/index.ts
export const config = {
  users: {
    maxCount: env.MAX_USERS || 1000
  }
};
```

**Environment Variable Chaos**
```typescript
// ❌ Bad: Direct process.env access everywhere
const dbUrl = process.env.DATABASE_URL;  // Scattered throughout

// ✅ Good: Centralized, validated config
// File: core/config/env.ts
import { z } from 'zod';

const envSchema = z.object({
  DATABASE_URL: z.string().url(),
  API_KEY: z.string().min(32),
  NODE_ENV: z.enum(['development', 'production', 'test'])
});

export const env = envSchema.parse(process.env);
```

#### Agent Actions

- `Grep` for `process.env` usage outside config files
- Detect hardcoded constants that should be configurable
- Check for centralized config module
- Validate environment variable validation (zod, joi, etc.)

---

## Tool Usage Pattern

```
Phase 1: Dependency Analysis (Medium)
├─ Bash: madge --circular --json
├─ Parse: Import statements
├─ Build: Dependency graph
├─ Validate: IoC compliance
└─ Output: Dependency violations

Phase 2: Code Duplication (Medium)
├─ Bash: jscpd --format json
├─ Analyze: Duplicated logic across modules
├─ Check: DRY principle adherence
└─ Output: Duplication report

Phase 3: Pattern Consistency (Fast)
├─ Grep: Repository, service, controller patterns
├─ Analyze: Naming conventions
├─ Check: Error handling consistency
└─ Output: Pattern violations

Phase 4: Layer Validation (Medium)
├─ Build: Layer dependency map
├─ Detect: Upward dependencies
├─ Validate: Proper abstractions
└─ Output: Layer violations

Phase 5: Module Boundaries (Fast)
├─ Analyze: Module coupling
├─ Check: Circular dependencies
├─ Validate: Public API usage
└─ Output: Boundary violations
```

---

## Scoring System

### Architecture Consistency Score (0-100)

```
Score = 100 - (ioc_violations × 15)
            - (dry_violations × 10)
            - (layer_violations × 10)
            - (circular_deps × 10)
            - (pattern_inconsistencies × 5)
            - (naming_violations × 2)

Thresholds:
90-100: Excellent
75-89:  Good
60-74:  Needs Refactoring
<60:    Architectural Drift
```

### Issue Severity

- **Critical (15 pts)**: IoC violations, business logic in interfaces
- **High (10 pts)**: DRY violations, layer violations, circular dependencies
- **Medium (5 pts)**: Pattern inconsistencies, deep coupling
- **Low (2 pts)**: Naming convention violations, minor inconsistencies

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
    <h1>Architecture Consistency Report</h1>
    <div class="score-badge warning">68/100</div>
    <div class="alert">
      ⚠️ WARNING: Architectural drift detected - 12 IoC violations found
    </div>
    <div class="principles">
      <h3>Project Principles (from CLAUDE.md)</h3>
      <ul>
        <li>✅ Inversion of Control (IoC)</li>
        <li>✅ DRY (Don't Repeat Yourself)</li>
        <li>✅ Modularity</li>
        <li>✅ Extensibility</li>
      </ul>
    </div>
    <div class="quick-stats">
      <span class="critical">12 IoC Violations</span>
      <span class="high">8 DRY Violations</span>
      <span class="medium">15 Pattern Inconsistencies</span>
    </div>
  </section>

  <section class="ioc-violations">
    <h2>🔴 IoC Principle Violations</h2>
    <p><strong>12 instances</strong> of business logic in interface layers</p>

    <details open>
      <summary>Business Logic in API Route Handler</summary>
      <div class="violation-card">
        <p><strong>File:</strong> api/users/route.ts:23-45</p>
        <p><strong>Severity:</strong> <span class="badge critical">Critical</span></p>
        <p><strong>Principle:</strong> Business logic belongs in core, not interfaces</p>

        <pre><code class="language-typescript">
// Current (❌)
export async function POST(request: Request) {
  const { email, password } = await request.json();
  const hashedPassword = await bcrypt.hash(password, 10);  // ❌ Business logic!
  const user = await db.users.create({ email, password: hashedPassword });
  return Response.json({ user });
}

// Refactored (✅)
// File: core/services/user-service.ts
export class UserService {
  async createUser(email: string, password: string): Promise<User> {
    const hashedPassword = await this.hashPassword(password);
    return this.repository.create({ email, password: hashedPassword });
  }
}

// File: api/users/route.ts
export async function POST(request: Request) {
  const { email, password } = await request.json();
  const user = await userService.createUser(email, password);
  return Response.json({ user });
}
        </code></pre>

        <div class="impact">
          <h4>Impact</h4>
          <ul>
            <li>Logic cannot be reused by MCP or CLI interfaces</li>
            <li>Testing requires mocking HTTP layer</li>
            <li>Violates single responsibility principle</li>
          </ul>
        </div>

        <div class="remediation">
          <h4>Refactoring Steps</h4>
          <ol>
            <li>Create UserService in core/services/</li>
            <li>Move password hashing to service</li>
            <li>Move user creation to repository</li>
            <li>API route becomes thin adapter</li>
          </ol>
          <p><strong>Estimated Effort:</strong> 1-2 hours</p>
        </div>
      </div>
    </details>
  </section>

  <section class="dependency-graph">
    <h2>📊 Module Dependency Graph</h2>
    <div class="graph">
      <!-- SVG dependency graph -->
      <svg>...</svg>
    </div>

    <h3>Circular Dependencies (3 detected)</h3>
    <ul>
      <li>
        <strong>modules/user ↔ modules/order</strong>
        <pre>modules/user/service.ts → modules/order/service.ts → modules/user/service.ts</pre>
        <p><strong>Recommendation:</strong> Introduce event-driven communication or shared contracts</p>
      </li>
    </ul>
  </section>

  <section class="dry-violations">
    <h2>📋 DRY Violations</h2>
    <p>Found <strong>8 instances</strong> of duplicated logic</p>

    <details>
      <summary>Email Validation Duplicated Across 3 Files</summary>
      <div class="duplication-card">
        <p><strong>Duplicated in:</strong></p>
        <ul>
          <li>api/users/route.ts:34</li>
          <li>mcp/tools/user-tool.ts:67</li>
          <li>cli/commands/create-user.ts:23</li>
        </ul>

        <pre><code class="language-typescript">
// Each file has this duplicate:
function validateEmail(email: string) {
  if (!email.includes('@')) throw new Error('Invalid email');
}
        </code></pre>

        <div class="remediation">
          <h4>Refactoring</h4>
          <p>Extract to core/validators/email.ts and import from all interfaces</p>
          <pre><code class="language-typescript">
// core/validators/email.ts
export function validateEmail(email: string): void {
  if (!EMAIL_REGEX.test(email)) {
    throw new ValidationError('Invalid email format');
  }
}
          </code></pre>
        </div>
      </div>
    </details>
  </section>

  <section class="pattern-consistency">
    <h2>🎨 Design Pattern Consistency</h2>

    <h3>Repository Pattern</h3>
    <table>
      <thead>
        <tr>
          <th>Repository</th>
          <th>Pattern</th>
          <th>Methods</th>
          <th>Status</th>
        </tr>
      </thead>
      <tbody>
        <tr class="pass">
          <td>UserRepository</td>
          <td>Class-based</td>
          <td>findById, create, update, delete</td>
          <td>✅ Consistent</td>
        </tr>
        <tr class="fail">
          <td>PostRepository</td>
          <td>Object literal</td>
          <td>getById, add, modify, remove</td>
          <td>❌ Inconsistent (different pattern & naming)</td>
        </tr>
      </tbody>
    </table>

    <h3>Error Handling</h3>
    <ul>
      <li>✅ UserService: Throws domain-specific errors</li>
      <li>❌ PostService: Returns null on not found</li>
      <li>❌ CommentService: Returns { error: string }</li>
    </ul>
    <p><strong>Recommendation:</strong> Standardize on domain-specific error throwing</p>
  </section>

  <section class="layer-violations">
    <h2>🏗️ Layer Architecture Violations</h2>

    <div class="architecture-diagram">
      <pre>
Expected Flow:
API → Application → Domain → Infrastructure ✅

Violations Found:
Domain → Infrastructure (5 instances) ❌
API → Infrastructure (3 instances) ❌
      </pre>
    </div>

    <h3>Domain Layer Accessing Infrastructure</h3>
    <ul>
      <li>
        <strong>core/domain/user.ts:45</strong>
        <p>User entity directly imports from infrastructure/database</p>
        <p><em>Fix: Use repository pattern with dependency injection</em></p>
      </li>
    </ul>
  </section>

  <section class="naming-conventions">
    <h2>📝 Naming Convention Inconsistencies</h2>

    <h3>File Naming</h3>
    <p>⚠️ Mixed conventions detected</p>
    <ul>
      <li>PascalCase: 23 files</li>
      <li>kebab-case: 187 files</li>
      <li>snake_case: 5 files</li>
    </ul>
    <p><strong>Recommendation:</strong> Standardize on kebab-case for all files</p>

    <h3>Files to Rename</h3>
    <ul>
      <li>UserService.ts → user-service.ts</li>
      <li>post_repository.ts → post-repository.ts</li>
    </ul>
  </section>

  <section class="recommendations">
    <h2>💡 Priority Refactoring Recommendations</h2>
    <ol>
      <li><strong>Critical:</strong> Extract business logic from 12 API routes to core services</li>
      <li><strong>High:</strong> Resolve 3 circular dependencies between modules</li>
      <li><strong>High:</strong> Consolidate 8 duplicated validation functions to core</li>
      <li><strong>Medium:</strong> Standardize repository pattern across all repositories</li>
      <li><strong>Low:</strong> Rename 28 files to follow kebab-case convention</li>
    </ol>

    <h3>Refactoring Effort Estimate</h3>
    <ul>
      <li>IoC violations: 8-12 hours</li>
      <li>Circular dependencies: 4-6 hours</li>
      <li>DRY violations: 2-3 hours</li>
      <li>Pattern standardization: 3-4 hours</li>
      <li><strong>Total: 17-25 hours</strong></li>
    </ul>
  </section>

  <section class="architecture-principles">
    <h2>📐 Architecture Decision Records (ADRs)</h2>
    <p>⚠️ No ADRs found - recommended for documenting architectural decisions</p>

    <h3>Suggested ADRs to Create</h3>
    <ul>
      <li>ADR-001: IoC Architecture with Core Module</li>
      <li>ADR-002: Repository Pattern for Data Access</li>
      <li>ADR-003: Error Handling Strategy</li>
      <li>ADR-004: Module Boundaries and Communication</li>
    </ul>
  </section>

  <section class="trend">
    <h2>📈 Architecture Consistency Trend</h2>
    <p><em>Compared to previous analysis:</em></p>
    <ul>
      <li>Architecture Score: 64 → 68 (+4) ✅</li>
      <li>IoC Violations: 15 → 12 (-3) ✅</li>
      <li>Circular Dependencies: 5 → 3 (-2) ✅</li>
      <li>Pattern Consistency: 65% → 72% (+7%) ✅</li>
    </ul>
  </section>
</body>
</html>
```

---

## Integration with Orchestration System

### Dependency Chain

```
Phase 1: import-relationship-mapper (existing)
         └─ Provides dependency graph data

Phase 2: architecture-consistency-agent (NEW)
         ├─ Analyzes IoC compliance
         ├─ Validates module boundaries
         └─ Checks pattern consistency

Phase 3: validation-agent
         └─ Validates refactoring efforts
```

### Execution Time

**~2-4 minutes** for medium codebase

### Configuration

```yaml
agents:
  architecture-consistency-agent:
    priority: 2
    dependencies: [import-relationship-mapper]
    timeout: 240s
    retry: 2
    principles:
      ioc: true
      dry: true
      modularity: true
    thresholds:
      max_ioc_violations: 0
      max_circular_deps: 0
      pattern_consistency: 85%
```

---

## Best Practices

### Preventing Architectural Drift

- Run agent on every PR (CI integration)
- Enforce zero IoC violations (block merges)
- Document architecture decisions (ADRs)
- Regular architecture review meetings
- Pair programming for cross-module changes

### Evolutionary Architecture

- Allow refactoring PRs separate from features
- Track architectural metrics over time
- Celebrate architectural improvements
- Make architectural principles visible (ARCHITECTURE.md)

---

## Output Files

```
.context-kit/analysis/
├─ architecture-report.html      # Interactive HTML report
├─ architecture-summary.json     # Machine-readable results
├─ dependency-graph.dot          # Visual module dependencies
├─ ioc-violations.csv            # IoC compliance issues
└─ pattern-consistency.json      # Design pattern adherence
```

---

## Related Agents

- **code-quality-agent**: Complexity and maintainability overlap
- **import-relationship-mapper**: Dependency graph foundation
- **documentation-agent**: Architecture documentation

---

## References

- [Clean Architecture by Robert C. Martin](https://blog.cleancoder.com/uncle-bob/2012/08/13/the-clean-architecture.html)
- [Domain-Driven Design](https://martinfowler.com/bliki/DomainDrivenDesign.html)
- [Inversion of Control Containers](https://martinfowler.com/articles/injection.html)
- [Architecture Decision Records](https://adr.github.io/)
