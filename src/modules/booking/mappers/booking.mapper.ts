import type { BookingDTO } from '../dtos/booking.dto';
import type { BookingModel } from '../models/booking.model';

const MS_PER_NIGHT = 24 * 60 * 60 * 1000;

export function mapBookingDTOToModel(dto: BookingDTO): BookingModel {
  const checkInDate = new Date(dto.check_in_date);
  const checkOutDate = new Date(dto.check_out_date);

  return {
    id: dto.id,
    guestId: dto.guest_id,
    roomId: dto.room_id,
    checkInDate,
    checkOutDate,
    guestsCount: dto.guests_count,
    status: dto.status,
    linkingCode: dto.linking_code,
    totalPrice: dto.total_price,
    notes: dto.notes,
    nights: Math.round((checkOutDate.getTime() - checkInDate.getTime()) / MS_PER_NIGHT),
    createdAt: new Date(dto.created_at),
  };
}
