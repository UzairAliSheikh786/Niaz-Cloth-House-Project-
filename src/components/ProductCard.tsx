import React from 'react';
import { ShoppingBag, ArrowUpRight, Star } from 'lucide-react';
import { Product } from '../types';
import { useShop, formatPKR } from '../context/ShopContext';
import { useNavigation } from '../context/NavigationContext';
import { useReviews } from '../context/ReviewContext';

interface ProductCardProps {
  product: Product;
  onQuickView?: (product: Product) => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product, onQuickView }) => {
  const { addToCart } = useShop();
  const { navigateTo } = useNavigation();
  const { getProductStats } = useReviews();

  const stats = getProductStats(product.id);
  const productUrl = `/product/${product.slug}`;

  const handleCardClick = (e?: React.MouseEvent) => {
    if (e) e.preventDefault();
    navigateTo('product-detail', { id: product.id, slug: product.slug });
  };

  return (
    <article className="group flex flex-col bg-white border border-[#EAE6DF] hover:border-[#D4AF37]/60 transition-all duration-300 hover:shadow-lg">
      {/* Product Image Anchor */}
      <a 
        href={productUrl}
        onClick={handleCardClick}
        className="relative aspect-[4/3] w-full overflow-hidden bg-[#F7F6F2] cursor-pointer block focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#D4AF37]"
        aria-label={`View ${product.title} fabric details`}
      >
        <img
          src={product.primaryImage}
          alt={`${product.title} - ${product.fabric} unstitched fabric in ${product.color} at Niaz Cloth House`}
          width={600}
          height={450}
          loading="lazy"
          decoding="async"
          referrerPolicy="no-referrer"
          className="h-full w-full object-cover object-center transition-transform duration-700 ease-out group-hover:scale-105"
          onError={(e) => {
            (e.target as HTMLElement).style.display = 'none';
          }}
        />

        {/* Subtle Single Weight/Grade Badge */}
        {product.weightGrade && (
          <div className="absolute top-3 left-3 bg-[#141414]/90 text-[#FAF9F6] text-[10px] tracking-wider uppercase px-2.5 py-1 font-semibold">
            {product.weightGrade}
          </div>
        )}

        {/* Quick Add Overlay on Hover */}
        <div className="absolute inset-x-0 bottom-0 p-3 bg-gradient-to-t from-black/70 via-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-between gap-2">
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              addToCart(product, 1);
            }}
            className="flex-1 py-2 px-3 bg-[#D4AF37] hover:bg-[#C5A028] text-[#141414] text-xs font-bold tracking-wider uppercase transition-colors flex items-center justify-center gap-1.5 shadow-md"
          >
            <ShoppingBag className="w-3.5 h-3.5" />
            <span>Add to Bag</span>
          </button>

          {onQuickView && (
            <button
              type="button"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                onQuickView(product);
              }}
              className="p-2 bg-white/95 hover:bg-white text-[#141414] transition-colors"
              title="Quick inspect fabric details"
            >
              <ArrowUpRight className="w-4 h-4" />
            </button>
          )}
        </div>
      </a>

      {/* Product Information Box */}
      <div className="p-4 sm:p-5 flex flex-col flex-grow justify-between">
        <div>
          {/* Unboxed Metadata (Zero-Pill Discipline) */}
          <div className="flex items-center gap-1.5 text-xs text-[#1F1F1F]/60 font-sans font-medium mb-1.5 flex-wrap">
            {product.brand ? (
              <span className="font-bold text-[#141414] uppercase tracking-wider text-[11px]">{product.brand}</span>
            ) : (
              <span className="uppercase tracking-wider text-[11px]">{product.gender}</span>
            )}
            {product.craftType && (
              <>
                <span aria-hidden="true" className="text-[#1F1F1F]/30">·</span>
                <span className="text-[#1F1F1F]/80">{product.craftType}</span>
              </>
            )}
            <span aria-hidden="true" className="text-[#1F1F1F]/30">·</span>
            <span className="truncate">{product.fabric}</span>
          </div>

          {/* Product Title */}
          <h3 className="font-serif text-base sm:text-lg font-bold text-[#141414] leading-snug">
            <a
              href={productUrl}
              onClick={handleCardClick}
              className="group-hover:text-[#D4AF37] transition-colors cursor-pointer line-clamp-1"
            >
              {product.title}
            </a>
          </h3>

          {/* Subtitle / Weave Note */}
          <p className="text-xs text-[#1F1F1F]/70 line-clamp-1 mt-1 font-sans">
            {product.subtitle}
          </p>

          {/* Average Rating Display */}
          <div className="flex items-center gap-1.5 mt-2 text-xs">
            <div className="flex items-center text-[#D4AF37]">
              <Star className="w-3.5 h-3.5 fill-current" />
            </div>
            <span className="font-bold text-xs text-[#141414] font-mono">{stats.averageRating.toFixed(1)}</span>
            <span className="text-[11px] text-[#1F1F1F]/50 font-sans">({stats.totalReviews})</span>
          </div>

          {/* Color Choices Indicator */}
          {product.colorOptions && product.colorOptions.length > 0 && (
            <div className="mt-3 pt-2.5 flex items-center justify-between gap-2 border-t border-[#F4F1EA]">
              <div className="flex items-center gap-1.5">
                {product.colorOptions.slice(0, 4).map((c, i) => (
                  <span
                    key={i}
                    title={c.name}
                    className="w-3 h-3 rounded-full border border-black/15 shrink-0 inline-block"
                    style={{ backgroundColor: c.hex }}
                  />
                ))}
                {product.colorOptions.length > 4 && (
                  <span className="text-[10px] text-[#1F1F1F]/50 font-mono">
                    +{product.colorOptions.length - 4}
                  </span>
                )}
              </div>
              <span className="text-[10px] text-[#1F1F1F]/60 font-sans">
                {product.cutDetails?.length || '4.5m Cut'}
              </span>
            </div>
          )}
        </div>

        {/* Pricing Baseline & Primary Action */}
        <div className="mt-4 pt-3 border-t border-[#EAE6DF] flex items-center justify-between gap-2">
          <div className="flex items-baseline gap-2">
            <span className="text-base font-bold text-[#141414] font-mono tabular-nums">
              {formatPKR(product.price)}
            </span>
            {product.originalPrice && (
              <span className="text-xs text-[#1F1F1F]/40 line-through font-mono tabular-nums">
                {formatPKR(product.originalPrice)}
              </span>
            )}
          </div>

          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              addToCart(product, 1);
            }}
            className="py-1.5 px-3 bg-[#141414] hover:bg-[#D4AF37] text-white hover:text-[#141414] text-[11px] font-bold tracking-wider uppercase transition-colors inline-flex items-center gap-1"
            title="Add to shopping bag"
          >
            <ShoppingBag className="w-3 h-3" />
            <span>Add</span>
          </button>
        </div>
      </div>
    </article>
  );
};
