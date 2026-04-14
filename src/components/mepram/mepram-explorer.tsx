import { useMemo, useState } from "react";
import { Download, ExternalLink, Search, SlidersHorizontal } from "lucide-react";
import { MepramExplorerMap } from "@/components/mepram/mepram-explorer-map";
import { SectionHeader } from "@/components/databrowser/section-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import type { MepramExplorerData, MepramExplorerRow } from "@/types/mepram";

const CARBA_OPTIONS = ["OXA", "NDM", "VIM", "KPC", "IMP"];

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
        <option value="">All</option>
        {options.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
    </label>
  );
}

function normalizeSequenceType(value: string | null | undefined) {
  if (!value) {
    return "";
  }

  return value.toUpperCase().replace(/[\s-]/g, "").replace(/^ST/, "");
}

function csvEscape(value: string | null | undefined) {
  if (!value) {
    return "";
  }

  return `"${value.replace(/"/g, '""')}"`;
}

function exportRows(rows: MepramExplorerRow[], simulated: boolean) {
  const header = [
    "sample_id",
    "collection_date",
    "autonomous_community",
    "center",
    "pathogen",
    "sequence_type",
    "carbapenemase",
    "resistance_profile",
    "sequencing_platform",
    "infection_type",
    "operational_mode",
  ];
  const body = rows.map((row) =>
    [
      row.sampleId,
      row.collectionDate,
      row.region ?? row.collectingRegion ?? row.submittingRegion,
      row.submittingInstitution,
      row.pathogen,
      row.sequenceType,
      row.carbapenemase,
      row.resistanceProfile,
      row.sequencingPlatform,
      row.infectionType,
      simulated ? "simulated" : "api",
    ]
      .map((value) => csvEscape(value))
      .join(","),
  );

  const blob = new Blob([[header.join(","), ...body].join("\n")], {
    type: "text/csv;charset=utf-8;",
  });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");

  link.href = url;
  link.download = `mepram-operational-isolate-explorer-${new Date().toISOString().slice(0, 10)}.csv`;
  document.body.append(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
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
    dateFrom,
    dateTo,
  ].filter(Boolean).length;

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
          description="Buscador operativo de aislamientos MEPRAM con filtros principales por patógeno, comunidad autónoma, ST y carbapenemasa. La búsqueda libre es opcional y el mapa territorial se mantiene alineado con el mismo subconjunto que la tabla."
          eyebrow="Explorer"
          title="Operational isolate explorer"
        />
      </CardHeader>
      <CardContent className="space-y-6 pt-0">
        <div className="rounded-[1.7rem] border border-slate-200 bg-slate-50/80 p-5">
          <div className="grid gap-3 lg:grid-cols-[minmax(0,1.3fr)_auto] lg:items-end">
            <label className="grid gap-2">
              <span className="text-xs font-medium uppercase tracking-[0.16em] text-slate-400">
                Free search · optional
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
              <Button
                onClick={() => exportRows(filteredRows, explorer.operationalFieldsSimulated)}
                size="sm"
                variant="outline"
                disabled={filteredRows.length === 0}
              >
                <Download className="h-4 w-4" />
                Descargar CSV
              </Button>
              <Button
                onClick={() => window.open("https://microreact.org/", "_blank", "noopener,noreferrer")}
                size="sm"
                variant="outline"
                disabled={filteredRows.length === 0}
              >
                <ExternalLink className="h-4 w-4" />
                Ver en Microreact
              </Button>
            </div>
          </div>
        </div>

        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
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
          <Badge variant="outline">Preview cargado desde la API real</Badge>
          {explorer.operationalFieldsSimulated ? (
            <Badge variant="outline">Patógeno, ST y resistencias en simulación controlada</Badge>
          ) : null}
          <Badge variant="outline">La exportación directa a Microreact sigue pendiente</Badge>
        </div>

        <div className="rounded-[1.7rem] border border-slate-200 bg-white p-5">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-xs font-medium uppercase tracking-[0.16em] text-slate-400">
                Advanced filters
              </p>
              <p className="mt-2 text-sm leading-6 text-slate-500">
                Fechas, plataforma, perfil de resistencia, tipo de infección y centro
                remitente.
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
                label="Resistance profile"
                onChange={setResistanceProfile}
                options={explorer.filterOptions.resistanceProfiles}
                value={resistanceProfile}
              />
              <SelectField
                label="Platform"
                onChange={setSequencingPlatform}
                options={explorer.filterOptions.sequencingPlatforms}
                value={sequencingPlatform}
              />
              <SelectField
                label="Center"
                onChange={setCenter}
                options={explorer.filterOptions.centers}
                value={center}
              />
              <SelectField
                label="Infection type"
                onChange={setInfectionType}
                options={explorer.filterOptions.infectionTypes}
                value={infectionType}
              />
              <label className="grid gap-2">
                <span className="text-xs font-medium uppercase tracking-[0.16em] text-slate-400">
                  Collection date from
                </span>
                <input
                  className="h-11 rounded-2xl border border-slate-200 bg-white px-4 text-sm text-slate-700 outline-none transition focus:border-slate-400"
                  max={dateTo || explorer.filterOptions.collectionDateMax || undefined}
                  min={explorer.filterOptions.collectionDateMin || undefined}
                  onChange={(event) => setDateFrom(event.target.value)}
                  type="date"
                  value={dateFrom}
                />
              </label>
              <label className="grid gap-2">
                <span className="text-xs font-medium uppercase tracking-[0.16em] text-slate-400">
                  Collection date to
                </span>
                <input
                  className="h-11 rounded-2xl border border-slate-200 bg-white px-4 text-sm text-slate-700 outline-none transition focus:border-slate-400"
                  max={explorer.filterOptions.collectionDateMax || undefined}
                  min={dateFrom || explorer.filterOptions.collectionDateMin || undefined}
                  onChange={(event) => setDateTo(event.target.value)}
                  type="date"
                  value={dateTo}
                />
              </label>
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
                  <th className="px-4 py-3 font-medium">Center</th>
                  <th className="px-4 py-3 font-medium">Pathogen</th>
                  <th className="px-4 py-3 font-medium">ST</th>
                  <th className="px-4 py-3 font-medium">Carba</th>
                  <th className="px-4 py-3 font-medium">Resistance profile</th>
                  <th className="px-4 py-3 font-medium">Platform</th>
                </tr>
              </thead>
              <tbody>
                {filteredRows.length > 0 ? (
                  filteredRows.map((row) => (
                    <tr
                      key={row.sampleId}
                      className="border-t border-slate-200 text-slate-600 transition hover:bg-slate-50/80"
                    >
                      <td className="px-4 py-3 font-medium text-slate-900">{row.sampleId}</td>
                      <td className="px-4 py-3">{row.collectionDate ?? "No data"}</td>
                      <td className="px-4 py-3">
                        {row.region ?? row.collectingRegion ?? row.submittingRegion ?? "No data"}
                      </td>
                      <td className="px-4 py-3">{row.submittingInstitution ?? "No data"}</td>
                      <td className="px-4 py-3">{row.pathogen ?? "No data"}</td>
                      <td className="px-4 py-3">{row.sequenceType ?? "No data"}</td>
                      <td className="px-4 py-3">{row.carbapenemase ?? "No data"}</td>
                      <td className="px-4 py-3">{row.resistanceProfile ?? "No data"}</td>
                      <td className="px-4 py-3">{row.sequencingPlatform ?? "No data"}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td className="px-4 py-8 text-center text-slate-500" colSpan={9}>
                      No hay aislamientos que encajen con el filtro actual.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
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
