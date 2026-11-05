/**
 * Object-Oriented Architecture: Inactivity Session Security Manager
 * Encapsulates activity tracking, timer countdowns, and automatic session revocation after 30 minutes.
 */

export interface InactivityCallbacks {
  onWarning: (remainingSeconds: number) => void;
  onTimeout: () => void;
  onActivity: () => void;
}

export class AdminInactivityManager {
  // 30 minutes in milliseconds
  public static readonly TIMEOUT_DURATION_MS = 30 * 60 * 1000;
  // Warning triggered 2 minutes before expiration (at 28 minutes)
  public static readonly WARNING_THRESHOLD_MS = 2 * 60 * 1000;

  private lastActiveTimestamp: number = Date.now();
  private checkIntervalId: NodeJS.Timeout | null = null;
  private isWarningActive: boolean = false;
  private isRunning: boolean = false;
  private readonly callbacks: InactivityCallbacks;

  // DOM Event Listeners
  private readonly activityEvents: string[] = [
    'mousemove',
    'mousedown',
    'keydown',
    'scroll',
    'touchstart',
    'click',
  ];

  constructor(callbacks: InactivityCallbacks) {
    this.callbacks = callbacks;
    this.handleUserActivity = this.handleUserActivity.bind(this);
    this.checkInactivity = this.checkInactivity.bind(this);
  }

  /**
   * Starts monitoring user interactions on the page
   */
  public start(): void {
    if (typeof window === 'undefined' || this.isRunning) return;

    this.isRunning = true;
    this.lastActiveTimestamp = Date.now();
    this.isWarningActive = false;

    // Attach listeners
    this.activityEvents.forEach((event) => {
      window.addEventListener(event, this.handleUserActivity, { passive: true });
    });

    // Check every second for accurate countdown warning
    this.checkIntervalId = setInterval(this.checkInactivity, 1000);
  }

  /**
   * Stops tracking and cleans up event listeners and timers
   */
  public stop(): void {
    if (!this.isRunning) return;

    this.isRunning = false;
    this.isWarningActive = false;

    if (this.checkIntervalId) {
      clearInterval(this.checkIntervalId);
      this.checkIntervalId = null;
    }

    if (typeof window !== 'undefined') {
      this.activityEvents.forEach((event) => {
        window.removeEventListener(event, this.handleUserActivity);
      });
    }
  }

  /**
   * Explicitly resets the timer (e.g. when user clicks "Stay Signed In")
   */
  public resetActivity(): void {
    this.lastActiveTimestamp = Date.now();
    this.isWarningActive = false;
    this.callbacks.onActivity();
  }

  public getElapsedTime(): number {
    return Date.now() - this.lastActiveTimestamp;
  }

  public getRemainingSeconds(): number {
    const elapsed = this.getElapsedTime();
    const remainingMs = Math.max(0, AdminInactivityManager.TIMEOUT_DURATION_MS - elapsed);
    return Math.ceil(remainingMs / 1000);
  }

  private handleUserActivity(): void {
    // Only reset if not currently in warning modal state, or reset proactively
    if (!this.isWarningActive) {
      this.lastActiveTimestamp = Date.now();
    }
  }

  private checkInactivity(): void {
    const elapsed = this.getElapsedTime();

    // Check if 30 minutes have elapsed
    if (elapsed >= AdminInactivityManager.TIMEOUT_DURATION_MS) {
      this.stop();
      this.callbacks.onTimeout();
      return;
    }

    // Check if within the 2-minute warning window
    const timeUntilTimeout = AdminInactivityManager.TIMEOUT_DURATION_MS - elapsed;
    if (timeUntilTimeout <= AdminInactivityManager.WARNING_THRESHOLD_MS) {
      this.isWarningActive = true;
      const remainingSec = Math.ceil(timeUntilTimeout / 1000);
      this.callbacks.onWarning(remainingSec);
    } else {
      this.isWarningActive = false;
    }
  }
}
