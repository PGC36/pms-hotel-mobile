/** Estado tal como viaja en el wire (snake_case); el mapper lo traduce a `OrderStatus`. */
export type OrderStatusDTO =
  | 'pending'
  | 'accepted'
  | 'preparing'
  | 'ready'
  | 'on_the_way'
  | 'delivered'
  | 'rejected'
  | 'cancelled';

/** Línea de un pedido (`RoomServiceOrderItemResponse`). Precio congelado al crear el pedido. */
export interface OrderItemDTO {
  id: string;
  productId: string;
  productName: string;
  quantity: number;
  unitPriceCents: number;
  /** `quantity × unitPriceCents`, calculado por el backend. */
  lineTotalCents: number;
}

/**
 * Forma cruda de un pedido de Room Service, tal como la devuelven
 * `GET /api/v1/room-service/orders`, `GET .../orders/{orderId}`,
 * `POST .../orders/{orderId}/status` y los endpoints del huésped
 * (`RoomServiceOrderResponse` del backend, en camelCase). Montos en
 * centavos enteros calculados por el backend; el móvil no los recalcula.
 */
export interface OrderDTO {
  id: string;
  bookingId: string;
  roomId: string | null;
  roomNumber: string | null;
  guestId: string | null;
  guestName: string | null;
  status: OrderStatusDTO;
  /** Observaciones del pedido; el backend también guarda aquí el motivo de rechazo o cancelación. */
  notes: string | null;
  currency: string;
  totalCents: number;
  items: OrderItemDTO[];
  /** Cargo registrado en el folio al entregar; `null` hasta entonces. */
  chargeId: string | null;
  requestedAt: string;
  createdAt: string;
  updatedAt: string;
}
