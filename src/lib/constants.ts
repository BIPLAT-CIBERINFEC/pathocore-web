import type { EntryCardContent } from "@/types/databrowser";

export const DEFAULT_API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL?.trim() || "/api/v1";

export const PRIVACY_TEXT =
  "Recuento de muestras con al menos un valor registrado. Cada muestra se cuenta una sola vez dentro del dataset visible devuelto por la API.";

export const STORAGE_KEY = "pathocore-web.api-credentials";

export const ENTRY_CARD_CONTENT: Omit<EntryCardContent, "stat">[] = [
  {
    id: "overview",
    title: "Overview of Samples",
    subtitle: "Muestras, crecimiento y cobertura",
    description:
      "Vista general de muestras, evolución temporal, patógenos, regiones y distribución por schema.",
    tags: ["Samples", "Growth", "Coverage"],
  },
  {
    id: "schema",
    title: "Schema",
    subtitle: "Schemas y properties disponibles",
    description:
      "Explorador de schemas activos, clasificaciones y properties definidas en el modelo de datos.",
    tags: ["Schemas", "Projects", "Classification"],
  },
  {
    id: "metadata",
    title: "Metadata",
    subtitle: "Muestra, bioinformática y host",
    description:
      "Propiedades agregadas de muestra, bioinformática y host con filtros por schema y distribuciones.",
    tags: ["Sample metadata", "Bioinfo", "Host"],
  },
  {
    id: "variant",
    title: "Variant",
    subtitle: "Búsqueda y resumen de variantes",
    description:
      "Genomas de referencia, conteos de variantes y búsqueda HGVS conectada a la API real.",
    tags: ["Reference genomes", "Variants", "Projects"],
  },
];

export interface PrioritizedProperty {
  aliases: string[];
  chartTitle: string;
  displayName: string;
  expectedProperty: string;
  group: "host-information" | "sample-bioinfo" | "sample-metadata";
  strategy: "age" | "categorical" | "coverage" | "date" | "read-count" | "read-length";
}

export const PRIORITIZED_PROPERTIES: PrioritizedProperty[] = [
  {
    group: "sample-metadata",
    expectedProperty: "geo_loc_state",
    displayName: "geo_loc_state",
    chartTitle: "Samples by region",
    aliases: [
      "geo_loc_state",
      "collecting_institution_geo_loc_state",
      "submitting_geo_loc_state",
    ],
    strategy: "categorical",
  },
  {
    group: "sample-metadata",
    expectedProperty: "sample_collection_date",
    displayName: "sample_collection_date",
    chartTitle: "Samples by collection period",
    aliases: ["sample_collection_date"],
    strategy: "date",
  },
  {
    group: "sample-metadata",
    expectedProperty: "sample_received_date",
    displayName: "sample_received_date",
    chartTitle: "Samples by reception period",
    aliases: ["sample_received_date"],
    strategy: "date",
  },
  {
    group: "sample-metadata",
    expectedProperty: "anatomical_material",
    displayName: "anatomical_material",
    chartTitle: "Samples by anatomical material",
    aliases: ["anatomical_material"],
    strategy: "categorical",
  },
  {
    group: "sample-metadata",
    expectedProperty: "anatomical_part",
    displayName: "anatomical_part",
    chartTitle: "Samples by anatomical part",
    aliases: ["anatomical_part"],
    strategy: "categorical",
  },
  {
    group: "sample-metadata",
    expectedProperty: "specimen_source",
    displayName: "specimen_source",
    chartTitle: "Samples by specimen source",
    aliases: ["specimen_source"],
    strategy: "categorical",
  },
  {
    group: "sample-metadata",
    expectedProperty: "isolate_delivery_type",
    displayName: "isolate_delivery_type",
    chartTitle: "Samples by isolate delivery type",
    aliases: ["isolate_delivery_type"],
    strategy: "categorical",
  },
  {
    group: "sample-bioinfo",
    expectedProperty: "bioinformatics_protocol_software_name",
    displayName: "bioinformatics_protocol_software_name",
    chartTitle: "Samples by analysis software",
    aliases: ["bioinformatics_protocol_software_name"],
    strategy: "categorical",
  },
  {
    group: "sample-bioinfo",
    expectedProperty: "preprocessing_software_name",
    displayName: "preprocessing_software_name",
    chartTitle: "Samples by preprocessing software",
    aliases: ["preprocessing_software_name"],
    strategy: "categorical",
  },
  {
    group: "sample-bioinfo",
    expectedProperty: "read_length",
    displayName: "read_length",
    chartTitle: "Samples by read length bucket",
    aliases: ["read_length"],
    strategy: "read-length",
  },
  {
    group: "sample-bioinfo",
    expectedProperty: "number_of_reads_sequenced",
    displayName: "number_of_reads_sequenced",
    chartTitle: "Samples by read count bucket",
    aliases: ["number_of_reads_sequenced"],
    strategy: "read-count",
  },
  {
    group: "sample-bioinfo",
    expectedProperty: "assembly_method",
    displayName: "assembly_method",
    chartTitle: "Samples by assembly method",
    aliases: ["assembly_method"],
    strategy: "categorical",
  },
  {
    group: "sample-bioinfo",
    expectedProperty: "annotation_software_name",
    displayName: "annotation_software_name",
    chartTitle: "Samples by annotation software",
    aliases: ["annotation_software_name"],
    strategy: "categorical",
  },
  {
    group: "sample-bioinfo",
    expectedProperty: "reads_genome_coverage_value",
    displayName: "reads_genome_coverage_value",
    chartTitle: "Samples by coverage bucket",
    aliases: ["reads_genome_coverage_value"],
    strategy: "coverage",
  },
  {
    group: "host-information",
    expectedProperty: "host_age_years",
    displayName: "host_age_years",
    chartTitle: "Samples by host age group",
    aliases: ["host_age_years"],
    strategy: "age",
  },
  {
    group: "host-information",
    expectedProperty: "host_gender",
    displayName: "host_gender",
    chartTitle: "Samples by host gender",
    aliases: ["host_gender"],
    strategy: "categorical",
  },
  {
    group: "host-information",
    expectedProperty: "host_common_name",
    displayName: "host_common_name",
    chartTitle: "Samples by host common name",
    aliases: ["host_common_name"],
    strategy: "categorical",
  },
  {
    group: "host-information",
    expectedProperty: "infection_type",
    displayName: "infection_type",
    chartTitle: "Samples by infection type",
    aliases: ["infection_type"],
    strategy: "categorical",
  },
  {
    group: "host-information",
    expectedProperty: "exposure_setting",
    displayName: "exposure_setting",
    chartTitle: "Samples by exposure setting",
    aliases: ["exposure_setting"],
    strategy: "categorical",
  },
  {
    group: "host-information",
    expectedProperty: "Associated with outbreak",
    displayName: "Associated with outbreak",
    chartTitle: "Samples associated with outbreak",
    aliases: ["Associated with outbreak"],
    strategy: "categorical",
  },
];
