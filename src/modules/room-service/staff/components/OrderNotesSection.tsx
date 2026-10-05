import { useRef, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { Button, Card, Input } from '@/shared/components';
import { colors, spacing, typography } from '@/shared/theme';

import { ORDER_NOTES_MAX_LENGTH } from '../../models/order.model';

export interface OrderNotesSectionProps {
  /** Observaciones actuales según el backend. */
  notes: string | null;
  /** `false` en pedidos terminales: solo lectura. */
  editable: boolean;
  /** Bloquea la edición mientras hay otra operación sobre el pedido. */
  disabled?: boolean;
  /** Guarda exactamente el texto recibido; lanza si falla (con un mensaje apto para mostrar). */
  onSave: (notes: string) => Promise<void>;
}

type Mode = 'view' | 'edit' | 'confirmClear';

/**
 * Observaciones del pedido (HU-11). Son el mismo campo que escribió el
 * huésped y donde el backend guarda el motivo de rechazo, así que por
 * defecto se muestran en solo lectura: editarlas es una acción explícita y
 * dejarlas vacías pide confirmación, porque el backend las borra.
 */
export function OrderNotesSection({
  notes,
  editable,
  disabled = false,
  onSave,
}: OrderNotesSectionProps) {
  const [mode, setMode] = useState<Mode>('view');
  const [draft, setDraft] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const inFlight = useRef(false);

  const current = notes ?? '';
  // Si el pedido se cierra mientras se editaba, la edición se descarta.
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
    if (draft.length > ORDER_NOTES_MAX_LENGTH) {
      setErrorMessage(`Las observaciones no pueden superar ${ORDER_NOTES_MAX_LENGTH} caracteres.`);
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
            <Text style={styles.hint}>
              El pedido está cerrado: las observaciones son de solo lectura.
            </Text>
          )}
        </>
      ) : null}

      {effectiveMode === 'edit' ? (
        <>
          <Input
            label="Editar observaciones"
            accessibilityLabel="Observaciones del pedido"
            value={draft}
            onChangeText={setDraft}
            maxLength={ORDER_NOTES_MAX_LENGTH}
            multiline
            editable={!isSaving}
          />
          <Text style={styles.hint}>
            {draft.length}/{ORDER_NOTES_MAX_LENGTH} caracteres. Reemplaza el texto anterior.
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
            ¿Eliminar las observaciones? El pedido quedará sin observaciones.
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
