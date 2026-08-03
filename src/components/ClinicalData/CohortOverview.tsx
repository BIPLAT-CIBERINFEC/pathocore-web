"use client";

import { useEffect, useState, useCallback } from "react";
import { Surface } from "@/components/mepram/MepramPrimitives";
import {
  Users,
  Activity,
  Stethoscope,
  AlertCircle,
  RefreshCw,
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { ResponsivePie } from "@nivo/pie";

interface CohortOverviewProps {
  activeSection: string;
  setActiveSection: (section: string) => void;
}

export default function CohortOverview({
  activeSection,
  setActiveSection,
}: CohortOverviewProps) {
  const [cohortData, setCohortData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const colors = ["#4f46e5", "#8b5cf6", "#ec4899", "#6366f1"];

  const fetchCohortSummary = useCallback(() => {
    setLoading(true);
    setErrorMsg(null);

    const apiBase =
      process.env.NEXT_PUBLIC_MEPRAM_API_BASE_URL || "/api/omop/v1";
    fetch(`${apiBase}/cohort/summary`)
      .then((res) => {
        if (!res.ok)
          throw new Error(`Server returned status code ${res.status}`);
        return res.json();
      })
      .then((data) => {
        setCohortData(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error fetching cohort summary:", err);
        setErrorMsg(
          "Could not sync with the OMOP data node. Please try again."
        );
        setLoading(false);
      });
  }, []);

  useEffect(() => {
    fetchCohortSummary();
  }, [fetchCohortSummary]);

  if (loading) {
    return (
      <div className="space-y-8 w-full">
        <div className="grid gap-6 md:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <Surface
              key={i}
              className="p-6 rounded-[24px] border border-slate-100 bg-white flex items-center gap-4 animate-pulse"
            >
              <div className="w-14 h-14 rounded-2xl bg-slate-100 shrink-0" />
              <div className="space-y-2 w-full">
                <div className="h-3 w-20 bg-slate-100 rounded" />
                <div className="h-6 w-28 bg-slate-200 rounded" />
              </div>
            </Surface>
          ))}
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          {[1, 2].map((i) => (
            <Surface
              key={i}
              className="p-8 rounded-[24px] border border-slate-100 bg-white animate-pulse"
            >
              <div className="h-4 w-48 bg-slate-200 rounded mb-6" />
              <div className="h-64 bg-slate-50 rounded-xl" />
            </Surface>
          ))}
        </div>
      </div>
    );
  }

  if (errorMsg || !cohortData) {
    return (
      <div className="p-16 flex flex-col items-center justify-center text-center bg-slate-50/50 rounded-3xl border border-slate-200/60 max-w-2xl mx-auto my-8">
        <div className="w-12 h-12 rounded-2xl bg-indigo-50/60 text-[#4f46e5] flex items-center justify-center mb-4">
          <AlertCircle className="w-6 h-6" />
        </div>
        <h4 className="text-sm font-bold text-slate-800">
          Metrics Synchronization Halted
        </h4>
        <p className="text-xs text-slate-500 max-w-md mt-1 mb-6 leading-relaxed">
          {errorMsg ||
            "The background database query returned incomplete structural summaries."}
        </p>
        <button
          onClick={fetchCohortSummary}
          className="inline-flex items-center gap-2 px-4 py-2 text-xs font-bold text-slate-700 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 shadow-xs cursor-pointer transition-colors"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          Retry Pipeline Fetch
        </button>
      </div>
    );
  }

  const totalPatients = cohortData.total_patients || 0;
  const ageDistribution = cohortData.by_age || [];
  const sexDistribution = cohortData.by_sex || [];

  const chartData = ageDistribution.map((item: any) => ({
    name: item.age_group,
    patients: item.patients,
  }));

  const nivoPieData = sexDistribution.map((item: any, index: number) => ({
    id: item.gender,
    label: item.gender,
    value: item.patients,
    color: colors[index % colors.length],
  }));

  return (
    <div className="space-y-8 w-full animate-in fade-in duration-500">
      <div className="grid gap-6 md:grid-cols-3">
        <Surface className="group p-6 rounded-[24px] border border-slate-100 shadow-sm bg-white flex items-center gap-4 hover:border-[#4f46e5]/30 transition-colors">
          <div className="p-3.5 rounded-2xl bg-indigo-50/60 text-[#4f46e5] group-hover:bg-[#4f46e5] group-hover:text-white transition-all duration-300">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Total Patients
            </p>
            <h4 className="text-2xl font-black text-slate-900 tracking-tight">
              {totalPatients.toLocaleString()}
            </h4>
          </div>
        </Surface>

        <Surface className="group p-6 rounded-[24px] border border-slate-100 shadow-sm bg-white flex items-center gap-4 hover:border-[#8b5cf6]/30 transition-colors">
          <div className="p-3.5 rounded-2xl bg-indigo-50/60 text-[#4f46e5] group-hover:bg-[#4f46e5] group-hover:text-white transition-all duration-300">
            <Activity className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Conditions Mapped
            </p>
            <h4 className="text-2xl font-black text-slate-900 tracking-tight">
              {totalPatients.toLocaleString()}
            </h4>
          </div>
        </Surface>

        <Surface className="group p-6 rounded-[24px] border border-slate-100 shadow-sm bg-white flex items-center gap-4 hover:border-[#ec4899]/30 transition-colors">
          <div className="p-3.5 rounded-2xl bg-indigo-50/60 text-[#4f46e5] group-hover:bg-[#4f46e5] group-hover:text-white transition-all duration-300">
            <Stethoscope className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Measurements Mapped
            </p>
            <h4 className="text-2xl font-black text-slate-900 tracking-tight">
              {totalPatients.toLocaleString()}
            </h4>
          </div>
        </Surface>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Surface className="p-8 shadow-sm rounded-[24px] border border-slate-100/60 bg-white">
          <h3 className="text-lg font-semibold tracking-tight text-slate-900 mb-6">
            Patient Distribution by Age Group
          </h3>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={chartData}
                margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
              >
                <defs>
                  <linearGradient id="barGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.9} />
                    <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0.75} />
                  </linearGradient>
                </defs>
                <CartesianGrid
                  strokeDasharray="3 3"
                  vertical={false}
                  stroke="#f1f5f9"
                />
                <XAxis
                  dataKey="name"
                  tickLine={false}
                  axisLine={false}
                  fontSize={11}
                  fill="#64748b"
                />
                <YAxis
                  tickLine={false}
                  axisLine={false}
                  fontSize={11}
                  fill="#64748b"
                />
                <Tooltip
                  cursor={{ fill: "#f8fafc", radius: 8 }}
                  contentStyle={{
                    borderRadius: "16px",
                    border: "none",
                    boxShadow: "0 10px 15px -3px rgba(0,0,0,0.1)",
                  }}
                />
                <Bar
                  dataKey="patients"
                  fill="url(#barGrad)"
                  radius={[6, 6, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Surface>

        <Surface className="p-8 shadow-sm rounded-[24px] border border-slate-100/60 bg-white flex flex-col justify-between">
          <h3 className="text-lg font-semibold tracking-tight text-slate-900 mb-2">
            Patient Distribution by Sex
          </h3>
          <div className="h-72 w-full relative">
            <ResponsivePie
              data={nivoPieData}
              innerRadius={0.7}
              padAngle={2}
              cornerRadius={5}
              colors={colors}
              margin={{ top: 20, right: 40, bottom: 80, left: 40 }}
              enableArcLabels={false}
              enableArcLinkLabels={false}
              arcLinkLabelsSkipAngle={10}
              arcLinkLabelsTextColor="#333333"
              theme={{
                tooltip: {
                  container: {
                    fontSize: "12px",
                    borderRadius: "12px",
                    boxShadow: "0 10px 15px -3px rgb(0 0 0 / 0.1)",
                  },
                },
              }}
              legends={[
                {
                  anchor: "bottom",
                  direction: "row",
                  justify: false,
                  translateX: 0,
                  translateY: 60,
                  itemsSpacing: 15,
                  itemWidth: 80,
                  itemHeight: 18,
                  itemTextColor: "#64748b",
                  itemDirection: "left-to-right",
                  itemOpacity: 1,
                  symbolSize: 14,
                  symbolShape: "circle",
                  effects: [
                    {
                      on: "hover",
                      style: {
                        itemTextColor: "#0f172a",
                      },
                    },
                  ],
                },
              ]}
            />
          </div>
        </Surface>
      </div>
    </div>
  );
}
