import type { OrderDTO } from '../dtos/order.dto';
import type { OrderModel } from '../models/order.model';

export function mapOrderDTOToModel(dto: OrderDTO): OrderModel {
  const items = dto.items.map((item) => ({
    productId: item.product_id,
    quantity: item.quantity,
    unitPrice: item.unit_price,
  }));

  return {
    id: dto.id,
    roomId: dto.room_id,
    guestId: dto.guest_id,
    items,
    status: dto.status,
    rejectionReason: dto.rejection_reason,
    notes: dto.notes,
    subtotal: dto.subtotal,
    tax: dto.tax,
    total: dto.total,
    chargedToRoom: dto.charged_to_room,
    itemsCount: items.reduce((count, item) => count + item.quantity, 0),
    createdAt: new Date(dto.created_at),
    updatedAt: new Date(dto.updated_at),
    deliveredAt: dto.delivered_at ? new Date(dto.delivered_at) : null,
  };
}
