import { ordersDB } from '@/data/db';
import { ORDER_STATUS_TRANSITIONS, type OrderStatus } from '@/shared/constants/statuses';
import { delay } from '@/shared/services/delay';
import { assertValidTransition } from '@/modules/tasks/services/task-transition.service';

import { mapOrderDTOToModel } from '../mappers/order.mapper';
import type { OrderModel } from '../models/order.model';

export class OrderNotFoundError extends Error {
  constructor(id: string) {
    super(`Pedido ${id} no encontrado.`);
    this.name = 'OrderNotFoundError';
  }
}

export interface UpdateOrderStatusOptions {
  /** Obligatorio cuando `nextStatus` es `rejected` (HU-05: rechazar con motivo). */
  rejectionReason?: string;
}

export async function getOrders(): Promise<OrderModel[]> {
  await delay();
  return ordersDB.map(mapOrderDTOToModel);
}

export async function getOrderById(id: string): Promise<OrderModel | null> {
  await delay();
  const found = ordersDB.find((order) => order.id === id);
  return found ? mapOrderDTOToModel(found) : null;
}

/** Valida la transición contra `ORDER_STATUS_TRANSITIONS` antes de aplicarla. */
export async function updateOrderStatus(
  id: string,
  nextStatus: OrderStatus,
  options: UpdateOrderStatusOptions = {},
): Promise<OrderModel> {
  await delay();

  const order = ordersDB.find((o) => o.id === id);
  if (!order) throw new OrderNotFoundError(id);

  assertValidTransition(ORDER_STATUS_TRANSITIONS, order.status, nextStatus, 'Order');

  if (nextStatus === 'rejected' && !options.rejectionReason) {
    throw new Error('Se requiere un motivo para rechazar el pedido.');
  }

  const now = new Date().toISOString();
  order.status = nextStatus;
  order.updated_at = now;
  if (options.rejectionReason) order.rejection_reason = options.rejectionReason;
  if (nextStatus === 'delivered') order.delivered_at = now;

  return mapOrderDTOToModel(order);
}

/** HU-12: cargar el costo del pedido a la cuenta de la habitación. */
export async function chargeOrderToRoom(id: string): Promise<OrderModel> {
  await delay();

  const order = ordersDB.find((o) => o.id === id);
  if (!order) throw new OrderNotFoundError(id);

  order.charged_to_room = true;
  order.updated_at = new Date().toISOString();

  return mapOrderDTOToModel(order);
}
