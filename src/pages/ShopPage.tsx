import React, { useState, useMemo, useEffect } from 'react';
import {
  SlidersHorizontal,
  X,
  RotateCcw,
  LayoutGrid,
  Grid3X3,
  Grid2X2,
  Square,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { useShop, formatPKR } from '../context/ShopContext';
import { useNavigation } from '../context/NavigationContext';
import {
  Product,
  WOMEN_EMBROIDERY_BRANDS,
  WOMEN_PRINTED_BRANDS,
  MENS_FABRICS,
} from '../types';
import { ProductCard } from '../components/ProductCard';
import { Breadcrumbs, BreadcrumbItem } from '../components/Breadcrumbs';
import { QuickViewModal } from '../components/QuickViewModal';

export const ShopPage: React.FC = () => {
  const { products, wishlist, recentlyViewed } = useShop();
  const { filterParams, navigateTo } = useNavigation();

  const [quickViewProduct, setQuickViewProduct] = useState<Product | null>(null);

  const [searchQuery, setSearchQuery] = useState<string>(filterParams.search || '');
  const [selectedGender, setSelectedGender] = useState<string>(filterParams.gender || 'All');
  const [selectedFabric, setSelectedFabric] = useState<string>(filterParams.fabric || 'All');
  const [selectedBrand, setSelectedBrand] = useState<string>(filterParams.brand || 'All');
  const [selectedCraft, setSelectedCraft] = useState<string>(filterParams.craftType || 'All');
  const [priceRange, setPriceRange] = useState<string>('All');
  const [sortBy, setSortBy] = useState<'featured' | 'price-asc' | 'price-desc' | 'rating' | 'newest'>('featured');
  const [inStockOnly, setInStockOnly] = useState<boolean>(false);
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);
  const [gridCols, setGridCols] = useState<1 | 2 | 3 | 4>(4);

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

  // Sync local filter states cleanly when route/nav params update
  useEffect(() => {
    setSelectedGender(filterParams.gender || 'All');
    setSelectedFabric(filterParams.fabric || 'All');
    setSelectedBrand(filterParams.brand || 'All');
    setSelectedCraft(filterParams.craftType || 'All');
    setSearchQuery(filterParams.search || '');
  }, [filterParams]);

  const allBrands = useMemo(() => {
    return Array.from(new Set([...WOMEN_EMBROIDERY_BRANDS, ...WOMEN_PRINTED_BRANDS]));
  }, []);

  const filteredProducts = useMemo(() => {
    return products
      .filter((p) => {
        if (filterParams.favoritesOnly && !wishlist.includes(p.id)) return false;

        if (filterParams.collection) {
          if (filterParams.collection === 'Stitched') {
            const isCouture =
              p.collection === 'Stitched' ||
              p.collection === 'Bridal & Formal Soiree' ||
              p.collection === 'Wedding & Festive Formals' ||
              p.craftType === 'Embroidery';
            if (!isCouture) return false;
          } else if (p.collection !== filterParams.collection) {
            return false;
          }
        }

        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase();
          const matchTitle = p.title.toLowerCase().includes(q);
          const matchBrand = (p.brand || '').toLowerCase().includes(q);
          const matchFabric = p.fabric.toLowerCase().includes(q);
          const matchSubtitle = (p.subtitle || '').toLowerCase().includes(q);
          if (!matchTitle && !matchBrand && !matchFabric && !matchSubtitle) return false;
        }

        if (selectedGender !== 'All' && p.gender !== selectedGender) return false;
        if (selectedCraft !== 'All' && p.craftType !== selectedCraft) return false;
        if (selectedFabric !== 'All' && p.fabric !== selectedFabric) return false;
        if (selectedBrand !== 'All' && p.brand !== selectedBrand) return false;
        if (inStockOnly && !p.inStock) return false;

        if (filterParams.saleOnly && !(p.originalPrice && p.originalPrice > p.price)) return false;
        if (filterParams.newArrivalsOnly && !p.newArrival) return false;

        if (priceRange === 'under-4000' && p.price >= 4000) return false;
        if (priceRange === '4000-7000' && (p.price < 4000 || p.price > 7000)) return false;
        if (priceRange === '7000-12000' && (p.price < 7000 || p.price > 12000)) return false;
        if (priceRange === 'above-12000' && p.price <= 12000) return false;

        return true;
      })
      .sort((a, b) => {
        if (sortBy === 'price-asc') return a.price - b.price;
        if (sortBy === 'price-desc') return b.price - a.price;
        if (sortBy === 'rating') return (b.rating || 0) - (a.rating || 0);
        if (sortBy === 'newest') return (b.newArrival ? 1 : 0) - (a.newArrival ? 1 : 0);
        return (b.featured ? 1 : 0) - (a.featured ? 1 : 0);
      });
  }, [
    products,
    wishlist,
    filterParams,
    searchQuery,
    selectedGender,
    selectedCraft,
    selectedFabric,
    selectedBrand,
    inStockOnly,
    priceRange,
    sortBy,
  ]);

  const hasActiveFilters =
    selectedGender !== 'All' ||
    selectedCraft !== 'All' ||
    selectedFabric !== 'All' ||
    selectedBrand !== 'All' ||
    priceRange !== 'All' ||
    inStockOnly ||
    Boolean(filterParams.collection) ||
    Boolean(filterParams.favoritesOnly) ||
    Boolean(filterParams.saleOnly) ||
    Boolean(filterParams.newArrivalsOnly) ||
    searchQuery.trim().length > 0;

  const resetFilters = () => {
    setSelectedGender('All');
    setSelectedCraft('All');
    setSelectedFabric('All');
    setSelectedBrand('All');
    setPriceRange('All');
    setInStockOnly(false);
    setSearchQuery('');
    if (
      filterParams.collection ||
      filterParams.favoritesOnly ||
      filterParams.saleOnly ||
      filterParams.newArrivalsOnly
    ) {
      navigateTo('shop');
    }
  };

  const getHeaderTitle = () => {
    if (filterParams.favoritesOnly) return 'SAVED FABRICS WISHLIST';
    if (filterParams.collection === 'The Shahi Collection') return 'THE SHAHI COLLECTION';
    if (filterParams.newArrivalsOnly) return 'NEW ARRIVALS';
    if (filterParams.saleOnly) return 'SEASONAL ARCHIVE SALE';
    if (searchQuery.trim()) return `SEARCH: "${searchQuery}"`;
    if (selectedBrand !== 'All') return `${selectedBrand.toUpperCase()} COLLECTION`;
    if (selectedCraft === 'Embroidery') return "WOMENS EMBROIDERED COLLECTION";
    if (selectedCraft === 'Printed') return "WOMENS PRINTED LAWN COLLECTION";
    if (selectedFabric !== 'All') return `${selectedFabric.toUpperCase()} SUITING`;
    if (selectedGender === 'Women') return 'WOMENS COLLECTION';
    if (selectedGender === 'Men') return 'MENS COLLECTION';
    return 'ALL COLLECTIONS';
  };

  const breadcrumbItems = useMemo<BreadcrumbItem[]>(() => {
    const items: BreadcrumbItem[] = [
      { name: 'Home', path: '/', page: 'home' },
      { name: 'Catalog', path: '/shop', page: 'shop' },
    ];
    if (filterParams.collection) {
      items.push({ name: filterParams.collection, path: '/shop', page: 'shop' });
    } else if (selectedGender !== 'All') {
      items.push({ name: selectedGender, path: '/shop', page: 'shop' });
    }
    if (selectedBrand !== 'All') {
      items.push({ name: selectedBrand, path: '/shop', page: 'shop' });
    }
    return items;
  }, [filterParams.collection, selectedGender, selectedBrand]);

  return (
    <div className="w-full bg-[#060608] text-[#F7F4EE] min-h-screen select-none pb-16">
      {/* 1. Breadcrumbs Strip */}
      <div className="border-b border-[#C5A059]/20 bg-[#0A0A0E]">
        <Breadcrumbs items={breadcrumbItems} />
      </div>

      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 pt-6 sm:pt-9">
        {/* 2. Royal Noir Catalog Header */}
        <div className="text-center mb-6 sm:mb-8 pb-5 sm:pb-6 border-b border-[#C5A059]/20 px-2">
          <h1 className="font-serif text-2xl sm:text-3xl md:text-4xl tracking-[0.12em] sm:tracking-[0.18em] uppercase text-[#D4AF37] mb-2 break-words">
            {getHeaderTitle()}
          </h1>
          <p className="text-[11px] sm:text-xs text-[#E8D5A7]/65 uppercase tracking-[0.2em] font-medium">
            Showing {filteredProducts.length} of {products.length} Curated Articles
          </p>
        </div>

        {/* 3. Control Strip: Filters Toggle, Active Reset, Grid Switcher & Sort */}
        <div className="flex items-center justify-between gap-2.5 pb-4 mb-6 border-b border-white/10 text-xs">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setMobileFiltersOpen(true)}
              className="lg:hidden py-2 px-3 sm:py-2.5 sm:px-4 border border-[#D4AF37] bg-[#111115] text-[#D4AF37] font-semibold tracking-wider uppercase flex items-center gap-1.5 text-[11px] sm:text-xs shrink-0"
            >
              <SlidersHorizontal className="w-3.5 h-3.5" />
              <span>Filters {hasActiveFilters ? '· Active' : ''}</span>
            </button>

            {hasActiveFilters && (
              <button
                type="button"
                onClick={resetFilters}
                className="text-[11px] sm:text-xs font-semibold text-[#D4AF37] hover:text-[#F7F4EE] flex items-center gap-1.5 uppercase tracking-wider shrink-0"
              >
                <RotateCcw className="w-3 h-3" />
                <span className="hidden sm:inline">Clear Filters</span>
                <span className="sm:hidden">Reset</span>
              </button>
            )}
          </div>

          <div className="flex items-center gap-2 sm:gap-4 shrink-0">
            <div className="flex items-center border border-[#C5A059]/30 bg-[#0E0E12] p-0.5 gap-0.5">
              <button
                type="button"
                onClick={() => setGridCols(1)}
                className={`p-1.5 transition-colors sm:hidden ${
                  gridCols === 1 ? 'bg-[#D4AF37] text-[#060608]' : 'text-[#E8D5A7]/60 hover:text-[#F7F4EE]'
                }`}
                title="Single Column View"
                aria-label="1 Column Stacked View"
              >
                <Square className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={() => setGridCols(2)}
                className={`p-1 sm:p-1.5 transition-colors ${
                  gridCols === 2 ? 'bg-[#D4AF37] text-[#060608]' : 'text-[#E8D5A7]/60 hover:text-[#F7F4EE]'
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
                  gridCols === 3 ? 'bg-[#D4AF37] text-[#060608]' : 'text-[#E8D5A7]/60 hover:text-[#F7F4EE]'
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
                  gridCols === 4 ? 'bg-[#D4AF37] text-[#060608]' : 'text-[#E8D5A7]/60 hover:text-[#F7F4EE]'
                }`}
                title="4 Columns Grid"
                aria-label="4 Columns Grid"
              >
                <LayoutGrid className="w-4 h-4" />
              </button>
            </div>

            <div className="flex items-center gap-1 sm:gap-2">
              <span className="text-[#E8D5A7]/60 uppercase tracking-wider text-[11px] font-medium hidden md:inline">
                Sort:
              </span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="py-1.5 px-2.5 sm:py-2 sm:px-3 bg-[#111115] border border-[#C5A059]/35 text-[11px] sm:text-xs font-medium tracking-wider uppercase text-[#F7F4EE] focus:outline-none focus:border-[#D4AF37] cursor-pointer max-w-[150px] sm:max-w-none"
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

        {/* 4. Sidebar + Product Grid */}
        <div className="flex items-start gap-8">
          <aside className="hidden lg:block w-64 shrink-0 space-y-6 select-none pr-4">
            {/* Department */}
            <div className="border-b border-white/10 pb-5">
              <button
                type="button"
                onClick={() => toggleSection('gender')}
                className="w-full flex items-center justify-between text-xs font-semibold tracking-widest uppercase text-[#D4AF37] mb-3"
              >
                <span>Department</span>
                {openSections.gender ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
              </button>
              {openSections.gender && (
                <div className="space-y-2 text-xs text-[#F7F4EE]/75">
                  {['All', 'Women', 'Men'].map((g) => (
                    <label key={g} className="flex items-center gap-2.5 cursor-pointer hover:text-[#F7F4EE]">
                      <input
                        type="radio"
                        name="gender"
                        checked={selectedGender === g}
                        onChange={() => setSelectedGender(g)}
                        className="accent-[#D4AF37]"
                      />
                      <span>{g === 'All' ? 'All Collections' : g}</span>
                    </label>
                  ))}
                </div>
              )}
            </div>

            {/* Craft Type */}
            <div className="border-b border-white/10 pb-5">
              <button
                type="button"
                onClick={() => toggleSection('craft')}
                className="w-full flex items-center justify-between text-xs font-semibold tracking-widest uppercase text-[#D4AF37] mb-3"
              >
                <span>Collection Craft</span>
                {openSections.craft ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
              </button>
              {openSections.craft && (
                <div className="space-y-2 text-xs text-[#F7F4EE]/75">
                  {[
                    { label: 'All Crafts', val: 'All' },
                    { label: 'Embroidered Collection', val: 'Embroidery' },
                    { label: 'Printed Collection', val: 'Printed' },
                  ].map((c) => (
                    <label key={c.val} className="flex items-center gap-2.5 cursor-pointer hover:text-[#F7F4EE]">
                      <input
                        type="radio"
                        name="craft"
                        checked={selectedCraft === c.val}
                        onChange={() => setSelectedCraft(c.val)}
                        className="accent-[#D4AF37]"
                      />
                      <span>{c.label}</span>
                    </label>
                  ))}
                </div>
              )}
            </div>

            {/* Fabric Type */}
            <div className="border-b border-white/10 pb-5">
              <button
                type="button"
                onClick={() => toggleSection('fabric')}
                className="w-full flex items-center justify-between text-xs font-semibold tracking-widest uppercase text-[#D4AF37] mb-3"
              >
                <span>Fabric Type</span>
                {openSections.fabric ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
              </button>
              {openSections.fabric && (
                <div className="space-y-2 text-xs text-[#F7F4EE]/75 max-h-48 overflow-y-auto pr-1">
                  <label className="flex items-center gap-2.5 cursor-pointer hover:text-[#F7F4EE]">
                    <input
                      type="radio"
                      name="fabric"
                      checked={selectedFabric === 'All'}
                      onChange={() => setSelectedFabric('All')}
                      className="accent-[#D4AF37]"
                    />
                    <span>All Fabrics</span>
                  </label>
                  {[...MENS_FABRICS, 'Luxury Lawn', 'Embroidered Chiffon', 'Silk Jacquard'].map((f) => (
                    <label key={f} className="flex items-center gap-2.5 cursor-pointer hover:text-[#F7F4EE]">
                      <input
                        type="radio"
                        name="fabric"
                        checked={selectedFabric === f}
                        onChange={() => setSelectedFabric(f)}
                        className="accent-[#D4AF37]"
                      />
                      <span>{f}</span>
                    </label>
                  ))}
                </div>
              )}
            </div>

            {/* Brands */}
            <div className="border-b border-white/10 pb-5">
              <button
                type="button"
                onClick={() => toggleSection('brands')}
                className="w-full flex items-center justify-between text-xs font-semibold tracking-widest uppercase text-[#D4AF37] mb-3"
              >
                <span>Brand</span>
                {openSections.brands ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
              </button>
              {openSections.brands && (
                <div className="space-y-2 text-xs text-[#F7F4EE]/75 max-h-56 overflow-y-auto pr-1">
                  <label className="flex items-center gap-2.5 cursor-pointer hover:text-[#F7F4EE]">
                    <input
                      type="radio"
                      name="brand"
                      checked={selectedBrand === 'All'}
                      onChange={() => setSelectedBrand('All')}
                      className="accent-[#D4AF37]"
                    />
                    <span>All Brands</span>
                  </label>
                  {allBrands.map((b) => (
                    <label key={b} className="flex items-center gap-2.5 cursor-pointer hover:text-[#F7F4EE]">
                      <input
                        type="radio"
                        name="brand"
                        checked={selectedBrand === b}
                        onChange={() => setSelectedBrand(b)}
                        className="accent-[#D4AF37]"
                      />
                      <span>{b}</span>
                    </label>
                  ))}
                </div>
              )}
            </div>

            {/* Price Brackets */}
            <div className="border-b border-white/10 pb-5">
              <button
                type="button"
                onClick={() => toggleSection('price')}
                className="w-full flex items-center justify-between text-xs font-semibold tracking-widest uppercase text-[#D4AF37] mb-3"
              >
                <span>Price (PKR)</span>
                {openSections.price ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
              </button>
              {openSections.price && (
                <div className="space-y-2 text-xs text-[#F7F4EE]/75">
                  {[
                    { label: 'All Prices', val: 'All' },
                    { label: 'Under PKR 4,000', val: 'under-4000' },
                    { label: 'PKR 4,000 – PKR 7,000', val: '4000-7000' },
                    { label: 'PKR 7,000 – PKR 12,000', val: '7000-12000' },
                    { label: 'Above PKR 12,000', val: 'above-12000' },
                  ].map((p) => (
                    <label key={p.val} className="flex items-center gap-2.5 cursor-pointer hover:text-[#F7F4EE]">
                      <input
                        type="radio"
                        name="price"
                        checked={priceRange === p.val}
                        onChange={() => setPriceRange(p.val)}
                        className="accent-[#D4AF37]"
                      />
                      <span>{p.label}</span>
                    </label>
                  ))}
                </div>
              )}
            </div>

            {/* In Stock */}
            <div className="pt-1">
              <label className="flex items-center gap-2.5 text-xs font-semibold uppercase tracking-wider text-[#E8D5A7] cursor-pointer">
                <input
                  type="checkbox"
                  checked={inStockOnly}
                  onChange={(e) => setInStockOnly(e.target.checked)}
                  className="w-4 h-4 accent-[#D4AF37]"
                />
                <span>In Stock Only</span>
              </label>
            </div>
          </aside>

          {/* Product Grid */}
          <main className="flex-1 min-w-0">
            {filteredProducts.length === 0 ? (
              <div className="text-center py-20 border border-[#C5A059]/25 bg-[#0E0E12] p-8">
                <h3 className="font-serif text-xl uppercase tracking-wider text-[#D4AF37] mb-2">
                  No Fabrics Found
                </h3>
                <p className="text-xs text-[#F7F4EE]/65 mb-6 max-w-md mx-auto">
                  No unstitched articles matched your current filters. Reset filters to view the full Paris Bazaar catalog.
                </p>
                <button
                  type="button"
                  onClick={resetFilters}
                  className="py-3 px-8 bg-[#D4AF37] text-[#060608] text-xs font-semibold tracking-widest uppercase hover:bg-[#E5C158] transition-colors"
                >
                  Reset All Filters
                </button>
              </div>
            ) : (
              <div
                className={`grid gap-4 sm:gap-5 lg:gap-6 ${
                  gridCols === 1
                    ? 'grid-cols-1 max-w-md mx-auto'
                    : gridCols === 2
                    ? 'grid-cols-1 min-[340px]:grid-cols-2'
                    : gridCols === 3
                    ? 'grid-cols-1 min-[340px]:grid-cols-2 md:grid-cols-3'
                    : 'grid-cols-2 md:grid-cols-3 xl:grid-cols-4'
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

        {/* Recently Viewed */}
        {recentlyViewed && recentlyViewed.length > 0 && (
          <section className="mt-14 pt-10 border-t border-white/10">
            <div className="flex items-center justify-between mb-6">
              <div>
                <span className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[#D4AF37] block">
                  Personalized Selection
                </span>
                <h3 className="font-serif text-xl sm:text-2xl text-[#F7F4EE] mt-0.5">
                  Recently Viewed Atelier Fabrics
                </h3>
              </div>
              <span className="text-xs text-[#F7F4EE]/55 font-mono tabular-nums">
                {recentlyViewed.length} items viewed
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 sm:gap-4">
              {recentlyViewed.slice(0, 6).map((item) => (
                <div
                  key={item.id}
                  className="group relative bg-[#111115] border border-[#C5A059]/20 p-2.5 text-left flex flex-col justify-between"
                >
                  <div>
                    <div className="aspect-[3/4] overflow-hidden bg-[#18181D] relative mb-2.5">
                      <img
                        src={item.primaryImage}
                        alt={item.title}
                        referrerPolicy="no-referrer"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = '/images/shahi_hero_banner.jpg';
                        }}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    </div>
                    <div className="space-y-0.5 text-xs">
                      <div className="text-[10px] text-[#C5A059] font-medium uppercase truncate">
                        {item.brand || item.fabric}
                      </div>
                      <div className="font-medium text-[#F7F4EE] truncate">{item.title}</div>
                      <div className="font-medium text-[#D4AF37] text-xs tabular-nums">
                        {formatPKR(item.price)}
                      </div>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setQuickViewProduct(item)}
                    className="mt-3 w-full py-1.5 border border-[#C5A059]/40 hover:bg-[#D4AF37] hover:text-[#060608] text-[#E8D5A7] text-[10px] font-medium uppercase tracking-wider transition-colors"
                  >
                    Quick View
                  </button>
                </div>
              ))}
            </div>
          </section>
        )}
      </div>

      {/* Mobile Filter Drawer */}
      {mobileFiltersOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div
            className="fixed inset-0 bg-black/75 backdrop-blur-xs"
            onClick={() => setMobileFiltersOpen(false)}
          />
          <div className="fixed inset-y-0 right-0 w-full max-w-xs bg-[#0B0B0E] border-l border-[#C5A059]/30 text-[#F7F4EE] shadow-2xl flex flex-col z-50 p-6 overflow-y-auto">
            <div className="flex items-center justify-between pb-4 border-b border-white/10 mb-6">
              <span className="font-serif text-sm uppercase tracking-widest text-[#D4AF37]">
                Filters &amp; Refinements
              </span>
              <button
                type="button"
                onClick={() => setMobileFiltersOpen(false)}
                className="p-1 text-[#E8D5A7] hover:text-white"
                aria-label="Close filters"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Department */}
            <div className="mb-6">
              <h4 className="text-xs font-semibold uppercase tracking-wider text-[#D4AF37] mb-3">
                Department
              </h4>
              <div className="space-y-2 text-xs text-[#F7F4EE]/80">
                {['All', 'Women', 'Men'].map((g) => (
                  <label key={g} className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="m-gender"
                      checked={selectedGender === g}
                      onChange={() => setSelectedGender(g)}
                      className="accent-[#D4AF37]"
                    />
                    <span>{g === 'All' ? 'All Collections' : g}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Craft */}
            <div className="mb-6">
              <h4 className="text-xs font-semibold uppercase tracking-wider text-[#D4AF37] mb-3">
                Craft Type
              </h4>
              <div className="space-y-2 text-xs text-[#F7F4EE]/80">
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
                      className="accent-[#D4AF37]"
                    />
                    <span>{c.label}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Fabric */}
            <div className="mb-6">
              <h4 className="text-xs font-semibold uppercase tracking-wider text-[#D4AF37] mb-3">
                Fabric Type
              </h4>
              <div className="space-y-2 text-xs text-[#F7F4EE]/80 max-h-40 overflow-y-auto">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="m-fabric"
                    checked={selectedFabric === 'All'}
                    onChange={() => setSelectedFabric('All')}
                    className="accent-[#D4AF37]"
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
                      className="accent-[#D4AF37]"
                    />
                    <span>{f}</span>
                  </label>
                ))}
              </div>
            </div>

            <div className="pt-6 border-t border-white/10 mt-auto space-y-3">
              <button
                type="button"
                onClick={() => setMobileFiltersOpen(false)}
                className="w-full py-3 bg-[#D4AF37] text-[#060608] text-xs font-bold tracking-widest uppercase"
              >
                Apply Filters ({filteredProducts.length} Items)
              </button>
              {hasActiveFilters && (
                <button
                  type="button"
                  onClick={resetFilters}
                  className="w-full py-2 border border-white/15 text-[#E8D5A7] text-xs font-medium tracking-wider uppercase hover:border-[#D4AF37]"
                >
                  Reset All Filters
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      <QuickViewModal
        product={quickViewProduct}
        isOpen={!!quickViewProduct}
        onClose={() => setQuickViewProduct(null)}
      />
    </div>
  );
};
