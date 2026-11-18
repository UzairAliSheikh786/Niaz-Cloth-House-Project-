import React, { useEffect, useRef, useState } from 'react';
import { WifiOff, Wifi } from 'lucide-react';
import { useOnlineStatus } from '../hooks/useOnlineStatus';

export const OfflineIndicator: React.FC = () => {
  const isOnline = useOnlineStatus();
  const [justReconnected, setJustReconnected] = useState(false);
  const wasOfflineRef = useRef(false);

  useEffect(() => {
    if (!isOnline) {
      wasOfflineRef.current = true;
      setJustReconnected(false);
    } else if (wasOfflineRef.current) {
      wasOfflineRef.current = false;
      setJustReconnected(true);
      const timer = setTimeout(() => setJustReconnected(false), 3500);
      return () => clearTimeout(timer);
    }
  }, [isOnline]);

  if (isOnline && !justReconnected) {
    return null;
  }

  return (
    <div
      role="status"
      aria-live="polite"
      className={`fixed bottom-4 left-4 z-50 flex items-center gap-2.5 px-3.5 py-2 border shadow-2xl text-xs font-medium tracking-wide transition-all ${
        !isOnline
          ? 'bg-[#111115]/95 border-[#D4AF37]/60 text-[#E8D5A7]'
          : 'bg-[#0C1912]/95 border-emerald-500/60 text-emerald-300'
      }`}
    >
      {!isOnline ? (
        <>
          <WifiOff className="w-3.5 h-3.5 text-[#D4AF37] shrink-0" />
          <span>Offline Mode · Cached catalog &amp; local orders active</span>
        </>
      ) : (
        <>
          <Wifi className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
          <span>Back Online · Syncing pending updates</span>
        </>
      )}
    </div>
  );
};
