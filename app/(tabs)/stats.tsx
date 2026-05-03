import { useCallback, useMemo, useState } from 'react';
import { Alert, ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as Clipboard from 'expo-clipboard';

import { ThemedText } from '@/components/themed-text';
import { useAppContext } from '@/components/app-context';
import { useAppColors } from '@/hooks/use-app-colors';
import { CATEGORIES } from '@/types/expense';
import {
  getCategoryColor,
  computeCategoryTotals,
} from '@/constants/currency';
import { generateCSV } from '@/utils/csv-export';

type ViewMode = 'month' | 'year';

const MONTH_NAMES = ['1月', '2月', '3月', '4月', '5月', '6月', '7月', '8月', '9月', '10月', '11月', '12月'];

export default function StatsScreen() {
  const { getMonthlyTotal, getMonthExpenses, getDailyTotal, getTripsInMonth, trips: allTrips, rates } = useAppContext();
  const today = new Date();
  const [viewMode, setViewMode] = useState<ViewMode>('month');
  const [year, setYear] = useState(today.getFullYear());
  const [month, setMonth] = useState(today.getMonth());

  const { tint, text: textColor, muted: mutedColor, border: borderColor, panelBg } = useAppColors();

  // —— 月度数据 ——
  const monthLabel = `${year}年${month + 1}月`;
  const { total: monthTotal, count: monthCount } = useMemo(() => getMonthlyTotal(year, month), [year, month, getMonthlyTotal]);
  const monthExpenses = useMemo(() => getMonthExpenses(year, month), [year, month, getMonthExpenses]);
  const monthTrips = useMemo(() => getTripsInMonth(year, month), [year, month, getTripsInMonth]);

  const categoryTotals = useMemo(
    () => computeCategoryTotals(monthExpenses, rates),
    [monthExpenses, rates]
  );
  const maxCatTotal = Math.max(...Object.values(categoryTotals), 1);

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

  // —— 年度数据 ——
  const yearLabel = `${year}年`;
  const monthlyTotals = useMemo(() => {
    const totals: number[] = [];
    for (let m = 0; m < 12; m++) {
      totals.push(getMonthlyTotal(year, m).total);
    }
    return totals;
  }, [year, getMonthlyTotal]);
  const yearTotal = monthlyTotals.reduce((s, v) => s + v, 0);
  const yearCount = useMemo(() => {
    let count = 0;
    for (let m = 0; m < 12; m++) {
      count += getMonthlyTotal(year, m).count;
    }
    return count;
  }, [year, getMonthlyTotal]);
  const maxMonthly = Math.max(...monthlyTotals, 1);

  const yearCategoryTotals = useMemo(() => {
    const allYearExpenses = [];
    for (let m = 0; m < 12; m++) {
      allYearExpenses.push(...getMonthExpenses(year, m));
    }
    return computeCategoryTotals(allYearExpenses, rates);
  }, [year, getMonthExpenses, rates]);
  const maxYearCatTotal = Math.max(...Object.values(yearCategoryTotals), 1);

  // —— 导航 ——
  const prevMonth = useCallback(() => {
    if (month === 0) { setYear(year - 1); setMonth(11); }
    else setMonth(month - 1);
  }, [year, month]);

  const nextMonth = useCallback(() => {
    if (month === 11) { setYear(year + 1); setMonth(0); }
    else setMonth(month + 1);
  }, [year, month]);

  const prevYear = useCallback(() => setYear(year - 1), [year]);
  const nextYear = useCallback(() => setYear(year + 1), [year]);

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
        {/* 视图切换 */}
        <View style={styles.modeToggle}>
          <TouchableOpacity
            style={[styles.modeBtn, viewMode === 'month' && [styles.modeBtnActive, { backgroundColor: tint }]]}
            onPress={() => setViewMode('month')}>
            <ThemedText style={[styles.modeBtnText, viewMode === 'month' && styles.modeBtnTextActive]}>月度</ThemedText>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.modeBtn, viewMode === 'year' && [styles.modeBtnActive, { backgroundColor: tint }]]}
            onPress={() => setViewMode('year')}>
            <ThemedText style={[styles.modeBtnText, viewMode === 'year' && styles.modeBtnTextActive]}>年度</ThemedText>
          </TouchableOpacity>
        </View>

        {viewMode === 'month' ? (
          <>
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
                  <ThemedText style={[styles.summaryValue, { color: tint }]}>¥{monthTotal.toFixed(2)}</ThemedText>
                  <ThemedText style={[styles.summaryLabel, { color: mutedColor }]}>月度支出</ThemedText>
                </View>
                <View style={styles.summaryItem}>
                  <ThemedText style={[styles.summaryValue, { color: textColor }]}>{monthCount}</ThemedText>
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
            {monthCount > 0 && (
              <TouchableOpacity
                style={[styles.exportBtn, { backgroundColor: tint }]}
                onPress={handleExport}>
                <ThemedText style={styles.exportBtnText}>导出本月 CSV</ThemedText>
              </TouchableOpacity>
            )}
          </>
        ) : (
          <>
            {/* 年份选择器 */}
            <View style={styles.monthSelector}>
              <TouchableOpacity onPress={prevYear} hitSlop={12}>
                <ThemedText style={[styles.arrow, { color: tint }]}>◀</ThemedText>
              </TouchableOpacity>
              <ThemedText type="title" style={styles.monthLabel}>{yearLabel}</ThemedText>
              <TouchableOpacity onPress={nextYear} hitSlop={12}>
                <ThemedText style={[styles.arrow, { color: tint }]}>▶</ThemedText>
              </TouchableOpacity>
            </View>

            {/* 年度汇总 */}
            <View style={[styles.card, { borderColor, backgroundColor: panelBg }]}>
              <View style={styles.summaryRow}>
                <View style={styles.summaryItem}>
                  <ThemedText style={[styles.summaryValue, { color: tint }]}>¥{yearTotal.toFixed(2)}</ThemedText>
                  <ThemedText style={[styles.summaryLabel, { color: mutedColor }]}>年度支出</ThemedText>
                </View>
                <View style={styles.summaryItem}>
                  <ThemedText style={[styles.summaryValue, { color: textColor }]}>{yearCount}</ThemedText>
                  <ThemedText style={[styles.summaryLabel, { color: mutedColor }]}>费用笔数</ThemedText>
                </View>
                <View style={styles.summaryItem}>
                  <ThemedText style={[styles.summaryValue, { color: textColor }]}>¥{yearCount > 0 ? (yearTotal / yearCount).toFixed(0) : '0'}</ThemedText>
                  <ThemedText style={[styles.summaryLabel, { color: mutedColor }]}>笔均金额</ThemedText>
                </View>
              </View>
            </View>

            {/* 月度趋势柱状图 */}
            <View style={[styles.card, { borderColor, backgroundColor: panelBg }]}>
              <ThemedText type="defaultSemiBold" style={styles.sectionTitle}>月度趋势</ThemedText>
              <View style={styles.yearChartArea}>
                {monthlyTotals.map((val, i) => (
                  <View key={i} style={styles.yearBarColumn}>
                    <ThemedText style={[styles.yearBarValue, { color: textColor }]}>
                      {val > 0 ? (val >= 10000 ? `${(val / 10000).toFixed(1)}万` : `${(val / 1000).toFixed(1)}k`) : ''}
                    </ThemedText>
                    <View style={styles.yearBarWrapper}>
                      <View
                        style={[
                          styles.bar,
                          {
                            height: Math.max((val / maxMonthly) * 80, 2),
                            backgroundColor: val > 0 ? tint : 'transparent',
                            width: 20,
                          },
                        ]}
                      />
                    </View>
                    <ThemedText style={[styles.barLabel, { color: mutedColor }]}>
                      {MONTH_NAMES[i]}
                    </ThemedText>
                  </View>
                ))}
              </View>
            </View>

            {/* 年度分类统计 */}
            <View style={[styles.card, { borderColor, backgroundColor: panelBg }]}>
              <ThemedText type="defaultSemiBold" style={styles.sectionTitle}>分类统计</ThemedText>
              <View style={styles.catList}>
                {CATEGORIES.filter((c) => yearCategoryTotals[c] > 0).map((cat) => (
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
                              width: `${(yearCategoryTotals[cat] / maxYearCatTotal) * 100}%`,
                              backgroundColor: getCategoryColor(cat),
                            },
                          ]}
                        />
                      </View>
                      <ThemedText style={[styles.catAmount, { color: textColor }]}>
                        ¥{yearCategoryTotals[cat].toFixed(0)}
                      </ThemedText>
                    </View>
                  </View>
                ))}
                {CATEGORIES.filter((c) => yearCategoryTotals[c] > 0).length === 0 && (
                  <ThemedText style={[styles.emptyText, { color: mutedColor }]}>本年暂无费用记录</ThemedText>
                )}
              </View>
            </View>
          </>
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
  modeToggle: {
    flexDirection: 'row',
    backgroundColor: 'rgba(0,0,0,0.05)',
    borderRadius: 10,
    padding: 3,
    gap: 3,
  },
  modeBtn: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 8,
    alignItems: 'center',
  },
  modeBtnActive: {},
  modeBtnText: {
    fontSize: 14,
    fontWeight: '500',
    opacity: 0.5,
  },
  modeBtnTextActive: {
    color: '#fff',
    opacity: 1,
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
  yearChartArea: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'flex-end',
    gap: 4,
    paddingVertical: 4,
    minHeight: 120,
  },
  yearBarColumn: {
    alignItems: 'center',
    flex: 1,
    gap: 2,
  },
  yearBarWrapper: {
    height: 80,
    justifyContent: 'flex-end',
  },
  yearBarValue: {
    fontSize: 8,
    fontWeight: '500',
    textAlign: 'center',
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
