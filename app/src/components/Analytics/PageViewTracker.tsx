'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { trackPageView } from '@/utils/analytics';

/**
 * PageViewTracker component tracks page views on navigation changes.
 * 
 * This component should be placed in the root layout.
 * It uses the `usePathname` hook to detect route changes and calls the `trackPageView` utility.
 * 
 * @component
 */
export function PageViewTracker() {
  const pathname = usePathname();

  useEffect(() => {
    if (pathname) {
      trackPageView(pathname);
    }
    // Track page view on initial load and subsequent route changes
  }, [pathname]); 

  return null; // This component does not render anything
}
