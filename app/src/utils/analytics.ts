/**
 * Generates a simple session ID using timestamp and random number.
 * Stores it in sessionStorage.
 * @returns {string} The session ID.
 */
function getSessionId(): string {
  const storageKey = 'tkr_session_id';
  let sessionId = sessionStorage.getItem(storageKey);

  if (!sessionId) {
    sessionId = `${Date.now()}-${Math.random().toString(36).substring(2, 10)}`;
    sessionStorage.setItem(storageKey, sessionId);
  }
  return sessionId;
}

/**
 * Tracks an event. For now, just logs to console.
 * @param {string} eventName - The name of the event.
 * @param {Record<string, any>} properties - Additional event properties.
 */
export function trackEvent(eventName: string, properties: Record<string, any>): void {
  const sessionId = getSessionId();
  const timestamp = new Date().toISOString();
  
  const eventData = {
    event: eventName,
    sessionId,
    timestamp,
    properties,
  };

  console.log('Analytics Event:', eventData); 
  // In a real implementation, this would send data to an analytics backend
  // or store it locally for batch sending according to data_handling rules.
}

/**
 * Tracks a pageview event.
 * @param {string} path - The current page path.
 */
export function trackPageView(path: string): void {
  trackEvent('pageview', { 
    path,
    referrer: document.referrer, // Get referrer from browser
    navigation_type: performance.navigation.type, // 0: navigate, 1: reload, 2: back/forward
   });
}
