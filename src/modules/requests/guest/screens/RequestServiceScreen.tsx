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
  getGuestHousekeepingItems,
  type ConciergeServiceOption,
  type HousekeepingItemOption,
} from '../services/guest-request.service';

type Navigation = NativeStackNavigationProp<GuestServicesStackParamList, 'CreateRequest'>;

export function RequestServiceScreen() {
  const navigation = useNavigation<Navigation>();
  const { params } = useRoute<RouteProp<GuestServicesStackParamList, 'CreateRequest'>>();
  const [notes, setNotes] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [services, setServices] = useState<ConciergeServiceOption[]>([]);
  const [loadingServices, setLoadingServices] = useState(false);
  const [selectedServiceId, setSelectedServiceId] = useState('');
  const [serviceLoadError, setServiceLoadError] = useState<string | null>(null);
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

  useEffect(() => {
    if (isConcierge) void Promise.resolve().then(loadServices);
  }, [isConcierge, loadServices]);
  useEffect(() => {
    if (!isConcierge && housekeepingMode === 'items') void Promise.resolve().then(loadItems);
  }, [isConcierge, housekeepingMode, loadItems]);

  const selectedService = services.find((service) => service.id === selectedServiceId);
  const selectedItem = items.find((item) => item.id === selectedItemId);
  const maxQuantity = selectedItem ? Math.min(5, selectedItem.currentQuantity) : 0;

  const submit = async () => {
    if (isConcierge && !selectedService) {
      setError('Selecciona un servicio disponible.');
      return;
    }
    if (!isConcierge && housekeepingMode === 'items' && !selectedItem) {
      setError('Selecciona un artículo disponible.');
      return;
    }

    setSaving(true);
    setError(null);
    try {
      if (!isConcierge && housekeepingMode === 'items') {
        await createGuestHousekeepingItemRequest(selectedItem!.id, quantity, notes);
      } else {
        const requestDescription = isConcierge ? selectedService!.name : 'Solicita limpieza para su habitación';
        await createGuestRequest(params.type, requestDescription, notes, selectedService?.id);
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
          <Text style={styles.optionTitle}>Limpieza de habitación</Text>
          <Text style={styles.subtitle}>El equipo de limpieza recibirá tu solicitud.</Text>
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
                  <Text style={styles.stockText}>
                    {available ? `${item.currentQuantity} disponibles · ${item.unit}` : 'No disponible'}
                  </Text>
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
            : false}
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
