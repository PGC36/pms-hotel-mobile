import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';

import { useAuth } from '@/modules/auth/context/AuthContext';
import { STAFF_ROLES } from '@/shared/constants/roles';
import { ComingSoonScreen } from '@/shared/screens/ComingSoonScreen';

import { HousekeepingNavigator } from './HousekeepingNavigator';
import type { StaffTabParamList } from './routes';

const Tab = createBottomTabNavigator<StaffTabParamList>();

/**
 * Tabs de personal, filtradas por el rol de la sesión activa (MOV-06,
 * criterios 1-2): un usuario de limpieza solo ve la pestaña de limpieza, y
 * así con cada rol. Solo se monta cuando `session.type === 'staff'`.
 */
export function StaffNavigator() {
  const { session } = useAuth();
  if (session?.type !== 'staff') return null;

  const { role } = session.user;

  return (
    <Tab.Navigator>
      {role === STAFF_ROLES.HOUSEKEEPING && (
        <Tab.Screen
          name="Housekeeping"
          component={HousekeepingNavigator}
          // El stack interno ya muestra su propio encabezado.
          options={{ title: 'Limpieza', headerShown: false }}
        />
      )}
      {role === STAFF_ROLES.ROOM_SERVICE && (
        <Tab.Screen name="RoomService" options={{ title: 'Room Service' }}>
          {() => <ComingSoonScreen title="Room Service" ticket="MOV-10" />}
        </Tab.Screen>
      )}
      {role === STAFF_ROLES.CONCIERGE && (
        <Tab.Screen name="Concierge" options={{ title: 'Conserjería' }}>
          {() => <ComingSoonScreen title="Conserjería" ticket="MOV-11" />}
        </Tab.Screen>
      )}
    </Tab.Navigator>
  );
}
