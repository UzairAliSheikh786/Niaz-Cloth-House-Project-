import React, { useState } from 'react';
import { Globe, RefreshCw } from 'lucide-react';
import { useShop } from '../context/ShopContext';
import { useNavigation } from '../context/NavigationContext';
import { CurrencyCode } from '../utils/currency';

export const FloatingCurrencyDock: React.FC = () => {
  const {
    currency,
    setCurrency,
    exchangeRatePkrPerUsd,
    exchangeRateSource,
    exchangeRateMarketDate,
    isRefreshingRate,
    refreshExchangeRate,
    isCheckoutOpen,
    showToast,
  } = useShop();
  const { currentPage } = useNavigation();
  const [hovered, setHovered] = useState(false);

  if (isCheckoutOpen || currentPage === 'admin') {
    return null;
  }

  const handleSelect = (next: CurrencyCode) => {
    if (next === currency) return;
    setCurrency(next);
    showToast(
      next === 'USD'
        ? `Prices converted to USD (Market rate: 1 USD = ₨ ${exchangeRatePkrPerUsd.toFixed(2)})`
        : 'Prices switched back to PKR (₨)'
    );
  };

  const rateStatusLabel =
    exchangeRateSource === 'fallback'
      ? 'Baseline rate (offline)'
      : `Daily market rate · ${exchangeRateMarketDate}`;

  return (
    <aside
      aria-label="Currency Converter"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className="fixed bottom-5 left-3 sm:bottom-auto sm:left-0 sm:top-1/2 sm:-translate-y-1/2 z-30 select-none print:hidden"
    >
      <div className="relative flex items-center">
        {/* Compact Side Rail (stacked vertical on sm+, compact horizontal pill on <sm) */}
        <div
          role="group"
          aria-label="Switch display currency"
          className="flex sm:flex-col items-stretch bg-[#0A0A0E]/95 backdrop-blur-md border border-[#C5A059]/40 sm:border-l-0 shadow-[0_8px_24px_rgba(0,0,0,0.45)] p-0.5 sm:p-1 gap-0.5 sm:gap-1"
        >
          <button
            type="button"
            onClick={() => refreshExchangeRate(true)}
            disabled={isRefreshingRate}
            title={`Refresh daily market rate (1 USD = ₨ ${exchangeRatePkrPerUsd.toFixed(2)})`}
            aria-label="Refresh daily exchange rate"
            className="hidden sm:flex items-center justify-center py-1 text-[#C5A059]/80 hover:text-[#D4AF37] border-b border-[#C5A059]/20 transition-colors disabled:opacity-50"
          >
            {isRefreshingRate ? (
              <RefreshCw className="w-3.5 h-3.5 animate-spin" aria-hidden="true" />
            ) : (
              <Globe className="w-3.5 h-3.5" aria-hidden="true" />
            )}
          </button>

          {(['PKR', 'USD'] as const).map((code) => {
            const active = currency === code;
            return (
              <button
                key={code}
                type="button"
                onClick={() => handleSelect(code)}
                aria-pressed={active}
                title={
                  code === 'USD'
                    ? `Show prices in USD (1 USD = ₨ ${exchangeRatePkrPerUsd.toFixed(2)})`
                    : 'Show prices in Pakistani Rupees (PKR)'
                }
                className={`px-2.5 py-1.5 sm:px-2 sm:py-2 text-[10px] sm:text-[11px] font-semibold tracking-wider uppercase transition-colors flex sm:flex-col items-center justify-center gap-1 sm:gap-0.5 leading-none focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#D4AF37] ${
                  active
                    ? 'bg-[#D4AF37] text-[#060608]'
                    : 'text-[#E8D5A7]/80 hover:text-[#F7F4EE] hover:bg-white/5'
                }`}
              >
                <span className="text-[11px] font-bold leading-none">
                  {code === 'PKR' ? '₨' : '$'}
                </span>
                <span>{code}</span>
              </button>
            );
          })}
        </div>

        {/* Desktop Hover Rate Tooltip */}
        <div
          role="tooltip"
          className={`hidden md:block absolute left-full ml-2.5 top-1/2 -translate-y-1/2 transition-all duration-200 pointer-events-none ${
            hovered ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-1.5'
          }`}
        >
          <div className="bg-[#0E0E12] text-[#F7F4EE] border border-[#C5A059]/40 px-3 py-2 shadow-2xl whitespace-nowrap space-y-0.5">
            <span className="block text-[10px] uppercase tracking-[0.18em] text-[#D4AF37] font-semibold">
              Live Currency Converter
            </span>
            <span className="block text-[11px] text-[#F7F4EE]/95 font-mono tabular-nums">
              1 USD = ₨ {exchangeRatePkrPerUsd.toFixed(2)} PKR
            </span>
            <span className="block text-[10px] text-[#F7F4EE]/60">
              {rateStatusLabel}
            </span>
          </div>
        </div>
      </div>
    </aside>
  );
};
