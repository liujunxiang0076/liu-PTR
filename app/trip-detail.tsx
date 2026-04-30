import { useLocalSearchParams, useRouter, Stack } from 'expo-router';
import { FlatList, StyleSheet, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { useAppContext } from '@/components/app-context';
import { useThemeColor } from '@/hooks/use-theme-color';
import { formatAmount, getCategoryColor, sumExpensesInCNY } from '@/constants/currency';
import { CATEGORIES, type ExpenseItem } from '@/types/expense';

export default function TripDetailScreen() {
  const { tripId } = useLocalSearchParams<{ tripId: string }>();
  const { getTripById, getByTrip, rates } = useAppContext();
  const router = useRouter();

  const tint = useThemeColor({}, 'tint');
  const textColor = useThemeColor({}, 'text');
  const mutedColor = useThemeColor({ light: '#9BA1A6', dark: '#687076' }, 'icon');
  const borderColor = useThemeColor({ light: '#E5E5E5', dark: '#2A2A2A' }, 'icon');
  const panelBg = useThemeColor({ light: '#FFFFFF', dark: '#151718' }, 'background');

  const trip = getTripById(tripId);
  const expenses = getByTrip(tripId);

  if (!trip) {
    return (
      <SafeAreaView style={styles.container}>
        <ThemedText>行程不存在</ThemedText>
      </SafeAreaView>
    );
  }

  const totalCNY = sumExpensesInCNY(expenses, rates);
  const rawPct = trip.budget > 0 ? (totalCNY / trip.budget) * 100 : 0;
  const pct = Math.min(rawPct, 100);
  const barColor = rawPct > 100 ? '#E85D5D' : rawPct > 70 ? '#F5A623' : '#7ED321';

  // 按分类统计
  const categoryTotals: Record<string, number> = {};
  for (const cat of CATEGORIES) categoryTotals[cat] = 0;
  for (const e of expenses) {
    categoryTotals[e.category] = (categoryTotals[e.category] ?? 0) + sumExpensesInCNY([e], rates);
  }
  const maxCatTotal = Math.max(...Object.values(categoryTotals), 1);

  // 按日期分组
  const grouped: Record<string, ExpenseItem[]> = {};
  for (const e of expenses) {
    if (!grouped[e.dateKey]) grouped[e.dateKey] = [];
    grouped[e.dateKey].push(e);
  }
  const sortedDates = Object.keys(grouped).sort();

  return (
    <>
      <Stack.Screen options={{ title: trip.name, headerBackTitle: '差旅' }} />
      <SafeAreaView style={styles.container} edges={['bottom']}>
        <FlatList
          data={sortedDates}
          keyExtractor={(d) => d}
          ListHeaderComponent={
            <View style={styles.headerArea}>
              {/* 行程信息 */}
              <View style={[styles.infoCard, { borderColor, backgroundColor: panelBg }]}>
                <ThemedText type="defaultSemiBold" style={styles.tripName}>{trip.name}</ThemedText>
                <ThemedText style={[styles.tripInfo, { color: mutedColor }]}>
                  {trip.destination} · {trip.startDate} ~ {trip.endDate}
                </ThemedText>
                {trip.budget > 0 && (
                  <View style={styles.budgetSection}>
                    <View style={styles.budgetBarBg}>
                      <View style={[styles.budgetBarFill, { width: `${pct}%`, backgroundColor: barColor }]} />
                    </View>
                    <ThemedText style={[styles.budgetText, { color: mutedColor }]}>
                      已用 ¥{totalCNY.toFixed(2)} / 预算 ¥{trip.budget.toFixed(2)} ({rawPct.toFixed(0)}%)
                    </ThemedText>
                  </View>
                )}
                <ThemedText style={[styles.totalText, { color: tint }]}>
                  共 {expenses.length} 笔费用，合计 ¥{totalCNY.toFixed(2)}
                </ThemedText>
              </View>

              {/* 分类统计 */}
              <View style={[styles.catCard, { borderColor, backgroundColor: panelBg }]}>
                <ThemedText type="defaultSemiBold" style={styles.sectionTitle}>分类统计</ThemedText>
                {CATEGORIES.filter((c) => categoryTotals[c] > 0).map((cat) => (
                  <View key={cat} style={styles.catRow}>
                    <View style={[styles.catDot, { backgroundColor: getCategoryColor(cat) }]} />
                    <ThemedText style={styles.catLabel}>{cat}</ThemedText>
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
                ))}
              </View>
            </View>
          }
          renderItem={({ item: dateKey }) => (
            <View style={[styles.dateGroup, { borderColor, backgroundColor: panelBg }]}>
              <ThemedText type="defaultSemiBold" style={styles.dateLabel}>{dateKey}</ThemedText>
              {grouped[dateKey].map((e) => (
                <View key={e.id} style={[styles.expenseRow, { borderBottomColor: borderColor }]}>
                  <View style={styles.expenseLeft}>
                    <View style={[styles.categoryDot, { backgroundColor: getCategoryColor(e.category) }]} />
                    <View>
                      <ThemedText style={styles.expenseCategory}>{e.category}</ThemedText>
                      {e.notes ? (
                        <ThemedText style={[styles.expenseNotes, { color: mutedColor }]} numberOfLines={1}>
                          {e.notes}
                        </ThemedText>
                      ) : null}
                    </View>
                  </View>
                  <ThemedText style={[styles.expenseAmount, { color: textColor }]}>
                    {formatAmount(e.amount, e.currency)}
                  </ThemedText>
                </View>
              ))}
            </View>
          )}
          contentContainerStyle={styles.listContent}
        />
      </SafeAreaView>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  listContent: {
    padding: 16,
    gap: 12,
  },
  headerArea: {
    gap: 12,
  },
  infoCard: {
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: 14,
    padding: 16,
    gap: 8,
  },
  tripName: {
    fontSize: 20,
  },
  tripInfo: {
    fontSize: 14,
  },
  budgetSection: {
    gap: 6,
    marginTop: 4,
  },
  budgetBarBg: {
    height: 6,
    borderRadius: 3,
    backgroundColor: 'rgba(0,0,0,0.08)',
    overflow: 'hidden',
  },
  budgetBarFill: {
    height: '100%',
    borderRadius: 3,
  },
  budgetText: {
    fontSize: 12,
  },
  totalText: {
    fontSize: 16,
    fontWeight: '700',
    marginTop: 4,
  },
  catCard: {
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: 14,
    padding: 16,
    gap: 10,
  },
  sectionTitle: {
    fontSize: 15,
    marginBottom: 2,
  },
  catRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  catDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  catLabel: {
    width: 36,
    fontSize: 13,
  },
  catBarBg: {
    flex: 1,
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(0,0,0,0.06)',
    overflow: 'hidden',
  },
  catBarFill: {
    height: '100%',
    borderRadius: 4,
  },
  catAmount: {
    width: 60,
    textAlign: 'right',
    fontSize: 13,
    fontWeight: '500',
  },
  dateGroup: {
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: 14,
    padding: 14,
    gap: 8,
  },
  dateLabel: {
    fontSize: 14,
    marginBottom: 2,
  },
  expenseRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  expenseLeft: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  categoryDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  expenseCategory: {
    fontSize: 14,
    fontWeight: '500',
  },
  expenseNotes: {
    fontSize: 12,
    marginTop: 2,
  },
  expenseAmount: {
    fontSize: 14,
    fontWeight: '600',
  },
});
