import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { MaterialCommunityIcons } from '@expo/vector-icons';

import { ConciergeDetailScreen } from '@/modules/concierge/screens/ConciergeDetailScreen';
import { ConciergeHistoryScreen } from '@/modules/concierge/screens/ConciergeHistoryScreen';
import { ConciergeInboxScreen } from '@/modules/concierge/screens/ConciergeInboxScreen';
import { ConciergeRoomRequestsScreen } from '@/modules/concierge/screens/ConciergeRoomRequestsScreen';
import { ConciergeRoomsScreen } from '@/modules/concierge/screens/ConciergeRoomsScreen';
import { colors } from '@/shared/theme';

import type { ConciergeStackParamList, ConciergeTabParamList } from './routes';
import { StaffTabBar } from './StaffTabBar';

const Stack = createNativeStackNavigator<ConciergeStackParamList>();
const Tab = createBottomTabNavigator<ConciergeTabParamList>();

function RequestsStack() {
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
    </Stack.Navigator>
  );
}

function RoomsStack() {
  return (
    <Stack.Navigator>
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
        name="Detail"
        component={ConciergeDetailScreen}
        options={{ title: 'Solicitud' }}
      />
    </Stack.Navigator>
  );
}

function HistoryStack() {
  return (
    <Stack.Navigator>
      <Stack.Screen
        name="History"
        component={ConciergeHistoryScreen}
        options={{ title: 'Historial' }}
      />
    </Stack.Navigator>
  );
}

export function ConciergeNavigator() {
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
        name="RequestsTab"
        component={RequestsStack}
        options={{
          title: 'Solicitudes',
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="message-text-outline" color={color} size={size} />
          ),
        }}
      />
      <Tab.Screen
        name="RoomsTab"
        component={RoomsStack}
        options={{
          title: 'Habitaciones',
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="door-open" color={color} size={size} />
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
