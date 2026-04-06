# PathoCore Web Backlog

Actualizado: `2026-04-01`

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

- Recuperar la tabla real de variantes.
- Añadir buscador de variantes con:
  - desplegable de `reference genome`
  - caja de texto para escribir la variante concreta
  - tabla de resultados

Columnas minimas de la tabla:

- `gene`
- `population frequency`
- `has effect` o `effect`

- Cambiar `variant counts` a grafico de linea.

### Modelo funcional esperado

- Una muestra puede tener muchas variantes.
- Cuando el usuario busque una variante, el sistema debe calcular la frecuencia alelica o frecuencia poblacional en el conjunto de muestras visible.
- La frecuencia debe reflejar presencia de la variante en todas las muestras del scope actual.

### Decision tecnica pendiente

- Resolver si la frecuencia alelica:
  - se calcula on demand
  - o se precomputa y se indexa

### Dependencia fuerte de backend/API

La iteracion de `Variant search` probablemente necesita un endpoint nuevo o la recuperacion de una tabla/backend de variantes ya existente.

Capacidad esperada de API:

- buscar por referencia
- buscar por variante exacta o patron
- devolver gen asociado
- devolver frecuencia poblacional
- devolver si tiene efecto o no

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
- Donde esta la fuente definitiva de la tabla de variantes y en que estado esta.
- Si la frecuencia alelica se precomputa o se calcula en tiempo real.
- Si la busqueda de variantes debe respetar exactamente el scope del usuario autenticado.
- Si la autenticacion por token convivira con Basic Auth o la sustituira.

## Orden recomendado de implementacion

1. Ajustes de `Schema` en frontend.
2. Regla funcional de `Metadata` sobre schema fuente.
3. Recuperacion de tabla/source de variantes.
4. Diseno de endpoint o servicio para `variant search`.
5. Implementacion de `Variant search` y frecuencia.
6. Autenticacion por token.
7. Provisioning programatico de usuarios.
8. Testing completo.
