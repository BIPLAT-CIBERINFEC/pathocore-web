import { useEffect, useMemo, useState } from "react";
import ReactECharts from "echarts-for-react";
import * as echarts from "echarts";

import { Badge } from "@/components/ui/badge";
import { Surface, SectionHeading } from "@/components/mepram/MepramPrimitives";
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
  extremadura: {
    label: "Extremadura",
    regionCode: "extremadura",
    x: 24,
    y: 63,
  },
  galicia: { label: "Galicia", regionCode: "galicia", x: 17, y: 28 },
  la_rioja: { label: "La Rioja", regionCode: "la-rioja", x: 48, y: 24 },
  madrid: { label: "Comunidad de Madrid", regionCode: "madrid", x: 43, y: 48 },
  melilla: { label: "Melilla", regionCode: "melilla", x: 38, y: 96 },
  murcia: { label: "Región de Murcia", regionCode: "murcia", x: 62, y: 70 },
  navarra: {
    label: "Comunidad Foral de Navarra",
    regionCode: "navarra",
    x: 54,
    y: 25,
  },
  pais_vasco: { label: "País Vasco", regionCode: "pais-vasco", x: 57, y: 18 },
  valencia: {
    label: "Comunitat Valenciana",
    regionCode: "valencia",
    x: 71,
    y: 56,
  },
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


const limpiarTexto = (texto: string): string => {
  if (!texto) return "";
  return texto
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/comunidad de /g, "")
    .replace(/comunitat /g, "")
    .replace(/principado de /g, "")
    .replace(/region de /g, "")
    .replace(/islas /g, "")
    .replace(/illes /g, "")
    .replace(/[\s\-_]+/g, "")
    .trim();
};

const mapaNombresOficiales: Record<string, string> = {
  andalucia: "Andalucía",
  aragon: "Aragón",
  asturias: "Principado de Asturias",
  baleares: "Islas Baleares",
  canarias: "Canarias",
  cantabria: "Cantabria",
  castillayleon: "Castilla y León",
  castillalamancha: "Castilla-La Mancha",
  cataluna: "Cataluña",
  catalunya: "Cataluña",
  valencia: "Comunidad Valenciana",
  valenciana: "Comunidad Valenciana",
  extremadura: "Extremadura",
  galicia: "Galicia",
  madrid: "Comunidad de Madrid",
  murcia: "Región de Murcia",
  navarra: "Comunidad Foral de Navarra",
  paisvasco: "País Vasco",
  euskadi: "País Vasco",
  larioja: "La Rioja",
  rioja: "La Rioja",
  ceuta: "Ceuta",
  melilla: "Melilla",
};


interface DistributionItem {
  label: string;
  share: number;
  value: number;
}

interface ExplorerRegionSummary {
  amrGeneProfiles: DistributionItem[];
  blaCarbProfiles: DistributionItem[];
  centers: number;
  dominantAmrGeneProfile: string;
  dominantBlaCarb: string;
  dominantPathogen: string;
  dominantSequenceType: string;
  label: string;
  notes: string[];
  pathogens: DistributionItem[];
  regionCode: string;
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

function distribution(
  values: Array<string | null>,
  limit = 4
): DistributionItem[] {
  const counts = new Map<string, number>();

  values
    .filter((value): value is string => Boolean(value))
    .forEach((value) => {
      counts.set(value, (counts.get(value) ?? 0) + 1);
    });

  const total = Array.from(counts.values()).reduce(
    (sum, value) => sum + value,
    0
  );

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
      const sequenceTypes = distribution(
        group.rows.map((row) => row.sequenceType)
      );
      const blaCarbProfiles = distribution(
        group.rows.map((row) => row.blaCarb)
      );
      const amrGeneProfiles = distribution(
        group.rows.map((row) => row.amrGene)
      );
      const centers = new Set(
        group.rows
          .map((row) => row.submittingInstitution)
          .filter((value): value is string => Boolean(value))
      ).size;

      return {
        amrGeneProfiles,
        blaCarbProfiles,
        centers,
        dominantAmrGeneProfile: mode(amrGeneProfiles),
        dominantBlaCarb: mode(blaCarbProfiles),
        dominantPathogen: mode(pathogens),
        dominantSequenceType: mode(sequenceTypes),
        label: group.label,
        notes: [
          `${group.rows.length} isolates in the filtered subset.`,
          `${centers} sending centers with activity in this community.`,
        ],
        pathogens,
        regionCode: group.regionCode,
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
  const maxSamples = useMemo(
    () => Math.max(...regions.map((region) => region.samples), 1),
    [regions]
  );
  const [activeCode, setActiveCode] = useState<string | null>(
    regions[0]?.regionCode ?? null
  );
  const [mapReady, setMapReady] = useState(false);

  const activeRegion = useMemo(
    () =>
      regions.find((region) => region.regionCode === activeCode) ??
      regions[0] ??
      null,
    [activeCode, regions]
  );

  useEffect(() => {
    async function loadMap() {
      if (echarts.getMap("Spain")) {
        setMapReady(true);
        return;
      }

      try {
        const geoRes = await fetch("/data/spain-communities.geojson");
        if (!geoRes.ok) throw new Error("GeoJSON not found");

        const spainGeoJson = await geoRes.json();

        const shiftCoordinates = (
          geometry: any,
          dLng: number,
          dLat: number
        ) => {
          const shiftPoint = (coord: number[]) => [
            coord[0] + dLng,
            coord[1] + dLat,
          ];
          const shiftRing = (ring: number[][]) => ring.map(shiftPoint);
          const shiftPolygon = (polygon: number[][][]) =>
            polygon.map(shiftRing);

          if (geometry.type === "Polygon") {
            geometry.coordinates = shiftPolygon(geometry.coordinates);
          } else if (geometry.type === "MultiPolygon") {
            geometry.coordinates = geometry.coordinates.map(shiftPolygon);
          }
        };

        if (spainGeoJson && spainGeoJson.features) {
          spainGeoJson.features = spainGeoJson.features.map((feature: any) => {
            const props = feature.properties || {};
            const posiblesClaves = [
              "NAME_1",
              "name",
              "NAME",
              "comunidad",
              "texto",
              "label",
            ];
            let nombreDetectado = "";

            for (const clave of posiblesClaves) {
              if (props[clave]) {
                nombreDetectado = props[clave];
                break;
              }
            }

            if (!nombreDetectado) {
              const valores = Object.values(props);
              const stringVal = valores.find((v) => typeof v === "string");
              nombreDetectado = stringVal ? String(stringVal) : "";
            }

            const claveLimpia = limpiarTexto(nombreDetectado);
            const nombreFinalCorregido =
              mapaNombresOficiales[claveLimpia] || nombreDetectado;

            if (nombreFinalCorregido === "Canarias" && feature.geometry) {
              shiftCoordinates(feature.geometry, 5.5, 7.5);
            }

            return {
              ...feature,
              properties: { ...props, name: nombreFinalCorregido },
            };
          });
        }

        echarts.registerMap("Spain", spainGeoJson as any);
        setMapReady(true);
      } catch (error) {
        console.error("Error inicializando el mapa de cobertura:", error);
      }
    }

    loadMap();
  }, []);

  const mapData = useMemo(() => {
    return regions.map((item) => {
      const claveLimpia = limpiarTexto(item.label);
      const nombreOficialMapped =
        mapaNombresOficiales[claveLimpia] || item.label;
      return {
        name: nombreOficialMapped,
        value: item.samples,
        regionCode: item.regionCode,
      };
    });
  }, [regions]);

  const maxVal =
    mapData.length > 0 ? Math.max(...mapData.map((o: any) => o.value)) : 100;

  const option = {
    tooltip: {
      trigger: "item",
      backgroundColor: "#0f172a",
      borderRadius: 12,
      padding: [12, 16],
      borderWidth: 0,
      shadowColor: "rgba(15, 23, 42, 0.15)",
      shadowBlur: 15,
      textStyle: {
        color: "#fff",
        fontSize: 13,
        fontFamily: "ui-sans-serif, system-ui",
      },
      formatter: function (params: any) {
        const value = params.value || 0;
        return `
          <div style="font-family: sans-serif;">
            <p style="margin: 0; color: #94a3b8; font-weight: 600; font-size: 11px; text-transform: uppercase; letter-spacing: 0.05em;">${params.name}</p>
            <p style="margin: 6px 0 0 0; font-size: 15px; font-weight: 700; color: #fff;">${value} <span style="font-size: 12px; font-weight: 400; color: #cbd5e1;">samples</span></p>
          </div>
        `;
      },
    },
    visualMap: {
      min: 0,
      max: maxVal,
      left: "left",
      bottom: 15,
      text: ["High", "Low"],
      calculable: true,
      inRange: {
        color: ["#ddd6fe", "#8b5cf6", "#4f46e5", "#1e1b4b"],
      },
      textStyle: {
        color: "#64748b",
        fontSize: 11,
        fontWeight: 600,
      },
    },
    series: [
      {
        name: "Samples by Region",
        type: "map",
        map: "Spain",
        roam: false,
        layoutCenter: ["50%", "46%"],
        layoutSize: "100%",
        aspectScale: 0.82,
        label: {
          show: false,
          emphasis: {
            show: true,
            color: "#4F46E5",
            fontWeight: "bold",
          },
        },
        itemStyle: {
          borderColor: "#CBD5E1",
          borderWidth: 1.2,
          areaColor: "#f1f5f9",
        },
        emphasis: {
          itemStyle: {
            areaColor: "#4F46E5",
            borderWidth: 2,
            shadowColor: "rgba(79, 70, 229, 0.2)",
            shadowBlur: 12,
          },
        },
        data: mapData,
      },
    ],
  };

  const onEvents = {
    click: (params: any) => {
      if (params.data && params.data.regionCode) {
        setActiveCode(params.data.regionCode);
      }
    },
  };

  if (rows.length === 0 || regions.length === 0) {
    return (
      <Surface className="p-6 border border-slate-100 shadow-sm transition-all hover:border-slate-200">
        <SectionHeading
          title="Geographic results"
          description={
            rows.length === 0
              ? "The territorial map is fed from the same subset as the table. Adjust or clear filters to retrieve results with geographic information."
              : "The current search returns rows, but does not include operational autonomous communities with coordinates assigned in this view."
          }
        />
      </Surface>
    );
  }

  return (
    <Surface className="p-6 border border-slate-100 shadow-sm transition-all hover:border-slate-200">
      <div className="flex flex-wrap items-start justify-between gap-3 mb-6">
        <SectionHeading
          title="Geographic results"
          description="Territorial coverage of the subset returned by the filters assets. When selecting an autonomous community, signs are shown useful for surveillance: dominant pathogen, ST, bla_carb and genes AMR."
        />
        {simulated ? (
          <Badge variant="outline" className="rounded-full">
            Controlled simulation
          </Badge>
        ) : null}
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.25fr_0.95fr]">
        <div className="relative h-[400px] overflow-hidden rounded-[24px] border border-slate-100 bg-white flex items-center justify-center">
          {!mapReady ? (
            <div className="text-slate-400 text-[10px] uppercase tracking-widest animate-pulse font-bold">
              Loading interactive map...
            </div>
          ) : (
            <ReactECharts
              option={option}
              style={{ height: "100%", width: "100%" }}
              lazyUpdate={true}
              onEvents={onEvents}
            />
          )}
        </div>

        <div className="space-y-4">
          {activeRegion ? (
            <div className="rounded-[24px] border border-slate-100/80 bg-slate-50/40 p-6 shadow-sm">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-[10px] uppercase tracking-[0.2em] text-slate-400 font-bold">
                    Active community
                  </p>
                  <h3 className="mt-1 text-2xl font-semibold text-slate-950 tracking-tight">
                    {activeRegion.label}
                  </h3>
                </div>
                {simulated ? (
                  <Badge variant="outline" className="rounded-full">
                    Simulated signals
                  </Badge>
                ) : null}
              </div>

              <div className="mt-5 grid gap-3 sm:grid-cols-2">
                <Metric label="Muestras" value={String(activeRegion.samples)} />
                <Metric label="Centros" value={String(activeRegion.centers)} />
                <Metric
                  label="Dominant pathogen"
                  value={activeRegion.dominantPathogen}
                />
                <Metric
                  label="Dominant ST"
                  value={activeRegion.dominantSequenceType}
                />
              </div>

              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                <SignalBox
                  label="priority bla_carb"
                  value={activeRegion.dominantBlaCarb}
                />
                <SignalBox
                  label="priority Gen AMR"
                  value={activeRegion.dominantAmrGeneProfile}
                />
              </div>

              <div className="mt-6 grid gap-4 grid-cols-1 sm:grid-cols-2">
                <MiniDistributionChart
                  items={activeRegion.blaCarbProfiles}
                  title="frequent bla_carb"
                />
                <MiniDistributionChart
                  items={activeRegion.amrGeneProfiles}
                  title="Frequent AMR genes"
                />
                <MiniDistributionChart
                  items={activeRegion.sequenceTypes}
                  title="Top ST"
                />
                <MiniDistributionChart
                  items={activeRegion.pathogens}
                  title="Top pathogens"
                />
              </div>

              <div className="mt-6 grid gap-2">
                {activeRegion.notes.map((note) => (
                  <div
                    className="rounded-[18px] border border-slate-100 bg-white px-4 py-3 text-xs leading-relaxed text-slate-500 italic"
                    key={note}
                  >
                    "{note}"
                  </div>
                ))}
              </div>
            </div>
          ) : null}

          <div className="grid gap-2 overflow-y-auto max-h-[160px] pr-1 scrollbar-thin">
            {regions.map((region) => (
              <button
                className={`rounded-[18px] border px-4 py-2.5 text-left text-xs transition-all font-medium ${
                  activeCode === region.regionCode
                    ? "border-transparent bg-[#0f172a] text-white shadow-sm"
                    : "border-slate-100 bg-white text-slate-600 hover:bg-slate-50 hover:border-indigo-100 hover:text-[#4f46e5]"
                }`}
                key={region.regionCode}
                onClick={() => setActiveCode(region.regionCode)}
                type="button"
              >
                <div className="flex items-center justify-between gap-3">
                  <span className="truncate">{region.label}</span>
                  <span
                    className={
                      activeCode === region.regionCode
                        ? "text-white/80 font-mono"
                        : "text-slate-400 font-mono"
                    }
                  >
                    {region.samples} u.
                  </span>
                </div>
                <p
                  className={`mt-1 truncate text-[10px] ${
                    activeCode === region.regionCode
                      ? "text-slate-300"
                      : "text-slate-400"
                  }`}
                >
                  {region.dominantPathogen}
                </p>
              </button>
            ))}
          </div>
        </div>
      </div>
    </Surface>
  );
}


function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-[18px] border border-slate-100 bg-white px-4 py-2.5 shadow-sm">
      <p className="text-[10px] font-semibold text-slate-400 tracking-tight">
        {label}
      </p>
      <p className="mt-1 text-base font-bold text-slate-900 font-mono tracking-tight truncate">
        {value}
      </p>
    </div>
  );
}

function SignalBox({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-[18px] border border-slate-100 bg-white px-4 py-3 shadow-sm">
      <p className="text-[10px] uppercase tracking-[0.18em] text-slate-400 font-bold">
        {label}
      </p>
      <p className="mt-1.5 text-sm font-semibold text-slate-800 truncate">
        {value}
      </p>
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
    <div className="rounded-[18px] border border-slate-100 bg-white p-4 shadow-sm flex flex-col h-full">
      <p className="text-[10px] uppercase tracking-[0.18em] text-slate-400 font-bold">
        {title}
      </p>
      <div className="mt-4 grid gap-3 flex-1 content-start">
        {items.length > 0 ? (
          items.map((item) => (
            <div key={`${title}-${item.label}`} className="space-y-1.5">
              <div className="flex items-center justify-between gap-3 text-xs">
                <span
                  className="font-medium text-slate-700 truncate"
                  title={item.label}
                >
                  {item.label}
                </span>
                <span className="text-slate-400 font-mono shrink-0">
                  {item.share}%
                </span>
              </div>
              <div className="h-1.5 rounded-full bg-slate-100 overflow-hidden">
                <div
                  className="h-full rounded-full bg-[#4f46e5] transition-all duration-500 ease-out"
                  style={{ width: `${Math.max(item.share, 2)}%` }}
                />
              </div>
            </div>
          ))
        ) : (
          <p className="text-xs text-slate-400 italic">No data</p>
        )}
      </div>
    </div>
  );
}
