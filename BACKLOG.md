# PathoCore Web Backlog

Actualizado: `2026-04-06`

Backlog consolidado tras la revision funcional de la web con negocio.

## Objetivo inmediato

Cerrar la siguiente iteracion del `Generic Genomic Databrowser` afinando `Schema`, `Metadata`, `Variant`, validacion completa del grafo JSON y dependencias de autenticacion/API.

## Prioridad 1. Schema

### Frontend

- Convertir cada `schema block` en un bloque colapsable.
- Permitir colapsar tambien las `schema entries` internas.
- Añadir `hover` o `tooltip/popover` sobre los chips de properties.
- El hover de chips debe mostrar datos de la property del schema JSON.

Datos minimos del hover:

- `property name`
- `label`
- `description`
- `type`
- `classification`
- `enum/examples` si existen

### Cambios de criterio

- Eliminar `visible entries` de la vista `Schema`.
- La tarjeta `Schema` debe enseñar solo informacion estructural del schema, no metricas mixtas de contenido si no son necesarias para la lectura del bloque.

## Prioridad 2. Metadata

### Frontend

- Cambiar `Samples by collection period` a grafico lineal.
- Definir explicitamente de que schema salen las properties desplegadas.

### Decision funcional pendiente

- Determinar si `Metadata` debe:
  - mezclar properties equivalentes de varios schemas
  - o fijarse a un schema concreto por subseccion
  - o mostrar selector/etiquetado de schema en cada bloque

### Criterio a mantener

- Seguir evitando una pagina tecnica plana.
- Mantener formato tarjeta, panel y acordeon de properties.

## Prioridad 3. Variant

### Frontend

- Tabla real de variantes per-variant integrada contra backend.
- Buscador de variantes genomicas HGVS con:
  - caja de texto libre
  - parser para entradas como `g.112534G>C`
  - extraccion de `position`, `ref` y `alt`
  - tabla de resultados

Columnas minimas de la tabla:

- `sample_id`
- `variant`
- `allele_frequency`
- `effect`
- `depth`
- `Type`
- `Ref.`
- `Alt.`
- `gene region`
- `functional class`
- `locus name`
- `locus id`
- `aminoacid change`

- `Variant counts` en grafico de linea.

### Modelo funcional esperado

- Una muestra puede tener muchas variantes.
- Cuando el usuario busque una variante, el sistema debe calcular el numero de muestras con esa variante y la frecuencia global en el conjunto de muestras visible.
- La frecuencia global debe reflejar presencia de la variante en todas las muestras del scope actual.
- `allele_frequency` en la tabla es per sample.
- No asumir humano, cromosomas humanos ni patogeno concreto: debe funcionar para virus y bacterias.
- Añadir filtros de apoyo como `collection date` y `sequencing platform`.
- Si el filtro sale de enum o vocabulario controlado, mostrar opciones cerradas en la UI.

### Decision tecnica resuelta en API v1

- La frecuencia global de presencia de variante se devuelve desde backend en `summary.global_allele_frequency`.
- El frontend no recalcula frecuencia global; solo la presenta.

### Endpoints backend disponibles

- `GET /v1/variants/search`
- `GET /v1/variants/summary`
- `GET /v1/variants/reference-genomes`
- `GET /v1/variants/filter-options`

Capacidad integrada:

- buscar por `variant=g.112534G>C`
- devolver filas per-variant por muestra
- devolver `sample_count`
- devolver `global_allele_frequency`
- devolver campos de anotacion generica: efecto, clase funcional, region, locus y cambio aminoacidico
- permitir filtros por `collection_date_from`, `collection_date_to` y `sequencing_platform`
- permitir filtro opcional por `reference_genome`
- permitir filtros avanzados por `sample_id`, `locus_name`, `locus_id`, `effect`, `aminoacid_change`, `project_name`, `schema_name` y `schema_version`
- tratar `404 {"error":"No variants found"}` como estado vacio de UI

Especificacion detallada:

- [`docs/variants-api-implementation.md`](./docs/variants-api-implementation.md)

## Prioridad 4. Validacion e integridad

- Revisar el `graph json`.
- Confirmar que el `index` va a seguir funcionando con la nueva capa de busqueda de variantes.
- Ejecutar testing completo end-to-end de la app.

Minimo esperado:

- arranque
- build
- navegacion completa
- carga de datos reales
- estados vacios/error
- variante search
- comportamiento con autenticacion

## Prioridad 5. API / autenticacion

### Backend

- Añadir autenticacion via token en la API.
- Definir como crear usuarios de API de forma programatica.

Opciones a evaluar:

- endpoint admin para provisionar usuarios
- management command
- script de provisioning
- servicio interno con permisos

## Preguntas abiertas

- Que schema debe gobernar `Metadata` cuando una property existe en mas de uno.
- Si conviene exponer opciones/enums backend para filtros avanzados de `Variant`.
- Si la autenticacion por token convivira con Basic Auth o la sustituira.

## Orden recomendado de implementacion

1. Ajustes de `Schema` en frontend.
2. Regla funcional de `Metadata` sobre schema fuente.
3. Ampliacion opcional de filtros de `Variant`.
4. Autenticacion por token.
5. Provisioning programatico de usuarios.
6. Testing completo.
