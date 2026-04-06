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
- `GET /v1/variants/summary`
- `GET /v1/variants/reference-genomes`
- `GET /v1/variants/filter-options`
- `GET /v1/variants/search`

## Como se construyen las vistas

- `Overview`
  Agrega crecimiento temporal, cobertura geografica, mezcla de schemas y distribucion de patogenos a partir de muestras y metadata visible.
- `Schema`
  Cruza `schema detail` con muestras reales para calcular propiedades por classification, samples por schema y entries visibles por classification.
- `Metadata`
  Usa paneles agregados y propiedades desplegables priorizadas. Cuando el dataset utiliza campos equivalentes, el frontend aplica fallbacks documentados.
- `Variant`
  Ejecuta busqueda HGVS genomica generica (`g.<position><ref>><alt>`) contra la API real y muestra summary, filtros y tabla per-variant.

## Limitaciones actuales y endpoints integrados

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

### 3. Endpoints reales de variantes integrados

La vista `Variant` consume ya los endpoints reales del backend:

- `GET /v1/variants/summary`
- `GET /v1/variants/reference-genomes`
- `GET /v1/variants/filter-options`
- `GET /v1/variants/search`

La ruta canonica no lleva slash final. El backend aplica scope por usuario autenticado.

Ejemplo de summary:

```json
{
  "totals": {
    "visible_sample_count": 18,
    "samples_with_variants": 6,
    "variant_observations": 11,
    "distinct_variants": 7
  },
  "reference_genomes": [
    { "label": "NC_045512.2", "value": 6 }
  ],
  "variant_counts": [
    { "label": "112534", "value": 3 }
  ],
  "impact_classes": [
    { "label": "missense", "value": 9 }
  ],
  "projects": [
    { "label": "relecov", "value": 6 }
  ]
}
```

### 4. Busqueda HGVS per-variant

La vista `Variant` permite buscar variantes genomicas genericas como:

```text
g.112534G>C
```

Endpoint usado:

```text
GET /v1/variants/search?variant=g.112534G>C
```

Filtros soportados por la UI:

```text
reference_genome=NC_045512.2
collection_date_from=2025-10-01
collection_date_to=2025-12-31
sequencing_platform=Illumina
sample_id=SAM-AAA-0010
locus_name=S
locus_id=YP_009724390.1
effect=missense_variant
aminoacid_change=p.D614G
project_name=relecov
schema_name=relecov-tools-schema
schema_version=3.2.4
```

Respuesta consumida por la UI:

```json
{
  "summary": {
    "sample_count": 3,
    "visible_sample_count": 18,
    "global_allele_frequency": 0.1667
  },
  "results": [
    {
      "sample_id": "SAM-AAA-0010",
      "variant": "g.112534G>C",
      "allele_frequency": 0.82,
      "effect": "missense_variant",
      "depth": 128,
      "type": "SNV",
      "reference_allele": "G",
      "alternate_allele": "C",
      "gene_region": "coding_sequence",
      "functional_class": "missense",
      "locus_name": "S",
      "locus_id": "YP_009724390.1",
      "aminoacid_change": "p.D614G",
      "collection_date": "2025-10-21",
      "sequencing_platform": "Illumina"
    }
  ]
}
```

`404 {"error":"No variants found"}` se muestra como empty state, no como fallo critico.

Endpoint usado para opciones de filtros:

```text
GET /v1/variants/filter-options
```

Especificacion completa:

- [`docs/variants-api-implementation.md`](./docs/variants-api-implementation.md)

## Estado actual

- La app arranca
- La app compila
- La home y las cuatro vistas estan implementadas
- La UI usa la API real
- Los huecos de backend no se ocultan: se reflejan como estados preparados o notas metodologicas

## Backlog

Las tareas acordadas para la siguiente iteracion estan recogidas en:

- [`BACKLOG.md`](./BACKLOG.md)

La especificacion backend de variantes esta en:

- [`docs/variants-api-implementation.md`](./docs/variants-api-implementation.md)
