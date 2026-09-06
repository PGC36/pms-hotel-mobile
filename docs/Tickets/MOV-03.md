Definir la identidad visual y los componentes reutilizables antes de construir cualquier pantalla de dominio. Todo vive en `src/shared/`.

## Tareas

- [ ] `shared/theme/colors.ts` — paleta, incluidos colores por estado
- [ ] `shared/theme/typography.ts` — escala tipográfica
- [ ] `shared/theme/spacing.ts` — escala de espaciado
- [ ] `shared/components/Button.tsx` con variantes (primario, secundario, peligro)
- [ ] `shared/components/Card.tsx`
- [ ] `shared/components/Input.tsx`
- [ ] `shared/components/Badge.tsx`
- [ ] `shared/components/EmptyState.tsx`
- [ ] `shared/components/LoadingState.tsx`
- [ ] `shared/components/ErrorState.tsx` con acción de reintento
- [ ] Pantalla temporal de catálogo que muestre todos los componentes

## Criterios de aceptación

1. Ningún componente usa colores o tamaños escritos a mano; todo sale del tema
2. La pantalla de catálogo muestra cada componente en todas sus variantes
3. Cada estado de las máquinas de estado tiene un color asignado y consistente

---

**Tamaño:** M · **Depende de:** MOV-02

**Rama sugerida:** `feature/mov-03`
