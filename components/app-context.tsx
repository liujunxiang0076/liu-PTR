import { createContext, useContext } from 'react';

import { type Currency, type ExpenseItem, type Trip } from '@/types/expense';
import { useExpenses } from '@/hooks/use-expenses';
import { useTrips } from '@/hooks/use-trips';
import { useExchangeRates } from '@/hooks/use-exchange-rates';

type AppContextType = {
  // 费用操作
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

  // 行程操作
  trips: Trip[];
  addTrip: (trip: Omit<Trip, 'id' | 'createdAt'>) => string;
  updateTrip: (id: string, updates: Partial<Trip>) => void;
  removeTrip: (id: string) => void;
  getTripById: (id: string) => Trip | null;
  getActiveTrip: (dateKey: string) => Trip | null;
  getTripsInMonth: (year: number, month: number) => Trip[];

  // 币种
  convert: (amount: number, from: Currency) => number;
  rates: Record<Currency, number>;

  loaded: boolean;
};

const AppContext = createContext<AppContextType | null>(null);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const expenses = useExpenses();
  const trips = useTrips();
  const exchangeRates = useExchangeRates();

  const value: AppContextType = {
    getByDate: expenses.getByDate,
    addExpense: expenses.add,
    updateExpense: expenses.update,
    removeExpense: expenses.remove,
    hasRecords: expenses.hasRecords,
    getDailyTotal: (dateKey: string) => expenses.getDailyTotal(dateKey, exchangeRates.rates.rates),
    getByTrip: expenses.getByTrip,
    getByDateRange: expenses.getByDateRange,
    getMonthlyTotal: (year: number, month: number) =>
      expenses.getMonthlyTotal(year, month, exchangeRates.rates.rates),
    getMonthExpenses: expenses.getMonthExpenses,

    trips: trips.getAll(),
    addTrip: trips.add,
    updateTrip: trips.update,
    removeTrip: trips.remove,
    getTripById: trips.getById,
    getActiveTrip: trips.getActiveTrip,
    getTripsInMonth: trips.getTripsInMonth,

    convert: exchangeRates.convert,
    rates: exchangeRates.rates.rates,

    loaded: expenses.loaded && trips.loaded,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useAppContext() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useAppContext must be used within AppProvider');
  return ctx;
}
