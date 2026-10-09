import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { MaterialCommunityIcons } from '@expo/vector-icons';

import { HousekeepingHistoryScreen } from '@/modules/housekeeping/screens/HousekeepingHistoryScreen';
import { HousekeepingRequestDetailScreen } from '@/modules/housekeeping/screens/HousekeepingRequestDetailScreen';
import { HousekeepingRequestsScreen } from '@/modules/housekeeping/screens/HousekeepingRequestsScreen';
import { ReportIssueScreen } from '@/modules/housekeeping/screens/ReportIssueScreen';
import { RoomDetailScreen } from '@/modules/housekeeping/screens/RoomDetailScreen';
import { RoomListScreen } from '@/modules/housekeeping/screens/RoomListScreen';
import { colors } from '@/shared/theme';

import type { HousekeepingStackParamList, HousekeepingTabParamList } from './routes';
import { StaffTabBar } from './StaffTabBar';

const Stack = createNativeStackNavigator<HousekeepingStackParamList>();
const Tab = createBottomTabNavigator<HousekeepingTabParamList>();

function RoomsStack() {
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
        name="ReportIssue"
        component={ReportIssueScreen}
        options={{ title: 'Reportar desperfecto' }}
      />
    </Stack.Navigator>
  );
}

function RequestsStack() {
  return (
    <Stack.Navigator>
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
    </Stack.Navigator>
  );
}

function HistoryStack() {
  return (
    <Stack.Navigator>
      <Stack.Screen
        name="History"
        component={HousekeepingHistoryScreen}
        options={{ title: 'Historial' }}
      />
    </Stack.Navigator>
  );
}

/** Pestañas de Limpieza con pilas independientes para conservar cada contexto. */
export function HousekeepingNavigator() {
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
        name="RoomsTab"
        component={RoomsStack}
        options={{
          title: 'Limpieza',
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="broom" color={color} size={size} />
          ),
        }}
      />
      <Tab.Screen
        name="RequestsTab"
        component={RequestsStack}
        options={{
          title: 'Solicitudes',
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="clipboard-list-outline" color={color} size={size} />
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
