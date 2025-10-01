# Accessibility (a11y) Review Agent - Technical Specification

## Overview

An Accessibility Review Agent ensures web applications are usable by everyone, including people with disabilities. It analyzes code for WCAG compliance, semantic HTML, keyboard navigation, screen reader compatibility, and inclusive design patterns.

**Mission**: Make web applications accessible to all users regardless of ability, ensuring legal compliance and inclusive user experiences.

---

## Core Principles

- **WCAG 2.1 AA Compliance**: Meet Level AA standards (legal requirement in many jurisdictions)
- **Inclusive by Default**: Accessibility is not optional
- **Perceivable, Operable, Understandable, Robust**: Follow POUR principles
- **Progressive Enhancement**: Support assistive technologies and fallbacks

---

## Detection Strategies by Category

### 1. Semantic HTML Structure

#### Patterns Detected

**Non-Semantic Markup**
```html
<!-- ❌ Bad: Divs for everything -->
<div class="header">
  <div class="nav">
    <div class="nav-item">Home</div>
  </div>
</div>

<!-- ✅ Good: Semantic HTML5 -->
<header>
  <nav>
    <a href="/">Home</a>
  </nav>
</header>
```

**Missing Landmarks**
```html
<!-- ❌ Bad: No ARIA landmarks -->
<div class="container">
  <div class="sidebar">...</div>
  <div class="content">...</div>
</div>

<!-- ✅ Good: Proper landmarks -->
<main>
  <aside aria-label="Sidebar navigation">...</aside>
  <article>...</article>
</main>
```

**Heading Hierarchy Violations**
```html
<!-- ❌ Bad: Skipped heading levels -->
<h1>Main Title</h1>
<h3>Subsection</h3>  <!-- Skipped h2! -->

<!-- ✅ Good: Proper hierarchy -->
<h1>Main Title</h1>
<h2>Section</h2>
<h3>Subsection</h3>
```

#### Agent Actions

- `Grep` for `<div>` and `<span>` that should be semantic elements
- Parse HTML/JSX to validate heading hierarchy (h1→h2→h3, no skipping)
- Check for landmark elements: `<header>`, `<nav>`, `<main>`, `<aside>`, `<footer>`
- Validate document structure has exactly one `<main>` element

---

### 2. ARIA Attributes & Roles

#### Patterns Detected

**Missing ARIA Labels**
```jsx
// ❌ Bad: Icon button without label
<button onClick={handleClose}>
  <XIcon />
</button>

// ✅ Good: Accessible label
<button onClick={handleClose} aria-label="Close dialog">
  <XIcon />
</button>
```

**Redundant ARIA Roles**
```html
<!-- ❌ Bad: Redundant role on semantic element -->
<nav role="navigation">...</nav>

<!-- ✅ Good: Semantic element alone is sufficient -->
<nav>...</nav>
```

**Invalid ARIA Usage**
```html
<!-- ❌ Bad: Invalid aria-label on div (not interactive) -->
<div aria-label="User profile">...</div>

<!-- ✅ Good: Use proper semantics or role -->
<section aria-labelledby="profile-heading">
  <h2 id="profile-heading">User Profile</h2>
  ...
</section>
```

**Missing Live Region Announcements**
```jsx
// ❌ Bad: Dynamic content without announcement
<div>
  {error && <p>{error}</p>}
</div>

// ✅ Good: Screen reader announcement
<div role="alert" aria-live="polite">
  {error && <p>{error}</p>}
</div>
```

#### Agent Actions

- `Grep` for interactive elements without labels: `<button[^>]*>[\s]*<svg`
- Validate ARIA roles match element semantics
- Check for proper `aria-label`, `aria-labelledby`, `aria-describedby`
- Verify live regions for dynamic content
- Detect invalid ARIA attribute usage

---

### 3. Keyboard Navigation

#### Patterns Detected

**Non-Keyboard Accessible Interactions**
```jsx
// ❌ Bad: Click handler on div (not keyboard accessible)
<div onClick={handleClick}>Click me</div>

// ✅ Good: Use button or add keyboard handlers
<button onClick={handleClick}>Click me</button>

// ✅ Alternative: Make div keyboard accessible
<div
  role="button"
  tabIndex={0}
  onClick={handleClick}
  onKeyDown={(e) => e.key === 'Enter' && handleClick()}
>
  Click me
</div>
```

**Missing Focus Management**
```jsx
// ❌ Bad: Modal opens without focus management
function Modal({ isOpen, children }) {
  return isOpen ? <div className="modal">{children}</div> : null;
}

// ✅ Good: Focus trap and restoration
function Modal({ isOpen, children }) {
  const modalRef = useRef();

  useEffect(() => {
    if (isOpen && modalRef.current) {
      const previousFocus = document.activeElement;
      modalRef.current.focus();

      return () => previousFocus?.focus(); // Restore focus on close
    }
  }, [isOpen]);

  return isOpen ? (
    <div ref={modalRef} className="modal" tabIndex={-1} role="dialog">
      {children}
    </div>
  ) : null;
}
```

**Tab Index Misuse**
```html
<!-- ❌ Bad: Positive tabindex (disrupts natural order) -->
<button tabindex="5">Submit</button>

<!-- ✅ Good: Use natural tab order or 0/-1 only -->
<button>Submit</button>
<div tabindex="-1">Programmatically focusable</div>
```

**Missing Skip Links**
```html
<!-- ❌ Bad: No way to skip repetitive nav -->
<nav>
  <a href="/">Home</a>
  <a href="/about">About</a>
  <!-- ... 20 more links -->
</nav>
<main>Content</main>

<!-- ✅ Good: Skip navigation link -->
<a href="#main-content" class="skip-link">Skip to main content</a>
<nav>...</nav>
<main id="main-content">Content</main>
```

#### Agent Actions

- `Grep` for `onClick` handlers on non-interactive elements
- Check for corresponding keyboard handlers (`onKeyDown`, `onKeyPress`)
- Validate `tabIndex` usage (warn on positive values >0)
- Detect modal/dialog components without focus management
- Check for skip links in navigation-heavy pages

---

### 4. Images & Alternative Text

#### Patterns Detected

**Missing Alt Text**
```jsx
// ❌ Bad: Image without alt
<img src="profile.jpg" />

// ✅ Good: Descriptive alt text
<img src="profile.jpg" alt="User profile photo of Jane Doe" />

// ✅ Good: Decorative image (empty alt)
<img src="decorative-border.png" alt="" />
```

**Bad Alt Text Patterns**
```jsx
// ❌ Bad: Non-descriptive alt
<img src="chart.png" alt="image" />
<img src="data.png" alt="graph.png" />

// ✅ Good: Descriptive alt
<img src="chart.png" alt="Bar chart showing 40% increase in sales Q4 2024" />
```

**Icon Fonts Without Labels**
```html
<!-- ❌ Bad: Icon font without text alternative -->
<button><i class="icon-delete"></i></button>

<!-- ✅ Good: Hidden label or aria-label -->
<button aria-label="Delete item">
  <i class="icon-delete" aria-hidden="true"></i>
</button>
```

#### Agent Actions

- `Grep` for `<img>` tags without `alt` attribute
- Check for empty alt on decorative images vs missing alt
- Validate alt text quality (not "image", "picture", filename)
- Detect icon fonts without text alternatives
- Check SVGs for `<title>` and `role="img"`

---

### 5. Color Contrast

#### Patterns Detected

**Insufficient Contrast Ratios**
```css
/* ❌ Bad: Light gray on white (contrast ratio 2.1:1) */
.text {
  color: #c0c0c0;
  background: #ffffff;
}

/* ✅ Good: Dark gray on white (contrast ratio 7.4:1) */
.text {
  color: #595959;
  background: #ffffff;
}
```

**Color-Only Information**
```jsx
// ❌ Bad: Color as only indicator
<p style={{ color: 'red' }}>Error</p>
<p style={{ color: 'green' }}>Success</p>

// ✅ Good: Icon + color + text
<p className="error">
  <ErrorIcon /> Error: Invalid input
</p>
<p className="success">
  <SuccessIcon /> Success: Saved
</p>
```

#### Agent Actions

- Parse CSS color values from design tokens/stylesheets
- Calculate WCAG contrast ratios
- Check for color-only state indicators
- Validate against WCAG AA requirements:
  - Normal text: 4.5:1 minimum
  - Large text (18pt+): 3:1 minimum
  - UI components: 3:1 minimum

#### Metrics

```
Contrast Ratio = (L1 + 0.05) / (L2 + 0.05)
Where L1 is luminance of lighter color, L2 is darker

WCAG AA Requirements:
- Normal text: ≥4.5:1
- Large text: ≥3:1
- Graphical objects: ≥3:1
```

---

### 6. Form Accessibility

#### Patterns Detected

**Missing Form Labels**
```jsx
// ❌ Bad: Input without label
<input type="text" name="email" />

// ✅ Good: Associated label
<label htmlFor="email-input">Email</label>
<input type="text" id="email-input" name="email" />

// ✅ Alternative: Wrapped label
<label>
  Email
  <input type="text" name="email" />
</label>
```

**Missing Error Associations**
```jsx
// ❌ Bad: Error not programmatically associated
<input type="email" />
<p className="error">Invalid email format</p>

// ✅ Good: aria-describedby links error
<input
  type="email"
  aria-invalid="true"
  aria-describedby="email-error"
/>
<p id="email-error" className="error">Invalid email format</p>
```

**Missing Required Indicators**
```jsx
// ❌ Bad: Only visual asterisk
<label>
  Name *
  <input type="text" required />
</label>

// ✅ Good: Screen reader indication
<label>
  Name <span aria-hidden="true">*</span>
  <input type="text" required aria-required="true" />
</label>
```

**Fieldset/Legend Missing**
```html
<!-- ❌ Bad: Radio buttons without grouping -->
<label><input type="radio" name="size" /> Small</label>
<label><input type="radio" name="size" /> Large</label>

<!-- ✅ Good: Grouped with fieldset/legend -->
<fieldset>
  <legend>Select size</legend>
  <label><input type="radio" name="size" /> Small</label>
  <label><input type="radio" name="size" /> Large</label>
</fieldset>
```

#### Agent Actions

- `Grep` for `<input>` without associated `<label>`
- Check for `aria-invalid` and `aria-describedby` on error states
- Validate required field indicators
- Check radio/checkbox groups have `<fieldset>` and `<legend>`
- Verify autocomplete attributes for personal data

---

### 7. Focus Indicators

#### Patterns Detected

**Removed Focus Outlines**
```css
/* ❌ Bad: Removes focus indicator */
button:focus {
  outline: none;
}

/* ✅ Good: Custom focus style that's visible */
button:focus-visible {
  outline: 2px solid #0066cc;
  outline-offset: 2px;
}
```

**Invisible Focus States**
```css
/* ❌ Bad: Focus color same as background */
a:focus {
  background: #ffffff;
  color: #ffffff;
}
```

#### Agent Actions

- `Grep` for `outline: none` without replacement
- Check focus-visible styles exist
- Validate focus indicator contrast meets 3:1 ratio
- Ensure focus indicators are visible on all interactive elements

---

### 8. Media Accessibility

#### Patterns Detected

**Videos Without Captions**
```html
<!-- ❌ Bad: Video without captions -->
<video src="tutorial.mp4" controls></video>

<!-- ✅ Good: Captions provided -->
<video src="tutorial.mp4" controls>
  <track kind="captions" src="tutorial.vtt" srclang="en" label="English" />
</video>
```

**Audio Without Transcripts**
```html
<!-- ❌ Bad: Podcast without transcript -->
<audio src="episode.mp3" controls></audio>

<!-- ✅ Good: Link to transcript -->
<audio src="episode.mp3" controls></audio>
<a href="transcript.html">View transcript</a>
```

**Autoplay Media**
```html
<!-- ❌ Bad: Autoplaying audio (WCAG failure) -->
<audio src="music.mp3" autoplay></audio>

<!-- ✅ Good: User-initiated playback -->
<audio src="music.mp3" controls></audio>
```

#### Agent Actions

- `Grep` for `<video>` without `<track>` elements
- Check for `autoplay` attribute on media elements
- Validate captions/transcripts availability

---

### 9. Language & Internationalization

#### Patterns Detected

**Missing Language Declaration**
```html
<!-- ❌ Bad: No language specified -->
<html>
  <head><title>My App</title></head>
  ...
</html>

<!-- ✅ Good: Language declared -->
<html lang="en">
  <head><title>My App</title></head>
  ...
</html>
```

**Language Changes Not Marked**
```html
<!-- ❌ Bad: Foreign language without markup -->
<p>Welcome! Bienvenue!</p>

<!-- ✅ Good: Language change marked -->
<p>Welcome! <span lang="fr">Bienvenue</span>!</p>
```

#### Agent Actions

- Check `<html>` has `lang` attribute
- Detect language changes without `lang` markup
- Validate BCP 47 language codes

---

### 10. Motion & Animation

#### Patterns Detected

**No Reduced Motion Support**
```css
/* ❌ Bad: Always animates */
.element {
  animation: spin 2s infinite;
}

/* ✅ Good: Respects user preference */
@media (prefers-reduced-motion: no-preference) {
  .element {
    animation: spin 2s infinite;
  }
}

@media (prefers-reduced-motion: reduce) {
  .element {
    animation: none;
  }
}
```

#### Agent Actions

- `Grep` for CSS animations without `prefers-reduced-motion`
- Check JavaScript animations respect motion preferences
- Validate `matchMedia('(prefers-reduced-motion: reduce)')` usage

---

## Tool Usage Pattern

```
Phase 1: Static HTML/JSX Analysis (Fast)
├─ Grep: Semantic HTML violations
├─ Read: Component files for ARIA patterns
├─ Parse: HTML/JSX structure
└─ Output: Semantic and ARIA issues

Phase 2: Contrast Analysis (Medium)
├─ Read: CSS files, design tokens
├─ Calculate: Contrast ratios
├─ Cross-reference: Text on backgrounds
└─ Output: Contrast failures

Phase 3: Keyboard Navigation Review (Medium)
├─ Grep: Interactive elements
├─ Check: Keyboard event handlers
├─ Validate: Focus management patterns
└─ Output: Keyboard accessibility issues

Phase 4: Automated Testing (Optional)
├─ Bash: axe-core, pa11y, or Lighthouse
├─ Parse: Accessibility audit results
└─ Output: Runtime accessibility violations
```

---

## Scoring System

### Accessibility Score (0-100)

```
Score = 100 - (critical_violations × 20)
            - (serious_violations × 10)
            - (moderate_violations × 5)
            - (minor_violations × 1)

WCAG Compliance Levels:
- Level A: Basic accessibility (legal minimum)
- Level AA: Standard compliance (target)
- Level AAA: Enhanced accessibility (aspirational)

Thresholds:
95-100: WCAG AAA
85-94:  WCAG AA (Compliant)
70-84:  WCAG A (Partial)
<70:    Non-compliant
```

### Issue Severity Classification

- **Critical (20 pts)**: Missing alt text on content images, inaccessible forms, keyboard traps
- **Serious (10 pts)**: Contrast failures, missing ARIA labels, focus issues
- **Moderate (5 pts)**: Heading hierarchy violations, redundant ARIA
- **Minor (1 pt)**: Missing landmarks, suboptimal semantics

---

## HTML Report Output Structure

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <style>/* Uses W3C design tokens with high contrast */</style>
</head>
<body>
  <section class="executive-summary">
    <h1>Accessibility Review Report</h1>
    <div class="score-badge aa-compliant">87/100</div>
    <div class="compliance-level">
      <strong>WCAG 2.1 Level AA</strong> - Compliant ✅
    </div>
    <div class="quick-stats">
      <span class="critical">0 Critical Violations</span>
      <span class="serious">3 Serious Issues</span>
      <span class="moderate">8 Moderate Issues</span>
      <span class="minor">15 Minor Issues</span>
    </div>
  </section>

  <section class="wcag-checklist">
    <h2>✓ WCAG 2.1 AA Compliance Checklist</h2>
    <table>
      <thead>
        <tr>
          <th>Principle</th>
          <th>Guideline</th>
          <th>Status</th>
          <th>Issues</th>
        </tr>
      </thead>
      <tbody>
        <tr class="pass">
          <td>Perceivable</td>
          <td>1.1 Text Alternatives</td>
          <td>✅ Pass</td>
          <td>0</td>
        </tr>
        <tr class="fail">
          <td>Perceivable</td>
          <td>1.4.3 Contrast (Minimum)</td>
          <td>❌ Fail</td>
          <td>3</td>
        </tr>
        <tr class="pass">
          <td>Operable</td>
          <td>2.1 Keyboard Accessible</td>
          <td>✅ Pass</td>
          <td>0</td>
        </tr>
        <tr class="warning">
          <td>Operable</td>
          <td>2.4 Navigable</td>
          <td>⚠️ Warning</td>
          <td>2</td>
        </tr>
      </tbody>
    </table>
  </section>

  <section class="serious-issues">
    <h2>🔴 Serious Issues</h2>
    <details open>
      <summary>Contrast Failure: Button text on primary color</summary>
      <div class="issue-card">
        <p><strong>File:</strong> src/components/Button.tsx:15</p>
        <p><strong>WCAG:</strong> 1.4.3 Contrast (Minimum) - Level AA</p>
        <p><strong>Current Ratio:</strong> 3.2:1 (Required: 4.5:1)</p>

        <div class="visual-example">
          <div style="background: #5b9bd5; color: #ffffff; padding: 8px;">
            Current: White on Light Blue (3.2:1)
          </div>
          <div style="background: #2563eb; color: #ffffff; padding: 8px;">
            Fixed: White on Darker Blue (7.4:1) ✅
          </div>
        </div>

        <pre><code class="language-css">
/* Current (❌) */
.btn-primary {
  background-color: #5b9bd5;  /* Light blue */
  color: #ffffff;              /* White text - insufficient contrast! */
}

/* Fixed (✅) */
.btn-primary {
  background-color: #2563eb;  /* Darker blue */
  color: #ffffff;              /* White text - 7.4:1 contrast */
}
        </code></pre>

        <div class="impact">
          <h4>Impact</h4>
          <p>Users with low vision or color blindness cannot read button text.
             Affects approximately 4.5% of population (300 million worldwide).</p>
        </div>

        <div class="remediation">
          <h4>How to Fix</h4>
          <ol>
            <li>Use darker blue (#2563eb) for sufficient contrast</li>
            <li>Or use dark text (#1e293b) on light blue background</li>
            <li>Verify with contrast checker tool</li>
          </ol>
        </div>
      </div>
    </details>
  </section>

  <section class="keyboard-nav">
    <h2>⌨️ Keyboard Navigation</h2>
    <div class="summary">
      <p>✅ All interactive elements are keyboard accessible</p>
      <p>⚠️ 2 components missing visible focus indicators</p>
    </div>

    <h3>Missing Focus Indicators</h3>
    <ul>
      <li>
        <strong>src/components/Card.tsx:23</strong>
        <p>Clickable card has <code>outline: none</code> without replacement</p>
        <p><em>Fix: Add <code>:focus-visible</code> styles</em></p>
      </li>
    </ul>
  </section>

  <section class="screen-reader">
    <h2>🔊 Screen Reader Compatibility</h2>
    <p>✅ Semantic HTML structure</p>
    <p>✅ ARIA landmarks properly used</p>
    <p>⚠️ 5 icon buttons missing accessible labels</p>

    <h3>Missing ARIA Labels</h3>
    <ul>
      <li>
        <strong>src/components/Header.tsx:45</strong>
        <pre><code>&lt;button onClick={handleMenu}&gt;
  &lt;MenuIcon /&gt;
&lt;/button&gt;</code></pre>
        <p><em>Fix: Add <code>aria-label="Open menu"</code></em></p>
      </li>
    </ul>
  </section>

  <section class="recommendations">
    <h2>💡 Priority Recommendations</h2>
    <ol>
      <li><strong>High Priority:</strong> Fix 3 color contrast failures (WCAG AA requirement)</li>
      <li><strong>Medium Priority:</strong> Add ARIA labels to 5 icon buttons</li>
      <li><strong>Low Priority:</strong> Improve heading hierarchy in documentation pages</li>
    </ol>
  </section>

  <section class="resources">
    <h2>📚 Accessibility Resources</h2>
    <ul>
      <li><a href="https://www.w3.org/WAI/WCAG21/quickref/">WCAG 2.1 Quick Reference</a></li>
      <li><a href="https://webaim.org/resources/contrastchecker/">WebAIM Contrast Checker</a></li>
      <li><a href="https://www.a11yproject.com/">The A11Y Project</a></li>
      <li><a href="https://www.deque.com/axe/">axe DevTools Browser Extension</a></li>
    </ul>
  </section>
</body>
</html>
```

---

## Integration with Orchestration System

### Dependency Chain

```
Phase 1: accessibility-agent (INDEPENDENT or after react-component-analyzer)
         └─ Analyzes components for a11y patterns

Phase 2: design-system agent
         └─ Validates design tokens meet contrast requirements

Phase 3: validation-agent
         └─ Validates accessibility fixes
```

### Execution Time

**~1-3 minutes** for medium codebase

### Configuration

```yaml
agents:
  accessibility-agent:
    priority: 2
    dependencies: []
    timeout: 180s
    retry: 2
    wcag_level: 'AA'  # A, AA, or AAA
    contrast_threshold: 4.5  # Normal text
    check_runtime: false  # Run axe-core tests (slower)
```

---

## Best Practices

### Automated + Manual Testing

- Static analysis catches ~30-50% of issues
- Manual testing with screen readers required for full coverage
- Test with actual assistive technologies (NVDA, JAWS, VoiceOver)
- Include users with disabilities in testing

### Progressive Enhancement

- Start with semantic HTML
- Add ARIA only when semantic HTML insufficient
- Test without CSS/JavaScript enabled
- Ensure core functionality works for all

---

## Output Files

```
.context-kit/analysis/
├─ accessibility-report.html     # Interactive HTML report
├─ accessibility-summary.json    # Machine-readable results
├─ wcag-checklist.json           # WCAG compliance status
└─ contrast-failures.csv         # Color contrast issues
```

---

## Related Agents

- **design-system agent**: Validates accessible design tokens
- **code-quality-agent**: Semantic HTML best practices
- **documentation-agent**: Accessibility documentation

---

## References

- [WCAG 2.1 Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)
- [ARIA Authoring Practices Guide](https://www.w3.org/WAI/ARIA/apg/)
- [WebAIM Resources](https://webaim.org/)
- [Deque University](https://dequeuniversity.com/)
