Primer rol completo. Reutiliza `TaskListScreen` y `TaskDetailScreen` para las solicitudes, y agrega la vista propia de habitaciones.

## Tareas

- [ ] `RoomListScreen` — habitaciones pendientes agrupadas
- [ ] `RoomCard`
- [ ] Tab de solicitudes usando `TaskListScreen`
- [ ] Cambio de estado operativo de la habitación
- [ ] `ReportIssueScreen` con descripción y prioridad
- [ ] Historial de tareas completadas

## Criterios de aceptación

1. Las habitaciones se listan agrupadas por piso o por estado
2. El flujo dirty → cleaning → clean funciona completo
3. Un desperfecto reportado queda registrado y visible
4. El historial muestra solo las tareas del usuario en sesión

---

**Tamaño:** M · **Depende de:** MOV-08 · **Cubre:** HU-01 a HU-10 de Personal de limpieza

**Rama sugerida:** `feature/mov-09`
