import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { Input } from '@/shared/components';
import { colors, radius, spacing, typography } from '@/shared/theme';

import type { TaskStatus } from '../models/task.model';

export interface TaskStatusOption {
  value: 'all' | TaskStatus;
  label: string;
}

export interface TaskFiltersValue {
  status: 'all' | TaskStatus;
  search: string;
}

export interface TaskFiltersProps {
  statusOptions: TaskStatusOption[];
  value: TaskFiltersValue;
  onChange: (value: TaskFiltersValue) => void;
  searchPlaceholder?: string;
}

/** Filtro por estado (chips) y búsqueda de texto — MOV-07 criterio de aceptación 2: aplica en memoria, sin recargar la pantalla. */
export function TaskFilters({
  statusOptions,
  value,
  onChange,
  searchPlaceholder = 'Buscar por título, habitación o descripción',
}: TaskFiltersProps) {
  return (
    <View style={styles.container}>
      <Input
        placeholder={searchPlaceholder}
        value={value.search}
        onChangeText={(search) => onChange({ ...value, search })}
      />
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.chips}
      >
        {statusOptions.map((option) => {
          const selected = option.value === value.status;
          return (
            <Pressable
              key={option.value}
              onPress={() => onChange({ ...value, status: option.value })}
              style={[styles.chip, selected && styles.chipSelected]}
              accessibilityRole="button"
              accessibilityState={{ selected }}
            >
              <Text style={[styles.chipLabel, selected && styles.chipLabelSelected]}>
                {option.label}
              </Text>
            </Pressable>
          );
        })}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: spacing.sm,
    paddingHorizontal: spacing.md,
    paddingTop: spacing.md,
  },
  chips: {
    gap: spacing.sm,
  },
  chip: {
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.md,
    borderRadius: radius.full,
    borderWidth: 1,
    borderColor: colors.sand[300],
    backgroundColor: colors.white,
  },
  chipSelected: {
    backgroundColor: colors.brand[600],
    borderColor: colors.brand[600],
  },
  chipLabel: {
    ...typography.caption,
    color: colors.text.secondary,
  },
  chipLabelSelected: {
    color: colors.text.onBrand,
  },
});
