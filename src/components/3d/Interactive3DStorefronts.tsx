import React, { useState, useRef } from 'react';
import { ArrowRight, Sparkles, ShieldCheck, Crown, Scissors, ChevronRight } from 'lucide-react';
import { useNavigation } from '../../context/NavigationContext';

export const Interactive3DStorefronts: React.FC = () => {
  const { navigateTo } = useNavigation();

  // 3D Card Hover States for Women
  const [womenRotate, setWomenRotate] = useState({ x: 0, y: 0 });
  const [womenGlow, setWomenGlow] = useState({ x: 50, y: 50, opacity: 0 });
  const womenCardRef = useRef<HTMLDivElement>(null);

  // 3D Card Hover States for Men
  const [menRotate, setMenRotate] = useState({ x: 0, y: 0 });
  const [menGlow, setMenGlow] = useState({ x: 50, y: 50, opacity: 0 });
  const menCardRef = useRef<HTMLDivElement>(null);

  const handleMouseMove = (
    e: React.MouseEvent<HTMLDivElement>,
    cardRef: React.RefObject<HTMLDivElement | null>,
    setRotate: React.Dispatch<React.SetStateAction<{ x: number; y: number }>>,
    setGlow: React.Dispatch<React.SetStateAction<{ x: number; y: number; opacity: number }>>
  ) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;

    // Calculate rotation (-8 to +8 degrees for subtle luxury depth)
    const rotateX = ((y - centerY) / centerY) * -7;
    const rotateY = ((x - centerX) / centerX) * 7;

    setRotate({ x: rotateX, y: rotateY });
    setGlow({
      x: (x / rect.width) * 100,
      y: (y / rect.height) * 100,
      opacity: 0.6,
    });
  };

  const handleMouseLeave = (
    setRotate: React.Dispatch<React.SetStateAction<{ x: number; y: number }>>,
    setGlow: React.Dispatch<React.SetStateAction<{ x: number; y: number; opacity: number }>>
  ) => {
    setRotate({ x: 0, y: 0 });
    setGlow({ x: 50, y: 50, opacity: 0 });
  };

  return (
    <section className="py-12 sm:py-20 bg-gradient-to-b from-[#050811] via-[#0A0F1D] to-[#050811] border-b border-white/10 relative overflow-hidden select-none">
      {/* Background Cyber Glow Fields */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-[#00F0FF]/8 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-[#F5B738]/8 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-10 sm:mb-14">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#0E1626] border border-[#00F0FF]/40 shadow-xs mb-3">
            <Sparkles className="w-3.5 h-3.5 text-[#00F0FF]" />
            <span className="text-[10px] sm:text-[11px] font-mono font-bold tracking-[0.25em] uppercase text-[#00F0FF]">
              ◈ 2050 CYBER ATELIER PORTALS
            </span>
          </div>
          <h2 className="font-sans font-black text-2xl sm:text-4xl tracking-[0.14em] uppercase text-white mb-3 drop-shadow-[0_0_25px_rgba(255,255,255,0.2)]">
            Choose Your Fashion Storefront
          </h2>
          <p className="text-xs sm:text-sm text-neutral-300 leading-relaxed font-sans">
            Step into our specialized interactive 3D collections. Pure unstitched luxury fabrics direct from certified designer looms and Master Imperial Boski silk artisans.
          </p>
        </div>

        {/* 3D Showcase Grid: Section A (Women) & Section B (Men) */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 sm:gap-10">
          
          {/* SECTION A: WOMEN'S COLLECTION 3D STOREFRONT */}
          <div
            ref={womenCardRef}
            onMouseMove={(e) => handleMouseMove(e, womenCardRef, setWomenRotate, setWomenGlow)}
            onMouseLeave={() => handleMouseLeave(setWomenRotate, setWomenGlow)}
            onClick={() => navigateTo('shop', { gender: 'Women' })}
            style={{
              transform: `perspective(1200px) rotateX(${womenRotate.x}deg) rotateY(${womenRotate.y}deg)`,
              transition: womenRotate.x === 0 ? 'transform 0.6s cubic-bezier(0.2, 0.8, 0.2, 1)' : 'transform 0.1s ease-out',
            }}
            className="group relative cursor-pointer rounded-none border border-[#00F0FF]/30 hover:border-[#00F0FF] bg-[#0A0F1D] shadow-[0_0_30px_rgba(0,240,255,0.15)] hover:shadow-[0_0_45px_rgba(0,240,255,0.3)] transition-all duration-300 overflow-hidden flex flex-col justify-between min-h-[480px] sm:min-h-[540px]"
            role="region"
            aria-label="Women's Collection 3D Storefront"
          >
            {/* Dynamic 3D Specular Sheen Layer */}
            <div
              className="absolute inset-0 pointer-events-none z-20 transition-opacity duration-300"
              style={{
                opacity: womenGlow.opacity,
                background: `radial-gradient(circle at ${womenGlow.x}% ${womenGlow.y}%, rgba(255, 255, 255, 0.5) 0%, rgba(212, 175, 55, 0.2) 30%, transparent 65%)`,
              }}
            />

            {/* Background Fashion Imagery with Zoom on Hover */}
            <div className="absolute inset-0 z-0 overflow-hidden">
              <img
                src="/images/khaadi_unstitched_palace_1791658025090.jpg"
                alt="Niaz Cloth House Women's Unstitched Festive 3D Showcase"
                className="w-full h-full object-cover object-center group-hover:scale-108 transition-transform duration-700 ease-out filter brightness-[0.88] contrast-[1.05]"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/45 to-black/20" />
            </div>

            {/* Top Badge: 3D Depth Float */}
            <div className="relative z-10 p-6 sm:p-8 flex items-center justify-between">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-white/95 backdrop-blur-sm text-black text-[10px] font-bold tracking-[0.2em] uppercase shadow-md border border-[#D4AF37]/50">
                <Sparkles className="w-3 h-3 text-[#D4AF37]" />
                <span>Haute Couture Women</span>
              </span>

              <span className="text-[10px] font-bold tracking-widest uppercase text-white/90 bg-black/60 px-2.5 py-1 backdrop-blur-sm border border-white/20">
                3-Piece Ensembles
              </span>
            </div>

            {/* Middle Dimensional Brand Typography */}
            <div className="relative z-10 px-6 sm:px-8 py-4">
              <span className="text-[11px] font-mono tracking-widest text-[#D4AF37] uppercase font-bold block mb-1">
                Atelier Section A
              </span>
              <h3 className="font-serif text-3xl sm:text-5xl font-black text-white uppercase tracking-tight leading-none drop-shadow-md">
                Women's Collection
              </h3>
              <p className="text-xs sm:text-sm text-neutral-200 mt-3 font-sans leading-relaxed max-w-md">
                Festive Embroidered Lawn, Bamberg Chiffon, Pure Silk Jacquard & Swiss Voile. Featuring Johara, Bin Rashid, Safa Marwa & Sana Noor.
              </p>

              {/* Fabric Specs Badges */}
              <div className="flex flex-wrap items-center gap-2 pt-4">
                <span className="text-[10px] text-white/90 bg-white/15 backdrop-blur-sm px-2.5 py-1 border border-white/25">
                  Combed 80s Lawn
                </span>
                <span className="text-[10px] text-white/90 bg-white/15 backdrop-blur-sm px-2.5 py-1 border border-white/25">
                  Resham Threadwork
                </span>
                <span className="text-[10px] text-white/90 bg-white/15 backdrop-blur-sm px-2.5 py-1 border border-white/25">
                  Chiffon & Silk Dupatta
                </span>
              </div>
            </div>

            {/* Bottom Interactive Action Bar */}
            <div className="relative z-10 p-6 sm:p-8 pt-4 border-t border-white/20 flex items-center justify-between bg-black/40 backdrop-blur-xs">
              <div className="text-left">
                <span className="text-[10px] text-neutral-300 uppercase tracking-widest block font-medium">
                  Complete Suits
                </span>
                <strong className="text-white text-xs sm:text-sm font-bold tracking-wide">
                  Shirt, Dupatta & Shalwar
                </strong>
              </div>

              <div className="inline-flex items-center gap-2 px-5 py-3 bg-[#00F0FF] hover:bg-[#38BDF8] text-black text-xs font-bold tracking-widest uppercase transition-transform duration-200 group-hover:translate-x-1 shadow-lg">
                <span>Enter Women's Atelier</span>
                <ArrowRight className="w-4 h-4" />
              </div>
            </div>
          </div>

          {/* SECTION B: MEN'S COLLECTION 3D STOREFRONT */}
          <div
            ref={menCardRef}
            onMouseMove={(e) => handleMouseMove(e, menCardRef, setMenRotate, setMenGlow)}
            onMouseLeave={() => handleMouseLeave(setMenRotate, setMenGlow)}
            onClick={() => navigateTo('shop', { gender: 'Men' })}
            style={{
              transform: `perspective(1200px) rotateX(${menRotate.x}deg) rotateY(${menRotate.y}deg)`,
              transition: menRotate.x === 0 ? 'transform 0.6s cubic-bezier(0.2, 0.8, 0.2, 1)' : 'transform 0.1s ease-out',
            }}
            className="group relative cursor-pointer rounded-none border border-[#F5B738]/30 hover:border-[#F5B738] bg-[#0A0F1D] shadow-[0_0_30px_rgba(245,183,56,0.15)] hover:shadow-[0_0_45px_rgba(245,183,56,0.3)] transition-all duration-300 overflow-hidden flex flex-col justify-between min-h-[480px] sm:min-h-[540px]"
            role="region"
            aria-label="Men's Collection 3D Storefront"
          >
            {/* Dynamic 3D Specular Sheen Layer */}
            <div
              className="absolute inset-0 pointer-events-none z-20 transition-opacity duration-300"
              style={{
                opacity: menGlow.opacity,
                background: `radial-gradient(circle at ${menGlow.x}% ${menGlow.y}%, rgba(255, 255, 255, 0.45) 0%, rgba(140, 72, 48, 0.2) 30%, transparent 65%)`,
              }}
            />

            {/* Background Fashion Imagery with Zoom on Hover */}
            <div className="absolute inset-0 z-0 overflow-hidden">
              <img
                src="/images/khaadi_mens_boski_display_1791657195697.jpg"
                alt="Niaz Cloth House Men's Unstitched Suiting 3D Showcase"
                className="w-full h-full object-cover object-center group-hover:scale-108 transition-transform duration-700 ease-out filter brightness-[0.85] contrast-[1.08]"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/92 via-black/50 to-black/25" />
            </div>

            {/* Top Badge: 3D Depth Float */}
            <div className="relative z-10 p-6 sm:p-8 flex items-center justify-between">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-white/95 backdrop-blur-sm text-black text-[10px] font-bold tracking-[0.2em] uppercase shadow-md border border-[#8C4830]/50">
                <Crown className="w-3 h-3 text-[#8C4830]" />
                <span>Executive Men's Suiting</span>
              </span>

              <span className="text-[10px] font-bold tracking-widest uppercase text-white/90 bg-black/60 px-2.5 py-1 backdrop-blur-sm border border-white/20">
                4.5m Double Width
              </span>
            </div>

            {/* Middle Dimensional Brand Typography */}
            <div className="relative z-10 px-6 sm:px-8 py-4">
              <span className="text-[11px] font-mono tracking-widest text-[#D4AF37] uppercase font-bold block mb-1">
                Atelier Section B
              </span>
              <h3 className="font-serif text-3xl sm:text-5xl font-black text-white uppercase tracking-tight leading-none drop-shadow-md">
                Men's Collection
              </h3>
              <p className="text-xs sm:text-sm text-neutral-200 mt-3 font-sans leading-relaxed max-w-md">
                Certified 8-Pound Pure Chinese Boski Silk, Wrinkle-Resistant Wash & Wear, Pure Combed Cotton & Kamalia Khaddar.
              </p>

              {/* Fabric Specs Badges */}
              <div className="flex flex-wrap items-center gap-2 pt-4">
                <span className="text-[10px] text-white/90 bg-white/15 backdrop-blur-sm px-2.5 py-1 border border-white/25">
                  8-Pound Chinese Silk
                </span>
                <span className="text-[10px] text-white/90 bg-white/15 backdrop-blur-sm px-2.5 py-1 border border-white/25">
                  Executive Wash & Wear
                </span>
                <span className="text-[10px] text-white/90 bg-white/15 backdrop-blur-sm px-2.5 py-1 border border-white/25">
                  Kamalia Khaddar
                </span>
              </div>
            </div>

            {/* Bottom Interactive Action Bar */}
            <div className="relative z-10 p-6 sm:p-8 pt-4 border-t border-white/20 flex items-center justify-between bg-black/40 backdrop-blur-xs">
              <div className="text-left">
                <span className="text-[10px] text-neutral-300 uppercase tracking-widest block font-medium">
                  Continuous Bolt
                </span>
                <strong className="text-white text-xs sm:text-sm font-bold tracking-wide">
                  Full 4.5m Shalwar Kameez Cut
                </strong>
              </div>

              <div className="inline-flex items-center gap-2 px-5 py-3 bg-[#F5B738] hover:bg-[#FBBF24] text-black text-xs font-bold tracking-widest uppercase transition-transform duration-200 group-hover:translate-x-1 shadow-lg">
                <span>Enter Men's Atelier</span>
                <ArrowRight className="w-4 h-4" />
              </div>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
};
