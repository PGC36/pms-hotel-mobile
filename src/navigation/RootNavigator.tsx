import { NavigationContainer } from '@react-navigation/native';

import { useAuth } from '@/modules/auth/context/AuthContext';
import { LoadingState } from '@/shared/components';

import { AuthNavigator } from './AuthNavigator';
import { GuestNavigator } from './GuestNavigator';
import { StaffNavigator } from './StaffNavigator';

/**
 * Decide qué árbol de navegación montar según el tipo de sesión activa.
 * Un huésped nunca instancia el árbol de personal, y viceversa (architecture.md
 * sección 1): las ramas no elegidas ni siquiera se renderizan.
 */
export function RootNavigator() {
  const { session, isLoading } = useAuth();

  if (isLoading) {
    return <LoadingState message="Cargando sesión..." />;
  }

  return (
    <NavigationContainer>
      {!session && <AuthNavigator />}
      {session?.type === 'staff' && <StaffNavigator />}
      {session?.type === 'guest' && <GuestNavigator />}
    </NavigationContainer>
  );
}
