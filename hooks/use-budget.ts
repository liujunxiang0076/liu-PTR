import { useCallback, useEffect, useRef, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

import { type DailyBudget } from '@/types/expense';
import { isWeekend, getRestDayBadge } from '@/constants/holidays';
import { supabase, TABLES } from '@/lib/supabase';

const STORAGE_KEY = '@budget:v1';

const DEFAULT_BUDGET: DailyBudget = {
  workday: 200,
  weekend: 300,
  holiday: 500,
};

export function useBudget(userId?: string) {
  const [budget, setBudget] = useState<DailyBudget>(DEFAULT_BUDGET);
  const [loaded, setLoaded] = useState(false);
  const latestBudget = useRef(budget);
  latestBudget.current = budget;

  // 启动：AsyncStorage 秒开 → Supabase 拉取覆盖
  useEffect(() => {
    let cancelled = false;

    AsyncStorage.getItem(STORAGE_KEY).then((raw) => {
      if (cancelled) return;
      if (raw) {
        try { setBudget(JSON.parse(raw)); } catch {}
      }
    });

    if (userId) {
      supabase.from(TABLES.BUDGETS)
        .select('workday, weekend, holiday')
        .eq('user_id', userId)
        .maybeSingle()
        .then(({ data, error }) => {
          if (cancelled) return;
          if (error) {
            console.warn('[useBudget] Supabase 预算拉取失败:', error.message);
            return;
          }
          if (!data) {
            console.log('[useBudget] Supabase 无预算数据，userId:', userId);
            return;
          }
          const remote: DailyBudget = {
            workday: data.workday,
            weekend: data.weekend,
            holiday: data.holiday,
          };
          setBudget(remote);
          AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(remote));
        });
    }

    setLoaded(true);
    return () => { cancelled = true; };
  }, [userId]);

  const update = useCallback((updates: Partial<DailyBudget>) => {
    setBudget((prev) => {
      const next = { ...prev, ...updates };
      // 本地持久化
      AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      // 云端同步
      if (userId) {
        supabase.from(TABLES.BUDGETS).upsert({
          user_id: userId,
          workday: next.workday,
          weekend: next.weekend,
          holiday: next.holiday,
        }).then(({ error }) => {
          if (error) console.warn('[useBudget] 云端同步失败:', error.message);
        });
      }
      return next;
    });
  }, [userId]);

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

  const importAll = useCallback((data: DailyBudget) => {
    setBudget(data);
    AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    if (userId) {
      supabase.from(TABLES.BUDGETS).upsert({
        user_id: userId,
        workday: data.workday,
        weekend: data.weekend,
        holiday: data.holiday,
      });
    }
  }, [userId]);

  return { budget, update, getDayBudget, importAll, loaded };
}
