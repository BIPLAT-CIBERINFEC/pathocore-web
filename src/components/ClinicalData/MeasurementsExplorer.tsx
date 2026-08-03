"use client";

import React, { useCallback, useEffect, useState, Fragment } from "react";
import { Surface } from "@/components/mepram/MepramPrimitives";
import {
  Activity,
  Beaker,
  ChevronDown,
  ChevronUp,
  Loader2,
  BarChart2,
  AlertCircle,
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
} from "recharts";

interface MeasurementsExplorerProps {
  activeSection: string;
  setActiveSection: (section: string) => void;
}

type MeasurementTableType = "numeric" | "categorical";

const MEPRAM_API_BASE_URL = process.env.NEXT_PUBLIC_MEPRAM_API_BASE_URL || "/api/omop/v1";

const measurementEndpointByType: Record<MeasurementTableType, string> = {
  numeric: "/measurements/numeric",
  categorical: "/measurements/categorical",
};

function buildApiUrl(path: string, query?: Record<string, string | number>) {
  const url = new URL(`${MEPRAM_API_BASE_URL}${path}`, window.location.origin);
  Object.entries(query ?? {}).forEach(([key, value]) => {
    url.searchParams.set(key, String(value));
  });
  return url.toString();
}

function getRows(payload: any) {
  if (Array.isArray(payload)) return payload;
  if (Array.isArray(payload?.data)) return payload.data;
  if (Array.isArray(payload?.results)) return payload.results;
  return [];
}

function formatMetric(value: unknown, digits = 2) {
  return typeof value === "number" && Number.isFinite(value)
    ? value.toFixed(digits)
    : "-";
}

function normalizeDistributionRows(
  rows: any[],
  labelKey: "age_group" | "gender"
) {
  return rows
    .map((row) => ({
      ...row,
      patient_count:
        row.patient_count ??
        row.n_patients ??
        row.record_count ??
        row.n_records ??
        0,
      [labelKey]: row[labelKey] ?? "Unknown",
    }))
    .filter((row) => row.patient_count > 0);
}

export default function MeasurementsExplorer({
  activeSection,
  setActiveSection,
}: MeasurementsExplorerProps) {
  const [numericData, setNumericData] = useState<any[]>([]);
  const [categoricalData, setCategoricalData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const [expandedRow, setExpandedRow] = useState<string | null>(null);
  const [conceptDetails, setConceptDetails] = useState<Record<string, any>>({});
  const [loadingDetails, setLoadingDetails] = useState<Record<string, boolean>>(
    {}
  );

  const loadMeasurements = useCallback(() => {
    const controller = new AbortController();

    const headers = {
      "Content-Type": "application/json",
      Accept: "application/json",
    };

    Promise.resolve().then(() => {
      if (controller.signal.aborted) return;

      setLoading(true);
      setErrorMsg(null);

      Promise.all([
        fetch(
          buildApiUrl("/measurements/numeric", {
            stratification: "none",
            limit: 100,
          }),
          {
            headers,
            signal: controller.signal,
          }
        ).then((res) => {
          if (!res.ok) throw new Error(`Numeric fetch failed: ${res.status}`);
          return res.json();
        }),
        fetch(
          buildApiUrl("/measurements/categorical", {
            stratification: "none",
            limit: 100,
          }),
          {
            headers,
            signal: controller.signal,
          }
        ).then((res) => {
          if (!res.ok)
            throw new Error(`Categorical fetch failed: ${res.status}`);
          return res.json();
        }),
      ])
        .then(([numeric, categorical]) => {
          setNumericData(getRows(numeric));
          setCategoricalData(getRows(categorical));
          setLoading(false);
        })
        .catch((err) => {
          if (err.name !== "AbortError") {
            console.error("DEBUG FETCH ERROR:", err);
            setErrorMsg(`Error: ${err.message}. Verifica la consola (F12).`);
            setLoading(false);
          }
        });
    });

    return () => controller.abort();
  }, []);

  useEffect(() => {
    return loadMeasurements();
  }, [loadMeasurements]);

  const handleToggleRow = async (
    tableType: MeasurementTableType,
    index: number,
    conceptId: number
  ) => {
    const rowKey = `${tableType}-${index}`;
    const detailKey = `${tableType}-${conceptId}`;
    if (expandedRow === rowKey) {
      setExpandedRow(null);
      return;
    }
    setExpandedRow(rowKey);
    if (conceptDetails[detailKey]) return;

    setLoadingDetails((prev) => ({ ...prev, [detailKey]: true }));

    try {
      const headers = {
        "Content-Type": "application/json",
        Accept: "application/json",
      };

      const [detailRes, ageRes, sexRes] = await Promise.all([
        fetch(buildApiUrl(`/concepts/${conceptId}/detail`), { headers }),
        fetch(
          buildApiUrl(measurementEndpointByType[tableType], {
            concept_id: conceptId,
            stratification: "age",
            limit: 100,
          }),
          { headers }
        ),
        fetch(
          buildApiUrl(measurementEndpointByType[tableType], {
            concept_id: conceptId,
            stratification: "sex",
            limit: 100,
          }),
          { headers }
        ),
      ]);

      if (!detailRes.ok || !ageRes.ok || !sexRes.ok) {
        throw new Error("No se pudo obtener el detalle del concepto");
      }

      const [detailData, ageData, sexData] = await Promise.all([
        detailRes.json(),
        ageRes.json(),
        sexRes.json(),
      ]);

      setConceptDetails((prev) => ({
        ...prev,
        [detailKey]: {
          ...detailData,
          age_distribution: normalizeDistributionRows(
            getRows(ageData),
            "age_group"
          ),
          gender_distribution: normalizeDistributionRows(
            getRows(sexData),
            "gender"
          ),
        },
      }));
    } catch (error) {
      console.error(`Error loading details for concept ${conceptId}:`, error);
    } finally {
      setLoadingDetails((prev) => ({ ...prev, [detailKey]: false }));
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 space-y-4">
        <Loader2 className="h-8 w-8 text-[#2563eb] animate-spin" />
        <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
          Querying laboratory streams...
        </p>
      </div>
    );
  }

  if (errorMsg) {
    return (
      <div className="flex items-center gap-3 p-5 bg-rose-50/50 border border-rose-100 rounded-[22px] text-rose-700 max-w-2xl mx-auto my-8">
        <AlertCircle className="h-5 w-5 shrink-0" />
        <div className="text-xs font-medium">{errorMsg}</div>
      </div>
    );
  }

  return (
    <div className="space-y-10 animate-in fade-in duration-400">
      <div className="space-y-4">
        <div className="flex items-center gap-2 px-1">
          <Activity className="h-5 w-5 text-blue-600" />
          <h3 className="text-base font-bold text-slate-800 tracking-tight">
            Numeric Measurements Summary
          </h3>
        </div>

        <Surface className="border border-slate-100 overflow-hidden rounded-[24px] bg-white shadow-[0_8px_30px_rgb(0,0,0,0.01)]">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/70 border-b border-slate-100 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  <th className="p-4 pl-6 w-10"></th>
                  <th className="p-4">Concept Name</th>
                  <th className="p-4">Event Type</th>
                  <th className="p-4">Average Value</th>
                  <th className="p-4">Unit</th>
                  <th className="p-4 pr-6">Total Records</th>
                </tr>
              </thead>
              <tbody className="text-xs font-medium text-slate-600 divide-y divide-slate-100">
                {numericData.slice(0, 15).map((row: any, idx: number) => {
                  const conceptId = row.concept_id || 0;
                  const detailKey = `numeric-${conceptId}`;
                  const isRowExpanded = expandedRow === `numeric-${idx}`;
                  const isDetailLoading = loadingDetails[detailKey];
                  const details = conceptDetails[detailKey];

                  return (
                    <Fragment key={`numeric-${idx}`}>
                      <tr
                        onClick={() =>
                          handleToggleRow("numeric", idx, conceptId)
                        }
                        className={`hover:bg-slate-50/50 transition-colors cursor-pointer ${
                          isRowExpanded ? "bg-blue-50/20" : ""
                        }`}
                      >
                        <td className="p-4 pl-6 text-slate-400">
                          {isRowExpanded ? (
                            <ChevronUp className="h-4 w-4 text-blue-600" />
                          ) : (
                            <ChevronDown className="h-4 w-4" />
                          )}
                        </td>
                        <td className="p-4 font-semibold text-slate-900">
                          {row.concept_name}
                        </td>
                        <td className="p-4 font-bold text-slate-400">
                          {row.event_type || "All"}
                        </td>
                        <td className="p-4 font-mono font-bold text-slate-700">
                          {formatMetric(row.mean_value)}
                        </td>
                        <td className="p-4 text-slate-400 font-medium">
                          {row.unit_name || "No Unit"}
                        </td>
                        <td className="p-4 pr-6 font-mono text-slate-500">
                          {row.n_records?.toLocaleString?.() ??
                            row.n_records ??
                            "-"}
                        </td>
                      </tr>

                      {isRowExpanded && (
                        <tr className="bg-slate-50/30">
                          <td colSpan={6} className="p-0">
                            <div className="border-t border-b border-slate-100/70 p-6 animate-in slide-in-from-top-2 duration-200">
                              {isDetailLoading ? (
                                <div className="flex items-center justify-center py-8 gap-2">
                                  <Loader2 className="h-4 w-4 animate-spin text-blue-600" />
                                  <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                                    Loading age/sex matrices...
                                  </span>
                                </div>
                              ) : details ? (
                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                  <div className="bg-white border border-slate-100 p-4 rounded-2xl shadow-xs">
                                    <div className="flex items-center gap-1.5 mb-3 px-1">
                                      <BarChart2 className="w-4 h-4 text-blue-500" />
                                      <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                                        Age Cohort Distribution
                                      </h4>
                                    </div>
                                    <div className="h-48 w-full">
                                      <ResponsiveContainer
                                        width="100%"
                                        height="100%"
                                      >
                                        <BarChart
                                          data={details.age_distribution || []}
                                        >
                                          <CartesianGrid
                                            strokeDasharray="3 3"
                                            stroke="#f1f5f9"
                                            vertical={false}
                                          />
                                          <XAxis
                                            dataKey="age_group"
                                            stroke="#94a3b8"
                                            fontSize={10}
                                            tickLine={false}
                                          />
                                          <YAxis
                                            stroke="#94a3b8"
                                            fontSize={10}
                                            tickLine={false}
                                            axisLine={false}
                                          />
                                          <RechartsTooltip
                                            cursor={{ fill: "#f8fafc" }}
                                          />
                                          <Bar
                                            dataKey="patient_count"
                                            fill="#4D45E1"
                                            radius={[4, 4, 0, 0]}
                                            name="Patients"
                                          />
                                        </BarChart>
                                      </ResponsiveContainer>
                                    </div>
                                  </div>
                                  <div className="bg-white border border-slate-100 p-4 rounded-2xl shadow-xs">
                                    <div className="flex items-center gap-1.5 mb-3 px-1">
                                      <BarChart2 className="w-4 h-4 text-indigo-500" />
                                      <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                                        Gender Breakdown Stratum
                                      </h4>
                                    </div>
                                    <div className="h-48 w-full">
                                      <ResponsiveContainer
                                        width="100%"
                                        height="100%"
                                      >
                                        <BarChart
                                          data={
                                            details.gender_distribution || []
                                          }
                                        >
                                          <CartesianGrid
                                            strokeDasharray="3 3"
                                            stroke="#f1f5f9"
                                            vertical={false}
                                          />
                                          <XAxis
                                            dataKey="gender"
                                            stroke="#94a3b8"
                                            fontSize={10}
                                            tickLine={false}
                                          />
                                          <YAxis
                                            stroke="#94a3b8"
                                            fontSize={10}
                                            tickLine={false}
                                            axisLine={false}
                                          />
                                          <RechartsTooltip
                                            cursor={{ fill: "#f8fafc" }}
                                          />
                                          <Bar
                                            dataKey="patient_count"
                                            fill="#6366f1"
                                            radius={[4, 4, 0, 0]}
                                            name="Patients"
                                          />
                                        </BarChart>
                                      </ResponsiveContainer>
                                    </div>
                                  </div>
                                </div>
                              ) : (
                                <div className="p-4 text-center text-xs text-slate-400 font-medium">
                                  No detailed demographics available.
                                </div>
                              )}
                            </div>
                          </td>
                        </tr>
                      )}
                    </Fragment>
                  );
                })}
              </tbody>
            </table>
          </div>
        </Surface>
      </div>

      <div className="space-y-4">
        <div className="flex items-center gap-2 px-1">
          <Beaker className="h-5 w-5 text-indigo-600" />
          <h3 className="text-base font-bold text-slate-800 tracking-tight">
            Categorical Measurements Summary
          </h3>
        </div>

        <Surface className="border border-slate-100 overflow-hidden rounded-[24px] bg-white shadow-[0_8px_30px_rgb(0,0,0,0.01)]">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/70 border-b border-slate-100 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  <th className="p-4 pl-6 w-10"></th>
                  <th className="p-4">Concept Name</th>
                  <th className="p-4">Event Type</th>
                  <th className="p-4">Value Found</th>
                  <th className="p-4">Record Count</th>
                  <th className="p-4 pr-6">% Cohort</th>
                </tr>
              </thead>
              <tbody className="text-xs font-medium text-slate-600 divide-y divide-slate-100">
                {categoricalData.slice(0, 15).map((row: any, idx: number) => {
                  const conceptId = row.concept_id || 0;
                  const detailKey = `categorical-${conceptId}`;
                  const isRowExpanded = expandedRow === `categorical-${idx}`;
                  const isDetailLoading = loadingDetails[detailKey];
                  const details = conceptDetails[detailKey];

                  return (
                    <Fragment key={`categorical-${idx}`}>
                      <tr
                        onClick={() =>
                          handleToggleRow("categorical", idx, conceptId)
                        }
                        className={`hover:bg-slate-50/50 transition-colors cursor-pointer ${
                          isRowExpanded ? "bg-indigo-50/20" : ""
                        }`}
                      >
                        <td className="p-4 pl-6 text-slate-400">
                          {isRowExpanded ? (
                            <ChevronUp className="h-4 w-4 text-indigo-600" />
                          ) : (
                            <ChevronDown className="h-4 w-4" />
                          )}
                        </td>
                        <td className="p-4 font-semibold text-slate-900">
                          {row.concept_name}
                        </td>
                        <td className="p-4 font-bold text-slate-500">
                          {row.event_type || "All"}
                        </td>
                        <td className="p-4">
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wide ${
                              row.value_concept_name === "Resistant" ||
                              row.value_concept_name === "Positive"
                                ? "bg-rose-50 text-rose-600"
                                : "bg-indigo-50 text-indigo-600"
                            }`}
                          >
                            {row.value_concept_name || "Unknown"}
                          </span>
                        </td>
                        <td className="p-4 font-mono">{row.record_count}</td>
                        <td className="p-4 pr-6 font-mono text-indigo-600">
                          {formatMetric(row.patient_pct)}%
                        </td>
                      </tr>

                      {isRowExpanded && (
                        <tr className="bg-slate-50/30">
                          <td colSpan={6} className="p-0">
                            <div className="border-t border-b border-slate-100/70 p-6 animate-in slide-in-from-top-2 duration-200">
                              {isDetailLoading ? (
                                <div className="flex items-center justify-center py-8 gap-2">
                                  <Loader2 className="h-4 w-4 animate-spin text-indigo-600" />
                                  <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                                    Loading demographic distribution...
                                  </span>
                                </div>
                              ) : details ? (
                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                  <div className="bg-white border border-slate-100 p-4 rounded-2xl shadow-xs">
                                    <div className="flex items-center gap-1.5 mb-3 px-1">
                                      <BarChart2 className="w-4 h-4 text-blue-500" />
                                      <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                                        Age Cohort Distribution
                                      </h4>
                                    </div>
                                    <div className="h-48 w-full">
                                      <ResponsiveContainer
                                        width="100%"
                                        height="100%"
                                      >
                                        <BarChart
                                          data={details.age_distribution || []}
                                        >
                                          <CartesianGrid
                                            strokeDasharray="3 3"
                                            stroke="#f1f5f9"
                                            vertical={false}
                                          />
                                          <XAxis
                                            dataKey="age_group"
                                            stroke="#94a3b8"
                                            fontSize={10}
                                            tickLine={false}
                                          />
                                          <YAxis
                                            stroke="#94a3b8"
                                            fontSize={10}
                                            tickLine={false}
                                            axisLine={false}
                                          />
                                          <RechartsTooltip
                                            cursor={{ fill: "#f8fafc" }}
                                          />
                                          <Bar
                                            dataKey="patient_count"
                                            fill="#4D45E1"
                                            radius={[4, 4, 0, 0]}
                                            name="Patients"
                                          />
                                        </BarChart>
                                      </ResponsiveContainer>
                                    </div>
                                  </div>
                                  <div className="bg-white border border-slate-100 p-4 rounded-2xl shadow-xs">
                                    <div className="flex items-center gap-1.5 mb-3 px-1">
                                      <BarChart2 className="w-4 h-4 text-indigo-500" />
                                      <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                                        Gender Breakdown Stratum
                                      </h4>
                                    </div>
                                    <div className="h-48 w-full">
                                      <ResponsiveContainer
                                        width="100%"
                                        height="100%"
                                      >
                                        <BarChart
                                          data={
                                            details.gender_distribution || []
                                          }
                                        >
                                          <CartesianGrid
                                            strokeDasharray="3 3"
                                            stroke="#f1f5f9"
                                            vertical={false}
                                          />
                                          <XAxis
                                            dataKey="gender"
                                            stroke="#94a3b8"
                                            fontSize={10}
                                            tickLine={false}
                                          />
                                          <YAxis
                                            stroke="#94a3b8"
                                            fontSize={10}
                                            tickLine={false}
                                            axisLine={false}
                                          />
                                          <RechartsTooltip
                                            cursor={{ fill: "#f8fafc" }}
                                          />
                                          <Bar
                                            dataKey="patient_count"
                                            fill="#6366f1"
                                            radius={[4, 4, 0, 0]}
                                            name="Patients"
                                          />
                                        </BarChart>
                                      </ResponsiveContainer>
                                    </div>
                                  </div>
                                </div>
                              ) : (
                                <div className="p-4 text-center text-xs text-slate-400 font-medium">
                                  No detailed demographics available.
                                </div>
                              )}
                            </div>
                          </td>
                        </tr>
                      )}
                    </Fragment>
                  );
                })}
              </tbody>
            </table>
          </div>
        </Surface>
      </div>
    </div>
  );
}
