# PMS Hotel Boutique — App Móvil

Aplicación móvil del Property Management System para hoteles boutique.
Construida con React Native y Expo.

> **Estado:** en desarrollo · Fase 0 (base del proyecto)
> Este repositorio contiene únicamente el frontend. Las habitaciones de Limpieza
> (MOV-09) ya consumen el backend real; el resto de los datos sigue simulado.

---

## Qué contiene

Una sola aplicación con **dos experiencias separadas por navegación**, según el
tipo de sesión:

| Experiencia | Usuarios | Estado |
|---|---|---|
| **Personal** | Limpieza, Room Service, Conserjería | En construcción (Fase 1) |
| **Huésped** | Huésped con reserva confirmada | Pendiente (Fase 2) |

El navegador raíz decide qué árbol cargar. Un huésped nunca instancia las
pantallas del personal, y viceversa.

## Repositorios del proyecto

| Repositorio | Contenido |
|---|---|
| [`pms-hotel-boutique`](https://github.com/DougGM/pms-hotel-boutique) | Web pública (motor de reservas) y web privada (recepción, administración) |
| `pms-hotel-mobile` | Este repositorio — aplicación móvil |

## Stack

- **React Native** con Expo (managed workflow)
- **TypeScript**
- **React Navigation** — navegador raíz condicional por tipo de sesión
- **Context + useReducer** para estado global
- Datos simulados en `src/data/db.ts`, salvo lo ya integrado con la API real
  (habitaciones de Limpieza, Room Service del personal y autenticación/estadía de huéspedes), que requiere `EXPO_PUBLIC_API_BASE_URL` en un
  `.env.local` no versionado (ver `.env.example`).

### Credenciales Demo (Backend Real)

| Tipo | Correo | Contraseña | Rol / Reserva |
|---|---|---|---|
| **Huésped** | `ana.demo@aurora.test` | `huesped1` | AUR-DEMO-001 |
| **Huésped** | `carlos.demo@aurora.test` | `huesped2` | AUR-DEMO-002 |
| **Personal** | `limpieza@hotelboutique.test` | `password` | Limpieza |
| **Personal** | `roomservice@hotelboutique.test` | `password` | Room Service |
| **Personal** | `conserjeria@hotelboutique.test` | `password` | Conserjería |


## Requisitos

- Node.js 18 o superior
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
npx expo start      # servidor de desarrollo
npm run lint         # ESLint
npm run format       # Prettier — escribe cambios
npm run format:check # Prettier — solo verifica
npx tsc --noEmit     # chequeo de tipos
```

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
