Inicio de la Fase 2. En móvil el huésped **no crea cuenta**: vincula el código de su reserva. El registro, login y perfil pertenecen a la web pública.

## Tareas

- [ ] DTO, Model, Mapper y `booking.service.ts`
- [ ] Extender `AuthContext` para la sesión de huésped
- [ ] `LinkBookingScreen` con validación
- [ ] Manejo de código inválido, reserva vencida y reserva ya vinculada
- [ ] Completar `GuestNavigator` con sus tabs

## Criterios de aceptación

1. Un código válido de `db.ts` da acceso a la experiencia de huésped
2. Un código inválido muestra error sin cerrar la app
3. La vinculación sobrevive al reinicio
4. Con sesión de huésped no existe ninguna ruta hacia pantallas de personal

---

**Tamaño:** M · **Depende de:** MOV-13 · **Cubre:** HU-11 del Huésped

**Rama sugerida:** `feature/mov-14`
