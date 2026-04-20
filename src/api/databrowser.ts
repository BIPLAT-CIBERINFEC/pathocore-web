import { PathocoreApiClient } from "@/api/client";
import { ENTRY_CARD_CONTENT } from "@/lib/constants";
import { formatCompactNumber, formatInteger } from "@/lib/format";
import type {
  ApiCountItem,
  ApiCredentials,
  ApiKpiItem,
  DatabrowserMetadataChartResponse,
  DatabrowserMetadataSectionResponse,
  DatabrowserMetadataSummaryResponse,
  DatabrowserOverviewSummaryResponse,
  DatabrowserPropertyCardResponse,
  DatabrowserSchemaCardResponse,
  DatabrowserSchemaClassificationCardResponse,
  DatabrowserSchemaOptionResponse,
  DatabrowserSchemaPropertyCardResponse,
  DatabrowserSchemaScopeResponse,
  DatabrowserSchemaSummaryResponse,
  VariantFilterOptionsResponse,
  VariantReferenceGenomeApiItem,
  VariantSummaryResponse,
} from "@/types/api";
import type {
  ChartDatum,
  DatabrowserSnapshot,
  EntryCardContent,
  KpiStat,
  MetadataPanelChart,
  MetadataSchemaOption,
  MetadataSchemaScope,
  MetadataSubsectionData,
  PropertyDistributionCard,
  SchemaCardData,
  SchemaClassificationCard,
  SchemaPropertyCard,
  VariantFilterOptions,
  VariantReferenceGenomeOption,
} from "@/types/databrowser";

function chartItems(items: ApiCountItem[] = []): ChartDatum[] {
  return items.map((item) => ({ label: item.label, value: item.value }));
}

function kpiItems(items: ApiKpiItem[] = []): KpiStat[] {
  return items.map((item) => ({ label: item.label, note: item.note, value: item.value }));
}

function metadataPropertyCard(item: DatabrowserPropertyCardResponse): PropertyDistributionCard {
  const card: PropertyDistributionCard = {
    chartKind: item.chart_kind,
    chartTitle: item.chart_title,
    description: item.description,
    displayName: item.display_name,
    isFallback: item.is_fallback,
    participantCount: item.participant_count,
    participantShare: item.participant_share,
    propertyName: item.property_name,
    values: chartItems(item.values),
  };
  if (item.actual_property_name) {
    card.actualPropertyName = item.actual_property_name;
  }
  return card;
}

function metadataChart(item: DatabrowserMetadataChartResponse): MetadataPanelChart {
  return {
    description: item.description,
    kind: item.kind,
    title: item.title,
    values: chartItems(item.values),
  };
}

function metadataSection(item: DatabrowserMetadataSectionResponse): MetadataSubsectionData {
  return {
    description: item.description,
    id: item.id,
    notes: item.notes,
    properties: item.properties.map(metadataPropertyCard),
    summaryCharts: item.summary_charts.map(metadataChart),
    title: item.title,
  };
}

function schemaOption(item: DatabrowserSchemaOptionResponse): MetadataSchemaOption {
  return {
    key: item.key,
    label: item.label,
    projectName: item.project_name,
    sampleCount: item.sample_count,
    schemaName: item.schema_name,
    schemaVersion: item.schema_version,
  };
}

function schemaScope(item: DatabrowserSchemaScopeResponse): MetadataSchemaScope {
  return {
    key: item.key,
    sampleCount: item.sample_count,
    sections: item.sections.map(metadataSection),
  };
}

function schemaProperty(item: DatabrowserSchemaPropertyCardResponse): SchemaPropertyCard {
  return {
    classification: item.classification,
    description: item.description,
    enumValues: item.enum_values,
    examples: item.examples,
    label: item.label,
    path: item.path,
    propertyName: item.property_name,
    type: item.type,
  };
}

function schemaClassification(
  item: DatabrowserSchemaClassificationCardResponse,
): SchemaClassificationCard {
  return {
    name: item.name,
    propertyCount: item.property_count,
    properties: item.properties.map(schemaProperty),
  };
}

function schemaCard(item: DatabrowserSchemaCardResponse): SchemaCardData {
  return {
    classificationCount: item.classification_count,
    classifications: item.classifications.map(schemaClassification),
    generatedAt: item.generated_at,
    name: item.name,
    projectName: item.project_name,
    propertyCount: item.property_count,
    sampleCount: item.sample_count,
    version: item.version,
  };
}

function variantFilterOptions(
  apiOptions: VariantFilterOptionsResponse,
): VariantFilterOptions {
  return {
    collectionDateMax: apiOptions.collection_date.max,
    collectionDateMin: apiOptions.collection_date.min,
    sequencingPlatforms: apiOptions.sequencing_platforms
      .map((option) => option.value || option.label)
      .filter(Boolean),
  };
}

function variantReferenceGenomeOption(
  item: VariantReferenceGenomeApiItem,
): VariantReferenceGenomeOption {
  return {
    distinctVariantCount: item.distinct_variant_count,
    referenceGenome: item.reference_genome,
    sampleCount: item.sample_count,
    variantObservationCount: item.variant_observation_count,
  };
}

function buildHomeCards({
  metadata,
  overview,
  schema,
  variantSummary,
}: {
  metadata: DatabrowserMetadataSummaryResponse;
  overview: DatabrowserOverviewSummaryResponse;
  schema: DatabrowserSchemaSummaryResponse;
  variantSummary: VariantSummaryResponse;
}) {
  const priorityProperties =
    metadata.stats.find((item) => item.label === "Priority properties with data")?.value ??
    "0";
  const statByEntry: Record<EntryCardContent["id"], string> = {
    metadata: `${priorityProperties} priority properties`,
    overview: `${formatInteger(overview.metrics.sample_count)} samples`,
    schema: `${formatInteger(schema.schema_cards.length)} schemas`,
    variant: `${formatCompactNumber(
      variantSummary.totals.variant_observations,
    )} variant observations`,
  };

  return ENTRY_CARD_CONTENT.map((entry) => ({
    ...entry,
    stat: statByEntry[entry.id],
  }));
}

function buildSnapshot({
  metadata,
  overview,
  schema,
  variantFilterOptionsResponse,
  variantReferenceGenomes,
  variantSummary,
}: {
  metadata: DatabrowserMetadataSummaryResponse;
  overview: DatabrowserOverviewSummaryResponse;
  schema: DatabrowserSchemaSummaryResponse;
  variantFilterOptionsResponse: VariantFilterOptionsResponse;
  variantReferenceGenomes: VariantReferenceGenomeApiItem[];
  variantSummary: VariantSummaryResponse;
}): DatabrowserSnapshot {
  const referenceGenomeOptions = variantReferenceGenomes.map(variantReferenceGenomeOption);

  return {
    generatedAt: new Date().toISOString(),
    homeCards: buildHomeCards({ metadata, overview, schema, variantSummary }),
    metadata: {
      notes: metadata.notes,
      schemaOptions: metadata.schema_options.map(schemaOption),
      schemaScopes: metadata.schema_scopes.map(schemaScope),
      sections: metadata.sections.map(metadataSection),
      stats: kpiItems(metadata.stats),
    },
    overview: {
      coverageNotes: overview.coverage_notes,
      geography: chartItems(overview.geography),
      kpis: kpiItems(overview.kpis),
      notes: overview.notes,
      pathogens: chartItems(overview.pathogens),
      sampleGrowth: chartItems(overview.sample_growth),
      schemaMix: chartItems(overview.schema_mix),
    },
    schema: {
      classificationDistribution: chartItems(schema.classification_distribution),
      notes: schema.notes,
      schemaCards: schema.schema_cards.map(schemaCard),
      schemaDistribution: chartItems(schema.schema_distribution),
      stats: kpiItems(schema.stats),
    },
    variant: {
      filterOptions: variantFilterOptions(variantFilterOptionsResponse),
      impactClasses: chartItems(variantSummary.impact_classes),
      impactClassesAvailable: variantSummary.impact_classes.length > 0,
      notes: [
        "La vista Variant consume /variants/summary, /variants/reference-genomes, /variants/filter-options y /variants/search.",
        "El backend aplica el scope del usuario autenticado; un usuario de un caso de uso no ve variantes de otros scopes y viceversa.",
        "Las busquedas sin resultados devuelven 404 y se muestran como estado vacio, no como fallo critico de UI.",
      ],
      projectCoverage: chartItems(variantSummary.projects),
      referenceGenomeOptions,
      referenceGenomes: chartItems(variantSummary.reference_genomes),
      stats: [
        {
          label: "Reference genomes",
          note: "Genomas de referencia devueltos por /variants/reference-genomes",
          value: formatInteger(referenceGenomeOptions.length),
        },
        {
          label: "Variant observations",
          note: "Filas per-variant visibles para el usuario autenticado",
          value: formatCompactNumber(variantSummary.totals.variant_observations),
        },
        {
          label: "Distinct variants",
          note: "Variantes genomicas distintas en el scope actual",
          value: formatInteger(variantSummary.totals.distinct_variants),
        },
        {
          label: "Samples with variants",
          note: "Muestras visibles con al menos una variante observada",
          value: formatInteger(variantSummary.totals.samples_with_variants),
        },
      ],
      variantCounts: chartItems(variantSummary.variant_counts),
      variantSoftware: [],
    },
  };
}

export async function loadDatabrowserSnapshot(
  credentials: ApiCredentials | null,
): Promise<DatabrowserSnapshot> {
  const client = new PathocoreApiClient(credentials);
  const [
    overview,
    metadata,
    schema,
    variantSummary,
    variantFilterOptionsResponse,
    variantReferenceGenomes,
  ] = await Promise.all([
    client.getDatabrowserOverviewSummary(),
    client.getDatabrowserMetadataSummary(),
    client.getDatabrowserSchemaSummary(),
    client.getVariantSummary(),
    client.getVariantFilterOptions(),
    client.listVariantReferenceGenomes(),
  ]);

  return buildSnapshot({
    metadata,
    overview,
    schema,
    variantFilterOptionsResponse,
    variantReferenceGenomes,
    variantSummary,
  });
}
