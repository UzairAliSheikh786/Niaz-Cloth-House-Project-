import React, { useEffect, useState } from 'react';
import { ArrowRight, X, Sparkles } from 'lucide-react';

interface BrandEntranceRevealProps {
  onComplete?: () => void;
  forceShow?: boolean;
}

export const BrandEntranceReveal: React.FC<BrandEntranceRevealProps> = ({
  onComplete,
  forceShow = false,
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const [isExiting, setIsExiting] = useState(false);

  useEffect(() => {
    // Show on page open, unless explicitly dismissed in this session
    const hasSeenIntro = sessionStorage.getItem('nch_brand_intro_seen');

    if (!hasSeenIntro || forceShow) {
      setIsVisible(true);
      // Auto-exit after 3.2 seconds of cinematic display
      const exitTimer = setTimeout(() => {
        handleDismiss();
      }, 3200);

      return () => clearTimeout(exitTimer);
    }
  }, [forceShow]);

  // Listen for replay requests from Header / Hero
  useEffect(() => {
    const handleReplayEvent = () => {
      setIsExiting(false);
      setIsVisible(true);
    };

    window.addEventListener('replay-brand-entrance', handleReplayEvent);
    return () => window.removeEventListener('replay-brand-entrance', handleReplayEvent);
  }, []);

  const handleDismiss = () => {
    if (isExiting) return;
    setIsExiting(true);
    sessionStorage.setItem('nch_brand_intro_seen', 'true');
    setTimeout(() => {
      setIsVisible(false);
      setIsExiting(false);
      if (onComplete) onComplete();
    }, 850);
  };

  if (!isVisible) return null;

  return (
    <aside
      aria-label="Niaz Cloth House Brand Reveal"
      onClick={handleDismiss}
      className={`fixed inset-0 z-50 flex items-center justify-center cursor-pointer select-none overflow-hidden transition-all duration-700 ${
        isExiting ? 'pointer-events-none' : ''
      }`}
    >
      {/* Background Left & Right Sliding Curtains */}
      <div
        className={`absolute inset-y-0 left-0 w-1/2 bg-[#0B0908] border-r border-[#D4A373]/20 ${
          isExiting ? 'animate-curtain-left' : ''
        }`}
      />
      <div
        className={`absolute inset-y-0 right-0 w-1/2 bg-[#0B0908] border-l border-[#D4A373]/20 ${
          isExiting ? 'animate-curtain-right' : ''
        }`}
      />

      {/* Decorative Gold Ambient Radial Light Glow */}
      <div className="absolute w-[600px] h-[600px] rounded-full bg-[#8C4830]/25 blur-[140px] pointer-events-none -top-24 -left-24 animate-pulse" />
      <div className="absolute w-[500px] h-[500px] rounded-full bg-[#D4A373]/20 blur-[120px] pointer-events-none -bottom-24 -right-24" />

      {/* Heritage Silk Weave Pattern Overlay */}
      <div
        className="absolute inset-0 opacity-10 pointer-events-none"
        style={{
          backgroundImage: `radial-gradient(#D4A373 1px, transparent 1px), radial-gradient(#D4A373 1px, transparent 1px)`,
          backgroundSize: '36px 36px',
          backgroundPosition: '0 0, 18px 18px',
        }}
      />

      {/* Theatrical Stage Container */}
      <div
        className={`relative max-w-5xl mx-auto px-6 py-12 text-center flex flex-col items-center justify-center space-y-6 z-10 transition-all duration-700 ${
          isExiting ? 'opacity-0 scale-95 -translate-y-4' : 'opacity-100 scale-100'
        }`}
      >
        {/* Heritage Monogram Seal - Drops in with Gold Accent */}
        <div className="animate-brand-from-side flex items-center justify-center mb-1">
          <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full border border-[#D4A373]/60 bg-gradient-to-b from-[#1C1613] to-[#0D0A08] flex items-center justify-center shadow-2xl animate-pulse-gold relative">
            <span className="font-serif text-2xl sm:text-3xl font-black text-[#D4A373] tracking-tighter">
              NCH
            </span>
            <div className="absolute -inset-1 rounded-full border border-[#D4A373]/20 animate-spin" style={{ animationDuration: '24s' }} />
          </div>
        </div>

        {/* Top Kicker - Glides in from Top Right */}
        <div className="animate-brand-from-right flex items-center gap-3">
          <span className="w-8 sm:w-16 h-[1.5px] bg-gradient-to-r from-transparent to-[#D4A373]" />
          <span className="text-[11px] sm:text-xs uppercase tracking-[0.35em] text-[#D4A373] font-semibold font-sans">
            Haute Couture Unstitched Fabrics · Established 1970
          </span>
          <span className="w-8 sm:w-16 h-[1.5px] bg-gradient-to-l from-transparent to-[#D4A373]" />
        </div>

        {/* The Iconic Brand Name: Comes Out Dramatically from the Screen Side! */}
        <div className="overflow-visible py-2 px-4">
          <h1 className="animate-brand-from-side font-serif text-5xl sm:text-7xl lg:text-8xl font-black tracking-tight drop-shadow-[0_20px_35px_rgba(0,0,0,0.9)]">
            <span className="inline-block animate-gold-shimmer">
              Niaz Cloth House
            </span>
          </h1>
        </div>

        {/* Golden Silk Filament Divider - Draws across smoothly */}
        <div className="w-48 sm:w-96 h-[2px] bg-gradient-to-r from-transparent via-[#D4A373] to-transparent animate-thread-draw" />

        {/* Subtitle & Paris Bazaar Location - Glides in from Right Screen Side */}
        <div className="animate-brand-from-right space-y-2 max-w-xl">
          <p className="font-serif italic text-base sm:text-2xl text-white/95">
            "Dress To Impress"
          </p>
          <p className="text-xs sm:text-sm text-[#FAF8F5]/70 tracking-widest font-sans uppercase">
            Shop #170 Paris Bazaar · Committee Chowk · Rawalpindi
          </p>
          <p className="text-[11px] text-[#D4A373]/80 font-mono tracking-wider pt-1">
            Pure Chinese Boski · Egyptian Latha · Kamalia Khaddar · Raw Karandi
          </p>
        </div>

        {/* Interactive Click-to-Enter Luxury Action */}
        <div className="pt-4 animate-brand-from-side-delayed">
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              handleDismiss();
            }}
            className="group px-7 py-3.5 bg-[#8C4830] hover:bg-[#a25439] text-white text-xs font-semibold tracking-[0.25em] uppercase transition-all duration-300 shadow-2xl inline-flex items-center gap-3 border border-[#D4A373]/50 hover:scale-105 active:scale-95"
          >
            <span>Enter Boutique</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </button>
        </div>

        <p className="text-[10px] text-white/40 tracking-widest font-mono uppercase pt-1">
          Click anywhere to enter boutique
        </p>
      </div>

      {/* Top Right Quick Skip Button */}
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          handleDismiss();
        }}
        className="absolute top-6 right-6 p-2.5 text-white/60 hover:text-white transition-colors z-20 flex items-center gap-1.5 bg-black/40 border border-white/10 hover:border-white/30"
        aria-label="Skip entrance animation"
      >
        <span className="text-[11px] tracking-wider uppercase font-sans">Skip</span>
        <X className="w-4 h-4" />
      </button>
    </aside>
  );
};
