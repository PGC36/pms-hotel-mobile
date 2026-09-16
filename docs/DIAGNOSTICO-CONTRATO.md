# Diagnóstico: divergencias entre el contrato móvil (MOV-04) y el contrato oficial de la web

**Fecha:** 2026-09-16. **Fuente del contrato oficial:** `docs/HANDOFF-MOVIL.md` (traspaso del equipo web, sección 3 y 4). **Alcance:** solo lectura — este documento no modifica código, es el insumo para la Fase 2 de `PROGRESO-CONTRATO.md`.

Convención de veredicto: ✅ coincide · 🔤 difiere el nombre · 🔁 difiere el tipo · ➖ falta en móvil · ➕ sobra en móvil.

---

## 1 · `room`

Móvil: `src/modules/housekeeping/dtos/room.dto.ts`. Contrato: handoff sección 3.1.

| Campo móvil | Campo contrato | Tipo móvil | Tipo contrato | Veredicto |
|---|---|---|---|---|
| `id` | `id` | `string` | `string` | ✅ |
| `number` | `room_number` | `string` | `string` | 🔤 |
| `floor` | `floor` | `number` | `number` | ✅ |
| `type` | `room_type_id` | `'single'\|'double'\|'suite'\|'deluxe'` (enum embebido) | `string` (FK a `room-type`) | 🔁 móvil incrusta el tipo de habitación como enum en vez de referenciar `room-type` |
| `status` | `status` **+** `housekeeping_status` | un solo campo `RoomStatus` = `'dirty'\|'cleaning'\|'clean'\|'inspected'\|'blocked'` | dos campos: `status` (`available\|occupied\|maintenance\|out_of_service`, la escribe la web) y `housekeeping_status` (`dirty\|cleaning\|clean\|inspected`, la escribe móvil) | 🔁 **crítico** — exactamente el problema que el plan anticipó: móvil fusionó ocupación y limpieza en una sola máquina, y además mezcló "mantenimiento" (que en el contrato es un valor de `status`) como un estado más del ciclo de limpieza (`blocked`) |
| `capacity` | *(no existe en `room`; vive en `room-type.capacity`)* | `number` | — | ➕ mal ubicado — es dato de `room-type`, no de `room` |
| `price_per_night` | *(no existe en `room`; sería `rate`, entidad exclusiva de la web)* | `number` | — | ➕ mal ubicado — móvil no tiene forma de expresar tarifa sin esta entidad |
| `description` | *(no existe en `room` del contrato)* | `string` | — | ➕ reportar, no borrar sin avisar |
| `image_url` | *(no existe en `room` del contrato)* | `string` | — | ➕ reportar |
| `is_active` | *(no existe en `room`; `room-type.active` es lo más cercano)* | `boolean` | — | ➕ mal ubicado |
| — | `room_type_id` | — | `string` | ➖ |
| — | `notes?` | — | `string` | ➖ |
| — | `created_at` / `updated_at` | — | `string` (timestamp) | ➖ |
| — | `isAssignable` (calculado por el mapper, no está en el DTO) | — | `boolean` | ➖ — móvil no tiene ninguna función equivalente a `isRoomAssignable()` |

## 2 · `room-type`

**Toda la entidad falta.** No existe `room-type.dto.ts`/`.model.ts`/`.mapper.ts` en ningún módulo. Los campos que le corresponden (`code`, `name`, `description`, `capacity`, `bed_configuration`, `room_feature_ids`, `active`, timestamps) hoy están ausentes o mal ubicados dentro de `room` (ver tabla 1: `capacity`, parte de `description`/`type`).

## 3 · `room-feature`

**Toda la entidad falta.** No existe ningún archivo. Consecuencia directa: `room-type.room_feature_ids` tampoco puede existir todavía — no hay nada que referenciar.

## 4 · `guest`

Móvil: `src/modules/booking/dtos/guest.dto.ts`. Contrato: sección 3.4.

| Campo móvil | Campo contrato | Tipo móvil | Tipo contrato | Veredicto |
|---|---|---|---|---|
| `id` | `id` | `string` | `string` | ✅ |
| `full_name` | `first_name` + `last_name` | `string` | `string` + `string` | 🔁 un campo vs. dos |
| `email` | `email?` | `string` (obligatorio) | `string` (opcional) | 🔁 opcionalidad |
| `phone` | `phone?` | `string` (obligatorio) | `string` (opcional) | 🔁 opcionalidad |
| `document_type` | `document_type?` | `'dpi'\|'passport'` | `'passport'\|'national_id'\|'driver_license'` (opcional) | 🔁 `'dpi'` no existe en el contrato; el equivalente es `'national_id'` |
| `document_number` | `document_number?` | `string` (obligatorio) | `string` (opcional) | 🔁 opcionalidad |
| `nationality` | `nationality?` | `string` (obligatorio) | `string` (opcional) | 🔁 opcionalidad |
| `created_at` | `created_at` | `string` | `string` (timestamp) | ✅ |
| — | `updated_at` | — | `string` | ➖ |
| — | `notes?` | — | `string` | ➖ |

## 5 · `booking`

Móvil: `src/modules/booking/dtos/booking.dto.ts`. Contrato: sección 3.5. **Móvil solo lee esta entidad, igual que el contrato exige.**

| Campo móvil | Campo contrato | Tipo móvil | Tipo contrato | Veredicto |
|---|---|---|---|---|
| `id` | `id` | `string` | `string` | ✅ |
| `guest_id` | `guest_id` | `string` | `string` | ✅ |
| `room_id` | `room_id?` | `string` (obligatorio) | `string` (opcional — puede no estar asignada) | 🔁 opcionalidad |
| `check_in_date` | `check_in` | `string` (`YYYY-MM-DD`, ya coincide en formato) | `string` (`YYYY-MM-DD`) | 🔤 |
| `check_out_date` | `check_out` | `string` (`YYYY-MM-DD`) | `string` (`YYYY-MM-DD`) | 🔤 |
| `guests_count` | `adults` + `children` | `number` (total) | `number` + `number` | 🔁 **sin fuente para dividir** — ver huecos, sección 8 |
| `status` | `status` | 4 literales: `confirmed\|checkedIn\|checkedOut\|cancelled` | 6 literales: `pending\|confirmed\|checkedIn\|checkedOut\|cancelled\|noShow` | 🔁 faltan `pending` y `noShow` |
| `linking_code` | `guest_link_code` | `string` | `string` | 🔤 |
| `total_price` | `total_amount_cents` | `number` (quetzales decimales, ver tabla de montos) | `number` (centavos, entero) | 🔁 **trampa de montos** |
| `notes` | `notes?` | `string \| null` | `string` (opcional) | 🔁 estilo `null` vs. `undefined`, equivalente en la práctica |
| `created_at` | `created_at` | `string` | `string` | ✅ |
| — | `confirmation_code` | — | `string` | ➖ |
| — | `room_type_id` | — | `string` | ➖ |
| — | `rate_id?` | — | `string` | ➖ |
| — | `currency` (`'GTQ'`) | — | `'GTQ'` | ➖ |
| — | `updated_at` | — | `string` | ➖ |
| `nights` (Model, calculado) | *(no existe en el contrato — es derivado)* | `number` | — | ➕ presentación, sin problema — pero calculado con `new Date()` sobre fecha civil, ver hallazgo de fechas abajo |

## 6 · `product`

Móvil: `src/modules/room-service/dtos/product.dto.ts`. Contrato: sección 3.6.

| Campo móvil | Campo contrato | Tipo móvil | Tipo contrato | Veredicto |
|---|---|---|---|---|
| `id` | `id` | `string` | `string` | ✅ |
| — | `sku` | — | `string` (formato provisional, sección 7 del handoff) | ➖ — agregar el campo, **sin validar formato** (regla de Fase 4) |
| `name` | `name` | `string` | `string` | ✅ |
| `description` | `description?` | `string` (obligatorio) | `string` (opcional) | 🔁 opcionalidad |
| `category` | `category` | `'breakfast'\|'lunch'\|'dinner'\|'beverages'\|'desserts'\|'snacks'` | `'minibar'\|'shop'\|'food_and_beverage'\|'other'` | 🔁 taxonomías incompatibles, sin mapeo 1:1 |
| `price` | `price_cents` | `number` (quetzales decimales) | `number` (centavos, entero) | 🔁 **trampa de montos** |
| — | `currency` (`'GTQ'`) | — | `'GTQ'` | ➖ |
| — | `stock_quantity` / `reorder_level` | — | `number` / `number` | ➖ |
| `image_url` | *(no existe en el contrato)* | `string` | — | ➕ reportar, probablemente necesaria para la UI |
| `is_available` | `active` | `boolean` | `boolean` | 🔤 |
| `preparation_time_minutes` | *(no existe en el contrato)* | `number` | — | ➕ reportar, probablemente necesaria para la UI |
| — | `created_at` / `updated_at` | — | `string` | ➖ |

## 7 · `amenity`

Móvil: `src/modules/amenities/dtos/amenity.dto.ts`. Contrato: sección 3.7.

| Campo móvil | Campo contrato | Tipo móvil | Tipo contrato | Veredicto |
|---|---|---|---|---|
| `id` | `id` | `string` | `string` | ✅ |
| `name` | `name` | `string` | `string` | ✅ |
| `description` | `description?` | `string` (obligatorio) | `string` (opcional) | 🔁 opcionalidad |
| `category` | `category` | `'pool'\|'gym'\|'spa'\|'restaurant'\|'bar'\|'business'\|'kids'` | `'room'\|'hotel'\|'service'` | 🔁 taxonomías incompatibles, sin mapeo 1:1 |
| `location` | `location?` | `string` (obligatorio) | `string` (opcional) | 🔁 opcionalidad |
| `opening_time` / `closing_time` | `opens_at?` / `closes_at?` | `string` (`HH:mm`, siempre obligatorio) | `string` (`HH:mm`, opcional — ausente = servicio continuo) | 🔤🔁 nombre y opcionalidad — móvil no puede modelar hoy una amenidad de horario continuo |
| `image_url` | *(no existe en el contrato)* | `string` | — | ➕ reportar |
| `is_active` | `active` | `boolean` | `boolean` | 🔤 |
| — | `created_at` / `updated_at` | — | `string` | ➖ |
| `scheduleLabel` (Model, calculado) | *(no existe en el contrato — presentación)* | `string` | — | ➕ sin problema, es de UI |
| — | función `isAmenityOpenAt()` | — | (utilidad) | ➖ no implementada aún — corresponde a MOV-16, fuera del alcance de MOV-08, solo se anota |

## 8 · `user`

Móvil: `src/modules/auth/dtos/user.dto.ts`. Contrato: sección 3.8. **Atención:** móvil fusionó el "puesto" (`user`) con las credenciales de su propio login (MOV-06) — trae `password` y usa `StaffRole` (subconjunto de 3 roles) en vez del `UserRoleDto` de 6 roles del contrato. `password` **no se toca** (regla de Fase 4, es el login propio de MOV-06).

| Campo móvil | Campo contrato | Tipo móvil | Tipo contrato | Veredicto |
|---|---|---|---|---|
| `id` | `id` | `string` | `string` | ✅ |
| `full_name` | `first_name` + `last_name` | `string` | `string` + `string` | 🔁 un campo vs. dos |
| `email` | `email` | `string` | `string` | ✅ |
| `phone` | *(no existe en `user` del contrato)* | `string` | — | ➕ reportar |
| `role` | `role` | `StaffRole` = `'housekeeping'\|'roomService'\|'concierge'` (3 valores) | `'admin'\|'guest'\|'reception'\|'housekeeping'\|'concierge'\|'room_service'` (6 valores) | 🔁 subconjunto — falta `admin`, `guest`, `reception`; `roomService` ya coincide en camelCase con el Model del contrato |
| `password` | *(no existe en `user` del contrato — es de `session`/auth)* | `string` | — | ➕ **no tocar** — es el mecanismo de login de MOV-06 |
| `is_active` | `status` (`'active'\|'inactive'`) | `boolean` | `string` enum | 🔁 nombre y tipo |
| `avatar_url` | *(no existe en el contrato)* | `string \| null` | — | ➕ reportar |
| `created_at` | `created_at` | `string` | `string` | ✅ |
| — | `updated_at` | — | `string` | ➖ |

## 9 · `session`

Móvil (`src/modules/auth/models/session.model.ts`) tiene su propio `Session = StaffSession | GuestSession`, discriminado por `type: 'staff'|'guest'`, **sin** campo `role`. No reproduce el problema que el handoff advierte (colisión de nombre `role` entre `session` MAYÚSCULAS y `user` minúsculas) porque móvil no tiene ese campo ahí. Es el mecanismo de auth propio de MOV-06, y el contrato dice explícitamente que móvil **no necesita replicar** `session` de la web (sección 5.4). **Veredicto: sin acción — no tocar**, solo se deja constancia de que la separación conceptual "puesto" vs. "sesión" ya existe en móvil aunque con nombres distintos.

## 10 · `order`

Móvil: `src/modules/room-service/dtos/order.dto.ts`. Contrato: sección 3.9.

| Campo móvil | Campo contrato | Tipo móvil | Tipo contrato | Veredicto |
|---|---|---|---|---|
| `id` | `id` | `string` | `string` | ✅ |
| — | `booking_id` | — | `string` | ➖ **crítico** — sin este campo no hay forma de conectar el pedido con la reserva/cuenta |
| `room_id` | `room_id` | `string` | `string` | ✅ |
| `guest_id` | `guest_id?` | `string` (obligatorio) | `string` (opcional) | 🔁 opcionalidad |
| `items[].unit_price` | `items[].unit_price_cents` | `number` (quetzales decimales) | `number` (centavos, entero) | 🔁 **trampa de montos** |
| `status` | `status` | 8 literales: `pending, accepted, preparing, ready, onTheWay, delivered, rejected, cancelled` | los mismos 8, mismas transiciones | ✅ **coincide exactamente**, incluidas las transiciones (`ORDER_STATUS_TRANSITIONS` ya replica sección 4 del handoff) |
| `rejection_reason` | *(no existe en el contrato)* | `string \| null` | — | ➕ reportar — funcionalidad real de MOV-08 (motivo de rechazo) |
| `notes` | `notes?` | `string \| null` | `string` (opcional) | 🔁 estilo, equivalente |
| `subtotal` / `tax` / `total` | *(el contrato no modela impuesto ni total; solo `items[].unit_price_cents`)* | `number` × 3 | — | ➕ reportar — decisión de negocio: ¿el contrato asume que no hay IVA, o el cálculo se hace en otro lado? |
| `charged_to_room` | *(no existe; el mecanismo real de cargo es `charge_id` → `charge`, sección 5.3)* | `boolean` | — | ➕ **hallazgo importante** — móvil ya construyó un mecanismo de cargo propio que no coincide con el que el contrato define y que, según el handoff, nadie ha implementado todavía. No inventar el reemplazo (Fase 4). |
| — | `currency` (`'GTQ'`) | — | `'GTQ'` | ➖ |
| — | `charge_id?` | — | `string` | ➖ (no llenar — sección 7.4 del handoff) |
| — | `requested_at` | — | `string` | ➖ |
| `created_at` / `updated_at` | `created_at` / `updated_at` | `string` | `string` | ✅ |
| `delivered_at` | *(no existe en el contrato)* | `string \| null` | — | ➕ reportar |

## 11 · `service-request`

Móvil: `src/modules/requests/dtos/service-request.dto.ts`. Contrato: sección 3.10.

| Campo móvil | Campo contrato | Tipo móvil | Tipo contrato | Veredicto |
|---|---|---|---|---|
| `id` | `id` | `string` | `string` | ✅ |
| — | `booking_id` | — | `string` | ➖ **crítico** |
| `room_id` | `room_id` | `string` | `string` | ✅ |
| `guest_id` | `guest_id?` | `string` (obligatorio) | `string` (opcional) | 🔁 opcionalidad |
| `category` | `type` | `'cleaning'\|'items'\|'concierge'` | `'housekeeping'\|'concierge'\|'maintenance'\|'other'` | 🔤🔁 nombre y taxonomía incompatibles: `'items'` no existe en el contrato, `'maintenance'`/`'other'` no existen en móvil |
| `assigned_role` | *(no existe — sección 7.7 del handoff lo confirma explícitamente: no hay campo "asignado a")* | `StaffRole` | — | ➕ **hallazgo bloqueado** — móvil ya construyó asignación por rol; el contrato no la soporta. No inventar el campo del lado del contrato (Fase 4). |
| `title` | *(no existe; el contrato solo tiene `description`)* | `string` | — | ➕ reportar |
| `description` | `description` | `string` | `string` | ✅ |
| `items` | *(no existe en `service_request` del contrato — solo `order` tiene `items`)* | `{name, quantity}[] \| null` | — | ➕ reportar — funcionalidad real de HU-15 (solicitar artículos) |
| `preferred_time` | *(no existe en el contrato)* | `string \| null` | — | ➕ reportar — funcionalidad real de HU-14 (horario preferido de limpieza) |
| `status` | `status` | 5 literales: `pending, accepted, inProgress, completed, rejected` | los mismos 5, mismas transiciones | ✅ **coincide exactamente**, incluidas las transiciones |
| `rejection_reason` + `staff_notes` | `notes?` (un solo campo) | `string \| null` × 2 | `string` (opcional) | 🔁 dos campos vs. uno |
| — | `charge_id?` | — | `string` | ➖ (no llenar) |
| — | `requested_at` | — | `string` | ➖ |
| `created_at` / `updated_at` | `created_at` / `updated_at` | `string` | `string` | ✅ |

## 12 · Entidades fuera del contrato, sin acción

`notification` y `cart-item` — confirmado en el handoff (sección 3.11) que son conceptos exclusivos de móvil, sin equivalente en la web. No requieren reconciliación.

---

## 13 · Módulo `tasks` (MOV-07/MOV-08): ¿asume una sola máquina de estados?

**No.** Revisé `src/modules/tasks/models/task.model.ts` y `src/modules/tasks/services/task-transition.service.ts`:

- `TaskStatus` está definido como `ServiceRequestStatus | OrderStatus` — una unión de tipos, no una tabla de transición fusionada.
- `getStatusLabel`, `getStatusColor`, `getValidNextStatuses` e `isTerminalStatus` reciben `entityType: 'order' | 'serviceRequest'` y despachan explícitamente a `ORDER_STATUS_TRANSITIONS` o a `SERVICE_REQUEST_STATUS_TRANSITIONS` según corresponda — nunca comparan valores de una máquina contra la tabla de la otra.
- `task-transition.service.ts` expone `canTransitionOrder`, `canTransitionServiceRequest` y `canTransitionRoom` como funciones separadas, cada una contra su propia tabla en `statuses.ts`.

La bandeja genérica ya está construida correctamente para dos máquinas independientes — **no hace falta separar nada en el módulo `tasks`**. El único problema de máquinas de estado está en `room` (tabla 1): ahí sí hay una sola máquina (`RoomStatus`/`ROOM_STATUS_TRANSITIONS`) donde el contrato exige dos. Ese split ocurre en `shared/constants/statuses.ts` (paso 2.1) y se propaga a `room.dto/model/mapper` (2.2), `housekeeping.service.ts` y `shared/theme/colors.ts` (`statusColors.room` también deberá dividirse en dos, ya que hoy mezcla `dirty/cleaning/clean/inspected/blocked` en una sola entrada con un `satisfies` que fuerza cobertura completa — ese mismo mecanismo hará que el compilador exija los colores nuevos de ocupación).

---

## 14 · Hallazgo adicional no pedido explícitamente: bug de desplazamiento de fecha civil, ya presente

`src/modules/booking/mappers/booking.mapper.ts:7-8` hace `new Date(dto.check_in_date)` y `new Date(dto.check_out_date)` directamente sobre las fechas civiles `YYYY-MM-DD` para calcular `nights`. Es exactamente el caso que el handoff advierte en la sección 2 (tabla de fechas): `new Date("2026-09-10")` se interpreta como medianoche UTC, y en Guatemala (UTC-6) `getDate()`/cualquier formateo local puede mostrar el día anterior. No afecta el cálculo de `nights` en sí (la resta de dos `Date` UTC-medianoche da la diferencia correcta en días), pero si `checkInDate`/`checkOutDate` se muestran alguna vez con un formateador que use la zona horaria local del dispositivo, se corre el riesgo de desplazamiento. Se corrige en el paso 2.1/2.2 con una utilidad equivalente a `toDomainCalendarDate` del contrato.

No hay actualmente ninguna utilidad de fecha civil segura en `src/shared/utils/date.ts` (solo existe `formatElapsedTime`), ni ninguna utilidad de moneda en `src/shared/utils/formatters.ts` (el archivo está vacío). Ambas se crean en la Fase 2.

---

## 15 · Resumen de la trampa de montos (valores reales de `src/data/db.ts`, antes de tocar nada)

Todos estos campos están hoy en quetzales decimales (`number` simple) y deben migrar a `_cents` enteros (× 100) en el paso 2.3:

| Entidad.campo | Ejemplo actual | Ejemplo esperado tras ×100 |
|---|---|---|
| `room.price_per_night` | `320` | `32000` |
| `booking.total_price` | `3360` | `336000` |
| `product.price` | `55` | `5500` |
| `order.items[].unit_price` | `55` | `5500` |
| `order.subtotal` | `73` | `7300` |
| `order.tax` | `9` | `900` |
| `order.total` | `82` | `8200` |

(Tabla completa valor-por-valor se genera en el paso 2.3, no aquí — esto es solo la muestra que confirma el patrón para todos los registros.)

---

## 16 · Huecos que este diagnóstico NO resuelve (documentados, no inventados)

- **División de `guests_count` en `adults`/`children`** (booking): no hay fuente de verdad para el split. Al migrar `db.ts` (paso 2.3) se documentará como una suposición explícita (ej. todos adultos, 0 niños) — no una decisión de equipo como las de la sección 7 del handoff, pero sí una que debe quedar anotada y visible en el PR.
- **Taxonomía de `product.category` / `amenity.category`**: el contrato mismo las marca provisionales (sección 7.3 del handoff). Se adoptan los literales exactos del contrato de todos modos (son el valor actual, no una invención), pero no se construye ninguna pantalla que agrupe por categoría.
- **Formato de `sku`**: se agrega el campo, sin validación de formato.
- **Mecanismo de cargo (`charge_id`)**: se agrega el campo a `order`/`service_request`, no se llena, no se reemplaza `charged_to_room` por un mecanismo inventado — queda documentado como divergencia sin resolver.
- **`assigned_role` en `service_request`**: no tiene campo equivalente en el contrato. No se elimina (es funcionalidad real de móvil) ni se inventa su equivalente en el contrato — queda como divergencia a proponer al equipo (sección 9 del handoff).
- **Autenticación de personal (`user.password`, `session` de móvil)**: no se toca, per regla de Fase 4.
- **Lookup por `guest_link_code`**: no existe implementación de referencia en la web; queda anotado, no se construye en esta reconciliación (es de MOV-14).
