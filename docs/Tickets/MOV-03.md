Definir la identidad visual y los componentes reutilizables antes de construir cualquier pantalla de dominio. Todo vive en `src/shared/`.

## Tareas

- [x] `shared/theme/colors.ts` — paleta, incluidos colores por estado
- [x] `shared/theme/typography.ts` — escala tipográfica
- [x] `shared/theme/spacing.ts` — escala de espaciado
- [x] `shared/components/Button.tsx` con variantes (primario, secundario, peligro)
- [x] `shared/components/Card.tsx`
- [x] `shared/components/Input.tsx`
- [x] `shared/components/Badge.tsx`
- [x] `shared/components/EmptyState.tsx`
- [x] `shared/components/LoadingState.tsx`
- [x] `shared/components/ErrorState.tsx` con acción de reintento
- [x] Pantalla temporal de catálogo que muestre todos los componentes

## Criterios de aceptación

1. [x] Ningún componente usa colores o tamaños escritos a mano; todo sale del tema
2. [x] La pantalla de catálogo muestra cada componente en todas sus variantes
3. [x] Cada estado de las máquinas de estado tiene un color asignado y consistente

---

**Tamaño:** M · **Depende de:** MOV-02

**Rama sugerida:** `feature/mov-03`
