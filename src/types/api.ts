export interface ApiCredentials {
  password: string;
  username: string;
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
