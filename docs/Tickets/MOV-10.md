El rol con la cadena de estados más larga. Las pantallas viven en `modules/room-service/staff/`; el DTO, Model, Mapper y servicios son los mismos que después consumirá el huésped.

## Tareas

- [ ] Bandeja de pedidos usando `TaskListScreen`
- [ ] `staff/screens/OrderDetailScreen.tsx` con productos, cantidades, habitación y observaciones
- [ ] `staff/components/OrderItemRow.tsx`
- [ ] Aceptar y rechazar con motivo
- [ ] Avance por los seis estados del pedido
- [ ] `staff/screens/MenuScreen.tsx` — consulta del menú
- [ ] `staff/components/ChargeToRoomButton.tsx`
- [ ] Historial de pedidos atendidos

## Criterios de aceptación

1. La cadena pending → accepted → preparing → ready → onTheWay → delivered funciona en orden
2. No es posible saltarse un estado
3. El cargo a la habitación queda registrado con monto y fecha
4. El menú muestra los productos agrupados por categoría

---

**Tamaño:** M · **Depende de:** MOV-08 · **Cubre:** HU-01 a HU-12 de Personal de Room Service

**Rama sugerida:** `feature/mov-10`
