import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import React, { useState } from 'react';
import { FlatList, StyleSheet, Text, TextInput, View } from 'react-native';

import { Button } from '@/shared/components/Button';
import { Card } from '@/shared/components/Card';
import { EmptyState } from '@/shared/components/EmptyState';
import { colors, spacing, typography } from '@/shared/theme';
import { formatMoney } from '@/shared/utils/formatters';
import type { GuestRoomServiceStackParamList } from '@/navigation/routes';
import { useCart } from '../context/CartContext';
import { createGuestOrder } from '@/modules/room-service/guest/services/guest-room-service.service';

type Navigation = NativeStackNavigationProp<GuestRoomServiceStackParamList, 'Cart'>;

export function CartScreen() {
  const navigation = useNavigation<Navigation>();
  const cart = useCart();
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const totalCents = cart.items.reduce(
    (sum, item) => sum + item.product.priceCents * item.quantity,
    0,
  );
  const currency = cart.items[0]?.product.currency ?? 'GTQ';

  const submit = async () => {
    setLoading(true);
    setError(null);
    try {
      await createGuestOrder(
        cart.items.map(({ product, quantity }) => ({ productId: product.id, quantity })),
        notes,
      );
      cart.clear();
      navigation.replace('Orders');
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'No se pudo enviar el pedido.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <FlatList
        data={cart.items}
        keyExtractor={(item) => item.product.id}
        contentContainerStyle={styles.list}
        ListEmptyComponent={
          <EmptyState
            title="Tu carrito está vacío"
            description="Agrega productos del menú para crear un pedido."
          />
        }
        renderItem={({ item }) => (
          <Card style={styles.item}>
            <View style={styles.itemInfo}>
              <Text style={styles.name}>{item.product.name}</Text>
              <Text style={styles.price}>
                {formatMoney(item.product.priceCents * item.quantity, item.product.currency)}
              </Text>
            </View>
            <View style={styles.quantity}>
              <Button
                label="−"
                variant="secondary"
                onPress={() => cart.setQuantity(item.product.id, item.quantity - 1)}
              />
              <Text style={styles.count}>{item.quantity}</Text>
              <Button
                label="+"
                variant="secondary"
                onPress={() => cart.setQuantity(item.product.id, item.quantity + 1)}
              />
            </View>
          </Card>
        )}
        ListFooterComponent={
          cart.items.length ? (
            <View style={styles.footer}>
              <Text style={styles.total}>Estimado: {formatMoney(totalCents, currency)}</Text>
              <TextInput
                value={notes}
                onChangeText={setNotes}
                maxLength={1000}
                multiline
                placeholder="Notas para el equipo (opcional)"
                placeholderTextColor={colors.text.muted}
                style={styles.notes}
              />
              {error ? <Text style={styles.error}>{error}</Text> : null}
              <Button label="Enviar pedido" onPress={submit} loading={loading} />
              <Text style={styles.disclaimer}>El total final lo confirma el backend.</Text>
            </View>
          ) : null
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.sand[50] },
  list: { padding: spacing.md, gap: spacing.sm, flexGrow: 1 },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.md,
  },
  itemInfo: { flex: 1, gap: spacing.xs },
  name: { ...typography.bodyLarge, fontWeight: '600' },
  price: { ...typography.body, color: colors.text.secondary },
  quantity: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  count: { ...typography.body, minWidth: 24, textAlign: 'center' },
  footer: { gap: spacing.md, paddingTop: spacing.md },
  total: { ...typography.h2, color: colors.brand[600] },
  notes: {
    ...typography.body,
    minHeight: 76,
    textAlignVertical: 'top',
    borderWidth: 1,
    borderColor: colors.sand[300],
    borderRadius: 6,
    backgroundColor: colors.white,
    padding: spacing.sm,
    color: colors.text.primary,
  },
  error: { ...typography.caption, color: colors.state.danger },
  disclaimer: { ...typography.caption, color: colors.text.muted },
});
