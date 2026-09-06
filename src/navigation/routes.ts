/** Rutas de `AuthNavigator` — accesibles solo sin sesión. */
export type AuthStackParamList = {
  Login: undefined;
  LinkBooking: undefined;
};

/**
 * Rutas de `StaffNavigator`. Un usuario solo ve la pestaña de su propio rol
 * (MOV-06, criterios 1-2) — las pantallas reales llegan en MOV-09/10/11.
 */
export type StaffTabParamList = {
  Housekeeping: undefined;
  RoomService: undefined;
  Concierge: undefined;
};

/** Rutas de `GuestNavigator` — declarado en MOV-06, poblado desde MOV-15 en adelante. */
export type GuestStackParamList = {
  Stay: undefined;
};
