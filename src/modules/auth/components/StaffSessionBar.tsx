import { useRef, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { Button } from '@/shared/components';
import { STAFF_ROLE_LABELS } from '@/shared/constants/roles';
import { colors, spacing, typography } from '@/shared/theme';

import { useAuth } from '../context/AuthContext';

/**
 * Fila de cuenta del personal: quién tiene la sesión y "Cerrar sesión". Se
 * monta una sola vez sobre la barra de pestañas de `StaffNavigator`, así que
 * la ven todos los roles sin tocar cada pantalla. La confirmación es inline
 * (no `Alert.alert`, que no funciona en RN Web), igual que en `TaskDetailScreen`.
 */
export function StaffSessionBar() {
  const { session, logout } = useAuth();
  const [isConfirming, setIsConfirming] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const inFlight = useRef(false);

  if (session?.type !== 'staff') return null;
  const { user } = session;

  async function confirmLogout() {
    if (inFlight.current) return;
    inFlight.current = true;
    setIsLoggingOut(true);
    setErrorMessage(null);
    try {
      // Al terminar, `RootNavigator` desmonta este árbol y muestra el login.
      await logout();
    } catch {
      setErrorMessage('No se pudo cerrar la sesión. Intenta de nuevo.');
      setIsLoggingOut(false);
      inFlight.current = false;
    }
  }

  function cancel() {
    setIsConfirming(false);
    setErrorMessage(null);
  }

  return (
    <View style={styles.container}>
      {isConfirming ? (
        <View style={styles.confirm}>
          <Text style={styles.confirmTitle} accessibilityRole="header">
            Cerrar sesión
          </Text>
          <Text style={styles.confirmMessage}>¿Deseas cerrar tu sesión?</Text>
          {errorMessage ? (
            <Text style={styles.error} accessibilityRole="alert">
              {errorMessage}
            </Text>
          ) : null}
          <View style={styles.actions}>
            <Button label="Cancelar" variant="secondary" onPress={cancel} disabled={isLoggingOut} />
            <Button
              label="Cerrar sesión"
              variant="danger"
              onPress={() => void confirmLogout()}
              loading={isLoggingOut}
            />
          </View>
        </View>
      ) : (
        <View style={styles.row}>
          <Text style={styles.user} numberOfLines={1}>
            {user.fullName === STAFF_ROLE_LABELS[user.role]
              ? `Sesión de ${STAFF_ROLE_LABELS[user.role]}`
              : `${user.fullName} · ${STAFF_ROLE_LABELS[user.role]}`}
          </Text>
          <Pressable
            onPress={() => setIsConfirming(true)}
            accessibilityRole="button"
            accessibilityLabel="Cerrar sesión"
            // 24 px de icono + 10 px por lado = 44 px de área táctil.
            hitSlop={10}
            style={({ pressed }) => ({ opacity: pressed ? 0.6 : 1 })}
          >
            <LogoutIcon />
          </Pressable>
        </View>
      )}
    </View>
  );
}

/**
 * Icono "log-out" (marco de puerta abierto + flecha hacia afuera) dibujado con
 * `View`: el proyecto no tiene librería de iconos y no se agrega una solo
 * para esto. Decorativo: la etiqueta accesible la lleva el botón.
 */
function LogoutIcon() {
  return (
    <View
      style={styles.icon}
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants"
    >
      <View style={styles.iconFrame} />
      <View style={styles.iconShaft} />
      <View style={styles.iconHead} />
    </View>
  );
}

const ICON_COLOR = colors.brand[600];
const ICON_STROKE = 2;

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    backgroundColor: colors.white,
    borderTopWidth: 1,
    borderTopColor: colors.sand[300],
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.md,
  },
  user: {
    ...typography.caption,
    color: colors.text.secondary,
    flexShrink: 1,
  },
  // Misma altura que el texto que reemplaza (lineHeight 24): la barra no cambia de tamaño.
  icon: {
    width: 24,
    height: 24,
  },
  iconFrame: {
    position: 'absolute',
    left: 3,
    top: 4,
    width: 9,
    height: 16,
    borderWidth: ICON_STROKE,
    borderRightWidth: 0,
    borderColor: ICON_COLOR,
    borderTopLeftRadius: 2,
    borderBottomLeftRadius: 2,
  },
  iconShaft: {
    position: 'absolute',
    left: 9,
    top: 11,
    width: 11,
    height: ICON_STROKE,
    backgroundColor: ICON_COLOR,
  },
  iconHead: {
    position: 'absolute',
    left: 13,
    top: 8.5,
    width: 7,
    height: 7,
    borderTopWidth: ICON_STROKE,
    borderRightWidth: ICON_STROKE,
    borderColor: ICON_COLOR,
    transform: [{ rotate: '45deg' }],
  },
  confirm: {
    gap: spacing.sm,
  },
  confirmTitle: {
    ...typography.body,
    color: colors.text.primary,
  },
  confirmMessage: {
    ...typography.bodySmall,
    color: colors.text.secondary,
  },
  actions: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  error: {
    ...typography.bodySmall,
    color: colors.state.danger,
  },
});
