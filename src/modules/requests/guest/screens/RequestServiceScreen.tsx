import { useNavigation, useRoute, type RouteProp } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import React, { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { Button } from '@/shared/components/Button';
import { ErrorState } from '@/shared/components/ErrorState';
import { Input } from '@/shared/components/Input';
import { colors, radius, spacing, typography } from '@/shared/theme';
import type { GuestServicesStackParamList } from '@/navigation/routes';

import {
  createGuestHousekeepingItemRequest,
  createGuestRequest,
  getGuestConciergeServices,
  getGuestHousekeepingServices,
  getGuestHousekeepingItems,
  type ConciergeServiceOption,
  type HousekeepingServiceOption,
  type HousekeepingItemOption,
} from '../services/guest-request.service';

type Navigation = NativeStackNavigationProp<GuestServicesStackParamList, 'CreateRequest'>;
const preferredTimes = ['Lo antes posible', 'Por la mañana', 'Por la tarde', 'Esta noche'] as const;

export function RequestServiceScreen() {
  const navigation = useNavigation<Navigation>();
  const { params } = useRoute<RouteProp<GuestServicesStackParamList, 'CreateRequest'>>();
  const [notes, setNotes] = useState('');
  const [preferredTime, setPreferredTime] = useState<(typeof preferredTimes)[number]>(preferredTimes[0]);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [services, setServices] = useState<ConciergeServiceOption[]>([]);
  const [loadingServices, setLoadingServices] = useState(false);
  const [selectedServiceId, setSelectedServiceId] = useState('');
  const [serviceLoadError, setServiceLoadError] = useState<string | null>(null);
  const [housekeepingServices, setHousekeepingServices] = useState<HousekeepingServiceOption[]>([]);
  const [loadingHousekeepingServices, setLoadingHousekeepingServices] = useState(false);
  const [selectedHousekeepingServiceId, setSelectedHousekeepingServiceId] = useState('');
  const [housekeepingServiceLoadError, setHousekeepingServiceLoadError] = useState<string | null>(null);
  const [housekeepingMode, setHousekeepingMode] = useState<'cleaning' | 'items'>('cleaning');
  const [items, setItems] = useState<HousekeepingItemOption[]>([]);
  const [loadingItems, setLoadingItems] = useState(false);
  const [selectedItemId, setSelectedItemId] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [itemsLoadError, setItemsLoadError] = useState<string | null>(null);

  const isConcierge = params.type === 'concierge';
  const loadServices = useCallback(async () => {
    setLoadingServices(true);
    setServiceLoadError(null);
    try {
      const availableServices = await getGuestConciergeServices();
      setServices(availableServices);
      setSelectedServiceId(availableServices[0]?.id ?? '');
    } catch (cause) {
      setServiceLoadError(cause instanceof Error ? cause.message : 'No se pudieron cargar los servicios.');
    } finally {
      setLoadingServices(false);
    }
  }, []);
  const loadItems = useCallback(async () => {
    setLoadingItems(true);
    setItemsLoadError(null);
    try {
      const availableItems = await getGuestHousekeepingItems();
      setItems(availableItems);
      const firstAvailable = availableItems.find((item) => item.currentQuantity > 0);
      setSelectedItemId(firstAvailable?.id ?? '');
      setQuantity(1);
    } catch (cause) {
      setItemsLoadError(cause instanceof Error ? cause.message : 'No se pudieron cargar los artículos.');
    } finally {
      setLoadingItems(false);
    }
  }, []);
  const loadHousekeepingServices = useCallback(async () => {
    setLoadingHousekeepingServices(true);
    setHousekeepingServiceLoadError(null);
    try {
      const options = await getGuestHousekeepingServices();
      setHousekeepingServices(options);
      setSelectedHousekeepingServiceId((current) => options.some((option) => option.id === current)
        ? current
        : options[0]?.id ?? '');
    } catch (cause) {
      setHousekeepingServiceLoadError(cause instanceof Error ? cause.message : 'No se pudieron cargar las opciones.');
    } finally {
      setLoadingHousekeepingServices(false);
    }
  }, []);

  useEffect(() => {
    if (isConcierge) void Promise.resolve().then(loadServices);
  }, [isConcierge, loadServices]);
  useEffect(() => {
    if (!isConcierge && housekeepingMode === 'cleaning') void Promise.resolve().then(loadHousekeepingServices);
  }, [isConcierge, housekeepingMode, loadHousekeepingServices]);
  useEffect(() => {
    if (!isConcierge && housekeepingMode === 'items') void Promise.resolve().then(loadItems);
  }, [isConcierge, housekeepingMode, loadItems]);

  const selectedService = services.find((service) => service.id === selectedServiceId);
  const selectedHousekeepingService = housekeepingServices.find((service) => service.id === selectedHousekeepingServiceId);
  const selectedItem = items.find((item) => item.id === selectedItemId);
  const maxQuantity = selectedItem ? 5 : 0;

  const submit = async () => {
    if (isConcierge && !selectedService) {
      setError('Selecciona un servicio disponible.');
      return;
    }
    if (!isConcierge && housekeepingMode === 'items' && !selectedItem) {
      setError('Selecciona un artículo disponible.');
      return;
    }
    if (!isConcierge && housekeepingMode === 'cleaning' && !selectedHousekeepingService) {
      setError('Selecciona una opción de limpieza disponible.');
      return;
    }

    setSaving(true);
    setError(null);
    try {
      if (!isConcierge && housekeepingMode === 'items') {
        await createGuestHousekeepingItemRequest(selectedItem!.id, quantity, notes);
      } else {
        const requestDescription = isConcierge ? selectedService!.name : selectedHousekeepingService!.name;
        const requestNotes = !isConcierge && housekeepingMode === 'cleaning'
          ? [preferredTime, notes.trim()].filter(Boolean).join(' · ')
          : notes;
        await createGuestRequest(params.type, requestDescription, requestNotes,
          isConcierge ? selectedService?.id : selectedHousekeepingService?.id);
      }
      navigation.replace('RequestList');
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'No se pudo enviar la solicitud.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.title}>{isConcierge ? 'Solicitar conserjería' : 'Limpieza y artículos'}</Text>
      <Text style={styles.subtitle}>La solicitud se enviará al equipo del hotel.</Text>

      {!isConcierge ? (
        <View style={styles.segmented} accessibilityRole="tablist">
          <Pressable
            accessibilityRole="tab"
            accessibilityState={{ selected: housekeepingMode === 'cleaning' }}
            onPress={() => { setHousekeepingMode('cleaning'); setError(null); }}
            style={[styles.segment, housekeepingMode === 'cleaning' && styles.segmentSelected]}
          >
            <Text style={[styles.segmentText, housekeepingMode === 'cleaning' && styles.segmentTextSelected]}>
              Solicitar limpieza
            </Text>
          </Pressable>
          <Pressable
            accessibilityRole="tab"
            accessibilityState={{ selected: housekeepingMode === 'items' }}
            onPress={() => { setHousekeepingMode('items'); setError(null); }}
            style={[styles.segment, housekeepingMode === 'items' && styles.segmentSelected]}
          >
            <Text style={[styles.segmentText, housekeepingMode === 'items' && styles.segmentTextSelected]}>
              Pedir artículos
            </Text>
          </Pressable>
        </View>
      ) : null}

      {isConcierge ? (
        <View style={styles.options}>
          <Text style={styles.label}>Servicio</Text>
          {loadingServices ? <ActivityIndicator color={colors.brand[600]} /> : null}
          {!loadingServices && services.length === 0 && !serviceLoadError ? (
            <Text style={styles.subtitle}>No hay servicios disponibles por el momento.</Text>
          ) : null}
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
        </View>
      ) : housekeepingMode === 'cleaning' ? (
        <View style={styles.options}>
          <Text style={styles.label}>Tipo de limpieza</Text>
          {loadingHousekeepingServices ? <ActivityIndicator color={colors.brand[600]} /> : null}
          {!loadingHousekeepingServices && housekeepingServices.length === 0 && !housekeepingServiceLoadError ? (
            <Text style={styles.subtitle}>No hay opciones de limpieza disponibles por el momento.</Text>
          ) : null}
          {housekeepingServices.map((service) => (
            <Pressable
              accessibilityRole="radio"
              accessibilityState={{ selected: selectedHousekeepingServiceId === service.id }}
              key={service.id}
              onPress={() => setSelectedHousekeepingServiceId(service.id)}
              style={[styles.option, selectedHousekeepingServiceId === service.id && styles.optionSelected]}
            >
              <View style={styles.optionCopy}>
                <Text style={styles.optionTitle}>{service.name}</Text>
                {service.description ? <Text style={styles.subtitle}>{service.description}</Text> : null}
              </View>
              <View style={[styles.radio, selectedHousekeepingServiceId === service.id && styles.radioSelected]} />
            </Pressable>
          ))}
          <Text style={styles.label}>Momento preferido</Text>
          <View style={styles.timeOptions} accessibilityRole="radiogroup">
            {preferredTimes.map((time) => (
              <Pressable
                accessibilityRole="radio"
                accessibilityState={{ selected: preferredTime === time }}
                key={time}
                onPress={() => setPreferredTime(time)}
                style={[styles.timeOption, preferredTime === time && styles.timeOptionSelected]}
              >
                <Text style={[styles.timeOptionText, preferredTime === time && styles.timeOptionTextSelected]}>
                  {time}
                </Text>
              </Pressable>
            ))}
          </View>
          <Input
            label="Detalles adicionales (opcional)"
            value={notes}
            onChangeText={setNotes}
            multiline
            numberOfLines={3}
            maxLength={500}
            placeholder="Horario o indicaciones para el personal"
            textAlignVertical="top"
          />
        </View>
      ) : (
        <View style={styles.options}>
          <Text style={styles.label}>Artículos disponibles</Text>
          {loadingItems ? <ActivityIndicator color={colors.brand[600]} /> : null}
          {!loadingItems && items.length === 0 && !itemsLoadError ? (
            <Text style={styles.subtitle}>No hay artículos disponibles por el momento.</Text>
          ) : null}
          {items.map((item) => {
            const available = item.currentQuantity > 0;
            const selected = selectedItemId === item.id;
            return (
              <Pressable
                accessibilityRole="radio"
                accessibilityState={{ selected, disabled: !available }}
                disabled={!available}
                key={item.id}
                onPress={() => { setSelectedItemId(item.id); setQuantity(1); setError(null); }}
                style={[styles.option, selected && styles.optionSelected, !available && styles.optionUnavailable]}
              >
                <View style={styles.optionCopy}>
                  <Text style={styles.optionTitle}>{item.name}</Text>
                  {item.description ? <Text style={styles.subtitle}>{item.description}</Text> : null}
                  <Text style={styles.stockText}>{available ? 'Disponible' : 'No disponible'}</Text>
                </View>
                <View style={[styles.radio, selected && styles.radioSelected]} />
              </Pressable>
            );
          })}
          {selectedItem ? (
            <View style={styles.quantityRow}>
              <Text style={styles.label}>Cantidad</Text>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Reducir cantidad"
                disabled={quantity <= 1}
                onPress={() => setQuantity((value) => Math.max(1, value - 1))}
                style={[styles.quantityButton, quantity <= 1 && styles.quantityButtonDisabled]}
              ><Text style={styles.quantityButtonText}>−</Text></Pressable>
              <Text style={styles.quantityValue}>{quantity}</Text>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Aumentar cantidad"
                disabled={quantity >= maxQuantity}
                onPress={() => setQuantity((value) => Math.min(maxQuantity, value + 1))}
                style={[styles.quantityButton, quantity >= maxQuantity && styles.quantityButtonDisabled]}
              ><Text style={styles.quantityButtonText}>+</Text></Pressable>
              <Text style={styles.stockText}>Máximo 5 por solicitud</Text>
            </View>
          ) : null}
          <Input
            label="Nota adicional (opcional)"
            value={notes}
            onChangeText={setNotes}
            multiline
            numberOfLines={3}
            maxLength={300}
            placeholder="Por ejemplo, déjalo en la puerta"
            textAlignVertical="top"
          />
        </View>
      )}

      {error ? <ErrorState title="No se envió la solicitud" description={error} onRetry={submit} /> : null}
      {serviceLoadError ? (
        <ErrorState title="No se pudieron cargar los servicios" description={serviceLoadError} onRetry={loadServices} />
      ) : null}
      {housekeepingServiceLoadError ? (
        <ErrorState title="No se pudieron cargar las opciones de limpieza" description={housekeepingServiceLoadError} onRetry={loadHousekeepingServices} />
      ) : null}
      {itemsLoadError ? (
        <ErrorState title="No se pudieron cargar los artículos" description={itemsLoadError} onRetry={loadItems} />
      ) : null}
      <Button
        label="Enviar solicitud"
        onPress={submit}
        loading={saving}
        disabled={isConcierge
          ? !selectedService || loadingServices
          : housekeepingMode === 'items'
            ? !selectedItem || loadingItems
            : !selectedHousekeepingService || loadingHousekeepingServices}
      />
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
  segmented: { flexDirection: 'row', padding: 4, gap: 4, backgroundColor: colors.sand[100], borderRadius: radius.sm },
  timeOptions: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.xs },
  timeOption: { minHeight: 40, justifyContent: 'center', paddingHorizontal: spacing.sm, borderRadius: radius.sm, borderWidth: 1, borderColor: colors.sand[300], backgroundColor: colors.white },
  timeOptionSelected: { borderColor: colors.brand[600], backgroundColor: colors.sand[100] },
  timeOptionText: { ...typography.caption, color: colors.text.secondary },
  timeOptionTextSelected: { color: colors.text.primary, fontWeight: '700' },
  segment: { flex: 1, minHeight: 44, alignItems: 'center', justifyContent: 'center', paddingHorizontal: spacing.xs, borderRadius: radius.sm },
  segmentSelected: { backgroundColor: colors.white },
  segmentText: { ...typography.caption, color: colors.text.secondary, textAlign: 'center' },
  segmentTextSelected: { color: colors.text.primary, fontWeight: '700' },
  option: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, padding: spacing.md, borderWidth: 1, borderColor: colors.sand[300], borderRadius: radius.sm, backgroundColor: colors.white },
  optionSelected: { borderColor: colors.brand[600] },
  optionUnavailable: { opacity: 0.55 },
  optionCopy: { flex: 1, gap: spacing.xs },
  optionTitle: { ...typography.body, color: colors.text.primary, fontWeight: '600' },
  radio: { width: 20, height: 20, borderRadius: 10, borderWidth: 1, borderColor: colors.sand[300] },
  radioSelected: { borderWidth: 6, borderColor: colors.brand[600] },
  stockText: { ...typography.caption, color: colors.text.secondary },
  quantityRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, flexWrap: 'wrap' },
  quantityButton: { width: 44, height: 44, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: colors.sand[300], borderRadius: radius.sm, backgroundColor: colors.white },
  quantityButtonDisabled: { opacity: 0.45 },
  quantityButtonText: { ...typography.bodyLarge, color: colors.text.primary },
  quantityValue: { ...typography.bodyLarge, minWidth: 24, textAlign: 'center', color: colors.text.primary },
});
