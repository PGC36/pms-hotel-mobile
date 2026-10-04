import { createNativeStackNavigator } from '@react-navigation/native-stack';

import { HousekeepingHistoryScreen } from '@/modules/housekeeping/screens/HousekeepingHistoryScreen';
import { HousekeepingRequestDetailScreen } from '@/modules/housekeeping/screens/HousekeepingRequestDetailScreen';
import { HousekeepingRequestsScreen } from '@/modules/housekeeping/screens/HousekeepingRequestsScreen';
import { ReportIssueScreen } from '@/modules/housekeeping/screens/ReportIssueScreen';
import { RoomDetailScreen } from '@/modules/housekeeping/screens/RoomDetailScreen';
import { RoomListScreen } from '@/modules/housekeeping/screens/RoomListScreen';

import type { HousekeepingStackParamList } from './routes';

const Stack = createNativeStackNavigator<HousekeepingStackParamList>();

/** Navegación interna de la pestaña de limpieza (MOV-09). */
export function HousekeepingNavigator() {
  return (
    <Stack.Navigator>
      <Stack.Screen
        name="RoomList"
        component={RoomListScreen}
        options={{ title: 'Habitaciones' }}
      />
      <Stack.Screen
        name="RoomDetail"
        component={RoomDetailScreen}
        options={{ title: 'Habitación' }}
      />
      <Stack.Screen
        name="Requests"
        component={HousekeepingRequestsScreen}
        options={{ title: 'Solicitudes' }}
      />
      <Stack.Screen
        name="RequestDetail"
        component={HousekeepingRequestDetailScreen}
        options={{ title: 'Solicitud' }}
      />
      <Stack.Screen
        name="ReportIssue"
        component={ReportIssueScreen}
        options={{ title: 'Reportar desperfecto' }}
      />
      <Stack.Screen
        name="History"
        component={HousekeepingHistoryScreen}
        options={{ title: 'Historial' }}
      />
    </Stack.Navigator>
  );
}
