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
  Opcional. Usar `live` para que `casos-de-uso/mepram` consuma `/v1/use-cases/data-summary`; usar `simulated` solo para desarrollo visual sin API.
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

Requisito: clonar `pathocore-api` como repositorio hermano de `pathocore-web`,
porque el compose construye la API desde `../pathocore-api`.

```bash
cd ~/path_to/devel
git clone -b develop https://github.com/BIPLAT-CIBERINFEC/pathocore-api.git pathocore-api
git clone -b dev https://github.com/BIPLAT-CIBERINFEC/pathocore-web.git pathocore-web
```

Expected:

```text
devel/
  pathocore-web/
  pathocore-api/
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

Servicios principales en test:

- Web: `http://127.0.0.1:3000`
- API: `http://127.0.0.1:8000`
- Keycloak: `http://127.0.0.1:8080`
- API DB MySQL: `127.0.0.1:6606`
- Keycloak DB MySQL: `127.0.0.1:6607`

El compose de test crea o actualiza automaticamente el superusuario Django de
la API para acceso local a `/admin/`, `/swagger/` y endpoints protegidos:

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

Para produccion, copia `keycloak/config/realm-config.prod.example.json` a
`keycloak/config/realm-config.prod.json`, cambia los dominios `https://...` y
renderiza con `--config`. No uses URLs `localhost` ni wildcards en produccion.

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
