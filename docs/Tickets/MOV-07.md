Ticket clave del proyecto. Los tres roles de personal comparten el mismo patrón (bandeja → detalle → avanzar estado → completar), así que esta pantalla se construye una vez y se configura por rol.

**Riesgo:** si no queda realmente genérica, los tres roles se convierten en tres desarrollos separados y el alcance se dispara.

## Tareas

- [ ] `models/task.model.ts` — abstracción común de solicitud, pedido y tarea
- [ ] `TaskCard` configurable por tipo de entidad
- [ ] `TaskFilters` — filtro por estado y búsqueda
- [ ] `StatusBadge`
- [ ] `TaskListScreen` que recibe el servicio y la configuración por parámetro
- [ ] Estados de carga, vacío y error
- [ ] Recarga por gesto de arrastre (pull to refresh)
- [ ] Ordenamiento por antigüedad

## Criterios de aceptación

1. La misma pantalla renderiza solicitudes de limpieza, pedidos de Room Service y solicitudes de conserjería **sin duplicar código**
2. Los filtros aplican sin recargar la pantalla completa
3. Lista vacía muestra `EmptyState`, no una pantalla en blanco
4. Error de servicio muestra `ErrorState` con botón de reintento

---

**Tamaño:** L · **Depende de:** MOV-06

**Rama sugerida:** `feature/mov-07`
