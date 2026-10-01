[![Review Assignment Due Date](https://classroom.github.com/assets/deadline-readme-button-22041afd0340ce965d47ae6ef1cefeee28c7c493a6346c4f15d667ab976d596c.svg)](https://classroom.github.com/a/mHaMUGDl)

# 2026 1C - TP FRONTEND

[Enunciado](https://docs.google.com/document/d/1U5EYxgEFmlcIr6KldAwtHsrHBdGdVMfGUFunTRVTvwI/edit?usp=sharing)

## Cumplimiento de Requerimientos No Funcionales

**Seguridad**
Se implementó autenticación y autorización mediante tokens JWT. En el frontend, el acceso a las vistas está restringido mediante componentes enrutadores protegidos (`ProtectedRoute`), los cuales verifican tanto la validez de la sesión como el nivel de acceso (rol Paciente o Médico) antes de renderizar la página.

**Rendimiento y Eficiencia**
La recuperación de datos se realiza mediante paginación desde el servidor, evitando cuellos de botella en la red y en el cliente. En el frontend, se aplicó memoización de funciones (`useCallback`) y valores (`useMemo`), junto con técnicas de "debounce" en los inputs de búsqueda para minimizar el número de peticiones HTTP y renderizados innecesarios en el árbol de componentes.

**Usabilidad**
La interfaz gráfica se construyó con Material UI asegurando un diseño responsivo (mobile-first) mediante el uso de breakpoints. Se priorizó el feedback continuo al usuario implementando manejadores de estado asíncrono (indicadores de carga, "skeletons" para contenido en espera) y un sistema centralizado de alertas de éxito o error (a expadirse).

**Mantenibilidad**
El frontend sigue un patrón de arquitectura modular. La lógica de negocio y las llamadas a la API están desacopladas de la interfaz gráfica mediante el uso de "custom hooks" (ej. `useSearchAppointments`, `useAuth`). Las opciones de ordenamiento y filtrado utilizan diccionarios y enumeradores unificados, eliminando el uso de cadenas hardcodeadas.

**Escalabilidad**
La arquitectura cliente-servidor está completamente separada mediante el consumo de una API REST. Los componentes de la interfaz de usuario se extrajeron en unidades pequeñas, agnósticas y reutilizables (ej. `AppointmentSortBar`, `AppointmentSearchBox`), facilitando la adición de nuevas funcionalidades y vistas en el futuro sin modificar la estructura base.
