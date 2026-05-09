import {
  formatAmount, getCategoryColor, compactAmount, sumExpenses, uid,
  computeBudgetProgress, computeCategoryTotals,
  BUDGET_WARN_THRESHOLD, BUDGET_DANGER_THRESHOLD,
} from '@/constants/currency';
import { type ExpenseCategory, type ExpenseItem } from '@/types/expense';

describe('formatAmount', () => {
  it('格式化人民币金额', () => {
    expect(formatAmount(100)).toBe('¥100.00');
    expect(formatAmount(0.5)).toBe('¥0.50');
  });
});

describe('getCategoryColor', () => {
  it('返回各分类颜色', () => {
    expect(getCategoryColor('交通')).toBe('#4A90D9');
    expect(getCategoryColor('餐饮')).toBe('#7ED321');
    expect(getCategoryColor('驻场')).toBe('#1ABC9C');
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

describe('sumExpenses', () => {
  it('空数组返回0', () => {
    expect(sumExpenses([])).toBe(0);
  });

  it('累加多项费用', () => {
    const expenses = [
      { amount: 100 },
      { amount: 100 },
    ] as ExpenseItem[];
    expect(sumExpenses(expenses)).toBe(200);
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
    const result = computeCategoryTotals([]);
    for (const cat of ['交通', '住宿', '餐饮', '通讯', '办公', '驻场', '其他']) {
      expect(result[cat]).toBe(0);
    }
  });

  it('按分类累加费用', () => {
    const expenses = [
      { category: '交通' as ExpenseCategory, amount: 100 },
      { category: '交通' as ExpenseCategory, amount: 50 },
      { category: '餐饮' as ExpenseCategory, amount: 30 },
    ] as ExpenseItem[];
    const result = computeCategoryTotals(expenses);
    expect(result['交通']).toBe(150);
    expect(result['餐饮']).toBe(30);
    expect(result['住宿']).toBe(0);
  });
});
