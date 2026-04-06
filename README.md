# PathoCore Web

Frontend React para el `Generic Genomic Databrowser` de PathoCore, conectado desde el principio a la API real de `pathocore-api`.

Esta primera fase implementa las cuatro tarjetas principales:

- `Overview of Samples`
- `Schema`
- `Metadata`
- `Variant`

La prioridad funcional se ha puesto en `Metadata` y `Schema`, siguiendo el mockup como especificacion visual y de producto, no como demo aislada.

## Stack

- Vite
- React
- TypeScript
- Tailwind CSS
- shadcn/ui style primitives
- Recharts
- lucide-react
- framer-motion
- React Router

## Requisitos

- Node.js 18.x
- npm 9.x o superior
- API backend disponible en `http://127.0.0.1:8000`

## Variables de entorno

Copiar `.env.example` a un fichero local si hace falta:

```bash
cp .env.example .env.local
```

Variables soportadas:

- `VITE_API_BASE_URL`
  Valor recomendado en desarrollo: `/api/v1`
- `VITE_API_BASIC_USERNAME`
  Opcional. Si se define junto a la contraseña, el frontend usara HTTP Basic Auth.
- `VITE_API_BASIC_PASSWORD`
  Opcional.

Sin credenciales en variables, la UI permite introducirlas desde el navegador o reutilizar una sesion existente del backend a traves del proxy de Vite.

## Instalacion

```bash
npm install
```

## Desarrollo

Arranque normal:

```bash
npm run dev
```

Con credenciales basicas por entorno:

```bash
VITE_API_BASIC_USERNAME=<usuario> \
VITE_API_BASIC_PASSWORD=<password> \
npm run dev
```

El servidor de desarrollo queda en:

```text
http://127.0.0.1:5173
```

En desarrollo, Vite hace proxy de `/api/*` hacia `http://127.0.0.1:8000/*` y reescribe `/api/v1/...` a `/v1/...`.

## Build

Typecheck:

```bash
npm run typecheck
```

Build de produccion:

```bash
npm run build
```

Preview del build:

```bash
npm run preview
```

## Estructura

```text
src/
  app/
  pages/
  components/
    databrowser/
    layout/
    ui/
  api/
  hooks/
  types/
  lib/
  adapters/
```

## Endpoints usados

El frontend usa estos endpoints reales del backend:

- `GET /v1/schema`
- `GET /v1/schema/{schema_name}/{schema_version}`
- `GET /v1/samples`
- `GET /v1/samples/{sample_unique_id}/metadata`

## Como se construyen las vistas

- `Overview`
  Agrega crecimiento temporal, cobertura geografica, mezcla de schemas y distribucion de patogenos a partir de muestras y metadata visible.
- `Schema`
  Cruza `schema detail` con muestras reales para calcular propiedades por classification, samples por schema y entries visibles por classification.
- `Metadata`
  Usa paneles agregados y propiedades desplegables priorizadas. Cuando el dataset utiliza campos equivalentes, el frontend aplica fallbacks documentados.
- `Variant`
  Muestra referencia, software y recuentos reales de variantes. Las `impact classes` quedan preparadas pero no se inventan.

## Limitaciones actuales del backend detectadas durante la integracion

### 1. Falta un endpoint agregado para distribuciones por propiedad

Ahora mismo el frontend necesita recorrer muestras y pedir metadata por muestra para construir tarjetas agregadas.

Endpoint recomendado:

```text
GET /v1/samples/metadata/aggregate?property=<property_name>
```

Respuesta esperada:

```json
{
  "property": "geo_loc_state",
  "total_samples": 18,
  "matched_samples": 9,
  "values": [
    { "value": "Aragón", "count": 9 }
  ]
}
```

### 2. Falta exponer metadata compleja/anidada en la API de sample metadata

Algunos schemas, como MePRAM, contienen propiedades dentro de arrays u objetos. El backend ya maneja conceptos de grupo internamente, pero `GET /v1/samples/{sample_unique_id}/metadata` devuelve una forma plana y no expone esa estructura.

Extensiones posibles:

- Mantener el endpoint actual y devolver tambien `classification`, `group_id` y `group_index`
- O añadir un endpoint nuevo para metadata expandida

Respuesta esperada minima:

```json
[
  {
    "property": "organism.species",
    "value": "Klebsiella pneumoniae",
    "classification": "Strain characterization",
    "group_index": 0
  }
]
```

### 3. Falta un resumen agregado especifico para variantes

La API actual expone recuentos y referencias como metadata, pero no una vista agregada de `impact classes`.

Endpoint recomendado:

```text
GET /v1/variants/summary
```

Respuesta esperada:

```json
{
  "totals": {
    "samples_with_variants": 9,
    "consensus_variants": 1123,
    "variants_with_effect": 744
  },
  "reference_genomes": [
    { "label": "NC_045512.2", "value": 9 }
  ],
  "impact_classes": [
    { "label": "LOW", "value": 120 },
    { "label": "MODERATE", "value": 87 },
    { "label": "HIGH", "value": 14 }
  ],
  "projects": [
    { "label": "relecov", "value": 9 }
  ]
}
```

## Estado actual

- La app arranca
- La app compila
- La home y las cuatro vistas estan implementadas
- La UI usa la API real
- Los huecos de backend no se ocultan: se reflejan como estados preparados o notas metodologicas

## Backlog

Las tareas acordadas para la siguiente iteracion estan recogidas en:

- [`BACKLOG.md`](./BACKLOG.md)
