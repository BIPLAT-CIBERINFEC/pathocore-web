export interface ApiCountItem {
  label: string;
  value: number;
}

export interface ApiGeoPoint {
  admin_level?: string | null;
  code?: string | null;
  country?: string | null;
  label?: string | null;
  lat?: number | null;
  lon?: number | null;
}

export interface ApiChartItem extends ApiCountItem {
  geo?: ApiGeoPoint | null;
}

export interface SchemaListItem {
  generated_at: string | null;
  project_name: string;
  schema_in_use: boolean;
  schema_name: string;
  schema_version: string;
}

export interface SchemaPropertyDefinition {
  classification?: string;
  description?: string;
  enum?: string[];
  examples?: string[];
  fill_mode?: string;
  format?: string;
  header?: string;
  items?: {
    properties?: Record<string, SchemaPropertyDefinition>;
    required?: string[];
    type?: string;
  };
  label?: string;
  ontology?: string;
  options?: string;
  properties?: Record<string, SchemaPropertyDefinition>;
  required?: string[];
  type?: string;
}

export interface SchemaDetailResponse {
  generated_at: string | null;
  project_name: string | null;
  schema: {
    properties?: Record<string, SchemaPropertyDefinition>;
    title?: string;
    version?: string;
  };
  schema_in_use: boolean;
  schema_name: string;
  schema_version: string;
}

export interface SampleListItem {
  created_at: string;
  sample_unique_id: string;
  schema_name: string;
  schema_version: string;
  sequencing_sample_id: string | null;
}

export interface PaginatedResponse<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}

export interface SampleListQuery {
  collecting_institution?: string;
  collecting_lab_sample_id?: string;
  created_at_from?: string;
  created_at_to?: string;
  microbiology_lab_sample_id?: string;
  page?: number;
  page_size?: number;
  sample_unique_id?: string;
  schema_name?: string;
  schema_version?: string;
  sequencing_date_from?: string;
  sequencing_date_to?: string;
  sequencing_sample_id?: string;
  submitting_lab_sample_id?: string;
}

export type SampleMetadataApiItem = Record<string, string | null>;

export interface SampleMetadataSearchResult {
  sample_unique_id: string;
  values: Record<string, string | string[] | null>;
}

export interface DatabrowserSummaryQuery {
  date_from?: string;
  date_to?: string;
  project_name?: string;
  schema_name?: string;
  schema_version?: string;
  sequencing_platform?: string;
}

export interface VariantFilterOptionsResponse {
  collection_date: {
    max: string | null;
    min: string | null;
  };
  sequencing_platforms: {
    label: string;
    value: string;
  }[];
}

export interface VariantReferenceGenomeApiItem {
  distinct_variant_count: number;
  reference_genome: string;
  sample_count: number;
  variant_observation_count: number;
}

export interface VariantSearchApiRow {
  allele_frequency: number | null;
  alternate_allele: string;
  aminoacid_change: string | null;
  analysis_date?: string | null;
  collection_date?: string | null;
  depth: number | null;
  effect: string | null;
  functional_class: string | null;
  gene_region: string | null;
  locus_id: string | null;
  locus_name: string | null;
  position: number;
  project_name?: string | null;
  reference_allele: string;
  reference_genome?: string | null;
  sample_id: string;
  sequencing_platform?: string | null;
  type: string;
  variant: string;
}

export interface VariantSearchQuery {
  aminoacid_change?: string;
  collection_date_from?: string;
  collection_date_to?: string;
  effect?: string;
  locus_id?: string;
  locus_name?: string;
  page?: number;
  page_size?: number;
  project_name?: string;
  reference_genome?: string;
  sample_id?: string;
  schema_name?: string;
  schema_version?: string;
  sequencing_platform?: string;
  variant: string;
}

export interface VariantSearchResponse {
  count: number;
  next: string | null;
  previous: string | null;
  query: {
    alternate_allele: string;
    position: number;
    reference_allele: string;
    reference_genome?: string | null;
    variant: string;
  };
  results: VariantSearchApiRow[];
  summary: {
    global_allele_frequency: number | null;
    sample_count: number;
    visible_sample_count: number;
  };
}

export interface VariantSummaryResponse {
  impact_classes: ApiCountItem[];
  projects: ApiCountItem[];
  reference_genomes: ApiCountItem[];
  totals: {
    distinct_variants: number;
    samples_with_variants: number;
    variant_observations: number;
    visible_sample_count: number;
  };
  variant_counts: ApiCountItem[];
}

export interface ApiKpiItem {
  label: string;
  note: string;
  value: string;
}

export interface DatabrowserOverviewSummaryResponse {
  coverage_notes: string[];
  geography: ApiCountItem[];
  kpis: ApiKpiItem[];
  metrics: {
    active_schema_count: number;
    project_count: number;
    sample_count: number;
    visible_metadata_properties: number;
  };
  notes: string[];
  pathogens: ApiCountItem[];
  projects: ApiCountItem[];
  sample_growth: ApiCountItem[];
  schema_mix: ApiCountItem[];
}

export interface DatabrowserPropertyCardResponse {
  actual_property_name?: string;
  chart_kind: "bar" | "line";
  chart_title: string;
  description: string;
  display_name: string;
  is_fallback: boolean;
  participant_count: number;
  participant_share: number;
  property_name: string;
  values: ApiCountItem[];
}

export interface DatabrowserMetadataChartResponse {
  description: string;
  kind: "bar" | "line" | "pie";
  title: string;
  values: ApiCountItem[];
}

export interface DatabrowserMetadataSectionResponse {
  description: string;
  id: "host-information" | "sample-bioinfo" | "sample-metadata";
  notes: string[];
  properties: DatabrowserPropertyCardResponse[];
  summary_charts: DatabrowserMetadataChartResponse[];
  title: string;
}

export interface DatabrowserSchemaOptionResponse {
  key: string;
  label: string;
  project_name: string;
  sample_count: number;
  schema_name: string;
  schema_version: string;
}

export interface DatabrowserSchemaScopeResponse {
  key: string;
  sample_count: number;
  sections: DatabrowserMetadataSectionResponse[];
}

export interface DatabrowserMetadataSummaryResponse {
  notes: string[];
  schema_options: DatabrowserSchemaOptionResponse[];
  schema_scopes: DatabrowserSchemaScopeResponse[];
  sections: DatabrowserMetadataSectionResponse[];
  stats: ApiKpiItem[];
}

export interface DatabrowserSchemaPropertyCardResponse {
  classification: string;
  description: string;
  enum_values: string[];
  examples: string[];
  label: string;
  path: string;
  property_name: string;
  type: string;
}

export interface DatabrowserSchemaClassificationCardResponse {
  name: string;
  property_count: number;
  properties: DatabrowserSchemaPropertyCardResponse[];
}

export interface DatabrowserSchemaCardResponse {
  classification_count: number;
  classifications: DatabrowserSchemaClassificationCardResponse[];
  generated_at: string | null;
  name: string;
  project_name: string;
  property_count: number;
  sample_count: number;
  version: string;
}

export interface DatabrowserSchemaSummaryResponse {
  classification_distribution: ApiCountItem[];
  notes: string[];
  schema_cards: DatabrowserSchemaCardResponse[];
  schema_distribution: ApiCountItem[];
  schema_options: DatabrowserSchemaOptionResponse[];
  stats: ApiKpiItem[];
}

export interface DatabrowserDistributionCardResponse {
  data_path: string;
  default_renderer: string;
  description?: string | null;
  has_data?: boolean;
  id: string;
  metric?: string | null;
  supported_renderers?: string[];
  title: string;
}

export interface DatabrowserGroupedBreakdownSeries {
  label: string;
  sample_count: number;
  values: ApiChartItem[];
}

export interface DatabrowserGroupedBreakdownResponse {
  chart_kind: string;
  group_by: string;
  groups_returned: number;
  groups_total: number;
  id: string;
  label: string;
  metric: string;
  series: DatabrowserGroupedBreakdownSeries[];
  truncated: boolean;
}

export interface DatabrowserLocationBreakdownItem {
  geo?: ApiGeoPoint | null;
  label: string;
  matched_samples: number;
  matched_share: number;
  tooltip: {
    matched_samples: number;
    matched_share: number;
    title: string;
    total_samples: number;
  };
  top_values?: ApiChartItem[];
  total_samples: number;
  value: number;
}

export interface DatabrowserLocationBreakdownResponse {
  chart_kind: string;
  group_by: string;
  id: string;
  label: string;
  metric: string;
  values: DatabrowserLocationBreakdownItem[];
}

export interface DatabrowserPropertyDistributionResponse {
  aliases?: string[];
  breakdowns?: {
    location?: DatabrowserLocationBreakdownResponse;
    pathogen?: DatabrowserGroupedBreakdownResponse;
    year?: DatabrowserGroupedBreakdownResponse;
  };
  cards?: DatabrowserDistributionCardResponse[];
  coverage?: {
    matched_samples: number;
    matched_share: number;
    total_samples: number;
  };
  data_contract_version?: string;
  matched_samples: number;
  property: string;
  strategy?: string;
  total_samples: number;
  ui_hints?: Record<string, unknown>;
  values: ApiChartItem[];
}

export interface UseCaseProjectResponse {
  id: string;
  label: string;
}

export interface UseCaseCacheResponse {
  generated_at: string;
  scope_key: string;
  summary_name: string;
}

export interface UseCaseDimensionResponse {
  coverage: {
    matched_samples: number;
    matched_share: number;
    total_samples: number;
  };
  id: string;
  kind: "categorical" | "geography" | string;
  label: string;
  metric: string;
  source_properties: string[];
  truncated: boolean;
  values: ApiChartItem[];
}

export interface UseCaseSingleTimeSeriesResponse {
  id: string;
  kind: "time_series";
  label: string;
  metric: string;
  source_properties: string[];
  truncated: boolean;
  values: ApiChartItem[];
  x_axis: string;
}

export interface UseCaseSeriesDefinitionResponse {
  color: string;
  key: string;
  label: string;
}

export interface UseCaseGroupedTimeSeriesResponse {
  group_by: string;
  id: string;
  kind: "grouped_time_series";
  label: string;
  metric: string;
  series: UseCaseSeriesDefinitionResponse[];
  simulated: boolean;
  source_properties: string[];
  truncated: boolean;
  values: Array<Record<string, number | string>>;
  x_axis: string;
}

export interface UseCaseGeographyRegionResponse {
  centers: number;
  dominant_pathogen: string;
  geo?: ApiGeoPoint | null;
  hospitals: number;
  label: string;
  notes: string[];
  region_code: string;
  samples: number;
  simulated: boolean;
  top_resistance_signal: string;
  x?: number | null;
  y?: number | null;
}

export interface UseCaseDataSummaryResponse {
  cache: UseCaseCacheResponse;
  data_contract_version: string;
  data_quality: Record<string, unknown>;
  dimensions: Record<string, UseCaseDimensionResponse | undefined>;
  generated_at: string;
  geography: {
    map_join?: Record<string, string>;
    regions: UseCaseGeographyRegionResponse[];
  };
  metrics: {
    active_schema_count: number;
    analyzed_samples: number;
    participating_centers: number;
    participating_regions: number;
    sample_count?: number;
    samples_with_collection_date: number;
    samples_with_pathogen: number;
    samples_with_region: number;
    samples_with_resistance_signals: number;
    schema_count: number;
    total_samples: number;
  };
  overview?: Record<string, unknown>;
  project: UseCaseProjectResponse;
  project_label: string;
  project_name: string;
  time_series: Record<
    string,
    UseCaseGroupedTimeSeriesResponse | UseCaseSingleTimeSeriesResponse | undefined
  >;
  visualization_hints: Record<string, unknown>;
}
