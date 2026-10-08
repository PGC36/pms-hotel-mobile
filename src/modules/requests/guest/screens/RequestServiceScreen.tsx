import { useNavigation, useRoute, type RouteProp } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import React, { useState } from 'react';
import { ScrollView, StyleSheet, Text } from 'react-native';

import { Button } from '@/shared/components/Button';
import { ErrorState } from '@/shared/components/ErrorState';
import { Input } from '@/shared/components/Input';
import { colors, spacing, typography } from '@/shared/theme';
import type { GuestServicesStackParamList } from '@/navigation/routes';

import { createGuestRequest } from '../services/guest-request.service';

type Navigation = NativeStackNavigationProp<GuestServicesStackParamList, 'CreateRequest'>;

export function RequestServiceScreen() {
  const navigation = useNavigation<Navigation>();
  const { params } = useRoute<RouteProp<GuestServicesStackParamList, 'CreateRequest'>>();
  const [description, setDescription] = useState('');
  const [notes, setNotes] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const isConcierge = params.type === 'concierge';
  const submit = async () => {
    if (!description.trim()) {
      setError('Describe lo que necesitas.');
      return;
    }
    setSaving(true);
    setError(null);
    try {
      await createGuestRequest(params.type, description, notes);
      navigation.replace('RequestList');
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'No se pudo enviar la solicitud.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.title}>
        {isConcierge ? 'Solicitar conserjería' : 'Solicitar limpieza o artículos'}
      </Text>
      <Text style={styles.subtitle}>La solicitud se enviará al equipo del hotel.</Text>
      <Input
        label="¿Qué necesitas?"
        value={description}
        onChangeText={setDescription}
        multiline
        numberOfLines={4}
        maxLength={500}
        placeholder={
          isConcierge
            ? 'Describe el tour, transporte o ayuda que necesitas'
            : 'Ej. limpieza de habitación o dos toallas adicionales'
        }
        textAlignVertical="top"
      />
      {isConcierge ? (
        <Input
          label="Nota adicional (opcional)"
          value={notes}
          onChangeText={setNotes}
          multiline
          numberOfLines={3}
          maxLength={500}
          placeholder="Horario u otra información"
          textAlignVertical="top"
        />
      ) : null}
      {error ? (
        <ErrorState title="No se envió la solicitud" description={error} onRetry={submit} />
      ) : null}
      <Button
        label="Enviar solicitud"
        onPress={submit}
        loading={saving}
        disabled={!description.trim()}
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.sand[50] },
  content: { padding: spacing.md, gap: spacing.md },
  title: { ...typography.h2 },
  subtitle: { ...typography.body, color: colors.text.secondary },
});
