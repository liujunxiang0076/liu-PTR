import { useCallback, useState } from 'react';
import { StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Calendar } from '@/components/calendar';
import { DayDetailPanel } from '@/components/day-detail-panel';
import { BudgetSettingsModal } from '@/components/budget-settings-modal';
import { BackupModal } from '@/components/backup-modal';
import { SearchModal } from '@/components/search-modal';
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
  const [backupVisible, setBackupVisible] = useState(false);
  const [searchVisible, setSearchVisible] = useState(false);

  const { getDailyTotal, getDayBudget } = useAppContext();

  const handleDayPress = useCallback(
    (dateKey: string, year: number, month: number, day: number) => {
      setPanel({ visible: true, dateKey, year, month, day });
    },
    []
  );

  const handleClosePanel = useCallback(() => {
    setPanel((prev) => ({ ...prev, visible: false }));
  }, []);

  const handleOpenSettings = useCallback(() => {
    setSettingsVisible(true);
  }, []);

  const handleCloseSettings = useCallback(() => {
    setSettingsVisible(false);
  }, []);

  const handleOpenBackup = useCallback(() => {
    setBackupVisible(true);
  }, []);

  const handleCloseBackup = useCallback(() => {
    setBackupVisible(false);
  }, []);

  const handleOpenSearch = useCallback(() => {
    setSearchVisible(true);
  }, []);

  const handleCloseSearch = useCallback(() => {
    setSearchVisible(false);
  }, []);

  return (
    <SafeAreaView style={styles.container}>
      <Calendar
        onDayPress={handleDayPress}
        getDailyTotal={getDailyTotal}
        getDayBudget={getDayBudget}
        onSettingsPress={handleOpenSettings}
        onBackupPress={handleOpenBackup}
        onSearchPress={handleOpenSearch}
      />
      <DayDetailPanel
        visible={panel.visible}
        dateKey={panel.dateKey}
        year={panel.year}
        month={panel.month}
        day={panel.day}
        onClose={handleClosePanel}
      />
      <BudgetSettingsModal
        visible={settingsVisible}
        onClose={handleCloseSettings}
      />
      <BackupModal
        visible={backupVisible}
        onClose={handleCloseBackup}
      />
      <SearchModal
        visible={searchVisible}
        onClose={handleCloseSearch}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
