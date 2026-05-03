import { useCallback, useEffect, useState } from 'react';
import {
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { useAppContext } from '@/components/app-context';
import { useThemeColor } from '@/hooks/use-theme-color';
import { SemanticColors } from '@/constants/theme';

type Props = {
  visible: boolean;
  onClose: () => void;
};

export function BudgetSettingsModal({ visible, onClose }: Props) {
  const { budget, updateBudget } = useAppContext();

  const [workday, setWorkday] = useState('');
  const [weekend, setWeekend] = useState('');
  const [holiday, setHoliday] = useState('');

  const tint = useThemeColor({}, 'tint');
  const textColor = useThemeColor({}, 'text');
  const mutedColor = useThemeColor({ light: '#9BA1A6', dark: '#687076' }, 'icon');
  const borderColor = useThemeColor({ light: '#E5E5E5', dark: '#2A2A2A' }, 'icon');
  const inputBg = useThemeColor({ light: '#F5F5F5', dark: '#1E1E1E' }, 'background');
  const panelBg = useThemeColor({ light: '#FFFFFF', dark: '#151718' }, 'background');

  useEffect(() => {
    if (visible) {
      setWorkday(budget.workday.toString());
      setWeekend(budget.weekend.toString());
      setHoliday(budget.holiday.toString());
    }
  }, [visible, budget]);

  const handleSave = useCallback(() => {
    const w = parseFloat(workday) || 0;
    const we = parseFloat(weekend) || 0;
    const h = parseFloat(holiday) || 0;
    updateBudget({ workday: w, weekend: we, holiday: h });
    onClose();
  }, [workday, weekend, holiday, updateBudget, onClose]);

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.overlay}>
        <Pressable style={styles.backdrop} onPress={onClose} />
        <View style={[styles.form, { backgroundColor: panelBg, borderColor }]}>
          <ThemedText type="subtitle" style={styles.formTitle}>
            每日预算设置
          </ThemedText>
          <ThemedText style={[styles.hint, { color: mutedColor }]}>
            设置不同日期类型的每日消费上限（元）
          </ThemedText>

          <View style={styles.fieldGroup}>
            <View style={styles.labelRow}>
              <ThemedText style={styles.label}>工作日</ThemedText>
              <View style={[styles.typeBadge, { backgroundColor: tint + '18' }]}>
                <ThemedText style={[styles.typeBadgeText, { color: tint }]}>周一~周五</ThemedText>
              </View>
            </View>
            <TextInput
              style={[styles.input, { backgroundColor: inputBg, color: textColor }]}
              placeholder="0"
              placeholderTextColor={mutedColor}
              value={workday}
              onChangeText={setWorkday}
              keyboardType="decimal-pad"
            />
          </View>

          <View style={styles.fieldGroup}>
            <View style={styles.labelRow}>
              <ThemedText style={styles.label}>周末</ThemedText>
              <View style={[styles.typeBadge, { backgroundColor: SemanticColors.warning + '18' }]}>
                <ThemedText style={[styles.typeBadgeText, { color: SemanticColors.warning }]}>周六/周日</ThemedText>
              </View>
            </View>
            <TextInput
              style={[styles.input, { backgroundColor: inputBg, color: textColor }]}
              placeholder="0"
              placeholderTextColor={mutedColor}
              value={weekend}
              onChangeText={setWeekend}
              keyboardType="decimal-pad"
            />
          </View>

          <View style={styles.fieldGroup}>
            <View style={styles.labelRow}>
              <ThemedText style={styles.label}>节假日</ThemedText>
              <View style={[styles.typeBadge, { backgroundColor: SemanticColors.success + '18' }]}>
                <ThemedText style={[styles.typeBadgeText, { color: SemanticColors.success }]}>含调休放假</ThemedText>
              </View>
            </View>
            <TextInput
              style={[styles.input, { backgroundColor: inputBg, color: textColor }]}
              placeholder="0"
              placeholderTextColor={mutedColor}
              value={holiday}
              onChangeText={setHoliday}
              keyboardType="decimal-pad"
            />
          </View>

          <View style={styles.btnRow}>
            <TouchableOpacity
              style={[styles.btn, styles.btnCancel, { borderColor }]}
              onPress={onClose}>
              <ThemedText>取消</ThemedText>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.btn, styles.btnSave, { backgroundColor: tint }]}
              onPress={handleSave}>
              <ThemedText style={styles.btnSaveText}>保存</ThemedText>
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
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
  formTitle: {
    textAlign: 'center',
    marginBottom: 2,
  },
  hint: {
    fontSize: 13,
    textAlign: 'center',
    marginBottom: 4,
  },
  fieldGroup: {
    gap: 4,
  },
  labelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
  },
  typeBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
  },
  typeBadgeText: {
    fontSize: 11,
    fontWeight: '500',
  },
  input: {
    height: 42,
    borderRadius: 10,
    paddingHorizontal: 14,
    fontSize: 16,
    textAlign: 'center',
  },
  btnRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 4,
  },
  btn: {
    flex: 1,
    height: 44,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  btnCancel: {
    borderWidth: StyleSheet.hairlineWidth,
  },
  btnSave: {},
  btnSaveText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 15,
  },
});
