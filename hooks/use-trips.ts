import { useCallback, useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

import { type Trip } from '@/types/expense';
import { uid } from '@/constants/currency';

const STORAGE_KEY = '@trips:v1';

export function useTrips() {
  const [trips, setTrips] = useState<Record<string, Trip>>({});
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY).then((raw) => {
      if (raw) {
        try {
          setTrips(JSON.parse(raw));
        } catch {}
      }
      setLoaded(true);
    });
  }, []);

  useEffect(() => {
    if (loaded) {
      AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(trips));
    }
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
      const prefix = `${year}-${String(month + 1).padStart(2, '0')}`;
      return Object.values(trips).filter(
        (t) => t.startDate.slice(0, 7) === prefix || t.endDate.slice(0, 7) === prefix
      );
    },
    [trips]
  );

  return { add, update, remove, getById, getAll, getActiveTrip, getTripsInMonth, loaded };
}
