import { useState } from "react";
import {
  Activity,
  Building2,
  Microscope,
  MapPinned,
  Lock,
  LogIn,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { SectionHeading, Surface } from "@/components/mepram/MepramPrimitives";

import { useMepram } from "hooks/use-mepram";
import { useAuth } from "hooks/use-auth";
import { MepramPageHeader } from "./databrowser/mepram-page-header";
import { DataStatusPanel } from "./databrowser/data-status-panel";
import { LineChartPanel, PieChartPanel } from "./databrowser/chart-card";
import { MultiSeriesBarPanel } from "./databrowser/multi-series-bar-panel";
import { TerritorialCoverageMap } from "./databrowser/territorial-coverage-map";

const kpiStyles = [
  {
    borderHover: "hover:border-[#4f46e5]/30",
    iconBg: "bg-indigo-50/60 text-[#4f46e5] group-hover:bg-[#4f46e5]",
    icon: Microscope,
  },
  {
    borderHover: "hover:border-[#8b5cf6]/30",
    iconBg: "bg-indigo-50/60 text-[#4f46e5] group-hover:bg-[#4f46e5]",
    icon: Activity,
  },
  {
    borderHover: "hover:border-[#ec4899]/30",
    iconBg: "bg-indigo-50/60 text-[#4f46e5] group-hover:bg-[#4f46e5]",
    icon: MapPinned,
  },
  {
    borderHover: "hover:border-[#10b981]/30",
    iconBg: "bg-indigo-50/60 text-[#4f46e5] group-hover:bg-[#4f46e5]",
    icon: Building2,
  },
];

export function MepramDataPage() {
  const { login, accessToken } = useAuth();
  const { error, refresh, snapshot, status } = useMepram(accessToken);

  // const isUnauthorized =
  //   error?.includes("401") ||
  //   error?.toLowerCase().includes("unauthorized") ||
  //   !accessToken;

  // if (isUnauthorized) {
  //   return (
  //     <div className="space-y-6 animate-in fade-in duration-700">
  //       <MepramPageHeader
  //         currentSection="Use case data"
  //         sectionDescription="Quick read of the use case status with basic metrics, aggregated results, and dashboards of interest for monitoring."
  //       />

  //       <div className="flex min-h-[45vh] items-center justify-center px-4 py-8">
  //         <Surface className="w-full max-w-md border border-slate-100 p-8 text-center rounded-[24px] shadow-xl bg-white/80 backdrop-blur-sm">
  //           <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-amber-50 text-amber-600 border border-amber-200">
  //             <Lock className="h-5 w-5" />
  //           </div>
  //           <h2 className="text-xl font-bold text-slate-800 tracking-tight">
  //             Required Authentication
  //           </h2>
  //           <p className="mt-2 text-sm text-slate-500 leading-relaxed">
  //             The use case data section requires an active session to securely
  //             query backend endpoints.
  //           </p>
  //           <p className="my-6 text-sm text-slate-600 leading-relaxed">
  //             Click the button below to be redirected to the home panel Keycloak
  //             secure session and synchronize the Data Browser.
  //           </p>
  //           <Button
  //             onClick={() => {
  //               if (typeof login === "function") {
  //                 void login();
  //               } else {
  //                 console.error(
  //                   "The 'login' method is not available in the useAuth hook."
  //                 );
  //               }
  //             }}
  //             className="flex w-full items-center justify-center gap-2 rounded-full bg-[#4D45E1] py-2.5 text-sm font-medium text-white shadow-md transition-all hover:bg-slate-800 active:scale-[0.98]"
  //           >
  //             <LogIn className="h-4 w-4" />
  //             Login with Keycloak
  //           </Button>
  //         </Surface>
  //       </div>
  //     </div>
  //   );
  // }

  if (!snapshot) {
    return (
      <DataStatusPanel
        error={error}
        onRetry={() => void refresh()}
        status={status}
      />
    );
  }

  const overview = snapshot.overview ?? {};

  const pathogenDistributionData =
    overview.project_pathogen_distribution?.map((item: any) => ({
      label: item.label ?? "Desconocido",
      value: item.value ?? 0,
    })) ?? [];

  const pathogenAnnualSeries = {
    categories:
      overview.annual_pathogen_series?.data?.map((d: any) => d.label) ?? [],
    series:
      overview.annual_pathogen_series?.series?.map((s: any) => ({
        name: s.label,
        data:
          overview.annual_pathogen_series?.data?.map(
            (d: any) => d[s.key] ?? 0
          ) ?? [],
      })) ?? [],
  };

  const resistanceGenesSeries = {
    categories:
      overview.resistance_signals_series?.data?.map((d: any) => d.label) ?? [],
    series:
      overview.resistance_signals_series?.series?.map((s: any) => ({
        name: s.label,
        data:
          overview.resistance_signals_series?.data?.map(
            (d: any) => d[s.key] ?? 0
          ) ?? [],
      })) ?? [],
  };

  const specimenSourcesData =
    overview.specimen_sources?.map((item: any) => ({
      label: item.label ?? "Desconocido",
      value: item.value ?? 0,
    })) ?? [];

  const collectionTimelineData =
    overview.collection_timeline?.map((item: any) => ({
      label: item.label ?? "Sin fecha",
      value: item.value ?? 0,
    })) ?? [];

  const safeRegions =
    overview.territorial_coverage?.map((reg: any, index: number) => {
      const defaultPositions: Record<string, { x: number, y: number }> = {
        "ES-AN": { x: 38, y: 76 }, 
      };

      const regionCode = reg.geo?.code || `REG-${index + 1}`;
      const position = defaultPositions[regionCode] || {
        x: 25 + ((index * 18) % 60),
        y: 30 + ((index * 14) % 50),
      };

      return {
        regionCode: regionCode,
        label: reg.label || reg.geo?.label || "Unknown Region",
        samples: reg.samples ?? 0,
        centers: reg.centers ?? 0,
        hospitals: reg.hospitals ?? 0,
        dominantPathogen: reg.dominant_pathogen || "Under surveillance",
        topResistanceSignal: reg.top_resistance_signal || "None registered",
        notes: reg.notes ?? [],
        simulated: reg.simulated ?? false,
        x: position.x,
        y: position.y,
      };
    }) ?? [];

  return (
    <div className="space-y-10 animate-in fade-in duration-700">
      <MepramPageHeader
        currentSection="Use case data"
        sectionDescription="Quick read of the use case status with basic metrics, aggregated results, and dashboards of interest for monitoring."
      />

 
      {/* <Surface className="p-8 border border-slate-100/80 bg-slate-50/30 rounded-[24px]">
        <div className="flex items-center gap-2 mb-3">
          <span className="px-3 py-1 bg-[#0f172a] text-white rounded-full text-[10px] font-bold uppercase tracking-wider">
            Active project: {snapshot.project_label ?? "mepram"}
          </span>
        </div>
        <div className="space-y-2">
          {overview.notes?.map((note: string, idx: number) => (
            <p
              key={idx}
              className="text-sm text-slate-500 max-w-4xl leading-relaxed flex items-start gap-2"
            >
              <span className="text-slate-400 select-none">•</span> {note}
            </p>
          ))}
        </div>
      </Surface> */}

      <div className="grid gap-6 grid-cols-1 md:grid-cols-2 xl:grid-cols-4">
        {overview.kpis?.map((kpi: any, index: number) => {
          const style = kpiStyles[index % kpiStyles.length];
          const IconComponent = style.icon;

          return (
            <Surface
              key={kpi.label}
              className={`p-6 border border-slate-100 shadow-sm flex items-center justify-between group transition-colors ${style.borderHover}`}
            >
              <div className="space-y-1">
                <p className="text-xs font-semibold text-slate-400 tracking-tight">
                  {kpi.label}
                </p>
                <p className="text-4xl font-bold text-slate-900 tracking-tight font-mono">
                  {kpi.value}
                </p>
                {kpi.note && (
                  <p className="text-[11px] text-slate-400 pt-1">{kpi.note}</p>
                )}
              </div>
              <div
                className={`p-3.5 rounded-2xl group-hover:text-white transition-all duration-300 ${style.iconBg}`}
              >
                <IconComponent className="w-5 h-5" />
              </div>
            </Surface>
          );
        })}
      </div>

      <div className="max-w-3xl pt-4">
        <SectionHeading
          eyebrow="Data and results"
          title="Use Case Monitoring Landscape"
          description="Analytical monitoring of the real metadata and bioinformatic processes of the Mepram ecosystem."
        />
      </div>

      <div className="grid gap-8 lg:grid-cols-2">
        <PieChartPanel
          data={pathogenDistributionData}
          description="Percentage distribution of pathogenic species identified within the pool of samples processed by the pipeline."
          title="Pathogen distribution"
        />

        <MultiSeriesBarPanel
          chart={pathogenAnnualSeries}
          description="Annual chronological volume segmented by bacterial species for the detection of infection peaks."
          title="Annual samples grouped by pathogen"
        />

        <div className="lg:col-span-2">
          <MultiSeriesBarPanel
            chart={resistanceGenesSeries}
            description="Consolidated presence per year of the main mechanisms and determinants of antimicrobial resistance (AMR) such as carbapenemases."
            stacked
            title="Top resistance genes currently grouped by pathogen"
          />
        </div>

        <PieChartPanel
          data={specimenSourcesData}
          description="Classification according to the anatomical site of clinical collection. Note: There are currently no samples associated with this field in metadata."
          title="Distribution by sample origin"
        />

        <LineChartPanel
          data={collectionTimelineData}
          description="Evolutionary timeline of records based strictly on the sample_collection_date property."
          title="Isolations by collection date"
        />
      </div>

      <div className="pt-4">
        <TerritorialCoverageMap
          description="Territorial representation of contributing Andalusian and Madrid health centers mapped from the backend."
          regions={safeRegions}
          simulated={overview.territorial_coverage_simulated ?? false}
          title="Territorial coverage"
        />
      </div>
    </div>
  );
}
