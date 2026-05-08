import { useCallback, useMemo } from 'react';
import { Alert, StyleSheet, TouchableOpacity, View } from 'react-native';
import * as Clipboard from 'expo-clipboard';

import { ThemedText } from '@/components/themed-text';
import { CategoryBreakdown } from './category-breakdown';
import { DailyChart } from './daily-chart';
import { type Trip, type ExpenseItem, type Currency } from '@/types/expense';

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
  sectionTitleStyle: object;
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
  sectionTitleStyle,
}: Props) {
  const monthLabel = `${year}年${month + 1}月`;

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
      <View style={[styles.card, { borderColor, backgroundColor: panelBg }]}>
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
      </View>

      {/* 分类占比 */}
      <View style={[styles.card, { borderColor, backgroundColor: panelBg }]}>
        <ThemedText style={sectionTitleStyle}>分类统计</ThemedText>
        <CategoryBreakdown expenses={monthExpenses} rates={rates} emptyText="本月暂无费用记录" />
      </View>

      {/* 日支出柱状图 */}
      <View style={[styles.card, { borderColor, backgroundColor: panelBg }]}>
        <ThemedText style={sectionTitleStyle}>每日支出</ThemedText>
        <DailyChart dailyTotals={dailyTotals} />
      </View>

      {/* 导出按钮 */}
      {monthCount > 0 && (
        <TouchableOpacity style={[styles.exportBtn, { backgroundColor: tint }]} onPress={handleExport}>
          <ThemedText style={styles.exportBtnText}>导出本月 CSV</ThemedText>
        </TouchableOpacity>
      )}
    </>
  );
}

// 临时导入 generateCSV
import { generateCSV } from '@/utils/csv-export';

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
  exportBtn: {
    height: 48,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 4,
  },
  exportBtnText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});
