import React, { useState, useRef } from 'react';
import { ArrowRight } from 'lucide-react';
import { useNavigation } from '../../context/NavigationContext';
import { useShop, formatPKR } from '../../context/ShopContext';

export const Interactive3DStorefronts: React.FC = () => {
  const { navigateTo } = useNavigation();
  const { products } = useShop();

  const sampleWomenProduct = products.find((p) => p.gender === 'Women' && p.inStock) || products[0];
  const sampleMenProduct = products.find((p) => p.gender === 'Men' && p.inStock) || products[1];

  const [womenRotate, setWomenRotate] = useState({ x: 0, y: 0 });
  const [womenGlow, setWomenGlow] = useState({ x: 50, y: 50, opacity: 0 });
  const womenCardRef = useRef<HTMLDivElement>(null);

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

    setRotate({
      x: ((y - centerY) / centerY) * -4,
      y: ((x - centerX) / centerX) * 4,
    });
    setGlow({
      x: (x / rect.width) * 100,
      y: (y / rect.height) * 100,
      opacity: 0.35,
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
    <section className="py-14 sm:py-20 bg-[#08080B] border-t border-[#C5A059]/20 relative overflow-hidden select-none">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-10">
          <div>
            <p className="text-xs font-medium tracking-[0.22em] uppercase text-[#D4AF37] mb-1.5">
              Curated Departments
            </p>
            <h2 className="font-serif text-2xl sm:text-4xl text-[#F7F4EE] font-normal tracking-wide">
              The Couture Showcases
            </h2>
          </div>
          <p className="text-xs sm:text-sm text-[#F7F4EE]/60 max-w-md leading-relaxed">
            Direct from certified mills and master weavers to your wardrobe. Select a department to explore fabrics in detail.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8">
          {/* SHOWCASE A: WOMEN'S LUXURY */}
          <div
            ref={womenCardRef}
            tabIndex={0}
            role="button"
            aria-label="Explore Women's Luxury Collection"
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
              transition: womenRotate.x === 0 ? 'transform 0.5s cubic-bezier(0.16, 1, 0.3, 1)' : 'transform 0.1s ease-out',
            }}
            className="group relative cursor-pointer border border-[#C5A059]/30 hover:border-[#D4AF37] bg-[#101014] overflow-hidden flex flex-col justify-end min-h-[420px] sm:min-h-[480px] rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#D4AF37]"
          >
            <div
              className="absolute inset-0 pointer-events-none z-20 transition-opacity duration-300"
              style={{
                opacity: womenGlow.opacity,
                background: `radial-gradient(circle at ${womenGlow.x}% ${womenGlow.y}%, rgba(212, 175, 55, 0.25) 0%, transparent 65%)`,
              }}
            />

            <img
              src="/images/khaadi_unstitched_palace_1791658025090.jpg"
              alt="Women's Festive & Unstitched Collection"
              referrerPolicy="no-referrer"
              className="absolute inset-0 w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-700"
              onError={(e) => {
                (e.target as HTMLImageElement).src = '/images/hero_niaz_luxury_fabric_1791569218384.jpg';
              }}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#060608] via-[#060608]/55 to-transparent" />

            <div className="relative z-10 p-6 sm:p-8 space-y-3">
              <div className="flex items-center gap-2 text-[11px] uppercase tracking-[0.2em] text-[#D4AF37]">
                <span>Women's Couture</span>
                <span aria-hidden="true">·</span>
                <span>3-Piece Unstitched</span>
              </div>

              <h3 className="font-serif text-3xl sm:text-4xl font-normal text-[#F7F4EE] tracking-wide">
                Festive Lawn &amp; Chiffon
              </h3>

              <p className="text-xs sm:text-sm text-[#F7F4EE]/75 max-w-md leading-relaxed">
                Embroidered silk, zari chiffon, and seasonal lawn ensembles by Johara, Bin Saeed, and Tawakkal.
              </p>

              <div className="pt-3 border-t border-white/15 flex items-center justify-between gap-4">
                {sampleWomenProduct && (
                  <div className="text-xs text-[#E8D5A7]/85 truncate">
                    <span className="block truncate font-medium text-[#F7F4EE]">{sampleWomenProduct.title}</span>
                    <span className="text-[#D4AF37] tabular-nums">{formatPKR(sampleWomenProduct.price)}</span>
                  </div>
                )}

                <span className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#D4AF37] group-hover:bg-[#E5C158] text-[#060608] text-xs font-semibold tracking-widest uppercase transition-colors shrink-0 rounded-xs">
                  <span>Explore</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </span>
              </div>
            </div>
          </div>

          {/* SHOWCASE B: MEN'S ROYAL SUITING */}
          <div
            ref={menCardRef}
            tabIndex={0}
            role="button"
            aria-label="Explore Men's Royal Suiting"
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
              transition: menRotate.x === 0 ? 'transform 0.5s cubic-bezier(0.16, 1, 0.3, 1)' : 'transform 0.1s ease-out',
            }}
            className="group relative cursor-pointer border border-[#C5A059]/30 hover:border-[#D4AF37] bg-[#101014] overflow-hidden flex flex-col justify-end min-h-[420px] sm:min-h-[480px] rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#D4AF37]"
          >
            <div
              className="absolute inset-0 pointer-events-none z-20 transition-opacity duration-300"
              style={{
                opacity: menGlow.opacity,
                background: `radial-gradient(circle at ${menGlow.x}% ${menGlow.y}%, rgba(212, 175, 55, 0.25) 0%, transparent 65%)`,
              }}
            />

            <img
              src="/images/khaadi_mens_boski_display_1791657195697.jpg"
              alt="Men's Pure Boski & Suiting"
              referrerPolicy="no-referrer"
              className="absolute inset-0 w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-700"
              onError={(e) => {
                (e.target as HTMLImageElement).src = '/images/hero_niaz_luxury_fabric_1791569218384.jpg';
              }}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#060608] via-[#060608]/55 to-transparent" />

            <div className="relative z-10 p-6 sm:p-8 space-y-3">
              <div className="flex items-center gap-2 text-[11px] uppercase tracking-[0.2em] text-[#D4AF37]">
                <span>Men's Sartorial</span>
                <span aria-hidden="true">·</span>
                <span>4.5m Double Width</span>
              </div>

              <h3 className="font-serif text-3xl sm:text-4xl font-normal text-[#F7F4EE] tracking-wide">
                Pure Boski &amp; Suiting
              </h3>

              <p className="text-xs sm:text-sm text-[#F7F4EE]/75 max-w-md leading-relaxed">
                Authentic 8-pound Chinese Boski silk, wrinkle-resistant Wash &amp; Wear, combed cotton, and Kamalia Khaddar.
              </p>

              <div className="pt-3 border-t border-white/15 flex items-center justify-between gap-4">
                {sampleMenProduct && (
                  <div className="text-xs text-[#E8D5A7]/85 truncate">
                    <span className="block truncate font-medium text-[#F7F4EE]">{sampleMenProduct.title}</span>
                    <span className="text-[#D4AF37] tabular-nums">{formatPKR(sampleMenProduct.price)}</span>
                  </div>
                )}

                <span className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#D4AF37] group-hover:bg-[#E5C158] text-[#060608] text-xs font-semibold tracking-widest uppercase transition-colors shrink-0 rounded-xs">
                  <span>Explore</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
