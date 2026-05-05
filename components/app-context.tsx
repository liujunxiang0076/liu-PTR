import { createContext, useCallback, useContext, useMemo } from 'react';

import { type Currency, type DailyBudget, type ExpenseCategory, type ExpenseItem, type ExpensesMap, type Trip } from '@/types/expense';
import { useExpenses } from '@/hooks/use-expenses';
import { useTrips } from '@/hooks/use-trips';
import { useExchangeRates } from '@/hooks/use-exchange-rates';
import { useBudget } from '@/hooks/use-budget';

// ── 费用 Context ──────────────────────────────────────────────
type ExpensesContextType = {
  getByDate: (dateKey: string) => ExpenseItem[];
  addExpense: (dateKey: string, item: Omit<ExpenseItem, 'id' | 'createdAt' | 'dateKey'>) => void;
  updateExpense: (dateKey: string, id: string, updates: Partial<ExpenseItem>) => void;
  removeExpense: (dateKey: string, id: string) => void;
  removeByTrip: (tripId: string) => void;
  hasRecords: (dateKey: string) => boolean;
  getDailyTotal: (dateKey: string, rates: Record<Currency, number>) => number;
  getByTrip: (tripId: string) => ExpenseItem[];
  getByDateRange: (startDate: string, endDate: string) => ExpenseItem[];
  getMonthlyTotal: (year: number, month: number, rates: Record<Currency, number>) => { total: number; count: number };
  getMonthExpenses: (year: number, month: number) => ExpenseItem[];
  searchExpenses: (query: string, category: ExpenseCategory | null) => { dateKey: string; item: ExpenseItem }[];
  importAll: (data: ExpensesMap) => void;
  loaded: boolean;
};

const ExpensesContext = createContext<ExpensesContextType | null>(null);

function ExpensesProvider({ children }: { children: React.ReactNode }) {
  const hook = useExpenses();
  const value: ExpensesContextType = useMemo(() => ({
    getByDate: hook.getByDate,
    addExpense: hook.add,
    updateExpense: hook.update,
    removeExpense: hook.remove,
    removeByTrip: hook.removeByTrip,
    hasRecords: hook.hasRecords,
    getDailyTotal: hook.getDailyTotal,
    getByTrip: hook.getByTrip,
    getByDateRange: hook.getByDateRange,
    getMonthlyTotal: hook.getMonthlyTotal,
    getMonthExpenses: hook.getMonthExpenses,
    searchExpenses: hook.search,
    importAll: hook.importAll,
    loaded: hook.loaded,
  }), [hook]);
  return <ExpensesContext.Provider value={value}>{children}</ExpensesContext.Provider>;
}

export function useExpensesContext() {
  const ctx = useContext(ExpensesContext);
  if (!ctx) throw new Error('useExpensesContext must be used within AppProvider');
  return ctx;
}

// ── 行程 + 汇率 Context ──────────────────────────────────────
type TripsContextType = {
  trips: Trip[];
  addTrip: (trip: Omit<Trip, 'id' | 'createdAt'>) => string;
  updateTrip: (id: string, updates: Partial<Trip>) => void;
  removeTrip: (id: string) => void;
  getTripById: (id: string) => Trip | null;
  getActiveTrip: (dateKey: string) => Trip | null;
  getTripsInMonth: (year: number, month: number) => Trip[];
  importAll: (data: Record<string, Trip>) => void;
  loaded: boolean;
  convert: (amount: number, from: Currency) => number;
  rates: Record<Currency, number>;
};

const TripsContext = createContext<TripsContextType | null>(null);

function TripsProvider({ children }: { children: React.ReactNode }) {
  const tripsHook = useTrips();
  const exchangeRates = useExchangeRates();
  const rates = exchangeRates.rates.rates;

  const value = useMemo(() => ({
    trips: tripsHook.getAll(),
    addTrip: tripsHook.add,
    updateTrip: tripsHook.update,
    removeTrip: tripsHook.remove,
    getTripById: tripsHook.getById,
    getActiveTrip: tripsHook.getActiveTrip,
    getTripsInMonth: tripsHook.getTripsInMonth,
    importAll: tripsHook.importAll,
    loaded: tripsHook.loaded,
    convert: exchangeRates.convert,
    rates,
  }), [tripsHook, exchangeRates, rates]);

  return <TripsContext.Provider value={value}>{children}</TripsContext.Provider>;
}

export function useTripsContext() {
  const ctx = useContext(TripsContext);
  if (!ctx) throw new Error('useTripsContext must be used within AppProvider');
  return ctx;
}

// ── 预算 Context ──────────────────────────────────────────────
type BudgetContextType = {
  budget: DailyBudget;
  updateBudget: (updates: Partial<DailyBudget>) => void;
  getDayBudget: (year: number, month: number, day: number) => { type: 'workday' | 'weekend' | 'holiday'; amount: number };
  importAll: (data: DailyBudget) => void;
  loaded: boolean;
};

const BudgetContext = createContext<BudgetContextType | null>(null);

function BudgetProvider({ children }: { children: React.ReactNode }) {
  const hook = useBudget();
  const value: BudgetContextType = useMemo(() => ({
    budget: hook.budget,
    updateBudget: hook.update,
    getDayBudget: hook.getDayBudget,
    importAll: hook.importAll,
    loaded: hook.loaded,
  }), [hook]);
  return <BudgetContext.Provider value={value}>{children}</BudgetContext.Provider>;
}

export function useBudgetContext() {
  const ctx = useContext(BudgetContext);
  if (!ctx) throw new Error('useBudgetContext must be used within AppProvider');
  return ctx;
}

// ── 组合 Provider（兼容旧 API） ──────────────────────────────
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

function AppBridge({ children }: { children: React.ReactNode }) {
  const expenses = useExpensesContext();
  const tripsCtx = useTripsContext();
  const budgetCtx = useBudgetContext();

  const removeTrip = useCallback((id: string) => {
    tripsCtx.removeTrip(id);
    expenses.removeByTrip(id);
  }, [tripsCtx.removeTrip, expenses.removeByTrip]);

  const importAllData = useCallback((data: { expenses: ExpensesMap; trips: Record<string, Trip>; budget: DailyBudget }) => {
    expenses.importAll(data.expenses);
    tripsCtx.importAll(data.trips);
    budgetCtx.importAll(data.budget);
  }, [expenses.importAll, tripsCtx.importAll, budgetCtx.importAll]);

  const value: AppContextType = useMemo(() => ({
    getByDate: expenses.getByDate,
    addExpense: expenses.addExpense,
    updateExpense: expenses.updateExpense,
    removeExpense: expenses.removeExpense,
    hasRecords: expenses.hasRecords,
    getDailyTotal: (dateKey: string) => expenses.getDailyTotal(dateKey, tripsCtx.rates),
    getByTrip: expenses.getByTrip,
    getByDateRange: expenses.getByDateRange,
    getMonthlyTotal: (year: number, month: number) => expenses.getMonthlyTotal(year, month, tripsCtx.rates),
    getMonthExpenses: expenses.getMonthExpenses,
    searchExpenses: expenses.searchExpenses,
    trips: tripsCtx.trips,
    addTrip: tripsCtx.addTrip,
    updateTrip: tripsCtx.updateTrip,
    removeTrip,
    getTripById: tripsCtx.getTripById,
    getActiveTrip: tripsCtx.getActiveTrip,
    getTripsInMonth: tripsCtx.getTripsInMonth,
    convert: tripsCtx.convert,
    rates: tripsCtx.rates,
    budget: budgetCtx.budget,
    updateBudget: budgetCtx.updateBudget,
    getDayBudget: budgetCtx.getDayBudget,
    importAllData,
    loaded: expenses.loaded && tripsCtx.loaded && budgetCtx.loaded,
  }), [expenses, tripsCtx, budgetCtx, removeTrip, importAllData]);

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function AppProvider({ children }: { children: React.ReactNode }) {
  return (
    <ExpensesProvider>
      <TripsProvider>
        <BudgetProvider>
          <AppBridge>{children}</AppBridge>
        </BudgetProvider>
      </TripsProvider>
    </ExpensesProvider>
  );
}

export function useAppContext() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useAppContext must be used within AppProvider');
  return ctx;
}
