import React, { useState, useMemo, useEffect } from 'react';
import { 
  Filter, 
  SlidersHorizontal, 
  X, 
  RotateCcw, 
  Search, 
  ShoppingBag, 
  ArrowUpRight, 
  Layers, 
  Activity, 
  Sparkles,
  ChevronDown,
  ChevronUp,
  Tag
} from 'lucide-react';
import { useShop, formatPKR } from '../context/ShopContext';
import { useNavigation } from '../context/NavigationContext';
import { 
  Product, 
  FabricType, 
  FabricWeightCategory, 
  ThreadCountCategory, 
  WeaveTypeCategory,
  WOMEN_EMBROIDERY_BRANDS,
  WOMEN_PRINTED_BRANDS 
} from '../types';
import { ProductCard } from '../components/ProductCard';
import { Breadcrumbs, BreadcrumbItem } from '../components/Breadcrumbs';

export const ShopPage: React.FC = () => {
  const { products, addToCart } = useShop();
  const { filterParams, navigateTo, currentPage } = useNavigation();

  // Resolve initial state based on route or filterParams
  const getInitialGender = () => {
    if (currentPage === 'men-summer' || currentPage === 'men-winter') return 'Men';
    if (currentPage === 'women-summer' || currentPage === 'women-winter') return 'Women';
    return filterParams.gender || 'All';
  };

  const getInitialSeason = () => {
    if (currentPage === 'men-summer' || currentPage === 'women-summer') return 'Summer';
    if (currentPage === 'men-winter' || currentPage === 'women-winter') return 'Winter';
    return filterParams.season || 'All';
  };

  // Filter States
  const [searchQuery, setSearchQuery] = useState<string>(filterParams.search || '');
  const [selectedGender, setSelectedGender] = useState<string>(getInitialGender);
  const [selectedFabric, setSelectedFabric] = useState<string>(filterParams.fabric || 'All');
  const [selectedSeason, setSelectedSeason] = useState<string>(getInitialSeason);
  const [selectedBrand, setSelectedBrand] = useState<string>(filterParams.brand || 'All');
  const [selectedCraft, setSelectedCraft] = useState<string>(filterParams.craftType || 'All');
  const [selectedFabricWeight, setSelectedFabricWeight] = useState<string>(filterParams.fabricWeight || 'All');
  const [selectedThreadCount, setSelectedThreadCount] = useState<string>(filterParams.threadCount || 'All');
  const [selectedWeaveType, setSelectedWeaveType] = useState<string>(filterParams.weaveType || 'All');
  const [maxPrice, setMaxPrice] = useState<number>(30000);
  const [sortBy, setSortBy] = useState<'featured' | 'price-asc' | 'price-desc' | 'rating' | 'weight'>('featured');
  const [inStockOnly, setInStockOnly] = useState<boolean>(false);
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);

  // Accordion toggle states for sidebar sections
  const [openSections, setOpenSections] = useState<{ [key: string]: boolean }>({
    brand: true,
    craft: true,
    gender: true,
    season: true,
    fabric: true,
    weight: false,
    threadCount: false,
    weave: false,
    price: true,
  });

  const toggleSection = (section: string) => {
    setOpenSections((prev) => ({ ...prev, [section]: !prev[section] }));
  };

  // Sync state when route or navigation filter parameters change
  useEffect(() => {
    if (currentPage === 'men-summer') {
      setSelectedGender('Men');
      setSelectedSeason('Summer');
    } else if (currentPage === 'men-winter') {
      setSelectedGender('Men');
      setSelectedSeason('Winter');
    } else if (currentPage === 'women-summer') {
      setSelectedGender('Women');
      setSelectedSeason('Summer');
    } else if (currentPage === 'women-winter') {
      setSelectedGender('Women');
      setSelectedSeason('Winter');
    } else {
      if (filterParams.gender !== undefined) setSelectedGender(filterParams.gender);
      if (filterParams.season !== undefined) setSelectedSeason(filterParams.season);
      if (filterParams.fabric !== undefined) setSelectedFabric(filterParams.fabric);
      if (filterParams.brand !== undefined) setSelectedBrand(filterParams.brand);
      if (filterParams.craftType !== undefined) setSelectedCraft(filterParams.craftType);
      if (filterParams.fabricWeight !== undefined) setSelectedFabricWeight(filterParams.fabricWeight);
      if (filterParams.threadCount !== undefined) setSelectedThreadCount(filterParams.threadCount);
      if (filterParams.weaveType !== undefined) setSelectedWeaveType(filterParams.weaveType);
      if (filterParams.search !== undefined) setSearchQuery(filterParams.search);
    }
  }, [currentPage, filterParams]);

  // Quick View Product state
  const [quickViewProduct, setQuickViewProduct] = useState<Product | null>(null);

  const fabricOptions: FabricType[] = [
    'Boski Silk',
    'Latha Cotton',
    'Luxury Lawn',
    'Embroidered Chiffon',
    'Handwoven Karandi',
    'Swiss Voile',
    'Silk Jacquard',
    'Pure Khaddar',
  ];

  const fabricWeightOptions: FabricWeightCategory[] = [
    'Ultra-Lightweight',
    'Lightweight',
    'Medium Weight',
    'Heavy Weight',
  ];

  const threadCountOptions: ThreadCountCategory[] = [
    'Coarse / Traditional (30s-40s)',
    'High Count (60s-80s)',
    'Superfine (100s-120s)',
    'Royal Grade (140s+)',
  ];

  const weaveTypeOptions: WeaveTypeCategory[] = [
    'Plain Weave',
    'Sateen / Boski Weave',
    'Cambric / Lawn Weave',
    'Chiffon / Crepe Weave',
    'Jacquard Weave',
    'Handloom Textured Weave',
    'Twill Weave',
  ];

  // Real-time instant filtering engine
  const filteredProducts = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();

    return products
      .filter((p) => {
        // Real-time search query matching
        if (q) {
          const matchTitle = p.title.toLowerCase().includes(q);
          const matchFabric = p.fabric.toLowerCase().includes(q);
          const matchDesc = p.description.toLowerCase().includes(q);
          const matchSub = p.subtitle.toLowerCase().includes(q);
          const matchCollection = p.collection.toLowerCase().includes(q);
          const matchId = p.id.toLowerCase().includes(q);
          const matchColor = p.color.toLowerCase().includes(q);
          const matchWeight = p.fabricWeight ? p.fabricWeight.toLowerCase().includes(q) : false;
          const matchThread = p.threadCount ? p.threadCount.toLowerCase().includes(q) : false;
          const matchWeave = p.weaveType ? p.weaveType.toLowerCase().includes(q) : false;
          const matchWeightGrade = p.weightGrade ? p.weightGrade.toLowerCase().includes(q) : false;
          const matchBrand = p.brand ? p.brand.toLowerCase().includes(q) : false;
          const matchCraft = p.craftType ? p.craftType.toLowerCase().includes(q) : false;

          if (
            !matchTitle &&
            !matchFabric &&
            !matchDesc &&
            !matchSub &&
            !matchCollection &&
            !matchId &&
            !matchColor &&
            !matchWeight &&
            !matchThread &&
            !matchWeave &&
            !matchWeightGrade &&
            !matchBrand &&
            !matchCraft
          ) {
            return false;
          }
        }

        // Gender / Category filter
        if (selectedGender !== 'All' && p.gender !== selectedGender) return false;

        // Brand filter
        if (selectedBrand !== 'All' && p.brand !== selectedBrand) return false;

        // Craft technique filter (Embroidery vs Printed)
        if (selectedCraft !== 'All' && p.craftType !== selectedCraft) return false;

        // Fabric type filter
        if (selectedFabric !== 'All' && p.fabric !== selectedFabric) return false;

        // Season filter
        if (selectedSeason !== 'All') {
          if (selectedSeason === 'Summer' && p.season !== 'Summer' && p.season !== 'All Season') return false;
          if (selectedSeason === 'Winter' && p.season !== 'Winter' && p.season !== 'All Season') return false;
        }

        // Fabric Weight filter
        if (selectedFabricWeight !== 'All') {
          if (p.fabricWeightCategory !== selectedFabricWeight) return false;
        }

        // Thread Count filter
        if (selectedThreadCount !== 'All') {
          if (p.threadCountCategory !== selectedThreadCount) return false;
        }

        // Weave Type filter
        if (selectedWeaveType !== 'All') {
          if (p.weaveTypeCategory !== selectedWeaveType) return false;
        }

        // Price filter
        if (p.price > maxPrice) return false;

        // In-stock filter
        if (inStockOnly && !p.inStock) return false;

        return true;
      })
      .sort((a, b) => {
        if (sortBy === 'price-asc') return a.price - b.price;
        if (sortBy === 'price-desc') return b.price - a.price;
        if (sortBy === 'rating') return b.rating - a.rating;
        return (b.featured ? 1 : 0) - (a.featured ? 1 : 0);
      });
  }, [
    products,
    searchQuery,
    selectedGender,
    selectedBrand,
    selectedCraft,
    selectedFabric,
    selectedSeason,
    selectedFabricWeight,
    selectedThreadCount,
    selectedWeaveType,
    maxPrice,
    inStockOnly,
    sortBy,
  ]);

  // Compute live counts for each filter category
  const counts = useMemo(() => {
    const calcCount = (predicate: (p: Product) => boolean) => {
      return products.filter(predicate).length;
    };

    return {
      brand: (b: string) => calcCount((p) => p.brand === b),
      craft: (c: string) => calcCount((p) => p.craftType === c),
      weight: (weightCat: string) => calcCount((p) => p.fabricWeightCategory === weightCat),
      thread: (threadCat: string) => calcCount((p) => p.threadCountCategory === threadCat),
      weave: (weaveCat: string) => calcCount((p) => p.weaveTypeCategory === weaveCat),
      fabric: (fab: string) => calcCount((p) => p.fabric === fab),
      gender: (g: string) => calcCount((p) => p.gender === g),
      season: (s: string) => calcCount((p) => p.season === s || p.season === 'All Season'),
    };
  }, [products]);

  const resetFilters = () => {
    setSearchQuery('');
    setSelectedGender('All');
    setSelectedBrand('All');
    setSelectedCraft('All');
    setSelectedFabric('All');
    setSelectedSeason('All');
    setSelectedFabricWeight('All');
    setSelectedThreadCount('All');
    setSelectedWeaveType('All');
    setMaxPrice(30000);
    setInStockOnly(false);
    setSortBy('featured');
  };

  const hasActiveFilters =
    searchQuery.trim() !== '' ||
    selectedGender !== 'All' ||
    selectedBrand !== 'All' ||
    selectedCraft !== 'All' ||
    selectedFabric !== 'All' ||
    selectedSeason !== 'All' ||
    selectedFabricWeight !== 'All' ||
    selectedThreadCount !== 'All' ||
    selectedWeaveType !== 'All' ||
    maxPrice < 30000 ||
    inStockOnly;

  // Dynamic JSON-LD Schema reflecting active filters and matching products
  useEffect(() => {
    const scriptId = 'shop-catalog-jsonld';
    let scriptElement = document.getElementById(scriptId) as HTMLScriptElement | null;

    if (!scriptElement) {
      scriptElement = document.createElement('script');
      scriptElement.id = scriptId;
      scriptElement.type = 'application/ld+json';
      document.head.appendChild(scriptElement);
    }

    const jsonLdData = {
      '@context': 'https://schema.org',
      '@type': 'CollectionPage',
      name: 'Niaz Cloth House | Unstitched Fabrics Catalog',
      url: window.location.href,
      description:
        'Explore unstitched Pakistani fabrics with advanced filters for fabric weight, thread count, weave structure, and seasonal suiting since 1977.',
      potentialAction: {
        '@type': 'SearchAction',
        target: {
          '@type': 'EntryPoint',
          urlTemplate: 'https://nch.com/shop?search={search_term_string}',
        },
        'query-input': 'required name=search_term_string',
      },
      mainEntity: {
        '@type': 'ItemList',
        numberOfItems: filteredProducts.length,
        itemListElement: filteredProducts.map((p, idx) => ({
          '@type': 'ListItem',
          position: idx + 1,
          item: {
            '@type': 'Product',
            name: p.title,
            description: p.description,
            image: p.primaryImage,
            sku: p.id,
            category: `${p.gender}'s Unstitched Fabric`,
            material: p.fabric,
            additionalProperty: [
              {
                '@type': 'PropertyValue',
                name: 'Fabric Weight',
                value: p.fabricWeight || p.weightGrade,
              },
              {
                '@type': 'PropertyValue',
                name: 'Thread Count',
                value: p.threadCount || 'Standard Artisan Count',
              },
              {
                '@type': 'PropertyValue',
                name: 'Weave Type',
                value: p.weaveType || 'Traditional Weave',
              },
              {
                '@type': 'PropertyValue',
                name: 'Cut Length',
                value: p.cutDetails.length,
              },
            ],
            offers: {
              '@type': 'Offer',
              price: p.price,
              priceCurrency: 'PKR',
              availability: p.inStock ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock',
              seller: {
                '@type': 'Organization',
                name: 'Niaz Cloth House Since 1977',
              },
            },
          },
        })),
      },
    };

    scriptElement.textContent = JSON.stringify(jsonLdData);

    return () => {
      const el = document.getElementById(scriptId);
      if (el) el.remove();
    };
  }, [filteredProducts, searchQuery, selectedFabricWeight, selectedThreadCount, selectedWeaveType]);

  // Compute dynamic hero title and subtitle
  const getHeaderInfo = () => {
    if (searchQuery.trim()) {
      return {
        title: `Search: "${searchQuery}"`,
        subtitle: `Showing ${filteredProducts.length} unstitched fabrics matching your technical search criteria.`,
      };
    }
    if (selectedBrand !== 'All') {
      return {
        title: `${selectedBrand} Collection`,
        subtitle: `Authentic unstitched 3-piece suits from ${selectedBrand} at Niaz Cloth House, Paris Bazaar Rawalpindi.`,
      };
    }
    if (selectedCraft !== 'All') {
      return {
        title: `Women's ${selectedCraft} Suits`,
        subtitle: `Pakistani unstitched 3-piece suits crafted with premium ${selectedCraft.toLowerCase()} techniques.`,
      };
    }
    if (selectedGender === 'Men' && selectedSeason === 'Summer') {
      return {
        title: "Men's Summer Unstitched Collection",
        subtitle: 'Super 120s/140s Egyptian Giza Latha Cotton & Featherweight 6-Pound Chinese Boski Silk.',
      };
    }
    if (selectedGender === 'Men' && selectedSeason === 'Winter') {
      return {
        title: "Men's Winter Unstitched Collection",
        subtitle: 'Authentic Kamalia Handloom Khaddar, Raw Spun Karandi & 10-Pound Gold-Seal Chinese Boski.',
      };
    }
    if (selectedGender === 'Women' && selectedSeason === 'Summer') {
      return {
        title: "Women's Summer Unstitched Collection",
        subtitle: 'Superfine 80s Combed Lawn 3-Piece, Pure Crinkle Chiffon Dupattas & Swiss Voile Schiffli.',
      };
    }
    if (selectedGender === 'Women' && selectedSeason === 'Winter') {
      return {
        title: "Women's Winter Unstitched Collection",
        subtitle: 'Banarasi Silk Jacquard Festive, Kashmiri Pashmina Wool Shawls & Heavy Winter Khaddar.',
      };
    }
    if (selectedGender === 'Men') {
      return {
        title: "Men's Unstitched Suiting Collection",
        subtitle: '100% Pure Chinese Boski Silk, Egyptian Latha Cotton, Handloom Karandi & Kamalia Khaddar.',
      };
    }
    if (selectedGender === 'Women') {
      return {
        title: "Women's Unstitched Collection",
        subtitle: 'Pure 3-piece suits in combed lawn, chiffon, jacquard & warm winter shawls.',
      };
    }
    if (selectedSeason === 'Summer') {
      return {
        title: 'Summer Unstitched Collection 2026',
        subtitle: 'Breathable natural plant and silk fibers formulated to dissipate heat in peak subtropical weather.',
      };
    }
    if (selectedSeason === 'Winter') {
      return {
        title: 'Winter Unstitched Collection 2026',
        subtitle: 'Dense hand-spun natural cotton and raw silk slubs providing heirloom thermal insulation.',
      };
    }
    return {
      title: 'Unstitched Fabric Catalog',
      subtitle: 'Authentic Pakistani unstitched bolts with advanced weave structure, weight grade, and thread count filters.',
    };
  };

  const headerInfo = getHeaderInfo();

  const breadcrumbItems = useMemo<BreadcrumbItem[]>(() => {
    const items: BreadcrumbItem[] = [
      { name: 'Home', path: '/', page: 'home' },
      { name: 'All Unstitched Fabrics', path: '/shop', page: 'shop' },
    ];
    if (currentPage === 'men-summer') {
      items.push({ name: "Men's Summer Suiting", path: '/collections/men-summer', page: 'men-summer' });
    } else if (currentPage === 'men-winter') {
      items.push({ name: "Men's Winter Suiting", path: '/collections/men-winter', page: 'men-winter' });
    } else if (currentPage === 'women-summer') {
      items.push({ name: "Women's Summer Festive", path: '/collections/women-summer', page: 'women-summer' });
    } else if (currentPage === 'women-winter') {
      items.push({ name: "Women's Winter Festive", path: '/collections/women-winter', page: 'women-winter' });
    } else if (selectedBrand !== 'All') {
      items.push({ name: `${selectedBrand} Suits`, path: '/shop', page: 'shop' });
    } else if (selectedCraft !== 'All') {
      items.push({ name: `${selectedCraft} Suits`, path: '/shop', page: 'shop' });
    } else if (selectedGender !== 'All' || selectedSeason !== 'All') {
      items.push({ name: headerInfo.title, path: '/shop', page: 'shop' });
    }
    return items;
  }, [currentPage, selectedGender, selectedSeason, selectedBrand, selectedCraft, headerInfo.title]);

  return (
    <div className="w-full bg-[#FAF8F5] min-h-screen pb-14">
      {/* Crawlable Breadcrumbs Header */}
      <div className="border-b border-[#E7E0D8] bg-[#F5EFEB]/50">
        <Breadcrumbs items={breadcrumbItems} />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6">
        {/* Catalog Header Title */}
        <div className="border-b border-[#E7E0D8] pb-6 mb-8">

          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div>
              <h1 className="font-serif text-3xl sm:text-4xl font-bold text-[#1C1917]">
                {headerInfo.title}
              </h1>
              <p className="text-xs sm:text-sm text-[#1C1917]/70 font-sans mt-1">
                {headerInfo.subtitle}
              </p>
            </div>

            {/* Mobile Filter Trigger */}
            <div className="flex items-center gap-3 lg:hidden">
              <button
                onClick={() => setMobileFiltersOpen(true)}
                className="flex-1 py-2.5 px-4 bg-white border border-[#E7E0D8] text-xs font-semibold text-[#1C1917] flex items-center justify-center gap-2 shadow-xs"
              >
                <SlidersHorizontal className="w-4 h-4 text-[#8C4830]" />
                <span>Filters {hasActiveFilters ? '• Active' : ''}</span>
              </button>

              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                aria-label="Sort products by"
                className="py-2.5 px-3 bg-white border border-[#E7E0D8] text-xs text-[#1C1917] focus:outline-none"
              >
                <option value="featured">Featured First</option>
                <option value="price-asc">Price: Low to High</option>
                <option value="price-desc">Price: High to Low</option>
                <option value="rating">Highest Rated</option>
              </select>
            </div>
          </div>

          {/* Quick Category Bar: Summer & Winter in Men & Women + Embroidery & Printed */}
          <div className="mt-6 pt-4 border-t border-[#E7E0D8]/60 flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
            <span className="text-xs font-semibold uppercase tracking-wider text-[#1C1917]/60 shrink-0 mr-1">
              Collections:
            </span>
            <button
              onClick={() => {
                setSelectedGender('All');
                setSelectedSeason('All');
                setSelectedBrand('All');
                setSelectedCraft('All');
              }}
              className={`px-3 py-1.5 text-xs font-medium shrink-0 transition-colors border ${
                selectedGender === 'All' && selectedSeason === 'All' && selectedCraft === 'All' && selectedBrand === 'All'
                  ? 'bg-[#1C1917] text-white border-[#1C1917]'
                  : 'bg-white text-[#1C1917]/80 border-[#E7E0D8] hover:border-[#8C4830]'
              }`}
            >
              All Unstitched
            </button>
            <button
              onClick={() => {
                setSelectedGender('Women');
                setSelectedCraft('Embroidery');
                setSelectedBrand('All');
              }}
              className={`px-3 py-1.5 text-xs font-medium shrink-0 transition-colors border ${
                selectedGender === 'Women' && selectedCraft === 'Embroidery' && selectedBrand === 'All'
                  ? 'bg-[#8C4830] text-white border-[#8C4830]'
                  : 'bg-white text-[#1C1917]/80 border-[#E7E0D8] hover:border-[#8C4830]'
              }`}
            >
              ★ Women's Embroidery Brands
            </button>
            <button
              onClick={() => {
                setSelectedGender('Women');
                setSelectedCraft('Printed');
                setSelectedBrand('All');
              }}
              className={`px-3 py-1.5 text-xs font-medium shrink-0 transition-colors border ${
                selectedGender === 'Women' && selectedCraft === 'Printed' && selectedBrand === 'All'
                  ? 'bg-[#8C4830] text-white border-[#8C4830]'
                  : 'bg-white text-[#1C1917]/80 border-[#E7E0D8] hover:border-[#8C4830]'
              }`}
            >
              ★ Women's Printed Brands
            </button>
            <button
              onClick={() => {
                setSelectedGender('Men');
                setSelectedSeason('Summer');
                setSelectedCraft('All');
                setSelectedBrand('All');
              }}
              className={`px-3 py-1.5 text-xs font-medium shrink-0 transition-colors border ${
                selectedGender === 'Men' && selectedSeason === 'Summer'
                  ? 'bg-[#8C4830] text-white border-[#8C4830]'
                  : 'bg-white text-[#1C1917]/80 border-[#E7E0D8] hover:border-[#8C4830]'
              }`}
            >
              Men's Summer (Latha & Boski)
            </button>
            <button
              onClick={() => {
                setSelectedGender('Men');
                setSelectedSeason('Winter');
                setSelectedCraft('All');
                setSelectedBrand('All');
              }}
              className={`px-3 py-1.5 text-xs font-medium shrink-0 transition-colors border ${
                selectedGender === 'Men' && selectedSeason === 'Winter'
                  ? 'bg-[#8C4830] text-white border-[#8C4830]'
                  : 'bg-white text-[#1C1917]/80 border-[#E7E0D8] hover:border-[#8C4830]'
              }`}
            >
              Men's Winter (Khaddar & Karandi)
            </button>
            <button
              onClick={() => {
                setSelectedGender('Women');
                setSelectedSeason('Summer');
                setSelectedCraft('All');
                setSelectedBrand('All');
              }}
              className={`px-3 py-1.5 text-xs font-medium shrink-0 transition-colors border ${
                selectedGender === 'Women' && selectedSeason === 'Summer' && selectedCraft === 'All'
                  ? 'bg-[#8C4830] text-white border-[#8C4830]'
                  : 'bg-white text-[#1C1917]/80 border-[#E7E0D8] hover:border-[#8C4830]'
              }`}
            >
              Women's Summer (Lawn & Chiffon)
            </button>
            <button
              onClick={() => {
                setSelectedGender('Women');
                setSelectedSeason('Winter');
                setSelectedCraft('All');
                setSelectedBrand('All');
              }}
              className={`px-3 py-1.5 text-xs font-medium shrink-0 transition-colors border ${
                selectedGender === 'Women' && selectedSeason === 'Winter' && selectedCraft === 'All'
                  ? 'bg-[#8C4830] text-white border-[#8C4830]'
                  : 'bg-white text-[#1C1917]/80 border-[#E7E0D8] hover:border-[#8C4830]'
              }`}
            >
              Women's Winter (Jacquard & Shawls)
            </button>
          </div>
        </div>

        {/* Real-time Search Engine Input Bar on Catalog */}
        <div className="mb-8">
          <div className="relative bg-white border border-[#E7E0D8] shadow-xs flex items-center">
            <div className="pl-4 pr-2 text-[#8C4830]">
              <Search className="w-4 h-4" />
            </div>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search unstitched collection by fabric weight (e.g. 220 GSM), thread count (120s, 140s), weave structure (Plain, Sateen, Twill), or fabric name..."
              className="w-full py-3 pr-10 text-xs sm:text-sm bg-transparent border-none focus:outline-none text-[#1C1917] placeholder:text-[#1C1917]/65"
              aria-label="Search unstitched catalog by keyword, fabric, weight, or weave"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="pr-4 text-[#1C1917]/70 hover:text-[#1C1917] transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#8C4830]"
                aria-label="Clear search input"
                title="Clear search query"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {/* Main Layout: Sidebar Filters + Products Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Desktop Sidebar Filters */}
          <aside className="hidden lg:block lg:col-span-1 space-y-7">
            <div className="bg-[#FAF8F5] p-5 border border-[#E7E0D8] space-y-6 sticky top-28 max-h-[85vh] overflow-y-auto">
              <div className="flex items-center justify-between pb-3 border-b border-[#E7E0D8]">
                <div className="flex items-center gap-2 text-sm font-semibold text-[#1C1917]">
                  <Filter className="w-4 h-4 text-[#8C4830]" />
                  <span>Advanced Filters</span>
                </div>
                {hasActiveFilters && (
                  <button
                    onClick={resetFilters}
                    className="text-xs text-[#8C4830] hover:underline flex items-center gap-1"
                  >
                    <RotateCcw className="w-3 h-3" />
                    <span>Reset All</span>
                  </button>
                )}
              </div>

              {/* 0A. Women's Suit Brand / Mill Filter */}
              <div className="space-y-2 border-b border-[#E7E0D8]/70 pb-4">
                <button
                  type="button"
                  onClick={() => toggleSection('brand')}
                  className="w-full flex items-center justify-between text-xs font-bold uppercase tracking-wider text-[#1C1917] hover:text-[#8C4830]"
                >
                  <span className="flex items-center gap-1.5">
                    <Tag className="w-3.5 h-3.5 text-[#8C4830]" />
                    <span>Women's Brand / Mill</span>
                  </span>
                  {openSections.brand ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                </button>
                {openSections.brand && (
                  <div className="space-y-1 pt-1.5 text-xs text-[#1C1917]/80 max-h-56 overflow-y-auto pr-1 scrollbar-thin">
                    <label className="flex items-center justify-between p-1.5 hover:bg-[#F2ECE5] cursor-pointer">
                      <span className={selectedBrand === 'All' ? 'font-semibold text-[#8C4830]' : ''}>
                        All Brands & Mills
                      </span>
                      <input
                        type="radio"
                        name="brand"
                        checked={selectedBrand === 'All'}
                        onChange={() => setSelectedBrand('All')}
                        className="accent-[#8C4830]"
                      />
                    </label>

                    {/* Embroidery Brands Header */}
                    <div className="pt-2 pb-1 px-1 text-[10px] font-bold uppercase tracking-wider text-[#8C4830] bg-[#F5EFEB]/70">
                      ★ Embroidery Brands
                    </div>
                    {WOMEN_EMBROIDERY_BRANDS.map((brandName) => {
                      const count = counts.brand(brandName);
                      return (
                        <label
                          key={`desktop-emb-${brandName}`}
                          className="flex items-center justify-between p-1.5 hover:bg-[#F2ECE5] cursor-pointer"
                        >
                          <span className={selectedBrand === brandName ? 'font-semibold text-[#8C4830]' : ''}>
                            {brandName}
                          </span>
                          <div className="flex items-center gap-1.5">
                            <span className="text-[10px] text-[#1C1917]/40 font-mono">
                              ({count})
                            </span>
                            <input
                              type="radio"
                              name="brand"
                              checked={selectedBrand === brandName}
                              onChange={() => {
                                setSelectedBrand(brandName);
                                setSelectedGender('Women');
                              }}
                              className="accent-[#8C4830]"
                            />
                          </div>
                        </label>
                      );
                    })}

                    {/* Printed Brands Header */}
                    <div className="pt-2.5 pb-1 px-1 text-[10px] font-bold uppercase tracking-wider text-[#8C4830] bg-[#F5EFEB]/70">
                      ★ Printed Brands
                    </div>
                    {WOMEN_PRINTED_BRANDS.map((brandName) => {
                      const count = counts.brand(brandName);
                      return (
                        <label
                          key={`desktop-prt-${brandName}`}
                          className="flex items-center justify-between p-1.5 hover:bg-[#F2ECE5] cursor-pointer"
                        >
                          <span className={selectedBrand === brandName ? 'font-semibold text-[#8C4830]' : ''}>
                            {brandName}
                          </span>
                          <div className="flex items-center gap-1.5">
                            <span className="text-[10px] text-[#1C1917]/40 font-mono">
                              ({count})
                            </span>
                            <input
                              type="radio"
                              name="brand"
                              checked={selectedBrand === brandName}
                              onChange={() => {
                                setSelectedBrand(brandName);
                                setSelectedGender('Women');
                              }}
                              className="accent-[#8C4830]"
                            />
                          </div>
                        </label>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* 0B. Craft Technique Filter */}
              <div className="space-y-2 border-b border-[#E7E0D8]/70 pb-4">
                <button
                  type="button"
                  onClick={() => toggleSection('craft')}
                  className="w-full flex items-center justify-between text-xs font-bold uppercase tracking-wider text-[#1C1917] hover:text-[#8C4830]"
                >
                  <span className="flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-[#8C4830]" />
                    <span>Suit Craft Technique</span>
                  </span>
                  {openSections.craft ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                </button>
                {openSections.craft && (
                  <div className="space-y-1 pt-1.5 text-xs text-[#1C1917]/80">
                    {['All', 'Embroidery', 'Printed'].map((craft) => (
                      <label
                        key={craft}
                        className="flex items-center justify-between p-1.5 hover:bg-[#F2ECE5] cursor-pointer"
                      >
                        <span className={selectedCraft === craft ? 'font-semibold text-[#8C4830]' : ''}>
                          {craft === 'All' ? 'All Suit Techniques' : `${craft} Suits`}
                        </span>
                        <div className="flex items-center gap-1.5">
                          {craft !== 'All' && (
                            <span className="text-[10px] text-[#1C1917]/40 font-mono">
                              ({counts.craft(craft)})
                            </span>
                          )}
                          <input
                            type="radio"
                            name="craft"
                            checked={selectedCraft === craft}
                            onChange={() => setSelectedCraft(craft)}
                            className="accent-[#8C4830]"
                          />
                        </div>
                      </label>
                    ))}
                  </div>
                )}
              </div>

              {/* 1. Fabric Weight Filter (NEW) */}
              <div className="space-y-2 border-b border-[#E7E0D8]/70 pb-4">
                <button
                  type="button"
                  onClick={() => toggleSection('weight')}
                  className="w-full flex items-center justify-between text-xs font-bold uppercase tracking-wider text-[#1C1917] hover:text-[#8C4830]"
                >
                  <span className="flex items-center gap-1.5">
                    <Activity className="w-3.5 h-3.5 text-[#8C4830]" />
                    <span>Fabric Weight (GSM)</span>
                  </span>
                  {openSections.weight ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                </button>
                {openSections.weight && (
                  <div className="space-y-1 pt-1.5 text-xs text-[#1C1917]/80">
                    <label className="flex items-center justify-between p-1.5 hover:bg-[#F2ECE5] cursor-pointer">
                      <span className={selectedFabricWeight === 'All' ? 'font-semibold text-[#8C4830]' : ''}>
                        All Fabric Weights
                      </span>
                      <input
                        type="radio"
                        name="fabricWeight"
                        checked={selectedFabricWeight === 'All'}
                        onChange={() => setSelectedFabricWeight('All')}
                        className="accent-[#8C4830]"
                      />
                    </label>
                    {fabricWeightOptions.map((weight) => (
                      <label
                        key={weight}
                        className="flex items-center justify-between p-1.5 hover:bg-[#F2ECE5] cursor-pointer"
                      >
                        <span className={selectedFabricWeight === weight ? 'font-semibold text-[#8C4830]' : ''}>
                          {weight}
                        </span>
                        <div className="flex items-center gap-1.5">
                          <span className="text-[10px] text-[#1C1917]/40 font-mono">
                            ({counts.weight(weight)})
                          </span>
                          <input
                            type="radio"
                            name="fabricWeight"
                            checked={selectedFabricWeight === weight}
                            onChange={() => setSelectedFabricWeight(weight)}
                            className="accent-[#8C4830]"
                          />
                        </div>
                      </label>
                    ))}
                  </div>
                )}
              </div>

              {/* 2. Thread Count Filter (NEW) */}
              <div className="space-y-2 border-b border-[#E7E0D8]/70 pb-4">
                <button
                  type="button"
                  onClick={() => toggleSection('threadCount')}
                  className="w-full flex items-center justify-between text-xs font-bold uppercase tracking-wider text-[#1C1917] hover:text-[#8C4830]"
                >
                  <span className="flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-[#8C4830]" />
                    <span>Thread & Yarn Count</span>
                  </span>
                  {openSections.threadCount ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                </button>
                {openSections.threadCount && (
                  <div className="space-y-1 pt-1.5 text-xs text-[#1C1917]/80">
                    <label className="flex items-center justify-between p-1.5 hover:bg-[#F2ECE5] cursor-pointer">
                      <span className={selectedThreadCount === 'All' ? 'font-semibold text-[#8C4830]' : ''}>
                        All Thread Counts
                      </span>
                      <input
                        type="radio"
                        name="threadCount"
                        checked={selectedThreadCount === 'All'}
                        onChange={() => setSelectedThreadCount('All')}
                        className="accent-[#8C4830]"
                      />
                    </label>
                    {threadCountOptions.map((thread) => (
                      <label
                        key={thread}
                        className="flex items-center justify-between p-1.5 hover:bg-[#F2ECE5] cursor-pointer"
                      >
                        <span className={selectedThreadCount === thread ? 'font-semibold text-[#8C4830]' : ''}>
                          {thread}
                        </span>
                        <div className="flex items-center gap-1.5">
                          <span className="text-[10px] text-[#1C1917]/40 font-mono">
                            ({counts.thread(thread)})
                          </span>
                          <input
                            type="radio"
                            name="threadCount"
                            checked={selectedThreadCount === thread}
                            onChange={() => setSelectedThreadCount(thread)}
                            className="accent-[#8C4830]"
                          />
                        </div>
                      </label>
                    ))}
                  </div>
                )}
              </div>

              {/* 3. Weave Type Filter (NEW) */}
              <div className="space-y-2 border-b border-[#E7E0D8]/70 pb-4">
                <button
                  type="button"
                  onClick={() => toggleSection('weave')}
                  className="w-full flex items-center justify-between text-xs font-bold uppercase tracking-wider text-[#1C1917] hover:text-[#8C4830]"
                >
                  <span className="flex items-center gap-1.5">
                    <Layers className="w-3.5 h-3.5 text-[#8C4830]" />
                    <span>Weave Structure</span>
                  </span>
                  {openSections.weave ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                </button>
                {openSections.weave && (
                  <div className="space-y-1 pt-1.5 text-xs text-[#1C1917]/80">
                    <label className="flex items-center justify-between p-1.5 hover:bg-[#F2ECE5] cursor-pointer">
                      <span className={selectedWeaveType === 'All' ? 'font-semibold text-[#8C4830]' : ''}>
                        All Weave Structures
                      </span>
                      <input
                        type="radio"
                        name="weaveType"
                        checked={selectedWeaveType === 'All'}
                        onChange={() => setSelectedWeaveType('All')}
                        className="accent-[#8C4830]"
                      />
                    </label>
                    {weaveTypeOptions.map((weave) => (
                      <label
                        key={weave}
                        className="flex items-center justify-between p-1.5 hover:bg-[#F2ECE5] cursor-pointer"
                      >
                        <span className={selectedWeaveType === weave ? 'font-semibold text-[#8C4830]' : ''}>
                          {weave}
                        </span>
                        <div className="flex items-center gap-1.5">
                          <span className="text-[10px] text-[#1C1917]/40 font-mono">
                            ({counts.weave(weave)})
                          </span>
                          <input
                            type="radio"
                            name="weaveType"
                            checked={selectedWeaveType === weave}
                            onChange={() => setSelectedWeaveType(weave)}
                            className="accent-[#8C4830]"
                          />
                        </div>
                      </label>
                    ))}
                  </div>
                )}
              </div>

              {/* 4. Gender Filter */}
              <div className="space-y-2 border-b border-[#E7E0D8]/70 pb-4">
                <button
                  type="button"
                  onClick={() => toggleSection('gender')}
                  className="w-full flex items-center justify-between text-xs font-bold uppercase tracking-wider text-[#1C1917] hover:text-[#8C4830]"
                >
                  <span>Category / Gender</span>
                  {openSections.gender ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                </button>
                {openSections.gender && (
                  <div className="space-y-1 pt-1.5 text-xs text-[#1C1917]/80">
                    {['All', 'Men', 'Women'].map((gender) => (
                      <label
                        key={gender}
                        className="flex items-center justify-between p-1.5 hover:bg-[#F2ECE5] cursor-pointer"
                      >
                        <span className={selectedGender === gender ? 'font-semibold text-[#8C4830]' : ''}>
                          {gender === 'All' ? 'All Suiting' : `${gender}'s Unstitched`}
                        </span>
                        <input
                          type="radio"
                          name="gender"
                          checked={selectedGender === gender}
                          onChange={() => setSelectedGender(gender)}
                          className="accent-[#8C4830]"
                        />
                      </label>
                    ))}
                  </div>
                )}
              </div>

              {/* 5. Fabric Type Filter */}
              <div className="space-y-2 border-b border-[#E7E0D8]/70 pb-4">
                <button
                  type="button"
                  onClick={() => toggleSection('fabric')}
                  className="w-full flex items-center justify-between text-xs font-bold uppercase tracking-wider text-[#1C1917] hover:text-[#8C4830]"
                >
                  <span>Fabric Material</span>
                  {openSections.fabric ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                </button>
                {openSections.fabric && (
                  <div className="space-y-1 pt-1.5 text-xs text-[#1C1917]/80 max-h-48 overflow-y-auto pr-1">
                    <label className="flex items-center justify-between p-1.5 hover:bg-[#F2ECE5] cursor-pointer">
                      <span className={selectedFabric === 'All' ? 'font-semibold text-[#8C4830]' : ''}>
                        All Fabrics
                      </span>
                      <input
                        type="radio"
                        name="fabric"
                        checked={selectedFabric === 'All'}
                        onChange={() => setSelectedFabric('All')}
                        className="accent-[#8C4830]"
                      />
                    </label>
                    {fabricOptions.map((fabric) => (
                      <label
                        key={fabric}
                        className="flex items-center justify-between p-1.5 hover:bg-[#F2ECE5] cursor-pointer"
                      >
                        <span className={selectedFabric === fabric ? 'font-semibold text-[#8C4830]' : ''}>
                          {fabric}
                        </span>
                        <div className="flex items-center gap-1.5">
                          <span className="text-[10px] text-[#1C1917]/40 font-mono">
                            ({counts.fabric(fabric)})
                          </span>
                          <input
                            type="radio"
                            name="fabric"
                            checked={selectedFabric === fabric}
                            onChange={() => setSelectedFabric(fabric)}
                            className="accent-[#8C4830]"
                          />
                        </div>
                      </label>
                    ))}
                  </div>
                )}
              </div>

              {/* 6. Season Filter */}
              <div className="space-y-2 border-b border-[#E7E0D8]/70 pb-4">
                <button
                  type="button"
                  onClick={() => toggleSection('season')}
                  className="w-full flex items-center justify-between text-xs font-bold uppercase tracking-wider text-[#1C1917] hover:text-[#8C4830]"
                >
                  <span>Season Collection</span>
                  {openSections.season ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                </button>
                {openSections.season && (
                  <div className="space-y-1 pt-1.5 text-xs text-[#1C1917]/80">
                    {['All', 'Summer', 'Winter'].map((season) => (
                      <label
                        key={season}
                        className="flex items-center justify-between p-1.5 hover:bg-[#F2ECE5] cursor-pointer"
                      >
                        <span className={selectedSeason === season ? 'font-semibold text-[#8C4830]' : ''}>
                          {season === 'All' ? 'All Seasons' : `${season} Edition`}
                        </span>
                        <input
                          type="radio"
                          name="season"
                          checked={selectedSeason === season}
                          onChange={() => setSelectedSeason(season)}
                          className="accent-[#8C4830]"
                        />
                      </label>
                    ))}
                  </div>
                )}
              </div>

              {/* 7. Price Range Slider */}
              <div className="space-y-2.5">
                <div className="flex justify-between items-center text-xs">
                  <span className="font-bold uppercase tracking-wider text-[#1C1917]">Max Price</span>
                  <span className="font-mono font-semibold text-[#8C4830] tabular-nums">
                    {formatPKR(maxPrice)}
                  </span>
                </div>
                <input
                  type="range"
                  min={5000}
                  max={30000}
                  step={500}
                  value={maxPrice}
                  onChange={(e) => setMaxPrice(Number(e.target.value))}
                  className="w-full accent-[#8C4830] cursor-pointer"
                />
                <div className="flex justify-between text-[11px] text-[#1C1917]/50 font-mono">
                  <span>₨ 5,000</span>
                  <span>₨ 30,000</span>
                </div>
              </div>

              {/* 8. In-Stock Toggle */}
              <div className="pt-2 border-t border-[#E7E0D8]">
                <label className="flex items-center gap-2 cursor-pointer text-xs text-[#1C1917]">
                  <input
                    type="checkbox"
                    checked={inStockOnly}
                    onChange={(e) => setInStockOnly(e.target.checked)}
                    className="accent-[#8C4830]"
                  />
                  <span>Show In-Stock Fabrics Only</span>
                </label>
              </div>
            </div>
          </aside>

          {/* Product Grid Area */}
          <main className="lg:col-span-3 space-y-6">
            {/* Desktop Sort & Count Bar */}
            <div className="hidden lg:flex items-center justify-between pb-3 border-b border-[#E7E0D8] text-xs">
              <span className="text-[#1C1917]/70 font-sans">
                Showing <strong className="text-[#1C1917]">{filteredProducts.length}</strong> of{' '}
                {products.length} unstitched fabrics
              </span>

              <div className="flex items-center gap-3">
                <span className="text-[#1C1917]/60">Sort by:</span>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as any)}
                  aria-label="Sort products by"
                  className="py-1.5 px-3 bg-white border border-[#E7E0D8] text-xs text-[#1C1917] focus:outline-none"
                >
                  <option value="featured">Featured Collection</option>
                  <option value="price-asc">Price: Low to High</option>
                  <option value="price-desc">Price: High to Low</option>
                  <option value="rating">Customer Rating</option>
                </select>
              </div>
            </div>

            {/* Active Filters Clean Badges */}
            {hasActiveFilters && (
              <div className="flex flex-wrap items-center gap-2 text-xs text-[#1C1917]/80 bg-white p-3 border border-[#E7E0D8]">
                <span className="font-semibold text-[#8C4830] mr-1">Active Filters:</span>
                
                {searchQuery && (
                  <span className="inline-flex items-center gap-1.5 bg-[#FAF8F5] px-2.5 py-1 border border-[#E7E0D8]">
                    <span>Search: "{searchQuery}"</span>
                    <button
                      type="button"
                      onClick={() => setSearchQuery('')}
                      className="text-[#1C1917]/60 hover:text-[#8C4830]"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                )}

                {selectedBrand !== 'All' && (
                  <span className="inline-flex items-center gap-1.5 bg-[#FAF8F5] px-2.5 py-1 border border-[#E7E0D8]">
                    <span>Brand: {selectedBrand}</span>
                    <button
                      type="button"
                      onClick={() => setSelectedBrand('All')}
                      className="text-[#1C1917]/60 hover:text-[#8C4830]"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                )}

                {selectedCraft !== 'All' && (
                  <span className="inline-flex items-center gap-1.5 bg-[#FAF8F5] px-2.5 py-1 border border-[#E7E0D8]">
                    <span>Craft: {selectedCraft}</span>
                    <button
                      type="button"
                      onClick={() => setSelectedCraft('All')}
                      className="text-[#1C1917]/60 hover:text-[#8C4830]"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                )}

                {selectedFabricWeight !== 'All' && (
                  <span className="inline-flex items-center gap-1.5 bg-[#FAF8F5] px-2.5 py-1 border border-[#E7E0D8]">
                    <span>Weight: {selectedFabricWeight}</span>
                    <button
                      type="button"
                      onClick={() => setSelectedFabricWeight('All')}
                      className="text-[#1C1917]/60 hover:text-[#8C4830]"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                )}

                {selectedThreadCount !== 'All' && (
                  <span className="inline-flex items-center gap-1.5 bg-[#FAF8F5] px-2.5 py-1 border border-[#E7E0D8]">
                    <span>Thread: {selectedThreadCount}</span>
                    <button
                      type="button"
                      onClick={() => setSelectedThreadCount('All')}
                      className="text-[#1C1917]/60 hover:text-[#8C4830]"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                )}

                {selectedWeaveType !== 'All' && (
                  <span className="inline-flex items-center gap-1.5 bg-[#FAF8F5] px-2.5 py-1 border border-[#E7E0D8]">
                    <span>Weave: {selectedWeaveType}</span>
                    <button
                      type="button"
                      onClick={() => setSelectedWeaveType('All')}
                      className="text-[#1C1917]/60 hover:text-[#8C4830]"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                )}

                {selectedGender !== 'All' && (
                  <span className="inline-flex items-center gap-1.5 bg-[#FAF8F5] px-2.5 py-1 border border-[#E7E0D8]">
                    <span>Gender: {selectedGender}</span>
                    <button
                      type="button"
                      onClick={() => setSelectedGender('All')}
                      className="text-[#1C1917]/60 hover:text-[#8C4830]"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                )}

                {selectedFabric !== 'All' && (
                  <span className="inline-flex items-center gap-1.5 bg-[#FAF8F5] px-2.5 py-1 border border-[#E7E0D8]">
                    <span>Fabric: {selectedFabric}</span>
                    <button
                      type="button"
                      onClick={() => setSelectedFabric('All')}
                      className="text-[#1C1917]/60 hover:text-[#8C4830]"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                )}

                {selectedSeason !== 'All' && (
                  <span className="inline-flex items-center gap-1.5 bg-[#FAF8F5] px-2.5 py-1 border border-[#E7E0D8]">
                    <span>Season: {selectedSeason}</span>
                    <button
                      type="button"
                      onClick={() => setSelectedSeason('All')}
                      className="text-[#1C1917]/60 hover:text-[#8C4830]"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                )}

                {maxPrice < 30000 && (
                  <span className="inline-flex items-center gap-1.5 bg-[#FAF8F5] px-2.5 py-1 border border-[#E7E0D8]">
                    <span>Under {formatPKR(maxPrice)}</span>
                    <button
                      type="button"
                      onClick={() => setMaxPrice(30000)}
                      className="text-[#1C1917]/60 hover:text-[#8C4830]"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                )}

                {inStockOnly && (
                  <span className="inline-flex items-center gap-1.5 bg-[#FAF8F5] px-2.5 py-1 border border-[#E7E0D8]">
                    <span>In-Stock Only</span>
                    <button
                      type="button"
                      onClick={() => setInStockOnly(false)}
                      className="text-[#1C1917]/60 hover:text-[#8C4830]"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                )}

                <button
                  type="button"
                  onClick={resetFilters}
                  className="text-xs text-[#8C4830] font-semibold underline hover:text-[#703623] ml-auto"
                >
                  Clear All
                </button>
              </div>
            )}

            {/* Empty State */}
            {filteredProducts.length === 0 ? (
              <div className="py-20 text-center bg-white border border-[#E7E0D8] space-y-4">
                <div className="w-12 h-12 mx-auto bg-[#F5EFEB] flex items-center justify-center text-[#8C4830]">
                  <Filter className="w-6 h-6" />
                </div>
                <h3 className="font-serif text-lg font-bold text-[#1C1917]">
                  No matching unstitched fabrics found
                </h3>
                <p className="text-xs text-[#1C1917]/60 max-w-sm mx-auto leading-relaxed">
                  No bolts match your exact combination of fabric weight, thread count, weave structure, or search term. Try resetting specific filters to view related varieties.
                </p>
                <button
                  onClick={resetFilters}
                  className="px-5 py-2.5 bg-[#8C4830] text-white text-xs font-semibold uppercase tracking-wider hover:bg-[#703623] transition-colors"
                >
                  Reset All Filters
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
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
      </div>

      {/* Mobile Drawer Filter */}
      {mobileFiltersOpen && (
        <div className="fixed inset-0 z-50 overflow-hidden lg:hidden" role="dialog" aria-modal="true">
          <div
            className="fixed inset-0 bg-black/50"
            onClick={() => setMobileFiltersOpen(false)}
          />
          <div className="fixed inset-y-0 right-0 max-w-xs w-full bg-[#FAF8F5] p-5 shadow-2xl flex flex-col justify-between overflow-y-auto">
            <div className="space-y-6">
              <div className="flex items-center justify-between pb-3 border-b border-[#E7E0D8]">
                <h3 className="font-serif text-lg font-bold text-[#1C1917]">Filter Catalog</h3>
                <button
                  onClick={() => setMobileFiltersOpen(false)}
                  className="p-1 text-[#1C1917]/70 hover:text-[#1C1917]"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Mobile Brand / Mill */}
              <div className="space-y-2 border-b border-[#E7E0D8]/70 pb-3">
                <span className="text-xs font-bold uppercase text-[#1C1917] block">Women's Brand / Mill</span>
                <div className="space-y-1 text-xs max-h-40 overflow-y-auto pr-1">
                  <label className="flex justify-between p-1">
                    <span>All Brands</span>
                    <input
                      type="radio"
                      name="m-brand"
                      checked={selectedBrand === 'All'}
                      onChange={() => setSelectedBrand('All')}
                      className="accent-[#8C4830]"
                    />
                  </label>
                  <div className="text-[10px] font-bold text-[#8C4830] pt-1">Embroidery Brands</div>
                  {WOMEN_EMBROIDERY_BRANDS.map((b) => (
                    <label key={`m-emb-${b}`} className="flex justify-between p-1">
                      <span>{b}</span>
                      <input
                        type="radio"
                        name="m-brand"
                        checked={selectedBrand === b}
                        onChange={() => {
                          setSelectedBrand(b);
                          setSelectedGender('Women');
                        }}
                        className="accent-[#8C4830]"
                      />
                    </label>
                  ))}
                  <div className="text-[10px] font-bold text-[#8C4830] pt-1">Printed Brands</div>
                  {WOMEN_PRINTED_BRANDS.map((b) => (
                    <label key={`m-prt-${b}`} className="flex justify-between p-1">
                      <span>{b}</span>
                      <input
                        type="radio"
                        name="m-brand"
                        checked={selectedBrand === b}
                        onChange={() => {
                          setSelectedBrand(b);
                          setSelectedGender('Women');
                        }}
                        className="accent-[#8C4830]"
                      />
                    </label>
                  ))}
                </div>
              </div>

              {/* Mobile Craft Technique */}
              <div className="space-y-2 border-b border-[#E7E0D8]/70 pb-3">
                <span className="text-xs font-bold uppercase text-[#1C1917] block">Suit Craft Technique</span>
                <div className="space-y-1 text-xs">
                  {['All', 'Embroidery', 'Printed'].map((c) => (
                    <label key={`m-craft-${c}`} className="flex justify-between p-1">
                      <span>{c === 'All' ? 'All Techniques' : `${c} Suits`}</span>
                      <input
                        type="radio"
                        name="m-craft"
                        checked={selectedCraft === c}
                        onChange={() => setSelectedCraft(c)}
                        className="accent-[#8C4830]"
                      />
                    </label>
                  ))}
                </div>
              </div>

              {/* Mobile Fabric Weight */}
              <div className="space-y-2 border-b border-[#E7E0D8]/70 pb-3">
                <span className="text-xs font-bold uppercase text-[#1C1917] block">Fabric Weight (GSM)</span>
                <div className="space-y-1 text-xs">
                  <label className="flex justify-between p-1">
                    <span>All Weights</span>
                    <input
                      type="radio"
                      name="m-weight"
                      checked={selectedFabricWeight === 'All'}
                      onChange={() => setSelectedFabricWeight('All')}
                      className="accent-[#8C4830]"
                    />
                  </label>
                  {fabricWeightOptions.map((w) => (
                    <label key={w} className="flex justify-between p-1">
                      <span>{w}</span>
                      <input
                        type="radio"
                        name="m-weight"
                        checked={selectedFabricWeight === w}
                        onChange={() => setSelectedFabricWeight(w)}
                        className="accent-[#8C4830]"
                      />
                    </label>
                  ))}
                </div>
              </div>

              {/* Mobile Thread Count */}
              <div className="space-y-2 border-b border-[#E7E0D8]/70 pb-3">
                <span className="text-xs font-bold uppercase text-[#1C1917] block">Thread & Yarn Count</span>
                <div className="space-y-1 text-xs">
                  <label className="flex justify-between p-1">
                    <span>All Thread Counts</span>
                    <input
                      type="radio"
                      name="m-thread"
                      checked={selectedThreadCount === 'All'}
                      onChange={() => setSelectedThreadCount('All')}
                      className="accent-[#8C4830]"
                    />
                  </label>
                  {threadCountOptions.map((tc) => (
                    <label key={tc} className="flex justify-between p-1">
                      <span>{tc}</span>
                      <input
                        type="radio"
                        name="m-thread"
                        checked={selectedThreadCount === tc}
                        onChange={() => setSelectedThreadCount(tc)}
                        className="accent-[#8C4830]"
                      />
                    </label>
                  ))}
                </div>
              </div>

              {/* Mobile Weave Type */}
              <div className="space-y-2 border-b border-[#E7E0D8]/70 pb-3">
                <span className="text-xs font-bold uppercase text-[#1C1917] block">Weave Structure</span>
                <div className="space-y-1 text-xs">
                  <label className="flex justify-between p-1">
                    <span>All Weaves</span>
                    <input
                      type="radio"
                      name="m-weave"
                      checked={selectedWeaveType === 'All'}
                      onChange={() => setSelectedWeaveType('All')}
                      className="accent-[#8C4830]"
                    />
                  </label>
                  {weaveTypeOptions.map((wt) => (
                    <label key={wt} className="flex justify-between p-1">
                      <span>{wt}</span>
                      <input
                        type="radio"
                        name="m-weave"
                        checked={selectedWeaveType === wt}
                        onChange={() => setSelectedWeaveType(wt)}
                        className="accent-[#8C4830]"
                      />
                    </label>
                  ))}
                </div>
              </div>

              {/* Mobile Season */}
              <div className="space-y-2 border-b border-[#E7E0D8]/70 pb-3">
                <span className="text-xs font-bold uppercase text-[#1C1917]">Season</span>
                {['All', 'Summer', 'Winter'].map((s) => (
                  <label key={s} className="flex justify-between text-xs p-1">
                    <span>{s === 'All' ? 'All Seasons' : `${s} Edition`}</span>
                    <input
                      type="radio"
                      name="m-season"
                      checked={selectedSeason === s}
                      onChange={() => setSelectedSeason(s)}
                      className="accent-[#8C4830]"
                    />
                  </label>
                ))}
              </div>

              {/* Mobile Gender */}
              <div className="space-y-2 border-b border-[#E7E0D8]/70 pb-3">
                <span className="text-xs font-bold uppercase text-[#1C1917]">Gender</span>
                {['All', 'Men', 'Women'].map((g) => (
                  <label key={g} className="flex justify-between text-xs p-1">
                    <span>{g}</span>
                    <input
                      type="radio"
                      name="m-gender"
                      checked={selectedGender === g}
                      onChange={() => setSelectedGender(g)}
                      className="accent-[#8C4830]"
                    />
                  </label>
                ))}
              </div>

              {/* Mobile Fabric */}
              <div className="space-y-2 border-b border-[#E7E0D8]/70 pb-3">
                <span className="text-xs font-bold uppercase text-[#1C1917]">Fabric Material</span>
                <div className="space-y-1 text-xs max-h-36 overflow-y-auto">
                  <label className="flex justify-between p-1">
                    <span>All Fabrics</span>
                    <input
                      type="radio"
                      name="m-fabric"
                      checked={selectedFabric === 'All'}
                      onChange={() => setSelectedFabric('All')}
                      className="accent-[#8C4830]"
                    />
                  </label>
                  {fabricOptions.map((f) => (
                    <label key={f} className="flex justify-between p-1">
                      <span>{f}</span>
                      <input
                        type="radio"
                        name="m-fabric"
                        checked={selectedFabric === f}
                        onChange={() => setSelectedFabric(f)}
                        className="accent-[#8C4830]"
                      />
                    </label>
                  ))}
                </div>
              </div>

              {/* Max Price */}
              <div className="space-y-2">
                <span className="text-xs font-bold uppercase text-[#1C1917]">
                  Max Price: {formatPKR(maxPrice)}
                </span>
                <input
                  type="range"
                  min={5000}
                  max={30000}
                  step={500}
                  value={maxPrice}
                  onChange={(e) => setMaxPrice(Number(e.target.value))}
                  className="w-full accent-[#8C4830]"
                />
              </div>
            </div>

            <div className="pt-6 border-t border-[#E7E0D8] space-y-2">
              <button
                onClick={() => setMobileFiltersOpen(false)}
                className="w-full py-3 bg-[#8C4830] text-white text-xs font-semibold uppercase tracking-wider"
              >
                Apply Filters ({filteredProducts.length})
              </button>
              <button
                onClick={resetFilters}
                className="w-full py-2 bg-transparent text-xs text-[#1C1917]/70 underline"
              >
                Reset All Filters
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Quick View Modal */}
      {quickViewProduct && (
        <div
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4"
          role="dialog"
          aria-modal="true"
        >
          <div className="bg-[#FAF8F5] max-w-2xl w-full border border-[#E7E0D8] shadow-2xl overflow-hidden relative animate-in fade-in zoom-in-95 duration-200">
            <button
              onClick={() => setQuickViewProduct(null)}
              className="absolute top-4 right-4 z-10 p-1.5 bg-white/80 hover:bg-white text-[#1C1917] rounded-full"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="grid grid-cols-1 sm:grid-cols-2">
              <div className="aspect-[4/3] sm:aspect-auto bg-[#F2EDE7]">
                <img
                  src={quickViewProduct.primaryImage}
                  alt={`${quickViewProduct.title} - ${quickViewProduct.fabric} unstitched suit fabric preview`}
                  width={500}
                  height={500}
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover"
                />
              </div>

              <div className="p-6 flex flex-col justify-between space-y-4">
                <div>
                  <div className="text-xs text-[#8C4830] font-sans font-semibold mb-1">
                    {quickViewProduct.gender} · {quickViewProduct.fabric}
                  </div>
                  <h3 className="font-serif text-xl font-bold text-[#1C1917]">
                    {quickViewProduct.title}
                  </h3>
                  <div className="mt-2 font-mono text-lg font-bold text-[#1C1917] tabular-nums">
                    {formatPKR(quickViewProduct.price)}
                  </div>
                  <p className="text-xs text-[#1C1917]/75 mt-3 leading-relaxed">
                    {quickViewProduct.description}
                  </p>
                  
                  {/* Detailed technical specifications in quick view */}
                  <div className="mt-3 p-3 bg-white border border-[#E7E0D8] text-xs space-y-1">
                    <p><strong>Cut Length:</strong> {quickViewProduct.cutDetails.length}</p>
                    <p><strong>Fabric Width:</strong> {quickViewProduct.cutDetails.width}</p>
                    {quickViewProduct.weaveType && (
                      <p><strong>Weave Structure:</strong> {quickViewProduct.weaveType}</p>
                    )}
                    {quickViewProduct.fabricWeight && (
                      <p><strong>Fabric Weight:</strong> {quickViewProduct.fabricWeight}</p>
                    )}
                    {quickViewProduct.threadCount && (
                      <p><strong>Thread / Yarn Count:</strong> {quickViewProduct.threadCount}</p>
                    )}
                  </div>
                </div>

                <div className="space-y-2 pt-2">
                  <button
                    onClick={() => {
                      addToCart(quickViewProduct, 1);
                      setQuickViewProduct(null);
                    }}
                    className="w-full py-2.5 bg-[#8C4830] hover:bg-[#703623] text-white text-xs font-semibold uppercase tracking-wider transition-colors flex items-center justify-center gap-2"
                  >
                    <ShoppingBag className="w-4 h-4" />
                    <span>Add to Bag</span>
                  </button>

                  <button
                    onClick={() => {
                      const id = quickViewProduct.id;
                      setQuickViewProduct(null);
                      navigateTo('product-detail', { id });
                    }}
                    className="w-full py-2 bg-transparent hover:bg-[#F2ECE5] text-[#1C1917] text-xs font-semibold tracking-wide border border-[#E7E0D8] transition-colors flex items-center justify-center gap-1"
                  >
                    <span>View Complete Fabric Specs</span>
                    <ArrowUpRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
