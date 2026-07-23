"use client";

import { useEffect, useState } from "react";
import ReactECharts from "echarts-for-react";
import * as echarts from "echarts";
import { Surface, SectionHeading } from "@/components/mepram/MepramPrimitives";

export type GeographyItem = {
  label: string;
  value: number;
};

interface GeographicCoverageProps {
  data: GeographyItem[];
  loading: boolean;
}

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

export default function GeographicCoverage({
  data,
  loading,
}: GeographicCoverageProps) {
  const [mapReady, setMapReady] = useState(false);

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

       const shiftCoordinates = (geometry: any, dLng: number, dLat: number) => {
         const shiftPoint = (coord: number[]) => [
           coord[0] + dLng,
           coord[1] + dLat,
         ];
         const shiftRing = (ring: number[][]) => ring.map(shiftPoint);
         const shiftPolygon = (polygon: number[][][]) => polygon.map(shiftRing);

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

  const mapData = data.map((item) => {
    const claveLimpia = limpiarTexto(item.label);
    const nombreOficialMapped = mapaNombresOficiales[claveLimpia] || item.label;
    return {
      name: nombreOficialMapped,
      value: item.value,
    };
  });

  const maxVal = data.length > 0 ? Math.max(...data.map((o) => o.value)) : 100;

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

  return (
    <Surface>
      <SectionHeading
        title="Geographic coverage"
        description="Coverage by region using geo_loc_state and fallbacks mapped over Spain"
      />
      <div className="h-[400px] w-full mt-6 relative overflow-hidden flex items-center justify-center">
        {loading || !mapReady ? (
          <div className="text-slate-400 text-[10px] uppercase tracking-widest animate-pulse font-bold">
            Loading interactive map...
          </div>
        ) : (
          <ReactECharts
            option={option}
            style={{ height: "100%", width: "100%" }}
            lazyUpdate={true}
          />
        )}
      </div>
    </Surface>
  );
}
