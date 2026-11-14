import React, { useState, useEffect } from 'react';

const PORTRAIT_BASES = new Set([
  'aura_cotton_karandi',
  'gulistan_embroidered_suit',
  'mehr_velvet_lawn',
  'zari_chiffon_dress',
]);

const KNOWN_OPTIMIZED_BASES = new Set([
  'aura_cotton_karandi',
  'gulistan_embroidered_suit',
  'mehr_velvet_lawn',
  'zari_chiffon_dress',
  'heritage_unstitched_rolls_1791658049901',
  'hero_niaz_luxury_fabric_1791569218384',
  'khaadi_editorial_hero_1791657181176',
  'khaadi_mens_boski_display_1791657195697',
  'khaadi_unstitched_boutique_1791657162979',
  'khaadi_unstitched_palace_1791658025090',
  'khaadi_unstitched_shelves_1791658816418',
  'product_mens_latha_cotton_1791569254348',
  'product_mens_pure_boski_1791569243386',
  'product_womens_lawn_chiffon_1791569231005',
  'shahi_hero_banner',
  'storefront_design_mockup_1793129426383',
]);

function extractOptimizedBase(src: string): string | null {
  if (!src) return null;
  // Match local /images/<name>.jpg or /src/assets/images/<name>.jpg
  const match = src.match(/^(?:\/src\/assets)?\/images\/([a-zA-Z0-9_-]+)\.jpg$/i);
  if (!match) return null;
  const base = match[1];
  return KNOWN_OPTIMIZED_BASES.has(base) ? base : null;
}

export interface OptimizedImageProps {
  src: string;
  alt: string;
  width?: number;
  height?: number;
  sizes?: string;
  className?: string;
  pictureClassName?: string;
  priority?: boolean;
  loading?: 'eager' | 'lazy';
  decoding?: 'async' | 'sync' | 'auto';
  fetchPriority?: 'high' | 'low' | 'auto';
  fallbackSrc?: string;
  maxWidth?: 400 | 640 | 800 | 896 | 1376;
  showPlaceholder?: boolean;
  style?: React.CSSProperties;
  onErrorFallback?: () => void;
}

export const OptimizedImage: React.FC<OptimizedImageProps> = ({
  src,
  alt,
  width,
  height,
  sizes = '(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw',
  className = '',
  pictureClassName = 'block w-full h-full',
  priority = false,
  loading,
  decoding,
  fetchPriority,
  fallbackSrc = '/images/hero_niaz_luxury_fabric_1791569218384.jpg',
  maxWidth,
  showPlaceholder = true,
  style,
  onErrorFallback,
}) => {
  const [activeSrc, setActiveSrc] = useState(src || fallbackSrc);
  const [loaded, setLoaded] = useState(priority);

  useEffect(() => {
    setActiveSrc(src || fallbackSrc);
    if (!priority) {
      setLoaded(false);
    }
  }, [src, fallbackSrc, priority]);

  const effectiveLoading = loading ?? (priority ? 'eager' : 'lazy');
  const effectiveDecoding = decoding ?? (priority ? 'sync' : 'async');
  const effectiveFetchPriority = fetchPriority ?? (priority ? 'high' : 'auto');

  const base = extractOptimizedBase(activeSrc);

  const handleImgError = () => {
    if (activeSrc !== fallbackSrc) {
      setActiveSrc(fallbackSrc);
      onErrorFallback?.();
    }
  };

  const imgProps: React.ImgHTMLAttributes<HTMLImageElement> = {
    src: activeSrc,
    alt,
    width,
    height,
    loading: effectiveLoading,
    decoding: effectiveDecoding,
    referrerPolicy: 'no-referrer',
    onLoad: () => setLoaded(true),
    onError: handleImgError,
    style,
    className: `${className} ${
      showPlaceholder && !priority
        ? `transition-opacity duration-300 ${loaded ? 'opacity-100' : 'opacity-0'}`
        : ''
    }`,
    ...(effectiveFetchPriority !== 'auto' ? { fetchPriority: effectiveFetchPriority } : {}),
  };

  if (!base) {
    return <img {...imgProps} />;
  }

  const isPortrait = PORTRAIT_BASES.has(base);
  const allWidths = isPortrait ? [400, 640, 896] : [400, 800, 1376];
  const allowedWidths = maxWidth
    ? allWidths.filter((w) => w <= maxWidth)
    : allWidths;
  const finalWidths = allowedWidths.length > 0 ? allowedWidths : [allWidths[0]];

  const avifSrcSet = finalWidths
    .map((w) => `/images/opt/${base}-${w}w.avif ${w}w`)
    .join(', ');
  const webpSrcSet = finalWidths
    .map((w) => `/images/opt/${base}-${w}w.webp ${w}w`)
    .join(', ');

  // Use the largest allowed WebP as the clean img src fallback for non-AVIF browsers without srcset quirks
  const bestWebpSrc = `/images/opt/${base}-${finalWidths[finalWidths.length - 1]}w.webp`;

  return (
    <picture className={pictureClassName}>
      <source type="image/avif" srcSet={avifSrcSet} sizes={sizes} />
      <source type="image/webp" srcSet={webpSrcSet} sizes={sizes} />
      <img {...imgProps} src={bestWebpSrc} onError={() => {
        // Fallback to raw original JPG if optimized variant isn't present
        if (imgProps.src !== activeSrc) {
          handleImgError();
        }
      }} />
    </picture>
  );
};
