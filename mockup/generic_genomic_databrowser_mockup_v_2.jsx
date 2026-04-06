import React, { useMemo, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  AreaChart,
  Area,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import {
  Database,
  Microscope,
  FileCode2,
  Layers3,
  GitBranch,
  ArrowRight,
  ChevronDown,
  ChevronUp,
  Sparkles,
  FolderTree,
  FlaskConical,
  MapPinned,
  Cpu,
  UserRound,
  Dna,
  Search,
  ChartBar,
} from "lucide-react";
import { motion } from "framer-motion";

const colors = ["#0f766e", "#1d4ed8", "#7c3aed", "#ea580c", "#16a34a", "#64748b"];

const privacyText =
  "Approximate participant count with at least one mention of this concept. Counts are privacy-protected and rounded; each participant is counted once.";

const entryCards = [
  {
    id: "overview",
    title: "Overview of samples",
    subtitle: "Snapshot of genomic sample content",
    stat: "128,432 samples",
    description:
      "Aggregated summary of samples, pathogens, demographics, specimen context, temporal growth, and geographic coverage across all projects.",
    icon: Microscope,
    tags: ["Samples", "Demographics", "Pathogens"],
  },
  {
    id: "schema",
    title: "Schema",
    subtitle: "How the database is organized",
    stat: "12 schemas",
    description:
      "Structural view of schemas, projects linked to each schema, coverage, and sample counts represented in each model layer.",
    icon: FileCode2,
    tags: ["Schemas", "Projects", "Coverage"],
  },
  {
    id: "metadata",
    title: "Metadata",
    subtitle: "Sample, bioinfo, and host properties",
    stat: "3 major sections",
    description:
      "Card-based view of the most relevant metadata properties, with expandable entries and aggregated charts for scientific users.",
    icon: Layers3,
    tags: ["Sample metadata", "Bioinfo", "Host"],
  },
  {
    id: "variant",
    title: "Variant",
    subtitle: "Reference genomes and variant landscape",
    stat: "5.8M variants",
    description:
      "High-level aggregate view of references, variant counts, annotation classes, and project coverage for genomic variation.",
    icon: GitBranch,
    tags: ["Reference genomes", "Variants", "Annotation"],
  },
];

const topKpis = [
  { label: "Samples", value: "128,432", note: "Registered across all projects", icon: FlaskConical },
  { label: "Projects", value: "46", note: "Active genomic datasets", icon: FolderTree },
  { label: "Schemas", value: "12", note: "Distinct active schemas", icon: FileCode2 },
  { label: "Properties", value: "418", note: "Across classification levels", icon: Layers3 },
];

const samplesByYear = [
  { year: "2020", value: 7400 },
  { year: "2021", value: 12900 },
  { year: "2022", value: 19600 },
  { year: "2023", value: 25400 },
  { year: "2024", value: 31100 },
  { year: "2025", value: 32032 },
];

const topPathogens = [
  { name: "K. pneumoniae", value: 31 },
  { name: "E. coli", value: 24 },
  { name: "E. cloacae", value: 15 },
  { name: "A. baumannii", value: 11 },
  { name: "Other", value: 19 },
];

const geoCoverage = [
  { label: "Madrid", value: 18400 },
  { label: "Cataluña", value: 16200 },
  { label: "Andalucía", value: 14100 },
  { label: "Valencia", value: 9800 },
  { label: "Galicia", value: 6200 },
  { label: "País Vasco", value: 5900 },
];

const schemaRows = [
  { name: "Sample", samples: "128,432", projects: 46, properties: 96 },
  { name: "BioinfoAnalysis", samples: "117,904", projects: 39, properties: 144 },
  { name: "PublicDatabaseValues", samples: "69,211", projects: 24, properties: 38 },
  { name: "Variant", samples: "40,112", projects: 18, properties: 92 },
];

const variantImpact = [
  { label: "Modifier", value: 47 },
  { label: "Low", value: 22 },
  { label: "Moderate", value: 21 },
  { label: "High", value: 10 },
];

const sampleMetadataProperties = [
  {
    property: "geo_loc_state",
    participantCount: "126,800",
    participantShare: "98.7%",
    chartTitle: "Samples by region",
    data: [
      { label: "Madrid", value: 18400 },
      { label: "Cataluña", value: 16200 },
      { label: "Andalucía", value: 14100 },
      { label: "Valencia", value: 9800 },
      { label: "Galicia", value: 6200 },
    ],
  },
  {
    property: "sample_collection_date",
    participantCount: "121,020",
    participantShare: "94.2%",
    chartTitle: "Samples by collection year",
    data: [
      { label: "2021", value: 11800 },
      { label: "2022", value: 19400 },
      { label: "2023", value: 25800 },
      { label: "2024", value: 31000 },
      { label: "2025", value: 33020 },
    ],
  },
  {
    property: "sample_received_date",
    participantCount: "119,340",
    participantShare: "92.9%",
    chartTitle: "Samples by received year",
    data: [
      { label: "2021", value: 10900 },
      { label: "2022", value: 18800 },
      { label: "2023", value: 24600 },
      { label: "2024", value: 29800 },
      { label: "2025", value: 35240 },
    ],
  },
  {
    property: "anatomical_material",
    participantCount: "92,480",
    participantShare: "72.0%",
    chartTitle: "Samples by anatomical material",
    data: [
      { label: "Blood", value: 29400 },
      { label: "Urine", value: 23100 },
      { label: "Respiratory", value: 18100 },
      { label: "Wound", value: 12400 },
      { label: "Other", value: 9480 },
    ],
  },
  {
    property: "anatomical_part",
    participantCount: "74,560",
    participantShare: "58.1%",
    chartTitle: "Samples by anatomical part",
    data: [
      { label: "Lung", value: 16800 },
      { label: "Urinary tract", value: 15100 },
      { label: "Bloodstream", value: 13800 },
      { label: "Skin", value: 12300 },
      { label: "Other", value: 16560 },
    ],
  },
  {
    property: "specimen_source",
    participantCount: "103,220",
    participantShare: "80.4%",
    chartTitle: "Samples by specimen source",
    data: [
      { label: "Clinical", value: 71200 },
      { label: "Screening", value: 16400 },
      { label: "Reference collection", value: 9200 },
      { label: "Environmental", value: 6420 },
    ],
  },
  {
    property: "isolate_delivery_type",
    participantCount: "88,740",
    participantShare: "69.1%",
    chartTitle: "Samples by isolate delivery type",
    data: [
      { label: "Pure isolate", value: 56400 },
      { label: "DNA", value: 18400 },
      { label: "Reads only", value: 13940 },
    ],
  },
];

const bioinfoPanelSequencing = [
  { label: "Illumina", value: 72 },
  { label: "Nanopore", value: 18 },
  { label: "PacBio", value: 10 },
];

const bioinfoPanelSoftware = [
  { label: "ARIBA", value: 24 },
  { label: "AMRFinder", value: 31 },
  { label: "Kleborate", value: 18 },
  { label: "Abricate", value: 27 },
];

const bioinfoMetadataProperties = [
  {
    property: "bioinformatics_protocol_software_name",
    participantCount: "109,460",
    participantShare: "85.2%",
    chartTitle: "Samples by analysis software",
    data: [
      { label: "ARIBA", value: 24400 },
      { label: "AMRFinder", value: 31800 },
      { label: "Kleborate", value: 19800 },
      { label: "Abricate", value: 33460 },
    ],
  },
  {
    property: "preprocessing_software_name",
    participantCount: "101,220",
    participantShare: "78.8%",
    chartTitle: "Samples by preprocessing software",
    data: [
      { label: "fastp", value: 45200 },
      { label: "Trimmomatic", value: 24800 },
      { label: "Porechop", value: 11620 },
      { label: "Other", value: 19600 },
    ],
  },
  {
    property: "read_length",
    participantCount: "114,800",
    participantShare: "89.4%",
    chartTitle: "Samples by read length bucket",
    data: [
      { label: "<=150", value: 61800 },
      { label: "151-300", value: 32100 },
      { label: "301-1000", value: 10200 },
      { label: ">1000", value: 10700 },
    ],
  },
  {
    property: "number_of_reads_sequenced",
    participantCount: "112,960",
    participantShare: "87.9%",
    chartTitle: "Samples by read count bucket",
    data: [
      { label: "<1M", value: 14600 },
      { label: "1-3M", value: 38400 },
      { label: "3-5M", value: 34100 },
      { label: ">5M", value: 25860 },
    ],
  },
  {
    property: "assembly_method",
    participantCount: "94,120",
    participantShare: "73.3%",
    chartTitle: "Samples by assembly method",
    data: [
      { label: "SPAdes", value: 42100 },
      { label: "Unicycler", value: 23100 },
      { label: "Flye", value: 10820 },
      { label: "Other", value: 18100 },
    ],
  },
  {
    property: "annotation_software_name",
    participantCount: "91,840",
    participantShare: "71.5%",
    chartTitle: "Samples by annotation software",
    data: [
      { label: "Prokka", value: 45200 },
      { label: "Bakta", value: 18400 },
      { label: "PGAP", value: 9820 },
      { label: "Other", value: 18420 },
    ],
  },
  {
    property: "reads_genome_coverage_value",
    participantCount: "102,280",
    participantShare: "79.6%",
    chartTitle: "Samples by coverage bucket",
    data: [
      { label: "<30x", value: 12100 },
      { label: "30-60x", value: 34400 },
      { label: "60-100x", value: 29800 },
      { label: ">100x", value: 25980 },
    ],
  },
];

const hostOverviewCharts = {
  gender: [
    { label: "Male", value: 52 },
    { label: "Female", value: 45 },
    { label: "Unknown", value: 3 },
  ],
  infectionType: [
    { label: "Bloodstream", value: 28 },
    { label: "Urinary", value: 23 },
    { label: "Respiratory", value: 21 },
    { label: "Colonization", value: 16 },
    { label: "Other", value: 12 },
  ],
};

const hostMetadataProperties = [
  {
    property: "host_age_years",
    participantCount: "82,140",
    participantShare: "63.9%",
    chartTitle: "Samples by host age group",
    data: [
      { label: "0-17", value: 8200 },
      { label: "18-39", value: 17400 },
      { label: "40-64", value: 24800 },
      { label: "65-79", value: 20100 },
      { label: "80+", value: 11640 },
    ],
  },
  {
    property: "host_gender",
    participantCount: "86,320",
    participantShare: "67.2%",
    chartTitle: "Samples by host gender",
    data: [
      { label: "Male", value: 44800 },
      { label: "Female", value: 38720 },
      { label: "Unknown", value: 2800 },
    ],
  },
  {
    property: "host_common_name",
    participantCount: "118,920",
    participantShare: "92.6%",
    chartTitle: "Samples by host common name",
    data: [
      { label: "Human", value: 110200 },
      { label: "Pig", value: 3220 },
      { label: "Chicken", value: 2140 },
      { label: "Cattle", value: 1860 },
      { label: "Other", value: 1500 },
    ],
  },
  {
    property: "infection_type",
    participantCount: "79,880",
    participantShare: "62.2%",
    chartTitle: "Samples by infection type",
    data: [
      { label: "Bloodstream", value: 22300 },
      { label: "Urinary", value: 18120 },
      { label: "Respiratory", value: 16200 },
      { label: "Surgical site", value: 7820 },
      { label: "Other", value: 15440 },
    ],
  },
  {
    property: "exposure_setting",
    participantCount: "62,540",
    participantShare: "48.7%",
    chartTitle: "Samples by exposure setting",
    data: [
      { label: "Hospital", value: 34200 },
      { label: "Community", value: 15400 },
      { label: "Long-term care", value: 6240 },
      { label: "Other", value: 6700 },
    ],
  },
  {
    property: "Associated with outbreak",
    participantCount: "41,820",
    participantShare: "32.6%",
    chartTitle: "Samples associated with outbreak",
    data: [
      { label: "Yes", value: 9820 },
      { label: "No", value: 32000 },
    ],
  },
];

function StatCard({ label, value, note, icon: Icon }) {
  return (
    <Card className="rounded-2xl border-slate-200 shadow-sm">
      <CardContent className="p-5">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-sm text-slate-500">{label}</p>
            <p className="mt-2 text-3xl font-semibold tracking-tight text-slate-950">{value}</p>
            <p className="mt-1 text-xs text-slate-500">{note}</p>
          </div>
          <div className="rounded-2xl bg-slate-100 p-3">
            <Icon className="h-5 w-5 text-slate-700" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function EntryCard({ item, active, onClick }) {
  const Icon = item.icon;
  return (
    <button onClick={onClick} className="w-full text-left">
      <Card className={`group h-full rounded-[28px] border transition-all ${active ? "border-slate-900 shadow-lg" : "border-slate-200 shadow-sm hover:-translate-y-0.5 hover:shadow-md"}`}>
        <CardHeader>
          <div className="flex items-start justify-between gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-100">
              <Icon className="h-5 w-5 text-slate-800" />
            </div>
            <Badge className="rounded-full bg-slate-100 text-slate-700 hover:bg-slate-100">{item.stat}</Badge>
          </div>
          <CardTitle className="pt-4 text-xl tracking-tight text-slate-950">{item.title}</CardTitle>
          <CardDescription className="text-sm text-slate-500">{item.subtitle}</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm leading-6 text-slate-600">{item.description}</p>
          <div className="mt-5 flex flex-wrap gap-2">
            {item.tags.map((tag) => (
              <Badge key={tag} variant="secondary" className="rounded-full">
                {tag}
              </Badge>
            ))}
          </div>
          <div className="mt-6 flex items-center gap-2 text-sm font-medium text-slate-700">
            Explore aggregated detail
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
          </div>
        </CardContent>
      </Card>
    </button>
  );
}

function SectionHeader({ eyebrow, title, description, action }) {
  return (
    <div className="mb-4 flex items-start justify-between gap-4">
      <div>
        {eyebrow ? <p className="text-xs font-medium uppercase tracking-[0.22em] text-teal-700">{eyebrow}</p> : null}
        <h3 className="mt-1 text-lg font-semibold tracking-tight text-slate-950">{title}</h3>
        <p className="mt-1 text-sm text-slate-500">{description}</p>
      </div>
      {action}
    </div>
  );
}

function PropertyAccordionCard({ item, accent = "#0f766e" }) {
  const [open, setOpen] = useState(false);

  return (
    <Card className="rounded-[22px] border-slate-200 shadow-sm">
      <CardContent className="p-5">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <p className="text-base font-semibold text-slate-950">{item.property}</p>
              <Badge variant="secondary" className="rounded-full">{item.participantCount} participants</Badge>
              <Badge className="rounded-full bg-slate-900 text-white hover:bg-slate-900">{item.participantShare} of total</Badge>
            </div>
            <p className="mt-3 max-w-4xl text-sm leading-6 text-slate-500">{privacyText}</p>
          </div>
          <Button variant="outline" className="rounded-2xl gap-2 self-start" onClick={() => setOpen(!open)}>
            {open ? "Hide distribution" : "Expand distribution"}
            {open ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
          </Button>
        </div>

        {open && (
          <div className="mt-6 rounded-[20px] border border-slate-200 bg-slate-50 p-4">
            <div className="mb-3 flex items-center justify-between gap-3">
              <p className="text-sm font-medium text-slate-900">{item.chartTitle}</p>
              <p className="text-xs text-slate-500">Number of samples vs values/enums</p>
            </div>
            <div className="h-[260px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={item.data}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                  <XAxis dataKey="label" tickLine={false} axisLine={false} />
                  <YAxis tickLine={false} axisLine={false} />
                  <Tooltip />
                  <Bar dataKey="value" fill={accent} radius={[10, 10, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function OverviewPage() {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
        {topKpis.map((item) => (
          <StatCard key={item.label} {...item} />
        ))}
      </div>

      <div className="grid grid-cols-1 gap-6 2xl:grid-cols-12">
        <Card className="rounded-[28px] border-slate-200 shadow-sm 2xl:col-span-5">
          <CardHeader>
            <SectionHeader eyebrow="Samples" title="Growth of registered samples" description="How genomic sample content has accumulated in the database over time." />
          </CardHeader>
          <CardContent className="h-[320px] pt-0">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={samplesByYear}>
                <defs>
                  <linearGradient id="sampleFillV2" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#0f766e" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#0f766e" stopOpacity={0.03} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis dataKey="year" tickLine={false} axisLine={false} />
                <YAxis tickLine={false} axisLine={false} />
                <Tooltip />
                <Area type="monotone" dataKey="value" stroke="#0f766e" strokeWidth={2.5} fill="url(#sampleFillV2)" />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="rounded-[28px] border-slate-200 shadow-sm 2xl:col-span-4">
          <CardHeader>
            <SectionHeader eyebrow="Pathogens" title="Top organisms represented" description="Largest pathogens currently represented in the aggregated database snapshot." />
          </CardHeader>
          <CardContent className="h-[320px] pt-0">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={topPathogens} dataKey="value" nameKey="name" innerRadius={62} outerRadius={104} paddingAngle={3}>
                  {topPathogens.map((entry, index) => (
                    <Cell key={entry.name} fill={colors[index % colors.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="rounded-[28px] border-slate-200 shadow-sm 2xl:col-span-3">
          <CardHeader>
            <SectionHeader eyebrow="Geolocation" title="Samples by region" description="Regional sample coverage in the generic data browser snapshot." />
          </CardHeader>
          <CardContent className="h-[320px] pt-0">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={geoCoverage} layout="vertical" margin={{ left: 10, right: 10 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#e2e8f0" />
                <XAxis type="number" tickLine={false} axisLine={false} />
                <YAxis type="category" dataKey="label" width={88} tickLine={false} axisLine={false} />
                <Tooltip />
                <Bar dataKey="value" fill="#1d4ed8" radius={[0, 10, 10, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function SchemaPage() {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <StatCard label="Active schemas" value="12" note="Schemas currently used in production" icon={FileCode2} />
        <StatCard label="Projects mapped" value="46" note="Projects linked to at least one schema" icon={FolderTree} />
        <StatCard label="Schema-linked samples" value="128,432" note="Samples represented by schema-aware records" icon={FlaskConical} />
      </div>

      <Card className="rounded-[28px] border-slate-200 shadow-sm">
        <CardHeader>
          <SectionHeader eyebrow="Structure" title="Schema inventory" description="How the database is organized across its genomic model layers." />
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {schemaRows.map((row) => (
            <div key={row.name} className="rounded-[22px] border border-slate-200 bg-slate-50 p-5">
              <p className="text-base font-semibold text-slate-950">{row.name}</p>
              <div className="mt-4 space-y-2 text-sm text-slate-600">
                <p>Samples: <span className="font-medium text-slate-900">{row.samples}</span></p>
                <p>Projects: <span className="font-medium text-slate-900">{row.projects}</span></p>
                <p>Properties: <span className="font-medium text-slate-900">{row.properties}</span></p>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}

function MetadataPage() {
  const [propertySearch, setPropertySearch] = useState("");

  const filterProperties = (items) => {
    const q = propertySearch.trim().toLowerCase();
    if (!q) return items;
    return items.filter((item) => item.property.toLowerCase().includes(q));
  };

  const filteredSample = useMemo(() => filterProperties(sampleMetadataProperties), [propertySearch]);
  const filteredBioinfo = useMemo(() => filterProperties(bioinfoMetadataProperties), [propertySearch]);
  const filteredHost = useMemo(() => filterProperties(hostMetadataProperties), [propertySearch]);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <StatCard label="Sample metadata properties" value="7" note="Selected from Sample collection and processing" icon={MapPinned} />
        <StatCard label="Bioinfo metadata properties" value="7" note="High-value fields for sequencing and analysis" icon={Cpu} />
        <StatCard label="Host information properties" value="6" note="Most relevant host descriptors for scientific users" icon={UserRound} />
      </div>

      <Card className="rounded-[28px] border-slate-200 shadow-sm">
        <CardHeader>
          <SectionHeader
            eyebrow="Metadata card"
            title="Property explorer"
            description="This card is structured in three subsections: sample metadata, sample bioinfo, and host information. Each property can expand to reveal an aggregated distribution."
            action={
              <div className="relative w-full max-w-xs">
                <Search className="pointer-events-none absolute left-3 top-3.5 h-4 w-4 text-slate-400" />
                <Input value={propertySearch} onChange={(e) => setPropertySearch(e.target.value)} placeholder="Search metadata property..." className="rounded-2xl pl-9" />
              </div>
            }
          />
        </CardHeader>
        <CardContent className="pt-0">
          <Tabs defaultValue="sample" className="w-full">
            <TabsList className="grid w-full grid-cols-3 rounded-2xl bg-slate-100 p-1">
              <TabsTrigger value="sample" className="rounded-2xl">Sample metadata</TabsTrigger>
              <TabsTrigger value="bioinfo" className="rounded-2xl">Sample bioinfo</TabsTrigger>
              <TabsTrigger value="host" className="rounded-2xl">Host information</TabsTrigger>
            </TabsList>

            <TabsContent value="sample" className="mt-5 space-y-5">
              <Card className="rounded-[24px] border-slate-200 bg-slate-50 shadow-none">
                <CardContent className="p-5">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <p className="text-sm font-medium text-slate-900">Classification</p>
                      <p className="mt-1 text-sm text-slate-500">Sample collection and processing</p>
                    </div>
                    <Badge className="rounded-full bg-slate-900 text-white hover:bg-slate-900">Selected high-value properties</Badge>
                  </div>
                </CardContent>
              </Card>

              <div className="space-y-4">
                {filteredSample.map((item) => (
                  <PropertyAccordionCard key={item.property} item={item} accent="#0f766e" />
                ))}
              </div>
            </TabsContent>

            <TabsContent value="bioinfo" className="mt-5 space-y-5">
              <div className="grid grid-cols-1 gap-5 xl:grid-cols-2">
                <Card className="rounded-[24px] border-slate-200 shadow-sm">
                  <CardHeader>
                    <SectionHeader eyebrow="Overview panel" title="Samples by sequencing technology" description="A compact scientific snapshot before exploring individual bioinformatics properties." />
                  </CardHeader>
                  <CardContent className="h-[260px] pt-0">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={bioinfoPanelSequencing}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                        <XAxis dataKey="label" tickLine={false} axisLine={false} />
                        <YAxis tickLine={false} axisLine={false} />
                        <Tooltip />
                        <Bar dataKey="value" fill="#1d4ed8" radius={[10, 10, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>

                <Card className="rounded-[24px] border-slate-200 shadow-sm">
                  <CardHeader>
                    <SectionHeader eyebrow="Overview panel" title="Samples by analysis software" description="Another overview entry point for scientists before drilling into specific properties." />
                  </CardHeader>
                  <CardContent className="h-[260px] pt-0">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={bioinfoPanelSoftware}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                        <XAxis dataKey="label" tickLine={false} axisLine={false} />
                        <YAxis tickLine={false} axisLine={false} />
                        <Tooltip />
                        <Bar dataKey="value" fill="#7c3aed" radius={[10, 10, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
              </div>

              <div className="space-y-4">
                {filteredBioinfo.map((item) => (
                  <PropertyAccordionCard key={item.property} item={item} accent="#1d4ed8" />
                ))}
              </div>
            </TabsContent>

            <TabsContent value="host" className="mt-5 space-y-5">
              <div className="grid grid-cols-1 gap-5 xl:grid-cols-2">
                <Card className="rounded-[24px] border-slate-200 shadow-sm">
                  <CardHeader>
                    <SectionHeader eyebrow="Overview panel" title="Host gender distribution" description="High-level host view for scientific users exploring pathogen-associated samples." />
                  </CardHeader>
                  <CardContent className="h-[260px] pt-0">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie data={hostOverviewCharts.gender} dataKey="value" nameKey="label" innerRadius={55} outerRadius={95} paddingAngle={3}>
                          {hostOverviewCharts.gender.map((entry, index) => (
                            <Cell key={entry.label} fill={colors[index % colors.length]} />
                          ))}
                        </Pie>
                        <Tooltip />
                      </PieChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>

                <Card className="rounded-[24px] border-slate-200 shadow-sm">
                  <CardHeader>
                    <SectionHeader eyebrow="Overview panel" title="Host infection type" description="Aggregated host-associated infection categories across all genomic samples." />
                  </CardHeader>
                  <CardContent className="h-[260px] pt-0">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={hostOverviewCharts.infectionType}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                        <XAxis dataKey="label" tickLine={false} axisLine={false} />
                        <YAxis tickLine={false} axisLine={false} />
                        <Tooltip />
                        <Bar dataKey="value" fill="#ea580c" radius={[10, 10, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
              </div>

              <div className="space-y-4">
                {filteredHost.map((item) => (
                  <PropertyAccordionCard key={item.property} item={item} accent="#ea580c" />
                ))}
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}

function VariantPage() {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
        <StatCard label="Reference genomes" value="214" note="Distinct assemblies or canonical references" icon={Dna} />
        <StatCard label="Variant records" value="5.8M" note="Aggregated annotated variants in storage" icon={GitBranch} />
        <StatCard label="Annotated genes" value="12,406" note="Genes touched by at least one variant" icon={ChartBar} />
        <StatCard label="Projects with variants" value="18" note="Projects contributing variant content" icon={FolderTree} />
      </div>

      <Card className="rounded-[28px] border-slate-200 shadow-sm">
        <CardHeader>
          <SectionHeader eyebrow="Variant landscape" title="Impact classes" description="First high-level version of the variant card while the final model is still evolving." />
        </CardHeader>
        <CardContent className="h-[320px] pt-0">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={variantImpact}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
              <XAxis dataKey="label" tickLine={false} axisLine={false} />
              <YAxis tickLine={false} axisLine={false} />
              <Tooltip />
              <Bar dataKey="value" fill="#7c3aed" radius={[10, 10, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
}

export default function GenericGenomicDatabrowserMockupV2() {
  const [selected, setSelected] = useState("metadata");

  const selectedCard = entryCards.find((item) => item.id === selected) || entryCards[0];

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <div className="mx-auto max-w-[1600px] p-4 md:p-6 xl:p-8">
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35 }}>
          <div className="overflow-hidden rounded-[32px] border border-slate-200 bg-white shadow-sm">
            <div className="grid gap-6 p-6 xl:grid-cols-[1.1fr_0.9fr] xl:p-8">
              <div>
                <div className="flex items-center gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-900 text-white">
                    <Database className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-xs font-medium uppercase tracking-[0.24em] text-teal-700">Global data browser</p>
                    <h1 className="text-3xl font-semibold tracking-tight text-slate-950">Genomics as aggregated database content</h1>
                  </div>
                </div>
                <p className="mt-5 max-w-3xl text-base leading-7 text-slate-600">
                  Generic genomics data browser inspired by aggregated platforms like All of Us. The goal is not to filter cohorts like a surveillance dashboard, but to show what exists in the database through cards, counts, tables, and expandable metadata summaries.
                </p>
                <div className="mt-6 flex flex-wrap gap-2">
                  <Badge className="rounded-full bg-slate-900 text-white hover:bg-slate-900">All projects combined</Badge>
                  <Badge variant="secondary" className="rounded-full">Aggregated view</Badge>
                  <Badge variant="secondary" className="rounded-full">Card-based navigation</Badge>
                  <Badge variant="secondary" className="rounded-full">Scientific users</Badge>
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                {topKpis.map((item) => (
                  <StatCard key={item.label} {...item} />
                ))}
              </div>
            </div>

            <div className="border-t border-slate-200 bg-slate-50 px-6 py-4 xl:px-8">
              <div className="flex flex-wrap items-center justify-between gap-3 text-sm text-slate-500">
                <div className="flex items-center gap-2">
                  <Sparkles className="h-4 w-4 text-teal-700" />
                  Revised concept: keep the home in card format and make the metadata card itself rich and expandable.
                </div>
                <Button variant="outline" className="rounded-2xl">Architecture note</Button>
              </div>
            </div>
          </div>

          <section className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
            {entryCards.map((item) => (
              <EntryCard key={item.id} item={item} active={selected === item.id} onClick={() => setSelected(item.id)} />
            ))}
          </section>

          <section className="mt-8">
            <div className="mb-4">
              <p className="text-sm font-medium text-teal-700">Detailed aggregate page</p>
              <h2 className="text-2xl font-semibold tracking-tight text-slate-950">{selectedCard.title}</h2>
              <p className="mt-1 text-sm text-slate-500">This is the detailed page opened from the selected card, still keeping the same product language and card format.</p>
            </div>

            {selected === "overview" && <OverviewPage />}
            {selected === "schema" && <SchemaPage />}
            {selected === "metadata" && <MetadataPage />}
            {selected === "variant" && <VariantPage />}
          </section>
        </motion.div>
      </div>
    </div>
  );
}
