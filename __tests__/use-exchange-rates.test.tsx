import { renderHook } from '@testing-library/react-native';
import { useExchangeRates } from '@/hooks/use-exchange-rates';
import { DEFAULT_RATES } from '@/constants/currency';
import { type Currency } from '@/types/expense';

describe('useExchangeRates', () => {
  it('返回默认汇率', () => {
    const { result } = renderHook(() => useExchangeRates());
    expect(result.current.rates.rates).toEqual(DEFAULT_RATES);
    expect(result.current.rates.base).toBe('CNY');
  });

  it('CNY 原样返回', () => {
    const { result } = renderHook(() => useExchangeRates());
    expect(result.current.convert(100, 'CNY')).toBe(100);
  });

  it('美元转人民币', () => {
    const { result } = renderHook(() => useExchangeRates());
    const converted = result.current.convert(1, 'USD');
    expect(converted).toBeCloseTo(1 / 0.14, 5);
  });

  it('日元转人民币', () => {
    const { result } = renderHook(() => useExchangeRates());
    const converted = result.current.convert(20.5, 'JPY');
    expect(converted).toBeCloseTo(1, 5);
  });

  it('未知币种回退汇率为1', () => {
    const { result } = renderHook(() => useExchangeRates());
    const converted = result.current.convert(100, 'XXX' as Currency);
    expect(converted).toBe(100);
  });
});
