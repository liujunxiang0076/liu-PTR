import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

import { type Currency, type ExpenseCategory, type ExpenseItem, type ExpensesMap } from '@/types/expense';
import { convertToCNY, uid } from '@/constants/currency';

const STORAGE_KEY = '@expenses:v1';
const SAVE_DELAY = 500;

export function useExpenses() {
  const [expenses, setExpenses] = useState<ExpensesMap>({});
  const [loaded, setLoaded] = useState(false);
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const latestExpenses = useRef(expenses);
  latestExpenses.current = expenses;

  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY).then((raw) => {
      if (raw) {
        try {
          setExpenses(JSON.parse(raw));
        } catch (e) {
          console.warn('[useExpenses] JSON 解析失败，数据可能已损坏:', e);
        }
      }
      setLoaded(true);
    });
  }, []);

  useEffect(() => {
    if (loaded) {
      if (saveTimer.current) clearTimeout(saveTimer.current);
      saveTimer.current = setTimeout(() => {
        AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(expenses));
      }, SAVE_DELAY);
    }
    return () => {
      if (saveTimer.current) {
        clearTimeout(saveTimer.current);
        AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(latestExpenses.current));
      }
    };
  }, [expenses, loaded]);

  // ── 按月索引：避免每次查询都遍历全部数据 ────────────────
  const monthIndex = useMemo(() => {
    const map = new Map<string, { dateKeys: string[]; items: ExpenseItem[] }>();
    for (const [dateKey, list] of Object.entries(expenses)) {
      const monthKey = dateKey.slice(0, 7); // "YYYY-MM"
      let bucket = map.get(monthKey);
      if (!bucket) {
        bucket = { dateKeys: [], items: [] };
        map.set(monthKey, bucket);
      }
      bucket.dateKeys.push(dateKey);
      bucket.items.push(...list);
    }
    return map;
  }, [expenses]);

  // ── 按 tripId 索引 ──────────────────────────────────────
  const tripIndex = useMemo(() => {
    const map = new Map<string, ExpenseItem[]>();
    for (const list of Object.values(expenses)) {
      for (const item of list) {
        if (!item.tripId) continue;
        let bucket = map.get(item.tripId);
        if (!bucket) {
          bucket = [];
          map.set(item.tripId, bucket);
        }
        bucket.push(item);
      }
    }
    for (const bucket of map.values()) {
      bucket.sort((a, b) => a.dateKey.localeCompare(b.dateKey));
    }
    return map;
  }, [expenses]);

  const getByDate = useCallback((dateKey: string) => expenses[dateKey] ?? [], [expenses]);

  const add = useCallback(
    (dateKey: string, item: Omit<ExpenseItem, 'id' | 'createdAt' | 'dateKey'>) => {
      const newItem: ExpenseItem = {
        ...item,
        id: uid(),
        createdAt: Date.now(),
        dateKey,
      };
      setExpenses((prev) => ({
        ...prev,
        [dateKey]: [...(prev[dateKey] ?? []), newItem],
      }));
    },
    []
  );

  const update = useCallback((dateKey: string, id: string, updates: Partial<ExpenseItem>) => {
    setExpenses((prev) => {
      const list = prev[dateKey];
      if (!list) return prev;
      const idx = list.findIndex((r) => r.id === id);
      if (idx === -1) return prev;
      const newList = [...list];
      newList[idx] = { ...newList[idx], ...updates };
      return { ...prev, [dateKey]: newList };
    });
  }, []);

  const remove = useCallback((dateKey: string, id: string) => {
    setExpenses((prev) => {
      const list = (prev[dateKey] ?? []).filter((r) => r.id !== id);
      if (list.length === 0) {
        const { [dateKey]: _, ...rest } = prev;
        return rest;
      }
      return { ...prev, [dateKey]: list };
    });
  }, []);

  const hasRecords = useCallback(
    (dateKey: string) => (expenses[dateKey]?.length ?? 0) > 0,
    [expenses]
  );

  const getDailyTotal = useCallback(
    (dateKey: string, rates: Record<Currency, number>) => {
      const list = expenses[dateKey] ?? [];
      return list.reduce((sum, e) => sum + convertToCNY(e.amount, e.currency, rates), 0);
    },
    [expenses]
  );

  const getByTrip = useCallback(
    (tripId: string) => tripIndex.get(tripId) ?? [],
    [tripIndex]
  );

  const getByDateRange = useCallback(
    (startDate: string, endDate: string) => {
      const startMonth = startDate.slice(0, 7);
      const endMonth = endDate.slice(0, 7);
      const result: ExpenseItem[] = [];
      for (const [monthKey, bucket] of monthIndex) {
        if (monthKey < startMonth || monthKey > endMonth) continue;
        for (const dateKey of bucket.dateKeys) {
          if (dateKey >= startDate && dateKey <= endDate) {
            result.push(...(expenses[dateKey] ?? []));
          }
        }
      }
      return result.sort((a, b) => a.dateKey.localeCompare(b.dateKey));
    },
    [monthIndex, expenses]
  );

  const getMonthlyTotal = useCallback(
    (year: number, month: number, rates: Record<Currency, number>) => {
      const monthKey = `${year}-${String(month + 1).padStart(2, '0')}`;
      const bucket = monthIndex.get(monthKey);
      if (!bucket) return { total: 0, count: 0 };
      let total = 0;
      for (const e of bucket.items) {
        total += convertToCNY(e.amount, e.currency, rates);
      }
      return { total, count: bucket.items.length };
    },
    [monthIndex]
  );

  const getMonthExpenses = useCallback(
    (year: number, month: number) => {
      const monthKey = `${year}-${String(month + 1).padStart(2, '0')}`;
      const bucket = monthIndex.get(monthKey);
      return bucket?.items ?? [];
    },
    [monthIndex]
  );

  const removeByTrip = useCallback((tripId: string) => {
    setExpenses((prev) => {
      const next: ExpensesMap = {};
      for (const [dateKey, list] of Object.entries(prev)) {
        const filtered = list.filter((e) => e.tripId !== tripId);
        if (filtered.length > 0) next[dateKey] = filtered;
      }
      return next;
    });
  }, []);

  const importAll = useCallback((data: ExpensesMap) => {
    setExpenses(data);
  }, []);

  const search = useCallback(
    (query: string, category: ExpenseCategory | null) => {
      const trimmed = query.trim().toLowerCase();
      const results: { dateKey: string; item: ExpenseItem }[] = [];
      for (const [dateKey, list] of Object.entries(expenses)) {
        for (const item of list) {
          if (category && item.category !== category) continue;
          if (trimmed && !item.notes.toLowerCase().includes(trimmed)) continue;
          results.push({ dateKey, item });
        }
      }
      return results.sort((a, b) => b.dateKey.localeCompare(a.dateKey) || b.item.createdAt - a.item.createdAt);
    },
    [expenses]
  );

  return {
    getByDate,
    add,
    update,
    remove,
    removeByTrip,
    hasRecords,
    getDailyTotal,
    getByTrip,
    getByDateRange,
    getMonthlyTotal,
    getMonthExpenses,
    importAll,
    search,
    loaded,
  };
}
