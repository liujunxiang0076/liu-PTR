/**
 * 年度统计组件
 * 显示年度汇总信息
 */

import { StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Card } from '@/components/ui/card';
import { CategoryBreakdown } from './category-breakdown';
import { MonthlyChart } from './monthly-chart';
import { type ExpenseItem, type Currency } from '@/types/expense';
import { Spacing, FontSize, FontWeight } from '@/constants/design-tokens';

type Props = {
  year: number;
  yearTotal: number;
  yearCount: number;
  yearExpenses: ExpenseItem[];
  monthlyTotals: number[];
  rates: Record<Currency, number>;
  tint: string;
  borderColor: string;
  panelBg: string;
  textColor: string;
  mutedColor: string;
};

export function YearStats({
  year,
  yearTotal,
  yearCount,
  yearExpenses,
  monthlyTotals,
  rates,
  tint,
  borderColor,
  panelBg,
  textColor,
  mutedColor,
}: Props) {
  return (
    <>
      {/* 年度汇总 */}
      <Card borderColor={borderColor} backgroundColor={panelBg}>
        <View style={styles.summaryRow}>
          <View style={styles.summaryItem}>
            <ThemedText style={[styles.summaryValue, { color: tint }]}>
              ¥{yearTotal.toFixed(2)}
            </ThemedText>
            <ThemedText style={[styles.summaryLabel, { color: mutedColor }]}>年度支出</ThemedText>
          </View>
          <View style={styles.summaryItem}>
            <ThemedText style={[styles.summaryValue, { color: textColor }]}>{yearCount}</ThemedText>
            <ThemedText style={[styles.summaryLabel, { color: mutedColor }]}>费用笔数</ThemedText>
          </View>
          <View style={styles.summaryItem}>
            <ThemedText style={[styles.summaryValue, { color: textColor }]}>
              ¥{yearCount > 0 ? (yearTotal / yearCount).toFixed(0) : '0'}
            </ThemedText>
            <ThemedText style={[styles.summaryLabel, { color: mutedColor }]}>笔均金额</ThemedText>
          </View>
        </View>
      </Card>

      {/* 月度趋势柱状图 */}
      <Card borderColor={borderColor} backgroundColor={panelBg}>
        <ThemedText style={styles.sectionTitle}>月度趋势</ThemedText>
        <MonthlyChart monthlyTotals={monthlyTotals} />
      </Card>

      {/* 年度分类统计 */}
      <CategoryBreakdown
        expenses={yearExpenses}
        rates={rates}
        borderColor={borderColor}
        panelBg={panelBg}
        sectionTitle="分类统计"
        emptyText="本年暂无费用记录"
      />
    </>
  );
}

const styles = StyleSheet.create({
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  summaryItem: {
    alignItems: 'center',
    gap: Spacing.xs,
  },
  summaryValue: {
    fontSize: FontSize.xxl,
    fontWeight: FontWeight.bold,
  },
  summaryLabel: {
    fontSize: FontSize.sm,
  },
  sectionTitle: {
    fontSize: FontSize.md,
    fontWeight: FontWeight.semibold,
    marginBottom: Spacing.xs,
  },
});
