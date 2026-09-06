import { StyleSheet, Text, View } from 'react-native';

import { colors, radius, spacing, typography } from '@/shared/theme';

export type BadgeVariant =
  'neutral' | 'accent' | 'success' | 'warning' | 'danger' | 'info' | 'muted';

export interface BadgeProps {
  label: string;
  variant?: BadgeVariant;
}

const VARIANT_STYLES: Record<BadgeVariant, { background: string; text: string }> = {
  neutral: { background: colors.sand[200], text: colors.text.primary },
  accent: { background: colors.brand[300], text: colors.brand[900] },
  success: { background: colors.state.success, text: colors.white },
  warning: { background: colors.state.warning, text: colors.brand[900] },
  danger: { background: colors.state.danger, text: colors.white },
  info: { background: colors.state.info, text: colors.white },
  muted: { background: colors.state.muted, text: colors.white },
};

export function Badge({ label, variant = 'neutral' }: BadgeProps) {
  const variantStyle = VARIANT_STYLES[variant];

  return (
    <View style={[styles.badge, { backgroundColor: variantStyle.background }]}>
      <Text style={[styles.label, { color: variantStyle.text }]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    alignSelf: 'flex-start',
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.sm,
    borderRadius: radius.full,
  },
  label: {
    ...typography.caption,
  },
});
