# QA movil con backend y PostgreSQL reales

Guia de trabajo para la issue [#25](https://github.com/PGC36/pms-hotel-mobile/issues/25): validar los flujos moviles contra un backend y una base PostgreSQL de QA/local, con datos descartables y evidencia reproducible. Este documento no marca casos como aprobados hasta que se ejecuten contra el entorno real.

## Estado actual de la app

| Area                                               | Estado en `feature/flujos-moviles`           | Origen de datos                                  | Alcance QA                                                                         |
| -------------------------------------------------- | -------------------------------------------- | ------------------------------------------------ | ---------------------------------------------------------------------------------- |
| Login de personal                                  | Implementado contra `POST /auth/login`       | API real                                         | Validar token, refresh/logout, restauracion y navegacion filtrada por rol          |
| Login de huesped                                   | Implementado contra `POST /guest/auth/login` | API real                                         | Validar token, errores 401/403, restauracion y limpieza de sesion                  |
| Estadia de huesped                                 | Implementada contra `GET /guest/stay`        | API real                                         | Validar resumen, folio, expiracion de token y cierre de sesion                     |
| Housekeeping habitaciones                          | Implementado contra API real                 | `GET/POST /housekeeping/rooms`                   | Validar `dirty -> cleaning -> clean -> inspected` y persistencia                   |
| Housekeeping solicitudes, desperfectos e historial | Mock local                                   | `src/data/db.ts`                                 | No cuenta como persistencia real; documentar como no aplicable para escritura real |
| Room Service personal                              | Implementado contra API real                 | `/room-service/products`, `/room-service/orders` | Validar transiciones, notas, cancelacion, rechazo, cargo a folio y persistencia    |
| Conserjeria personal                               | Placeholder                                  | No aplica                                        | Registrar como contrato faltante                                                   |
| Room Service huesped                               | Montado en `GuestNavigator`                  | API real                                         | Validar menu, carrito, creacion/cancelacion de pedidos y seguimiento               |
| Solicitudes de huesped                             | Montado en `GuestNavigator`                  | API real                                         | Validar creacion/cancelacion de housekeeping y concierge                           |
| Amenidades/notificaciones/perfil                   | Amenidades y notificaciones montadas         | API real parcial                                 | Validar listado/lectura de notificaciones; perfil queda fuera si no hay contrato   |

## Entorno requerido

- Rama movil: `feature/flujos-moviles`.
- Backend: QA/local, nunca produccion.
- PostgreSQL: QA/local con datos descartables.
- App: Expo con `.env.local` apuntando a la API incluyendo `/api/v1`.
- Android emulator: usar `http://10.0.2.2:8080/api/v1`.
- Web o simulador iOS local: usar `http://localhost:8080/api/v1`.
- Dispositivo fisico: usar `http://<IP-LAN-del-equipo>:8080/api/v1`, no `localhost`.

Comandos base:

```bash
npm install
npx tsc --noEmit
npm run lint
npx expo start
```

## Seed minimo reproducible

El seed debe vivir en backend/PostgreSQL o en una receta documentada del repo backend. No usar datos de produccion.

| Dato                       | Requisito                                                                                                                    |
| -------------------------- | ---------------------------------------------------------------------------------------------------------------------------- |
| Usuario housekeeping       | Cuenta activa con rol housekeeping y JWT valido para endpoints de habitaciones                                               |
| Usuario room service       | Cuenta activa con rol room service y permisos sobre pedidos/productos                                                        |
| Usuario concierge          | Cuenta activa aunque la app movil solo muestre placeholder, para validar permisos negativos si hay endpoints                 |
| Huesped activo             | Email/password con estadia activa, `bookingId`, habitacion y folio abierto                                                   |
| Huesped sin estadia activa | Email/password para validar error de negocio                                                                                 |
| Habitaciones               | Al menos una en cada `housekeepingStatus`: `dirty`, `cleaning`, `clean`, `inspected`                                         |
| Pedidos                    | Al menos uno en cada estado: `pending`, `accepted`, `preparing`, `ready`, `on_the_way`, `delivered`, `rejected`, `cancelled` |
| Productos                  | Producto activo con stock, producto inactivo y producto con stock insuficiente                                               |
| Folio                      | Reserva con folio que permita cargo al entregar un pedido                                                                    |

## Matriz de validacion

### Autenticacion y sesion

| ID      | Caso                       | Pasos                                        | Evidencia esperada                                                 |
| ------- | -------------------------- | -------------------------------------------- | ------------------------------------------------------------------ |
| AUTH-01 | Login huesped valido       | Iniciar sesion con huesped activo            | App entra a `Stay`; token guardado; `GET /guest/stay` responde 200 |
| AUTH-02 | Login huesped invalido     | Usar password incorrecta                     | Mensaje en espanol; no queda token ni sesion                       |
| AUTH-03 | Huesped sin estadia activa | Login con cuenta seed sin estadia            | Mensaje de estadia no activa; no entra al arbol de huesped         |
| AUTH-04 | Restauracion               | Cerrar app o recargar; abrir de nuevo        | Sigue en experiencia huesped y consulta `GET /guest/stay`          |
| AUTH-05 | Logout huesped             | Cerrar sesion desde estadia                  | Token y sesion se limpian; vuelve a login                          |
| AUTH-06 | Expiracion token           | Invalidar token en backend y recargar `Stay` | App limpia sesion o muestra error seguro sin datos viejos          |
| AUTH-07 | Login personal real        | Entrar con cuentas README                    | App entra al arbol staff filtrado por rol y guarda tokens reales   |

### Permisos por rol

| ID      | Caso                                  | Pasos                                              | Evidencia esperada                          |
| ------- | ------------------------------------- | -------------------------------------------------- | ------------------------------------------- |
| PERM-01 | Housekeeping accede a habitaciones    | Usar JWT housekeeping y abrir Limpieza             | `GET /housekeeping/rooms` responde 200      |
| PERM-02 | Room service no accede a housekeeping | Probar endpoint housekeeping con JWT room service  | Backend responde 403; ocultar tab no cuenta |
| PERM-03 | Housekeeping no accede a room service | Probar endpoints room-service con JWT housekeeping | Backend responde 403                        |
| PERM-04 | Huesped no accede a endpoints staff   | Probar endpoint staff con JWT de huesped           | Backend responde 403                        |

### Housekeeping real

| ID    | Caso                 | Pasos                                         | Evidencia esperada                                                          |
| ----- | -------------------- | --------------------------------------------- | --------------------------------------------------------------------------- |
| HK-01 | Listado real         | Abrir Limpieza                                | Habitaciones llegan desde `GET /housekeeping/rooms`; sin mocks              |
| HK-02 | `dirty -> cleaning`  | Tomar habitacion dirty y tocar iniciar        | `POST /start` responde habitacion actualizada; al recargar sigue `cleaning` |
| HK-03 | `cleaning -> clean`  | Completar limpieza                            | `POST /complete`; al volver al listado persiste `clean`                     |
| HK-04 | `clean -> inspected` | Inspeccionar habitacion                       | `POST /inspect`; persistencia tras reinicio/login                           |
| HK-05 | Transicion invalida  | Intentar accion no permitida o repetir accion | Backend responde 400/409; UI no muestra cambio como guardado                |
| HK-06 | No encontrada        | Abrir detalle de `roomId` inexistente         | 404 traducido a estado de error/reintento                                   |
| HK-07 | Desconexion          | Apagar backend o cortar red antes de accion   | Error seguro; reintento recupera; no queda cambio optimista falso           |

### Room Service staff real

| ID    | Caso                     | Pasos                                                                        | Evidencia esperada                                                           |
| ----- | ------------------------ | ---------------------------------------------------------------------------- | ---------------------------------------------------------------------------- |
| RS-01 | Menu real                | Abrir Menu                                                                   | Productos llegan de `GET /room-service/products` y se agrupan por categoria  |
| RS-02 | Bandeja real             | Abrir Room Service                                                           | Pedidos no terminales llegan de `GET /room-service/orders`                   |
| RS-03 | Flujo feliz              | Avanzar `pending -> accepted -> preparing -> ready -> onTheWay -> delivered` | Cada POST persiste; al entregar aparece `chargeId` si backend registra cargo |
| RS-04 | Rechazo con motivo       | Rechazar pedido `pending` sin y con motivo                                   | Sin motivo no envia; con motivo persiste en `notes`                          |
| RS-05 | Cancelacion permitida    | Cancelar desde `pending`, `accepted`, `preparing` o `ready`                  | Estado `cancelled`; inventario devuelto si aplica                            |
| RS-06 | Cancelacion no permitida | Intentar cancelar desde `onTheWay`                                           | No se ofrece o backend rechaza; no persiste cambio falso                     |
| RS-07 | Edicion de notas         | Editar notas de pedido no terminal                                           | `PATCH /notes` persiste; recargar detalle conserva texto                     |
| RS-08 | Folio/inventario         | Aceptar sin stock o entregar sin folio valido                                | Error backend traducido; estado original conservado                          |
| RS-09 | Historial                | Abrir historial                                                              | Terminales (`delivered`, `rejected`, `cancelled`) visibles y consistentes    |

### Huesped y accesos rapidos

| ID       | Caso                 | Pasos                                         | Evidencia esperada                                     |
| -------- | -------------------- | --------------------------------------------- | ------------------------------------------------------ |
| GUEST-01 | Estadia              | Login huesped activo                          | Habitacion, fechas y saldo vienen de `GET /guest/stay` |
| GUEST-02 | Accesos rapidos      | Revisar botones/links desde Stay              | Registrar cuales estan montados y cuales no aplican    |
| GUEST-03 | Room Service huesped | Navegar a Room Service, crear/cancelar pedido | Pedido real persiste en backend/PostgreSQL             |
| GUEST-04 | Solicitudes huesped  | Crear solicitud housekeeping/concierge        | Solicitud real persiste en backend/PostgreSQL          |

## Errores obligatorios

Cada modulo con API real debe probar, cuando sea posible:

- 401 sin token o token expirado.
- 403 con rol incorrecto.
- 404 para recurso inexistente.
- 409 o 400 para transicion invalida/conflicto de estado.
- Backend apagado o red desconectada.
- Respuesta 204 o cuerpo vacio, cuando el endpoint lo permita.
- Reintento desde `ErrorState` o navegacion de recarga.

## Evidencia de ejecucion

Crear un archivo por corrida en `docs/qa/runs/` con este formato:

```markdown
# QA run - YYYY-MM-DD - entorno

- Rama mobile:
- Commit mobile:
- Backend repo/rama/commit:
- PostgreSQL seed o dump:
- API base URL usada por Expo:
- Dispositivo:
- Android/iOS/Web:
- Ejecutado por:

## Resultados

| Caso    | Resultado            | Evidencia               | Bug |
| ------- | -------------------- | ----------------------- | --- |
| AUTH-01 | Pass/Fail/Blocked/NA | captura/log/consulta BD | #   |

## Bugs abiertos

- #XX - titulo - modulo - severidad

## Limitaciones

- iOS no ejecutado porque:
- Dispositivo fisico no ejecutado porque:
```

## Bugs separados

Abrir una issue por fallo reproducible. Usar este formato minimo:

- Area: mobile, backend, permisos, seed o entorno.
- Entorno: mobile commit, backend commit, base URL y seed.
- Pasos exactos.
- Resultado actual.
- Resultado esperado.
- Evidencia: captura, log o consulta backend/BD.
- Impacto: bloqueante, alto, medio o bajo.

## Automatizacion viable

Hoy el repo no tiene runner de pruebas (`jest`, `vitest` o React Native Testing Library). Para esta issue:

1. Mantener `npx tsc --noEmit` y `npm run lint` como verificacion obligatoria.
2. Agregar pruebas unitarias de funciones puras cuando se incorpore un runner: `cart.service.ts`, mappers y validaciones de transicion.
3. Agregar pruebas de contrato HTTP con mock para `createHttpClient`, traduccion de errores y payloads de servicios; estas no cuentan como evidencia de persistencia real.
4. Separar cualquier smoke real contra backend en documentacion o scripts opt-in que requieran `EXPO_PUBLIC_API_BASE_URL` y un seed descartable.
