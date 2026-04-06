# PathoCore API: Variant Search Implementation Brief

Fecha: `2026-04-06`

Este documento deja preparadas las instrucciones para implementar en `pathocore-api` la parte backend necesaria para la vista frontend `Variant`.

Repo backend objetivo:

```text
/home/da.valle/work/isciii/buisciii/devel/pathocore-api
```

Frontend consumidor:

```text
/home/da.valle/work/isciii/buisciii/devel/pathocore-web
```

## Contexto actual

El frontend ya tiene una vista `Variant` con:

- Buscador libre de variantes en notacion HGVS genomica.
- Parser frontend para entradas como `g.112534G>C`.
- Tabla preparada para resultados per-variant.
- Estado vacio explicito porque la API actual aun no expone filas de variantes por `position/ref/alt`.

La API actual expone:

- `GET /v1/schema`
- `GET /v1/schema/{schema_name}/{schema_version}`
- `GET /v1/samples`
- `GET /v1/samples/{sample_unique_id}/metadata`
- `GET /v1/samples/metadata`
- `GET /v1/samples/metadata/search`

La API actual contiene metadata sample-level como:

- `reference_genome_accession`
- `number_of_variants_in_consensus`
- `number_of_variants_with_effect`
- `variant_calling_software_name`
- `variant_name`
- `variant_designation`

Pero no hay endpoint publico actual con tabla per-variant. Hubo modelos legacy (`Variant`, `VariantInSample`, `VariantAnnotation`) en migraciones antiguas, pero una migracion posterior los elimina. No reintroducirlos a ciegas: revisar el estado actual de modelos/migraciones antes de decidir.

## Objetivo funcional

Implementar una API generica de busqueda de variantes genomicas para patogenos.

No asumir humano, cromosomas humanos, transcript IDs humanos ni nomenclatura proteica humana. Debe servir para virus y bacterias.

La busqueda de usuario usa HGVS genomico simple:

```text
g.<position><ref>><alt>
```

Ejemplo:

```text
g.112534G>C
```

El backend debe poder filtrar por:

- `position`: `112534`
- `ref`: `G`
- `alt`: `C`

## Modelo de datos recomendado

Crear una entidad persistente per-variant, por ejemplo `GenomicVariant` o `VariantObservation`.

Campos minimos:

```text
id
sample
reference_genome_accession
position
reference_allele
alternate_allele
variant_hgvs
allele_frequency
depth
effect
functional_class
gene_region
locus_name
locus_id
aminoacid_change
variant_type
created_at
```

Detalle recomendado:

- `sample`: FK a `core.Sample`, obligatorio.
- `reference_genome_accession`: string, opcional pero recomendado para scopes con multiples referencias.
- `position`: integer positivo, indexado.
- `reference_allele`: string, indexado junto con position/alt.
- `alternate_allele`: string, indexado junto con position/ref.
- `variant_hgvs`: string canonical, por ejemplo `g.112534G>C`.
- `allele_frequency`: decimal/float por muestra. Debe representar frecuencia de alelo dentro de la muestra.
- `depth`: integer o decimal segun fuente. Cobertura/profundidad en esa posicion.
- `effect`: string de anotacion.
- `functional_class`: string, por ejemplo `synonymous`, `missense`, `nonsense`, `intergenic`, etc. No hardcodear a un ontologia humana.
- `gene_region`: region o feature genomica afectada.
- `locus_name`: nombre del locus/gene/feature si existe.
- `locus_id`: identificador estable del locus si existe.
- `aminoacid_change`: cambio aminoacidico si existe; `null`/vacio si no aplica.
- `variant_type`: derivado o almacenado (`SNV`, `MNV`, `insertion`, `deletion`, `complex`).

Indices recomendados:

```text
(position, reference_allele, alternate_allele)
(reference_genome_accession, position, reference_allele, alternate_allele)
(sample)
(locus_name)
(locus_id)
```

Restriccion de duplicados recomendada:

```text
unique(sample, reference_genome_accession, position, reference_allele, alternate_allele)
```

Si `reference_genome_accession` puede ser nulo, decidir una politica consistente. Recomendado: exigirlo cuando sea conocido y usar `Unknown` solo en ingest legacy.

## Parser HGVS

Implementar parser backend para la forma simple:

```regex
^g\.(\d+)([A-Za-z]+)>([A-Za-z]+)$
```

Normalizacion:

- Quitar espacios laterales.
- Quitar espacios internos.
- Normalizar ref/alt a uppercase.
- Validar `position > 0`.
- Devolver error 400 si no cumple formato.

Salida interna esperada:

```json
{
  "variant": "g.112534G>C",
  "position": 112534,
  "reference_allele": "G",
  "alternate_allele": "C",
  "variant_type": "SNV"
}
```

Regla simple para `variant_type`:

- `SNV`: ref y alt tienen longitud 1.
- `MNV`: ref y alt tienen misma longitud y longitud > 1.
- `insertion_or_complex`: alt mas largo que ref.
- `deletion_or_complex`: ref mas largo que alt.

## Endpoints necesarios

### 1. Search principal

```text
GET /v1/variants/search?variant=g.112534G>C
```

Parametros:

```text
variant              requerido si no se envian position/ref/alt
position             opcional si se envia variant
ref                  opcional si se envia variant
alt                  opcional si se envia variant
reference_genome     opcional
collection_date_from opcional, formato YYYY-MM-DD
collection_date_to   opcional, formato YYYY-MM-DD
sequencing_platform  opcional, valor controlado cuando existan enums/opciones
sample_id            opcional
locus_name           opcional
locus_id             opcional
page                 opcional
page_size            opcional
```

Regla:

- Si `variant` existe, parsear y usar `position/ref/alt`.
- Si no existe `variant`, requerir `position`, `ref`, `alt`.
- `reference_genome` filtra cuando el usuario quiera acotar a una referencia.
- `collection_date_from` y `collection_date_to` filtran por `sample_collection_date` o campo equivalente acordado.
- `sequencing_platform` filtra por plataforma de secuenciacion, idealmente normalizada desde `sequencing_instrument_platform`.
- Aplicar siempre el scope del usuario autenticado igual que `samples` y `metadata`.

Respuesta 200 esperada:

```json
{
  "query": {
    "variant": "g.112534G>C",
    "position": 112534,
    "reference_allele": "G",
    "alternate_allele": "C",
    "reference_genome": "NC_045512.2"
  },
  "summary": {
    "sample_count": 3,
    "visible_sample_count": 18,
    "global_allele_frequency": 0.1667
  },
  "count": 3,
  "next": null,
  "previous": null,
  "results": [
    {
      "sample_id": "SAM-AAA-0010",
      "variant": "g.112534G>C",
      "position": 112534,
      "reference_allele": "G",
      "alternate_allele": "C",
      "allele_frequency": 0.82,
      "effect": "missense_variant",
      "depth": 128,
      "type": "SNV",
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

Respuesta 400 por formato invalido:

```json
{
  "error": "Invalid HGVS genomic variant. Expected format: g.<position><ref>><alt>"
}
```

Respuesta 404 si no hay match:

```json
{
  "error": "No variants found"
}
```

### 2. Summary agregado

```text
GET /v1/variants/summary
```

Parametros opcionales:

```text
reference_genome
schema_name
schema_version
project_name
created_at_from
created_at_to
```

Respuesta esperada:

```json
{
  "totals": {
    "visible_sample_count": 18,
    "samples_with_variants": 9,
    "variant_observations": 1123,
    "distinct_variants": 217
  },
  "reference_genomes": [
    { "label": "NC_045512.2", "value": 9 }
  ],
  "variant_counts": [
    { "label": "114", "value": 2 },
    { "label": "125", "value": 3 },
    { "label": "130", "value": 1 }
  ],
  "impact_classes": [
    { "label": "synonymous", "value": 120 },
    { "label": "missense", "value": 87 },
    { "label": "intergenic", "value": 14 }
  ],
  "projects": [
    { "label": "relecov", "value": 9 }
  ]
}
```

Nota: `variant_counts` puede mantenerse sample-level si aun no se tiene la tabla completa, pero indicar claramente si procede de `number_of_variants_in_consensus`.

### 3. Reference genomes

```text
GET /v1/variants/reference-genomes
```

Respuesta esperada:

```json
[
  {
    "reference_genome": "NC_045512.2",
    "sample_count": 9,
    "variant_observation_count": 1123,
    "distinct_variant_count": 217
  }
]
```

Este endpoint es util si la UI necesita selector de referencia en futuras iteraciones, pero para el flujo actual no debe bloquear la busqueda HGVS.

### 4. Filter options

```text
GET /v1/variants/filter-options
```

Objetivo: devolver opciones cerradas para filtros cuando la fuente sea enum o vocabulario controlado, evitando que el usuario tenga que adivinar textos.

Respuesta esperada:

```json
{
  "collection_date": {
    "min": "2025-10-21",
    "max": "2025-12-16"
  },
  "sequencing_platforms": [
    {
      "label": "Illumina",
      "value": "Illumina"
    },
    {
      "label": "Oxford Nanopore",
      "value": "Oxford Nanopore"
    }
  ]
}
```

Notas:

- Si `sequencing_instrument_platform` viene con ontologia entre corchetes, decidir si el `value` debe conservar el raw value o una version normalizada. Mantenerlo consistente entre `filter-options` y `variants/search`.
- Si un filtro sale de un enum del schema, usar ese enum como lista base. Si no, derivar valores distintos observados en muestras visibles.
- `collection_date` no es enum; devolver rango min/max para configurar inputs de fecha.

## Calculo de global allele frequency

Para la summary del search:

```text
global_allele_frequency = samples_with_variant / visible_sample_count
```

Donde:

- `samples_with_variant`: numero de muestras visibles para el usuario que contienen la variante `position/ref/alt`.
- `visible_sample_count`: numero de muestras visibles para el usuario en el scope actual, opcionalmente filtrado por `reference_genome`, proyecto/schema/fecha si esos filtros existen.

No confundir con `allele_frequency` per sample:

- `allele_frequency` en la fila es la frecuencia de alelo dentro de esa muestra.
- `global_allele_frequency` en summary es presencia de la variante en el conjunto visible.

## Serializers recomendados

Crear serializers DRF separados:

```text
VariantSearchQuerySerializer
VariantSearchResultSerializer
VariantSearchSummarySerializer
VariantSummarySerializer
VariantReferenceGenomeSerializer
VariantFilterOptionsSerializer
```

Validaciones:

- `variant` debe cumplir el formato HGVS si se envia.
- Si no se envia `variant`, `position`, `ref`, `alt` son requeridos.
- `position` debe ser entero positivo.
- `ref` y `alt` deben ser strings no vacios.
- Normalizar ref/alt a uppercase.
- `page_size` debe tener limite razonable.
- `collection_date_from` y `collection_date_to` deben validarse como fecha y `from <= to`.
- `sequencing_platform` debe validarse contra opciones visibles cuando sea viable.

## Ingest o carga de variantes

Si ya existe un pipeline que produce tablas de variantes, conectar esa fuente al nuevo modelo.

Si no existe, crear un primer endpoint o service de ingest solo si es necesario:

```text
POST /v1/samples/{sample_unique_id}/variants
```

Payload esperado:

```json
{
  "reference_genome_accession": "NC_045512.2",
  "variants": [
    {
      "variant": "g.112534G>C",
      "allele_frequency": 0.82,
      "depth": 128,
      "effect": "missense_variant",
      "functional_class": "missense",
      "gene_region": "coding_sequence",
      "locus_name": "S",
      "locus_id": "YP_009724390.1",
      "aminoacid_change": "p.D614G",
      "collection_date": "2025-10-21",
      "sequencing_platform": "Illumina"
    }
  ]
}
```

Reglas:

- Requiere usuario autenticado.
- Escritura probablemente solo staff/admin o pipeline user.
- Debe validar que la muestra existe y entra en el scope permitido.
- Debe usar transaccion.
- Debe hacer upsert por `sample + reference_genome + position + ref + alt` si se permite reingest.

## Seguridad y permisos

Aplicar el mismo access control que `samples`:

- Usuarios no admin solo ven variantes de muestras dentro de su proyecto/scope.
- El calculo de `global_allele_frequency` debe usar el mismo scope.
- No exponer identificadores no anonimizados en la tabla publica.
- `sample_id` debe ser el ID interno anonimizado (`sample_unique_id`), no identificadores de paciente ni rutas de ficheros.
- No devolver `vcf_filename` ni paths de disco en la vista de busqueda.

## Archivos backend a revisar/modificar

Ruta base:

```text
/home/da.valle/work/isciii/buisciii/devel/pathocore-api
```

Archivos probables:

```text
core/models.py
core/api/v1/urls.py
core/api/v1/views.py
core/api/v1/serializers.py
core/api/services/
core/api/utils/access_control.py
core/migrations/
core/tests.py
```

Sugerencia de estructura:

```text
core/api/services/variant_search.py
core/api/services/variant_ingestion.py
```

Mantener views finas y mover logica de query/calculo a services.

## Tests minimos

Backend tests:

- Parser acepta `g.112534G>C`.
- Parser normaliza `g.112534g>c` a `g.112534G>C`.
- Parser rechaza `112534G>C`, `g.G>C`, `g.0G>C`, `g.112534> C`.
- Search por `variant` devuelve filas correctas.
- Search por `position/ref/alt` devuelve lo mismo que `variant`.
- Summary devuelve `sample_count` y `global_allele_frequency` correctos.
- Filtros por `collection_date_from`, `collection_date_to` y `sequencing_platform` devuelven el subset esperado.
- `GET /v1/variants/filter-options` devuelve plataformas validas y rango de fechas para el scope del usuario.
- No devuelve variantes fuera del scope del usuario autenticado.
- No devuelve `vcf_filename` ni paths.
- Paginacion funciona.
- Ingest/upsert, si se implementa, no duplica variantes.

Frontend integration checks:

- `g.112534G>C` muestra summary y tabla real.
- Query invalida muestra error local sin llamar innecesariamente al endpoint.
- Query sin resultados muestra empty state.
- Tabla muestra columnas:
  - `sample_id`
  - `variant`
  - `allele_frequency`
  - `depth`
  - `Type`
  - `Ref.`
  - `Alt.`
  - `gene region`
  - `effect`
  - `functional class`
  - `locus name`
  - `locus id`
  - `aminoacid change`

## Criterios de aceptacion

- Existe endpoint `GET /v1/variants/search`.
- El endpoint acepta `variant=g.112534G>C`.
- Devuelve filas per-variant con las columnas necesarias para la UI.
- Devuelve summary con `sample_count` y `global_allele_frequency`.
- El calculo respeta usuario autenticado y scope.
- No expone rutas VCF ni datos identificables.
- Existe test suite backend para parser, search, scope y summary.
- El frontend usa llamada real a `/v1/variants/search` y trata `404 {"error":"No variants found"}` como empty state.
