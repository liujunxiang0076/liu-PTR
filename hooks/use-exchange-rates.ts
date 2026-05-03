import { useCallback, useMemo } from 'react';

import { type Currency } from '@/types/expense';
import { DEFAULT_RATES } from '@/constants/currency';

/** 静态汇率 hook，提供默认汇率和币种转换 */
export function useExchangeRates() {
  const rates = useMemo(() => ({
    base: 'CNY' as const,
    rates: { ...DEFAULT_RATES },
    updatedAt: Date.now(),
  }), []);

  const convert = useCallback(
    (amount: number, from: Currency) => {
      if (from === 'CNY') return amount;
      return amount / (rates.rates[from] ?? 1);
    },
    [rates]
  );

  return { rates, convert };
}
