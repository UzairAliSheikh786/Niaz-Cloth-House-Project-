import React, { useEffect, useState, useRef } from 'react';
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
  const [tilt, setTilt] = useState({ x: 0, y: 0 });
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Respect reduced motion
    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReduced && !forceShow) {
      if (onComplete) onComplete();
      return;
    }

    const hasSeenIntro = sessionStorage.getItem('nch_brand_intro_seen');
    if (!hasSeenIntro || forceShow) {
      setIsVisible(true);
      // Fast luxury reveal: 3.2s auto-exit
      const exitTimer = setTimeout(() => {
        handleDismiss();
      }, 3200);

      return () => clearTimeout(exitTimer);
    }
  }, [forceShow]);

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
    }, 600);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!containerRef.current) return;
    const { innerWidth, innerHeight } = window;
    const x = (e.clientX - innerWidth / 2) / (innerWidth / 2);
    const y = (e.clientY - innerHeight / 2) / (innerHeight / 2);
    setTilt({ x: -y * 6, y: x * 6 });
  };

  if (!isVisible) return null;

  return (
    <aside
      aria-label="Niaz Cloth House Luxury Boutique Entrance"
      onClick={handleDismiss}
      onMouseMove={handleMouseMove}
      className={`fixed inset-0 z-50 flex items-center justify-center cursor-pointer select-none overflow-hidden transition-all duration-600 bg-[#1F1F1F]/95 backdrop-blur-md ${
        isExiting ? 'opacity-0 pointer-events-none scale-105' : 'opacity-100 scale-100'
      }`}
    >
      {/* Warm Ambient Heritage Gold Lighting Sheen */}
      <div className="absolute w-[600px] h-[600px] rounded-full bg-[#D4AF37]/10 blur-[140px] pointer-events-none -top-24 -left-24" />
      <div className="absolute w-[500px] h-[500px] rounded-full bg-[#E8E0D2]/10 blur-[120px] pointer-events-none -bottom-24 -right-24" />

      {/* Subtle Micro-Weave Loom Background Texture */}
      <div
        className="absolute inset-0 opacity-10 pointer-events-none"
        style={{
          backgroundImage: `radial-gradient(#D4AF37 1px, transparent 1px)`,
          backgroundSize: '32px 32px',
        }}
      />

      {/* 3D Perspective Card Container */}
      <div
        ref={containerRef}
        style={{
          transform: `perspective(1000px) rotateX(${tilt.x}deg) rotateY(${tilt.y}deg)`,
          transition: 'transform 0.15s ease-out',
        }}
        className={`relative max-w-2xl mx-auto px-6 py-12 text-center flex flex-col items-center justify-center space-y-6 z-10 transition-all duration-600 ${
          isExiting ? 'opacity-0 scale-95 -translate-y-4' : 'opacity-100 scale-100'
        }`}
      >
        {/* Refined Heritage Monogram Emblem */}
        <div className="flex items-center justify-center mb-2">
          <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full border border-[#D4AF37]/60 bg-[#1F1F1F] flex items-center justify-center shadow-[0_4px_30px_rgba(212,175,55,0.2)] relative">
            <span className="font-serif text-2xl sm:text-3xl font-light text-[#D4AF37] tracking-[0.2em] pl-1">
              NCH
            </span>
            <div
              className="absolute -inset-1.5 rounded-full border border-[#D4AF37]/25 border-dashed animate-spin"
              style={{ animationDuration: '40s' }}
            />
          </div>
        </div>

        {/* Established Tag */}
        <div className="inline-flex items-center gap-3">
          <span className="w-12 h-[1px] bg-[#D4AF37]/40" />
          <span className="text-[11px] sm:text-xs uppercase tracking-[0.35em] text-[#D4AF37] font-sans font-medium">
            ESTABLISHED 1970 · PARIS BAZAAR
          </span>
          <span className="w-12 h-[1px] bg-[#D4AF37]/40" />
        </div>

        {/* Brand Name */}
        <div className="space-y-2">
          <h1 className="font-serif text-4xl sm:text-6xl text-[#F7F4EE] tracking-[0.08em] font-light uppercase">
            Niaz Cloth House
          </h1>
          <p className="font-sans text-xs sm:text-sm text-[#D4AF37] tracking-[0.3em] uppercase font-medium">
            Dress to Impress
          </p>
        </div>

        {/* Elegant Gold Divider */}
        <div className="w-32 h-[1px] bg-gradient-to-r from-transparent via-[#D4AF37]/70 to-transparent" />

        {/* Editorial Subtitle */}
        <p className="text-xs sm:text-sm text-[#E8E0D2]/80 max-w-md font-sans leading-relaxed">
          Master unstitched fabrics, authentic Chinese Boski silk, and curated festive collections from Pakistan's most revered textile houses.
        </p>

        {/* Enter Button */}
        <div className="pt-2">
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              handleDismiss();
            }}
            className="px-8 py-3 bg-[#D4AF37] hover:bg-[#E5C158] text-[#1F1F1F] text-xs font-medium tracking-[0.25em] uppercase transition-all duration-300 inline-flex items-center gap-3 shadow-lg hover:shadow-[#D4AF37]/30"
          >
            <span>Enter Boutique</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        <p className="text-[10px] text-[#E8E0D2]/40 tracking-widest font-sans uppercase">
          Click anywhere to continue
        </p>
      </div>

      {/* Top Right Quick Skip Button */}
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          handleDismiss();
        }}
        className="absolute top-6 right-6 px-4 py-2 text-[#E8E0D2]/70 hover:text-[#F7F4EE] transition-colors z-20 flex items-center gap-1.5 border border-[#D4AF37]/30 hover:border-[#D4AF37] bg-[#1F1F1F]/60"
        aria-label="Skip entrance animation"
      >
        <span className="text-[11px] tracking-widest uppercase font-sans">Skip</span>
        <X className="w-4 h-4 text-[#D4AF37]" />
      </button>
    </aside>
  );
};
