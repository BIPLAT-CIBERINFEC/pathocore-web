import { Fragment, useEffect, useMemo, useState } from "react";
import {
  ArrowUpDown,
  ChevronDown,
  ChevronRight,
  Search,
  SlidersHorizontal,
  X,
} from "lucide-react";
import { MepramExplorerMap } from "@/components/mepram/mepram-explorer-map";
import { SectionHeader } from "@/components/databrowser/section-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import type {
  MepramAmrGeneRecord,
  MepramExplorerData,
  MepramExplorerRow,
} from "@/types/mepram";

const PAGE_SIZE = 20;
type ExplorerViewMode = "gene" | "sample";
type GeneSortDirection = "asc" | "desc";
type GeneSortKey =
  | "allele"
  | "classification"
  | "collectionDate"
  | "gene"
  | "origin"
  | "province"
  | "region"
  | "sampleId"
  | "sequenceType"
  | "species"
  | "speciesGroup";

interface GeneExplorerRow {
  record: MepramAmrGeneRecord;
  sample: MepramExplorerRow;
}

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
    <label className="grid gap-2">
      <span className="text-xs font-medium uppercase tracking-[0.16em] text-slate-400">
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
    </label>
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
  max?: string | undefined;
  min?: string | undefined;
  onChange: (value: string) => void;
  value: string;
}) {
  return (
    <label className="grid gap-2">
      <span className="text-xs font-medium uppercase tracking-[0.16em] text-slate-400">
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
    </label>
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
      normalizedDraft ? option.toLowerCase().includes(normalizedDraft) : true,
    )
    .slice(0, 6);

  const addValue = (value: string) => {
    const cleaned = value.trim();

    if (!cleaned || selected.includes(cleaned)) {
      return;
    }

    onChange([...selected, cleaned]);
    setDraft("");
  };

  return (
    <div className="grid gap-2">
      <span className="text-xs font-medium uppercase tracking-[0.16em] text-slate-400">
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
                onChange(selected.filter((selectedValue) => selectedValue !== value))
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
  if (!value) {
    return "";
  }

  return value.toUpperCase().replace(/[\s-]/g, "").replace(/^ST/, "");
}

function sequenceTypeTitle(schemes: string[]) {
  if (schemes.length === 0) {
    return "No sequence type scheme available";
  }

  return `Scheme: ${schemes.join(" / ")}`;
}

function displayValue(value: string | null | undefined) {
  return value || "No data";
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

  if (classification === "bla_carb") {
    return "bla_carb";
  }
  if (classification?.startsWith("bla_esbl")) {
    return "bla_esbl";
  }

  return null;
}

function selectedIncludes(values: string[], value: string | null | undefined) {
  const normalizedValue = value?.toLowerCase();

  return values.some(
    (selectedValue) => selectedValue.toLowerCase() === normalizedValue,
  );
}

function rowSearchText(row: MepramExplorerRow) {
  const recordValues = row.amrGeneRecords.flatMap((record) => [
    record.gene,
    record.allele,
    record.classification,
    record.origin,
    record.label,
  ]);

  return [
    row.sampleId,
    row.sequencingSampleId,
    row.submittingInstitution,
    row.province,
    row.species,
    row.speciesGroup,
    row.sequenceType,
    row.amrGene,
    row.amrAllele,
    row.amrClassification,
    row.blaCarb,
    row.blaEsbl,
    ...recordValues,
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();
}

function rowHasAllRecordValues(
  row: MepramExplorerRow,
  key: "allele" | "classification" | "gene",
  values: string[],
) {
  const availableValues = new Set(
    row.amrGeneRecords.map((record) => record[key]?.toLowerCase() ?? ""),
  );

  return values.every((value) => availableValues.has(value.toLowerCase()));
}

function rowHasAllBlaGroups(row: MepramExplorerRow, values: string[]) {
  const availableGroups = new Set(
    row.amrGeneRecords
      .map((record) => recordBlaGroup(record))
      .filter(Boolean)
      .map((value) => String(value).toLowerCase()),
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
  },
) {
  const hasAmrFilters =
    filters.genes.length > 0 ||
    filters.alleles.length > 0 ||
    filters.classifications.length > 0 ||
    filters.blaGroups.length > 0;

  if (!hasAmrFilters) {
    return true;
  }

  return (
    selectedIncludes(filters.genes, record.gene) ||
    selectedIncludes(filters.alleles, record.allele) ||
    selectedIncludes(filters.classifications, record.classification) ||
    selectedIncludes(filters.blaGroups, recordBlaGroup(record))
  );
}

function geneSortValue(row: GeneExplorerRow, key: GeneSortKey) {
  switch (key) {
    case "allele":
      return row.record.allele ?? "";
    case "classification":
      return row.record.classification ?? "";
    case "collectionDate":
      return row.sample.collectionDate ?? "";
    case "gene":
      return row.record.gene ?? "";
    case "origin":
      return row.record.origin ?? "";
    case "province":
      return (
        row.sample.province ??
        row.sample.collectingProvince ??
        row.sample.submittingProvince ??
        ""
      );
    case "region":
      return (
        row.sample.region ??
        row.sample.collectingRegion ??
        row.sample.submittingRegion ??
        ""
      );
    case "sampleId":
      return row.sample.sampleId;
    case "sequenceType":
      return row.sample.sequenceType ?? "";
    case "species":
      return row.sample.species ?? "";
    case "speciesGroup":
      return row.sample.speciesGroup ?? "";
    default:
      return "";
  }
}

function SortableHeader({
  activeKey,
  direction,
  label,
  onSort,
  sortKey,
}: {
  activeKey: GeneSortKey;
  direction: GeneSortDirection;
  label: string;
  onSort: (key: GeneSortKey) => void;
  sortKey: GeneSortKey;
}) {
  const isActive = activeKey === sortKey;

  return (
    <th className="px-4 py-3 font-medium">
      <button
        className="inline-flex items-center gap-1 text-left hover:text-slate-900"
        onClick={() => onSort(sortKey)}
        type="button"
      >
        {label}
        <ArrowUpDown className="h-3.5 w-3.5" />
        {isActive ? (
          <span className="text-[10px] uppercase tracking-wide">
            {direction}
          </span>
        ) : null}
      </button>
    </th>
  );
}

export function MepramExplorer({ explorer }: { explorer: MepramExplorerData }) {
  const [viewMode, setViewMode] = useState<ExplorerViewMode>("sample");
  const [search, setSearch] = useState("");
  const [pathogen, setPathogen] = useState("");
  const [region, setRegion] = useState("");
  const [province, setProvince] = useState("");
  const [sequenceType, setSequenceType] = useState("");
  const [selectedGenes, setSelectedGenes] = useState<string[]>([]);
  const [selectedAlleles, setSelectedAlleles] = useState<string[]>([]);
  const [selectedClassifications, setSelectedClassifications] = useState<
    string[]
  >([]);
  const [selectedBlaGroups, setSelectedBlaGroups] = useState<string[]>([]);
  const [center, setCenter] = useState("");
  const [infectionType, setInfectionType] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [expandedSampleId, setExpandedSampleId] = useState<string | null>(null);
  const [geneSort, setGeneSort] = useState<{
    direction: GeneSortDirection;
    key: GeneSortKey;
  }>({ direction: "asc", key: "gene" });
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);

  const filteredRows = useMemo(() => {
    const normalizedSearchTokens = searchTokens(search);
    const normalizedSequenceType = normalizeSequenceType(sequenceType);

    return explorer.rows.filter((row) => {
      if (pathogen && row.pathogen !== pathogen) {
        return false;
      }
      if (region && row.region !== region) {
        return false;
      }
      if (province && row.province !== province) {
        return false;
      }
      if (
        normalizedSequenceType &&
        !normalizeSequenceType(row.sequenceType).includes(
          normalizedSequenceType,
        )
      ) {
        return false;
      }
      if (center && row.submittingInstitution !== center) {
        return false;
      }
      if (infectionType && row.infectionType !== infectionType) {
        return false;
      }
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
      if (dateFrom && row.collectionDate && row.collectionDate < dateFrom) {
        return false;
      }
      if (dateTo && row.collectionDate && row.collectionDate > dateTo) {
        return false;
      }
      if (normalizedSearchTokens.length === 0) {
        return true;
      }

      const text = rowSearchText(row);

      return normalizedSearchTokens.every((token) => text.includes(token));
    });
  }, [
    center,
    dateFrom,
    dateTo,
    explorer.rows,
    infectionType,
    pathogen,
    province,
    region,
    search,
    sequenceType,
    selectedAlleles,
    selectedBlaGroups,
    selectedClassifications,
    selectedGenes,
  ]);

  const geneRows = useMemo(() => {
    const activeAmrFilters = {
      alleles: selectedAlleles,
      blaGroups: selectedBlaGroups,
      classifications: selectedClassifications,
      genes: selectedGenes,
    };

    return filteredRows
      .flatMap((row) =>
        row.amrGeneRecords.map((record) => ({ record, sample: row })),
      )
      .filter((row) =>
        recordMatchesSelectedFilters(row.record, activeAmrFilters),
      )
      .sort((left, right) => {
        const leftValue = geneSortValue(left, geneSort.key);
        const rightValue = geneSortValue(right, geneSort.key);
        const comparison = leftValue.localeCompare(rightValue, "es", {
          numeric: true,
          sensitivity: "base",
        });

        return geneSort.direction === "asc" ? comparison : -comparison;
      });
  }, [
    filteredRows,
    geneSort,
    selectedAlleles,
    selectedBlaGroups,
    selectedClassifications,
    selectedGenes,
  ]);
  const visibleRowCount =
    viewMode === "sample" ? filteredRows.length : geneRows.length;
  const mapRows = useMemo(() => {
    if (viewMode === "sample") {
      return filteredRows;
    }

    return Array.from(
      new Map(geneRows.map((row) => [row.sample.sampleId, row.sample])).values(),
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
  const totalPages = Math.max(1, Math.ceil(visibleRowCount / PAGE_SIZE));
  const activePage = Math.min(currentPage, totalPages);
  const paginatedRows = useMemo(() => {
    const start = (activePage - 1) * PAGE_SIZE;

    return filteredRows.slice(start, start + PAGE_SIZE);
  }, [activePage, filteredRows]);
  const paginatedGeneRows = useMemo(() => {
    const start = (activePage - 1) * PAGE_SIZE;

    return geneRows.slice(start, start + PAGE_SIZE);
  }, [activePage, geneRows]);
  const pageStart =
    visibleRowCount > 0 ? (activePage - 1) * PAGE_SIZE + 1 : 0;
  const pageEnd = Math.min(activePage * PAGE_SIZE, visibleRowCount);

  useEffect(() => {
    setCurrentPage(1);
  }, [filteredRows, geneRows, viewMode]);

  const resetFilters = () => {
    setSearch("");
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
  const toggleGeneSort = (key: GeneSortKey) => {
    setGeneSort((current) =>
      current.key === key
        ? {
            direction: current.direction === "asc" ? "desc" : "asc",
            key,
          }
        : { direction: "asc", key },
    );
  };

  return (
    <Card className="border-white/70 bg-white/88" id="mepram-explorer">
      <CardHeader>
        <SectionHeader
          action={
            <Badge variant="secondary">
              {viewMode === "sample"
                ? `${filteredRows.length} / ${explorer.totalLoaded} samples`
                : `${geneRows.length} gene rows`}
            </Badge>
          }
          description="Buscador operativo de aislamientos del caso de uso. La tabla puede verse por muestra o por gen, y los filtros de genes/alelos funcionan como combinaciones estructuradas."
          eyebrow="Explorer"
          title="Isolate explorer"
        />
      </CardHeader>
      <CardContent className="space-y-6 pt-0">
        <div className="rounded-[1.7rem] border border-slate-200 bg-slate-50/80 p-5">
          <div className="grid gap-3 lg:grid-cols-[minmax(0,1.3fr)_auto] lg:items-end">
            <label className="grid gap-2">
              <span className="text-xs font-medium uppercase tracking-[0.16em] text-slate-400">
                Búsqueda libre · opcional
              </span>
              <div className="relative">
                <Search className="pointer-events-none absolute left-4 top-3.5 h-4 w-4 text-slate-400" />
                <Input
                  className="rounded-2xl border-slate-200 bg-white pl-10"
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder="Ejemplo: MEP0001 KPC CTX-M"
                  value={search}
                />
              </div>
              <p className="text-xs leading-6 text-slate-500">
                La búsqueda separa términos por espacios o comas. KPC CTX-M
                encuentra muestras que contienen ambos términos aunque haya
                otros genes entre medias.
              </p>
            </label>

            <div className="flex flex-wrap gap-2 lg:justify-end">
              <div className="inline-flex rounded-full border border-slate-200 bg-white p-1">
                <Button
                  onClick={() => setViewMode("sample")}
                  size="sm"
                  type="button"
                  variant={viewMode === "sample" ? "secondary" : "ghost"}
                >
                  Por muestra
                </Button>
                <Button
                  onClick={() => setViewMode("gene")}
                  size="sm"
                  type="button"
                  variant={viewMode === "gene" ? "secondary" : "ghost"}
                >
                  Por gen
                </Button>
              </div>
              <Button onClick={resetFilters} size="sm" variant="outline">
                Limpiar filtros
              </Button>
            </div>
          </div>
        </div>

        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-5">
          <DateField
            label="Fecha recogida desde"
            max={
              dateTo || explorer.filterOptions.collectionDateMax || undefined
            }
            min={explorer.filterOptions.collectionDateMin || undefined}
            onChange={setDateFrom}
            value={dateFrom}
          />
          <DateField
            label="Fecha recogida hasta"
            max={explorer.filterOptions.collectionDateMax || undefined}
            min={
              dateFrom || explorer.filterOptions.collectionDateMin || undefined
            }
            onChange={setDateTo}
            value={dateTo}
          />
          <SelectField
            label="Patógeno"
            onChange={setPathogen}
            options={explorer.filterOptions.pathogens}
            value={pathogen}
          />
          <SelectField
            label="Comunidad autónoma"
            onChange={setRegion}
            options={explorer.filterOptions.autonomousCommunities}
            value={region}
          />
          <SelectField
            label="Provincia"
            onChange={setProvince}
            options={explorer.filterOptions.provinces}
            value={province}
          />
          <label className="grid gap-2">
            <span className="text-xs font-medium uppercase tracking-[0.16em] text-slate-400">
              ST
            </span>
            <Input
              className="rounded-2xl border-slate-200 bg-white"
              onChange={(event) => setSequenceType(event.target.value)}
              placeholder="Ejemplo: ST307"
              value={sequenceType}
            />
          </label>
        </div>

        <div className="flex flex-wrap gap-2">
          <Badge variant="outline">Dataset de trabajo del caso de uso</Badge>
          {explorer.operationalFieldsSimulated ? (
            <Badge variant="outline">
              Patógeno, ST y resistencias en simulación controlada
            </Badge>
          ) : null}
        </div>

        <div className="rounded-[1.7rem] border border-slate-200 bg-white p-5">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-xs font-medium uppercase tracking-[0.16em] text-slate-400">
                Advanced filters
              </p>
              <p className="mt-2 text-sm leading-6 text-slate-500">
                Tipo de infección, centro remitente y combinaciones AMR por
                gen, alelo o clasificación.
              </p>
            </div>
            <Button
              onClick={() => setShowAdvanced((current) => !current)}
              size="sm"
              variant="outline"
            >
              <SlidersHorizontal className="h-4 w-4" />
              {showAdvanced ? "Ocultar filtros" : "Mostrar filtros"}
              {advancedActiveCount > 0 ? ` (${advancedActiveCount})` : ""}
            </Button>
          </div>

          {showAdvanced ? (
            <div className="mt-5 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
              <SelectField
                label="Centro remitente"
                onChange={setCenter}
                options={explorer.filterOptions.centers}
                value={center}
              />
              <SelectField
                label="Tipo de infección"
                onChange={setInfectionType}
                options={explorer.filterOptions.infectionTypes}
                value={infectionType}
              />
              <MultiValueFilter
                label="Gene"
                onChange={setSelectedGenes}
                options={explorer.filterOptions.genes}
                placeholder="Ejemplo: KPC"
                selected={selectedGenes}
              />
              <MultiValueFilter
                label="Allele"
                onChange={setSelectedAlleles}
                options={explorer.filterOptions.alleles}
                placeholder="Ejemplo: blaKPC-2"
                selected={selectedAlleles}
              />
              <MultiValueFilter
                label="Classification"
                onChange={setSelectedClassifications}
                options={explorer.filterOptions.classifications}
                placeholder="Ejemplo: Bla_Carb"
                selected={selectedClassifications}
              />
              <MultiValueFilter
                label="bla group"
                onChange={setSelectedBlaGroups}
                options={explorer.filterOptions.blaGroups}
                placeholder="Ejemplo: bla_carb"
                selected={selectedBlaGroups}
              />
            </div>
          ) : null}
        </div>

        <div className="overflow-hidden rounded-[1.7rem] border border-slate-200">
          <div className="overflow-x-auto">
            {viewMode === "sample" ? (
              <table className="min-w-full border-collapse text-sm">
                <thead className="bg-slate-50">
                  <tr className="text-left text-slate-500">
                    <th className="px-4 py-3 font-medium">Sample ID</th>
                    <th className="px-4 py-3 font-medium">Collection date</th>
                    <th className="px-4 py-3 font-medium">CCAA</th>
                    <th className="px-4 py-3 font-medium">Province</th>
                    <th className="px-4 py-3 font-medium">Species</th>
                    <th className="px-4 py-3 font-medium">Group</th>
                    <th className="px-4 py-3 font-medium">ST</th>
                    <th className="px-4 py-3 font-medium">Gene</th>
                    <th className="px-4 py-3 font-medium">Allele</th>
                    <th className="px-4 py-3 font-medium">Classification</th>
                    <th className="px-4 py-3 font-medium">bla_carb</th>
                    <th className="px-4 py-3 font-medium">bla_esbl</th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedRows.length > 0 ? (
                    paginatedRows.map((row) => {
                      const isExpanded = expandedSampleId === row.sampleId;
                      const canExpand = row.amrGeneRecords.length > 1;

                      return (
                        <Fragment key={row.sampleId}>
                          <tr className="border-t border-slate-200 text-slate-600 transition hover:bg-slate-50/80">
                            <td className="px-4 py-3 font-medium text-slate-900">
                              <div className="flex items-center gap-2">
                                <span
                                  className={`h-2.5 w-2.5 rounded-sm ${
                                    row.isSequenced
                                      ? "bg-emerald-500"
                                      : "bg-slate-300"
                                  }`}
                                  title={row.sequencingStatus}
                                />
                                <span>{row.sampleId}</span>
                              </div>
                              <span className="mt-1 block text-xs font-normal text-slate-400">
                                {row.sequencingStatus}
                              </span>
                            </td>
                            <td className="px-4 py-3">
                              {displayValue(row.collectionDate)}
                            </td>
                            <td className="px-4 py-3">
                              {displayValue(
                                row.region ??
                                  row.collectingRegion ??
                                  row.submittingRegion,
                              )}
                            </td>
                            <td className="px-4 py-3">
                              {displayValue(
                                row.province ??
                                  row.collectingProvince ??
                                  row.submittingProvince,
                              )}
                            </td>
                            <td className="px-4 py-3">
                              {displayValue(row.species)}
                            </td>
                            <td className="px-4 py-3">
                              {displayValue(row.speciesGroup)}
                            </td>
                            <td className="px-4 py-3">
                              <span
                                className={
                                  row.sequenceType
                                    ? "cursor-help border-b border-dotted border-slate-400"
                                    : ""
                                }
                                title={sequenceTypeTitle(row.sequenceTypeSchemes)}
                              >
                                {displayValue(row.sequenceType)}
                              </span>
                            </td>
                            <td className="px-4 py-3">
                              <div className="flex items-center gap-2">
                                {canExpand ? (
                                  <Button
                                    className="h-7 w-7 p-0"
                                    onClick={() =>
                                      setExpandedSampleId(
                                        isExpanded ? null : row.sampleId,
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
                                ) : null}
                                <span>{displayValue(row.amrGene)}</span>
                              </div>
                            </td>
                            <td className="px-4 py-3">
                              {displayValue(row.amrAllele)}
                            </td>
                            <td className="px-4 py-3">
                              {displayValue(row.amrClassification)}
                            </td>
                            <td className="px-4 py-3">
                              {displayValue(row.blaCarb)}
                            </td>
                            <td className="px-4 py-3">
                              {displayValue(row.blaEsbl)}
                            </td>
                          </tr>
                          {isExpanded ? (
                            <tr className="border-t border-slate-200 bg-slate-50/70">
                              <td className="px-4 py-4" colSpan={12}>
                                <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white">
                                  <table className="min-w-full text-xs">
                                    <thead className="bg-slate-50 text-left text-slate-500">
                                      <tr>
                                        <th className="px-3 py-2 font-medium">
                                          Gene
                                        </th>
                                        <th className="px-3 py-2 font-medium">
                                          Allele
                                        </th>
                                        <th className="px-3 py-2 font-medium">
                                          Classification
                                        </th>
                                        <th className="px-3 py-2 font-medium">
                                          Origin
                                        </th>
                                      </tr>
                                    </thead>
                                    <tbody>
                                      {row.amrGeneRecords.map((record, index) => (
                                        <tr
                                          className="border-t border-slate-100"
                                          key={`${row.sampleId}-${record.gene}-${record.allele}-${index}`}
                                        >
                                          <td className="px-3 py-2">
                                            {displayValue(record.gene)}
                                          </td>
                                          <td className="px-3 py-2">
                                            {displayValue(record.allele)}
                                          </td>
                                          <td className="px-3 py-2">
                                            {displayValue(record.classification)}
                                          </td>
                                          <td className="px-3 py-2">
                                            {displayValue(record.origin)}
                                          </td>
                                        </tr>
                                      ))}
                                    </tbody>
                                  </table>
                                </div>
                              </td>
                            </tr>
                          ) : null}
                        </Fragment>
                      );
                    })
                  ) : (
                    <tr>
                      <td
                        className="px-4 py-8 text-center text-slate-500"
                        colSpan={12}
                      >
                        No hay aislamientos que encajen con el filtro actual.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            ) : (
              <table className="min-w-full border-collapse text-sm">
                <thead className="bg-slate-50">
                  <tr className="text-left text-slate-500">
                    <SortableHeader
                      activeKey={geneSort.key}
                      direction={geneSort.direction}
                      label="Sample ID"
                      onSort={toggleGeneSort}
                      sortKey="sampleId"
                    />
                    <SortableHeader
                      activeKey={geneSort.key}
                      direction={geneSort.direction}
                      label="Collection date"
                      onSort={toggleGeneSort}
                      sortKey="collectionDate"
                    />
                    <SortableHeader
                      activeKey={geneSort.key}
                      direction={geneSort.direction}
                      label="CCAA"
                      onSort={toggleGeneSort}
                      sortKey="region"
                    />
                    <SortableHeader
                      activeKey={geneSort.key}
                      direction={geneSort.direction}
                      label="Province"
                      onSort={toggleGeneSort}
                      sortKey="province"
                    />
                    <SortableHeader
                      activeKey={geneSort.key}
                      direction={geneSort.direction}
                      label="Species"
                      onSort={toggleGeneSort}
                      sortKey="species"
                    />
                    <SortableHeader
                      activeKey={geneSort.key}
                      direction={geneSort.direction}
                      label="Group"
                      onSort={toggleGeneSort}
                      sortKey="speciesGroup"
                    />
                    <SortableHeader
                      activeKey={geneSort.key}
                      direction={geneSort.direction}
                      label="ST"
                      onSort={toggleGeneSort}
                      sortKey="sequenceType"
                    />
                    <SortableHeader
                      activeKey={geneSort.key}
                      direction={geneSort.direction}
                      label="Gene"
                      onSort={toggleGeneSort}
                      sortKey="gene"
                    />
                    <SortableHeader
                      activeKey={geneSort.key}
                      direction={geneSort.direction}
                      label="Allele"
                      onSort={toggleGeneSort}
                      sortKey="allele"
                    />
                    <SortableHeader
                      activeKey={geneSort.key}
                      direction={geneSort.direction}
                      label="Classification"
                      onSort={toggleGeneSort}
                      sortKey="classification"
                    />
                    <SortableHeader
                      activeKey={geneSort.key}
                      direction={geneSort.direction}
                      label="Origin"
                      onSort={toggleGeneSort}
                      sortKey="origin"
                    />
                  </tr>
                </thead>
                <tbody>
                  {paginatedGeneRows.length > 0 ? (
                    paginatedGeneRows.map(({ record, sample }, index) => (
                      <tr
                        className="border-t border-slate-200 text-slate-600 transition hover:bg-slate-50/80"
                        key={`${sample.sampleId}-${record.gene}-${record.allele}-${index}`}
                      >
                        <td className="px-4 py-3 font-medium text-slate-900">
                          <div className="flex items-center gap-2">
                            <span
                              className={`h-2.5 w-2.5 rounded-sm ${
                                sample.isSequenced
                                  ? "bg-emerald-500"
                                  : "bg-slate-300"
                              }`}
                              title={sample.sequencingStatus}
                            />
                            <span>{sample.sampleId}</span>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          {displayValue(sample.collectionDate)}
                        </td>
                        <td className="px-4 py-3">
                          {displayValue(
                            sample.region ??
                              sample.collectingRegion ??
                              sample.submittingRegion,
                          )}
                        </td>
                        <td className="px-4 py-3">
                          {displayValue(
                            sample.province ??
                              sample.collectingProvince ??
                              sample.submittingProvince,
                          )}
                        </td>
                        <td className="px-4 py-3">
                          {displayValue(sample.species)}
                        </td>
                        <td className="px-4 py-3">
                          {displayValue(sample.speciesGroup)}
                        </td>
                        <td className="px-4 py-3">
                          <span
                            className={
                              sample.sequenceType
                                ? "cursor-help border-b border-dotted border-slate-400"
                                : ""
                            }
                            title={sequenceTypeTitle(sample.sequenceTypeSchemes)}
                          >
                            {displayValue(sample.sequenceType)}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          {displayValue(record.gene)}
                        </td>
                        <td className="px-4 py-3">
                          {displayValue(record.allele)}
                        </td>
                        <td className="px-4 py-3">
                          {displayValue(record.classification)}
                        </td>
                        <td className="px-4 py-3">
                          {displayValue(record.origin)}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td
                        className="px-4 py-8 text-center text-slate-500"
                        colSpan={11}
                      >
                        No hay genes que encajen con el filtro actual.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            )}
          </div>
          <div className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-600">
            <span>
              Mostrando {pageStart}-{pageEnd} de {visibleRowCount}{" "}
              {viewMode === "sample" ? "aislamientos" : "genes"}
            </span>
            <div className="flex gap-2">
              <Button
                disabled={activePage <= 1}
                onClick={() => setCurrentPage((page) => Math.max(1, page - 1))}
                size="sm"
                variant="outline"
              >
                Anterior
              </Button>
              <Button
                disabled={activePage >= totalPages}
                onClick={() =>
                  setCurrentPage((page) => Math.min(totalPages, page + 1))
                }
                size="sm"
                variant="outline"
              >
                Siguiente
              </Button>
            </div>
          </div>
        </div>

        <MepramExplorerMap
          rows={mapRows}
          simulated={explorer.operationalFieldsSimulated}
        />

        <div className="grid gap-3">
          {explorer.notes.map((note) => (
            <div
              key={note}
              className="rounded-[1.35rem] border border-slate-200 bg-slate-50 px-4 py-3 text-sm leading-6 text-slate-600"
            >
              {note}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
