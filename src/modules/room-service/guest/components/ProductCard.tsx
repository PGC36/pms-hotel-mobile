import React from 'react';
import { Pressable, StyleSheet, Text } from 'react-native';

import { Button } from '@/shared/components/Button';
import { Card } from '@/shared/components/Card';
import { colors, spacing, typography } from '@/shared/theme';
import { formatMoney } from '@/shared/utils/formatters';
import type { ProductModel } from '../../models/product.model';

export function ProductCard({ product, onOpen, onAdd }: { product: ProductModel; onOpen: () => void; onAdd: () => void }) {
  return (
    <Card style={styles.card}>
      <Pressable accessibilityRole="button" onPress={onOpen} style={styles.info}>
        <Text style={styles.name}>{product.name}</Text>
        {product.description ? <Text style={styles.description} numberOfLines={2}>{product.description}</Text> : null}
        <Text style={styles.price}>{formatMoney(product.priceCents, product.currency)}</Text>
      </Pressable>
      <Button label="Agregar" onPress={onAdd} />
    </Card>
  );
}

const styles = StyleSheet.create({
  card: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, marginHorizontal: spacing.md, marginBottom: spacing.sm },
  info: { flex: 1, gap: spacing.xs },
  name: { ...typography.bodyLarge, color: colors.text.primary, fontWeight: '600' },
  description: { ...typography.bodySmall, color: colors.text.secondary },
  price: { ...typography.body, color: colors.brand[600], fontWeight: '600' },
});
