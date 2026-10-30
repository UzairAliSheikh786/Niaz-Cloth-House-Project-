import React, { useState } from 'react';
import { Compass, Home, Search, ArrowRight, ShieldCheck, Sparkles, MapPin } from 'lucide-react';
import { useNavigation } from '../context/NavigationContext';

export const NotFoundPage: React.FC = () => {
  const { navigateTo } = useNavigation();
  const [searchQuery, setSearchQuery] = useState('');

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigateTo('shop', { search: searchQuery.trim() });
    }
  };

  return (
    <div className="w-full bg-[#FAF8F5] min-h-[75vh] flex items-center justify-center py-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl w-full text-center space-y-8 animate-in fade-in zoom-in-95 duration-200">
        {/* Heritage Monogram Crest Badge */}
        <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-white border border-[#E7E0D8] shadow-md relative">
          <div className="w-16 h-16 rounded-full bg-[#1C1917] text-[#D4A373] flex flex-col items-center justify-center">
            <span className="font-serif font-bold text-xs tracking-widest">NCH</span>
            <span className="text-[9px] font-sans text-white/60">1970</span>
          </div>
          <span className="absolute -bottom-1 px-2 py-0.5 bg-[#8C4830] text-white text-[10px] font-mono font-bold">
            ERROR 404
          </span>
        </div>

        {/* Heading */}
        <div className="space-y-3">
          <span className="text-xs font-sans uppercase tracking-[0.25em] text-[#8C4830] font-semibold block">
            Page Not Found (404)
          </span>
          <h1 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-bold text-[#1C1917] tracking-tight">
            This Page or Fabric Is Not Available
          </h1>
          <p className="text-xs sm:text-sm text-[#1C1917]/75 max-w-lg mx-auto leading-relaxed">
            The fabric suit or page link you are looking for may have moved or been updated. You can search our collection below or return to our homepage.
          </p>
        </div>

        {/* Quick Search */}
        <form onSubmit={handleSearchSubmit} className="max-w-md mx-auto flex items-center gap-2">
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3 top-3 text-[#1C1917]/40" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search Boski silk, Egyptian Latha, Karandi..."
              className="w-full text-xs py-2.5 pl-9 pr-3 bg-white border border-[#E7E0D8] text-[#1C1917] placeholder:text-[#1C1917]/40 focus:outline-none focus:border-[#8C4830] shadow-2xs"
            />
          </div>
          <button
            type="submit"
            className="py-2.5 px-4 bg-[#8C4830] hover:bg-[#703623] active:bg-[#5C2B1B] text-white text-xs font-semibold tracking-wider uppercase transition-colors shrink-0"
          >
            Find
          </button>
        </form>

        {/* Quick Destination Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-4 text-left">
          <button
            onClick={() => navigateTo('home')}
            className="p-4 bg-white border border-[#E7E0D8] hover:border-[#8C4830] transition-all group block shadow-2xs"
          >
            <div className="flex items-center justify-between text-[#8C4830] mb-1.5">
              <Home className="w-4 h-4" />
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
            </div>
            <strong className="block text-xs font-semibold text-[#1C1917]">Return to Home</strong>
            <span className="text-[11px] text-[#1C1917]/60 block mt-0.5">Explore our flagship store overview</span>
          </button>

          <button
            onClick={() => navigateTo('men-summer')}
            className="p-4 bg-white border border-[#E7E0D8] hover:border-[#8C4830] transition-all group block shadow-2xs"
          >
            <div className="flex items-center justify-between text-[#8C4830] mb-1.5">
              <Sparkles className="w-4 h-4" />
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
            </div>
            <strong className="block text-xs font-semibold text-[#1C1917]">Men's Pure Boski</strong>
            <span className="text-[11px] text-[#1C1917]/60 block mt-0.5">6lb, 8lb & 10lb Chinese silk bolts</span>
          </button>

          <button
            onClick={() => navigateTo('location')}
            className="p-4 bg-white border border-[#E7E0D8] hover:border-[#8C4830] transition-all group block shadow-2xs"
          >
            <div className="flex items-center justify-between text-[#8C4830] mb-1.5">
              <MapPin className="w-4 h-4" />
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
            </div>
            <strong className="block text-xs font-semibold text-[#1C1917]">Paris Bazaar Store</strong>
            <span className="text-[11px] text-[#1C1917]/60 block mt-0.5">Shop 170 Rawalpindi timings & map</span>
          </button>
        </div>

        {/* Support Hotline */}
        <p className="text-[11px] text-[#1C1917]/60">
          Need assistance finding a specific fabric cut? Contact our customer desk at <strong className="font-mono text-[#8C4830]">0334-6565636</strong>.
        </p>
      </div>
    </div>
  );
};
