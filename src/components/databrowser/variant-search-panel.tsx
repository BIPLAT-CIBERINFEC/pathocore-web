import { useState } from "react";
import { Search } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { formatInteger } from "@/lib/format";
import type { VariantReferenceOption, VariantSearchRow } from "@/types/databrowser";

interface VariantSearchPanelProps {
  referenceOptions: VariantReferenceOption[];
  rows: VariantSearchRow[];
}

function matchesQuery(row: VariantSearchRow, query: string) {
  if (!query) {
    return true;
  }

  return [
    row.variantName,
    row.variantDesignation,
    row.sampleUniqueId,
    row.sequencingSampleId,
    row.vcfFilename,
    row.consensusSequenceName,
  ]
    .join(" ")
    .toLowerCase()
    .includes(query);
}

export function VariantSearchPanel({ referenceOptions, rows }: VariantSearchPanelProps) {
  const [selectedReference, setSelectedReference] = useState("");
  const [query, setQuery] = useState("");
  const normalizedQuery = query.trim().toLowerCase();
  const rowsForReference = rows.filter(
    (row) => row.referenceGenome === selectedReference,
  );
  const filteredRows = rowsForReference.filter((row) =>
    matchesQuery(row, normalizedQuery),
  );
  const suggestions = Array.from(
    new Set(
      rowsForReference
        .flatMap((row) => [row.variantName, row.variantDesignation])
        .filter((value) => value && value !== "Not exposed"),
    ),
  ).sort((left, right) => left.localeCompare(right, "es"));

  return (
    <Card className="border-white/70 bg-white/88">
      <CardContent className="p-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <p className="section-kicker">Variant Search</p>
            <h2 className="mt-2 text-3xl font-semibold text-slate-950">
              Reference-driven variant lookup
            </h2>
            <p className="mt-3 max-w-4xl text-sm leading-7 text-slate-500">
              Select a reference genome, then filter sample-level variant metadata.
              Gene, population frequency and per-variant impact require a backend
              per-variant or aggregated endpoint; the table keeps those cells explicit.
            </p>
          </div>
          <Badge variant="secondary">{rows.length} variant-enabled samples</Badge>
        </div>

        <div className="mt-6 grid gap-4 lg:grid-cols-[minmax(260px,0.75fr)_minmax(0,1.25fr)]">
          <label className="grid gap-2 text-sm font-medium text-slate-700">
            Reference genome
            <select
              className="h-11 rounded-2xl border border-slate-200 bg-white px-4 text-sm text-slate-900 shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              onChange={(event) => {
                setSelectedReference(event.target.value);
                setQuery("");
              }}
              value={selectedReference}
            >
              <option value="">Select a reference genome</option>
              {referenceOptions.map((option) => (
                <option key={option.referenceGenome} value={option.referenceGenome}>
                  {option.label} | {formatInteger(option.variantCount)} variants
                </option>
              ))}
            </select>
          </label>

          {selectedReference ? (
            <label className="grid gap-2 text-sm font-medium text-slate-700">
              Variant search
              <div className="relative">
                <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <Input
                  className="pl-11"
                  list="variant-search-suggestions"
                  onChange={(event) => setQuery(event.target.value)}
                  placeholder="Search variant name, designation, sample id or VCF filename"
                  value={query}
                />
                <datalist id="variant-search-suggestions">
                  {suggestions.map((suggestion) => (
                    <option key={suggestion} value={suggestion} />
                  ))}
                </datalist>
              </div>
            </label>
          ) : (
            <div className="rounded-[1.35rem] border border-dashed border-slate-200 bg-slate-50 p-4 text-sm leading-6 text-slate-500">
              Choose a reference genome to enable variant search and table results.
            </div>
          )}
        </div>

        {selectedReference ? (
          <div className="mt-6">
            <div className="mb-3 flex flex-wrap items-center gap-2">
              <Badge variant="strong">{filteredRows.length} matching samples</Badge>
              <Badge variant="outline">population frequency pending API</Badge>
              <Badge variant="outline">gene pending per-variant table</Badge>
            </div>
            {filteredRows.length > 0 ? (
              <div className="overflow-x-auto rounded-[1.35rem] border border-slate-200 bg-white">
                <table className="min-w-[980px] w-full text-left text-sm">
                  <thead className="bg-slate-50 text-xs uppercase tracking-[0.18em] text-slate-400">
                    <tr>
                      <th className="px-4 py-3 font-semibold">Sample</th>
                      <th className="px-4 py-3 font-semibold">Variant</th>
                      <th className="px-4 py-3 font-semibold">Gene</th>
                      <th className="px-4 py-3 font-semibold">Population frequency</th>
                      <th className="px-4 py-3 font-semibold">Effect</th>
                      <th className="px-4 py-3 font-semibold">Counts</th>
                      <th className="px-4 py-3 font-semibold">VCF</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredRows.map((row) => (
                      <tr key={`${row.sampleUniqueId}-${row.vcfFilename}`}>
                        <td className="px-4 py-4 align-top">
                          <p className="font-semibold text-slate-950">
                            {row.sampleUniqueId}
                          </p>
                          <p className="mt-1 text-xs text-slate-500">
                            {row.sequencingSampleId}
                          </p>
                          <p className="mt-1 text-xs text-slate-400">{row.projectName}</p>
                        </td>
                        <td className="px-4 py-4 align-top">
                          <p className="font-medium text-slate-900">{row.variantName}</p>
                          <p className="mt-1 text-xs leading-5 text-slate-500">
                            {row.variantDesignation}
                          </p>
                          <p className="mt-1 text-xs text-slate-400">
                            {row.consensusSequenceName}
                          </p>
                        </td>
                        <td className="px-4 py-4 align-top">
                          <Badge variant="outline">{row.gene}</Badge>
                        </td>
                        <td className="px-4 py-4 align-top">
                          <Badge variant="outline">{row.populationFrequency}</Badge>
                        </td>
                        <td className="px-4 py-4 align-top">
                          <Badge variant={row.hasEffect === "Yes" ? "strong" : "secondary"}>
                            {row.hasEffect}
                          </Badge>
                          <p className="mt-2 text-xs leading-5 text-slate-500">
                            {row.effectSummary}
                          </p>
                        </td>
                        <td className="px-4 py-4 align-top text-sm text-slate-600">
                          <p>
                            Consensus:{" "}
                            <span className="font-semibold text-slate-950">
                              {row.variantCount === null
                                ? "N/A"
                                : formatInteger(row.variantCount)}
                            </span>
                          </p>
                          <p className="mt-1">
                            With effect:{" "}
                            <span className="font-semibold text-slate-950">
                              {row.variantsWithEffect === null
                                ? "N/A"
                                : formatInteger(row.variantsWithEffect)}
                            </span>
                          </p>
                          <p className="mt-1 text-xs text-slate-400">
                            {row.variantCallingSoftware}
                          </p>
                        </td>
                        <td className="max-w-[18rem] px-4 py-4 align-top">
                          <p className="break-words font-mono text-xs leading-5 text-slate-500">
                            {row.vcfFilename}
                          </p>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="rounded-[1.35rem] border border-dashed border-slate-200 bg-slate-50 p-6 text-sm leading-6 text-slate-500">
                No samples match this reference and variant search term.
              </div>
            )}
          </div>
        ) : null}
      </CardContent>
    </Card>
  );
}
