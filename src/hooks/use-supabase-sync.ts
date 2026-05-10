import { useEffect, useState, useCallback } from 'react';
import { supabase, TABLES } from '../lib/supabase';
import AsyncStorage from '@react-native-async-storage/async-storage';

// 同步状态
interface SyncState {
  isSyncing: boolean;
  lastSyncTime: Date | null;
  error: string | null;
}

// 本地数据类型
interface LocalData {
  trips: any[];
  expenses: any[];
}

export function useSupabaseSync() {
  const [syncState, setSyncState] = useState<SyncState>({
    isSyncing: false,
    lastSyncTime: null,
    error: null,
  });

  // 从云端拉取数据
  const pullFromCloud = useCallback(async () => {
    setSyncState(prev => ({ ...prev, isSyncing: true, error: null }));

    try {
      // 拉取行程
      const { data: trips, error: tripsError } = await supabase
        .from(TABLES.TRIPS)
        .select('*')
        .order('created_at', { ascending: false });

      if (tripsError) throw tripsError;

      // 拉取费用
      const { data: expenses, error: expensesError } = await supabase
        .from(TABLES.EXPENSES)
        .select('*')
        .order('date', { ascending: false });

      if (expensesError) throw expensesError;

      // 保存到本地
      const localData: LocalData = {
        trips: trips || [],
        expenses: expenses || [],
      };

      await AsyncStorage.setItem('liu-ptr-data', JSON.stringify(localData));

      setSyncState({
        isSyncing: false,
        lastSyncTime: new Date(),
        error: null,
      });

      return localData;
    } catch (error: any) {
      setSyncState({
        isSyncing: false,
        lastSyncTime: null,
        error: error.message,
      });
      return null;
    }
  }, []);

  // 推送本地数据到云端
  const pushToCloud = useCallback(async (localData: LocalData) => {
    setSyncState(prev => ({ ...prev, isSyncing: true, error: null }));

    try {
      // 推送行程
      if (localData.trips.length > 0) {
        const { error: tripsError } = await supabase
          .from(TABLES.TRIPS)
          .upsert(localData.trips, { onConflict: 'id' });

        if (tripsError) throw tripsError;
      }

      // 推送费用
      if (localData.expenses.length > 0) {
        const { error: expensesError } = await supabase
          .from(TABLES.EXPENSES)
          .upsert(localData.expenses, { onConflict: 'id' });

        if (expensesError) throw expensesError;
      }

      setSyncState({
        isSyncing: false,
        lastSyncTime: new Date(),
        error: null,
      });

      return true;
    } catch (error: any) {
      setSyncState({
        isSyncing: false,
        lastSyncTime: null,
        error: error.message,
      });
      return false;
    }
  }, []);

  // 同步：先拉取云端，合并本地，再推送
  const sync = useCallback(async () => {
    setSyncState(prev => ({ ...prev, isSyncing: true, error: null }));

    try {
      // 1. 拉取云端数据
      const cloudData = await pullFromCloud();
      if (!cloudData) return false;

      // 2. 获取本地数据
      const localStr = await AsyncStorage.getItem('liu-ptr-data');
      const localData: LocalData = localStr ? JSON.parse(localStr) : { trips: [], expenses: [] };

      // 3. 合并（简单策略：云端优先，本地有新的则添加）
      const mergedData: LocalData = {
        trips: [...cloudData.trips, ...localData.trips.filter(
          (local: any) => !cloudData.trips.some((cloud: any) => cloud.id === local.id)
        )],
        expenses: [...cloudData.expenses, ...localData.expenses.filter(
          (local: any) => !cloudData.expenses.some((cloud: any) => cloud.id === local.id)
        )],
      };

      // 4. 保存合并后的数据到本地
      await AsyncStorage.setItem('liu-ptr-data', JSON.stringify(mergedData));

      // 5. 推送合并后的数据到云端
      await pushToCloud(mergedData);

      setSyncState({
        isSyncing: false,
        lastSyncTime: new Date(),
        error: null,
      });

      return true;
    } catch (error: any) {
      setSyncState({
        isSyncing: false,
        lastSyncTime: null,
        error: error.message,
      });
      return false;
    }
  }, [pullFromCloud, pushToCloud]);

  return {
    ...syncState,
    pullFromCloud,
    pushToCloud,
    sync,
  };
}
