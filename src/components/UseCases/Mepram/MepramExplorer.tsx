"use client";

import { useEffect, useState, useMemo, Fragment } from "react";
import { Surface, SectionHeading } from "@/components/mepram/MepramPrimitives";
import { Button } from "@/components/ui/button";
import { MepramExplorerMap } from "./databrowser/mepram-explorer-map";
import { MepramPageHeader } from "./databrowser/mepram-page-header";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Loader2,
  AlertCircle,
  Search,
  Table,
  RefreshCw,
  Lock,
  LogIn,
  SlidersHorizontal,
  X,
  ChevronDown,
  ChevronRight,
  User,
} from "lucide-react";
import type { MepramExplorerRow, MepramAmrGeneRecord } from "@/types/mepram";
import { useAuth } from "hooks/use-auth";
import Link from "next/link";

interface DataColumn {
  id: string;
  label: string;
  kind: string;
  source: string;
}

interface BackendResponse {
  data_contract_version: string;
  project_name: string;
  project_label: string;
  columns: DataColumn[];
  matched_samples: number;
  total_loaded: number;
  total_samples: number;
  rows: MepramExplorerRow[];
  generated_at?: string;
  notes?: string[];
  filter_options?: {
    collection_date_min?: string;
    collection_date_max?: string;
    pathogens?: string[];
    autonomous_communities?: string[];
    provinces?: string[];
    centers?: string[];
    infection_types?: string[];
    genes?: string[];
    alleles?: string[];
    classifications?: string[];
    bla_groups?: string[];
  };
  query?: {
    page: number;
    page_size: number;
    filters: Record<string, any>;
  };
}

type ExplorerViewMode = "sample" | "gene";

function SelectField({
  label,
  onChange,
  options,
  value,
}: {
  label: string;
  onChange: (value: string) => void;
  options: string[];
  value: string;
}) {
  return (
    <div className="grid gap-2">
      <span className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">
        {label}
      </span>
      <select
        className="h-11 rounded-2xl border border-slate-200 bg-white px-4 text-sm text-slate-700 outline-none transition focus:border-slate-400"
        onChange={(event) => onChange(event.target.value)}
        value={value}
      >
        <option value="">Todos</option>
        {options.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
    </div>
  );
}

function DateField({
  label,
  max,
  min,
  onChange,
  value,
}: {
  label: string;
  max?: string;
  min?: string;
  onChange: (value: string) => void;
  value: string;
}) {
  return (
    <div className="grid gap-2">
      <span className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">
        {label}
      </span>
      <input
        className="h-11 rounded-2xl border border-slate-200 bg-white px-4 text-sm text-slate-700 outline-none transition focus:border-slate-400"
        max={max}
        min={min}
        onChange={(event) => onChange(event.target.value)}
        type="date"
        value={value}
      />
    </div>
  );
}

function MultiValueFilter({
  label,
  onChange,
  options,
  placeholder,
  selected,
}: {
  label: string;
  onChange: (values: string[]) => void;
  options: string[];
  placeholder: string;
  selected: string[];
}) {
  const [draft, setDraft] = useState("");
  const normalizedDraft = draft.trim().toLowerCase();
  const suggestions = options
    .filter((option) => !selected.includes(option))
    .filter((option) =>
      normalizedDraft ? option.toLowerCase().includes(normalizedDraft) : true
    )
    .slice(0, 6);

  const addValue = (value: string) => {
    const cleaned = value.trim();
    if (!cleaned || selected.includes(cleaned)) return;
    onChange([...selected, cleaned]);
    setDraft("");
  };

  return (
    <div className="grid gap-2">
      <span className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">
        {label}
      </span>
      <div className="flex min-h-11 flex-wrap items-center gap-2 rounded-2xl border border-slate-200 bg-white px-3 py-2">
        {selected.map((value) => (
          <span
            className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-700"
            key={value}
          >
            {value}
            <button
              className="rounded-full p-0.5 text-slate-400 hover:bg-white hover:text-slate-700"
              onClick={() =>
                onChange(
                  selected.filter((selectedValue) => selectedValue !== value)
                )
              }
              title={`Remove ${value}`}
              type="button"
            >
              <X className="h-3 w-3" />
            </button>
          </span>
        ))}
        <div className="relative min-w-40 flex-1">
          <input
            className="h-8 w-full bg-transparent text-sm text-slate-700 outline-none placeholder:text-slate-400"
            onChange={(event) => setDraft(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "Enter") {
                event.preventDefault();
                addValue(suggestions[0] ?? draft);
              }
            }}
            placeholder={selected.length > 0 ? "Añadir otro" : placeholder}
            value={draft}
          />
          {draft && suggestions.length > 0 ? (
            <div className="absolute left-0 top-9 z-20 grid w-full min-w-56 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-lg">
              {suggestions.map((option) => (
                <button
                  className="px-3 py-2 text-left text-sm text-slate-700 hover:bg-slate-50"
                  key={option}
                  onMouseDown={(event) => {
                    event.preventDefault();
                    addValue(option);
                  }}
                  type="button"
                >
                  {option}
                </button>
              ))}
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}

function normalizeSequenceType(value: string | null | undefined) {
  if (!value) return "";
  return value.toUpperCase().replace(/[\s-]/g, "").replace(/^ST/, "");
}

function searchTokens(value: string) {
  return value
    .trim()
    .toLowerCase()
    .split(/[\s,;|]+/)
    .filter(Boolean);
}

function recordBlaGroup(record: MepramAmrGeneRecord) {
  const classification = record.classification?.toLowerCase().replace("-", "_");
  if (classification === "bla_carb") return "bla_carb";
  if (classification?.startsWith("bla_esbl")) return "bla_esbl";
  return null;
}

function selectedIncludes(values: string[], value: string | null | undefined) {
  const normalizedValue = value?.toLowerCase();
  return values.some(
    (selectedValue) => selectedValue.toLowerCase() === normalizedValue
  );
}

function rowSearchText(row: MepramExplorerRow) {
  const r = row as Record<string, any>;
  const records: MepramAmrGeneRecord[] =
    r.amr_gene_records || r.amrGeneRecords || [];

  const recordValues = records.flatMap((record) => [
    record.gene,
    record.allele,
    record.classification,
    record.origin,
    record.label,
  ]);

  const sId = r.sample_unique_id || r.sampleId;
  const seqId = r.sequencing_sample_id || r.sequencingSampleId;
  const inst = r.submitting_institution || r.submittingInstitution;
  const prov = r.province;
  const spec = r.species;
  const specGrp = r.species_group || r.speciesGroup;
  const st = r.sequence_type || r.sequenceType;
  const g = r.amr_gene || r.amrGene;
  const a = r.amr_allele || r.amrAllele;
  const c = r.amr_classification || r.amrClassification;
  const bc = r.bla_carb || r.blaCarb;
  const be = r.bla_esbl || r.blaEsbl;

  return [
    sId,
    seqId,
    inst,
    prov,
    spec,
    specGrp,
    st,
    g,
    a,
    c,
    bc,
    be,
    ...recordValues,
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();
}

function rowHasAllRecordValues(
  row: MepramExplorerRow,
  key: "allele" | "classification" | "gene",
  values: string[]
) {
  const r = row as Record<string, any>;
  const records: MepramAmrGeneRecord[] = r.amr_gene_records || r.amrGeneRecords;
  if (!records) return false;
  const availableValues = new Set(
    records.map((record) => record[key]?.toLowerCase() ?? "")
  );
  return values.every((value) => availableValues.has(value.toLowerCase()));
}

function rowHasAllBlaGroups(row: MepramExplorerRow, values: string[]) {
  const r = row as Record<string, any>;
  const records: MepramAmrGeneRecord[] = r.amr_gene_records || r.amrGeneRecords;
  if (!records) return false;
  const availableGroups = new Set(
    records
      .map((record) => recordBlaGroup(record))
      .filter(Boolean)
      .map((value) => String(value).toLowerCase())
  );
  return values.every((value) => availableGroups.has(value.toLowerCase()));
}

function recordMatchesSelectedFilters(
  record: MepramAmrGeneRecord,
  filters: {
    alleles: string[];
    blaGroups: string[];
    classifications: string[];
    genes: string[];
  }
) {
  const hasAmrFilters =
    filters.genes.length > 0 ||
    filters.alleles.length > 0 ||
    filters.classifications.length > 0 ||
    filters.blaGroups.length > 0;

  if (!hasAmrFilters) return true;

  return (
    selectedIncludes(filters.genes, record.gene) ||
    selectedIncludes(filters.alleles, record.allele) ||
    selectedIncludes(filters.classifications, record.classification) ||
    selectedIncludes(filters.blaGroups, recordBlaGroup(record))
  );
}

export function MepramExplorer() {
  const { login, accessToken } = useAuth();
  const [data, setData] = useState<BackendResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const [viewMode, setViewMode] = useState<ExplorerViewMode>("sample");
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [pathogen, setPathogen] = useState<string>("");
  const [region, setRegion] = useState<string>("");
  const [province, setProvince] = useState<string>("");
  const [sequenceType, setSequenceType] = useState<string>("");
  const [dateFrom, setDateFrom] = useState<string>("");
  const [dateTo, setDateTo] = useState<string>("");

  const [showAdvanced, setShowAdvanced] = useState<boolean>(false);
  const [center, setCenter] = useState<string>("");
  const [infectionType, setInfectionType] = useState<string>("");
  const [selectedGenes, setSelectedGenes] = useState<string[]>([]);
  const [selectedAlleles, setSelectedAlleles] = useState<string[]>([]);
  const [selectedClassifications, setSelectedClassifications] = useState<
    string[]
  >([]);
  const [selectedBlaGroups, setSelectedBlaGroups] = useState<string[]>([]);

  const [expandedSampleId, setExpandedSampleId] = useState<string | null>(null);
  const [activePage, setCurrentPage] = useState<number>(1);
  const itemsPerPage = 10;
  const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || "/api/pathocore/v1";
  const fetchData = async () => {
    if (!accessToken) return;
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(
        `${baseUrl}/use-cases/isolate-explorer?project_name=mepram`,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );
      if (!response.ok) {
        setError(`Server error: ${response.status} ${response.statusText}`);
        setLoading(false);
        return;
      }
      const json: BackendResponse = await response.json();
      setData(json);
    } catch (err: any) {
      console.error("Error retrieving Isolate Explorer data:", err);
      setError(err.message || "Unable to load isolate data.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (accessToken) {
      void fetchData();
    } else {
      setLoading(false);
    }
  }, [accessToken]);

  const filterOptions = useMemo(() => {
    if (!data) {
      return {
        pathogens: [],
        autonomousCommunities: [],
        provinces: [],
        centers: [],
        infectionTypes: [],
        genes: [],
        alleles: [],
        classifications: [],
        blaGroups: ["bla_carb", "bla_esbl"],
        dateMin: "",
        dateMax: "",
      };
    }

    return {
      pathogens: data.filter_options?.pathogens || [],
      autonomousCommunities: data.filter_options?.autonomous_communities || [],
      provinces: data.filter_options?.provinces || [],
      centers: data.filter_options?.centers || [],
      infectionTypes: data.filter_options?.infection_types || [],
      genes: data.filter_options?.genes || [],
      alleles: data.filter_options?.alleles || [],
      classifications: data.filter_options?.classifications || [],
      blaGroups: data.filter_options?.bla_groups || ["bla_carb", "bla_esbl"],
      dateMin: data.filter_options?.collection_date_min || "",
      dateMax: data.filter_options?.collection_date_max || "",
    };
  }, [data]);

  const filteredRows = useMemo(() => {
    if (!data?.rows) return [];

    const normalizedSearchTokens = searchTokens(searchTerm);
    const normalizedST = normalizeSequenceType(sequenceType);

    return data.rows.filter((row) => {
      const r = row as Record<string, any>;

      if (pathogen && r.pathogen !== pathogen) return false;

      const regionValue =
        r.region || r.collecting_region || r.submitting_region;
      if (region && regionValue !== region) return false;

      const provinceValue =
        r.province || r.collecting_province || r.submitting_province;
      if (province && provinceValue !== province) return false;

      const stValue = r.sequence_type || r.sequenceType;
      if (
        normalizedST &&
        !normalizeSequenceType(stValue).includes(normalizedST)
      ) {
        return false;
      }

      const institutionValue =
        r.submitting_institution || r.submittingInstitution;
      if (center && institutionValue !== center) return false;

      const infTypeValue = r.infection_type || r.infectionType;
      if (infectionType && infTypeValue !== infectionType) return false;

      if (
        selectedGenes.length > 0 &&
        !rowHasAllRecordValues(row, "gene", selectedGenes)
      ) {
        return false;
      }
      if (
        selectedAlleles.length > 0 &&
        !rowHasAllRecordValues(row, "allele", selectedAlleles)
      ) {
        return false;
      }
      if (
        selectedClassifications.length > 0 &&
        !rowHasAllRecordValues(row, "classification", selectedClassifications)
      ) {
        return false;
      }
      if (
        selectedBlaGroups.length > 0 &&
        !rowHasAllBlaGroups(row, selectedBlaGroups)
      ) {
        return false;
      }

      const rowDate = r.collection_date || r.collectionDate;
      if (dateFrom && rowDate && rowDate < dateFrom) return false;
      if (dateTo && rowDate && rowDate > dateTo) return false;

      if (normalizedSearchTokens.length === 0) return true;

      const text = rowSearchText(row);
      return normalizedSearchTokens.every((token) => text.includes(token));
    });
  }, [
    data,
    searchTerm,
    pathogen,
    region,
    province,
    sequenceType,
    center,
    infectionType,
    selectedGenes,
    selectedAlleles,
    selectedClassifications,
    selectedBlaGroups,
    dateFrom,
    dateTo,
  ]);

  const geneRows = useMemo(() => {
    const activeAmrFilters = {
      alleles: selectedAlleles,
      blaGroups: selectedBlaGroups,
      classifications: selectedClassifications,
      genes: selectedGenes,
    };

    return filteredRows
      .flatMap((row) => {
        const r = row as Record<string, any>;
        const records: MepramAmrGeneRecord[] =
          r.amr_gene_records || r.amrGeneRecords || [];
        return records.map((record) => ({ record, sample: row }));
      })
      .filter((row) =>
        recordMatchesSelectedFilters(row.record, activeAmrFilters)
      );
  }, [
    filteredRows,
    selectedAlleles,
    selectedBlaGroups,
    selectedClassifications,
    selectedGenes,
  ]);

  const visibleRowCount =
    viewMode === "sample" ? filteredRows.length : geneRows.length;

  const mapRows = useMemo(() => {
    if (viewMode === "sample") return filteredRows;
    return Array.from(
      new Map(
        geneRows.map((row) => {
          const r = row.sample as Record<string, any>;
          const sId = r.sample_unique_id || r.sampleId || "";
          return [sId, row.sample];
        })
      ).values()
    );
  }, [filteredRows, geneRows, viewMode]);

  const advancedActiveCount = [
    center,
    infectionType,
    ...selectedGenes,
    ...selectedAlleles,
    ...selectedClassifications,
    ...selectedBlaGroups,
  ].filter(Boolean).length;

  const totalPages =
    Math.max(1, Math.ceil(visibleRowCount / itemsPerPage)) || 1;
  const activePageClamped = Math.min(activePage, totalPages);
  const startIndex = (activePageClamped - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;

  const paginatedRows = useMemo(() => {
    return filteredRows.slice(startIndex, endIndex);
  }, [startIndex, endIndex, filteredRows]);

  const paginatedGeneRows = useMemo(() => {
    return geneRows.slice(startIndex, endIndex);
  }, [startIndex, endIndex, geneRows]);

  const pageStart = visibleRowCount > 0 ? startIndex + 1 : 0;
  const pageEnd = Math.min(endIndex, visibleRowCount);

  useEffect(() => {
    setCurrentPage(1);
  }, [
    searchTerm,
    pathogen,
    region,
    province,
    sequenceType,
    viewMode,
    center,
    infectionType,
    selectedGenes,
    selectedAlleles,
    selectedClassifications,
    selectedBlaGroups,
    dateFrom,
    dateTo,
  ]);

  const resetFilters = () => {
    setSearchTerm("");
    setPathogen("");
    setRegion("");
    setProvince("");
    setSequenceType("");
    setSelectedGenes([]);
    setSelectedAlleles([]);
    setSelectedClassifications([]);
    setSelectedBlaGroups([]);
    setCenter("");
    setInfectionType("");
    setDateFrom("");
    setDateTo("");
    setExpandedSampleId(null);
  };

  const isUnauthorized =
    error?.includes("401") ||
    error?.toLowerCase().includes("unauthorized") ||
    !accessToken;

  if (isUnauthorized) {
    return (
      <div className="space-y-6 animate-in fade-in duration-700">
        <MepramPageHeader
          currentSection="Isolate explorer"
          sectionDescription="Operational search and filtering of isolates with territorial distribution."
        />

        <div className="flex min-h-[45vh] items-center justify-center px-4 py-8">
          <Surface className="w-full max-w-md border border-slate-100 p-8 text-center rounded-[24px] shadow-xl bg-white/80 backdrop-blur-sm">
            {/* Ícono superior */}
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-amber-50 text-amber-600 border border-amber-200">
              <Lock className="h-5 w-5" />
            </div>

            {/* Título */}
            <h2 className="text-xl font-bold text-slate-800 tracking-tight">
              Authentication Required
            </h2>

            {/* Párrafos con color de texto unificado */}
            <div className="mt-2 space-y-3 text-sm text-slate-600 leading-relaxed">
              <p>
                The Isolate Explorer section requires an active session to
                securely access backend endpoints.
              </p>
              <p>
                Click the button below to be redirected to the secure Keycloak
                login panel and synchronize the Data Browser.
              </p>
            </div>

            {/* Botones del mismo tamaño y con margen de separación */}
            <div className="mt-6 flex flex-col gap-3">
              <Button
                onClick={() => {
                  if (typeof login === "function") {
                    void login();
                  } else {
                    console.error(
                      "The 'login' method is not available in the useAuth hook."
                    );
                  }
                }}
                className="flex w-full items-center justify-center gap-2 rounded-full bg-[#4D45E1] py-2.5 text-sm font-medium text-white shadow-md transition-all hover:bg-slate-800 active:scale-[0.98]"
              >
                <LogIn className="h-4 w-4" />
                Sign In with Keycloak
              </Button>

              <Link
                href="/signin"
                className="flex w-full items-center justify-center gap-2 rounded-full bg-[#4D45E1] py-2.5 text-sm font-medium text-white shadow-md transition-all hover:bg-slate-800 active:scale-[0.98]"
              >
                <User className="h-4 w-4" />
                Sign in
              </Link>
            </div>
          </Surface>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="space-y-10 animate-in fade-in duration-500">
        <MepramPageHeader
          currentSection="Isolate explorer"
          sectionDescription="Operational search and filtering of isolates with territorial distribution."
        />
        <Surface className="p-12 flex flex-col items-center justify-center min-h-[400px] space-y-4">
          <Loader2 className="w-8 h-8 animate-spin text-slate-600" />
          <p className="text-xs font-bold text-slate-400 uppercase tracking-widest animate-pulse">
            Loading Isolate Explorer records...
          </p>
        </Surface>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="space-y-10 animate-in fade-in duration-500">
        <MepramPageHeader
          currentSection="Isolate explorer"
          sectionDescription="Operational search and filtering of isolates with territorial distribution."
        />
        <Surface className="p-8 border border-red-100 bg-red-50/50 rounded-[24px] flex flex-col items-center justify-center min-h-[300px] text-center">
          <AlertCircle className="w-10 h-10 text-red-50 mb-3" />
          <h3 className="text-base font-bold text-slate-800">
            API Connection Error
          </h3>
          <p className="text-sm text-slate-500 mt-1 max-w-md">{error}</p>
          <Button
            onClick={() => void fetchData()}
            className="mt-6 flex items-center gap-2 rounded-xl bg-slate-900 text-white hover:bg-slate-800"
          >
            <RefreshCw className="w-4 h-4" />
            Retry Connection
          </Button>
        </Surface>
      </div>
    );
  }

  return (
    <div className="space-y-10 animate-in fade-in duration-500">
      <MepramPageHeader
        currentSection="Isolate explorer"
        sectionDescription="Operational search and filtering of isolates with territorial distribution."
      />

      <Surface className="p-6 space-y-6">
        <div className="mb-2">
          <SectionHeading
            title="Isolate Explorer"
            description="Operational search and filtering of isolates with territorial distribution."
            action={
              <Badge variant="secondary">
                {viewMode === "sample"
                  ? `${filteredRows.length} / ${data.total_samples} samples`
                  : `${geneRows.length} gene rows`}
              </Badge>
            }
          />
        </div>

        <div className="rounded-[1.7rem] border border-slate-200 bg-slate-50/80 p-5">
          <div className="grid gap-3 lg:grid-cols-[minmax(0,1.3fr)_auto] lg:items-end">
            <div className="grid gap-2">
              <span className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">
                Free search · optional
              </span>
              <div className="relative group">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-slate-700 transition-colors" />
                <Input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Example: MEP0001 KPC CTX-M"
                  className="w-full pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-sm outline-none focus:ring-4 focus:ring-slate-900/5 focus:border-slate-400 transition-all"
                />
              </div>
              <p className="text-xs leading-6 text-slate-500">
                The search separates terms by spaces or commas. KPC CTX-M Find
                samples that contain both terms.
              </p>
            </div>

            <div className="flex flex-wrap gap-2 lg:justify-end">
              <div className="inline-flex rounded-full border border-slate-200 bg-white p-1">
                <Button
                  onClick={() => setViewMode("sample")}
                  size="sm"
                  type="button"
                  variant={viewMode === "sample" ? "secondary" : "ghost"}
                >
                  By sample
                </Button>
                <Button
                  onClick={() => setViewMode("gene")}
                  size="sm"
                  type="button"
                  variant={viewMode === "gene" ? "secondary" : "ghost"}
                >
                  By gene
                </Button>
              </div>
              <Button onClick={resetFilters} size="sm" variant="outline">
                Clean filters
              </Button>
            </div>
          </div>
        </div>

        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-5">
          <DateField
            label="Date collected from"
            min={filterOptions.dateMin}
            max={filterOptions.dateMax}
            onChange={setDateFrom}
            value={dateFrom}
          />
          <DateField
            label="Date collected until"
            min={filterOptions.dateMin}
            max={filterOptions.dateMax}
            onChange={setDateTo}
            value={dateTo}
          />
          <SelectField
            label="Pathogen"
            onChange={setPathogen}
            options={filterOptions.pathogens}
            value={pathogen}
          />
          <SelectField
            label="Autonomous community"
            onChange={setRegion}
            options={filterOptions.autonomousCommunities}
            value={region}
          />
          <SelectField
            label="Province"
            onChange={setProvince}
            options={filterOptions.provinces}
            value={province}
          />
          <div className="grid gap-2">
            <span className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">
              ST
            </span>
            <Input
              className="rounded-2xl border-slate-200 bg-white"
              onChange={(event) => setSequenceType(event.target.value)}
              placeholder="Example: ST307"
              value={sequenceType}
            />
          </div>
        </div>

        <div className="rounded-[1.7rem] border border-slate-200 bg-white p-5">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">
                Advanced filters
              </p>
              <p className="mt-2 text-sm leading-6 text-slate-500">
                Type of infection, referring center and AMR combinations by
                gene, allele or classification.
              </p>
            </div>
            <Button
              onClick={() => setShowAdvanced((current) => !current)}
              size="sm"
              variant="outline"
            >
              <SlidersHorizontal className="h-4 w-4" />
              {showAdvanced ? "Hide filters" : "Show filters"}
              {advancedActiveCount > 0 ? ` (${advancedActiveCount})` : ""}
            </Button>
          </div>

          {showAdvanced && (
            <div className="mt-5 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
              <SelectField
                label="Sending center"
                onChange={setCenter}
                options={filterOptions.centers}
                value={center}
              />
              <SelectField
                label="Type of infection"
                onChange={setInfectionType}
                options={filterOptions.infectionTypes}
                value={infectionType}
              />
              <MultiValueFilter
                label="Gene"
                onChange={setSelectedGenes}
                options={filterOptions.genes}
                placeholder="Example: KPC"
                selected={selectedGenes}
              />
              <MultiValueFilter
                label="Allele"
                onChange={setSelectedAlleles}
                options={filterOptions.alleles}
                placeholder="Example: blaKPC-2"
                selected={selectedAlleles}
              />
              <MultiValueFilter
                label="Classification"
                onChange={setSelectedClassifications}
                options={filterOptions.classifications}
                placeholder="Example: Bla_Carb"
                selected={selectedClassifications}
              />
              <MultiValueFilter
                label="bla group"
                onChange={setSelectedBlaGroups}
                options={filterOptions.blaGroups}
                placeholder="Example: bla_carb"
                selected={selectedBlaGroups}
              />
            </div>
          )}
        </div>

        <div className="flex items-center gap-3 text-xs font-mono text-slate-500 bg-slate-50 p-3 rounded-xl border border-slate-100">
          <Table className="w-4 h-4 text-slate-400" />
          <span>
            Matches: <strong>{visibleRowCount}</strong> / {data.total_samples}{" "}
            samples
          </span>
        </div>

        <div className="overflow-hidden rounded-[1.35rem] border border-slate-200 bg-white shadow-sm">
          <div className="overflow-x-auto">
            {viewMode === "sample" ? (
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50/70">
                    <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-wider whitespace-nowrap">
                      Sample ID
                    </th>
                    <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-wider whitespace-nowrap">
                      Collection date
                    </th>
                    <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-wider whitespace-nowrap">
                      CCAA
                    </th>
                    <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-wider whitespace-nowrap">
                      Province
                    </th>
                    <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-wider whitespace-nowrap">
                      Species
                    </th>
                    <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-wider whitespace-nowrap">
                      Group
                    </th>
                    <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-wider whitespace-nowrap">
                      ST
                    </th>
                    <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-wider whitespace-nowrap">
                      Gene
                    </th>
                    <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-wider whitespace-nowrap">
                      Allele
                    </th>
                    <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-wider whitespace-nowrap">
                      Classification
                    </th>
                    <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-wider whitespace-nowrap">
                      bla_carb
                    </th>
                    <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-wider whitespace-nowrap">
                      bla_esbl
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {paginatedRows.length > 0 ? (
                    paginatedRows.map((row, rowIndex) => {
                      const r = row as Record<string, any>;
                      const rowId =
                        r.sample_unique_id || r.sampleId || String(rowIndex);
                      const isExpanded = expandedSampleId === rowId;
                      const records: MepramAmrGeneRecord[] =
                        r.amr_gene_records || r.amrGeneRecords || [];
                      const canExpand = records.length > 1;

                      return (
                        <Fragment key={rowId}>
                          <tr className="hover:bg-slate-50/60 transition-colors">
                            <td className="p-4 text-sm font-medium text-slate-700 font-mono whitespace-nowrap">
                              {r.sample_unique_id ?? r.sampleId ?? "N/A"}
                            </td>
                            <td className="p-4 text-sm font-medium text-slate-700 font-mono whitespace-nowrap">
                              {r.collection_date ?? r.collectionDate ?? "N/A"}
                            </td>
                            <td className="p-4 text-sm font-medium text-slate-700 font-mono whitespace-nowrap">
                              {r.region ??
                                r.collecting_region ??
                                r.submitting_region ??
                                "N/A"}
                            </td>
                            <td className="p-4 text-sm font-medium text-slate-700 font-mono whitespace-nowrap">
                              {r.province ??
                                r.collecting_province ??
                                r.submitting_province ??
                                "N/A"}
                            </td>
                            <td className="p-4 text-sm font-medium text-slate-700 font-mono whitespace-nowrap">
                              {r.species ?? "N/A"}
                            </td>
                            <td className="p-4 text-sm font-medium text-slate-700 font-mono whitespace-nowrap">
                              {r.species_group ?? r.speciesGroup ?? "N/A"}
                            </td>
                            <td className="p-4 text-sm font-medium text-slate-700 font-mono whitespace-nowrap">
                              {r.sequence_type ?? r.sequenceType ?? "N/A"}
                            </td>
                            <td className="p-4 text-sm font-medium text-slate-700 font-mono whitespace-nowrap">
                              <div className="flex items-center gap-2">
                                {canExpand && (
                                  <Button
                                    className="h-7 w-7 p-0"
                                    onClick={() =>
                                      setExpandedSampleId(
                                        isExpanded ? null : rowId
                                      )
                                    }
                                    size="icon"
                                    type="button"
                                    variant="outline"
                                  >
                                    {isExpanded ? (
                                      <ChevronDown className="h-4 w-4" />
                                    ) : (
                                      <ChevronRight className="h-4 w-4" />
                                    )}
                                  </Button>
                                )}
                                <span>{r.amr_gene ?? r.amrGene ?? "N/A"}</span>
                              </div>
                            </td>
                            <td className="p-4 text-sm font-medium text-slate-700 font-mono whitespace-nowrap">
                              {r.amr_allele ?? r.amrAllele ?? "N/A"}
                            </td>
                            <td className="p-4 text-sm font-medium text-slate-700 font-mono whitespace-nowrap">
                              {r.amr_classification ??
                                r.amrClassification ??
                                "N/A"}
                            </td>
                            <td className="p-4 text-sm font-medium text-slate-700 font-mono whitespace-nowrap">
                              {r.bla_carb ?? r.blaCarb ?? "N/A"}
                            </td>
                            <td className="p-4 text-sm font-medium text-slate-700 font-mono whitespace-nowrap">
                              {r.bla_esbl ?? r.blaEsbl ?? "N/A"}
                            </td>
                          </tr>

                          {isExpanded && records.length > 0 && (
                            <tr className="bg-slate-50/70 border-t border-slate-200">
                              <td className="p-4" colSpan={12}>
                                <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white">
                                  <table className="min-w-full text-xs">
                                    <thead className="bg-slate-50 text-left text-slate-500 border-b border-slate-100">
                                      <tr>
                                        <th className="px-3 py-2 font-medium uppercase tracking-wider">
                                          Gene
                                        </th>
                                        <th className="px-3 py-2 font-medium uppercase tracking-wider">
                                          Allele
                                        </th>
                                        <th className="px-3 py-2 font-medium uppercase tracking-wider">
                                          Classification
                                        </th>
                                        <th className="px-3 py-2 font-medium uppercase tracking-wider">
                                          Origin
                                        </th>
                                      </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100">
                                      {records.map((record, idx) => (
                                        <tr
                                          key={idx}
                                          className="text-slate-600 font-mono"
                                        >
                                          <td className="px-3 py-2">
                                            {record.gene || "N/A"}
                                          </td>
                                          <td className="px-3 py-2">
                                            {record.allele || "N/A"}
                                          </td>
                                          <td className="px-3 py-2">
                                            {record.classification || "N/A"}
                                          </td>
                                          <td className="px-3 py-2">
                                            {record.origin || "N/A"}
                                          </td>
                                        </tr>
                                      ))}
                                    </tbody>
                                  </table>
                                </div>
                              </td>
                            </tr>
                          )}
                        </Fragment>
                      );
                    })
                  ) : (
                    <tr>
                      <td
                        colSpan={12}
                        className="p-12 text-center text-sm text-slate-400 font-medium"
                      >
                        No isolates were found matching the search criteria.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            ) : (
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50/70">
                    <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-wider whitespace-nowrap">
                      Sample ID
                    </th>
                    <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-wider whitespace-nowrap">
                      Collection Date
                    </th>
                    <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-wider whitespace-nowrap">
                      CCAA
                    </th>
                    <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-wider whitespace-nowrap">
                      Province
                    </th>
                    <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-wider whitespace-nowrap">
                      Species
                    </th>
                    <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-wider whitespace-nowrap">
                      Group
                    </th>
                    <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-wider whitespace-nowrap">
                      ST
                    </th>
                    <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-wider whitespace-nowrap">
                      Gene
                    </th>
                    <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-wider whitespace-nowrap">
                      Allele
                    </th>
                    <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-wider whitespace-nowrap">
                      Classification
                    </th>
                    <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-wider whitespace-nowrap">
                      bla_carb
                    </th>
                    <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-wider whitespace-nowrap">
                      bla_esbl
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {paginatedGeneRows.length > 0 ? (
                    paginatedGeneRows.map(({ record, sample }, index) => {
                      const r = sample as Record<string, any>;
                      const regionValue =
                        r.region || r.collecting_region || r.submitting_region;
                      const provinceValue =
                        r.province ||
                        r.collecting_province ||
                        r.submitting_province;
                      const sId = r.sample_unique_id || r.sampleId;
                      const rowDate = r.collection_date || r.collectionDate;
                      const stValue = r.sequence_type || r.sequenceType;

                      return (
                        <tr
                          key={index}
                          className="hover:bg-slate-50/60 transition-colors"
                        >
                          <td className="p-4 text-sm font-medium text-slate-700 font-mono whitespace-nowrap">
                            {sId ?? "N/A"}
                          </td>
                          <td className="p-4 text-sm font-medium text-slate-700 font-mono whitespace-nowrap">
                            {rowDate ?? "N/A"}
                          </td>
                          <td className="p-4 text-sm font-medium text-slate-700 font-mono whitespace-nowrap">
                            {regionValue ?? "N/A"}
                          </td>
                          <td className="p-4 text-sm font-medium text-slate-700 font-mono whitespace-nowrap">
                            {provinceValue ?? "N/A"}
                          </td>
                          <td className="p-4 text-sm font-medium text-slate-700 font-mono whitespace-nowrap">
                            {r.species ?? "N/A"}
                          </td>
                          <td className="p-4 text-sm font-medium text-slate-700 font-mono whitespace-nowrap">
                            {r.species_group ?? r.speciesGroup ?? "N/A"}
                          </td>
                          <td className="p-4 text-sm font-medium text-slate-700 font-mono whitespace-nowrap">
                            {stValue ?? "N/A"}
                          </td>
                          <td className="p-4 text-sm font-medium text-slate-700 font-mono whitespace-nowrap">
                            {record.gene ?? "N/A"}
                          </td>
                          <td className="p-4 text-sm font-medium text-slate-700 font-mono whitespace-nowrap">
                            {record.allele ?? "N/A"}
                          </td>
                          <td className="p-4 text-sm font-medium text-slate-700 font-mono whitespace-nowrap">
                            {record.classification ?? "N/A"}
                          </td>
                          <td className="p-4 text-sm font-medium text-slate-700 font-mono whitespace-nowrap">
                            {r.bla_carb ?? r.blaCarb ?? "N/A"}
                          </td>
                          <td className="p-4 text-sm font-medium text-slate-700 font-mono whitespace-nowrap">
                            {r.bla_esbl ?? r.blaEsbl ?? "N/A"}
                          </td>
                        </tr>
                      );
                    })
                  ) : (
                    <tr>
                      <td
                        colSpan={12}
                        className="p-12 text-center text-sm text-slate-400 font-medium"
                      >
                        No matching genes were found.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            )}
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3 bg-slate-50 px-4 py-3 text-sm text-slate-600 border-t border-slate-100">
            <span>
              Showing {pageStart}-{pageEnd} of {visibleRowCount} (
              {filteredRows.length} filtered records)
            </span>
            <div className="flex gap-2">
              <Button
                disabled={activePageClamped <= 1}
                onClick={() => setCurrentPage((page) => Math.max(1, page - 1))}
                className="rounded-xl border border-slate-200 bg-white hover:bg-slate-100 disabled:opacity-40 shadow-2xs text-slate-700 font-medium text-xs h-9 px-4"
              >
                Previous
              </Button>
              <Button
                disabled={activePageClamped >= totalPages}
                onClick={() =>
                  setCurrentPage((page) => Math.min(totalPages, page + 1))
                }
                className="rounded-xl border border-slate-200 bg-white hover:bg-slate-100 disabled:opacity-40 shadow-2xs text-slate-700 font-medium text-xs h-9 px-4"
              >
                Next
              </Button>
            </div>
          </div>
        </div>

        <MepramExplorerMap rows={mapRows} simulated={false} />
      </Surface>
    </div>
  );
}
