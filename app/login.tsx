import { Stack } from 'expo-router';
import { LoginScreen } from '@/screens/login-screen';

export default function LoginPage() {
  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <LoginScreen />
    </>
  );
}
