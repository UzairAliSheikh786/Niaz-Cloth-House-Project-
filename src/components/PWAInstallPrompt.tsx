import React, { useState, useEffect } from 'react';
import { Download, Smartphone, CheckCircle, Loader2 } from 'lucide-react';
import {
  isAppRunningStandalone,
  subscribePWAInstallState,
  triggerDirectAppDownload,
  type BeforeInstallPromptEvent,
} from '../utils/pwaInstall';

export const PWAInstallPrompt: React.FC = () => {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isStandalone, setIsStandalone] = useState<boolean>(() => isAppRunningStandalone());
  const [isDownloading, setIsDownloading] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  useEffect(() => {
    return subscribePWAInstallState(
      (prompt) => setDeferredPrompt(prompt),
      () => {
        setIsStandalone(true);
        setDeferredPrompt(null);
      }
    );
  }, []);

  if (isStandalone) {
    return null;
  }

  const showToast = (msg: string) => {
    setStatusMessage(msg);
    setTimeout(() => {
      setStatusMessage((prev) => (prev === msg ? null : prev));
    }, 4000);
  };

  const handleInstallClick = async () => {
    if (isDownloading) return;
    setIsDownloading(true);
    try {
      const outcome = await triggerDirectAppDownload();
      if (outcome === 'installed') {
        setIsStandalone(true);
        showToast('Niaz Cloth House app installed!');
      } else if (outcome === 'cached-offline') {
        showToast('Niaz Cloth House app downloaded & ready offline!');
      }
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <>
      <button
        type="button"
        onClick={handleInstallClick}
        disabled={isDownloading}
        className="flex items-center gap-1.5 px-2.5 py-1 text-[11px] font-medium tracking-wider uppercase rounded-full bg-[#D4AF37]/15 border border-[#D4AF37]/40 text-[#D4AF37] hover:bg-[#D4AF37] hover:text-[#0A0F1D] disabled:opacity-70 transition-all duration-200 shrink-0 max-w-full whitespace-nowrap"
        title={deferredPrompt ? 'Install Niaz Cloth House App' : 'Download Niaz Cloth House App'}
      >
        {isDownloading ? (
          <Loader2 className="w-3.5 h-3.5 animate-spin shrink-0" />
        ) : deferredPrompt ? (
          <Download className="w-3.5 h-3.5 shrink-0" />
        ) : (
          <Smartphone className="w-3.5 h-3.5 shrink-0" />
        )}
        <span>{isDownloading ? 'Downloading...' : 'Install App'}</span>
      </button>

      {statusMessage && (
        <div
          role="status"
          aria-live="polite"
          className="fixed bottom-5 right-4 left-4 sm:left-auto z-[100] flex items-center gap-2 px-4 py-3 bg-[#0A0F1D] border border-[#D4AF37]/60 text-[#F7F4EE] rounded-xl shadow-2xl max-w-sm ml-auto pointer-events-none"
        >
          <CheckCircle className="w-4 h-4 text-[#D4AF37] shrink-0" />
          <span className="text-xs font-medium leading-snug">{statusMessage}</span>
        </div>
      )}
    </>
  );
};
