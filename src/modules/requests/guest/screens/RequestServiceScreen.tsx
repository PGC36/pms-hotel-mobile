import { useNavigation, useRoute, type RouteProp } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import React, { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { Button } from '@/shared/components/Button';
import { ErrorState } from '@/shared/components/ErrorState';
import { Input } from '@/shared/components/Input';
import { colors, radius, spacing, typography } from '@/shared/theme';
import type { GuestServicesStackParamList } from '@/navigation/routes';

import { createGuestRequest, getGuestConciergeServices, type ConciergeServiceOption } from '../services/guest-request.service';

type Navigation = NativeStackNavigationProp<GuestServicesStackParamList, 'CreateRequest'>;

export function RequestServiceScreen() {
  const navigation = useNavigation<Navigation>();
  const { params } = useRoute<RouteProp<GuestServicesStackParamList, 'CreateRequest'>>();
  const [description, setDescription] = useState('');
  const [notes, setNotes] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [services, setServices] = useState<ConciergeServiceOption[]>([]);
  const [loadingServices, setLoadingServices] = useState(false);
  const [selectedServiceId, setSelectedServiceId] = useState('');
  const [serviceLoadError, setServiceLoadError] = useState<string | null>(null);

  const isConcierge = params.type === 'concierge';
  const loadServices = useCallback(async () => {
    setLoadingServices(true);
    setServiceLoadError(null);
    try {
      const items = await getGuestConciergeServices();
      setServices(items);
      setSelectedServiceId(items[0]?.id ?? '');
    } catch (cause) {
      setServiceLoadError(cause instanceof Error ? cause.message : 'No se pudieron cargar los servicios.');
    } finally {
      setLoadingServices(false);
    }
  }, []);
  useEffect(() => {
    if (isConcierge) void Promise.resolve().then(loadServices);
  }, [isConcierge, loadServices]);
  const selectedService = services.find((service) => service.id === selectedServiceId);
  const submit = async () => {
    if (isConcierge && !selectedService) {
      setError('Selecciona un servicio disponible.');
      return;
    }
    if (!isConcierge && !description.trim()) {
      setError('Describe lo que necesitas.');
      return;
    }
    setSaving(true);
    setError(null);
    try {
      await createGuestRequest(params.type, isConcierge ? selectedService!.name : description, notes, selectedService?.id);
      navigation.replace('RequestList');
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'No se pudo enviar la solicitud.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.title}>{isConcierge ? 'Solicitar conserjería' : 'Solicitar limpieza o artículos'}</Text>
      <Text style={styles.subtitle}>La solicitud se enviará al equipo del hotel.</Text>
      {isConcierge ? (
        <View style={styles.options}>
          <Text style={styles.label}>Servicio</Text>
          {loadingServices ? <ActivityIndicator color={colors.brand[600]} /> : null}
          {!loadingServices && services.length === 0 ? <Text style={styles.subtitle}>No hay servicios disponibles por el momento.</Text> : null}
          {services.map((service) => (
            <Pressable
              accessibilityRole="radio"
              accessibilityState={{ selected: selectedServiceId === service.id }}
              key={service.id}
              onPress={() => setSelectedServiceId(service.id)}
              style={[styles.option, selectedServiceId === service.id && styles.optionSelected]}
            >
              <View style={styles.optionCopy}>
                <Text style={styles.optionTitle}>{service.name}</Text>
                {service.description ? <Text style={styles.subtitle}>{service.description}</Text> : null}
              </View>
              <View style={[styles.radio, selectedServiceId === service.id && styles.radioSelected]} />
            </Pressable>
          ))}
        </View>
      ) : (
        <Input
          label="¿Qué necesitas?"
          value={description}
          onChangeText={setDescription}
          multiline
          numberOfLines={4}
          maxLength={500}
          placeholder="Ej. limpieza de habitación o dos toallas adicionales"
          textAlignVertical="top"
        />
      )}
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
      {error ? <ErrorState title="No se envió la solicitud" description={error} onRetry={submit} /> : null}
      {serviceLoadError ? <ErrorState title="No se pudieron cargar los servicios" description={serviceLoadError} onRetry={loadServices} /> : null}
      <Button label="Enviar solicitud" onPress={submit} loading={saving} disabled={isConcierge ? !selectedService || loadingServices : !description.trim()} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.sand[50] },
  content: { padding: spacing.md, gap: spacing.md },
  title: { ...typography.h2 },
  subtitle: { ...typography.body, color: colors.text.secondary },
  options: { gap: spacing.sm },
  label: { ...typography.caption, color: colors.text.secondary },
  option: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, padding: spacing.md, borderWidth: 1, borderColor: colors.sand[300], borderRadius: radius.sm, backgroundColor: colors.white },
  optionSelected: { borderColor: colors.brand[600] },
  optionCopy: { flex: 1, gap: spacing.xs },
  optionTitle: { ...typography.body, color: colors.text.primary, fontWeight: '600' },
  radio: { width: 20, height: 20, borderRadius: 10, borderWidth: 1, borderColor: colors.sand[300] },
  radioSelected: { borderWidth: 6, borderColor: colors.brand[600] },
});
