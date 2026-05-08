import { ScrollView, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { useAppColors } from '@/hooks/use-app-colors';

type Props = {
  dailyTotals: number[];
};

export function DailyChart({ dailyTotals }: Props) {
  const { tint, muted: mutedColor } = useAppColors();
  const maxDaily = Math.max(...dailyTotals, 1);

  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false}>
      <View style={styles.chartArea}>
        {dailyTotals.map((val, i) => (
          <View key={i} style={styles.column}>
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
            <ThemedText style={[styles.label, { color: mutedColor }]}>
              {i + 1}
            </ThemedText>
          </View>
        ))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  chartArea: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    height: 80,
    gap: 2,
    paddingVertical: 4,
  },
  column: {
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
  label: {
    fontSize: 8,
    marginTop: 2,
  },
});
