import React, { Suspense, lazy, useEffect, useState } from 'react';
import { AuthProvider } from './context/AuthContext';
import { ShopProvider, useShop } from './context/ShopContext';
import { ReviewProvider } from './context/ReviewContext';
import { NavigationProvider, useNavigation } from './context/NavigationContext';
import { Header } from './components/Header';
import { Footer } from './components/Footer';
import { HomePage } from './pages/HomePage';
import { FloatingWhatsAppButton } from './components/FloatingWhatsAppButton';
import { FloatingCurrencyDock } from './components/FloatingCurrencyDock';
import { SEOHead } from './components/SEOHead';
import { OfflineIndicator } from './components/OfflineIndicator';
import { RouteLoadingFallback } from './components/RouteSkeletons';

// Route-level code splitting (loaded on demand)
const ShopPage = lazy(() => import('./pages/ShopPage').then((m) => ({ default: m.ShopPage })));
const ProductDetailPage = lazy(() =>
  import('./pages/ProductDetailPage').then((m) => ({ default: m.ProductDetailPage }))
);
const LocationPage = lazy(() =>
  import('./pages/LocationPage').then((m) => ({ default: m.LocationPage }))
);
const AdminPage = lazy(() => import('./pages/AdminPage').then((m) => ({ default: m.AdminPage })));
const LegalPage = lazy(() => import('./pages/LegalPage').then((m) => ({ default: m.LegalPage })));
const UXDesignReelPage = lazy(() =>
  import('./pages/UXDesignReelPage').then((m) => ({ default: m.UXDesignReelPage }))
);
const NotFoundPage = lazy(() =>
  import('./pages/NotFoundPage').then((m) => ({ default: m.NotFoundPage }))
);

// Modal & secondary overlay code splitting (loaded only when needed or idle)
const CartDrawer = lazy(() =>
  import('./components/CartDrawer').then((m) => ({ default: m.CartDrawer }))
);
const SearchModal = lazy(() =>
  import('./components/SearchModal').then((m) => ({ default: m.SearchModal }))
);
const CheckoutModal = lazy(() =>
  import('./components/CheckoutModal').then((m) => ({ default: m.CheckoutModal }))
);
const InteractiveStoreMapModal = lazy(() =>
  import('./components/InteractiveStoreMapModal').then((m) => ({
    default: m.InteractiveStoreMapModal,
  }))
);
const PatronAuthModal = lazy(() =>
  import('./components/PatronAuthModal').then((m) => ({ default: m.PatronAuthModal }))
);
const CookieConsent = lazy(() =>
  import('./components/CookieConsent').then((m) => ({ default: m.CookieConsent }))
);
const GeminiChatbot = lazy(() =>
  import('./components/GeminiChatbot').then((m) => ({ default: m.GeminiChatbot }))
);
const BrandEntranceReveal = lazy(() =>
  import('./components/BrandEntranceReveal').then((m) => ({ default: m.BrandEntranceReveal }))
);
const OnboardingTutorial = lazy(() =>
  import('./components/OnboardingTutorial').then((m) => ({ default: m.OnboardingTutorial }))
);
const AtelierAmbient3DBackground = lazy(() =>
  import('./components/3d/AtelierAmbient3DBackground').then((m) => ({
    default: m.AtelierAmbient3DBackground,
  }))
);

const AppContent: React.FC = () => {
  const { currentPage, isMapAgentOpen, setIsMapAgentOpen } = useNavigation();
  const { isCartOpen, isSearchOpen, setIsSearchOpen, isCheckoutOpen } = useShop();

  const [idleReady, setIdleReady] = useState(false);
  const [enableAmbient3D, setEnableAmbient3D] = useState(false);

  // Global '/' keyboard shortcut to open search without keeping SearchModal mounted
  useEffect(() => {
    const handleSlashShortcut = (e: KeyboardEvent) => {
      if (e.key === '/' && !isSearchOpen) {
        const target = e.target as HTMLElement | null;
        if (target && target.tagName !== 'INPUT' && target.tagName !== 'TEXTAREA') {
          e.preventDefault();
          setIsSearchOpen(true);
        }
      }
    };
    window.addEventListener('keydown', handleSlashShortcut);
    return () => window.removeEventListener('keydown', handleSlashShortcut);
  }, [isSearchOpen, setIsSearchOpen]);

  // Defer non-critical background widgets & WebGL until after initial LCP/idle
  useEffect(() => {
    const scheduleIdle = (cb: () => void, timeoutMs: number) => {
      const w = window as unknown as {
        requestIdleCallback?: (fn: () => void, opts?: { timeout: number }) => number;
        cancelIdleCallback?: (id: number) => void;
      };
      if (typeof w.requestIdleCallback === 'function') {
        const id = w.requestIdleCallback(cb, { timeout: timeoutMs });
        return () => w.cancelIdleCallback?.(id);
      }
      const timer = setTimeout(cb, Math.min(timeoutMs, 1200));
      return () => clearTimeout(timer);
    };

    const cancelWidgets = scheduleIdle(() => setIdleReady(true), 1400);

    // Only load Three.js background on desktop viewports without reduced-motion or save-data
    const prefersReducedMotion = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
    const isDesktop = window.innerWidth >= 1024;
    const saveData = Boolean((navigator as unknown as { connection?: { saveData?: boolean } }).connection?.saveData);

    let cancel3D: (() => void) | undefined;
    if (isDesktop && !prefersReducedMotion && !saveData) {
      cancel3D = scheduleIdle(() => setEnableAmbient3D(true), 2400);
    }

    return () => {
      cancelWidgets();
      cancel3D?.();
    };
  }, []);

  return (
    <div className="min-h-screen flex flex-col bg-[#060608] text-[#F7F4EE] w-full max-w-full overflow-x-hidden relative selection:bg-[#D4AF37]/30 selection:text-[#D4AF37]">
      {/* Deferred 3D Global Depth Layer (Desktop & Idle Only) */}
      {enableAmbient3D && (
        <Suspense fallback={null}>
          <AtelierAmbient3DBackground />
        </Suspense>
      )}

      {/* Central Technical SEO & Schema Head Engine */}
      <SEOHead />

      {/* WCAG Accessibility Skip Link */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2.5 focus:bg-black focus:text-white focus:shadow-2xl focus:outline-none focus:ring-2 focus:ring-white text-xs font-semibold uppercase tracking-wider"
      >
        Skip to main content
      </a>

      {/* Top Navigation & Header */}
      <Header />

      {/* Main Page & Footer Container */}
      <div className="flex-1 flex flex-col w-full min-w-0">
        <main className="flex-1 w-full max-w-full min-w-0 overflow-x-hidden relative" id="main-content" tabIndex={-1}>
          {currentPage === 'home' ? (
            <HomePage />
          ) : (
            <Suspense fallback={<RouteLoadingFallback currentPage={currentPage} />}>
              {(currentPage === 'men-summer' ||
                currentPage === 'men-winter' ||
                currentPage === 'women-summer' ||
                currentPage === 'women-winter' ||
                currentPage === 'shop') && <ShopPage />}
              {currentPage === 'location' && <LocationPage />}
              {currentPage === 'product-detail' && <ProductDetailPage />}
              {currentPage === 'admin' && <AdminPage />}
              {(currentPage === 'privacy' ||
                currentPage === 'terms' ||
                currentPage === 'cookies' ||
                currentPage === 'refund') && <LegalPage initialTab={currentPage} />}
              {currentPage === 'ux-reel' && <UXDesignReelPage />}
              {currentPage === 'not-found' && <NotFoundPage />}
            </Suspense>
          )}
        </main>

        <Footer />
      </div>

      {/* On-Demand Drawers & Modals (0 KB downloaded until triggered) */}
      {isCartOpen && (
        <Suspense fallback={null}>
          <CartDrawer />
        </Suspense>
      )}

      {isSearchOpen && (
        <Suspense fallback={null}>
          <SearchModal />
        </Suspense>
      )}

      {isCheckoutOpen && (
        <Suspense fallback={null}>
          <CheckoutModal />
        </Suspense>
      )}

      {isMapAgentOpen && (
        <Suspense fallback={null}>
          <InteractiveStoreMapModal
            isOpen={isMapAgentOpen}
            onClose={() => setIsMapAgentOpen(false)}
          />
        </Suspense>
      )}

      {/* Lightweight Side Currency Converter, WhatsApp CTA & Offline Mode Indicator */}
      <FloatingCurrencyDock />
      <FloatingWhatsAppButton />
      <OfflineIndicator />

      {/* Deferred Secondary Overlays (Loaded post-idle so LCP/TBT remain pristine) */}
      {idleReady && (
        <Suspense fallback={null}>
          <CookieConsent />
          <GeminiChatbot />
          <PatronAuthModal />
          <OnboardingTutorial />
          <BrandEntranceReveal />
        </Suspense>
      )}
    </div>
  );
};

export default function App() {
  return (
    <AuthProvider>
      <ShopProvider>
        <ReviewProvider>
          <NavigationProvider>
            <AppContent />
          </NavigationProvider>
        </ReviewProvider>
      </ShopProvider>
    </AuthProvider>
  );
}
