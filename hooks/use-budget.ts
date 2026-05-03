import { useCallback, useEffect, useRef, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

import { type DailyBudget } from '@/types/expense';
import { isWeekend, getRestDayBadge } from '@/constants/holidays';

const STORAGE_KEY = '@budget:v1';
const SAVE_DELAY = 300;

const DEFAULT_BUDGET: DailyBudget = {
  workday: 200,
  weekend: 300,
  holiday: 500,
};

export function useBudget() {
  const [budget, setBudget] = useState<DailyBudget>(DEFAULT_BUDGET);
  const [loaded, setLoaded] = useState(false);
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY).then((raw) => {
      if (raw) {
        try {
          setBudget(JSON.parse(raw));
        } catch (e) {
          console.warn('[useBudget] JSON 解析失败:', e);
        }
      }
      setLoaded(true);
    });
  }, []);

  useEffect(() => {
    if (loaded) {
      if (saveTimer.current) clearTimeout(saveTimer.current);
      saveTimer.current = setTimeout(() => {
        AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(budget));
      }, SAVE_DELAY);
    }
    return () => { if (saveTimer.current) clearTimeout(saveTimer.current); };
  }, [budget, loaded]);

  const update = useCallback((updates: Partial<DailyBudget>) => {
    setBudget((prev) => ({ ...prev, ...updates }));
  }, []);

  /** 根据日期返回当天的预算类型和金额 */
  const getDayBudget = useCallback(
    (year: number, month: number, day: number): { type: 'workday' | 'weekend' | 'holiday'; amount: number } => {
      const badge = getRestDayBadge(year, month, day);
      // 调休上班日 → 工作日预算
      if (badge === '班') return { type: 'workday', amount: budget.workday };
      // 法定假日 → 假日预算
      if (badge === '休') return { type: 'holiday', amount: budget.holiday };
      // 普通周末 → 周末预算
      if (isWeekend(year, month, day)) return { type: 'weekend', amount: budget.weekend };
      // 工作日
      return { type: 'workday', amount: budget.workday };
    },
    [budget]
  );

  return { budget, update, getDayBudget, loaded };
}
