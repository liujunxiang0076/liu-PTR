/** 币种 - 只保留人民币 */
export type Currency = 'CNY';

/** 费用类别 - 添加驻场 */
export type ExpenseCategory = '交通' | '住宿' | '餐饮' | '通讯' | '办公' | '驻场' | '其他';

/** 定位信息 */
export type LocationInfo = {
  latitude: number;
  longitude: number;
  address?: string;
  timestamp: number;
};

/** 费用记录 */
export type ExpenseItem = {
  id: string;
  amount: number;
  currency: Currency;
  category: ExpenseCategory;
  notes: string;
  tripId: string | null;
  createdAt: number;
  dateKey: string;
  location?: LocationInfo;
};

/** 差旅行程 */
export type Trip = {
  id: string;
  name: string;
  destination: string;
  startDate: string;
  endDate: string;
  budget: number;
  createdAt: number;
};

/** 汇率快照 */
export type ExchangeRates = {
  base: Currency;
  rates: Record<Currency, number>;
  updatedAt: number;
};

/** 按日期分组的费用表 */
export type ExpensesMap = Record<string, ExpenseItem[]>;

export const CURRENCIES: Currency[] = ['CNY'];

export const CATEGORIES: ExpenseCategory[] = ['交通', '住宿', '餐饮', '通讯', '办公', '驻场', '其他'];

/** 分类颜色 */
export const CATEGORY_COLORS: Record<ExpenseCategory, string> = {
  '交通': '#4A90D9',
  '住宿': '#F5A623',
  '餐饮': '#7ED321',
  '通讯': '#9B59B6',
  '办公': '#E74C3C',
  '驻场': '#1ABC9C',
  '其他': '#95A5A6',
};

/** 每日预算配置（单位：CNY） */
export type DailyBudget = {
  workday: number;
  weekend: number;
  holiday: number;
};

/** 币种符号 */
export const CURRENCY_SYMBOLS: Record<Currency, string> = {
  CNY: '¥',
};
