El ticket que define la forma de todos los datos de la app. **Es el de mayor riesgo del proyecto**: si los DTOs se diseñan con la forma que le conviene a la UI en lugar de simular una respuesta de API real, la separación en capas deja de servir para algo.

El DTO es la forma cruda (puede tener `snake_case`, fechas como texto, campos redundantes). El Model es la forma de dominio que consume la UI (tipada, con fechas como `Date` y campos calculados). El Mapper es el único punto que conoce ambas.

## Tareas

- [ ] `shared/constants/roles.ts` y `shared/constants/permissions.ts`
- [ ] `shared/constants/statuses.ts` con las tres máquinas de estado y sus transiciones válidas
- [ ] DTOs: `user`, `room`, `guest`, `booking`, `service-request`, `order`, `product`, `amenity`, `notification`
- [ ] Models correspondientes de cada DTO
- [ ] Mappers de cada par DTO → Model
- [ ] `shared/dtos/pagination.dto.ts`
- [ ] `data/db.ts` con arrays en forma de DTO: mínimo 6 usuarios (2 por rol), 15 habitaciones, 10 huéspedes con reserva y código de vinculación, 20 solicitudes, 20 pedidos, 25 productos, 8 amenidades

## Criterios de aceptación

1. Cada entidad tiene DTO, Model y Mapper, y los datos de `db.ts` respetan la forma del DTO
2. Los DTOs simulan una respuesta de API realista, no la forma que le conviene a la UI
3. Existe al menos un registro en **cada** estado posible de cada máquina de estados
4. Los datos son coherentes: un pedido apunta a una habitación y un huésped que existen
5. Los datos son realistas (nombres, horarios, precios en la moneda local), no de relleno
6. Todos los nombres de campos, tipos y archivos están en inglés

---

**Tamaño:** L · **Depende de:** MOV-02

**Rama sugerida:** `feature/mov-04`
