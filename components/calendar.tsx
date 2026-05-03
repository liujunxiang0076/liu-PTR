import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { LayoutChangeEvent, StyleSheet, TouchableOpacity, View } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';

import { getHoliday, getRestDayBadge, isWeekend, type RestDayBadge } from '@/constants/holidays';
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
  restDayBadge: RestDayBadge;
  dateKey: string;
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

function computeAdjacent(y: number, m: number, dir: number) {
  if (dir < 0) return m === 11 ? { y: y + 1, m: 0 } : { y, m: m + 1 };
  return m === 0 ? { y: y - 1, m: 11 } : { y, m: m - 1 };
}

// ———————————————————— 日期格子 ————————————————————

function DayCellView({
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
  const showAmount = hasExpense && !cell.holiday;
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
      {cell.holiday && (
        <ThemedText
          style={[styles.holidayText, { color: cell.currentMonth ? holidayColor : mutedColor }]}
          numberOfLines={1}>
          {cell.holiday}
        </ThemedText>
      )}
      {showAmount && (
        <ThemedText
          style={[styles.amountText, { color: cell.currentMonth ? amountColor : mutedColor }]}
          numberOfLines={1}>
          {compactAmount(dailyTotal)}
        </ThemedText>
      )}
      {/* 节假日+费用同时存在时：显示紧凑金额 */}
      {cell.holiday && hasExpense && (
        <ThemedText
          style={[styles.amountText, { color: cell.currentMonth ? amountColor : mutedColor }]}
          numberOfLines={1}>
          {compactAmount(dailyTotal)}
        </ThemedText>
      )}
    </TouchableOpacity>
  );
}

// ———————————————————— 单月网格 ————————————————————

function MonthGrid({
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
          {week.map((cell, ci) => (
            <DayCellView
              key={ci}
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
}

// ———————————————————— 主组件 ————————————————————

export function Calendar({ onDayPress, getDailyTotal, getDayBudget, onSettingsPress, onBackupPress, onSearchPress }: Props) {
  const today = useMemo(() => new Date(), []);

  // 月份状态 + 网格数据合为一个 state，保证原子更新
  const [gridData, setGridData] = useState(() => {
    const y = today.getFullYear();
    const m = today.getMonth();
    const prev = computeAdjacent(y, m, 1);
    const next = computeAdjacent(y, m, -1);
    return {
      year: y,
      month: m,
      label: computeLabel(y, m),
      currGrid: buildGrid(y, m, today),
      prevGrid: buildGrid(prev.y, prev.m, today),
      nextGrid: buildGrid(next.y, next.m, today),
    };
  });

  // 用于手势滑动过程中缓存预计算的目标数据
  const pendingRef = useRef<typeof gridData | null>(null);

  const [width, setWidth] = useState(0);

  const { tint, muted: mutedColor, danger: dangerColor } = useAppColors();
  const holidayColor = dangerColor;
  const weekendColor = dangerColor;

  const colors = { tint, muted: mutedColor, holiday: holidayColor, weekend: weekendColor };

  const translateX = useSharedValue(0);
  const isSwiping = useSharedValue(false);

  // 滑轨初始偏移到中心
  useEffect(() => {
    if (width > 0) {
      translateX.value = -width;
    }
  }, [width, translateX]);

  // 预计算目标月份数据（手势滑动或按钮点击时调用）
  const precomputeTransition = useCallback(
    (dir: number) => {
      const d = gridData;
      const target = computeAdjacent(d.year, d.month, dir);
      const prev = computeAdjacent(target.y, target.m, 1);
      const next = computeAdjacent(target.y, target.m, -1);
      pendingRef.current = {
        year: target.y,
        month: target.m,
        label: computeLabel(target.y, target.m),
        currGrid: buildGrid(target.y, target.m, today),
        prevGrid: buildGrid(prev.y, prev.m, today),
        nextGrid: buildGrid(next.y, next.m, today),
      };
    },
    [today, gridData]
  );

  // 动画完成时原子更新 state，消除 ref + state 不一致导致的闪烁
  const applyTransition = useCallback(() => {
    const pending = pendingRef.current;
    if (!pending) return;
    pendingRef.current = null;
    setGridData(pending);
    requestAnimationFrame(() => {
      isSwiping.value = false;
    });
  }, [isSwiping]);

  // —— 月份切换按钮 ——
  const navigateMonth = useCallback(
    (dir: number) => {
      if (isSwiping.value || width === 0) return;
      isSwiping.value = true;
      // 动画前同步计算目标数据
      precomputeTransition(dir);
      const targetX = dir < 0 ? -2 * width : 0;
      translateX.value = withTiming(targetX, { duration: ANIM_DURATION }, (finished) => {
        if (finished) {
          translateX.value = -width;
          runOnJS(applyTransition)();
        }
      });
    },
    [width, precomputeTransition, applyTransition, isSwiping, translateX]
  );

  // —— 布局测量 ——
  const onLayout = useCallback((e: LayoutChangeEvent) => {
    setWidth(e.nativeEvent.layout.width);
  }, []);

  // 记录上一次预计算方向，避免重复触发
  const precomputedDir = useRef(0);

  // —— 手势 ——
  const panGesture = Gesture.Pan()
    .onStart(() => {
      if (isSwiping.value) return;
      precomputedDir.current = 0;
    })
    .onUpdate((e) => {
      if (isSwiping.value) return;
      translateX.value = -width + e.translationX;

      // 超过阈值时预计算目标数据（纯计算，不触发 React 渲染）
      const w = width;
      if (w > 0) {
        if (e.translationX < -w * 0.3 && precomputedDir.current !== -1) {
          precomputedDir.current = -1;
          runOnJS(precomputeTransition)(-1);
        } else if (e.translationX > w * 0.3 && precomputedDir.current !== 1) {
          precomputedDir.current = 1;
          runOnJS(precomputeTransition)(1);
        }
      }
    })
    .onEnd((e) => {
      if (isSwiping.value) return;
      const w = width;

      if (e.translationX < -SWIPE_THRESHOLD && w > 0) {
        // 左滑 → 下月
        isSwiping.value = true;
        // 动画前同步计算（若还未预计算则补算）
        if (precomputedDir.current !== -1) runOnJS(precomputeTransition)(-1);
        translateX.value = withTiming(-2 * w, { duration: ANIM_DURATION }, (finished) => {
          if (finished) {
            translateX.value = -w;
            runOnJS(applyTransition)();
          }
        });
      } else if (e.translationX > SWIPE_THRESHOLD && w > 0) {
        // 右滑 → 上月
        isSwiping.value = true;
        if (precomputedDir.current !== 1) runOnJS(precomputeTransition)(1);
        translateX.value = withTiming(0, { duration: ANIM_DURATION }, (finished) => {
          if (finished) {
            translateX.value = -w;
            runOnJS(applyTransition)();
          }
        });
      } else {
        // 回弹（标签不变，无需更新）
        translateX.value = withTiming(-w, { duration: ANIM_DURATION });
      }
    });

  const trackStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value }],
  }));

  const d = gridData;

  if (width === 0) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <View style={styles.headerSpacer} />
          <ThemedText type="title" style={styles.monthLabelText}>{gridData.label}</ThemedText>
          <View style={styles.headerRightGroup}>
            <View style={styles.headerSpacer} />
            {onSearchPress && (
              <TouchableOpacity
                onPress={onSearchPress}
                hitSlop={12}
                style={styles.headerArrow}>
                <ThemedText style={[styles.arrowText, { color: mutedColor }]}>🔍</ThemedText>
              </TouchableOpacity>
            )}
            {onBackupPress && (
              <TouchableOpacity
                onPress={onBackupPress}
                hitSlop={12}
                style={styles.headerArrow}>
                <ThemedText style={[styles.arrowText, { color: mutedColor }]}>↑↓</ThemedText>
              </TouchableOpacity>
            )}
            {onSettingsPress && (
              <TouchableOpacity
                onPress={onSettingsPress}
                hitSlop={12}
                style={styles.headerArrow}>
                <ThemedText style={[styles.arrowText, { color: mutedColor }]}>⚙</ThemedText>
              </TouchableOpacity>
            )}
          </View>
        </View>
        <View style={styles.weekRow}>
          {WEEKDAYS.map((wd, i) => (
            <View key={wd} style={styles.weekCell}>
              <ThemedText style={[styles.weekdayText, { color: i >= 5 ? weekendColor : mutedColor }]}>
                {wd}
              </ThemedText>
            </View>
          ))}
        </View>
        <View style={styles.gestureArea} onLayout={onLayout} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigateMonth(1)}
          hitSlop={12}
          style={styles.headerArrow}>
          <ThemedText style={[styles.arrowText, { color: mutedColor }]}>‹</ThemedText>
        </TouchableOpacity>
        <ThemedText type="title" style={styles.monthLabelText}>{gridData.label}</ThemedText>
        <View style={styles.headerRightGroup}>
          <TouchableOpacity
            onPress={() => navigateMonth(-1)}
            hitSlop={12}
            style={styles.headerArrow}>
            <ThemedText style={[styles.arrowText, { color: mutedColor }]}>›</ThemedText>
          </TouchableOpacity>
          {onSearchPress && (
            <TouchableOpacity
              onPress={onSearchPress}
              hitSlop={12}
              style={styles.headerArrow}>
              <ThemedText style={[styles.arrowText, { color: mutedColor }]}>🔍</ThemedText>
            </TouchableOpacity>
          )}
          {onBackupPress && (
            <TouchableOpacity
              onPress={onBackupPress}
              hitSlop={12}
              style={styles.headerArrow}>
              <ThemedText style={[styles.arrowText, { color: mutedColor }]}>↑↓</ThemedText>
            </TouchableOpacity>
          )}
          {onSettingsPress && (
            <TouchableOpacity
              onPress={onSettingsPress}
              hitSlop={12}
              style={styles.headerArrow}>
              <ThemedText style={[styles.arrowText, { color: mutedColor }]}>⚙</ThemedText>
            </TouchableOpacity>
          )}
        </View>
      </View>

      <View style={styles.weekRow}>
        {WEEKDAYS.map((wd, i) => (
          <View key={wd} style={styles.weekCell}>
            <ThemedText style={[styles.weekdayText, { color: i >= 5 ? weekendColor : mutedColor }]}>
              {wd}
            </ThemedText>
          </View>
        ))}
      </View>

      <GestureDetector gesture={panGesture}>
        <View style={styles.gestureArea}>
          <Animated.View style={[styles.track, { width: width * 3 }, trackStyle]}>
            <View style={{ width }}>
              <MonthGrid grid={d.prevGrid} onDayPress={onDayPress} getDailyTotal={getDailyTotal} getDayBudget={getDayBudget} colors={colors} />
            </View>
            <View style={{ width }}>
              <MonthGrid grid={d.currGrid} onDayPress={onDayPress} getDailyTotal={getDailyTotal} getDayBudget={getDayBudget} colors={colors} />
            </View>
            <View style={{ width }}>
              <MonthGrid grid={d.nextGrid} onDayPress={onDayPress} getDailyTotal={getDailyTotal} getDayBudget={getDayBudget} colors={colors} />
            </View>
          </Animated.View>
        </View>
      </GestureDetector>
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
