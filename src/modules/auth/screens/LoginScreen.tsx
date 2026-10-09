import { useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';

import type { AuthStackParamList } from '@/navigation/routes';
import { Button, Input } from '@/shared/components';
import { colors, spacing, typography } from '@/shared/theme';

import { useAuth } from '../context/AuthContext';
import { AuthServiceError } from '../services/auth-error';

type Props = NativeStackScreenProps<AuthStackParamList, 'Login'>;

const DEMO_ACCOUNTS = [
  { label: 'Limpieza', email: 'limpieza@aurora.test', password: 'limpieza', type: 'staff' },
  {
    label: 'Room Service',
    email: 'roomservice@aurora.test',
    password: 'roomservice',
    type: 'staff',
  },
  {
    label: 'Conserjería',
    email: 'conserjeria@aurora.test',
    password: 'conserjeria',
    type: 'staff',
  },
  { label: 'Ana Morales', email: 'ana.demo@aurora.test', password: 'huesped1', type: 'guest' },
  { label: 'Carlos Reyes', email: 'carlos.demo@aurora.test', password: 'huesped2', type: 'guest' },
] as const;

export function LoginScreen({ navigation }: Props) {
  const { loginGuest, loginStaff } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submittingDemoEmail, setSubmittingDemoEmail] = useState<string | null>(null);

  const canSubmit = email.trim().length > 0 && password.length > 0 && !isSubmitting;

  async function handleSubmit() {
    setError(null);
    setIsSubmitting(true);
    try {
      try {
        await loginStaff(email.trim(), password);
      } catch (staffError) {
        if (!(staffError instanceof AuthServiceError) || staffError.kind !== 'invalidCredentials') {
          throw staffError;
        }
        await loginGuest(email.trim(), password);
      }
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : 'No se pudo iniciar sesión.');
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleDemoAccess(account: (typeof DEMO_ACCOUNTS)[number]) {
    setError(null);
    setIsSubmitting(true);
    setSubmittingDemoEmail(account.email);
    try {
      if (account.type === 'guest') await loginGuest(account.email, account.password);
      else await loginStaff(account.email, account.password);
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : 'No se pudo iniciar sesión.');
    } finally {
      setSubmittingDemoEmail(null);
      setIsSubmitting(false);
    }
  }

  return (
    <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
      <View style={styles.header}>
        {/* Misma marca visible que la web: AURORA · HOTEL & RESORT. */}
        <Text style={styles.title} accessibilityLabel="Aurora Hotel & Resort">
          AURORA
        </Text>
        <Text style={styles.tagline}>HOTEL & RESORT</Text>
        <Text style={styles.subtitle}>Acceso para huéspedes y personal</Text>
      </View>

      <View style={styles.form}>
        <Input
          label="Correo electrónico"
          placeholder="correo@aurora.test"
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
        {error ? <Text style={styles.error}>{error}</Text> : null}
        <Button
          label="Iniciar sesión"
          onPress={handleSubmit}
          loading={isSubmitting}
          disabled={!canSubmit}
          fullWidth
        />
      </View>

      {__DEV__ ? (
        <View style={styles.demoSection}>
          <Text style={styles.demoTitle}>Acceso rápido · Demo</Text>
          <Text style={styles.demoGroup}>Personal</Text>
          {DEMO_ACCOUNTS.filter((account) => account.type === 'staff').map((account) => (
            <Button
              key={account.email}
              label={account.label}
              variant="secondary"
              onPress={() => handleDemoAccess(account)}
              disabled={isSubmitting}
              loading={submittingDemoEmail === account.email}
              fullWidth
            />
          ))}
          <Text style={styles.demoGroup}>Huéspedes</Text>
          {DEMO_ACCOUNTS.filter((account) => account.type === 'guest').map((account) => (
            <Button
              key={account.email}
              label={account.label}
              variant="secondary"
              onPress={() => handleDemoAccess(account)}
              disabled={isSubmitting}
              loading={submittingDemoEmail === account.email}
              fullWidth
            />
          ))}
        </View>
      ) : null}

      <Button
        label="¿Tienes un código de reserva? Vincular estancia"
        variant="secondary"
        onPress={() => navigation.navigate('LinkBooking')}
        fullWidth
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
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
  error: {
    ...typography.bodySmall,
    color: colors.state.danger,
  },
  demoSection: {
    gap: spacing.sm,
    padding: spacing.md,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.brand[300],
    backgroundColor: colors.sand[100],
  },
  demoTitle: {
    ...typography.h2,
    color: colors.text.primary,
  },
  demoGroup: {
    ...typography.bodySmall,
    color: colors.text.secondary,
    fontWeight: '600',
  },
});
