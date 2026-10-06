import { formatMoney } from '@/shared/utils/formatters';

import type { GuestStayDTO } from '../dtos/stay.dto';
import type { GuestStayModel } from '../models/stay.model';

export function mapGuestStayDTOToModel(dto: GuestStayDTO): GuestStayModel {
  const fullName = `${dto.guestFirstName ?? ''} ${dto.guestLastName ?? ''}`.trim();

  return {
    bookingId: dto.bookingId,
    guestId: dto.guestId,
    guestFullName: fullName || 'Huésped',
    roomId: dto.roomId,
    roomNumber: dto.roomNumber,
    roomTypeName: dto.roomTypeName,
    checkIn: dto.checkIn,
    checkOut: dto.checkOut,
    status: dto.status,
    balanceFormatted: formatMoney(dto.balanceCents, dto.currency),
    currency: dto.currency,
  };
}
