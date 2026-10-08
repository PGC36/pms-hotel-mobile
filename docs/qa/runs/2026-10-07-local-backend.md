# QA run - 2026-10-07 - local backend

- Rama mobile: `feature/flujos-moviles`
- Commit mobile: `d2fbe01`
- Base integrada: `develop` hasta `d2fbe01`
- Backend repo/rama/commit: `pms-hotel-boutique-backend`, `develop`, `3438527`
- PostgreSQL seed o dump: seed local de demo descartable
- API base URL usada por Expo Android: `http://10.0.2.2:8080/api/v1`
- API base URL usada por validacion CLI local: `http://localhost:8080/api/v1`
- Dispositivo: Android emulator `Medium_Phone_API_37.0` via Expo Go; backend y PostgreSQL locales
- Android/iOS/Web: Android ejecutado; iOS no disponible en esta maquina; Web no usado para cierre porque el navegador embebido no expone `window.fetch`
- Ejecutado por: Codex

## Resultados

| Caso     | Resultado                  | Evidencia                                                                                                                                                                                                                                                       | Bug                                                                            |
| -------- | -------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------ |
| AUTH-01  | Pass API + Android UI      | Login huesped con `carlos.demo@aurora.test` entra a Estadia. Captura: `docs/qa/runs/evidence/qa-android-guest-stay.png`. API: `GET /guest/stay` devuelve habitacion `202` y saldo `316200`.                                                                     |                                                                                |
| AUTH-02  | Pass API                   | `POST /guest/auth/login` con password incorrecta responde 401.                                                                                                                                                                                                  |                                                                                |
| AUTH-03  | Pass API                   | `POST /guest/auth/login` con `ana.demo@aurora.test` responde 400 por estancia no activa/vencida en el seed actual.                                                                                                                                              |                                                                                |
| AUTH-04  | Pass Android UI            | Tras cerrar Expo Go y reabrir `exp://192.168.1.10:8081`, la app restaura sesion de Carlos y vuelve a Estadia. Captura: `docs/qa/runs/evidence/qa-android-session-restore.png`.                                                                                  |                                                                                |
| AUTH-05  | Pass Android UI            | Logout huesped muestra confirmacion inline y vuelve al login. Captura: `docs/qa/runs/evidence/qa-android-logout-confirmed.png`.                                                                                                                                 |                                                                                |
| AUTH-06  | Blocked                    | No se invalido token desde backend ni se altero expiracion del seed durante esta corrida.                                                                                                                                                                       |                                                                                |
| AUTH-07  | Pass API + Android UI      | Staff auth real funciona: `POST /auth/login` emite tokens para housekeeping, room service y concierge. Android: `limpieza@aurora.test` muestra solo Limpieza; `roomservice@aurora.test` muestra solo Room Service.                                              | [#28](https://github.com/PGC36/pms-hotel-mobile/issues/28) cerrado/actualizado |
| PERM-01  | Pass API + Android UI      | Con JWT housekeeping, `GET /housekeeping/rooms` responde 200. Android muestra habitaciones reales desde backend. Captura: `docs/qa/runs/evidence/qa-android-staff-housekeeping-logged.png`.                                                                     |                                                                                |
| PERM-02  | Pass API                   | Con token room service, `GET /housekeeping/rooms` responde 403. En Android, rol Room Service solo monta tab Room Service.                                                                                                                                       |                                                                                |
| PERM-03  | Pass API                   | Con token housekeeping, `GET /room-service/products` responde 403. En Android, rol Limpieza solo monta tab Limpieza.                                                                                                                                            |                                                                                |
| PERM-04  | Pass API                   | Con token real de huesped, `GET /housekeeping/rooms` responde 403.                                                                                                                                                                                              |                                                                                |
| HK-01    | Pass API + Android UI      | Con JWT housekeeping, `GET /housekeeping/rooms` responde 200 con 5 habitaciones. Android muestra estados reales: inspeccionada, en limpieza y limpia.                                                                                                           |                                                                                |
| HK-02    | Pass API + persistencia    | No quedaba habitacion `dirty` disponible en esta segunda corrida porque validaciones previas ya avanzaron el seed; la persistencia de `start` quedo observable en habitaciones `cleaning` (`102` y `T92d07e3b`) consultadas por API y UI.                       |                                                                                |
| HK-03    | Fail/Blocked confirmado    | `POST /housekeeping/rooms/{id}/complete` sobre habitacion `cleaning` responde 409. Backend exige checklist de turnover y la app movil no expone ese checklist.                                                                                                  | [#29](https://github.com/PGC36/pms-hotel-mobile/issues/29)                     |
| HK-04    | Fail/Blocked confirmado    | `POST /housekeeping/rooms/{id}/inspect` sobre habitacion `clean` responde 409. Backend exige checklist completado y la app movil no expone ese checklist.                                                                                                       | [#29](https://github.com/PGC36/pms-hotel-mobile/issues/29)                     |
| RS-01    | Pass API + Android UI      | Con JWT room service, `GET /room-service/products` responde 200. Android huesped muestra productos reales (`Agua mineral demo`, `Cafe aurora demo`, `Sandwich demo`). Captura: `docs/qa/runs/evidence/qa-android-guest-room-service.png`.                       |                                                                                |
| RS-02    | Pass API + persistencia    | Pedido creado desde `/guest/room-service/orders` aparece para staff en `GET /room-service/orders/{id}` con estado `pending`.                                                                                                                                    |                                                                                |
| RS-03    | Pass API + PostgreSQL      | Pedido `11b5a468-2966-47ab-8d22-5531fd7d7075` avanzo `pending -> accepted -> preparing -> ready -> on_the_way -> delivered`; cada `POST /status` fue confirmado con `GET`. PostgreSQL confirma `status=delivered` y `charge_id is not null`.                    |                                                                                |
| RS-05    | Pass API + PostgreSQL      | Pedido `6338776e-06ac-4a8f-8b32-4c6423821410` creado por huesped se cancelo desde `/guest/room-service/orders/{id}/cancel`; PostgreSQL confirma `status=cancelled`.                                                                                             |                                                                                |
| GUEST-01 | Pass API + Android UI      | Estadia de Carlos muestra habitacion `202 (Deluxe Demo)`, fechas `2026-10-05` a `2026-10-08`, estado `checked_in` y folio `Q 3,174.00`.                                                                                                                         |                                                                                |
| GUEST-02 | Pass Android UI            | Navegacion de portal huesped validada: Estadia, Servicios, Room Service y Avisos. Capturas en `docs/qa/runs/evidence/`: `qa-android-guest-services-2.png`, `qa-android-guest-room-service.png`, `qa-android-guest-notifications-2.png`.                         |                                                                                |
| GUEST-03 | Pass API + Android UI      | `GET /guest/room-service/products`, `POST /guest/room-service/orders`, `GET /guest/room-service/orders/{id}` y cancelacion funcionan con token de huesped. Android muestra menu y carrito/pedidos accesibles.                                                   |                                                                                |
| GUEST-04 | Pass API + PostgreSQL      | `POST /guest/housekeeping/requests` crea solicitud `9a3e0e9b-28c5-4499-a5c3-eee413640a32` en `pending`; `POST /guest/concierge/requests` crea solicitud `e0fe1233-4118-4889-9d50-a05bd5e1222b` y `POST /cancel` la deja `cancelled`. PostgreSQL confirma ambos. |                                                                                |
| NOTIF-01 | Pass API + PostgreSQL + UI | `GET /guest/notifications/unread-count` paso de 14 a 13 al marcar lectura `ec6f1410-a34d-4dd3-a864-ea739a42edb1`; PostgreSQL confirma `read_at is not null`. Android Avisos muestra contador `13`.                                                              |                                                                                |

## Evidencia PostgreSQL directa

```sql
select id,status,charge_id is not null as has_charge
from orders
where id in ('11b5a468-2966-47ab-8d22-5531fd7d7075','6338776e-06ac-4a8f-8b32-4c6423821410');
-- delivered / has_charge=true; cancelled / has_charge=false

select id,type,status
from service_requests
where id in ('9a3e0e9b-28c5-4499-a5c3-eee413640a32','e0fe1233-4118-4889-9d50-a05bd5e1222b');
-- housekeeping pending; concierge cancelled

select id,read_at is not null as is_read
from guest_notifications
where id = 'ec6f1410-a34d-4dd3-a864-ea739a42edb1';
-- is_read=true
```

## Hallazgos

- Backend local saludable: `GET /api/v1/health` responde `{"status":"UP"}`.
- Android se valido con el AVD `Medium_Phone_API_37.0`; el AVD `Pixel_8` quedo descartado porque su servicio `pm` respondia `Broken pipe` e impedia instalar/abrir Expo Go.
- `carlos.demo@aurora.test` es el huesped activo util para esta fecha; `ana.demo@aurora.test` ahora cubre el caso de estancia no activa/vencida.
- Despues de integrar `develop`, staff auth real ya funciona en codigo, backend y Android; #28 deja de ser bloqueante para esta rama.
- La autorizacion real por rol funciona en endpoints probados y se refleja en UI por tabs filtradas: housekeeping solo ve Limpieza, room service solo ve Room Service.
- Housekeeping mantiene una brecha de contrato: backend exige checklist de turnover para `complete` e `inspect`, pero la app movil solo implementa botones de transicion sin checklist.
- Room Service ya no queda bloqueado por falta de pedido no terminal: el flujo de huesped crea pedidos `pending` reproducibles; staff los ve si no se entregan/cancelan en la misma corrida.

## Bugs abiertos

- [#29](https://github.com/PGC36/pms-hotel-mobile/issues/29) - Housekeeping complete/inspect falla por checklist requerido por backend.

## Bugs resueltos o no bloqueantes

- [#28](https://github.com/PGC36/pms-hotel-mobile/issues/28) - Resuelto por merge de `develop`: staff auth real ya llama `/auth/login`, guarda tokens y funciona en Android.
- [#30](https://github.com/PGC36/pms-hotel-mobile/issues/30) - No bloquea #25: se puede crear un pedido `pending` reproducible desde el flujo real de huesped y avanzar/cancelar contra backend.

## Limitaciones

- iOS no ejecutado porque no hay Mac/simulador/dispositivo iOS disponible en esta maquina.
- `AUTH-06` queda bloqueado: no se invalido token ni se forzo expiracion desde backend durante esta corrida.
- No se probo un segundo tamano Android real; se intento `Pixel_8`, pero el AVD estaba inestable (`pm list packages` fallaba con `Broken pipe`). La validacion visual completa se hizo en `Medium_Phone_API_37.0`.
