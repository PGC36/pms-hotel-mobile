import type { OrderStatus } from '@/shared/constants/statuses';
import type { Currency } from '@/shared/utils/formatters';

export interface OrderItemDTO {
  product_id: string;
  quantity: number;
  unit_price_cents: number;
}

/**
 * Forma cruda de un pedido de Room Service, tal como la expondría
 * `GET /orders/:id`. Contrato oficial: docs/HANDOFF-MOVIL.md sección 3.9.
 * `items[].unit_price_cents` es un snapshot del precio al momento del
 * pedido — nunca recalcular contra `product.price_cents` actual. Móvil
 * opera esta entidad de punta a punta (la crea y la transiciona).
 */
export interface OrderDTO {
  id: string;
  booking_id: string;
  room_id: string;
  guest_id?: string;
  items: OrderItemDTO[];
  status: OrderStatus;
  notes?: string;
  currency: Currency;
  /**
   * FK a `charge` (sección 5.3 del handoff). Nada en la web lo llena
   * todavía — no inventar el mecanismo desde móvil, ver
   * PROGRESO-CONTRATO.md. Se agrega el campo por completitud del
   * contrato; `charged_to_room` sigue siendo el mecanismo que móvil usa
   * hoy, sin cambios de comportamiento.
   */
  charge_id?: string;
  requested_at: string;
  created_at: string;
  updated_at: string;
  /**
   * Campos que el contrato no define para `order` (ver
   * PROGRESO-CONTRATO.md). Se conservan, no se borran sin coordinar.
   * `subtotal`/`tax`/`total` migran a `_cents` igual que el resto de la
   * app — son dinero, aunque el contrato no los liste, la regla de
   * "todo monto en centavos" es del proyecto completo (sección 2 del
   * handoff), no solo de los campos que el contrato define.
   */
  rejection_reason?: string;
  subtotal_cents: number;
  tax_cents: number;
  total_cents: number;
  charged_to_room: boolean;
  delivered_at?: string;
}
