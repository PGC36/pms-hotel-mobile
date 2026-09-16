# Progreso: reconciliación del contrato de datos con la web

Bitácora de la rama `feat/reconciliar-contrato` (sobre `develop`). Un commit por
entidad reconciliada; esta tabla se actualiza después de cada commit. Regla de
oro: el contrato de la web (`docs/HANDOFF-MOVIL.md`) gana siempre — cuando hay
divergencia de nombre o tipo, se cambia móvil, nunca la web.

## Estado

| Paso | Estado | Commit | Notas |
|---|---|---|---|
| Fase 1 — Diagnóstico | ✅ hecho | (este commit) | Ver `docs/DIAGNOSTICO-CONTRATO.md`. Parada obligatoria — pendiente de confirmación antes de Fase 2. |
| 2.1 `statuses.ts` (máquinas de estado) | ⏳ pendiente | | Split de `RoomStatus` en ocupación + limpieza; `isRoomAssignable`. |
| 2.2 `room` | ⏳ pendiente | | |
| 2.2 `room-type` | ⏳ pendiente | | Entidad nueva, no existe hoy. |
| 2.2 `room-feature` | ⏳ pendiente | | Entidad nueva, no existe hoy. |
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

## Huecos y decisiones pendientes (no resueltos aquí, ver sección 16 del diagnóstico)

- División de `booking.guests_count` en `adults`/`children` — sin fuente de verdad, se documentará como suposición explícita en 2.3.
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
