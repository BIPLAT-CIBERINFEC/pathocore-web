"use client";

import { type FormEvent, useEffect, useState } from "react";
import { Surface } from "@/components/mepram/MepramPrimitives";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  BarChart,
  Bar,
} from "recharts";
import { ResponsivePie } from "@nivo/pie";
import {
  Search,
  Activity,
  Database,
  Dna,
  Table as TableIcon,
  FlaskConical,
  FolderGit2,
  FileCode2,
  Tag,
  SlidersHorizontal,
  Loader2,
  Terminal,
} from "lucide-react";

interface VariantFilterOptions {
  sequencingPlatforms: string[];
  collectionDateMin: string | null;
  collectionDateMax: string | null;
  effects: string[];
}

interface VariantReferenceGenomeOption {
  referenceGenome: string;
  variantObservationCount: number;
}

interface VariantExplorerProps {
  filterOptions?: VariantFilterOptions;
  referenceGenomeOptions?: VariantReferenceGenomeOption[];
}

interface ParsedHgvsVariant {
  alternateAllele: string;
  position: number;
  referenceAllele: string;
  type: string;
  variant: string;
}

type SearchStatus = "error" | "idle" | "loading" | "success";

function inferVariantType(referenceAllele: string, alternateAllele: string) {
  if (referenceAllele.length === 1 && alternateAllele.length === 1)
    return "SNV";
  if (referenceAllele.length === alternateAllele.length) return "MNV";
  if (referenceAllele.length < alternateAllele.length)
    return "Insertion / complex";
  return "Deletion / complex";
}

function parseHgvsVariant(input: string): ParsedHgvsVariant | null {
  const normalized = input.trim().replace(/\s+/g, "");
  const match = /^g\.(\d+)([A-Za-z]+)>([A-Za-z]+)$/.exec(normalized);

  if (!match) return null;

  const [, rawPosition, rawReferenceAllele, rawAlternateAllele] = match;
  const position = Number(rawPosition);

  if (!Number.isInteger(position) || position <= 0) return null;

  const referenceAllele = rawReferenceAllele.toUpperCase();
  const alternateAllele = rawAlternateAllele.toUpperCase();

  return {
    alternateAllele,
    position,
    referenceAllele,
    type: inferVariantType(referenceAllele, alternateAllele),
    variant: `g.${position}${referenceAllele}>${alternateAllele}`,
  };
}

function formatNullableNumber(value: number | null) {
  return value === null ? "N/A" : value.toLocaleString();
}

function formatNullableText(value: string | null) {
  return value?.trim() ? value : "N/A";
}

function formatAlleleFrequency(value: number | null) {
  if (value === null) return "N/A";
  return value <= 1 ? `${(value * 100).toFixed(2)}%` : value.toFixed(3);
}

function optionalTextFilter(value: string) {
  const trimmed = value.trim();
  return trimmed || null;
}

export default function VariantExplorer({
  filterOptions = {
    sequencingPlatforms: ["Illumina", "Nanopore", "IonTorrent"],
    collectionDateMin: "2020-01-01",
    collectionDateMax: "2026-12-31",
    effects: [
      "missense_variant",
      "synonymous_variant",
      "frameshift_variant",
      "stop_gained",
      "stop_lost",
      "inframe_insertion",
      "inframe_deletion",
      "upstream_gene_variant",
      "downstream_gene_variant",
    ],
  },
  referenceGenomeOptions = [
    { referenceGenome: "NC_045512.2", variantObservationCount: 1420 },
    { referenceGenome: "MN908947.3", variantObservationCount: 890 },
  ],
}: VariantExplorerProps) {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const [query, setQuery] = useState("");
  const [collectionDateFrom, setCollectionDateFrom] = useState("");
  const [collectionDateTo, setCollectionDateTo] = useState("");
  const [effect, setEffect] = useState("");
  const [aminoacidChange, setAminoacidChange] = useState("");
  const [locusId, setLocusId] = useState("");
  const [locusName, setLocusName] = useState("");
  const [referenceGenome, setReferenceGenome] = useState("");
  const [sampleId, setSampleId] = useState("");
  const [sequencingPlatform, setSequencingPlatform] = useState("");

  const [searchError, setSearchError] = useState<string | null>(null);
  const [searchResult, setSearchResult] = useState<any>(null);
  const [searchStatus, setSearchStatus] = useState<SearchStatus>("idle");
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);

  const parsedVariant = parseHgvsVariant(query);
  const hasQuery = query.trim().length > 0;
  const canSearch = Boolean(parsedVariant) && searchStatus !== "loading";
  const isEmptyResult =
    searchStatus === "success" &&
    (!searchResult || searchResult.results?.length === 0);

  const sampleCount = isEmptyResult
    ? 0
    : searchResult?.summary?.sample_count ?? null;
  const globalAlleleFrequency = isEmptyResult
    ? 0
    : searchResult?.summary?.global_allele_frequency ?? null;

  const colors = [
    "#4f46e5",
    "#8b5cf6",
    "#ec4899",
    "#4D45E1",
    "#6366f1",
    "#a78bfa",
  ];
  const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || "/api/pathocore/v1";

  useEffect(() => {
   
    if (!baseUrl) return;

    fetch(`${baseUrl}/variants/summary`)
      .then((res) => res.json())
      .then((json) => {
        setData(json);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error loading variants summary:", err);
        setLoading(false);
      });
  }, [baseUrl]); 
  function resetSearchState() {
    setSearchError(null);
    setSearchResult(null);
    setSearchStatus("idle");
  }

 const handleSearchSubmit = async (event: FormEvent<HTMLFormElement>) => {
   event.preventDefault();

   if (!parsedVariant) {
     resetSearchState();
     return;
   }

   setSearchError(null);
   setSearchResult(null);
   setSearchStatus("loading");

   try {
     const params = new URLSearchParams({
       variant: parsedVariant.variant,
       page_size: "100",
     });

     if (collectionDateFrom)
       params.append("collection_date_from", collectionDateFrom);
     if (collectionDateTo)
       params.append("collection_date_to", collectionDateTo);
     if (effect) params.append("effect", effect);
     if (optionalTextFilter(aminoacidChange))
       params.append("aminoacid_change", aminoacidChange.trim());
     if (optionalTextFilter(locusId)) params.append("locus_id", locusId.trim());
     if (optionalTextFilter(locusName))
       params.append("locus_name", locusName.trim());
     if (referenceGenome) params.append("reference_genome", referenceGenome);
     if (optionalTextFilter(sampleId))
       params.append("sample_id", sampleId.trim());
     if (sequencingPlatform)
       params.append("sequencing_platform", sequencingPlatform);

     const apiBase =
       process.env.NEXT_PUBLIC_API_BASE_URL || "/api/pathocore/v1";

     const res = await fetch(`${apiBase}/variants/search?${params.toString()}`);

     if (!res.ok) {
       throw new Error("Variant not found or no results match your criteria.");
     }

     const json = await res.json();

     setSearchResult(json);
     setSearchStatus("success");
   } catch (err: any) {
     setSearchResult(null);
     setSearchError(
       err.message || "Variant not found or no results match your criteria."
     );
     setSearchStatus("error");
   }
 };

  if (loading) {
    return (
      <div className="p-20 text-center text-slate-400 animate-pulse font-bold tracking-widest text-[10px] uppercase">
        Loading variant analysis...
      </div>
    );
  }

  if (!data) return null;

  const nivoPieData =
    data.reference_genomes?.map((item: any, index: number) => ({
      id: item.label,
      label: item.label,
      value: item.value,
      color: colors[index % colors.length],
    })) || [];

  const kpiItems = [
    {
      label: "Samples Analyzed",
      value: data.totals?.visible_sample_count?.toLocaleString() || "0",
      note: "Total visible sample subset",
      icon: <FlaskConical className="w-5 h-5" />,
      hoverBorder: "hover:border-[#4f46e5]/30",
      iconBg: "bg-indigo-50/60 text-[#4f46e5] group-hover:bg-[#4f46e5]",
    },
    {
      label: "Samples w/ Variants",
      value: data.totals?.samples_with_variants?.toLocaleString() || "0",
      note: "Samples containing mutational data",
      icon: <FolderGit2 className="w-5 h-5" />,
      hoverBorder: "hover:border-[#8b5cf6]/30",
      iconBg: "bg-indigo-50/60 text-[#4f46e5] group-hover:bg-[#4f46e5]",
    },
    {
      label: "Distinct Variants",
      value: data.totals?.distinct_variants?.toLocaleString() || "0",
      note: "Unique mutation variants mapped",
      icon: <FileCode2 className="w-5 h-5" />,
      hoverBorder: "hover:border-[#ec4899]/30",
      iconBg: "bg-indigo-50/60 text-[#4f46e5] group-hover:bg-[#4f46e5]",
    },
    {
      label: "Variant Observations",
      value: data.totals?.variant_observations?.toLocaleString() || "0",
      note: "Total indexed variant occurrences",
      icon: <Tag className="w-5 h-5" />,
      hoverBorder: "hover:border-slate-300",
      iconBg: "bg-indigo-50/60 text-[#4f46e5] group-hover:bg-[#4f46e5]",
    },
  ];

  return (
    <div className="space-y-10 animate-in fade-in duration-700">
      <Surface className="p-8 border border-slate-100/80 bg-slate-50/30 rounded-[24px]">
        <div className="flex items-center gap-2 mb-3">
          <span className="px-3 py-1 bg-[#0f172a] text-white rounded-full text-[10px] font-bold uppercase tracking-wider">
            Current section: Variant Explorer
          </span>
        </div>
        <p className="text-sm text-slate-500 max-w-4xl leading-relaxed">
          HGVS genomic variant search, with aggregated summary, optional and
          advanced filters connected to PathoCore analytical endpoints.
        </p>
      </Surface>

      <div className="grid gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-4">
        {kpiItems.map((stat, i) => (
          <Surface
            key={i}
            className={`p-6 border border-slate-100 shadow-sm flex items-center justify-between group transition-colors ${stat.hoverBorder}`}
          >
            <div className="space-y-1">
              <p className="text-xs font-semibold text-slate-400 tracking-tight">
                {stat.label}
              </p>
              <p className="text-4xl font-bold text-slate-900 tracking-tight font-mono">
                {stat.value}
              </p>
              <p className="text-[11px] text-slate-400 pt-1">{stat.note}</p>
            </div>
            <div
              className={`p-3.5 rounded-2xl group-hover:text-white transition-all duration-300 ${stat.iconBg}`}
            >
              {stat.icon}
            </div>
          </Surface>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Surface className="p-8 shadow-sm rounded-[24px] border border-slate-100/60 bg-white flex flex-col justify-between min-h-[380px]">
          <div>
            <div className="flex items-center gap-2.5 mb-6">
              <div className="p-2 bg-[#4f46e5]/10 rounded-xl text-[#4f46e5]">
                <Database className="w-4 h-4" />
              </div>
              <h3 className="text-lg font-semibold tracking-tight text-slate-900">
                Reference genomes
              </h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-5 gap-6 items-center">
              <div className="h-[220px] md:col-span-2 w-full relative">
                <ResponsivePie
                  data={nivoPieData}
                  innerRadius={0.72}
                  padAngle={2}
                  cornerRadius={5}
                  activeOuterRadiusOffset={5}
                  colors={colors}
                  enableArcLabels={false}
                  enableArcLinkLabels={false}
                  theme={{
                    tooltip: {
                      container: {
                        fontSize: "12px",
                        borderRadius: "12px",
                        boxShadow: "0 10px 15px -3px rgb(0 0 0 / 0.1)",
                      },
                    },
                  }}
                />
              </div>

              <div className="md:col-span-3 space-y-2 max-h-[240px] overflow-y-auto pr-2 no-scrollbar">
                {nivoPieData.map((item: any, i: any) => (
                  <div
                    key={i}
                    className="flex justify-between items-center text-[11px] border-b border-slate-50 pb-2 gap-4"
                    title={item.label}
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <span
                        className="w-2.5 h-2.5 rounded-full shrink-0"
                        style={{ backgroundColor: item.color }}
                      />
                      <span className="font-mono text-slate-600 font-bold truncate">
                        {item.label}
                      </span>
                    </div>
                    <span className="font-bold text-slate-900 shrink-0">
                      {item.value.toLocaleString()}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </Surface>

        <Surface className="p-8 shadow-sm rounded-[24px] border border-slate-100/60 bg-white min-h-[380px] flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2.5 mb-6">
              <div className="p-2 bg-[#8b5cf6]/10 rounded-xl text-[#8b5cf6]">
                <Activity className="w-4 h-4" />
              </div>
              <h3 className="text-lg font-semibold tracking-tight text-slate-900">
                Variant counts
              </h3>
            </div>
            <div className="h-56">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart
                  data={data.variant_counts}
                  margin={{ bottom: 10, left: -10, right: 10 }}
                >
                  <defs>
                    <linearGradient id="lineGrad" x1="0" y1="0" x2="1" y2="0">
                      <stop offset="0%" stopColor="#4f46e5" />
                      <stop offset="100%" stopColor="#8b5cf6" />
                    </linearGradient>
                  </defs>
                  <CartesianGrid
                    vertical={false}
                    strokeDasharray="3 3"
                    stroke="#f1f5f9"
                  />
                  <XAxis
                    dataKey="label"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fontSize: 11, fill: "#94a3b8", fontWeight: 500 }}
                    dy={10}
                  />
                  <YAxis
                    axisLine={false}
                    tickLine={false}
                    tick={{ fontSize: 11, fill: "#94a3b8", fontWeight: 500 }}
                  />
                  <Tooltip
                    contentStyle={{
                      borderRadius: "16px",
                      border: "none",
                      boxShadow: "0 10px 15px -3px rgba(0,0,0,0.1)",
                    }}
                  />
                  <Line
                    type="monotone"
                    dataKey="value"
                    stroke="url(#lineGrad)"
                    strokeWidth={3.5}
                    dot={{ r: 4, fill: "#4f46e5", strokeWidth: 0 }}
                    activeDot={{ r: 6, fill: "#8b5cf6" }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </Surface>
      </div>

      <Surface className="p-8 shadow-sm border border-slate-100 rounded-[24px] bg-white">
        <form onSubmit={handleSearchSubmit} className="space-y-6">
          <div className="flex flex-col gap-2 md:flex-row md:items-start md:justify-between border-b border-slate-100 pb-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="w-2 h-2 rounded-full bg-[#4f46e5] animate-pulse" />
                <p className="text-[10px] font-bold text-[#4f46e5] uppercase tracking-[0.15em]">
                  Genomic Variant Search
                </p>
              </div>
              <h3 className="text-2xl font-semibold tracking-tight text-slate-900">
                HGVS genomic lookup
              </h3>
              <p className="text-xs text-slate-400 mt-1 max-w-2xl leading-relaxed">
                Expected format:{" "}
                <span className="font-mono text-slate-600 bg-slate-50 px-1 py-0.5 rounded border border-slate-100">
                  g.112534G&gt;C
                </span>
                . The parser extracts metrics before querying the real endpoint.
              </p>
            </div>
            <span className="px-3 py-1 text-[10px] bg-slate-50 border border-slate-200/60 rounded-full font-bold font-mono text-slate-500 shadow-sm shrink-0 self-start md:self-auto mt-2 md:mt-0">
              {searchStatus === "success"
                ? `${searchResult?.count ?? 0} matching rows`
                : "real variant API"}
            </span>
          </div>

          <div className="grid gap-4 md:grid-cols-[1fr_auto] items-end">
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                <Search className="w-3.5 h-3.5 text-slate-400" /> Variant HGVS
                Notation
              </label>
              <div className="relative group">
                <Terminal className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-[#4f46e5] transition-colors" />
                <input
                  type="text"
                  value={query}
                  onChange={(e) => {
                    setQuery(e.target.value);
                    resetSearchState();
                  }}
                  placeholder="g.112534G>C"
                  className="w-full pl-12 pr-4 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-mono outline-none focus:bg-white focus:ring-4 focus:ring-[#4f46e5]/5 focus:border-[#4f46e5] transition-all"
                />
              </div>
            </div>
            <button
              type="submit"
              disabled={!canSearch}
              className="w-full md:w-auto px-8 py-3.5 bg-slate-900 text-white rounded-2xl text-sm font-bold hover:bg-[#4f46e5] shadow-md hover:shadow-indigo-100 transition-all disabled:opacity-40 flex items-center justify-center gap-2 min-w-[160px]"
            >
              {searchStatus === "loading" ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Search className="w-4 h-4" />
              )}
              Search variant
            </button>
          </div>

          <div className="rounded-[20px] border border-slate-100 bg-slate-50/40 p-5 space-y-4">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between border-b border-slate-100 pb-3">
              <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                  Optional filters
                </p>
                <p className="text-xs text-slate-400">
                  Reference genome and dynamically mapped platforms.
                </p>
              </div>
              <span className="px-2.5 py-1 bg-white border border-slate-100 rounded-lg text-[10px] font-mono text-slate-500 font-semibold shadow-2xs">
                {referenceGenomeOptions.length} references ·{" "}
                {filterOptions.sequencingPlatforms.length} platforms
              </span>
            </div>

            <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-500">
                  Reference genome
                </label>
                <select
                  value={referenceGenome}
                  onChange={(e) => {
                    setReferenceGenome(e.target.value);
                    resetSearchState();
                  }}
                  className="w-full h-11 bg-white border border-slate-200/80 rounded-xl px-3.5 text-xs font-medium text-slate-700 outline-none focus:border-[#4f46e5] focus:ring-2 focus:ring-[#4f46e5]/5 transition-all shadow-2xs"
                >
                  <option value="">All references</option>
                  {referenceGenomeOptions.map((option) => (
                    <option
                      key={option.referenceGenome}
                      value={option.referenceGenome}
                    >
                      {option.referenceGenome} · (
                      {option.variantObservationCount.toLocaleString()})
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-500">
                  Collection date from
                </label>
                <input
                  type="date"
                  value={collectionDateFrom}
                  max={
                    collectionDateTo ||
                    filterOptions.collectionDateMax ||
                    undefined
                  }
                  min={filterOptions.collectionDateMin || undefined}
                  onChange={(e) => {
                    setCollectionDateFrom(e.target.value);
                    resetSearchState();
                  }}
                  className="w-full h-11 bg-white border border-slate-200/80 rounded-xl px-3.5 text-xs font-medium text-slate-700 outline-none focus:border-[#4f46e5] transition-all shadow-2xs"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-500">
                  Collection date to
                </label>
                <input
                  type="date"
                  value={collectionDateTo}
                  max={filterOptions.collectionDateMax || undefined}
                  min={
                    collectionDateFrom ||
                    filterOptions.collectionDateMin ||
                    undefined
                  }
                  onChange={(e) => {
                    setCollectionDateTo(e.target.value);
                    resetSearchState();
                  }}
                  className="w-full h-11 bg-white border border-slate-200/80 rounded-xl px-3.5 text-xs font-medium text-slate-700 outline-none focus:border-[#4f46e5] transition-all shadow-2xs"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-500">
                  Sequencing platform
                </label>
                <select
                  value={sequencingPlatform}
                  onChange={(e) => {
                    setSequencingPlatform(e.target.value);
                    resetSearchState();
                  }}
                  className="w-full h-11 bg-white border border-slate-200/80 rounded-xl px-3.5 text-xs font-medium text-slate-700 outline-none focus:border-[#4f46e5] transition-all shadow-2xs"
                >
                  <option value="">All platforms</option>
                  {filterOptions.sequencingPlatforms.map((platform) => (
                    <option key={platform} value={platform}>
                      {platform}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="pt-2 flex flex-col sm:flex-row sm:items-center gap-3">
              <button
                type="button"
                onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
                className="inline-flex items-center gap-2 px-4 py-2 border border-slate-200 bg-white hover:bg-slate-50 text-xs font-bold text-slate-600 rounded-xl transition-all shadow-2xs shrink-0"
              >
                <SlidersHorizontal className="w-3.5 h-3.5 text-slate-500" />
                {showAdvancedFilters
                  ? "Hide advanced filters"
                  : "Show advanced filters"}
              </button>
              <p className="text-[11px] text-slate-400">
                Advanced filters are evaluated using text matching based on user
                scope.
              </p>
            </div>

            {showAdvancedFilters && (
              <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 md:grid-cols-5 pt-3 border-t border-slate-100/70 animate-in fade-in slide-in-from-top-2 duration-300">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-500">
                    sample_id
                  </label>
                  <input
                    type="text"
                    value={sampleId}
                    onChange={(e) => {
                      setSampleId(e.target.value);
                      resetSearchState();
                    }}
                    placeholder="SAM-AAA-0010"
                    className="w-full h-10 bg-white border border-slate-200/70 rounded-xl px-3 text-xs outline-none focus:border-[#4f46e5] transition-all"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-500">
                    locus_name
                  </label>
                  <input
                    type="text"
                    value={locusName}
                    onChange={(e) => {
                      setLocusName(e.target.value);
                      resetSearchState();
                    }}
                    placeholder="S"
                    className="w-full h-10 bg-white border border-slate-200/70 rounded-xl px-3 text-xs outline-none focus:border-[#4f46e5] transition-all"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-500">
                    locus_id
                  </label>
                  <input
                    type="text"
                    value={locusId}
                    onChange={(e) => {
                      setLocusId(e.target.value);
                      resetSearchState();
                    }}
                    placeholder="YP_009724390.1"
                    className="w-full h-10 bg-white border border-slate-200/70 rounded-xl px-3 text-xs outline-none focus:border-[#4f46e5] transition-all"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-500">
                    effect
                  </label>
                  <select
                    value={effect}
                    onChange={(e) => {
                      setEffect(e.target.value);
                      resetSearchState();
                    }}
                    className="w-full h-10 bg-white border border-slate-200/70 rounded-xl px-3 text-xs outline-none focus:border-[#4f46e5] transition-all"
                  >
                    <option value="">All effects</option>
                    {filterOptions.effects.map((eff) => (
                      <option key={eff} value={eff}>
                        {eff}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-500">
                    aminoacid_change
                  </label>
                  <input
                    type="text"
                    value={aminoacidChange}
                    onChange={(e) => {
                      setAminoacidChange(e.target.value);
                      resetSearchState();
                    }}
                    placeholder="p.D614G"
                    className="w-full h-10 bg-white border border-slate-200/70 rounded-xl px-3 text-xs outline-none focus:border-[#4f46e5] transition-all"
                  />
                </div>
              </div>
            )}
          </div>

          <div className="grid gap-4 grid-cols-2 md:grid-cols-5">
            <ResultField
              label="Position"
              value={parsedVariant ? parsedVariant.position : null}
              isNumber
            />
            <ResultField label="Ref." value={parsedVariant?.referenceAllele} />
            <ResultField label="Alt." value={parsedVariant?.alternateAllele} />
            <ResultField
              label="Samples"
              value={sampleCount}
              isNumber
              placeholder={hasQuery && parsedVariant ? "Run search" : "N/A"}
              active
            />
            <ResultField
              label="Global AF"
              value={globalAlleleFrequency}
              isAF
              placeholder={hasQuery && parsedVariant ? "Run search" : "N/A"}
              active
            />
          </div>
        </form>

        {hasQuery && !parsedVariant && (
          <div className="mt-5 rounded-2xl border border-amber-200 bg-amber-50/70 px-4 py-3.5 text-xs font-medium text-amber-900 shadow-3xs">
            Invalid HGVS genomic notation. Use the generic format:{" "}
            <span className="font-mono bg-amber-100/60 px-1 py-0.5 rounded border border-amber-200">
              g.&lt;position&gt;&lt;ref&gt;&gt;&lt;alt&gt;
            </span>
            , for example{" "}
            <span className="font-mono bg-amber-100/60 px-1 py-0.5 rounded border border-amber-200">
              g.112534G&gt;C
            </span>
            .
          </div>
        )}

        {searchStatus === "loading" && (
          <div className="mt-5 rounded-2xl border border-slate-100 bg-slate-50/60 p-5 text-xs font-medium text-slate-500 animate-pulse">
            Searching for variant observations within the authenticated scope on
            the server...
          </div>
        )}

        {searchStatus === "error" && (
          <div className="mt-5 rounded-2xl border border-rose-200 bg-rose-50/60 px-4 py-3.5 text-xs font-medium text-rose-900">
            {searchError}
          </div>
        )}

        {isEmptyResult && parsedVariant && (
          <div className="mt-5 rounded-2xl border border-dashed border-slate-200 bg-slate-50/50 p-6 text-xs text-slate-500 leading-relaxed">
            No variants found for{" "}
            <span className="font-mono font-bold text-slate-700">
              {parsedVariant.variant}
            </span>
            {referenceGenome ? (
              <>
                {" "}
                in the genome{" "}
                <span className="font-mono font-bold text-slate-700">
                  {referenceGenome}
                </span>
              </>
            ) : null}
            . The backend returned an empty collection for the configured scope
            and filters.
          </div>
        )}

        {searchStatus === "success" && searchResult?.results?.length > 0 && (
          <div className="mt-6 animate-in slide-in-from-top-3 duration-500">
            <div className="flex items-center gap-2 mb-4">
              <TableIcon className="w-4 h-4 text-slate-400" />
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Detailed Variant Rows ({searchResult.results.length})
              </h4>
            </div>

            <div className="overflow-x-auto rounded-[20px] border border-slate-100 shadow-xs max-w-full">
              <table className="min-w-[1450px] w-full text-left border-collapse bg-white">
                <thead className="bg-slate-50/80 text-[10px] uppercase font-bold tracking-wider text-slate-400 border-b border-slate-100">
                  <tr>
                    <th className="p-3.5 pl-6">sample_id</th>
                    <th className="p-3.5">variant</th>
                    <th className="p-3.5">allele_frequency</th>
                    <th className="p-3.5">depth</th>
                    <th className="p-3.5">Type</th>
                    <th className="p-3.5">Ref.</th>
                    <th className="p-3.5">Alt.</th>
                    <th className="p-3.5">Ref. Genome</th>
                    <th className="p-3.5">gene region</th>
                    <th className="p-3.5">effect</th>
                    <th className="p-3.5">functional class</th>
                    <th className="p-3.5">locus name</th>
                    <th className="p-3.5">locus id</th>
                    <th className="p-3.5 pr-6">aminoacid change</th>
                  </tr>
                </thead>
                <tbody className="text-xs font-medium text-slate-600 divide-y divide-slate-50">
                  {searchResult.results.map((row: any, idx: number) => (
                    <tr
                      key={idx}
                      className="hover:bg-slate-50/40 transition-colors"
                    >
                      <td className="p-3.5 pl-6 font-semibold text-slate-900">
                        {row.sample_id}
                      </td>
                      <td className="p-3.5 font-mono text-xs text-slate-500">
                        {row.variant}
                      </td>
                      <td className="p-3.5 font-bold text-slate-900">
                        {formatAlleleFrequency(row.allele_frequency)}
                      </td>
                      <td className="p-3.5 font-mono text-slate-500">
                        {formatNullableNumber(row.depth)}
                      </td>
                      <td className="p-3.5">
                        <span className="px-2 py-0.5 bg-slate-100 text-slate-600 rounded text-[10px] font-bold uppercase tracking-wide">
                          {formatNullableText(row.type)}
                        </span>
                      </td>
                      <td className="p-3.5 font-mono text-slate-500">
                        {row.reference_allele}
                      </td>
                      <td className="p-3.5 font-mono text-slate-500">
                        {row.alternate_allele}
                      </td>
                      <td className="p-3.5 font-mono text-slate-500">
                        {formatNullableText(row.reference_genome)}
                      </td>
                      <td className="p-3.5 text-slate-500">
                        {formatNullableText(row.gene_region)}
                      </td>
                      <td className="p-3.5 text-rose-500 font-semibold">
                        {formatNullableText(row.effect)}
                      </td>
                      <td className="p-3.5 text-slate-500">
                        {formatNullableText(row.functional_class)}
                      </td>
                      <td className="p-3.5 font-semibold text-slate-700">
                        {formatNullableText(row.locus_name)}
                      </td>
                      <td className="p-3.5 font-mono text-slate-400 text-[11px]">
                        {formatNullableText(row.locus_id)}
                      </td>
                      <td className="p-3.5 pr-6 font-mono text-indigo-600 font-bold">
                        {row.aminoacid_change || "N/A"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </Surface>

      <div className="w-full">
        <Surface className="p-8 shadow-sm rounded-[24px] border border-slate-100/60 bg-white w-full">
          <div className="flex items-center gap-2.5 mb-6">
            <div className="p-3.5 bg-indigo-50/60 text-[#4f46e5] rounded-2xl group-hover:bg-[#4f46e5] group-hover:text-white transition-all duration-300">
              <Dna className="w-4 h-4" />
            </div>
            <h3 className="text-lg font-semibold tracking-tight text-slate-900">
              Impact classes
            </h3>
          </div>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={data.impact_classes}
                margin={{ bottom: 25, left: -10, right: 10 }}
              >
                <CartesianGrid
                  vertical={false}
                  strokeDasharray="3 3"
                  stroke="#f1f5f9"
                />
                <XAxis
                  dataKey="label"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 10, fill: "#64748b", fontWeight: 600 }}
                  interval={0}
                  angle={-15}
                  textAnchor="end"
                  dy={8}
                />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 11, fill: "#94a3b8" }}
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
                  dataKey="value"
                  fill="#4D45E1"
                  radius={[6, 6, 0, 0]}
                  barSize={24}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Surface>
      </div>
    </div>
  );
}

function ResultField({
  label,
  value,
  isNumber,
  isAF,
  placeholder = "N/A",
  active,
}: {
  label: string;
  value: any;
  isNumber?: boolean;
  isAF?: boolean;
  placeholder?: string;
  active?: boolean;
}) {
  let displayValue = placeholder;

  if (value !== null && value !== undefined) {
    if (isAF) {
      displayValue = formatAlleleFrequency(value);
    } else if (isNumber) {
      displayValue = value.toLocaleString();
    } else {
      displayValue = String(value);
    }
  }

  return (
    <div className="space-y-1.5 p-4 bg-slate-50/50 rounded-xl border border-slate-100/50">
      <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">
        {label}
      </p>
      <p
        className={`text-lg font-bold tracking-tight font-mono ${
          active && value !== null
            ? "text-transparent bg-clip-text bg-gradient-to-r from-[#4f46e5] to-[#8b5cf6]"
            : "text-slate-800"
        }`}
      >
        {displayValue}
      </p>
    </div>
  );
}
