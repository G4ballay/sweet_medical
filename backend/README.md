[![Review Assignment Due Date](https://classroom.github.com/assets/deadline-readme-button-22041afd0340ce965d47ae6ef1cefeee28c7c493a6346c4f15d667ab976d596c.svg)](https://classroom.github.com/a/Hp1cF9Q4)
# 2026 1C - TP BACKEND

[Enunciado](https://docs.google.com/document/d/1U5EYxgEFmlcIr6KldAwtHsrHBdGdVMfGUFunTRVTvwI/edit?usp=sharing)

## Estrategia de control de versiones (Git Flow)

El repositorio se estructura en torno a dos ramas principales:

* **`main` (Producción / Entregables):** El código alojado en esta rama es estrictamente estable y refleja las versiones funcionales del sistema que cumplen los requisitos de cada Checkpoint. Solo recibe actualizaciones cuando se finaliza una versión oficial.
* **`development` (Desarrollo e integración):** Esta es la rama de integración activa. Centraliza el progreso diario del equipo, la implementación de nuevas funcionalidades y la resolución de errores estructurales antes de su lanzamiento a producción.

### Flujo de trabajo

1. **Desarrollo activo:** Las nuevas funcionalidades se desarrollan integrando los cambios en la rama `development` (con el uso ocasional de ramas efímeras `feature/` para tareas complejas, a fin de evitar conflictos de integración).
2. **Cierre de la iteración (Checkpoint):** Una vez completados los requisitos para un Checkpoint, y tras verificar la integridad del sistema, se genera una **solicitud de incorporación (PR)** desde la rama `development` a la rama `main`.