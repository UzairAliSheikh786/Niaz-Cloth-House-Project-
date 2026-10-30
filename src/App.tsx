import React, { useEffect } from 'react';
import { AuthProvider } from './context/AuthContext';
import { ShopProvider, useShop } from './context/ShopContext';
import { ReviewProvider } from './context/ReviewContext';
import { NavigationProvider, useNavigation } from './context/NavigationContext';
import { Header } from './components/Header';
import { Footer } from './components/Footer';
import { CartDrawer } from './components/CartDrawer';
import { SearchModal } from './components/SearchModal';
import { CheckoutModal } from './components/CheckoutModal';
import { HomePage } from './pages/HomePage';
import { ShopPage } from './pages/ShopPage';
import { ProductDetailPage } from './pages/ProductDetailPage';
import { LocationPage } from './pages/LocationPage';
import { AdminPage } from './pages/AdminPage';
import { ComparePage } from './pages/ComparePage';
import { LegalPage } from './pages/LegalPage';
import { NotFoundPage } from './pages/NotFoundPage';
import { CookieConsent } from './components/CookieConsent';
import { FloatingWhatsAppButton } from './components/FloatingWhatsAppButton';
import { GeminiChatbot } from './components/GeminiChatbot';
import { BrandEntranceReveal } from './components/BrandEntranceReveal';
import { PatronAuthModal } from './components/PatronAuthModal';
import { OnboardingTutorial } from './components/OnboardingTutorial';

import { SEOHead } from './components/SEOHead';

const AppContent: React.FC = () => {
  const { currentPage } = useNavigation();

  return (
    <div className="min-h-screen flex flex-col bg-[#F8FAFC] text-[#0F172A] w-full max-w-full overflow-x-hidden relative">
      {/* Central Technical SEO & Schema Head Engine */}
      <SEOHead />
      {/* WCAG Accessibility Skip Link */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2.5 focus:bg-[#0284C7] focus:text-white focus:shadow-2xl focus:outline-none focus:ring-2 focus:ring-white text-xs font-semibold uppercase tracking-wider"
      >
        Skip to main content
      </a>

      {/* Sleek Vertical Luxury Sidebar / Navigation Menu */}
      <Header />

      {/* Main Page & Footer Container (Offset by vertical sidebar width on desktop) */}
      <div className="flex-1 flex flex-col lg:pl-64 xl:pl-72 w-full min-w-0 transition-all duration-300">
        {/* Main Page View */}
        <main className="flex-1 w-full max-w-full min-w-0 overflow-x-hidden relative" id="main-content" tabIndex={-1}>
          {currentPage === 'home' && <HomePage />}
          {(currentPage === 'men-summer' ||
            currentPage === 'men-winter' ||
            currentPage === 'women-summer' ||
            currentPage === 'women-winter' ||
            currentPage === 'shop') && <ShopPage />}
          {currentPage === 'location' && <LocationPage />}
          {currentPage === 'product-detail' && <ProductDetailPage />}
          {currentPage === 'compare' && <ComparePage />}
          {currentPage === 'admin' && <AdminPage />}
          {(currentPage === 'privacy' ||
            currentPage === 'terms' ||
            currentPage === 'cookies' ||
            currentPage === 'refund') && <LegalPage initialTab={currentPage} />}
          {currentPage === 'not-found' && <NotFoundPage />}
        </main>

        {/* Semantic Footer */}
        <Footer />
      </div>

      {/* Global Slide-Out Cart Drawer */}
      <CartDrawer />

      {/* Real-time Search Overlay */}
      <SearchModal />

      {/* Cash on Delivery Checkout Modal */}
      <CheckoutModal />

      {/* DPDP Act Compliant Cookie Consent & Preferences Manager */}
      <CookieConsent />

      {/* Gemini Multi-Turn AI Fabric Concierge Chatbot */}
      <GeminiChatbot />

      {/* Theme Sage Floating WhatsApp Action Button (0334-6565636) */}
      <FloatingWhatsAppButton />

      {/* Real Patron Authentication Modal (Login, Signup, Forgot Pass, Profile, GDPR) */}
      <PatronAuthModal />

      {/* Patron Onboarding Tour & Heritage Tutorial (Triggered on demand, non-blocking) */}
      <OnboardingTutorial />
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
