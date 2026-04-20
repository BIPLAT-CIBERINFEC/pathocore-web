import { useEffect, useMemo, useState } from "react";
import { Search, SlidersHorizontal } from "lucide-react";
import { MepramExplorerMap } from "@/components/mepram/mepram-explorer-map";
import { SectionHeader } from "@/components/databrowser/section-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import type { MepramExplorerData } from "@/types/mepram";

const CARBA_OPTIONS = ["OXA", "NDM", "VIM", "KPC", "IMP"];
const PAGE_SIZE = 20;

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

function normalizeSequenceType(value: string | null | undefined) {
  if (!value) {
    return "";
  }

  return value.toUpperCase().replace(/[\s-]/g, "").replace(/^ST/, "");
}

export function MepramExplorer({ explorer }: { explorer: MepramExplorerData }) {
  const [search, setSearch] = useState("");
  const [pathogen, setPathogen] = useState("");
  const [region, setRegion] = useState("");
  const [sequenceType, setSequenceType] = useState("");
  const [carbapenemase, setCarbapenemase] = useState("");
  const [center, setCenter] = useState("");
  const [infectionType, setInfectionType] = useState("");
  const [sequencingPlatform, setSequencingPlatform] = useState("");
  const [resistanceProfile, setResistanceProfile] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);

  const filteredRows = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase();
    const normalizedSequenceType = normalizeSequenceType(sequenceType);

    return explorer.rows.filter((row) => {
      if (pathogen && row.pathogen !== pathogen) {
        return false;
      }
      if (region && row.region !== region) {
        return false;
      }
      if (
        normalizedSequenceType &&
        !normalizeSequenceType(row.sequenceType).includes(normalizedSequenceType)
      ) {
        return false;
      }
      if (
        carbapenemase &&
        !row.carbapenemase?.toUpperCase().includes(carbapenemase.toUpperCase())
      ) {
        return false;
      }
      if (center && row.submittingInstitution !== center) {
        return false;
      }
      if (infectionType && row.infectionType !== infectionType) {
        return false;
      }
      if (sequencingPlatform && row.sequencingPlatform !== sequencingPlatform) {
        return false;
      }
      if (resistanceProfile && row.resistanceProfile !== resistanceProfile) {
        return false;
      }
      if (dateFrom && row.collectionDate && row.collectionDate < dateFrom) {
        return false;
      }
      if (dateTo && row.collectionDate && row.collectionDate > dateTo) {
        return false;
      }
      if (!normalizedSearch) {
        return true;
      }

      return [
        row.sampleId,
        row.sequencingSampleId,
        row.submittingInstitution,
        row.sequenceType,
        row.carbapenemase,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase()
        .includes(normalizedSearch);
    });
  }, [
    carbapenemase,
    center,
    dateFrom,
    dateTo,
    explorer.rows,
    infectionType,
    pathogen,
    region,
    resistanceProfile,
    search,
    sequenceType,
    sequencingPlatform,
  ]);

  const advancedActiveCount = [
    center,
    infectionType,
    sequencingPlatform,
    resistanceProfile,
  ].filter(Boolean).length;
  const totalPages = Math.max(1, Math.ceil(filteredRows.length / PAGE_SIZE));
  const activePage = Math.min(currentPage, totalPages);
  const paginatedRows = useMemo(() => {
    const start = (activePage - 1) * PAGE_SIZE;

    return filteredRows.slice(start, start + PAGE_SIZE);
  }, [activePage, filteredRows]);
  const pageStart = filteredRows.length > 0 ? (activePage - 1) * PAGE_SIZE + 1 : 0;
  const pageEnd = Math.min(activePage * PAGE_SIZE, filteredRows.length);

  useEffect(() => {
    setCurrentPage(1);
  }, [filteredRows]);

  const resetFilters = () => {
    setSearch("");
    setPathogen("");
    setRegion("");
    setSequenceType("");
    setCarbapenemase("");
    setCenter("");
    setInfectionType("");
    setSequencingPlatform("");
    setResistanceProfile("");
    setDateFrom("");
    setDateTo("");
  };

  return (
    <Card className="border-white/70 bg-white/88" id="mepram-explorer">
      <CardHeader>
        <SectionHeader
          action={
            <Badge variant="secondary">
              {filteredRows.length} / {explorer.totalLoaded} rows
            </Badge>
          }
          description="Buscador operativo de aislamientos del caso de uso. La fecha de recogida queda como filtro prioritario, y el mapa territorial se mantiene alineado con el mismo subconjunto que la tabla."
          eyebrow="Explorer"
          title="Operational isolate explorer"
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
                  placeholder="Ejemplo: sample ID, sequencing sample ID o centro remitente"
                  value={search}
                />
              </div>
              <p className="text-xs leading-6 text-slate-500">
                Úsalo solo si necesitas localizar una muestra o un centro concreto. El resto
                de la búsqueda operativa se resuelve con filtros estructurados.
              </p>
            </label>

            <div className="flex flex-wrap gap-2 lg:justify-end">
              <Button onClick={resetFilters} size="sm" variant="outline">
                Limpiar filtros
              </Button>
            </div>
          </div>
        </div>

        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-6">
          <DateField
            label="Fecha recogida desde"
            max={dateTo || explorer.filterOptions.collectionDateMax || undefined}
            min={explorer.filterOptions.collectionDateMin || undefined}
            onChange={setDateFrom}
            value={dateFrom}
          />
          <DateField
            label="Fecha recogida hasta"
            max={explorer.filterOptions.collectionDateMax || undefined}
            min={dateFrom || explorer.filterOptions.collectionDateMin || undefined}
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
          <SelectField
            label="Carba"
            onChange={setCarbapenemase}
            options={CARBA_OPTIONS}
            value={carbapenemase}
          />
        </div>

        <div className="flex flex-wrap gap-2">
          <Badge variant="outline">Dataset de trabajo del caso de uso</Badge>
          {explorer.operationalFieldsSimulated ? (
            <Badge variant="outline">Patógeno, ST y resistencias en simulación controlada</Badge>
          ) : null}
        </div>

        <div className="rounded-[1.7rem] border border-slate-200 bg-white p-5">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-xs font-medium uppercase tracking-[0.16em] text-slate-400">
                Advanced filters
              </p>
              <p className="mt-2 text-sm leading-6 text-slate-500">
                Plataforma, perfil de resistencia, tipo de infección y centro remitente.
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
                label="Perfil de resistencia"
                onChange={setResistanceProfile}
                options={explorer.filterOptions.resistanceProfiles}
                value={resistanceProfile}
              />
              <SelectField
                label="Plataforma"
                onChange={setSequencingPlatform}
                options={explorer.filterOptions.sequencingPlatforms}
                value={sequencingPlatform}
              />
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
            </div>
          ) : null}
        </div>

        <div className="overflow-hidden rounded-[1.7rem] border border-slate-200">
          <div className="overflow-x-auto">
            <table className="min-w-full border-collapse text-sm">
              <thead className="bg-slate-50">
                <tr className="text-left text-slate-500">
                  <th className="px-4 py-3 font-medium">Sample ID</th>
                  <th className="px-4 py-3 font-medium">Collection date</th>
                  <th className="px-4 py-3 font-medium">CCAA</th>
                  <th className="px-4 py-3 font-medium">Pathogen</th>
                  <th className="px-4 py-3 font-medium">ST</th>
                  <th className="px-4 py-3 font-medium">Carba</th>
                  <th className="px-4 py-3 font-medium">Resistance profile</th>
                  <th className="px-4 py-3 font-medium">Platform</th>
                </tr>
              </thead>
              <tbody>
                {paginatedRows.length > 0 ? (
                  paginatedRows.map((row) => (
                    <tr
                      key={row.sampleId}
                      className="border-t border-slate-200 text-slate-600 transition hover:bg-slate-50/80"
                    >
                      <td className="px-4 py-3 font-medium text-slate-900">{row.sampleId}</td>
                      <td className="px-4 py-3">{row.collectionDate ?? "No data"}</td>
                      <td className="px-4 py-3">
                        {row.region ?? row.collectingRegion ?? row.submittingRegion ?? "No data"}
                      </td>
                      <td className="px-4 py-3">{row.pathogen ?? "No data"}</td>
                      <td className="px-4 py-3">{row.sequenceType ?? "No data"}</td>
                      <td className="px-4 py-3">{row.carbapenemase ?? "No data"}</td>
                      <td className="px-4 py-3">{row.resistanceProfile ?? "No data"}</td>
                      <td className="px-4 py-3">{row.sequencingPlatform ?? "No data"}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td className="px-4 py-8 text-center text-slate-500" colSpan={8}>
                      No hay aislamientos que encajen con el filtro actual.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          <div className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-600">
            <span>
              Mostrando {pageStart}-{pageEnd} de {filteredRows.length} aislamientos
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
                onClick={() => setCurrentPage((page) => Math.min(totalPages, page + 1))}
                size="sm"
                variant="outline"
              >
                Siguiente
              </Button>
            </div>
          </div>
        </div>

        <MepramExplorerMap
          rows={filteredRows}
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
