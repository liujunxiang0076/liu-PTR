import { useState, useCallback } from 'react';
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
      // 请求权限
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setError('需要定位权限才能获取位置信息');
        setLoading(false);
        return null;
      }

      // 获取当前位置
      const currentLocation = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
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
      setLoading(false);
      return locationInfo;
    } catch (err) {
      setError('获取位置失败，请重试');
      setLoading(false);
      return null;
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
