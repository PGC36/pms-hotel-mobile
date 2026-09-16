# Progreso: reconciliación del contrato de datos con la web

Bitácora de la rama `feat/reconciliar-contrato` (sobre `develop`). Un commit por
entidad reconciliada; esta tabla se actualiza después de cada commit. Regla de
oro: el contrato de la web (`docs/HANDOFF-MOVIL.md`) gana siempre — cuando hay
divergencia de nombre o tipo, se cambia móvil, nunca la web.

## Estado

| Paso | Estado | Commit | Notas |
|---|---|---|---|
| Fase 1 — Diagnóstico | ✅ hecho | `docs: diagnostico de divergencias con el contrato oficial` | Ver `docs/DIAGNOSTICO-CONTRATO.md`. Confirmado por el usuario. |
| 2.1 `statuses.ts` (máquinas de estado, solo `room`) + 2.2 `room`/`room-type`/`room-feature` | ✅ hecho | (siguiente commit) | Combinados en un solo commit porque `RoomDTO.status` no puede compilar contra `db.ts` sin el split ya hecho — ver nota de alcance abajo. `tsc`/`eslint` limpios. |
| 2.2 `guest` | ✅ hecho | `feat(guest): reconciliar first_name/last_name y document_type con el contrato` | `tsc`/`eslint` limpios. |
| 2.2 `booking` | ✅ hecho | `feat(booking): reconciliar campos, centavos y las 6 transiciones con el contrato` | Tabla de montos confirmada por el usuario antes del commit. `tsc`/`eslint` limpios. |
| 2.2 `product` | ✅ hecho | `feat(product): reconciliar sku, centavos y categoria con el contrato` | Tabla de montos confirmada. `tsc`/`eslint` limpios. |
| 2.2 `amenity` | ✅ hecho | `feat(amenity): reconciliar horario opcional y categoria con el contrato` | `tsc`/`eslint` limpios. |
| 2.2 `user` | ⏸️ deliberadamente sin reconciliar | | Ver nota abajo — está fusionado con el login de MOV-06. |
| 2.2 `order` | ⏳ pendiente | | |
| 2.2 `service-request` | ⏳ pendiente | | |
| 2.3 `db.ts` (migración de datos) | ⏳ pendiente | | Tabla de montos antes/después completa aquí. |
| 2.4 Servicios | ⏳ pendiente | | |
| 2.5 Módulo `tasks` | ✅ sin acción necesaria | | Diagnóstico confirmó que ya soporta las dos máquinas por separado (`order`/`service_request`). Ver sección 13 de `DIAGNOSTICO-CONTRATO.md`. |
| 2.6 Pantallas | ⏳ pendiente | | Solo lo que rompa compilación o muestre dato incorrecto — todas las pantallas de dominio siguen siendo placeholders vacíos (MOV-09+). |
| Fase 3 — Pruebas | ⏳ pendiente | | |
| Fase 5 — Cierre y PR | ⏳ pendiente | | |

## Nota de alcance: por qué 2.1 y 2.2(room) se hicieron en un solo commit

El plan pedía `statuses.ts` (2.1) y el DTO/Model/Mapper de `room` (2.2) como pasos
separados. En la práctica no se puede: `RoomDTO.status` referencia el tipo
`RoomStatus` de `statuses.ts`, y `db.ts` tipa sus datos contra `RoomDTO`. En
cuanto `RoomStatus` cambia de significado (de la máquina de limpieza fusionada
a la máquina de ocupación), `db.ts` deja de compilar hasta que la migración de
datos de `room` también se haga. No hay forma de dejar el repo en verde entre
ambos pasos por separado, así que se combinaron en un commit: split de
`statuses.ts` (dos máquinas de `room` + `isRoomAssignable`) + `room.dto/model/
mapper.ts` + `room-type`/`room-feature` (entidades nuevas) + migración de
`roomsDB` en `db.ts` + los consumidores que rompían (`housekeeping.service.ts`,
`task-transition.service.ts`, `shared/theme/colors.ts`,
`ComponentCatalogScreen.tsx`).

## Decisiones tomadas en el commit de `room`

- **`blocked` (literal antiguo, fusionaba ocupación+limpieza) se mapeó
  registro por registro, no con una regla única:**
  - `room-303`: descripción "temporalmente fuera de servicio: aire
    acondicionado en reparación" → **`maintenance`** (reparación puntual,
    se espera que vuelva a `available`).
  - `room-402`: descripción "en remodelación completa; fuera de inventario
    hasta nuevo aviso" → **`outOfService`** (fuera de inventario por tiempo
    indefinido).
  - Ambas quedan con `housekeeping_status: 'dirty'` — al resolverse el
    bloqueo, la habitación vuelve al ciclo de limpieza normal (mismo
    criterio que ya documentaba la máquina fusionada anterior).
- **El resto de `status` (ocupación) se derivó de `bookingsDB`:** `occupied`
  para las 8 habitaciones con una reserva `checkedIn` vigente hoy;
  `available` para el resto, incluida `room-301` (tiene una reserva
  `confirmed` a futuro, pero el huésped no ha llegado todavía, así que la
  habitación sigue libre).
- **`price_per_night` se eliminó de `room`**, no se movió a ningún lado:
  pertenece a `rate`, entidad exclusiva de la web (sección 3.11 del
  handoff) que móvil no implementa. Si una pantalla futura necesita mostrar
  tarifa, es un ticket nuevo que consuma `rate`, no algo que se pueda
  inventar aquí.
- **`capacity`, `type` (antes en `room`) migraron a `room-type`.** Se creó
  el catálogo `roomTypesDB` (4 tipos: individual, doble, deluxe, suite) y
  `roomFeaturesDB` (7 características) con contenido realista basado en las
  descripciones ya existentes de cada habitación — el contrato exige que
  `room-type.room_feature_ids` referencie algo, y no existía ningún dato de
  partida.
- **`description`, `image_url`, `is_active` de `room` se conservan** como
  campos exclusivos de móvil (no están en el contrato) — no se borraron sin
  avisar, quedan reportados en `DIAGNOSTICO-CONTRATO.md` sección 1.
- **Ninguna pantalla escribía el campo de ocupación** — se verificó
  `housekeeping.service.ts` (única escritura existente, ahora
  `updateRoomHousekeepingStatus`, solo toca `housekeeping_status`) y
  confirmando que todas las pantallas de `housekeeping/screens/` siguen
  siendo placeholders vacíos (MOV-09 en adelante). No hubo que parar por
  este motivo.

## Decisión tomada en el commit de `guest`

- **`document_type: 'dpi'` → `'national_id'`.** El contrato de la web no
  tiene el literal `'dpi'`; su equivalente conceptual es `'national_id'`
  (documento nacional de identidad). Se mapea así en los 7 huéspedes
  guatemaltecos del dataset. **Queda anotado para coordinar con el equipo
  de la web:** el término local en Guatemala es "DPI", no "cédula" ni
  "documento nacional" genérico — si la web algún día expone un literal
  específico para Guatemala, este mapeo debería revisarse. No se resuelve
  unilateralmente desde móvil (regla de Fase 4).

## Decisiones tomadas en el commit de `booking`

- **Montos:** `total_price` (quetzales decimales) → `total_amount_cents`
  (centavos, ×100) en las 10 reservas originales. Tabla completa mostrada y
  confirmada por el usuario antes del commit (ver historial del chat).
- **`guests_count` dividido en `adults`/`children`:** `adults = guests_count`,
  `children = 0` en la mayoría; `booking-04` y `booking-07` quedan con 1
  acompañante menor cada una (instrucción explícita: dejar variedad de
  datos para probar la pantalla de estadía).
- **Cobertura de estados:** el dataset original no tenía ningún registro en
  `pending`, `noShow` ni `cancelled` (los únicos estados usados eran
  `checkedIn` ×8, `confirmed` ×1, `checkedOut` ×1). Se agregaron
  `booking-11` (`pending`, sin `room_id` — ejercita el campo opcional de
  "reserva sin habitación asignada aún"), `booking-12` (`noShow`) y
  `booking-13` (`cancelled`) para que las 6 transiciones de
  `BOOKING_STATUS_TRANSITIONS` tengan al menos un dato real (regla de
  AGENTS.md).
- **Formato de `confirmation_code`/`guest_link_code`:** se alinearon con el
  formato **sembrado** del dataset de la web (`AUR-26001`, `LNK-26001`),
  no con el que genera `bookingService.createBooking()` en vivo
  (`PMS-0011`/`LNK-0011`) — instrucción explícita del usuario, para que los
  datos de referencia de ambos repos sean comparables a simple vista.
  **Queda anotado, no resuelto:** la propia web tiene una inconsistencia
  interna entre su dataset sembrado y lo que su generador produce en vivo
  (docs/HANDOFF-MOVIL.md sección 8, "Inconsistencia menor #2"); es algo a
  coordinar con el equipo web, no algo que móvil pueda corregir del lado
  del generador de la web.
- **`room_type_id` se derivó del `room_id`** de cada reserva contra
  `roomTypesDB` (join manual al armar los datos, ya que no hay servicio de
  reservas real todavía).
- **`rate_id` se deja sin poblar** (campo opcional del contrato) — `rate`
  es una entidad exclusiva de la web, fuera de alcance de móvil.
- Se corrigió `new Date()` directo sobre fecha civil en el mapper, usando
  la nueva utilidad `toDomainCalendarDate` (`shared/utils/date.ts`).

## Decisiones y hallazgos del commit de `product`

- **Montos:** `price` → `price_cents` (×100) en los 25 productos. Tabla
  completa mostrada y confirmada por el usuario antes del commit.
- **`sku`:** se agregó `FYB-0001`…`FYB-0025` (prefijo "comida y bebida"
  tomado literalmente del handoff sección 7.2), sin validar formato.
- **`stock_quantity`/`reorder_level`:** están en el DTO oficial de
  `product` (handoff sección 3.6) — no son una adición de móvil. Como no
  había ningún dato de partida (el dataset original no tenía concepto de
  stock), **los valores son inventados, no migrados**: porciones/umbral
  razonables por tipo de platillo, coherentes con el resto del dataset. Si
  en el futuro se conecta un `inventoryService` real, estos valores deben
  tratarse como semilla de desarrollo, no como stock real.
- **Observación para la sesión de equipo (no resuelta aquí):** el contrato
  separa `product` de `inventory_item` como entidades distintas con vínculo
  explícito (Lote D, sección 3.11 del handoff), y aun así `product`
  conserva su propio `stock_quantity`/`reorder_level`. Puede ser
  deliberado (un producto de Room Service gestiona su disponibilidad
  simple, independiente del inventario operativo más detallado) o puede
  ser un residuo de antes de esa separación. **Móvil no lo resuelve** —
  queda anotado para que el equipo lo confirme.
- **Hallazgo que bloquea MOV-17 (pestañas de categoría del menú):** los 25
  productos del dataset de móvil son platillos/bebidas de Room Service —
  ninguno corresponde a `minibar`, `shop` u `other`. Los 25 quedan en
  `category: 'food_and_beverage'`, el único valor usado. **La taxonomía de
  4 categorías del contrato no sirve para agrupar el menú de Room
  Service** (no hay forma de armar pestañas "Desayunos"/"Bebidas"/
  "Postres" con un solo valor de categoría). El handoff (sección 7.3)
  documenta que la web recomendó un campo `menu_section` separado pero
  **no lo implementó** — no se inventa aquí; queda como evidencia concreta
  de móvil para la sesión de equipo que decida D-005.
- `is_available` → `active` (mismo valor). `image_url`/
  `preparation_time_minutes` se conservan como campos propios de móvil.

## Decisiones tomadas en el commit de `amenity`

- **Categoría:** taxonomía propia (`pool/gym/spa/restaurant/bar/business/
  kids`) → la del contrato (`room/hotel/service`). Instalaciones de uso
  libre (piscinas, gimnasio, restaurante, bar, centro de negocios) →
  `hotel`; servicios con personal asignado (spa, club infantil) →
  `service`. Ninguna amenidad del dataset es específica de una habitación
  (`room` no se usa todavía). No es una regla mecánica — es una lectura de
  cada amenidad, documentada aquí por si el equipo quiere revisar algún
  caso puntual (ej. si el spa debería ser `hotel` en vez de `service`).
- **`opening_time`/`closing_time` → `opens_at?`/`closes_at?`:** en el
  dataset actual las 8 amenidades tienen horario, así que quedan
  poblados; no había ninguna amenidad de servicio continuo (24h) para
  ejercitar el caso "sin horario". `scheduleLabel` (Model, calculado) ya
  soporta el caso ausente ("Abierto las 24 horas") por si se agrega una a
  futuro. No se implementó `isAmenityOpenAt()` — es de MOV-16, fuera del
  alcance de esta reconciliación (diagnóstico sección 7).
- `is_active` → `active`. `image_url` se conserva como campo propio de
  móvil.

## Por qué `user` no se reconcilia en esta rama

`src/modules/auth/dtos/user.dto.ts` **es** el mecanismo de login de MOV-06,
no una copia separada del `user` (puesto) de solo lectura que describe el
contrato: trae `password`, lo consume `AuthContext`, y su `role` (`StaffRole`,
3 valores) alimenta el filtrado de tabs de `StaffNavigator` y
`shared/constants/permissions.ts`. No hay forma de:

- dividir `full_name` en `first_name`/`last_name`,
- ampliar `role` a los 6 valores del contrato (`admin`/`guest`/`reception`/
  `housekeeping`/`concierge`/`room_service`),
- renombrar `is_active` → `status: 'active'|'inactive'`,

...sin tocar el flujo de autenticación (`AuthContext`, `StaffNavigator`,
`permissions.ts`) — exactamente lo que la Fase 4 del plan pide no tocar
("Autenticación del personal en móvil... no lo toques"). Reconciliar la
*forma* de este archivo no es separable de tocar el *mecanismo*, a
diferencia de las demás entidades.

**Se deja sin reconciliar, documentado aquí en vez de forzado.** Si en el
futuro se necesita el `user` de solo lectura del contrato (ej. para mostrar
"personal asignado" en una tarea — que hoy tampoco existe como campo, ver
diagnóstico sección 16), es una entidad nueva y separada de
`auth/dtos/user.dto.ts`, no una modificación de este archivo.

## Huecos y decisiones pendientes (no resueltos aquí, ver sección 16 del diagnóstico)

- División de `booking.guests_count` en `adults`/`children` — sin fuente de verdad. Se resuelve en 2.3 con `adults = guests_count`, `children = 0` para la mayoría, dejando 2-3 reservas con acompañantes menores para variedad de datos (instrucción explícita del usuario).
- Taxonomía de `product.category`/`amenity.category` — provisional en el contrato mismo (sección 7.3 del handoff); se adoptan los literales actuales sin construir agrupación por categoría.
- Formato de `sku` — se agrega el campo, sin validación de formato.
- Mecanismo de cargo (`charge_id` / reemplazo de `order.charged_to_room`) — no implementado en ningún lado, no se inventa aquí.
- `service_request.assigned_role` — sin campo equivalente en el contrato; no se elimina ni se inventa su contraparte, queda como propuesta a coordinar con el equipo.
- Autenticación de personal (`user.password`, `Session` de móvil) — no se toca (MOV-06).
- Lookup de reserva por `guest_link_code` — sin implementación de referencia en la web; fuera de esta reconciliación (MOV-14).

## Commits de esta rama

| Commit | Entidad/paso | Resultado |
|---|---|---|
| `docs: diagnostico de divergencias con el contrato oficial` | Fase 1 | Diagnóstico completo, sin cambios de código. |
| `feat(room): separar ocupacion y limpieza, crear room-type y room-feature` | 2.1 + 2.2 (`room`, `room-type`, `room-feature`) | `tsc`/`eslint` limpios. Ver decisiones arriba. |
| `feat(guest): reconciliar first_name/last_name y document_type con el contrato` | 2.2 (`guest`) | `full_name` dividido en `first_name`/`last_name`; `document_type: 'dpi'` → `'national_id'` (anotado abajo, es el término local guatemalteco); `email`/`phone`/`nationality`/`document_*` ahora opcionales. `tsc`/`eslint` limpios. |
| `feat(booking): reconciliar campos, centavos y las 6 transiciones con el contrato` | 2.1 (máquina `Booking` en `statuses.ts`) + 2.2 (`booking`) | Ver tabla de montos y decisiones arriba. `tsc`/`eslint` limpios. |
| `feat(product): reconciliar sku, centavos y categoria con el contrato` | 2.2 (`product`) | Ver tabla de montos y hallazgos arriba (bloqueo de MOV-17). `tsc`/`eslint` limpios. |
| `feat(amenity): reconciliar horario opcional y categoria con el contrato` | 2.2 (`amenity`) | Ver decisiones arriba. `tsc`/`eslint` limpios. |
