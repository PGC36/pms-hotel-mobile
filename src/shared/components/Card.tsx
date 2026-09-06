import { StyleSheet, View, type ViewProps } from 'react-native';

import { colors, radius, spacing } from '@/shared/theme';

export type CardProps = ViewProps;

export function Card({ style, children, ...rest }: CardProps) {
  return (
    <View style={[styles.card, style]} {...rest}>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.white,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.sand[300],
    padding: spacing.md,
  },
});
