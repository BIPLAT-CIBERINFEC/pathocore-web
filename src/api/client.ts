import { DEFAULT_API_BASE_URL } from "@/lib/constants";
import type {
  DatabrowserPropertyDistributionResponse,
  DatabrowserSummaryQuery,
  DatabrowserMetadataSummaryResponse,
  DatabrowserOverviewSummaryResponse,
  DatabrowserSchemaSummaryResponse,
  PaginatedResponse,
  SampleListItem,
  SampleListQuery,
  SampleMetadataApiItem,
  SampleMetadataSearchResult,
  SchemaDetailResponse,
  SchemaListItem,
  UseCaseDataSummaryResponse,
  UseCaseIsolateExplorerResponse,
  VariantFilterOptionsResponse,
  VariantReferenceGenomeApiItem,
  VariantSearchQuery,
  VariantSearchResponse,
  VariantSummaryResponse,
} from "@/types/api";

interface RequestOptions {
  path: string;
  query?: Record<string, number | string | undefined> | undefined;
}

interface ApiErrorPayload {
  detail?: string;
  error?: string;
}

interface ApiClientOptions {
  accessToken?: string | null;
  baseUrl?: string;
  requestCredentials?: RequestCredentials;
}

export class ApiError extends Error {
  status: number;

  constructor(message: string, status: number) {
    super(message);
    this.name = "ApiError";
    this.status = status;
  }
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
  accessToken: string | null;
  baseUrl: string;
  requestCredentials: RequestCredentials;

  constructor(options: ApiClientOptions = {}) {
    this.accessToken = options.accessToken ?? null;
    this.baseUrl = options.baseUrl ?? DEFAULT_API_BASE_URL;
    this.requestCredentials =
      options.requestCredentials ?? (this.accessToken ? "include" : "omit");
  }

  async getJson<T>(options: RequestOptions): Promise<T> {
    const headers: Record<string, string> = {
      Accept: "application/json",
    };

    if (this.accessToken) {
      headers.Authorization = `Bearer ${this.accessToken}`;
    }

    const response = await fetch(buildUrl(this.baseUrl, options), {
      credentials: this.requestCredentials,
      headers,
      method: "GET",
    });

    const payload = (await response.json().catch(() => null)) as
      | ApiErrorPayload
      | T
      | null;

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

  listSamplesPage(query?: SampleListQuery) {
    return this.getJson<PaginatedResponse<SampleListItem>>({
      path: "/samples",
      query: query ? { ...query } : undefined,
    });
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

  async searchSampleMetadata(filters: string[], match: "all" | "any" = "all") {
    try {
      const url = new URL(
        `${this.baseUrl}/samples/metadata/search`,
        window.location.origin,
      );
      filters.forEach((filter) => {
        url.searchParams.append("filter", filter);
      });
      url.searchParams.set("match", match);

      const headers: Record<string, string> = {
        Accept: "application/json",
      };

      if (this.accessToken) {
        headers.Authorization = `Bearer ${this.accessToken}`;
      }

      const response = await fetch(url.toString(), {
        credentials: this.requestCredentials,
        headers,
        method: "GET",
      });

      const payload = (await response.json().catch(() => null)) as
        | { detail?: string; error?: string }
        | SampleMetadataSearchResult[]
        | null;

      if (!response.ok) {
        if (response.status === 404) {
          return [];
        }

        const message =
          (payload as { detail?: string; error?: string } | null)?.error ||
          (payload as { detail?: string; error?: string } | null)?.detail ||
          `API request failed with status ${response.status}`;

        throw new ApiError(message, response.status);
      }

      return payload as SampleMetadataSearchResult[];
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

  getDatabrowserOverviewSummary(query?: DatabrowserSummaryQuery) {
    return this.getJson<DatabrowserOverviewSummaryResponse>({
      path: "/databrowser/overview-summary",
      query: query ? { ...query } : undefined,
    });
  }

  getDatabrowserMetadataSummary(query?: DatabrowserSummaryQuery) {
    return this.getJson<DatabrowserMetadataSummaryResponse>({
      path: "/databrowser/metadata-summary",
      query: query ? { ...query } : undefined,
    });
  }

  getDatabrowserSchemaSummary(query?: DatabrowserSummaryQuery) {
    return this.getJson<DatabrowserSchemaSummaryResponse>({
      path: "/databrowser/schema-summary",
      query: query ? { ...query } : undefined,
    });
  }

  getDatabrowserPropertyDistribution(
    property: string,
    query?: DatabrowserSummaryQuery,
  ) {
    return this.getJson<DatabrowserPropertyDistributionResponse>({
      path: "/databrowser/metadata/property-distribution",
      query: {
        ...query,
        property,
      },
    });
  }

  getUseCaseDataSummary(projectName: string) {
    return this.getJson<UseCaseDataSummaryResponse>({
      path: "/use-cases/data-summary",
      query: { project_name: projectName },
    });
  }

  getUseCaseIsolateExplorer(projectName: string) {
    return this.getJson<UseCaseIsolateExplorerResponse>({
      path: "/use-cases/isolate-explorer",
      query: { project_name: projectName },
    });
  }
}
