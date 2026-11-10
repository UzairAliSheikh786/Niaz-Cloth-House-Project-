import React, { useState, useRef } from 'react';
import { ArrowRight, Sparkles, Crown } from 'lucide-react';
import { useNavigation } from '../../context/NavigationContext';
import { useShop, formatPKR } from '../../context/ShopContext';

export const Interactive3DStorefronts: React.FC = () => {
  const { navigateTo } = useNavigation();
  const { products } = useShop();

  // Find sample genuine products for the previews
  const sampleWomenProduct = products.find((p) => p.gender === 'Women' && p.inStock) || products[0];
  const sampleMenProduct = products.find((p) => p.gender === 'Men' && p.inStock) || products[1];

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

    const rotateX = ((y - centerY) / centerY) * -5;
    const rotateY = ((x - centerX) / centerX) * 5;

    setRotate({ x: rotateX, y: rotateY });
    setGlow({
      x: (x / rect.width) * 100,
      y: (y / rect.height) * 100,
      opacity: 0.5,
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
    <section className="py-16 sm:py-24 bg-[#F7F4EE] border-y border-[#E8E0D2] relative overflow-hidden select-none">
      {/* Subtle Warm Ivory Ambient Sheen */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-[#D4AF37]/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-[#E8E0D2]/40 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-12 sm:mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-white border border-[#D4AF37]/40 shadow-xs mb-3">
            <Sparkles className="w-3.5 h-3.5 text-[#D4AF37]" />
            <span className="text-[10px] sm:text-[11px] font-sans font-medium tracking-[0.25em] uppercase text-[#1F1F1F]">
              TWO CURATED ATELIERS
            </span>
          </div>
          <h2 className="font-serif text-3xl sm:text-5xl tracking-[0.04em] text-[#1F1F1F] font-light uppercase mb-3">
            The Fashion Showcases
          </h2>
          <div className="w-16 h-[1.5px] bg-[#D4AF37] mx-auto mb-4" />
          <p className="text-xs sm:text-sm text-[#1F1F1F]/70 leading-relaxed font-sans max-w-lg mx-auto">
            Choose your dedicated shopping experience. Authentic unstitched fabrics direct from certified designer looms and master Boski silk weavers.
          </p>
        </div>

        {/* 3D Showcase Grid: Section A (Women) & Section B (Men) */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 sm:gap-12">
          
          {/* SHOWCASE A: WOMEN'S LUXURY COLLECTION */}
          <div
            ref={womenCardRef}
            tabIndex={0}
            role="button"
            aria-label="Enter Women's Luxury Collection"
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                navigateTo('shop', { gender: 'Women' });
              }
            }}
            onMouseMove={(e) => handleMouseMove(e, womenCardRef, setWomenRotate, setWomenGlow)}
            onMouseLeave={() => handleMouseLeave(setWomenRotate, setWomenGlow)}
            onClick={() => navigateTo('shop', { gender: 'Women' })}
            style={{
              transform: `perspective(1200px) rotateX(${womenRotate.x}deg) rotateY(${womenRotate.y}deg)`,
              transition: womenRotate.x === 0 ? 'transform 0.6s cubic-bezier(0.2, 0.8, 0.2, 1)' : 'transform 0.1s ease-out',
            }}
            className="group relative cursor-pointer border border-[#E8E0D2] hover:border-[#D4AF37] bg-white shadow-[0_8px_30px_rgba(0,0,0,0.06)] hover:shadow-[0_16px_40px_rgba(212,175,55,0.18)] transition-all duration-300 overflow-hidden flex flex-col justify-between min-h-[500px] sm:min-h-[560px] focus:outline-none focus:ring-2 focus:ring-[#D4AF37]"
          >
            {/* Dynamic Specular Sheen Layer */}
            <div
              className="absolute inset-0 pointer-events-none z-20 transition-opacity duration-300"
              style={{
                opacity: womenGlow.opacity,
                background: `radial-gradient(circle at ${womenGlow.x}% ${womenGlow.y}%, rgba(255, 255, 255, 0.6) 0%, rgba(212, 175, 55, 0.15) 40%, transparent 70%)`,
              }}
            />

            {/* Background Fashion Imagery with Zoom on Hover */}
            <div className="absolute inset-0 z-0 overflow-hidden">
              <img
                src="/images/khaadi_unstitched_palace_1791658025090.jpg"
                alt="Niaz Cloth House Women's Unstitched Festive Collection"
                className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-700 ease-out filter brightness-[0.92] contrast-[1.02]"
              />
              {/* Refined Ivory & Champagne Gradient Overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-[#1F1F1F]/90 via-[#1F1F1F]/40 to-transparent" />
            </div>

            {/* Top Badge: 3D Depth Float */}
            <div className="relative z-10 p-6 sm:p-8 flex items-center justify-between">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-white/95 text-[#1F1F1F] text-[10px] font-sans font-medium tracking-[0.2em] uppercase shadow-sm border border-[#D4AF37]/40">
                <Sparkles className="w-3 h-3 text-[#D4AF37]" />
                <span>Atelier Women</span>
              </span>

              <span className="text-[10px] font-sans tracking-widest uppercase text-white/90 bg-[#1F1F1F]/70 px-2.5 py-1 backdrop-blur-xs border border-white/20">
                Festive 3-Piece
              </span>
            </div>

            {/* Middle Dimensional Brand Typography */}
            <div className="relative z-10 px-6 sm:px-8 py-4">
              <span className="text-[11px] font-sans tracking-[0.25em] text-[#D4AF37] uppercase font-semibold block mb-1">
                Showcase A
              </span>
              <h3 className="font-serif text-3xl sm:text-5xl font-light text-white uppercase tracking-normal leading-none drop-shadow-sm">
                Women's Collection
              </h3>
              <p className="text-xs sm:text-sm text-[#F7F4EE]/90 mt-3 font-sans leading-relaxed max-w-md">
                Festive Embroidered Lawn, Bamberg Chiffon, Pure Silk Jacquard & Swiss Voile. Featuring Johara, Bin Rashid, Safa Marwa & Sana Noor.
              </p>

              {/* Genuine product badge if available */}
              {sampleWomenProduct && (
                <div className="mt-4 p-3 bg-black/40 backdrop-blur-xs border border-white/15 max-w-sm">
                  <span className="text-[9px] text-[#D4AF37] tracking-widest uppercase block">Featured From Database</span>
                  <p className="text-xs text-white font-medium truncate">{sampleWomenProduct.title}</p>
                  <span className="text-[11px] text-white/80">{formatPKR(sampleWomenProduct.price)} · {sampleWomenProduct.fabric}</span>
                </div>
              )}
            </div>

            {/* Bottom Action Bar */}
            <div className="relative z-10 p-6 sm:p-8 pt-4 border-t border-white/20 flex items-center justify-between bg-[#1F1F1F]/60 backdrop-blur-xs">
              <div className="text-left">
                <span className="text-[10px] text-[#E8E0D2]/70 uppercase tracking-widest block font-sans">
                  Craft Varieties
                </span>
                <strong className="text-white text-xs sm:text-sm font-medium tracking-wide">
                  Embroidery & Printed Suits
                </strong>
              </div>

              <div className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#D4AF37] hover:bg-[#E5C158] text-[#1F1F1F] text-xs font-medium tracking-widest uppercase transition-transform duration-200 group-hover:translate-x-1 shadow-md">
                <span>Explore Women</span>
                <ArrowRight className="w-4 h-4" />
              </div>
            </div>
          </div>

          {/* SHOWCASE B: MEN'S LUXURY COLLECTION */}
          <div
            ref={menCardRef}
            tabIndex={0}
            role="button"
            aria-label="Enter Men's Sartorial Collection"
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                navigateTo('shop', { gender: 'Men' });
              }
            }}
            onMouseMove={(e) => handleMouseMove(e, menCardRef, setMenRotate, setMenGlow)}
            onMouseLeave={() => handleMouseLeave(setMenRotate, setMenGlow)}
            onClick={() => navigateTo('shop', { gender: 'Men' })}
            style={{
              transform: `perspective(1200px) rotateX(${menRotate.x}deg) rotateY(${menRotate.y}deg)`,
              transition: menRotate.x === 0 ? 'transform 0.6s cubic-bezier(0.2, 0.8, 0.2, 1)' : 'transform 0.1s ease-out',
            }}
            className="group relative cursor-pointer border border-[#E8E0D2] hover:border-[#D4AF37] bg-white shadow-[0_8px_30px_rgba(0,0,0,0.06)] hover:shadow-[0_16px_40px_rgba(212,175,55,0.18)] transition-all duration-300 overflow-hidden flex flex-col justify-between min-h-[500px] sm:min-h-[560px] focus:outline-none focus:ring-2 focus:ring-[#D4AF37]"
          >
            {/* Dynamic Specular Sheen Layer */}
            <div
              className="absolute inset-0 pointer-events-none z-20 transition-opacity duration-300"
              style={{
                opacity: menGlow.opacity,
                background: `radial-gradient(circle at ${menGlow.x}% ${menGlow.y}%, rgba(255, 255, 255, 0.6) 0%, rgba(212, 175, 55, 0.15) 40%, transparent 70%)`,
              }}
            />

            {/* Background Fashion Imagery with Zoom on Hover */}
            <div className="absolute inset-0 z-0 overflow-hidden">
              <img
                src="/images/khaadi_mens_boski_display_1791657195697.jpg"
                alt="Niaz Cloth House Men's Unstitched Suiting Collection"
                className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-700 ease-out filter brightness-[0.88] contrast-[1.04]"
              />
              {/* Charcoal & Dark Architecture Gradient Overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-[#1F1F1F]/92 via-[#1F1F1F]/45 to-transparent" />
            </div>

            {/* Top Badge: 3D Depth Float */}
            <div className="relative z-10 p-6 sm:p-8 flex items-center justify-between">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-white/95 text-[#1F1F1F] text-[10px] font-sans font-medium tracking-[0.2em] uppercase shadow-sm border border-[#D4AF37]/40">
                <Crown className="w-3 h-3 text-[#D4AF37]" />
                <span>Atelier Men</span>
              </span>

              <span className="text-[10px] font-sans tracking-widest uppercase text-white/90 bg-[#1F1F1F]/70 px-2.5 py-1 backdrop-blur-xs border border-white/20">
                4.5m Double Width
              </span>
            </div>

            {/* Middle Dimensional Brand Typography */}
            <div className="relative z-10 px-6 sm:px-8 py-4">
              <span className="text-[11px] font-sans tracking-[0.25em] text-[#D4AF37] uppercase font-semibold block mb-1">
                Showcase B
              </span>
              <h3 className="font-serif text-3xl sm:text-5xl font-light text-white uppercase tracking-normal leading-none drop-shadow-sm">
                Men's Collection
              </h3>
              <p className="text-xs sm:text-sm text-[#F7F4EE]/90 mt-3 font-sans leading-relaxed max-w-md">
                Certified 8-Pound Pure Chinese Boski Silk, Wrinkle-Resistant Wash & Wear, Pure Combed Cotton & Kamalia Khaddar.
              </p>

              {/* Genuine product badge if available */}
              {sampleMenProduct && (
                <div className="mt-4 p-3 bg-black/40 backdrop-blur-xs border border-white/15 max-w-sm">
                  <span className="text-[9px] text-[#D4AF37] tracking-widest uppercase block">Featured From Database</span>
                  <p className="text-xs text-white font-medium truncate">{sampleMenProduct.title}</p>
                  <span className="text-[11px] text-white/80">{formatPKR(sampleMenProduct.price)} · {sampleMenProduct.fabric}</span>
                </div>
              )}
            </div>

            {/* Bottom Action Bar */}
            <div className="relative z-10 p-6 sm:p-8 pt-4 border-t border-white/20 flex items-center justify-between bg-[#1F1F1F]/60 backdrop-blur-xs">
              <div className="text-left">
                <span className="text-[10px] text-[#E8E0D2]/70 uppercase tracking-widest block font-sans">
                  Sartorial Cuts
                </span>
                <strong className="text-white text-xs sm:text-sm font-medium tracking-wide">
                  Boski, Wash & Wear, Khaddar
                </strong>
              </div>

              <div className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#D4AF37] hover:bg-[#E5C158] text-[#1F1F1F] text-xs font-medium tracking-widest uppercase transition-transform duration-200 group-hover:translate-x-1 shadow-md">
                <span>Explore Men</span>
                <ArrowRight className="w-4 h-4" />
              </div>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
};
