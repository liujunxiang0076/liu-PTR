import { useCallback, useEffect, useState } from 'react';
import {
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { useAppContext } from '@/components/app-context';
import { useThemeColor } from '@/hooks/use-theme-color';

type Props = {
  visible: boolean;
  editingId: string | null;
  onClose: () => void;
};

export function TripFormModal({ visible, editingId, onClose }: Props) {
  const { addTrip, updateTrip, getTripById } = useAppContext();

  const [name, setName] = useState('');
  const [destination, setDestination] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [budget, setBudget] = useState('');
  const [error, setError] = useState('');

  const tint = useThemeColor({}, 'tint');
  const textColor = useThemeColor({}, 'text');
  const mutedColor = useThemeColor({ light: '#9BA1A6', dark: '#687076' }, 'icon');
  const borderColor = useThemeColor({ light: '#E5E5E5', dark: '#2A2A2A' }, 'icon');
  const inputBg = useThemeColor({ light: '#F5F5F5', dark: '#1E1E1E' }, 'background');
  const panelBg = useThemeColor({ light: '#FFFFFF', dark: '#151718' }, 'background');

  useEffect(() => {
    if (visible && editingId) {
      const trip = getTripById(editingId);
      if (trip) {
        setName(trip.name);
        setDestination(trip.destination);
        setStartDate(trip.startDate);
        setEndDate(trip.endDate);
        setBudget(trip.budget > 0 ? trip.budget.toString() : '');
      }
    } else if (visible) {
      setName('');
      setDestination('');
      setStartDate('');
      setEndDate('');
      setBudget('');
    }
    setError('');
  }, [visible, editingId, getTripById]);

  const validateDate = (s: string) => /^\d{4}-\d{2}-\d{2}$/.test(s);

  const handleSave = useCallback(() => {
    if (!name.trim()) { setError('请输入差旅名称'); return; }
    if (!validateDate(startDate)) { setError('开始日期格式应为 YYYY-MM-DD'); return; }
    if (!validateDate(endDate)) { setError('结束日期格式应为 YYYY-MM-DD'); return; }
    if (endDate < startDate) { setError('结束日期不能早于开始日期'); return; }

    const budgetNum = budget ? parseFloat(budget) : 0;
    if (budget && (isNaN(budgetNum) || budgetNum < 0)) { setError('预算格式不正确'); return; }

    if (editingId) {
      updateTrip(editingId, {
        name: name.trim(),
        destination: destination.trim(),
        startDate,
        endDate,
        budget: budgetNum,
      });
    } else {
      addTrip({
        name: name.trim(),
        destination: destination.trim(),
        startDate,
        endDate,
        budget: budgetNum,
      });
    }
    onClose();
  }, [name, destination, startDate, endDate, budget, editingId, addTrip, updateTrip, onClose]);

  const todayStr = new Date().toISOString().split('T')[0];

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.overlay}>
        <Pressable style={styles.backdrop} onPress={onClose} />
        <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
          <View style={[styles.form, { backgroundColor: panelBg, borderColor }]}>
            <ThemedText type="subtitle" style={styles.formTitle}>
              {editingId ? '编辑差旅' : '新建差旅'}
            </ThemedText>

            {error ? (
              <ThemedText style={styles.errorText}>{error}</ThemedText>
            ) : null}

            <View style={styles.fieldGroup}>
              <ThemedText style={styles.label}>差旅名称</ThemedText>
              <TextInput
                style={[styles.input, { backgroundColor: inputBg, color: textColor }]}
                placeholder="例如：北京出差"
                placeholderTextColor={mutedColor}
                value={name}
                onChangeText={setName}
                maxLength={50}
              />
            </View>

            <View style={styles.fieldGroup}>
              <ThemedText style={styles.label}>目的地</ThemedText>
              <TextInput
                style={[styles.input, { backgroundColor: inputBg, color: textColor }]}
                placeholder="例如：北京"
                placeholderTextColor={mutedColor}
                value={destination}
                onChangeText={setDestination}
                maxLength={50}
              />
            </View>

            <View style={styles.dateRow}>
              <View style={[styles.fieldGroup, { flex: 1 }]}>
                <ThemedText style={styles.label}>开始日期</ThemedText>
                <TextInput
                  style={[styles.input, { backgroundColor: inputBg, color: textColor }]}
                  placeholder={todayStr}
                  placeholderTextColor={mutedColor}
                  value={startDate}
                  onChangeText={setStartDate}
                  maxLength={10}
                />
              </View>
              <View style={[styles.fieldGroup, { flex: 1 }]}>
                <ThemedText style={styles.label}>结束日期</ThemedText>
                <TextInput
                  style={[styles.input, { backgroundColor: inputBg, color: textColor }]}
                  placeholder={todayStr}
                  placeholderTextColor={mutedColor}
                  value={endDate}
                  onChangeText={setEndDate}
                  maxLength={10}
                />
              </View>
            </View>

            <View style={styles.fieldGroup}>
              <ThemedText style={styles.label}>预算（元）</ThemedText>
              <TextInput
                style={[styles.input, { backgroundColor: inputBg, color: textColor }]}
                placeholder="可选"
                placeholderTextColor={mutedColor}
                value={budget}
                onChangeText={setBudget}
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
        </ScrollView>
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
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
  },
  form: {
    borderRadius: 16,
    borderWidth: StyleSheet.hairlineWidth,
    padding: 20,
    gap: 14,
  },
  formTitle: {
    textAlign: 'center',
    marginBottom: 4,
  },
  errorText: {
    color: '#E85D5D',
    fontSize: 13,
    textAlign: 'center',
  },
  fieldGroup: {
    gap: 4,
  },
  label: {
    fontSize: 13,
    fontWeight: '500',
  },
  input: {
    height: 42,
    borderRadius: 10,
    paddingHorizontal: 14,
    fontSize: 15,
  },
  dateRow: {
    flexDirection: 'row',
    gap: 10,
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
