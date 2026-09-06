# Arquitectura — PMS Hotel Boutique · App Móvil

Este documento explica **cómo** está construida la app y **por qué**. Para el plan de tickets y el detalle historia por historia, ver `docs/plan-app-movil.md` y `docs/Tickets/`.

> **Estado:** el scaffolding (MOV-02) está completo — la estructura de `src/` descrita abajo ya existe. La mayoría de sus archivos son placeholders vacíos hasta que los tickets MOV-03 en adelante les agreguen contenido.

---

## 1. Decisión central: una app, dos experiencias

El PMS móvil sirve a dos públicos completamente distintos —personal del hotel (limpieza, room service, conserjería) y huéspedes— con **una sola aplicación Expo**, no dos apps ni un monorepo con workspaces.

Un `RootNavigator` decide, según el tipo de sesión activa, qué árbol de navegación instanciar:

```
RootNavigator
├── sin sesión        → AuthNavigator     (login de personal | vincular reserva)
├── sesión = staff    → StaffNavigator    (tabs según rol)
└── sesión = guest    → GuestNavigator    (estadía, menú, pedidos, solicitudes)
```

Un huésped **nunca** instancia una pantalla de personal, y viceversa — no es solo una cuestión de rutas ocultas, el árbol correspondiente ni siquiera se monta.

**Por qué no dos repos:** duplicaría `db.ts`, DTOs, mappers y máquinas de estado, con el riesgo de que ambas copias diverjan silenciosamente (ej. el huésped mostrando un estado de pedido que el personal ya dejó de usar).

**Por qué no un monorepo con workspaces:** resuelve un problema que el proyecto no tiene (publicar dos binarios independientes) a cambio de complejidad real de configuración (Metro, instancias únicas de React Native, transpilado del paquete compartido). Para un equipo pequeño, no vale la pena todavía.

**Cuándo reconsiderar:** si la experiencia de huésped se publica en una tienda pública, si entra un segundo desarrollador dedicado, o si aparece un requisito real de que el binario del huésped no contenga código de personal.

---

## 2. Las cuatro capas: DTO → Mapper → Model → Service

Cada dominio de datos (pedidos, habitaciones, reservas, etc.) se modela en cuatro capas con responsabilidades estrictas:

| Capa        | Responsabilidad                                                                                                                                                               |
| ----------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **DTO**     | La forma **cruda** del dato — hoy tal como vive en `src/data/db.ts`, mañana tal como llegará de la API real. Puede tener `snake_case`, campos redundantes, fechas como texto. |
| **Mapper**  | Convierte DTO → Model. Es el **único** punto del código que conoce ambas formas.                                                                                              |
| **Model**   | La forma de **dominio** que consume la UI: limpia, tipada, con `Date` reales y campos calculados.                                                                             |
| **Service** | La única puerta de entrada a los datos. Siempre `async`, siempre devuelve Models, nunca DTOs. Simula latencia de red.                                                         |

### Ejemplo real

```ts
// src/modules/room-service/services/order.service.ts
import { ordersDB } from '@/data/db';
import { mapOrderDTOToModel } from '../mappers/order.mapper';
import { delay } from '@/shared/services/delay';
import type { OrderModel } from '../models/order.model';

export const getPendingOrders = async (): Promise<OrderModel[]> => {
  await delay(400); // simula latencia de red
  return ordersDB.filter((order) => order.status === 'pending').map(mapOrderDTOToModel);
};
```

La pantalla que llama a `getPendingOrders()` nunca sabe que, hoy, el dato viene de un array en memoria. El día que exista backend, solo cambia lo que hay **dentro** del servicio (de leer `db.ts` a llamar `httpClient`) — ni el Model ni la pantalla se tocan.

### Regla de oro

**Ninguna pantalla ni componente importa directamente de `src/data/`.** Todo pasa por un servicio. Esta regla es la que hace migrable el proyecto: es la línea que separa "cambiar el origen del dato" de "reescribir la app".

---

## 3. Módulos de doble audiencia

El beneficio central de tener un solo proyecto: los dominios que personal y huésped comparten —**pedidos** (`room-service`) y **solicitudes** (`requests`)— tienen **un solo** DTO, Model, Mapper y Service. Solo se separan las pantallas y componentes, en subcarpetas `staff/` y `guest/` dentro del mismo módulo.

El `OrderModel` que Room Service avanza en su bandeja es literalmente el mismo objeto que el huésped sigue en su pantalla de tracking. No existen dos definiciones que puedan divergir entre sí.

El módulo `tasks` es el núcleo genérico que los tres roles de personal reutilizan: `TaskListScreen` (bandeja), `TaskDetailScreen` (detalle), `TaskCard`, `StatusStepper`. `StatusStepper` acepta un modo interactivo (personal, que puede avanzar el estado) y un modo lectura (huésped, que solo lo observa) — la Fase 2 lo reutiliza sin modificarlo.

---

## 4. Máquinas de estado

Viven en `src/shared/constants/statuses.ts` y son la única fuente de verdad sobre qué transición es válida desde cada estado. Las pantallas habilitan botones leyendo esta definición — nunca con condicionales sueltos.

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
├── AGENTS.md
├── CLAUDE.md
├── architecture.md
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
│   │   ├── tasks/                       # NÚCLEO GENÉRICO — los 3 roles lo consumen
│   │   ├── room-service/                # ◆ DOBLE AUDIENCIA (staff/ + guest/)
│   │   ├── requests/                    # ◆ DOBLE AUDIENCIA (staff/ + guest/)
│   │   ├── housekeeping/                # solo personal
│   │   ├── profile/                     # solo personal
│   │   ├── booking/                     # solo huésped
│   │   ├── stay/                        # solo huésped
│   │   ├── amenities/                   # solo huésped
│   │   ├── cart/                        # solo huésped
│   │   └── notifications/               # solo huésped
│   │
│   ├── shared/                          # transversal reutilizable
│   │   ├── components/                  # Button, Card, Badge, Input,
│   │   │                                #   EmptyState, LoadingState, ErrorState
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

Cada módulo de dominio sigue internamente el patrón `dtos/ → models/ → mappers/ → services/ → screens/ (+ components/)`. El detalle completo, carpeta por carpeta, está en `docs/plan-app-movil.md` sección 5.

---

## 6. Convenciones de código

**Todo el código en inglés.** Nombres de archivos, carpetas, variables, funciones, tipos, propiedades de objetos y claves de datos. El español se reserva para textos visibles al usuario final, comentarios explicativos y documentación.

| Elemento                          | Convención            | Ejemplo                            |
| --------------------------------- | --------------------- | ---------------------------------- |
| Carpetas de módulo                | kebab-case            | `room-service/`                    |
| Componentes y pantallas           | PascalCase            | `OrderDetailScreen.tsx`            |
| Servicios, modelos, DTOs, mappers | kebab-case con sufijo | `order.service.ts`, `order.dto.ts` |
| Variables y funciones             | camelCase             | `getPendingOrders`                 |
| Tipos e interfaces                | PascalCase            | `OrderModel`, `OrderDTO`           |
| Constantes                        | SCREAMING_SNAKE_CASE  | `ORDER_STATUS_FLOW`                |

---

## 7. Decisiones técnicas

| Decisión               | Elección                                                                           | Motivo                                                                                                                                                                                                                                                                            |
| ---------------------- | ---------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Framework              | React Native con **Expo (managed)**                                                | Sin módulos nativos; evita configuración de Android Studio                                                                                                                                                                                                                        |
| Lenguaje               | **TypeScript**                                                                     | Con datos dummy es lo único que detecta desajustes entre datos y pantallas                                                                                                                                                                                                        |
| Navegación             | **React Navigation**                                                               | Navegador raíz condicional por tipo de sesión                                                                                                                                                                                                                                     |
| Estado global          | **Context + useReducer**                                                           | Redux es desproporcionado para este alcance                                                                                                                                                                                                                                       |
| Datos                  | **100 % dummy** en `src/data/db.ts`                                                | No hay backend en esta etapa                                                                                                                                                                                                                                                      |
| Acceso a datos         | Exclusivamente por servicios de módulo                                             | Ver regla de oro (sección 2)                                                                                                                                                                                                                                                      |
| Repositorio            | **Uno solo**, una app                                                              | Ver sección 1                                                                                                                                                                                                                                                                     |
| Persistencia de sesión | `@react-native-async-storage/async-storage` detrás de `shared/services/storage.ts` | Datos no sensibles (qué sesión estaba activa); ningún consumidor importa AsyncStorage directamente, igual que `http-client.ts` con `fetch`. **Revisar cuando existan tokens de sesión reales contra un backend** — ahí probablemente corresponda `expo-secure-store` en su lugar. |

---

_Este documento se actualiza en los tickets MOV-02, MOV-13 y MOV-22 conforme la arquitectura pasa de plan a código construido. Fuente original de estas decisiones: `docs/plan-app-movil.md`._
