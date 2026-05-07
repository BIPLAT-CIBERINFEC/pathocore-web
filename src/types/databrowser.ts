export type EntryViewId = "metadata" | "overview" | "schema" | "variant";

export interface ChartDatum {
  label: string;
  value: number;
}

export interface KpiStat {
  label: string;
  note: string;
  value: string;
}

export interface EntryCardContent {
  description: string;
  id: EntryViewId;
  stat: string;
  subtitle: string;
  tags: string[];
  title: string;
}

export interface PropertyDistributionCard {
  actualPropertyName?: string;
  chartKind: "bar" | "line";
  chartTitle: string;
  classification?: string;
  description: string;
  displayName: string;
  distributionQueries?: MetadataPropertyDistributionQuery[];
  enumValues?: string[];
  isFallback: boolean;
  participantCount: number;
  participantShare: number;
  propertyName: string;
  schemaPath?: string;
  schemaType?: string;
  values: ChartDatum[];
}

export interface MetadataPropertyDistributionQuery {
  project_name?: string;
  schema_name?: string;
  schema_version?: string;
}

export interface MetadataPanelChart {
  description: string;
  kind: "bar" | "line" | "pie";
  title: string;
  values: ChartDatum[];
}

export interface MetadataSubsectionData {
  description: string;
  id: "host-information" | "sample-bioinfo" | "sample-metadata";
  notes: string[];
  properties: PropertyDistributionCard[];
  summaryCharts: MetadataPanelChart[];
  title: string;
}

export interface MetadataSchemaOption {
  key: string;
  label: string;
  projectName: string;
  sampleCount: number;
  schemaName: string;
  schemaVersion: string;
}

export interface MetadataSchemaScope {
  key: string;
  sampleCount: number;
  sections: MetadataSubsectionData[];
}

export interface OverviewSectionData {
  coverageNotes: string[];
  geography: ChartDatum[];
  kpis: KpiStat[];
  notes: string[];
  pathogens: ChartDatum[];
  sampleGrowth: ChartDatum[];
  schemaMix: ChartDatum[];
}

export interface SchemaPropertyCard {
  classification: string;
  description: string;
  enumValues: string[];
  examples: string[];
  label: string;
  path: string;
  propertyName: string;
  type: string;
}

export interface SchemaClassificationCard {
  name: string;
  propertyCount: number;
  properties: SchemaPropertyCard[];
}

export interface SchemaCardData {
  classificationCount: number;
  classifications: SchemaClassificationCard[];
  generatedAt: string | null;
  name: string;
  projectName: string;
  propertyCount: number;
  sampleCount: number;
  version: string;
}

export interface SchemaSectionData {
  classificationDistribution: ChartDatum[];
  notes: string[];
  schemaCards: SchemaCardData[];
  schemaDistribution: ChartDatum[];
  stats: KpiStat[];
}

export interface VariantSectionData {
  filterOptions: VariantFilterOptions;
  impactClasses: ChartDatum[];
  impactClassesAvailable: boolean;
  notes: string[];
  projectCoverage: ChartDatum[];
  referenceGenomeOptions: VariantReferenceGenomeOption[];
  referenceGenomes: ChartDatum[];
  stats: KpiStat[];
  variantCounts: ChartDatum[];
  variantSoftware: ChartDatum[];
}

export interface VariantFilterOptions {
  collectionDateMax: string | null;
  collectionDateMin: string | null;
  sequencingPlatforms: string[];
}

export interface VariantReferenceGenomeOption {
  distinctVariantCount: number;
  referenceGenome: string;
  sampleCount: number;
  variantObservationCount: number;
}

export interface VariantSearchRow {
  alleleFrequency: number | null;
  alternateAllele: string;
  aminoacidChange: string;
  collectionDate: string | null;
  depth: number | null;
  effect: string;
  functionalClass: string;
  geneRegion: string;
  locusId: string;
  locusName: string;
  position: number;
  referenceAllele: string;
  sampleId: string;
  sequencingPlatform: string;
  type: string;
  variant: string;
}

export interface DatabrowserSnapshot {
  generatedAt: string;
  homeCards: EntryCardContent[];
  metadata: {
    notes: string[];
    schemaOptions: MetadataSchemaOption[];
    schemaScopes: MetadataSchemaScope[];
    sections: MetadataSubsectionData[];
    stats: KpiStat[];
  };
  overview: OverviewSectionData;
  schema: SchemaSectionData;
  variant: VariantSectionData;
}

export interface DatabrowserContextValue {
  error: string | null;
  lastUpdated: string | null;
  refresh: () => Promise<void>;
  snapshot: DatabrowserSnapshot | null;
  status: "error" | "idle" | "loading" | "success";
}
