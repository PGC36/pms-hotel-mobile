Inicializar el proyecto Expo y dejar creada la estructura modular completa. **Todo el código en inglés**: archivos, carpetas, variables, funciones, tipos y claves de datos. El español se usa solo en textos visibles al usuario, comentarios y documentación.

## Tareas

- [ ] Inicializar Expo con plantilla TypeScript
- [ ] Crear la estructura completa de `src/` (navigation, modules, shared, data, hooks)
- [ ] Instalar React Navigation y sus dependencias
- [ ] Configurar el alias `@/` hacia `src/`
- [ ] Configurar ESLint y Prettier
- [ ] Crear `architecture.md` explicando el patrón DTO → Mapper → Model
- [ ] Crear `CLAUDE.md` con las convenciones de código
- [ ] Completar el `README.md` con instalación y ejecución

## Criterios de aceptación

1. `npm install && npx expo start` levanta la app sin errores
2. La app corre en emulador Android mostrando una pantalla base
3. La estructura de carpetas está creada completa, aunque los archivos estén vacíos
4. El alias `@/` resuelve correctamente desde cualquier módulo
5. El linter corre limpio
6. `architecture.md` explica las cuatro capas con un ejemplo real de código

---

**Tamaño:** M · **Depende de:** MOV-01

**Rama sugerida:** `feature/mov-02`
