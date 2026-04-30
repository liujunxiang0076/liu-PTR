import { Tabs } from 'expo-router';
import React from 'react';

import { AppProvider } from '@/components/app-context';
import { HapticTab } from '@/components/haptic-tab';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

export default function TabLayout() {
  const colorScheme = useColorScheme();

  return (
    <AppProvider>
      <Tabs
        screenOptions={{
          tabBarActiveTintColor: Colors[colorScheme ?? 'light'].tint,
          headerShown: false,
          tabBarButton: HapticTab,
        }}>
        <Tabs.Screen
          name="index"
          options={{
            title: '日历',
            tabBarIcon: ({ color }) => <IconSymbol size={28} name="calendar" color={color} />,
          }}
        />
        <Tabs.Screen
          name="trips"
          options={{
            title: '差旅',
            tabBarIcon: ({ color }) => <IconSymbol size={28} name="briefcase.fill" color={color} />,
          }}
        />
        <Tabs.Screen
          name="stats"
          options={{
            title: '统计',
            tabBarIcon: ({ color }) => <IconSymbol size={28} name="chart.bar.fill" color={color} />,
          }}
        />
      </Tabs>
    </AppProvider>
  );
}
