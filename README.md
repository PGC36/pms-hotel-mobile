# PMS Hotel Boutique — App Móvil

Aplicación móvil del Property Management System para hoteles boutique.
Construida con React Native y Expo.

> **Estado:** en desarrollo. El portal de huésped consume los endpoints reales
> de estadía, amenidades, solicitudes, Room Service y notificaciones.

---

## Qué contiene

Una sola aplicación con **dos experiencias separadas por navegación**, según el
tipo de sesión:

| Experiencia  | Usuarios                            | Estado                                    |
| ------------ | ----------------------------------- | ----------------------------------------- |
| **Personal** | Limpieza, Room Service, Conserjería | En construcción (Fase 1)                  |
| **Huésped**  | Huésped con reserva confirmada      | Estadía, servicios, Room Service y avisos |

El navegador raíz decide qué árbol cargar. Un huésped nunca instancia las
pantallas del personal, y viceversa.

## Repositorios del proyecto

| Repositorio                                                          | Contenido                                                                 |
| -------------------------------------------------------------------- | ------------------------------------------------------------------------- |
| [`pms-hotel-boutique`](https://github.com/DougGM/pms-hotel-boutique) | Web pública (motor de reservas) y web privada (recepción, administración) |
| `pms-hotel-mobile`                                                   | Este repositorio — aplicación móvil                                       |

## Stack

- **React Native** con Expo (managed workflow)
- **TypeScript**
- **React Navigation** — navegador raíz condicional por tipo de sesión
- **Context + useReducer** para estado global
- Algunas pantallas del personal todavía usan datos de demostración en
  `src/data/db.ts`. El portal de huésped usa el backend y requiere
  `EXPO_PUBLIC_API_BASE_URL` en un `.env.local` no versionado (ver `.env.example`).

### Portal de huésped

El acceso del huésped mantiene cuatro destinos principales: **Estadía**,
**Servicios**, **Room Service** y **Avisos**. Amenidades y solicitudes se abren
dentro de Servicios; carrito, pedidos e historial se abren dentro de Room
Service. El carrito solo vive en memoria hasta crear el pedido; los pedidos,
solicitudes, amenidades y notificaciones se vuelven a consultar al backend al
entrar o actualizar sus pantallas.

Los flujos utilizan `/api/v1/guest/amenities`, `/guest/housekeeping/requests`,
`/guest/concierge/requests`, `/guest/room-service/products`,
`/guest/room-service/orders` y `/guest/notifications` (con sus rutas de detalle,
cancelación y lectura). Las operaciones requieren sesión de huésped vigente y
reservación asociada cuando así lo exige el backend.

### Credenciales Demo (Backend Real)

| Tipo         | Correo                    | Contraseña    | Rol / Reserva                |
| ------------ | ------------------------- | ------------- | ---------------------------- |
| **Huésped**  | `ana.demo@aurora.test`    | `huesped1`    | AUR-DEMO-001                 |
| **Huésped**  | `carlos.demo@aurora.test` | `huesped2`    | AUR-DEMO-002                 |
| **Personal** | `limpieza@aurora.test`    | `limpieza`    | Limpieza (`housekeeping`)    |
| **Personal** | `roomservice@aurora.test` | `roomservice` | Room Service (`roomService`) |
| **Personal** | `conserjeria@aurora.test` | `conserjeria` | Conserjería (`concierge`)    |

## Requisitos

- Node.js 20 (>= 20.19.4)
- npm
- Expo Go en un dispositivo Android, o Android Studio con un emulador

## Instalación

```bash
git clone https://github.com/DougGM/pms-hotel-mobile.git
cd pms-hotel-mobile
npm install
npx expo start
```

Escanea el código QR con Expo Go, o presiona `a` para abrir el emulador Android.

## Comandos

```bash
npx expo start          # servidor de desarrollo
npm run lint             # ESLint
npm run typecheck        # chequeo de tipos (tsc --noEmit)
npm test                 # pruebas de autenticación, checklist y operaciones de personal
npm run test:coverage    # pruebas + cobertura (coverage/lcov.info)
npm run format           # Prettier — escribe cambios
npm run format:check     # Prettier — solo verifica
npm run build:validate   # expo export android/ios/web (build de validación, sin credenciales)
npm run ci               # todo lo anterior en el orden del pipeline
```

## CI/CD

GitHub Actions (`.github/workflows/`) y Jenkins (`Jenkinsfile`) validan cada PR (formato, tipos,
lint, pruebas, build de validación y SonarQube con el Quality Gate "Aurora Mobile"). Además generan
builds nativos con Expo EAS: preview para QA en cada merge a `develop` y release en tags `vX.Y.Z`,
sin publicar en tiendas. Secretos, SonarQube, perfiles EAS y prerequisitos pendientes en
[`docs/CI-CD.md`](./docs/CI-CD.md).

## QA con backend real

La matriz de validación para la issue
[`#25`](https://github.com/PGC36/pms-hotel-mobile/issues/25) vive en
[`docs/qa/mobile-backend-postgres-validation.md`](./docs/qa/mobile-backend-postgres-validation.md).
Incluye entorno requerido, seed mínimo, flujos aplicables, casos no aplicables y
plantilla de evidencia por corrida.

## Estructura

```
src/
├── navigation/     # RootNavigator y navegadores por tipo de sesión (Auth | Staff | Guest)
├── modules/        # un módulo por dominio: dtos/ → models/ → mappers/ → services/ → screens/
├── shared/         # componentes, tema, constantes y utilidades reutilizables entre módulos
├── data/           # "BD" simulada (db.ts) para lo que aún no tiene endpoint real
└── hooks/          # hooks compartidos entre módulos
```

El alias `@/` apunta a `src/` (ej. `import { colors } from '@/shared/theme/colors'`).

Arquitectura completa (capas DTO → Mapper → Model → Service, convenciones de nombres,
máquinas de estado): ver [`architecture.md`](./architecture.md). Guía para agentes de IA
que trabajen en este repo: ver [`AGENTS.md`](./AGENTS.md).
