La pantalla con más estado local de la app. Sin DTOs ni mappers: el carrito nace de `ProductModel` más la interacción del usuario, no de una fuente de datos externa.

## Tareas

- [ ] `models/cart-item.model.ts`
- [ ] `services/cart.service.ts` con funciones puras: `addToCart`, `removeFromCart`, `increaseQuantity`, `decreaseQuantity`, `getCartTotal`, `getCartCount`
- [ ] `context/CartContext.tsx` con persistencia local
- [ ] `CartScreen`
- [ ] `CartItemRow`, `QuantityStepper`, `CartSummary`
- [ ] Observaciones del pedido
- [ ] Confirmación y creación del pedido vía `order.service.ts`

## Criterios de aceptación

1. El carrito conserva su contenido al navegar entre categorías
2. Las funciones de `cart.service.ts` son puras y testeables sin montar componentes
3. No es posible confirmar un carrito vacío
4. El total coincide con la suma de los productos
5. **El pedido creado aparece en la bandeja de Room Service sin ninguna conversión adicional**

---

**Tamaño:** L · **Depende de:** MOV-17 · **Cubre:** HU-17 del Huésped

**Rama sugerida:** `feature/mov-18`
