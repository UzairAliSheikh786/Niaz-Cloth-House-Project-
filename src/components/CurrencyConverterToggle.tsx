import React from 'react';
import { Globe, RefreshCw } from 'lucide-react';
import { useShop } from '../context/ShopContext';
import { CurrencyCode } from '../utils/currency';

interface CurrencyConverterToggleProps {
  variant?: 'compact' | 'expanded';
  className?: string;
}

export const CurrencyConverterToggle: React.FC<CurrencyConverterToggleProps> = ({
  variant = 'compact',
  className = '',
}) => {
  const {
    currency,
    setCurrency,
    exchangeRatePkrPerUsd,
    exchangeRateSource,
    exchangeRateMarketDate,
    isRefreshingRate,
    refreshExchangeRate,
    showToast,
  } = useShop();

  const handleSelect = (next: CurrencyCode) => {
    if (next === currency) return;
    setCurrency(next);
    showToast(
      next === 'USD'
        ? `Prices converted to USD (Market rate: 1 USD = ₨ ${exchangeRatePkrPerUsd.toFixed(2)})`
        : 'Prices switched back to PKR (₨)'
    );
  };

  const rateCaption =
    exchangeRateSource === 'fallback'
      ? `Baseline rate: 1 USD = ₨ ${exchangeRatePkrPerUsd.toFixed(2)} PKR`
      : `Daily market rate (${exchangeRateMarketDate}): 1 USD = ₨ ${exchangeRatePkrPerUsd.toFixed(2)} PKR`;

  if (variant === 'expanded') {
    return (
      <div className={`space-y-1.5 min-w-0 ${className}`}>
        <div className="flex items-center justify-between gap-2 flex-wrap min-w-0">
          <div className="flex items-center gap-1.5 text-[11px] uppercase tracking-wider text-[#E8D5A7] font-semibold">
            <Globe className="w-3.5 h-3.5 text-[#D4AF37] shrink-0" />
            <span>Display Currency</span>
          </div>

          <div
            role="group"
            aria-label="Currency selector"
            className="inline-flex items-center bg-[#060608] border border-[#C5A059]/40 p-0.5 shrink-0"
          >
            {(['PKR', 'USD'] as const).map((code) => {
              const active = currency === code;
              return (
                <button
                  key={code}
                  type="button"
                  onClick={() => handleSelect(code)}
                  aria-pressed={active}
                  className={`px-2.5 py-1 text-[11px] font-semibold tracking-wider uppercase transition-colors ${
                    active
                      ? 'bg-[#D4AF37] text-[#060608]'
                      : 'text-[#E8D5A7]/80 hover:text-[#F7F4EE]'
                  }`}
                >
                  {code === 'PKR' ? 'PKR ₨' : 'USD $'}
                </button>
              );
            })}
          </div>
        </div>
        <div className="flex items-center justify-between gap-2 text-[10px] text-[#F7F4EE]/60 tabular-nums">
          <span className="min-w-0 break-words">{rateCaption}</span>
          <button
            type="button"
            onClick={() => refreshExchangeRate(true)}
            disabled={isRefreshingRate}
            title="Sync latest market rate"
            className="inline-flex items-center gap-1 text-[#D4AF37] hover:text-[#E8D5A7] shrink-0 disabled:opacity-50"
          >
            <RefreshCw className={`w-3 h-3 ${isRefreshingRate ? 'animate-spin' : ''}`} />
            <span>Sync</span>
          </button>
        </div>
      </div>
    );
  }

  return (
    <div
      role="group"
      aria-label="Display currency toggle"
      title={`Switch display currency (Daily market rate: 1 USD = ₨ ${exchangeRatePkrPerUsd.toFixed(2)})`}
      className={`inline-flex items-center bg-[#0B0B0E] border border-[#C5A059]/35 p-0.5 shrink-0 ${className}`}
    >
      {(['PKR', 'USD'] as const).map((code) => {
        const active = currency === code;
        return (
          <button
            key={code}
            type="button"
            onClick={() => handleSelect(code)}
            aria-pressed={active}
            className={`px-2 py-1 text-[10px] sm:text-[11px] font-semibold tracking-wider uppercase transition-colors leading-none ${
              active
                ? 'bg-[#D4AF37] text-[#060608]'
                : 'text-[#E8D5A7]/80 hover:text-[#F7F4EE]'
            }`}
          >
            {code === 'PKR' ? 'PKR' : 'USD'}
          </button>
        );
      })}
    </div>
  );
};
