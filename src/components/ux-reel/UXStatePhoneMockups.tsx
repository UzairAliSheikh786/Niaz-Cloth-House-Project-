import React, { useState, useEffect } from 'react';
import {
  Heart,
  Search,
  ShoppingBag,
  Menu,
  WifiOff,
  RefreshCw,
  AlertCircle,
  MessageCircle,
  CreditCard,
  RotateCcw,
  CameraOff,
  Image as ImageIcon,
  Settings,
  Lock,
  Check,
  CheckCircle2,
  PackageCheck,
  Zap,
  Sparkles,
} from 'lucide-react';
import printedLawnImg from '../../assets/images/ux_reel_printed_lawn_1795275449147.jpg';
import khaddarLelanImg from '../../assets/images/ux_reel_khaddar_lelan_1795275449532.jpg';

export type UXStateNumber = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10;

interface UXStatePhoneMockupsProps {
  stateNum: UXStateNumber;
  isPlaying: boolean;
  onExploreCollection?: () => void;
}

const SLOW_PROGRESS_STEPS = [16, 33, 50, 66, 83, 100];

const CONFETTI_PIECES = [
  { left: '8%', delay: '0s', rotate: '12deg', size: 'w-1.5 h-3', color: 'bg-[#D4AF37]' },
  { left: '18%', delay: '0.35s', rotate: '-24deg', size: 'w-2 h-2', color: 'bg-[#E8D5A7]' },
  { left: '29%', delay: '0.15s', rotate: '35deg', size: 'w-1.5 h-2.5', color: 'bg-[#D4AF37]' },
  { left: '42%', delay: '0.55s', rotate: '-18deg', size: 'w-2 h-1.5', color: 'bg-[#C5A059]' },
  { left: '56%', delay: '0.1s', rotate: '28deg', size: 'w-1.5 h-3', color: 'bg-[#D4AF37]' },
  { left: '68%', delay: '0.45s', rotate: '-30deg', size: 'w-2 h-2', color: 'bg-[#E8D5A7]' },
  { left: '81%', delay: '0.2s', rotate: '16deg', size: 'w-1.5 h-2.5', color: 'bg-[#D4AF37]' },
  { left: '91%', delay: '0.6s', rotate: '-14deg', size: 'w-2 h-1.5', color: 'bg-[#C5A059]' },
];

export const UXStatePhoneMockups: React.FC<UXStatePhoneMockupsProps> = ({
  stateNum,
  isPlaying,
  onExploreCollection,
}) => {
  const [slowStepIdx, setSlowStepIdx] = useState(0);
  const [liteMode, setLiteMode] = useState(false);
  const [didFixTypo, setDidFixTypo] = useState(false);
  const [activeHint, setActiveHint] = useState<string | null>(null);

  useEffect(() => {
    setActiveHint(null);
    setDidFixTypo(false);
    setLiteMode(false);
    setSlowStepIdx(0);
  }, [stateNum]);

  useEffect(() => {
    if (stateNum !== 5 || !isPlaying || liteMode) return;
    const timer = setInterval(() => {
      setSlowStepIdx((prev) => (prev < SLOW_PROGRESS_STEPS.length - 1 ? prev + 1 : 0));
    }, 650);
    return () => clearInterval(timer);
  }, [stateNum, isPlaying, liteMode]);

  const currentPercent = SLOW_PROGRESS_STEPS[slowStepIdx];

  const renderScreenContent = () => {
    switch (stateNum) {
      /* 01/10 — EMPTY STATE (Wishlist Page) */
      case 1:
        return (
          <div className="flex-1 flex flex-col bg-[#FAF8F4] text-[#1F1F1F] px-4 py-4">
            <div className="flex items-center justify-between border-b border-[#1F1F1F]/10 pb-2.5">
              <span className="text-[11px] font-serif font-semibold tracking-wide text-[#1F1F1F]">
                Saved Wishlist
              </span>
              <span className="text-[9px] uppercase tracking-[0.16em] text-[#8A6D1D] font-semibold">
                0 Articles
              </span>
            </div>

            <div className="flex-1 flex flex-col items-center justify-center text-center px-3">
              <div className="w-16 h-16 rounded-full bg-white border border-[#D4AF37]/45 shadow-sm flex items-center justify-center mb-4">
                <Heart className="w-7 h-7 text-[#D4AF37] stroke-[1.5]" />
              </div>

              <h4
                className="font-serif text-[17px] font-semibold text-[#1F1F1F] leading-snug mb-1.5"
                style={{ textWrap: 'balance' }}
              >
                Your Wishlist Is Empty
              </h4>
              <p className="text-[11px] text-[#1F1F1F]/65 leading-relaxed max-w-[205px] mb-5">
                You haven&apos;t saved any fabrics yet.
              </p>

              <button
                type="button"
                onClick={onExploreCollection}
                className="w-full max-w-[205px] py-2.5 px-4 bg-[#1F1F1F] hover:bg-[#D4AF37] text-white hover:text-[#1F1F1F] text-[10px] font-semibold tracking-[0.16em] uppercase transition-colors shadow-sm"
              >
                Explore Our Collection
              </button>
            </div>
          </div>
        );

      /* 02/10 — LOADING STATE (Niaz Cloth House Homepage) */
      case 2:
        return (
          <div className="flex-1 flex flex-col bg-[#FAF8F4] text-[#1F1F1F] px-3.5 py-3 overflow-hidden">
            {/* Hero Skeleton */}
            <div className="relative h-20 w-full bg-[#E6E1D8] overflow-hidden mb-3 rounded-[4px]">
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/60 to-transparent animate-nch-shimmer" />
              <div className="p-2.5 space-y-1.5 relative z-10">
                <div className="h-2 w-16 bg-[#D3CCC0] rounded-xs" />
                <div className="h-3.5 w-32 bg-[#C8C0B2] rounded-xs" />
                <div className="h-2.5 w-20 bg-[#D4AF37]/35 rounded-xs mt-1" />
              </div>
            </div>

            {/* Category Cards Skeleton */}
            <div className="grid grid-cols-3 gap-2 mb-3">
              {['Women', 'Men', 'Boski'].map((cat) => (
                <div
                  key={cat}
                  className="relative h-9 bg-[#EBE6DD] border border-[#1F1F1F]/8 overflow-hidden rounded-[3px] flex items-center justify-center"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/55 to-transparent animate-nch-shimmer" />
                  <div className="h-2 w-10 bg-[#CFC8BC] rounded-xs" />
                </div>
              ))}
            </div>

            {/* 2x2 Product Grid Skeleton */}
            <div className="grid grid-cols-2 gap-2.5 flex-1">
              {[0, 1, 2, 3].map((slot) => (
                <div key={slot} className="flex flex-col space-y-1.5">
                  <div className="relative aspect-[4/3] w-full bg-[#E3DDD3] overflow-hidden rounded-[3px]">
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/65 to-transparent animate-nch-shimmer" />
                  </div>
                  <div className="h-2.5 w-4/5 bg-[#DCD6CA] rounded-xs" />
                  <div className="h-2 w-1/2 bg-[#D4AF37]/40 rounded-xs" />
                </div>
              ))}
            </div>
          </div>
        );

      /* 03/10 — PAYMENT ERROR STATE (Checkout Page - Concept Preview) */
      case 3:
        return (
          <div className="flex-1 flex flex-col bg-[#FAF8F4] text-[#1F1F1F] px-3.5 py-3">
            <div className="flex items-center justify-between border-b border-[#1F1F1F]/10 pb-2 mb-2.5">
              <span className="text-[11px] font-serif font-semibold">Checkout</span>
              <span className="text-[9px] uppercase tracking-[0.14em] text-[#1F1F1F]/55">
                UX Concept
              </span>
            </div>

            <div className="flex-1 flex flex-col justify-center items-center text-center bg-white border border-[#1F1F1F]/10 p-3.5 shadow-xs">
              <div className="w-11 h-11 rounded-full bg-red-50 border border-red-200 flex items-center justify-center mb-2.5">
                <AlertCircle className="w-5 h-5 text-red-700" />
              </div>

              <h4
                className="font-serif text-[14px] font-bold text-[#1F1F1F] leading-snug mb-1.5"
                style={{ textWrap: 'balance' }}
              >
                Payment Could Not Be Completed
              </h4>
              <p className="text-[10.5px] text-[#1F1F1F]/70 leading-relaxed mb-3.5">
                Your payment was unsuccessful. Please check your payment details or try another method.
              </p>

              <div className="w-full space-y-1.5">
                <button
                  type="button"
                  onClick={() => setActiveHint('Retrying secure card verification...')}
                  className="w-full py-2 px-3 bg-[#1F1F1F] hover:bg-[#333333] text-white text-[10px] font-semibold tracking-wider uppercase flex items-center justify-center gap-1.5 transition-colors"
                >
                  <RotateCcw className="w-3 h-3" />
                  <span>Try Again</span>
                </button>

                <button
                  type="button"
                  onClick={() => setActiveHint('Opened COD, Bank Transfer & Wallet options')}
                  className="w-full py-2 px-3 bg-white border border-[#1F1F1F]/25 hover:border-[#D4AF37] text-[#1F1F1F] text-[10px] font-semibold tracking-wider uppercase flex items-center justify-center gap-1.5 transition-colors"
                >
                  <CreditCard className="w-3 h-3 text-[#8A6D1D]" />
                  <span>Choose Another Payment Method</span>
                </button>

                <button
                  type="button"
                  onClick={() => setActiveHint('Opening Niaz Cloth House WhatsApp Desk')}
                  className="w-full py-2 px-3 bg-[#D4AF37] hover:bg-[#C5A059] text-[#1F1F1F] text-[10px] font-bold tracking-wider uppercase flex items-center justify-center gap-1.5 transition-colors"
                >
                  <MessageCircle className="w-3 h-3" />
                  <span>Order Through WhatsApp</span>
                </button>
              </div>

              {activeHint && (
                <p className="mt-2 text-[9.5px] text-[#8A6D1D] font-medium">{activeHint}</p>
              )}
            </div>
          </div>
        );

      /* 04/10 — NO INTERNET STATE (Product Listing / Homepage) */
      case 4:
        return (
          <div className="flex-1 flex flex-col bg-[#FAF8F4] text-[#1F1F1F] overflow-hidden">
            {/* Gold Offline Notification Banner */}
            <div className="bg-[#D4AF37] text-[#1F1F1F] px-3 py-2 flex items-center justify-between gap-2">
              <div className="flex items-center gap-1.5 min-w-0">
                <WifiOff className="w-3.5 h-3.5 shrink-0" />
                <span className="text-[9.5px] font-bold leading-tight">
                  You&apos;re Offline. Showing products from your last visit.
                </span>
              </div>
            </div>

            <div className="px-3 pt-2 pb-1 flex items-center justify-between text-[9px] text-[#1F1F1F]/70 border-b border-[#1F1F1F]/8">
              <span className="uppercase tracking-[0.14em] font-semibold">Saved Catalog</span>
              <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-[#1F1F1F] text-[#D4AF37] font-semibold rounded-xs">
                <RefreshCw className="w-2.5 h-2.5 animate-spin" />
                <span>Reconnecting...</span>
              </span>
            </div>

            {/* Cached Authentic Clothing Products */}
            <div className="grid grid-cols-2 gap-2 p-3 flex-1">
              {[
                {
                  title: 'Gulistan Embroidered Suit',
                  fabric: '3-Pc Chiffon',
                  img: '/images/gulistan_embroidered_suit.jpg',
                },
                {
                  title: 'Pure Chinese Boski',
                  fabric: 'Men’s Silk Cut',
                  img: '/images/product_mens_pure_boski_1791569243386.jpg',
                },
                {
                  title: 'Botanical Printed Lawn',
                  fabric: 'Women’s 3-Piece',
                  img: printedLawnImg,
                },
                {
                  title: 'Kamalia Khaddar & Lelan',
                  fabric: 'Winter Suiting',
                  img: khaddarLelanImg,
                },
              ].map((item) => (
                <div
                  key={item.title}
                  className="bg-white border border-[#1F1F1F]/10 p-1.5 flex flex-col"
                >
                  <div className="aspect-[4/3] w-full overflow-hidden bg-[#ECE7DE] mb-1">
                    <img
                      src={item.img}
                      alt={item.title}
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <p className="text-[9.5px] font-semibold leading-tight text-[#1F1F1F] line-clamp-1">
                    {item.title}
                  </p>
                  <p className="text-[8.5px] text-[#8A6D1D] font-medium mt-0.5">{item.fabric}</p>
                </div>
              ))}
            </div>
          </div>
        );

      /* 05/10 — SLOW NETWORK STATE (Women's Collection Page - Concept Preview) */
      case 5:
        return (
          <div className="flex-1 flex flex-col bg-[#FAF8F4] text-[#1F1F1F] px-3.5 py-3">
            <div className="flex items-center justify-between border-b border-[#1F1F1F]/10 pb-2 mb-2.5">
              <div>
                <h4 className="font-serif text-[12px] font-bold text-[#1F1F1F]">
                  Women&apos;s Collection
                </h4>
                <p className="text-[9px] text-[#1F1F1F]/60">
                  {liteMode ? 'Lite Mode Active · Fast Text View' : 'Loading Your Collection...'}
                </p>
              </div>
              <span className="text-[10px] font-mono font-bold text-[#8A6D1D] tabular-nums">
                {liteMode ? 'LITE' : `${currentPercent}%`}
              </span>
            </div>

            {/* Meaningful Loading Progress Bar */}
            {!liteMode && (
              <div className="mb-2.5">
                <div className="w-full h-1.5 bg-[#E6E0D6] overflow-hidden mb-1">
                  <div
                    className="h-full bg-[#D4AF37] transition-all duration-300"
                    style={{ width: `${currentPercent}%` }}
                  />
                </div>
                <div className="flex items-center justify-between text-[8px] font-mono text-[#1F1F1F]/55 tabular-nums">
                  {SLOW_PROGRESS_STEPS.map((pct) => (
                    <span
                      key={pct}
                      className={pct === currentPercent ? 'text-[#8A6D1D] font-bold' : ''}
                    >
                      {pct}%
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Progressive Image Slots OR Lite Mode Compact Cards */}
            <div className="grid grid-cols-2 gap-2 flex-1">
              {[
                {
                  name: 'Zari Chiffon Dress',
                  detail: 'Women’s Embroidered',
                  img: '/images/zari_chiffon_dress.jpg',
                },
                {
                  name: 'Floral Printed Lawn',
                  detail: '3-Piece Unstitched',
                  img: printedLawnImg,
                },
                {
                  name: 'Mehr Velvet Lawn',
                  detail: 'Festive Winter Edit',
                  img: '/images/mehr_velvet_lawn.jpg',
                },
                {
                  name: 'Aura Cotton Karandi',
                  detail: 'Textured Suiting',
                  img: '/images/aura_cotton_karandi.jpg',
                },
              ].map((suit, idx) => {
                const loaded = liteMode ? false : currentPercent >= (idx + 2) * 20;
                return (
                  <div
                    key={suit.name}
                    className="bg-white border border-[#1F1F1F]/10 p-1.5 flex flex-col justify-between"
                  >
                    {liteMode ? (
                      <div className="py-2 px-1 bg-[#F5F1E8] border border-[#D4AF37]/25 mb-1">
                        <span className="text-[8px] uppercase tracking-wider text-[#8A6D1D] font-semibold block">
                          Low-Data Card
                        </span>
                        <span className="text-[9.5px] font-semibold text-[#1F1F1F] block leading-tight mt-0.5">
                          {suit.name}
                        </span>
                      </div>
                    ) : (
                      <div className="relative aspect-[4/3] w-full bg-[#EAE4DA] overflow-hidden mb-1">
                        {loaded ? (
                          <img
                            src={suit.img}
                            alt={suit.name}
                            referrerPolicy="no-referrer"
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center bg-[#E7E1D7]">
                            <span className="text-[10px] font-mono font-bold text-[#1F1F1F]/60 tabular-nums">
                              {Math.min(100, currentPercent + idx * 5)}%
                            </span>
                          </div>
                        )}
                      </div>
                    )}
                    <div>
                      <p className="text-[9.5px] font-semibold text-[#1F1F1F] line-clamp-1">
                        {suit.name}
                      </p>
                      <p className="text-[8px] text-[#1F1F1F]/60">{suit.detail}</p>
                    </div>
                  </div>
                );
              })}
            </div>

            <button
              type="button"
              onClick={() => setLiteMode((prev) => !prev)}
              className="mt-2.5 w-full py-2 px-3 bg-[#1F1F1F] hover:bg-[#D4AF37] text-white hover:text-[#1F1F1F] text-[9.5px] font-semibold tracking-wider uppercase flex items-center justify-center gap-1.5 transition-colors"
            >
              <Zap className="w-3 h-3 text-[#D4AF37]" />
              <span>{liteMode ? 'Restore Full Images' : 'Switch to Lite Mode'}</span>
            </button>
          </div>
        );

      /* 06/10 — NO SEARCH RESULTS (Website Search Page) */
      case 6:
        return (
          <div className="flex-1 flex flex-col bg-[#FAF8F4] text-[#1F1F1F] px-3.5 py-3">
            {/* Search Input Bar */}
            <div className="flex items-center gap-2 bg-white border border-[#1F1F1F]/20 px-2.5 py-2 mb-3">
              <Search className="w-3.5 h-3.5 text-[#1F1F1F]/60 shrink-0" />
              <span className="text-[11px] font-medium text-[#1F1F1F] flex-1 truncate">
                {didFixTypo ? 'embroidered suit' : 'embrodery suit'}
              </span>
              <span className="text-[9px] font-semibold uppercase text-[#8A6D1D]">Clear</span>
            </div>

            <div className="flex-1 flex flex-col justify-between bg-white border border-[#1F1F1F]/10 p-3 text-center">
              <div>
                <h4 className="font-serif text-[14px] font-bold text-[#1F1F1F]">
                  {didFixTypo ? 'Showing Results for Embroidered Suit' : 'No Products Found'}
                </h4>
                {!didFixTypo ? (
                  <button
                    type="button"
                    onClick={() => setDidFixTypo(true)}
                    className="mt-1 text-[10.5px] text-[#1F1F1F]/75 hover:text-[#1F1F1F]"
                  >
                    Did you mean{' '}
                    <span className="font-bold text-[#8A6D1D] underline underline-offset-2">
                      embroidered suit
                    </span>
                    ?
                  </button>
                ) : (
                  <p className="mt-1 text-[10px] text-emerald-700 font-medium">
                    Matched Women&apos;s Embroidered Lawn &amp; Chiffon
                  </p>
                )}
              </div>

              <div className="my-2.5 text-left">
                <p className="text-[9px] uppercase tracking-[0.16em] text-[#1F1F1F]/55 font-semibold mb-1.5">
                  Popular Search Categories
                </p>
                <div className="grid grid-cols-2 gap-1.5">
                  {[
                    "Women's Embroidery",
                    'Printed Fabrics',
                    "Men's Unstitched",
                    'Cotton Collection',
                  ].map((cat) => (
                    <button
                      key={cat}
                      type="button"
                      onClick={() => setActiveHint(`Selected category: ${cat}`)}
                      className="py-1.5 px-2 bg-[#FAF8F4] border border-[#D4AF37]/35 hover:border-[#D4AF37] text-[9.5px] font-semibold text-[#1F1F1F] text-left truncate transition-colors"
                    >
                      {cat}
                    </button>
                  ))}
                </div>
                {activeHint && (
                  <p className="text-[9px] text-[#8A6D1D] mt-1 font-medium">{activeHint}</p>
                )}
              </div>

              <button
                type="button"
                onClick={onExploreCollection}
                className="w-full py-2 px-3 bg-[#1F1F1F] hover:bg-[#D4AF37] text-white hover:text-[#1F1F1F] text-[10px] font-semibold tracking-wider uppercase transition-colors"
              >
                Explore All Products
              </button>
            </div>
          </div>
        );

      /* 07/10 — PERMISSION DENIED (WhatsApp / Camera Upload - Concept Preview) */
      case 7:
        return (
          <div className="flex-1 flex flex-col bg-[#FAF8F4] text-[#1F1F1F] px-3.5 py-3">
            <div className="flex items-center justify-between border-b border-[#1F1F1F]/10 pb-2 mb-2.5">
              <span className="text-[11px] font-serif font-semibold">Receipt &amp; Fabric Enquiry</span>
              <span className="text-[9px] uppercase tracking-[0.14em] text-[#1F1F1F]/55">
                UX Concept
              </span>
            </div>

            <div className="flex-1 flex flex-col items-center justify-center text-center bg-white border border-[#1F1F1F]/10 p-4">
              {/* Custom Camera Permission Illustration */}
              <div className="relative w-16 h-16 rounded-full bg-[#FAF8F4] border border-[#D4AF37]/45 flex items-center justify-center mb-3">
                <CameraOff className="w-7 h-7 text-[#1F1F1F]" />
                <span className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-[#D4AF37] text-[#1F1F1F] flex items-center justify-center text-[10px] font-bold">
                  !
                </span>
              </div>

              <h4
                className="font-serif text-[15px] font-bold text-[#1F1F1F] mb-1.5"
                style={{ textWrap: 'balance' }}
              >
                Camera Access Required
              </h4>
              <p className="text-[10.5px] text-[#1F1F1F]/70 leading-relaxed mb-4">
                We use your camera only to capture product enquiries or upload payment receipts.
              </p>

              <div className="w-full space-y-2">
                <button
                  type="button"
                  onClick={() => setActiveHint('Opened browser & device camera permissions')}
                  className="w-full py-2 px-3 bg-[#1F1F1F] hover:bg-[#333333] text-white text-[10px] font-semibold tracking-wider uppercase flex items-center justify-center gap-1.5 transition-colors"
                >
                  <Settings className="w-3.5 h-3.5 text-[#D4AF37]" />
                  <span>Allow in Settings</span>
                </button>

                <button
                  type="button"
                  onClick={() => setActiveHint('Opened photo gallery picker without camera')}
                  className="w-full py-2 px-3 bg-[#FAF8F4] border border-[#D4AF37] hover:bg-[#D4AF37]/15 text-[#1F1F1F] text-[10px] font-semibold tracking-wider uppercase flex items-center justify-center gap-1.5 transition-colors"
                >
                  <ImageIcon className="w-3.5 h-3.5 text-[#8A6D1D]" />
                  <span>Upload From Gallery</span>
                </button>
              </div>

              {activeHint && (
                <p className="mt-2 text-[9.5px] text-[#8A6D1D] font-medium">{activeHint}</p>
              )}
            </div>
          </div>
        );

      /* 08/10 — SESSION EXPIRED (Shopping Cart - Concept Preview) */
      case 8:
        return (
          <div className="flex-1 relative flex flex-col bg-[#FAF8F4] text-[#1F1F1F] px-3 py-3 overflow-hidden">
            {/* Saved Products & Quantities Visible Behind Popup */}
            <div className="space-y-2 opacity-60 blur-[1px] select-none pointer-events-none">
              <div className="flex items-center justify-between border-b border-[#1F1F1F]/15 pb-1.5">
                <span className="text-[11px] font-serif font-bold">Shopping Bag</span>
                <span className="text-[10px] font-mono">3 Items</span>
              </div>
              {[
                {
                  title: 'Gulistan Embroidered 3-Piece',
                  qty: 'Qty: 1',
                  img: '/images/gulistan_embroidered_suit.jpg',
                },
                {
                  title: 'Men’s Pure Chinese Boski',
                  qty: 'Qty: 1',
                  img: '/images/product_mens_pure_boski_1791569243386.jpg',
                },
                {
                  title: 'Egyptian Cotton Latha Cut',
                  qty: 'Qty: 1',
                  img: '/images/product_mens_latha_cotton_1791569254348.jpg',
                },
              ].map((cartRow) => (
                <div
                  key={cartRow.title}
                  className="flex items-center gap-2 bg-white border border-[#1F1F1F]/15 p-2"
                >
                  <img
                    src={cartRow.img}
                    alt={cartRow.title}
                    referrerPolicy="no-referrer"
                    className="w-10 h-10 object-cover shrink-0"
                  />
                  <div className="min-w-0 flex-1">
                    <p className="text-[10px] font-semibold truncate">{cartRow.title}</p>
                    <p className="text-[9px] font-mono text-[#8A6D1D]">{cartRow.qty}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Frosted Scrim + Centered Premium Session Popup */}
            <div className="absolute inset-0 bg-[#1F1F1F]/55 backdrop-blur-[2px] flex items-center justify-center p-3.5">
              <div className="w-full bg-white border border-[#D4AF37] p-4 text-center shadow-2xl">
                <div className="w-10 h-10 rounded-full bg-[#FAF8F4] border border-[#D4AF37]/50 flex items-center justify-center mx-auto mb-2.5">
                  <Lock className="w-4 h-4 text-[#8A6D1D]" />
                </div>

                <h4 className="font-serif text-[15px] font-bold text-[#1F1F1F] mb-1">
                  You Were Signed Out
                </h4>
                <p className="text-[10.5px] text-[#1F1F1F]/70 leading-relaxed mb-3.5">
                  Your cart containing 3 clothing items has been saved.
                </p>

                <div className="space-y-1.5">
                  <button
                    type="button"
                    onClick={() => setActiveHint('Preserving bag & restoring account session...')}
                    className="w-full py-2 px-3 bg-[#1F1F1F] hover:bg-[#D4AF37] text-white hover:text-[#1F1F1F] text-[10px] font-semibold tracking-wider uppercase transition-colors"
                  >
                    Sign In &amp; Continue
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveHint('Continuing with saved guest bag')}
                    className="w-full py-2 px-3 bg-[#FAF8F4] border border-[#1F1F1F]/20 hover:border-[#D4AF37] text-[#1F1F1F] text-[10px] font-semibold tracking-wider uppercase transition-colors"
                  >
                    Continue Shopping
                  </button>
                </div>

                {activeHint && (
                  <p className="mt-2 text-[9px] text-[#8A6D1D] font-medium">{activeHint}</p>
                )}
              </div>
            </div>
          </div>
        );

      /* 09/10 — FORM VALIDATION (Create Account / Customer Registration - Concept Preview) */
      case 9:
        return (
          <div className="flex-1 flex flex-col bg-[#FAF8F4] text-[#1F1F1F] px-3.5 py-3">
            <div className="flex items-center justify-between border-b border-[#1F1F1F]/10 pb-2 mb-2.5">
              <span className="font-serif text-[12px] font-bold">Create Account</span>
              <span className="text-[9px] uppercase tracking-[0.14em] text-[#1F1F1F]/55">
                UX Concept
              </span>
            </div>

            <div className="space-y-2 flex-1 bg-white border border-[#1F1F1F]/10 p-3">
              {/* Full Name */}
              <div>
                <label className="block text-[9px] font-semibold uppercase tracking-wider text-[#1F1F1F]/75 mb-0.5">
                  Full Name
                </label>
                <div className="flex items-center justify-between border border-emerald-600/50 bg-[#FAF8F4] px-2.5 py-1.5 text-[10.5px]">
                  <span>Tariq Mehmood</span>
                  <Check className="w-3 h-3 text-emerald-700 shrink-0" />
                </div>
              </div>

              {/* Email Address (Error Highlighted in Red) */}
              <div>
                <label className="block text-[9px] font-semibold uppercase tracking-wider text-red-700 mb-0.5">
                  Email Address *
                </label>
                <div className="flex items-center justify-between border-2 border-red-600 bg-red-50/60 px-2.5 py-1.5 text-[10.5px] text-red-900">
                  <span className="font-medium">tariq.niaz@</span>
                  <AlertCircle className="w-3.5 h-3.5 text-red-600 shrink-0" />
                </div>
                <p className="text-[9px] text-red-700 font-medium leading-snug mt-1">
                  Please enter a valid email address, such as customer@example.com.
                </p>
              </div>

              {/* Phone Number with +92 Pakistan Code */}
              <div>
                <label className="block text-[9px] font-semibold uppercase tracking-wider text-[#1F1F1F]/75 mb-0.5">
                  Phone Number
                </label>
                <div className="flex items-center justify-between border border-emerald-600/50 bg-[#FAF8F4] px-2.5 py-1.5 text-[10.5px] font-mono">
                  <span>+92 334 6565636</span>
                  <Check className="w-3 h-3 text-emerald-700 shrink-0" />
                </div>
              </div>

              {/* Password */}
              <div>
                <label className="block text-[9px] font-semibold uppercase tracking-wider text-[#1F1F1F]/75 mb-0.5">
                  Password
                </label>
                <div className="flex items-center justify-between border border-[#1F1F1F]/20 bg-[#FAF8F4] px-2.5 py-1.5 text-[10.5px]">
                  <span>••••••••••••</span>
                  <Check className="w-3 h-3 text-emerald-700 shrink-0" />
                </div>
              </div>
            </div>
          </div>
        );

      /* 10/10 — SUCCESS STATE (Order Confirmation Page - Concept Preview) */
      case 10:
      default:
        return (
          <div className="flex-1 relative flex flex-col bg-[#FAF8F4] text-[#1F1F1F] px-3.5 py-3 overflow-hidden">
            {/* Animated Gold Confetti Layer */}
            <div className="absolute inset-0 pointer-events-none overflow-hidden" aria-hidden="true">
              {CONFETTI_PIECES.map((piece, idx) => (
                <span
                  key={idx}
                  className={`absolute top-0 rounded-[1px] ${piece.size} ${piece.color} animate-nch-confetti`}
                  style={{
                    left: piece.left,
                    animationDelay: piece.delay,
                    transform: `rotate(${piece.rotate})`,
                  }}
                />
              ))}
            </div>

            <div className="relative z-10 flex-1 flex flex-col justify-between bg-white border border-[#D4AF37]/45 p-3 text-center shadow-xs">
              <div>
                <div className="w-11 h-11 rounded-full bg-emerald-600 text-white flex items-center justify-center mx-auto mb-2 shadow-md">
                  <CheckCircle2 className="w-6 h-6" />
                </div>

                <h4
                  className="font-serif text-[14px] font-bold text-[#1F1F1F] leading-snug"
                  style={{ textWrap: 'balance' }}
                >
                  Your Order Has Been Placed!
                </h4>
                <p className="text-[10px] text-[#1F1F1F]/70 mt-0.5">
                  Thank you for shopping with Niaz Cloth House.
                </p>

                <div className="mt-2 inline-flex items-center gap-1.5 bg-[#FAF8F4] border border-[#D4AF37]/40 px-2.5 py-1 text-[10px]">
                  <span className="text-[#1F1F1F]/65 uppercase tracking-wider">Order</span>
                  <span className="font-mono font-bold text-[#8A6D1D] tabular-nums">#NCH-48213</span>
                </div>
              </div>

              {/* Compact Order Summary with Realistic Pakistani Clothing Imagery */}
              <div className="my-2 text-left bg-[#FAF8F4] border border-[#1F1F1F]/10 p-2 space-y-1.5">
                <div className="flex items-center justify-between text-[8.5px] uppercase tracking-wider text-[#1F1F1F]/60 font-semibold">
                  <span>Order Summary (Sample Concept)</span>
                  <PackageCheck className="w-3 h-3 text-[#8A6D1D]" />
                </div>
                <div className="flex items-center gap-2">
                  <img
                    src="/images/zari_chiffon_dress.jpg"
                    alt="Women's Embroidered Chiffon Suit"
                    referrerPolicy="no-referrer"
                    className="w-8 h-8 object-cover shrink-0"
                  />
                  <div className="min-w-0 flex-1">
                    <p className="text-[9.5px] font-semibold truncate">Zari Chiffon 3-Piece</p>
                    <p className="text-[8px] text-[#1F1F1F]/60">Women&apos;s Embroidered · Qty 1</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <img
                    src="/images/product_mens_pure_boski_1791569243386.jpg"
                    alt="Men's Pure Boski Suiting"
                    referrerPolicy="no-referrer"
                    className="w-8 h-8 object-cover shrink-0"
                  />
                  <div className="min-w-0 flex-1">
                    <p className="text-[9.5px] font-semibold truncate">Pure Chinese Boski</p>
                    <p className="text-[8px] text-[#1F1F1F]/60">Men&apos;s 4.5m Cut · Qty 1</p>
                  </div>
                </div>
              </div>

              <div className="space-y-1.5">
                <button
                  type="button"
                  onClick={() => setActiveHint('Concept preview: opens order shipment timeline')}
                  className="w-full py-2 px-3 bg-[#1F1F1F] hover:bg-[#D4AF37] text-white hover:text-[#1F1F1F] text-[9.5px] font-semibold tracking-wider uppercase transition-colors"
                >
                  Track Your Order
                </button>
                <button
                  type="button"
                  onClick={onExploreCollection}
                  className="w-full py-1.5 px-3 bg-white border border-[#1F1F1F]/20 hover:border-[#D4AF37] text-[#1F1F1F] text-[9.5px] font-semibold tracking-wider uppercase transition-colors"
                >
                  Continue Shopping
                </button>
              </div>

              {activeHint && (
                <p className="mt-1 text-[8.5px] text-[#8A6D1D] font-medium">{activeHint}</p>
              )}
            </div>
          </div>
        );
    }
  };

  return (
    <div className="w-full max-w-[272px] sm:max-w-[288px] mx-auto bg-[#1A1A1F] rounded-[34px] p-2.5 border border-[#D4AF37]/45 shadow-[0_24px_60px_rgba(0,0,0,0.65)]">
      {/* Inner Smartphone Screen */}
      <div className="bg-[#FAF8F4] rounded-[25px] overflow-hidden flex flex-col h-[438px] sm:h-[456px] border border-black/40">
        {/* Top Phone Speaker Notch + Brand Top Bar */}
        <div className="bg-[#1F1F1F] text-[#F7F4EE] px-3.5 pt-2 pb-2.5 shrink-0">
          <div className="w-16 h-1.5 bg-black/70 rounded-full mx-auto mb-2" />
          <div className="flex items-center justify-between gap-2">
            <Menu className="w-3.5 h-3.5 text-[#D4AF37]" />
            <div className="text-center leading-none">
              <span className="font-serif text-[11px] font-semibold tracking-[0.18em] text-[#D4AF37] block">
                NIAZ
              </span>
              <span className="text-[6.5px] tracking-[0.22em] text-[#F7F4EE]/70 uppercase">
                CLOTH HOUSE · EST. 1970
              </span>
            </div>
            <div className="flex items-center gap-1.5 text-[#E8D5A7]">
              <Search className="w-3 h-3" />
              <ShoppingBag className="w-3 h-3" />
            </div>
          </div>
        </div>

        {/* Screen State Body */}
        {renderScreenContent()}

        {/* Subtle Mobile Storefront Footer Bar */}
        <div className="bg-[#1F1F1F] text-[#E8D5A7]/75 px-3 py-1.5 flex items-center justify-between text-[8px] uppercase tracking-[0.14em] shrink-0">
          <span className="flex items-center gap-1">
            <Sparkles className="w-2.5 h-2.5 text-[#D4AF37]" />
            <span>Dress To Impress</span>
          </span>
          <span>Paris Bazaar</span>
        </div>
      </div>
    </div>
  );
};
