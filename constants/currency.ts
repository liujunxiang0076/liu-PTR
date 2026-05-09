import {
  type Currency,
  type ExpenseCategory,
  type ExpenseItem,
  CURRENCY_SYMBOLS,
  CATEGORIES,
  CATEGORY_COLORS,
} from '@/types/expense';

/** 格式化金额显示 */
export function formatAmount(amount: number, currency: Currency = 'CNY'): string {
  const symbol = CURRENCY_SYMBOLS[currency];
  return `${symbol}${amount.toFixed(2)}`;
}

/** 获取分类颜色 */
export function getCategoryColor(category: ExpenseCategory): string {
  return CATEGORY_COLORS[category];
}

/** 紧凑金额格式（日历格用） */
export function compactAmount(amount: number): string {
  if (amount <= 0) return '';
  if (amount >= 10000) return `${(amount / 10000).toFixed(1)}万`;
  if (amount >= 1000) return `${(amount / 1000).toFixed(1)}k`;
  return Math.round(amount).toString();
}

let uidCounter = 0;
/** 生成唯一 id */
export function uid() {
  uidCounter++;
  return Date.now().toString(36) + uidCounter.toString(36) + Math.random().toString(36).slice(2, 10);
}

/** 计算一组费用的总额 */
export function sumExpenses(expenses: ExpenseItem[]): number {
  return expenses.reduce((sum, e) => sum + e.amount, 0);
}

/** 预算进度颜色阈值 */
export const BUDGET_WARN_THRESHOLD = 70;
export const BUDGET_DANGER_THRESHOLD = 100;

/** 计算预算进度条数据 */
export function computeBudgetProgress(spent: number, budget: number) {
  const rawPct = budget > 0 ? (spent / budget) * 100 : 0;
  const pct = Math.min(rawPct, 100);
  const barColor = rawPct > BUDGET_DANGER_THRESHOLD
    ? '#E85D5D'
    : rawPct > BUDGET_WARN_THRESHOLD
      ? '#F5A623'
      : '#7ED321';
  return { rawPct, pct, barColor };
}

/** 按分类汇总费用 */
export function computeCategoryTotals(expenses: ExpenseItem[]): Record<string, number> {
  const totals: Record<string, number> = {};
  for (const cat of CATEGORIES) totals[cat] = 0;
  for (const e of expenses) {
    totals[e.category] = (totals[e.category] ?? 0) + e.amount;
  }
  return totals;
}
