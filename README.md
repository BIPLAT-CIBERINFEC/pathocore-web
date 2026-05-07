# PathoCore Web

Frontend React para PathoCore. Esta app consume la API real de `pathocore-api` y, a dia de hoy, se centra en la parte de datos genomicos.

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

La web nunca se conecta directamente a MySQL. Siempre consume la API bajo `/v1`.

## Arranque rapido

Instalacion:

```bash
npm install
```

Desarrollo local usando el proxy de Vite contra la API en `http://127.0.0.1:8000`:

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
  Recomendado en local: `/api/v1`
- `PATHOCORE_API_PROXY_TARGET`
  Target real del backend para el proxy de Vite. Por defecto: `http://127.0.0.1:8000`
- `VITE_KEYCLOAK_URL`
  URL pública de Keycloak para login de casos de uso.
- `VITE_KEYCLOAK_REALM`
  Realm de Keycloak. Por defecto: `ciberisciii_datahub`.
- `VITE_KEYCLOAK_CLIENT_ID`
  Cliente frontend público. Por defecto: `pathocore-web`.
- `VITE_USE_CASE_DATA_MODE`
  Opcional. Para el caso de uso actual, usar `simulated` mientras no existan endpoints ad hoc.
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

Este repositorio actua como orquestador local para levantar la web, la API,
Keycloak y sus bases de datos.

Preparar variables:

```bash
cp .env.example .env
```

Levantar entorno de pruebas, con puertos publicados directamente:

```bash
docker compose -f docker-compose.test.yml up -d --build
```

Servicios principales en test:

- Web: `http://127.0.0.1:3000`
- API: `http://127.0.0.1:8000`
- Keycloak: `http://127.0.0.1:8080`
- API DB MySQL: `127.0.0.1:6606`
- Keycloak DB MySQL: `127.0.0.1:6607`

Levantar entorno de produccion local:

```bash
docker compose -f docker-compose.prod.yml up -d --build
```

En produccion solo Apache publica puerto (`HTTP_PORT`, por defecto `8080`).
Los servicios internos usan `expose`. Apache enruta:

- `/` -> `pathocore_web`
- `/api/` -> `pathocore_api`
- `/realms/`, `/admin/`, `/resources/` -> `keycloak`
- `/static/` y `/documents/` -> volumenes de la API

Antes de usar `docker-compose.prod.yml`, cambia en `.env` al menos:

- `DB_PASSWORD`
- `KEYCLOAK_DB_PASSWORD`
- `KC_BOOTSTRAP_ADMIN_PASSWORD`
- `KEYCLOAK_PUBLIC_URL`
- `KEYCLOAK_ISSUER`
- `DNS_URL`
- `PATHOCORE_ENABLE_LEGACY_BASIC_AUTH=false`

## Keycloak

La configuracion reproducible de Keycloak vive en:

```text
keycloak/config/realm-config.json
keycloak/scripts/render_realm.py
keycloak/tmp-import/ciberisciii_datahub-realm.json
```

Si cambias la configuracion del realm, regenera el import antes de arrancar:

```bash
python keycloak/scripts/render_realm.py
```

Keycloak importa `keycloak/tmp-import/ciberisciii_datahub-realm.json` al crear
una base de datos nueva. Si necesitas forzar un reimport limpio:

```bash
docker compose -f docker-compose.test.yml down -v
python keycloak/scripts/render_realm.py
docker compose -f docker-compose.test.yml up -d --build
```

Valores clave para la API:

- `KEYCLOAK_ISSUER`: issuer exacto esperado en el token.
- `KEYCLOAK_JWKS_URL`: URL interna usada por la API para descargar JWKS.
- `KEYCLOAK_AUDIENCE`: `pathocore-api`.
- `KEYCLOAK_CLIENT_ID`: `pathocore-web`.

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

## Endpoints que usa la web

Segun la vista, la app consume endpoints reales del backend, incluyendo:

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
