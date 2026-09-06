import { useState } from 'react';
import { StyleSheet, Text, TextInput, View, type TextInputProps } from 'react-native';

import { colors, radius, spacing, typography } from '@/shared/theme';

export interface InputProps extends TextInputProps {
  label?: string;
  error?: string;
}

export function Input({ label, error, style, onFocus, onBlur, ...rest }: InputProps) {
  const [isFocused, setIsFocused] = useState(false);

  const borderColor = error
    ? colors.state.danger
    : isFocused
      ? colors.brand[600]
      : colors.sand[300];

  return (
    <View style={styles.container}>
      {label ? <Text style={styles.label}>{label}</Text> : null}
      <TextInput
        style={[styles.input, { borderColor }, style]}
        placeholderTextColor={colors.text.muted}
        onFocus={(event) => {
          setIsFocused(true);
          onFocus?.(event);
        }}
        onBlur={(event) => {
          setIsFocused(false);
          onBlur?.(event);
        }}
        {...rest}
      />
      {error ? <Text style={styles.error}>{error}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: spacing.xs,
  },
  label: {
    ...typography.caption,
    color: colors.text.secondary,
  },
  input: {
    ...typography.body,
    color: colors.text.primary,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderRadius: radius.sm,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
  },
  error: {
    ...typography.caption,
    color: colors.state.danger,
  },
});
