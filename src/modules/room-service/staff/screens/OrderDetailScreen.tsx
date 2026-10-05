import { useCallback, useEffect, useReducer, useRef, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';

import type { TaskDetailScreenProps } from '@/modules/tasks/screens/TaskDetailScreen';
import { TaskDetailScreen } from '@/modules/tasks/screens/TaskDetailScreen';
import type { RoomServiceStackParamList } from '@/navigation/routes';
import { Button, Card, EmptyState, ErrorState, LoadingState } from '@/shared/components';
import type { OrderStatus } from '@/shared/constants/statuses';
import { colors, spacing, typography } from '@/shared/theme';
import { formatDateTime } from '@/shared/utils/date';
import { formatMoney } from '@/shared/utils/formatters';

import { isTerminalOrderStatus, type OrderModel } from '../../models/order.model';
import { mapOrderToDetailTask } from '../../services/order-task.service';
import { getOrderById, updateOrderNotes, updateOrderStatus } from '../../services/order.service';
import { RoomServiceServiceError } from '../../services/room-service-error';
import { OrderItemRow } from '../components/OrderItemRow';
import { OrderNotesSection } from '../components/OrderNotesSection';
import { getOrderActionLabel } from '../order-actions';

type Props = NativeStackScreenProps<RoomServiceStackParamList, 'OrderDetail'>;

type State =
  | { status: 'loading' }
  | { status: 'error'; message: string }
  | { status: 'notFound' }
  | {
      status: 'ready';
      order: OrderModel;
      /** Cambia solo al recargar, para que `TaskDetailScreen` arranque del pedido fresco. */
      version: number;
      /** Una acción falló porque el pedido cambió en el servidor: hay que recargar. */
      isStale: boolean;
    };

type Action =
  | { type: 'FETCH_START' }
  | { type: 'FETCH_DONE'; order: OrderModel | null }
  | { type: 'FETCH_ERROR'; message: string }
  | { type: 'ORDER_UPDATED'; order: OrderModel }
  | { type: 'MARK_STALE' };

/** `dispatch` (no setters de `useState`) para no disparar `react-hooks/set-state-in-effect`. */
function reducer(state: State, action: Action): State {
  switch (action.type) {
    case 'FETCH_START':
      return { status: 'loading' };
    case 'FETCH_DONE':
      if (!action.order) return { status: 'notFound' };
      return {
        status: 'ready',
        order: action.order,
        version: state.status === 'ready' ? state.version + 1 : 0,
        isStale: false,
      };
    case 'FETCH_ERROR':
      return { status: 'error', message: action.message };
    case 'ORDER_UPDATED':
      return state.status === 'ready' ? { ...state, order: action.order } : state;
    case 'MARK_STALE':
      return state.status === 'ready' ? { ...state, isStale: true } : state;
  }
}

function getErrorMessage(error: unknown): string {
  return error instanceof RoomServiceServiceError
    ? error.message
    : 'Ocurrió un error inesperado. Intenta de nuevo.';
}

/** El pedido cambió en el servidor (o ya no existe): conviene recargar antes de seguir. */
function isStaleError(error: unknown): boolean {
  return (
    error instanceof RoomServiceServiceError &&
    (error.kind === 'invalidTransition' || error.kind === 'notFound')
  );
}

/**
 * Detalle del pedido para el personal (MOV-10). Recibe solo `orderId` y pide
 * el pedido fresco; las transiciones las delega en `TaskDetailScreen` y el
 * contenido propio (productos, total, cargo, observaciones) va como hijo.
 * Todo cambio de estado lo hace el backend: esta pantalla solo muestra el
 * pedido que devuelve cada operación.
 */
export function OrderDetailScreen({ route }: Props) {
  const { orderId } = route.params;
  const [state, dispatch] = useReducer(reducer, { status: 'loading' });
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [isSavingNotes, setIsSavingNotes] = useState(false);
  // Pedido vigente para las acciones, sin esperar al siguiente render.
  const orderRef = useRef<OrderModel | null>(null);

  const load = useCallback(async () => {
    try {
      const order = await getOrderById(orderId);
      orderRef.current = order;
      dispatch({ type: 'FETCH_DONE', order });
    } catch (error) {
      dispatch({ type: 'FETCH_ERROR', message: getErrorMessage(error) });
    }
  }, [orderId]);

  useEffect(() => {
    load();
  }, [load]);

  const reload = useCallback(() => {
    dispatch({ type: 'FETCH_START' });
    load();
  }, [load]);

  const applyUpdate = useCallback((order: OrderModel) => {
    orderRef.current = order;
    dispatch({ type: 'ORDER_UPDATED', order });
  }, []);

  const handleUpdateStatus = useCallback<TaskDetailScreenProps['onUpdateStatus']>(
    async (nextStatus, options) => {
      const order = orderRef.current;
      if (!order) throw new RoomServiceServiceError('notFound');
      setIsTransitioning(true);
      try {
        // Las observaciones no viajan con la transición: se editan aparte (PATCH).
        const updated = await updateOrderStatus(order, nextStatus as OrderStatus, {
          rejectionReason: options?.rejectionReason,
        });
        applyUpdate(updated);
        return mapOrderToDetailTask(updated);
      } catch (error) {
        if (isStaleError(error)) dispatch({ type: 'MARK_STALE' });
        throw error;
      } finally {
        setIsTransitioning(false);
      }
    },
    [applyUpdate],
  );

  const handleSaveNotes = useCallback(
    async (notes: string) => {
      const order = orderRef.current;
      if (!order) throw new RoomServiceServiceError('notFound');
      setIsSavingNotes(true);
      try {
        applyUpdate(await updateOrderNotes(order, notes));
      } catch (error) {
        if (isStaleError(error)) dispatch({ type: 'MARK_STALE' });
        throw error;
      } finally {
        setIsSavingNotes(false);
      }
    },
    [applyUpdate],
  );

  if (state.status === 'loading') return <LoadingState message="Cargando pedido..." />;
  if (state.status === 'notFound') {
    return (
      <EmptyState
        icon="🔎"
        title="El pedido no existe"
        description="Pudo haber sido eliminado. Vuelve a la bandeja."
      />
    );
  }
  if (state.status === 'error') {
    return (
      <ErrorState
        title="No se pudo cargar el pedido"
        description={state.message}
        onRetry={reload}
      />
    );
  }

  const { order, version, isStale } = state;

  return (
    <TaskDetailScreen
      key={`${order.id}-${version}`}
      task={mapOrderToDetailTask(order)}
      onUpdateStatus={handleUpdateStatus}
      getActionLabel={getOrderActionLabel}
      showNotesField={false}
      optimistic={false}
      disabled={isSavingNotes || isStale}
    >
      <Card style={styles.card}>
        <InfoRow label="Habitación" value={order.roomNumber ?? 'No disponible'} />
        <InfoRow label="Huésped" value={order.guestName ?? 'No disponible'} />
        <InfoRow label="Solicitado" value={formatDateTime(order.requestedAt)} />
      </Card>

      <Card style={styles.card}>
        <Text style={styles.heading} accessibilityRole="header">
          Productos
        </Text>
        {order.items.length === 0 ? (
          <Text style={styles.muted}>El pedido no tiene productos.</Text>
        ) : (
          order.items.map((item) => (
            <OrderItemRow key={item.id} item={item} currency={order.currency} />
          ))
        )}
        <View
          style={styles.totalRow}
          accessible
          accessibilityLabel={`Total ${formatMoney(order.totalCents, order.currency)}`}
        >
          <Text style={styles.totalLabel}>Total</Text>
          <Text style={styles.totalValue}>{formatMoney(order.totalCents, order.currency)}</Text>
        </View>
      </Card>

      <ChargeNotice order={order} />

      <OrderNotesSection
        notes={order.notes}
        editable={!isTerminalOrderStatus(order.status)}
        disabled={isTransitioning || isStale}
        onSave={handleSaveNotes}
      />

      {isStale ? (
        <Card style={styles.card}>
          <Text style={styles.body} accessibilityRole="alert">
            El pedido cambió en el servidor. Actualízalo antes de continuar.
          </Text>
          <Button label="Actualizar pedido" onPress={reload} />
        </Card>
      ) : null}
    </TaskDetailScreen>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.infoRow} accessible accessibilityLabel={`${label}: ${value}`}>
      <Text style={styles.muted}>{label}</Text>
      <Text style={styles.body}>{value}</Text>
    </View>
  );
}

/**
 * El cargo al folio lo hace el backend al entregar. Solo se afirma si la
 * respuesta trae `chargeId`; nunca se infiere del estado.
 */
function ChargeNotice({ order }: { order: OrderModel }) {
  if (order.status !== 'delivered') return null;
  if (order.chargeId) {
    return (
      <Card style={styles.card}>
        <Text style={styles.success} accessibilityRole="text">
          ✓ Cargo registrado en el folio
        </Text>
        <Text style={styles.muted}>Referencia: {order.chargeId}</Text>
      </Card>
    );
  }
  return (
    <Card style={styles.card}>
      <Text style={styles.muted}>
        El servidor no informó un cargo en el folio para este pedido.
      </Text>
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
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: spacing.sm,
  },
  body: {
    ...typography.body,
    color: colors.text.primary,
  },
  muted: {
    ...typography.bodySmall,
    color: colors.text.muted,
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderTopWidth: 1,
    borderTopColor: colors.sand[300],
    paddingTop: spacing.sm,
  },
  totalLabel: {
    ...typography.bodyLarge,
    color: colors.text.primary,
  },
  totalValue: {
    ...typography.bodyLarge,
    color: colors.text.primary,
  },
  success: {
    ...typography.body,
    color: colors.state.success,
  },
});
