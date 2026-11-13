import React, { useState, useEffect } from 'react';
import { Download, Smartphone, X, CheckCircle, Share2, PlusSquare } from 'lucide-react';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed'; platform: string }>;
}

export const PWAInstallPrompt: React.FC = () => {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isStandalone, setIsStandalone] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [installedSuccess, setInstalledSuccess] = useState(false);

  useEffect(() => {
    // Check if app is already running as installed standalone app
    const standalone =
      window.matchMedia('(display-mode: standalone)').matches ||
      (window.navigator as unknown as { standalone?: boolean }).standalone === true;
    setIsStandalone(standalone);

    // Detect iOS devices (iPhone, iPad, iPod)
    const ua = window.navigator.userAgent.toLowerCase();
    const iOSDevice = /iphone|ipad|ipod/.test(ua);
    setIsIOS(iOSDevice);

    // Listen for browser install prompt (Chrome, Edge, Samsung Internet, Android)
    const handleBeforeInstall = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    };

    const handleAppInstalled = () => {
      setIsStandalone(true);
      setDeferredPrompt(null);
      setInstalledSuccess(true);
      setTimeout(() => setInstalledSuccess(false), 5000);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstall);
    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstall);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  // If already running in installed standalone app, do not show button
  if (isStandalone) {
    return null;
  }

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      await deferredPrompt.prompt();
      const choice = await deferredPrompt.userChoice;
      if (choice.outcome === 'accepted') {
        setIsStandalone(true);
        setDeferredPrompt(null);
        setIsOpen(false);
      }
    } else {
      setIsOpen(true);
    }
  };

  return (
    <>
      {/* Install Trigger Button (Header / Mobile Banner) */}
      <button
        onClick={handleInstallClick}
        className="flex items-center gap-1.5 px-2.5 py-1 text-[11px] font-medium tracking-wider uppercase rounded-full bg-[#D4AF37]/15 border border-[#D4AF37]/40 text-[#D4AF37] hover:bg-[#D4AF37] hover:text-[#0A0F1D] transition-all duration-200"
        title="Install Niaz Cloth House Mobile App"
      >
        <Smartphone className="w-3.5 h-3.5 text-[#D4AF37]" />
        <span>Install App</span>
      </button>

      {/* Guided Modal for Mobile Devices & iOS */}
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/75 backdrop-blur-sm p-4">
          <div className="relative w-full max-w-sm rounded-2xl bg-[#0A0F1D] border border-[#D4AF37]/30 p-6 shadow-2xl text-white animate-in fade-in zoom-in-95 duration-200">
            {/* Close Button */}
            <button
              onClick={() => setIsOpen(false)}
              className="absolute top-4 right-4 p-1.5 text-slate-400 hover:text-white rounded-full hover:bg-white/10"
            >
              <X className="w-4 h-4" />
            </button>

            {/* App Icon & Badge */}
            <div className="flex flex-col items-center text-center">
              <div className="w-16 h-16 rounded-2xl overflow-hidden border border-[#D4AF37]/40 shadow-lg mb-3 bg-[#050811] flex items-center justify-center p-2">
                <img src="/icon.svg" alt="Niaz Cloth House Icon" className="w-full h-full object-contain" />
              </div>
              <h3 className="font-serif text-lg font-bold text-[#F3E7C4]">
                Niaz Cloth House App
              </h3>
              <p className="text-xs text-[#D4AF37] tracking-widest uppercase mt-0.5 font-sans">
                ESTABLISHED 1970 · PARIS BAZAAR
              </p>
              <p className="text-xs text-slate-300 mt-2 leading-relaxed">
                Install our official boutique app directly on your mobile device for fast 1-tap unstitched shopping, order tracking, and 3D fabric viewing.
              </p>
            </div>

            {/* Platform-Specific Installation Steps */}
            <div className="mt-5 space-y-3 bg-[#050811]/70 rounded-xl p-3.5 border border-white/5">
              {isIOS ? (
                <div>
                  <div className="text-xs font-semibold text-[#D4AF37] mb-2 flex items-center gap-1.5">
                    <Share2 className="w-3.5 h-3.5" />
                    <span>How to Install on iPhone / iPad (Safari):</span>
                  </div>
                  <ol className="text-xs text-slate-300 space-y-2 list-decimal list-inside pl-1">
                    <li>
                      Tap the <strong className="text-white">Share</strong> button at the bottom of Safari (<Share2 className="w-3 h-3 inline mx-0.5 text-blue-400" />).
                    </li>
                    <li>
                      Scroll down and tap <strong className="text-white">Add to Home Screen</strong> (<PlusSquare className="w-3 h-3 inline mx-0.5 text-[#D4AF37]" />).
                    </li>
                    <li>
                      Tap <strong className="text-white">Add</strong> in the top right corner.
                    </li>
                  </ol>
                </div>
              ) : (
                <div>
                  <div className="text-xs font-semibold text-[#D4AF37] mb-2 flex items-center gap-1.5">
                    <Smartphone className="w-3.5 h-3.5" />
                    <span>How to Install on Android Phone:</span>
                  </div>
                  <ol className="text-xs text-slate-300 space-y-2 list-decimal list-inside pl-1">
                    <li>
                      Tap the <strong className="text-white">Install</strong> button below or tap the browser menu (<strong>⋮</strong>).
                    </li>
                    <li>
                      Select <strong className="text-white">Install App</strong> or <strong className="text-white">Add to Home screen</strong>.
                    </li>
                    <li>
                      The Niaz Cloth House icon will appear on your phone home screen!
                    </li>
                  </ol>
                </div>
              )}
            </div>

            {/* Direct Trigger Button for Android / Chrome */}
            {deferredPrompt && (
              <button
                onClick={handleInstallClick}
                className="mt-5 w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-gradient-to-r from-[#D4AF37] to-[#B89628] text-[#0A0F1D] font-bold text-sm tracking-wider uppercase shadow-lg shadow-[#D4AF37]/20 hover:brightness-110 active:scale-[0.98] transition-all"
              >
                <Download className="w-4 h-4" />
                <span>Install App on Phone</span>
              </button>
            )}

            {/* Close Button */}
            <button
              onClick={() => setIsOpen(false)}
              className="mt-3 w-full py-2 text-xs text-slate-400 hover:text-white transition"
            >
              Continue in Browser
            </button>
          </div>
        </div>
      )}

      {/* Success Notification */}
      {installedSuccess && (
        <div className="fixed bottom-6 right-6 z-[100] flex items-center gap-2 px-4 py-3 bg-[#0A0F1D] border border-[#D4AF37] text-white rounded-xl shadow-2xl animate-in slide-in-from-bottom">
          <CheckCircle className="w-4 h-4 text-[#D4AF37]" />
          <span className="text-xs font-medium">Niaz Cloth House App installed successfully!</span>
        </div>
      )}
    </>
  );
};
