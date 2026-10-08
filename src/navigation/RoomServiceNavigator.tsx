import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { MaterialCommunityIcons } from '@expo/vector-icons';

import { MenuScreen } from '@/modules/room-service/staff/screens/MenuScreen';
import { OrderDetailScreen } from '@/modules/room-service/staff/screens/OrderDetailScreen';
import { OrderHistoryScreen } from '@/modules/room-service/staff/screens/OrderHistoryScreen';
import { OrderInboxScreen } from '@/modules/room-service/staff/screens/OrderInboxScreen';
import { colors } from '@/shared/theme';

import type { RoomServiceStackParamList, RoomServiceTabParamList } from './routes';
import { StaffTabBar } from './StaffTabBar';

const Stack = createNativeStackNavigator<RoomServiceStackParamList>();
const Tab = createBottomTabNavigator<RoomServiceTabParamList>();

function OrdersStack() {
  return (
    <Stack.Navigator>
      <Stack.Screen name="OrderInbox" component={OrderInboxScreen} options={{ title: 'Pedidos' }} />
      <Stack.Screen
        name="OrderDetail"
        component={OrderDetailScreen}
        options={{ title: 'Pedido' }}
      />
    </Stack.Navigator>
  );
}

function MenuStack() {
  return (
    <Stack.Navigator>
      <Stack.Screen name="Menu" component={MenuScreen} options={{ title: 'Menú' }} />
    </Stack.Navigator>
  );
}

function HistoryStack() {
  return (
    <Stack.Navigator>
      <Stack.Screen
        name="History"
        component={OrderHistoryScreen}
        options={{ title: 'Historial' }}
      />
    </Stack.Navigator>
  );
}

/** Pedidos, menú e historial como pestañas inferiores independientes. */
export function RoomServiceNavigator() {
  return (
    <Tab.Navigator
      tabBar={StaffTabBar}
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.brand[600],
        tabBarInactiveTintColor: colors.text.secondary,
      }}
    >
      <Tab.Screen
        name="OrdersTab"
        component={OrdersStack}
        options={{
          title: 'Pedidos',
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="clipboard-list-outline" color={color} size={size} />
          ),
        }}
      />
      <Tab.Screen
        name="MenuTab"
        component={MenuStack}
        options={{
          title: 'Menú',
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="silverware-fork-knife" color={color} size={size} />
          ),
        }}
      />
      <Tab.Screen
        name="HistoryTab"
        component={HistoryStack}
        options={{
          title: 'Historial',
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="history" color={color} size={size} />
          ),
        }}
      />
    </Tab.Navigator>
  );
}
