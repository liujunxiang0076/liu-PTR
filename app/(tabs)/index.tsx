import { useCallback, useState } from 'react';
import { StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Calendar } from '@/components/calendar';
import { DayDetailPanel } from '@/components/day-detail-panel';
import { BudgetSettingsModal } from '@/components/budget-settings-modal';
import { useAppContext } from '@/components/app-context';

export default function HomeScreen() {
  const [panel, setPanel] = useState<{
    visible: boolean;
    dateKey: string;
    year: number;
    month: number;
    day: number;
  }>({ visible: false, dateKey: '', year: 0, month: 0, day: 0 });
  const [settingsVisible, setSettingsVisible] = useState(false);

  const { hasRecords, getDailyTotal } = useAppContext();

  const handleDayPress = useCallback(
    (dateKey: string, year: number, month: number, day: number) => {
      setPanel({ visible: true, dateKey, year, month, day });
    },
    []
  );

  const handleClose = useCallback(() => {
    setPanel((p) => ({ ...p, visible: false }));
  }, []);

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <Calendar
        onDayPress={handleDayPress}
        hasRecords={hasRecords}
        getDailyTotal={getDailyTotal}
        onSettingsPress={() => setSettingsVisible(true)}
      />
      <DayDetailPanel
        visible={panel.visible}
        dateKey={panel.dateKey}
        year={panel.year}
        month={panel.month}
        day={panel.day}
        onClose={handleClose}
      />
      <BudgetSettingsModal
        visible={settingsVisible}
        onClose={() => setSettingsVisible(false)}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 12,
  },
});
