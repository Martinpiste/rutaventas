# RutaVentas 1.0.0 (esquema de datos 1)
PWA privada para iPhone. Sin dependencias externas.
## Alojar (HTTPS)
Sube TODA la carpeta tal cual a un hosting HTTPS (GitHub Pages, Netlify, Cloudflare Pages). Ej.: https://mi-enlace.com/rutaventas/
## Instalar en iPhone
Abre el enlace en Safari → Compartir → Agregar a pantalla de inicio → abre desde el icono. Funciona sin internet tras la primera carga.
## Actualizar
Sube los archivos nuevos a la MISMA dirección (mismo dominio y ruta; no cambies APP_ID ni el nombre de la base). Sube APP_VERSION en database.js, la versión en service-worker.js (nombre de caché) y version.json. En la app: Más → Buscar actualización (pide respaldo antes).
## Respaldo / restauración
Más → Crear respaldo general (guárdalo en Archivos/iCloud Drive). Más → Restaurar respaldo (valida APP_ID y checksum; reemplaza todo en una transacción).
## Pendiente en esta versión
PIN, imágenes Base64, modo "combinar", media caja/caja en venta, filtros de reportes, recordatorios de respaldo. Las pruebas del documento NO se han ejecutado.
