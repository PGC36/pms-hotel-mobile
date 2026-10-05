import type {
  ConciergeRequestStatus,
  OrderStatus,
  RoomHousekeepingStatus,
  RoomStatus,
  ServiceRequestStatus,
} from '@/shared/constants/statuses';

/**
 * Paleta de colores — PMS Hoteles Boutique.
 * Fuente: docs/paletaColores.md. No agregar valores hex fuera de este archivo.
 */

export const colors = {
  brand: {
    900: '#2E211A', // Espresso — texto principal, encabezados
    800: '#4A3728', // Café — barra lateral, navbar privada
    600: '#6B4F3A', // Moka — botones primarios
    400: '#8B6F52', // Caramelo — hover, iconos secundarios
    300: '#B08D57', // Dorado — acento: CTA, badges, destacados
  },
  sand: {
    300: '#D9C7AE', // Arena — bordes, divisores
    200: '#E8DCC8', // Beige — filas alternas de tabla
    100: '#F3EADE', // Lino — superficie de tarjetas
    50: '#FAF7F2', // Hueso — fondo de página
  },
  white: '#FFFFFF',
  state: {
    success: '#4F7A5B', // Verde salvia
    warning: '#C08A2E', // Ámbar
    danger: '#A9483C', // Terracota
    info: '#5B7C99', // Azul apagado
    muted: '#8A8378', // Neutro cálido
  },
  text: {
    primary: '#2E211A',
    secondary: '#6B5A4C',
    muted: '#8A8378',
    onBrand: '#F3EADE', // texto sobre fondos café (brand-600/800)
  },
} as const;

export interface StatusColorToken {
  background: string;
  text: string;
}

/**
 * Color por estado para cada máquina de estados (architecture.md sección 4).
 * `shared/constants/statuses.ts` es dueño de los nombres/transiciones; este
 * archivo solo asigna el color que corresponde a cada nombre de estado, para
 * que sea el mismo en cualquier pantalla que lo muestre. El `satisfies` de
 * abajo obliga a que exista un color por cada estado real y ningún color
 * sobrante.
 */
export const statusColors = {
  order: {
    pending: { background: colors.sand[300], text: colors.brand[900] },
    accepted: { background: colors.state.info, text: colors.white },
    preparing: { background: colors.state.warning, text: colors.brand[900] },
    ready: { background: colors.brand[300], text: colors.brand[900] },
    onTheWay: { background: colors.brand[400], text: colors.white },
    delivered: { background: colors.state.success, text: colors.white },
    rejected: { background: colors.state.danger, text: colors.white },
    cancelled: { background: colors.state.danger, text: colors.white },
  },
  serviceRequest: {
    pending: { background: colors.sand[300], text: colors.brand[900] },
    accepted: { background: colors.state.info, text: colors.white },
    inProgress: { background: colors.state.warning, text: colors.brand[900] },
    completed: { background: colors.state.success, text: colors.white },
    rejected: { background: colors.state.danger, text: colors.white },
  },
  /** Conserjería (MOV-11): mismos colores que `serviceRequest` más `cancelled`, igual que en pedidos. */
  conciergeRequest: {
    pending: { background: colors.sand[300], text: colors.brand[900] },
    accepted: { background: colors.state.info, text: colors.white },
    inProgress: { background: colors.state.warning, text: colors.brand[900] },
    completed: { background: colors.state.success, text: colors.white },
    rejected: { background: colors.state.danger, text: colors.white },
    cancelled: { background: colors.state.danger, text: colors.white },
  },
  /** Limpieza (`Room.housekeepingStatus`). */
  room: {
    dirty: { background: colors.state.warning, text: colors.brand[900] },
    cleaning: { background: colors.state.info, text: colors.white },
    clean: { background: colors.state.success, text: colors.white },
    inspected: { background: colors.brand[300], text: colors.brand[900] },
  },
  /** Ocupación (`Room.status`), de solo lectura para Housekeeping. */
  roomOccupancy: {
    available: { background: colors.state.success, text: colors.white },
    occupied: { background: colors.state.info, text: colors.white },
    maintenance: { background: colors.state.warning, text: colors.brand[900] },
    outOfService: { background: colors.state.muted, text: colors.white },
  },
} as const satisfies {
  order: Record<OrderStatus, StatusColorToken>;
  serviceRequest: Record<ServiceRequestStatus, StatusColorToken>;
  conciergeRequest: Record<ConciergeRequestStatus, StatusColorToken>;
  room: Record<RoomHousekeepingStatus, StatusColorToken>;
  roomOccupancy: Record<RoomStatus, StatusColorToken>;
};
