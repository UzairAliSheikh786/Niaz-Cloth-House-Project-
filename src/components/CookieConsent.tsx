import React, { useState, useEffect } from 'react';
import { ShieldCheck, Cookie, Settings, Check, X, Info, ExternalLink } from 'lucide-react';
import { useNavigation } from '../context/NavigationContext';

export interface CookiePreferences {
  necessary: boolean; // Always true
  analytics: boolean;
  preferences: boolean;
  timestamp: string;
}

const STORAGE_KEY = 'niaz_cookie_consent_v1';

export const CookieConsent: React.FC = () => {
  const { navigateTo } = useNavigation();
  const [isVisible, setIsVisible] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [preferences, setPreferences] = useState<CookiePreferences>({
    necessary: true,
    analytics: false,
    preferences: false,
    timestamp: '',
  });

  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (!stored) {
        // Show banner after brief delay for smooth entrance
        const timer = setTimeout(() => setIsVisible(true), 1200);
        return () => clearTimeout(timer);
      } else {
        const parsed = JSON.parse(stored);
        setPreferences(parsed);
      }
    } catch {
      setIsVisible(true);
    }
  }, []);

  // Listen for custom event to reopen cookie preferences anytime from Footer or Policy page
  useEffect(() => {
    const handleReopen = () => {
      setIsModalOpen(true);
      setIsVisible(true);
    };
    window.addEventListener('openCookieSettings', handleReopen);
    return () => window.removeEventListener('openCookieSettings', handleReopen);
  }, []);

  const saveConsent = (updated: CookiePreferences) => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    } catch {
      // In private browsing mode fallback
    }
    setPreferences(updated);
    setIsVisible(false);
    setIsModalOpen(false);
  };

  const handleAcceptAll = () => {
    saveConsent({
      necessary: true,
      analytics: true,
      preferences: true,
      timestamp: new Date().toISOString(),
    });
  };

  const handleRejectNonEssential = () => {
    saveConsent({
      necessary: true,
      analytics: false,
      preferences: false,
      timestamp: new Date().toISOString(),
    });
  };

  const handleSaveCustom = () => {
    saveConsent({
      ...preferences,
      necessary: true,
      timestamp: new Date().toISOString(),
    });
  };

  if (!isVisible && !isModalOpen) return null;

  return (
    <>
      {/* 1. FLOATING BOTTOM BANNER */}
      {isVisible && !isModalOpen && (
        <aside
          role="region"
          aria-label="Cookie and Privacy Consent Banner"
          className="fixed bottom-0 inset-x-0 z-50 p-4 sm:p-6 bg-white/95 backdrop-blur-md border-t border-[#E2E8F0] shadow-2xl transition-all duration-300 animate-in slide-in-from-bottom-6"
        >
          <div className="max-w-7xl mx-auto flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
            <div className="flex items-start gap-3.5 max-w-4xl">
              <div className="p-2.5 bg-[#0284C7]/10 text-[#0284C7] shrink-0 mt-0.5" aria-hidden="true">
                <Cookie className="w-5 h-5" />
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <h3 className="font-serif text-sm sm:text-base font-bold text-[#1C1917]">
                    Your Privacy & Cookie Choices
                  </h3>
                  <span className="text-[10px] uppercase font-mono font-bold tracking-wider px-2 py-0.5 bg-emerald-100 text-emerald-800 border border-emerald-300">
                    DPDP & GDPR Compliant
                  </span>
                </div>
                <p className="text-xs text-[#1C1917]/80 leading-relaxed font-sans">
                  Niaz Cloth House respects your digital rights. We use strictly essential cookies to manage your shopping cart, secure checkout, and store preferences. No invasive profiling or third-party advertising cookies are used without your explicit opt-in. You can review our policies or customize your settings at any time.
                </p>
                <div className="flex items-center gap-3 pt-1 text-xs">
                  <button
                    type="button"
                    onClick={() => navigateTo('cookies')}
                    className="text-[#0284C7] hover:text-[#0369A1] underline font-medium"
                  >
                    Read Cookies Policy
                  </button>
                  <span className="text-[#1C1917]/30" aria-hidden="true">·</span>
                  <button
                    type="button"
                    onClick={() => navigateTo('privacy')}
                    className="text-[#0284C7] hover:text-[#0369A1] underline font-medium"
                  >
                    DPDP Privacy Notice
                  </button>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex flex-wrap items-center gap-2.5 w-full lg:w-auto shrink-0 justify-end pt-2 lg:pt-0">
              <button
                type="button"
                onClick={() => setIsModalOpen(true)}
                className="px-3.5 py-2 border border-[#E2E8F0] bg-white hover:border-[#0284C7] text-[#1C1917] text-xs font-semibold uppercase tracking-wider transition-colors inline-flex items-center gap-1.5 focus-visible:ring-2 focus-visible:ring-[#0284C7] focus-visible:outline-none"
                aria-label="Customize Cookie Preferences"
              >
                <Settings className="w-3.5 h-3.5 text-[#0284C7]" />
                <span>Preferences</span>
              </button>

              <button
                type="button"
                onClick={handleRejectNonEssential}
                className="px-4 py-2 border border-[#1C1917]/30 bg-white hover:bg-[#F5EFEB] text-[#1C1917] text-xs font-semibold uppercase tracking-wider transition-colors focus-visible:ring-2 focus-visible:ring-[#0284C7] focus-visible:outline-none"
                aria-label="Reject non-essential cookies"
              >
                Only Necessary
              </button>

              <button
                type="button"
                onClick={handleAcceptAll}
                className="px-5 py-2 bg-[#0284C7] hover:bg-[#0369A1] text-white text-xs font-semibold uppercase tracking-wider transition-colors shadow-sm focus-visible:ring-2 focus-visible:ring-[#0284C7] focus-visible:outline-none"
                aria-label="Accept all cookies"
              >
                Accept All
              </button>
            </div>
          </div>
        </aside>
      )}

      {/* 2. GRANULAR PREFERENCES MODAL */}
      {isModalOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="cookie-preferences-title"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200"
        >
          <div className="bg-white max-w-2xl w-full max-h-[90vh] overflow-y-auto border border-[#E2E8F0] shadow-2xl p-6 space-y-6">
            {/* Header */}
            <div className="flex items-start justify-between pb-4 border-b border-[#E2E8F0]">
              <div>
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-5 h-5 text-[#0284C7]" />
                  <h2 id="cookie-preferences-title" className="font-serif text-lg font-bold text-[#1C1917]">
                    Cookie & Data Consent Preferences
                  </h2>
                </div>
                <p className="text-xs text-[#1C1917]/70 font-sans mt-1">
                  Compliant with Digital Personal Data Protection (DPDP) Act & Global Privacy Standards.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 text-[#1C1917]/60 hover:text-[#1C1917] hover:bg-[#F8FAFC] transition-colors focus-visible:ring-2 focus-visible:ring-[#0284C7] focus-visible:outline-none"
                aria-label="Close preferences modal"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Granular Categories */}
            <div className="space-y-4 text-xs font-sans">
              {/* Category 1: Strictly Necessary */}
              <div className="p-4 bg-[#F8FAFC] border border-[#E2E8F0] space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-sm text-[#1C1917]">1. Strictly Necessary Cookies</span>
                    <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 text-[10px] font-bold uppercase tracking-wider font-mono">
                      Always Active
                    </span>
                  </div>
                </div>
                <p className="text-[#1C1917]/75 leading-relaxed">
                  Required for essential website functions: maintaining your unstitched fabric bag, processing Cash-on-Delivery checkout orders, saving security tokens, and remembering your consent state. These cookies do not store personally identifiable promotional data.
                </p>
              </div>

              {/* Category 2: Functional & Preferences */}
              <div className="p-4 bg-white border border-[#E2E8F0] space-y-2">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="font-bold text-sm text-[#1C1917]">2. Functional & Filter Preferences</span>
                    <p className="text-[11px] text-[#1C1917]/60">Remembers fabric weight, thread count, and weave selections.</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={preferences.preferences}
                      onChange={(e) => setPreferences({ ...preferences, preferences: e.target.checked })}
                      className="sr-only peer"
                      aria-label="Toggle Functional and Filter Preferences"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-[#0284C7] rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#0284C7]"></div>
                  </label>
                </div>
                <p className="text-[#1C1917]/75 leading-relaxed">
                  Enables the site to remember your tailored catalog viewing preferences (such as showing Men’s Boski Silk or Women’s Summer Lawn by default, active GSM filter sliders, and currency format).
                </p>
              </div>

              {/* Category 3: Analytical Performance */}
              <div className="p-4 bg-white border border-[#E2E8F0] space-y-2">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="font-bold text-sm text-[#1C1917]">3. Performance & Usage Analytics</span>
                    <p className="text-[11px] text-[#1C1917]/60">Aggregated site performance measurement with zero third-party sale.</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={preferences.analytics}
                      onChange={(e) => setPreferences({ ...preferences, analytics: e.target.checked })}
                      className="sr-only peer"
                      aria-label="Toggle Performance and Usage Analytics"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-[#0284C7] rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#0284C7]"></div>
                  </label>
                </div>
                <p className="text-[#1C1917]/75 leading-relaxed">
                  Helps us understand catalog loading speed, broken links, and high-demand fabric categories without logging your identity. All data is anonymized and aggregated.
                </p>
              </div>
            </div>

            {/* Footer Actions */}
            <div className="pt-4 border-t border-[#E2E8F0] flex flex-wrap items-center justify-between gap-3">
              <button
                type="button"
                onClick={() => {
                  navigateTo('privacy');
                  setIsModalOpen(false);
                }}
                className="text-xs text-[#0284C7] hover:underline flex items-center gap-1 font-medium"
              >
                <span>Read Full Privacy Notice</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </button>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleRejectNonEssential}
                  className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-[#1C1917] text-xs font-semibold uppercase tracking-wider transition-colors"
                >
                  Reject Non-Essential
                </button>
                <button
                  type="button"
                  onClick={handleSaveCustom}
                  className="px-5 py-2 bg-[#0284C7] hover:bg-[#0369A1] text-white text-xs font-semibold uppercase tracking-wider transition-colors shadow-sm"
                >
                  Save Preferences
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
