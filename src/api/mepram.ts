import { PathocoreApiClient } from "@/api/client";
import { formatInteger, stripOntology, truncateLabel } from "@/lib/format";
import type {
  ApiCountItem,
  ApiCredentials,
  DatabrowserPropertyDistributionResponse,
  SampleListItem,
  SampleMetadataApiItem,
} from "@/types/api";
import type { ChartDatum, KpiStat } from "@/types/databrowser";
import type {
  MepramExplorerFilterOptions,
  MepramExplorerRow,
  MepramMultiSeriesChart,
  MepramSnapshot,
  MepramTerritorialCoverageRegion,
} from "@/types/mepram";

const PROJECT_NAME = "mepram";
const SAMPLE_PAGE_SIZE = 50;
const MEPRAM_DATA_MODE =
  import.meta.env.VITE_USE_CASE_DATA_MODE?.trim().toLowerCase() ||
  import.meta.env.VITE_MEPRAM_DATA_MODE?.trim().toLowerCase() ||
  "simulated";
const SIMULATED_PATHOGEN_DISTRIBUTION: ChartDatum[] = [
  { label: "K. pneumoniae", value: 184 },
  { label: "E. coli", value: 96 },
  { label: "E. cloacae", value: 58 },
  { label: "A. baumannii", value: 37 },
  { label: "Other", value: 24 },
];
const SIMULATED_ANNUAL_PATHOGEN_SERIES: MepramMultiSeriesChart = {
  data: [
    { label: "2022", klebsiella: 42, ecoli: 21, enterobacter: 12, acinetobacter: 8 },
    { label: "2023", klebsiella: 56, ecoli: 29, enterobacter: 16, acinetobacter: 11 },
    { label: "2024", klebsiella: 71, ecoli: 34, enterobacter: 20, acinetobacter: 15 },
    { label: "2025", klebsiella: 89, ecoli: 40, enterobacter: 27, acinetobacter: 18 },
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
    { label: "2022", klebsiella: 44, ecoli: 18, enterobacter: 22, acinetobacter: 16 },
    { label: "2023", klebsiella: 48, ecoli: 17, enterobacter: 21, acinetobacter: 14 },
    { label: "2024", klebsiella: 52, ecoli: 16, enterobacter: 19, acinetobacter: 13 },
    { label: "2025", klebsiella: 57, ecoli: 14, enterobacter: 17, acinetobacter: 12 },
  ],
  simulated: true,
  series: [
    { color: "#0f766e", key: "klebsiella", label: "OXA-48 / KPC linked K. pneumoniae" },
    { color: "#2563eb", key: "ecoli", label: "NDM / ESBL linked E. coli" },
    { color: "#7c3aed", key: "enterobacter", label: "VIM linked E. cloacae" },
    { color: "#ea580c", key: "acinetobacter", label: "OXA-23 linked A. baumannii" },
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

interface SimulatedOperationalProfile {
  carbapenemases: string[];
  pathogens: string[];
  resistanceProfiles: string[];
  sequenceTypes: string[];
}

const DEFAULT_OPERATIONAL_PROFILE: SimulatedOperationalProfile = {
  carbapenemases: ["OXA-48", "KPC-3", "NDM-5", "VIM-1", "IMP-8"],
  pathogens: ["K. pneumoniae", "E. coli", "E. cloacae", "A. baumannii"],
  resistanceProfiles: [
    "Carbapenem-resistant",
    "XDR",
    "MDR",
    "ESBL + carbapenemase",
  ],
  sequenceTypes: ["ST307", "ST512", "ST147", "ST11", "ST15", "ST78"],
};

const REGIONAL_OPERATIONAL_PROFILES: Record<string, SimulatedOperationalProfile> = {
  andalucia: {
    carbapenemases: ["OXA-48", "KPC-3", "NDM-5"],
    pathogens: ["K. pneumoniae", "E. coli", "E. cloacae"],
    resistanceProfiles: ["Carbapenem-resistant", "XDR", "MDR"],
    sequenceTypes: ["ST307", "ST512", "ST15", "ST147"],
  },
  cataluna: {
    carbapenemases: ["NDM-5", "OXA-48", "VIM-1"],
    pathogens: ["E. coli", "K. pneumoniae", "A. baumannii"],
    resistanceProfiles: ["ESBL + carbapenemase", "Carbapenem-resistant", "MDR"],
    sequenceTypes: ["ST405", "ST131", "ST15", "ST307"],
  },
  galicia: {
    carbapenemases: ["OXA-48", "VIM-1", "KPC-3"],
    pathogens: ["K. pneumoniae", "E. cloacae", "E. coli"],
    resistanceProfiles: ["Carbapenem-resistant", "MDR", "XDR"],
    sequenceTypes: ["ST307", "ST78", "ST15", "ST147"],
  },
  madrid: {
    carbapenemases: ["KPC-3", "OXA-48", "NDM-5"],
    pathogens: ["K. pneumoniae", "E. coli", "A. baumannii"],
    resistanceProfiles: ["XDR", "Carbapenem-resistant", "Colistin co-resistance"],
    sequenceTypes: ["ST307", "ST512", "ST258", "ST147"],
  },
  pais_vasco: {
    carbapenemases: ["VIM-1", "OXA-48", "KPC-3"],
    pathogens: ["E. cloacae", "K. pneumoniae", "E. coli"],
    resistanceProfiles: ["MDR", "Carbapenem-resistant", "XDR"],
    sequenceTypes: ["ST78", "ST307", "ST11", "ST15"],
  },
  valencia: {
    carbapenemases: ["OXA-23", "OXA-48", "NDM-5"],
    pathogens: ["A. baumannii", "K. pneumoniae", "E. coli"],
    resistanceProfiles: ["XDR", "Carbapenem-resistant", "MDR"],
    sequenceTypes: ["ST2", "ST307", "ST15", "ST405"],
  },
};

function normalizeRegionKey(value: string | null | undefined) {
  if (!value) {
    return "";
  }

  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[()]/g, "")
    .replace(/\s+/g, " ")
    .trim()
    .replace("comunidad de madrid", "madrid")
    .replace("comunidad valenciana", "valencia")
    .replace("comunitat valenciana", "valencia")
    .replace("region de murcia", "murcia")
    .replace("comunidad foral de navarra", "navarra")
    .replace("pais vasco", "pais_vasco")
    .replace("castilla y leon", "castilla_y_leon")
    .replace("castilla la mancha", "castilla_la_mancha")
    .replace(/\s+/g, "_");
}

function numericHash(value: string) {
  return Array.from(value).reduce((hash, character) => {
    return (hash * 31 + character.charCodeAt(0)) % 2147483647;
  }, 7);
}

function pickFromSeed(seed: string, options: string[], offset = 0) {
  return options[(numericHash(`${seed}:${offset}`) + offset) % options.length];
}

interface SimulatedRegionBlueprint {
  carbapenemases: string[];
  centers: string[];
  infectionTypes: string[];
  pathogens: string[];
  region: string;
  resistanceProfiles: string[];
  sampleCount: number;
  sequenceTypes: string[];
  sequencingPlatforms: string[];
}

const SIMULATED_REGION_BLUEPRINTS: SimulatedRegionBlueprint[] = [
  {
    carbapenemases: ["KPC-3", "OXA-48", "NDM-5"],
    centers: ["H. La Paz", "H. 12 de Octubre", "Ramón y Cajal"],
    infectionTypes: ["Bloodstream infection", "Urinary tract infection"],
    pathogens: ["K. pneumoniae", "E. coli", "A. baumannii"],
    region: "Comunidad de Madrid",
    resistanceProfiles: ["XDR", "Carbapenem-resistant", "Colistin co-resistance"],
    sampleCount: 14,
    sequenceTypes: ["ST307", "ST512", "ST258", "ST147"],
    sequencingPlatforms: ["Illumina", "Oxford Nanopore"],
  },
  {
    carbapenemases: ["NDM-5", "OXA-48", "VIM-1"],
    centers: ["H. Clínic", "Vall d'Hebron", "Bellvitge"],
    infectionTypes: ["Urinary tract infection", "Respiratory infection"],
    pathogens: ["E. coli", "K. pneumoniae", "A. baumannii"],
    region: "Cataluña",
    resistanceProfiles: ["ESBL + carbapenemase", "MDR", "Carbapenem-resistant"],
    sampleCount: 12,
    sequenceTypes: ["ST131", "ST405", "ST307", "ST15"],
    sequencingPlatforms: ["Illumina", "Illumina", "Oxford Nanopore"],
  },
  {
    carbapenemases: ["OXA-48", "VIM-1", "KPC-3"],
    centers: ["CHUAC", "H. Álvaro Cunqueiro"],
    infectionTypes: ["Bloodstream infection", "Surgical site infection"],
    pathogens: ["K. pneumoniae", "E. cloacae", "E. coli"],
    region: "Galicia",
    resistanceProfiles: ["Carbapenem-resistant", "MDR", "XDR"],
    sampleCount: 10,
    sequenceTypes: ["ST307", "ST78", "ST15", "ST147"],
    sequencingPlatforms: ["Illumina", "Oxford Nanopore"],
  },
  {
    carbapenemases: ["OXA-48", "KPC-3", "NDM-5"],
    centers: ["Virgen del Rocío", "Reina Sofía", "Regional de Málaga"],
    infectionTypes: ["Bloodstream infection", "Respiratory infection"],
    pathogens: ["K. pneumoniae", "E. coli", "E. cloacae"],
    region: "Andalucía",
    resistanceProfiles: ["Carbapenem-resistant", "XDR", "MDR"],
    sampleCount: 16,
    sequenceTypes: ["ST307", "ST512", "ST15", "ST147"],
    sequencingPlatforms: ["Illumina", "Oxford Nanopore"],
  },
  {
    carbapenemases: ["OXA-23", "OXA-48", "NDM-5"],
    centers: ["La Fe", "Hospital General de Alicante"],
    infectionTypes: ["Respiratory infection", "Wound infection"],
    pathogens: ["A. baumannii", "K. pneumoniae", "E. coli"],
    region: "Comunitat Valenciana",
    resistanceProfiles: ["XDR", "Carbapenem-resistant", "MDR"],
    sampleCount: 9,
    sequenceTypes: ["ST2", "ST307", "ST15", "ST405"],
    sequencingPlatforms: ["Illumina", "Oxford Nanopore"],
  },
  {
    carbapenemases: ["VIM-1", "OXA-48", "KPC-3"],
    centers: ["H. Donostia", "H. Cruces"],
    infectionTypes: ["Bloodstream infection", "Urinary tract infection"],
    pathogens: ["E. cloacae", "K. pneumoniae", "E. coli"],
    region: "País Vasco",
    resistanceProfiles: ["MDR", "Carbapenem-resistant", "XDR"],
    sampleCount: 7,
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

function metadataToRecord(items: SampleMetadataApiItem[]) {
  const record: Record<string, string | null> = {};

  items.forEach((item) => {
    Object.entries(item).forEach(([key, value]) => {
      record[key] = value;
    });
  });

  return record;
}

function firstDefined(
  record: Record<string, string | null>,
  propertyNames: string[],
): string | null {
  for (const propertyName of propertyNames) {
    const value = sanitizeValue(record[propertyName]);

    if (value) {
      return value;
    }
  }

  return null;
}

function explorerRow(
  sample: SampleListItem,
  metadata: SampleMetadataApiItem[],
): MepramExplorerRow {
  const metadataRecord = metadataToRecord(metadata);

  return {
    carbapenemase: firstDefined(metadataRecord, [
      "carbapenemase_genes",
      "carbapenemase_class_a_test",
      "ESBL_test",
      "mbl_test",
    ]),
    collectionDate:
      firstDefined(metadataRecord, ["sample_collection_date"]) ??
      sample.created_at.slice(0, 10),
    collectingRegion: firstDefined(metadataRecord, [
      "collecting_institution_geo_loc_state",
      "geo_loc_state",
    ]),
    host: firstDefined(metadataRecord, ["host_common_name", "host_scientific_name"]),
    infectionType: firstDefined(metadataRecord, ["infection_type"]),
    isolateDeliveryType: firstDefined(metadataRecord, ["isolate_delivery_type"]),
    pathogen: firstDefined(metadataRecord, ["organism", "species"]),
    region:
      firstDefined(metadataRecord, [
        "collecting_institution_geo_loc_state",
        "geo_loc_state",
      ]) ?? firstDefined(metadataRecord, ["submitting_geo_loc_state"]),
    resistanceProfile: firstDefined(metadataRecord, [
      "ECDC Resistance profile",
      "IDSA Resistance profile",
      "antimicrobial_resistance_profile",
    ]),
    sampleId: sample.sample_unique_id,
    sequenceType: firstDefined(metadataRecord, [
      "st1",
      "st2",
      "mlst_profile",
      "clonal_complex",
      "complex_type",
    ]),
    sequencingPlatform: firstDefined(metadataRecord, [
      "sequencing_instrument_platform",
    ]),
    sequencingSampleId: sample.sequencing_sample_id,
    submittingInstitution: firstDefined(metadataRecord, ["submitting_institution"]),
    submittingRegion: firstDefined(metadataRecord, ["submitting_geo_loc_state"]),
  };
}

function operationalProfileForRow(row: MepramExplorerRow): SimulatedOperationalProfile {
  const normalizedRegion = normalizeRegionKey(
    row.region ?? row.collectingRegion ?? row.submittingRegion,
  );

  return REGIONAL_OPERATIONAL_PROFILES[normalizedRegion] ?? DEFAULT_OPERATIONAL_PROFILE;
}

function enrichExplorerRow(row: MepramExplorerRow): MepramExplorerRow {
  const profile = operationalProfileForRow(row);
  const seed = [
    row.sampleId,
    row.region,
    row.submittingInstitution,
    row.collectionDate,
    row.sequencingPlatform,
  ]
    .filter(Boolean)
    .join("|");

  return {
    ...row,
    carbapenemase: row.carbapenemase ?? pickFromSeed(seed, profile.carbapenemases, 1),
    pathogen: row.pathogen ?? pickFromSeed(seed, profile.pathogens, 2),
    resistanceProfile:
      row.resistanceProfile ?? pickFromSeed(seed, profile.resistanceProfiles, 3),
    sequenceType: row.sequenceType ?? pickFromSeed(seed, profile.sequenceTypes, 4),
  };
}

function sortValues(values: Array<string | null>) {
  return Array.from(new Set(values.filter((value): value is string => Boolean(value)))).sort(
    (left, right) => left.localeCompare(right, "es"),
  );
}

function explorerFilterOptions(rows: MepramExplorerRow[]): MepramExplorerFilterOptions {
  const collectionDates = sortValues(rows.map((row) => row.collectionDate));

  return {
    autonomousCommunities: sortValues(rows.map((row) => row.region)),
    centers: sortValues(rows.map((row) => row.submittingInstitution)),
    collectionDateMax:
      collectionDates.length > 0 ? collectionDates[collectionDates.length - 1] : null,
    collectionDateMin: collectionDates[0] ?? null,
    infectionTypes: sortValues(rows.map((row) => row.infectionType)),
    pathogens: sortValues(rows.map((row) => row.pathogen)),
    resistanceProfiles: sortValues(rows.map((row) => row.resistanceProfile)),
    sequencingPlatforms: sortValues(rows.map((row) => row.sequencingPlatform)),
    sequenceTypes: sortValues(rows.map((row) => row.sequenceType)),
  };
}

function counts(values: Array<string | null>, limit?: number): ChartDatum[] {
  const entries = Array.from(
    values
      .filter((value): value is string => Boolean(value))
      .reduce((map, value) => map.set(value, (map.get(value) ?? 0) + 1), new Map<string, number>())
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
      .reduce((map, value) => map.set(value, (map.get(value) ?? 0) + 1), new Map<string, number>())
      .entries(),
  )
    .sort((left, right) => left[0].localeCompare(right[0]))
    .map(([label, value]) => ({ label, value }));
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

      return {
        carbapenemase: pickFromSeed(seed, blueprint.carbapenemases, 1),
        collectionDate: `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`,
        collectingRegion: blueprint.region,
        host: "Human",
        infectionType: pickFromSeed(seed, blueprint.infectionTypes, 2),
        isolateDeliveryType: "Culture isolate",
        pathogen: pickFromSeed(seed, blueprint.pathogens, 3),
        region: blueprint.region,
        resistanceProfile: pickFromSeed(seed, blueprint.resistanceProfiles, 4),
        sampleId: `MEP-SIM-${sampleNumber}`,
        sequenceType: pickFromSeed(seed, blueprint.sequenceTypes, 5),
        sequencingPlatform: pickFromSeed(seed, blueprint.sequencingPlatforms, 6),
        sequencingSampleId: `SEQ-SIM-${sampleNumber}`,
        submittingInstitution: pickFromSeed(seed, blueprint.centers, 7),
        submittingRegion: blueprint.region,
      };
    }),
  ).sort((left, right) => (right.collectionDate ?? "").localeCompare(left.collectionDate ?? ""));
}

function buildSimulatedMepramSnapshot(): MepramSnapshot {
  const rows = buildSimulatedExplorerRows();
  const regionCount = new Set(rows.map((row) => row.region).filter(Boolean)).size;
  const centerCount = new Set(
    rows.map((row) => row.submittingInstitution).filter((value): value is string => Boolean(value)),
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
      "Falta un explorer backend paginado por ST, patógeno, carbapenemasa y perfil de resistencia sin N+1 por muestra.",
      "Falta una salida backend para exportar subconjuntos filtrados y abrirlos en Microreact.",
    ],
    overview: {
      analyzedSamples,
      annualPathogenSeries: SIMULATED_ANNUAL_PATHOGEN_SERIES,
      centers: counts(rows.map((row) => row.submittingInstitution), 8),
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
      resistanceProfiles: counts(rows.map((row) => row.carbapenemase)),
      resistanceProfilesSimulated: true,
      sequencingPlatforms: counts(rows.map((row) => row.sequencingPlatform)),
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

async function propertyDistribution(
  client: PathocoreApiClient,
  property: string,
): Promise<DatabrowserPropertyDistributionResponse> {
  return client.getDatabrowserPropertyDistribution(property, {
    project_name: PROJECT_NAME,
  });
}

async function loadLiveMepramSnapshot(
  credentials: ApiCredentials | null,
): Promise<MepramSnapshot> {
  const client = new PathocoreApiClient(credentials);
  const [
    overviewSummary,
    schemaSummary,
    centerDistribution,
    collectingRegions,
    submittingRegions,
    infectionTypes,
    sequencingPlatforms,
    speciesDistribution,
    resistanceProfiles,
    analyzedSamplesDistribution,
  ] =
    await Promise.all([
      client.getDatabrowserOverviewSummary({ project_name: PROJECT_NAME }),
      client.getDatabrowserSchemaSummary({ project_name: PROJECT_NAME }),
      propertyDistribution(client, "submitting_institution"),
      propertyDistribution(client, "collecting_institution_geo_loc_state"),
      propertyDistribution(client, "submitting_geo_loc_state"),
      propertyDistribution(client, "infection_type"),
      propertyDistribution(client, "sequencing_instrument_platform"),
      propertyDistribution(client, "organism"),
      propertyDistribution(client, "ECDC Resistance profile"),
      propertyDistribution(client, "bioinformatics_protocol_software_name"),
    ]);

  const mepramSchema = schemaSummary.schema_options[0];
  const samplesPage = mepramSchema
    ? await client.listSamplesPage({
        page: 1,
        page_size: SAMPLE_PAGE_SIZE,
        schema_name: mepramSchema.schema_name,
        schema_version: mepramSchema.schema_version,
      })
    : { count: 0, next: null, previous: null, results: [] };

  const metadataBySample = await Promise.all(
    samplesPage.results.map(async (sample) => ({
      metadata: await client.getSampleMetadata(sample.sample_unique_id),
      sample,
    })),
  );

  const rawRows = metadataBySample.map(({ metadata, sample }) => explorerRow(sample, metadata));
  const operationalFieldsSimulated = rawRows.some(
    (row) =>
      !row.pathogen || !row.sequenceType || !row.carbapenemase || !row.resistanceProfile,
  );
  const rows = rawRows
    .map((row) => (operationalFieldsSimulated ? enrichExplorerRow(row) : row))
    .sort((left, right) => (right.collectionDate ?? "").localeCompare(left.collectionDate ?? ""));

  const regionCount = new Set(
    [...collectingRegions.values, ...submittingRegions.values].map((item) => item.label),
  ).size;
  const pathogenDistribution =
    speciesDistribution.values.length > 0
      ? chartItems(speciesDistribution.values, { truncate: true })
      : SIMULATED_PATHOGEN_DISTRIBUTION;
  const pathogenDistributionSimulated = speciesDistribution.values.length === 0;
  const resistanceProfilesData =
    resistanceProfiles.values.length > 0
      ? chartItems(resistanceProfiles.values, { truncate: true })
      : [
          { label: "OXA-48", value: 46 },
          { label: "KPC-3", value: 24 },
          { label: "NDM-5", value: 18 },
          { label: "VIM-1", value: 12 },
        ];
  const resistanceProfilesSimulated = resistanceProfiles.values.length === 0;

  return {
    explorer: {
      filterOptions: explorerFilterOptions(rows),
      notes: [
        `La tabla operativa carga las primeras ${SAMPLE_PAGE_SIZE} muestras del schema del caso de uso y las enriquece con /samples/{id}/metadata.`,
        "Para escalar este explorer hace falta un endpoint backend paginado y agregado específico de vigilancia, sin N+1 por muestra.",
        operationalFieldsSimulated
          ? "Patógeno, ST, carbapenemasa y perfil de resistencia se completan aquí con una simulación controlada para poder revisar la experiencia de vigilancia mientras backend expone esa capa operativa."
          : "Los campos de tipado y resistencia ya están llegando desde la API real en esta muestra visible.",
      ],
      operationalFieldsSimulated,
      rows,
      totalLoaded: rows.length,
    },
    generatedAt: new Date().toISOString(),
    integrationGaps: [
      "No hay todavía un endpoint específico de búsqueda de aislamientos del caso de uso por ST, clon, perfil de resistencia o carbapenemasa, ni una exportación preparada para abrir subconjuntos filtrados en Microreact.",
      "Los campos de tipado y resistencia no están poblados ni expuestos de forma operativa en /samples/{sample_id}/metadata para el dataset actual.",
      "La capa de alertas de vigilancia todavía requiere lógica backend dedicada y un endpoint agregado propio.",
    ],
    overview: {
      analyzedSamples: analyzedSamplesDistribution.matched_samples,
      annualPathogenSeries: SIMULATED_ANNUAL_PATHOGEN_SERIES,
      centers: chartItems(centerDistribution.values, { truncate: true }),
      collectionTimeline: chartItems(overviewSummary.sample_growth),
      collectingRegions: chartItems(collectingRegions.values),
      infectionTypes: chartItems(infectionTypes.values, { truncate: true }),
      kpis: kpis({
        analyzedSamples: analyzedSamplesDistribution.matched_samples,
        centerCount: centerDistribution.values.length,
        overviewSampleCount: overviewSummary.metrics.sample_count,
        regionCount,
      }),
      notes: [
        ...overviewSummary.notes,
        "Las gráficas de patógenos, genes de resistencia y cobertura territorial avanzada se muestran como simulación controlada mientras la API no exponga esos agregados de vigilancia.",
      ],
      participatingCenters: centerDistribution.values.length,
      participatingRegions: regionCount,
      pathogenDistributionSimulated,
      projectPathogenDistribution: pathogenDistribution,
      resistanceSignalsSeries: SIMULATED_RESISTANCE_SIGNALS,
      resistanceProfiles: resistanceProfilesData,
      resistanceProfilesSimulated,
      sequencingPlatforms: chartItems(sequencingPlatforms.values, { truncate: true }),
      submittingRegions: chartItems(submittingRegions.values),
      territorialCoverage: SIMULATED_TERRITORIAL_COVERAGE,
      territorialCoverageSimulated: true,
      totalSamples: overviewSummary.metrics.sample_count,
    },
    projectLabel: "Caso de uso pendiente",
  };
}

export async function loadMepramSnapshot(
  credentials: ApiCredentials | null,
): Promise<MepramSnapshot> {
  if (MEPRAM_DATA_MODE !== "live") {
    return buildSimulatedMepramSnapshot();
  }

  return loadLiveMepramSnapshot(credentials);
}
