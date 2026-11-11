# Mi Bautizo · Dulce Abigail

Invitación de Dulce Abigail Flores Martínez para el sábado 26 de diciembre de 2026. Experiencia editorial móvil con fotografías reales, música, ubicaciones, confirmación por WhatsApp y recuerdos con moderación.

## Desarrollo

Requiere Node.js 22.12 o posterior y npm.

```sh
npm ci
npm run dev
npm test
npm run build
npm run preview
```

Abrir la dirección que imprime Vite, incluyendo `/bautizo-dulce-abigail/`. La producción está en `dist/` y no necesita servidor Node. Tecnologías: React, TypeScript, Vite, CSS y Lucide; backend opcional Supabase PostgreSQL/Storage/Edge Functions y Cloudflare Turnstile.

## Contenido y recursos

- `src/config/event.ts`: nombres, fecha, teléfonos, ubicaciones y textos alternativos.
- `src/App.tsx`: narrativa, secciones y formulario. `src/styles/main.css`: identidad y adaptación móvil.
- `src/lib/event.mjs`: cuenta regresiva, mensaje y archivo de calendario; actualizar junto con la configuración si cambia el evento.
- Las 11 fotografías originales y la canción permanecen intactas en `images/`.
- `src/config/photos.json` documenta nombres y dimensiones originales. Todas las fotografías son verticales; el mosaico conserva sus proporciones.
- La portada usa la foto del primer mes (número 8), la bendición el retrato de recién nacida (1) y el cierre la foto familiar (10). La galería contiene las 11 sin repetir entradas.
- `public/images/`: versiones WebP a 480, 960 y 1440 px. Para regenerarlas instalar Pillow y ejecutar `python scripts/prepare-images.py` desde la raíz. El script utiliza Georgia de macOS para la imagen social; en otro sistema ajustar la ruta de la fuente.
- Para sustituir fotos, actualizar originales, regenerar y revisar los puntos de enfoque. No modificar caras. El script elimina los metadatos al exportar.
- La canción normalizada está en `public/audio/youll-be-in-my-heart.mp3`; sustituir ese archivo para cambiarla. Los originales no se eliminan.
- `public/og-image.jpg` mide 1200 × 630, con una fotografía real. Los metadatos de WhatsApp están en el HTML inicial; WhatsApp puede conservar una tarjeta anterior en caché.

La música solo comienza tras abrir la invitación; volumen 32 %, bucle y control de pausa. Si el navegador la bloquea, se ofrece reintentar. Las fotos secundarias se cargan bajo demanda. Se respeta la preferencia de movimiento reducido.

## Fecha y calendario

La cuenta regresiva usa `2026-12-26T12:00:00-06:00`, equivalente a `2026-12-26T18:00:00Z`. Ese día se muestra la celebración y posteriormente un agradecimiento; nunca valores negativos. El archivo ICS usa UTC, equivalente al mediodía de America/Mexico_City. No incluye DTEND ni DURATION: RFC 5545 permite eventos de fecha/hora sin estos campos, por lo que no se inventa una conclusión. El calendario del invitado podría aplicar su duración visual predeterminada.

## GitHub Pages

Destino: https://antauri7.github.io/bautizo-dulce-abigail/

La ruta base de Vite ya está configurada. El workflow `.github/workflows/deploy.yml` instala con `npm ci`, ejecuta pruebas y compilación, sube `dist/` y publica con OIDC. No requiere tokens personales.

1. En **Settings → Pages → Build and deployment → Source**, el repositorio usa **GitHub Actions**.
2. Subir los archivos a la rama `main` del repositorio existente (o revisar y fusionar una rama).
3. Revisar **Actions → Publicar invitación en GitHub Pages**. Se puede iniciar manualmente con workflow_dispatch.
4. Esperar a que ambos jobs terminen y abrir la URL. Revisar imágenes, audio y tarjeta social desde un dispositivo real.

Para actualizar después: editar, ejecutar pruebas y build, commit y push a main. El workflow publica automáticamente. No hay rutas SPA adicionales que requieran redirecciones.

## Recuerdos: configuración opcional

Sin configuración la invitación funciona y muestra honestamente que todavía no recibe fotografías. No realiza cargas simuladas ni almacena datos de confirmación. Proyecto Supabase conectado: `bautizo-dulce-abigail` (`ubknchfowemwolytvmex`). Se aplicó la migración `private_moderated_memories`: tablas `memories` y `upload_limits`, RLS, permisos restringidos, función de límites sin SECURITY DEFINER y bucket `memories-private` privado. Se verificaron las restricciones de lectura/escritura anónimas. Los depósitos preexistentes no se modificaron. Turnstile está configurado para `antauri7.github.io`; la Edge Function `memories` está desplegada y sus secretos se guardaron en Supabase. Las claves públicas se centralizan en `src/config/services.ts`, con opción de sustituirlas mediante variables VITE. Se comprobó GET 200 (galería vacía), rechazo 403 de origen distinto y rechazo 403 de token inválido. Falta la prueba completa de un envío con verificación válida y moderación. No volver a aplicar la migración inicial en este proyecto.

1. Crear un proyecto Supabase. Ejecutar `supabase/migrations/202611100001_memories.sql` en SQL Editor de un proyecto nuevo, o aplicar mediante Supabase CLI. El bucket `memories-private` es privado. Las tablas tienen RLS y ningún permiso para anon/authenticated. No añadir políticas públicas a `storage.objects`.
2. Crear un widget Cloudflare Turnstile para `antauri7.github.io`. En desarrollo usar otro proyecto/widget y origen localhost.
3. Guardar **solo en secretos de Edge Functions**:
   - `ALLOWED_ORIGIN=https://antauri7.github.io` (sin ruta ni barra final).
   - `TURNSTILE_HOSTNAME=antauri7.github.io`.
   - `TURNSTILE_SECRET_KEY`: secreto de Cloudflare.
   - `RATE_LIMIT_SALT`: valor aleatorio largo para hash de IP.
   - `MAX_FILES=5` (entre 1 y 5; puede reducirse).
   Supabase proporciona `SUPABASE_URL` y `SUPABASE_SERVICE_ROLE_KEY` al runtime. Nunca poner service_role en variables VITE ni en GitHub variables del frontend.
4. Con Supabase CLI autenticada:

```sh
supabase link --project-ref TU_PROJECT_REF
supabase functions deploy memories --no-verify-jwt
```

`supabase/config.toml` desactiva la verificación JWT de esta función pública: la función valida consentimiento, Turnstile, origen y límites en el servidor. La clave pública no autentica un administrador. Mantener el resto de funciones con su protección normal.

5. Copiar `.env.example` a `.env.local` y configurar `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY` (clave pública anon) y `VITE_TURNSTILE_SITE_KEY`. Para producción añadir los mismos nombres en **Settings → Secrets and variables → Actions → Variables**. Volver a compilar/desplegar.
6. Probar en un proyecto de pruebas la matriz descrita más abajo antes de habilitarlo para invitados.

Las fotos aceptadas son JPG y PNG (máximo 6 MB y 24 megapíxeles); el frontend permite hasta cinco por envío. HEIC debe exportarse a JPG. La función comprueba MIME, extensión, firma y decodificación; recodifica a JPEG y reduce el lado mayor a 2000 px para eliminar EXIF/GPS y contenido adjunto. No almacena nombres de invitados ni nombres originales de archivos. El límite es seis intentos por IP por hora y cien globales por hora, reservado mediante actualización atómica de PostgreSQL. Turnstile se valida con hostname y acción. Un envío puede consumir cuota aunque falle. La función limita el cuerpo incluso sin Content-Length. El entorno de Edge Functions aplica además sus límites de memoria/CPU a imágenes malformadas; monitorizar errores y cuotas del proyecto.

El progreso representa transferencia, seguido por procesamiento en servidor. Solo se anuncia recepción al recibir HTTP 201 después de guardar archivos y metadatos. Si falla un lote se intenta limpiar lo guardado; revisar objetos huérfanos si hubo una caída del servicio. La interfaz permite reintentar. No cerrar la página durante el envío.

### Moderación y publicación

No existe panel administrativo público. Usar Supabase Dashboard con cuenta protegida y, preferiblemente, MFA:

1. Abrir `public.memories` en Table Editor y filtrar `status = pending`.
2. En Storage → memories-private localizar la ruta de la fila. Usar el visor autenticado de Dashboard para inspeccionar la imagen; no compartir enlaces temporales de imágenes pendientes.
3. Si existe consentimiento apropiado y la fotografía es adecuada, cambiar **solo** `status` a `approved`. Para rechazar cambiarlo a `rejected`.
4. La consulta pública de la Edge Function selecciona únicamente filas aprobadas y genera enlaces firmados de diez minutos. El bucket permanece privado: no es necesario copiar a uno público ni exponer las filas pendientes.
5. Recargar la invitación para actualizar la galería. Los enlaces expiran a los diez minutos; si se dejan abiertos, recargar para obtener otros. Revocar aprobación evita emitir nuevos enlaces; los ya emitidos duran hasta diez minutos. Para retirada inmediata eliminar también el objeto desde Dashboard.

Puede eliminarse periódicamente del SQL Editor `delete from public.upload_limits where expires_at < now();`. Acordar con la familia la retención de recuerdos rechazados y eliminar sus objetos y filas mediante Dashboard. Las imágenes aprobadas se consideran visibles para cualquiera con el enlace de la invitación; el consentimiento lo explica.

Referencias: [Storage privado](https://supabase.com/docs/guides/storage/serving/downloads), [validación obligatoria de Turnstile](https://developers.cloudflare.com/turnstile/get-started/server-side-validation/).

## Verificación

- `npm test`: pruebas del instante en zona horaria, límite a cero, validación/mensaje WhatsApp y calendario con plegado UTF-8.
- `npm run build`: TypeScript y producción.
- `npx deno check --node-modules-dir=auto supabase/functions/memories/index.ts`: tipos de la Edge Function verificados.
- `npm audit --omit=dev`: sin vulnerabilidades reportadas al implementar.
- Revisión en navegador de escritorio y 390 px: apertura, reproducción/pausa, galería, navegación y cierre; sin errores de consola observados. Se verificó también tableta a 768 px y se corrigieron los desbordamientos a 320 px (portada y contenido).
- Verificación de rutas y preservación de originales mediante comparación con Git.

Limitaciones: no se han probado equipos físicos iPhone/Android, Lighthouse, envío real de WhatsApp, importación en aplicaciones de calendario ni una carga remota Supabase. La migración, los permisos y las respuestas de la función se verificaron en el proyecto remoto. Una carga completa con token válido y el ciclo de aprobación todavía no se han probado. Antes de activar recuerdos probar: consentimiento ausente, CAPTCHA inválido/expirado, origen distinto, límite de intentos, archivo con MIME falso, lote inválido, caída de red, recepción pendiente, denegación de consultas anon a tablas/objetos, aprobación/rechazo y expiración de enlaces. Solo una foto aprobada debe aparecer en GET. Confirmar que x-forwarded-for lo establece el proxy de Supabase y que sus límites identifican correctamente conexiones reales.
