# Custom Analytics Implementation

## 1. Event Tracking

### Analytics Hook
```javascript
const useAnalytics = () => {
  const logEvent = async (event) => {
    try {
      await fetch('/api/analytics', {
        method: 'POST',
        body: JSON.stringify({
          event,
          timestamp: Date.now(),
          path: window.location.pathname,
          referrer: document.referrer,
          userAgent: navigator.userAgent,
          viewport: {
            width: window.innerWidth,
            height: window.innerHeight
          }
        })
      });
    } catch (error) {
      console.error('Analytics error:', error);
    }
  };
  
  return { logEvent };
};
```

### Event Types
```typescript
type AnalyticsEvent = {
  type: 'pageview' | 'process_step' | 'interaction' | 'engagement';
  category: string;
  action: string;
  label?: string;
  value?: number;
  metadata?: Record<string, any>;
};
```

### Tracked Events
1. Page Views
   - Project grid visits
   - Individual project views
   - Time on page
   - Exit pages

2. Process Steps
   - Step transitions
   - Time per step
   - Step completion
   - Navigation direction

3. Interactions
   - Resume downloads
   - Project card clicks
   - Navigation arrows
   - Scroll depth

4. Engagement
   - Session duration
   - Return visits
   - Navigation paths
   - Content visibility

### Rate Limiting
```javascript
const RATE_LIMIT = {
  maxEvents: 100,
  timeWindow: 60 * 1000 // 1 minute
};
```

## 2. Data Storage

### File Structure
```
analytics/
├── daily/
│   ├── 2025-03-27.json
│   ├── 2025-03-28.json
│   └── ...
├── weekly/
│   ├── 2025-W13.json
│   └── ...
├── monthly/
│   ├── 2025-03.json
│   └── ...
└── aggregated/
    ├── projects.json
    ├── steps.json
    └── interactions.json
```

### Data Formats

#### Daily Event Log
```json
{
  "date": "2025-03-27",
  "events": [
    {
      "timestamp": 1711544400000,
      "type": "pageview",
      "category": "project",
      "action": "view",
      "label": "nutrien-safety-portal",
      "metadata": {
        "referrer": "/",
        "viewport": {"width": 1440, "height": 900}
      }
    }
  ]
}
```

#### Aggregated Stats
```json
{
  "period": "2025-03",
  "projects": {
    "nutrien-safety-portal": {
      "views": 150,
      "avg_time": 180,
      "step_completion": 0.85
    }
  },
  "steps": {
    "understand": {
      "views": 300,
      "avg_time": 120
    }
  }
}
```

### Backup Strategy
- Daily git commits of analytics data
- Weekly aggregation jobs
- Monthly data exports
- 12-month rolling retention

## 3. Analytics Dashboard

### Implementation
```javascript
// pages/analytics/index.js
import { useState, useEffect } from 'react';
import { LineChart, BarChart } from './components';

export default function AnalyticsDashboard() {
  const [timeframe, setTimeframe] = useState('7d');
  const [metrics, setMetrics] = useState(null);

  useEffect(() => {
    fetchMetrics(timeframe);
  }, [timeframe]);

  return (
    <div className="dashboard">
      <TimeframeSelector value={timeframe} onChange={setTimeframe} />
      <MetricsSummary data={metrics} />
      <VisualizationsGrid>
        <ProjectViews data={metrics?.projects} />
        <StepCompletion data={metrics?.steps} />
        <EngagementMetrics data={metrics?.engagement} />
      </VisualizationsGrid>
    </div>
  );
}
```

### Key Metrics Display
1. Project Engagement
   - Views per project
   - Average time spent
   - Step completion rates
   - Popular navigation paths

2. Process Analysis
   - Step popularity
   - Time per step
   - Drop-off points
   - Navigation patterns

3. User Behavior
   - Session duration
   - Scroll patterns
   - Interaction rates
   - Return frequency

### Export Options
- CSV data export
- JSON raw data
- PDF reports
- Custom date ranges

## 4. Privacy & Security

### Cookie-Free Implementation

#### Meta Referrer Policy
```html
<!-- public/index.html -->
<meta name="referrer" content="strict-origin-when-cross-origin">
```

#### Enhanced Analytics Hook
```javascript
// hooks/useAnalytics.js
const KNOWN_SOURCES = {
  search: [
    'google', 'bing', 'duckduckgo', 'yahoo',
    'baidu', 'yandex'
  ],
  social: [
    'linkedin', 'twitter', 'facebook', 'instagram',
    't.co', 'lnkd.in'
  ],
  portfolio: [
    'behance', 'dribbble', 'github'
  ]
};

const useAnalytics = () => {
  // Session ID management
  const getSessionId = () => {
    let id = sessionStorage.getItem('session_id');
    if (!id) {
      id = Date.now().toString(36) + Math.random().toString(36).substr(2);
      sessionStorage.setItem('session_id', id);
    }
    return id;
  };

  // Enhanced referrer tracking
  const getEnhancedReferrer = () => {
    const documentReferrer = document.referrer;
    const navigation = performance.getEntriesByType('navigation')[0];
    const navigationType = navigation.type;
    
    const urlParams = new URLSearchParams(window.location.search);
    const utmSource = urlParams.get('utm_source');
    const utmMedium = urlParams.get('utm_medium');
    
    const lastPath = sessionStorage.getItem('current_path');
    
    return {
      referrer: documentReferrer,
      navigationType,
      isNewVisit: !documentReferrer && navigationType === 'navigate',
      utmData: {
        source: utmSource,
        medium: utmMedium
      },
      internal: {
        previousPath: lastPath,
        currentPath: window.location.pathname
      }
    };
  };

  // Traffic source categorization
  const categorizeTrafficSource = (referrerData) => {
    const { referrer, utmData, navigationType } = referrerData;
    
    if (utmData.source) {
      return {
        category: 'utm_tagged',
        source: utmData.source,
        medium: utmData.medium
      };
    }
    
    if (!referrer) {
      return {
        category: navigationType === 'reload' ? 'reload' : 'direct',
        source: 'none',
        medium: 'none'
      };
    }
    
    const domain = new URL(referrer).hostname;
    for (const [category, domains] of Object.entries(KNOWN_SOURCES)) {
      if (domains.some(d => domain.includes(d))) {
        return {
          category,
          source: domain,
          medium: 'referral'
        };
      }
    }
    
    return {
      category: 'other',
      source: domain,
      medium: 'referral'
    };
  };

  // Session attribution
  const attributeSession = () => {
    const referrerData = getEnhancedReferrer();
    const attribution = categorizeTrafficSource(referrerData);
    
    if (!sessionStorage.getItem('first_touch')) {
      sessionStorage.setItem('first_touch', JSON.stringify({
        ...attribution,
        timestamp: Date.now()
      }));
    }
    
    sessionStorage.setItem('last_touch', JSON.stringify({
      ...attribution,
      timestamp: Date.now()
    }));
    
    sessionStorage.setItem('current_path', window.location.pathname);
    
    return {
      firstTouch: JSON.parse(sessionStorage.getItem('first_touch')),
      lastTouch: JSON.parse(sessionStorage.getItem('last_touch'))
    };
  };

  // Performance tracking
  const getPageTiming = () => {
    const navigation = performance.getEntriesByType('navigation')[0];
    return {
      loadTime: navigation.loadEventEnd - navigation.startTime,
      domReady: navigation.domContentLoadedEventEnd - navigation.startTime,
      referrerTime: navigation.domainLookupEnd - navigation.domainLookupStart
    };
  };

  // Event logging
  const logEvent = async (event) => {
    try {
      const attribution = attributeSession();
      await fetch('/api/analytics', {
        method: 'POST',
        body: JSON.stringify({
          event,
          sessionId: getSessionId(),
          timestamp: Date.now(),
          path: window.location.pathname,
          attribution,
          timing: getPageTiming(),
          viewport: {
            width: window.innerWidth,
            height: window.innerHeight
          }
        })
      });
    } catch (error) {
      console.error('Analytics error:', error);
    }
  };
  
  return { logEvent };
};
```

### Session-Based Tracking
- Uses sessionStorage for temporary session identification
- Clears when browser tab is closed
- No persistent storage or cookies
- Compliant with privacy regulations

### What We Track
1. Per-Session Data:
   - Page views within session
   - Navigation paths
   - Interaction events
   - Session duration

2. Performance Data:
   - Page load times
   - DOM ready timing
   - Resource timing
   - Navigation timing

3. Referrer Information
   ```javascript
   // Available referrer data without cookies
   const getReferrerData = () => {
     const navigation = performance.getEntriesByType('navigation')[0];
     return {
       // Built-in browser referrer info (same-origin only)
       documentReferrer: document.referrer,
       
       // Navigation timing details
       navigationType: navigation.type, // 'navigate', 'reload', 'back_forward', 'prerender'
       redirectCount: navigation.redirectCount,
       
       // Same-origin navigation only
       previousPage: document.referrer ? new URL(document.referrer).pathname : null,
       
       // Internal navigation tracking
       fromInternalLink: document.referrer.includes(window.location.host),
       
       // Navigation timing
       navigationStart: navigation.startTime,
       redirectTime: navigation.redirectEnd - navigation.redirectStart,
       
       // Limited to same origin due to security policies
       isNewSession: !document.referrer || !document.referrer.includes(window.location.host)
     };
   };
   ```

4. Anonymous Metrics:
   - Viewport dimensions
   - Page paths
   - Feature usage
   - Error occurrences

### Referrer Limitations
1. Same-Origin Policy
   - Full referrer info only from same domain
   - External referrers may be restricted
   - Respects browser privacy settings

2. Available Data
   - Internal page-to-page navigation
   - Navigation type (direct, reload, back/forward)
   - Time spent on previous page (same origin)
   - Number of redirects

3. Not Available
   - External referrer full URLs (privacy restricted)
   - Cross-domain tracking
   - Historical navigation paths
   - Search engine keywords

### What We Don't Track
- No cookies used
- No persistent storage
- No cross-site tracking
- No personal information
- No IP addresses
- No location data
- No browser history
- No device fingerprinting

### Data Handling
```javascript
// Anonymize and validate session data
const sanitizeEventData = (event) => {
  const { sessionId, path, timestamp, ...metrics } = event;
  return {
    sessionId,  // Temporary session ID from sessionStorage
    path,       // Current page path only
    timestamp,  // Event timestamp
    metrics     // Anonymous usage metrics
  };
};
```

### Retention Policy
- Session data: Cleared on tab close
- Raw event data: 30 days
- Aggregated data: 12 months
- Exported reports: Indefinite

### User Notice
```html
<div class="analytics-notice">
  This site collects anonymous usage data to improve user experience.
  No cookies or persistent storage are used.
  All data is cleared when you close your browser tab.
</div>
```

## 5. Implementation Examples

### Page View Tracking
```javascript
// components/ProjectCard.js
export function ProjectCard({ project }) {
  const { logEvent } = useAnalytics();

  useEffect(() => {
    logEvent({
      type: 'pageview',
      category: 'project',
      action: 'view',
      label: project.id
    });
  }, []);

  return <div>{/* Project card content */}</div>;
}
```

### Process Step Tracking
```javascript
// components/ProcessNav.js
export function ProcessNav({ currentStep }) {
  const { logEvent } = useAnalytics();

  const handleStepChange = (step) => {
    logEvent({
      type: 'process_step',
      category: 'navigation',
      action: 'change_step',
      label: step,
      metadata: {
        previousStep: currentStep,
        timestamp: Date.now()
      }
    });
  };

  return <nav>{/* Navigation content */}</nav>;
}
```

### Scroll Depth Tracking
```javascript
// hooks/useScrollTracking.js
export function useScrollTracking() {
  const { logEvent } = useAnalytics();

  useEffect(() => {
    const handleScroll = debounce(() => {
      const scrollDepth = getScrollPercentage();
      if (scrollDepth % 25 === 0) { // Log at 25%, 50%, 75%, 100%
        logEvent({
          type: 'engagement',
          category: 'scroll',
          action: 'depth',
          value: scrollDepth
        });
      }
    }, 500);

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);
}
```

### Integration Points
1. Page Components
   - Mount/unmount tracking
   - Visibility tracking
   - Interaction events

2. Navigation
   - Route changes
   - Step transitions
   - Back/forward navigation

3. Interactions
   - Button clicks
   - Scroll events
   - Mouse movement
   - Touch events

4. Performance
   - Load times
   - Render performance
   - Error tracking
   - Resource timing
