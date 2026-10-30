/**
 * Privacy-First Telemetry & Analytics Engine for Niaz Cloth House
 * Compatible with PostHog, Mixpanel, and standard event schemas.
 * Maintains local session audit trail and emits structured telemetry.
 */

export interface AnalyticsEvent {
  id: string;
  name: string;
  properties?: Record<string, any>;
  timestamp: string;
  url: string;
}

class AnalyticsService {
  private events: AnalyticsEvent[] = [];
  private maxStoredEvents = 100;
  private isInitialized = false;

  init() {
    if (this.isInitialized || typeof window === 'undefined') return;
    this.isInitialized = true;

    // Load persisted session events if any
    try {
      const stored = sessionStorage.getItem('nch_analytics_events');
      if (stored) {
        this.events = JSON.parse(stored);
      }
    } catch {}

    // Track initial page view
    this.trackPageView(window.location.pathname);
  }

  track(name: string, properties?: Record<string, any>) {
    const event: AnalyticsEvent = {
      id: `evt_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
      name,
      properties: {
        ...properties,
        referrer: typeof document !== 'undefined' ? document.referrer : '',
        screenWidth: typeof window !== 'undefined' ? window.innerWidth : 0,
      },
      timestamp: new Date().toISOString(),
      url: typeof window !== 'undefined' ? window.location.href : '',
    };

    this.events.unshift(event);
    if (this.events.length > this.maxStoredEvents) {
      this.events.pop();
    }

    try {
      if (typeof window !== 'undefined') {
        sessionStorage.setItem('nch_analytics_events', JSON.stringify(this.events.slice(0, 50)));
      }
    } catch {}

    // Also send beacon to server if available
    if (typeof navigator !== 'undefined' && typeof navigator.sendBeacon === 'function') {
      try {
        navigator.sendBeacon('/api/analytics/event', JSON.stringify(event));
      } catch {}
    }
  }

  trackPageView(pageName: string, additionalProps?: Record<string, any>) {
    this.track('page_view', {
      page: pageName,
      title: typeof document !== 'undefined' ? document.title : '',
      ...additionalProps,
    });
  }

  getEvents(): AnalyticsEvent[] {
    return [...this.events];
  }

  clear() {
    this.events = [];
    try {
      sessionStorage.removeItem('nch_analytics_events');
    } catch {}
  }
}

export const analytics = new AnalyticsService();
