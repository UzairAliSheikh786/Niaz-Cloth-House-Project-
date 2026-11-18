import React, { useState, memo } from 'react';
import { Heart, Eye, Check } from 'lucide-react';
import { ProductCardItem } from '../types';
import { useShop } from '../context/ShopContext';
import { useNavigation } from '../context/NavigationContext';
import { OptimizedImage } from './OptimizedImage';

interface ProductCardProps {
  product: ProductCardItem;
  onQuickView?: (product: ProductCardItem) => void;
  priority?: boolean;
}

const ProductCardComponent: React.FC<ProductCardProps> = ({
  product,
  onQuickView,
  priority = false,
}) => {
  const { addToCart, wishlist, toggleWishlist, formatPrice } = useShop();
  const { navigateTo } = useNavigation();

  const fallbackImage = '/images/hero_niaz_luxury_fabric_1791569218384.jpg';
  const [addedFeedback, setAddedFeedback] = useState(false);

  const isFavorite = wishlist.includes(product.id);
  const productUrl = `/product/${product.slug}`;

  const handleCardClick = (e?: React.MouseEvent) => {
    if (e) e.preventDefault();
    navigateTo('product-detail', { id: product.id, slug: product.slug });
  };

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    addToCart(product, 1);
    setAddedFeedback(true);
    setTimeout(() => setAddedFeedback(false), 1400);
  };

  return (
    <article className="group flex flex-col w-full min-w-0 max-w-full overflow-hidden h-full select-none transition-transform duration-200 hover:-translate-y-0.5">
      {/* 1. 3:4 Portrait Image Container */}
      <div className="relative aspect-[3/4] w-full overflow-hidden rounded-md bg-[#121216] border border-white/10 group-hover:border-[#C5A059]/45 transition-colors">
        <a
          href={productUrl}
          onClick={handleCardClick}
          className="block w-full h-full cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#D4AF37]"
          aria-label={`View ${product.title}`}
        >
          <OptimizedImage
            src={product.primaryImage || fallbackImage}
            alt={`${product.title} - ${product.fabric} at Niaz Cloth House`}
            width={400}
            height={533}
            maxWidth={640}
            sizes="(max-width: 640px) 46vw, (max-width: 1024px) 30vw, 280px"
            priority={priority}
            loading={priority ? 'eager' : 'lazy'}
            decoding="async"
            fallbackSrc={fallbackImage}
            className="h-full w-full object-cover object-top transition-transform duration-500 ease-out group-hover:scale-105"
          />
        </a>

        {/* Subtle Hover / Touch Action Controls */}
        <div className="absolute top-2.5 right-2.5 z-10 flex flex-col gap-1.5 opacity-90 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity duration-200">
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              toggleWishlist(product.id);
            }}
            className={`p-2 rounded-full backdrop-blur-md transition-colors ${
              isFavorite
                ? 'bg-[#D4AF37] text-[#060608]'
                : 'bg-black/65 text-[#F7F4EE] hover:text-[#D4AF37] border border-white/15'
            }`}
            aria-label={isFavorite ? 'Remove from wishlist' : 'Add to wishlist'}
          >
            <Heart className={`w-3.5 h-3.5 ${isFavorite ? 'fill-current' : ''}`} />
          </button>

          {onQuickView && (
            <button
              type="button"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                onQuickView(product);
              }}
              className="p-2 rounded-full bg-black/65 backdrop-blur-md text-[#F7F4EE] hover:text-[#D4AF37] border border-white/15 transition-colors"
              aria-label={`Quick view ${product.title}`}
              title="Quick View"
            >
              <Eye className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* 2. Clean Editorial Product Info */}
      <div className="pt-3 flex flex-col flex-grow justify-between text-left min-w-0 w-full">
        <div className="min-w-0 w-full">
          <h3 className="text-[13px] sm:text-[14px] font-medium text-[#F7F4EE] group-hover:text-[#D4AF37] line-clamp-2 break-words [overflow-wrap:anywhere] leading-snug min-h-[2.4em] transition-colors min-w-0">
            <a
              href={productUrl}
              onClick={handleCardClick}
              title={product.title}
              className="block w-full min-w-0 break-words [overflow-wrap:anywhere]"
            >
              {product.title}
            </a>
          </h3>

          <div className="mt-1 flex flex-wrap items-baseline gap-x-2 gap-y-0.5 min-w-0">
            <span className="text-xs sm:text-[13px] font-medium text-[#D4AF37] tabular-nums break-words">
              {formatPrice(product.price)}
            </span>
            {product.originalPrice && product.originalPrice > product.price && (
              <span className="text-[11px] text-[#F7F4EE]/40 line-through tabular-nums break-words">
                {formatPrice(product.originalPrice)}
              </span>
            )}
          </div>
        </div>

        {/* Full-Width Gold-Bordered Add to Cart Button */}
        <button
          type="button"
          onClick={handleAddToCart}
          className={`mt-2.5 w-full min-w-0 max-w-full py-2 px-2.5 sm:px-4 text-[11px] sm:text-xs font-medium tracking-wide sm:tracking-wider transition-all duration-200 rounded-xs border flex items-center justify-center gap-1.5 text-center leading-tight break-words ${
            addedFeedback
              ? 'bg-[#D4AF37] border-[#D4AF37] text-[#060608] font-semibold'
              : 'bg-transparent border-[#C5A059]/45 hover:border-[#D4AF37] hover:bg-[#D4AF37] text-[#E8D5A7] hover:text-[#060608]'
          }`}
        >
          {addedFeedback ? (
            <>
              <Check className="w-3.5 h-3.5 shrink-0" />
              <span className="min-w-0 break-words">Added to Cart</span>
            </>
          ) : (
            <span className="min-w-0 break-words">Add to Cart</span>
          )}
        </button>
      </div>
    </article>
  );
};

export const ProductCard = memo(ProductCardComponent);
