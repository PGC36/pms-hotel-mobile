import { createNativeStackNavigator } from '@react-navigation/native-stack';

import { StayScreen } from '@/modules/stay/screens/StayScreen';

import type { GuestStackParamList } from './routes';

const Stack = createNativeStackNavigator<GuestStackParamList>();

/** Navegador de Huéspedes conectado al backend real. */
export function GuestNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Stay" component={StayScreen} />
    </Stack.Navigator>
  );
}

