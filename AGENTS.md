# AGENTS.md

Guía para agentes de IA (Claude Code, Codex, Copilot, Cursor u otro) que trabajen en este repositorio. Para la explicación completa de la arquitectura y sus porqués, ver `architecture.md`. Para el plan de tickets y las historias de usuario, ver `docs/plan-app-movil.md`, `docs/Tickets/` y `docs/historias-de-usuario.md`.

## Estado del proyecto

- **MOV-02** (completado, en `develop`): scaffold de Expo — `App.tsx`, `package.json`, `tsconfig.json`, `babel.config.js` y la estructura completa de `src/`.
- **MOV-03** (completado, en `develop`): sistema de diseño — `shared/theme/{colors,typography,spacing}.ts` y los 7 componentes de `shared/components/` (`Button`, `Card`, `Input`, `Badge`, `EmptyState`, `LoadingState`, `ErrorState`). El catálogo temporal (`shared/screens/ComponentCatalogScreen.tsx`) ya no está montado en `App.tsx` — lo reemplazó la navegación real de MOV-06 — pero el archivo sigue ahí como referencia de componentes.
- **MOV-04** (completado, en `develop`): contratos de dominio — `shared/constants/{roles,permissions,statuses}.ts` y el DTO/Model/Mapper de las 9 entidades (`user`, `guest`, `room`, `booking`, `service-request`, `order`, `product`, `amenity`, `notification`). `data/db.ts` ya tiene datos realistas y coherentes (no placeholders): 6 usuarios, 15 habitaciones, 10 huéspedes con reserva, 20 solicitudes, 20 pedidos, 25 productos, 8 amenidades, 10 notificaciones, en quetzales guatemaltecos (GTQ). `shared/theme/colors.ts` deriva sus tipos de estado de `statuses.ts`, no al revés.
- **MOV-05** (completado, en `develop`): capa de servicios — `shared/services/{delay,http-client,simulate-error}.ts` y `*.service.ts` en `auth`, `housekeeping`, `room-service` (`order` + `menu`), `requests` y `tasks/services/task-transition.service.ts` (valida transiciones para los tres, reutilizado por los demás). Todo servicio pasa por `delay()` (300–600 ms) y puede fallar a demanda con `forceNextFailure()` de `simulate-error.ts`. `http-client.ts` existe pero ningún servicio lo usa todavía — siguen leyendo `data/db.ts` directamente y mutando sus arrays en memoria para simular persistencia.
- **MOV-06** (completado, fusionado a `develop` vía PR #10): navegación raíz y autenticación — `AuthContext` (Context + `useReducer`, sesión `staff | guest`, persistida vía `shared/services/storage.ts` sobre `@react-native-async-storage/async-storage`) y los cuatro navegadores (`RootNavigator`, `AuthNavigator`, `StaffNavigator` con tabs filtradas por rol, `GuestNavigator` declarado vacío). `App.tsx` ya monta `<AuthProvider><RootNavigator /></AuthProvider>` como pantalla real de la app. Las pestañas de `StaffNavigator` y la pantalla de `GuestNavigator` muestran `shared/screens/ComingSoonScreen.tsx` hasta que MOV-09/10/11/15+ agreguen contenido real; `LinkBookingScreen` es un stub hasta MOV-14.
- **MOV-07** (completado, en `feature/mov-07`): módulo `tasks`, bandeja genérica — `models/task.model.ts` (tipo `TaskModel`/`TaskEntityType`/`TaskStatus` + `getStatusLabel`/`getStatusColor`; no importa `ServiceRequestModel` ni `OrderModel` para no invertir la dependencia de `architecture.md` sección 3 — quien arma la bandeja por rol, en MOV-09/10/11, construye el `TaskModel` a partir de su propio Model), `components/{TaskCard,TaskFilters,StatusBadge}.tsx` y `screens/TaskListScreen.tsx` (recibe `fetchTasks` + `config` por props; estado con `useReducer` para no violar `react-hooks/set-state-in-effect`; pull-to-refresh con `RefreshControl`; ordena por antigüedad ascendente). Agrega `ORDER_STATUS_LABELS`/`SERVICE_REQUEST_STATUS_LABELS` a `shared/constants/statuses.ts` (mismo patrón que `STAFF_ROLE_LABELS` en `roles.ts`) y `formatElapsedTime` a `shared/utils/date.ts`. `TaskDetailScreen.tsx` y `StatusStepper.tsx` siguen vacíos — son de MOV-08. Verificado con `tsc`/`eslint` limpios y un smoke test manual (bundle de Expo Web compiló sin errores con datos mock de `ServiceRequest` y `Order`); sin verificación visual en navegador por no haber extensión de Chrome disponible en este entorno.
- El resto de pantallas y componentes de módulos de dominio siguen siendo placeholders vacíos — llegan en MOV-08 en adelante. No asumas que un archivo tiene contenido solo porque existe: verifica antes de editar.
- Mantén esta sección al día cada vez que termines un ticket de Fase 0/1/2 — así el siguiente agente no tiene que reconstruir el estado leyendo commits.

## Comandos

```bash
npm install
npx expo start        # servidor de desarrollo
npm run lint           # ESLint (eslint-config-expo)
npm run format          # Prettier — escribe cambios
npm run format:check    # Prettier — solo verifica
npx tsc --noEmit        # chequeo de tipos (usa el alias @/ vía tsconfig paths)
```

`npm run lint` y `npx tsc --noEmit` deben correr limpios antes de dar por terminado cualquier cambio.

## Reglas no negociables

1. **Ninguna pantalla ni componente importa de `src/data/` directamente.** Todo acceso a datos pasa por un servicio de módulo (`*.service.ts`). Ver `architecture.md` sección 2.
2. **Los servicios son siempre `async`, siempre devuelven Models, nunca DTOs.** El Mapper es el único código que conoce ambas formas.
3. **Las transiciones de estado (`Order`, `ServiceRequest`, `Room`) se validan contra `shared/constants/statuses.ts`.** No agregues condicionales de estado sueltos en una pantalla.
4. **`room-service` y `requests` son de doble audiencia:** un solo DTO/Model/Mapper/Service; solo las carpetas `staff/` y `guest/` dentro del módulo se separan. No dupliques la capa de datos para crear una versión "de huésped" de un pedido o solicitud que ya existe para personal.
5. **Todo el código en inglés** (archivos, carpetas, variables, funciones, tipos, claves de datos). El español se usa solo en texto visible al usuario final, comentarios explicativos y documentación.
6. **Sigue las convenciones de nombres** de `architecture.md` sección 6 (kebab-case para módulos y archivos de datos, PascalCase para componentes/pantallas/tipos, camelCase para funciones, SCREAMING_SNAKE_CASE para constantes).

## Cómo trabajar con los tickets

- Cada ticket `MOV-XX` en `docs/Tickets/` tiene tareas y criterios de aceptación explícitos. Antes de implementar algo que corresponda a un ticket, lee el ticket completo — no solo el título.
- Respeta las dependencias entre tickets (`Depende de:` en cada archivo). No implementes MOV-08 sin que MOV-07 esté resuelto, por ejemplo.
- Fase 1 (personal: limpieza, room service, conserjería) se construye antes que Fase 2 (huésped) — es una decisión deliberada, no un accidente de orden. Ver `architecture.md` sección 1.
- Si una tarea toca algo listado en "Pendientes de definición" (sección 9 de `docs/plan-app-movil.md`), pregunta antes de decidir por tu cuenta; son decisiones que el equipo aún no cerró. Paleta/tipografía (MOV-03) y moneda/formato de fecha (MOV-04, quetzales guatemaltecos) ya se resolvieron — quedan pendientes idioma de interfaz y el contrato de datos con la web privada.

## Datos simulados

Todo dato viene de `src/data/db.ts` (arrays con forma de DTO, poblado desde MOV-04) hasta que exista backend. Al agregar o modificar datos de prueba:

- Deben ser realistas (nombres, horarios, precios en quetzales guatemaltecos — GTQ), no relleno tipo "Test 1".
- Deben ser coherentes entre sí (un pedido o solicitud debe apuntar a una habitación y un huésped que existan en `db.ts`; los productos referenciados en un pedido también deben existir).
- Debe existir al menos un registro en cada estado posible de cada máquina de estados (`shared/constants/statuses.ts`).
- No confíes solo en `tsc`/`eslint` para esto: son estructurales, no verifican referencias cruzadas ni sumas (subtotal+tax=total, noches×tarifa=total). Antes de dar por terminado un cambio a `db.ts`, corre un script rápido (con `npx tsx`, sin agregar dependencias) que valide ids únicos, referencias existentes y esa aritmética.

## Al terminar un cambio

- Si el cambio corresponde a un ticket, marca sus checkboxes en `docs/Tickets/MOV-XX.md` solo cuando el criterio de aceptación correspondiente esté realmente cumplido.
- Si el cambio altera una decisión de arquitectura documentada en `architecture.md` o `docs/plan-app-movil.md`, actualiza el documento en el mismo cambio — no dejes que el documento quede desactualizado respecto al código.
- Al completar un ticket de Fase 0/1/2, actualiza también la sección "Estado del proyecto" de este archivo (qué MOV-XX está completo, qué existe ya y deja de ser placeholder, qué pendiente de definición se resolvió).
