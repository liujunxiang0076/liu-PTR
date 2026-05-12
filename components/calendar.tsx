import React, { useCallback, useMemo, useState } from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';
import { Calendar as RNCalendar, DateData } from 'react-native-calendars';

import { getHoliday, getRestDayBadge, getLunarText, isWeekend, type RestDayBadge } from '@/constants/holidays';
import { compactAmount } from '@/constants/currency';
import { SemanticColors } from '@/constants/theme';
import { useAppColors } from '@/hooks/use-app-colors';
import { ThemedText } from './themed-text';

const WEEKDAYS = ['一', '二', '三', '四', '五', '六', '日'];

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
  const isWeekendDay = isWeekend(year, month - 1, day);

  const holiday = getHoliday(year, month - 1, day);
  const lunarText = getLunarText(year, month - 1, day);
  const restDayBadge: RestDayBadge = getRestDayBadge(year, month - 1, day);

  const dailyTotal = isCurrentMonth ? getDailyTotal(dateString) : 0;
  const budgetAmount = isCurrentMonth ? getDayBudget(year, month - 1, day).amount : 0;
  const hasExpense = dailyTotal > 0;
  const overBudget = budgetAmount > 0 && dailyTotal > budgetAmount;
  const amountColor = overBudget ? SemanticColors.danger : tint;

  const textColor = !isCurrentMonth
    ? mutedColor
    : isToday ? '#fff' : isWeekendDay ? weekendColor : undefined;

  const showAmount = hasExpense && !holiday && !lunarText;

  return (
    <TouchableOpacity
      style={styles.weekCell}
      activeOpacity={0.6}
      onPress={() => onDayPress(dateString, year, month - 1, day)}
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
      {(holiday || lunarText) && hasExpense && (
        <ThemedText
          style={[styles.amountText, { color: isCurrentMonth ? amountColor : mutedColor }]}
          numberOfLines={1}>
          {compactAmount(dailyTotal)}
        </ThemedText>
      )}
    </TouchableOpacity>
  );
}

// ———————————————————— 自定义 Header ————————————————————

function CalendarHeader({
  date,
  onPrev,
  onNext,
  onSearchPress,
  onBackupPress,
  onSettingsPress,
  mutedColor,
}: {
  date: DateData;
  onPrev: () => void;
  onNext: () => void;
  onSearchPress?: () => void;
  onBackupPress?: () => void;
  onSettingsPress?: () => void;
  mutedColor: string;
}) {
  const label = `${date.year}年${date.month}月`;

  return (
    <View style={styles.header}>
      <TouchableOpacity onPress={onPrev} hitSlop={12} style={styles.headerArrow}>
        <ThemedText style={[styles.arrowText, { color: mutedColor }]}>‹</ThemedText>
      </TouchableOpacity>
      <ThemedText type="title" style={styles.monthLabelText}>{label}</ThemedText>
      <View style={styles.headerRightGroup}>
        <TouchableOpacity onPress={onNext} hitSlop={12} style={styles.headerArrow}>
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

// ———————————————————— 主组件 ————————————————————

export function Calendar({ onDayPress, getDailyTotal, getDayBudget, onSettingsPress, onBackupPress, onSearchPress }: Props) {
  const today = useMemo(() => {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  }, []);

  const { tint, muted: mutedColor, danger: dangerColor } = useAppColors();
  const holidayColor = dangerColor;
  const weekendColor = dangerColor;

  const [currentDate, setCurrentDate] = useState(today);

  const handleDayPress = useCallback((day: DateData) => {
    onDayPress(day.dateString, day.year, day.month - 1, day.day);
  }, [onDayPress]);

  const handleMonthChange = useCallback((date: DateData) => {
    setCurrentDate(date.dateString);
  }, []);

  const handlePrev = useCallback(() => {
    const [y, m] = currentDate.split('-').map(Number);
    const prev = m === 1 ? { y: y - 1, m: 12 } : { y, m: m - 1 };
    setCurrentDate(`${prev.y}-${String(prev.m).padStart(2, '0')}-01`);
  }, [currentDate]);

  const handleNext = useCallback(() => {
    const [y, m] = currentDate.split('-').map(Number);
    const next = m === 12 ? { y: y + 1, m: 1 } : { y, m: m + 1 };
    setCurrentDate(`${next.y}-${String(next.m).padStart(2, '0')}-01`);
  }, [currentDate]);

  const renderHeader = useCallback((date: DateData) => (
    <CalendarHeader
      date={date}
      onPrev={handlePrev}
      onNext={handleNext}
      onSearchPress={onSearchPress}
      onBackupPress={onBackupPress}
      onSettingsPress={onSettingsPress}
      mutedColor={mutedColor}
    />
  ), [handlePrev, handleNext, onSearchPress, onBackupPress, onSettingsPress, mutedColor]);

  const renderDay = useCallback(({ date, state }: { date: DateData; state: string }) => (
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
  ), [onDayPress, getDailyTotal, getDayBudget, tint, mutedColor, holidayColor, weekendColor]);

  return (
    <View style={styles.container}>
      <RNCalendar
        current={currentDate}
        onDayPress={handleDayPress}
        onMonthChange={handleMonthChange}
        dayComponent={renderDay}
        renderHeader={renderHeader}
        hideArrows={true}
        enableSwipeMonths={true}
        firstDay={1}
        hideExtraDays={false}
        theme={{
          'stylesheet.calendar.header': {
            dayHeader: {
              marginTop: 2,
              marginBottom: 4,
              width: 32,
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
          'stylesheet.day.basic': {
            base: {
              flex: 1,
              alignItems: 'center',
              justifyContent: 'flex-start',
              paddingVertical: 8,
              minHeight: 62,
            },
          },
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 4,
    gap: 2,
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
  weekCell: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'flex-start',
    paddingVertical: 8,
    minHeight: 62,
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
