import type { OrderStatus } from '@/shared/constants/statuses';

export interface OrderItemDTO {
  product_id: string;
  quantity: number;
  unit_price: number;
}

/**
 * Forma cruda de un pedido de Room Service, tal como la expondría
 * `GET /orders/:id`. `subtotal`/`tax`/`total` vienen calculados por el
 * backend, igual que en una API real — el móvil no debe recalcularlos.
 */
export interface OrderDTO {
  id: string;
  room_id: string;
  guest_id: string;
  items: OrderItemDTO[];
  status: OrderStatus;
  rejection_reason: string | null;
  notes: string | null;
  subtotal: number;
  tax: number;
  total: number;
  charged_to_room: boolean;
  created_at: string;
  updated_at: string;
  delivered_at: string | null;
}
