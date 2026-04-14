import { useMemo, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { MepramTerritorialCoverageRegion } from "@/types/mepram";

const regionPalette = ["#0f766e", "#2563eb", "#7c3aed", "#ea580c", "#16a34a", "#64748b"];

export function TerritorialCoverageMap({
  description,
  regions,
  simulated,
  title,
}: {
  description: string;
  regions: MepramTerritorialCoverageRegion[];
  simulated: boolean;
  title: string;
}) {
  const [activeCode, setActiveCode] = useState<string | null>(regions[0]?.regionCode ?? null);
  const activeRegion = useMemo(
    () => regions.find((region) => region.regionCode === activeCode) ?? regions[0] ?? null,
    [activeCode, regions],
  );

  return (
    <Card className="border-white/70 bg-white/88">
      <CardHeader className="pb-4">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <CardTitle className="text-xl">{title}</CardTitle>
            <p className="mt-2 text-sm text-slate-500">{description}</p>
          </div>
          {simulated ? <Badge variant="outline">Simulación controlada</Badge> : null}
        </div>
      </CardHeader>
      <CardContent className="grid gap-5 xl:grid-cols-[1.25fr_0.95fr]">
        <div className="relative h-[360px] overflow-hidden rounded-[1.7rem] border border-slate-200 bg-[radial-gradient(circle_at_top_left,_#f8fafc,_#ecfeff_42%,_#eef2ff)]">
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
              onFocus={() => setActiveCode(region.regionCode)}
              onMouseEnter={() => setActiveCode(region.regionCode)}
              style={{ left: `${region.x}%`, top: `${region.y}%` }}
              type="button"
            >
              <div
                className="flex h-6 w-6 items-center justify-center rounded-full border-4 border-white shadow-lg"
                style={{
                  backgroundColor: regionPalette[index % regionPalette.length],
                }}
              />
            </button>
          ))}
        </div>

        <div className="space-y-4">
          {activeRegion ? (
            <div className="rounded-[1.7rem] border border-slate-200 bg-slate-50/85 p-5">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-xs uppercase tracking-[0.18em] text-slate-400">
                    Región activa
                  </p>
                  <h3 className="mt-2 text-2xl font-semibold text-slate-950">
                    {activeRegion.label}
                  </h3>
                </div>
                {activeRegion.simulated ? (
                  <Badge variant="outline">Simulada</Badge>
                ) : null}
              </div>
              <div className="mt-5 grid gap-3 sm:grid-cols-2">
                <Metric label="Muestras" value={String(activeRegion.samples)} />
                <Metric label="Centros" value={String(activeRegion.centers)} />
                <Metric label="Hospitales" value={String(activeRegion.hospitals)} />
                <Metric label="Patógeno dominante" value={activeRegion.dominantPathogen} />
              </div>
              <div className="mt-4 rounded-[1.2rem] border border-slate-200 bg-white px-4 py-3">
                <p className="text-xs uppercase tracking-[0.18em] text-slate-400">
                  Señal prioritaria
                </p>
                <p className="mt-2 text-sm font-medium text-slate-900">
                  {activeRegion.topResistanceSignal}
                </p>
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
