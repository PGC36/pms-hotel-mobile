import { createNativeStackNavigator } from '@react-navigation/native-stack';

import { GuestLoginScreen } from '@/modules/auth/screens/GuestLoginScreen';
import { LinkBookingScreen } from '@/modules/auth/screens/LinkBookingScreen';
import { LoginScreen } from '@/modules/auth/screens/LoginScreen';

import type { AuthStackParamList } from './routes';

const Stack = createNativeStackNavigator<AuthStackParamList>();

/** Sin sesión: acceso a login de huéspedes (flujo principal), login de personal o vincular reserva. */
export function AuthNavigator() {
  return (
    <Stack.Navigator initialRouteName="GuestLogin" screenOptions={{ headerShown: false }}>
      <Stack.Screen name="GuestLogin" component={GuestLoginScreen} />
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="LinkBooking" component={LinkBookingScreen} />
    </Stack.Navigator>
  );
}
