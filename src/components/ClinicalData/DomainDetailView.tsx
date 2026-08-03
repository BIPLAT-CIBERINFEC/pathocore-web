"use client";

import React, { useEffect, useState, Fragment, useCallback } from "react";
import { Surface } from "@/components/mepram/MepramPrimitives";
import {
  Search,
  Database,
  AlertCircle,
  ChevronDown,
  ChevronUp,
  BarChart2,
  Loader2,
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

interface DomainDetailViewProps {
  domainId: string;
}

export default function DomainDetailView({ domainId }: DomainDetailViewProps) {
  const [concepts, setConcepts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  const [expandedRow, setExpandedRow] = useState<number | null>(null);
  const [conceptDetails, setConceptDetails] = useState<Record<number, any>>({});
  const [loadingDetails, setLoadingDetails] = useState<Record<number, boolean>>(
    {}
  );

  const loadDomainConcepts = useCallback(() => {
    setLoading(true);
    setErrorMsg(null);

    const apiBase =
      process.env.NEXT_PUBLIC_MEPRAM_API_BASE_URL || "/api/omop/v1";
    const url = `${apiBase}/domains/${domainId}/concepts`;

    fetch(url, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    })
      .then((res) => {
        if (!res.ok)
          throw new Error(`Server returned status code: ${res.status}`);
        return res.json();
      })
      .then((data) => {
        const dataArray = Array.isArray(data) ? data : data?.data || [];
        setConcepts(dataArray);
        setLoading(false);
      })
      .catch((err) => {
        console.error(`Error requesting concepts for ${domainId}:`, err);
        setErrorMsg(
          err.message ||
            "Failed to establish synchronization with the primary repository node."
        );
        setLoading(false);
      });
  }, [domainId]);

  useEffect(() => {
    loadDomainConcepts();
  }, [loadDomainConcepts]);

  const filteredConcepts = concepts.filter((item) => {
    const query = searchQuery.toLowerCase();
    const nameMatch = item.concept_name?.toLowerCase().includes(query);
    const codeMatch = item.concept_code?.toLowerCase().includes(query);
    return nameMatch || codeMatch;
  });

  const top10Concepts = [...concepts]
    .sort((a, b) => {
      const valA = a.participants ?? 0;
      const valB = b.participants ?? 0;
      return valB - valA;
    })
    .slice(0, 10)
    .map((item) => ({
      name: item.concept_name,
      participants: item.participants ?? 0,
    }));

  const toggleRow = async (id: number) => {
    if (expandedRow === id) {
      setExpandedRow(null);
      return;
    }

    setExpandedRow(id);
    if (conceptDetails[id]) return;

    setLoadingDetails((prev) => ({ ...prev, [id]: true }));

    try {
      const apiBase =
        process.env.NEXT_PUBLIC_MEPRAM_API_BASE_URL || "/api/omop/v1";

      const res = await fetch(`${apiBase}/concepts/${id}/detail`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!res.ok)
        throw new Error("No se pudo obtener el detalle del concepto");

      const detailData = await res.json();
      setConceptDetails((prev) => ({ ...prev, [id]: detailData }));
    } catch (err) {
      console.error(`Error fetching detail for concept ${id}:`, err);
    } finally {
      setLoadingDetails((prev) => ({ ...prev, [id]: false }));
    }
  };

  if (loading) {
    return (
      <div className="space-y-6 w-full animate-pulse">
        <Surface className="p-6 bg-white border border-slate-100 rounded-2xl shadow-sm">
          <div className="h-4 w-64 bg-slate-200 rounded mb-6" />
          <div className="h-64 bg-slate-50 rounded-xl" />
        </Surface>

        <div className="h-14 bg-slate-100 rounded-2xl w-full" />

        <Surface className="border border-slate-100 bg-white rounded-2xl overflow-hidden">
          <div className="h-10 bg-slate-50 w-full border-b border-slate-100" />
          {[1, 2, 3, 4, 5].map((i) => (
            <div
              key={i}
              className="p-4 flex items-center justify-between border-b border-slate-50"
            >
              <div className="h-3 w-1/3 bg-slate-100 rounded" />
              <div className="h-3 w-16 bg-slate-100 rounded" />
              <div className="h-3 w-12 bg-slate-200 rounded" />
              <div className="h-3 w-14 bg-slate-100 rounded" />
            </div>
          ))}
        </Surface>
      </div>
    );
  }

  if (errorMsg) {
    return (
      <div className="p-16 flex flex-col items-center justify-center text-center bg-slate-50/50 rounded-3xl border border-slate-200/60 max-w-2xl mx-auto my-8">
        <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-500 flex items-center justify-center mb-4">
          <AlertCircle className="w-6 h-6" />
        </div>
        <h4 className="text-sm font-bold text-slate-800">
          Domain Query Engine Stopped
        </h4>
        <p className="text-xs text-slate-500 max-w-md mt-1 mb-6 leading-relaxed">
          {errorMsg}
        </p>
        <button
          onClick={loadDomainConcepts}
          className="inline-flex items-center gap-2 px-4 py-2 text-xs font-bold text-slate-700 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 shadow-xs cursor-pointer transition-colors"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          Retry Domain Stream
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6 w-full animate-in fade-in duration-500">
      {concepts.length > 0 && (
        <Surface className="p-6 bg-white border border-slate-200 rounded-2xl shadow-sm">
          <h2 className="text-lg font-bold text-slate-800 mb-6 flex items-center gap-2">
            <BarChart2 className="w-5 h-5 text-[#2563eb]" />
            Top 10 {domainId} by Descending Participant Counts
          </h2>
          <div className="h-[350px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                layout="vertical"
                data={top10Concepts}
                margin={{ top: 5, right: 30, left: 200, bottom: 5 }}
              >
                <CartesianGrid
                  strokeDasharray="3 3"
                  horizontal={false}
                  stroke="#e2e8f0"
                />
                <XAxis type="number" hide />
                <YAxis
                  dataKey="name"
                  type="category"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: "#64748b", fontSize: 11 }}
                  width={200}
                />
                <Tooltip
                  cursor={{ fill: "#f8fafc" }}
                  contentStyle={{
                    borderRadius: "8px",
                    border: "none",
                    boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
                  }}
                />
                <Bar
                  dataKey="participants"
                  fill="#4D45E1"
                  radius={[0, 4, 4, 0]}
                  barSize={20}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Surface>
      )}

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-50/60 p-4 rounded-2xl border border-slate-100">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-3.5 h-4 w-4 text-slate-400 pointer-events-none" />
          <input
            type="text"
            placeholder={`Search within ${domainId} entries...`}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-11 pr-4 py-3 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-[#2563eb] focus:ring-1 focus:ring-[#2563eb] transition-all shadow-xs"
          />
        </div>
        <div className="flex items-center gap-2 text-xs font-bold text-slate-500 uppercase tracking-wide bg-white px-4 py-3 rounded-xl border border-slate-200 shadow-xs">
          <Database className="h-4 w-4 text-slate-400" />
          Matching entries:{" "}
          <span className="text-slate-900">{filteredConcepts.length}</span>
        </div>
      </div>

      {filteredConcepts.length === 0 ? (
        <div className="p-16 text-center bg-slate-50/40 rounded-2xl border border-dashed border-slate-200">
          <p className="text-sm text-slate-500 font-medium">
            No concepts found matching criteria.
          </p>
        </div>
      ) : (
        <Surface className="overflow-hidden border border-slate-100 shadow-sm rounded-2xl bg-white">
          <div className="overflow-x-auto w-full">
            <table className="w-full border-collapse text-left">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-100 text-[11px] font-bold uppercase tracking-wider text-slate-500">
                  <th className="p-4 pl-6">Concept Name</th>
                  <th className="p-4">Concept Code</th>
                  <th className="p-4">Vocabulary ID</th>
                  <th className="p-4">Participants</th>
                  <th className="p-4 pr-6">% Cohort</th>
                </tr>
              </thead>
              <tbody className="text-xs font-medium text-slate-600 divide-y divide-slate-50">
                {filteredConcepts.map((row: any) => {
                  const participantCount = row.participants ?? 0;
                  const percentage = row.pct ?? 0;
                  const rowId = row.concept_id;
                  const isExpanded = expandedRow === rowId;

                  const detail = conceptDetails[rowId];
                  const isLoadingThisDetail = loadingDetails[rowId];

                  return (
                    <Fragment key={rowId}>
                      <tr
                        onClick={() => toggleRow(rowId)}
                        className={`hover:bg-slate-50/40 transition-colors cursor-pointer ${
                          isExpanded ? "bg-slate-50/60" : ""
                        }`}
                      >
                        <td className="p-4 pl-6 font-semibold text-[#2563eb] max-w-sm break-words flex items-center gap-2">
                          {isExpanded ? (
                            <ChevronUp className="w-4 h-4 text-slate-400 shrink-0" />
                          ) : (
                            <ChevronDown className="w-4 h-4 text-slate-400 shrink-0" />
                          )}
                          {row.concept_name}
                        </td>
                        <td className="p-4 font-mono text-slate-500">
                          {row.concept_code}
                        </td>
                        <td className="p-4">
                          <span className="px-2 py-0.5 bg-slate-100 text-slate-600 rounded text-[10px] font-bold uppercase tracking-wide border border-slate-200/50">
                            {row.vocabulary_id}
                          </span>
                        </td>
                        <td className="p-4 font-bold text-slate-700">
                          {participantCount.toLocaleString()}
                        </td>
                        <td className="p-4 pr-6 font-mono text-slate-700 font-semibold">
                          {percentage.toFixed(2)}%
                        </td>
                      </tr>

                      {isExpanded && (
                        <tr>
                          <td
                            colSpan={5}
                            className="p-0 border-b border-slate-200"
                          >
                            <div className="p-6 bg-slate-50 border-t border-slate-200 animate-in slide-in-from-top-2 duration-200">
                              {isLoadingThisDetail ? (
                                <div className="flex flex-col items-center justify-center p-12 text-slate-400">
                                  <Loader2 className="w-8 h-8 animate-spin mb-4 text-[#2563eb]" />
                                  <p>
                                    Fetching demographics and measurements...
                                  </p>
                                </div>
                              ) : detail ? (
                                <div className="space-y-6">
                                  <div className="flex flex-wrap gap-4 text-xs">
                                    <div className="bg-white px-3 py-2 rounded-lg border border-slate-200 shadow-sm">
                                      <span className="text-slate-400 font-bold uppercase mr-2">
                                        Concept ID:
                                      </span>
                                      <span className="font-mono text-slate-700">
                                        {row.concept_id}
                                      </span>
                                    </div>
                                    <div className="bg-white px-3 py-2 rounded-lg border border-slate-200 shadow-sm">
                                      <span className="text-slate-400 font-bold uppercase mr-2">
                                        Total Patients (Concept):
                                      </span>
                                      <span className="font-bold text-slate-700">
                                        {detail.summary?.[0]?.patient_count?.toLocaleString()}
                                      </span>
                                    </div>
                                  </div>

                                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                    <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                                      <h4 className="text-sm font-bold text-slate-700 mb-4 text-center">
                                        Age Distribution
                                      </h4>
                                      <div className="h-48 w-full">
                                        <ResponsiveContainer
                                          width="100%"
                                          height="100%"
                                        >
                                          <BarChart
                                            data={detail.by_age || []}
                                            margin={{
                                              top: 10,
                                              right: 10,
                                              left: -20,
                                              bottom: 0,
                                            }}
                                          >
                                            <CartesianGrid
                                              strokeDasharray="3 3"
                                              vertical={false}
                                              stroke="#f1f5f9"
                                            />
                                            <XAxis
                                              dataKey="age_group"
                                              tickLine={false}
                                              axisLine={false}
                                              fontSize={10}
                                              fill="#64748b"
                                            />
                                            <YAxis
                                              tickLine={false}
                                              axisLine={false}
                                              fontSize={10}
                                              fill="#64748b"
                                            />
                                            <Tooltip
                                              cursor={{ fill: "#f8fafc" }}
                                            />
                                            <Bar
                                              dataKey="patient_count"
                                              fill="#8b5cf6"
                                              radius={[4, 4, 0, 0]}
                                              name="Patients"
                                            />
                                          </BarChart>
                                        </ResponsiveContainer>
                                      </div>
                                    </div>

                                    <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                                      <h4 className="text-sm font-bold text-slate-700 mb-4 text-center">
                                        Sex Distribution
                                      </h4>
                                      <div className="h-48 w-full">
                                        <ResponsiveContainer
                                          width="100%"
                                          height="100%"
                                        >
                                          <BarChart
                                            data={detail.by_sex || []}
                                            margin={{
                                              top: 10,
                                              right: 10,
                                              left: -20,
                                              bottom: 0,
                                            }}
                                          >
                                            <CartesianGrid
                                              strokeDasharray="3 3"
                                              vertical={false}
                                              stroke="#f1f5f9"
                                            />
                                            <XAxis
                                              dataKey="gender"
                                              tickLine={false}
                                              axisLine={false}
                                              fontSize={10}
                                              fill="#64748b"
                                            />
                                            <YAxis
                                              tickLine={false}
                                              axisLine={false}
                                              fontSize={10}
                                              fill="#64748b"
                                            />
                                            <Tooltip
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
                                  </div>
                                </div>
                              ) : (
                                <div className="p-8 text-center text-slate-500">
                                  No detailed data available for this concept.
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
      )}
    </div>
  );
}
