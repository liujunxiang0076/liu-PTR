import { useState, useCallback } from 'react';
import { Platform } from 'react-native';
import * as Location from 'expo-location';
import { type LocationInfo } from '@/types/expense';

type UseLocationReturn = {
  location: LocationInfo | null;
  loading: boolean;
  error: string | null;
  requestLocation: () => Promise<LocationInfo | null>;
  clearLocation: () => void;
};

export function useLocation(): UseLocationReturn {
  const [location, setLocation] = useState<LocationInfo | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const requestLocation = useCallback(async (): Promise<LocationInfo | null> => {
    setLoading(true);
    setError(null);

    try {
      // 检查定位服务是否开启
      const enabled = await Location.hasServicesEnabledAsync();
      if (!enabled) {
        setError('定位服务未开启，请在系统设置中开启');
        return null;
      }

      // 请求权限
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setError('需要定位权限才能获取位置信息');
        return null;
      }

      // 获取当前位置（带超时）
      const currentLocation = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
        timeInterval: 1000,
        mayShowUserSettingsDialog: true,
      });

      // 尝试获取地址
      let address: string | undefined;
      try {
        const [geocode] = await Location.reverseGeocodeAsync({
          latitude: currentLocation.coords.latitude,
          longitude: currentLocation.coords.longitude,
        });

        if (geocode) {
          const parts = [
            geocode.city,
            geocode.district,
            geocode.street,
            geocode.streetNumber,
          ].filter(Boolean);
          address = parts.join('');
        }
      } catch {
        // 地址解析失败不影响定位
      }

      const locationInfo: LocationInfo = {
        latitude: currentLocation.coords.latitude,
        longitude: currentLocation.coords.longitude,
        address,
        timestamp: currentLocation.timestamp,
      };

      setLocation(locationInfo);
      return locationInfo;
    } catch (err) {
      setError('获取位置失败，请确认GPS已开启后重试');
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const clearLocation = useCallback(() => {
    setLocation(null);
    setError(null);
  }, []);

  return {
    location,
    loading,
    error,
    requestLocation,
    clearLocation,
  };
}
