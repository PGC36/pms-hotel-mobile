import { useNavigation, useRoute, type RouteProp } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import React, { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { Button } from '@/shared/components/Button';
import { Card } from '@/shared/components/Card';
import { colors, spacing, typography } from '@/shared/theme';
import { formatMoney } from '@/shared/utils/formatters';
import { useCart } from '@/modules/cart/context/CartContext';
import type { GuestRoomServiceStackParamList } from '@/navigation/routes';

type Route = RouteProp<GuestRoomServiceStackParamList, 'ProductDetail'>;
type Navigation = NativeStackNavigationProp<GuestRoomServiceStackParamList, 'ProductDetail'>;

export function ProductDetailScreen() {
  const { params } = useRoute<Route>();
  const navigation = useNavigation<Navigation>();
  const cart = useCart();
  const [quantity, setQuantity] = useState(1);
  const product = params.product;
  return (
    <View style={styles.container}>
      <Card style={styles.card}>
        <Text style={styles.category}>{product.category}</Text>
        <Text style={styles.title}>{product.name}</Text>
        {product.description ? <Text style={styles.description}>{product.description}</Text> : null}
        <Text style={styles.price}>{formatMoney(product.priceCents, product.currency)}</Text>
        <View style={styles.quantity}>
          <Button
            label="−"
            variant="secondary"
            onPress={() => setQuantity((current) => Math.max(1, current - 1))}
          />
          <Text style={styles.quantityText}>{quantity}</Text>
          <Button
            label="+"
            variant="secondary"
            onPress={() => setQuantity((current) => current + 1)}
          />
        </View>
        <Button
          label="Agregar al carrito"
          onPress={() => {
            cart.add(product, quantity);
            navigation.navigate('Cart');
          }}
        />
      </Card>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.sand[50], padding: spacing.md },
  card: { gap: spacing.md },
  category: { ...typography.caption, color: colors.text.muted },
  title: { ...typography.h2 },
  description: { ...typography.body, color: colors.text.secondary },
  price: { ...typography.h2, color: colors.brand[600] },
  quantity: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.md,
  },
  quantityText: { ...typography.bodyLarge, minWidth: 32, textAlign: 'center' },
});
