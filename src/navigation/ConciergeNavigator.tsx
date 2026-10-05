import { createNativeStackNavigator } from '@react-navigation/native-stack';

import { ConciergeHistoryScreen } from '@/modules/requests/staff/screens/ConciergeHistoryScreen';
import { ConciergeInboxScreen } from '@/modules/requests/staff/screens/ConciergeInboxScreen';
import { ConciergeRequestDetailScreen } from '@/modules/requests/staff/screens/ConciergeRequestDetailScreen';
import { RequestsByRoomScreen } from '@/modules/requests/staff/screens/RequestsByRoomScreen';

import type { ConciergeStackParamList } from './routes';

const Stack = createNativeStackNavigator<ConciergeStackParamList>();

/** Navegación interna de la pestaña de Conserjería del personal (MOV-11). */
export function ConciergeNavigator() {
  return (
    <Stack.Navigator>
      <Stack.Screen
        name="ConciergeInbox"
        component={ConciergeInboxScreen}
        options={{ title: 'Solicitudes' }}
      />
      <Stack.Screen
        name="ConciergeRequestDetail"
        component={ConciergeRequestDetailScreen}
        options={{ title: 'Solicitud' }}
      />
      <Stack.Screen
        name="RequestsByRoom"
        component={RequestsByRoomScreen}
        // Con habitación seleccionada, el título es la habitación.
        options={({ route }) => ({ title: route.params?.roomLabel ?? 'Por habitación' })}
      />
      <Stack.Screen
        name="ConciergeHistory"
        component={ConciergeHistoryScreen}
        options={{ title: 'Historial' }}
      />
    </Stack.Navigator>
  );
}
