import { Alert, Pressable, StyleSheet } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';

import { useAuth } from '@/modules/auth/context/AuthContext';
import { colors } from '@/shared/theme';

export function GuestLogoutButton() {
  const { logout } = useAuth();

  const confirmLogout = () => {
    Alert.alert('Cerrar sesión', '¿Deseas salir del portal de huésped?', [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Cerrar sesión',
        style: 'destructive',
        onPress: () => {
          void logout().catch(() => {
            Alert.alert('No se pudo cerrar la sesión', 'Intenta de nuevo.');
          });
        },
      },
    ]);
  };

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel="Cerrar sesión"
      hitSlop={10}
      onPress={confirmLogout}
      style={({ pressed }) => [styles.button, pressed && styles.pressed]}
    >
      <MaterialCommunityIcons name="logout" size={22} color={colors.brand[600]} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: { minWidth: 40, minHeight: 40, alignItems: 'center', justifyContent: 'center' },
  pressed: { opacity: 0.6 },
});
