/**
 * 月度统计组件
 * 显示月度汇总信息
 */

import { useCallback, useMemo } from 'react';
import { Alert, StyleSheet, View } from 'react-native';
import * as Clipboard from 'expo-clipboard';

import { ThemedText } from '@/components/themed-text';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CategoryBreakdown } from './category-breakdown';
import { DailyChart } from './daily-chart';
import { type Trip, type ExpenseItem, type Currency } from '@/types/expense';
import { generateCSV } from '@/utils/csv-export';
import { Spacing, FontSize, FontWeight } from '@/constants/design-tokens';

type Props = {
  year: number;
  month: number;
  monthTotal: number;
  monthCount: number;
  monthExpenses: ExpenseItem[];
  monthTrips: Trip[];
  getDailyTotal: (dateKey: string) => number;
  rates: Record<Currency, number>;
  allTrips: Trip[];
  tint: string;
  borderColor: string;
  panelBg: string;
  textColor: string;
  mutedColor: string;
};

export function MonthStats({
  year,
  month,
  monthTotal,
  monthCount,
  monthExpenses,
  monthTrips,
  getDailyTotal,
  rates,
  allTrips,
  tint,
  borderColor,
  panelBg,
  textColor,
  mutedColor,
}: Props) {
  const dailyTotals = useMemo(() => {
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const days: number[] = [];
    for (let d = 1; d <= daysInMonth; d++) {
      const dk = `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
      days.push(getDailyTotal(dk));
    }
    return days;
  }, [year, month, getDailyTotal]);

  const handleExport = useCallback(async () => {
    const tripsMap: Record<string, Trip> = {};
    for (const t of allTrips) tripsMap[t.id] = t;
    const csv = generateCSV(monthExpenses, tripsMap);
    await Clipboard.setStringAsync(csv);
    Alert.alert('导出成功', 'CSV 已复制到剪贴板，可粘贴到 Excel 或其他应用');
  }, [monthExpenses, allTrips]);

  return (
    <>
      {/* 月度汇总 */}
      <Card borderColor={borderColor} backgroundColor={panelBg}>
        <View style={styles.summaryRow}>
          <View style={styles.summaryItem}>
            <ThemedText style={[styles.summaryValue, { color: tint }]}>
              ¥{monthTotal.toFixed(2)}
            </ThemedText>
            <ThemedText style={[styles.summaryLabel, { color: mutedColor }]}>月度支出</ThemedText>
          </View>
          <View style={styles.summaryItem}>
            <ThemedText style={[styles.summaryValue, { color: textColor }]}>{monthCount}</ThemedText>
            <ThemedText style={[styles.summaryLabel, { color: mutedColor }]}>费用笔数</ThemedText>
          </View>
          <View style={styles.summaryItem}>
            <ThemedText style={[styles.summaryValue, { color: textColor }]}>
              {monthTrips.length}
            </ThemedText>
            <ThemedText style={[styles.summaryLabel, { color: mutedColor }]}>差旅行程</ThemedText>
          </View>
        </View>
      </Card>

      {/* 分类占比 */}
      <CategoryBreakdown
        expenses={monthExpenses}
        rates={rates}
        borderColor={borderColor}
        panelBg={panelBg}
        sectionTitle="分类统计"
        emptyText="本月暂无费用记录"
      />

      {/* 日支出柱状图 */}
      <Card borderColor={borderColor} backgroundColor={panelBg}>
        <ThemedText style={styles.sectionTitle}>每日支出</ThemedText>
        <DailyChart dailyTotals={dailyTotals} />
      </Card>

      {/* 导出按钮 */}
      {monthCount > 0 && (
        <Button
          label="导出本月 CSV"
          variant="primary"
          size="lg"
          color={tint}
          onPress={handleExport}
          fullWidth
        />
      )}
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
