export type CurrencyCode = 'PKR' | 'USD';

export const DEFAULT_PKR_PER_USD = 278.5;
export const MOCK_PKR_PER_USD = DEFAULT_PKR_PER_USD;
export const CURRENCY_STORAGE_KEY = 'nch_display_currency';
export const EXCHANGE_RATE_STORAGE_KEY = 'nch_daily_fx_rate_v1';
const FX_REFRESH_INTERVAL_MS = 6 * 60 * 60 * 1000; // 6 hours

export interface CurrencyConfig {
  code: CurrencyCode;
  symbol: string;
  label: string;
}

export interface ExchangeRateSnapshot {
  pkrPerUsd: number;
  source: 'live' | 'cache' | 'fallback';
  provider: string;
  marketDate: string;
  fetchedAt: string;
}

export const CURRENCY_CONFIG: Record<CurrencyCode, CurrencyConfig> = {
  PKR: {
    code: 'PKR',
    symbol: '₨',
    label: 'Pakistani Rupee',
  },
  USD: {
    code: 'USD',
    symbol: '$',
    label: 'US Dollar',
  },
};

export const getStoredCurrency = (): CurrencyCode => {
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      const saved = window.localStorage.getItem(CURRENCY_STORAGE_KEY);
      if (saved === 'PKR' || saved === 'USD') {
        return saved;
      }
    }
  } catch {
    // Ignore storage access errors
  }
  return 'PKR';
};

export const saveStoredCurrency = (currency: CurrencyCode): void => {
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      window.localStorage.setItem(CURRENCY_STORAGE_KEY, currency);
    }
  } catch {
    // Ignore storage quota/access errors
  }
};

export const getDefaultExchangeRateSnapshot = (): ExchangeRateSnapshot => ({
  pkrPerUsd: DEFAULT_PKR_PER_USD,
  source: 'fallback',
  provider: 'baseline',
  marketDate: new Date().toISOString().slice(0, 10),
  fetchedAt: new Date(0).toISOString(),
});

export const getStoredExchangeRate = (): ExchangeRateSnapshot | null => {
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      const raw = window.localStorage.getItem(EXCHANGE_RATE_STORAGE_KEY);
      if (!raw) return null;
      const parsed = JSON.parse(raw) as Partial<ExchangeRateSnapshot>;
      if (
        typeof parsed.pkrPerUsd === 'number' &&
        Number.isFinite(parsed.pkrPerUsd) &&
        parsed.pkrPerUsd > 150 &&
        parsed.pkrPerUsd < 600
      ) {
        return {
          pkrPerUsd: Number(parsed.pkrPerUsd.toFixed(2)),
          source:
            parsed.source === 'live' || parsed.source === 'cache' || parsed.source === 'fallback'
              ? parsed.source
              : 'cache',
          provider: typeof parsed.provider === 'string' ? parsed.provider : 'cache',
          marketDate:
            typeof parsed.marketDate === 'string'
              ? parsed.marketDate
              : new Date().toISOString().slice(0, 10),
          fetchedAt:
            typeof parsed.fetchedAt === 'string' ? parsed.fetchedAt : new Date().toISOString(),
        };
      }
    }
  } catch {
    // Ignore invalid storage data
  }
  return null;
};

export const saveStoredExchangeRate = (snapshot: ExchangeRateSnapshot): void => {
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      window.localStorage.setItem(EXCHANGE_RATE_STORAGE_KEY, JSON.stringify(snapshot));
    }
  } catch {
    // Ignore storage quota errors
  }
};

export const isExchangeRateStale = (snapshot: ExchangeRateSnapshot | null): boolean => {
  if (!snapshot) return true;
  if (snapshot.source === 'fallback') return true;
  const fetchedTime = new Date(snapshot.fetchedAt).getTime();
  if (!Number.isFinite(fetchedTime)) return true;
  const todayStr = new Date().toISOString().slice(0, 10);
  if (snapshot.marketDate !== todayStr && Date.now() - fetchedTime > 60 * 60 * 1000) {
    return true;
  }
  return Date.now() - fetchedTime >= FX_REFRESH_INTERVAL_MS;
};

export const fetchDailyMarketRate = async (
  forceRefresh = false
): Promise<ExchangeRateSnapshot> => {
  const endpoint = forceRefresh ? '/api/exchange-rate?refresh=true' : '/api/exchange-rate';
  const controller = typeof AbortController !== 'undefined' ? new AbortController() : null;
  const timeout = controller ? setTimeout(() => controller.abort(), 5500) : null;

  try {
    const response = await fetch(endpoint, {
      method: 'GET',
      headers: { Accept: 'application/json' },
      signal: controller?.signal,
    });
    if (!response.ok) {
      throw new Error(`FX API HTTP ${response.status}`);
    }
    const data = await response.json();
    const rate = Number(data?.pkrPerUsd);
    if (!Number.isFinite(rate) || rate <= 150 || rate >= 600) {
      throw new Error('Invalid PKR/USD rate payload');
    }
    const snapshot: ExchangeRateSnapshot = {
      pkrPerUsd: Number(rate.toFixed(2)),
      source:
        data?.source === 'live' || data?.source === 'cache' || data?.source === 'fallback'
          ? data.source
          : 'live',
      provider: typeof data?.provider === 'string' ? data.provider : 'market',
      marketDate:
        typeof data?.marketDate === 'string'
          ? data.marketDate
          : new Date().toISOString().slice(0, 10),
      fetchedAt:
        typeof data?.fetchedAt === 'string' ? data.fetchedAt : new Date().toISOString(),
    };
    saveStoredExchangeRate(snapshot);
    return snapshot;
  } finally {
    if (timeout) clearTimeout(timeout);
  }
};

export const convertFromPKR = (
  amountPkr: number,
  targetCurrency: CurrencyCode,
  pkrPerUsd: number = DEFAULT_PKR_PER_USD
): number => {
  const safeAmount = Number.isFinite(amountPkr) ? amountPkr : 0;
  if (targetCurrency === 'USD') {
    const rate = pkrPerUsd > 0 ? pkrPerUsd : DEFAULT_PKR_PER_USD;
    return safeAmount / rate;
  }
  return safeAmount;
};

export const formatCurrencyAmount = (
  amountPkr: number,
  currency: CurrencyCode,
  pkrPerUsd: number = DEFAULT_PKR_PER_USD
): string => {
  const safeAmount = Number.isFinite(amountPkr) ? amountPkr : 0;
  if (currency === 'USD') {
    const usdAmount = convertFromPKR(safeAmount, 'USD', pkrPerUsd);
    return `$${usdAmount.toLocaleString('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
  }
  return `₨ ${Math.round(safeAmount).toLocaleString('en-PK')}`;
};
