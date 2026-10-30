import React, { useState, useMemo } from 'react';
import { 
  ArrowLeftRight, 
  ShoppingBag, 
  Check, 
  Sparkles, 
  Sun, 
  Flame, 
  CloudRain, 
  Scissors, 
  ShieldCheck, 
  Scale, 
  ExternalLink,
  MessageCircle,
  HelpCircle,
  ChevronDown,
  X,
  Search
} from 'lucide-react';
import { useShop, formatPKR } from '../context/ShopContext';
import { useNavigation } from '../context/NavigationContext';
import { Product } from '../types';
import { 
  CURATED_COMPARISONS, 
  getFabricSeasonalSpec, 
  generateComparisonVerdict 
} from '../utils/fabricComparison';

export const ComparePage: React.FC = () => {
  const { products, compareProductIds, setCompareProductA, setCompareProductB, swapCompareProducts, addToCart } = useShop();
  const { navigateTo } = useNavigation();

  const [selectorModalSlot, setSelectorModalSlot] = useState<'A' | 'B' | null>(null);
  const [searchFilter, setSearchFilter] = useState('');
  const [genderFilter, setGenderFilter] = useState<'All' | 'Men' | 'Women'>('All');

  // Resolved selected products
  const productA = useMemo(() => {
    return products.find((p) => p.id === compareProductIds[0]) || products[0];
  }, [products, compareProductIds]);

  const productB = useMemo(() => {
    return products.find((p) => p.id === compareProductIds[1]) || products[1] || products[0];
  }, [products, compareProductIds]);

  // Seasonal specifications for both
  const specA = useMemo(() => getFabricSeasonalSpec(productA), [productA]);
  const specB = useMemo(() => getFabricSeasonalSpec(productB), [productB]);

  // Verdict
  const verdictText = useMemo(() => generateComparisonVerdict(productA, productB), [productA, productB]);

  // Price difference calculation
  const priceDiff = Math.abs(productA.price - productB.price);
  const isAPricier = productA.price > productB.price;
  const isSamePrice = productA.price === productB.price;

  // Filtered products for selection modal
  const selectableProducts = useMemo(() => {
    return products.filter((p) => {
      const matchGender = genderFilter === 'All' || p.gender === genderFilter;
      const matchSearch = !searchFilter.trim() || 
        p.title.toLowerCase().includes(searchFilter.toLowerCase()) ||
        p.fabric.toLowerCase().includes(searchFilter.toLowerCase()) ||
        (p.brand && p.brand.toLowerCase().includes(searchFilter.toLowerCase()));
      return matchGender && matchSearch;
    });
  }, [products, genderFilter, searchFilter]);

  const handleSelectProduct = (product: Product) => {
    if (selectorModalSlot === 'A') {
      setCompareProductA(product.id);
    } else if (selectorModalSlot === 'B') {
      setCompareProductB(product.id);
    }
    setSelectorModalSlot(null);
    setSearchFilter('');
  };

  const handleLoadCuratedPair = (prodAId: string, prodBId: string) => {
    setCompareProductA(prodAId);
    setCompareProductB(prodBId);
  };

  const createWhatsAppInquiryUrl = (prod: Product) => {
    const text = encodeURIComponent(
      `Assalam-o-Alaikum Niaz Cloth House, I am inquiring about the unstitched suit:\n\n*${prod.title}* (${prod.fabric})\nPrice: ₨ ${prod.price.toLocaleString('en-PK')}\n\nCould you please advise if this is in stock for delivery?`
    );
    return `https://wa.me/923346565636?text=${text}`;
  };

  return (
    <div className="w-full bg-[#FAF8F5] min-h-screen py-8 sm:py-12 border-b border-[#E7E0D8]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        
        {/* Breadcrumb Navigation */}
        <nav aria-label="Breadcrumb" className="text-xs text-[#1C1917]/60 flex items-center gap-2">
          <button 
            onClick={() => navigateTo('home')} 
            className="hover:text-[#8C4830] transition-colors"
          >
            Home
          </button>
          <span>/</span>
          <button 
            onClick={() => navigateTo('shop')} 
            className="hover:text-[#8C4830] transition-colors"
          >
            All Fabrics
          </button>
          <span>/</span>
          <span className="text-[#1C1917] font-semibold">Compare Fabrics</span>
        </nav>

        {/* Page Header */}
        <div className="border-b border-[#E7E0D8] pb-6">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div>
              <div className="inline-flex items-center gap-1.5 text-xs uppercase tracking-widest text-[#8C4830] font-bold mb-2">
                <Scale className="w-4 h-4" />
                <span>Side-by-Side Fabric Comparison</span>
              </div>
              <h1 className="font-serif text-3xl sm:text-4xl font-bold text-[#1C1917] tracking-tight">
                Compare Unstitched Fabrics
              </h1>
              <p className="text-sm text-[#1C1917]/70 mt-2 max-w-2xl leading-relaxed">
                Choose any two unstitched fabrics to compare prices, seasonal weather suitability, suit length, and cloth specifications side-by-side.
              </p>
            </div>

            {/* Quick Swap Control */}
            <button
              onClick={swapCompareProducts}
              className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-white hover:bg-[#F4ECE3] text-[#1C1917] border border-[#E7E0D8] text-xs font-semibold shadow-xs transition-colors self-start md:self-end"
              title="Swap Fabric A and Fabric B"
            >
              <ArrowLeftRight className="w-4 h-4 text-[#8C4830]" />
              <span>Swap Positions</span>
            </button>
          </div>

          {/* Quick-Select Popular Pairs */}
          <div className="mt-6 pt-5 border-t border-[#E7E0D8]/60">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-[#1C1917]/60 block mb-2.5">
              Popular Comparisons:
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
              {CURATED_COMPARISONS.map((curated) => {
                const isActive = 
                  (productA.id === curated.productAId && productB.id === curated.productBId) ||
                  (productA.id === curated.productBId && productB.id === curated.productAId);
                return (
                  <button
                    key={curated.id}
                    onClick={() => handleLoadCuratedPair(curated.productAId, curated.productBId)}
                    className={`text-left p-3 border transition-all text-xs flex flex-col justify-between ${
                      isActive 
                        ? 'bg-[#8C4830] text-white border-[#8C4830] shadow-xs' 
                        : 'bg-white hover:bg-[#F2ECE5] text-[#1C1917] border-[#E7E0D8]'
                    }`}
                  >
                    <div>
                      <span className={`text-[10px] font-bold uppercase tracking-wider block mb-1 ${
                        isActive ? 'text-[#FAF8F5]/80' : 'text-[#8C4830]'
                      }`}>
                        {curated.badge}
                      </span>
                      <strong className="font-serif block line-clamp-1 text-xs">
                        {curated.title}
                      </strong>
                    </div>
                    <span className={`text-[11px] mt-1 line-clamp-1 ${
                      isActive ? 'text-white/80' : 'text-[#1C1917]/60'
                    }`}>
                      {curated.subtitle}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Top Product Cards (Selectable Slots) */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 relative">
          {/* Middle Swap Button for Large Screens */}
          <div className="hidden md:flex absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-10">
            <button
              onClick={swapCompareProducts}
              className="w-10 h-10 rounded-full bg-[#1C1917] hover:bg-[#8C4830] text-white flex items-center justify-center shadow-lg transition-colors border-2 border-white"
              title="Swap Fabrics"
            >
              <ArrowLeftRight className="w-4 h-4" />
            </button>
          </div>

          {/* Slot A Card */}
          <div className="bg-white border-2 border-[#8C4830]/30 p-5 shadow-xs flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="text-[11px] font-bold uppercase tracking-wider px-2 py-0.5 bg-[#8C4830] text-white">
                  Fabric A
                </span>
                <button
                  onClick={() => setSelectorModalSlot('A')}
                  className="text-xs text-[#8C4830] hover:underline font-semibold flex items-center gap-1"
                >
                  <span>Change Fabric</span>
                  <ChevronDown className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="flex gap-4">
                <img
                  src={productA.primaryImage}
                  alt={productA.title}
                  className="w-24 h-28 object-cover bg-[#F2EDE7] border border-[#E7E0D8] shrink-0"
                />
                <div className="space-y-1 min-w-0">
                  <span className="text-[10px] text-[#8C4830] font-bold uppercase tracking-wider block">
                    {productA.brand || productA.gender} · {productA.season || 'All Season'}
                  </span>
                  <h3 className="font-serif text-base sm:text-lg font-bold text-[#1C1917] leading-snug line-clamp-2">
                    {productA.title}
                  </h3>
                  <p className="text-xs text-[#1C1917]/70 line-clamp-1 font-sans">
                    {productA.subtitle}
                  </p>
                  <div className="pt-2 text-lg font-mono font-bold text-[#1C1917]">
                    {formatPKR(productA.price)}
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-5 pt-4 border-t border-[#E7E0D8] flex items-center gap-2">
              <button
                onClick={() => addToCart(productA, 1)}
                className="flex-1 py-2 px-3 bg-[#8C4830] hover:bg-[#703623] text-white text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors"
              >
                <ShoppingBag className="w-3.5 h-3.5" />
                <span>Add to Bag</span>
              </button>
              <button
                onClick={() => navigateTo('product-detail', { id: productA.id, slug: productA.slug })}
                className="py-2 px-3 bg-[#FAF8F5] hover:bg-[#F2ECE5] text-[#1C1917] border border-[#E7E0D8] text-xs font-medium transition-colors"
                title="View Full Product Page"
              >
                Details
              </button>
              <a
                href={createWhatsAppInquiryUrl(productA)}
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 bg-[#25D366]/10 hover:bg-[#25D366]/20 text-[#25D366] border border-[#25D366]/30 transition-colors"
                title="Ask on WhatsApp"
              >
                <MessageCircle className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* Slot B Card */}
          <div className="bg-white border-2 border-[#1C1917]/20 p-5 shadow-xs flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="text-[11px] font-bold uppercase tracking-wider px-2 py-0.5 bg-[#1C1917] text-white">
                  Fabric B
                </span>
                <button
                  onClick={() => setSelectorModalSlot('B')}
                  className="text-xs text-[#8C4830] hover:underline font-semibold flex items-center gap-1"
                >
                  <span>Change Fabric</span>
                  <ChevronDown className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="flex gap-4">
                <img
                  src={productB.primaryImage}
                  alt={productB.title}
                  className="w-24 h-28 object-cover bg-[#F2EDE7] border border-[#E7E0D8] shrink-0"
                />
                <div className="space-y-1 min-w-0">
                  <span className="text-[10px] text-[#8C4830] font-bold uppercase tracking-wider block">
                    {productB.brand || productB.gender} · {productB.season || 'All Season'}
                  </span>
                  <h3 className="font-serif text-base sm:text-lg font-bold text-[#1C1917] leading-snug line-clamp-2">
                    {productB.title}
                  </h3>
                  <p className="text-xs text-[#1C1917]/70 line-clamp-1 font-sans">
                    {productB.subtitle}
                  </p>
                  <div className="pt-2 text-lg font-mono font-bold text-[#1C1917]">
                    {formatPKR(productB.price)}
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-5 pt-4 border-t border-[#E7E0D8] flex items-center gap-2">
              <button
                onClick={() => addToCart(productB, 1)}
                className="flex-1 py-2 px-3 bg-[#1C1917] hover:bg-[#2A2622] text-white text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors"
              >
                <ShoppingBag className="w-3.5 h-3.5" />
                <span>Add to Bag</span>
              </button>
              <button
                onClick={() => navigateTo('product-detail', { id: productB.id, slug: productB.slug })}
                className="py-2 px-3 bg-[#FAF8F5] hover:bg-[#F2ECE5] text-[#1C1917] border border-[#E7E0D8] text-xs font-medium transition-colors"
                title="View Full Product Page"
              >
                Details
              </button>
              <a
                href={createWhatsAppInquiryUrl(productB)}
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 bg-[#25D366]/10 hover:bg-[#25D366]/20 text-[#25D366] border border-[#25D366]/30 transition-colors"
                title="Ask on WhatsApp"
              >
                <MessageCircle className="w-4 h-4" />
              </a>
            </div>
          </div>
        </div>

        {/* Quick Price Difference Callout Banner */}
        <div className="bg-white border border-[#E7E0D8] p-4 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2.5">
            <span className="p-1.5 bg-[#8C4830]/10 text-[#8C4830] shrink-0">
              <Sparkles className="w-4 h-4" />
            </span>
            <div>
              <strong className="text-[#1C1917] block font-semibold text-sm">
                {isSamePrice 
                  ? 'Both fabrics are the same price' 
                  : `${isAPricier ? productA.title : productB.title} is ₨ ${priceDiff.toLocaleString('en-PK')} higher`
                }
              </strong>
              <p className="text-[#1C1917]/70">
                {isSamePrice 
                  ? 'Both items cost ₨ ' + productA.price.toLocaleString('en-PK') + '. Compare based on weather and feel.' 
                  : `Price difference reflects material, weight, or embroidery craftsmanship.`
                }
              </p>
            </div>
          </div>

          <div className="text-right shrink-0">
            <span className="text-[11px] text-[#1C1917]/60 block">Nationwide Delivery:</span>
            <span className="font-semibold text-emerald-700">Cash on Delivery (COD) Available</span>
          </div>
        </div>

        {/* SECTION 1: RECOMMENDED SEASONAL USAGE & WEATHER SUITABILITY */}
        <div className="bg-white border border-[#E7E0D8] shadow-xs overflow-hidden">
          <div className="bg-[#1C1917] text-white px-5 py-3.5 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sun className="w-4 h-4 text-[#D4A373]" />
              <h2 className="font-serif text-sm font-bold tracking-wide">
                1. Recommended Seasonal Usage & Weather Suitability
              </h2>
            </div>
            <span className="text-[11px] text-white/70">Pakistani Climate Guide</span>
          </div>

          <div className="divide-y divide-[#E7E0D8] text-xs">
            {/* Best Season */}
            <div className="grid grid-cols-1 md:grid-cols-3 p-4 gap-2 items-center">
              <div className="font-semibold text-[#1C1917] md:border-r md:border-[#E7E0D8] pr-4">
                Recommended Season
              </div>
              <div className="md:px-4 font-medium text-[#8C4830] flex items-center gap-1.5">
                {specA.seasonLabel.toLowerCase().includes('winter') ? <Flame className="w-3.5 h-3.5" /> : <Sun className="w-3.5 h-3.5" />}
                <span>{specA.seasonLabel}</span>
              </div>
              <div className="md:px-4 font-medium text-[#1C1917] flex items-center gap-1.5">
                {specB.seasonLabel.toLowerCase().includes('winter') ? <Flame className="w-3.5 h-3.5" /> : <Sun className="w-3.5 h-3.5" />}
                <span>{specB.seasonLabel}</span>
              </div>
            </div>

            {/* Recommended Temperature */}
            <div className="grid grid-cols-1 md:grid-cols-3 p-4 gap-2 items-center bg-[#FAF8F5]/50">
              <div className="font-semibold text-[#1C1917] md:border-r md:border-[#E7E0D8] pr-4">
                Best Temperature Range
              </div>
              <div className="md:px-4 font-mono font-medium text-[#1C1917]">
                {specA.recommendedTemp}
              </div>
              <div className="md:px-4 font-mono font-medium text-[#1C1917]">
                {specB.recommendedTemp}
              </div>
            </div>

            {/* Breathability */}
            <div className="grid grid-cols-1 md:grid-cols-3 p-4 gap-2 items-center">
              <div className="font-semibold text-[#1C1917] md:border-r md:border-[#E7E0D8] pr-4">
                Breathability & Airflow
              </div>
              <div className="md:px-4 font-medium text-[#1C1917]">
                <span className="px-2 py-0.5 bg-emerald-50 text-emerald-800 border border-emerald-200">
                  {specA.breathability}
                </span>
              </div>
              <div className="md:px-4 font-medium text-[#1C1917]">
                <span className="px-2 py-0.5 bg-emerald-50 text-emerald-800 border border-emerald-200">
                  {specB.breathability}
                </span>
              </div>
            </div>

            {/* Insulation / Warmth */}
            <div className="grid grid-cols-1 md:grid-cols-3 p-4 gap-2 items-center bg-[#FAF8F5]/50">
              <div className="font-semibold text-[#1C1917] md:border-r md:border-[#E7E0D8] pr-4">
                Warmth & Thickness
              </div>
              <div className="md:px-4 text-[#1C1917]/80">
                {specA.insulation}
              </div>
              <div className="md:px-4 text-[#1C1917]/80">
                {specB.insulation}
              </div>
            </div>

            {/* Best Occasions */}
            <div className="grid grid-cols-1 md:grid-cols-3 p-4 gap-2 items-start">
              <div className="font-semibold text-[#1C1917] md:border-r md:border-[#E7E0D8] pr-4 pt-1">
                Best Occasions
              </div>
              <div className="md:px-4 space-y-1">
                {specA.bestOccasions.map((occ, i) => (
                  <div key={i} className="flex items-center gap-1.5 text-[#1C1917]/80">
                    <Check className="w-3 h-3 text-[#8C4830] shrink-0" />
                    <span>{occ}</span>
                  </div>
                ))}
              </div>
              <div className="md:px-4 space-y-1">
                {specB.bestOccasions.map((occ, i) => (
                  <div key={i} className="flex items-center gap-1.5 text-[#1C1917]/80">
                    <Check className="w-3 h-3 text-[#8C4830] shrink-0" />
                    <span>{occ}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Weather Verdict */}
            <div className="grid grid-cols-1 md:grid-cols-3 p-4 gap-2 items-start bg-[#FAF8F5]/50">
              <div className="font-semibold text-[#1C1917] md:border-r md:border-[#E7E0D8] pr-4 pt-1">
                Weather Performance
              </div>
              <div className="md:px-4 text-[#1C1917]/80 leading-relaxed">
                {specA.climateVerdict}
              </div>
              <div className="md:px-4 text-[#1C1917]/80 leading-relaxed">
                {specB.climateVerdict}
              </div>
            </div>
          </div>
        </div>

        {/* SECTION 2: CLOTH & TAILORING SPECIFICATIONS */}
        <div className="bg-white border border-[#E7E0D8] shadow-xs overflow-hidden">
          <div className="bg-[#1C1917] text-white px-5 py-3.5 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Scissors className="w-4 h-4 text-[#D4A373]" />
              <h2 className="font-serif text-sm font-bold tracking-wide">
                2. Cloth Specifications & Sizing
              </h2>
            </div>
            <span className="text-[11px] text-white/70">Unstitched Details</span>
          </div>

          <div className="divide-y divide-[#E7E0D8] text-xs">
            {/* Fabric Material */}
            <div className="grid grid-cols-1 md:grid-cols-3 p-4 gap-2 items-center">
              <div className="font-semibold text-[#1C1917] md:border-r md:border-[#E7E0D8] pr-4">
                Fabric Material / Type
              </div>
              <div className="md:px-4 font-bold text-[#1C1917]">
                {productA.fabric}
              </div>
              <div className="md:px-4 font-bold text-[#1C1917]">
                {productB.fabric}
              </div>
            </div>

            {/* Suit Pieces / Cut Details */}
            <div className="grid grid-cols-1 md:grid-cols-3 p-4 gap-2 items-center bg-[#FAF8F5]/50">
              <div className="font-semibold text-[#1C1917] md:border-r md:border-[#E7E0D8] pr-4">
                Suit Length & Pieces
              </div>
              <div className="md:px-4 text-[#1C1917]">
                <strong className="block">{productA.cutDetails?.length || '4.5 Standard Meters'}</strong>
                <span className="text-[11px] text-[#1C1917]/60 block">{productA.cutDetails?.width || '54 Inches (Double Width / Bara Arz)'}</span>
              </div>
              <div className="md:px-4 text-[#1C1917]">
                <strong className="block">{productB.cutDetails?.length || '4.5 Standard Meters'}</strong>
                <span className="text-[11px] text-[#1C1917]/60 block">{productB.cutDetails?.width || '54 Inches (Double Width / Bara Arz)'}</span>
              </div>
            </div>

            {/* Weight Grade */}
            <div className="grid grid-cols-1 md:grid-cols-3 p-4 gap-2 items-center">
              <div className="font-semibold text-[#1C1917] md:border-r md:border-[#E7E0D8] pr-4">
                Fabric Weight & Count
              </div>
              <div className="md:px-4 text-[#1C1917]/90">
                <span className="font-semibold block">{productA.weightGrade || productA.fabricWeightCategory || 'Medium Weight'}</span>
                {productA.fabricWeight && <span className="text-[11px] text-[#1C1917]/60 block">{productA.fabricWeight}</span>}
              </div>
              <div className="md:px-4 text-[#1C1917]/90">
                <span className="font-semibold block">{productB.weightGrade || productB.fabricWeightCategory || 'Medium Weight'}</span>
                {productB.fabricWeight && <span className="text-[11px] text-[#1C1917]/60 block">{productB.fabricWeight}</span>}
              </div>
            </div>

            {/* Weave Style */}
            <div className="grid grid-cols-1 md:grid-cols-3 p-4 gap-2 items-center bg-[#FAF8F5]/50">
              <div className="font-semibold text-[#1C1917] md:border-r md:border-[#E7E0D8] pr-4">
                Weave Texture
              </div>
              <div className="md:px-4 text-[#1C1917]/80">
                {productA.weaveType || 'Traditional Authentic Weave'}
              </div>
              <div className="md:px-4 text-[#1C1917]/80">
                {productB.weaveType || 'Traditional Authentic Weave'}
              </div>
            </div>

            {/* Pre-Wash (Tarr-Karna) */}
            <div className="grid grid-cols-1 md:grid-cols-3 p-4 gap-2 items-start">
              <div className="font-semibold text-[#1C1917] md:border-r md:border-[#E7E0D8] pr-4 pt-1">
                Soaking (Tarr-Karna) Guide
              </div>
              <div className="md:px-4 text-[#1C1917]/80 leading-relaxed">
                {productA.care?.shrinkage || 'Soak pure cotton/latha in clean cold water for 1.5–2 hours before tailoring.'}
              </div>
              <div className="md:px-4 text-[#1C1917]/80 leading-relaxed">
                {productB.care?.shrinkage || 'Soak pure cotton/latha in clean cold water for 1.5–2 hours before tailoring.'}
              </div>
            </div>

            {/* Washing Instructions */}
            <div className="grid grid-cols-1 md:grid-cols-3 p-4 gap-2 items-start bg-[#FAF8F5]/50">
              <div className="font-semibold text-[#1C1917] md:border-r md:border-[#E7E0D8] pr-4 pt-1">
                Washing & Ironing Care
              </div>
              <div className="md:px-4 text-[#1C1917]/80 space-y-1">
                <p><strong>Wash:</strong> {productA.care?.washing || 'Gentle wash with mild soap.'}</p>
                <p><strong>Iron:</strong> {productA.care?.ironing || 'Steam iron on moderate heat.'}</p>
              </div>
              <div className="md:px-4 text-[#1C1917]/80 space-y-1">
                <p><strong>Wash:</strong> {productB.care?.washing || 'Gentle wash with mild soap.'}</p>
                <p><strong>Iron:</strong> {productB.care?.ironing || 'Steam iron on moderate heat.'}</p>
              </div>
            </div>
          </div>
        </div>

        {/* SECTION 3: SHOPKEEPER VERDICT & PRACTICAL RECOMMENDATION */}
        <div className="bg-[#FAF8F5] border-2 border-[#8C4830] p-6 shadow-xs space-y-3">
          <div className="flex items-center gap-2 text-[#8C4830] font-bold text-sm">
            <Sparkles className="w-5 h-5 text-[#8C4830]" />
            <h3 className="font-serif text-base sm:text-lg">Our Shopkeeper Recommendation:</h3>
          </div>
          <p className="text-sm text-[#1C1917] leading-relaxed">
            {verdictText}
          </p>
          <div className="pt-2 flex flex-wrap items-center gap-4 text-xs text-[#1C1917]/80 border-t border-[#8C4830]/20">
            <div className="flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-[#8C4830]" />
              <span>100% Genuine Fabric Guarantee</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Check className="w-4 h-4 text-emerald-700" />
              <span>Free Delivery on Multi-Suit Orders</span>
            </div>
            <div className="flex items-center gap-1.5">
              <MessageCircle className="w-4 h-4 text-emerald-600" />
              <span>WhatsApp Shop Desk: 0334-6565636</span>
            </div>
          </div>
        </div>

      </div>

      {/* FABRIC SELECTOR MODAL */}
      {selectorModalSlot && (
        <div 
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in-50"
          role="dialog"
          aria-label="Select Fabric for Comparison"
        >
          <div className="bg-white w-full max-w-2xl max-h-[85vh] border border-[#E7E0D8] shadow-2xl flex flex-col overflow-hidden">
            {/* Modal Header */}
            <div className="bg-[#1C1917] text-white p-4 flex items-center justify-between shrink-0">
              <div>
                <h3 className="font-serif text-base font-bold">
                  Choose Fabric {selectorModalSlot}
                </h3>
                <p className="text-[11px] text-white/70">
                  Select an unstitched material from our Rawalpindi catalog
                </p>
              </div>
              <button
                onClick={() => setSelectorModalSlot(null)}
                className="p-1.5 text-white/70 hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Search & Filter Controls */}
            <div className="p-3.5 bg-[#FAF8F5] border-b border-[#E7E0D8] space-y-2.5 shrink-0">
              <div className="relative">
                <Search className="w-4 h-4 text-[#1C1917]/40 absolute left-3 top-2.5" />
                <input
                  type="text"
                  value={searchFilter}
                  onChange={(e) => setSearchFilter(e.target.value)}
                  placeholder="Search Boski, Latha, Khaddar, Bin Saeed, Lawn..."
                  className="w-full text-xs py-2 pl-9 pr-3 bg-white border border-[#E7E0D8] text-[#1C1917] focus:outline-none focus:border-[#8C4830]"
                  autoFocus
                />
              </div>

              {/* Category Pills */}
              <div className="flex items-center gap-1.5 text-xs">
                <span className="text-[11px] text-[#1C1917]/60 font-semibold mr-1">Filter:</span>
                {(['All', 'Men', 'Women'] as const).map((gender) => (
                  <button
                    key={gender}
                    onClick={() => setGenderFilter(gender)}
                    className={`px-3 py-1 text-xs font-semibold transition-colors ${
                      genderFilter === gender
                        ? 'bg-[#8C4830] text-white'
                        : 'bg-white text-[#1C1917]/70 hover:text-[#1C1917] border border-[#E7E0D8]'
                    }`}
                  >
                    {gender === 'All' ? 'All Collections' : gender + "'s"}
                  </button>
                ))}
              </div>
            </div>

            {/* Product List */}
            <div className="flex-1 overflow-y-auto p-4 space-y-2 divide-y divide-[#E7E0D8]">
              {selectableProducts.length === 0 ? (
                <div className="py-12 text-center text-xs text-[#1C1917]/60">
                  No fabrics found matching your search. Try another name.
                </div>
              ) : (
                selectableProducts.map((p) => {
                  const isCurrent = 
                    (selectorModalSlot === 'A' && p.id === productA.id) ||
                    (selectorModalSlot === 'B' && p.id === productB.id);

                  return (
                    <div
                      key={p.id}
                      className={`pt-2.5 first:pt-0 flex items-center justify-between gap-3 p-2 transition-colors ${
                        isCurrent ? 'bg-[#8C4830]/5' : 'hover:bg-[#FAF8F5]'
                      }`}
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <img
                          src={p.primaryImage}
                          alt={p.title}
                          className="w-12 h-14 object-cover bg-[#F2EDE7] border border-[#E7E0D8] shrink-0"
                        />
                        <div className="min-w-0">
                          <span className="text-[10px] text-[#8C4830] font-semibold uppercase tracking-wider block">
                            {p.gender} · {p.fabric}
                          </span>
                          <strong className="text-xs font-serif text-[#1C1917] block truncate">
                            {p.title}
                          </strong>
                          <span className="text-[11px] font-mono text-[#1C1917]/80">
                            {formatPKR(p.price)}
                          </span>
                        </div>
                      </div>

                      <button
                        onClick={() => handleSelectProduct(p)}
                        disabled={isCurrent}
                        className={`px-3 py-1.5 text-xs font-semibold shrink-0 transition-colors ${
                          isCurrent
                            ? 'bg-zinc-200 text-zinc-500 cursor-not-allowed'
                            : 'bg-[#8C4830] hover:bg-[#703623] text-white'
                        }`}
                      >
                        {isCurrent ? 'Selected' : 'Select'}
                      </button>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
