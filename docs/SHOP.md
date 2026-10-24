# Tienda / Arte de Samari

## Estado y alcance

Tienda integrada en Next.js, Supabase y el panel existente. No usa una segunda
autenticación ni una plataforma de comercio externa. Los pagos de productos no
están activados; la integración PayPal existente corresponde a suscripciones y
no se reutiliza como checkout de obras.

**Instalación técnica inicial:** aplicar `supabase/migrations/202610120001_shop.sql`
en el proyecto Supabase correcto y desplegar esta versión de la aplicación. Es
una operación inicial del responsable técnico, no una tarea de Samari. La sesión
de desarrollo solo dispone de URL y clave pública: no puede instalar el esquema
remoto con esas credenciales. No se incluye ni se necesita una service-role key
en la aplicación.

Una vez instalada, crear/editar/publicar obras, cambiar precios, añadir tamaños
e imágenes **no requiere código, SQL, acceso al dashboard de Supabase ni deploy**.
Las páginas públicas consultan la base de datos sin caché persistente. Al volver
a abrir o recargar `/tienda`, se ven las publicaciones nuevas.

## Arquitectura

- `/admin/tienda`: lista, filtro, crear, editar, duplicar, ocultar y desactivar.
- `/admin/tienda/[id]`: editor. La creación empieza desde “Nueva ilustración”,
  que crea un borrador y sus tamaños predeterminados en una sola transacción.
- `/tienda`: galería editorial responsive; las destacadas aparecen primero.
- `/tienda/[slug]`: ficha, galería y metadata dinámica (título, descripción y OG).
- `/carrito`: cantidades, eliminar, subtotal y explicación de pagos pendientes.
- `/api/shop/cart`: consulta de precios/disponibilidad actuales usando una clave
  pública y RLS. Solo acepta IDs de variantes y cantidades.
- `/api/shop/checkout`: frontera explícita para el futuro proveedor. Devuelve
  `503 CHECKOUT_NOT_CONFIGURED`; nunca registra cobros ni pedidos ficticios.
- `src/lib/shop`: tipos, validación, acceso público, operaciones admin y carrito.
- `src/components/shop`: componentes de galería, compra, carrito y editor.

No se incorporan dependencias de producción. Se reutilizan `next/image`, las
fuentes, los estilos administrativos, la sesión de Supabase y `perfiles.rol`.
El canvas ambiental se omite en la tienda para que las obras sean protagonistas.

## Modelo de datos

Se utiliza el prefijo `shop_` para evitar colisiones con tablas existentes.

| Tabla | Contenido |
| --- | --- |
| `shop_products` | nombre, slug único, descripción, historia, autor/a, biografía, papel, estado, destacada, demo, portada, SEO y marcas de tiempo |
| `shop_variants` | producto, nombre, ancho/alto en cm, precio entero en céntimos, activa, orden |
| `shop_images` | producto, ruta Storage, tipo original/mockup/detail, ALT y orden |
| `shop_variant_defaults` | valores iniciales A4 22 €, A3 32 €, 50 × 70 cm 52 € |

Los valores predeterminados solo se copian al crear la obra. Los precios reales
están en `shop_variants` y se editan individualmente desde el panel. No hay
precios hardcodeados en los componentes. Modificar una obra no cambia las demás.

`shop_save_product` guarda información, variantes y galería en una transacción.
Un error revierte el conjunto. Comprueba `updated_at` para evitar sobrescribir un
cambio de otro administrador. En ese caso el editor pide recargar y conservar
antes una copia de las modificaciones. `shop_duplicate_product` duplica como
borrador, con URL nueva, variantes independientes y referencias a las imágenes.

## Uso diario para Samari

1. Entrar con la cuenta administradora y abrir **Admin > Tienda**.
2. Pulsar **Nueva ilustración**. Se abre un borrador con los tamaños iniciales.
3. Escribir nombre, descripción e historia. La URL se genera desde el nombre;
   se puede editar o regenerar. Evitar cambiar URLs ya compartidas: no se crean
   redirecciones automáticas de los slugs antiguos.
4. Subir la ilustración desde **Subir original**. Añadir ALT y marcar la portada.
5. Añadir mockups o detalles mediante sus controles. Usar **Subir/Bajar** para
   reordenar. Estas imágenes se distinguen en la galería pública.
6. Revisar tamaños y precios. Añadir, desactivar o eliminar tamaños según convenga.
7. Completar la información del papel, la biografía y los campos SEO opcionales.
   Open Graph puede usar cualquier imagen de la galería o la principal.
8. Elegir **Publicada** y pulsar **Guardar cambios**. Para una obra real se exige
   portada original con ALT y al menos una variante activa.
9. Abrir **Ver en la tienda**. No hace falta volver a desplegar.

El formulario avisa de cambios sin guardar y confirma eliminaciones. Ocultar
cambia la obra a borrador. Desactivar conserva todo, pero la retira de la tienda.
Para recuperarla, editarla y cambiar su estado. No hay borrado irreversible de
productos en la interfaz; se utiliza la opción de desactivación solicitada.

## Imágenes y Storage

Bucket público `shop-products`, con rutas `<product-uuid>/<image-uuid>.jpg|png|webp`.
Límite de 8 MB por archivo y 30 imágenes por obra. Solo se admiten JPG/PNG/WebP;
no SVG ni HTML. Las rutas únicas evitan sobrescrituras y conflictos de caché.
La imagen original y las miniaturas usan `next/image` y `sizes` responsivos.

Los archivos se suben antes del guardado; la galería y la portada se publican al
guardar. Al quitar una imagen y guardar se elimina del Storage si ninguna obra
la usa. Las copias comparten el archivo, pero tienen sus propias filas de galería:
eliminar una referencia no rompe otra obra. RLS protege también esa eliminación.
Si falla la limpieza, el editor lo indica y permite reintentar con Guardar cambios.
Salir sin guardar después de subir puede dejar archivos huérfanos, no publicados
en el catálogo. La limpieza periódica de esos huérfanos es una mejora operativa
pendiente; no impide la gestión del catálogo.

El bucket es público por diseño: conocer la URL permite leer también una imagen
de un borrador. No subir originales privados o material que deba ser confidencial.

## Autorización y RLS

La comprobación de la sesión en el layout es ayuda de interfaz. La protección
efectiva está en PostgreSQL/Storage, no en ocultar enlaces:

- `shop_is_admin()` comprueba `perfiles.rol = 'admin'` para `auth.uid()`.
  Es una función acotada `SECURITY DEFINER` con `search_path` vacío.
- Las funciones de gestión son `SECURITY INVOKER`, validan el rol y respetan RLS.
  Solo `authenticated` puede ejecutarlas.
- Anónimos/usuarias ven obras publicadas, variantes activas y su galería.
  No pueden crear, modificar precios, publicar, borrar o subir archivos.
- Las políticas restrictivas de Storage impiden que una política permisiva
  antigua conceda escrituras en este bucket.
- Un trigger sobre `perfiles` impide que clientes no administradores cambien
  roles/identidades, se creen un perfil admin o eliminen perfiles admin. No cambia
  ningún dato ni introduce roles nuevos. Operaciones de servicio/migración siguen
  disponibles; el resto del sistema conserva sus políticas existentes.

Referencias: [RLS de Supabase](https://supabase.com/docs/guides/database/postgres/row-level-security),
[Storage](https://supabase.com/docs/guides/storage/security/access-control),
[funciones de base de datos](https://supabase.com/docs/guides/database/functions).

## Demostración

`supabase/seeds/shop_demo.sql` es opcional y separado de la migración. Inserta 14
obras neutrales, “Obra 01” a “Obra 14”, publicadas y marcadas como demostración.
No contiene ilustraciones inventadas ni historias. Los placeholders son marcos
tipográficos. Las demos no se pueden añadir al carrito ni cotizar como comprables.

Desde el editor se pueden reemplazar sus datos, subir imágenes, desmarcar “Obra
de demostración” y guardar. También pueden desactivarse todas de forma individual.
Sin instalar la base de datos, la app muestra un error de conexión/configuración;
no sustituye silenciosamente la base real por un catálogo ficticio.

## Carrito y futuros pagos

Se guarda una lista versionada de IDs de variante y cantidades en localStorage.
Persiste al navegar/recargar y se sincroniza entre pestañas. Es por navegador, no
por cuenta; no almacena datos personales ni bancarios. Límites: 50 variantes y
20 unidades por variante. El servidor descarta precios proporcionados por cliente
y calcula con variantes activas de obras publicadas no demo. Las obras retiradas
se muestran como no disponibles y se pueden quitar. No se reserva inventario.

Para habilitar Stripe todavía se necesitan:

- Cuenta/proyecto Stripe, catálogo de envío, impuestos y condiciones de venta.
- Modelo de pedidos y líneas con snapshots de precio, identidad y dirección.
- Checkout Session creada en servidor con recotización, validación de stock y
  claves de idempotencia; nunca precios recibidos desde localStorage.
- Webhook con firma verificada y procesamiento idempotente; el retorno del
  navegador no acredita un pago.
- Gestión de envíos, confirmaciones, cancelaciones y reembolsos.
- Variables servidor futuras: `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET` y una
  URL canónica de retorno validada (`NEXT_PUBLIC_SITE_URL`, si se configura).
  `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` solo si la integración cliente elegida la
  necesita. No son necesarias para esta versión y no hay credenciales ficticias.

## Verificación

`node --test tests/shop-domain.test.cjs` verifica cantidades, entradas corruptas,
precios activos, slugs y los requisitos de publicación.

`tests/shop-database.cjs` ejecuta la migración y el seed en PostgreSQL aislado
(PGlite, herramienta de pruebas fuera de las dependencias de producción). Configurar
`PGLITE_MODULE` con la ruta al paquete instalado y ejecutar `node tests/shop-database.cjs`.
Prueba RLS con anon/usuario/admin, protección de roles, Storage incluso con una
política heredada permisiva, guardado atómico, conflictos, duplicación y publicación.
El esquema auth/storage del test es un arnés mínimo, no una instancia Supabase
real. La verificación remota final requiere instalar la migración y una sesión
admin real: crear → subir → guardar → publicar → comprobar tienda → carrito.

`node tests/shop-responsive.cjs` renderiza componentes reales con fixtures de
demostración, en un navegador aislado, y comprueba anchos de 375 y 1280 px. Guarda
capturas en la carpeta temporal `ginergetica-shop-review`. Utiliza fuentes de reserva
para el arnés; no sustituye la comprobación final de la app con una sesión real.

En la revisión del entorno conectado, la consulta a `shop_products` devolvió
HTTP 404 / `PGRST205`: la migración aún no está instalada. Las pruebas PostgreSQL
aisladas pasan; esto no acredita la instalación ni las políticas en producción.
