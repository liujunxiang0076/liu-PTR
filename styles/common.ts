/**
 * 公共样式
 * 提取各组件共用的样式，减少重复定义
 */

import { StyleSheet } from 'react-native';
import { Spacing, BorderRadius, FontSize, FontWeight } from '@/constants/design-tokens';

export const commonStyles = StyleSheet.create({
  // ── 容器 ──────────────────────────────────────────────
  /** 页面容器 */
  pageContainer: {
    flex: 1,
  },

  /** 滚动内容容器 */
  scrollContent: {
    padding: Spacing.lg,
    gap: Spacing.md,
  },

  /** 安全区域容器 */
  safeContainer: {
    flex: 1,
    paddingHorizontal: Spacing.md,
  },

  // ── 卡片 ──────────────────────────────────────────────
  /** 标准卡片 */
  card: {
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    gap: Spacing.md,
  },

  /** 紧凑卡片 */
  cardCompact: {
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    gap: Spacing.sm,
  },

  // ── 布局 ──────────────────────────────────────────────
  /** 行布局 */
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  /** 行布局（带间距） */
  rowWithGap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },

  /** 居中布局 */
  center: {
    alignItems: 'center',
    justifyContent: 'center',
  },

  /** 均匀分布 */
  spaceAround: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },

  /** 两端对齐 */
  spaceBetween: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  // ── 标题 ──────────────────────────────────────────────
  /** 区域标题 */
  sectionTitle: {
    fontSize: FontSize.md,
    fontWeight: FontWeight.semibold,
    marginBottom: Spacing.xs,
  },

  /** 页面标题 */
  pageTitle: {
    fontSize: FontSize.xxl,
    fontWeight: FontWeight.bold,
  },

  /** 卡片标题 */
  cardTitle: {
    fontSize: FontSize.lg,
    fontWeight: FontWeight.semibold,
  },

  // ── 文本 ──────────────────────────────────────────────
  /** 主要文本 */
  textPrimary: {
    fontSize: FontSize.md,
    fontWeight: FontWeight.medium,
  },

  /** 次要文本 */
  textSecondary: {
    fontSize: FontSize.sm,
  },

  /** 小型文本 */
  textSmall: {
    fontSize: FontSize.xs,
  },

  /** 强调文本 */
  textBold: {
    fontWeight: FontWeight.bold,
  },

  // ── 数字显示 ──────────────────────────────────────────
  /** 大数字（金额） */
  numberLarge: {
    fontSize: FontSize.xxl,
    fontWeight: FontWeight.bold,
  },

  /** 中数字 */
  numberMedium: {
    fontSize: FontSize.lg,
    fontWeight: FontWeight.semibold,
  },

  /** 小数字 */
  numberSmall: {
    fontSize: FontSize.sm,
    fontWeight: FontWeight.semibold,
  },

  // ── 摘要行 ──────────────────────────────────────────
  /** 摘要容器 */
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },

  /** 摘要项 */
  summaryItem: {
    alignItems: 'center',
    gap: Spacing.xs,
  },

  /** 摘要值 */
  summaryValue: {
    fontSize: FontSize.xxl,
    fontWeight: FontWeight.bold,
  },

  /** 摘要标签 */
  summaryLabel: {
    fontSize: FontSize.sm,
  },

  // ── 按钮 ──────────────────────────────────────────────
  /** 主按钮 */
  buttonPrimary: {
    height: 48,
    borderRadius: BorderRadius.lg,
    alignItems: 'center',
    justifyContent: 'center',
  },

  /** 主按钮文本 */
  buttonPrimaryText: {
    color: '#fff',
    fontSize: FontSize.lg,
    fontWeight: FontWeight.semibold,
  },

  /** 小按钮 */
  buttonSmall: {
    height: 36,
    borderRadius: BorderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: Spacing.md,
  },

  /** 小按钮文本 */
  buttonSmallText: {
    color: '#fff',
    fontSize: FontSize.sm,
    fontWeight: FontWeight.medium,
  },

  // ── 输入框 ──────────────────────────────────────────
  /** 标准输入框 */
  input: {
    height: 44,
    borderRadius: BorderRadius.md,
    paddingHorizontal: Spacing.md,
    fontSize: FontSize.md,
  },

  // ── 徽章 ──────────────────────────────────────────────
  /** 小徽章 */
  badgeSmall: {
    borderRadius: BorderRadius.full,
    paddingHorizontal: Spacing.xs,
    paddingVertical: 0,
    minWidth: 14,
    alignItems: 'center',
  },

  /** 小徽章文本 */
  badgeSmallText: {
    fontSize: FontSize.xs - 1,
    fontWeight: FontWeight.bold,
    lineHeight: 12,
  },

  // ── 分隔线 ──────────────────────────────────────────
  /** 细分隔线 */
  separator: {
    height: StyleSheet.hairlineWidth,
  },

  // ── 间距 ──────────────────────────────────────────────
  /** 底部安全间距 */
  bottomSpacer: {
    height: Spacing.xxl,
  },
});

/**
 * 创建带主题色的样式
 */
export function createThemedStyles(colors: {
  tint: string;
  text: string;
  muted: string;
  border: string;
  panelBg: string;
  inputBg: string;
}) {
  return StyleSheet.create({
    card: {
      ...commonStyles.card,
      borderColor: colors.border,
      backgroundColor: colors.panelBg,
    },
    cardCompact: {
      ...commonStyles.cardCompact,
      borderColor: colors.border,
      backgroundColor: colors.panelBg,
    },
    input: {
      ...commonStyles.input,
      backgroundColor: colors.inputBg,
      color: colors.text,
    },
    separator: {
      ...commonStyles.separator,
      backgroundColor: colors.border,
    },
    textMuted: {
      color: colors.muted,
    },
    textTint: {
      color: colors.tint,
    },
  });
}
