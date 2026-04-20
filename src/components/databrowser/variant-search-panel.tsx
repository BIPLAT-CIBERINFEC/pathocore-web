import { type FormEvent, useState } from "react";
import { Loader2, Search, SlidersHorizontal } from "lucide-react";
import { ApiError, PathocoreApiClient } from "@/api/client";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { formatInteger } from "@/lib/format";
import type {
  ApiCredentials,
  VariantSearchApiRow,
  VariantSearchQuery,
  VariantSearchResponse,
} from "@/types/api";
import type {
  VariantFilterOptions,
  VariantReferenceGenomeOption,
  VariantSearchRow,
} from "@/types/databrowser";

interface ParsedHgvsVariant {
  alternateAllele: string;
  position: number;
  referenceAllele: string;
  type: string;
  variant: string;
}

interface VariantSearchPanelProps {
  credentials?: ApiCredentials | null;
  filterOptions: VariantFilterOptions;
  includeProjectFilter?: boolean;
  referenceGenomeOptions: VariantReferenceGenomeOption[];
}

type SearchStatus = "error" | "idle" | "loading" | "success";

function inferVariantType(referenceAllele: string, alternateAllele: string) {
  if (referenceAllele.length === 1 && alternateAllele.length === 1) {
    return "SNV";
  }

  if (referenceAllele.length === alternateAllele.length) {
    return "MNV";
  }

  if (referenceAllele.length < alternateAllele.length) {
    return "Insertion / complex";
  }

  return "Deletion / complex";
}

function parseHgvsVariant(input: string): ParsedHgvsVariant | null {
  const normalized = input.trim().replace(/\s+/g, "");
  const match = /^g\.(\d+)([A-Za-z]+)>([A-Za-z]+)$/.exec(normalized);

  if (!match) {
    return null;
  }

  const [, rawPosition, rawReferenceAllele, rawAlternateAllele] = match;
  const position = Number(rawPosition);

  if (!Number.isInteger(position) || position <= 0) {
    return null;
  }

  const referenceAllele = rawReferenceAllele.toUpperCase();
  const alternateAllele = rawAlternateAllele.toUpperCase();

  return {
    alternateAllele,
    position,
    referenceAllele,
    type: inferVariantType(referenceAllele, alternateAllele),
    variant: `g.${position}${referenceAllele}>${alternateAllele}`,
  };
}

function formatNullableNumber(value: number | null) {
  return value === null ? "N/A" : formatInteger(value);
}

function formatNullableText(value: string | null) {
  return value?.trim() ? value : "N/A";
}

function formatAlleleFrequency(value: number | null) {
  if (value === null) {
    return "N/A";
  }

  return value <= 1 ? `${(value * 100).toFixed(2)}%` : value.toFixed(3);
}

function optionalTextFilter(value: string) {
  const trimmed = value.trim();
  return trimmed || null;
}

function mapVariantSearchRow(row: VariantSearchApiRow): VariantSearchRow {
  return {
    alleleFrequency: row.allele_frequency,
    alternateAllele: row.alternate_allele,
    aminoacidChange: row.aminoacid_change ?? "N/A",
    collectionDate: row.collection_date ?? null,
    depth: row.depth,
    effect: row.effect ?? "N/A",
    functionalClass: row.functional_class ?? "N/A",
    geneRegion: row.gene_region ?? "N/A",
    locusId: row.locus_id ?? "N/A",
    locusName: row.locus_name ?? "N/A",
    position: row.position,
    referenceAllele: row.reference_allele,
    sampleId: row.sample_id,
    sequencingPlatform: row.sequencing_platform ?? "N/A",
    type: row.type,
    variant: row.variant,
  };
}

export function VariantSearchPanel({
  credentials = null,
  filterOptions,
  includeProjectFilter = false,
  referenceGenomeOptions,
}: VariantSearchPanelProps) {
  const [query, setQuery] = useState("");
  const [collectionDateFrom, setCollectionDateFrom] = useState("");
  const [collectionDateTo, setCollectionDateTo] = useState("");
  const [effect, setEffect] = useState("");
  const [aminoacidChange, setAminoacidChange] = useState("");
  const [locusId, setLocusId] = useState("");
  const [locusName, setLocusName] = useState("");
  const [projectName, setProjectName] = useState("");
  const [referenceGenome, setReferenceGenome] = useState("");
  const [sampleId, setSampleId] = useState("");
  const [schemaName, setSchemaName] = useState("");
  const [schemaVersion, setSchemaVersion] = useState("");
  const [sequencingPlatform, setSequencingPlatform] = useState("");
  const [searchError, setSearchError] = useState<string | null>(null);
  const [searchResult, setSearchResult] = useState<VariantSearchResponse | null>(null);
  const [searchStatus, setSearchStatus] = useState<SearchStatus>("idle");
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const parsedVariant = parseHgvsVariant(query);
  const hasQuery = query.trim().length > 0;
  const rows = searchResult?.results.map(mapVariantSearchRow) ?? [];
  const canSearch = Boolean(parsedVariant) && searchStatus !== "loading";
  const isEmptyResult = searchStatus === "success" && searchResult === null;
  const sampleCount = isEmptyResult ? 0 : (searchResult?.summary.sample_count ?? null);
  const globalAlleleFrequency = isEmptyResult
    ? 0
    : (searchResult?.summary.global_allele_frequency ?? null);

  function resetSearchState() {
    setSearchError(null);
    setSearchResult(null);
    setSearchStatus("idle");
  }

  async function handleSearch(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!parsedVariant) {
      resetSearchState();
      return;
    }

    setSearchError(null);
    setSearchResult(null);
    setSearchStatus("loading");

    try {
      const client = new PathocoreApiClient(credentials);
      const trimmedAminoacidChange = optionalTextFilter(aminoacidChange);
      const trimmedEffect = optionalTextFilter(effect);
      const trimmedLocusId = optionalTextFilter(locusId);
      const trimmedLocusName = optionalTextFilter(locusName);
      const trimmedProjectName = includeProjectFilter ? optionalTextFilter(projectName) : null;
      const trimmedSampleId = optionalTextFilter(sampleId);
      const trimmedSchemaName = optionalTextFilter(schemaName);
      const trimmedSchemaVersion = optionalTextFilter(schemaVersion);
      const searchQuery: VariantSearchQuery = {
        page_size: 100,
        variant: parsedVariant.variant,
      };

      if (collectionDateFrom) {
        searchQuery.collection_date_from = collectionDateFrom;
      }

      if (collectionDateTo) {
        searchQuery.collection_date_to = collectionDateTo;
      }

      if (trimmedEffect) {
        searchQuery.effect = trimmedEffect;
      }

      if (trimmedAminoacidChange) {
        searchQuery.aminoacid_change = trimmedAminoacidChange;
      }

      if (trimmedLocusId) {
        searchQuery.locus_id = trimmedLocusId;
      }

      if (trimmedLocusName) {
        searchQuery.locus_name = trimmedLocusName;
      }

      if (trimmedProjectName) {
        searchQuery.project_name = trimmedProjectName;
      }

      if (referenceGenome) {
        searchQuery.reference_genome = referenceGenome;
      }

      if (trimmedSampleId) {
        searchQuery.sample_id = trimmedSampleId;
      }

      if (trimmedSchemaName) {
        searchQuery.schema_name = trimmedSchemaName;
      }

      if (trimmedSchemaVersion) {
        searchQuery.schema_version = trimmedSchemaVersion;
      }

      if (sequencingPlatform) {
        searchQuery.sequencing_platform = sequencingPlatform;
      }

      const result = await client.searchVariants(searchQuery);

      setSearchResult(result);
      setSearchStatus("success");
    } catch (error) {
      setSearchResult(null);
      setSearchError(
        error instanceof ApiError
          ? error.message
          : "No se ha podido consultar la variante.",
      );
      setSearchStatus("error");
    }
  }

  return (
    <Card className="border-white/70 bg-white/88">
      <CardContent className="p-6">
        <form onSubmit={(event) => void handleSearch(event)}>
          <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
            <div>
              <p className="section-kicker">Genomic Variant Search</p>
              <h2 className="mt-2 text-3xl font-semibold text-slate-950">
                HGVS genomic lookup
              </h2>
              <p className="mt-3 max-w-4xl text-sm leading-7 text-slate-500">
                Search generic pathogen variants using HGVS genomic notation. Expected
                format: <span className="font-mono text-slate-700">g.112534G&gt;C</span>.
                The parser extracts position, reference allele and alternate allele
                before querying <span className="font-mono text-slate-700">/variants/search</span>.
              </p>
            </div>
            <Badge variant={searchStatus === "success" ? "secondary" : "outline"}>
              {searchStatus === "success"
                ? `${formatInteger(searchResult?.count ?? 0)} matching rows`
                : "real variant API"}
            </Badge>
          </div>

          <div className="mt-6 grid gap-3 lg:grid-cols-[1fr_auto] lg:items-end">
            <label className="grid gap-2 text-sm font-medium text-slate-700">
              Variant
              <div className="relative">
                <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <Input
                  className="pl-11 font-mono"
                  onChange={(event) => {
                    setQuery(event.target.value);
                    resetSearchState();
                  }}
                  placeholder="g.112534G>C"
                  value={query}
                />
              </div>
            </label>
            <Button disabled={!canSearch} type="submit">
              {searchStatus === "loading" ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Search className="h-4 w-4" />
              )}
              Search variant
            </Button>
          </div>

          <div className="mt-5 rounded-[1.35rem] border border-slate-200 bg-slate-50/80 p-4">
            <div className="flex flex-col gap-2 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <p className="text-xs uppercase tracking-[0.2em] text-slate-400">
                  Optional filters
                </p>
                <p className="mt-1 text-sm leading-6 text-slate-500">
                  Use backend-backed filters when available. Platform and reference genome
                  are dropdowns so users do not need to guess enum-like values.
                </p>
              </div>
              <Badge variant="outline">
                {formatInteger(referenceGenomeOptions.length)} references ·{" "}
                {formatInteger(filterOptions.sequencingPlatforms.length)} platforms
              </Badge>
            </div>
            <div className="mt-4 grid gap-3 lg:grid-cols-4">
              <label className="grid gap-2 text-sm font-medium text-slate-700">
                Reference genome
                <select
                  className="h-11 rounded-2xl border border-slate-200 bg-white px-4 text-sm text-slate-900 shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  onChange={(event) => {
                    setReferenceGenome(event.target.value);
                    resetSearchState();
                  }}
                  value={referenceGenome}
                >
                  <option value="">All references</option>
                  {referenceGenomeOptions.map((option) => (
                    <option key={option.referenceGenome} value={option.referenceGenome}>
                      {option.referenceGenome} · {formatInteger(option.variantObservationCount)}
                    </option>
                  ))}
                </select>
              </label>
              <label className="grid gap-2 text-sm font-medium text-slate-700">
                Collection date from
                <Input
                  max={collectionDateTo || filterOptions.collectionDateMax || undefined}
                  min={filterOptions.collectionDateMin || undefined}
                  onChange={(event) => {
                    setCollectionDateFrom(event.target.value);
                    resetSearchState();
                  }}
                  type="date"
                  value={collectionDateFrom}
                />
              </label>
              <label className="grid gap-2 text-sm font-medium text-slate-700">
                Collection date to
                <Input
                  max={filterOptions.collectionDateMax || undefined}
                  min={collectionDateFrom || filterOptions.collectionDateMin || undefined}
                  onChange={(event) => {
                    setCollectionDateTo(event.target.value);
                    resetSearchState();
                  }}
                  type="date"
                  value={collectionDateTo}
                />
              </label>
              <label className="grid gap-2 text-sm font-medium text-slate-700">
                Sequencing platform
                <select
                  className="h-11 rounded-2xl border border-slate-200 bg-white px-4 text-sm text-slate-900 shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  onChange={(event) => {
                    setSequencingPlatform(event.target.value);
                    resetSearchState();
                  }}
                  value={sequencingPlatform}
                >
                  <option value="">All platforms</option>
                  {filterOptions.sequencingPlatforms.map((platform) => (
                    <option key={platform} value={platform}>
                      {platform}
                    </option>
                  ))}
                </select>
              </label>
            </div>
            <div className="mt-4 flex flex-wrap items-center gap-3">
              <Button
                onClick={() => setShowAdvancedFilters((current) => !current)}
                type="button"
                variant="outline"
              >
                <SlidersHorizontal className="h-4 w-4" />
                {showAdvancedFilters ? "Hide advanced filters" : "Show advanced filters"}
              </Button>
              <p className="text-xs leading-5 text-slate-500">
                Advanced filters are text fields because the backend does not yet expose
                enum options for these values.
              </p>
            </div>
            {showAdvancedFilters ? (
              <div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
                <label className="grid gap-2 text-sm font-medium text-slate-700">
                  sample_id
                  <Input
                    onChange={(event) => {
                      setSampleId(event.target.value);
                      resetSearchState();
                    }}
                    placeholder="SAM-AAA-0010"
                    value={sampleId}
                  />
                </label>
                <label className="grid gap-2 text-sm font-medium text-slate-700">
                  locus_name
                  <Input
                    onChange={(event) => {
                      setLocusName(event.target.value);
                      resetSearchState();
                    }}
                    placeholder="S"
                    value={locusName}
                  />
                </label>
                <label className="grid gap-2 text-sm font-medium text-slate-700">
                  locus_id
                  <Input
                    onChange={(event) => {
                      setLocusId(event.target.value);
                      resetSearchState();
                    }}
                    placeholder="YP_009724390.1"
                    value={locusId}
                  />
                </label>
                <label className="grid gap-2 text-sm font-medium text-slate-700">
                  effect
                  <Input
                    onChange={(event) => {
                      setEffect(event.target.value);
                      resetSearchState();
                    }}
                    placeholder="missense_variant"
                    value={effect}
                  />
                </label>
                <label className="grid gap-2 text-sm font-medium text-slate-700">
                  aminoacid_change
                  <Input
                    onChange={(event) => {
                      setAminoacidChange(event.target.value);
                      resetSearchState();
                    }}
                    placeholder="p.D614G"
                    value={aminoacidChange}
                  />
                </label>
                {includeProjectFilter ? (
                  <label className="grid gap-2 text-sm font-medium text-slate-700">
                    project_name
                    <Input
                      onChange={(event) => {
                        setProjectName(event.target.value);
                        resetSearchState();
                      }}
                      placeholder="project-code"
                      value={projectName}
                    />
                  </label>
                ) : null}
                <label className="grid gap-2 text-sm font-medium text-slate-700">
                  schema_name
                  <Input
                    onChange={(event) => {
                      setSchemaName(event.target.value);
                      resetSearchState();
                    }}
                    placeholder="schema-name"
                    value={schemaName}
                  />
                </label>
                <label className="grid gap-2 text-sm font-medium text-slate-700">
                  schema_version
                  <Input
                    onChange={(event) => {
                      setSchemaVersion(event.target.value);
                      resetSearchState();
                    }}
                    placeholder="3.2.4"
                    value={schemaVersion}
                  />
                </label>
              </div>
            ) : null}
          </div>

          <div className="mt-5 grid gap-3 md:grid-cols-2 xl:grid-cols-5">
            <div className="rounded-[1.25rem] bg-slate-50 p-4">
              <p className="text-xs uppercase tracking-[0.2em] text-slate-400">
                Position
              </p>
              <p className="mt-2 font-mono text-lg font-semibold text-slate-950">
                {parsedVariant ? formatInteger(parsedVariant.position) : "N/A"}
              </p>
            </div>
            <div className="rounded-[1.25rem] bg-slate-50 p-4">
              <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Ref.</p>
              <p className="mt-2 font-mono text-lg font-semibold text-slate-950">
                {parsedVariant?.referenceAllele ?? "N/A"}
              </p>
            </div>
            <div className="rounded-[1.25rem] bg-slate-50 p-4">
              <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Alt.</p>
              <p className="mt-2 font-mono text-lg font-semibold text-slate-950">
                {parsedVariant?.alternateAllele ?? "N/A"}
              </p>
            </div>
            <div className="rounded-[1.25rem] bg-slate-50 p-4">
              <p className="text-xs uppercase tracking-[0.2em] text-slate-400">
                Samples
              </p>
              <p className="mt-2 text-lg font-semibold text-slate-950">
                {sampleCount === null ? "Run search" : formatInteger(sampleCount)}
              </p>
            </div>
            <div className="rounded-[1.25rem] bg-slate-50 p-4">
              <p className="text-xs uppercase tracking-[0.2em] text-slate-400">
                Global AF
              </p>
              <p className="mt-2 text-lg font-semibold text-slate-950">
                {globalAlleleFrequency === null
                  ? "Run search"
                  : formatAlleleFrequency(globalAlleleFrequency)}
              </p>
            </div>
          </div>
        </form>

        {hasQuery && !parsedVariant ? (
          <div className="mt-5 rounded-[1.25rem] border border-amber-200 bg-amber-50 px-4 py-3 text-sm leading-6 text-amber-900">
            Invalid HGVS genomic notation. Use the generic format{" "}
            <span className="font-mono">g.&lt;position&gt;&lt;ref&gt;&gt;&lt;alt&gt;</span>,
            for example <span className="font-mono">g.112534G&gt;C</span>.
          </div>
        ) : null}

        {searchStatus === "loading" ? (
          <div className="mt-5 rounded-[1.35rem] border border-slate-200 bg-slate-50 p-6 text-sm leading-7 text-slate-600">
            Searching variant observations in the public global scope.
          </div>
        ) : null}

        {searchStatus === "error" ? (
          <div className="mt-5 rounded-[1.25rem] border border-red-200 bg-red-50 px-4 py-3 text-sm leading-6 text-red-900">
            {searchError}
          </div>
        ) : null}

        {isEmptyResult && parsedVariant ? (
          <div className="mt-5 rounded-[1.35rem] border border-dashed border-slate-200 bg-slate-50 p-6 text-sm leading-7 text-slate-600">
            No variants found for{" "}
            <span className="font-mono font-semibold">{parsedVariant.variant}</span>
            {referenceGenome ? (
              <>
                {" "}
                in <span className="font-mono font-semibold">{referenceGenome}</span>
              </>
            ) : null}
            . The backend returned an empty search result for the public global scope and
            filters.
          </div>
        ) : null}

        {searchStatus === "success" && searchResult ? (
          <div className="mt-6 overflow-x-auto rounded-[1.35rem] border border-slate-200 bg-white">
            <table className="min-w-[1180px] w-full text-left text-sm">
              <thead className="bg-slate-50 text-xs uppercase tracking-[0.18em] text-slate-400">
                <tr>
                  <th className="px-4 py-3 font-semibold">sample_id</th>
                  <th className="px-4 py-3 font-semibold">variant</th>
                  <th className="px-4 py-3 font-semibold">allele_frequency</th>
                  <th className="px-4 py-3 font-semibold">depth</th>
                  <th className="px-4 py-3 font-semibold">Type</th>
                  <th className="px-4 py-3 font-semibold">Ref.</th>
                  <th className="px-4 py-3 font-semibold">Alt.</th>
                  <th className="px-4 py-3 font-semibold">gene region</th>
                  <th className="px-4 py-3 font-semibold">effect</th>
                  <th className="px-4 py-3 font-semibold">functional class</th>
                  <th className="px-4 py-3 font-semibold">locus name</th>
                  <th className="px-4 py-3 font-semibold">locus id</th>
                  <th className="px-4 py-3 font-semibold">aminoacid change</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {rows.length > 0 ? (
                  rows.map((row, index) => (
                    <tr key={`${row.sampleId}-${row.variant}-${row.locusId}-${index}`}>
                      <td className="px-4 py-4 font-semibold text-slate-950">
                        {row.sampleId}
                      </td>
                      <td className="px-4 py-4 font-mono text-slate-900">
                        {row.variant}
                      </td>
                      <td className="px-4 py-4">
                        {formatAlleleFrequency(row.alleleFrequency)}
                      </td>
                      <td className="px-4 py-4">{formatNullableNumber(row.depth)}</td>
                      <td className="px-4 py-4">{formatNullableText(row.type)}</td>
                      <td className="px-4 py-4 font-mono">{row.referenceAllele}</td>
                      <td className="px-4 py-4 font-mono">{row.alternateAllele}</td>
                      <td className="px-4 py-4">{formatNullableText(row.geneRegion)}</td>
                      <td className="px-4 py-4">{formatNullableText(row.effect)}</td>
                      <td className="px-4 py-4">
                        {formatNullableText(row.functionalClass)}
                      </td>
                      <td className="px-4 py-4">{formatNullableText(row.locusName)}</td>
                      <td className="px-4 py-4">{formatNullableText(row.locusId)}</td>
                      <td className="px-4 py-4">
                        {formatNullableText(row.aminoacidChange)}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td className="px-4 py-6 text-sm leading-6 text-slate-500" colSpan={13}>
                      No variant rows were returned for this search.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        ) : null}
      </CardContent>
    </Card>
  );
}
