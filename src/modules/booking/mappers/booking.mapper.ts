import { toDomainCalendarDate } from '@/shared/utils/date';
import type { BookingDTO } from '../dtos/booking.dto';
import type { BookingModel } from '../models/booking.model';

const MS_PER_NIGHT = 24 * 60 * 60 * 1000;

export function mapBookingDTOToModel(dto: BookingDTO): BookingModel {
  const checkIn = toDomainCalendarDate(dto.check_in);
  const checkOut = toDomainCalendarDate(dto.check_out);

  return {
    id: dto.id,
    confirmationCode: dto.confirmation_code,
    guestLinkCode: dto.guest_link_code,
    guestId: dto.guest_id,
    roomId: dto.room_id,
    roomTypeId: dto.room_type_id,
    rateId: dto.rate_id,
    checkIn,
    checkOut,
    status: dto.status,
    adults: dto.adults,
    children: dto.children,
    totalAmountCents: dto.total_amount_cents,
    currency: dto.currency,
    notes: dto.notes,
    nights: Math.round((checkOut.getTime() - checkIn.getTime()) / MS_PER_NIGHT),
    createdAt: new Date(dto.created_at),
    updatedAt: new Date(dto.updated_at),
  };
}
