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
  MetadataPropertyDistributionQuery,
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

function normalizedKey(value: string) {
  return value.trim().toLowerCase();
}

function metadataCardKeys(card: PropertyDistributionCard) {
  const keys = new Set([normalizedKey(card.propertyName)]);

  if (card.actualPropertyName) {
    card.actualPropertyName
      .split(",")
      .map((item) => item.trim())
      .filter(Boolean)
      .forEach((item) => keys.add(normalizedKey(item)));
  }

  return Array.from(keys);
}

function propertySectionId(
  property: DatabrowserSchemaPropertyCardResponse,
  classification: string,
): MetadataSubsectionData["id"] {
  const searchable = `${classification} ${property.property_name} ${property.path} ${property.label}`
    .toLowerCase()
    .replace(/[_-]/g, " ");

  if (
    searchable.includes("host") ||
    searchable.includes("patient") ||
    searchable.includes("clinical") ||
    searchable.includes("infection") ||
    searchable.includes("exposure") ||
    searchable.includes("outbreak")
  ) {
    return "host-information";
  }

  if (
    searchable.includes("bioinfo") ||
    searchable.includes("sequencing") ||
    searchable.includes("sequence") ||
    searchable.includes("assembly") ||
    searchable.includes("annotation") ||
    searchable.includes("software") ||
    searchable.includes("read") ||
    searchable.includes("coverage") ||
    searchable.includes("quality") ||
    searchable.includes("variant")
  ) {
    return "sample-bioinfo";
  }

  return "sample-metadata";
}

function propertyChartKind(
  property: DatabrowserSchemaPropertyCardResponse,
): PropertyDistributionCard["chartKind"] {
  const searchable = `${property.property_name} ${property.path} ${property.label} ${property.type}`
    .toLowerCase()
    .replace(/[_-]/g, " ");

  return searchable.includes("date") || searchable.includes("time") ? "line" : "bar";
}

function propertyChartTitle(property: DatabrowserSchemaPropertyCardResponse) {
  const searchable = `${property.property_name} ${property.path} ${property.label}`.toLowerCase();

  if (searchable.includes("date") || searchable.includes("time")) {
    return `${property.property_name} over time`;
  }

  if (searchable.includes("geo") || searchable.includes("region") || searchable.includes("state")) {
    return `${property.property_name} by geography`;
  }

  if (property.enum_values.length > 0) {
    return `${property.property_name} by enum value`;
  }

  return `${property.property_name} distribution`;
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

function schemaKey(schemaName: string, schemaVersion: string) {
  return `${schemaName}::${schemaVersion}`;
}

function schemaCardsForMetadata(
  schemaCards: SchemaCardData[],
  allowedSchemaKeys?: Set<string>,
  includeProjectName = false,
) {
  return schemaCards.flatMap((card) => {
    const currentSchemaKey = schemaKey(card.name, card.version);

    if (allowedSchemaKeys && !allowedSchemaKeys.has(currentSchemaKey)) {
      return [];
    }

    const distributionQuery: MetadataPropertyDistributionQuery = {
      schema_name: card.name,
      schema_version: card.version,
    };

    if (includeProjectName && card.projectName) {
      distributionQuery.project_name = card.projectName;
    }

    return card.classifications.flatMap((classification) =>
      classification.properties.map((property) => ({
        classification: classification.name,
        distributionQuery,
        property,
        schemaKey: currentSchemaKey,
      })),
    );
  });
}

function createPropertyCardFromSchema({
  classification,
  distributionQuery,
  property,
}: {
  classification: string;
  distributionQuery: MetadataPropertyDistributionQuery;
  property: SchemaPropertyCard;
}): PropertyDistributionCard {
  const card: PropertyDistributionCard = {
    chartKind: propertyChartKind({
      classification: property.classification,
      description: property.description,
      enum_values: property.enumValues,
      examples: property.examples,
      label: property.label,
      path: property.path,
      property_name: property.propertyName,
      type: property.type,
    }),
    chartTitle: propertyChartTitle({
      classification: property.classification,
      description: property.description,
      enum_values: property.enumValues,
      examples: property.examples,
      label: property.label,
      path: property.path,
      property_name: property.propertyName,
      type: property.type,
    }),
    classification,
    description: property.description || "No description provided by schema.",
    displayName: property.label || property.propertyName,
    distributionQueries: [distributionQuery],
    enumValues: property.enumValues,
    isFallback: false,
    participantCount: 0,
    participantShare: 0,
    propertyName: property.propertyName,
    schemaPath: property.path,
    schemaType: property.type,
    values: [],
  };

  return card;
}

function mergeDistributionQueries(
  queries: MetadataPropertyDistributionQuery[] = [],
) {
  const seen = new Set<string>();

  return queries.filter((query) => {
    const key = `${query.project_name ?? ""}::${query.schema_name ?? ""}::${query.schema_version ?? ""}`;

    if (seen.has(key)) {
      return false;
    }

    seen.add(key);
    return true;
  });
}

function enrichPropertyCard(
  existingCard: PropertyDistributionCard,
  schemaCard: PropertyDistributionCard,
): PropertyDistributionCard {
  const distributionQueries = mergeDistributionQueries([
    ...(existingCard.distributionQueries ?? []),
    ...(schemaCard.distributionQueries ?? []),
  ]);
  const enumValues = Array.from(
    new Set([...(existingCard.enumValues ?? []), ...(schemaCard.enumValues ?? [])]),
  );
  const enriched: PropertyDistributionCard = {
    ...existingCard,
    chartKind: existingCard.chartKind ?? schemaCard.chartKind,
    chartTitle: existingCard.chartTitle || schemaCard.chartTitle,
    description:
      existingCard.description && !existingCard.description.startsWith("La API no expone")
        ? existingCard.description
        : schemaCard.description,
    displayName: existingCard.displayName || schemaCard.displayName,
    enumValues,
  };
  const classification = existingCard.classification ?? schemaCard.classification;
  const schemaPath = existingCard.schemaPath ?? schemaCard.schemaPath;
  const schemaType = existingCard.schemaType ?? schemaCard.schemaType;

  if (distributionQueries.length > 0) {
    enriched.distributionQueries = distributionQueries;
  }
  if (classification) {
    enriched.classification = classification;
  }
  if (schemaPath) {
    enriched.schemaPath = schemaPath;
  }
  if (schemaType) {
    enriched.schemaType = schemaType;
  }

  return enriched;
}

function sortMetadataProperties(
  left: PropertyDistributionCard,
  right: PropertyDistributionCard,
) {
  const leftHasData = left.participantCount > 0 || left.values.length > 0;
  const rightHasData = right.participantCount > 0 || right.values.length > 0;

  if (leftHasData !== rightHasData) {
    return leftHasData ? -1 : 1;
  }

  return left.displayName.localeCompare(right.displayName, "es");
}

function enrichMetadataSectionsWithSchemaProperties({
  includeProjectName = false,
  schemaCards,
  sections,
  schemaKeys,
}: {
  includeProjectName?: boolean;
  schemaCards: SchemaCardData[];
  schemaKeys?: Set<string>;
  sections: MetadataSubsectionData[];
}) {
  const nextSections = sections.map((section) => {
    const propertyMap = new Map<string, PropertyDistributionCard>();

    section.properties.forEach((property) => {
      metadataCardKeys(property).forEach((key) => {
        if (!propertyMap.has(key)) {
          propertyMap.set(key, property);
        }
      });
    });

    return {
      ...section,
      properties: [...section.properties],
      propertyMap,
    };
  });
  const nextSectionsById = new Map(nextSections.map((section) => [section.id, section]));

  schemaCardsForMetadata(schemaCards, schemaKeys, includeProjectName).forEach(
    ({ classification, distributionQuery, property }) => {
      const sectionId = propertySectionId(
        {
          classification: property.classification,
          description: property.description,
          enum_values: property.enumValues,
          examples: property.examples,
          label: property.label,
          path: property.path,
          property_name: property.propertyName,
          type: property.type,
        },
        classification,
      );
      const targetSection = nextSectionsById.get(sectionId);

      if (!targetSection) {
        return;
      }

      const key = normalizedKey(property.propertyName);
      const schemaPropertyCard = createPropertyCardFromSchema({
        classification,
        distributionQuery,
        property,
      });
      const existing = targetSection.propertyMap.get(key);

      if (existing) {
        const enriched = enrichPropertyCard(existing, schemaPropertyCard);
        targetSection.propertyMap.set(key, enriched);
        targetSection.properties = targetSection.properties.map((candidate) =>
          normalizedKey(candidate.propertyName) === normalizedKey(existing.propertyName)
            ? enriched
            : candidate,
        );
        return;
      }

      targetSection.propertyMap.set(key, schemaPropertyCard);
      targetSection.properties.push(schemaPropertyCard);
    },
  );

  return nextSections.map((section) => ({
    description: section.description,
    id: section.id,
    notes: [
      ...section.notes,
      "Los desplegables incluyen las properties registradas en los schemas visibles; las que tienen datos conocidos aparecen primero y el resto carga su distribución al expandirse.",
    ],
    properties: section.properties.sort(sortMetadataProperties),
    summaryCharts: section.summaryCharts,
    title: section.title,
  }));
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
  overview,
  schema,
  variantSummary,
}: {
  overview: DatabrowserOverviewSummaryResponse;
  schema: DatabrowserSchemaSummaryResponse;
  variantSummary: VariantSummaryResponse;
}) {
  const registeredMetadataProperties = new Set(
    schema.schema_cards.flatMap((card) =>
      card.classifications.flatMap((classification) =>
        classification.properties.map((property) => property.property_name),
      ),
    ),
  ).size;
  const statByEntry: Record<EntryCardContent["id"], string> = {
    metadata: `${formatInteger(registeredMetadataProperties)} metadata properties`,
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
  const schemaCards = schema.schema_cards.map(schemaCard);
  const metadataSections = enrichMetadataSectionsWithSchemaProperties({
    schemaCards,
    sections: metadata.sections.map(metadataSection),
  });
  const metadataSchemaScopes = metadata.schema_scopes.map((scope) => {
    const currentScope = schemaScope(scope);

    return {
      ...currentScope,
      sections: enrichMetadataSectionsWithSchemaProperties({
        schemaCards,
        schemaKeys: new Set([scope.key]),
        sections: currentScope.sections,
      }),
    };
  });
  const registeredMetadataProperties = new Set(
    schemaCards.flatMap((card) =>
      card.classifications.flatMap((classification) =>
        classification.properties.map((property) => property.propertyName),
      ),
    ),
  ).size;
  const metadataStats = [
    {
      label: "Registered properties",
      note: "Properties definidas en los schemas visibles",
      value: formatInteger(registeredMetadataProperties),
    },
    ...kpiItems(metadata.stats).map((stat) =>
      stat.label.toLowerCase().includes("priority")
        ? {
            ...stat,
            label: "Properties with data",
            note: "Properties con datos precomputados por el resumen agregado",
          }
        : stat,
    ),
  ];

  return {
    generatedAt: new Date().toISOString(),
    homeCards: buildHomeCards({ overview, schema, variantSummary }),
    metadata: {
      notes: [
        ...metadata.notes,
        "Los acordeones de Metadata se completan con todas las properties registradas en los schemas visibles; las distribuciones no precomputadas se cargan bajo demanda.",
      ],
      schemaOptions: metadata.schema_options.map(schemaOption),
      schemaScopes: metadataSchemaScopes,
      sections: metadataSections,
      stats: metadataStats,
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
      schemaCards,
      schemaDistribution: chartItems(schema.schema_distribution),
      stats: kpiItems(schema.stats),
    },
    variant: {
      filterOptions: variantFilterOptions(variantFilterOptionsResponse),
      impactClasses: chartItems(variantSummary.impact_classes),
      impactClassesAvailable: variantSummary.impact_classes.length > 0,
      notes: [
        "La vista Variant consume /variants/summary, /variants/reference-genomes, /variants/filter-options y /variants/search.",
        "El databrowser genérico no envía project_name. En entornos de testing puede usar credenciales solo para autenticar contra una API que aún no expone endpoints públicos.",
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
          note: "Filas per-variant visibles en el scope público global",
          value: formatCompactNumber(variantSummary.totals.variant_observations),
        },
        {
          label: "Distinct variants",
          note: "Variantes genomicas distintas en el scope público global",
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
