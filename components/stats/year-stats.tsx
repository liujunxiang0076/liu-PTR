import { useMemo } from 'react';
import { StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { CategoryBreakdown } from './category-breakdown';
import { MonthlyChart } from './monthly-chart';
import { type ExpenseItem, type Currency } from '@/types/expense';

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
  sectionTitleStyle: object;
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
  sectionTitleStyle,
}: Props) {
  return (
    <>
      {/* 年度汇总 */}
      <View style={[styles.card, { borderColor, backgroundColor: panelBg }]}>
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
      </View>

      {/* 月度趋势柱状图 */}
      <View style={[styles.card, { borderColor, backgroundColor: panelBg }]}>
        <ThemedText style={sectionTitleStyle}>月度趋势</ThemedText>
        <MonthlyChart monthlyTotals={monthlyTotals} />
      </View>

      {/* 年度分类统计 */}
      <View style={[styles.card, { borderColor, backgroundColor: panelBg }]}>
        <ThemedText style={sectionTitleStyle}>分类统计</ThemedText>
        <CategoryBreakdown expenses={yearExpenses} rates={rates} emptyText="本年暂无费用记录" />
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  card: {
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: 14,
    padding: 16,
    gap: 12,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  summaryItem: {
    alignItems: 'center',
    gap: 4,
  },
  summaryValue: {
    fontSize: 22,
    fontWeight: '700',
  },
  summaryLabel: {
    fontSize: 12,
  },
});
