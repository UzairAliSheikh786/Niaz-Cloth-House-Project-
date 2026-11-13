import React, { useState, useEffect } from 'react';
import { 
  ShoppingBag, 
  MessageCircle, 
  ChevronDown, 
  ChevronUp, 
  ShieldCheck, 
  Ruler, 
  Truck, 
  Sparkles, 
  Check, 
  Star,
  ArrowLeft,
  Share2,
  ThumbsUp,
  PenSquare,
  X,
  CheckCircle2,
  Filter,
  Palette,
  Layers,
  Scissors
} from 'lucide-react';
import { useShop, formatPKR } from '../context/ShopContext';
import { useNavigation } from '../context/NavigationContext';
import { useReviews } from '../context/ReviewContext';
import { useAuth } from '../context/AuthContext';
import { ProductCard } from '../components/ProductCard';
import { Breadcrumbs } from '../components/Breadcrumbs';

export const ProductDetailPage: React.FC = () => {
  const { products, addToCart, generateWhatsAppOrderUrl, showToast, recordProductView, storeSettings } = useShop();
  const { productId, navigateTo } = useNavigation();
  const { getReviewsForProduct, getProductStats, submitReview, isSubmittingReview } = useReviews();
  const { user } = useAuth();

  const product = products.find((p) => p.id === productId) || products[0];

  useEffect(() => {
    if (product) {
      recordProductView(product);
    }
  }, [product?.id]);

  const [selectedImage, setSelectedImage] = useState<string>(product.primaryImage);
  const [quantity, setQuantity] = useState<number>(1);
  const [selectedColor, setSelectedColor] = useState<string>(
    product.colorOptions?.[0]?.name || product.color
  );
  const [selectedColorHex, setSelectedColorHex] = useState<string>(
    product.colorOptions?.[0]?.hex || product.colorHex
  );
  const [selectedDesignId, setSelectedDesignId] = useState<string>(
    product.designOptions?.[0]?.id || 'std'
  );
  const [selectedPartTab, setSelectedPartTab] = useState<'all' | 'kameez' | 'dupatta' | 'shalwar'>('all');
  const [activeTab, setActiveTab] = useState<'care' | 'guide' | 'heritage' | 'reviews'>('care');
  const [openAccordion, setOpenAccordion] = useState<string>('washing');

  // Dynamic reviews & ratings from IndexedDB
  const stats = getProductStats(product.id);
  const reviews = getReviewsForProduct(product.id);

  // Review Form & Filter States
  const [isReviewFormOpen, setIsReviewFormOpen] = useState(false);
  const [reviewRating, setReviewRating] = useState<number>(5);
  const [reviewHoverRating, setReviewHoverRating] = useState<number>(0);
  const [reviewName, setReviewName] = useState<string>('');
  const [reviewCity, setReviewCity] = useState<string>('Rawalpindi');
  const [reviewTitle, setReviewTitle] = useState<string>('');
  const [reviewComment, setReviewComment] = useState<string>('');
  const [reviewSuccessMsg, setReviewSuccessMsg] = useState<string>('');
  const [reviewErrorMsg, setReviewErrorMsg] = useState<string>('');
  const [selectedStarFilter, setSelectedStarFilter] = useState<'all' | 5 | 4 | 3 | 2 | 1>('all');

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    setReviewErrorMsg('');
    setReviewSuccessMsg('');

    if (reviewRating < 1 || reviewRating > 5) {
      setReviewErrorMsg('Please select a star rating between 1 and 5.');
      return;
    }

    const name = reviewName.trim() || user?.displayName || 'Customer';
    if (name.length < 2) {
      setReviewErrorMsg('Please enter your name.');
      return;
    }

    const comment = reviewComment.trim();
    if (comment.length < 6) {
      setReviewErrorMsg('Please write a brief review of at least 6 characters describing the fabric.');
      return;
    }

    try {
      await submitReview({
        productId: product.id,
        authorName: name,
        authorCity: reviewCity.trim() || 'Rawalpindi',
        rating: reviewRating,
        title: reviewTitle.trim() || undefined,
        comment,
      });

      setReviewComment('');
      setReviewTitle('');
      setReviewSuccessMsg('Thank you! Your review has been saved in IndexedDB.');
      showToast('Review submitted successfully!');
      setTimeout(() => {
        setIsReviewFormOpen(false);
        setReviewSuccessMsg('');
      }, 3500);
    } catch (err: any) {
      setReviewErrorMsg(err?.message || 'Failed to submit review. Please try again.');
    }
  };

  // Handle changes when productId changes
  React.useEffect(() => {
    setSelectedImage(product.primaryImage);
    setQuantity(1);
    setSelectedColor(product.colorOptions?.[0]?.name || product.color);
    setSelectedColorHex(product.colorOptions?.[0]?.hex || product.colorHex);
    setSelectedDesignId(product.designOptions?.[0]?.id || 'std');
  }, [product.id, product.primaryImage]);

  const activeDesign = product.designOptions?.find((d) => d.id === selectedDesignId);
  const additionalPrice = activeDesign?.additionalPrice || 0;
  const unitPrice = product.price + additionalPrice;
  const totalPrice = unitPrice * quantity;

  const relatedProducts = products
    .filter((p) => p.id !== product.id && (p.gender === product.gender || p.fabric === product.fabric))
    .slice(0, 3);

  const handleDirectWhatsAppBuy = () => {
    const message = [
      `Hello Niaz Cloth House,`,
      ``,
      `I would like to order this unstitched fabric from your catalog:`,
      `*Product:* ${product.title}`,
      `*Article Code:* ${product.id.toUpperCase()}`,
      `*Fabric:* ${product.fabric}`,
      `*Selected Color / Shade:* ${selectedColor}`,
      `*Selected Cut Style:* ${activeDesign?.name || 'Standard Cut'}`,
      `*Cut Length:* ${product.cutDetails.length}`,
      `*Quantity:* ${quantity} suit(s)`,
      `*Total Price:* ${formatPKR(totalPrice)}`,
      ``,
      `Please confirm stock availability and shipping details.`,
    ].join('\n');

    const text = encodeURIComponent(message);
    window.open(`https://wa.me/923346565636?text=${text}`, '_blank', 'noopener,noreferrer');
  };

  const handleShare = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(window.location.href);
      showToast('Product link copied to clipboard');
    }
  };

  const returnRoute = product.gender === 'Men' 
    ? (product.season === 'Winter' ? 'men-winter' : 'men-summer') 
    : (product.season === 'Winter' ? 'women-winter' : 'women-summer');

  const returnLabel = product.gender === 'Men'
    ? (product.season === 'Winter' ? "Men's Winter Suiting" : "Men's Summer Suiting")
    : (product.season === 'Winter' ? "Women's Winter Festive" : "Women's Summer Festive");

  const returnPath = `/collections/${returnRoute}`;

  const breadcrumbItems = [
    { name: 'Home', path: '/', page: 'home' as const },
    { name: 'Unstitched Suiting', path: '/shop', page: 'shop' as const },
    { name: returnLabel, path: returnPath, page: returnRoute as any },
    { name: product.title, path: `/product/${product.slug}` }
  ];

  return (
    <div className="w-full bg-[#060608] text-[#F7F4EE] pb-16">
      {/* Crawlable Breadcrumb Navigation */}
      <div className="border-b border-[#C5A059]/20 bg-[#0A0A0E]">
        <Breadcrumbs items={breadcrumbItems} />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        {/* Navigation Action Bar */}
        <div className="flex items-center justify-between pb-4 mb-8 border-b border-white/10">
          <a
            href={returnPath}
            onClick={(e) => {
              e.preventDefault();
              navigateTo(returnRoute);
            }}
            className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-[#E8D5A7]/75 hover:text-[#D4AF37] transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Return to {returnLabel}</span>
          </a>

          <button
            onClick={handleShare}
            className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-[#E8D5A7]/75 hover:text-[#D4AF37] transition-colors"
            title="Share this fabric"
          >
            <Share2 className="w-4 h-4" />
            <span>Share</span>
          </button>
        </div>

        {/* PDP Main Grid: Gallery Left + Contiguous Purchase Module Right */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14">
          {/* Gallery Module (Left Column: 3:4 Portrait Ratio) */}
          <div className="lg:col-span-7 space-y-4">
            {/* Gallery Header */}
            <div className="flex items-center justify-between pb-2 border-b border-[#C5A059]/25">
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold uppercase tracking-wider text-[#F7F4EE]">
                  Fabric Presentation
                </span>
                <span className="text-[11px] text-[#D4AF37] font-medium">
                  {product.gender === 'Women' ? '3-Piece Unstitched Ensemble' : "Men's Unstitched Suiting"}
                </span>
              </div>

              <span className="text-[11px] font-sans text-[#F7F4EE]/45 hidden sm:inline">
                Paris Bazaar Atelier Photography
              </span>
            </div>

            {/* Clear High-Resolution Photo Display */}
            <div className="aspect-[3/4] w-full overflow-hidden bg-[#111115] border border-[#C5A059]/25 relative group">
              <img
                src={selectedImage}
                alt={`${product.title} - ${product.fabric} unstitched suit fabric in ${selectedColor}`}
                width={800}
                height={1067}
                loading="eager"
                fetchPriority="high"
                decoding="sync"
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover object-center transition-transform duration-500 group-hover:scale-105"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = '/images/shahi_hero_banner.jpg';
                }}
              />
              {product.weightGrade && (
                <div className="absolute top-4 left-4 bg-[#060608]/90 border border-[#D4AF37]/50 text-[#D4AF37] text-[10px] font-sans tracking-widest uppercase px-3 py-1 font-semibold">
                  {product.weightGrade}
                </div>
              )}
            </div>

            {/* Thumbnail Selectors */}
            {product.galleryImages.length > 1 && (
              <div className="flex items-center gap-2.5 sm:gap-3 overflow-x-auto pb-1 scrollbar-none">
                {product.galleryImages.map((img, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setSelectedImage(img)}
                    aria-label={`Select fabric gallery view ${idx + 1} for ${product.title}`}
                    className={`aspect-[4/3] w-20 sm:w-24 shrink-0 overflow-hidden border-2 transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#D4AF37] ${
                      selectedImage === img
                        ? 'border-[#D4AF37] ring-1 ring-[#D4AF37]'
                        : 'border-white/15 opacity-65 hover:opacity-100'
                    }`}
                  >
                    <img
                      src={img}
                      alt={`${product.title} unstitched texture presentation view ${idx + 1}`}
                      width={100}
                      height={75}
                      referrerPolicy="no-referrer"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = '/images/shahi_hero_banner.jpg';
                      }}
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            )}

            {/* Fabric Purity Verification Callout */}
            <div className="p-4 bg-[#111115] border border-[#C5A059]/25 flex items-start gap-3">
              <ShieldCheck className="w-5 h-5 text-[#D4AF37] shrink-0 mt-0.5" />
              <div className="text-xs text-[#F7F4EE]/80 leading-relaxed">
                <strong className="text-[#D4AF37]">Niaz 1970 Purity Seal:</strong> Every unstitched bolt is inspected for thread density and fiber integrity. 100% natural sheen with zero polyester chemical adulteration.
              </div>
            </div>
          </div>

          {/* Contiguous Purchase Module (PDP Right Column) */}
          <div className="lg:col-span-5 space-y-6">
            <div className="border-b border-white/10 pb-6 space-y-3">
              {/* Unboxed Metadata */}
              <div className="flex items-center gap-2 text-xs font-sans font-medium text-[#C5A059] flex-wrap">
                {product.brand ? (
                  <span className="font-semibold uppercase tracking-wider text-[11px] bg-[#141419] border border-[#C5A059]/40 px-2.5 py-0.5 text-[#D4AF37]">
                    {product.brand}
                  </span>
                ) : (
                  <span>{product.gender}'s Unstitched</span>
                )}
                {product.craftType && (
                  <>
                    <span aria-hidden="true">·</span>
                    <span className="text-[#F7F4EE]/80">{product.craftType}</span>
                  </>
                )}
                <span aria-hidden="true">·</span>
                <span>{product.fabric}</span>
                <span aria-hidden="true">·</span>
                <span>{product.collection}</span>
                {product.season && (
                  <>
                    <span aria-hidden="true">·</span>
                    <span className="text-[#F7F4EE]/60">{product.season} Edition</span>
                  </>
                )}
              </div>

              {/* Title */}
              <h1 className="font-serif text-2xl sm:text-3xl font-normal text-[#F7F4EE] leading-snug">
                {product.title}
              </h1>

              {/* Weave Subtitle */}
              <p className="text-xs sm:text-sm text-[#F7F4EE]/65 font-sans">
                {product.subtitle}
              </p>

              {/* Price & Rating */}
              <div className="pt-2 flex flex-col sm:flex-row sm:items-baseline justify-between gap-3">
                <div className="flex flex-wrap items-baseline gap-2.5 sm:gap-3">
                  <span className="font-sans text-2xl sm:text-3xl font-semibold text-[#D4AF37] tabular-nums">
                    {formatPKR(unitPrice)}
                  </span>
                  {product.originalPrice && (
                    <span className="font-sans text-sm text-[#F7F4EE]/40 line-through tabular-nums">
                      {formatPKR(product.originalPrice + additionalPrice)}
                    </span>
                  )}
                  {additionalPrice > 0 && (
                    <span className="text-[11px] font-mono text-[#E8D5A7]">
                      (+{formatPKR(additionalPrice)} design upgrade)
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-3 flex-wrap">
                  <button
                    type="button"
                    onClick={() => {
                      setActiveTab('reviews');
                      const el = document.getElementById('product-tabs-section');
                      el?.scrollIntoView({ behavior: 'smooth' });
                    }}
                    className="flex items-center gap-1.5 text-xs text-[#D4AF37] hover:underline cursor-pointer group"
                    title="Read customer reviews"
                  >
                    <Star className="w-4 h-4 fill-[#D4AF37]" />
                    <span className="font-semibold tabular-nums">{stats.averageRating.toFixed(1)}</span>
                    <span className="text-[#F7F4EE]/60 group-hover:text-[#F7F4EE]">({stats.totalReviews} reviews)</span>
                  </button>
                  <span className="text-white/25 hidden sm:inline" aria-hidden="true">·</span>
                  <div className="flex items-center gap-1 text-xs font-semibold">
                    {product.inStock ? (
                      <span className="text-emerald-400 flex items-center gap-1">
                        <Check className="w-3.5 h-3.5" />
                        <span>In Stock (Ready to Dispatch)</span>
                      </span>
                    ) : (
                      <span className="text-red-400 font-medium">Temporarily Out of Stock</span>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Dynamic Presentation: Clear Parts (Dupatta, Kameez, Shalwar) for Women, Pure Color for Men */}
            {product.gender === 'Women' ? (
              <div className="space-y-5 pb-5 border-b border-white/10">
                {product.colorOptions && product.colorOptions.length > 0 && (
                  <div className="space-y-2.5">
                    <div className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-1.5 font-semibold uppercase tracking-wider text-[#E8D5A7]">
                        <Palette className="w-3.5 h-3.5 text-[#D4AF37]" />
                        <span>Suit Colour / Shade:</span>
                      </div>
                      <span className="font-semibold text-[#D4AF37]">{selectedColor}</span>
                    </div>

                    <div className="flex items-center gap-2 flex-wrap">
                      {product.colorOptions.map((opt) => {
                        const isSelected = selectedColor === opt.name;
                        return (
                          <button
                            key={opt.name}
                            type="button"
                            onClick={() => {
                              setSelectedColor(opt.name);
                              setSelectedColorHex(opt.hex);
                            }}
                            className={`flex items-center gap-2 px-3 py-2 border text-xs transition-all ${
                              isSelected
                                ? 'border-[#D4AF37] bg-[#D4AF37]/15 text-[#F7F4EE] font-semibold'
                                : 'border-white/15 bg-[#111115] text-[#F7F4EE]/80 hover:border-[#C5A059]/60'
                            }`}
                            title={opt.previewLabel || opt.name}
                          >
                            <span
                              className="w-4 h-4 rounded-full border border-white/30 shrink-0 shadow-xs"
                              style={{ backgroundColor: opt.hex }}
                            />
                            <span>{opt.name}</span>
                            {isSelected && <Check className="w-3 h-3 text-[#D4AF37]" />}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Women's Unstitched Suit Parts Breakdown */}
                <div className="space-y-3 pt-3 border-t border-white/10">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-[#F7F4EE]">
                      <Layers className="w-4 h-4 text-[#D4AF37]" />
                      <span>3-Piece Suit Parts Breakdown:</span>
                    </div>
                    <span className="text-[11px] text-[#C5A059] font-medium">Unstitched Fabric Cuts</span>
                  </div>

                  {/* Part Filter Tabs */}
                  <div className="flex items-center gap-1 bg-[#111115] border border-white/10 p-1 text-[11px] font-sans font-medium overflow-x-auto">
                    <button
                      type="button"
                      onClick={() => setSelectedPartTab('all')}
                      className={`px-2.5 py-1 transition-colors whitespace-nowrap ${
                        selectedPartTab === 'all'
                          ? 'bg-[#D4AF37] text-[#060608] font-semibold'
                          : 'text-[#F7F4EE]/70 hover:text-[#F7F4EE]'
                      }`}
                    >
                      All Parts (3-Piece)
                    </button>
                    <button
                      type="button"
                      onClick={() => setSelectedPartTab('kameez')}
                      className={`px-2.5 py-1 transition-colors whitespace-nowrap ${
                        selectedPartTab === 'kameez'
                          ? 'bg-[#D4AF37] text-[#060608] font-semibold'
                          : 'text-[#F7F4EE]/70 hover:text-[#F7F4EE]'
                      }`}
                    >
                      Kameez (Shirt)
                    </button>
                    <button
                      type="button"
                      onClick={() => setSelectedPartTab('dupatta')}
                      className={`px-2.5 py-1 transition-colors whitespace-nowrap ${
                        selectedPartTab === 'dupatta'
                          ? 'bg-[#D4AF37] text-[#060608] font-semibold'
                          : 'text-[#F7F4EE]/70 hover:text-[#F7F4EE]'
                      }`}
                    >
                      Dupatta (Shawl)
                    </button>
                    <button
                      type="button"
                      onClick={() => setSelectedPartTab('shalwar')}
                      className={`px-2.5 py-1 transition-colors whitespace-nowrap ${
                        selectedPartTab === 'shalwar'
                          ? 'bg-[#D4AF37] text-[#060608] font-semibold'
                          : 'text-[#F7F4EE]/70 hover:text-[#F7F4EE]'
                      }`}
                    >
                      Shalwar (Trouser)
                    </button>
                  </div>

                  {/* Suit Parts Display Cards */}
                  <div className="space-y-2 text-xs">
                    {(selectedPartTab === 'all' || selectedPartTab === 'kameez') && (
                      <div className="p-3 bg-[#111115] border border-white/10 hover:border-[#C5A059]/45 transition-all">
                        <div className="flex items-center justify-between pb-1 border-b border-white/10">
                          <div className="flex items-center gap-1.5 font-semibold text-[#F7F4EE]">
                            <Scissors className="w-3.5 h-3.5 text-[#D4AF37]" />
                            <span>1. Kameez (Shirt / Kurta)</span>
                          </div>
                          <span className="font-mono text-[11px] font-semibold text-[#D4AF37] bg-[#060608] px-2 py-0.5 border border-[#C5A059]/30">
                            3.0m - 3.2m Cut
                          </span>
                        </div>
                        <p className="text-[11px] text-[#F7F4EE]/70 mt-1.5 leading-relaxed">
                          {product.craftType === 'Embroidery'
                            ? 'Delicate resham needlework on front shirt panel, with matching back and full sleeves cut. Includes neck/gala & daman borders.'
                            : 'High-definition digital floral & geometric print on fine combed lawn, featuring separate front, back, and sleeves.'}
                        </p>
                        <div className="mt-1.5 flex items-center justify-between text-[10px] text-[#F7F4EE]/55">
                          <span>Fabric: {product.fabric}</span>
                          <span>Width: 42"-44" Arz</span>
                        </div>
                      </div>
                    )}

                    {(selectedPartTab === 'all' || selectedPartTab === 'dupatta') && (
                      <div className="p-3 bg-[#111115] border border-white/10 hover:border-[#C5A059]/45 transition-all">
                        <div className="flex items-center justify-between pb-1 border-b border-white/10">
                          <div className="flex items-center gap-1.5 font-semibold text-[#F7F4EE]">
                            <Sparkles className="w-3.5 h-3.5 text-[#D4AF37]" />
                            <span>2. Dupatta (Draped Shawl)</span>
                          </div>
                          <span className="font-mono text-[11px] font-semibold text-[#D4AF37] bg-[#060608] px-2 py-0.5 border border-[#C5A059]/30">
                            2.5m Standard Cut
                          </span>
                        </div>
                        <p className="text-[11px] text-[#F7F4EE]/70 mt-1.5 leading-relaxed">
                          {product.fabric.includes('Chiffon')
                            ? 'Pure crinkle chiffon with 4-sided finished borders, lightweight drape, and soft airy fall.'
                            : product.fabric.includes('Silk')
                            ? 'Digital luxury silk dupatta with vibrant botanical borders and natural sheen.'
                            : 'Lightweight summer voile / lawn dupatta with coordinated border prints.'}
                        </p>
                        <div className="mt-1.5 flex items-center justify-between text-[10px] text-[#F7F4EE]/55">
                          <span>Style: Draped Fluid Fall</span>
                          <span>Width: 40"-42" Standard</span>
                        </div>
                      </div>
                    )}

                    {(selectedPartTab === 'all' || selectedPartTab === 'shalwar') && (
                      <div className="p-3 bg-[#111115] border border-white/10 hover:border-[#C5A059]/45 transition-all">
                        <div className="flex items-center justify-between pb-1 border-b border-white/10">
                          <div className="flex items-center gap-1.5 font-semibold text-[#F7F4EE]">
                            <Ruler className="w-3.5 h-3.5 text-[#D4AF37]" />
                            <span>3. Shalwar (Trouser / Bottom)</span>
                          </div>
                          <span className="font-mono text-[11px] font-semibold text-[#D4AF37] bg-[#060608] px-2 py-0.5 border border-[#C5A059]/30">
                            2.5m Dyed Cut
                          </span>
                        </div>
                        <p className="text-[11px] text-[#F7F4EE]/70 mt-1.5 leading-relaxed">
                          Solid dyed premium cambric cotton fabric matched to the ensemble palette. Pre-shrunk and suitable for classic shalwar, culottes, or tailored cigarette trousers.
                        </p>
                        <div className="mt-1.5 flex items-center justify-between text-[10px] text-[#F7F4EE]/55">
                          <span>Fabric: Dyed Cambric Cotton</span>
                          <span>Width: 54" Double Width</span>
                        </div>
                      </div>
                    )}

                    {product.cutDetails.suitPieces && product.cutDetails.suitPieces.some(p => p.toLowerCase().includes('border') || p.toLowerCase().includes('patch')) && (
                      <div className="p-2.5 bg-[#111115] border border-white/10 text-[11px] text-[#F7F4EE]/80">
                        <strong className="text-[#D4AF37] block mb-1">Included Borders & Embellishments:</strong>
                        <ul className="list-disc list-inside space-y-0.5 text-[#F7F4EE]/70">
                          {product.cutDetails.suitPieces
                            .filter(p => p.toLowerCase().includes('border') || p.toLowerCase().includes('patch'))
                            .map((p, i) => (
                              <li key={i}>{p}</li>
                            ))}
                        </ul>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-5 pb-5 border-b border-white/10">
                {product.colorOptions && product.colorOptions.length > 0 && (
                  <div className="space-y-3">
                    <div className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-1.5 font-semibold uppercase tracking-wider text-[#E8D5A7]">
                        <Palette className="w-4 h-4 text-[#D4AF37]" />
                        <span>Fabric Colour & Shade:</span>
                      </div>
                      <span className="font-semibold text-[#D4AF37] text-xs">{selectedColor}</span>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                      {product.colorOptions.map((opt) => {
                        const isSelected = selectedColor === opt.name;
                        return (
                          <button
                            key={opt.name}
                            type="button"
                            onClick={() => {
                              setSelectedColor(opt.name);
                              setSelectedColorHex(opt.hex);
                            }}
                            className={`flex items-center gap-2.5 p-2.5 border text-left transition-all ${
                              isSelected
                                ? 'border-[#D4AF37] bg-[#D4AF37]/15 ring-1 ring-[#D4AF37]'
                                : 'border-white/15 bg-[#111115] hover:border-[#C5A059]/60'
                            }`}
                          >
                            <span
                              className="w-5 h-5 rounded-full border border-white/30 shrink-0 shadow-inner flex items-center justify-center"
                              style={{ backgroundColor: opt.hex }}
                            >
                              {isSelected && <Check className="w-3 h-3 text-white drop-shadow-sm" />}
                            </span>
                            <div className="min-w-0 flex-1">
                              <span className="block text-xs font-semibold text-[#F7F4EE] truncate leading-tight">
                                {opt.name}
                              </span>
                              {opt.previewLabel && (
                                <span className="block text-[10px] text-[#F7F4EE]/55 truncate">
                                  {opt.previewLabel}
                                </span>
                              )}
                            </div>
                          </button>
                        );
                      })}
                    </div>

                    <div className="p-3 bg-[#111115] border border-white/10 flex items-center gap-3">
                      <span
                        className="w-8 h-8 rounded-full border-2 border-[#D4AF37]/40 shadow-md shrink-0"
                        style={{ backgroundColor: selectedColorHex }}
                      />
                      <div className="text-xs text-[#F7F4EE]/80">
                        <strong className="text-[#D4AF37] block">Selected Shade: {selectedColor}</strong>
                        <span className="text-[11px] text-[#F7F4EE]/60">
                          100% Vat-Dyed Reactive Color: Guaranteed zero color bleed and color fastness across washes.
                        </span>
                      </div>
                    </div>
                  </div>
                )}

                <div className="p-4 bg-[#111115] border border-white/10 space-y-2.5 text-xs">
                  <div className="flex items-center justify-between pb-2 border-b border-white/10">
                    <div className="flex items-center gap-1.5 font-semibold uppercase tracking-wider text-[#F7F4EE]">
                      <Ruler className="w-4 h-4 text-[#D4AF37]" />
                      <span>Men's Suiting Cut & Yardage:</span>
                    </div>
                    <span className="font-mono text-xs font-semibold text-[#D4AF37]">{product.cutDetails.length}</span>
                  </div>

                  <div className="grid grid-cols-2 gap-3 text-[11px] pt-1">
                    <div>
                      <span className="text-[#F7F4EE]/55 block">Fabric Width (Bada Arz):</span>
                      <strong className="text-[#F7F4EE] font-semibold">{product.cutDetails.width}</strong>
                    </div>
                    <div>
                      <span className="text-[#F7F4EE]/55 block">Weave & Texture:</span>
                      <strong className="text-[#F7F4EE] font-semibold">{product.weaveType || product.fabric}</strong>
                    </div>
                    <div>
                      <span className="text-[#F7F4EE]/55 block">Fabric Weight:</span>
                      <strong className="text-[#F7F4EE] font-semibold">{product.fabricWeight || 'Medium Weight'}</strong>
                    </div>
                    <div>
                      <span className="text-[#F7F4EE]/55 block">Thread Quality:</span>
                      <strong className="text-[#F7F4EE] font-semibold">{product.threadCount || 'High Count Master Grade'}</strong>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-white/10 text-[11px] text-[#F7F4EE]/70">
                    <strong className="text-[#D4AF37]">Continuous Bolt:</strong> Standard 4.5m cut provides ample yardage for full Shalwar Kameez suit with collar, cuffs, placket facings, and matching trouser.
                  </div>
                </div>
              </div>
            )}

            {/* Design & Cut Style Options */}
            {product.designOptions && product.designOptions.length > 0 && (
              <div className="space-y-2.5 pb-4 border-b border-white/10">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold uppercase tracking-wider text-[#E8D5A7]">
                    Design & Cut Style:
                  </span>
                  <span className="text-[11px] text-[#F7F4EE]/55">
                    {product.designOptions.length} Options
                  </span>
                </div>

                <div className="space-y-2">
                  {product.designOptions.map((design) => {
                    const isSelected = selectedDesignId === design.id;
                    return (
                      <button
                        key={design.id}
                        type="button"
                        onClick={() => setSelectedDesignId(design.id)}
                        className={`w-full text-left p-3 border transition-all ${
                          isSelected
                            ? 'border-[#D4AF37] bg-[#D4AF37]/15 ring-1 ring-[#D4AF37]'
                            : 'border-white/15 bg-[#111115] hover:border-[#C5A059]/60'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-semibold text-xs text-[#F7F4EE]">
                            {design.name}
                          </span>
                          {design.additionalPrice ? (
                            <span className="text-[11px] font-mono font-semibold text-[#D4AF37]">
                              +{formatPKR(design.additionalPrice)}
                            </span>
                          ) : (
                            <span className="text-[10px] text-[#F7F4EE]/50 font-medium uppercase tracking-wider">
                              Included
                            </span>
                          )}
                        </div>
                        <p className="text-[11px] text-[#F7F4EE]/65 mt-1 leading-normal font-sans">
                          {design.description}
                        </p>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Quantity Selector & Purchase CTAs */}
            <div className="space-y-4 pt-2">
              <div className="flex items-center gap-4">
                <span className="text-xs font-semibold text-[#E8D5A7]">Quantity (Suits):</span>
                <div className="flex items-center border border-[#C5A059]/40 bg-[#111115]">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="px-3 py-1.5 text-sm hover:bg-white/10 text-[#F7F4EE] transition-colors"
                    aria-label="Decrease quantity"
                  >
                    -
                  </button>
                  <span className="px-4 text-xs font-mono font-bold tabular-nums text-[#F7F4EE]">
                    {quantity}
                  </span>
                  <button
                    onClick={() => setQuantity(quantity + 1)}
                    className="px-3 py-1.5 text-sm hover:bg-white/10 text-[#F7F4EE] transition-colors"
                    aria-label="Increase quantity"
                  >
                    +
                  </button>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="space-y-3">
                <button
                  onClick={() =>
                    addToCart(product, quantity, {
                      selectedColor,
                      selectedColorHex,
                      selectedDesign: activeDesign?.name || 'Standard Cut',
                    })
                  }
                  className="w-full py-4 px-6 bg-transparent border border-[#D4AF37] hover:bg-[#D4AF37] text-[#E8D5A7] hover:text-[#060608] text-xs font-semibold tracking-widest uppercase transition-all flex items-center justify-center gap-2 active:scale-98"
                >
                  <ShoppingBag className="w-4 h-4" />
                  <span>
                    Add to Cart · {formatPKR(totalPrice)}
                  </span>
                </button>

                <button
                  onClick={handleDirectWhatsAppBuy}
                  className="w-full py-3.5 px-6 bg-[#25D366] hover:bg-[#20BD5A] text-black text-xs font-bold tracking-wider uppercase transition-all flex items-center justify-center gap-2 shadow-sm"
                >
                  <MessageCircle className="w-4 h-4" />
                  <span>Order via WhatsApp (0334-6565636)</span>
                </button>
              </div>

              <div className="pt-2 flex items-center justify-between text-[11px] text-[#F7F4EE]/60">
                <div className="flex items-center gap-1.5">
                  <Truck className="w-3.5 h-3.5 text-[#D4AF37]" />
                  <span>Nationwide Express COD Dispatch</span>
                </div>
                <span>Free Shipping over {formatPKR(storeSettings?.freeShippingThreshold ?? 5000)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Tabbed Technical & Care Specifications */}
        <div id="product-tabs-section" className="mt-16 sm:mt-20 border-t border-white/10 pt-12">
          <div className="flex border-b border-white/10 gap-4 sm:gap-8 overflow-x-auto scrollbar-none pb-0.5">
            <button
              onClick={() => setActiveTab('care')}
              className={`pb-3 text-xs sm:text-sm font-semibold tracking-wider uppercase whitespace-nowrap shrink-0 transition-colors border-b-2 ${
                activeTab === 'care'
                  ? 'border-[#D4AF37] text-[#D4AF37]'
                  : 'border-transparent text-[#F7F4EE]/55 hover:text-[#F7F4EE]'
              }`}
            >
              Fabric Details & Care
            </button>
            <button
              onClick={() => setActiveTab('guide')}
              className={`pb-3 text-xs sm:text-sm font-semibold tracking-wider uppercase whitespace-nowrap shrink-0 transition-colors border-b-2 ${
                activeTab === 'guide'
                  ? 'border-[#D4AF37] text-[#D4AF37]'
                  : 'border-transparent text-[#F7F4EE]/55 hover:text-[#F7F4EE]'
              }`}
            >
              Suiting Cut & Dimensions
            </button>
            <button
              onClick={() => setActiveTab('heritage')}
              className={`pb-3 text-xs sm:text-sm font-semibold tracking-wider uppercase whitespace-nowrap shrink-0 transition-colors border-b-2 ${
                activeTab === 'heritage'
                  ? 'border-[#D4AF37] text-[#D4AF37]'
                  : 'border-transparent text-[#F7F4EE]/55 hover:text-[#F7F4EE]'
              }`}
            >
              Niaz Cloth House Guarantee
            </button>
            <button
              onClick={() => setActiveTab('reviews')}
              className={`pb-3 text-xs sm:text-sm font-semibold tracking-wider uppercase whitespace-nowrap shrink-0 transition-colors border-b-2 ${
                activeTab === 'reviews'
                  ? 'border-[#D4AF37] text-[#D4AF37]'
                  : 'border-transparent text-[#F7F4EE]/55 hover:text-[#F7F4EE]'
              }`}
            >
              Customer Reviews ({stats.totalReviews})
            </button>
          </div>

          <div className="py-8">
            {activeTab === 'care' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl">
                <div className="p-4 bg-[#111115] border border-white/10">
                  <h4 className="font-serif text-sm font-semibold text-[#D4AF37]">
                    Washing Instructions
                  </h4>
                  <p className="text-xs text-[#F7F4EE]/75 mt-1 leading-relaxed">
                    {product.care.washing}
                  </p>
                </div>

                <div className="p-4 bg-[#111115] border border-white/10">
                  <h4 className="font-serif text-sm font-semibold text-[#D4AF37]">
                    Shrinkage Allowance
                  </h4>
                  <p className="text-xs text-[#F7F4EE]/75 mt-1 leading-relaxed">
                    {product.care.shrinkage}
                  </p>
                </div>

                <div className="p-4 bg-[#111115] border border-white/10">
                  <h4 className="font-serif text-sm font-semibold text-[#D4AF37]">
                    Ironing & Press Guidelines
                  </h4>
                  <p className="text-xs text-[#F7F4EE]/75 mt-1 leading-relaxed">
                    {product.care.ironing}
                  </p>
                </div>

                <div className="p-4 bg-[#111115] border border-white/10">
                  <h4 className="font-serif text-sm font-semibold text-[#D4AF37]">
                    Long-Term Preservation
                  </h4>
                  <p className="text-xs text-[#F7F4EE]/75 mt-1 leading-relaxed">
                    {product.care.preservation}
                  </p>
                </div>
              </div>
            )}

            {activeTab === 'guide' && (
              <div className="max-w-3xl space-y-4 text-xs text-[#F7F4EE]/80 leading-relaxed">
                <div className="p-5 bg-[#111115] border border-white/10 space-y-2">
                  <h4 className="font-serif text-base font-semibold text-[#D4AF37]">
                    Fabric Cut & Yardage Guide for Unstitched Suiting
                  </h4>
                  <p>
                    All Niaz unstitched men’s fabrics are provided in genuine 4.5-meter lengths on generous double width (54"). This provides ample fabric for a standard or full-cut shalwar kameez including cuffs, ban collar, and pockets for gentlemen up to 6 feet 4 inches.
                  </p>
                  <p>
                    For ladies' 3-piece sets, our 80s lawn and chiffon shirts include 3.2 meters of unstitched fabric to allow flared kurtas, kalidar panels, or long shirt styles without piecing.
                  </p>
                  <p className="text-[#C5A059] font-medium pt-1">
                    * Please note: Niaz Cloth House provides authentic unstitched cuts and seasonal ensembles from Paris Bazaar, Rawalpindi.
                  </p>
                </div>
              </div>
            )}

            {activeTab === 'heritage' && (
              <div className="max-w-3xl space-y-4 text-xs text-[#F7F4EE]/80 leading-relaxed">
                <div className="p-5 bg-[#111115] border border-white/10 space-y-2">
                  <h4 className="font-serif text-base font-semibold text-[#D4AF37]">
                    Archival Provenance
                  </h4>
                  <p>{product.heritageNotes}</p>
                  <p>
                    Established in 1970 by Haji Sh. Niaz Ahmed and faithfully preserved today by his sons with the shop name unchanged, our founding pledge remains: authentic unstitched textiles, certified yarn density, and pure Pakistani heritage craftsmanship.
                  </p>
                </div>
              </div>
            )}

            {activeTab === 'reviews' && (
              <div className="space-y-8 max-w-4xl">
                <div className="p-6 bg-[#111115] border border-[#C5A059]/25">
                  <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
                    <div className="md:col-span-4 flex flex-col items-center md:items-start text-center md:text-left border-b md:border-b-0 md:border-r border-white/10 pb-6 md:pb-0 md:pr-6">
                      <div className="flex items-baseline gap-2">
                        <span className="font-mono text-4xl sm:text-5xl font-bold text-[#D4AF37] tabular-nums">
                          {stats.averageRating.toFixed(1)}
                        </span>
                        <span className="text-xs text-[#F7F4EE]/50 font-mono">/ 5.0</span>
                      </div>
                      <div className="flex items-center gap-1 text-[#D4AF37] my-2">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <Star
                            key={star}
                            className={`w-4 h-4 ${
                              star <= Math.round(stats.averageRating)
                                ? 'fill-[#D4AF37] text-[#D4AF37]'
                                : 'text-white/20'
                            }`}
                          />
                        ))}
                      </div>
                      <p className="text-xs text-[#F7F4EE]/70 font-sans">
                        Based on <strong className="text-[#F7F4EE]">{stats.totalReviews}</strong> customer reviews
                      </p>
                      <div className="mt-3 flex items-center gap-1.5 text-[11px] text-emerald-400 bg-emerald-500/10 px-2.5 py-1 border border-emerald-500/25">
                        <ShieldCheck className="w-3.5 h-3.5 shrink-0" />
                        <span>Verified Customer Reviews</span>
                      </div>
                    </div>

                    <div className="md:col-span-5 space-y-2">
                      {([5, 4, 3, 2, 1] as const).map((star) => {
                        const count = stats.distribution[star] || 0;
                        const pct = stats.totalReviews > 0 ? Math.round((count / stats.totalReviews) * 100) : 0;
                        return (
                          <button
                            key={star}
                            type="button"
                            onClick={() => setSelectedStarFilter(selectedStarFilter === star ? 'all' : star)}
                            className="w-full flex items-center gap-2.5 text-xs text-left group hover:opacity-85"
                          >
                            <span className="w-12 text-[#F7F4EE]/75 font-medium shrink-0 group-hover:text-[#D4AF37]">
                              {star} Star{star > 1 ? 's' : ''}
                            </span>
                            <div className="flex-1 h-2 bg-white/10 rounded-full overflow-hidden">
                              <div
                                className="h-full bg-[#D4AF37] transition-all duration-300"
                                style={{ width: `${pct}%` }}
                              />
                            </div>
                            <span className="w-8 text-right font-mono text-[11px] text-[#F7F4EE]/50 tabular-nums">
                              {count}
                            </span>
                          </button>
                        );
                      })}
                    </div>

                    <div className="md:col-span-3 flex flex-col justify-center items-center md:items-end text-center md:text-right border-t md:border-t-0 border-white/10 pt-6 md:pt-0">
                      <p className="text-xs text-[#F7F4EE]/65 mb-3 max-w-[200px]">
                        Bought this fabric from us? Share your experience with fellow patrons.
                      </p>
                      <button
                        type="button"
                        onClick={() => {
                          setIsReviewFormOpen(!isReviewFormOpen);
                          setReviewErrorMsg('');
                          setReviewSuccessMsg('');
                        }}
                        className="inline-flex items-center gap-2 px-4 py-2.5 bg-[#D4AF37] hover:bg-[#E5C158] text-[#060608] text-xs font-semibold tracking-wide transition-colors"
                      >
                        <PenSquare className="w-4 h-4" />
                        <span>{isReviewFormOpen ? 'Close Review Form' : 'Write a Review'}</span>
                      </button>
                    </div>
                  </div>
                </div>

                {isReviewFormOpen && (
                  <div className="p-6 bg-[#111115] border border-[#D4AF37]/40 shadow-sm transition-all animate-fadeIn">
                    <div className="flex items-center justify-between pb-3 border-b border-white/10">
                      <div>
                        <h3 className="font-serif text-base font-semibold text-[#D4AF37]">
                          Write Your Customer Review
                        </h3>
                        <p className="text-xs text-[#F7F4EE]/60 mt-0.5">
                          Share your feedback on fabric texture, stitching fall, and wash quality.
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => setIsReviewFormOpen(false)}
                        className="text-[#F7F4EE]/50 hover:text-[#F7F4EE] p-1"
                        aria-label="Close review form"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>

                    <form onSubmit={handleSubmitReview} className="mt-5 space-y-4">
                      <div>
                        <label className="block text-xs font-semibold text-[#E8D5A7] mb-1.5">
                          Overall Rating (Click to Select 1 to 5 Stars) *
                        </label>
                        <div className="flex items-center gap-1.5 flex-wrap">
                          {[1, 2, 3, 4, 5].map((star) => {
                            const activeScore = reviewHoverRating || reviewRating;
                            const isFilled = star <= activeScore;
                            return (
                              <button
                                key={star}
                                type="button"
                                onClick={() => setReviewRating(star)}
                                onMouseEnter={() => setReviewHoverRating(star)}
                                onMouseLeave={() => setReviewHoverRating(0)}
                                className="p-1 transition-transform hover:scale-110 focus:outline-none"
                                aria-label={`Rate ${star} star`}
                              >
                                <Star
                                  className={`w-6 h-6 ${
                                    isFilled ? 'fill-[#D4AF37] text-[#D4AF37]' : 'text-white/25'
                                  }`}
                                />
                              </button>
                            );
                          })}
                          <span className="text-xs font-semibold text-[#D4AF37] ml-2 font-sans">
                            {(reviewHoverRating || reviewRating) === 5 && '5 Stars - Outstanding Quality & Drape'}
                            {(reviewHoverRating || reviewRating) === 4 && '4 Stars - Very Good Fabric'}
                            {(reviewHoverRating || reviewRating) === 3 && '3 Stars - Standard Fabric'}
                            {(reviewHoverRating || reviewRating) === 2 && '2 Stars - Below Expectations'}
                            {(reviewHoverRating || reviewRating) === 1 && '1 Star - Needs Improvement'}
                          </span>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-xs font-semibold text-[#E8D5A7] mb-1">
                            Your Name *
                          </label>
                          <input
                            type="text"
                            required
                            placeholder="e.g. Tariq Mehmood"
                            value={reviewName}
                            onChange={(e) => setReviewName(e.target.value)}
                            className="w-full px-3 py-2 text-xs bg-[#060608] border border-white/20 text-[#F7F4EE] focus:border-[#D4AF37] focus:outline-none"
                          />
                        </div>

                        <div>
                          <label className="block text-xs font-semibold text-[#E8D5A7] mb-1">
                            City *
                          </label>
                          <input
                            type="text"
                            required
                            placeholder="e.g. Rawalpindi, Lahore, Islamabad, Karachi"
                            value={reviewCity}
                            onChange={(e) => setReviewCity(e.target.value)}
                            className="w-full px-3 py-2 text-xs bg-[#060608] border border-white/20 text-[#F7F4EE] focus:border-[#D4AF37] focus:outline-none"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-[#E8D5A7] mb-1">
                          Review Headline (Optional)
                        </label>
                        <input
                          type="text"
                          placeholder="e.g. Pure Boski - excellent shine, weight, and smooth fall"
                          value={reviewTitle}
                          onChange={(e) => setReviewTitle(e.target.value)}
                          className="w-full px-3 py-2 text-xs bg-[#060608] border border-white/20 text-[#F7F4EE] focus:border-[#D4AF37] focus:outline-none"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-[#E8D5A7] mb-1">
                          Fabric Review & Tailoring Feedback *
                        </label>
                        <textarea
                          required
                          rows={4}
                          placeholder="Tell fellow buyers about the fabric handfeel, wash results, color stability, drape, or stitching experience..."
                          value={reviewComment}
                          onChange={(e) => setReviewComment(e.target.value)}
                          className="w-full px-3 py-2 text-xs bg-[#060608] border border-white/20 text-[#F7F4EE] focus:border-[#D4AF37] focus:outline-none leading-relaxed"
                        />
                      </div>

                      {reviewErrorMsg && (
                        <div className="p-3 bg-red-500/10 border border-red-500/30 text-red-400 text-xs flex items-center gap-2">
                          <X className="w-4 h-4 shrink-0" />
                          <span>{reviewErrorMsg}</span>
                        </div>
                      )}

                      {reviewSuccessMsg && (
                        <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs flex items-center gap-2">
                          <CheckCircle2 className="w-4 h-4 shrink-0" />
                          <span>{reviewSuccessMsg}</span>
                        </div>
                      )}

                      <div className="flex items-center gap-3 pt-2">
                        <button
                          type="submit"
                          disabled={isSubmittingReview}
                          className="px-5 py-2.5 bg-[#D4AF37] hover:bg-[#E5C158] text-[#060608] text-xs font-semibold tracking-wide transition-colors disabled:opacity-50"
                        >
                          {isSubmittingReview ? 'Submitting...' : 'Submit Review'}
                        </button>
                        <button
                          type="button"
                          onClick={() => setIsReviewFormOpen(false)}
                          className="px-4 py-2.5 bg-transparent border border-white/20 text-xs text-[#F7F4EE]/75 hover:text-[#F7F4EE]"
                        >
                          Cancel
                        </button>
                      </div>
                    </form>
                  </div>
                )}

                <div className="flex flex-wrap items-center gap-2 pt-2 pb-1 border-b border-white/10">
                  <span className="text-xs font-medium text-[#F7F4EE]/60 flex items-center gap-1.5 mr-2">
                    <Filter className="w-3.5 h-3.5" />
                    <span>Filter:</span>
                  </span>
                  <button
                    type="button"
                    onClick={() => setSelectedStarFilter('all')}
                    className={`px-3 py-1.5 text-xs font-medium border transition-colors ${
                      selectedStarFilter === 'all'
                        ? 'bg-[#D4AF37] text-[#060608] border-[#D4AF37]'
                        : 'bg-[#111115] text-[#F7F4EE]/75 border-white/15 hover:border-[#C5A059]/60'
                    }`}
                  >
                    All ({stats.totalReviews})
                  </button>
                  {([5, 4, 3, 2, 1] as const).map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setSelectedStarFilter(star)}
                      className={`px-3 py-1.5 text-xs font-medium border transition-colors ${
                        selectedStarFilter === star
                          ? 'bg-[#D4AF37] text-[#060608] border-[#D4AF37]'
                          : 'bg-[#111115] text-[#F7F4EE]/75 border-white/15 hover:border-[#C5A059]/60'
                      }`}
                    >
                      {star} ★ ({stats.distribution[star] || 0})
                    </button>
                  ))}
                </div>

                <div className="space-y-4">
                  {reviews
                    .filter((r) => {
                      if (selectedStarFilter === 'all') return true;
                      return r.rating === selectedStarFilter;
                    })
                    .map((rev) => (
                      <div
                        key={rev.id}
                        className="p-5 bg-[#111115] border border-white/10 space-y-2.5"
                      >
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-semibold text-xs text-[#F7F4EE]">
                              {rev.authorName} {rev.authorCity && `· ${rev.authorCity}`}
                            </span>
                            {rev.verifiedBuyer && (
                              <span className="inline-flex items-center gap-1 text-[10px] font-medium text-emerald-400 bg-emerald-500/10 px-2 py-0.5 border border-emerald-500/25">
                                <CheckCircle2 className="w-3 h-3" />
                                <span>Verified Buyer</span>
                              </span>
                            )}
                          </div>
                          <span className="text-[11px] text-[#F7F4EE]/50 font-mono">
                            {new Date(rev.createdAt).toLocaleDateString('en-GB', {
                              day: 'numeric',
                              month: 'short',
                              year: 'numeric',
                            })}
                          </span>
                        </div>

                        <div className="flex items-center gap-2 flex-wrap">
                          <div className="flex items-center gap-0.5 text-[#D4AF37]">
                            {[1, 2, 3, 4, 5].map((star) => (
                              <Star
                                key={star}
                                className={`w-3.5 h-3.5 ${
                                  star <= rev.rating ? 'fill-[#D4AF37] text-[#D4AF37]' : 'text-white/20'
                                }`}
                              />
                            ))}
                          </div>
                          {rev.title && (
                            <h4 className="font-serif text-xs font-semibold text-[#E8D5A7]">
                              {rev.title}
                            </h4>
                          )}
                        </div>

                        <p className="text-xs text-[#F7F4EE]/80 leading-relaxed font-sans">
                          {rev.comment}
                        </p>
                      </div>
                    ))}

                  {reviews.filter((r) => {
                    if (selectedStarFilter === 'all') return true;
                    return r.rating === selectedStarFilter;
                  }).length === 0 && (
                    <div className="p-8 text-center bg-[#111115] border border-white/10 text-xs text-[#F7F4EE]/60">
                      No customer reviews found matching {selectedStarFilter} star rating.
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Related Fabrics */}
        {relatedProducts.length > 0 && (
          <div className="mt-16 pt-12 border-t border-white/10">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-8">
              <div>
                <h2 className="font-serif text-2xl font-normal text-[#D4AF37]">
                  Related Luxury Varieties
                </h2>
                <p className="text-xs text-[#F7F4EE]/60 font-sans mt-0.5">
                  Complementary {product.gender.toLowerCase()}'s fabrics from our 1970 archive
                </p>
              </div>
              <button
                onClick={() => navigateTo('shop')}
                className="text-xs font-semibold text-[#D4AF37] hover:underline self-start sm:self-auto"
              >
                View Full Collection →
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {relatedProducts.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
