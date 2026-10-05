import { StyleSheet, Text, View } from 'react-native';

import { colors, spacing, typography } from '@/shared/theme';
import { formatMoney } from '@/shared/utils/formatters';

import type { OrderItem } from '../../models/order.model';

export interface OrderItemRowProps {
  item: OrderItem;
  currency: string;
}

/** Una línea del pedido. Precio unitario y subtotal tal como los calculó el backend. */
export function OrderItemRow({ item, currency }: OrderItemRowProps) {
  const unitPrice = formatMoney(item.unitPriceCents, currency);
  const lineTotal = formatMoney(item.lineTotalCents, currency);

  return (
    <View
      style={styles.row}
      accessible
      accessibilityLabel={`${item.productName}, cantidad ${item.quantity}, ${unitPrice} cada uno, subtotal ${lineTotal}`}
    >
      <View style={styles.info}>
        <Text style={styles.name}>{item.productName}</Text>
        <Text style={styles.detail}>
          {item.quantity} × {unitPrice}
        </Text>
      </View>
      <Text style={styles.total}>{lineTotal}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: spacing.sm,
    paddingVertical: spacing.xs,
  },
  info: {
    flex: 1,
    gap: spacing.xs,
  },
  name: {
    ...typography.body,
    color: colors.text.primary,
  },
  detail: {
    ...typography.caption,
    color: colors.text.secondary,
  },
  total: {
    ...typography.body,
    color: colors.text.primary,
  },
});
