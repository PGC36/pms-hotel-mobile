import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';

import type { AuthStackParamList } from '@/navigation/routes';
import { Button, Input } from '@/shared/components';
import { colors, spacing, typography } from '@/shared/theme';

import { useAuth } from '../context/AuthContext';

type Props = NativeStackScreenProps<AuthStackParamList, 'GuestLogin'>;

export function GuestLoginScreen({ navigation }: Props) {
  const { loginGuest } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const canSubmit = email.trim().length > 0 && password.length > 0 && !isSubmitting;

  async function handleSubmit() {
    setError(null);
    setIsSubmitting(true);
    try {
      await loginGuest(email.trim(), password);
    } catch (submitError) {
      setError(
        submitError instanceof Error
          ? submitError.message
          : 'No se pudo iniciar sesión como huésped.',
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title} accessibilityLabel="Aurora Hotel & Resort">
          AURORA
        </Text>
        <Text style={styles.tagline}>HOTEL & RESORT</Text>
        <Text style={styles.subtitle}>Portal de Huéspedes</Text>
      </View>

      <View style={styles.form}>
        <Input
          label="Correo electrónico"
          placeholder="huesped@ejemplo.com"
          autoCapitalize="none"
          autoCorrect={false}
          keyboardType="email-address"
          value={email}
          onChangeText={setEmail}
        />
        <Input
          label="Contraseña"
          placeholder="••••••••"
          secureTextEntry
          value={password}
          onChangeText={setPassword}
        />
        {error ? (
          <Text style={styles.error} accessibilityRole="alert">
            {error}
          </Text>
        ) : null}
        <Button
          label="Iniciar sesión como huésped"
          onPress={handleSubmit}
          loading={isSubmitting}
          disabled={!canSubmit}
          fullWidth
        />
      </View>

      <View style={styles.secondaryActions}>
        <Button
          label="¿Tienes un código demo? (Vincular)"
          variant="secondary"
          onPress={() => navigation.navigate('LinkBooking')}
          fullWidth
        />
        <Button
          label="Acceso para el personal"
          variant="secondary"
          onPress={() => navigation.navigate('Login')}
          fullWidth
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: spacing.xl,
    gap: spacing.xl,
    backgroundColor: colors.sand[50],
  },
  header: {
    gap: spacing.xs,
  },
  title: {
    ...typography.display,
    color: colors.text.primary,
  },
  tagline: {
    ...typography.caption,
    color: colors.brand[400],
  },
  subtitle: {
    ...typography.body,
    color: colors.text.secondary,
  },
  form: {
    gap: spacing.md,
  },
  secondaryActions: {
    gap: spacing.sm,
  },
  error: {
    ...typography.bodySmall,
    color: colors.state.danger,
  },
});
