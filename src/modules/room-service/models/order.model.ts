import { ORDER_STATUS_TRANSITIONS, type OrderStatus } from '@/shared/constants/statuses';

export interface OrderItem {
  id: string;
  productId: string;
  productName: string;
  quantity: number;
  /** Centavos enteros, congelados al crear el pedido. */
  unitPriceCents: number;
  lineTotalCents: number;
}

export interface OrderModel {
  id: string;
  bookingId: string;
  roomId: string | null;
  roomNumber: string | null;
  guestId: string | null;
  guestName: string | null;
  status: OrderStatus;
  notes: string | null;
  currency: string;
  /** Centavos enteros, calculados por el backend. Se formatean solo al mostrarlos. */
  totalCents: number;
  items: OrderItem[];
  /** Calculado: suma de las cantidades de `items`. */
  itemsCount: number;
  /** Solo hay cargo al folio cuando el backend lo devuelve (al entregar). */
  chargeId: string | null;
  requestedAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Terminal = sin transiciones salientes en `ORDER_STATUS_TRANSITIONS`
 * (`delivered`, `rejected`, `cancelled`), la misma regla que
 * `isTerminalStatus` de `tasks`.
 */
export function isTerminalOrderStatus(status: OrderStatus): boolean {
  return ORDER_STATUS_TRANSITIONS[status].length === 0;
}

/** Pedidos que todavía requieren atención (bandeja), en el orden recibido. */
export function getActiveOrders(orders: OrderModel[]): OrderModel[] {
  return orders.filter((order) => !isTerminalOrderStatus(order.status));
}

/** Pedidos cerrados (historial), en el orden recibido. */
export function getTerminalOrders(orders: OrderModel[]): OrderModel[] {
  return orders.filter((order) => isTerminalOrderStatus(order.status));
}

/** Límite de `notes` en el backend (`@Size(max = 1000)`). */
export const ORDER_NOTES_MAX_LENGTH = 1000;

export const REJECTION_REASON_PREFIX = 'Motivo de rechazo:';

/**
 * El backend no tiene un campo de motivo de rechazo: lo guarda en `notes`,
 * que también contiene las observaciones del pedido. Para no perderlas, el
 * motivo se agrega como última línea. Si esa última línea ya es un motivo
 * (p. ej. un reintento), se reemplaza en vez de duplicarse.
 */
export function buildRejectionNotes(currentNotes: string | null, reason: string): string {
  const reasonLine = `${REJECTION_REASON_PREFIX} ${reason.trim()}`;
  const lines = (currentNotes ?? '').trim().split('\n');
  if (lines[lines.length - 1].startsWith(REJECTION_REASON_PREFIX)) lines.pop();
  const base = lines.join('\n').trim();
  return base ? `${base}\n${reasonLine}` : reasonLine;
}
