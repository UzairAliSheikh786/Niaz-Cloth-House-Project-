import React, { useState } from 'react';
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
  Filter
} from 'lucide-react';
import { useShop, formatPKR } from '../context/ShopContext';
import { useNavigation } from '../context/NavigationContext';
import { useReviews } from '../context/ReviewContext';
import { useAuth } from '../context/AuthContext';
import { ProductCard } from '../components/ProductCard';
import { Breadcrumbs } from '../components/Breadcrumbs';

export const ProductDetailPage: React.FC = () => {
  const { products, addToCart, generateWhatsAppOrderUrl, showToast } = useShop();
  const { productId, navigateTo } = useNavigation();
  const { getReviewsForProduct, getProductStats, submitReview, isSubmittingReview } = useReviews();
  const { user } = useAuth();

  const product = products.find((p) => p.id === productId) || products[0];

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
      `Assalam-o-Alaikum Niaz Cloth House,`,
      ``,
      `I would like to order this unstitched fabric from your online catalog:`,
      `*Product:* ${product.title}`,
      `*Article Code:* ${product.id.toUpperCase()}`,
      `*Fabric:* ${product.fabric}`,
      `*Selected Color / Shade:* ${selectedColor}`,
      `*Selected Cut Style:* ${activeDesign?.name || 'Standard Cut'}`,
      `*Cut Length:* ${product.cutDetails.length}`,
      `*Quantity:* ${quantity} suit(s)`,
      `*Total Price:* ${formatPKR(totalPrice)}`,
      ``,
      `Please confirm stock availability and dispatch time for my city.`,
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
    <div className="w-full bg-[#FAF8F5] pb-14">
      {/* Crawlable Breadcrumb Navigation & Schema */}
      <div className="border-b border-[#E7E0D8] bg-[#F5EFEB]/50">
        <Breadcrumbs items={breadcrumbItems} />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6">
        {/* Navigation Action Bar */}
        <div className="flex items-center justify-between pb-4 mb-6 border-b border-[#E7E0D8]">
          <a
            href={returnPath}
            onClick={(e) => {
              e.preventDefault();
              navigateTo(returnRoute);
            }}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#8C4830] hover:text-[#703623] transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Return to {returnLabel}</span>
          </a>

          <button
            onClick={handleShare}
            className="inline-flex items-center gap-1.5 text-xs text-[#1C1917]/70 hover:text-[#1C1917] transition-colors"
            title="Share this fabric"
          >
            <Share2 className="w-4 h-4" />
            <span>Share Link</span>
          </button>
        </div>

        {/* PDP Main Grid: Gallery Left + Contiguous Purchase Module Right */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14">
          {/* Gallery Module (Left Column) */}
          <div className="lg:col-span-7 space-y-4">
            <div className="aspect-[4/3] w-full overflow-hidden bg-[#F2EDE7] border border-[#E7E0D8] relative group">
              <img
                src={selectedImage}
                alt={`${product.title} - ${product.fabric} unstitched suit fabric in ${selectedColor}`}
                width={800}
                height={600}
                loading="eager"
                fetchPriority="high"
                decoding="sync"
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover object-center transition-transform duration-500 group-hover:scale-105"
              />
              {product.weightGrade && (
                <div className="absolute top-4 left-4 bg-[#1C1917]/90 text-[#FAF8F5] text-xs font-sans tracking-widest uppercase px-3 py-1">
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
                    className={`aspect-[4/3] w-20 sm:w-24 shrink-0 overflow-hidden border-2 transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#8C4830] ${
                      selectedImage === img
                        ? 'border-[#8C4830] ring-1 ring-[#8C4830]'
                        : 'border-[#E7E0D8] opacity-70 hover:opacity-100'
                    }`}
                  >
                    <img
                      src={img}
                      alt={`${product.title} unstitched texture presentation view ${idx + 1}`}
                      width={100}
                      height={75}
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            )}

            {/* Fabric Purity Verification Callout */}
            <div className="p-4 bg-[#F5EFEB] border border-[#E7E0D8] flex items-start gap-3">
              <ShieldCheck className="w-5 h-5 text-[#8C4830] shrink-0 mt-0.5" />
              <div className="text-xs text-[#1C1917]/80 leading-relaxed">
                <strong className="text-[#1C1917]">Niaz 1977 Purity Seal:</strong> Every unstitched bolt is inspected for thread density and fiber integrity. 100% natural sheen with zero polyester chemical adulteration.
              </div>
            </div>
          </div>

          {/* Contiguous Purchase Module (PDP Right Column) */}
          <div className="lg:col-span-5 space-y-6">
            <div className="border-b border-[#E7E0D8] pb-6 space-y-3">
              {/* Unboxed Metadata */}
              <div className="flex items-center gap-2 text-xs font-sans font-semibold text-[#8C4830] flex-wrap">
                {product.brand ? (
                  <span className="font-bold uppercase tracking-wider text-[11px] bg-[#FAF8F5] border border-[#8C4830]/40 px-2 py-0.5 text-[#8C4830]">
                    {product.brand}
                  </span>
                ) : (
                  <span>{product.gender}'s Unstitched</span>
                )}
                {product.craftType && (
                  <>
                    <span aria-hidden="true">·</span>
                    <span className="text-[#1C1917]/85">{product.craftType}</span>
                  </>
                )}
                <span aria-hidden="true">·</span>
                <span>{product.fabric}</span>
                <span aria-hidden="true">·</span>
                <span>{product.collection}</span>
                {product.season && (
                  <>
                    <span aria-hidden="true">·</span>
                    <span className="text-[#1C1917]/70">{product.season} Edition</span>
                  </>
                )}
              </div>

              {/* Title */}
              <h1 className="font-serif text-2xl sm:text-3xl font-bold text-[#1C1917] leading-snug">
                {product.title}
              </h1>

              {/* Weave Subtitle */}
              <p className="text-xs sm:text-sm text-[#1C1917]/70 font-sans">
                {product.subtitle}
              </p>

              {/* Price & Rating */}
              <div className="pt-2 flex flex-col sm:flex-row sm:items-baseline justify-between gap-3">
                <div className="flex flex-wrap items-baseline gap-2.5 sm:gap-3">
                  <span className="font-mono text-2xl sm:text-3xl font-bold text-[#1C1917] tabular-nums">
                    {formatPKR(unitPrice)}
                  </span>
                  {product.originalPrice && (
                    <span className="font-mono text-sm text-[#1C1917]/40 line-through tabular-nums">
                      {formatPKR(product.originalPrice + additionalPrice)}
                    </span>
                  )}
                  {additionalPrice > 0 && (
                    <span className="text-[11px] font-mono text-[#8C4830]">
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
                    className="flex items-center gap-1.5 text-xs text-[#8C4830] hover:underline cursor-pointer group"
                    title="Read customer reviews"
                  >
                    <Star className="w-4 h-4 fill-[#8C4830]" />
                    <span className="font-semibold">{stats.averageRating.toFixed(1)}</span>
                    <span className="text-[#1C1917]/60 group-hover:text-[#1C1917]">({stats.totalReviews} reviews)</span>
                  </button>
                  <span className="text-[#1C1917]/30 hidden sm:inline" aria-hidden="true">·</span>
                  <div className="flex items-center gap-1 text-xs font-semibold">
                    {product.inStock ? (
                      <span className="text-emerald-700 flex items-center gap-1">
                        <Check className="w-3.5 h-3.5" />
                        <span>In Stock (Ready to Dispatch)</span>
                      </span>
                    ) : (
                      <span className="text-red-700 font-medium">Temporarily Out of Stock</span>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Choice 1: Select Article Color / Shade */}
            {product.colorOptions && product.colorOptions.length > 0 && (
              <div className="space-y-2.5 pb-4 border-b border-[#E7E0D8]">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold uppercase tracking-wider text-[#1C1917]">
                    Article Color / Shade:
                  </span>
                  <span className="font-semibold text-[#8C4830]">{selectedColor}</span>
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
                            ? 'border-[#8C4830] bg-[#FAF5EE] ring-1 ring-[#8C4830] text-[#1C1917] font-semibold'
                            : 'border-[#E7E0D8] bg-white text-[#1C1917]/75 hover:border-[#8C4830]/40'
                        }`}
                        title={opt.previewLabel || opt.name}
                      >
                        <span
                          className="w-3.5 h-3.5 rounded-full border border-black/20 shrink-0"
                          style={{ backgroundColor: opt.hex }}
                        />
                        <span>{opt.name}</span>
                        {isSelected && <Check className="w-3 h-3 text-[#8C4830]" />}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Choice 2: Select Design & Cut Style */}
            {product.designOptions && product.designOptions.length > 0 && (
              <div className="space-y-2.5 pb-4 border-b border-[#E7E0D8]">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold uppercase tracking-wider text-[#1C1917]">
                    Design & Cut Style:
                  </span>
                  <span className="text-[11px] text-[#1C1917]/60">
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
                            ? 'border-[#8C4830] bg-white ring-1 ring-[#8C4830]'
                            : 'border-[#E7E0D8] bg-[#FAF8F5] hover:bg-white'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-semibold text-xs text-[#1C1917]">
                            {design.name}
                          </span>
                          {design.additionalPrice ? (
                            <span className="text-[11px] font-mono font-bold text-[#8C4830]">
                              +{formatPKR(design.additionalPrice)}
                            </span>
                          ) : (
                            <span className="text-[10px] text-[#1C1917]/50 font-medium uppercase tracking-wider">
                              Included
                            </span>
                          )}
                        </div>
                        <p className="text-[11px] text-[#1C1917]/70 mt-1 leading-normal font-sans">
                          {design.description}
                        </p>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Suit & Cloth Specifications */}
            <div className="bg-white p-4 border border-[#E7E0D8] space-y-2 text-xs">
              <div className="flex justify-between items-center text-[#1C1917]">
                <span className="text-[#1C1917]/60">Suit Length (Cut):</span>
                <strong className="font-semibold">{product.cutDetails.length}</strong>
              </div>
              <div className="flex justify-between items-center text-[#1C1917]">
                <span className="text-[#1C1917]/60">Fabric Width (Arz):</span>
                <strong className="font-semibold">{product.cutDetails.width}</strong>
              </div>
              {product.weaveType && (
                <div className="flex justify-between items-center text-[#1C1917]">
                  <span className="text-[#1C1917]/60">Weave Style:</span>
                  <strong className="font-semibold">{product.weaveType}</strong>
                </div>
              )}
              {product.fabricWeight && (
                <div className="flex justify-between items-center text-[#1C1917]">
                  <span className="text-[#1C1917]/60">Fabric Weight:</span>
                  <strong className="font-semibold">{product.fabricWeight}</strong>
                </div>
              )}
              {product.threadCount && (
                <div className="flex justify-between items-center text-[#1C1917]">
                  <span className="text-[#1C1917]/60">Thread Quality:</span>
                  <strong className="font-semibold">{product.threadCount}</strong>
                </div>
              )}
              {product.cutDetails.suitPieces && (
                <div className="pt-2 border-t border-[#F2ECE5]">
                  <span className="text-[#1C1917]/60 block mb-1">Suit Pieces Included:</span>
                  <ul className="list-disc list-inside space-y-0.5 text-[#1C1917]/80 pl-1">
                    {product.cutDetails.suitPieces.map((piece, idx) => (
                      <li key={idx}>{piece}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            {/* Quantity Selector & Purchase CTAs */}
            <div className="space-y-4 pt-2">
              <div className="flex items-center gap-4">
                <span className="text-xs font-semibold text-[#1C1917]">Quantity (Suits):</span>
                <div className="flex items-center border border-[#E7E0D8] bg-white">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="px-3 py-1.5 text-sm hover:bg-[#F2ECE5] transition-colors"
                    aria-label="Decrease quantity"
                  >
                    -
                  </button>
                  <span className="px-4 text-xs font-mono font-bold tabular-nums">
                    {quantity}
                  </span>
                  <button
                    onClick={() => setQuantity(quantity + 1)}
                    className="px-3 py-1.5 text-sm hover:bg-[#F2ECE5] transition-colors"
                    aria-label="Increase quantity"
                  >
                    +
                  </button>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="space-y-2.5">
                <button
                  onClick={() =>
                    addToCart(product, quantity, {
                      selectedColor,
                      selectedColorHex,
                      selectedDesign: activeDesign?.name || 'Standard Cut',
                    })
                  }
                  className="w-full py-3.5 px-6 bg-[#8C4830] hover:bg-[#703623] text-white text-xs font-semibold tracking-wider uppercase transition-colors flex items-center justify-center gap-2 shadow-sm"
                >
                  <ShoppingBag className="w-4 h-4" />
                  <span>
                    Add to Shopping Bag ({formatPKR(totalPrice)})
                  </span>
                </button>

                <button
                  onClick={handleDirectWhatsAppBuy}
                  className="w-full py-3 px-6 bg-[#4A5D4E] hover:bg-[#3d4d40] text-white text-xs font-semibold tracking-wide transition-colors flex items-center justify-center gap-2 shadow-sm"
                >
                  <MessageCircle className="w-4 h-4" />
                  <span>Instant Order on WhatsApp (0334-6565636)</span>
                </button>

              </div>

              <div className="pt-2 flex items-center justify-between text-[11px] text-[#1C1917]/60">
                <div className="flex items-center gap-1.5">
                  <Truck className="w-3.5 h-3.5 text-[#8C4830]" />
                  <span>Nationwide Courier COD Dispatch</span>
                </div>
                <span>Dispatched within 24–48 Hours</span>
              </div>
            </div>
          </div>
        </div>

        {/* Tabbed Technical & Care Specifications Accordion */}
        <div id="product-tabs-section" className="mt-16 sm:mt-20 border-t border-[#E7E0D8] pt-12">
          {/* Tab Headers */}
          <div className="flex border-b border-[#E7E0D8] gap-4 sm:gap-8 overflow-x-auto scrollbar-none pb-0.5">
            <button
              onClick={() => setActiveTab('care')}
              className={`pb-3 text-xs sm:text-sm font-semibold whitespace-nowrap shrink-0 transition-colors border-b-2 ${
                activeTab === 'care'
                  ? 'border-[#8C4830] text-[#8C4830]'
                  : 'border-transparent text-[#1C1917]/60 hover:text-[#1C1917]'
              }`}
            >
              Fabric Care & Washing
            </button>
            <button
              onClick={() => setActiveTab('guide')}
              className={`pb-3 text-xs sm:text-sm font-semibold whitespace-nowrap shrink-0 transition-colors border-b-2 ${
                activeTab === 'guide'
                  ? 'border-[#8C4830] text-[#8C4830]'
                  : 'border-transparent text-[#1C1917]/60 hover:text-[#1C1917]'
              }`}
            >
              Unstitched Tailoring Guide
            </button>
            <button
              onClick={() => setActiveTab('heritage')}
              className={`pb-3 text-xs sm:text-sm font-semibold whitespace-nowrap shrink-0 transition-colors border-b-2 ${
                activeTab === 'heritage'
                  ? 'border-[#8C4830] text-[#8C4830]'
                  : 'border-transparent text-[#1C1917]/60 hover:text-[#1C1917]'
              }`}
            >
              Fabric Quality & Purity
            </button>
            <button
              onClick={() => setActiveTab('reviews')}
              className={`pb-3 text-xs sm:text-sm font-semibold whitespace-nowrap shrink-0 transition-colors border-b-2 ${
                activeTab === 'reviews'
                  ? 'border-[#8C4830] text-[#8C4830]'
                  : 'border-transparent text-[#1C1917]/60 hover:text-[#1C1917]'
              }`}
            >
              Customer Reviews ({stats.totalReviews})
            </button>
          </div>

          {/* Tab Contents */}
          <div className="py-8">
            {activeTab === 'care' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl">
                <div className="p-4 bg-white border border-[#E7E0D8]">
                  <h4 className="font-serif text-sm font-bold text-[#1C1917]">
                    Washing Instructions
                  </h4>
                  <p className="text-xs text-[#1C1917]/75 mt-1 leading-relaxed">
                    {product.care.washing}
                  </p>
                </div>

                <div className="p-4 bg-white border border-[#E7E0D8]">
                  <h4 className="font-serif text-sm font-bold text-[#1C1917]">
                    Shrinkage Allowance
                  </h4>
                  <p className="text-xs text-[#1C1917]/75 mt-1 leading-relaxed">
                    {product.care.shrinkage}
                  </p>
                </div>

                <div className="p-4 bg-white border border-[#E7E0D8]">
                  <h4 className="font-serif text-sm font-bold text-[#1C1917]">
                    Ironing & Press Guidelines
                  </h4>
                  <p className="text-xs text-[#1C1917]/75 mt-1 leading-relaxed">
                    {product.care.ironing}
                  </p>
                </div>

                <div className="p-4 bg-white border border-[#E7E0D8]">
                  <h4 className="font-serif text-sm font-bold text-[#1C1917]">
                    Long-Term Preservation
                  </h4>
                  <p className="text-xs text-[#1C1917]/75 mt-1 leading-relaxed">
                    {product.care.preservation}
                  </p>
                </div>
              </div>
            )}

            {activeTab === 'guide' && (
              <div className="max-w-3xl space-y-4 text-xs text-[#1C1917]/80 leading-relaxed">
                <div className="p-5 bg-white border border-[#E7E0D8] space-y-2">
                  <h4 className="font-serif text-base font-bold text-[#1C1917]">
                    Fabric Cut & Yardage Guide for Unstitched Suiting
                  </h4>
                  <p>
                    All Niaz unstitched men’s fabrics are provided in genuine 4.5-meter lengths on generous double width (54"). This provides ample fabric for a standard or full-cut shalwar kameez including cuffs, ban collar, and pockets for gentlemen up to 6 feet 4 inches.
                  </p>
                  <p>
                    For ladies' 3-piece sets, our 80s lawn and chiffon shirts include 3.2 meters of unstitched fabric to allow flared kurtas, kalidar panels, or long shirt styles without piecing.
                  </p>
                  <p className="text-[#8C4830] font-medium pt-1">
                    * Please note: Niaz Cloth House is exclusively an authentic unstitched cloth shop—not a tailor shop. We provide fresh unstitched cuts and rolls for you to get stitched by your personal tailor (Darzi).
                  </p>
                </div>
              </div>
            )}

            {activeTab === 'heritage' && (
              <div className="max-w-3xl space-y-4 text-xs text-[#1C1917]/80 leading-relaxed">
                <div className="p-5 bg-white border border-[#E7E0D8] space-y-2">
                  <h4 className="font-serif text-base font-bold text-[#1C1917]">
                    Archival Provenance
                  </h4>
                  <p>{product.heritageNotes}</p>
                  <p>
                    Established in 1970 by Haji Niaz Ahmad and faithfully preserved today by his sons with the shop name unchanged, our founding pledge remains: Dedicated exclusively to pure unstitched textiles, certified yarn density, and authentic Pakistani fabric craftsmanship.
                  </p>
                </div>
              </div>
            )}

            {activeTab === 'reviews' && (
              <div className="space-y-8 max-w-4xl">
                {/* Summary Card & Write Review CTA */}
                <div className="p-6 bg-white border border-[#E7E0D8] rounded-none shadow-xs">
                  <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
                    {/* Average Score */}
                    <div className="md:col-span-4 flex flex-col items-center md:items-start text-center md:text-left border-b md:border-b-0 md:border-r border-[#E7E0D8] pb-6 md:pb-0 md:pr-6">
                      <div className="flex items-baseline gap-2">
                        <span className="font-mono text-4xl sm:text-5xl font-bold text-[#1C1917]">
                          {stats.averageRating.toFixed(1)}
                        </span>
                        <span className="text-xs text-[#1C1917]/50 font-mono">/ 5.0</span>
                      </div>
                      <div className="flex items-center gap-1 text-amber-500 my-2">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <Star
                            key={star}
                            className={`w-4 h-4 ${
                              star <= Math.round(stats.averageRating)
                                ? 'fill-amber-500 text-amber-500'
                                : 'text-gray-300'
                            }`}
                          />
                        ))}
                      </div>
                      <p className="text-xs text-[#1C1917]/70 font-sans">
                        Based on <strong className="text-[#1C1917]">{stats.totalReviews}</strong> customer reviews
                      </p>
                      <div className="mt-3 flex items-center gap-1.5 text-[11px] text-emerald-800 bg-emerald-50 px-2.5 py-1 border border-emerald-200">
                        <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                        <span>IndexedDB Verified Reviews</span>
                      </div>
                    </div>

                    {/* Star Breakdown Bars */}
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
                            <span className="w-12 text-[#1C1917]/80 font-medium shrink-0 group-hover:text-[#8C4830]">
                              {star} Star{star > 1 ? 's' : ''}
                            </span>
                            <div className="flex-1 h-2 bg-[#F3EFEA] rounded-full overflow-hidden">
                              <div
                                className="h-full bg-amber-500 transition-all duration-300"
                                style={{ width: `${pct}%` }}
                              />
                            </div>
                            <span className="w-8 text-right font-mono text-[11px] text-[#1C1917]/50">
                              {count}
                            </span>
                          </button>
                        );
                      })}
                    </div>

                    {/* Write Review Button */}
                    <div className="md:col-span-3 flex flex-col justify-center items-center md:items-end text-center md:text-right border-t md:border-t-0 border-[#E7E0D8] pt-6 md:pt-0">
                      <p className="text-xs text-[#1C1917]/70 mb-3 max-w-[200px]">
                        Bought this fabric from us? Share your experience with other customers!
                      </p>
                      <button
                        type="button"
                        onClick={() => {
                          setIsReviewFormOpen(!isReviewFormOpen);
                          setReviewErrorMsg('');
                          setReviewSuccessMsg('');
                        }}
                        className="inline-flex items-center gap-2 px-4 py-2.5 bg-[#8C4830] hover:bg-[#723824] text-white text-xs font-semibold tracking-wide transition-colors shadow-xs"
                      >
                        <PenSquare className="w-4 h-4" />
                        <span>{isReviewFormOpen ? 'Close Review Form' : 'Write a Review'}</span>
                      </button>
                    </div>
                  </div>
                </div>

                {/* Collapsible Write Review Form */}
                {isReviewFormOpen && (
                  <div className="p-6 bg-[#FAF8F5] border border-[#8C4830]/30 shadow-sm transition-all animate-fadeIn">
                    <div className="flex items-center justify-between pb-3 border-b border-[#E7E0D8]">
                      <div>
                        <h3 className="font-serif text-base font-bold text-[#1C1917]">
                          Write Your Customer Review
                        </h3>
                        <p className="text-xs text-[#1C1917]/65 mt-0.5">
                          Your review is saved in client-side IndexedDB and visible instantly to Pakistani shoppers.
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => setIsReviewFormOpen(false)}
                        className="text-[#1C1917]/40 hover:text-[#1C1917] p-1"
                        aria-label="Close review form"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>

                    <form onSubmit={handleSubmitReview} className="mt-5 space-y-4">
                      {/* Interactive Star Rating */}
                      <div>
                        <label className="block text-xs font-semibold text-[#1C1917] mb-1.5">
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
                                    isFilled ? 'fill-amber-500 text-amber-500' : 'text-gray-300'
                                  }`}
                                />
                              </button>
                            );
                          })}
                          <span className="text-xs font-semibold text-[#8C4830] ml-2 font-sans">
                            {(reviewHoverRating || reviewRating) === 5 && '★ 5 Stars - Outstanding Quality & Drape'}
                            {(reviewHoverRating || reviewRating) === 4 && '★ 4 Stars - Very Good Fabric'}
                            {(reviewHoverRating || reviewRating) === 3 && '★ 3 Stars - Standard / Average Fabric'}
                            {(reviewHoverRating || reviewRating) === 2 && '★ 2 Stars - Below Expectations'}
                            {(reviewHoverRating || reviewRating) === 1 && '★ 1 Star - Poor / Needs Improvement'}
                          </span>
                        </div>
                      </div>

                      {/* Name & City Grid */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-xs font-semibold text-[#1C1917] mb-1">
                            Your Name *
                          </label>
                          <input
                            type="text"
                            required
                            placeholder="e.g. Tariq Mehmood"
                            value={reviewName}
                            onChange={(e) => setReviewName(e.target.value)}
                            className="w-full px-3 py-2 text-xs bg-white border border-[#E7E0D8] focus:border-[#8C4830] focus:outline-none"
                          />
                        </div>

                        <div>
                          <label className="block text-xs font-semibold text-[#1C1917] mb-1">
                            City in Pakistan *
                          </label>
                          <input
                            type="text"
                            required
                            placeholder="e.g. Rawalpindi, Lahore, Islamabad, Karachi"
                            value={reviewCity}
                            onChange={(e) => setReviewCity(e.target.value)}
                            className="w-full px-3 py-2 text-xs bg-white border border-[#E7E0D8] focus:border-[#8C4830] focus:outline-none"
                          />
                        </div>
                      </div>

                      {/* Review Title */}
                      <div>
                        <label className="block text-xs font-semibold text-[#1C1917] mb-1">
                          Review Headline (Optional)
                        </label>
                        <input
                          type="text"
                          placeholder="e.g. Pure Boski - excellent shine, weight, and smooth fall"
                          value={reviewTitle}
                          onChange={(e) => setReviewTitle(e.target.value)}
                          className="w-full px-3 py-2 text-xs bg-white border border-[#E7E0D8] focus:border-[#8C4830] focus:outline-none"
                        />
                      </div>

                      {/* Comment */}
                      <div>
                        <label className="block text-xs font-semibold text-[#1C1917] mb-1">
                          Fabric Review & Tailoring Feedback *
                        </label>
                        <textarea
                          required
                          rows={4}
                          placeholder="Tell fellow Pakistani buyers about the fabric handfeel, wash results, color stability, drape (fall), or stitching experience with your tailor..."
                          value={reviewComment}
                          onChange={(e) => setReviewComment(e.target.value)}
                          className="w-full px-3 py-2 text-xs bg-white border border-[#E7E0D8] focus:border-[#8C4830] focus:outline-none leading-relaxed"
                        />
                      </div>

                      {/* Error or Success Notice */}
                      {reviewErrorMsg && (
                        <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2">
                          <X className="w-4 h-4 shrink-0 text-red-500" />
                          <span>{reviewErrorMsg}</span>
                        </div>
                      )}

                      {reviewSuccessMsg && (
                        <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2">
                          <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
                          <span>{reviewSuccessMsg}</span>
                        </div>
                      )}

                      {/* Submit Actions */}
                      <div className="flex items-center gap-3 pt-2">
                        <button
                          type="submit"
                          disabled={isSubmittingReview}
                          className="px-5 py-2.5 bg-[#8C4830] hover:bg-[#723824] text-white text-xs font-semibold tracking-wide transition-colors disabled:opacity-50"
                        >
                          {isSubmittingReview ? 'Saving in IndexedDB...' : 'Submit Review'}
                        </button>
                        <button
                          type="button"
                          onClick={() => setIsReviewFormOpen(false)}
                          className="px-4 py-2.5 bg-white border border-[#E7E0D8] text-xs text-[#1C1917]/70 hover:text-[#1C1917]"
                        >
                          Cancel
                        </button>
                      </div>
                    </form>
                  </div>
                )}

                {/* Filter Chips Bar */}
                <div className="flex flex-wrap items-center gap-2 pt-2 pb-1 border-b border-[#E7E0D8]">
                  <span className="text-xs font-medium text-[#1C1917]/60 flex items-center gap-1.5 mr-2">
                    <Filter className="w-3.5 h-3.5" />
                    <span>Filter:</span>
                  </span>
                  <button
                    type="button"
                    onClick={() => setSelectedStarFilter('all')}
                    className={`px-3 py-1.5 text-xs font-medium border transition-colors ${
                      selectedStarFilter === 'all'
                        ? 'bg-[#8C4830] text-white border-[#8C4830]'
                        : 'bg-white text-[#1C1917]/70 border-[#E7E0D8] hover:border-[#8C4830]/50'
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
                          ? 'bg-[#8C4830] text-white border-[#8C4830]'
                          : 'bg-white text-[#1C1917]/70 border-[#E7E0D8] hover:border-[#8C4830]/50'
                      }`}
                    >
                      {star} ★ ({stats.distribution[star] || 0})
                    </button>
                  ))}
                </div>

                {/* Reviews List */}
                <div className="space-y-4">
                  {reviews
                    .filter((r) => {
                      if (selectedStarFilter === 'all') return true;
                      return r.rating === selectedStarFilter;
                    })
                    .map((rev) => (
                      <div
                        key={rev.id}
                        className="p-5 bg-white border border-[#E7E0D8] space-y-2.5 transition-shadow hover:shadow-xs"
                      >
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-semibold text-xs text-[#1C1917]">
                              {rev.authorName} {rev.authorCity && `· ${rev.authorCity}`}
                            </span>
                            {rev.verifiedBuyer && (
                              <span className="inline-flex items-center gap-1 text-[10px] font-medium text-emerald-700 bg-emerald-50 px-2 py-0.5 border border-emerald-200">
                                <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                                <span>Verified Buyer</span>
                              </span>
                            )}
                          </div>
                          <span className="text-[11px] text-[#1C1917]/50 font-mono">
                            {new Date(rev.createdAt).toLocaleDateString('en-GB', {
                              day: 'numeric',
                              month: 'short',
                              year: 'numeric',
                            })}
                          </span>
                        </div>

                        {/* Stars & Title */}
                        <div className="flex items-center gap-2 flex-wrap">
                          <div className="flex items-center gap-0.5 text-amber-500">
                            {[1, 2, 3, 4, 5].map((star) => (
                              <Star
                                key={star}
                                className={`w-3.5 h-3.5 ${
                                  star <= rev.rating ? 'fill-amber-500 text-amber-500' : 'text-gray-300'
                                }`}
                              />
                            ))}
                          </div>
                          {rev.title && (
                            <h4 className="font-serif text-xs font-bold text-[#1C1917]">
                              {rev.title}
                            </h4>
                          )}
                        </div>

                        {/* Comment */}
                        <p className="text-xs text-[#1C1917]/80 leading-relaxed font-sans">
                          {rev.comment}
                        </p>

                        <div className="pt-2 flex items-center justify-between text-[10px] text-[#1C1917]/40 border-t border-[#F3EFEA]">
                          <span>Unstitched Suit Quality Review</span>
                          <span className="font-mono">ID: {rev.id.slice(0, 8)} · IndexedDB</span>
                        </div>
                      </div>
                    ))}

                  {reviews.filter((r) => {
                    if (selectedStarFilter === 'all') return true;
                    return r.rating === selectedStarFilter;
                  }).length === 0 && (
                    <div className="p-8 text-center bg-white border border-[#E7E0D8] text-xs text-[#1C1917]/60">
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
          <div className="mt-16 pt-12 border-t border-[#E7E0D8]">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-8">
              <div>
                <h2 className="font-serif text-2xl font-bold text-[#1C1917]">
                  Related Unstitched Varieties
                </h2>
                <p className="text-xs text-[#1C1917]/60 font-sans mt-0.5">
                  Complementary {product.gender.toLowerCase()}'s fabrics from our 1977 archive
                </p>
              </div>
              <button
                onClick={() => navigateTo('shop')}
                className="text-xs font-semibold text-[#8C4830] hover:underline self-start sm:self-auto"
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
