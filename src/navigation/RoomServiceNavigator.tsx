import { createNativeStackNavigator } from '@react-navigation/native-stack';

import { MenuScreen } from '@/modules/room-service/staff/screens/MenuScreen';
import { OrderDetailScreen } from '@/modules/room-service/staff/screens/OrderDetailScreen';
import { OrderHistoryScreen } from '@/modules/room-service/staff/screens/OrderHistoryScreen';
import { OrderInboxScreen } from '@/modules/room-service/staff/screens/OrderInboxScreen';

import type { RoomServiceStackParamList } from './routes';

const Stack = createNativeStackNavigator<RoomServiceStackParamList>();

/** Navegación interna de la pestaña de Room Service del personal (MOV-10). */
export function RoomServiceNavigator() {
  return (
    <Stack.Navigator>
      <Stack.Screen name="OrderInbox" component={OrderInboxScreen} options={{ title: 'Pedidos' }} />
      <Stack.Screen
        name="OrderDetail"
        component={OrderDetailScreen}
        options={{ title: 'Pedido' }}
      />
      <Stack.Screen name="Menu" component={MenuScreen} options={{ title: 'Menú' }} />
      <Stack.Screen
        name="History"
        component={OrderHistoryScreen}
        options={{ title: 'Historial' }}
      />
    </Stack.Navigator>
  );
}
