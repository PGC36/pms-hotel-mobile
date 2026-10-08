import { createNativeStackNavigator } from '@react-navigation/native-stack';

import { ConciergeDetailScreen } from '@/modules/concierge/screens/ConciergeDetailScreen';
import { ConciergeHistoryScreen } from '@/modules/concierge/screens/ConciergeHistoryScreen';
import { ConciergeInboxScreen } from '@/modules/concierge/screens/ConciergeInboxScreen';
import { ConciergeRoomRequestsScreen } from '@/modules/concierge/screens/ConciergeRoomRequestsScreen';
import { ConciergeRoomsScreen } from '@/modules/concierge/screens/ConciergeRoomsScreen';

import type { ConciergeStackParamList } from './routes';

const Stack = createNativeStackNavigator<ConciergeStackParamList>();

export function ConciergeNavigator() {
  return (
    <Stack.Navigator>
      <Stack.Screen
        name="Inbox"
        component={ConciergeInboxScreen}
        options={{ title: 'Conserjería' }}
      />
      <Stack.Screen
        name="Detail"
        component={ConciergeDetailScreen}
        options={{ title: 'Solicitud' }}
      />
      <Stack.Screen
        name="Rooms"
        component={ConciergeRoomsScreen}
        options={{ title: 'Habitaciones' }}
      />
      <Stack.Screen
        name="RoomRequests"
        component={ConciergeRoomRequestsScreen}
        options={({ route }) => ({ title: `Habitación ${route.params.roomNumber}` })}
      />
      <Stack.Screen
        name="History"
        component={ConciergeHistoryScreen}
        options={{ title: 'Historial' }}
      />
    </Stack.Navigator>
  );
}
