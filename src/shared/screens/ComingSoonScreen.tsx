import { StyleSheet, Text, View } from 'react-native';

import { colors, spacing, typography } from '@/shared/theme';

export interface ComingSoonScreenProps {
  title: string;
  /** Ticket que construirá el contenido real, ej. "MOV-09". */
  ticket?: string;
}

/** Placeholder para pestañas/pantallas declaradas por navegación antes de que exista su ticket de contenido. */
export function ComingSoonScreen({ title, ticket }: ComingSoonScreenProps) {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.description}>
        Esta sección estará disponible próximamente{ticket ? ` (${ticket})` : ''}.
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.xl,
    gap: spacing.sm,
    backgroundColor: colors.sand[50],
  },
  title: {
    ...typography.h2,
    color: colors.text.primary,
  },
  description: {
    ...typography.body,
    color: colors.text.secondary,
    textAlign: 'center',
  },
});
