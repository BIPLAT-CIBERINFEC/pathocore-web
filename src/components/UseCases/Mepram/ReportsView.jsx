"use client";

import React, { useState, useEffect } from "react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";

const reportsApiBaseUrl =
  process.env.NEXT_PUBLIC_MEPRAM_API_BASE_URL || "/api/omop/v1";

export default function ReportsView() {
  const [reportsData, setReportsData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const [tablePages, setTablePages] = useState({});

  useEffect(() => {
    const fetchReports = async () => {
      try {
        const response = await fetch(
          `${reportsApiBaseUrl}/cohort/report`
        );
        if (!response.ok) {
          throw new Error(`HTTP Error: ${response.status}`);
        }
        const data = await response.json();
        setReportsData(Array.isArray(data) ? data : [data]);
      } catch (err) {
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchReports();
  }, []);

  if (isLoading) {
    return (
      <div className="p-10 text-center text-slate-500 font-medium">
        Loading cohort reports...
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-10 text-center text-rose-600 font-medium">
        Connection error: {error}
      </div>
    );
  }

  if (!reportsData || reportsData.length === 0) {
    return (
      <div className="p-10 text-center text-slate-500 font-medium">
        No reports available.
      </div>
    );
  }

  const parseChartData = (tableData) => {
    if (!tableData?.rows || tableData.rows.length === 0) return [];

    let valueColIndex = 1;
    for (let i = 1; i < tableData.columns.length; i++) {
      if (!isNaN(parseFloat(tableData.rows[0][i]))) {
        valueColIndex = i;
        break;
      }
    }

    return tableData.rows.map((row) => ({
      name: String(row[0] || "Unnamed"),
      value: parseFloat(row[valueColIndex]) || 0,
    }));
  };

  const scrollToElement = (id) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  const changePage = (tableId, newPage) => {
    setTablePages((prev) => ({
      ...prev,
      [tableId]: newPage,
    }));
  };

  return (
    <div className="max-w-[90rem] mx-auto p-4 sm:p-8 font-sans text-slate-800 bg-white">
      {reportsData.map((activeReport, reportIndex) => {
        const { payload } = activeReport || {};

        if (!payload?.report || !payload?.sections || !payload?.data_tables) {
          return null;
        }

        const { report, sections, data_tables } = payload;

        // ESTRUCTURA DE AGRUPACIÓN HASTA NIVEL 2
        const groupedData = [];

        sections.forEach((sec) => {
          const fullTitle = sec.title ? sec.title.trim() : "Other Data";
          const parts = fullTitle.split("-").map((p) => p.trim());

          const mainTitle = parts[0] || "General";
          const remainder = parts.slice(1).join(" - ").trim();

          let subGroupTitle = "";
          let variantTitle = "";

          if (!remainder) {
            subGroupTitle = mainTitle;
            variantTitle = "";
          } else {
            const remainderParts = remainder.split("-").map((p) => p.trim());
            subGroupTitle = remainderParts[0];
            variantTitle = remainderParts.slice(1).join(" - ").trim();
          }

          // Nivel 1: Sección Principal
          let mainGroup = groupedData.find((g) => g.mainTitle === mainTitle);
          if (!mainGroup) {
            mainGroup = { mainTitle, subGroups: [] };
            groupedData.push(mainGroup);
          }

          // Nivel 2: Subgrupo
          let subGroup = mainGroup.subGroups.find(
            (sg) => sg.subGroupTitle === subGroupTitle
          );
          if (!subGroup) {
            subGroup = { subGroupTitle, items: [] };
            mainGroup.subGroups.push(subGroup);
          }

          // Variantes almacenadas solo para renderizar tabs/contenido
          subGroup.items.push({
            variantTitle: variantTitle || subGroupTitle,
            sec,
          });
        });

        return (
          <div key={reportIndex} className="animate-in fade-in duration-500">
            <div className="border-b-2 border-slate-900 pb-6 mb-8">
              <h1 className="text-3xl md:text-4xl font-extrabold text-slate-900 mb-2">
                {report.title}
              </h1>
              {report.subtitle && (
                <p className="text-lg md:text-xl text-slate-600 font-medium mb-4">
                  {report.subtitle}
                </p>
              )}
              <div className="flex flex-wrap gap-4 text-sm text-slate-500 mb-6">
                {report.author && <span>Author: {report.author}</span>}
                {report.date && <span>Date: {report.date}</span>}
              </div>
              {report.summary && (
                <div className="bg-slate-50 border border-slate-200 p-5 rounded-md text-slate-700 leading-relaxed text-sm">
                  {report.summary}
                </div>
              )}
            </div>

            <div className="flex flex-col lg:flex-row gap-10 items-start">
              {/* SIDEBAR - HASTA NIVEL 2 ÚNICAMENTE */}
              {groupedData.length > 0 && (
                <aside className="w-full lg:w-72 shrink-0 lg:sticky lg:top-8 max-h-[calc(100vh-4rem)] overflow-y-auto bg-slate-50 border border-slate-200 p-5 rounded-lg shadow-sm">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-500 block mb-4 border-b border-slate-200 pb-2">
                    Table of Contents
                  </span>
                  <nav>
                    <ul className="space-y-4 text-sm">
                      {groupedData.map((mainGroup, mIdx) => (
                        <li key={mIdx} className="space-y-2">
                          {/* NIVEL 1: Sección Principal */}
                          <button
                            onClick={() =>
                              scrollToElement(
                                `main-section-${reportIndex}-${mIdx}`
                              )
                            }
                            className="text-left w-full font-bold text-slate-900 hover:text-indigo-600 transition-colors block"
                          >
                            {mIdx + 1}. {mainGroup.mainTitle}
                          </button>

                          {/* NIVEL 2: Subgrupos */}
                          <ul className="pl-3 border-l-2 border-slate-200 space-y-1.5 text-xs">
                            {mainGroup.subGroups.map((subGroup, sgIdx) => (
                              <li key={sgIdx}>
                                <button
                                  onClick={() =>
                                    scrollToElement(
                                      `sub-group-${reportIndex}-${mIdx}-${sgIdx}`
                                    )
                                  }
                                  className="text-left w-full text-slate-600 hover:text-indigo-600 font-medium transition-colors block py-0.5"
                                >
                                  {subGroup.subGroupTitle}
                                </button>
                              </li>
                            ))}
                          </ul>
                        </li>
                      ))}
                    </ul>
                  </nav>
                </aside>
              )}

              {/* CONTENIDO PRINCIPAL */}
              <div className="flex-1 space-y-16 min-w-0 w-full pb-20">
                {groupedData.map((mainGroup, mIdx) => (
                  <div
                    key={mIdx}
                    id={`main-section-${reportIndex}-${mIdx}`}
                    className="space-y-10 scroll-mt-8"
                  >
                    <div className="border-b-2 border-slate-300 pb-3">
                      <h2 className="text-2xl md:text-3xl font-bold text-slate-900">
                        {mainGroup.mainTitle}
                      </h2>
                    </div>

                    <div className="space-y-12">
                      {mainGroup.subGroups.map((subGroup, sgIdx) => (
                        <div
                          key={sgIdx}
                          id={`sub-group-${reportIndex}-${mIdx}-${sgIdx}`}
                          className="space-y-6 scroll-mt-24"
                        >
                          <div className="bg-slate-100/80 p-3 rounded-md border-l-4 border-indigo-600 flex flex-wrap items-center justify-between gap-3">
                            <h3 className="text-lg font-bold text-slate-800">
                              {subGroup.subGroupTitle}
                            </h3>

                            {/* Pestañas rápidas */}
                            {subGroup.items.length > 1 && (
                              <div className="flex flex-wrap gap-1.5">
                                {subGroup.items.map((item, itemIdx) => (
                                  <button
                                    key={itemIdx}
                                    onClick={() =>
                                      scrollToElement(
                                        `item-section-${reportIndex}-${mIdx}-${sgIdx}-${itemIdx}`
                                      )
                                    }
                                    className="px-2.5 py-1 bg-white border border-slate-200 hover:border-indigo-400 text-slate-600 hover:text-indigo-700 text-xs font-medium rounded shadow-sm transition-all"
                                  >
                                    {item.variantTitle}
                                  </button>
                                ))}
                              </div>
                            )}
                          </div>

                          <div className="space-y-8 pl-0 md:pl-2">
                            {subGroup.items.map((item, itemIdx) => {
                              const subSection = item.sec;

                              return (
                                <div
                                  key={itemIdx}
                                  id={`item-section-${reportIndex}-${mIdx}-${sgIdx}-${itemIdx}`}
                                  className="space-y-6 scroll-mt-24"
                                >
                                  {subSection.tables.map((tableId) => {
                                    const tableData = data_tables[tableId];
                                    if (!tableData) return null;

                                    const rawChartData =
                                      parseChartData(tableData);

                                    const isAgeRelated =
                                      subSection.title
                                        ?.toLowerCase()
                                        .includes("age") ||
                                      subSection.title
                                        ?.toLowerCase()
                                        .includes("edad") ||
                                      tableData.columns.some(
                                        (col) =>
                                          col.toLowerCase().includes("age") ||
                                          col.toLowerCase().includes("edad")
                                      );

                                    const sortedChartData = [
                                      ...rawChartData,
                                    ].sort((a, b) => {
                                      if (isAgeRelated) {
                                        return String(a.name).localeCompare(
                                          String(b.name),
                                          undefined,
                                          { numeric: true }
                                        );
                                      }
                                      return b.value - a.value;
                                    });

                                    const isLimited =
                                      sortedChartData.length > 20;
                                    const displayChartData = isLimited
                                      ? sortedChartData.slice(0, 20)
                                      : sortedChartData;

                                    const pageSize = 10;
                                    const currentPage =
                                      tablePages[tableId] || 1;
                                    const totalRows =
                                      tableData.rows?.length || 0;
                                    const totalPages = Math.ceil(
                                      totalRows / pageSize
                                    );
                                    const startIndex =
                                      (currentPage - 1) * pageSize;
                                    const currentRows = tableData.rows.slice(
                                      startIndex,
                                      startIndex + pageSize
                                    );

                                    return (
                                      <div
                                        key={tableId}
                                        className="bg-white rounded-lg border border-slate-200 shadow-sm p-5 md:p-6"
                                      >
                                        <h4 className="text-base font-semibold text-slate-800 mb-5">
                                          {subSection.title}
                                        </h4>

                                        <div className="flex flex-col gap-8">
                                          {displayChartData.length > 0 && (
                                            <div className="w-full flex flex-col bg-slate-50/50 p-4 border border-slate-100 rounded-md">
                                              <div className="h-[380px] w-full">
                                                <ResponsiveContainer
                                                  width="100%"
                                                  height="100%"
                                                >
                                                  <BarChart
                                                    data={displayChartData}
                                                    margin={{
                                                      top: 10,
                                                      right: 20,
                                                      left: 10,
                                                      bottom: 110,
                                                    }}
                                                  >
                                                    <CartesianGrid
                                                      strokeDasharray="3 3"
                                                      vertical={false}
                                                      stroke="#e2e8f0"
                                                    />
                                                    <XAxis
                                                      dataKey="name"
                                                      height={60}
                                                      tick={{
                                                        fill: "#64748b",
                                                        fontSize: 10,
                                                      }}
                                                      angle={-45}
                                                      textAnchor="end"
                                                      interval={0}
                                                      tickFormatter={(val) =>
                                                        val.length > 24
                                                          ? `${val.substring(
                                                              0,
                                                              24
                                                            )}...`
                                                          : val
                                                      }
                                                    />
                                                    <YAxis
                                                      tick={{
                                                        fill: "#64748b",
                                                        fontSize: 12,
                                                      }}
                                                    />
                                                    <Tooltip
                                                      contentStyle={{
                                                        backgroundColor:
                                                          "#ffffff",
                                                        borderRadius: "6px",
                                                        border:
                                                          "1px solid #e2e8f0",
                                                        fontSize: "12px",
                                                      }}
                                                    />
                                                    <Bar
                                                      dataKey="value"
                                                      fill="#4f46e5"
                                                      radius={[2, 2, 0, 0]}
                                                    />
                                                  </BarChart>
                                                </ResponsiveContainer>
                                              </div>
                                              {isLimited && (
                                                <p className="text-xs text-slate-500 italic mt-2 text-center">
                                                  * Only the top 20 values are
                                                  shown in this chart.
                                                </p>
                                              )}
                                            </div>
                                          )}

                                          <div className="overflow-x-auto w-full border border-slate-200 rounded-md bg-white">
                                            <table className="min-w-full text-sm text-left">
                                              <thead className="text-xs text-slate-600 uppercase bg-slate-50 border-b border-slate-200">
                                                <tr>
                                                  {tableData.columns.map(
                                                    (col, i) => (
                                                      <th
                                                        key={i}
                                                        className="px-4 py-3 font-semibold whitespace-nowrap"
                                                      >
                                                        {col}
                                                      </th>
                                                    )
                                                  )}
                                                </tr>
                                              </thead>
                                              <tbody className="divide-y divide-slate-100 bg-white">
                                                {currentRows.map(
                                                  (row, rowIndex) => (
                                                    <tr
                                                      key={rowIndex}
                                                      className="hover:bg-slate-50 transition-colors"
                                                    >
                                                      {row.map(
                                                        (cell, cellIndex) => (
                                                          <td
                                                            key={cellIndex}
                                                            className={`px-4 py-2.5 ${
                                                              cellIndex === 0
                                                                ? "font-medium text-slate-700"
                                                                : "text-slate-600"
                                                            }`}
                                                          >
                                                            {cell}
                                                          </td>
                                                        )
                                                      )}
                                                    </tr>
                                                  )
                                                )}
                                              </tbody>
                                            </table>

                                            <div className="flex flex-col sm:flex-row items-center justify-between px-4 py-3 bg-slate-50 border-t border-slate-200 text-xs text-slate-600 gap-2">
                                              <span>
                                                Showing {startIndex + 1} -{" "}
                                                {Math.min(
                                                  startIndex + pageSize,
                                                  totalRows
                                                )}{" "}
                                                of{" "}
                                                <span className="font-semibold text-slate-700">
                                                  {totalRows}
                                                </span>{" "}
                                                records
                                              </span>
                                              {totalPages > 1 && (
                                                <div className="flex items-center gap-2">
                                                  <button
                                                    onClick={() =>
                                                      changePage(
                                                        tableId,
                                                        Math.max(
                                                          currentPage - 1,
                                                          1
                                                        )
                                                      )
                                                    }
                                                    disabled={currentPage === 1}
                                                    className="px-3 py-1 bg-white border border-slate-300 rounded hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed font-medium transition-colors"
                                                  >
                                                    Previous
                                                  </button>
                                                  <span className="font-medium px-1">
                                                    Page {currentPage} of{" "}
                                                    {totalPages}
                                                  </span>
                                                  <button
                                                    onClick={() =>
                                                      changePage(
                                                        tableId,
                                                        Math.min(
                                                          currentPage + 1,
                                                          totalPages
                                                        )
                                                      )
                                                    }
                                                    disabled={
                                                      currentPage === totalPages
                                                    }
                                                    className="px-3 py-1 bg-white border border-slate-300 rounded hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed font-medium transition-colors"
                                                  >
                                                    Next
                                                  </button>
                                                </div>
                                              )}
                                            </div>
                                          </div>
                                        </div>
                                      </div>
                                    );
                                  })}
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
