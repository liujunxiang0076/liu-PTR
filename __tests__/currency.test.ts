import {
  formatAmount, convertToCNY, getCategoryColor, compactAmount, sumExpensesInCNY, uid,
  computeBudgetProgress, computeCategoryTotals,
  BUDGET_WARN_THRESHOLD, BUDGET_DANGER_THRESHOLD,
} from '@/constants/currency';
import { type Currency, type ExpenseCategory, type ExpenseItem } from '@/types/expense';

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

describe('computeBudgetProgress', () => {
  it('正常预算内返回绿色', () => {
    const result = computeBudgetProgress(50, 100);
    expect(result.rawPct).toBe(50);
    expect(result.pct).toBe(50);
    expect(result.barColor).toBe('#7ED321');
  });

  it('超过警告阈值返回黄色', () => {
    const threshold = BUDGET_WARN_THRESHOLD + 1;
    const result = computeBudgetProgress(threshold, 100);
    expect(result.rawPct).toBe(threshold);
    expect(result.barColor).toBe('#F5A623');
  });

  it('超过危险阈值返回红色', () => {
    const result = computeBudgetProgress(120, 100);
    expect(result.rawPct).toBe(120);
    expect(result.pct).toBe(100);
    expect(result.barColor).toBe('#E85D5D');
  });

  it('预算为零或负数时返回零进度', () => {
    const result = computeBudgetProgress(50, 0);
    expect(result.rawPct).toBe(0);
    expect(result.pct).toBe(0);
    expect(result.barColor).toBe('#7ED321');
  });

  it('pct 上限为 100', () => {
    const result = computeBudgetProgress(200, 100);
    expect(result.pct).toBe(100);
    expect(result.rawPct).toBe(200);
  });
});

describe('computeCategoryTotals', () => {
  it('空数组返回所有分类为零', () => {
    const result = computeCategoryTotals([], RATES);
    for (const cat of ['交通', '住宿', '餐饮', '通讯', '办公', '其他']) {
      expect(result[cat]).toBe(0);
    }
  });

  it('按分类累加费用（CNY）', () => {
    const expenses = [
      { category: '交通' as ExpenseCategory, amount: 100, currency: 'CNY' as Currency },
      { category: '交通' as ExpenseCategory, amount: 50, currency: 'CNY' as Currency },
      { category: '餐饮' as ExpenseCategory, amount: 30, currency: 'CNY' as Currency },
    ] as ExpenseItem[];
    const result = computeCategoryTotals(expenses, RATES);
    expect(result['交通']).toBe(150);
    expect(result['餐饮']).toBe(30);
    expect(result['住宿']).toBe(0);
  });

  it('混合币种转换后累加', () => {
    const expenses = [
      { category: '交通' as ExpenseCategory, amount: 100, currency: 'CNY' as Currency },
      { category: '交通' as ExpenseCategory, amount: 1, currency: 'USD' as Currency },
    ] as ExpenseItem[];
    const result = computeCategoryTotals(expenses, RATES);
    expect(result['交通']).toBeCloseTo(100 + 1 / 0.14, 2);
  });
});
