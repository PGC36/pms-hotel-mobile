import type { TaskModel } from '@/modules/tasks/models/task.model';

import { getActiveOrders, getTerminalOrders, type OrderModel } from '../models/order.model';
import { getOrders } from './order.service';

/**
 * Pedidos adaptados a `TaskModel` para reutilizar la bandeja genérica de
 * `tasks` (architecture.md sección 3), igual que `housekeeping-task.service`
 * en MOV-09. Solo usa datos que entrega el backend: no hay prioridad,
 * responsable ni tiempos objetivo que mostrar.
 */

function formatUnits(count: number): string {
  return count === 1 ? '1 unidad' : `${count} unidades`;
}

function summarizeItems(order: OrderModel): string {
  if (order.items.length === 0) return 'Sin productos';
  return order.items.map((item) => `${item.quantity}× ${item.productName}`).join(' · ');
}

export function mapOrderToTask(order: OrderModel): TaskModel {
  return {
    id: order.id,
    entityType: 'order',
    title: order.guestName ?? 'Pedido de Room Service',
    description: summarizeItems(order),
    // Sin habitación, `TaskCard` muestra "Sin habitación asignada", que es lo que dice el backend.
    roomLabel: order.roomNumber ? `Habitación ${order.roomNumber}` : undefined,
    meta: formatUnits(order.itemsCount),
    notes: order.notes ?? undefined,
    status: order.status,
    // Momento en que el huésped hizo el pedido.
    createdAt: order.requestedAt,
    updatedAt: order.updatedAt,
  };
}

/**
 * Para el encabezado del detalle: igual que en la bandeja, pero sin el
 * resumen de productos, porque el detalle ya los lista uno por uno.
 */
export function mapOrderToDetailTask(order: OrderModel): TaskModel {
  return { ...mapOrderToTask(order), description: '' };
}

/** Una sola petición (el backend filtra solo por un estado a la vez), filtrado y adaptación. */
async function getOrderTasks(select: (orders: OrderModel[]) => OrderModel[]): Promise<TaskModel[]> {
  const orders = await getOrders();
  return select(orders).map(mapOrderToTask);
}

/** Bandeja: pedidos no terminales, en el orden del backend (más reciente primero). */
export function getActiveOrderTasks(): Promise<TaskModel[]> {
  return getOrderTasks(getActiveOrders);
}

/**
 * Historial del equipo: entregados, rechazados y cancelados, en el orden del
 * backend. El backend no registra quién atendió cada pedido, así que no es
 * un historial individual.
 */
export function getTerminalOrderTasks(): Promise<TaskModel[]> {
  return getOrderTasks(getTerminalOrders);
}
