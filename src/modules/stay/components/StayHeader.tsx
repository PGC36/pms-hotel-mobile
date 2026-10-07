import { useState, useRef } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { useAuth } from '@/modules/auth/context/AuthContext';
import { Button } from '@/shared/components';
import { colors, spacing, typography } from '@/shared/theme';

interface Props {
  guestName: string;
  roomNumber: string;
}

export function StayHeader({ guestName, roomNumber }: Props) {
  const { logout } = useAuth();
  const [isConfirming, setIsConfirming] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const inFlight = useRef(false);

  async function confirmLogout() {
    if (inFlight.current) return;
    inFlight.current = true;
    setIsLoggingOut(true);
    setErrorMessage(null);
    try {
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
          <Text style={styles.confirmMessage}>¿Deseas salir del portal de huésped?</Text>
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
          <View style={styles.info}>
            <Text style={styles.welcome}>¡Hola, {guestName}!</Text>
            <Text style={styles.roomSubtitle}>Habitación {roomNumber}</Text>
          </View>
          <Pressable
            onPress={() => setIsConfirming(true)}
            accessibilityRole="button"
            accessibilityLabel="Cerrar sesión"
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
    paddingVertical: spacing.md,
    backgroundColor: colors.white,
    borderBottomWidth: 1,
    borderBottomColor: colors.sand[300],
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.md,
  },
  info: {
    flex: 1,
  },
  welcome: {
    ...typography.h2,
    color: colors.text.primary,
  },
  roomSubtitle: {
    ...typography.caption,
    color: colors.brand[600],
    fontWeight: '600',
  },
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
