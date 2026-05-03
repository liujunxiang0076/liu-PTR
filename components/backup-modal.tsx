import { useCallback, useState } from 'react';
import {
  Alert,
  Modal,
  Pressable,
  StyleSheet,
  TouchableOpacity,
  View,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Clipboard from 'expo-clipboard';

import { ThemedText } from '@/components/themed-text';
import { useAppContext } from '@/components/app-context';
import { useThemeColor } from '@/hooks/use-theme-color';
import { SemanticColors } from '@/constants/theme';

type Props = {
  visible: boolean;
  onClose: () => void;
};

const BACKUP_VERSION = 1;

type BackupData = {
  version: number;
  createdAt: string;
  expenses: Record<string, unknown>;
  trips: Record<string, unknown>;
  budget: { workday: number; weekend: number; holiday: number };
};

export function BackupModal({ visible, onClose }: Props) {
  const { importAllData } = useAppContext();
  const [busy, setBusy] = useState(false);

  const tint = useThemeColor({}, 'tint');
  const mutedColor = useThemeColor({ light: SemanticColors.muted.light, dark: SemanticColors.muted.dark }, 'icon');
  const borderColor = useThemeColor({ light: SemanticColors.border.light, dark: SemanticColors.border.dark }, 'icon');
  const panelBg = useThemeColor({ light: SemanticColors.panelBg.light, dark: SemanticColors.panelBg.dark }, 'background');
  const dangerColor = useThemeColor({ light: SemanticColors.danger, dark: SemanticColors.dangerDark }, 'tint');

  const handleExport = useCallback(async () => {
    try {
      setBusy(true);
      const [expRaw, tripsRaw, budgetRaw] = await Promise.all([
        AsyncStorage.getItem('@expenses:v1'),
        AsyncStorage.getItem('@trips:v1'),
        AsyncStorage.getItem('@budget:v1'),
      ]);

      const backup: BackupData = {
        version: BACKUP_VERSION,
        createdAt: new Date().toISOString(),
        expenses: expRaw ? JSON.parse(expRaw) : {},
        trips: tripsRaw ? JSON.parse(tripsRaw) : {},
        budget: budgetRaw ? JSON.parse(budgetRaw) : { workday: 200, weekend: 300, holiday: 500 },
      };

      const json = JSON.stringify(backup);
      await Clipboard.setStringAsync(json);
      Alert.alert('导出成功', '全量数据已复制到剪贴板，可粘贴保存为文件');
    } catch {
      Alert.alert('导出失败', '复制到剪贴板时出错');
    } finally {
      setBusy(false);
    }
  }, []);

  const handleImport = useCallback(async () => {
    try {
      setBusy(true);
      const text = await Clipboard.getStringAsync();
      if (!text) {
        Alert.alert('导入失败', '剪贴板为空');
        return;
      }

      let data: BackupData;
      try {
        data = JSON.parse(text);
      } catch {
        Alert.alert('导入失败', '剪贴板内容不是有效的备份数据');
        return;
      }

      if (!data.version || !data.expenses || !data.trips || !data.budget) {
        Alert.alert('导入失败', '备份数据格式不完整');
        return;
      }

      Alert.alert(
        '确认恢复',
        '此操作将覆盖当前所有数据，是否继续？',
        [
          { text: '取消', style: 'cancel' },
          {
            text: '恢复',
            style: 'destructive',
            onPress: () => {
              importAllData({
                expenses: data.expenses,
                trips: data.trips,
                budget: data.budget,
              } as Parameters<typeof importAllData>[0]);
              Alert.alert('恢复成功', '数据已恢复，部分更改可能需要重启后生效');
              onClose();
            },
          },
        ]
      );
    } catch {
      Alert.alert('导入失败', '读取剪贴板时出错');
    } finally {
      setBusy(false);
    }
  }, [importAllData, onClose]);

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <Pressable style={styles.backdrop} onPress={onClose} />
        <View style={[styles.form, { backgroundColor: panelBg, borderColor }]}>
          <ThemedText type="subtitle" style={styles.title}>数据备份</ThemedText>
          <ThemedText style={[styles.hint, { color: mutedColor }]}>
            通过剪贴板导出/导入全部费用、差旅和预算数据
          </ThemedText>

          <TouchableOpacity
            style={[styles.btn, { backgroundColor: tint }]}
            onPress={handleExport}
            disabled={busy}>
            <ThemedText style={styles.btnText}>导出到剪贴板</ThemedText>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.btn, styles.btnOutline, { borderColor }]}
            onPress={handleImport}
            disabled={busy}>
            <ThemedText>从剪贴板导入</ThemedText>
          </TouchableOpacity>

          <TouchableOpacity style={styles.cancelBtn} onPress={onClose}>
            <ThemedText style={[styles.cancelText, { color: mutedColor }]}>关闭</ThemedText>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'center',
    padding: 24,
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.4)',
  },
  form: {
    borderRadius: 16,
    borderWidth: StyleSheet.hairlineWidth,
    padding: 20,
    gap: 14,
  },
  title: {
    textAlign: 'center',
  },
  hint: {
    fontSize: 13,
    textAlign: 'center',
    marginBottom: 4,
  },
  btn: {
    height: 44,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  btnOutline: {
    borderWidth: StyleSheet.hairlineWidth,
  },
  btnText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 15,
  },
  cancelBtn: {
    alignItems: 'center',
    paddingVertical: 4,
  },
  cancelText: {
    fontSize: 14,
  },
});
