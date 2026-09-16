# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

Este proyecto usa **`AGENTS.md`** como guía canónica para agentes de IA (reglas no negociables, comandos, cómo trabajar con los tickets `MOV-XX`, convenciones de datos simulados). Léelo antes de hacer cambios.

Para la arquitectura completa (capas DTO → Mapper → Model → Service, la decisión de una sola app con dos experiencias, máquinas de estado, estructura de carpetas, convenciones de nombres), ver **`architecture.md`**.

**El contrato de datos de esta app (DTOs, Models, máquinas de estado, literales) está reconciliado contra el de la web (`pms-hotel-boutique`), que es la fuente de verdad.** Si vas a tocar una entidad compartida (`room`, `room-type`, `room-feature`, `guest`, `booking`, `product`, `amenity`, `order`, `service-request`), lee primero `docs/HANDOFF-MOVIL.md` (el traspaso oficial) y `PROGRESO-CONTRATO.md` (qué se reconcilió, qué quedó documentado como hueco, qué no se resolvió por diseño). No cambies el nombre, tipo o literal de un campo compartido sin verificar contra esos dos documentos — si diverge de lo que dice la web, gana la web.

No hay guía adicional específica de Claude Code más allá de lo anterior — si en algún momento surge algo que aplique solo a Claude Code y no a otros agentes, documéntalo aquí.
