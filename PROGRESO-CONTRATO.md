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
| 2.2 `guest` | ⏳ pendiente | | |
| 2.2 `booking` | ⏳ pendiente | | |
| 2.2 `product` | ⏳ pendiente | | |
| 2.2 `amenity` | ⏳ pendiente | | |
| 2.2 `user` | ⏳ pendiente | | No tocar `password`/login (MOV-06). |
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
