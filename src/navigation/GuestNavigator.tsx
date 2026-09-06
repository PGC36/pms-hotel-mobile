import { createNativeStackNavigator } from '@react-navigation/native-stack';

import { ComingSoonScreen } from '@/shared/screens/ComingSoonScreen';

import type { GuestStackParamList } from './routes';

const Stack = createNativeStackNavigator<GuestStackParamList>();

/** Declarado en MOV-06 aunque sus pantallas reales lleguen en la Fase 2 (MOV-15+). */
export function GuestNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Stay">
        {() => <ComingSoonScreen title="Estadía" ticket="MOV-15" />}
      </Stack.Screen>
    </Stack.Navigator>
  );
}
