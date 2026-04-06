import { ENTRY_CARD_CONTENT, PRIORITIZED_PROPERTIES } from "@/lib/constants";
import {
  formatCompactNumber,
  formatInteger,
  humanizePropertyName,
  stripOntology,
  truncateLabel,
} from "@/lib/format";
import type {
  SampleMetadataApiItem,
  SampleListItem,
  SchemaDetailResponse,
  SchemaListItem,
  SchemaPropertyDefinition,
  VariantFilterOptionsResponse,
  VariantReferenceGenomeApiItem,
  VariantSummaryResponse,
} from "@/types/api";
import type {
  ChartDatum,
  DatabrowserSnapshot,
  EntryCardContent,
  MetadataPanelChart,
  MetadataSchemaOption,
  MetadataSchemaScope,
  MetadataSubsectionData,
  PropertyDistributionCard,
  SchemaCardData,
  SchemaClassificationCard,
  SchemaPropertyCard,
} from "@/types/databrowser";

interface BuildDatabrowserSnapshotInput {
  sampleMetadata: {
    metadata: SampleMetadataApiItem[];
    sampleUniqueId: string;
  }[];
  samples: SampleListItem[];
  schemaDetails: SchemaDetailResponse[];
  schemas: SchemaListItem[];
  variantFilterOptions: VariantFilterOptionsResponse | null;
  variantReferenceGenomes: VariantReferenceGenomeApiItem[];
  variantSummary: VariantSummaryResponse | null;
}

interface FlattenedSchemaProperty {
  classification: string;
  description: string;
  enumValues: string[];
  examples: string[];
  label: string;
  path: string;
  propertyName: string;
  schemaKey: string;
  type: string;
}

interface SampleMetadataEntry {
  propertyName: string;
  value: string;
}

interface SampleRecord {
  metadataByProperty: Map<string, string[]>;
  projectName: string;
  sample: SampleListItem;
  schemaKey: string;
}

function schemaKey(schemaName: string, schemaVersion: string) {
  return `${schemaName}::${schemaVersion}`;
}

function normalizeClassification(value?: string) {
  const trimmed = value?.trim();
  return trimmed ? trimmed : "Unclassified";
}

function inferSchemaPropertyType(definition: SchemaPropertyDefinition) {
  if (definition.type === "array") {
    const itemType = definition.items?.type;
    return itemType ? `array<${itemType}>` : "array";
  }

  if (definition.type) {
    return definition.type;
  }

  if (definition.properties) {
    return "object";
  }

  if (definition.items) {
    return "array";
  }

  return "unknown";
}

function normalizeMetadataItems(items: SampleMetadataApiItem[]) {
  const normalized: SampleMetadataEntry[] = [];

  items.forEach((item) => {
    Object.entries(item).forEach(([propertyName, value]) => {
      if (value === null || value === undefined || String(value).trim() === "") {
        return;
      }

      normalized.push({
        propertyName,
        value: String(value),
      });
    });
  });

  return normalized;
}

function extractSchemaProperties(
  properties: Record<string, SchemaPropertyDefinition>,
  currentSchemaKey: string,
  parentPath = "",
  parentClassification?: string,
) {
  const flattened: FlattenedSchemaProperty[] = [];

  Object.entries(properties).forEach(([propertyName, definition]) => {
    const currentPath = parentPath ? `${parentPath}.${propertyName}` : propertyName;
    const nestedProperties = definition.properties ?? definition.items?.properties;
    const classification = definition.classification?.trim() || parentClassification;

    if (nestedProperties) {
      flattened.push(
        ...extractSchemaProperties(
          nestedProperties,
          currentSchemaKey,
          currentPath,
          classification,
        ),
      );
    }

    if (!nestedProperties || definition.classification) {
      flattened.push({
        classification: normalizeClassification(classification),
        description: definition.description?.trim() || "No description provided by schema.",
        enumValues: definition.enum ?? [],
        examples: definition.examples ?? [],
        label: definition.label?.trim() || humanizePropertyName(propertyName),
        path: currentPath,
        propertyName,
        schemaKey: currentSchemaKey,
        type: inferSchemaPropertyType(definition),
      });
    }
  });

  return flattened;
}

function accumulateCounts(labels: string[]) {
  const counts = new Map<string, number>();

  labels.forEach((label) => {
    counts.set(label, (counts.get(label) ?? 0) + 1);
  });

  return counts;
}

function categoricalDistribution(values: string[]) {
  const counts = accumulateCounts(values.map((value) => truncateLabel(stripOntology(value))));

  return Array.from(counts.entries())
    .sort((left, right) => right[1] - left[1] || left[0].localeCompare(right[0], "es"))
    .slice(0, 8)
    .map(([label, value]) => ({ label, value }));
}

function numericValue(rawValue: string) {
  const normalized = Number(rawValue.replace(/[^0-9.-]/g, ""));
  return Number.isFinite(normalized) ? normalized : null;
}

function numericLineDistribution(values: string[]) {
  const counts = new Map<number, number>();

  values.forEach((value) => {
    const numeric = numericValue(value);

    if (numeric === null) {
      return;
    }

    counts.set(numeric, (counts.get(numeric) ?? 0) + 1);
  });

  return Array.from(counts.entries())
    .sort((left, right) => left[0] - right[0])
    .map(([label, value]) => ({ label: formatInteger(label), value }));
}

function normalizeDateInput(value: string) {
  const trimmed = value.trim();

  if (!trimmed) {
    return null;
  }

  const parsed = new Date(trimmed);

  if (Number.isNaN(parsed.getTime())) {
    return null;
  }

  return parsed.toISOString().slice(0, 10);
}

function dateDistribution(values: string[]) {
  const parsed = values
    .map((value) => new Date(value))
    .filter((value) => !Number.isNaN(value.getTime()));

  if (!parsed.length) {
    return categoricalDistribution(values);
  }

  const yearSet = new Set(parsed.map((value) => value.getUTCFullYear()));
  const formatter = new Intl.DateTimeFormat("es-ES", {
    ...(yearSet.size > 1 ? { year: "numeric" } : { month: "short", year: "numeric" }),
  });

  const counts = new Map<string, { order: number; value: number }>();

  parsed.forEach((value) => {
    const order =
      yearSet.size > 1
        ? value.getUTCFullYear()
        : value.getUTCFullYear() * 100 + value.getUTCMonth();
    const label =
      yearSet.size > 1
        ? String(value.getUTCFullYear())
        : formatter.format(value).replace(".", "");

    counts.set(label, {
      order,
      value: (counts.get(label)?.value ?? 0) + 1,
    });
  });

  return Array.from(counts.entries())
    .sort((left, right) => left[1].order - right[1].order)
    .map(([label, item]) => ({ label, value: item.value }));
}

function bucketNumericValues(
  values: string[],
  buckets: { label: string; match: (value: number) => boolean }[],
) {
  const counts = new Map<string, number>();

  values.forEach((value) => {
    const numeric = numericValue(value);
    if (numeric === null) {
      return;
    }

    const bucket = buckets.find((candidate) => candidate.match(numeric));
    if (!bucket) {
      return;
    }

    counts.set(bucket.label, (counts.get(bucket.label) ?? 0) + 1);
  });

  return buckets
    .map((bucket) => ({
      label: bucket.label,
      value: counts.get(bucket.label) ?? 0,
    }))
    .filter((item) => item.value > 0);
}

function buildDistribution(values: string[], strategy: string): ChartDatum[] {
  if (!values.length) {
    return [];
  }

  switch (strategy) {
    case "age":
      return bucketNumericValues(values, [
        { label: "0-17", match: (value) => value < 18 },
        { label: "18-39", match: (value) => value >= 18 && value < 40 },
        { label: "40-64", match: (value) => value >= 40 && value < 65 },
        { label: "65-79", match: (value) => value >= 65 && value < 80 },
        { label: "80+", match: (value) => value >= 80 },
      ]);
    case "coverage":
      return bucketNumericValues(values, [
        { label: "<30x", match: (value) => value < 30 },
        { label: "30-60x", match: (value) => value >= 30 && value < 60 },
        { label: "60-100x", match: (value) => value >= 60 && value < 100 },
        { label: ">100x", match: (value) => value >= 100 },
      ]);
    case "date":
      return dateDistribution(values);
    case "read-count":
      return bucketNumericValues(values, [
        { label: "<1M", match: (value) => value < 1_000_000 },
        { label: "1M-3M", match: (value) => value >= 1_000_000 && value < 3_000_000 },
        { label: "3M-5M", match: (value) => value >= 3_000_000 && value < 5_000_000 },
        { label: ">5M", match: (value) => value >= 5_000_000 },
      ]);
    case "read-length":
      return bucketNumericValues(values, [
        { label: "<=150", match: (value) => value <= 150 },
        { label: "151-300", match: (value) => value > 150 && value <= 300 },
        { label: "301-1000", match: (value) => value > 300 && value <= 1000 },
        { label: ">1000", match: (value) => value > 1000 },
      ]);
    default:
      return categoricalDistribution(values);
  }
}

function chartFromRecords(
  records: SampleRecord[],
  aliases: string[],
  strategy: string,
): {
  aliasesUsed: string[];
  participantCount: number;
  values: ChartDatum[];
} {
  const aliasesUsed = new Set<string>();
  const allValues: string[] = [];
  let participantCount = 0;

  records.forEach((record) => {
    const match = aliases.find((alias) => record.metadataByProperty.has(alias));

    if (!match) {
      return;
    }

    const values = record.metadataByProperty.get(match) ?? [];
    if (!values.length) {
      return;
    }

    participantCount += 1;
    aliasesUsed.add(match);
    allValues.push(...Array.from(new Set(values)));
  });

  return {
    aliasesUsed: Array.from(aliasesUsed),
    participantCount,
    values: buildDistribution(allValues, strategy),
  };
}

function chartPanel(
  title: string,
  description: string,
  values: ChartDatum[],
  kind: MetadataPanelChart["kind"],
): MetadataPanelChart {
  return { description, kind, title, values };
}

function propertyLookupFromFlattened(properties: FlattenedSchemaProperty[]) {
  const lookup = new Map<string, FlattenedSchemaProperty>();

  properties.forEach((property) => {
    if (!lookup.has(property.propertyName)) {
      lookup.set(property.propertyName, property);
    }
  });

  return lookup;
}

function buildPropertyCards(
  records: SampleRecord[],
  propertyDefinitions: Map<string, FlattenedSchemaProperty>,
  group: MetadataSubsectionData["id"],
  totalSamples: number,
  options: { includeUnmatchedProperties: boolean } = { includeUnmatchedProperties: true },
) {
  return PRIORITIZED_PROPERTIES.filter((property) => property.group === group)
    .map((property) => {
      const chart = chartFromRecords(records, property.aliases, property.strategy);
      const aliasLabel =
        chart.aliasesUsed.length === 0
          ? undefined
          : chart.aliasesUsed.length === 1
            ? chart.aliasesUsed[0]
            : `${chart.aliasesUsed[0]} (+${chart.aliasesUsed.length - 1})`;
      const definition = property.aliases
        .map((alias) => propertyDefinitions.get(alias))
        .find(Boolean);

      if (
        !options.includeUnmatchedProperties &&
        !definition &&
        chart.participantCount === 0
      ) {
        return null;
      }

      const card: PropertyDistributionCard = {
        chartKind: property.strategy === "date" ? "line" : "bar",
        chartTitle: property.chartTitle,
        description:
          definition?.description ??
          "La API no expone todavía una descripción formal para esta propiedad.",
        displayName: property.displayName,
        isFallback:
          chart.aliasesUsed.length > 0 &&
          (chart.aliasesUsed.length > 1 || chart.aliasesUsed[0] !== property.expectedProperty),
        participantCount: chart.participantCount,
        participantShare: totalSamples > 0 ? chart.participantCount / totalSamples : 0,
        propertyName: property.expectedProperty,
        values: chart.values,
      };

      if (aliasLabel) {
        card.actualPropertyName = aliasLabel;
      }

      return card;
    })
    .filter((card): card is PropertyDistributionCard => Boolean(card));
}

function regionCountsFromRecords(records: SampleRecord[]) {
  const overviewRegionCounts = new Map<string, number>();

  records.forEach((record) => {
    const region =
      record.metadataByProperty.get("geo_loc_state")?.[0] ??
      record.metadataByProperty.get("collecting_institution_geo_loc_state")?.[0] ??
      record.metadataByProperty.get("submitting_geo_loc_state")?.[0];

    if (!region) {
      return;
    }

    const normalized = truncateLabel(stripOntology(region));
    overviewRegionCounts.set(normalized, (overviewRegionCounts.get(normalized) ?? 0) + 1);
  });

  return overviewRegionCounts;
}

function growthValuesFromRecords(records: SampleRecord[]) {
  return records
    .map((record) => {
      const metadataDate = record.metadataByProperty.get("sample_collection_date")?.[0];
      return metadataDate ?? record.sample.created_at;
    })
    .filter(Boolean);
}

function buildMetadataSections(
  records: SampleRecord[],
  propertyDefinitions: Map<string, FlattenedSchemaProperty>,
  options: { includeUnmatchedProperties: boolean },
) {
  const sampleMetadataProperties = buildPropertyCards(
    records,
    propertyDefinitions,
    "sample-metadata",
    records.length,
    options,
  );
  const bioinfoProperties = buildPropertyCards(
    records,
    propertyDefinitions,
    "sample-bioinfo",
    records.length,
    options,
  );
  const hostProperties = buildPropertyCards(
    records,
    propertyDefinitions,
    "host-information",
    records.length,
    options,
  );
  const regionCounts = regionCountsFromRecords(records);
  const growthValues = growthValuesFromRecords(records);

  const sampleMetadataSection: MetadataSubsectionData = {
    description:
      "Cobertura agregada de recoleccion y procesado de muestras basada en la metadata actualmente accesible a traves de la API.",
    id: "sample-metadata",
    notes: [
      "La distribucion geografica utiliza fallbacks sobre geo_loc_state cuando el dataset real emplea campos equivalentes por institucion.",
      "Los graficos temporales se representan como linea para mantener legibilidad al crecer el numero de muestras.",
    ],
    properties: sampleMetadataProperties,
    summaryCharts: [
      chartPanel(
        "Geographic coverage",
        "Muestras por region visible",
        countsToChartData(regionCounts).slice(0, 8),
        "bar",
      ),
      chartPanel(
        "Collection timeline",
        "Muestras por periodo de recogida",
        dateDistribution(growthValues),
        "line",
      ),
    ],
    title: "Sample metadata",
  };

  const bioinfoSection: MetadataSubsectionData = {
    description:
      "Panel superior con agregados bioinformaticos y propiedades desplegables priorizadas para tecnologia, software y volumen de datos.",
    id: "sample-bioinfo",
    notes: [],
    properties: bioinfoProperties,
    summaryCharts: [
      chartPanel(
        "Sequencing technology",
        "Muestras por plataforma de secuenciacion",
        categoricalDistribution(
          records.flatMap(
            (record) => record.metadataByProperty.get("sequencing_instrument_platform") ?? [],
          ),
        ),
        "pie",
      ),
      chartPanel(
        "Analysis software",
        "Muestras por software principal de analisis",
        categoricalDistribution(
          records.flatMap(
            (record) =>
              record.metadataByProperty.get("bioinformatics_protocol_software_name") ?? [],
          ),
        ),
        "bar",
      ),
    ],
    title: "Sample bioinfo",
  };

  const hostSection: MetadataSubsectionData = {
    description:
      "Perfil cientifico del host con foco en identidad del hospedador, infeccion y exposicion visible en la metadata retornada.",
    id: "host-information",
    notes: [],
    properties: hostProperties,
    summaryCharts: [
      chartPanel(
        "Host distribution",
        "Muestras por host common name",
        categoricalDistribution(
          records.flatMap(
            (record) => record.metadataByProperty.get("host_common_name") ?? [],
          ),
        ),
        "pie",
      ),
      chartPanel(
        "Infection profile",
        "Muestras por tipo de infeccion",
        categoricalDistribution(
          records.flatMap(
            (record) => record.metadataByProperty.get("infection_type") ?? [],
          ),
        ),
        "bar",
      ),
    ],
    title: "Host information",
  };

  return [sampleMetadataSection, bioinfoSection, hostSection];
}

function buildVariantFilterOptions(records: SampleRecord[]) {
  const collectionDates = records
    .flatMap((record) => record.metadataByProperty.get("sample_collection_date") ?? [])
    .map(normalizeDateInput)
    .filter((value): value is string => Boolean(value))
    .sort((left, right) => left.localeCompare(right));
  const sequencingPlatforms = Array.from(
    new Set(
      records
        .flatMap(
          (record) => record.metadataByProperty.get("sequencing_instrument_platform") ?? [],
        )
        .map(stripOntology)
        .filter(Boolean),
    ),
  ).sort((left, right) => left.localeCompare(right, "es"));

  return {
    collectionDateMax: collectionDates[collectionDates.length - 1] ?? null,
    collectionDateMin: collectionDates[0] ?? null,
    sequencingPlatforms,
  };
}

function buildVariantFilterOptionsFromApi(
  apiOptions: VariantFilterOptionsResponse | null,
  records: SampleRecord[],
) {
  const fallbackOptions = buildVariantFilterOptions(records);

  if (!apiOptions) {
    return fallbackOptions;
  }

  const sequencingPlatforms = apiOptions.sequencing_platforms
    .map((option) => option.value || option.label)
    .filter(Boolean)
    .sort((left, right) => left.localeCompare(right, "es"));

  return {
    collectionDateMax:
      apiOptions.collection_date.max ?? fallbackOptions.collectionDateMax,
    collectionDateMin:
      apiOptions.collection_date.min ?? fallbackOptions.collectionDateMin,
    sequencingPlatforms:
      sequencingPlatforms.length > 0
        ? Array.from(new Set(sequencingPlatforms))
        : fallbackOptions.sequencingPlatforms,
  };
}

function apiCountsToChartData(items?: { label: string; value: number }[]) {
  return (items ?? [])
    .filter((item) => Number.isFinite(item.value))
    .map((item) => ({
      label: truncateLabel(item.label),
      value: item.value,
    }));
}

function sortByNumericLabel(values: ChartDatum[]) {
  return [...values].sort((left, right) => {
    const leftNumeric = numericValue(left.label);
    const rightNumeric = numericValue(right.label);

    if (leftNumeric !== null && rightNumeric !== null) {
      return leftNumeric - rightNumeric;
    }

    return left.label.localeCompare(right.label, "es");
  });
}

function buildVariantReferenceGenomeOptions(items: VariantReferenceGenomeApiItem[]) {
  return items
    .map((item) => ({
      distinctVariantCount: item.distinct_variant_count,
      referenceGenome: item.reference_genome,
      sampleCount: item.sample_count,
      variantObservationCount: item.variant_observation_count,
    }))
    .sort((left, right) =>
      left.referenceGenome.localeCompare(right.referenceGenome, "es"),
    );
}

function buildHomeCards(
  totalSamples: number,
  totalSchemas: number,
  populatedPriorityProperties: number,
  totalVariantObservations: number,
) {
  const statByEntry: Record<EntryCardContent["id"], string> = {
    metadata: `${formatInteger(populatedPriorityProperties)} priority properties`,
    overview: `${formatInteger(totalSamples)} samples`,
    schema: `${formatInteger(totalSchemas)} active schemas`,
    variant: `${formatInteger(totalVariantObservations)} variant observations`,
  };

  return ENTRY_CARD_CONTENT.map((entry) => ({
    ...entry,
    stat: statByEntry[entry.id],
  }));
}

function countsToChartData(counts: Map<string, number>) {
  return Array.from(counts.entries())
    .sort((left, right) => right[1] - left[1] || left[0].localeCompare(right[0], "es"))
    .map(([label, value]) => ({ label: truncateLabel(label), value }));
}

export function buildDatabrowserSnapshot({
  sampleMetadata,
  samples,
  schemaDetails,
  schemas,
  variantFilterOptions,
  variantReferenceGenomes,
  variantSummary,
}: BuildDatabrowserSnapshotInput): DatabrowserSnapshot {
  const schemasByKey = new Map(
    schemas.map((schema) => [schemaKey(schema.schema_name, schema.schema_version), schema]),
  );

  const flattenedPropertiesBySchema = new Map<string, FlattenedSchemaProperty[]>();

  schemaDetails.forEach((schemaDetail) => {
    const currentSchemaKey = schemaKey(
      schemaDetail.schema_name,
      schemaDetail.schema_version,
    );
    const flattened = extractSchemaProperties(
      schemaDetail.schema.properties ?? {},
      currentSchemaKey,
    );
    flattenedPropertiesBySchema.set(currentSchemaKey, flattened);
  });

  const metadataBySampleId = new Map(
    sampleMetadata.map((item) => [item.sampleUniqueId, normalizeMetadataItems(item.metadata)]),
  );
  const allFlattenedProperties = Array.from(flattenedPropertiesBySchema.values()).flat();
  const flattenedPropertyLookup = propertyLookupFromFlattened(allFlattenedProperties);

  const sampleRecords = samples.map<SampleRecord>((sample) => {
    const currentSchemaKey = schemaKey(sample.schema_name, sample.schema_version);
    const metadataItems = metadataBySampleId.get(sample.sample_unique_id) ?? [];
    const metadataByProperty = new Map<string, string[]>();

    metadataItems.forEach((entry) => {
      const existing = metadataByProperty.get(entry.propertyName) ?? [];
      existing.push(entry.value);
      metadataByProperty.set(entry.propertyName, existing);
    });

    const schema = schemasByKey.get(currentSchemaKey);
    const projectName =
      schema?.project_name ||
      metadataByProperty.get("project_name")?.[0] ||
      "Unknown project";

    return {
      metadataByProperty,
      projectName,
      sample,
      schemaKey: currentSchemaKey,
    };
  });

  const sampleCountBySchema = new Map<string, number>();
  const projectCounts = new Map<string, number>();
  const populatedMetadataProperties = new Set<string>();

  sampleRecords.forEach((record) => {
    sampleCountBySchema.set(
      record.schemaKey,
      (sampleCountBySchema.get(record.schemaKey) ?? 0) + 1,
    );
    projectCounts.set(record.projectName, (projectCounts.get(record.projectName) ?? 0) + 1);

    record.metadataByProperty.forEach((_values, propertyName) => {
      populatedMetadataProperties.add(propertyName);
    });
  });

  const overviewGrowthValues = growthValuesFromRecords(sampleRecords);

  const overviewPathogenValues = sampleRecords.flatMap(
    (record) => record.metadataByProperty.get("organism") ?? [],
  );

  const overviewRegionCounts = regionCountsFromRecords(sampleRecords);

  const schemaCards = schemaDetails.map<SchemaCardData>((schemaDetail) => {
    const currentSchemaKey = schemaKey(
      schemaDetail.schema_name,
      schemaDetail.schema_version,
    );
    const properties = flattenedPropertiesBySchema.get(currentSchemaKey) ?? [];
    const propertiesByClassification = new Map<string, SchemaPropertyCard[]>();

    properties.forEach((property) => {
      const existing = propertiesByClassification.get(property.classification) ?? [];
      existing.push({
        classification: property.classification,
        description: property.description,
        enumValues: property.enumValues,
        examples: property.examples,
        label: property.label,
        path: property.path,
        propertyName: property.propertyName,
        type: property.type,
      });
      propertiesByClassification.set(property.classification, existing);
    });

    const classifications = Array.from(propertiesByClassification.entries())
      .map<SchemaClassificationCard>(([name, classificationProperties]) => ({
        name,
        properties: classificationProperties.sort((left, right) =>
          left.label.localeCompare(right.label, "es"),
        ),
        propertyCount: classificationProperties.length,
      }))
      .sort((left, right) => right.propertyCount - left.propertyCount);

    return {
      classificationCount: classifications.length,
      classifications,
      generatedAt: schemaDetail.generated_at,
      name: schemaDetail.schema_name,
      projectName:
        schemaDetail.project_name ??
        schemasByKey.get(currentSchemaKey)?.project_name ??
        "Unknown project",
      propertyCount: properties.length,
      sampleCount: sampleCountBySchema.get(currentSchemaKey) ?? 0,
      version: schemaDetail.schema_version,
    };
  });

  const metadataSections = buildMetadataSections(
    sampleRecords,
    flattenedPropertyLookup,
    { includeUnmatchedProperties: true },
  );

  const metadataSchemaOptions = schemaDetails.map<MetadataSchemaOption>((schemaDetail) => {
    const currentSchemaKey = schemaKey(
      schemaDetail.schema_name,
      schemaDetail.schema_version,
    );

    return {
      key: currentSchemaKey,
      label: `${schemaDetail.schema_name} v${schemaDetail.schema_version}`,
      projectName:
        schemaDetail.project_name ??
        schemasByKey.get(currentSchemaKey)?.project_name ??
        "Unknown project",
      sampleCount: sampleCountBySchema.get(currentSchemaKey) ?? 0,
      schemaName: schemaDetail.schema_name,
      schemaVersion: schemaDetail.schema_version,
    };
  });

  const metadataSchemaScopes = metadataSchemaOptions.map<MetadataSchemaScope>((option) => {
    const recordsForSchema = sampleRecords.filter((record) => record.schemaKey === option.key);
    const propertyDefinitions = propertyLookupFromFlattened(
      flattenedPropertiesBySchema.get(option.key) ?? [],
    );

    return {
      key: option.key,
      sampleCount: recordsForSchema.length,
      sections: buildMetadataSections(recordsForSchema, propertyDefinitions, {
        includeUnmatchedProperties: false,
      }),
    };
  });

  const metadataReferenceGenomeChart = categoricalDistribution(
    sampleRecords.flatMap(
      (record) => record.metadataByProperty.get("reference_genome_accession") ?? [],
    ),
  );
  const metadataVariantCountsChart = numericLineDistribution(
    sampleRecords.flatMap(
      (record) => record.metadataByProperty.get("number_of_variants_in_consensus") ?? [],
    ),
  );
  const variantSoftwareChart = categoricalDistribution(
    sampleRecords.flatMap(
      (record) => record.metadataByProperty.get("variant_calling_software_name") ?? [],
    ),
  );

  const samplesWithVariantData = sampleRecords.filter((record) =>
    record.metadataByProperty.has("number_of_variants_in_consensus"),
  );
  const variantProjectCoverage = countsToChartData(
    accumulateCounts(samplesWithVariantData.map((record) => record.projectName)),
  );

  const totalConsensusVariants = sampleRecords.reduce((accumulator, record) => {
    const values = record.metadataByProperty.get("number_of_variants_in_consensus") ?? [];
    return (
      accumulator +
      values.reduce((partial, value) => partial + (numericValue(value) ?? 0), 0)
    );
  }, 0);

  const impactClassAliases = ["impact_class", "variant_impact", "annotation_impact"];
  const impactValues = sampleRecords.flatMap((record) =>
    impactClassAliases.flatMap((alias) => record.metadataByProperty.get(alias) ?? []),
  );
  const metadataImpactClassChart = categoricalDistribution(impactValues);
  const variantFilterOptionsForUi = buildVariantFilterOptionsFromApi(
    variantFilterOptions,
    sampleRecords,
  );
  const variantReferenceGenomeOptions =
    buildVariantReferenceGenomeOptions(variantReferenceGenomes);
  const summaryReferenceGenomeChart = apiCountsToChartData(
    variantSummary?.reference_genomes,
  );
  const referenceGenomeChart =
    summaryReferenceGenomeChart.length > 0
      ? summaryReferenceGenomeChart
      : metadataReferenceGenomeChart;
  const summaryVariantCountsChart = sortByNumericLabel(
    apiCountsToChartData(variantSummary?.variant_counts),
  );
  const variantCountsChart =
    summaryVariantCountsChart.length > 0
      ? summaryVariantCountsChart
      : metadataVariantCountsChart;
  const summaryImpactClassChart = apiCountsToChartData(variantSummary?.impact_classes);
  const impactClassChart =
    summaryImpactClassChart.length > 0
      ? summaryImpactClassChart
      : metadataImpactClassChart;
  const summaryProjectCoverage = apiCountsToChartData(variantSummary?.projects);
  const projectCoverage =
    summaryProjectCoverage.length > 0 ? summaryProjectCoverage : variantProjectCoverage;
  const totalVariantObservations =
    variantSummary?.totals.variant_observations ?? totalConsensusVariants;
  const populatedPriorityProperties = metadataSections
    .flatMap((section) => section.properties)
    .filter((item) => item.participantCount > 0).length;

  return {
    generatedAt: new Date().toISOString(),
    homeCards: buildHomeCards(
      sampleRecords.length,
      schemas.filter((schema) => schema.schema_in_use).length,
      populatedPriorityProperties,
      totalVariantObservations,
    ),
    metadata: {
      notes: [
        "La vista agrega resultados a partir de /samples y /samples/{sample_unique_id}/metadata.",
        "La API actual no expone aun metadata compleja agrupada dentro de arrays/objetos anidados; por eso algunas propiedades del schema quedan sin cobertura en esta version.",
      ],
      schemaOptions: metadataSchemaOptions,
      schemaScopes: metadataSchemaScopes,
      sections: metadataSections,
      stats: [
        {
          label: "Sections",
          note: "Bloques principales del entregable",
          value: "3",
        },
        {
          label: "Priority properties with data",
          note: "Propiedades priorizadas con al menos una muestra",
          value: formatInteger(populatedPriorityProperties),
        },
        {
          label: "Samples with metadata",
          note: "Muestras visibles con al menos una entrada",
          value: formatInteger(
            sampleRecords.filter((record) => record.metadataByProperty.size > 0).length,
          ),
        },
        {
          label: "Visible metadata properties",
          note: "Propiedades distintas pobladas en el dataset actual",
          value: formatInteger(populatedMetadataProperties.size),
        },
      ],
    },
    overview: {
      coverageNotes: [
        `Pathogen distribution currently covers ${overviewPathogenValues.length} metadata rows based on flat organism fields exposed by the API.`,
      ],
      geography: countsToChartData(overviewRegionCounts).slice(0, 8),
      kpis: [
        {
          label: "Samples",
          note: "Muestras visibles para el usuario autenticado",
          value: formatInteger(sampleRecords.length),
        },
        {
          label: "Projects",
          note: "Proyectos representados en los schemas activos",
          value: formatInteger(projectCounts.size),
        },
        {
          label: "Schemas",
          note: "Schemas activos visibles",
          value: formatInteger(schemas.filter((schema) => schema.schema_in_use).length),
        },
        {
          label: "Metadata properties",
          note: "Propiedades distintas con valores observados",
          value: formatInteger(populatedMetadataProperties.size),
        },
      ],
      notes: [
        "El crecimiento temporal prioriza sample_collection_date y cae a created_at cuando esa metadata no existe.",
        "La distribucion de patogenos depende de la parte de metadata plana expuesta por la API; algunos schemas usan estructuras anidadas que hoy no salen en /metadata.",
      ],
      pathogens: categoricalDistribution(overviewPathogenValues).slice(0, 6),
      sampleGrowth: dateDistribution(overviewGrowthValues),
      schemaMix: schemaCards.map((card) => ({
        label: card.name,
        value: card.sampleCount,
      })),
    },
    schema: {
      classificationDistribution: countsToChartData(
        accumulateCounts(
          allFlattenedProperties.map((property) => property.classification),
        ),
      ),
      notes: [
        "La distribucion por classification usa el schema JSON retornado por /schema/{schema_name}/{schema_version}.",
        "La exploracion de bloques Schema muestra informacion estructural del schema: property label, descripcion, ruta, tipo y enumeraciones cuando existen.",
      ],
      schemaCards,
      schemaDistribution: schemaCards.map((card) => ({
        label: card.name,
        value: card.sampleCount,
      })),
      stats: [
        {
          label: "Active schemas",
          note: "Schemas marcados en uso en el backend",
          value: formatInteger(schemas.filter((schema) => schema.schema_in_use).length),
        },
        {
          label: "Projects",
          note: "Projects visibles en /schema",
          value: formatInteger(projectCounts.size),
        },
        {
          label: "Samples",
          note: "Muestras agregadas para la vista estructural",
          value: formatInteger(sampleRecords.length),
        },
        {
          label: "Classification types",
          note: "Clasificaciones distintas presentes en schemas activos",
          value: formatInteger(
            new Set(
              allFlattenedProperties.map((property) => property.classification),
            ).size,
          ),
        },
      ],
    },
    variant: {
      filterOptions: variantFilterOptionsForUi,
      impactClasses: impactClassChart,
      impactClassesAvailable: impactClassChart.length > 0,
      notes: [
        "La vista Variant consume /variants/summary, /variants/reference-genomes, /variants/filter-options y /variants/search.",
        "El backend aplica el scope del usuario autenticado; un usuario de MEPRAM no ve variantes de relecov y viceversa.",
        "Las busquedas sin resultados devuelven 404 y se muestran como estado vacio, no como fallo critico de UI.",
      ],
      projectCoverage,
      referenceGenomeOptions: variantReferenceGenomeOptions,
      referenceGenomes: referenceGenomeChart,
      stats: [
        {
          label: "Reference genomes",
          note: "Genomas de referencia devueltos por /variants/reference-genomes",
          value: formatInteger(
            variantReferenceGenomeOptions.length || referenceGenomeChart.length,
          ),
        },
        {
          label: "Variant observations",
          note: "Filas per-variant visibles para el usuario autenticado",
          value: formatCompactNumber(totalVariantObservations),
        },
        {
          label: "Distinct variants",
          note: "Variantes genomicas distintas en el scope actual",
          value: formatInteger(
            variantSummary?.totals.distinct_variants ?? variantCountsChart.length,
          ),
        },
        {
          label: "Samples with variants",
          note: "Muestras visibles con al menos una variante observada",
          value: formatInteger(
            variantSummary?.totals.samples_with_variants ?? samplesWithVariantData.length,
          ),
        },
      ],
      variantCounts: variantCountsChart,
      variantSoftware: variantSoftwareChart,
    },
  };
}
