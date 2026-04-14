import { useMemo, useState } from "react";
import { SectionHeader } from "@/components/databrowser/section-header";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { MepramExplorerRow } from "@/types/mepram";

const REGION_COORDINATES: Record<
  string,
  { label: string; regionCode: string; x: number; y: number }
> = {
  andalucia: { label: "Andalucía", regionCode: "andalucia", x: 46, y: 79 },
  aragon: { label: "Aragón", regionCode: "aragon", x: 65, y: 44 },
  asturias: { label: "Asturias", regionCode: "asturias", x: 32, y: 18 },
  baleares: { label: "Illes Balears", regionCode: "baleares", x: 88, y: 55 },
  canarias: { label: "Canarias", regionCode: "canarias", x: 18, y: 94 },
  cantabria: { label: "Cantabria", regionCode: "cantabria", x: 43, y: 18 },
  castilla_la_mancha: {
    label: "Castilla-La Mancha",
    regionCode: "castilla-la-mancha",
    x: 49,
    y: 58,
  },
  castilla_y_leon: {
    label: "Castilla y León",
    regionCode: "castilla-y-leon",
    x: 36,
    y: 37,
  },
  cataluna: { label: "Cataluña", regionCode: "cataluna", x: 74, y: 27 },
  ceuta: { label: "Ceuta", regionCode: "ceuta", x: 34, y: 92 },
  extremadura: { label: "Extremadura", regionCode: "extremadura", x: 24, y: 63 },
  galicia: { label: "Galicia", regionCode: "galicia", x: 17, y: 28 },
  la_rioja: { label: "La Rioja", regionCode: "la-rioja", x: 48, y: 24 },
  madrid: { label: "Comunidad de Madrid", regionCode: "madrid", x: 43, y: 48 },
  melilla: { label: "Melilla", regionCode: "melilla", x: 38, y: 96 },
  murcia: { label: "Región de Murcia", regionCode: "murcia", x: 62, y: 70 },
  navarra: { label: "Comunidad Foral de Navarra", regionCode: "navarra", x: 54, y: 25 },
  pais_vasco: { label: "País Vasco", regionCode: "pais-vasco", x: 57, y: 18 },
  valencia: { label: "Comunitat Valenciana", regionCode: "valencia", x: 71, y: 56 },
};

const REGION_ALIASES: Record<string, keyof typeof REGION_COORDINATES> = {
  andalucia: "andalucia",
  aragon: "aragon",
  asturias: "asturias",
  baleares: "baleares",
  canarias: "canarias",
  cantabria: "cantabria",
  "castilla la mancha": "castilla_la_mancha",
  "castilla-la mancha": "castilla_la_mancha",
  "castilla-la-mancha": "castilla_la_mancha",
  "castilla y leon": "castilla_y_leon",
  cataluna: "cataluna",
  ceuta: "ceuta",
  "comunidad de madrid": "madrid",
  "comunidad foral de navarra": "navarra",
  "comunidad valenciana": "valencia",
  "comunitat valenciana": "valencia",
  extremadura: "extremadura",
  galicia: "galicia",
  "illes balears": "baleares",
  "la rioja": "la_rioja",
  madrid: "madrid",
  melilla: "melilla",
  murcia: "murcia",
  navarra: "navarra",
  "pais vasco": "pais_vasco",
  "region de murcia": "murcia",
  valencia: "valencia",
};

const REGION_PALETTE = ["#0f766e", "#2563eb", "#7c3aed", "#ea580c", "#16a34a", "#64748b"];

interface DistributionItem {
  label: string;
  share: number;
  value: number;
}

interface ExplorerRegionSummary {
  carbapenemases: DistributionItem[];
  centers: number;
  dominantCarbapenemase: string;
  dominantPathogen: string;
  dominantResistanceProfile: string;
  dominantSequenceType: string;
  label: string;
  notes: string[];
  pathogens: DistributionItem[];
  regionCode: string;
  resistanceProfiles: DistributionItem[];
  samples: number;
  sequenceTypes: DistributionItem[];
  x: number;
  y: number;
}

function normalizeRegion(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[()]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

function regionMeta(label: string) {
  const normalized = normalizeRegion(label);
  const key = REGION_ALIASES[normalized];

  return key ? REGION_COORDINATES[key] : null;
}

function distribution(values: Array<string | null>, limit = 4): DistributionItem[] {
  const counts = new Map<string, number>();

  values.filter((value): value is string => Boolean(value)).forEach((value) => {
    counts.set(value, (counts.get(value) ?? 0) + 1);
  });

  const total = Array.from(counts.values()).reduce((sum, value) => sum + value, 0);

  return Array.from(counts.entries())
    .sort((left, right) => right[1] - left[1])
    .slice(0, limit)
    .map(([label, value]) => ({
      label,
      share: total > 0 ? Math.round((value / total) * 100) : 0,
      value,
    }));
}

function mode(items: DistributionItem[]) {
  return items[0]?.label ?? "No data";
}

function buildRegions(rows: MepramExplorerRow[]): ExplorerRegionSummary[] {
  const groups = new Map<
    string,
    {
      label: string;
      rows: MepramExplorerRow[];
      x: number;
      y: number;
      regionCode: string;
    }
  >();

  rows.forEach((row) => {
    const label = row.region ?? row.collectingRegion ?? row.submittingRegion;

    if (!label) {
      return;
    }

    const meta = regionMeta(label);

    if (!meta) {
      return;
    }

    const current = groups.get(meta.regionCode);

    if (current) {
      current.rows.push(row);
      return;
    }

    groups.set(meta.regionCode, {
      label: meta.label,
      regionCode: meta.regionCode,
      rows: [row],
      x: meta.x,
      y: meta.y,
    });
  });

  return Array.from(groups.values())
    .map((group) => {
      const pathogens = distribution(group.rows.map((row) => row.pathogen));
      const sequenceTypes = distribution(group.rows.map((row) => row.sequenceType));
      const carbapenemases = distribution(group.rows.map((row) => row.carbapenemase));
      const resistanceProfiles = distribution(
        group.rows.map((row) => row.resistanceProfile),
      );
      const centers = new Set(
        group.rows
          .map((row) => row.submittingInstitution)
          .filter((value): value is string => Boolean(value)),
      ).size;

      return {
        carbapenemases,
        centers,
        dominantCarbapenemase: mode(carbapenemases),
        dominantPathogen: mode(pathogens),
        dominantResistanceProfile: mode(resistanceProfiles),
        dominantSequenceType: mode(sequenceTypes),
        label: group.label,
        notes: [
          `${group.rows.length} aislamientos en el subconjunto filtrado.`,
          `${centers} centros remitentes con actividad en esta comunidad.`,
        ],
        pathogens,
        regionCode: group.regionCode,
        resistanceProfiles,
        samples: group.rows.length,
        sequenceTypes,
        x: group.x,
        y: group.y,
      };
    })
    .sort((left, right) => right.samples - left.samples);
}

export function MepramExplorerMap({
  rows,
  simulated,
}: {
  rows: MepramExplorerRow[];
  simulated: boolean;
}) {
  const regions = useMemo(() => buildRegions(rows), [rows]);
  const [activeCode, setActiveCode] = useState<string | null>(regions[0]?.regionCode ?? null);
  const activeRegion = useMemo(
    () => regions.find((region) => region.regionCode === activeCode) ?? regions[0] ?? null,
    [activeCode, regions],
  );

  if (rows.length === 0) {
    return (
      <Card className="border-white/70 bg-white/88">
        <CardContent className="p-6">
          <SectionHeader
            description="El mapa territorial se alimenta del mismo subconjunto que la tabla. Ajusta o limpia filtros para recuperar resultados con información geográfica."
            eyebrow="Mapa"
            title="Resultados geográficos"
          />
        </CardContent>
      </Card>
    );
  }

  if (regions.length === 0) {
    return (
      <Card className="border-white/70 bg-white/88">
        <CardContent className="p-6">
          <SectionHeader
            description="La búsqueda actual devuelve filas, pero no incluye comunidades autónomas operativas con coordenadas asignadas en esta vista."
            eyebrow="Mapa"
            title="Resultados geográficos"
          />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-white/70 bg-white/88">
      <CardHeader className="pb-4">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <CardTitle className="text-xl">Resultados geográficos</CardTitle>
            <p className="mt-2 text-sm text-slate-500">
              Cobertura territorial del subconjunto devuelto por los filtros activos. Al
              seleccionar una comunidad autónoma se muestran señales útiles para vigilancia:
              patógeno dominante, ST, carbapenemasas y perfil de resistencia.
            </p>
          </div>
          {simulated ? <Badge variant="outline">Simulación controlada</Badge> : null}
        </div>
      </CardHeader>
      <CardContent className="grid gap-5 xl:grid-cols-[1.05fr_0.95fr]">
        <div className="relative h-[400px] overflow-hidden rounded-[1.7rem] border border-slate-200 bg-[radial-gradient(circle_at_top_left,_#f8fafc,_#ecfeff_42%,_#eef2ff)]">
          <div className="absolute inset-0 opacity-55 [background-image:linear-gradient(to_right,#cbd5e1_1px,transparent_1px),linear-gradient(to_bottom,#cbd5e1_1px,transparent_1px)] [background-size:36px_36px]" />
          <svg viewBox="0 0 100 100" className="absolute inset-0 h-full w-full p-8 opacity-20">
            <path
              d="M18 20 L35 12 L55 18 L77 16 L84 27 L78 38 L83 52 L75 67 L60 79 L46 82 L28 78 L18 69 L13 56 L17 40 Z"
              fill="#0f172a"
            />
          </svg>

          {regions.map((region, index) => (
            <button
              className="absolute -translate-x-1/2 -translate-y-1/2 transition hover:scale-110"
              key={region.regionCode}
              onClick={() => setActiveCode(region.regionCode)}
              onFocus={() => setActiveCode(region.regionCode)}
              onMouseEnter={() => setActiveCode(region.regionCode)}
              style={{ left: `${region.x}%`, top: `${region.y}%` }}
              type="button"
            >
              <div
                className="flex h-7 w-7 items-center justify-center rounded-full border-4 border-white text-[10px] font-semibold text-white shadow-lg"
                style={{
                  backgroundColor: REGION_PALETTE[index % REGION_PALETTE.length],
                }}
              >
                {region.samples}
              </div>
            </button>
          ))}
        </div>

        <div className="space-y-4">
          {activeRegion ? (
            <div className="rounded-[1.7rem] border border-slate-200 bg-slate-50/85 p-5">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-xs uppercase tracking-[0.18em] text-slate-400">
                    Comunidad activa
                  </p>
                  <h3 className="mt-2 text-2xl font-semibold text-slate-950">
                    {activeRegion.label}
                  </h3>
                </div>
                {simulated ? <Badge variant="outline">Señales simuladas</Badge> : null}
              </div>

              <div className="mt-5 grid gap-3 sm:grid-cols-2">
                <Metric label="Muestras" value={String(activeRegion.samples)} />
                <Metric label="Centros" value={String(activeRegion.centers)} />
                <Metric label="Patógeno dominante" value={activeRegion.dominantPathogen} />
                <Metric label="ST dominante" value={activeRegion.dominantSequenceType} />
              </div>

              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                <SignalBox
                  label="Carbapenemasa prioritaria"
                  value={activeRegion.dominantCarbapenemase}
                />
                <SignalBox
                  label="Perfil de resistencia"
                  value={activeRegion.dominantResistanceProfile}
                />
              </div>

              <div className="mt-5 grid gap-4">
                <MiniDistributionChart
                  items={activeRegion.carbapenemases}
                  title="Resistencias dominantes"
                />
                <MiniDistributionChart items={activeRegion.sequenceTypes} title="Top ST" />
                <MiniDistributionChart items={activeRegion.pathogens} title="Top patógenos" />
              </div>

              <div className="mt-4 grid gap-2">
                {activeRegion.notes.map((note) => (
                  <div
                    className="rounded-[1.15rem] border border-slate-200 bg-white px-4 py-3 text-sm leading-6 text-slate-600"
                    key={note}
                  >
                    {note}
                  </div>
                ))}
              </div>
            </div>
          ) : null}

          <div className="grid gap-2">
            {regions.map((region) => (
              <button
                className={`rounded-[1.15rem] border px-4 py-3 text-left text-sm transition ${
                  activeCode === region.regionCode
                    ? "border-slate-900 bg-slate-900 text-white"
                    : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
                }`}
                key={region.regionCode}
                onClick={() => setActiveCode(region.regionCode)}
                type="button"
              >
                <div className="flex items-center justify-between gap-3">
                  <span className="font-medium">{region.label}</span>
                  <span className={activeCode === region.regionCode ? "text-white/80" : "text-slate-400"}>
                    {region.samples} muestras
                  </span>
                </div>
                <p className={activeCode === region.regionCode ? "mt-2 text-white/75" : "mt-2 text-slate-500"}>
                  {region.dominantPathogen} · {region.dominantSequenceType}
                </p>
              </button>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-[1.15rem] border border-slate-200 bg-white px-4 py-3">
      <p className="text-xs uppercase tracking-[0.18em] text-slate-400">{label}</p>
      <p className="mt-2 text-base font-medium text-slate-900">{value}</p>
    </div>
  );
}

function SignalBox({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-[1.15rem] border border-slate-200 bg-white px-4 py-3">
      <p className="text-xs uppercase tracking-[0.18em] text-slate-400">{label}</p>
      <p className="mt-2 text-sm font-medium text-slate-900">{value}</p>
    </div>
  );
}

function MiniDistributionChart({
  items,
  title,
}: {
  items: DistributionItem[];
  title: string;
}) {
  return (
    <div className="rounded-[1.15rem] border border-slate-200 bg-white p-4">
      <p className="text-xs uppercase tracking-[0.18em] text-slate-400">{title}</p>
      <div className="mt-4 grid gap-3">
        {items.length > 0 ? (
          items.map((item) => (
            <div key={`${title}-${item.label}`} className="space-y-1.5">
              <div className="flex items-center justify-between gap-3 text-sm">
                <span className="font-medium text-slate-700">{item.label}</span>
                <span className="text-slate-400">
                  {item.value} · {item.share}%
                </span>
              </div>
              <div className="h-2 rounded-full bg-slate-100">
                <div
                  className="h-2 rounded-full bg-slate-900"
                  style={{ width: `${Math.max(item.share, 4)}%` }}
                />
              </div>
            </div>
          ))
        ) : (
          <p className="text-sm text-slate-500">No data available.</p>
        )}
      </div>
    </div>
  );
}
