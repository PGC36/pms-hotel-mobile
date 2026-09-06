El navegador raíz decide qué árbol cargar según el tipo de sesión. Un huésped nunca instancia el árbol del personal, y viceversa.

```
RootNavigator
├── sin sesión      → AuthNavigator
├── sesión = staff  → StaffNavigator
└── sesión = guest  → GuestNavigator
```

## Tareas

- [ ] `AuthContext` con sesión tipada (staff | guest), login, logout y persistencia
- [ ] `RootNavigator` que decide entre Auth, Staff y Guest
- [ ] `AuthNavigator` con acceso a las dos pantallas de entrada
- [ ] `StaffNavigator` con tabs que cambian según el rol
- [ ] `GuestNavigator` declarado aunque sus pantallas lleguen en la Fase 2
- [ ] `routes.ts` con las rutas tipadas
- [ ] `LoginScreen` con validación y manejo de error

## Criterios de aceptación

1. Iniciar sesión con un usuario de limpieza muestra solo los tabs de limpieza
2. Lo mismo para Room Service y Conserjería
3. Credenciales incorrectas muestran un error claro sin cerrar la app
4. La sesión sobrevive al reinicio de la app
5. **Con sesión de personal el árbol de huésped no se instancia, y viceversa**
6. Las rutas están tipadas y no admiten parámetros incorrectos

---

**Tamaño:** M · **Depende de:** MOV-03, MOV-05

**Rama sugerida:** `feature/mov-06`
