/**
 * Fase 3 de PROGRESO-CONTRATO.md — valida la reconciliación del contrato de
 * datos sin agregar un framework de pruebas nuevo (no hay ninguno en el
 * proyecto todavía; AGENTS.md pide un script rápido con `npx tsx`). Corre
 * con:
 *
 *   npx tsx scripts/validate-contract.ts
 *
 * Sale con código 1 si algo falla, para poder usarse en CI más adelante.
 */
import {
  ROOM_STATUSES,
  ROOM_HOUSEKEEPING_STATUSES,
  ROOM_STATUS_TRANSITIONS,
  ROOM_HOUSEKEEPING_STATUS_TRANSITIONS,
  BOOKING_STATUSES,
  BOOKING_STATUS_TRANSITIONS,
  ORDER_STATUSES,
  ORDER_STATUS_TRANSITIONS,
  SERVICE_REQUEST_STATUSES,
  SERVICE_REQUEST_STATUS_TRANSITIONS,
  isValidTransition,
  isRoomAssignable,
} from '../src/shared/constants/statuses';
import { formatCurrency } from '../src/shared/utils/formatters';
import { toDomainCalendarDate } from '../src/shared/utils/date';
import {
  roomsDB,
  roomTypesDB,
  roomFeaturesDB,
  guestsDB,
  bookingsDB,
  productsDB,
  ordersDB,
  serviceRequestsDB,
} from '../src/data/db';

let failures = 0;

function check(description: string, condition: boolean): void {
  if (condition) {
    console.log(`  ok  ${description}`);
  } else {
    failures += 1;
    console.error(`FAIL  ${description}`);
  }
}

function section(title: string): void {
  console.log(`\n${title}`);
}

// ---------------------------------------------------------------------------
// 1. Todo literal de estado usado en db.ts pertenece a la máquina que le
//    corresponde.
// ---------------------------------------------------------------------------
section('1. Literales de estado pertenecen a su máquina');

check(
  'roomsDB.status ⊆ ROOM_STATUSES',
  roomsDB.every((room) => (ROOM_STATUSES as readonly string[]).includes(room.status)),
);
check(
  'roomsDB.housekeeping_status ⊆ ROOM_HOUSEKEEPING_STATUSES',
  roomsDB.every((room) =>
    (ROOM_HOUSEKEEPING_STATUSES as readonly string[]).includes(room.housekeeping_status),
  ),
);
check(
  'bookingsDB.status ⊆ BOOKING_STATUSES',
  bookingsDB.every((booking) => (BOOKING_STATUSES as readonly string[]).includes(booking.status)),
);
check(
  'ordersDB.status ⊆ ORDER_STATUSES',
  ordersDB.every((order) => (ORDER_STATUSES as readonly string[]).includes(order.status)),
);
check(
  'serviceRequestsDB.status ⊆ SERVICE_REQUEST_STATUSES',
  serviceRequestsDB.every((request) =>
    (SERVICE_REQUEST_STATUSES as readonly string[]).includes(request.status),
  ),
);

// ---------------------------------------------------------------------------
// 1b. Cobertura: al menos un registro en cada estado posible (regla de
//     AGENTS.md sobre datos simulados).
// ---------------------------------------------------------------------------
section('1b. Cobertura de estados en los datos simulados');

for (const status of ROOM_STATUSES) {
  check(`existe una room con status "${status}"`, roomsDB.some((r) => r.status === status));
}
for (const status of ROOM_HOUSEKEEPING_STATUSES) {
  check(
    `existe una room con housekeeping_status "${status}"`,
    roomsDB.some((r) => r.housekeeping_status === status),
  );
}
for (const status of BOOKING_STATUSES) {
  check(`existe un booking con status "${status}"`, bookingsDB.some((b) => b.status === status));
}
for (const status of ORDER_STATUSES) {
  check(`existe un order con status "${status}"`, ordersDB.some((o) => o.status === status));
}
for (const status of SERVICE_REQUEST_STATUSES) {
  check(
    `existe un service_request con status "${status}"`,
    serviceRequestsDB.some((r) => r.status === status),
  );
}

// ---------------------------------------------------------------------------
// 2. Las transiciones inválidas se rechazan, en las cuatro máquinas.
// ---------------------------------------------------------------------------
section('2. Transiciones inválidas se rechazan');

check(
  'room (ocupación): available -> outOfService es válida',
  isValidTransition(ROOM_STATUS_TRANSITIONS, 'available', 'outOfService'),
);
check(
  'room (ocupación): outOfService -> occupied es inválida',
  !isValidTransition(ROOM_STATUS_TRANSITIONS, 'outOfService', 'occupied'),
);

check(
  'room (limpieza): dirty -> cleaning es válida',
  isValidTransition(ROOM_HOUSEKEEPING_STATUS_TRANSITIONS, 'dirty', 'cleaning'),
);
check(
  'room (limpieza): dirty -> inspected es inválida (no puede saltarse la limpieza)',
  !isValidTransition(ROOM_HOUSEKEEPING_STATUS_TRANSITIONS, 'dirty', 'inspected'),
);

check(
  'booking: pending -> confirmed es válida',
  isValidTransition(BOOKING_STATUS_TRANSITIONS, 'pending', 'confirmed'),
);
check(
  'booking: checkedOut -> checkedIn es inválida (checkedOut es terminal)',
  !isValidTransition(BOOKING_STATUS_TRANSITIONS, 'checkedOut', 'checkedIn'),
);

check(
  'order: pending -> accepted es válida',
  isValidTransition(ORDER_STATUS_TRANSITIONS, 'pending', 'accepted'),
);
check(
  'order: delivered -> cancelled es inválida (delivered es terminal)',
  !isValidTransition(ORDER_STATUS_TRANSITIONS, 'delivered', 'cancelled'),
);
check(
  'order: preparing -> cancelled es inválida (solo cancelable en pending/accepted)',
  !isValidTransition(ORDER_STATUS_TRANSITIONS, 'preparing', 'cancelled'),
);

check(
  'service_request: pending -> accepted es válida',
  isValidTransition(SERVICE_REQUEST_STATUS_TRANSITIONS, 'pending', 'accepted'),
);
check(
  'service_request: completed -> pending es inválida (completed es terminal)',
  !isValidTransition(SERVICE_REQUEST_STATUS_TRANSITIONS, 'completed', 'pending'),
);

// ---------------------------------------------------------------------------
// 3. Prueba de la trampa: un monto conocido se formatea al valor esperado.
// ---------------------------------------------------------------------------
section('3. Prueba de la trampa de montos');

// Intl.NumberFormat separa el símbolo con un espacio de no separación
// (U+00A0), no un espacio normal — se normaliza antes de comparar para que
// la prueba no dependa de qué carácter de espacio use el motor de ICU.
const normalizeSpaces = (value: string): string => value.replace(/ /g, ' ');

check(
  'formatCurrency(32000) === "Q 320.00"',
  normalizeSpaces(formatCurrency(32000)) === 'Q 320.00',
);
check('formatCurrency(5500) === "Q 55.00"', normalizeSpaces(formatCurrency(5500)) === 'Q 55.00');
check('formatCurrency(876) === "Q 8.76"', normalizeSpaces(formatCurrency(876)) === 'Q 8.76');

let threwOnNonInteger = false;
try {
  formatCurrency(320.5);
} catch {
  threwOnNonInteger = true;
}
check(
  'formatCurrency lanza si amountCents no es entero (la trampa: migrar el tipo sin multiplicar x100)',
  threwOnNonInteger,
);

// ---------------------------------------------------------------------------
// 4. Toda fecha civil se lee sin desplazamiento de día.
// ---------------------------------------------------------------------------
section('4. Fechas civiles sin desplazamiento de día');

const sampleDate = toDomainCalendarDate('2026-09-10');
check('toDomainCalendarDate("2026-09-10").getDate() === 10', sampleDate.getDate() === 10);
check('toDomainCalendarDate("2026-09-10").getMonth() === 8 (septiembre)', sampleDate.getMonth() === 8);
check(
  'toDomainCalendarDate("2026-09-10").getFullYear() === 2026',
  sampleDate.getFullYear() === 2026,
);

for (const booking of bookingsDB) {
  const checkIn = toDomainCalendarDate(booking.check_in);
  const [, , expectedDay] = booking.check_in.split('-').map(Number);
  check(
    `${booking.id}: check_in "${booking.check_in}" no se desplaza de día`,
    checkIn.getDate() === expectedDay,
  );
}

// ---------------------------------------------------------------------------
// 5. Ninguna referencia entre entidades queda colgando.
// ---------------------------------------------------------------------------
section('5. Sin referencias colgantes');

const roomTypeIds = new Set(roomTypesDB.map((rt) => rt.id));
const roomFeatureIds = new Set(roomFeaturesDB.map((rf) => rf.id));
const roomIds = new Set(roomsDB.map((r) => r.id));
const guestIds = new Set(guestsDB.map((g) => g.id));
const bookingIds = new Set(bookingsDB.map((b) => b.id));
const productIds = new Set(productsDB.map((p) => p.id));

for (const room of roomsDB) {
  check(`${room.id}: room_type_id "${room.room_type_id}" existe`, roomTypeIds.has(room.room_type_id));
}
for (const roomType of roomTypesDB) {
  for (const featureId of roomType.room_feature_ids) {
    check(`${roomType.id}: room_feature_id "${featureId}" existe`, roomFeatureIds.has(featureId));
  }
}
for (const booking of bookingsDB) {
  check(`${booking.id}: guest_id "${booking.guest_id}" existe`, guestIds.has(booking.guest_id));
  check(
    `${booking.id}: room_type_id "${booking.room_type_id}" existe`,
    roomTypeIds.has(booking.room_type_id),
  );
  if (booking.room_id) {
    check(`${booking.id}: room_id "${booking.room_id}" existe`, roomIds.has(booking.room_id));
  }
}
for (const order of ordersDB) {
  check(`${order.id}: booking_id "${order.booking_id}" existe`, bookingIds.has(order.booking_id));
  check(`${order.id}: room_id "${order.room_id}" existe`, roomIds.has(order.room_id));
  if (order.guest_id) {
    check(`${order.id}: guest_id "${order.guest_id}" existe`, guestIds.has(order.guest_id));
  }
  for (const item of order.items) {
    check(
      `${order.id}: items[].product_id "${item.product_id}" existe`,
      productIds.has(item.product_id),
    );
  }
}
for (const request of serviceRequestsDB) {
  check(
    `${request.id}: booking_id "${request.booking_id}" existe`,
    bookingIds.has(request.booking_id),
  );
  check(`${request.id}: room_id "${request.room_id}" existe`, roomIds.has(request.room_id));
  if (request.guest_id) {
    check(`${request.id}: guest_id "${request.guest_id}" existe`, guestIds.has(request.guest_id));
  }
}

// ---------------------------------------------------------------------------
// 6. isAssignable da falso para una habitación libre pero sucia.
// ---------------------------------------------------------------------------
section('6. isAssignable');

check(
  'isRoomAssignable("available", "dirty") === false',
  isRoomAssignable('available', 'dirty') === false,
);
check(
  'isRoomAssignable("available", "clean") === true',
  isRoomAssignable('available', 'clean') === true,
);
check(
  'isRoomAssignable("available", "inspected") === true',
  isRoomAssignable('available', 'inspected') === true,
);
check(
  'isRoomAssignable("occupied", "clean") === false',
  isRoomAssignable('occupied', 'clean') === false,
);

const dirtyAvailableRoom = roomsDB.find((r) => r.status === 'available' && r.housekeeping_status === 'dirty');
check(
  'existe al menos una room real available+dirty en el dataset',
  dirtyAvailableRoom !== undefined,
);
if (dirtyAvailableRoom) {
  check(
    `${dirtyAvailableRoom.id} (available+dirty): isRoomAssignable() === false`,
    isRoomAssignable(dirtyAvailableRoom.status, dirtyAvailableRoom.housekeeping_status) === false,
  );
}

// ---------------------------------------------------------------------------
section('Resultado');
if (failures > 0) {
  console.error(`\n${failures} verificación(es) fallaron.`);
  process.exit(1);
} else {
  console.log('\nTodas las verificaciones pasaron.');
}
