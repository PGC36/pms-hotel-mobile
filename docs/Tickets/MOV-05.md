Aislar el acceso a datos detrás de servicios. **Regla de oro: ninguna pantalla ni componente importa de `data/`.** Los servicios son `async`, devuelven Models y simulan latencia de red, para obligar a programar desde el primer día con estados de carga, error y lista vacía reales.

## Tareas

- [x] `shared/services/delay.ts` con retardo configurable
- [x] `shared/services/http-client.ts` — wrapper de fetch sin uso todavía, listo para la API real
- [x] `modules/auth/services/auth.service.ts`
- [x] `modules/housekeeping/services/housekeeping.service.ts`
- [x] `modules/room-service/services/order.service.ts` y `menu.service.ts`
- [x] `modules/requests/services/service-request.service.ts`
- [x] `modules/tasks/services/task-transition.service.ts` — valida transiciones
- [x] Mecanismo para forzar un error y probar la UI de fallo

## Criterios de aceptación

1. [x] Todas las funciones son `async` y devuelven Models, nunca DTOs
2. [x] Toda respuesta pasa por un delay simulado de entre 300 y 600 ms
3. [x] Las transiciones de estado se validan contra `statuses.ts` y las inválidas se rechazan
4. [x] Existe forma de forzar un error para probar el manejo de fallos
5. [x] **Ningún archivo fuera de un servicio importa de `data/db.ts`**

---

**Tamaño:** M · **Depende de:** MOV-04

**Rama sugerida:** `feature/mov-05`
