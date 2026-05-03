import { useCallback, useEffect, useRef, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

import { type Trip } from '@/types/expense';
import { uid } from '@/constants/currency';

const STORAGE_KEY = '@trips:v1';
const SAVE_DELAY = 300;

export function useTrips() {
  const [trips, setTrips] = useState<Record<string, Trip>>({});
  const [loaded, setLoaded] = useState(false);
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const latestTrips = useRef(trips);
  latestTrips.current = trips;

  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY).then((raw) => {
      if (raw) {
        try {
          setTrips(JSON.parse(raw));
        } catch (e) {
          console.warn('[useTrips] JSON 解析失败，数据可能已损坏:', e);
        }
      }
      setLoaded(true);
    });
  }, []);

  useEffect(() => {
    if (loaded) {
      if (saveTimer.current) clearTimeout(saveTimer.current);
      saveTimer.current = setTimeout(() => {
        AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(trips));
      }, SAVE_DELAY);
    }
    return () => {
      if (saveTimer.current) {
        clearTimeout(saveTimer.current);
        AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(latestTrips.current));
      }
    };
  }, [trips, loaded]);

  const add = useCallback((trip: Omit<Trip, 'id' | 'createdAt'>) => {
    const newTrip: Trip = { ...trip, id: uid(), createdAt: Date.now() };
    setTrips((prev) => ({ ...prev, [newTrip.id]: newTrip }));
    return newTrip.id;
  }, []);

  const update = useCallback((id: string, updates: Partial<Trip>) => {
    setTrips((prev) => {
      if (!prev[id]) return prev;
      return { ...prev, [id]: { ...prev[id], ...updates } };
    });
  }, []);

  const remove = useCallback((id: string) => {
    setTrips((prev) => {
      const { [id]: _, ...rest } = prev;
      return rest;
    });
  }, []);

  const getById = useCallback((id: string) => trips[id] ?? null, [trips]);

  const getAll = useCallback(
    () => Object.values(trips).sort((a, b) => b.createdAt - a.createdAt),
    [trips]
  );

  const getActiveTrip = useCallback(
    (dateKey: string) =>
      Object.values(trips).find((t) => dateKey >= t.startDate && dateKey <= t.endDate) ?? null,
    [trips]
  );

  const getTripsInMonth = useCallback(
    (year: number, month: number) => {
      const mm = String(month + 1).padStart(2, '0');
      const daysInMonth = new Date(year, month + 1, 0).getDate();
      const monthStart = `${year}-${mm}-01`;
      const monthEnd = `${year}-${mm}-${daysInMonth}`;
      return Object.values(trips).filter(
        (t) => t.startDate <= monthEnd && t.endDate >= monthStart
      );
    },
    [trips]
  );

  const importAll = useCallback((data: Record<string, Trip>) => {
    setTrips(data);
  }, []);

  return { add, update, remove, getById, getAll, getActiveTrip, getTripsInMonth, importAll, loaded };
}
