"use client";

import { useEffect, useState } from "react";
import { Info, FlaskConical, FolderGit2, FileCode2 } from "lucide-react";
import { SectionHeading, Surface } from "@/components/mepram/MepramPrimitives";

import SampleGrowthChart from "./Graficos/SampleGrowthChart";
import PathogenDistribution, {
  PathogenItem,
} from "./Graficos/PathogenDistribution";
import GeographicCoverage, {
  GeographyItem,
} from "./Graficos/GeographicCoverage";
import SamplesBySchema, { SchemaItem } from "./Graficos/SamplesBySchema";

interface KpiData {
  samples: number;
  schemas: number;
  metadataProperties: number;
}

interface ApiKpiItem {
  label: string;
  value: string | number;
  note?: string;
}

interface GrowthDataPoint {
  date: string;
  value: number;
}

export default function OverviewSamples() {
  const [kpiData, setKpiData] = useState<KpiData>({
    samples: 0,
    schemas: 0,
    metadataProperties: 0,
  });
  const [methodNotes, setMethodNotes] = useState<string[]>([]);

  const [growthData, setGrowthData] = useState<GrowthDataPoint[]>([]);
  const [pathogenData, setPathogenData] = useState<PathogenItem[]>([]);
  const [geographyData, setGeographyData] = useState<GeographyItem[]>([]);
  const [schemaData, setSchemaData] = useState<SchemaItem[]>([]);

  const [isLoadingData, setIsLoadingData] = useState<boolean>(true);
const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;
  useEffect(() => {
    setIsLoadingData(true);
    fetch(`${baseUrl}/databrowser/overview-summary`)
      .then((res) => res.json())
      .then((json) => {
        const allNotes = [
          ...(json.notes || []),
          ...(json.coverage_notes || []),
        ];
        setMethodNotes(allNotes);

        if (json.kpis && Array.isArray(json.kpis)) {
          const findKpiValue = (labelName: string): number => {
            const item = json.kpis.find(
              (k: ApiKpiItem) =>
                k.label.toLowerCase() === labelName.toLowerCase()
            );
            return item ? Number(item.value) : 0;
          };

          setKpiData({
            samples: findKpiValue("Samples"),
            schemas: findKpiValue("Schemas"),
            metadataProperties: findKpiValue("Metadata properties"),
          });
        }

        const rawGrowth = json.sample_growth || [];
        const formattedGrowth = rawGrowth
          .map((item: any) => ({
            date: item.label,
            value: item.value,
          }))
          .sort(
            (a: GrowthDataPoint, b: GrowthDataPoint) =>
              new Date(a.date).getTime() - new Date(b.date).getTime()
          );
        setGrowthData(formattedGrowth);

        setPathogenData(json.pathogens || []);

        setGeographyData(json.geography || []);

        setSchemaData(json.schema_mix || []);
      })
      .catch((error) => {
        console.error("Error fetching databrowser summary data:", error);
      })
      .finally(() => {
        setIsLoadingData(false);
      });
  }, []);

  return (
    <div className="space-y-10 animate-in fade-in duration-700">
      <Surface className="p-8 border border-slate-100/80 bg-slate-50/30 rounded-[24px]">
        <div className="flex items-center gap-2 mb-3">
          <span className="px-3 py-1 bg-[#0f172a] text-white rounded-full text-[10px] font-bold uppercase tracking-wider">
            Current section: Overview
          </span>
        </div>
        <p className="text-sm text-slate-500 max-w-4xl leading-relaxed">
          Aggregated summary of sample content visible in PathoCore, with
          temporal growth, pathogen distribution, geographic coverage, and
          schema mixing.
        </p>
      </Surface>

      <div className="grid gap-6 grid-cols-1 md:grid-cols-3">
        <Surface className="p-6 border border-slate-100 shadow-sm flex items-center justify-between group hover:border-[#4f46e5]/30 transition-colors">
          <div className="space-y-1">
            <p className="text-xs font-semibold bg-indigo-50/60 text-[#4f46e5] ">
              Samples
            </p>
            <p
              className={`text-4xl font-bold text-slate-900 tracking-tight font-mono ${
                isLoadingData ? "animate-pulse text-slate-300" : ""
              }`}
            >
              {isLoadingData ? "..." : kpiData.samples.toLocaleString()}
            </p>
            <p className="text-[11px] text-slate-400 pt-1">
              Samples included in the global snapshot
            </p>
          </div>
          <div className="p-3.5 bg-indigo-50/60 text-[#4f46e5] rounded-2xl group-hover:bg-[#4f46e5] group-hover:text-white transition-all duration-300">
            <FlaskConical className="w-5 h-5" />
          </div>
        </Surface>

        <Surface className="p-6 border border-slate-100 shadow-sm flex items-center justify-between group hover:border-[#8b5cf6]/30 transition-colors">
          <div className="space-y-1">
            <p className="text-xs font-semibold bg-indigo-50/60 text-[#4f46e5] ">
              Schemas
            </p>
            <p
              className={`text-4xl font-bold text-slate-900 tracking-tight font-mono ${
                isLoadingData ? "animate-pulse text-slate-300" : ""
              }`}
            >
              {isLoadingData ? "..." : kpiData.schemas.toLocaleString()}
            </p>
            <p className="text-[11px] text-slate-400 pt-1">
              Active schemas included in the global snapshot
            </p>
          </div>
          <div className="p-3.5 bg-indigo-50/60 text-[#4f46e5] rounded-2xl group-hover:bg-[#4f46e5] group-hover:text-white transition-all duration-300">
            <FolderGit2 className="w-5 h-5" />
          </div>
        </Surface>

        <Surface className="p-6 border border-slate-100 shadow-sm flex items-center justify-between group ">
          <div className="space-y-1">
            <p className="text-xs font-semibold bg-indigo-50/60 text-[#4f46e5] ">
              Metadata properties
            </p>
            <p
              className={`text-4xl font-bold text-slate-900 tracking-tight font-mono ${
                isLoadingData ? "animate-pulse text-slate-300" : ""
              }`}
            >
              {isLoadingData
                ? "..."
                : kpiData.metadataProperties.toLocaleString()}
            </p>
            <p className="text-[11px] text-slate-400 pt-1">
              Different properties with observed values
            </p>
          </div>
          <div className="p-3.5 bg-indigo-50/60 text-[#4f46e5] rounded-2xl group-hover:bg-[#4f46e5] group-hover:text-white transition-all duration-300">
            <FileCode2 className="w-5 h-5" />
          </div>
        </Surface>
      </div>

      <div className="max-w-3xl pt-4">
        <SectionHeading
          eyebrow="Genomic metrics"
          title="Overview of Samples"
          description="Added summary of sample content visible in PathoCore."
        />
      </div>

      <div className="grid gap-8 lg:grid-cols-2">
        <SampleGrowthChart data={growthData} loading={isLoadingData} />
        <PathogenDistribution data={pathogenData} loading={isLoadingData} />
        <GeographicCoverage data={geographyData} loading={isLoadingData} />
        <SamplesBySchema data={schemaData} loading={isLoadingData} />
      </div>
    </div>
  );
}
