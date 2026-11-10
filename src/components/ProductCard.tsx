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
        className="group flex flex-col bg-white border border-[#E8E0D2] hover:border-[#D4AF37] hover:shadow-[0_8px_25px_rgba(212,175,55,0.12)] transition-all duration-300 relative select-none w-full min-w-0 h-full overflow-hidden"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        {/* 1. Image Container (Limelight 3:4 Fashion Portrait Ratio) */}
        <div className="relative aspect-[3/4] w-full overflow-hidden bg-[#F7F4EE]">
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
              className={`text-[8px] sm:text-[9px] font-sans font-medium tracking-widest uppercase px-1.5 sm:px-2 py-0.5 sm:py-1 leading-none shadow-xs ${
                badgeType === 'sale'
                  ? 'bg-[#1F1F1F] text-[#D4AF37] border border-[#D4AF37]/50'
                  : 'bg-[#1F1F1F] text-[#F7F4EE]'
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
                ? 'bg-[#D4AF37] text-white shadow-md' 
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
              className="flex-1 py-2 px-2.5 bg-[#1F1F1F] hover:bg-black text-[#F7F4EE] hover:text-[#D4AF37] text-[10px] font-medium tracking-widest uppercase transition-colors flex items-center justify-center gap-1.5 shadow-md border border-[#D4AF37]/30"
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
                className="p-2 bg-white hover:bg-[#F7F4EE] text-[#1F1F1F] transition-colors"
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
            className="w-full py-1.5 px-2 bg-[#D4AF37] hover:bg-[#E5C158] text-[#1F1F1F] text-[10px] font-medium tracking-wider uppercase transition-colors flex items-center justify-center gap-1"
          >
            <MessageCircle className="w-3 h-3" />
            <span>Order on WhatsApp</span>
          </a>
        </div>
      </div>

      {/* 2. Product Details */}
      <div className="p-2 min-[380px]:p-2.5 sm:p-3.5 flex flex-col flex-grow justify-between bg-white text-left min-w-0">
        <div>
          {/* Brand Kicker with Overflow Protection */}
          <div className="flex items-center justify-between gap-1 mb-1">
            <span className="text-[9px] sm:text-[10px] font-sans font-medium tracking-[0.14em] uppercase text-[#D4AF37] truncate max-w-[70%]">
              {product.brand || product.gender}
            </span>
            {product.rating && (
              <div className="flex items-center gap-0.5 text-[9px] sm:text-[10px] text-[#D4AF37] font-medium shrink-0 font-sans">
                <Star className="w-2.5 h-2.5 sm:w-3 sm:h-3 fill-[#D4AF37] text-[#D4AF37]" />
                <span>{product.rating.toFixed(1)}</span>
              </div>
            )}
          </div>

          {/* Title with Line Clamping */}
          <h3 className="text-[11.5px] min-[360px]:text-xs sm:text-[13px] font-medium text-[#1F1F1F] group-hover:text-[#D4AF37] line-clamp-1 leading-snug transition-colors">
            <a href={productUrl} onClick={handleCardClick} title={product.title}>
              {product.title}
            </a>
          </h3>

          {/* Fabric / Pieces Subtitle */}
          <p className="text-[9.5px] min-[360px]:text-[10px] sm:text-[11px] text-[#1F1F1F]/60 truncate mt-0.5 font-normal">
            {product.subtitle || `${product.fabric} · Unstitched`}
          </p>
        </div>

        {/* Pricing with Safe Flex Wrapping */}
        <div className="mt-1.5 sm:mt-2 pt-1.5 sm:pt-2 border-t border-[#E8E0D2] flex items-baseline justify-between gap-1 flex-wrap">
          <div className="flex items-baseline gap-1.5 flex-wrap">
            <span className="text-xs sm:text-sm font-semibold text-[#1F1F1F] whitespace-nowrap font-sans">
              {formatPKR(product.price)}
            </span>
            {product.originalPrice && product.originalPrice > product.price && (
              <span className="text-[9.5px] sm:text-[11px] text-[#1F1F1F]/40 line-through whitespace-nowrap font-sans">
                {formatPKR(product.originalPrice)}
              </span>
            )}
          </div>
          <span className="text-[8px] sm:text-[9px] uppercase tracking-wider text-[#1F1F1F]/50 font-medium shrink-0 font-sans">
            Unstitched
          </span>
        </div>

        {/* Mobile Quick Action Buttons (Touchscreens) */}
        <div className="mt-1.5 sm:mt-2 pt-1.5 sm:pt-2 border-t border-[#E8E0D2] flex sm:hidden items-center gap-1">
          {onQuickView && (
            <button
              type="button"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                onQuickView(product);
              }}
              className="flex-1 py-1.5 px-0.5 bg-[#F7F4EE] hover:bg-[#E8E0D2] text-[#1F1F1F] text-[9.5px] min-[360px]:text-[10px] font-medium uppercase tracking-wider text-center flex items-center justify-center gap-1 transition-colors"
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
            className="flex-1 py-1.5 px-0.5 bg-[#1F1F1F] text-[#F7F4EE] text-[9.5px] min-[360px]:text-[10px] font-medium uppercase tracking-wider text-center flex items-center justify-center gap-1 transition-colors active:scale-95"
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
