import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack, useRouter, useSegments } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import 'react-native-reanimated';

import { ErrorBoundary } from '@/components/error-boundary';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { AuthProvider, useAuth } from '@/context/auth-context';

function AuthGate({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const router = useRouter();
  const segments = useSegments();

  useEffect(() => {
    if (loading) return; // 等待认证状态加载

    const inLoginGroup = segments[0] === 'login';

    if (!user && !inLoginGroup) {
      // 未登录且不在登录页 → 跳转登录页
      router.replace('/login');
    } else if (user && inLoginGroup) {
      // 已登录但在登录页 → 跳转首页
      router.replace('/(tabs)');
    }
  }, [user, loading, segments]);

  return <>{children}</>;
}

export default function RootLayout() {
  const colorScheme = useColorScheme();

  return (
    <ErrorBoundary>
      <AuthProvider>
        <AuthGate>
          <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
            <Stack>
              <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
              <Stack.Screen name="login" options={{ headerShown: false }} />
              <Stack.Screen name="trip-detail" options={{ title: '差旅详情', headerBackTitle: '差旅' }} />
            </Stack>
            <StatusBar style="auto" />
          </ThemeProvider>
        </AuthGate>
      </AuthProvider>
    </ErrorBoundary>
  );
}
