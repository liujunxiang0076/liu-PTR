import { useMemo, useState } from 'react';
import { ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { MonthStats } from '@/components/stats/month-stats';
import { YearStats } from '@/components/stats/year-stats';
import { useAppContext } from '@/components/app-context';
import { useAppColors } from '@/hooks/use-app-colors';

type ViewMode = 'month' | 'year';

export default function StatsScreen() {
  const {
    getMonthlyTotal,
    getMonthExpenses,
    getDailyTotal,
    getTripsInMonth,
    trips: allTrips,
    rates,
  } = useAppContext();
  const today = new Date();
  const [viewMode, setViewMode] = useState<ViewMode>('month');
  const [year, setYear] = useState(today.getFullYear());
  const [month, setMonth] = useState(today.getMonth());

  const { tint, text: textColor, muted: mutedColor, border: borderColor, panelBg } = useAppColors();

  // —— 月度数据 ——
  const { total: monthTotal, count: monthCount } = useMemo(
    () => getMonthlyTotal(year, month),
    [year, month, getMonthlyTotal]
  );
  const monthExpenses = useMemo(() => getMonthExpenses(year, month), [year, month, getMonthExpenses]);
  const monthTrips = useMemo(() => getTripsInMonth(year, month), [year, month, getTripsInMonth]);

  // —— 年度数据 ——
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

  const yearExpenses = useMemo(() => {
    const allYearExpenses = [];
    for (let m = 0; m < 12; m++) {
      allYearExpenses.push(...getMonthExpenses(year, m));
    }
    return allYearExpenses;
  }, [year, getMonthExpenses]);

  // —— 导航 ——
  const prevMonth = () => {
    if (month === 0) {
      setYear(year - 1);
      setMonth(11);
    } else {
      setMonth(month - 1);
    }
  };

  const nextMonth = () => {
    if (month === 11) {
      setYear(year + 1);
      setMonth(0);
    } else {
      setMonth(month + 1);
    }
  };

  const prevYear = () => setYear(year - 1);
  const nextYear = () => setYear(year + 1);

  const sectionTitleStyle = [styles.sectionTitle];

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* 视图切换 */}
        <View style={styles.modeToggle}>
          <TouchableOpacity
            style={[styles.modeBtn, viewMode === 'month' && [styles.modeBtnActive, { backgroundColor: tint }]]}
            onPress={() => setViewMode('month')}>
            <ThemedText style={[styles.modeBtnText, viewMode === 'month' && styles.modeBtnTextActive]}>
              月度
            </ThemedText>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.modeBtn, viewMode === 'year' && [styles.modeBtnActive, { backgroundColor: tint }]]}
            onPress={() => setViewMode('year')}>
            <ThemedText style={[styles.modeBtnText, viewMode === 'year' && styles.modeBtnTextActive]}>
              年度
            </ThemedText>
          </TouchableOpacity>
        </View>

        {/* 月份/年份选择器 */}
        <View style={styles.monthSelector}>
          <TouchableOpacity onPress={viewMode === 'month' ? prevMonth : prevYear} hitSlop={12}>
            <ThemedText style={[styles.arrow, { color: tint }]}>◀</ThemedText>
          </TouchableOpacity>
          <ThemedText type="title" style={styles.monthLabel}>
            {viewMode === 'month' ? `${year}年${month + 1}月` : `${year}年`}
          </ThemedText>
          <TouchableOpacity onPress={viewMode === 'month' ? nextMonth : nextYear} hitSlop={12}>
            <ThemedText style={[styles.arrow, { color: tint }]}>▶</ThemedText>
          </TouchableOpacity>
        </View>

        {viewMode === 'month' ? (
          <MonthStats
            year={year}
            month={month}
            monthTotal={monthTotal}
            monthCount={monthCount}
            monthExpenses={monthExpenses}
            monthTrips={monthTrips}
            getDailyTotal={getDailyTotal}
            rates={rates}
            allTrips={allTrips}
            tint={tint}
            borderColor={borderColor}
            panelBg={panelBg}
            textColor={textColor}
            mutedColor={mutedColor}
            sectionTitleStyle={sectionTitleStyle}
          />
        ) : (
          <YearStats
            year={year}
            yearTotal={yearTotal}
            yearCount={yearCount}
            yearExpenses={yearExpenses}
            monthlyTotals={monthlyTotals}
            rates={rates}
            tint={tint}
            borderColor={borderColor}
            panelBg={panelBg}
            textColor={textColor}
            mutedColor={mutedColor}
            sectionTitleStyle={sectionTitleStyle}
          />
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
  sectionTitle: {
    fontSize: 15,
    fontWeight: '600',
    marginBottom: 4,
  },
});
