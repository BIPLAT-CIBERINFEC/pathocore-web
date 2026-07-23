# Arquitectura del Frontend

## Objetivo

La aplicación está pensada como un navegador público de datos agregados para MePRAM. No consume tablas OMOP en crudo en el frontend; asume una capa intermedia optimizada para servir métricas, distribuciones, rankings y metadatos preparados para exploración.

## Capas de información

### 1. Cohort Overview

Resume el potencial investigador de la cohorte:

- tamaño
- cobertura
- composición demográfica
- dominios disponibles
- top conceptos
- evolución temporal agregada

### 2. Domain Browser y Variable Catalog

Permite navegar por:

- dominios funcionales
- conceptos frecuentes
- variables con cobertura
- códigos terminológicos
- acceso rápido a pantallas de detalle

### 3. Concept Detail

Cada concepto mantiene una estructura estable:

- cabecera descriptiva
- KPIs agregados
- breakdown por sexo y edad
- patrón temporal o histograma
- metadatos terminológicos
- jerarquía o descendientes si aplica

### 4. Metadata Catalog

Da soporte institucional y documental:

- descripción del dataset
- gobernanza
- interoperabilidad
- acceso y licencia
- procedencia
- refresh y calidad

## Arquitectura técnica

### Datos

`src/data/mepramDataBrowser.ts`

Contiene:

- tipos
- navegación
- mock data
- helpers de lookup y formateo

En una implementación real, esta capa debería dividirse en:

- `types/`
- `services/`
- `mappers/`
- `fixtures/`

### UI

`src/components/mepram/`

Se divide en:

- `MepramBrowserLayout.tsx`
- `MepramPrimitives.tsx`

La idea es concentrar:

- shell de navegación
- patrones de surface/card
- tablas
- componentes de chart ligeros
- headings reutilizables

### Páginas

`src/pages/`

Cada ruta representa una pantalla del flujo real del browser:

- overview
- dominios
- detalle de dominio
- catálogo
- detalle de concepto
- metadatos
- genómica

## Decisiones clave

- Layout editorial en lugar de dashboard admin genérico
- Charts ligeros sin dependencia externa para mantener el prototipo portable
- Uso de mocks estructurados como si fueran respuestas de API
- Navegación y jerarquía diseñadas para presentación a cliente y handoff técnico

## Preparación para API real

La transición recomendada sería:

1. Sustituir mocks por un `data service` tipado.
2. Añadir `loading`, `error`, `empty states`.
3. Introducir cacheado y revalidación.
4. Versionar vocabularios y metadatos por release.
