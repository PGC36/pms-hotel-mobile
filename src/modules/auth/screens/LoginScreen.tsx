import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';

import type { AuthStackParamList } from '@/navigation/routes';
import { Button, Input } from '@/shared/components';
import { colors, spacing, typography } from '@/shared/theme';

import { useAuth } from '../context/AuthContext';

type Props = NativeStackScreenProps<AuthStackParamList, 'Login'>;

export function LoginScreen({ navigation }: Props) {
  const { loginStaff } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const canSubmit = email.trim().length > 0 && password.length > 0 && !isSubmitting;

  async function handleSubmit() {
    setError(null);
    setIsSubmitting(true);
    try {
      await loginStaff(email.trim(), password);
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : 'No se pudo iniciar sesión.');
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Posada del Ceibo</Text>
        <Text style={styles.subtitle}>Ingreso de personal</Text>
      </View>

      <View style={styles.form}>
        <Input
          label="Correo"
          placeholder="nombre@posadadelceibo.gt"
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

      <Button
        label="Soy huésped, vincular reserva"
        variant="secondary"
        onPress={() => navigation.navigate('LinkBooking')}
        fullWidth
      />
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
});
