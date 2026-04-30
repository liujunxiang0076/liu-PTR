import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { LayoutChangeEvent, StyleSheet, TouchableOpacity, View } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';

import { getHoliday, isWeekend } from '@/constants/holidays';
import { compactAmount } from '@/constants/currency';
import { useThemeColor } from '@/hooks/use-theme-color';
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
  dateKey: string;
};

type Props = {
  onDayPress: (dateKey: string, year: number, month: number, day: number) => void;
  hasRecords: (dateKey: string) => boolean;
  getDailyTotal: (dateKey: string) => number;
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
          dateKey: makeDateKey(py, pm, d),
        });
      } else if (dayCounter <= daysInMonth) {
        week.push({
          day: dayCounter, year, month,
          currentMonth: true,
          isToday: isSameDay(new Date(year, month, dayCounter), today),
          isWeekend: isWeekend(year, month, dayCounter),
          holiday: getHoliday(year, month, dayCounter),
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
          dateKey: makeDateKey(ny, nm, nextDayCounter),
        });
        nextDayCounter++;
      }
    }
    grid.push(week);
  }
  return grid;
}

function filterVisible(weeks: DayCell[][]): DayCell[][] {
  return weeks.filter((w) => w.some((c) => c.currentMonth));
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
  tint,
  mutedColor,
  holidayColor,
  weekendColor,
  onPress,
}: {
  cell: DayCell;
  dailyTotal: number;
  tint: string;
  mutedColor: string;
  holidayColor: string;
  weekendColor: string;
  onPress: () => void;
}) {
  const textColor = !cell.currentMonth
    ? mutedColor
    : cell.isToday ? '#fff' : cell.isWeekend ? weekendColor : undefined;

  return (
    <TouchableOpacity style={styles.weekCell} activeOpacity={0.6} onPress={onPress}>
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
      {cell.holiday && (
        <ThemedText
          style={[styles.holidayText, { color: cell.currentMonth ? holidayColor : mutedColor }]}
          numberOfLines={1}>
          {cell.holiday}
        </ThemedText>
      )}
      {dailyTotal > 0 && !cell.holiday && (
        <ThemedText
          style={[styles.amountText, { color: cell.currentMonth ? tint : mutedColor }]}
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
  colors,
}: {
  grid: DayCell[][];
  onDayPress: Props['onDayPress'];
  getDailyTotal: Props['getDailyTotal'];
  colors: { tint: string; muted: string; holiday: string; weekend: string };
}) {
  return (
    <View>
      {grid.map((week, ri) => (
        <View key={ri} style={styles.weekRow}>
          {week.map((cell, ci) => (
            <DayCellView
              key={ci}
              cell={cell}
              dailyTotal={cell.currentMonth ? getDailyTotal(cell.dateKey) : 0}
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

export function Calendar({ onDayPress, hasRecords, getDailyTotal }: Props) {
  const today = useMemo(() => new Date(), []);

  // 所有月份数据存在 ref 里，同步更新，无异步间隙
  const dataRef = useRef({
    year: today.getFullYear(),
    month: today.getMonth(),
    label: computeLabel(today.getFullYear(), today.getMonth()),
    currGrid: [] as DayCell[][],
    prevGrid: [] as DayCell[][],
    nextGrid: [] as DayCell[][],
  });

  // 初始化三个网格
  if (dataRef.current.currGrid.length === 0) {
    const d = dataRef.current;
    d.currGrid = filterVisible(buildGrid(d.year, d.month, today));
    const prev = computeAdjacent(d.year, d.month, 1);
    d.prevGrid = filterVisible(buildGrid(prev.y, prev.m, today));
    const next = computeAdjacent(d.year, d.month, -1);
    d.nextGrid = filterVisible(buildGrid(next.y, next.m, today));
  }

  // 预计算的目标数据（滑动过程中提前计算，动画完成时直接切换，消除抖动）
  const pendingRef = useRef<{
    dir: number;
    year: number;
    month: number;
    label: string;
    currGrid: DayCell[][];
    prevGrid: DayCell[][];
    nextGrid: DayCell[][];
  } | null>(null);

  // 不再使用 forceRender——数据更新通过 setMonthLabel 自然触发 React 渲染

  // 月份标签（仅在动画完成后更新，滑动过程中不变，避免 React 渲染干扰动画）
  const [monthLabel, setMonthLabel] = useState(dataRef.current.label);
  const [width, setWidth] = useState(0);

  const tint = useThemeColor({}, 'tint');
  const mutedColor = useThemeColor({ light: '#9BA1A6', dark: '#687076' }, 'icon');
  const holidayColor = useThemeColor({ light: '#E85D5D', dark: '#FF7B7B' }, 'tint');
  const weekendColor = useThemeColor({ light: '#E85D5D', dark: '#FF7B7B' }, 'tint');

  const colors = { tint, muted: mutedColor, holiday: holidayColor, weekend: weekendColor };

  const translateX = useSharedValue(0);
  const isSwiping = useSharedValue(false);

  // 滑轨初始偏移到中心
  useEffect(() => {
    if (width > 0) {
      translateX.value = -width;
    }
  }, [width, translateX]);

  // 预计算目标月份数据（在滑动判断方向时调用，而非动画完成时）
  const precomputeTransition = useCallback(
    (dir: number) => {
      const d = dataRef.current;
      const target = computeAdjacent(d.year, d.month, dir);
      const prev = computeAdjacent(target.y, target.m, 1);
      const next = computeAdjacent(target.y, target.m, -1);
      pendingRef.current = {
        dir,
        year: target.y,
        month: target.m,
        label: computeLabel(target.y, target.m),
        currGrid: filterVisible(buildGrid(target.y, target.m, today)),
        prevGrid: filterVisible(buildGrid(prev.y, prev.m, today)),
        nextGrid: filterVisible(buildGrid(next.y, next.m, today)),
      };
    },
    [today]
  );

  // 动画完成时直接应用已预计算的数据，零计算延迟
  // 注意：isSwiping 保持 true，防止新手势在渲染期间穿透
  const applyTransition = useCallback(() => {
    const pending = pendingRef.current;
    if (!pending) return;
    pendingRef.current = null;
    const d = dataRef.current;
    d.year = pending.year;
    d.month = pending.month;
    d.label = pending.label;
    d.currGrid = pending.currGrid;
    d.prevGrid = pending.prevGrid;
    d.nextGrid = pending.nextGrid;
    setMonthLabel(d.label);
    // setMonthLabel 触发自然的 React 渲染，不需要 forceRender
    // 渲染完成后再释放滑动锁
    requestAnimationFrame(() => {
      isSwiping.value = false;
    });
  }, [isSwiping]);

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
        // 若还未预计算（快速滑动跳过 onUpdate），立即补算
        if (precomputedDir.current !== -1) runOnJS(precomputeTransition)(-1);
        translateX.value = withTiming(-2 * w, { duration: ANIM_DURATION }, (finished) => {
          if (finished) {
            translateX.value = -w;
            runOnJS(applyTransition)(); // applyTransition 负责释放 isSwiping
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

  const d = dataRef.current;

  if (width === 0) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <ThemedText type="title" style={styles.monthLabelText}>{monthLabel}</ThemedText>
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
        <ThemedText type="title" style={styles.monthLabelText}>{monthLabel}</ThemedText>
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
              <MonthGrid grid={d.prevGrid} onDayPress={onDayPress} getDailyTotal={getDailyTotal} colors={colors} />
            </View>
            <View style={{ width }}>
              <MonthGrid grid={d.currGrid} onDayPress={onDayPress} getDailyTotal={getDailyTotal} colors={colors} />
            </View>
            <View style={{ width }}>
              <MonthGrid grid={d.nextGrid} onDayPress={onDayPress} getDailyTotal={getDailyTotal} colors={colors} />
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
    paddingHorizontal: 8,
    paddingTop: 4,
    paddingBottom: 8,
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
  },
  weekCell: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'flex-start',
    paddingVertical: 8,
    minHeight: 58,
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
  todayCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  holidayText: {
    fontSize: 9,
    textAlign: 'center',
  },
  amountText: {
    fontSize: 9,
    fontWeight: '600',
    textAlign: 'center',
  },
});
