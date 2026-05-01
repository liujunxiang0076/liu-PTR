import {
  type Currency,
  type ExchangeRates,
  type ExpenseCategory,
  type ExpenseItem,
  CURRENCY_SYMBOLS,
  CATEGORY_COLORS,
} from '@/types/expense';

/** 默认汇率（相对 CNY） */
export const DEFAULT_RATES: Record<Currency, number> = {
  CNY: 1,
  USD: 0.14,
  EUR: 0.13,
  JPY: 20.5,
  GBP: 0.11,
};

/** 格式化金额显示 */
export function formatAmount(amount: number, currency: Currency): string {
  const symbol = CURRENCY_SYMBOLS[currency];
  const fixed = currency === 'JPY' ? Math.round(amount).toString() : amount.toFixed(2);
  return `${symbol}${fixed}`;
}

/** 将任意币种金额转为 CNY */
export function convertToCNY(amount: number, from: Currency, rates: Record<Currency, number>): number {
  if (from === 'CNY') return amount;
  const rate = rates[from] ?? DEFAULT_RATES[from] ?? 1;
  return amount / rate;
}

/** 获取分类颜色 */
export function getCategoryColor(category: ExpenseCategory): string {
  return CATEGORY_COLORS[category];
}

/** 紧凑金额格式（日历格用） */
export function compactAmount(cnyAmount: number): string {
  if (cnyAmount <= 0) return '';
  if (cnyAmount >= 10000) return `${(cnyAmount / 10000).toFixed(1)}万`;
  if (cnyAmount >= 1000) return `${(cnyAmount / 1000).toFixed(1)}k`;
  return Math.round(cnyAmount).toString();
}

let uidCounter = 0;
/** 生成唯一 id */
export function uid() {
  uidCounter++;
  return Date.now().toString(36) + uidCounter.toString(36) + Math.random().toString(36).slice(2, 10);
}

/** 计算一组费用的 CNY 总额 */
export function sumExpensesInCNY(expenses: ExpenseItem[], rates: Record<Currency, number>): number {
  return expenses.reduce((sum, e) => sum + convertToCNY(e.amount, e.currency, rates), 0);
}
