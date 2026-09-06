El huésped sigue en pantalla el mismo pedido que Room Service avanza. No hay traducción de estados entre una experiencia y otra: es el mismo `OrderModel`.

## Tareas

- [ ] `guest/screens/MyOrdersScreen.tsx`
- [ ] `guest/screens/OrderTrackingScreen.tsx`
- [ ] Reutilizar `StatusStepper` en modo lectura
- [ ] Cancelación mientras el pedido lo permita

## Criterios de aceptación

1. El estado mostrado coincide con el que fijó Room Service, sin traducción intermedia
2. La cancelación solo aparece en estados cancelables
3. **El `StatusStepper` es el mismo componente de MOV-08, sin modificarlo**

---

**Tamaño:** M · **Depende de:** MOV-18 · **Cubre:** HU-18 y HU-19 del Huésped

**Rama sugerida:** `feature/mov-19`
