import type { OrderDTO } from '../dtos/order.dto';
import type { OrderModel } from '../models/order.model';

export function mapOrderDTOToModel(dto: OrderDTO): OrderModel {
  const items = dto.items.map((item) => ({
    productId: item.product_id,
    quantity: item.quantity,
    unitPriceCents: item.unit_price_cents,
  }));

  return {
    id: dto.id,
    bookingId: dto.booking_id,
    roomId: dto.room_id,
    guestId: dto.guest_id,
    items,
    status: dto.status,
    notes: dto.notes,
    currency: dto.currency,
    chargeId: dto.charge_id,
    requestedAt: new Date(dto.requested_at),
    createdAt: new Date(dto.created_at),
    updatedAt: new Date(dto.updated_at),
    rejectionReason: dto.rejection_reason,
    subtotalCents: dto.subtotal_cents,
    taxCents: dto.tax_cents,
    totalCents: dto.total_cents,
    chargedToRoom: dto.charged_to_room,
    itemsCount: items.reduce((count, item) => count + item.quantity, 0),
    deliveredAt: dto.delivered_at ? new Date(dto.delivered_at) : undefined,
  };
}
