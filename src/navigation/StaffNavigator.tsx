import {
  BottomTabBar,
  createBottomTabNavigator,
  type BottomTabBarProps,
} from '@react-navigation/bottom-tabs';

import { StaffSessionBar } from '@/modules/auth/components/StaffSessionBar';
import { useAuth } from '@/modules/auth/context/AuthContext';
import { STAFF_ROLES } from '@/shared/constants/roles';

import { ConciergeNavigator } from './ConciergeNavigator';
import { HousekeepingNavigator } from './HousekeepingNavigator';
import { RoomServiceNavigator } from './RoomServiceNavigator';
import type { StaffTabParamList } from './routes';

const Tab = createBottomTabNavigator<StaffTabParamList>();

/**
 * La barra de pestañas estándar, con la fila de cuenta ("Cerrar sesión")
 * encima: un solo lugar compartido por todos los roles. Los encabezados no
 * sirven para esto porque cada stack de módulo usa el suyo.
 */
function StaffTabBar(props: BottomTabBarProps) {
  return (
    <>
      <StaffSessionBar />
      <BottomTabBar {...props} />
    </>
  );
}

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
    <Tab.Navigator tabBar={StaffTabBar}>
      {role === STAFF_ROLES.HOUSEKEEPING && (
        <Tab.Screen
          name="Housekeeping"
          component={HousekeepingNavigator}
          // El stack interno ya muestra su propio encabezado.
          options={{ title: 'Limpieza', headerShown: false }}
        />
      )}
      {role === STAFF_ROLES.ROOM_SERVICE && (
        <Tab.Screen
          name="RoomService"
          component={RoomServiceNavigator}
          // El stack interno ya muestra su propio encabezado.
          options={{ title: 'Room Service', headerShown: false }}
        />
      )}
      {role === STAFF_ROLES.CONCIERGE && (
        <Tab.Screen
          name="Concierge"
          component={ConciergeNavigator}
          // El stack interno ya muestra su propio encabezado.
          options={{ title: 'Conserjería', headerShown: false }}
        />
      )}
    </Tab.Navigator>
  );
}
