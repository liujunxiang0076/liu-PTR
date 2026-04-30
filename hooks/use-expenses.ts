import { useCallback, useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

import { type Currency, type ExpenseItem, type ExpensesMap } from '@/types/expense';
import { convertToCNY, uid } from '@/constants/currency';

const STORAGE_KEY = '@expenses:v1';

export function useExpenses() {
  const [expenses, setExpenses] = useState<ExpensesMap>({});
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY).then((raw) => {
      if (raw) {
        try {
          setExpenses(JSON.parse(raw));
        } catch {}
      }
      setLoaded(true);
    });
  }, []);

  useEffect(() => {
    if (loaded) {
      AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(expenses));
    }
  }, [expenses, loaded]);

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
    (tripId: string) => {
      const result: ExpenseItem[] = [];
      for (const list of Object.values(expenses)) {
        for (const item of list) {
          if (item.tripId === tripId) result.push(item);
        }
      }
      return result.sort((a, b) => a.dateKey.localeCompare(b.dateKey));
    },
    [expenses]
  );

  const getByDateRange = useCallback(
    (startDate: string, endDate: string) => {
      const result: ExpenseItem[] = [];
      for (const [dateKey, list] of Object.entries(expenses)) {
        if (dateKey >= startDate && dateKey <= endDate) {
          result.push(...list);
        }
      }
      return result.sort((a, b) => a.dateKey.localeCompare(b.dateKey));
    },
    [expenses]
  );

  const getMonthlyTotal = useCallback(
    (year: number, month: number, rates: Record<Currency, number>) => {
      const prefix = `${year}-${String(month + 1).padStart(2, '0')}`;
      let total = 0;
      let count = 0;
      for (const [dateKey, list] of Object.entries(expenses)) {
        if (dateKey.startsWith(prefix)) {
          for (const e of list) {
            total += convertToCNY(e.amount, e.currency, rates);
            count++;
          }
        }
      }
      return { total, count };
    },
    [expenses]
  );

  const getMonthExpenses = useCallback(
    (year: number, month: number) => {
      const prefix = `${year}-${String(month + 1).padStart(2, '0')}`;
      const result: ExpenseItem[] = [];
      for (const [dateKey, list] of Object.entries(expenses)) {
        if (dateKey.startsWith(prefix)) {
          result.push(...list);
        }
      }
      return result;
    },
    [expenses]
  );

  return {
    getByDate,
    add,
    update,
    remove,
    hasRecords,
    getDailyTotal,
    getByTrip,
    getByDateRange,
    getMonthlyTotal,
    getMonthExpenses,
    loaded,
  };
}
