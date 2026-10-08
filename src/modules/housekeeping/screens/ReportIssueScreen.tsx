import { useRef, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';

import type { HousekeepingStackParamList } from '@/navigation/routes';
import { Button, Card, Input } from '@/shared/components';
import { colors, radius, spacing, typography } from '@/shared/theme';

import { ISSUE_PRIORITIES, type IssuePriority } from '../dtos/issue-report.dto';
import type { MaintenanceModel } from '../models/maintenance.model';
import { createIssueReport } from '../services/issue-report.service';

type Props = NativeStackScreenProps<HousekeepingStackParamList, 'ReportIssue'>;

export const ISSUE_PRIORITY_LABELS: Record<IssuePriority, string> = {
  low: 'Baja',
  medium: 'Media',
  high: 'Alta',
};

/**
 * Reporte de desperfecto (HU-09). No toca la ocupación ni la limpieza de la
 * habitación: crea una solicitud maintenance persistida en el backend.
 */
export function ReportIssueScreen({ route, navigation }: Props) {
  const { roomId, roomNumber } = route.params;

  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState<IssuePriority | null>(null);
  const [descriptionError, setDescriptionError] = useState<string | null>(null);
  const [priorityError, setPriorityError] = useState<string | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [createdReport, setCreatedReport] = useState<MaintenanceModel | null>(null);
  // Corta un doble toque antes de que `isSubmitting` llegue al siguiente render.
  const submittingRef = useRef(false);

  async function handleSubmit() {
    if (submittingRef.current || createdReport) return;

    const trimmed = description.trim();
    setDescriptionError(trimmed ? null : 'Describe el desperfecto.');
    setPriorityError(priority ? null : 'Selecciona una prioridad.');
    setSubmitError(null);
    if (!trimmed || !priority) return;

    submittingRef.current = true;
    setIsSubmitting(true);
    try {
      const report = await createIssueReport({
        roomId,
        description: trimmed,
        priority,
      });
      setCreatedReport(report);
    } catch (error) {
      setSubmitError(
        error instanceof Error ? error.message : 'No se pudo enviar el reporte. Intenta de nuevo.',
      );
      submittingRef.current = false;
    } finally {
      setIsSubmitting(false);
    }
  }

  if (createdReport) {
    return (
      <View style={styles.container}>
        <View style={styles.content}>
          <Card style={styles.section}>
            <Text style={styles.title} accessibilityRole="header">
              ✅ Reporte enviado
            </Text>
            <Text style={styles.body}>
              El desperfecto de la habitación {roomNumber} quedó registrado con prioridad{' '}
              {priority ? ISSUE_PRIORITY_LABELS[priority].toLowerCase() : 'seleccionada'}.
            </Text>
            <Text style={styles.quote}>“{createdReport.description}”</Text>
          </Card>
          <Button label="Volver a la habitación" onPress={() => navigation.goBack()} fullWidth />
        </View>
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      keyboardShouldPersistTaps="handled"
    >
      <View style={styles.section}>
        <Text style={styles.label}>Habitación</Text>
        <Text style={styles.title}>{roomNumber}</Text>
      </View>

      <Input
        label="Descripción"
        placeholder="Ej. El grifo del lavamanos gotea constantemente."
        value={description}
        onChangeText={(text) => {
          setDescription(text);
          if (descriptionError && text.trim()) setDescriptionError(null);
        }}
        error={descriptionError ?? undefined}
        multiline
        editable={!isSubmitting}
      />

      <View style={styles.section}>
        <Text style={styles.label}>Prioridad</Text>
        <View style={styles.priorities} accessibilityRole="radiogroup">
          {ISSUE_PRIORITIES.map((option) => {
            const selected = option === priority;
            return (
              <Pressable
                key={option}
                onPress={() => {
                  setPriority(option);
                  setPriorityError(null);
                }}
                disabled={isSubmitting}
                accessibilityRole="radio"
                accessibilityState={{ checked: selected, disabled: isSubmitting }}
                accessibilityLabel={`Prioridad ${ISSUE_PRIORITY_LABELS[option]}`}
                style={[styles.chip, selected && styles.chipSelected]}
              >
                <Text style={[styles.chipLabel, selected && styles.chipLabelSelected]}>
                  {selected ? '✓ ' : ''}
                  {ISSUE_PRIORITY_LABELS[option]}
                </Text>
              </Pressable>
            );
          })}
        </View>
        {priorityError ? <Text style={styles.error}>{priorityError}</Text> : null}
      </View>

      {submitError ? (
        <Text style={styles.error} accessibilityRole="alert">
          {submitError}
        </Text>
      ) : null}

      <Button
        label="Enviar reporte"
        onPress={() => void handleSubmit()}
        loading={isSubmitting}
        fullWidth
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.sand[50],
  },
  content: {
    padding: spacing.md,
    gap: spacing.md,
  },
  section: {
    gap: spacing.xs,
  },
  label: {
    ...typography.caption,
    color: colors.text.secondary,
  },
  title: {
    ...typography.h2,
    color: colors.text.primary,
  },
  body: {
    ...typography.body,
    color: colors.text.secondary,
  },
  quote: {
    ...typography.bodySmall,
    color: colors.text.muted,
  },
  priorities: {
    flexDirection: 'row',
    flexWrap: 'wrap',
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
  error: {
    ...typography.caption,
    color: colors.state.danger,
  },
});
