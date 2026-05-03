import { useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { setApiHolidayData } from '@/constants/holidays';

const API_BASE = 'https://raw.githubusercontent.com/NateScarlet/holiday-cn/master';

interface HolidayDay {
  date: string;
  isOffDay: boolean;
}

interface HolidayApiResponse {
  year: number;
  days: HolidayDay[];
}

interface CachedHolidayData {
  year: number;
  days: HolidayDay[];
  fetchedAt: string;
}

function cacheKey(year: number) {
  return `@holiday:${year}`;
}

function today(): string {
  return new Date().toISOString().slice(0, 10);
}

async function loadCache(year: number): Promise<CachedHolidayData | null> {
  const raw = await AsyncStorage.getItem(cacheKey(year));
  if (!raw) return null;
  try {
    return JSON.parse(raw) as CachedHolidayData;
  } catch {
    return null;
  }
}

async function saveCache(year: number, days: HolidayDay[]): Promise<void> {
  const data: CachedHolidayData = { year, days, fetchedAt: today() };
  await AsyncStorage.setItem(cacheKey(year), JSON.stringify(data));
}

async function fetchYear(year: number): Promise<HolidayDay[] | null> {
  try {
    const res = await fetch(`${API_BASE}/${year}.json`);
    if (!res.ok) return null;
    const json = (await res.json()) as HolidayApiResponse;
    if (!json?.days?.length) return null;
    return json.days;
  } catch {
    return null;
  }
}

/**
 * 节假日数据自动同步 Hook
 * 启动时从缓存加载，后台尝试拉取最新数据。
 * 静默降级：网络失败不影响已有硬编码数据。
 */
export function useHolidaySync() {
  const currentYear = new Date().getFullYear();

  useEffect(() => {
    let cancelled = false;

    async function sync() {
      // 1. 先从缓存加载
      const cached = await loadCache(currentYear);
      if (cached && !cancelled) {
        setApiHolidayData(cached.year, cached.days);
      }

      // 2. 同一天内不重复请求
      if (cached?.fetchedAt === today()) return;

      // 3. 尝试拉取最新数据
      const days = await fetchYear(currentYear);
      if (!days || cancelled) return;

      setApiHolidayData(currentYear, days);
      await saveCache(currentYear, days);
    }

    sync();
    return () => { cancelled = true; };
  }, [currentYear]);
}
