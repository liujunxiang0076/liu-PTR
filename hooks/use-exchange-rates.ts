import { useCallback, useState } from 'react';

import { type Currency, type ExchangeRates } from '@/types/expense';
import { DEFAULT_RATES } from '@/constants/currency';

export function useExchangeRates() {
  const [rates] = useState<ExchangeRates>({
    base: 'CNY',
    rates: { ...DEFAULT_RATES },
    updatedAt: Date.now(),
  });

  const convert = useCallback(
    (amount: number, from: Currency) => {
      if (from === 'CNY') return amount;
      const rate = rates.rates[from] ?? 1;
      return amount / rate;
    },
    [rates]
  );

  return { rates, convert };
}
