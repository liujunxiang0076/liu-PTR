import { Redirect } from 'expo-router';
import { useAuth } from '@/context/auth-context';
import { ActivityIndicator, View, Text } from 'react-native';

export default function Index() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" />
        <Text style={{ marginTop: 16, color: '#6B7280' }}>加载中...</Text>
      </View>
    );
  }

  if (user) {
    return <Redirect href="/(tabs)" />;
  }

  return <Redirect href="/login" />;
}
