# PMS Hotel Boutique — App Móvil

Aplicación móvil del Property Management System para hoteles boutique.
Construida con React Native y Expo.

> **Estado:** en desarrollo · Fase 0 (base del proyecto)
> Este repositorio contiene únicamente el frontend. No hay backend en esta etapa:
> todos los datos son simulados.

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
- Datos 100 % simulados en `src/data/db.ts`

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

## Estructura
