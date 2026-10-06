export interface GuestStayDTO {
  bookingId: string;
  guestId: string;
  guestFirstName: string;
  guestLastName: string;
  roomId: string;
  roomNumber: string;
  roomTypeId: string;
  roomTypeName: string;
  checkIn: string;
  checkOut: string;
  status: string;
  balanceCents: number;
  currency: string;
}
