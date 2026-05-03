import { useCallback, useEffect, useRef, useState } from 'react';
import {
  Alert,
  FlatList,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';

import { useAppContext } from '@/components/app-context';
import { getHoliday, getRestDayBadge } from '@/constants/holidays';
import { formatAmount, getCategoryColor } from '@/constants/currency';
import { useThemeColor } from '@/hooks/use-theme-color';
import { SemanticColors } from '@/constants/theme';
import { ThemedText } from './themed-text';
import {
  type Currency,
  type ExpenseCategory,
  CATEGORIES,
  CATEGORY_ICONS,
  CURRENCIES,
  CURRENCY_SYMBOLS,
} from '@/types/expense';

type Props = {
  visible: boolean;
  dateKey: string;
  year: number;
  month: number;
  day: number;
  onClose: () => void;
};

const WEEKDAY_NAMES = ['周日', '周一', '周二', '周三', '周四', '周五', '周六'];
const PANEL_DURATION = 280;

export function DayDetailPanel({ visible, dateKey, year, month, day, onClose }: Props) {
  const { getByDate, addExpense, removeExpense, getDailyTotal, getActiveTrip, convert, getDayBudget } = useAppContext();

  const [amount, setAmount] = useState('');
  const [currency, setCurrency] = useState<Currency>('CNY');
  const [category, setCategory] = useState<ExpenseCategory>('餐饮');
  const [notes, setNotes] = useState('');
  const [shouldRender, setShouldRender] = useState(false);
  const amountRef = useRef<TextInput>(null);

  const records = getByDate(dateKey);
  const dailyTotal = getDailyTotal(dateKey);
  const holiday = getHoliday(year, month, day);
  const restBadge = getRestDayBadge(year, month, day);
  const date = new Date(year, month, day);
  const weekday = WEEKDAY_NAMES[date.getDay()];
  const activeTrip = getActiveTrip(dateKey);
  const dayBudget = getDayBudget(year, month, day);
  const budgetPct = dayBudget.amount > 0 ? Math.min((dailyTotal / dayBudget.amount) * 100, 100) : 0;
  const budgetOver = dayBudget.amount > 0 && dailyTotal > dayBudget.amount;
  const budgetColor = budgetOver
    ? SemanticColors.danger
    : budgetPct > 70 ? SemanticColors.warning : SemanticColors.success;

  const overlayOpacity = useSharedValue(0);
  const panelY = useSharedValue(1);

  useEffect(() => {
    if (visible) {
      setShouldRender(true);
      overlayOpacity.value = withTiming(1, { duration: PANEL_DURATION });
      panelY.value = withTiming(0, { duration: PANEL_DURATION });
      // 重置表单
      setAmount('');
      setCurrency('CNY');
      setCategory('餐饮');
      setNotes('');
    } else {
      overlayOpacity.value = withTiming(0, { duration: PANEL_DURATION });
      panelY.value = withTiming(1, { duration: PANEL_DURATION });
      const timer = setTimeout(() => setShouldRender(false), PANEL_DURATION);
      return () => clearTimeout(timer);
    }
  }, [visible, overlayOpacity, panelY]);

  const overlayStyle = useAnimatedStyle(() => ({
    opacity: overlayOpacity.value,
  }));

  const panelStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: panelY.value * 400 }],
  }));

  const handleAdd = useCallback(() => {
    const num = parseFloat(amount);
    if (isNaN(num) || num <= 0) return;
    addExpense(dateKey, {
      amount: num,
      currency,
      category,
      notes: notes.trim(),
      tripId: activeTrip?.id ?? null,
    });
    setAmount('');
    setNotes('');
    Keyboard.dismiss();
  }, [amount, currency, category, notes, addExpense, dateKey, activeTrip]);

  const tint = useThemeColor({}, 'tint');
  const textColor = useThemeColor({}, 'text');
  const mutedColor = useThemeColor({ light: SemanticColors.muted.light, dark: SemanticColors.muted.dark }, 'icon');
  const borderColor = useThemeColor({ light: SemanticColors.border.light, dark: SemanticColors.border.dark }, 'icon');
  const inputBg = useThemeColor({ light: SemanticColors.inputBg.light, dark: SemanticColors.inputBg.dark }, 'background');
  const panelBg = useThemeColor({ light: SemanticColors.panelBg.light, dark: SemanticColors.panelBg.dark }, 'background');
  const dangerColor = useThemeColor({ light: SemanticColors.danger, dark: SemanticColors.dangerDark }, 'tint');
  const holidayColor = useThemeColor({ light: SemanticColors.danger, dark: SemanticColors.dangerDark }, 'tint');

  const canAdd = parseFloat(amount) > 0;

  if (!shouldRender) return null;

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      style={StyleSheet.absoluteFill}
      pointerEvents="box-none">
      {/* 遮罩 */}
      <Pressable style={StyleSheet.absoluteFill} onPress={onClose}>
        <Animated.View style={[styles.overlay, overlayStyle]} />
      </Pressable>

      {/* 面板 */}
      <Animated.View
        style={[styles.panel, { borderColor, backgroundColor: panelBg }, panelStyle]}
        onStartShouldSetResponder={() => true}>
        {/* 拖拽指示条 */}
        <View style={styles.handleBarContainer}>
          <View style={[styles.handleBar, { backgroundColor: mutedColor }]} />
        </View>

        {/* 日期标题 */}
        <View style={styles.titleRow}>
          <ThemedText type="subtitle">
            {month + 1}月{day}日 {weekday}
          </ThemedText>
          {holiday && (
            <View style={[styles.holidayBadge, { backgroundColor: holidayColor + '20' }]}>
              <ThemedText style={[styles.holidayBadgeText, { color: holidayColor }]}>
                {holiday}
              </ThemedText>
            </View>
          )}
          {restBadge && (
            <View style={[
              styles.holidayBadge,
              { backgroundColor: (restBadge === '休' ? SemanticColors.success : SemanticColors.warning) + '20' },
            ]}>
              <ThemedText style={[
                styles.holidayBadgeText,
                { color: restBadge === '休' ? SemanticColors.success : SemanticColors.warning },
              ]}>
                {restBadge === '休' ? '休息日' : '调休上班'}
              </ThemedText>
            </View>
          )}
          {activeTrip && (
            <View style={[styles.tripBadge, { backgroundColor: tint + '20' }]}>
              <ThemedText style={[styles.tripBadgeText, { color: tint }]}>
                {activeTrip.name}
              </ThemedText>
            </View>
          )}
        </View>

        {/* 当日合计 */}
        {dailyTotal > 0 && (
          <View style={[styles.totalBar, { backgroundColor: tint }]}>
            <ThemedText style={styles.totalLabel}>当日合计</ThemedText>
            <ThemedText style={styles.totalAmount}>¥{dailyTotal.toFixed(2)}</ThemedText>
          </View>
        )}

        {/* 预算进度 */}
        {dayBudget.amount > 0 && (
          <View style={styles.budgetRow}>
            <View style={styles.budgetInfo}>
              <ThemedText style={[styles.budgetLabel, { color: mutedColor }]}>
                预算 ¥{dayBudget.amount.toFixed(0)}（{dayBudget.type === 'workday' ? '工作日' : dayBudget.type === 'weekend' ? '周末' : '节假日'}）
              </ThemedText>
              {budgetOver ? (
                <ThemedText style={[styles.budgetOverText, { color: budgetColor }]}>
                  超支 ¥{(dailyTotal - dayBudget.amount).toFixed(2)}
                </ThemedText>
              ) : (
                <ThemedText style={[styles.budgetLabel, { color: mutedColor }]}>
                  {budgetPct.toFixed(0)}%
                </ThemedText>
              )}
            </View>
            <View style={[styles.budgetBar, { backgroundColor: borderColor }]}>
              <View style={[styles.budgetFill, { width: `${budgetPct}%`, backgroundColor: budgetColor }]} />
            </View>
          </View>
        )}

        {/* 费用列表 */}
        <FlatList
          data={records}
          keyExtractor={(item) => item.id}
          scrollEnabled={records.length > 3}
          style={styles.list}
          contentContainerStyle={records.length === 0 && styles.listEmpty}
          ListEmptyComponent={
            <ThemedText style={[styles.emptyText, { color: mutedColor }]}>
              暂无费用记录
            </ThemedText>
          }
          renderItem={({ item }) => (
            <View style={[styles.recordItem, { borderBottomColor: borderColor }]}>
              <View style={styles.recordLeft}>
                <View style={[styles.categoryDot, { backgroundColor: getCategoryColor(item.category) }]} />
                <View style={styles.recordInfo}>
                  <ThemedText style={styles.recordCategory}>{item.category}</ThemedText>
                  {item.notes ? (
                    <ThemedText style={[styles.recordNotes, { color: mutedColor }]} numberOfLines={1}>
                      {item.notes}
                    </ThemedText>
                  ) : null}
                </View>
              </View>
              <ThemedText style={[styles.recordAmount, { color: textColor }]}>
                {formatAmount(item.amount, item.currency)}
              </ThemedText>
              <TouchableOpacity
                onPress={() => Alert.alert('确认删除', '确定要删除这条费用记录吗？', [
                  { text: '取消', style: 'cancel' },
                  { text: '删除', style: 'destructive', onPress: () => removeExpense(dateKey, item.id) },
                ])}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
                <ThemedText style={[styles.deleteBtn, { color: dangerColor }]}>×</ThemedText>
              </TouchableOpacity>
            </View>
          )}
        />

        {/* 添加费用表单 */}
        <View style={[styles.formArea, { borderTopColor: borderColor }]}>
          {/* 币种选择 */}
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.currencyRow}>
            {CURRENCIES.map((c) => (
              <TouchableOpacity
                key={c}
                style={[
                  styles.currencyPill,
                  currency === c && { backgroundColor: tint },
                ]}
                onPress={() => setCurrency(c)}>
                <ThemedText
                  style={[
                    styles.currencyPillText,
                    currency === c && { color: '#fff' },
                  ]}>
                  {CURRENCY_SYMBOLS[c]} {c}
                </ThemedText>
              </TouchableOpacity>
            ))}
          </ScrollView>

          {/* 分类选择 */}
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categoryRow}>
            {CATEGORIES.map((c) => (
              <TouchableOpacity
                key={c}
                style={[
                  styles.categoryPill,
                  category === c && { backgroundColor: getCategoryColor(c) },
                ]}
                onPress={() => setCategory(c)}>
                <ThemedText
                  style={[
                    styles.categoryPillText,
                    category === c && { color: '#fff' },
                  ]}>
                  {c}
                </ThemedText>
              </TouchableOpacity>
            ))}
          </ScrollView>

          {/* 金额 + 备注 + 添加按钮 */}
          <View style={styles.inputRow}>
            <TextInput
              ref={amountRef}
              style={[styles.amountInput, { backgroundColor: inputBg, color: textColor }]}
              placeholder="金额"
              placeholderTextColor={mutedColor}
              value={amount}
              onChangeText={setAmount}
              keyboardType="decimal-pad"
              returnKeyType="next"
            />
            <TextInput
              style={[styles.notesInput, { backgroundColor: inputBg, color: textColor }]}
              placeholder="备注（可选）"
              placeholderTextColor={mutedColor}
              value={notes}
              onChangeText={setNotes}
              returnKeyType="done"
              onSubmitEditing={handleAdd}
              maxLength={100}
            />
            <TouchableOpacity
              style={[styles.addBtn, { backgroundColor: tint }, !canAdd && styles.addBtnDisabled]}
              onPress={handleAdd}
              disabled={!canAdd}>
              <ThemedText style={styles.addBtnText}>+</ThemedText>
            </TouchableOpacity>
          </View>
        </View>
      </Animated.View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.4)',
  },
  panel: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    maxHeight: '75%',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    borderTopWidth: StyleSheet.hairlineWidth,
    paddingTop: 8,
    paddingBottom: Platform.OS === 'ios' ? 34 : 16,
    paddingHorizontal: 20,
  },
  handleBarContainer: {
    alignItems: 'center',
    marginBottom: 12,
  },
  handleBar: {
    width: 36,
    height: 4,
    borderRadius: 2,
    opacity: 0.3,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
    flexWrap: 'wrap',
  },
  holidayBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
  },
  holidayBadgeText: {
    fontSize: 12,
    fontWeight: '600',
  },
  tripBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
  },
  tripBadgeText: {
    fontSize: 12,
    fontWeight: '600',
  },
  totalBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 12,
    marginBottom: 12,
  },
  totalLabel: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '500',
  },
  totalAmount: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '700',
  },
  budgetRow: {
    marginBottom: 12,
    gap: 4,
  },
  budgetInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  budgetLabel: {
    fontSize: 12,
    fontWeight: '500',
  },
  budgetOverText: {
    fontSize: 12,
    fontWeight: '600',
  },
  budgetBar: {
    height: 4,
    borderRadius: 2,
    overflow: 'hidden',
  },
  budgetFill: {
    height: '100%',
    borderRadius: 2,
  },
  list: {
    maxHeight: 200,
  },
  listEmpty: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 20,
  },
  emptyText: {
    fontSize: 14,
  },
  recordItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 10,
    borderBottomWidth: StyleSheet.hairlineWidth,
    gap: 8,
  },
  recordLeft: {
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
  recordInfo: {
    flex: 1,
  },
  recordCategory: {
    fontSize: 15,
    fontWeight: '500',
  },
  recordNotes: {
    fontSize: 12,
    marginTop: 2,
  },
  recordAmount: {
    fontSize: 15,
    fontWeight: '600',
  },
  deleteBtn: {
    fontSize: 22,
    fontWeight: '300',
    marginLeft: 8,
  },
  formArea: {
    borderTopWidth: StyleSheet.hairlineWidth,
    paddingTop: 10,
    gap: 8,
  },
  currencyRow: {
    flexDirection: 'row',
  },
  currencyPill: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    backgroundColor: 'rgba(0,0,0,0.05)',
    marginRight: 6,
  },
  currencyPillText: {
    fontSize: 12,
    fontWeight: '500',
  },
  categoryRow: {
    flexDirection: 'row',
  },
  categoryPill: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 14,
    backgroundColor: 'rgba(0,0,0,0.05)',
    marginRight: 6,
  },
  categoryPillText: {
    fontSize: 13,
    fontWeight: '500',
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  amountInput: {
    width: 80,
    height: 40,
    borderRadius: 10,
    paddingHorizontal: 12,
    fontSize: 15,
    textAlign: 'center',
  },
  notesInput: {
    flex: 1,
    height: 40,
    borderRadius: 10,
    paddingHorizontal: 12,
    fontSize: 15,
  },
  addBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  addBtnDisabled: {
    opacity: 0.4,
  },
  addBtnText: {
    color: '#fff',
    fontSize: 22,
    fontWeight: '600',
    lineHeight: 24,
  },
});
