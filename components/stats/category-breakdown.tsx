import { StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { CATEGORIES, type Currency, type ExpenseCategory, type ExpenseItem } from '@/types/expense';
import { getCategoryColor, computeCategoryTotals } from '@/constants/currency';
import { useAppColors } from '@/hooks/use-app-colors';

type Props = {
  expenses: ExpenseItem[];
  rates: Record<Currency, number>;
  emptyText?: string;
};

export function CategoryBreakdown({ expenses, rates, emptyText = '暂无费用记录' }: Props) {
  const { text: textColor, muted: mutedColor } = useAppColors();
  const categoryTotals = computeCategoryTotals(expenses, rates);
  const maxCatTotal = Math.max(...Object.values(categoryTotals), 1);
  const hasData = CATEGORIES.some((c) => categoryTotals[c] > 0);

  return (
    <View style={styles.container}>
      {hasData ? (
        <View style={styles.list}>
          {CATEGORIES.filter((c) => categoryTotals[c] > 0).map((cat) => (
            <View key={cat} style={styles.row}>
              <View style={styles.labelRow}>
                <View style={[styles.dot, { backgroundColor: getCategoryColor(cat) }]} />
                <ThemedText style={styles.name}>{cat}</ThemedText>
              </View>
              <View style={styles.barArea}>
                <View style={styles.barBg}>
                  <View
                    style={[
                      styles.barFill,
                      {
                        width: `${(categoryTotals[cat] / maxCatTotal) * 100}%`,
                        backgroundColor: getCategoryColor(cat),
                      },
                    ]}
                  />
                </View>
                <ThemedText style={[styles.amount, { color: textColor }]}>
                  ¥{categoryTotals[cat].toFixed(0)}
                </ThemedText>
              </View>
            </View>
          ))}
        </View>
      ) : (
        <ThemedText style={[styles.emptyText, { color: mutedColor }]}>{emptyText}</ThemedText>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 10,
  },
  list: {
    gap: 10,
  },
  row: {
    gap: 6,
  },
  labelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  name: {
    fontSize: 13,
    fontWeight: '500',
  },
  barArea: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  barBg: {
    flex: 1,
    height: 10,
    borderRadius: 5,
    backgroundColor: 'rgba(0,0,0,0.06)',
    overflow: 'hidden',
  },
  barFill: {
    height: '100%',
    borderRadius: 5,
  },
  amount: {
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
});
