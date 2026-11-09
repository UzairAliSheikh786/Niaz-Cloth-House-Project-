import React, { useState } from 'react';
import { ShoppingBag, Heart, MessageCircle, Star, Eye } from 'lucide-react';
import { Product } from '../types';
import { useShop, formatPKR } from '../context/ShopContext';
import { useNavigation } from '../context/NavigationContext';
import { Card3DWrapper } from './3d/Card3DWrapper';

interface ProductCardProps {
  product: Product;
  onQuickView?: (product: Product) => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product, onQuickView }) => {
  const { addToCart, wishlist, toggleWishlist } = useShop();
  const { navigateTo } = useNavigation();

  // Fallback image guarantee to prevent disappearing images on mobile/deployed preview
  const fallbackImage = '/images/hero_niaz_luxury_fabric_1791569218384.jpg';
  const [currentImg, setCurrentImg] = useState<string>(product.primaryImage || fallbackImage);
  const [isHovered, setIsHovered] = useState(false);

  const isFavorite = wishlist.includes(product.id);
  const productUrl = `/product/${product.slug}`;

  const handleCardClick = (e?: React.MouseEvent) => {
    if (e) e.preventDefault();
    navigateTo('product-detail', { id: product.id, slug: product.slug });
  };

  // Determine badge
  let badgeText = '';
  let badgeType: 'default' | 'sale' | 'new' = 'default';

  if (product.originalPrice && product.originalPrice > product.price) {
    const discountPercent = Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100);
    badgeText = `-${discountPercent}%`;
    badgeType = 'sale';
  } else if (product.newArrival) {
    badgeText = 'NEW';
    badgeType = 'new';
  } else if (product.craftType === 'Embroidery') {
    badgeText = 'EMBROIDERED';
  } else if (product.craftType === 'Printed') {
    badgeText = 'PRINTED';
  } else if (product.fabric === 'Wash & Wear') {
    badgeText = 'WASH & WEAR';
  } else if (product.fabric === 'Boski') {
    badgeText = 'PURE BOSKI';
  }

  // Pre-formatted WhatsApp order link
  const waMessage = encodeURIComponent(
    `Hello Niaz Cloth House! I would like to order this suit:\n*${product.title}*\nBrand: ${product.brand || product.gender}\nFabric: ${product.fabric}\nPrice: ${formatPKR(product.price)}\nSKU: ${product.id}\nPlease confirm international/domestic delivery and availability.`
  );
  const waUrl = `https://wa.me/923346565636?text=${waMessage}`;

  return (
    <Card3DWrapper className="h-full">
      <article 
        className="group flex flex-col bg-[#0B1224] border border-white/10 hover:border-[#00F0FF]/60 hover:shadow-[0_0_25px_rgba(0,240,255,0.2)] transition-all duration-300 relative select-none w-full min-w-0 h-full rounded-xs overflow-hidden"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        {/* 1. Image Container (Limelight 3:4 Fashion Portrait Ratio) */}
        <div className="relative aspect-[3/4] w-full overflow-hidden bg-neutral-100">
        <a 
          href={productUrl}
          onClick={handleCardClick}
          className="block w-full h-full cursor-pointer focus:outline-none"
          aria-label={`View ${product.title}`}
        >
          <img
            src={currentImg}
            alt={`${product.title} - ${product.fabric} unstitched fabric at Niaz Cloth House`}
            width={600}
            height={800}
            loading="lazy"
            decoding="async"
            className="h-full w-full object-cover object-center transition-transform duration-700 ease-out group-hover:scale-105"
            onError={() => {
              if (currentImg !== fallbackImage) {
                setCurrentImg(fallbackImage);
              }
            }}
          />
        </a>

        {/* Limelight Corner Badge */}
        {badgeText && (
          <div className="absolute top-2 left-2 z-10 pointer-events-none">
            <span
              className={`text-[8px] sm:text-[9px] font-bold tracking-widest uppercase px-1.5 sm:px-2 py-0.5 sm:py-1 leading-none shadow-xs ${
                badgeType === 'sale'
                  ? 'bg-red-600 text-white'
                  : 'bg-black text-white'
              }`}
            >
              {badgeText}
            </span>
          </div>
        )}

        {/* Top Right Action Icons: Wishlist & Mobile Quick View */}
        <div className="absolute top-2 right-2 z-10 flex flex-col gap-1.5">
          {/* Wishlist Heart Button */}
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              toggleWishlist(product.id);
            }}
            className={`p-1.5 sm:p-2 rounded-full transition-all duration-200 ${
              isFavorite 
                ? 'bg-red-600 text-white shadow-md' 
                : 'bg-white/90 text-neutral-700 hover:text-black hover:bg-white shadow-xs'
            }`}
            aria-label={isFavorite ? 'Remove from wishlist' : 'Add to wishlist'}
          >
            <Heart className={`w-3.5 h-3.5 ${isFavorite ? 'fill-current' : ''}`} />
          </button>

          {/* Quick View Button on Image (Visible on touch/mobile directly!) */}
          {onQuickView && (
            <button
              type="button"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                onQuickView(product);
              }}
              className="p-1.5 sm:p-2 rounded-full bg-white/90 text-neutral-700 hover:text-black hover:bg-white shadow-xs transition-colors flex sm:hidden items-center justify-center"
              aria-label="Quick View product"
              title="Quick View"
            >
              <Eye className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Desktop Slide-Up Action Bar on Hover */}
        <div className="hidden sm:flex absolute inset-x-0 bottom-0 p-2.5 bg-gradient-to-t from-black/85 via-black/40 to-transparent flex-col gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                addToCart(product, 1);
              }}
              className="flex-1 py-2 px-2.5 bg-black hover:bg-neutral-800 text-white text-[10px] font-bold tracking-widest uppercase transition-colors flex items-center justify-center gap-1.5 shadow-md"
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
                className="p-2 bg-white hover:bg-neutral-100 text-black transition-colors"
                title="Quick View"
              >
                <Eye className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          <a
            href={waUrl}
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) => e.stopPropagation()}
            className="w-full py-1.5 px-2 bg-emerald-600 hover:bg-emerald-700 text-white text-[10px] font-bold tracking-wider uppercase transition-colors flex items-center justify-center gap-1"
          >
            <MessageCircle className="w-3 h-3" />
            <span>Order on WhatsApp</span>
          </a>
        </div>
      </div>

      {/* 2. Product Details */}
      <div className="p-2 min-[380px]:p-2.5 sm:p-3.5 flex flex-col flex-grow justify-between bg-[#0B1224] text-left min-w-0">
        <div>
          {/* Brand Kicker with Overflow Protection */}
          <div className="flex items-center justify-between gap-1 mb-1">
            <span className="text-[9px] sm:text-[10px] font-bold tracking-[0.14em] uppercase text-[#00F0FF]/80 truncate max-w-[70%] font-mono">
              {product.brand || product.gender}
            </span>
            {product.rating && (
              <div className="flex items-center gap-0.5 text-[9px] sm:text-[10px] text-[#F5B738] font-bold shrink-0 font-mono">
                <Star className="w-2.5 h-2.5 sm:w-3 sm:h-3 fill-[#F5B738] text-[#F5B738]" />
                <span>{product.rating.toFixed(1)}</span>
              </div>
            )}
          </div>

          {/* Title with Line Clamping */}
          <h3 className="text-[11.5px] min-[360px]:text-xs sm:text-[13px] font-semibold text-white group-hover:text-[#00F0FF] line-clamp-1 leading-snug transition-colors">
            <a href={productUrl} onClick={handleCardClick} title={product.title}>
              {product.title}
            </a>
          </h3>

          {/* Fabric / Pieces Subtitle */}
          <p className="text-[9.5px] min-[360px]:text-[10px] sm:text-[11px] text-neutral-400 truncate mt-0.5 font-normal">
            {product.subtitle || `${product.fabric} · Unstitched`}
          </p>
        </div>

        {/* Pricing with Safe Flex Wrapping */}
        <div className="mt-1.5 sm:mt-2 pt-1.5 sm:pt-2 border-t border-white/10 flex items-baseline justify-between gap-1 flex-wrap">
          <div className="flex items-baseline gap-1.5 flex-wrap">
            <span className="text-xs sm:text-sm font-black text-[#F5B738] whitespace-nowrap font-mono">
              {formatPKR(product.price)}
            </span>
            {product.originalPrice && product.originalPrice > product.price && (
              <span className="text-[9.5px] sm:text-[11px] text-neutral-400 line-through whitespace-nowrap">
                {formatPKR(product.originalPrice)}
              </span>
            )}
          </div>
          <span className="text-[8px] sm:text-[9px] uppercase tracking-wider text-neutral-400 font-medium shrink-0">
            Unstitched
          </span>
        </div>

        {/* Mobile Quick Action Buttons (Touchscreens) */}
        <div className="mt-1.5 sm:mt-2 pt-1.5 sm:pt-2 border-t border-neutral-100 flex sm:hidden items-center gap-1">
          {onQuickView && (
            <button
              type="button"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                onQuickView(product);
              }}
              className="flex-1 py-1.5 px-0.5 bg-neutral-100 hover:bg-neutral-200 text-black text-[9.5px] min-[360px]:text-[10px] font-bold uppercase tracking-wider text-center flex items-center justify-center gap-1 transition-colors"
            >
              <Eye className="w-3 h-3" />
              <span>Quick View</span>
            </button>
          )}

          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              addToCart(product, 1);
            }}
            className="flex-1 py-1.5 px-0.5 bg-black text-white text-[9.5px] min-[360px]:text-[10px] font-bold uppercase tracking-wider text-center flex items-center justify-center gap-1 transition-colors active:scale-95"
          >
            <ShoppingBag className="w-3 h-3" />
            <span>+ Bag</span>
          </button>
        </div>
      </div>
    </article>
  </Card3DWrapper>
  );
};
