import type { NavigatorScreenParams } from '@react-navigation/native';

/** Rutas de `AuthNavigator` — accesibles solo sin sesión. */
export type AuthStackParamList = {
  Login: undefined;
  GuestLogin: undefined;
  LinkBooking: undefined;
};


/**
 * Rutas de `StaffNavigator`. Un usuario solo ve la pestaña de su propio rol
 * (MOV-06, criterios 1-2) — las pantallas reales llegan en MOV-09/10/11.
 */
export type StaffTabParamList = {
  Housekeeping: NavigatorScreenParams<HousekeepingStackParamList> | undefined;
  RoomService: NavigatorScreenParams<RoomServiceStackParamList> | undefined;
  Concierge: undefined;
};

/**
 * Stack interno de la única pestaña de limpieza (MOV-09). Solicitudes,
 * reporte de desperfectos e historial se agregan aquí — no como pestañas
 * nuevas de `StaffNavigator`.
 */
export type HousekeepingStackParamList = {
  RoomList: undefined;
  /** Solo el id: el detalle pide la habitación fresca al servicio. */
  RoomDetail: { roomId: string };
  /** Solicitudes de huéspedes (limpieza y artículos) sobre la bandeja genérica de `tasks`. */
  Requests: undefined;
  RequestDetail: { taskId: string };
  /** `roomNumber` solo para mostrarlo; el reporte se asocia por `roomId`. */
  ReportIssue: { roomId: string; roomNumber: string };
  /** Tareas completadas por el usuario en sesión. */
  History: undefined;
};

/**
 * Stack interno de la única pestaña de Room Service del personal (MOV-10).
 * Menú e historial viven aquí, no como pestañas nuevas de `StaffNavigator`.
 */
export type RoomServiceStackParamList = {
  /** Pedidos no terminales sobre la bandeja genérica de `tasks`. */
  OrderInbox: undefined;
  /** Solo el id: el detalle pide el pedido fresco al servicio. */
  OrderDetail: { orderId: string };
  /** Menú de solo consulta, agrupado por categoría. */
  Menu: undefined;
  /** Pedidos entregados, rechazados o cancelados (historial del equipo). */
  History: undefined;
};

/** Rutas de `GuestNavigator` — declarado en MOV-06, poblado desde MOV-15 en adelante. */
export type GuestStackParamList = {
  Stay: undefined;
};
