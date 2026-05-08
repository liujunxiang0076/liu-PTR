/**
 * 设计系统 - Design Tokens
 * 统一管理间距、圆角、字号等设计规范
 */

/** 间距 */
export const Spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  xxl: 32,
} as const;

/** 圆角 */
export const BorderRadius = {
  xs: 4,
  sm: 6,
  md: 10,
  lg: 14,
  xl: 20,
  full: 9999,
} as const;

/** 字号 */
export const FontSize = {
  xs: 10,
  sm: 12,
  md: 14,
  lg: 16,
  xl: 18,
  xxl: 22,
  display: 28,
} as const;

/** 字重 */
export const FontWeight = {
  normal: '400' as const,
  medium: '500' as const,
  semibold: '600' as const,
  bold: '700' as const,
};

/** 行高 */
export const LineHeight = {
  tight: 1.2,
  normal: 1.5,
  relaxed: 1.75,
} as const;

/** 阴影 */
export const Shadow = {
  sm: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  md: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  lg: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 5,
  },
} as const;

/** 动画时长 */
export const Animation = {
  fast: 150,
  normal: 280,
  slow: 400,
} as const;

/** 分类颜色 */
export const CategoryColors = {
  '交通': '#4A90D9',
  '住宿': '#F5A623',
  '餐饮': '#7ED321',
  '通讯': '#9B59B6',
  '办公': '#E74C3C',
  '其他': '#95A5A6',
} as const;

/** 状态颜色 */
export const StatusColors = {
  success: '#7ED321',
  warning: '#F5A623',
  danger: '#E85D5D',
  info: '#4A90D9',
} as const;

/** 预算阈值 */
export const BudgetThresholds = {
  warn: 70,
  danger: 100,
} as const;
