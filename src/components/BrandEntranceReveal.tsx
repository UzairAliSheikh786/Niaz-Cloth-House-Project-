import React, { useEffect, useState, useRef } from 'react';
import { ArrowRight, X, Sparkles, Crown, ShieldCheck } from 'lucide-react';

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
  const [tilt, setTilt] = useState({ x: 0, y: 0 });
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Show on page open, unless explicitly dismissed in this session
    const hasSeenIntro = sessionStorage.getItem('nch_brand_intro_seen');

    if (!hasSeenIntro || forceShow) {
      setIsVisible(true);
      // Auto-exit after 3.5 seconds of cinematic display so shopping is never blocked
      const exitTimer = setTimeout(() => {
        handleDismiss();
      }, 3500);

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
    }, 700);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!containerRef.current) return;
    const { innerWidth, innerHeight } = window;
    const x = (e.clientX - innerWidth / 2) / (innerWidth / 2);
    const y = (e.clientY - innerHeight / 2) / (innerHeight / 2);
    setTilt({ x: -y * 8, y: x * 8 });
  };

  if (!isVisible) return null;

  return (
    <aside
      aria-label="Niaz Cloth House Interactive 3D Store Entrance"
      onClick={handleDismiss}
      onMouseMove={handleMouseMove}
      className={`fixed inset-0 z-50 flex items-center justify-center cursor-pointer select-none overflow-hidden transition-all duration-700 bg-black/95 backdrop-blur-md ${
        isExiting ? 'opacity-0 pointer-events-none scale-105' : 'opacity-100 scale-100'
      }`}
    >
      {/* 3D Architectural Lighting & Ambient Radial Sheen */}
      <div className="absolute w-[700px] h-[700px] rounded-full bg-[#D4AF37]/15 blur-[160px] pointer-events-none -top-32 -left-32 animate-pulse" />
      <div className="absolute w-[600px] h-[600px] rounded-full bg-[#8C4830]/20 blur-[150px] pointer-events-none -bottom-32 -right-32" />

      {/* Floating Gold Weave Background Matrix */}
      <div
        className="absolute inset-0 opacity-15 pointer-events-none"
        style={{
          backgroundImage: `radial-gradient(#D4AF37 1px, transparent 1px), radial-gradient(#D4AF37 1px, transparent 1px)`,
          backgroundSize: '40px 40px',
          backgroundPosition: '0 0, 20px 20px',
        }}
      />

      {/* 3D Spatial Portal Container with Perspective Tilt */}
      <div
        ref={containerRef}
        style={{
          transform: `perspective(1000px) rotateX(${tilt.x}deg) rotateY(${tilt.y}deg)`,
          transition: 'transform 0.15s ease-out',
        }}
        className={`relative max-w-4xl mx-auto px-6 py-12 text-center flex flex-col items-center justify-center space-y-6 z-10 transition-all duration-700 ${
          isExiting ? 'opacity-0 scale-95 -translate-y-6' : 'opacity-100 scale-100'
        }`}
      >
        {/* Heritage Monogram Emblem */}
        {/* Heritage Monogram Emblem */}
        <div className="flex items-center justify-center mb-1">
          <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full border-2 border-[#00F0FF] bg-gradient-to-b from-[#0A0F1D] to-[#050811] flex items-center justify-center shadow-[0_0_35px_rgba(0,240,255,0.4)] relative">
            <Sparkles className="w-5 h-5 text-[#00F0FF] absolute -top-3" />
            <span className="font-sans text-3xl sm:text-4xl font-black text-[#F5B738] tracking-tight drop-shadow-[0_0_15px_rgba(245,183,56,0.5)]">
              NCH
            </span>
            <div
              className="absolute -inset-2 rounded-full border border-[#00F0FF]/40 border-dashed animate-spin"
              style={{ animationDuration: '24s' }}
            />
            <div
              className="absolute -inset-4 rounded-full border border-[#F5B738]/20 animate-spin"
              style={{ animationDuration: '36s', animationDirection: 'reverse' }}
            />
          </div>
        </div>

        {/* Kicker Pill */}
        <div className="inline-flex items-center gap-3">
          <span className="w-8 sm:w-16 h-[1.5px] bg-gradient-to-r from-transparent to-[#00F0FF]" />
          <span className="text-[10px] sm:text-xs uppercase tracking-[0.35em] text-[#00F0FF] font-bold font-mono">
            ◈ 2050 CYBER ATELIER · ESTABLISHED 1970 ◈
          </span>
          <span className="w-8 sm:w-16 h-[1.5px] bg-gradient-to-l from-transparent to-[#00F0FF]" />
        </div>

        {/* Prominent Store Name */}
        <div className="py-2">
          <h1 className="font-sans text-5xl sm:text-7xl lg:text-8xl font-black text-white tracking-tight leading-none drop-shadow-[0_0_35px_rgba(255,255,255,0.3)] uppercase">
            Niaz Cloth House
          </h1>
          <p className="font-sans text-lg sm:text-2xl text-[#F5B738] mt-3 tracking-widest uppercase font-semibold">
            "Dress To Impress"
          </p>
        </div>

        {/* Gold & Cyan Filament Divider */}
        <div className="w-48 sm:w-80 h-[2px] bg-gradient-to-r from-transparent via-[#00F0FF] to-transparent" />

        {/* Subtitle & Paris Bazaar Location */}
        <div className="space-y-1.5 max-w-xl text-neutral-300">
          <p className="text-xs sm:text-sm tracking-widest font-mono uppercase font-medium text-neutral-200">
            Shop #170 Paris Bazaar · Committee Chowk · Rawalpindi
          </p>
          <p className="text-[11px] text-[#00F0FF]/90 font-mono tracking-wider">
            Pure Chinese Boski Silk · Executive Wash & Wear · Festive Embroidered Lawn · Kamalia Khaddar
          </p>
        </div>

        {/* Interactive Click-to-Enter Action */}
        <div className="pt-2">
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              handleDismiss();
            }}
            className="px-8 py-3.5 bg-gradient-to-r from-[#00F0FF] to-[#06B6D4] hover:from-[#38BDF8] hover:to-[#00F0FF] text-black text-xs font-black tracking-[0.25em] uppercase transition-all duration-300 shadow-[0_0_30px_rgba(0,240,255,0.4)] inline-flex items-center gap-3 hover:scale-105 active:scale-95 border border-[#00F0FF]"
          >
            <span>Enter 2050 Boutique</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        <p className="text-[10px] text-white/50 tracking-widest font-mono uppercase">
          Click anywhere or press Skip to enter immediately
        </p>
      </div>

      {/* Top Right Quick Skip Button */}
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          handleDismiss();
        }}
        className="absolute top-6 right-6 p-2 sm:px-4 sm:py-2 text-white/70 hover:text-white transition-colors z-20 flex items-center gap-1.5 bg-black/50 border border-white/20 hover:border-[#D4AF37]"
        aria-label="Skip entrance animation"
      >
        <span className="text-[11px] tracking-widest uppercase font-sans font-semibold">Skip Intro</span>
        <X className="w-4 h-4" />
      </button>
    </aside>
  );
};
