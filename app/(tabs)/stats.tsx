import { useCallback, useMemo, useState } from 'react';
import { Alert, ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as Clipboard from 'expo-clipboard';

import { ThemedText } from '@/components/themed-text';
import { useAppContext } from '@/components/app-context';
import { useThemeColor } from '@/hooks/use-theme-color';
import { CATEGORIES } from '@/types/expense';
import {
  getCategoryColor,
  sumExpensesInCNY,
} from '@/constants/currency';
import { generateCSV } from '@/utils/csv-export';

export default function StatsScreen() {
  const { getMonthlyTotal, getMonthExpenses, getDailyTotal, getTripsInMonth, trips: allTrips, rates } = useAppContext();
  const today = new Date();
  const [year, setYear] = useState(today.getFullYear());
  const [month, setMonth] = useState(today.getMonth());

  const tint = useThemeColor({}, 'tint');
  const textColor = useThemeColor({}, 'text');
  const mutedColor = useThemeColor({ light: '#9BA1A6', dark: '#687076' }, 'icon');
  const borderColor = useThemeColor({ light: '#E5E5E5', dark: '#2A2A2A' }, 'icon');
  const panelBg = useThemeColor({ light: '#FFFFFF', dark: '#151718' }, 'background');

  const monthLabel = `${year}年${month + 1}月`;
  const { total, count } = useMemo(() => getMonthlyTotal(year, month), [year, month, getMonthlyTotal]);
  const monthExpenses = useMemo(() => getMonthExpenses(year, month), [year, month, getMonthExpenses]);
  const monthTrips = useMemo(() => getTripsInMonth(year, month), [year, month, getTripsInMonth]);

  // 分类统计
  const categoryTotals = useMemo(() => {
    const totals: Record<string, number> = {};
    for (const cat of CATEGORIES) totals[cat] = 0;
    for (const e of monthExpenses) {
      totals[e.category] = (totals[e.category] ?? 0) + sumExpensesInCNY([e], rates);
    }
    return totals;
  }, [monthExpenses, rates]);
  const maxCatTotal = Math.max(...Object.values(categoryTotals), 1);

  // 日支出柱状图
  const dailyTotals = useMemo(() => {
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const days: number[] = [];
    for (let d = 1; d <= daysInMonth; d++) {
      const dk = `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
      days.push(getDailyTotal(dk));
    }
    return days;
  }, [year, month, getDailyTotal]);
  const maxDaily = Math.max(...dailyTotals, 1);

  const prevMonth = useCallback(() => {
    if (month === 0) { setYear(year - 1); setMonth(11); }
    else setMonth(month - 1);
  }, [year, month]);

  const nextMonth = useCallback(() => {
    if (month === 11) { setYear(year + 1); setMonth(0); }
    else setMonth(month + 1);
  }, [year, month]);

  const handleExport = useCallback(async () => {
    const tripsMap: Record<string, typeof allTrips[number]> = {};
    for (const t of allTrips) tripsMap[t.id] = t;
    const csv = generateCSV(monthExpenses, tripsMap);
    await Clipboard.setStringAsync(csv);
    Alert.alert('导出成功', 'CSV 已复制到剪贴板，可粘贴到 Excel 或其他应用');
  }, [monthExpenses, allTrips]);

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* 月份选择器 */}
        <View style={styles.monthSelector}>
          <TouchableOpacity onPress={prevMonth} hitSlop={12}>
            <ThemedText style={[styles.arrow, { color: tint }]}>◀</ThemedText>
          </TouchableOpacity>
          <ThemedText type="title" style={styles.monthLabel}>{monthLabel}</ThemedText>
          <TouchableOpacity onPress={nextMonth} hitSlop={12}>
            <ThemedText style={[styles.arrow, { color: tint }]}>▶</ThemedText>
          </TouchableOpacity>
        </View>

        {/* 月度汇总 */}
        <View style={[styles.card, { borderColor, backgroundColor: panelBg }]}>
          <View style={styles.summaryRow}>
            <View style={styles.summaryItem}>
              <ThemedText style={[styles.summaryValue, { color: tint }]}>¥{total.toFixed(2)}</ThemedText>
              <ThemedText style={[styles.summaryLabel, { color: mutedColor }]}>月度支出</ThemedText>
            </View>
            <View style={styles.summaryItem}>
              <ThemedText style={[styles.summaryValue, { color: textColor }]}>{count}</ThemedText>
              <ThemedText style={[styles.summaryLabel, { color: mutedColor }]}>费用笔数</ThemedText>
            </View>
            <View style={styles.summaryItem}>
              <ThemedText style={[styles.summaryValue, { color: textColor }]}>{monthTrips.length}</ThemedText>
              <ThemedText style={[styles.summaryLabel, { color: mutedColor }]}>差旅行程</ThemedText>
            </View>
          </View>
        </View>

        {/* 分类占比 */}
        <View style={[styles.card, { borderColor, backgroundColor: panelBg }]}>
          <ThemedText type="defaultSemiBold" style={styles.sectionTitle}>分类统计</ThemedText>
          <View style={styles.catList}>
            {CATEGORIES.filter((c) => categoryTotals[c] > 0).map((cat) => (
              <View key={cat} style={styles.catRow}>
                <View style={styles.catLabelRow}>
                  <View style={[styles.catDot, { backgroundColor: getCategoryColor(cat) }]} />
                  <ThemedText style={styles.catName}>{cat}</ThemedText>
                </View>
                <View style={styles.catBarArea}>
                  <View style={styles.catBarBg}>
                    <View
                      style={[
                        styles.catBarFill,
                        {
                          width: `${(categoryTotals[cat] / maxCatTotal) * 100}%`,
                          backgroundColor: getCategoryColor(cat),
                        },
                      ]}
                    />
                  </View>
                  <ThemedText style={[styles.catAmount, { color: textColor }]}>
                    ¥{categoryTotals[cat].toFixed(0)}
                  </ThemedText>
                </View>
              </View>
            ))}
            {CATEGORIES.filter((c) => categoryTotals[c] > 0).length === 0 && (
              <ThemedText style={[styles.emptyText, { color: mutedColor }]}>本月暂无费用记录</ThemedText>
            )}
          </View>
        </View>

        {/* 日支出柱状图 */}
        <View style={[styles.card, { borderColor, backgroundColor: panelBg }]}>
          <ThemedText type="defaultSemiBold" style={styles.sectionTitle}>每日支出</ThemedText>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View style={styles.chartArea}>
              {dailyTotals.map((val, i) => (
                <View key={i} style={styles.barColumn}>
                  <View style={styles.barWrapper}>
                    <View
                      style={[
                        styles.bar,
                        {
                          height: Math.max((val / maxDaily) * 56, 2),
                          backgroundColor: val > 0 ? tint : 'transparent',
                        },
                      ]}
                    />
                  </View>
                  <ThemedText style={[styles.barLabel, { color: mutedColor }]}>
                    {i + 1}
                  </ThemedText>
                </View>
              ))}
            </View>
          </ScrollView>
        </View>

        {/* 导出按钮 */}
        {count > 0 && (
          <TouchableOpacity
            style={[styles.exportBtn, { backgroundColor: tint }]}
            onPress={handleExport}>
            <ThemedText style={styles.exportBtnText}>导出本月 CSV</ThemedText>
          </TouchableOpacity>
        )}

        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    gap: 12,
  },
  monthSelector: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 20,
    paddingVertical: 8,
  },
  arrow: {
    fontSize: 18,
  },
  monthLabel: {
    fontSize: 22,
    fontWeight: '700',
  },
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
  sectionTitle: {
    fontSize: 15,
    marginBottom: 4,
  },
  catList: {
    gap: 10,
  },
  catRow: {
    gap: 6,
  },
  catLabelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  catDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  catName: {
    fontSize: 13,
    fontWeight: '500',
  },
  catBarArea: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  catBarBg: {
    flex: 1,
    height: 10,
    borderRadius: 5,
    backgroundColor: 'rgba(0,0,0,0.06)',
    overflow: 'hidden',
  },
  catBarFill: {
    height: '100%',
    borderRadius: 5,
  },
  catAmount: {
    width: 60,
    textAlign: 'right',
    fontSize: 13,
    fontWeight: '600',
  },
  emptyText: {
    fontSize: 14,
    textAlign: 'center',
    paddingVertical: 12,
  },
  chartArea: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    height: 80,
    gap: 2,
    paddingVertical: 4,
  },
  barColumn: {
    alignItems: 'center',
    width: 16,
  },
  barWrapper: {
    height: 56,
    justifyContent: 'flex-end',
  },
  bar: {
    width: 10,
    borderRadius: 2,
    minHeight: 2,
  },
  barLabel: {
    fontSize: 8,
    marginTop: 2,
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
