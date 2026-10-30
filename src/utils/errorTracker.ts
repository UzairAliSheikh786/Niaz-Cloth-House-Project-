/**
 * Production Client Error Telemetry & Exception Tracking Engine
 * Catches unhandled runtime exceptions, promise rejections, and context breadcrumbs.
 * Formatted for Sentry / Datadog style ingestion.
 */

export interface ErrorReport {
  id: string;
  message: string;
  stack?: string;
  category: 'runtime' | 'unhandledrejection' | 'network' | 'auth' | 'ui';
  timestamp: string;
  url: string;
  userAgent: string;
  breadcrumbs: string[];
}

class ErrorTrackerService {
  private reports: ErrorReport[] = [];
  private breadcrumbs: string[] = [];
  private maxReports = 50;
  private maxBreadcrumbs = 20;
  private isInitialized = false;

  init() {
    if (this.isInitialized || typeof window === 'undefined') return;
    this.isInitialized = true;

    // Listen for uncaught runtime errors
    window.addEventListener('error', (event) => {
      this.captureException(event.error || new Error(event.message), {
        category: 'runtime',
        source: event.filename,
        line: event.lineno,
        col: event.colno,
      });
    });

    // Listen for unhandled promise rejections
    window.addEventListener('unhandledrejection', (event) => {
      this.captureException(
        event.reason instanceof Error ? event.reason : new Error(String(event.reason)),
        { category: 'unhandledrejection' }
      );
    });

    this.addBreadcrumb('ErrorTracker initialized');
  }

  addBreadcrumb(message: string) {
    const entry = `[${new Date().toLocaleTimeString()}] ${message}`;
    this.breadcrumbs.push(entry);
    if (this.breadcrumbs.length > this.maxBreadcrumbs) {
      this.breadcrumbs.shift();
    }
  }

  captureException(error: Error | unknown, context?: { category?: ErrorReport['category']; [key: string]: any }) {
    const errObj = error instanceof Error ? error : new Error(String(error));
    
    // Ignore benign cross-origin iframe resize or dev HMR warnings
    if (errObj.message.includes('ResizeObserver') || errObj.message.includes('WebSocket')) {
      return;
    }

    const report: ErrorReport = {
      id: `err_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
      message: errObj.message || 'Unknown error occurred',
      stack: errObj.stack,
      category: context?.category || 'runtime',
      timestamp: new Date().toISOString(),
      url: typeof window !== 'undefined' ? window.location.href : '',
      userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : '',
      breadcrumbs: [...this.breadcrumbs],
    };

    this.reports.unshift(report);
    if (this.reports.length > this.maxReports) {
      this.reports.pop();
    }

    console.error('🚨 [ErrorTracker Captured]', report.message, { context, stack: report.stack });

    // Optional beacon dispatch to backend logging
    if (typeof navigator !== 'undefined' && typeof navigator.sendBeacon === 'function') {
      try {
        navigator.sendBeacon('/api/errors/log', JSON.stringify(report));
      } catch {}
    }
  }

  getReports(): ErrorReport[] {
    return [...this.reports];
  }

  clear() {
    this.reports = [];
    this.breadcrumbs = [];
  }
}

export const errorTracker = new ErrorTrackerService();
