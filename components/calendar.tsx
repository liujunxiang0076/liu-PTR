import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { LayoutChangeEvent, StyleSheet, TouchableOpacity, View } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';

import { getHoliday, getRestDayBadge, getLunarText, isWeekend, type RestDayBadge } from '@/constants/holidays';
import { compactAmount } from '@/constants/currency';
import { SemanticColors } from '@/constants/theme';
import { useAppColors } from '@/hooks/use-app-colors';
import { ThemedText } from './themed-text';

const WEEKDAYS = ['一', '二', '三', '四', '五', '六', '日'];
const SWIPE_THRESHOLD = 50;
const ANIM_DURATION = 280;

function getDaysInMonth(year: number, month: number) {
  return new Date(year, month + 1, 0).getDate();
}

function getFirstDayOfWeek(year: number, month: number) {
  const day = new Date(year, month, 1).getDay();
  return day === 0 ? 6 : day - 1;
}

function isSameDay(a: Date, b: Date) {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

export function makeDateKey(y: number, m: number, d: number) {
  return `${y}-${String(m + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
}

type DayCell = {
  day: number;
  year: number;
  month: number;
  currentMonth: boolean;
  isToday: boolean;
  isWeekend: boolean;
  holiday: string | null;
  lunarText: string;
  restDayBadge: RestDayBadge;
  dateKey: string;
};

type GridState = {
  year: number;
  month: number;
  prevGrid: DayCell[][];
  currGrid: DayCell[][];
  nextGrid: DayCell[][];
};

type Props = {
  onDayPress: (dateKey: string, year: number, month: number, day: number) => void;
  getDailyTotal: (dateKey: string) => number;
  getDayBudget: (year: number, month: number, day: number) => { amount: number };
  onSettingsPress?: () => void;
  onBackupPress?: () => void;
  onSearchPress?: () => void;
};

function buildGrid(year: number, month: number, today: Date): DayCell[][] {
  const daysInMonth = getDaysInMonth(year, month);
  const firstDay = getFirstDayOfWeek(year, month);
  const prevMonthDays = getDaysInMonth(year, month === 0 ? 11 : month - 1);
  const grid: DayCell[][] = [];
  let dayCounter = 1;
  let nextDayCounter = 1;

  for (let row = 0; row < 6; row++) {
    const week: DayCell[] = [];
    for (let col = 0; col < 7; col++) {
      const cellIndex = row * 7 + col;
      if (cellIndex < firstDay) {
        const d = prevMonthDays - firstDay + col + 1;
        const pm = month === 0 ? 11 : month - 1;
        const py = month === 0 ? year - 1 : year;
        week.push({
          day: d, year: py, month: pm,
          currentMonth: false, isToday: false,
          isWeekend: isWeekend(py, pm, d),
          holiday: getHoliday(py, pm, d),
          lunarText: getLunarText(py, pm, d),
          restDayBadge: getRestDayBadge(py, pm, d),
          dateKey: makeDateKey(py, pm, d),
        });
      } else if (dayCounter <= daysInMonth) {
        week.push({
          day: dayCounter, year, month,
          currentMonth: true,
          isToday: isSameDay(new Date(year, month, dayCounter), today),
          isWeekend: isWeekend(year, month, dayCounter),
          holiday: getHoliday(year, month, dayCounter),
          lunarText: getLunarText(year, month, dayCounter),
          restDayBadge: getRestDayBadge(year, month, dayCounter),
          dateKey: makeDateKey(year, month, dayCounter),
        });
        dayCounter++;
      } else {
        const nm = month === 11 ? 0 : month + 1;
        const ny = month === 11 ? year + 1 : year;
        week.push({
          day: nextDayCounter, year: ny, month: nm,
          currentMonth: false, isToday: false,
          isWeekend: isWeekend(ny, nm, nextDayCounter),
          holiday: getHoliday(ny, nm, nextDayCounter),
          lunarText: getLunarText(ny, nm, nextDayCounter),
          restDayBadge: getRestDayBadge(ny, nm, nextDayCounter),
          dateKey: makeDateKey(ny, nm, nextDayCounter),
        });
        nextDayCounter++;
      }
    }
    grid.push(week);
  }
  return grid;
}

function computeLabel(y: number, m: number): string {
  return `${y}年${m + 1}月`;
}

// ─── header ────────────────────────────────────────────────────

function CalendarHeader({
  label,
  mutedColor,
  onPrev,
  onNext,
  onSearchPress,
  onBackupPress,
  onSettingsPress,
}: {
  label: string;
  mutedColor: string;
  onPrev?: () => void;
  onNext?: () => void;
  onSearchPress?: () => void;
  onBackupPress?: () => void;
  onSettingsPress?: () => void;
}) {
  return (
    <View style={styles.header}>
      {onPrev ? (
        <TouchableOpacity onPress={onPrev} hitSlop={12} style={styles.headerArrow}>
          <ThemedText style={[styles.arrowText, { color: mutedColor }]}>‹</ThemedText>
        </TouchableOpacity>
      ) : (
        <View style={styles.headerSpacer} />
      )}
      <ThemedText type="title" style={styles.monthLabelText}>{label}</ThemedText>
      <View style={styles.headerRightGroup}>
        {onNext ? (
          <TouchableOpacity onPress={onNext} hitSlop={12} style={styles.headerArrow}>
            <ThemedText style={[styles.arrowText, { color: mutedColor }]}>›</ThemedText>
          </TouchableOpacity>
        ) : (
          <View style={styles.headerSpacer} />
        )}
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

// ─── 日期格子 ─────────────────────────────────────────────────

const DayCellView = React.memo(function DayCellView({
  cell,
  dailyTotal,
  budgetAmount,
  tint,
  mutedColor,
  holidayColor,
  weekendColor,
  onPress,
}: {
  cell: DayCell;
  dailyTotal: number;
  budgetAmount: number;
  tint: string;
  mutedColor: string;
  holidayColor: string;
  weekendColor: string;
  onPress: () => void;
}) {
  const textColor = !cell.currentMonth
    ? mutedColor
    : cell.isToday ? '#fff' : cell.isWeekend ? weekendColor : undefined;

  const hasExpense = dailyTotal > 0;
  const showAmount = hasExpense && !cell.holiday && !cell.lunarText;
  const overBudget = budgetAmount > 0 && dailyTotal > budgetAmount;
  const amountColor = overBudget ? SemanticColors.danger : tint;

  return (
    <TouchableOpacity style={styles.weekCell} activeOpacity={0.6} onPress={onPress}>
      <View style={styles.dayWrapper}>
        {cell.isToday ? (
          <View style={[styles.todayCircle, { backgroundColor: tint }]}>
            <ThemedText style={[styles.dayText, { color: '#fff', fontWeight: '700' }]}>
              {cell.day}
            </ThemedText>
          </View>
        ) : (
          <ThemedText style={[styles.dayText, textColor !== undefined && { color: textColor }]}>
            {cell.day}
          </ThemedText>
        )}
        {cell.restDayBadge && cell.currentMonth && (
          <View style={[
            styles.restBadge,
            { backgroundColor: cell.restDayBadge === '休' ? SemanticColors.success : SemanticColors.warning },
          ]}>
            <ThemedText style={styles.restBadgeText}>{cell.restDayBadge}</ThemedText>
          </View>
        )}
        {overBudget && cell.currentMonth && (
          <View style={styles.overBudgetBadge}>
            <ThemedText style={styles.overBudgetBadgeText}>!</ThemedText>
          </View>
        )}
      </View>
      {cell.holiday ? (
        <ThemedText
          style={[styles.holidayText, { color: cell.currentMonth ? holidayColor : mutedColor }]}
          numberOfLines={1}>
          {cell.holiday}
        </ThemedText>
      ) : cell.lunarText && cell.currentMonth ? (
        <ThemedText
          style={[styles.holidayText, { color: mutedColor }]}
          numberOfLines={1}>
          {cell.lunarText}
        </ThemedText>
      ) : null}
      {showAmount && (
        <ThemedText
          style={[styles.amountText, { color: cell.currentMonth ? amountColor : mutedColor }]}
          numberOfLines={1}>
          {compactAmount(dailyTotal)}
        </ThemedText>
      )}
      {(cell.holiday || cell.lunarText) && hasExpense && (
        <ThemedText
          style={[styles.amountText, { color: cell.currentMonth ? amountColor : mutedColor }]}
          numberOfLines={1}>
          {compactAmount(dailyTotal)}
        </ThemedText>
      )}
    </TouchableOpacity>
  );
});

// ─── 单月网格 ─────────────────────────────────────────────────

const MonthGrid = React.memo(function MonthGrid({
  grid,
  onDayPress,
  getDailyTotal,
  getDayBudget,
  colors,
}: {
  grid: DayCell[][];
  onDayPress: Props['onDayPress'];
  getDailyTotal: Props['getDailyTotal'];
  getDayBudget: Props['getDayBudget'];
  colors: { tint: string; muted: string; holiday: string; weekend: string };
}) {
  return (
    <View style={{ width: '100%' }}>
      {grid.map((week, ri) => (
        <View key={ri} style={styles.weekRow}>
          {week.map((cell) => (
            <DayCellView
              key={cell.dateKey}
              cell={cell}
              dailyTotal={cell.currentMonth ? getDailyTotal(cell.dateKey) : 0}
              budgetAmount={cell.currentMonth ? getDayBudget(cell.year, cell.month, cell.day).amount : 0}
              tint={colors.tint}
              mutedColor={colors.muted}
              holidayColor={colors.holiday}
              weekendColor={colors.weekend}
              onPress={() => onDayPress(cell.dateKey, cell.year, cell.month, cell.day)}
            />
          ))}
        </View>
      ))}
    </View>
  );
});

// ─── 主组件 ───────────────────────────────────────────────────

export function Calendar({ onDayPress, getDailyTotal, getDayBudget, onSettingsPress, onBackupPress, onSearchPress }: Props) {
  const today = useMemo(() => new Date(), []);

  // grid 数据存 ref，切换月份时只改 ref 引用，不触发 React 渲染管线
  // 未变化的 MonthGrid 因 grid prop 引用不变，React.memo 直接跳过
  const initGrid = (() => {
    const y = today.getFullYear();
    const m = today.getMonth();
    return {
      year: y, month: m,
      prevGrid: buildGrid(m === 0 ? y - 1 : y, m === 0 ? 11 : m - 1, today),
      currGrid: buildGrid(y, m, today),
      nextGrid: buildGrid(m === 11 ? y + 1 : y, m === 11 ? 0 : m + 1, today),
    };
  })();
  const gridRef = useRef<GridState>(initGrid);
  const pendingGridRef = useRef<DayCell[][] | null>(null);

  // 仅 header 文本用 state 驱动（最轻量的重渲染）
  const [gridLabel, setGridLabel] = useState(() => computeLabel(today.getFullYear(), today.getMonth()));

  const [width, setWidth] = useState(0);

  const { tint, muted: mutedColor, danger: dangerColor } = useAppColors();
  const holidayColor = dangerColor;
  const weekendColor = dangerColor;
  const colors = useMemo(() => ({ tint, muted: mutedColor, holiday: holidayColor, weekend: weekendColor }), [tint, mutedColor, holidayColor, weekendColor]);

  const translateX = useSharedValue(0);
  const isSwiping = useSharedValue(false);

  useEffect(() => {
    if (width > 0) {
      translateX.value = -width;
    }
  }, [width, translateX]);

  const onDayPressStable = useCallback(
    (dateKey: string, year: number, month: number, day: number) => {
      onDayPress(dateKey, year, month, day);
    },
    [onDayPress]
  );

  // 手势滑动完成：使用预计算的 grid 交换引用
  const commitAndReset = useCallback(
    (dir: number) => {
      if (!pendingGridRef.current) {
        isSwiping.value = false;
        return;
      }
      const prev = gridRef.current;
      if (dir < 0) {
        const ny = prev.month === 11 ? prev.year + 1 : prev.year;
        const nm = prev.month === 11 ? 0 : prev.month + 1;
        gridRef.current = {
          year: ny, month: nm,
          prevGrid: prev.currGrid,
          currGrid: prev.nextGrid,
          nextGrid: pendingGridRef.current,
        };
      } else {
        const py = prev.month === 0 ? prev.year - 1 : prev.year;
        const pm = prev.month === 0 ? 11 : prev.month - 1;
        gridRef.current = {
          year: py, month: pm,
          prevGrid: pendingGridRef.current,
          currGrid: prev.prevGrid,
          nextGrid: prev.currGrid,
        };
      }
      pendingGridRef.current = null;
      setGridLabel(computeLabel(gridRef.current.year, gridRef.current.month));
      isSwiping.value = false;
    },
    [isSwiping],
  );

  // 按钮切换：动画前先更新 gridRef + label，中心面板立即显示新月份数据
  const navigateMonth = useCallback(
    (dir: number) => {
      if (isSwiping.value || width === 0) return;
      isSwiping.value = true;

      // 先切换数据，再启动滑动动画
      const prev = gridRef.current;
      if (dir < 0) {
        const ny = prev.month === 11 ? prev.year + 1 : prev.year;
        const nm = prev.month === 11 ? 0 : prev.month + 1;
        gridRef.current = {
          year: ny, month: nm,
          prevGrid: prev.currGrid,
          currGrid: prev.nextGrid,
          nextGrid: buildGrid(nm === 11 ? ny + 1 : ny, nm === 11 ? 0 : nm + 1, today),
        };
      } else {
        const py = prev.month === 0 ? prev.year - 1 : prev.year;
        const pm = prev.month === 0 ? 11 : prev.month - 1;
        gridRef.current = {
          year: py, month: pm,
          prevGrid: buildGrid(pm === 0 ? py - 1 : py, pm === 0 ? 11 : pm - 1, today),
          currGrid: prev.prevGrid,
          nextGrid: prev.currGrid,
        };
      }
      setGridLabel(computeLabel(gridRef.current.year, gridRef.current.month));

      const targetX = dir < 0 ? -2 * width : 0;
      translateX.value = withTiming(targetX, { duration: ANIM_DURATION }, (finished) => {
        if (finished) {
          translateX.value = -width;
          runOnJS(() => { isSwiping.value = false; })();
        }
      });
    },
    [width, today, isSwiping, translateX],
  );

  const onLayout = useCallback((e: LayoutChangeEvent) => {
    setWidth(e.nativeEvent.layout.width);
  }, []);

  const panGesture = Gesture.Pan()
    .onStart(() => {
      if (isSwiping.value) return;
    })
    .onUpdate((e) => {
      if (isSwiping.value) return;
      translateX.value = -width + e.translationX;
    })
    .onEnd((e) => {
      if (isSwiping.value) return;
      const w = width;

      if (e.translationX < -SWIPE_THRESHOLD && w > 0) {
        isSwiping.value = true;
        // 动画期间在 UI 线程预计算目标月份 grid
        const d = gridRef.current;
        const nm = d.month === 11 ? 0 : d.month + 1;
        const ny = d.month === 11 ? d.year + 1 : d.year;
        pendingGridRef.current = buildGrid(
          nm === 11 ? ny + 1 : ny, nm === 11 ? 0 : nm + 1, today,
        );
        translateX.value = withTiming(-2 * w, { duration: ANIM_DURATION }, (finished) => {
          if (finished) {
            translateX.value = -w;
            runOnJS(commitAndReset)(-1);
          }
        });
      } else if (e.translationX > SWIPE_THRESHOLD && w > 0) {
        isSwiping.value = true;
        const d = gridRef.current;
        const pm = d.month === 0 ? 11 : d.month - 1;
        const py = d.month === 0 ? d.year - 1 : d.year;
        pendingGridRef.current = buildGrid(
          pm === 0 ? py - 1 : py, pm === 0 ? 11 : pm - 1, today,
        );
        translateX.value = withTiming(0, { duration: ANIM_DURATION }, (finished) => {
          if (finished) {
            translateX.value = -w;
            runOnJS(commitAndReset)(1);
          }
        });
      } else {
        translateX.value = withTiming(-w, { duration: ANIM_DURATION });
      }
    });

  const trackStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value }],
  }));

  const g = gridRef.current;

  return (
    <View style={styles.container}>
      <CalendarHeader
        label={gridLabel}
        mutedColor={mutedColor}
        onPrev={width > 0 ? () => navigateMonth(1) : undefined}
        onNext={width > 0 ? () => navigateMonth(-1) : undefined}
        onSearchPress={onSearchPress}
        onBackupPress={onBackupPress}
        onSettingsPress={onSettingsPress}
      />
      <View style={styles.weekRow}>
        {WEEKDAYS.map((wd, i) => (
          <View key={wd} style={styles.weekCell}>
            <ThemedText style={[styles.weekdayText, { color: i >= 5 ? weekendColor : mutedColor }]}>
              {wd}
            </ThemedText>
          </View>
        ))}
      </View>
      {width === 0 ? (
        <View style={styles.gestureArea} onLayout={onLayout} />
      ) : (
        <GestureDetector gesture={panGesture}>
          <View style={styles.gestureArea}>
            <Animated.View style={[styles.track, { width: width * 3 }, trackStyle]}>
              <View style={{ width }}>
                <MonthGrid grid={g.prevGrid} onDayPress={onDayPressStable} getDailyTotal={getDailyTotal} getDayBudget={getDayBudget} colors={colors} />
              </View>
              <View style={{ width }}>
                <MonthGrid grid={g.currGrid} onDayPress={onDayPressStable} getDailyTotal={getDailyTotal} getDayBudget={getDayBudget} colors={colors} />
              </View>
              <View style={{ width }}>
                <MonthGrid grid={g.nextGrid} onDayPress={onDayPressStable} getDailyTotal={getDailyTotal} getDayBudget={getDayBudget} colors={colors} />
              </View>
            </Animated.View>
          </View>
        </GestureDetector>
      )}
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
  headerSpacer: {
    width: 36,
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
  gestureArea: {
    overflow: 'hidden',
    flex: 1,
  },
  track: {
    flexDirection: 'row',
  },
  weekRow: {
    flexDirection: 'row',
    width: '100%',
  },
  weekCell: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'flex-start',
    paddingVertical: 8,
    minHeight: 62,
    gap: 1,
  },
  weekdayText: {
    fontSize: 12,
    fontWeight: '600',
    letterSpacing: 1,
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
