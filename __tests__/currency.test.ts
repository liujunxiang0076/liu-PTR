import { formatAmount, convertToCNY, getCategoryColor, compactAmount, sumExpensesInCNY, uid } from '@/constants/currency';
import { type Currency, type ExpenseItem } from '@/types/expense';

const RATES: Record<Currency, number> = {
  CNY: 1,
  USD: 0.14,
  EUR: 0.13,
  JPY: 20.5,
  GBP: 0.11,
};

describe('formatAmount', () => {
  it('格式化人民币金额', () => {
    expect(formatAmount(100, 'CNY')).toBe('¥100.00');
    expect(formatAmount(0.5, 'CNY')).toBe('¥0.50');
  });

  it('格式化日元取整', () => {
    expect(formatAmount(100.7, 'JPY')).toBe('¥101');
    expect(formatAmount(999, 'JPY')).toBe('¥999');
  });

  it('格式化美元', () => {
    expect(formatAmount(50.5, 'USD')).toBe('$50.50');
  });

  it('格式化欧元', () => {
    expect(formatAmount(200, 'EUR')).toBe('€200.00');
  });

  it('格式化英镑', () => {
    expect(formatAmount(30, 'GBP')).toBe('£30.00');
  });
});

describe('convertToCNY', () => {
  it('人民币原样返回', () => {
    expect(convertToCNY(100, 'CNY', RATES)).toBe(100);
  });

  it('美元转人民币', () => {
    const result = convertToCNY(1, 'USD', RATES);
    expect(result).toBeCloseTo(1 / 0.14, 5);
  });

  it('日元转人民币', () => {
    const result = convertToCNY(20.5, 'JPY', RATES);
    expect(result).toBeCloseTo(1, 5);
  });

  it('未知币种回退默认汇率', () => {
    const result = convertToCNY(1, 'USD', { CNY: 1, USD: 0.5, EUR: 0.13, JPY: 20.5, GBP: 0.11 });
    expect(result).toBeCloseTo(2, 5);
  });
});

describe('getCategoryColor', () => {
  it('返回各分类颜色', () => {
    expect(getCategoryColor('交通')).toBe('#4A90D9');
    expect(getCategoryColor('餐饮')).toBe('#7ED321');
    expect(getCategoryColor('其他')).toBe('#95A5A6');
  });
});

describe('compactAmount', () => {
  it('零或负数返回空字符串', () => {
    expect(compactAmount(0)).toBe('');
    expect(compactAmount(-5)).toBe('');
  });

  it('小于1000返回整数字符串', () => {
    expect(compactAmount(999)).toBe('999');
    expect(compactAmount(50.5)).toBe('51');
  });

  it('1000-9999返回k格式', () => {
    expect(compactAmount(1200)).toBe('1.2k');
    expect(compactAmount(5000)).toBe('5.0k');
  });

  it('大于等于10000返回万格式', () => {
    expect(compactAmount(10000)).toBe('1.0万');
    expect(compactAmount(35000)).toBe('3.5万');
  });
});

describe('sumExpensesInCNY', () => {
  it('空数组返回0', () => {
    expect(sumExpensesInCNY([], RATES)).toBe(0);
  });

  it('累加多项费用', () => {
    const expenses = [
      { amount: 100, currency: 'CNY' as Currency },
      { amount: 100, currency: 'CNY' as Currency },
    ] as ExpenseItem[];
    expect(sumExpensesInCNY(expenses, RATES)).toBe(200);
  });

  it('混合币种累加', () => {
    const expenses = [
      { amount: 100, currency: 'CNY' as Currency },
      { amount: 1, currency: 'USD' as Currency },
    ] as ExpenseItem[];
    const result = sumExpensesInCNY(expenses, RATES);
    expect(result).toBeCloseTo(100 + 1 / 0.14, 2);
  });
});

describe('uid', () => {
  it('生成唯一id', () => {
    const ids = new Set(Array.from({ length: 100 }, () => uid()));
    expect(ids.size).toBe(100);
  });

  it('返回非空字符串', () => {
    expect(uid().length).toBeGreaterThan(0);
  });
});
