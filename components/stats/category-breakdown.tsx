/**
 * 分类统计组件
 * 显示费用分类占比
 */

import { StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Card } from '@/components/ui/card';
import { CATEGORIES, type Currency, type ExpenseItem } from '@/types/expense';
import { computeCategoryTotals } from '@/constants/currency';
import { Spacing, FontSize, FontWeight, CategoryColors } from '@/constants/design-tokens';
import { useAppColors } from '@/hooks/use-app-colors';

type Props = {
  expenses: ExpenseItem[];
  rates: Record<Currency, number>;
  borderColor: string;
  panelBg: string;
  sectionTitle: string;
  emptyText?: string;
};

export function CategoryBreakdown({
  expenses,
  rates,
  borderColor,
  panelBg,
  sectionTitle,
  emptyText = '暂无费用记录',
}: Props) {
  const { text: textColor, muted: mutedColor } = useAppColors();
  const categoryTotals = computeCategoryTotals(expenses, rates);
  const maxCatTotal = Math.max(...Object.values(categoryTotals), 1);
  const hasData = CATEGORIES.some((c) => categoryTotals[c] > 0);

  return (
    <Card borderColor={borderColor} backgroundColor={panelBg}>
      <ThemedText style={styles.title}>{sectionTitle}</ThemedText>
      {hasData ? (
        <View style={styles.list}>
          {CATEGORIES.filter((c) => categoryTotals[c] > 0).map((cat) => (
            <View key={cat} style={styles.row}>
              <View style={styles.labelRow}>
                <View style={[styles.dot, { backgroundColor: CategoryColors[cat] }]} />
                <ThemedText style={styles.name}>{cat}</ThemedText>
              </View>
              <View style={styles.barArea}>
                <View style={styles.barBg}>
                  <View
                    style={[
                      styles.barFill,
                      {
                        width: `${(categoryTotals[cat] / maxCatTotal) * 100}%`,
                        backgroundColor: CategoryColors[cat],
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
    </Card>
  );
}

const styles = StyleSheet.create({
  title: {
    fontSize: FontSize.md,
    fontWeight: FontWeight.semibold,
    marginBottom: Spacing.xs,
  },
  list: {
    gap: Spacing.md,
  },
  row: {
    gap: Spacing.sm,
  },
  labelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  name: {
    fontSize: FontSize.sm,
    fontWeight: FontWeight.medium,
  },
  barArea: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
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
    fontSize: FontSize.sm,
    fontWeight: FontWeight.semibold,
  },
  emptyText: {
    fontSize: FontSize.md,
    textAlign: 'center',
    paddingVertical: Spacing.md,
  },
});
