import React, { useState, useEffect, useRef } from 'react';
import { Search, X, ArrowRight, Sparkles } from 'lucide-react';
import { useShop, formatPKR } from '../context/ShopContext';
import { useNavigation } from '../context/NavigationContext';

export const SearchModal: React.FC = () => {
  const { isSearchOpen, setIsSearchOpen, products } = useShop();
  const { navigateTo } = useNavigation();
  const [query, setQuery] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  // Keyboard shortcut '/' or 'Escape'
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === '/' && !isSearchOpen) {
        const target = e.target as HTMLElement;
        if (target.tagName !== 'INPUT' && target.tagName !== 'TEXTAREA') {
          e.preventDefault();
          setIsSearchOpen(true);
        }
      } else if (e.key === 'Escape' && isSearchOpen) {
        setIsSearchOpen(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isSearchOpen, setIsSearchOpen]);

  useEffect(() => {
    if (isSearchOpen) {
      setTimeout(() => {
        inputRef.current?.focus();
      }, 50);
    } else {
      setQuery('');
    }
  }, [isSearchOpen]);

  if (!isSearchOpen) return null;

  const filtered = query.trim()
    ? products.filter((p) => {
        const q = query.toLowerCase();
        return (
          p.title.toLowerCase().includes(q) ||
          p.fabric.toLowerCase().includes(q) ||
          (p.brand && p.brand.toLowerCase().includes(q)) ||
          p.collection.toLowerCase().includes(q) ||
          p.gender.toLowerCase().includes(q) ||
          p.subtitle.toLowerCase().includes(q) ||
          p.description.toLowerCase().includes(q)
        );
      })
    : [];

  const handleSelectProduct = (id: string, slug?: string) => {
    setIsSearchOpen(false);
    navigateTo('product-detail', { id, slug });
  };

  return (
    <div
      className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex items-start justify-center pt-16 sm:pt-24 px-4 select-none"
      role="dialog"
      aria-modal="true"
    >
      <div className="bg-white max-w-2xl w-full border border-neutral-200 shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Search Input Bar */}
        <div className="p-4 sm:p-5 border-b border-neutral-200 flex items-center gap-3 bg-white">
          <Search className="w-5 h-5 text-black shrink-0" />
          <input
            ref={inputRef}
            type="text"
            placeholder="Search suits: Johara, Bin Rashid, Wash & Wear, Boski, Lawn..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full text-sm sm:text-base bg-transparent border-none focus:outline-none placeholder:text-neutral-400 text-black font-medium"
            aria-label="Search catalog"
          />
          {query && (
            <button
              onClick={() => setQuery('')}
              className="p-1 text-neutral-400 hover:text-black transition-colors"
              aria-label="Clear search"
            >
              <X className="w-4 h-4" />
            </button>
          )}
          <button
            onClick={() => setIsSearchOpen(false)}
            aria-label="Close search"
            className="text-[11px] px-2.5 py-1 bg-neutral-100 text-neutral-700 hover:text-black hover:bg-neutral-200 transition-colors font-bold uppercase tracking-wider"
          >
            ESC
          </button>
        </div>

        {/* Results / Suggestions Container */}
        <div className="max-h-96 overflow-y-auto p-4 sm:p-5">
          {query.trim() === '' ? (
            <div className="space-y-4">
              <div className="text-[11px] font-bold uppercase tracking-widest text-neutral-400">
                Popular Searches
              </div>
              <div className="flex flex-wrap gap-2">
                {[
                  'Johara Embroidered',
                  'Bin Rashid Lawn',
                  'Tawakkal 3-Piece',
                  'Bin Saeed Printed',
                  'Men Wash & Wear',
                  'Pure Chinese Boski',
                  'Kamalia Khaddar',
                  'Textured Lelan',
                ].map((item) => (
                  <button
                    key={item}
                    onClick={() => setQuery(item)}
                    className="text-xs px-3 py-1.5 bg-neutral-100 hover:bg-black hover:text-white text-neutral-800 transition-all font-medium"
                  >
                    {item}
                  </button>
                ))}
              </div>
            </div>
          ) : filtered.length === 0 ? (
            <div className="py-8 text-center text-xs text-neutral-500">
              No suits found matching "{query}". Try searching by brand (e.g. Johara, Tawakkal, Bin Saeed) or fabric (Wash & Wear, Boski).
            </div>
          ) : (
            <div className="space-y-2">
              <div className="text-[11px] font-bold uppercase tracking-wider text-neutral-400 pb-1">
                Found {filtered.length} Suit{filtered.length > 1 ? 's' : ''}:
              </div>
              {filtered.map((item) => (
                <div
                  key={item.id}
                  onClick={() => handleSelectProduct(item.id, item.slug)}
                  className="flex items-center gap-3 p-2.5 bg-white hover:bg-neutral-50 border border-neutral-200 cursor-pointer transition-colors group"
                >
                  <img
                    src={item.primaryImage}
                    alt={`${item.title}`}
                    width={48}
                    height={64}
                    className="w-12 h-16 object-cover bg-neutral-100 shrink-0"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = '/images/hero_niaz_luxury_fabric_1791569218384.jpg';
                    }}
                  />
                  <div className="flex-1 min-w-0">
                    <span className="text-[10px] font-bold tracking-wider uppercase text-neutral-500 block">
                      {item.brand || item.gender}
                    </span>
                    <h4 className="font-semibold text-xs text-black group-hover:underline truncate">
                      {item.title}
                    </h4>
                    <p className="text-[11px] text-neutral-500 truncate">
                      {item.fabric} · {item.cutDetails.length}
                    </p>
                  </div>
                  <div className="text-right shrink-0">
                    <div className="text-xs font-black text-black">
                      {formatPKR(item.price)}
                    </div>
                    <span className="text-[10px] text-emerald-700 font-semibold uppercase">In Stock</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
