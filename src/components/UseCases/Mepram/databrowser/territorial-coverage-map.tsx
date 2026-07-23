import { useEffect, useState, useMemo } from "react";
import ReactECharts from "echarts-for-react";
import * as echarts from "echarts";
import { Badge } from "@/components/ui/badge";
import { Surface, SectionHeading } from "@/components/mepram/MepramPrimitives";

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
};

export function TerritorialCoverageMap({
  description,
  regions,
  simulated,
  title,
}: any) {
  const [activeCode, setActiveCode] = useState(regions[0]?.regionCode ?? null);
  const [mapReady, setMapReady] = useState(false);

  const activeRegion = useMemo(
    () =>
      regions.find((region: any) => region.regionCode === activeCode) ??
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

        if (!geoRes.ok) {
          throw new Error(`GeoJSON not found. Status: ${geoRes.status}`);
        }

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
              properties: {
                ...props,
                name: nombreFinalCorregido,
              },
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
    return regions.map((item: any) => {
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

  return (
    <Surface className="p-6 border border-slate-100 shadow-sm transition-all hover:border-slate-200">
      <div className="flex flex-wrap items-start justify-between gap-3 mb-6">
        <SectionHeading title={title} description={description} />
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
                    Active region
                  </p>
                  <h3 className="mt-1 text-2xl font-semibold text-slate-950 tracking-tight">
                    {activeRegion.label}
                  </h3>
                </div>
                {activeRegion.simulated ? (
                  <Badge variant="outline" className="rounded-full">
                    Simulated
                  </Badge>
                ) : null}
              </div>
              <div className="mt-5 grid gap-3 sm:grid-cols-2">
                <Metric label="Samples" value={String(activeRegion.samples)} />
                <Metric label="Centers" value={String(activeRegion.centers)} />
                <Metric
                  label="Hospitals"
                  value={String(activeRegion.hospitals)}
                />
                <Metric
                  label="Dominant pathogen"
                  value={activeRegion.dominantPathogen}
                />
              </div>
              <div className="mt-4 rounded-[18px] border border-slate-100 bg-white px-4 py-3 shadow-sm">
                <p className="text-[10px] uppercase tracking-[0.18em] text-slate-400 font-bold">
                  Priority signal
                </p>
                <p className="mt-1.5 text-sm font-semibold text-slate-800">
                  {activeRegion.topResistanceSignal}
                </p>
              </div>
              <div className="mt-4 grid gap-2">
                {activeRegion.notes?.map((note: any) => (
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
            {regions.map((region: any) => (
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
                  <span>{region.label}</span>
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
              </button>
            ))}
          </div>
        </div>
      </div>
    </Surface>
  );
}

function Metric({ label, value }: any) {
  return (
    <div className="rounded-[18px] border border-slate-100 bg-white px-4 py-2.5 shadow-sm">
      <p className="text-[10px] font-semibold text-slate-400 tracking-tight">
        {label}
      </p>
      <p className="mt-1 text-base font-bold text-slate-900 font-mono tracking-tight">
        {value}
      </p>
    </div>
  );
}
