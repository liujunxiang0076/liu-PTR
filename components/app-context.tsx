import { createContext, useCallback, useContext, useMemo } from 'react';

import { type Currency, type DailyBudget, type ExpenseItem, type Trip } from '@/types/expense';
import { useExpenses } from '@/hooks/use-expenses';
import { useTrips } from '@/hooks/use-trips';
import { useExchangeRates } from '@/hooks/use-exchange-rates';
import { useBudget } from '@/hooks/use-budget';

// 费用 Context
type ExpenseContextType = {
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
  loaded: boolean;
};

// 行程 Context
type TripContextType = {
  trips: Trip[];
  addTrip: (trip: Omit<Trip, 'id' | 'createdAt'>) => string;
  updateTrip: (id: string, updates: Partial<Trip>) => void;
  removeTrip: (id: string) => void;
  getTripById: (id: string) => Trip | null;
  getActiveTrip: (dateKey: string) => Trip | null;
  getTripsInMonth: (year: number, month: number) => Trip[];
  loaded: boolean;
};

// 汇率 Context
type ExchangeRateContextType = {
  convert: (amount: number, from: Currency) => number;
  rates: Record<Currency, number>;
};

// 组合 Context（保持向后兼容）
type AppContextType = ExpenseContextType & TripContextType & ExchangeRateContextType & {
  budget: DailyBudget;
  updateBudget: (updates: Partial<DailyBudget>) => void;
  getDayBudget: (year: number, month: number, day: number) => { type: 'workday' | 'weekend' | 'holiday'; amount: number };
};

const ExpenseContext = createContext<ExpenseContextType | null>(null);
const TripContext = createContext<TripContextType | null>(null);
const ExchangeRateContext = createContext<ExchangeRateContextType | null>(null);
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
  }, [trips.remove, expenses.removeByTrip]);

  const tripValue: TripContextType = useMemo(() => ({
    trips: trips.getAll(),
    addTrip: trips.add,
    updateTrip: trips.update,
    removeTrip,
    getTripById: trips.getById,
    getActiveTrip: trips.getActiveTrip,
    getTripsInMonth: trips.getTripsInMonth,
    loaded: trips.loaded,
  }), [trips, removeTrip]);

  const expenseValue: ExpenseContextType = useMemo(() => ({
    getByDate: expenses.getByDate,
    addExpense: expenses.add,
    updateExpense: expenses.update,
    removeExpense: expenses.remove,
    hasRecords: expenses.hasRecords,
    getDailyTotal: (dateKey: string) => expenses.getDailyTotal(dateKey, rates),
    getByTrip: expenses.getByTrip,
    getByDateRange: expenses.getByDateRange,
    getMonthlyTotal: (year: number, month: number) =>
      expenses.getMonthlyTotal(year, month, rates),
    getMonthExpenses: expenses.getMonthExpenses,
    loaded: expenses.loaded,
  }), [expenses, rates]);

  const exchangeRateValue: ExchangeRateContextType = useMemo(() => ({
    convert: exchangeRates.convert,
    rates,
  }), [exchangeRates.convert, rates]);

  const value: AppContextType = useMemo(() => ({
    ...expenseValue,
    ...tripValue,
    ...exchangeRateValue,
    budget: budget.budget,
    updateBudget: budget.update,
    getDayBudget: budget.getDayBudget,
    loaded: expenses.loaded && trips.loaded && budget.loaded,
  }), [expenseValue, tripValue, exchangeRateValue, budget, expenses.loaded, trips.loaded]);

  return (
    <ExpenseContext.Provider value={expenseValue}>
      <TripContext.Provider value={tripValue}>
        <ExchangeRateContext.Provider value={exchangeRateValue}>
          <AppContext.Provider value={value}>{children}</AppContext.Provider>
        </ExchangeRateContext.Provider>
      </TripContext.Provider>
    </ExpenseContext.Provider>
  );
}

export function useExpenseContext() {
  const ctx = useContext(ExpenseContext);
  if (!ctx) throw new Error('useExpenseContext must be used within AppProvider');
  return ctx;
}

export function useTripContext() {
  const ctx = useContext(TripContext);
  if (!ctx) throw new Error('useTripContext must be used within AppProvider');
  return ctx;
}

export function useExchangeRateContext() {
  const ctx = useContext(ExchangeRateContext);
  if (!ctx) throw new Error('useExchangeRateContext must be used within AppProvider');
  return ctx;
}

export function useAppContext() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useAppContext must be used within AppProvider');
  return ctx;
}
