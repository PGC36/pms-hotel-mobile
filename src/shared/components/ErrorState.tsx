import { StyleSheet, Text, View } from 'react-native';

import { colors, fontSize, spacing, typography } from '@/shared/theme';

import { Button } from './Button';

export interface ErrorStateProps {
  title?: string;
  description?: string;
  retryLabel?: string;
  onRetry: () => void;
}

export function ErrorState({
  title = 'Ocurrió un error',
  description = 'Algo salió mal. Intenta de nuevo.',
  retryLabel = 'Reintentar',
  onRetry,
}: ErrorStateProps) {
  return (
    <View style={styles.container}>
      <Text style={styles.icon}>⚠️</Text>
      <Text style={styles.title}>{title}</Text>
      {description ? <Text style={styles.description}>{description}</Text> : null}
      <Button label={retryLabel} onPress={onRetry} variant="danger" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.xl,
    gap: spacing.sm,
  },
  icon: {
    fontSize: fontSize.display,
  },
  title: {
    ...typography.h2,
    color: colors.text.primary,
    textAlign: 'center',
  },
  description: {
    ...typography.body,
    color: colors.text.secondary,
    textAlign: 'center',
    marginBottom: spacing.xs,
  },
});
