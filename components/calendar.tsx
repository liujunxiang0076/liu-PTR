import React, { forwardRef, useCallback, useImperativeHandle, useMemo } from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';
import { Calendar as RNCalendar, DateData } from 'react-native-calendars';

import { getHoliday, getRestDayBadge, getLunarText, isWeekend, type RestDayBadge } from '@/constants/holidays';
import { compactAmount } from '@/constants/currency';
import { SemanticColors } from '@/constants/theme';
import { useAppColors } from '@/hooks/use-app-colors';
import { ThemedText } from './themed-text';

export function makeDateKey(y: number, m: number, d: number) {
  return `${y}-${String(m + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
}

type Props = {
  onDayPress: (dateKey: string, year: number, month: number, day: number) => void;
  getDailyTotal: (dateKey: string) => number;
  getDayBudget: (year: number, month: number, day: number) => { amount: number };
  onSettingsPress?: () => void;
  onBackupPress?: () => void;
  onSearchPress?: () => void;
};

// ———————————————————— 自定义日期格子 ————————————————————

function DayCellView({
  date,
  state,
  onDayPress,
  getDailyTotal,
  getDayBudget,
  tint,
  mutedColor,
  holidayColor,
  weekendColor,
}: {
  date: DateData;
  state: string;
  onDayPress: Props['onDayPress'];
  getDailyTotal: Props['getDailyTotal'];
  getDayBudget: Props['getDayBudget'];
  tint: string;
  mutedColor: string;
  holidayColor: string;
  weekendColor: string;
}) {
  const { year, month, day, dateString } = date;
  const isCurrentMonth = state !== 'disabled';
  const isToday = state === 'today';
  const month0 = month - 1;
  const isWeekendDay = isWeekend(year, month0, day);

  const holiday = getHoliday(year, month0, day);
  const lunarText = getLunarText(year, month0, day);
  const restDayBadge: RestDayBadge = getRestDayBadge(year, month0, day);

  const dailyTotal = isCurrentMonth ? getDailyTotal(dateString) : 0;
  const budgetAmount = isCurrentMonth ? getDayBudget(year, month0, day).amount : 0;
  const hasExpense = dailyTotal > 0;
  const overBudget = budgetAmount > 0 && dailyTotal > budgetAmount;
  const amountColor = overBudget ? SemanticColors.danger : tint;

  const textColor = !isCurrentMonth
    ? mutedColor
    : isToday ? '#fff' : isWeekendDay ? weekendColor : undefined;

  const showAmount = hasExpense && !holiday && !lunarText;

  return (
    <TouchableOpacity
      style={styles.dayCell}
      activeOpacity={0.6}
      onPress={() => onDayPress(dateString, year, month0, day)}
    >
      <View style={styles.dayWrapper}>
        {isToday ? (
          <View style={[styles.todayCircle, { backgroundColor: tint }]}>
            <ThemedText style={[styles.dayText, { color: '#fff', fontWeight: '700' }]}>
              {day}
            </ThemedText>
          </View>
        ) : (
          <ThemedText style={[styles.dayText, textColor !== undefined && { color: textColor }]}>
            {day}
          </ThemedText>
        )}
        {restDayBadge && isCurrentMonth && (
          <View style={[
            styles.restBadge,
            { backgroundColor: restDayBadge === '休' ? SemanticColors.success : SemanticColors.warning },
          ]}>
            <ThemedText style={styles.restBadgeText}>{restDayBadge}</ThemedText>
          </View>
        )}
        {overBudget && isCurrentMonth && (
          <View style={styles.overBudgetBadge}>
            <ThemedText style={styles.overBudgetBadgeText}>!</ThemedText>
          </View>
        )}
      </View>
      {holiday ? (
        <ThemedText
          style={[styles.holidayText, { color: isCurrentMonth ? holidayColor : mutedColor }]}
          numberOfLines={1}>
          {holiday}
        </ThemedText>
      ) : lunarText && isCurrentMonth ? (
        <ThemedText
          style={[styles.holidayText, { color: mutedColor }]}
          numberOfLines={1}>
          {lunarText}
        </ThemedText>
      ) : null}
      {showAmount && (
        <ThemedText
          style={[styles.amountText, { color: isCurrentMonth ? amountColor : mutedColor }]}
          numberOfLines={1}>
          {compactAmount(dailyTotal)}
        </ThemedText>
      )}
      {(holiday || lunarText) && hasExpense && isCurrentMonth && (
        <ThemedText
          style={[styles.amountText, { color: amountColor }]}
          numberOfLines={1}>
          {compactAmount(dailyTotal)}
        </ThemedText>
      )}
    </TouchableOpacity>
  );
}

// ———————————————————— 自定义 Header（forwardRef）————————————————————
// react-native-calendars 的 customHeader 要求：
// 1. forwardRef 组件
// 2. 接收 { month, addMonth, ... } props
// 3. 通过 useImperativeHandle 暴露 onPressLeft / onPressRight（滑动手势需要）

type CalendarHeaderProps = {
  month: any;      // XDate 对象
  addMonth: (count: number) => void;
  onSearchPress?: () => void;
  onBackupPress?: () => void;
  onSettingsPress?: () => void;
  mutedColor: string;
};

const CustomCalendarHeader = forwardRef<any, CalendarHeaderProps>(
  ({ month, addMonth, onSearchPress, onBackupPress, onSettingsPress, mutedColor }, ref) => {
    useImperativeHandle(ref, () => ({
      onPressLeft: () => addMonth(-1),
      onPressRight: () => addMonth(1),
    }));

    // month 是 XDate 对象，用 toString 获取格式化字符串
    const label = month.toString('yyyy年M月');

    return (
      <View style={styles.header}>
        <TouchableOpacity onPress={() => addMonth(-1)} hitSlop={12} style={styles.headerArrow}>
          <ThemedText style={[styles.arrowText, { color: mutedColor }]}>‹</ThemedText>
        </TouchableOpacity>
        <ThemedText type="title" style={styles.monthLabelText}>{label}</ThemedText>
        <View style={styles.headerRightGroup}>
          <TouchableOpacity onPress={() => addMonth(1)} hitSlop={12} style={styles.headerArrow}>
            <ThemedText style={[styles.arrowText, { color: mutedColor }]}>›</ThemedText>
          </TouchableOpacity>
          {onSearchPress && (
            <TouchableOpacity onPress={onSearchPress} hitSlop={12} style={styles.headerArrow}>
              <ThemedText style={[styles.arrowText, { color: mutedColor }]}>🔍</ThemedText>
            </TouchableOpacity>
          )}
          {onBackupPress && (
            <TouchableOpacity onPress={onBackupPress} hitSlop={12} style={styles.headerArrow}>
              <ThemedText style={[styles.arrowText, { color: mutedColor }]}>↑↓</ThemedText>
            </TouchableOpacity>
          )}
          {onSettingsPress && (
            <TouchableOpacity onPress={onSettingsPress} hitSlop={12} style={styles.headerArrow}>
              <ThemedText style={[styles.arrowText, { color: mutedColor }]}>⚙</ThemedText>
            </TouchableOpacity>
          )}
        </View>
      </View>
    );
  }
);

// ———————————————————— 主组件 ————————————————————

export function Calendar({ onDayPress, getDailyTotal, getDayBudget, onSettingsPress, onBackupPress, onSearchPress }: Props) {
  const today = useMemo(() => {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  }, []);

  const { tint, muted: mutedColor, danger: dangerColor } = useAppColors();
  const holidayColor = dangerColor;
  const weekendColor = dangerColor;

  const handleDayPress = useCallback((day: DateData) => {
    onDayPress(day.dateString, day.year, day.month - 1, day.day);
  }, [onDayPress]);

  // customHeader 组件：将额外 props 通过闭包捕获
  // eslint-disable-next-line react/display-name
  const HeaderComponent = useMemo(() => {
    return forwardRef<any, { month: any; addMonth: (count: number) => void }>((props, ref) => (
      <CustomCalendarHeader
        ref={ref}
        month={props.month}
        addMonth={props.addMonth}
        onSearchPress={onSearchPress}
        onBackupPress={onBackupPress}
        onSettingsPress={onSettingsPress}
        mutedColor={mutedColor}
      />
    ));
  }, [onSearchPress, onBackupPress, onSettingsPress, mutedColor]);

  const renderDay = useCallback((props: any) => {
    const { date, state } = props;
    return (
      <DayCellView
        date={date}
        state={state}
        onDayPress={onDayPress}
        getDailyTotal={getDailyTotal}
        getDayBudget={getDayBudget}
        tint={tint}
        mutedColor={mutedColor}
        holidayColor={holidayColor}
        weekendColor={weekendColor}
      />
    );
  }, [onDayPress, getDailyTotal, getDayBudget, tint, mutedColor, holidayColor, weekendColor]);

  return (
    <View style={styles.container}>
      <RNCalendar
        current={today}
        onDayPress={handleDayPress}
        dayComponent={renderDay}
        customHeader={HeaderComponent}
        hideArrows={true}
        enableSwipeMonths={true}
        firstDay={1}
        hideExtraDays={true}
        theme={{
          'stylesheet.calendar.header': {
            dayHeader: {
              marginTop: 2,
              marginBottom: 4,
              width: '14%',
              textAlign: 'center',
              fontSize: 12,
              fontWeight: '600',
              letterSpacing: 1,
            },
            week: {
              marginTop: 2,
              marginBottom: 2,
              flexDirection: 'row',
              justifyContent: 'space-around',
            },
          },
          // 不覆盖 stylesheet.day.basic.base（对 dayComponent 无效）
          // 库的 dayContainer 已有 flex:1, alignItems:'center'
          // dayCell 不再使用 flex:1，避免双重 flex 冲突
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 4,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 8,
    paddingTop: 4,
    paddingBottom: 8,
  },
  headerRightGroup: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerArrow: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
  arrowText: {
    fontSize: 28,
    fontWeight: '300',
    lineHeight: 32,
  },
  monthLabelText: {
    fontSize: 22,
    fontWeight: '700',
  },
  dayCell: {
    // 不使用 flex:1，库的 dayContainer 已经是 flex:1
    alignItems: 'center',
    justifyContent: 'flex-start',
    paddingVertical: 4,
    minHeight: 68,
    gap: 1,
  },
  dayText: {
    fontSize: 16,
    fontWeight: '500',
    textAlign: 'center',
  },
  dayWrapper: {
    position: 'relative',
  },
  restBadge: {
    position: 'absolute',
    top: -3,
    right: -9,
    borderRadius: 6,
    paddingHorizontal: 3,
    paddingVertical: 0,
    minWidth: 14,
    alignItems: 'center',
  },
  restBadgeText: {
    fontSize: 9,
    fontWeight: '700',
    color: '#fff',
    lineHeight: 12,
  },
  overBudgetBadge: {
    position: 'absolute',
    top: -3,
    left: -7,
    borderRadius: 6,
    width: 14,
    height: 14,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: SemanticColors.danger,
  },
  overBudgetBadgeText: {
    fontSize: 9,
    fontWeight: '700',
    color: '#fff',
    lineHeight: 12,
  },
  todayCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  holidayText: {
    fontSize: 10,
    textAlign: 'center',
  },
  amountText: {
    fontSize: 10,
    fontWeight: '600',
    textAlign: 'center',
  },
});
