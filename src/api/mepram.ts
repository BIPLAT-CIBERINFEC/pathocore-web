import { PathocoreApiClient } from "@/api/client";
import { formatInteger, stripOntology, truncateLabel } from "@/lib/format";
import type {
  ApiCountItem,
  UseCaseIsolateExplorerFilterOptionsResponse,
  UseCaseIsolateExplorerRowResponse,
  UseCaseDataSummaryResponse,
  UseCaseGeographyRegionResponse,
  UseCaseGroupedTimeSeriesResponse,
} from "@/types/api";
import type { ChartDatum, KpiStat } from "@/types/databrowser";
import type {
  MepramAmrGeneRecord,
  MepramExplorerFilterOptions,
  MepramExplorerRow,
  MepramMultiSeriesChart,
  MepramOverviewData,
  MepramSnapshot,
  MepramTerritorialCoverageRegion,
} from "@/types/mepram";

const PROJECT_NAME = "mepram";
const MEPRAM_DATA_MODE =
  import.meta.env.VITE_USE_CASE_DATA_MODE?.trim().toLowerCase() ||
  import.meta.env.VITE_MEPRAM_DATA_MODE?.trim().toLowerCase() ||
  "simulated";
const SIMULATED_ANNUAL_PATHOGEN_SERIES: MepramMultiSeriesChart = {
  data: [
    {
      label: "2022",
      klebsiella: 42,
      ecoli: 21,
      enterobacter: 12,
      acinetobacter: 8,
    },
    {
      label: "2023",
      klebsiella: 56,
      ecoli: 29,
      enterobacter: 16,
      acinetobacter: 11,
    },
    {
      label: "2024",
      klebsiella: 71,
      ecoli: 34,
      enterobacter: 20,
      acinetobacter: 15,
    },
    {
      label: "2025",
      klebsiella: 89,
      ecoli: 40,
      enterobacter: 27,
      acinetobacter: 18,
    },
  ],
  simulated: true,
  series: [
    { color: "#0f766e", key: "klebsiella", label: "K. pneumoniae" },
    { color: "#2563eb", key: "ecoli", label: "E. coli" },
    { color: "#7c3aed", key: "enterobacter", label: "E. cloacae" },
    { color: "#ea580c", key: "acinetobacter", label: "A. baumannii" },
  ],
};
const SIMULATED_RESISTANCE_SIGNALS: MepramMultiSeriesChart = {
  data: [
    {
      label: "2022",
      klebsiella: 44,
      ecoli: 18,
      enterobacter: 22,
      acinetobacter: 16,
    },
    {
      label: "2023",
      klebsiella: 48,
      ecoli: 17,
      enterobacter: 21,
      acinetobacter: 14,
    },
    {
      label: "2024",
      klebsiella: 52,
      ecoli: 16,
      enterobacter: 19,
      acinetobacter: 13,
    },
    {
      label: "2025",
      klebsiella: 57,
      ecoli: 14,
      enterobacter: 17,
      acinetobacter: 12,
    },
  ],
  simulated: true,
  series: [
    {
      color: "#0f766e",
      key: "klebsiella",
      label: "OXA-48 / KPC linked K. pneumoniae",
    },
    { color: "#2563eb", key: "ecoli", label: "NDM / ESBL linked E. coli" },
    { color: "#7c3aed", key: "enterobacter", label: "VIM linked E. cloacae" },
    {
      color: "#ea580c",
      key: "acinetobacter",
      label: "OXA-23 linked A. baumannii",
    },
  ],
};
const SIMULATED_TERRITORIAL_COVERAGE: MepramTerritorialCoverageRegion[] = [
  {
    centers: 4,
    dominantPathogen: "K. pneumoniae",
    hospitals: 7,
    label: "Galicia",
    notes: ["Entrada intermitente de aislamientos carbapenemasa positivos."],
    regionCode: "galicia",
    samples: 26,
    simulated: true,
    topResistanceSignal: "OXA-48",
    x: 17,
    y: 28,
  },
  {
    centers: 6,
    dominantPathogen: "K. pneumoniae",
    hospitals: 9,
    label: "Comunidad de Madrid",
    notes: ["Mayor densidad de aislamientos XDR en la simulación."],
    regionCode: "madrid",
    samples: 84,
    simulated: true,
    topResistanceSignal: "KPC-3",
    x: 43,
    y: 48,
  },
  {
    centers: 5,
    dominantPathogen: "E. coli",
    hospitals: 8,
    label: "Cataluña",
    notes: ["Incremento sostenido de genes NDM en hospitales terciarios."],
    regionCode: "cataluna",
    samples: 69,
    simulated: true,
    topResistanceSignal: "NDM-5",
    x: 74,
    y: 27,
  },
  {
    centers: 3,
    dominantPathogen: "A. baumannii",
    hospitals: 5,
    label: "Comunitat Valenciana",
    notes: ["Mayor peso de clones asociados a UCI en la simulación."],
    regionCode: "valencia",
    samples: 51,
    simulated: true,
    topResistanceSignal: "OXA-23",
    x: 71,
    y: 56,
  },
  {
    centers: 7,
    dominantPathogen: "K. pneumoniae",
    hospitals: 11,
    label: "Andalucía",
    notes: ["Alta cobertura de centros remitentes en el sur."],
    regionCode: "andalucia",
    samples: 92,
    simulated: true,
    topResistanceSignal: "OXA-48",
    x: 46,
    y: 79,
  },
  {
    centers: 2,
    dominantPathogen: "E. cloacae",
    hospitals: 4,
    label: "País Vasco",
    notes: ["Señales esporádicas de VIM en Enterobacterales."],
    regionCode: "pais-vasco",
    samples: 18,
    simulated: true,
    topResistanceSignal: "VIM-1",
    x: 57,
    y: 18,
  },
];

function numericHash(value: string) {
  return Array.from(value).reduce((hash, character) => {
    return (hash * 31 + character.charCodeAt(0)) % 2147483647;
  }, 7);
}

function pickFromSeed(seed: string, options: string[], offset = 0) {
  return options[(numericHash(`${seed}:${offset}`) + offset) % options.length];
}

function amrRecord(
  gene: string,
  allele: string,
  classification: string,
  origin: string,
): MepramAmrGeneRecord {
  return {
    allele,
    classification,
    gene,
    label: `${gene} > ${allele}`,
    origin,
  };
}

interface SimulatedRegionBlueprint {
  amrRecords: MepramAmrGeneRecord[];
  centers: string[];
  infectionTypes: string[];
  pathogens: string[];
  provinces: string[];
  region: string;
  sampleCount: number;
  sequenceTypeSchemes: string[];
  sequenceTypes: string[];
  sequencingPlatforms: string[];
}

const SIMULATED_SPECIMEN_SOURCES = [
  "Blood",
  "Urine",
  "Respiratory tract",
  "Rectal swab",
  "Wound",
];

const SIMULATED_REGION_BLUEPRINTS: SimulatedRegionBlueprint[] = [
  {
    amrRecords: [
      amrRecord("KPC", "blaKPC-3", "Bla_Carb", "isciii"),
      amrRecord("OXA", "blaOXA-48", "Bla_Carb", "isciii"),
      amrRecord("CTX-M", "blaCTX-M-15", "Bla_ESBL", "submitting"),
    ],
    centers: ["H. La Paz", "H. 12 de Octubre", "Ramón y Cajal"],
    infectionTypes: ["Bloodstream infection", "Urinary tract infection"],
    pathogens: ["K. pneumoniae", "E. coli", "A. baumannii"],
    provinces: ["Madrid"],
    region: "Comunidad de Madrid",
    sampleCount: 14,
    sequenceTypeSchemes: ["Pasteur", "Oxford"],
    sequenceTypes: ["ST307", "ST512", "ST258", "ST147"],
    sequencingPlatforms: ["Illumina", "Oxford Nanopore"],
  },
  {
    amrRecords: [
      amrRecord("NDM", "blaNDM-5", "Bla_Carb", "isciii"),
      amrRecord("OXA", "blaOXA-48", "Bla_Carb", "submitting"),
      amrRecord("TEM", "blaTEM-52", "Bla_ESBL", "submitting"),
    ],
    centers: ["H. Clínic", "Vall d'Hebron", "Bellvitge"],
    infectionTypes: ["Urinary tract infection", "Respiratory infection"],
    pathogens: ["E. coli", "K. pneumoniae", "A. baumannii"],
    provinces: ["Barcelona", "Girona"],
    region: "Cataluña",
    sampleCount: 12,
    sequenceTypeSchemes: ["Achtman", "Pasteur"],
    sequenceTypes: ["ST131", "ST405", "ST307", "ST15"],
    sequencingPlatforms: ["Illumina", "Illumina", "Oxford Nanopore"],
  },
  {
    amrRecords: [
      amrRecord("OXA", "blaOXA-48", "Bla_Carb", "isciii"),
      amrRecord("VIM", "blaVIM-1", "Bla_Carb", "submitting"),
      amrRecord("CTX-M", "blaCTX-M-14", "Bla_ESBL", "submitting"),
    ],
    centers: ["CHUAC", "H. Álvaro Cunqueiro"],
    infectionTypes: ["Bloodstream infection", "Surgical site infection"],
    pathogens: ["K. pneumoniae", "E. cloacae", "E. coli"],
    provinces: ["A Coruña", "Pontevedra"],
    region: "Galicia",
    sampleCount: 10,
    sequenceTypeSchemes: ["Pasteur", "Oxford"],
    sequenceTypes: ["ST307", "ST78", "ST15", "ST147"],
    sequencingPlatforms: ["Illumina", "Oxford Nanopore"],
  },
  {
    amrRecords: [
      amrRecord("OXA", "blaOXA-48", "Bla_Carb", "isciii"),
      amrRecord("KPC", "blaKPC-3", "Bla_Carb", "submitting"),
      amrRecord("SHV", "blaSHV-12", "Bla_ESBL", "submitting"),
    ],
    centers: ["Virgen del Rocío", "Reina Sofía", "Regional de Málaga"],
    infectionTypes: ["Bloodstream infection", "Respiratory infection"],
    pathogens: ["K. pneumoniae", "E. coli", "E. cloacae"],
    provinces: ["Sevilla", "Córdoba", "Málaga"],
    region: "Andalucía",
    sampleCount: 16,
    sequenceTypeSchemes: ["Pasteur", "Oxford"],
    sequenceTypes: ["ST307", "ST512", "ST15", "ST147"],
    sequencingPlatforms: ["Illumina", "Oxford Nanopore"],
  },
  {
    amrRecords: [
      amrRecord("OXA", "blaOXA-23", "Bla_Carb", "isciii"),
      amrRecord("OXA", "blaOXA-48", "Bla_Carb", "submitting"),
      amrRecord("TEM", "blaTEM-24", "Bla_ESBL", "submitting"),
    ],
    centers: ["La Fe", "Hospital General de Alicante"],
    infectionTypes: ["Respiratory infection", "Wound infection"],
    pathogens: ["A. baumannii", "K. pneumoniae", "E. coli"],
    provinces: ["Valencia/València", "Alicante/Alacant"],
    region: "Comunitat Valenciana",
    sampleCount: 9,
    sequenceTypeSchemes: ["Pasteur", "Oxford"],
    sequenceTypes: ["ST2", "ST307", "ST15", "ST405"],
    sequencingPlatforms: ["Illumina", "Oxford Nanopore"],
  },
  {
    amrRecords: [
      amrRecord("VIM", "blaVIM-1", "Bla_Carb", "isciii"),
      amrRecord("OXA", "blaOXA-48", "Bla_Carb", "submitting"),
      amrRecord("CTX-M", "blaCTX-M-27", "Bla_ESBL", "submitting"),
    ],
    centers: ["H. Donostia", "H. Cruces"],
    infectionTypes: ["Bloodstream infection", "Urinary tract infection"],
    pathogens: ["E. cloacae", "K. pneumoniae", "E. coli"],
    provinces: ["Gipuzkoa", "Bizkaia"],
    region: "País Vasco",
    sampleCount: 7,
    sequenceTypeSchemes: ["Pasteur", "Oxford"],
    sequenceTypes: ["ST78", "ST307", "ST11", "ST15"],
    sequencingPlatforms: ["Illumina", "Oxford Nanopore"],
  },
];

function sanitizeValue(value: string | null | undefined) {
  if (!value) {
    return null;
  }

  const stripped = stripOntology(value)
    .replace(/\bNot Provided\b/gi, "")
    .replace(/\s*,\s*,/g, ", ")
    .replace(/\s{2,}/g, " ")
    .replace(/(^,\s*|\s*,\s*$)/g, "")
    .trim();

  return stripped || null;
}

function chartItems(
  items: ApiCountItem[] | undefined,
  { truncate = false }: { truncate?: boolean } = {},
): ChartDatum[] {
  return (items ?? []).map((item) => {
    const sanitized = sanitizeValue(item.label) ?? item.label;

    return {
      label: truncate ? truncateLabel(sanitized) : sanitized,
      value: item.value,
    };
  });
}

function groupedSeriesFromUseCase(
  series: UseCaseGroupedTimeSeriesResponse | undefined,
): MepramMultiSeriesChart {
  if (!series) {
    return { data: [], series: [], simulated: false };
  }

  return {
    data: series.values.map((item) => ({ ...item, label: String(item.label) })),
    series: series.series,
    simulated: series.simulated,
  };
}

function coordinateFromLongitude(longitude: number) {
  return Math.min(88, Math.max(12, ((longitude + 9.5) / 13.5) * 100));
}

function coordinateFromLatitude(latitude: number) {
  return Math.min(88, Math.max(12, ((44.5 - latitude) / 9) * 100));
}

function regionCoordinate(
  region: UseCaseGeographyRegionResponse,
  axis: "x" | "y",
  fallback: number,
) {
  const rawValue = axis === "x" ? region.x : region.y;

  if (typeof rawValue === "number" && rawValue > 0) {
    return rawValue;
  }

  if (axis === "x" && typeof region.geo?.lon === "number") {
    return coordinateFromLongitude(region.geo.lon);
  }

  if (axis === "y" && typeof region.geo?.lat === "number") {
    return coordinateFromLatitude(region.geo.lat);
  }

  return fallback;
}

function territorialCoverageRegion(
  region: UseCaseGeographyRegionResponse,
  index: number,
): MepramTerritorialCoverageRegion {
  return {
    centers: region.centers,
    dominantPathogen: region.dominant_pathogen,
    hospitals: region.hospitals,
    label: region.label,
    notes: region.notes,
    regionCode: region.region_code || `region-${index + 1}`,
    samples: region.samples,
    simulated: region.simulated,
    topResistanceSignal: region.top_resistance_signal,
    x: regionCoordinate(region, "x", 18 + ((index * 17) % 64)),
    y: regionCoordinate(region, "y", 22 + ((index * 13) % 58)),
  };
}

function missingOperationalFields(summary: UseCaseDataSummaryResponse) {
  const value = summary.data_quality.missing_operational_fields;

  return Array.isArray(value)
    ? value.filter((item): item is string => typeof item === "string")
    : [];
}

function overviewFromUseCaseSummary(
  summary: UseCaseDataSummaryResponse,
): MepramOverviewData {
  const pathogensByYear = summary.time_series.pathogens_by_year;
  const resistanceSignalsByYear =
    summary.time_series.resistance_signals_by_year;
  const samplesByMonth = summary.time_series.samples_by_month;
  const territorialCoverage = summary.geography.regions.map(
    territorialCoverageRegion,
  );

  return {
    analyzedSamples: summary.metrics.analyzed_samples,
    annualPathogenSeries:
      pathogensByYear?.kind === "grouped_time_series"
        ? groupedSeriesFromUseCase(pathogensByYear)
        : { data: [], series: [], simulated: false },
    centers: chartItems(summary.dimensions.center?.values, { truncate: true }),
    collectionTimeline:
      samplesByMonth?.kind === "time_series"
        ? chartItems(samplesByMonth.values)
        : [],
    collectingRegions: chartItems(summary.dimensions.collecting_region?.values),
    infectionTypes: chartItems(summary.dimensions.infection_type?.values, {
      truncate: true,
    }),
    kpis: kpis({
      analyzedSamples: summary.metrics.analyzed_samples,
      centerCount: summary.metrics.participating_centers,
      overviewSampleCount: summary.metrics.total_samples,
      regionCount: summary.metrics.participating_regions,
    }),
    notes: [
      "Datos agregados desde el endpoint cacheado de casos de uso de PathoCore API.",
      ...missingOperationalFields(summary).map(
        (field) => `Campo operativo pendiente o con baja cobertura: ${field}.`,
      ),
    ],
    participatingCenters: summary.metrics.participating_centers,
    participatingRegions: summary.metrics.participating_regions,
    pathogenDistributionSimulated: false,
    projectPathogenDistribution: chartItems(
      summary.dimensions.pathogen?.values,
      {
        truncate: true,
      },
    ),
    resistanceSignalsSeries:
      resistanceSignalsByYear?.kind === "grouped_time_series"
        ? groupedSeriesFromUseCase(resistanceSignalsByYear)
        : { data: [], series: [], simulated: false },
    sequencingPlatforms: chartItems(
      summary.dimensions.sequencing_platform?.values,
      {
        truncate: true,
      },
    ),
    specimenSources: chartItems(summary.dimensions.specimen_source?.values, {
      truncate: true,
    }),
    specimenSourcesSimulated: false,
    submittingRegions: chartItems(summary.dimensions.submitting_region?.values),
    territorialCoverage,
    territorialCoverageSimulated: false,
    totalSamples: summary.metrics.total_samples,
  };
}

function sortValues(values: Array<string | null>) {
  return Array.from(
    new Set(values.filter((value): value is string => Boolean(value))),
  ).sort((left, right) => left.localeCompare(right, "es"));
}

function explorerFilterOptions(
  rows: MepramExplorerRow[],
): MepramExplorerFilterOptions {
  const collectionDates = sortValues(rows.map((row) => row.collectionDate));
  const amrRecords = rows.flatMap((row) => row.amrGeneRecords);

  return {
    autonomousCommunities: sortValues(rows.map((row) => row.region)),
    alleles: sortValues(amrRecords.map((record) => record.allele)),
    blaGroups: sortValues(
      amrRecords.map((record) => {
        const classification = record.classification
          ?.toLowerCase()
          .replace("-", "_");

        if (classification === "bla_carb") {
          return "bla_carb";
        }
        if (classification?.startsWith("bla_esbl")) {
          return "bla_esbl";
        }

        return null;
      }),
    ),
    centers: sortValues(rows.map((row) => row.submittingInstitution)),
    classifications: sortValues(
      amrRecords.map((record) => record.classification),
    ),
    collectionDateMax:
      collectionDates.length > 0
        ? collectionDates[collectionDates.length - 1]
        : null,
    collectionDateMin: collectionDates[0] ?? null,
    genes: sortValues(amrRecords.map((record) => record.gene)),
    infectionTypes: sortValues(rows.map((row) => row.infectionType)),
    pathogens: sortValues(rows.map((row) => row.pathogen)),
    provinces: sortValues(rows.map((row) => row.province)),
    sequenceTypes: sortValues(rows.map((row) => row.sequenceType)),
  };
}

function explorerFilterOptionsFromApi(
  options: UseCaseIsolateExplorerFilterOptionsResponse,
): MepramExplorerFilterOptions {
  return {
    autonomousCommunities: options.autonomous_communities ?? [],
    alleles: options.alleles ?? [],
    blaGroups: options.bla_groups ?? [],
    centers: options.centers ?? [],
    classifications: options.classifications ?? [],
    collectionDateMax: options.collection_date_max ?? null,
    collectionDateMin: options.collection_date_min ?? null,
    genes: options.genes ?? [],
    infectionTypes: options.infection_types ?? [],
    pathogens: options.pathogens ?? [],
    provinces: options.provinces ?? [],
    sequenceTypes: options.sequence_types ?? [],
  };
}

function explorerRowFromApi(
  row: UseCaseIsolateExplorerRowResponse,
): MepramExplorerRow {
  return {
    amrAllele: row.amr_allele,
    amrClassification: row.amr_classification,
    amrGene: row.amr_gene,
    amrGeneRecords: row.amr_gene_records ?? [],
    blaCarb: row.bla_carb,
    blaEsbl: row.bla_esbl,
    collectionDate: row.collection_date,
    collectingProvince: row.collecting_province,
    collectingRegion: row.collecting_region,
    dataOrigin: row.data_origin,
    host: row.host,
    infectionType: row.infection_type,
    isSequenced: row.is_sequenced ?? false,
    isolateDeliveryType: row.isolate_delivery_type,
    pathogen: row.pathogen,
    pathogenOrigin: row.pathogen_origin,
    province: row.province,
    region: row.region,
    sampleId: row.sample_unique_id,
    sequenceType: row.sequence_type,
    sequenceTypeSchemes: row.sequence_type_schemes ?? [],
    sequencingStatus:
      row.sequencing_status ?? (row.is_sequenced ? "Sequenced" : "Not sequenced"),
    sequencingSampleId: row.sequencing_sample_id,
    species: row.species,
    speciesGroup: row.species_group,
    submittingInstitution: row.submitting_institution,
    submittingProvince: row.submitting_province,
    submittingRegion: row.submitting_region,
  };
}

function counts(values: Array<string | null>, limit?: number): ChartDatum[] {
  const entries = Array.from(
    values
      .filter((value): value is string => Boolean(value))
      .reduce(
        (map, value) => map.set(value, (map.get(value) ?? 0) + 1),
        new Map<string, number>(),
      )
      .entries(),
  )
    .sort((left, right) => right[1] - left[1])
    .map(([label, value]) => ({ label, value }));

  return typeof limit === "number" ? entries.slice(0, limit) : entries;
}

function monthlyTimeline(rows: MepramExplorerRow[]): ChartDatum[] {
  return Array.from(
    rows
      .map((row) => row.collectionDate?.slice(0, 7) ?? null)
      .filter((value): value is string => Boolean(value))
      .reduce(
        (map, value) => map.set(value, (map.get(value) ?? 0) + 1),
        new Map<string, number>(),
      )
      .entries(),
  )
    .sort((left, right) => left[0].localeCompare(right[0]))
    .map(([label, value]) => ({ label, value }));
}

function recordsForSeed(seed: string, records: MepramAmrGeneRecord[]) {
  const primary = records[numericHash(`${seed}:amr`) % records.length];
  const secondary = records[(numericHash(`${seed}:amr-secondary`) + 1) % records.length];

  if (primary.label === secondary.label) {
    return [primary];
  }

  return [primary, secondary].sort((left, right) =>
    (left.gene ?? "").localeCompare(right.gene ?? "", "es"),
  );
}

function recordSummary(
  records: MepramAmrGeneRecord[],
  field: keyof Pick<MepramAmrGeneRecord, "allele" | "classification" | "gene">,
) {
  return sortValues(records.map((record) => record[field])).join(", ") || null;
}

function bucketSummary(records: MepramAmrGeneRecord[], bucket: "bla_carb" | "bla_esbl") {
  const values = records
    .filter((record) => {
      const classification = record.classification?.toLowerCase().replace("-", "_");

      return bucket === "bla_carb"
        ? classification === "bla_carb"
        : classification?.startsWith("bla_esbl");
    })
    .map((record) => record.label);

  return sortValues(values).join(", ") || null;
}

function buildSimulatedExplorerRows(): MepramExplorerRow[] {
  let counter = 1;

  return SIMULATED_REGION_BLUEPRINTS.flatMap((blueprint, regionIndex) =>
    Array.from({ length: blueprint.sampleCount }, (_, sampleIndex) => {
      const sampleNumber = String(counter++).padStart(4, "0");
      const month = ((regionIndex * 2 + sampleIndex) % 12) + 1;
      const day = ((sampleIndex * 3) % 27) + 1;
      const year = 2024 + ((sampleIndex + regionIndex) % 2);
      const seed = `${blueprint.region}-${sampleNumber}`;
      const isSequenced = numericHash(`${seed}:sequenced`) % 4 !== 0;
      const selectedPathogen = pickFromSeed(seed, blueprint.pathogens, 3);
      const records = isSequenced ? recordsForSeed(seed, blueprint.amrRecords) : [];
      const species = isSequenced ? selectedPathogen : null;
      const speciesGroup = isSequenced ? null : `${selectedPathogen} group`;

      return {
        amrAllele: recordSummary(records, "allele"),
        amrClassification: recordSummary(records, "classification"),
        amrGene: recordSummary(records, "gene"),
        amrGeneRecords: records,
        blaCarb: bucketSummary(records, "bla_carb"),
        blaEsbl: bucketSummary(records, "bla_esbl"),
        collectionDate: `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`,
        collectingProvince: pickFromSeed(seed, blueprint.provinces, 9),
        collectingRegion: blueprint.region,
        dataOrigin: isSequenced ? "isciii" : "submitting",
        host: "Human",
        infectionType: pickFromSeed(seed, blueprint.infectionTypes, 2),
        isSequenced,
        isolateDeliveryType: "Culture isolate",
        pathogen: species ?? speciesGroup,
        pathogenOrigin: isSequenced ? "isciii" : "submitting",
        province: pickFromSeed(seed, blueprint.provinces, 9),
        region: blueprint.region,
        sampleId: `MEP-SIM-${sampleNumber}`,
        sequenceType: isSequenced
          ? pickFromSeed(seed, blueprint.sequenceTypes, 5)
          : null,
        sequenceTypeSchemes: isSequenced
          ? [pickFromSeed(seed, blueprint.sequenceTypeSchemes, 8)]
          : [],
        sequencingStatus: isSequenced ? "Sequenced" : "Not sequenced",
        sequencingSampleId: `SEQ-SIM-${sampleNumber}`,
        species,
        speciesGroup,
        submittingInstitution: pickFromSeed(seed, blueprint.centers, 7),
        submittingProvince: pickFromSeed(seed, blueprint.provinces, 9),
        submittingRegion: blueprint.region,
      };
    }),
  ).sort((left, right) =>
    (right.collectionDate ?? "").localeCompare(left.collectionDate ?? ""),
  );
}

function buildSimulatedMepramSnapshot(): MepramSnapshot {
  const rows = buildSimulatedExplorerRows();
  const regionCount = new Set(rows.map((row) => row.region).filter(Boolean))
    .size;
  const centerCount = new Set(
    rows
      .map((row) => row.submittingInstitution)
      .filter((value): value is string => Boolean(value)),
  ).size;
  const analyzedSamples = Math.max(rows.length - 4, 0);

  return {
    explorer: {
      filterOptions: explorerFilterOptions(rows),
      notes: [
        "La vista del caso de uso está funcionando en modo simulado para no bloquear el desarrollo mientras se construyen endpoints ad hoc de vigilancia.",
        "Los filtros, la tabla y el mapa usan el mismo dataset sintético coherente para revisión funcional y visual.",
        "Cuando backend exponga project-status, surveillance-snapshot e isolates/search, este modo podrá sustituirse por datos reales.",
      ],
      operationalFieldsSimulated: true,
      rows,
      totalLoaded: rows.length,
    },
    generatedAt: new Date().toISOString(),
    integrationGaps: [
      "Falta un endpoint específico de estado del caso de uso para KPIs y snapshot de vigilancia.",
      "Falta un explorer backend paginado por ST, patógeno, carbapenemasa y genes AMR sin N+1 por muestra.",
      "Falta una salida backend para exportar subconjuntos filtrados y abrirlos en Microreact.",
    ],
    overview: {
      analyzedSamples,
      annualPathogenSeries: SIMULATED_ANNUAL_PATHOGEN_SERIES,
      centers: counts(
        rows.map((row) => row.submittingInstitution),
        8,
      ),
      collectionTimeline: monthlyTimeline(rows),
      collectingRegions: counts(rows.map((row) => row.collectingRegion)),
      infectionTypes: counts(rows.map((row) => row.infectionType)),
      kpis: kpis({
        analyzedSamples,
        centerCount,
        overviewSampleCount: rows.length,
        regionCount,
      }),
      notes: [
        "Este caso de uso se muestra en simulación controlada para seguir iterando frontend sin depender todavía de endpoints específicos de vigilancia.",
        "Los paneles mantienen coherencia interna con la tabla y el mapa del explorer, pero no deben interpretarse como datos reales.",
      ],
      participatingCenters: centerCount,
      participatingRegions: regionCount,
      pathogenDistributionSimulated: true,
      projectPathogenDistribution: counts(rows.map((row) => row.pathogen)),
      resistanceSignalsSeries: SIMULATED_RESISTANCE_SIGNALS,
      sequencingPlatforms: [],
      specimenSources: counts(
        rows.map((row) =>
          pickFromSeed(row.sampleId, SIMULATED_SPECIMEN_SOURCES, 9),
        ),
      ),
      specimenSourcesSimulated: true,
      submittingRegions: counts(rows.map((row) => row.submittingRegion)),
      territorialCoverage: SIMULATED_TERRITORIAL_COVERAGE,
      territorialCoverageSimulated: true,
      totalSamples: rows.length,
    },
    projectLabel: "Caso de uso pendiente",
  };
}

function kpis({
  analyzedSamples,
  centerCount,
  overviewSampleCount,
  regionCount,
}: {
  analyzedSamples: number;
  centerCount: number;
  overviewSampleCount: number;
  regionCount: number;
}): KpiStat[] {
  return [
    {
      label: "Muestras disponibles",
      note: "Muestras visibles del caso de uso",
      value: formatInteger(overviewSampleCount),
    },
    {
      label: "Muestras analizadas",
      note: "Muestras con evidencia de procesamiento bioinformático",
      value: formatInteger(analyzedSamples),
    },
    {
      label: "CCAA participantes",
      note: "Comunidades autónomas detectadas en la capa visible",
      value: formatInteger(regionCount),
    },
    {
      label: "Centros implicados",
      note: "Hospitales o centros con al menos una muestra",
      value: formatInteger(centerCount),
    },
  ];
}

async function loadLiveMepramSnapshot(
  accessToken: string | null,
): Promise<MepramSnapshot> {
  const client = new PathocoreApiClient({ accessToken });
  const [summary, explorerResponse] = await Promise.all([
    client.getUseCaseDataSummary(PROJECT_NAME),
    client.getUseCaseIsolateExplorer(PROJECT_NAME),
  ]);
  const rows = explorerResponse.rows.map(explorerRowFromApi);

  return {
    explorer: {
      filterOptions: explorerFilterOptionsFromApi(
        explorerResponse.filter_options,
      ),
      notes: [
        "Explorer alimentado desde /use-cases/isolate-explorer con filas normalizadas por proyecto.",
        ...explorerResponse.notes,
      ],
      operationalFieldsSimulated: false,
      rows,
      totalLoaded: explorerResponse.matched_samples,
    },
    generatedAt: summary.generated_at,
    integrationGaps: [],
    overview: overviewFromUseCaseSummary(summary),
    projectLabel: summary.project.label,
  };
}

export async function loadMepramSnapshot(
  accessToken: string | null,
): Promise<MepramSnapshot> {
  if (MEPRAM_DATA_MODE !== "live") {
    return buildSimulatedMepramSnapshot();
  }

  return loadLiveMepramSnapshot(accessToken);
}
