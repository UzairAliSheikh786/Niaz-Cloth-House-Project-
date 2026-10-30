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
          p.collection.toLowerCase().includes(q) ||
          p.gender.toLowerCase().includes(q) ||
          p.subtitle.toLowerCase().includes(q) ||
          p.description.toLowerCase().includes(q) ||
          (p.fabricWeight && p.fabricWeight.toLowerCase().includes(q)) ||
          (p.threadCount && p.threadCount.toLowerCase().includes(q)) ||
          (p.weaveType && p.weaveType.toLowerCase().includes(q)) ||
          (p.color && p.color.toLowerCase().includes(q))
        );
      })
    : [];

  const handleSelectProduct = (id: string) => {
    setIsSearchOpen(false);
    navigateTo('product-detail', { id });
  };

  return (
    <div
      className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex items-start justify-center pt-16 sm:pt-24 px-4"
      role="dialog"
      aria-modal="true"
    >
      <div className="bg-[#F8FAFC] max-w-2xl w-full border border-[#E2E8F0] shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Search Input Bar */}
        <div className="p-4 sm:p-5 border-b border-[#E2E8F0] flex items-center gap-3 bg-white">
          <Search className="w-5 h-5 text-[#0284C7] shrink-0" />
          <input
            ref={inputRef}
            type="text"
            placeholder="Search unstitched fabrics: Boski, Wash and Wear, Lawn 3-Piece, Chiffon..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full text-sm sm:text-base bg-transparent border-none focus:outline-none placeholder:text-[#1C1917]/65 text-[#1C1917]"
            aria-label="Search catalog by unstitched fabric name, collection, or cut"
          />
          {query && (
            <button
              onClick={() => setQuery('')}
              className="p-1 text-[#1C1917]/70 hover:text-[#1C1917] transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#0284C7]"
              aria-label="Clear search query text"
            >
              <X className="w-4 h-4" />
            </button>
          )}
          <button
            onClick={() => setIsSearchOpen(false)}
            aria-label="Close search overlay"
            className="text-xs px-2.5 py-1 bg-[#F5EFEB] text-[#1C1917] hover:bg-[#EAE2D8] transition-colors border border-[#E2E8F0] font-medium focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#0284C7]"
          >
            ESC
          </button>
        </div>

        {/* Results / Suggestions Container */}
        <div className="max-h-96 overflow-y-auto p-4 sm:p-5">
          {query.trim() === '' ? (
            <div className="space-y-4">
              <div className="text-xs font-semibold uppercase tracking-widest text-[#0284C7]">
                Suggested Textile Searches
              </div>
              <div className="flex flex-wrap gap-2">
                {[
                  '8-Pound Pure Boski',
                  'Wash and Wear Super 120s',
                  'Embroidered Lawn 3-Piece',
                  'Pure Bamberg Chiffon',
                  'Handwoven Raw Karandi',
                  'Swiss Voile Schiffli',
                ].map((item) => (
                  <button
                    key={item}
                    onClick={() => setQuery(item)}
                    className="text-xs px-3 py-1.5 bg-white border border-[#E2E8F0] text-[#1C1917]/80 hover:border-[#0284C7] hover:text-[#0284C7] transition-colors"
                  >
                    {item}
                  </button>
                ))}
              </div>
            </div>
          ) : filtered.length === 0 ? (
            <div className="py-8 text-center text-xs text-[#1C1917]/60">
              No unstitched fabric found matching "{query}". Try searching for Boski, Latha, Lawn, or Chiffon.
            </div>
          ) : (
            <div className="space-y-2">
              <div className="text-xs font-semibold text-[#0284C7] pb-1">
                Found {filtered.length} fabric result{filtered.length > 1 ? 's' : ''}:
              </div>
              {filtered.map((item) => (
                <div
                  key={item.id}
                  onClick={() => handleSelectProduct(item.id)}
                  className="flex items-center gap-3 p-2.5 bg-white hover:bg-[#F7F2ED] border border-[#E2E8F0]/60 cursor-pointer transition-colors group"
                >
                  <img
                    src={item.primaryImage}
                    alt={`${item.title} unstitched ${item.fabric} suit fabric`}
                    width={48}
                    height={48}
                    referrerPolicy="no-referrer"
                    className="w-12 h-12 object-cover bg-[#F2EDE7] shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <h4 className="font-serif text-sm font-semibold text-[#1C1917] group-hover:text-[#0284C7] truncate">
                      {item.title}
                    </h4>
                    <p className="text-xs text-[#0284C7] font-sans truncate">
                      {item.gender} · {item.fabric} · {item.cutDetails.length}
                    </p>
                  </div>
                  <div className="text-right shrink-0">
                    <div className="font-mono text-xs font-bold text-[#1C1917] tabular-nums">
                      {formatPKR(item.price)}
                    </div>
                    <span className="text-[10px] text-[#4A5D4E] font-medium">In Stock</span>
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
