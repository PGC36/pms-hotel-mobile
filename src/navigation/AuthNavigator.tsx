import { createNativeStackNavigator } from '@react-navigation/native-stack';

import { LinkBookingScreen } from '@/modules/auth/screens/LinkBookingScreen';
import { LoginScreen } from '@/modules/auth/screens/LoginScreen';

import type { AuthStackParamList } from './routes';

const Stack = createNativeStackNavigator<AuthStackParamList>();

/** Sin sesión: formulario general, más el flujo secundario para vincular una reserva. */
export function AuthNavigator() {
  return (
    <Stack.Navigator initialRouteName="Login" screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="LinkBooking" component={LinkBookingScreen} />
    </Stack.Navigator>
  );
}
