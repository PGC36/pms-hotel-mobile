# AGENTS.md

Guía para agentes de IA (Claude Code, Codex, Copilot, Cursor u otro) que trabajen en este repositorio. Para la explicación completa de la arquitectura y sus porqués, ver `architecture.md`. Para el plan de tickets y las historias de usuario, ver `docs/plan-app-movil.md`, `docs/Tickets/` y `docs/historias-de-usuario.md`.

## Estado del proyecto

Este repositorio hoy contiene **solo documentación de planificación** (`docs/`) — todavía no existe `src/`, `App.tsx` ni `package.json`. El scaffolding real ocurre en el ticket **MOV-02**. No asumas que un archivo o carpeta descrito aquí o en `architecture.md` ya existe: verifica con una búsqueda de archivos antes de editar o importar algo.

## Comandos

Una vez scaffoldeado el proyecto:

```bash
npm install
npx expo start
```

No hay lint/test/build configurados todavía (MOV-02 introduce ESLint/Prettier). Si los agregas, documenta aquí el comando exacto.

## Reglas no negociables

1. **Ninguna pantalla ni componente importa de `src/data/` directamente.** Todo acceso a datos pasa por un servicio de módulo (`*.service.ts`). Ver `architecture.md` sección 2.
2. **Los servicios son siempre `async`, siempre devuelven Models, nunca DTOs.** El Mapper es el único código que conoce ambas formas.
3. **Las transiciones de estado (`Order`, `ServiceRequest`, `Room`) se validan contra `shared/constants/statuses.ts`.** No agregues condicionales de estado sueltos en una pantalla.
4. **`room-service` y `requests` son de doble audiencia:** un solo DTO/Model/Mapper/Service; solo las carpetas `staff/` y `guest/` dentro del módulo se separan. No dupliques la capa de datos para crear una versión "de huésped" de un pedido o solicitud que ya existe para personal.
5. **Todo el código en inglés** (archivos, carpetas, variables, funciones, tipos, claves de datos). El español se usa solo en texto visible al usuario final, comentarios explicativos y documentación.
6. **Sigue las convenciones de nombres** de `architecture.md` sección 6 (kebab-case para módulos y archivos de datos, PascalCase para componentes/pantallas/tipos, camelCase para funciones, SCREAMING_SNAKE_CASE para constantes).

## Cómo trabajar con los tickets

- Cada ticket `MOV-XX` en `docs/Tickets/` tiene tareas y criterios de aceptación explícitos. Antes de implementar algo que corresponda a un ticket, lee el ticket completo — no solo el título.
- Respeta las dependencias entre tickets (`Depende de:` en cada archivo). No implementes MOV-08 sin que MOV-07 esté resuelto, por ejemplo.
- Fase 1 (personal: limpieza, room service, conserjería) se construye antes que Fase 2 (huésped) — es una decisión deliberada, no un accidente de orden. Ver `architecture.md` sección 1.
- Si una tarea toca algo listado en "Pendientes de definición" (sección 9 de `docs/plan-app-movil.md` — paleta/tipografía, moneda/formato de fecha, idioma de interfaz, contrato de datos con la web), pregunta antes de decidir por tu cuenta; son decisiones que el equipo aún no cerró.

## Datos simulados

Todo dato viene de `src/data/db.ts` (arrays con forma de DTO) hasta que exista backend. Al crear datos de prueba:
- Deben ser realistas (nombres, horarios, precios en moneda local), no relleno tipo "Test 1".
- Deben ser coherentes entre sí (un pedido debe apuntar a una habitación y un huésped que existan en `db.ts`).
- Debe existir al menos un registro en cada estado posible de cada máquina de estados.

## Al terminar un cambio

- Si el cambio corresponde a un ticket, marca sus checkboxes en `docs/Tickets/MOV-XX.md` solo cuando el criterio de aceptación correspondiente esté realmente cumplido.
- Si el cambio altera una decisión de arquitectura documentada en `architecture.md` o `docs/plan-app-movil.md`, actualiza el documento en el mismo cambio — no dejes que el documento quede desactualizado respecto al código.
