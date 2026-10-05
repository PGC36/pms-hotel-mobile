import { useRef, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { Button, Card, Input } from '@/shared/components';
import { colors, spacing, typography } from '@/shared/theme';

export interface TaskNotesEditorProps {
  /** Observaciones actuales según el backend. */
  notes: string | null;
  /** `false` en tareas terminales: solo lectura. */
  editable: boolean;
  /** Bloquea la edición mientras hay otra operación sobre la tarea. */
  disabled?: boolean;
  /** Guarda exactamente el texto recibido (REEMPLAZA el anterior); lanza si falla con un mensaje apto para mostrar. */
  onSave: (notes: string) => Promise<void>;
  /** Límite de caracteres de la interfaz, si el contrato del módulo lo tiene. Sin él no hay límite ni contador. */
  maxLength?: number;
  /** Etiqueta accesible del campo de edición. */
  inputAccessibilityLabel?: string;
  /** Texto bajo las observaciones cuando no son editables. */
  readOnlyHint?: string;
  /** Pregunta antes de guardar las observaciones vacías (el backend las borra). */
  clearConfirmMessage?: string;
}

type Mode = 'view' | 'edit' | 'confirmClear';

/**
 * Editor explícito de observaciones, compartido por los módulos de personal
 * (Room Service MOV-10, Conserjería MOV-11). Por defecto en solo lectura:
 * editar es una acción explícita, cancelar restaura el valor del backend y
 * dejarlas vacías pide confirmación, porque el guardado reemplaza el texto.
 */
export function TaskNotesEditor({
  notes,
  editable,
  disabled = false,
  onSave,
  maxLength,
  inputAccessibilityLabel = 'Observaciones',
  readOnlyHint = 'Las observaciones son de solo lectura.',
  clearConfirmMessage = '¿Eliminar las observaciones? Quedará sin observaciones.',
}: TaskNotesEditorProps) {
  const [mode, setMode] = useState<Mode>('view');
  const [draft, setDraft] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const inFlight = useRef(false);

  const current = notes ?? '';
  // Si la tarea se cierra mientras se editaba, la edición se descarta.
  const effectiveMode: Mode = editable ? mode : 'view';
  const isBlocked = disabled || isSaving;

  function startEditing() {
    setDraft(current);
    setErrorMessage(null);
    setMode('edit');
  }

  function cancelEditing() {
    setDraft(current);
    setErrorMessage(null);
    setMode('view');
  }

  async function save(text: string) {
    if (inFlight.current || disabled) return;
    inFlight.current = true;
    setIsSaving(true);
    setErrorMessage(null);
    try {
      await onSave(text);
      setMode('view');
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : 'No se pudieron guardar las observaciones.',
      );
      setMode('edit');
    } finally {
      inFlight.current = false;
      setIsSaving(false);
    }
  }

  function handleSave() {
    if (draft === current) {
      // Nada cambió: no hace falta llamar al servidor.
      setMode('view');
      return;
    }
    if (maxLength !== undefined && draft.length > maxLength) {
      setErrorMessage(`Las observaciones no pueden superar ${maxLength} caracteres.`);
      return;
    }
    if (draft.trim().length === 0) {
      setMode('confirmClear');
      return;
    }
    void save(draft);
  }

  return (
    <Card style={styles.card}>
      <Text style={styles.heading} accessibilityRole="header">
        Observaciones
      </Text>

      {effectiveMode === 'view' ? (
        <>
          <Text style={current ? styles.notes : styles.empty}>
            {current || 'Sin observaciones.'}
          </Text>
          {editable ? (
            <Button
              label="Editar observaciones"
              variant="secondary"
              onPress={startEditing}
              disabled={isBlocked}
            />
          ) : (
            <Text style={styles.hint}>{readOnlyHint}</Text>
          )}
        </>
      ) : null}

      {effectiveMode === 'edit' ? (
        <>
          <Input
            label="Editar observaciones"
            accessibilityLabel={inputAccessibilityLabel}
            value={draft}
            onChangeText={setDraft}
            maxLength={maxLength}
            multiline
            editable={!isSaving}
          />
          <Text style={styles.hint}>
            {maxLength !== undefined ? `${draft.length}/${maxLength} caracteres. ` : ''}
            Reemplaza el texto anterior.
          </Text>
          <View style={styles.actions}>
            <Button
              label="Cancelar edición"
              variant="secondary"
              onPress={cancelEditing}
              disabled={isSaving}
            />
            <Button label="Guardar" onPress={handleSave} loading={isSaving} disabled={disabled} />
          </View>
        </>
      ) : null}

      {effectiveMode === 'confirmClear' ? (
        <View style={styles.confirm}>
          <Text style={styles.notes} accessibilityRole="alert">
            {clearConfirmMessage}
          </Text>
          <View style={styles.actions}>
            <Button
              label="Volver a editar"
              variant="secondary"
              onPress={() => setMode('edit')}
              disabled={isSaving}
            />
            <Button
              label="Eliminar observaciones"
              variant="danger"
              onPress={() => void save(draft)}
              loading={isSaving}
              disabled={disabled}
            />
          </View>
        </View>
      ) : null}

      {errorMessage ? (
        <Text style={styles.error} accessibilityRole="alert" accessibilityLiveRegion="polite">
          {errorMessage}
        </Text>
      ) : null}
    </Card>
  );
}

const styles = StyleSheet.create({
  card: {
    gap: spacing.sm,
  },
  heading: {
    ...typography.bodyLarge,
    color: colors.text.primary,
  },
  notes: {
    ...typography.body,
    color: colors.text.primary,
  },
  empty: {
    ...typography.body,
    color: colors.text.muted,
  },
  hint: {
    ...typography.caption,
    color: colors.text.muted,
  },
  actions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  confirm: {
    gap: spacing.sm,
  },
  error: {
    ...typography.bodySmall,
    color: colors.state.danger,
  },
});
