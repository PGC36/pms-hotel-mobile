import { StyleSheet, Text, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';

import type { AuthStackParamList } from '@/navigation/routes';
import { Button } from '@/shared/components';
import { colors, spacing, typography } from '@/shared/theme';

type Props = NativeStackScreenProps<AuthStackParamList, 'LinkBooking'>;

/** Ruta registrada desde MOV-06; la validación real del código llega en MOV-14. */
export function LinkBookingScreen({ navigation }: Props) {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Vincular reserva</Text>
      <Text style={styles.description}>
        Esta pantalla estará disponible próximamente (MOV-14): aquí podrás ingresar tu código de
        reserva para acceder a los servicios de tu estadía.
      </Text>
      <Button label="Volver" variant="secondary" onPress={() => navigation.goBack()} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: spacing.xl,
    gap: spacing.md,
    backgroundColor: colors.sand[50],
  },
  title: {
    ...typography.h1,
    color: colors.text.primary,
  },
  description: {
    ...typography.body,
    color: colors.text.secondary,
  },
});
