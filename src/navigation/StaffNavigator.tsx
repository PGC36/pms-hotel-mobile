import { useAuth } from '@/modules/auth/context/AuthContext';
import { STAFF_ROLES } from '@/shared/constants/roles';

import { ConciergeNavigator } from './ConciergeNavigator';
import { HousekeepingNavigator } from './HousekeepingNavigator';
import { RoomServiceNavigator } from './RoomServiceNavigator';

/**
 * Tabs de personal, filtradas por el rol de la sesión activa (MOV-06,
 * criterios 1-2): un usuario de limpieza solo ve la pestaña de limpieza, y
 * así con cada rol. Solo se monta cuando `session.type === 'staff'`.
 */
export function StaffNavigator() {
  const { session } = useAuth();
  if (session?.type !== 'staff') return null;

  const { role } = session.user;

  if (role === STAFF_ROLES.HOUSEKEEPING) {
    return <HousekeepingNavigator />;
  }
  if (role === STAFF_ROLES.ROOM_SERVICE) return <RoomServiceNavigator />;
  if (role === STAFF_ROLES.CONCIERGE) return <ConciergeNavigator />;
  return null;
}
