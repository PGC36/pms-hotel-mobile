El detalle genérico y el control de transiciones. Los botones se habilitan a partir de `shared/constants/statuses.ts`, nunca con condicionales sueltos en la pantalla.

## Tareas

- [ ] `TaskDetailScreen` genérico
- [ ] `StatusStepper` en modo interactivo, preparado para modo lectura
- [ ] Botones de acción habilitados según las transiciones válidas
- [ ] Confirmación antes de acciones irreversibles
- [ ] Motivo obligatorio al rechazar
- [ ] Campo de observaciones
- [ ] Actualización optimista con reversión si el servicio falla

## Criterios de aceptación

1. Solo se muestran las acciones válidas para el estado actual
2. Rechazar sin motivo es imposible
3. Al cambiar el estado, la bandeja se actualiza al volver
4. Si el servicio falla, el estado vuelve al anterior y se avisa al usuario
5. El `StatusStepper` acepta una prop de modo lectura que la Fase 2 reutilizará sin modificarlo

---

**Tamaño:** L · **Depende de:** MOV-07

**Rama sugerida:** `feature/mov-08`
