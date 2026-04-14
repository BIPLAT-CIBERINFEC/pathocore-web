# PathoCore Web

Frontend React para PathoCore. Esta app consume la API real de `pathocore-api` y, a dia de hoy, se centra en la parte de datos genomicos.

La app incluye:

- Home del databrowser
- Overview
- Schema
- Metadata
- Variant
- Caso de uso especifico `Mepram`
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
- `VITE_API_BASIC_USERNAME`
  Opcional. Usuario para Basic Auth.
- `VITE_API_BASIC_PASSWORD`
  Opcional. Password para Basic Auth.

Ejemplo contra otra instancia local:

```bash
PATHOCORE_API_PROXY_TARGET=http://127.0.0.1:8001 \
VITE_API_BASE_URL=/api/v1 \
VITE_API_BASIC_USERNAME=<user> \
VITE_API_BASIC_PASSWORD=<password> \
npm run dev
```

Si no defines credenciales por entorno, la UI permite introducirlas desde el panel `API access`.

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
- `/use-cases/mepram` -> dashboard específico de vigilancia para MEPRAM
- `/about-us` -> placeholder institucional

