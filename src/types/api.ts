export interface ApiCredentials {
  password: string;
  username: string;
}

export interface ApiCountItem {
  label: string;
  value: number;
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

export type SampleMetadataApiItem = Record<string, string | null>;

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
