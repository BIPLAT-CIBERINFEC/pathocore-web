# PathoCore Web

Frontend React para PathoCore. Esta app consume `pathocore-api` para el databrowser generico y las vistas de casos de uso. El stack Docker de desarrollo tambien levanta `mepram-omop-api` para dejar la MePRAM OMOP API operativa junto al resto de servicios, pero la web no la consume directamente en esta rama.

La app incluye:

- Home del databrowser
- Overview
- Schema
- Metadata
- Variant
- Caso de uso especifico de vigilancia genomica, con nombre pendiente
- Placeholder `About Us`

Tambien existe un bloque placeholder para `Datos agregados / Records`, reservado para trabajo futuro del equipo frontend.

## Stack

- React
- TypeScript
- Vite
- Tailwind CSS
- shadcn/ui primitives
- React Router
- Recharts
- framer-motion

## Requisitos

- Node.js 18+
- npm 9+
- PathoCore API disponible por HTTP

La web nunca se conecta directamente a MySQL. Siempre consume PathoCore API por HTTP bajo `/v1`; las bases de datos quedan encapsuladas detras de sus APIs.

## Arranque rapido

Instalacion:

```bash
npm install
```

Desarrollo local usando el proxy de Vite contra PathoCore API en `http://127.0.0.1:8000`:

```bash
npm run dev
```

La app queda disponible en:

```text
http://127.0.0.1:5173
```

## Variables de entorno

Puedes copiar el ejemplo si quieres trabajar con un fichero local:

```bash
cp .env.example .env.local
```

Variables soportadas:

- `VITE_API_BASE_URL`
  Base URL usada por la web para llamar a PathoCore API. Recomendado en local: `/api/v1`.
- `PATHOCORE_API_PROXY_TARGET`
  Target real de PathoCore API para el proxy de Vite. Por defecto: `http://127.0.0.1:8000`.
- `VITE_KEYCLOAK_URL`
  URL pública de Keycloak para login de casos de uso.
- `VITE_KEYCLOAK_REALM`
  Realm de Keycloak. Por defecto: `ciberisciii_datahub`.
- `VITE_KEYCLOAK_CLIENT_ID`
  Cliente frontend público. Por defecto: `pathocore-web`.
- `VITE_USE_CASE_DATA_MODE`
  Opcional. Usar `live` para que `casos-de-uso/mepram` consuma datos reales; usar `simulated` solo para desarrollo visual sin API.
- `VITE_USE_CASE_ALERTS_CONTACT_EMAIL`
  Opcional. Correo visible en la seccion de alertas del caso de uso.

Ejemplo contra otra instancia local:

```bash
PATHOCORE_API_PROXY_TARGET=http://127.0.0.1:8001 \
VITE_API_BASE_URL=/api/v1 \
VITE_KEYCLOAK_URL=http://127.0.0.1:8080 \
npm run dev
```

El databrowser genérico no pide login. Las rutas de casos de uso redirigen a
Keycloak cuando no hay sesión activa.

## Docker orchestrator

Este repositorio actua como orquestador local para levantar la web, PathoCore API, MePRAM OMOP API, Keycloak y sus bases de datos.

Requisitos del stack: clonar `pathocore-api` y `mepram-omop-api` como repositorios hermanos de `pathocore-web`, porque el compose construye ambas APIs desde `../pathocore-api` y `../mepram-omop-api`.

```bash
cd ~/path_to/devel
git clone -b develop https://github.com/BIPLAT-CIBERINFEC/pathocore-api.git pathocore-api
git clone -b develop https://github.com/BU-ISCIII/mepram-omop-api.git mepram-omop-api
git clone -b dev https://github.com/BIPLAT-CIBERINFEC/pathocore-web.git pathocore-web
```

Expected:

```text
devel/
  pathocore-web/
  pathocore-api/
  mepram-omop-api/
```

Preparar variables:

```bash
cd pathocore-web
cp .env.example .env
```

Levantar entorno de pruebas, con puertos publicados directamente:

```bash
docker compose --env-file .env -f docker-compose.test.yml up -d --build
```

Despues de levantar el stack, carga `dashboard.sql` en MePRAM OMOP API cuando quieras poblar su base de datos local:

```bash
docker compose --env-file .env -f docker-compose.test.yml exec -T mepram_omop_api mkdir -p /data
docker compose --env-file .env -f docker-compose.test.yml exec -T mepram_omop_api \
  sh -c 'cat > /data/dashboard.sql' < ../dashboard.sql
docker compose --env-file .env -f docker-compose.test.yml exec -T mepram_omop_api \
  python manage.py import_dashboard_sql /data/dashboard.sql --truncate
```

Servicios principales en test:

- Web: `http://127.0.0.1:3000`
- PathoCore API: `http://127.0.0.1:8000`
- MePRAM OMOP API: `http://127.0.0.1:8100`
- Keycloak: `http://127.0.0.1:8080`
- PathoCore API DB MySQL: `127.0.0.1:6606`
- Keycloak DB MySQL: `127.0.0.1:6607`
- MePRAM OMOP API DB MySQL: `127.0.0.1:6608`

El compose de test crea o actualiza automaticamente el superusuario Django de
PathoCore API para acceso local a `/admin/`, `/swagger/` y endpoints protegidos:

```text
admin / admin_pass
```

## Keycloak

La configuracion reproducible de Keycloak vive en:

```text
keycloak/config/realm-config.test.json
keycloak/config/realm-config.prod.example.json
keycloak/scripts/render_realm.py
keycloak/tmp-import/ciberisciii_datahub-realm.json
```

El perfil `test` es el default y contiene URLs locales. Si cambias la
configuracion del realm de test, regenera el import antes de arrancar:

```bash
python keycloak/scripts/render_realm.py --profile test
```

Keycloak importa `keycloak/tmp-import/ciberisciii_datahub-realm.json` al crear
una base de datos nueva. Si necesitas forzar un reimport limpio:

```bash
docker compose -f docker-compose.test.yml down -v
python keycloak/scripts/render_realm.py --profile test
docker compose -f docker-compose.test.yml up -d --build
```

En hosts con Podman rootless y SELinux, el volumen de import se monta con
etiqueta `:z` para que Keycloak pueda leer `/opt/keycloak/data/import`.
Sin esa etiqueta, Keycloak puede fallar al arrancar con `directory not found`
aunque `keycloak/tmp-import/ciberisciii_datahub-realm.json` exista en el host.
El script de arranque de PathoCore API también se monta con `:z`; si falta esa
etiqueta, la API puede fallar con `Permission denied` al leer
`/usr/local/bin/pathocore-api-start.sh`.
El montaje del frontend sobre `/app` usa la misma etiqueta para permitir que
Node/NPM lean `package.json` y escriban `node_modules` en hosts SELinux.

Para produccion, copia `keycloak/config/realm-config.prod.example.json` a
`keycloak/config/realm-config.prod.json`, cambia los dominios `https://...` y
renderiza con `--config`. No uses URLs `localhost` ni wildcards en produccion.

Valores clave para PathoCore API:

- `KEYCLOAK_ISSUER`: issuer exacto esperado en el token.
- `KEYCLOAK_JWKS_URL`: URL interna usada por PathoCore API para descargar JWKS.
- `KEYCLOAK_AUDIENCE`: audience esperada por PathoCore API, normalmente `pathocore-api`.
- `KEYCLOAK_CLIENT_ID`: cliente frontend, normalmente `pathocore-web`.

Valores clave para MePRAM OMOP API:

- `MEPRAM_KEYCLOAK_ISSUER`: issuer exacto esperado en el token.
- `MEPRAM_KEYCLOAK_JWKS_URL`: URL interna usada por MePRAM OMOP API para descargar JWKS.
- `MEPRAM_KEYCLOAK_AUDIENCE`: audience esperada por MePRAM OMOP API, normalmente `mepram-api`.
- `MEPRAM_KEYCLOAK_CLIENT_ID`: cliente frontend, normalmente `pathocore-web`.

En un primer arranque limpio, Keycloak importa el realm renderizado con el
cliente bearer-only `mepram-api`, el audience `mepram-api` incluido en los
tokens de `pathocore-web`, y usuarios de prueba como:

```text
mepram_admin / mepram_admin_pass
```

Si el volumen de Keycloak ya existia antes de cambiar el realm, Keycloak no
reimporta automaticamente esos cambios. En ese caso, fuerza un reimport limpio
con `docker compose -f docker-compose.test.yml down -v` antes de volver a
levantar el stack, o actualiza el realm manualmente desde la consola de
administracion.

Una comprobacion rapida de seguridad para MePRAM OMOP API es:

```bash
TOKEN=$(curl -s -X POST \
  http://127.0.0.1:8080/realms/ciberisciii_datahub/protocol/openid-connect/token \
  -H 'Content-Type: application/x-www-form-urlencoded' \
  -d 'client_id=pathocore-web' \
  -d 'grant_type=password' \
  -d 'username=mepram_admin' \
  -d 'password=mepram_admin_pass' \
  | python3 -c 'import json,sys; print(json.load(sys.stdin)["access_token"])')

curl -H "Authorization: Bearer $TOKEN" \
  http://127.0.0.1:8100/v1/cohort/summary
```

## Estructura

```text
src/
  app/           bootstrap y provider principal
  api/           cliente HTTP y llamadas a backend
  adapters/      transformacion de respuestas API -> UI
  components/
    databrowser/ componentes de producto
    layout/      layout, shell y conexion
    ui/          primitives reutilizables
  hooks/         hooks de acceso a estado y datos
  lib/           constantes y utilidades
  pages/         overview, schema, metadata, variant, home
  types/         tipos de API y tipos de UI
```

## APIs que usa la web

### PathoCore API

PathoCore API se configura con `VITE_API_BASE_URL` y
`PATHOCORE_API_PROXY_TARGET`. La usan el databrowser generico y las vistas
principales de PathoCore. Segun la vista, la web consume endpoints como:

- GET /v1/databrowser/overview-summary
- GET /v1/databrowser/metadata-summary
- GET /v1/databrowser/schema-summary
- GET /v1/databrowser/metadata/property-distribution
- GET /v1/samples
- GET /v1/samples/{sample_unique_id}/metadata
- GET /v1/samples/metadata/search
- GET /v1/variants/summary
- GET /v1/variants/reference-genomes
- GET /v1/variants/filter-options
- GET /v1/variants/search

## Rutas principales

- `/` -> Generic Databrowser
- `/overview`, `/schema`, `/metadata`, `/variant` -> vistas del databrowser genérico
- `/use-cases/mepram` -> dashboard específico de vigilancia para el caso de uso
- `/about-us` -> placeholder institucional
