import { StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { useAppColors } from '@/hooks/use-app-colors';
import { compactAmount } from '@/constants/currency';

const MONTH_NAMES = ['1月', '2月', '3月', '4月', '5月', '6月', '7月', '8月', '9月', '10月', '11月', '12月'];

type Props = {
  monthlyTotals: number[];
};

export function MonthlyChart({ monthlyTotals }: Props) {
  const { tint, text: textColor, muted: mutedColor } = useAppColors();
  const maxMonthly = Math.max(...monthlyTotals, 1);

  return (
    <View style={styles.chartArea}>
      {monthlyTotals.map((val, i) => (
        <View key={i} style={styles.column}>
          <ThemedText style={[styles.value, { color: textColor }]}>
            {val > 0 ? compactAmount(val) : ''}
          </ThemedText>
          <View style={styles.barWrapper}>
            <View
              style={[
                styles.bar,
                {
                  height: Math.max((val / maxMonthly) * 80, 2),
                  backgroundColor: val > 0 ? tint : 'transparent',
                },
              ]}
            />
          </View>
          <ThemedText style={[styles.label, { color: mutedColor }]}>
            {MONTH_NAMES[i]}
          </ThemedText>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  chartArea: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'flex-end',
    gap: 4,
    paddingVertical: 4,
    minHeight: 120,
  },
  column: {
    alignItems: 'center',
    flex: 1,
    gap: 2,
  },
  barWrapper: {
    height: 80,
    justifyContent: 'flex-end',
  },
  bar: {
    width: 20,
    borderRadius: 2,
    minHeight: 2,
  },
  value: {
    fontSize: 8,
    fontWeight: '500',
    textAlign: 'center',
  },
  label: {
    fontSize: 8,
    marginTop: 2,
  },
});
