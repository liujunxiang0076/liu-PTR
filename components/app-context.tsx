import { createContext, useCallback, useContext, useMemo } from 'react';

import { type Currency, type DailyBudget, type ExpenseCategory, type ExpenseItem, type ExpensesMap, type Trip } from '@/types/expense';
import { useExpenses } from '@/hooks/use-expenses';
import { useTrips } from '@/hooks/use-trips';
import { useExchangeRates } from '@/hooks/use-exchange-rates';
import { useBudget } from '@/hooks/use-budget';

type AppContextType = {
  // 费用
  getByDate: (dateKey: string) => ExpenseItem[];
  addExpense: (dateKey: string, item: Omit<ExpenseItem, 'id' | 'createdAt' | 'dateKey'>) => void;
  updateExpense: (dateKey: string, id: string, updates: Partial<ExpenseItem>) => void;
  removeExpense: (dateKey: string, id: string) => void;
  hasRecords: (dateKey: string) => boolean;
  getDailyTotal: (dateKey: string) => number;
  getByTrip: (tripId: string) => ExpenseItem[];
  getByDateRange: (startDate: string, endDate: string) => ExpenseItem[];
  getMonthlyTotal: (year: number, month: number) => { total: number; count: number };
  getMonthExpenses: (year: number, month: number) => ExpenseItem[];
  searchExpenses: (query: string, category: ExpenseCategory | null) => { dateKey: string; item: ExpenseItem }[];
  // 行程
  trips: Trip[];
  addTrip: (trip: Omit<Trip, 'id' | 'createdAt'>) => string;
  updateTrip: (id: string, updates: Partial<Trip>) => void;
  removeTrip: (id: string) => void;
  getTripById: (id: string) => Trip | null;
  getActiveTrip: (dateKey: string) => Trip | null;
  getTripsInMonth: (year: number, month: number) => Trip[];
  // 汇率
  convert: (amount: number, from: Currency) => number;
  rates: Record<Currency, number>;
  // 预算
  budget: DailyBudget;
  updateBudget: (updates: Partial<DailyBudget>) => void;
  getDayBudget: (year: number, month: number, day: number) => { type: 'workday' | 'weekend' | 'holiday'; amount: number };
  // 数据管理
  importAllData: (data: { expenses: ExpensesMap; trips: Record<string, Trip>; budget: DailyBudget }) => void;
  loaded: boolean;
};

const AppContext = createContext<AppContextType | null>(null);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const expenses = useExpenses();
  const trips = useTrips();
  const exchangeRates = useExchangeRates();
  const budget = useBudget();

  const rates = exchangeRates.rates.rates;

  const removeTrip = useCallback((id: string) => {
    trips.remove(id);
    expenses.removeByTrip(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps -- trips 和 expenses 的函数引用已由各自 hook 稳定化
  }, [trips.remove, expenses.removeByTrip]);

  const importAllData = useCallback((data: { expenses: ExpensesMap; trips: Record<string, Trip>; budget: DailyBudget }) => {
    expenses.importAll(data.expenses);
    trips.importAll(data.trips);
    budget.importAll(data.budget);
    // eslint-disable-next-line react-hooks/exhaustive-deps -- 同上
  }, [expenses.importAll, trips.importAll, budget.importAll]);

  const value: AppContextType = useMemo(() => ({
    getByDate: expenses.getByDate,
    addExpense: expenses.add,
    updateExpense: expenses.update,
    removeExpense: expenses.remove,
    hasRecords: expenses.hasRecords,
    getDailyTotal: (dateKey: string) => expenses.getDailyTotal(dateKey, rates),
    getByTrip: expenses.getByTrip,
    getByDateRange: expenses.getByDateRange,
    getMonthlyTotal: (year: number, month: number) => expenses.getMonthlyTotal(year, month, rates),
    getMonthExpenses: expenses.getMonthExpenses,
    searchExpenses: expenses.search,
    trips: trips.getAll(),
    addTrip: trips.add,
    updateTrip: trips.update,
    removeTrip,
    getTripById: trips.getById,
    getActiveTrip: trips.getActiveTrip,
    getTripsInMonth: trips.getTripsInMonth,
    convert: exchangeRates.convert,
    rates,
    budget: budget.budget,
    updateBudget: budget.update,
    getDayBudget: budget.getDayBudget,
    importAllData,
    loaded: expenses.loaded && trips.loaded && budget.loaded,
  }), [expenses, trips, exchangeRates, budget, rates, removeTrip, importAllData]);

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useAppContext() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useAppContext must be used within AppProvider');
  return ctx;
}
