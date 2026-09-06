# App Móvil — PMS Hotel Boutique · Plan de trabajo y decisiones
 
**Proyecto:** PMS para Hoteles Boutique
**Repositorio del PMS web:** `DougGM/pms-hotel-boutique`
**Repositorio móvil:** `pms-hotel-mobile` (por crear)
**Componente:** aplicación móvil nativa (React Native)
**Responsable:** una sola persona, en paralelo al resto del equipo que trabaja la web pública y la web privada
**Inicio:** Sprint 2 (2–15 sep)
**Última actualización:** 3 de septiembre de 2026 — v3

> **Nota:** este documento es el registro histórico de planificación y de las decisiones originales de arquitectura. Para la arquitectura vigente (capas, estructura de carpetas, convenciones, máquinas de estado) la fuente viva y actualizada es **`/architecture.md`** — si algo cambia respecto a lo descrito aquí, se actualiza allá, no en este archivo. Para instrucciones operativas de agentes de IA, ver **`/AGENTS.md`**. El plan de tickets (sección 7) y las secciones 8-9 de este documento siguen vigentes como seguimiento de las secciones de `docs/Tickets/`.
 
---
 
## 1. Decisión de arquitectura
 
**Una sola aplicación, un solo repositorio, dos experiencias completamente separadas por navegación.**
 
El navegador raíz decide qué árbol cargar según el tipo de sesión. Un huésped nunca instancia el árbol del personal, y viceversa.
 
```
RootNavigator
├── sin sesión        → AuthNavigator     (login de personal | vincular reserva)
├── sesión = staff    → StaffNavigator    (tabs según rol: limpieza / room service / conserjería)
└── sesión = guest    → GuestNavigator    (estadía, menú, pedidos, solicitudes)
```
 
### Orden de construcción
 
| Fase | Contenido | Estado |
|---|---|---|
| **Fase 1** | Experiencia de **personal** (limpieza, room service, conserjería) | Se construye primero |
| **Fase 2** | Experiencia de **huésped** | Se construye después |
 
**Por qué en ese orden:** los tres roles de personal comparten un mismo patrón de pantalla (bandeja → detalle → avanzar estado → completar). Construir ese núcleo primero produce el módulo genérico, las máquinas de estado y el sistema de diseño que la experiencia de huésped hereda. Además, el ciclo del huésped depende de estados que define el personal: el pedido que el huésped sigue en pantalla es el mismo que Room Service avanza.
 
### Alternativas evaluadas y descartadas
 
| Opción | Por qué se descartó |
|---|---|
| **Dos repositorios separados** | Obliga a duplicar `shared/`, `db.ts`, DTOs, mappers y máquinas de estado. A partir del trasplante, cada copia evoluciona por su lado y el contrato entre ambas apps depende de que alguien recuerde sincronizarlo. El riesgo mayor es que la máquina de estados de pedidos diverja: el huésped mostraría estados que el personal ya no usa. |
| **Monorepo con workspaces** (`apps/staff`, `apps/guest`, `packages/shared`) | Resuelve un problema que el proyecto no tiene todavía: producir dos binarios independientes. Requiere configurar `metro.config.js` por app, forzar instancias únicas de React y React Native, transpilar el paquete compartido, ajustar el gestor de paquetes y mantener versiones de Expo sincronizadas. Para una persona sola, cada error pasa a tener dos causas posibles (código propio o resolución de módulos). El beneficio de código compartido ya lo da la opción elegida. |
 
**Cuándo revisar esta decisión:** si se va a publicar la experiencia de huésped en una tienda pública durante el ciclo, si entra un segundo desarrollador dedicado, o si existe un requisito real de que el binario del huésped no contenga código de personal. Migrar de una app a un monorepo después es mecánico y se hace con el código ya funcionando.
 
---
 
## 2. Alcance funcional
 
### Fase 1 — Personal (~32 historias)
 
| Rol | Historias cubiertas |
|---|---|
| Personal de limpieza | HU-01 a HU-10 |
| Personal de Room Service | HU-01 a HU-12 |
| Personal de Conserjería | HU-01 a HU-10 |
 
### Fase 2 — Huésped (~12 historias)
 
Historias HU-11 a HU-20 del rol Huésped, más consulta de amenidades.
 
### Fuera de alcance móvil
 
| Rol | Motivo |
|---|---|
| **Administrador / Gerente** (61 HU) | Dashboards, gráficas, caja, inventario y configuración requieren pantalla grande. Van en la web privada. |
| **Recepcionista** (25 HU) | Calendario Gantt, check-in con documentos y cuenta del huésped son operaciones de escritorio. Van en la web privada. |
| **Huésped: cuenta y reservas** (HU-01 a HU-10) | Registro, login, perfil y gestión de reservas pertenecen a la web pública. En móvil el huésped **vincula un código de reserva**, no crea cuenta. |
 
---
 
## 3. Convenciones de código
 
**Todo el código en inglés.** Nombres de archivos, carpetas, variables, funciones, tipos, propiedades de objetos y claves de datos.
 
El español se usa únicamente en textos visibles para el usuario final, comentarios explicativos y documentación.
 
| Elemento | Convención | Ejemplo |
|---|---|---|
| Carpetas de módulo | kebab-case | `room-service/` |
| Componentes y pantallas | PascalCase | `OrderDetailScreen.tsx` |
| Servicios, modelos, DTOs, mappers | kebab-case con sufijo | `order.service.ts`, `order.dto.ts` |
| Variables y funciones | camelCase | `getPendingOrders` |
| Tipos e interfaces | PascalCase | `OrderModel`, `OrderDTO` |
| Constantes | SCREAMING_SNAKE_CASE | `ORDER_STATUS_FLOW` |
 
---
 
## 4. Arquitectura de capas
 
Arquitectura **modular por dominio** (feature-based), con separación DTO → Mapper → Model.
 
| Capa | Responsabilidad |
|---|---|
| **DTO** | La forma **cruda** del dato, tal como vive hoy en `db.ts` y como vendrá mañana de la API real. Puede tener `snake_case`, campos redundantes o fechas como texto. |
| **Mapper** | Convierte DTO en Model. Único punto que conoce ambas formas. |
| **Model** | La forma de **dominio** que consume la UI. Limpia, tipada, con fechas como `Date` y campos calculados. |
| **Service** | Única puerta de acceso a los datos. Devuelve Models, nunca DTOs. |
 
**Por qué esta separación con datos dummy:** es lo que hace migrable la app. Cuando llegue el backend, solo cambia el origen dentro del servicio — de leer `db.ts` a llamar `httpClient` — y ni las pantallas ni los modelos se tocan.
 
### Regla de oro
 
**Ninguna pantalla ni componente importa de `data/`.** Todo pasa por un servicio.
 
```ts
// src/modules/room-service/services/order.service.ts
import { ordersDB } from '@/data/db';
import { mapOrderDTOToModel } from '../mappers/order.mapper';
import { delay } from '@/shared/services/delay';
import type { OrderModel } from '../models/order.model';
 
export const getPendingOrders = async (): Promise<OrderModel[]> => {
  await delay(400);                          // simula latencia de red
  return ordersDB
    .filter(order => order.status === 'pending')
    .map(mapOrderDTOToModel);
};
```
 
Los servicios son `async`, devuelven promesas y **simulan latencia**. Eso obliga a programar desde el primer día con estados de carga, error y lista vacía reales.
 
### Módulos de doble audiencia
 
Este es el beneficio central de tener un solo proyecto. Los dominios que personal y huésped comparten —**pedidos** y **solicitudes**— tienen **un solo DTO, un solo Model, un solo Mapper y un solo Service**. Lo único que se separa son las pantallas y componentes de cada audiencia.
 
El mismo `OrderModel` que Room Service avanza es el que el huésped sigue en pantalla. No hay dos definiciones que puedan divergir.
 
### Máquinas de estado
 
Viven en `src/shared/constants/statuses.ts` y definen qué transiciones son válidas desde cada estado. La UI habilita botones a partir de esta definición, nunca con condicionales sueltos en la pantalla.
 
```
Order:          pending → accepted → preparing → ready → onTheWay → delivered
                pending → rejected
                cancelable mientras esté en pending o accepted
 
ServiceRequest: pending → accepted → inProgress → completed
                pending → rejected
 
Room:           dirty → cleaning → clean → inspected
                cualquiera → blocked (mantenimiento)
```
 
---
 
## 5. Estructura de carpetas
 
```
pms-hotel-mobile/
├── architecture.md
├── CLAUDE.md
├── README.md
├── App.tsx
├── app.json
├── src/
│   ├── navigation/                      # SOLO navegadores y rutas
│   │   ├── RootNavigator.tsx            # decide: Auth | Staff | Guest
│   │   ├── AuthNavigator.tsx
│   │   ├── StaffNavigator.tsx           # tabs según el rol en sesión
│   │   ├── GuestNavigator.tsx
│   │   └── routes.ts
│   │
│   ├── modules/
│   │   ├── auth/                        # ambas audiencias
│   │   │   ├── dtos/user.dto.ts
│   │   │   ├── models/{user.model.ts, session.model.ts}
│   │   │   ├── mappers/user.mapper.ts
│   │   │   ├── services/auth.service.ts
│   │   │   ├── context/AuthContext.tsx  # sesión staff o guest
│   │   │   └── screens/
│   │   │       ├── LoginScreen.tsx          # personal
│   │   │       └── LinkBookingScreen.tsx    # huésped
│   │   │
│   │   ├── tasks/                       # NÚCLEO GENÉRICO — los 3 roles lo consumen
│   │   │   ├── models/task.model.ts     # abstracción común de solicitud/pedido/tarea
│   │   │   ├── services/task-transition.service.ts
│   │   │   ├── screens/
│   │   │   │   ├── TaskListScreen.tsx   # bandeja genérica configurable
│   │   │   │   └── TaskDetailScreen.tsx # detalle genérico configurable
│   │   │   └── components/
│   │   │       ├── TaskCard.tsx
│   │   │       ├── TaskFilters.tsx
│   │   │       ├── StatusBadge.tsx
│   │   │       └── StatusStepper.tsx    # interactivo (staff) | lectura (guest)
│   │   │
│   │   ├── room-service/                # ◆ DOBLE AUDIENCIA
│   │   │   ├── dtos/{order.dto.ts, product.dto.ts}
│   │   │   ├── models/{order.model.ts, product.model.ts}
│   │   │   ├── mappers/{order.mapper.ts, product.mapper.ts}
│   │   │   ├── services/{order.service.ts, menu.service.ts}
│   │   │   ├── staff/
│   │   │   │   ├── screens/{OrderDetailScreen.tsx, MenuScreen.tsx}
│   │   │   │   └── components/{OrderItemRow.tsx, ChargeToRoomButton.tsx}
│   │   │   └── guest/
│   │   │       ├── screens/{MenuScreen.tsx, ProductDetailScreen.tsx,
│   │   │       │            MyOrdersScreen.tsx, OrderTrackingScreen.tsx}
│   │   │       └── components/{ProductCard.tsx, CategoryTabs.tsx}
│   │   │
│   │   ├── requests/                    # ◆ DOBLE AUDIENCIA
│   │   │   ├── dtos/service-request.dto.ts
│   │   │   ├── models/service-request.model.ts
│   │   │   ├── mappers/service-request.mapper.ts
│   │   │   ├── services/service-request.service.ts
│   │   │   ├── staff/screens/RequestsByRoomScreen.tsx
│   │   │   └── guest/screens/{RequestServiceScreen.tsx, MyRequestsScreen.tsx}
│   │   │
│   │   ├── housekeeping/                # solo personal
│   │   │   ├── dtos/{room.dto.ts, issue-report.dto.ts}
│   │   │   ├── models/room.model.ts
│   │   │   ├── mappers/room.mapper.ts
│   │   │   ├── services/housekeeping.service.ts
│   │   │   ├── screens/{RoomListScreen.tsx, ReportIssueScreen.tsx}
│   │   │   └── components/RoomCard.tsx
│   │   │
│   │   ├── profile/                     # solo personal
│   │   │   ├── services/history.service.ts
│   │   │   └── screens/{ProfileScreen.tsx, HistoryScreen.tsx}
│   │   │
│   │   ├── booking/                     # solo huésped
│   │   │   ├── dtos/booking.dto.ts
│   │   │   ├── models/booking.model.ts
│   │   │   ├── mappers/booking.mapper.ts
│   │   │   └── services/booking.service.ts
│   │   │
│   │   ├── stay/                        # solo huésped
│   │   │   ├── services/stay.service.ts
│   │   │   ├── screens/StayScreen.tsx   # home: habitación, fechas, accesos rápidos
│   │   │   └── components/StayHeader.tsx
│   │   │
│   │   ├── amenities/                   # solo huésped
│   │   │   ├── dtos/amenity.dto.ts
│   │   │   ├── models/amenity.model.ts
│   │   │   ├── mappers/amenity.mapper.ts
│   │   │   ├── services/amenity.service.ts
│   │   │   ├── screens/{AmenityListScreen.tsx, AmenityDetailScreen.tsx}
│   │   │   └── components/{AmenityCard.tsx, OpenNowBadge.tsx}
│   │   │
│   │   ├── cart/                        # solo huésped
│   │   │   ├── models/cart-item.model.ts    # sin dtos ni mappers:
│   │   │   │                                # nace de ProductModel + interacción
│   │   │   ├── services/cart.service.ts     # funciones puras
│   │   │   ├── context/CartContext.tsx
│   │   │   ├── screens/CartScreen.tsx
│   │   │   └── components/{CartItemRow.tsx, QuantityStepper.tsx, CartSummary.tsx}
│   │   │
│   │   └── notifications/               # solo huésped
│   │       ├── dtos/notification.dto.ts
│   │       ├── models/notification.model.ts
│   │       ├── mappers/notification.mapper.ts
│   │       ├── services/notification.service.ts
│   │       ├── screens/NotificationListScreen.tsx
│   │       └── components/UnreadBadge.tsx
│   │
│   ├── shared/                          # transversal reutilizable
│   │   ├── components/                  # Button, Card, Badge, Input,
│   │   │                                # EmptyState, LoadingState, ErrorState
│   │   ├── constants/
│   │   │   ├── roles.ts
│   │   │   ├── statuses.ts              # máquinas de estado
│   │   │   └── permissions.ts
│   │   ├── dtos/pagination.dto.ts
│   │   ├── services/
│   │   │   ├── http-client.ts           # wrapper de fetch, listo para API real
│   │   │   └── delay.ts                 # latencia simulada
│   │   ├── theme/{colors.ts, typography.ts, spacing.ts}
│   │   └── utils/{formatters.ts, date.ts}
│   │
│   ├── data/
│   │   └── db.ts                        # "BD" simulada: arrays con forma de DTO
│   │
│   └── hooks/                           # hooks compartidos entre módulos
│
├── assets/
├── tsconfig.json
└── package.json
```
 
---
 
## 6. Decisiones técnicas
 
| Decisión | Elección | Motivo |
|---|---|---|
| Framework | React Native con **Expo (managed)** | Sin módulos nativos; evita configuración de Android Studio |
| Lenguaje | **TypeScript** | Con datos dummy es lo único que detecta desajustes entre datos y pantallas |
| Navegación | **React Navigation** | Navegador raíz condicional por tipo de sesión |
| Estado global | **Context + useReducer** | Redux es desproporcionado para este alcance |
| Datos | **100 % dummy** en `src/data/db.ts` | No hay backend en esta etapa |
| Acceso a datos | Exclusivamente por servicios de módulo | Ver regla de oro |
| Repositorio | **Uno solo**, una app | Ver sección 1 |
 
---
 
## 7. Plan de tickets
 
Nomenclatura: `MOV-XX`. Tamaños: **S** ≈ media jornada · **M** ≈ 1–2 jornadas · **L** ≈ 3+ jornadas.
 
---
 
### FASE 0 — Base
 
---
 
#### MOV-01 · Crear el repositorio de la app móvil
**Tamaño:** S · **Depende de:** —
 
- [ ] Crear repositorio `pms-hotel-mobile` (privado)
- [ ] `README.md` con propósito, stack y estado del proyecto
- [ ] `.gitignore` de React Native / Expo
- [ ] Ramas `main` y `develop`
- [ ] Dar acceso a los 5 integrantes del equipo
- [ ] Registrar el repositorio en el GitHub Project del PMS
- [ ] Documentar en el README del PMS web que el proyecto vive en dos repositorios
 
**Criterios de aceptación**
1. El repositorio existe, es accesible para el equipo y tiene `main` y `develop`
2. El README explica qué contiene y cuál es su estado
3. El repositorio de la web enlaza al de móvil
 
---
 
#### MOV-02 · Setup del proyecto y estructura de carpetas
**Tamaño:** M · **Depende de:** MOV-01
 
- [ ] Inicializar Expo con plantilla TypeScript
- [ ] Crear la estructura completa de `src/` según la sección 5
- [ ] Instalar React Navigation y dependencias
- [ ] Configurar alias `@/` hacia `src/`
- [ ] Configurar ESLint y Prettier
- [ ] Crear `architecture.md` explicando el patrón DTO → Mapper → Model
- [ ] Crear `CLAUDE.md` con las convenciones de código
- [ ] Completar el `README.md` con instalación y ejecución
 
**Criterios de aceptación**
1. `npm install && npx expo start` levanta la app sin errores
2. La app corre en emulador Android mostrando una pantalla base
3. La estructura de carpetas está creada completa, aunque los archivos estén vacíos
4. El alias `@/` resuelve correctamente
5. El linter corre limpio
6. `architecture.md` explica las cuatro capas con un ejemplo real
 
---
 
#### MOV-03 · Sistema de diseño y componentes compartidos
**Tamaño:** M · **Depende de:** MOV-02
 
- [ ] `shared/theme/colors.ts` — paleta, incluidos colores por estado
- [ ] `shared/theme/typography.ts` — escala tipográfica
- [ ] `shared/theme/spacing.ts` — escala de espaciado
- [ ] `Button` con variantes, `Card`, `Input`, `Badge`
- [ ] `EmptyState`, `LoadingState`, `ErrorState` con acción de reintento
- [ ] Pantalla temporal de catálogo que muestre todos los componentes
 
**Criterios de aceptación**
1. Ningún componente usa colores o tamaños escritos a mano; todo sale del tema
2. La pantalla de catálogo muestra cada componente en todas sus variantes
3. Cada estado de las máquinas de estado tiene color asignado y consistente
 
---
 
#### MOV-04 · Contratos de dominio: DTOs, models, mappers y `db.ts`
**Tamaño:** L · **Depende de:** MOV-02
 
El ticket que define la forma de todos los datos de la app.
 
- [ ] `shared/constants/roles.ts` y `permissions.ts`
- [ ] `shared/constants/statuses.ts` con las tres máquinas de estado y transiciones válidas
- [ ] DTOs: `user`, `room`, `guest`, `booking`, `service-request`, `order`, `product`, `amenity`, `notification`
- [ ] Models correspondientes de cada DTO
- [ ] Mappers de cada par DTO → Model
- [ ] `shared/dtos/pagination.dto.ts`
- [ ] `data/db.ts` con arrays en forma de DTO: mínimo 6 usuarios (2 por rol), 15 habitaciones, 10 huéspedes con reserva y código de vinculación, 20 solicitudes, 20 pedidos, 25 productos, 8 amenidades
 
**Criterios de aceptación**
1. Cada entidad tiene DTO, Model y Mapper, y los datos de `db.ts` respetan la forma del DTO
2. Los DTOs simulan una respuesta de API realista, no la forma que le conviene a la UI
3. Existe al menos un registro en **cada** estado posible de cada máquina de estados
4. Los datos son coherentes: un pedido apunta a una habitación y un huésped que existen
5. Los datos son realistas (nombres, horarios, precios en la moneda local), no de relleno
6. Todos los nombres de campos, tipos y archivos están en inglés
 
---
 
#### MOV-05 · Capa de servicios y cliente HTTP
**Tamaño:** M · **Depende de:** MOV-04
 
- [ ] `shared/services/delay.ts` con retardo configurable
- [ ] `shared/services/http-client.ts` — wrapper de fetch sin uso todavía, listo para la API real
- [ ] `modules/auth/services/auth.service.ts`
- [ ] `modules/housekeeping/services/housekeeping.service.ts`
- [ ] `modules/room-service/services/order.service.ts` y `menu.service.ts`
- [ ] `modules/requests/services/service-request.service.ts`
- [ ] `modules/tasks/services/task-transition.service.ts` — valida transiciones
- [ ] Mecanismo para forzar un error y probar la UI de fallo
 
**Criterios de aceptación**
1. Todas las funciones son `async` y devuelven Models, nunca DTOs
2. Toda respuesta pasa por un delay simulado de entre 300 y 600 ms
3. Las transiciones de estado se validan contra `statuses.ts` y las inválidas se rechazan
4. Existe forma de forzar un error para probar el manejo de fallos
5. **Ningún archivo fuera de un servicio importa de `data/db.ts`**
 
---
 
#### MOV-06 · Navegación raíz y módulo de autenticación
**Tamaño:** M · **Depende de:** MOV-03, MOV-05
 
- [ ] `AuthContext` con sesión tipada (staff | guest), login, logout y persistencia
- [ ] `RootNavigator` que decide entre Auth, Staff y Guest
- [ ] `AuthNavigator` con acceso a las dos pantallas de entrada
- [ ] `StaffNavigator` con tabs que cambian según el rol
- [ ] `GuestNavigator` declarado aunque sus pantallas lleguen en la Fase 2
- [ ] `routes.ts` con las rutas tipadas
- [ ] `LoginScreen` con validación y manejo de error
 
**Criterios de aceptación**
1. Iniciar sesión con un usuario de limpieza muestra solo los tabs de limpieza
2. Lo mismo para Room Service y Conserjería
3. Credenciales incorrectas muestran error claro sin cerrar la app
4. La sesión sobrevive al reinicio de la app
5. **Con sesión de personal, el árbol de huésped no se instancia, y viceversa**
6. Las rutas están tipadas y no admiten parámetros incorrectos
 
> **Fin de la Fase 0.** Hasta aquí es lo razonablemente alcanzable en el Sprint 2.
 
---
 
### FASE 1 — Experiencia de personal
 
---
 
#### MOV-07 · Módulo `tasks`: bandeja genérica
**Tamaño:** L · **Depende de:** MOV-06
 
Ticket clave del proyecto: la pantalla que los tres roles reutilizan.
 
- [ ] `models/task.model.ts` — abstracción común de solicitud, pedido y tarea
- [ ] `TaskCard` configurable por tipo de entidad
- [ ] `TaskFilters` — filtro por estado y búsqueda
- [ ] `StatusBadge`
- [ ] `TaskListScreen` que recibe el servicio y la configuración por parámetro
- [ ] Estados de carga, vacío y error
- [ ] Recarga por gesto de arrastre
- [ ] Ordenamiento por antigüedad
 
**Criterios de aceptación**
1. La misma pantalla renderiza solicitudes de limpieza, pedidos de Room Service y solicitudes de conserjería **sin duplicar código**
2. Los filtros aplican sin recargar la pantalla completa
3. Lista vacía muestra `EmptyState`, no una pantalla en blanco
4. Error de servicio muestra `ErrorState` con botón de reintento
 
---
 
#### MOV-08 · Módulo `tasks`: detalle y transiciones de estado
**Tamaño:** L · **Depende de:** MOV-07
 
- [ ] `TaskDetailScreen` genérico
- [ ] `StatusStepper` en modo interactivo, preparado para modo lectura
- [ ] Botones de acción habilitados según las transiciones válidas
- [ ] Confirmación antes de acciones irreversibles
- [ ] Motivo obligatorio al rechazar
- [ ] Campo de observaciones
- [ ] Actualización optimista con reversión si el servicio falla
 
**Criterios de aceptación**
1. Solo se muestran las acciones válidas para el estado actual
2. Rechazar sin motivo es imposible
3. Al cambiar el estado, la bandeja se actualiza al volver
4. Si el servicio falla, el estado vuelve al anterior y se avisa al usuario
5. El `StatusStepper` acepta una prop de modo lectura que la Fase 2 reutilizará sin modificarlo
 
---
 
#### MOV-09 · Módulo `housekeeping`
**Tamaño:** M · **Depende de:** MOV-08 · **Cubre:** HU-01 a HU-10 de Limpieza
 
- [ ] `RoomListScreen` — habitaciones pendientes agrupadas
- [ ] `RoomCard`
- [ ] Tab de solicitudes usando `TaskListScreen`
- [ ] Cambio de estado operativo de habitación
- [ ] `ReportIssueScreen` con descripción y prioridad
- [ ] Historial de tareas completadas
 
**Criterios de aceptación**
1. Las habitaciones se listan agrupadas por piso o por estado
2. El flujo dirty → cleaning → clean funciona completo
3. Un desperfecto reportado queda registrado y visible
4. El historial muestra solo las tareas del usuario en sesión
 
---
 
#### MOV-10 · Módulo `room-service`, lado personal
**Tamaño:** M · **Depende de:** MOV-08 · **Cubre:** HU-01 a HU-12 de Room Service
 
- [ ] Bandeja de pedidos usando `TaskListScreen`
- [ ] `staff/screens/OrderDetailScreen.tsx` con productos, cantidades, habitación y observaciones
- [ ] `staff/components/OrderItemRow.tsx`
- [ ] Aceptar y rechazar con motivo
- [ ] Avance por los seis estados del pedido
- [ ] `staff/screens/MenuScreen.tsx` — consulta del menú
- [ ] `staff/components/ChargeToRoomButton.tsx`
- [ ] Historial de pedidos atendidos
 
**Criterios de aceptación**
1. La cadena pending → accepted → preparing → ready → onTheWay → delivered funciona en orden
2. No es posible saltarse un estado
3. El cargo a la habitación queda registrado con monto y fecha
4. El menú muestra los productos agrupados por categoría
 
---
 
#### MOV-11 · Módulo `requests`, lado personal (conserjería)
**Tamaño:** S · **Depende de:** MOV-08 · **Cubre:** HU-01 a HU-10 de Conserjería
 
- [ ] Bandeja usando `TaskListScreen`
- [ ] Detalle usando `TaskDetailScreen`
- [ ] Observaciones de atención
- [ ] `staff/screens/RequestsByRoomScreen.tsx`
- [ ] Historial
 
**Criterios de aceptación**
1. El rol funciona reutilizando el módulo `tasks`, sin pantallas nuevas salvo la vista por habitación
2. La vista por habitación muestra todas las solicitudes activas de esa habitación
 
---
 
#### MOV-12 · Módulo `profile`
**Tamaño:** S · **Depende de:** MOV-09, MOV-10, MOV-11
 
- [ ] `ProfileScreen` con datos del usuario y su rol
- [ ] `HistoryScreen` genérico filtrable por fecha
- [ ] `history.service.ts`
- [ ] Cierre de sesión con confirmación
 
**Criterios de aceptación**
1. El perfil muestra nombre, rol y usuario en sesión
2. El historial funciona para los tres roles con el mismo componente
 
---
 
#### MOV-13 · Pulido y cierre de la experiencia de personal
**Tamaño:** M · **Depende de:** MOV-12
 
- [ ] Revisar estados vacíos, de carga y de error en todas las pantallas
- [ ] Verificar consistencia visual contra el tema
- [ ] Manejo de textos largos y desbordamiento
- [ ] Probar en al menos dos tamaños de pantalla
- [ ] Documentar en el README los usuarios de prueba de cada rol
- [ ] Actualizar `architecture.md` con lo efectivamente construido
 
**Criterios de aceptación**
1. Ninguna pantalla muestra un espacio en blanco sin explicación
2. La app no se cierra ante ningún error simulado del servicio
3. El README permite a cualquiera probar los tres roles sin ayuda
 
> **Hito 1 — Experiencia de personal terminada.**
 
---
 
### FASE 2 — Experiencia de huésped
 
---
 
#### MOV-14 · Módulo `booking`: vinculación por código
**Tamaño:** M · **Depende de:** MOV-13 · **Cubre:** HU-11 del Huésped
 
- [ ] DTO, Model, Mapper y `booking.service.ts`
- [ ] Extender `AuthContext` para la sesión de huésped
- [ ] `LinkBookingScreen` con validación
- [ ] Manejo de código inválido, reserva vencida y reserva ya vinculada
- [ ] Completar `GuestNavigator` con sus tabs
 
**Criterios de aceptación**
1. Un código válido de `db.ts` da acceso a la experiencia de huésped
2. Un código inválido muestra error sin cerrar la app
3. La vinculación sobrevive al reinicio
4. Con sesión de huésped no existe ninguna ruta hacia pantallas de personal
 
---
 
#### MOV-15 · Módulo `stay`
**Tamaño:** S · **Depende de:** MOV-14 · **Cubre:** HU-12 del Huésped
 
- [ ] Habitación asignada, fechas de entrada y salida
- [ ] Días restantes de estadía
- [ ] Servicios contratados
- [ ] Accesos rápidos a las acciones principales
 
**Criterios de aceptación**
1. Muestra los datos reales de la reserva vinculada
2. Los accesos rápidos navegan correctamente
 
---
 
#### MOV-16 · Módulo `amenities`
**Tamaño:** S · **Depende de:** MOV-15 · **Cubre:** HU-13 del Huésped
 
- [ ] DTO, Model, Mapper y servicio
- [ ] `AmenityListScreen` y `AmenityDetailScreen`
- [ ] `OpenNowBadge` según la hora actual
 
**Criterios de aceptación**
1. Las amenidades desactivadas no aparecen
2. El indicador de horario refleja la hora del dispositivo
 
---
 
#### MOV-17 · Módulo `room-service`, lado huésped: catálogo
**Tamaño:** M · **Depende de:** MOV-15 · **Cubre:** HU-16 del Huésped
 
Reutiliza el DTO, Model, Mapper y `menu.service.ts` ya construidos en la Fase 0 y usados por el personal en MOV-10. Solo se agregan pantallas.
 
- [ ] `guest/screens/MenuScreen.tsx` con categorías
- [ ] `guest/screens/ProductDetailScreen.tsx`
- [ ] `guest/components/ProductCard.tsx` y `CategoryTabs.tsx`
- [ ] Búsqueda de productos
 
**Criterios de aceptación**
1. Las categorías se navegan sin recargar toda la pantalla
2. Un producto desactivado se muestra como no disponible y no se puede pedir
3. **No se creó ningún DTO, Model, Mapper ni servicio nuevo**
 
---
 
#### MOV-18 · Módulo `cart`
**Tamaño:** L · **Depende de:** MOV-17 · **Cubre:** HU-17 del Huésped
 
Sin DTOs ni mappers: el carrito nace de `ProductModel` más la interacción del usuario.
 
- [ ] `models/cart-item.model.ts`
- [ ] `services/cart.service.ts` con funciones puras: `addToCart`, `removeFromCart`, `increaseQuantity`, `decreaseQuantity`, `getCartTotal`, `getCartCount`
- [ ] `context/CartContext.tsx` con persistencia local
- [ ] `CartScreen`
- [ ] `CartItemRow`, `QuantityStepper`, `CartSummary`
- [ ] Observaciones del pedido
- [ ] Confirmación y creación del pedido vía `order.service.ts`
 
**Criterios de aceptación**
1. El carrito conserva su contenido al navegar entre categorías
2. Las funciones de `cart.service.ts` son puras y testeables sin montar componentes
3. No es posible confirmar un carrito vacío
4. El total coincide con la suma de los productos
5. **El pedido creado aparece en la bandeja de Room Service sin ninguna conversión adicional**
 
---
 
#### MOV-19 · Seguimiento de pedidos del huésped
**Tamaño:** M · **Depende de:** MOV-18 · **Cubre:** HU-18, HU-19 del Huésped
 
- [ ] `guest/screens/MyOrdersScreen.tsx`
- [ ] `guest/screens/OrderTrackingScreen.tsx`
- [ ] Reutilizar `StatusStepper` en modo lectura
- [ ] Cancelación mientras el pedido lo permita
 
**Criterios de aceptación**
1. El estado mostrado coincide con el que fijó Room Service, sin traducción intermedia
2. La cancelación solo aparece en estados cancelables
3. **El `StatusStepper` es el mismo componente de MOV-08, sin modificarlo**
 
---
 
#### MOV-20 · Módulo `requests`, lado huésped
**Tamaño:** M · **Depende de:** MOV-15 · **Cubre:** HU-14, HU-15 del Huésped
 
Reutiliza el DTO, Model, Mapper y servicio construidos en la Fase 0.
 
- [ ] `guest/screens/RequestServiceScreen.tsx` — limpieza con horario preferido y artículos con cantidades
- [ ] `guest/screens/MyRequestsScreen.tsx` con seguimiento
- [ ] Cancelación mientras esté pendiente
 
**Criterios de aceptación**
1. La solicitud creada aparece en la bandeja del rol correspondiente
2. El huésped ve el cambio de estado que aplica el personal
3. **No se creó ningún DTO, Model, Mapper ni servicio nuevo**
 
---
 
#### MOV-21 · Módulo `notifications`
**Tamaño:** S · **Depende de:** MOV-19, MOV-20 · **Cubre:** HU-20 del Huésped
 
- [ ] DTO, Model, Mapper y servicio
- [ ] `NotificationListScreen`
- [ ] `UnreadBadge`
- [ ] Marcar como leída
- [ ] Generación al cambiar el estado de un pedido o solicitud
 
**Criterios de aceptación**
1. Un cambio de estado hecho por el personal genera notificación para el huésped
2. El contador de no leídas es correcto
 
---
 
#### MOV-22 · Pulido y demostración del ciclo completo
**Tamaño:** M · **Depende de:** MOV-21
 
- [ ] Revisar estados vacíos, de carga y de error de la experiencia de huésped
- [ ] Consistencia visual entre ambas experiencias
- [ ] Documentar el guion de demostración
- [ ] Códigos de reserva de prueba en el README
- [ ] Actualizar `architecture.md`
 
**Criterios de aceptación**
1. Se puede demostrar el ciclo completo: el huésped crea un pedido, Room Service lo recibe y lo avanza, el huésped ve el cambio
2. El README permite a cualquiera reproducir la demostración
 
> **Hito 2 — Experiencia de huésped terminada.**
 
---
 
## 8. Resumen y secuencia
 
| Fase | Tickets | Tamaños |
|---|---|---|
| Fase 0 — Base | MOV-01 a MOV-06 | 1 S · 4 M · 1 L |
| Fase 1 — Personal | MOV-07 a MOV-13 | 2 S · 3 M · 2 L |
| Fase 2 — Huésped | MOV-14 a MOV-22 | 3 S · 5 M · 1 L |
 
**Total: 22 tickets.**
 
### Ruta crítica
 
```
MOV-01 → MOV-02 → MOV-04 → MOV-05 → MOV-06 → MOV-07 → MOV-08 → MOV-10
       → MOV-13 → MOV-14 → MOV-17 → MOV-18 → MOV-19 → MOV-22
```
 
MOV-03 puede hacerse en paralelo con MOV-04. MOV-09, MOV-10 y MOV-11 son independientes entre sí una vez terminado MOV-08.
 
### Distribución sugerida por sprint
 
| Sprint | Tickets | Entregable |
|---|---|---|
| **Sprint 2** (2–15 sep) | MOV-01 a MOV-06 | Proyecto ejecutable, login funcional, navegación por rol |
| Sprint 3 | MOV-07 a MOV-10 | Bandeja genérica y dos roles operativos |
| Sprint 4 | MOV-11 a MOV-14 | Personal terminado, huésped vinculado |
| Sprint 5 | MOV-15 a MOV-18 | Estadía, amenidades, catálogo y carrito |
| Sprint 6 | MOV-19 a MOV-22 | Huésped terminado y demo del ciclo completo |
 
**Advertencia de capacidad:** seis tickets en el Sprint 2 para una persona es ajustado, sobre todo porque MOV-04 es de tamaño L. Si hay que recortar, lo que se mueve al Sprint 3 es MOV-06, nunca MOV-04 ni MOV-05.
 
### Tickets de mayor riesgo
 
| Ticket | Riesgo |
|---|---|
| **MOV-07 y MOV-08** | Si el módulo `tasks` no queda realmente genérico, los tres roles se vuelven tres desarrollos separados y el alcance se dispara |
| **MOV-04** | Si los DTOs se diseñan con la forma que le conviene a la UI en vez de simular una API, la separación en capas no sirve de nada |
| **MOV-05** | Si alguna pantalla termina importando de `db.ts`, la migración al backend obliga a reescribir |
| **MOV-18** | El carrito es la pantalla con más estado local de la app |
 
---
 
## 9. Pendientes de definición
 
| Tema | Detalle |
|---|---|
| Paleta y tipografía | Necesarias antes de MOV-03; deberían salir del prototipo UI/UX (issue #2 del repo web) |
| Moneda y formato de fecha | Definir para `shared/utils/formatters.ts` |
| Idioma de la interfaz | La app se construye en español; confirmar si habrá otro idioma |
| Contrato de datos con la web | Los DTOs de MOV-04 deberían coincidir con lo que expondrá el backend. Coordinar con quien trabaje la web privada |
| Project de GitHub | Decidir si los MOV-XX entran al project existente o a uno propio de móviles |