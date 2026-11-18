import React from 'react';
import type { PageRoute } from '../context/NavigationContext';

const BreadcrumbSkeletonStrip: React.FC<{ itemsCount?: number }> = ({ itemsCount = 3 }) => (
  <div className="border-b border-[#C5A059]/20 bg-[#0A0A0E]" aria-hidden="true">
    <div className="w-full py-3 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto min-w-0">
      <div className="flex items-center flex-wrap gap-2 h-4 animate-pulse">
        <div className="h-3 w-12 rounded-xs bg-white/10" />
        {Array.from({ length: Math.max(1, itemsCount - 1) }).map((_, idx) => (
          <React.Fragment key={idx}>
            <span className="text-[#C5A059]/30 text-[10px]">›</span>
            <div
              className={`h-3 rounded-xs ${
                idx === itemsCount - 2 ? 'w-28 sm:w-40 bg-[#D4AF37]/25' : 'w-20 bg-white/10'
              }`}
            />
          </React.Fragment>
        ))}
      </div>
    </div>
  </div>
);

export const ProductCardSkeleton: React.FC = () => (
  <div
    className="flex flex-col w-full min-w-0 max-w-full overflow-hidden h-full animate-pulse"
    aria-hidden="true"
  >
    {/* 3:4 Portrait Image Frame matching ProductCard */}
    <div className="relative aspect-[3/4] w-full overflow-hidden rounded-md bg-[#121216] border border-white/10">
      <div className="absolute inset-0 bg-gradient-to-b from-white/[0.03] via-transparent to-black/30" />
      <div className="absolute top-2.5 right-2.5 flex flex-col gap-1.5">
        <div className="w-7 h-7 rounded-full bg-white/5 border border-white/10" />
        <div className="w-7 h-7 rounded-full bg-white/5 border border-white/10" />
      </div>
    </div>

    {/* Product Info matching ProductCard spacing & heights */}
    <div className="pt-3 flex flex-col flex-grow justify-between min-w-0 w-full">
      <div className="min-w-0 w-full">
        <div className="space-y-1.5 min-h-[2.4em]">
          <div className="h-3.5 w-11/12 rounded-xs bg-white/10" />
          <div className="h-3.5 w-2/3 rounded-xs bg-white/10" />
        </div>

        <div className="mt-1.5 flex items-baseline gap-2">
          <div className="h-3.5 w-20 rounded-xs bg-[#D4AF37]/25" />
          <div className="h-3 w-14 rounded-xs bg-white/5" />
        </div>
      </div>

      {/* Add to Cart Button Placeholder */}
      <div className="mt-2.5 w-full h-[34px] sm:h-[36px] rounded-xs border border-[#C5A059]/25 bg-[#111115]" />
    </div>
  </div>
);

export const ShopGridSkeleton: React.FC = () => (
  <div
    role="status"
    aria-label="Loading fabric catalog"
    className="w-full bg-[#060608] text-[#F7F4EE] min-h-screen pb-16 overflow-x-clip"
  >
    <span className="sr-only">Loading fabric catalog...</span>
    <BreadcrumbSkeletonStrip itemsCount={3} />

    <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 pt-6 sm:pt-9 min-w-0">
      {/* Catalog Header matching ShopPage */}
      <div className="text-center mb-5 sm:mb-7 pb-5 sm:pb-6 border-b border-[#C5A059]/20 px-1 sm:px-2 animate-pulse">
        <div className="h-7 sm:h-9 md:h-10 w-56 sm:w-80 mx-auto rounded-xs bg-[#D4AF37]/20 mb-2.5" />
        <div className="h-3.5 w-48 sm:w-64 mx-auto rounded-xs bg-white/10 mb-4" />

        <div className="flex flex-wrap items-center justify-center gap-1.5 sm:gap-2 max-w-full">
          {[96, 112, 124, 108, 92, 98, 68, 56].map((width, idx) => (
            <div
              key={idx}
              style={{ width: `${width}px` }}
              className={`h-7 border ${
                idx === 0
                  ? 'bg-[#D4AF37]/25 border-[#D4AF37]/40'
                  : 'bg-[#111115] border-[#C5A059]/20'
              }`}
            />
          ))}
        </div>
      </div>

      {/* Control Strip matching ShopPage */}
      <div className="flex flex-wrap items-center justify-between gap-2.5 pb-4 mb-6 border-b border-white/10 animate-pulse">
        <div className="flex items-center gap-2">
          <div className="lg:hidden h-8 sm:h-9 w-24 bg-[#111115] border border-[#D4AF37]/40" />
        </div>
        <div className="flex items-center gap-2 sm:gap-4">
          <div className="h-8 w-24 sm:w-32 bg-[#0E0E12] border border-[#C5A059]/25" />
          <div className="h-8 sm:h-9 w-32 sm:w-40 bg-[#111115] border border-[#C5A059]/25" />
        </div>
      </div>

      {/* Sidebar + Product Grid matching ShopPage */}
      <div className="flex items-start gap-8 min-w-0">
        <aside
          className="hidden lg:block w-64 shrink-0 space-y-6 pr-4 min-w-0 animate-pulse"
          aria-hidden="true"
        >
          {[3, 3, 5, 4, 4].map((rows, sectionIdx) => (
            <div key={sectionIdx} className="border-b border-white/10 pb-5 space-y-3">
              <div className="flex items-center justify-between">
                <div className="h-3.5 w-28 rounded-xs bg-[#D4AF37]/25" />
                <div className="h-3.5 w-3.5 rounded-xs bg-white/10" />
              </div>
              <div className="space-y-2.5">
                {Array.from({ length: rows }).map((_, rowIdx) => (
                  <div key={rowIdx} className="flex items-center gap-2.5">
                    <div className="w-3.5 h-3.5 rounded-full bg-white/10 shrink-0" />
                    <div
                      className="h-3 rounded-xs bg-white/10"
                      style={{ width: `${55 + ((rowIdx * 13) % 35)}%` }}
                    />
                  </div>
                ))}
              </div>
            </div>
          ))}
        </aside>

        <div className="flex-1 min-w-0">
          <div className="grid gap-4 sm:gap-5 lg:gap-6 grid-cols-1 min-[340px]:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 min-w-0">
            {Array.from({ length: 8 }).map((_, i) => (
              <ProductCardSkeleton key={i} />
            ))}
          </div>
        </div>
      </div>
    </div>
  </div>
);

export const ProductDetailSkeleton: React.FC = () => (
  <div
    role="status"
    aria-label="Loading fabric details"
    className="w-full bg-[#060608] text-[#F7F4EE] pb-16"
  >
    <span className="sr-only">Loading fabric details...</span>
    <BreadcrumbSkeletonStrip itemsCount={4} />

    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 animate-pulse">
      {/* Navigation Action Bar */}
      <div className="flex items-center justify-between pb-4 mb-8 border-b border-white/10">
        <div className="h-4 w-44 sm:w-56 rounded-xs bg-white/10" />
        <div className="h-4 w-16 rounded-xs bg-white/10" />
      </div>

      {/* Main 12-Col Grid matching ProductDetailPage */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14">
        {/* Left Gallery Column */}
        <div className="lg:col-span-7 space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-[#C5A059]/25">
            <div className="flex items-center gap-2">
              <div className="h-3.5 w-32 rounded-xs bg-white/10" />
              <div className="h-3.5 w-28 rounded-xs bg-[#D4AF37]/25" />
            </div>
            <div className="h-3 w-36 rounded-xs bg-white/10 hidden sm:block" />
          </div>

          {/* Portrait 3:4 Main Product Photo Placeholder */}
          <div className="aspect-[3/4] w-full bg-[#111115] border border-[#C5A059]/25 relative overflow-hidden">
            <div className="absolute top-4 left-4 h-6 w-28 bg-[#060608]/80 border border-[#D4AF37]/30" />
            <div className="absolute bottom-3 right-3 h-7 w-28 bg-[#060608]/80 border border-[#D4AF37]/30" />
          </div>

          {/* Thumbnail Strip */}
          <div className="flex items-center gap-2.5 sm:gap-3 overflow-hidden pb-1">
            {Array.from({ length: 4 }).map((_, idx) => (
              <div
                key={idx}
                className={`aspect-[4/3] w-20 sm:w-24 shrink-0 bg-[#111115] border-2 ${
                  idx === 0 ? 'border-[#D4AF37]/50' : 'border-white/10'
                }`}
              />
            ))}
          </div>

          {/* Purity Seal Callout */}
          <div className="p-4 bg-[#111115] border border-[#C5A059]/25 flex items-start gap-3">
            <div className="w-5 h-5 rounded-full bg-[#D4AF37]/25 shrink-0 mt-0.5" />
            <div className="flex-1 space-y-2">
              <div className="h-3 w-48 rounded-xs bg-[#D4AF37]/25" />
              <div className="h-3 w-full rounded-xs bg-white/10" />
              <div className="h-3 w-4/5 rounded-xs bg-white/10" />
            </div>
          </div>
        </div>

        {/* Right Contiguous Purchase Column */}
        <div className="lg:col-span-5 space-y-6 min-w-0">
          {/* Header Block */}
          <div className="border-b border-white/10 pb-6 space-y-3">
            <div className="flex items-center gap-2 flex-wrap">
              <div className="h-5 w-24 bg-[#141419] border border-[#C5A059]/30" />
              <div className="h-3.5 w-20 rounded-xs bg-white/10" />
              <div className="h-3.5 w-24 rounded-xs bg-white/10" />
            </div>

            <div className="space-y-2 pt-1">
              <div className="h-7 sm:h-8 w-11/12 rounded-xs bg-white/15" />
              <div className="h-7 sm:h-8 w-2/3 rounded-xs bg-white/15" />
            </div>

            <div className="h-4 w-3/4 rounded-xs bg-white/10" />

            <div className="pt-2 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-baseline gap-3">
                <div className="h-8 w-36 rounded-xs bg-[#D4AF37]/30" />
                <div className="h-4 w-20 rounded-xs bg-white/10" />
              </div>
              <div className="flex items-center gap-3">
                <div className="h-4 w-28 rounded-xs bg-[#D4AF37]/20" />
                <div className="h-4 w-28 rounded-xs bg-emerald-500/15" />
              </div>
            </div>
          </div>

          {/* Color / Shade Selector Block */}
          <div className="space-y-4 pb-5 border-b border-white/10">
            <div className="flex items-center justify-between">
              <div className="h-3.5 w-36 rounded-xs bg-white/10" />
              <div className="h-3.5 w-20 rounded-xs bg-[#D4AF37]/25" />
            </div>
            <div className="flex flex-wrap gap-2">
              {Array.from({ length: 4 }).map((_, idx) => (
                <div
                  key={idx}
                  className={`h-9 w-24 border bg-[#111115] ${
                    idx === 0 ? 'border-[#D4AF37]/40' : 'border-white/10'
                  }`}
                />
              ))}
            </div>

            {/* Cut Specs / Suit Parts Box */}
            <div className="p-3.5 bg-[#111115] border border-white/10 space-y-2.5">
              <div className="flex items-center justify-between pb-2 border-b border-white/10">
                <div className="h-3.5 w-44 rounded-xs bg-white/10" />
                <div className="h-4 w-20 rounded-xs bg-[#D4AF37]/20" />
              </div>
              <div className="h-3 w-full rounded-xs bg-white/10" />
              <div className="h-3 w-5/6 rounded-xs bg-white/10" />
            </div>
          </div>

          {/* Quantity + Primary Purchase Actions */}
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <div className="h-12 w-32 bg-[#111115] border border-white/15" />
              <div className="h-12 flex-1 bg-[#D4AF37]/25 border border-[#D4AF37]/40" />
            </div>
            <div className="h-11 w-full bg-[#111115] border border-emerald-500/25" />
          </div>

          {/* Delivery & Trust Badges Grid */}
          <div className="grid grid-cols-2 gap-3 pt-2">
            <div className="h-16 bg-[#111115] border border-white/10 p-3 space-y-2">
              <div className="h-3 w-24 rounded-xs bg-[#D4AF37]/20" />
              <div className="h-2.5 w-32 rounded-xs bg-white/10" />
            </div>
            <div className="h-16 bg-[#111115] border border-white/10 p-3 space-y-2">
              <div className="h-3 w-24 rounded-xs bg-[#D4AF37]/20" />
              <div className="h-2.5 w-32 rounded-xs bg-white/10" />
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
);

export const EditorialPageSkeleton: React.FC = () => (
  <div
    role="status"
    aria-label="Loading page"
    className="w-full bg-[#060608] text-[#F7F4EE] min-h-[75vh] pb-16"
  >
    <span className="sr-only">Loading page...</span>
    <BreadcrumbSkeletonStrip itemsCount={2} />

    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 sm:pt-12 animate-pulse space-y-8">
      <div className="border-b border-[#C5A059]/20 pb-6 space-y-3">
        <div className="h-3 w-32 rounded-xs bg-[#D4AF37]/25" />
        <div className="h-8 sm:h-10 w-64 sm:w-96 rounded-xs bg-white/15" />
        <div className="h-4 w-full max-w-xl rounded-xs bg-white/10" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-7 h-72 sm:h-96 bg-[#111115] border border-white/10" />
        <div className="lg:col-span-5 space-y-4">
          <div className="h-32 bg-[#111115] border border-white/10 p-5 space-y-3">
            <div className="h-4 w-40 rounded-xs bg-[#D4AF37]/25" />
            <div className="h-3 w-full rounded-xs bg-white/10" />
            <div className="h-3 w-4/5 rounded-xs bg-white/10" />
          </div>
          <div className="h-40 bg-[#111115] border border-white/10 p-5 space-y-3">
            <div className="h-4 w-36 rounded-xs bg-[#D4AF37]/25" />
            <div className="h-3 w-full rounded-xs bg-white/10" />
            <div className="h-3 w-3/4 rounded-xs bg-white/10" />
          </div>
        </div>
      </div>
    </div>
  </div>
);

export const RouteLoadingFallback: React.FC<{ currentPage: PageRoute }> = ({ currentPage }) => {
  if (currentPage === 'product-detail') {
    return <ProductDetailSkeleton />;
  }

  if (
    currentPage === 'shop' ||
    currentPage === 'men-summer' ||
    currentPage === 'men-winter' ||
    currentPage === 'women-summer' ||
    currentPage === 'women-winter'
  ) {
    return <ShopGridSkeleton />;
  }

  return <EditorialPageSkeleton />;
};
