export interface GuestStayModel {
  bookingId: string;
  guestId: string;
  guestFullName: string;
  roomId: string;
  roomNumber: string;
  roomTypeName: string;
  checkIn: string;
  checkOut: string;
  status: string;
  balanceFormatted: string;
  currency: string;
}
