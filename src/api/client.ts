import { DEFAULT_API_BASE_URL } from "@/lib/constants";
import type {
  ApiCredentials,
  PaginatedResponse,
  SampleListItem,
  SampleMetadataApiItem,
  SchemaDetailResponse,
  SchemaListItem,
  VariantFilterOptionsResponse,
  VariantReferenceGenomeApiItem,
  VariantSearchQuery,
  VariantSearchResponse,
  VariantSummaryResponse,
} from "@/types/api";

interface RequestOptions {
  path: string;
  query?: Record<string, number | string | undefined>;
}

interface ApiErrorPayload {
  detail?: string;
  error?: string;
}

export class ApiError extends Error {
  status: number;

  constructor(message: string, status: number) {
    super(message);
    this.name = "ApiError";
    this.status = status;
  }
}

function buildBasicAuthHeader(credentials: ApiCredentials | null) {
  if (!credentials?.username || !credentials.password) {
    return undefined;
  }

  return `Basic ${btoa(`${credentials.username}:${credentials.password}`)}`;
}

function buildUrl(baseUrl: string, { path, query }: RequestOptions) {
  const url = new URL(`${baseUrl}${path}`, window.location.origin);

  if (query) {
    Object.entries(query).forEach(([key, value]) => {
      if (value === undefined) {
        return;
      }

      url.searchParams.set(key, String(value));
    });
  }

  return url.toString();
}

export class PathocoreApiClient {
  baseUrl: string;
  credentials: ApiCredentials | null;

  constructor(credentials: ApiCredentials | null, baseUrl = DEFAULT_API_BASE_URL) {
    this.baseUrl = baseUrl;
    this.credentials = credentials;
  }

  async getJson<T>(options: RequestOptions): Promise<T> {
    const authorization = buildBasicAuthHeader(this.credentials);
    const headers: Record<string, string> = {
      Accept: "application/json",
    };

    if (authorization) {
      headers.Authorization = authorization;
    }

    const response = await fetch(buildUrl(this.baseUrl, options), {
      credentials: "include",
      headers,
      method: "GET",
    });

    const payload = (await response.json().catch(() => null)) as ApiErrorPayload | T | null;

    if (!response.ok) {
      const message =
        (payload as ApiErrorPayload | null)?.error ||
        (payload as ApiErrorPayload | null)?.detail ||
        `API request failed with status ${response.status}`;

      throw new ApiError(message, response.status);
    }

    return payload as T;
  }

  listSchemas() {
    return this.getJson<SchemaListItem[]>({ path: "/schema" });
  }

  getSchemaDetail(schemaName: string, schemaVersion: string) {
    return this.getJson<SchemaDetailResponse>({
      path: `/schema/${encodeURIComponent(schemaName)}/${encodeURIComponent(schemaVersion)}`,
    });
  }

  async listAllSamples() {
    const pageSize = 5000;
    let currentPage = 1;
    const aggregated: SampleListItem[] = [];

    // The endpoint is paginated. We keep following pages to avoid silently
    // dropping data if the dataset grows beyond the first page.
    while (true) {
      const page = await this.getJson<PaginatedResponse<SampleListItem>>({
        path: "/samples",
        query: {
          page: currentPage,
          page_size: pageSize,
        },
      });

      aggregated.push(...page.results);

      if (!page.next) {
        return aggregated;
      }

      currentPage += 1;
    }
  }

  async getSampleMetadata(sampleUniqueId: string) {
    try {
      return await this.getJson<SampleMetadataApiItem[]>({
        path: `/samples/${encodeURIComponent(sampleUniqueId)}/metadata`,
      });
    } catch (error) {
      if (error instanceof ApiError && error.status === 404) {
        return [];
      }

      throw error;
    }
  }

  getVariantFilterOptions() {
    return this.getJson<VariantFilterOptionsResponse>({
      path: "/variants/filter-options",
    });
  }

  listVariantReferenceGenomes() {
    return this.getJson<VariantReferenceGenomeApiItem[]>({
      path: "/variants/reference-genomes",
    });
  }

  async searchVariants(query: VariantSearchQuery) {
    try {
      return await this.getJson<VariantSearchResponse>({
        path: "/variants/search",
        query: { ...query },
      });
    } catch (error) {
      if (error instanceof ApiError && error.status === 404) {
        return null;
      }

      throw error;
    }
  }

  getVariantSummary() {
    return this.getJson<VariantSummaryResponse>({
      path: "/variants/summary",
    });
  }
}
