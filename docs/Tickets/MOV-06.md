El navegador raíz decide qué árbol cargar según el tipo de sesión. Un huésped nunca instancia el árbol del personal, y viceversa.

```
RootNavigator
├── sin sesión      → AuthNavigator
├── sesión = staff  → StaffNavigator
└── sesión = guest  → GuestNavigator
```

## Tareas

- [x] `AuthContext` con sesión tipada (staff | guest), login, logout y persistencia
- [x] `RootNavigator` que decide entre Auth, Staff y Guest
- [x] `AuthNavigator` con acceso a las dos pantallas de entrada
- [x] `StaffNavigator` con tabs que cambian según el rol
- [x] `GuestNavigator` declarado aunque sus pantallas lleguen en la Fase 2
- [x] `routes.ts` con las rutas tipadas
- [x] `LoginScreen` con validación y manejo de error

## Criterios de aceptación

1. [x] Iniciar sesión con un usuario de limpieza muestra solo los tabs de limpieza
2. [x] Lo mismo para Room Service y Conserjería
3. [x] Credenciales incorrectas muestran un error claro sin cerrar la app
4. [x] La sesión sobrevive al reinicio de la app
5. [x] **Con sesión de personal el árbol de huésped no se instancia, y viceversa**
6. [x] Las rutas están tipadas y no admiten parámetros incorrectos

---

**Tamaño:** M · **Depende de:** MOV-03, MOV-05

**Rama sugerida:** `feature/mov-06`
