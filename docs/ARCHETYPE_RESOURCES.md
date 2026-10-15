# Audios y PDF de arquetipos

## Activación

Aplicar una vez `supabase/migrations/202610150001_archetype_resources.sql` en el proyecto Supabase de la aplicación y desplegar el código actualizado.
La migración crea el bucket público `arquetipo-recursos` y permite subir archivos únicamente a perfiles con `rol = 'admin'`, vinculados a un arquetipo existente.
Los recursos tienen URLs públicas, igual que los enlaces que consumen actualmente el ciclo y el ritual. No usar este bucket para documentos privados.

## Uso de Sami

1. Entrar en Admin → Mujer Chakana → Editar un arquetipo.
2. Pulsar **Elegir audio** o **Elegir PDF**, y seleccionar el archivo del dispositivo.
3. Revisar el audio o PDF y pulsar **Guardar cambios**.

Audio: MP3, M4A, WAV, OGG, AAC o WebM, hasta 50 MB. PDF: hasta 20 MB en el formulario; el bucket tiene un límite general de 50 MB.
La URL se genera y guarda automáticamente. Los enlaces anteriores se conservan cuando no se selecciona un reemplazo.
Descartar selección vuelve al recurso guardado. Las subidas usan rutas nuevas, sin sobrescribir ni borrar archivos existentes.
Si falla la actualización del arquetipo, volver a guardar reutiliza las subidas completadas mientras se mantenga abierta la página.
Cerrar la página tras una subida fallida puede dejar archivos sin referencia; no se eliminan automáticamente.

## Verificación con sesión de administradora

- Seleccionar un audio y un PDF, revisar las vistas previas y guardar.
- Volver al editor y comprobar que ambos recursos se abren; comprobar también el ciclo y el ritual.
- Comprobar el rechazo de archivos vacíos, de otro tipo o que superen los límites.
- Comprobar que descartar una selección conserva el recurso anterior.
- Una sesión sin rol admin no debe poder insertar objetos en el bucket.
