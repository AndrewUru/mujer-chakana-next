# SEO de Ginergética

## Dominio y páginas públicas

El dominio canónico es `https://www.ginergetica.com`. `src/lib/seo.ts` centraliza
la identidad y la creación de títulos, descripciones, canónicas y tarjetas sociales.
La portada, `/manual`, `/recursos` y `/suscripcion` tienen metadatos propios.
La portada contiene datos estructurados `WebSite` y enlaces HTML a estas páginas.

`next.config.ts` redirige permanentemente `/register` a `/auth/register` y las
peticiones al dominio sin `www` a su equivalente con `www`, conservando ruta y consulta.
Si el proveedor de hosting tiene una redirección del dominio anterior a Next.js,
hay que comprobar también allí que sea permanente: la configuración de la aplicación
no puede cambiar una respuesta emitida antes por el proveedor.

## Indexación y recursos

- `/robots.txt` permite rastrear el HTML y anuncia `/sitemap.xml`. Solo excluye `/api/`.
- Las zonas de cuenta, administración, diario, perfil, ciclo, rituales y gestión de
  suscripción llevan `noindex, nofollow`. No se bloquean en robots.txt para que los
  buscadores puedan leer esa instrucción. Esto no sustituye a la autenticación.
- El sitemap contiene las cuatro páginas públicas y los recursos activos visibles
  con la clave anónima de Supabase. No inventa fechas de modificación.
- El servidor solo envía los campos descriptivos de los recursos al HTML. La lectura
  admite instalaciones sin las columnas opcionales de portada o arquetipo y filtra
  explícitamente los campos antes de serializarlos. Nunca usa una clave de servicio
  ni incluye las URL de archivos en el HTML público.
- Las fichas públicas muestran título y descripción desde el servidor; la autorización
  y la carga del archivo continúan en el cliente con la sesión existente.
- Un ID de formato inválido devuelve un 404 real. Si Supabase no devuelve un registro
  anónimamente, no se puede distinguir entre uno privado por RLS y uno inexistente:
  esa URL se sirve con `noindex`, conservando la consulta autenticada del cliente.
  Si tampoco existe para esa sesión, la navegación termina en `/recursos/no-disponible`,
  que devuelve 404 en una petición de documento. No se publica ese ID en el sitemap.
- Los errores de conexión con Supabase no se convierten en falsos 404 ni en sitemaps vacíos.

La biblioteca carga también sus tarjetas públicas desde el servidor. Los planes
pueden consultarse sin sesión; los botones de PayPal se cargan después de comprobar
la cuenta. No se han cambiado los importes ni la lógica de aprobación del pago.

## Verificación local

Con los demás servidores Next detenidos:

```sh
node scripts/verify-seo.mjs
npx tsc --noEmit
npm run build
```

La prueba de integración inicia Next en el puerto 3100 y una API local con datos
ficticios. Comprueba HTML, metadatos, sitemap, robots, redirecciones, estados 404,
ausencia de URL de archivos premium en el HTML y acceso de una sesión simulada.
No escribe datos en Supabase ni realiza pagos. `SEO_TEST_PORT` permite cambiar el puerto.

## Después del despliegue

1. Comprobar redirecciones y metadatos en el dominio de producción.
2. Verificar la propiedad en Google Search Console mediante DNS o, si se usa una
   etiqueta HTML, configurar `GOOGLE_SITE_VERIFICATION` con el valor real y desplegar.
   Sin ese valor no se emite ninguna etiqueta de verificación de ejemplo.
3. Enviar `https://www.ginergetica.com/sitemap.xml` e inspeccionar una URL de cada tipo.
4. Comprobar qué recursos permite leer anónimamente la política RLS. Si se necesitan
   más fichas públicas, crear una vista de metadatos o una política específica;
   no hacer públicos los archivos premium para resolver el SEO.
5. Medir Core Web Vitals en producción y revisar posteriormente cobertura,
   impresiones y clics. La implementación no garantiza posiciones ni indexación.
