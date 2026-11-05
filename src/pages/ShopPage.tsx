import React, { useState, useMemo, useEffect } from 'react';
import { 
  SlidersHorizontal, 
  X, 
  RotateCcw, 
  Search, 
  LayoutGrid, 
  Grid3X3, 
  Grid2X2, 
  Square,
  ChevronDown, 
  ChevronUp, 
  Check, 
  Phone,
  Flame,
  ArrowRight
} from 'lucide-react';
import { useShop, formatPKR } from '../context/ShopContext';
import { useNavigation } from '../context/NavigationContext';
import { 
  Product, 
  WOMEN_EMBROIDERY_BRANDS, 
  WOMEN_PRINTED_BRANDS, 
  MENS_FABRICS 
} from '../types';
import { ProductCard } from '../components/ProductCard';
import { Breadcrumbs, BreadcrumbItem } from '../components/Breadcrumbs';
import { QuickViewModal } from '../components/QuickViewModal';

export const ShopPage: React.FC = () => {
  const { products, recentlyViewed, formatPKR } = useShop();
  const { filterParams, navigateTo, currentPage } = useNavigation();

  // Quick View Modal State
  const [quickViewProduct, setQuickViewProduct] = useState<Product | null>(null);

  // Filter States
  const [searchQuery, setSearchQuery] = useState<string>(filterParams.search || '');
  const [selectedGender, setSelectedGender] = useState<string>(filterParams.gender || 'All');
  const [selectedFabric, setSelectedFabric] = useState<string>(filterParams.fabric || 'All');
  const [selectedBrand, setSelectedBrand] = useState<string>(filterParams.brand || 'All');
  const [selectedCraft, setSelectedCraft] = useState<string>(filterParams.craftType || 'All');
  const [priceRange, setPriceRange] = useState<string>('All');
  const [sortBy, setSortBy] = useState<'featured' | 'price-asc' | 'price-desc' | 'rating' | 'newest'>('featured');
  const [inStockOnly, setInStockOnly] = useState<boolean>(false);
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);
  
  // Limelight Grid View Columns: 1 (single mobile stack), 2, 3, or 4
  const [gridCols, setGridCols] = useState<1 | 2 | 3 | 4>(4);

  // Accordion state for filter groups
  const [openSections, setOpenSections] = useState<{ [key: string]: boolean }>({
    gender: true,
    craft: true,
    brands: true,
    fabric: true,
    price: true,
  });

  const toggleSection = (sec: string) => {
    setOpenSections((prev) => ({ ...prev, [sec]: !prev[sec] }));
  };

  // Sync state when filterParams or route change
  useEffect(() => {
    if (filterParams.gender !== undefined) setSelectedGender(filterParams.gender);
    if (filterParams.fabric !== undefined) setSelectedFabric(filterParams.fabric);
    if (filterParams.brand !== undefined) setSelectedBrand(filterParams.brand);
    if (filterParams.craftType !== undefined) setSelectedCraft(filterParams.craftType);
    if (filterParams.search !== undefined) setSearchQuery(filterParams.search);
  }, [filterParams]);

  // Combined Brands List
  const allBrands = useMemo(() => {
    return Array.from(new Set([...WOMEN_EMBROIDERY_BRANDS, ...WOMEN_PRINTED_BRANDS]));
  }, []);

  // Filter logic
  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      // Search
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchTitle = p.title.toLowerCase().includes(q);
        const matchBrand = (p.brand || '').toLowerCase().includes(q);
        const matchFabric = p.fabric.toLowerCase().includes(q);
        const matchSubtitle = (p.subtitle || '').toLowerCase().includes(q);
        if (!matchTitle && !matchBrand && !matchFabric && !matchSubtitle) return false;
      }

      // Gender
      if (selectedGender !== 'All' && p.gender !== selectedGender) return false;

      // Craft (Embroidery vs Printed)
      if (selectedCraft !== 'All' && p.craftType !== selectedCraft) return false;

      // Fabric
      if (selectedFabric !== 'All' && p.fabric !== selectedFabric) return false;

      // Brand
      if (selectedBrand !== 'All' && p.brand !== selectedBrand) return false;

      // In stock
      if (inStockOnly && !p.inStock) return false;

      // Sale only
      if (filterParams.saleOnly && !(p.originalPrice && p.originalPrice > p.price)) return false;

      // New arrivals only
      if (filterParams.newArrivalsOnly && !p.newArrival) return false;

      // Price brackets
      if (priceRange === 'under-4000' && p.price >= 4000) return false;
      if (priceRange === '4000-7000' && (p.price < 4000 || p.price > 7000)) return false;
      if (priceRange === '7000-12000' && (p.price < 7000 || p.price > 12000)) return false;
      if (priceRange === 'above-12000' && p.price <= 12000) return false;

      return true;
    }).sort((a, b) => {
      if (sortBy === 'price-asc') return a.price - b.price;
      if (sortBy === 'price-desc') return b.price - a.price;
      if (sortBy === 'rating') return (b.rating || 0) - (a.rating || 0);
      if (sortBy === 'newest') return (b.newArrival ? 1 : 0) - (a.newArrival ? 1 : 0);
      return (b.featured ? 1 : 0) - (a.featured ? 1 : 0);
    });
  }, [products, searchQuery, selectedGender, selectedCraft, selectedFabric, selectedBrand, inStockOnly, priceRange, sortBy]);

  // Has active filters
  const hasActiveFilters = 
    selectedGender !== 'All' ||
    selectedCraft !== 'All' ||
    selectedFabric !== 'All' ||
    selectedBrand !== 'All' ||
    priceRange !== 'All' ||
    inStockOnly ||
    searchQuery.trim().length > 0;

  const resetFilters = () => {
    setSelectedGender('All');
    setSelectedCraft('All');
    setSelectedFabric('All');
    setSelectedBrand('All');
    setPriceRange('All');
    setInStockOnly(false);
    setSearchQuery('');
  };

  // Header Title
  const getHeaderTitle = () => {
    if (searchQuery.trim()) return `SEARCH: "${searchQuery}"`;
    if (selectedBrand !== 'All') return `${selectedBrand.toUpperCase()} SUITS`;
    if (selectedCraft === 'Embroidery') return "WOMEN'S EMBROIDERED COLLECTION";
    if (selectedCraft === 'Printed') return "WOMEN'S PRINTED LAWN COLLECTION";
    if (selectedFabric !== 'All') return `${selectedFabric.toUpperCase()} SUITING`;
    if (selectedGender === 'Women') return "WOMEN'S UNSTITCHED COLLECTION";
    if (selectedGender === 'Men') return "MEN'S SIGNATURE SUITING";
    return "ALL UNSTITCHED FABRICS";
  };

  const breadcrumbItems = useMemo<BreadcrumbItem[]>(() => {
    const items: BreadcrumbItem[] = [
      { name: 'Home', path: '/', page: 'home' },
      { name: 'All Suits', path: '/shop', page: 'shop' },
    ];
    if (selectedGender !== 'All') {
      items.push({ name: selectedGender === 'Women' ? "Women" : "Men", path: '/shop', page: 'shop' });
    }
    if (selectedBrand !== 'All') {
      items.push({ name: selectedBrand, path: '/shop', page: 'shop' });
    }
    return items;
  }, [selectedGender, selectedBrand]);

  return (
    <div className="w-full bg-white min-h-screen select-none pb-16">
      {/* 1. Breadcrumbs Strip */}
      <div className="border-b border-neutral-200 bg-[#FAFAFA]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2.5">
          <Breadcrumbs items={breadcrumbItems} />
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-2 min-[360px]:px-3 sm:px-6 lg:px-8 pt-6 sm:pt-8">
        {/* 2. Limelight Catalog Header Bar */}
        <div className="text-center mb-6 sm:mb-8 pb-4 sm:pb-6 border-b border-neutral-200 px-2">
          <h1 className="font-sans font-black text-xl sm:text-3xl md:text-4xl tracking-[0.08em] sm:tracking-[0.16em] uppercase text-black mb-2 break-words">
            {getHeaderTitle()}
          </h1>
          <p className="text-[11px] sm:text-xs text-neutral-500 uppercase tracking-widest font-semibold">
            Showing {filteredProducts.length} of {products.length} Unstitched Items
          </p>
        </div>

        {/* 3. Limelight Control Strip: Filters Toggle, Active Tags, Grid Switcher & Sort Dropdown */}
        <div className="flex items-center justify-between gap-2.5 pb-4 mb-6 border-b border-neutral-200 text-xs">
          {/* Mobile Filter Button & Reset */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setMobileFiltersOpen(true)}
              className="lg:hidden py-2 px-3 sm:py-2.5 sm:px-4 bg-black text-white font-bold tracking-wider sm:tracking-widest uppercase flex items-center gap-1.5 text-[11px] sm:text-xs shrink-0"
            >
              <SlidersHorizontal className="w-3.5 h-3.5" />
              <span>Filters {hasActiveFilters ? '• Active' : ''}</span>
            </button>

            {hasActiveFilters && (
              <button
                onClick={resetFilters}
                className="text-[11px] sm:text-xs font-semibold text-red-600 hover:text-black flex items-center gap-1 uppercase tracking-wider shrink-0"
              >
                <RotateCcw className="w-3 h-3" />
                <span className="hidden sm:inline">Clear All</span>
                <span className="sm:hidden">Reset</span>
              </button>
            )}
          </div>

          {/* Right Controls: Grid Column Switcher (Limelight feature) + Sort By */}
          <div className="flex items-center gap-2 sm:gap-4 shrink-0">
            {/* Grid Columns Switcher: 1 (stacked) or 2 on mobile, 2, 3, 4 on desktop */}
            <div className="flex items-center border border-neutral-200 p-0.5 gap-0.5">
              <button
                type="button"
                onClick={() => setGridCols(1)}
                className={`p-1.5 transition-colors sm:hidden ${
                  gridCols === 1 ? 'bg-black text-white' : 'text-neutral-500 hover:text-black'
                }`}
                title="Single Column Stacked View"
                aria-label="1 Column Stacked View"
              >
                <Square className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={() => setGridCols(2)}
                className={`p-1 sm:p-1.5 transition-colors ${
                  gridCols === 2 ? 'bg-black text-white' : 'text-neutral-500 hover:text-black'
                }`}
                title="2 Columns Grid"
                aria-label="2 Columns Grid"
              >
                <Grid2X2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              </button>
              <button
                type="button"
                onClick={() => setGridCols(3)}
                className={`hidden sm:inline-flex p-1.5 transition-colors ${
                  gridCols === 3 ? 'bg-black text-white' : 'text-neutral-500 hover:text-black'
                }`}
                title="3 Columns Grid"
                aria-label="3 Columns Grid"
              >
                <Grid3X3 className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => setGridCols(4)}
                className={`hidden md:inline-flex p-1.5 transition-colors ${
                  gridCols === 4 ? 'bg-black text-white' : 'text-neutral-500 hover:text-black'
                }`}
                title="4 Columns Grid"
                aria-label="4 Columns Grid"
              >
                <LayoutGrid className="w-4 h-4" />
              </button>
            </div>

            {/* Sort Dropdown */}
            <div className="flex items-center gap-1 sm:gap-2">
              <span className="text-neutral-500 uppercase tracking-wider text-[11px] font-semibold hidden md:inline">Sort:</span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="py-1.5 px-2 sm:py-2 sm:px-3 bg-white border border-neutral-200 text-[11px] sm:text-xs font-bold tracking-wider uppercase text-black focus:outline-none cursor-pointer max-w-[140px] sm:max-w-none"
                aria-label="Sort products"
              >
                <option value="featured">Featured</option>
                <option value="price-asc">Price: Low to High</option>
                <option value="price-desc">Price: High to Low</option>
                <option value="rating">Highest Rated</option>
                <option value="newest">New Arrivals</option>
              </select>
            </div>
          </div>
        </div>

        {/* 4. Main Catalog Content: Left Sidebar + Product Grid */}
        <div className="flex items-start gap-8">
          {/* Desktop Filter Sidebar (Limelight fast-fashion accordion style) */}
          <aside className="hidden lg:block w-64 shrink-0 space-y-6 select-none pr-4">
            {/* Department / Gender */}
            <div className="border-b border-neutral-200 pb-5">
              <button
                onClick={() => toggleSection('gender')}
                className="w-full flex items-center justify-between text-xs font-black tracking-widest uppercase text-black mb-3"
              >
                <span>Department</span>
                {openSections.gender ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
              </button>
              {openSections.gender && (
                <div className="space-y-2 text-xs font-medium text-neutral-700">
                  {['All', 'Women', 'Men'].map((g) => (
                    <label key={g} className="flex items-center gap-2 cursor-pointer hover:text-black">
                      <input
                        type="radio"
                        name="gender"
                        checked={selectedGender === g}
                        onChange={() => setSelectedGender(g)}
                        className="accent-black"
                      />
                      <span>{g === 'All' ? 'All Collections' : g}</span>
                    </label>
                  ))}
                </div>
              )}
            </div>

            {/* Craft Type */}
            <div className="border-b border-neutral-200 pb-5">
              <button
                onClick={() => toggleSection('craft')}
                className="w-full flex items-center justify-between text-xs font-black tracking-widest uppercase text-black mb-3"
              >
                <span>Collection Craft</span>
                {openSections.craft ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
              </button>
              {openSections.craft && (
                <div className="space-y-2 text-xs font-medium text-neutral-700">
                  {[
                    { label: 'All Crafts', val: 'All' },
                    { label: 'Embroidered Collection', val: 'Embroidery' },
                    { label: 'Printed Collection', val: 'Printed' },
                  ].map((c) => (
                    <label key={c.val} className="flex items-center gap-2 cursor-pointer hover:text-black">
                      <input
                        type="radio"
                        name="craft"
                        checked={selectedCraft === c.val}
                        onChange={() => setSelectedCraft(c.val)}
                        className="accent-black"
                      />
                      <span>{c.label}</span>
                    </label>
                  ))}
                </div>
              )}
            </div>

            {/* Fabric */}
            <div className="border-b border-neutral-200 pb-5">
              <button
                onClick={() => toggleSection('fabric')}
                className="w-full flex items-center justify-between text-xs font-black tracking-widest uppercase text-black mb-3"
              >
                <span>Fabric Type</span>
                {openSections.fabric ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
              </button>
              {openSections.fabric && (
                <div className="space-y-2 text-xs font-medium text-neutral-700 max-h-48 overflow-y-auto pr-1">
                  <label className="flex items-center gap-2 cursor-pointer hover:text-black">
                    <input
                      type="radio"
                      name="fabric"
                      checked={selectedFabric === 'All'}
                      onChange={() => setSelectedFabric('All')}
                      className="accent-black"
                    />
                    <span>All Fabrics</span>
                  </label>
                  {[...MENS_FABRICS, 'Luxury Lawn', 'Embroidered Chiffon', 'Silk Jacquard'].map((f) => (
                    <label key={f} className="flex items-center gap-2 cursor-pointer hover:text-black">
                      <input
                        type="radio"
                        name="fabric"
                        checked={selectedFabric === f}
                        onChange={() => setSelectedFabric(f)}
                        className="accent-black"
                      />
                      <span>{f}</span>
                    </label>
                  ))}
                </div>
              )}
            </div>

            {/* Brands */}
            <div className="border-b border-neutral-200 pb-5">
              <button
                onClick={() => toggleSection('brands')}
                className="w-full flex items-center justify-between text-xs font-black tracking-widest uppercase text-black mb-3"
              >
                <span>Brand</span>
                {openSections.brands ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
              </button>
              {openSections.brands && (
                <div className="space-y-2 text-xs font-medium text-neutral-700 max-h-56 overflow-y-auto pr-1">
                  <label className="flex items-center gap-2 cursor-pointer hover:text-black">
                    <input
                      type="radio"
                      name="brand"
                      checked={selectedBrand === 'All'}
                      onChange={() => setSelectedBrand('All')}
                      className="accent-black"
                    />
                    <span>All Brands</span>
                  </label>
                  {allBrands.map((b) => (
                    <label key={b} className="flex items-center gap-2 cursor-pointer hover:text-black">
                      <input
                        type="radio"
                        name="brand"
                        checked={selectedBrand === b}
                        onChange={() => setSelectedBrand(b)}
                        className="accent-black"
                      />
                      <span>{b}</span>
                    </label>
                  ))}
                </div>
              )}
            </div>

            {/* Price Brackets */}
            <div className="border-b border-neutral-200 pb-5">
              <button
                onClick={() => toggleSection('price')}
                className="w-full flex items-center justify-between text-xs font-black tracking-widest uppercase text-black mb-3"
              >
                <span>Price (PKR)</span>
                {openSections.price ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
              </button>
              {openSections.price && (
                <div className="space-y-2 text-xs font-medium text-neutral-700">
                  {[
                    { label: 'All Prices', val: 'All' },
                    { label: 'Under PKR 4,000', val: 'under-4000' },
                    { label: 'PKR 4,000 – PKR 7,000', val: '4000-7000' },
                    { label: 'PKR 7,000 – PKR 12,000', val: '7000-12000' },
                    { label: 'Above PKR 12,000', val: 'above-12000' },
                  ].map((p) => (
                    <label key={p.val} className="flex items-center gap-2 cursor-pointer hover:text-black">
                      <input
                        type="radio"
                        name="price"
                        checked={priceRange === p.val}
                        onChange={() => setPriceRange(p.val)}
                        className="accent-black"
                      />
                      <span>{p.label}</span>
                    </label>
                  ))}
                </div>
              )}
            </div>

            {/* In Stock Toggle */}
            <div className="pt-1">
              <label className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-black cursor-pointer">
                <input
                  type="checkbox"
                  checked={inStockOnly}
                  onChange={(e) => setInStockOnly(e.target.checked)}
                  className="w-4 h-4 accent-black rounded-none"
                />
                <span>In Stock Only</span>
              </label>
            </div>
          </aside>

          {/* Product Grid Area */}
          <main className="flex-1 min-w-0">
            {filteredProducts.length === 0 ? (
              <div className="text-center py-20 border border-neutral-200 bg-neutral-50 p-8">
                <h3 className="font-sans font-black text-xl uppercase tracking-wider text-black mb-2">
                  No Fabrics Found
                </h3>
                <p className="text-xs text-neutral-500 mb-6 max-w-md mx-auto">
                  We could not find unstitched suits matching your active filters. Try broadening your criteria or reset all filters.
                </p>
                <button
                  onClick={resetFilters}
                  className="py-3 px-8 bg-black text-white text-xs font-bold tracking-widest uppercase hover:bg-neutral-800 transition-colors"
                >
                  Reset All Filters
                </button>
              </div>
            ) : (
              <div
                className={`grid gap-2.5 sm:gap-4 lg:gap-6 ${
                  gridCols === 1
                    ? 'grid-cols-1 max-w-md mx-auto'
                    : gridCols === 2
                    ? 'grid-cols-1 min-[340px]:grid-cols-2'
                    : gridCols === 3
                    ? 'grid-cols-1 min-[340px]:grid-cols-2 md:grid-cols-3'
                    : 'grid-cols-1 min-[340px]:grid-cols-2 md:grid-cols-3 xl:grid-cols-4'
                }`}
              >
                {filteredProducts.map((product) => (
                  <ProductCard
                    key={product.id}
                    product={product}
                    onQuickView={(p) => setQuickViewProduct(p)}
                  />
                ))}
              </div>
            )}
          </main>
        </div>

        {/* Recently Viewed Fabrics (Persisted across sessions via IndexedDB) */}
        {recentlyViewed && recentlyViewed.length > 0 && (
          <section className="mt-14 pt-10 border-t border-neutral-200">
            <div className="flex items-center justify-between mb-6">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-widest text-[#0284C7] block">
                  Personalized For You · Preserved in IndexedDB
                </span>
                <h3 className="font-serif text-xl sm:text-2xl font-bold text-neutral-900 mt-0.5">
                  Recently Viewed Atelier Fabrics
                </h3>
              </div>
              <span className="text-xs text-neutral-500 font-mono">
                {recentlyViewed.length} items viewed
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 sm:gap-4">
              {recentlyViewed.slice(0, 6).map((item) => (
                <div key={item.id} className="group relative bg-white border border-neutral-200 p-2 text-left flex flex-col justify-between">
                  <div>
                    <div className="aspect-3/4 overflow-hidden bg-neutral-100 relative mb-2">
                      <img
                        src={item.primaryImage}
                        alt={item.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    </div>
                    <div className="space-y-0.5 text-xs">
                      <div className="text-[10px] text-neutral-500 font-bold uppercase truncate">{item.brand || item.fabric}</div>
                      <div className="font-semibold text-neutral-900 truncate">{item.title}</div>
                      <div className="font-bold text-neutral-900 text-xs">{formatPKR(item.price)}</div>
                    </div>
                  </div>
                  <button
                    onClick={() => setQuickViewProduct(item)}
                    className="mt-3 w-full py-1.5 bg-neutral-100 hover:bg-black hover:text-white text-neutral-800 text-[10px] font-bold uppercase tracking-wider transition-colors"
                  >
                    Quick View
                  </button>
                </div>
              ))}
            </div>
          </section>
        )}
      </div>

      {/* 5. Mobile Filter Drawer (Limelight Fast-Fashion Slide-Over) */}
      {mobileFiltersOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-xs"
            onClick={() => setMobileFiltersOpen(false)}
          />
          <div className="fixed inset-y-0 right-0 w-full max-w-xs bg-white shadow-2xl flex flex-col z-50 p-6 overflow-y-auto">
            <div className="flex items-center justify-between pb-4 border-b border-neutral-200 mb-6">
              <span className="font-sans font-black text-sm uppercase tracking-widest text-black">
                FILTERS & REFINEMENTS
              </span>
              <button
                onClick={() => setMobileFiltersOpen(false)}
                className="p-1 text-neutral-500 hover:text-black"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Department */}
            <div className="mb-6">
              <h4 className="text-xs font-black uppercase tracking-wider text-black mb-3">
                Department
              </h4>
              <div className="space-y-2 text-xs">
                {['All', 'Women', 'Men'].map((g) => (
                  <label key={g} className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="m-gender"
                      checked={selectedGender === g}
                      onChange={() => setSelectedGender(g)}
                      className="accent-black"
                    />
                    <span>{g === 'All' ? 'All Collections' : g}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Craft */}
            <div className="mb-6">
              <h4 className="text-xs font-black uppercase tracking-wider text-black mb-3">
                Craft Type
              </h4>
              <div className="space-y-2 text-xs">
                {[
                  { label: 'All Crafts', val: 'All' },
                  { label: 'Embroidered Collection', val: 'Embroidery' },
                  { label: 'Printed Collection', val: 'Printed' },
                ].map((c) => (
                  <label key={c.val} className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="m-craft"
                      checked={selectedCraft === c.val}
                      onChange={() => setSelectedCraft(c.val)}
                      className="accent-black"
                    />
                    <span>{c.label}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Fabric */}
            <div className="mb-6">
              <h4 className="text-xs font-black uppercase tracking-wider text-black mb-3">
                Fabric Type
              </h4>
              <div className="space-y-2 text-xs max-h-40 overflow-y-auto">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="m-fabric"
                    checked={selectedFabric === 'All'}
                    onChange={() => setSelectedFabric('All')}
                    className="accent-black"
                  />
                  <span>All Fabrics</span>
                </label>
                {[...MENS_FABRICS, 'Luxury Lawn', 'Embroidered Chiffon', 'Silk Jacquard'].map((f) => (
                  <label key={f} className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="m-fabric"
                      checked={selectedFabric === f}
                      onChange={() => setSelectedFabric(f)}
                      className="accent-black"
                    />
                    <span>{f}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Bottom Actions */}
            <div className="pt-6 border-t border-neutral-200 mt-auto space-y-3">
              <button
                onClick={() => setMobileFiltersOpen(false)}
                className="w-full py-3 bg-black text-white text-xs font-bold tracking-widest uppercase"
              >
                Apply Filters ({filteredProducts.length} Items)
              </button>
              {hasActiveFilters && (
                <button
                  onClick={resetFilters}
                  className="w-full py-2 bg-neutral-100 text-neutral-800 text-xs font-semibold tracking-wider uppercase hover:bg-neutral-200"
                >
                  Reset All Filters
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* 6. Limelight Quick View Modal */}
      <QuickViewModal
        product={quickViewProduct}
        isOpen={!!quickViewProduct}
        onClose={() => setQuickViewProduct(null)}
      />
    </div>
  );
};
