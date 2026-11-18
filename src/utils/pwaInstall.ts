export interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed'; platform: string }>;
}

declare global {
  interface Window {
    __nchDeferredInstallPrompt?: BeforeInstallPromptEvent | null;
    __nchAppInstalled?: boolean;
  }
}

export type InstallOutcome = 'installed' | 'dismissed' | 'cached-offline';

const OFFLINE_SHELL_ASSETS = [
  '/',
  '/manifest.json',
  '/pwa-192x192.png',
  '/pwa-512x512.png',
  '/apple-touch-icon.png',
  '/api/store-info',
];

export function isAppRunningStandalone(): boolean {
  if (typeof window === 'undefined') return false;
  return (
    window.matchMedia('(display-mode: standalone)').matches ||
    (window.navigator as unknown as { standalone?: boolean }).standalone === true ||
    Boolean(window.__nchAppInstalled)
  );
}

export function getDeferredInstallPrompt(): BeforeInstallPromptEvent | null {
  if (typeof window === 'undefined') return null;
  return window.__nchDeferredInstallPrompt ?? null;
}

export function subscribePWAInstallState(
  onPromptChange: (prompt: BeforeInstallPromptEvent | null) => void,
  onInstalled: () => void
): () => void {
  if (typeof window === 'undefined') return () => {};

  const syncPrompt = () => {
    onPromptChange(window.__nchDeferredInstallPrompt ?? null);
  };

  const handleBeforeInstall = (e: Event) => {
    e.preventDefault();
    window.__nchDeferredInstallPrompt = e as BeforeInstallPromptEvent;
    syncPrompt();
  };

  const handleCustomPromptReady = () => {
    syncPrompt();
  };

  const handleInstalled = () => {
    window.__nchDeferredInstallPrompt = null;
    window.__nchAppInstalled = true;
    onPromptChange(null);
    onInstalled();
  };

  window.addEventListener('beforeinstallprompt', handleBeforeInstall);
  window.addEventListener('nch:install-prompt-ready', handleCustomPromptReady);
  window.addEventListener('appinstalled', handleInstalled);
  window.addEventListener('nch:app-installed', handleInstalled);

  // Sync immediately in case the event already fired before subscription
  syncPrompt();
  if (isAppRunningStandalone()) {
    onInstalled();
  }

  return () => {
    window.removeEventListener('beforeinstallprompt', handleBeforeInstall);
    window.removeEventListener('nch:install-prompt-ready', handleCustomPromptReady);
    window.removeEventListener('appinstalled', handleInstalled);
    window.removeEventListener('nch:app-installed', handleInstalled);
  };
}

async function waitForPromptBrief(ms: number): Promise<BeforeInstallPromptEvent | null> {
  const immediate = getDeferredInstallPrompt();
  if (immediate) return immediate;

  return new Promise((resolve) => {
    let settled = false;
    const finish = (prompt: BeforeInstallPromptEvent | null) => {
      if (settled) return;
      settled = true;
      window.removeEventListener('nch:install-prompt-ready', onReady);
      clearTimeout(timer);
      resolve(prompt);
    };
    const onReady = () => finish(getDeferredInstallPrompt());
    window.addEventListener('nch:install-prompt-ready', onReady);
    const timer = setTimeout(() => finish(getDeferredInstallPrompt()), ms);
  });
}

async function cacheAppBundleOffline(): Promise<void> {
  if (typeof window === 'undefined') return;

  if ('serviceWorker' in navigator) {
    try {
      await Promise.race([
        navigator.serviceWorker.ready,
        new Promise((resolve) => setTimeout(resolve, 800)),
      ]);
    } catch {
      // Ignore SW readiness errors and fall back to Cache Storage
    }
  }

  if ('caches' in window) {
    try {
      const cache = await caches.open('nch-offline-app-v1');
      await Promise.allSettled(
        OFFLINE_SHELL_ASSETS.map(async (url) => {
          const response = await fetch(url, { cache: 'reload' });
          if (response.ok) {
            await cache.put(url, response);
          }
        })
      );
    } catch {
      // Ignore storage quota / restricted context errors
    }
  }
}

/**
 * Triggers direct OS/browser PWA installation if available, or directly
 * downloads & caches the offline app bundle with zero instruction popups.
 */
export async function triggerDirectAppDownload(): Promise<InstallOutcome> {
  let promptEvent = getDeferredInstallPrompt();

  if (!promptEvent && 'serviceWorker' in navigator) {
    // Allow Service Worker a brief moment to finish activating in case beforeinstallprompt arrives
    promptEvent = await waitForPromptBrief(450);
  }

  if (promptEvent) {
    try {
      await promptEvent.prompt();
      const choice = await promptEvent.userChoice;
      window.__nchDeferredInstallPrompt = null;
      window.dispatchEvent(new CustomEvent('nch:install-prompt-ready'));

      if (choice.outcome === 'accepted') {
        window.__nchAppInstalled = true;
        window.dispatchEvent(new CustomEvent('nch:app-installed'));
        return 'installed';
      }
      return 'dismissed';
    } catch {
      // Fall through to offline caching if prompt invocation fails
    }
  }

  await cacheAppBundleOffline();
  return 'cached-offline';
}
