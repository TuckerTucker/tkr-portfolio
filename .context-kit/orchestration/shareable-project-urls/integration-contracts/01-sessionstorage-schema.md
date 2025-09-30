# Integration Contract 1: SessionStorage Schema

**Owner**: Agent 1 (GitHub Pages Configuration Specialist)
**Consumers**: Agent 2 (Index HTML Script Integration)
**Status**: Draft → Implementation → Validated

---

## Contract Overview

Defines the sessionStorage mechanism used to pass the requested URL path from `404.html` to `index.html` during GitHub Pages client-side routing.

---

## Schema Definition

### TypeScript Interface

```typescript
interface SessionStorageRedirect {
  key: 'redirect';
  value: string; // Full path including query and hash
  lifecycle: 'ephemeral'; // Set once, read once, deleted immediately
  format: string; // Example: "/project/tkr_context_kit" or "/project/foo?query=bar#hash"
}
```

---

## Data Flow

```
User navigates to /project/tkr_context_kit
  ↓
GitHub Pages can't find /project/tkr_context_kit/index.html
  ↓
Returns 404.html
  ↓
404.html script executes:
  sessionStorage.setItem('redirect', '/project/tkr_context_kit')
  location.replace('/')
  ↓
Root index.html loads
  ↓
Restoration script executes BEFORE React:
  const redirect = sessionStorage.redirect
  delete sessionStorage.redirect
  if (redirect && redirect !== location.pathname) {
    history.replaceState(null, null, redirect)
  }
  ↓
React Router sees /project/tkr_context_kit in URL
  ↓
Loads correct project
```

---

## Implementation Examples

### Producer: 404.html (Agent 1)

```html
<!DOCTYPE html>
<html>
  <head>
    <meta charset="utf-8">
    <title>Redirecting...</title>
    <script>
      // Capture the full path (pathname + search + hash)
      var fullPath = location.pathname + location.search + location.hash;

      // Store in sessionStorage
      sessionStorage.setItem('redirect', fullPath);

      // Redirect to root (where index.html lives)
      location.replace(location.origin);
    </script>
  </head>
  <body>
    <!-- No body content needed - redirect happens immediately -->
  </body>
</html>
```

**Key Points**:
- ✅ Must capture full path (pathname + search + hash)
- ✅ Must use `location.replace()` not `location.href` (no history entry)
- ✅ Must redirect to `location.origin` (root, no path)

---

### Consumer: index.html (Agent 2)

```html
<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Sean "Tucker" Harley | UX Designer</title>

    <!-- CRITICAL: This script must run BEFORE React loads -->
    <script>
      (function() {
        // Read the redirect path
        var redirect = sessionStorage.redirect;

        // Clean up immediately
        delete sessionStorage.redirect;

        // Only restore if:
        // 1. Redirect exists
        // 2. We're not already on that path
        if (redirect && redirect !== location.pathname) {
          // Use replaceState so back button works correctly
          history.replaceState(null, null, redirect);
        }
      })();
    </script>
  </head>
  <body style="background:#333">
    <div id="root"></div>
    <!-- React loads here -->
  </body>
</html>
```

**Key Points**:
- ✅ Must execute BEFORE React script loads
- ✅ Must use `history.replaceState()` not `location.href` (no reload)
- ✅ Must delete sessionStorage immediately (one-time use)
- ✅ Must check `redirect !== location.pathname` (avoid infinite loop)

---

## Validation Criteria

### Unit Tests

```javascript
describe('SessionStorage Redirect Contract', () => {
  it('404.html sets redirect with full path', () => {
    // Simulate 404.html
    sessionStorage.setItem('redirect', '/project/test?query=foo#hash');
    expect(sessionStorage.redirect).toBe('/project/test?query=foo#hash');
  });

  it('index.html consumes and deletes redirect', () => {
    sessionStorage.setItem('redirect', '/project/test');

    // Simulate restoration script
    const redirect = sessionStorage.redirect;
    delete sessionStorage.redirect;

    expect(redirect).toBe('/project/test');
    expect(sessionStorage.redirect).toBeUndefined();
  });

  it('handles missing redirect gracefully', () => {
    const redirect = sessionStorage.redirect;
    delete sessionStorage.redirect;

    expect(redirect).toBeUndefined(); // Should not throw
  });
});
```

---

### Integration Tests

```bash
# Test 404.html redirect
1. Start local server: python3 -m http.server 8000 -d dist
2. Visit: http://localhost:8000/project/tkr_context_kit
3. Verify: 404.html loads
4. Verify: sessionStorage.redirect = '/project/tkr_context_kit'
5. Verify: Browser redirects to root
6. Verify: sessionStorage.redirect is deleted
7. Verify: URL bar shows /project/tkr_context_kit
8. Verify: Correct project loads
```

---

## Edge Cases

### 1. Query Parameters & Hash
```javascript
// Input: /project/foo?query=bar#section
// 404.html stores: '/project/foo?query=bar#section'
// index.html restores: Full path preserved
```

### 2. Root Path
```javascript
// Input: /
// 404.html: Should not trigger (root exists)
// No sessionStorage set
```

### 3. Multiple Redirects
```javascript
// First redirect: /project/foo
sessionStorage.setItem('redirect', '/project/foo');
location.replace('/');

// Second redirect (before first completes): /project/bar
// Overwrites: sessionStorage.redirect = '/project/bar'
// Only last redirect wins (acceptable behavior)
```

### 4. sessionStorage Disabled
```javascript
// 404.html
try {
  sessionStorage.setItem('redirect', fullPath);
} catch (e) {
  // Fallback: Just redirect to root
  console.warn('sessionStorage disabled, direct links will not work');
}
location.replace(location.origin);

// index.html
try {
  var redirect = sessionStorage.redirect;
  delete sessionStorage.redirect;
  if (redirect) history.replaceState(null, null, redirect);
} catch (e) {
  // Graceful degradation - root page loads
  console.warn('sessionStorage disabled');
}
```

---

## Security Considerations

### XSS Prevention
```javascript
// ❌ BAD: Direct HTML injection
document.body.innerHTML = '<p>Redirecting to ' + redirect + '</p>';

// ✅ GOOD: No DOM manipulation in 404.html
// Just store and redirect

// ✅ GOOD: history.replaceState only changes URL
history.replaceState(null, null, redirect); // No code execution
```

### Path Validation
```javascript
// Optional: Validate path format
function isValidPath(path) {
  return path.startsWith('/') && !path.includes('//');
}

if (redirect && isValidPath(redirect) && redirect !== location.pathname) {
  history.replaceState(null, null, redirect);
}
```

---

## Performance Considerations

- **Overhead**: ~1ms for sessionStorage operations (negligible)
- **Redirect Time**: ~100ms for 404.html → index.html navigation
- **User Experience**: Slight flash as 404.html loads then redirects (unavoidable with GitHub Pages)

---

## Acceptance Criteria

- [ ] 404.html correctly stores full path in sessionStorage
- [ ] 404.html redirects to root using `location.replace()`
- [ ] index.html reads redirect before React loads
- [ ] index.html deletes sessionStorage immediately after reading
- [ ] index.html uses `history.replaceState()` not `location.href`
- [ ] Query parameters and hash preserved
- [ ] No infinite redirect loops
- [ ] sessionStorage disabled handled gracefully
- [ ] Integration test passes with local server

---

## Change Log

| Date | Version | Change | Author |
|------|---------|--------|--------|
| 2025-09-30 | 1.0.0 | Initial contract definition | Orchestrator |

---

## Notes

- This pattern is standard for SPAs on GitHub Pages
- sessionStorage (not localStorage) ensures one-time use
- Must execute before React to avoid race conditions
- React Router will handle the restored URL naturally
