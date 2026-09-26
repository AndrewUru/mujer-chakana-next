# Revisión de UI — 26 de septiembre de 2026

Referencia visual: inicio, bienvenida, dashboard y login. Paisajes oscuros en tonos vino, tipografía editorial, acentos rosa y formularios con contraste alto.

## Adaptadas en esta revisión

- `/setup`: composición de dos columnas, resumen de identidad/ciclo/membresía y formulario con estilos propios. Etiquetas asociadas y foco visible para la carga de imagen.
- `/auth/register`: nueva composición inmersiva y formulario existente.
- `/auth/recuperar`: nueva composición, campo de correo y mensajes de estado.
- `/auth/actualizar-clave`: nueva composición; corregida la redirección final a `/auth/login`.
- `/auth/update-password`: nueva composición y etiqueta visible para el campo.
- Transición global: mantener el mismo contenedor en servidor y navegador al activar movimiento reducido evita el error de hidratación detectado durante la revisión.

## Pendientes detectadas en el código

| Prioridad | Rutas | Evidencia y siguiente trabajo |
| --- | --- | --- |
| Alta | `/recursos`, `/recursos/[id]` | Fondos claros, tarjetas `glass-panel` y degradados rosas. Adaptar búsqueda, filtros, tarjetas y detalle juntos. |
| Alta | `/registros` | Tarjetas claras y modal de eliminación con el estilo anterior. Revisar listado, filtros, vacíos y confirmación. |
| Alta | `/audios/[id]` | Paneles blancos y degradados rosa/morado. Adaptar reproductor y contenido manteniendo los controles visibles. |
| Media | `/suscripcion`, `/suscripcion/gestionar` | Tarjetas blancas y encabezados con degradado. Revisar planes, estado de membresía y controles de pago. |
| Media | `/manual`, `/politica-cookies` | Contenedores claros del sistema anterior. Crear composición editorial de lectura. |
| Media | `/ritual` | La ruta delega en `RitualViewerWrapper`; revisar también los visores antes de definir el alcance visual. |
| Baja | `/admin` y sus siete páginas de gestión | Paneles y formularios blancos/rosas. Requieren una variante de administración que conserve densidad y legibilidad de tablas. |

Esta lista es una auditoría del código, no una verificación visual de todas las rutas. Inicio, bienvenida, dashboard, ciclo y login ya tienen composiciones nuevas; sus componentes internos pueden requerir ajustes puntuales.
