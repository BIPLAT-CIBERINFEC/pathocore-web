"use client";

import { useEffect, useState } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  Legend,
} from "recharts";
import {
  Info,
  Activity,
  ChevronDown,
  ChevronUp,
  FlaskConical,
  FolderGit2,
  FileCode2,
  Tag,
  Loader2,
  AlertCircle,
} from "lucide-react";
import { ResponsivePie } from "@nivo/pie";
import ReactECharts from "echarts-for-react";
import * as echarts from "echarts";
import { Surface, SectionHeading } from "@/components/mepram/MepramPrimitives";
import Chip from "../../components/GenomicData/Auxiliares/Chip";
import { LocationDistributionTable } from "./Graficos/LocationDistributionTable";

const cleanText = (text: string): string => {
  if (!text) return "";
  return text
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

const GEO_CODE_BY_LOCATION: Record<string, string> = {
  andalucia: "ES-AN",
  aragon: "ES-AR",
  asturias: "ES-AS",
  baleares: "ES-IB",
  canarias: "ES-CN",
  cantabria: "ES-CB",
  castillayleon: "ES-CL",
  castillalamancha: "ES-CM",
  cataluna: "ES-CT",
  catalunya: "ES-CT",
  valencia: "ES-VC",
  valenciana: "ES-VC",
  extremadura: "ES-EX",
  galicia: "ES-GA",
  madrid: "ES-MD",
  murcia: "ES-MC",
  navarra: "ES-NC",
  paisvasco: "ES-PV",
  euskadi: "ES-PV",
  larioja: "ES-RI",
  rioja: "ES-RI",
};

const getGeoCode = (item: any) => {
  const explicitCode =
    item.geo?.code ||
    item.tooltip?.geo?.code ||
    item.geo_code ||
    item.geoCode ||
    item.state_code ||
    item.iso_code ||
    item.code;

  if (explicitCode) return explicitCode;

  const label = item.label || item.state_name || item.name || item.geo?.label;
  return GEO_CODE_BY_LOCATION[cleanText(label)] || "";
};

const normalizePropertyKey = (value: any) =>
  String(value || "")
    .toLowerCase()
    .replace(/\s*\(\+\d+\)\s*/g, "")
    .replace(/\s+/g, "_")
    .trim();

const getSectionEmptyProperties = (section: any) => {
  const schemaOnlyProperties = section.schema_only_empty_properties || [];
  if (schemaOnlyProperties.length > 0) return schemaOnlyProperties;
  return section.empty_properties || [];
};

const EMPTY_PROPERTY_LIMITS: Record<string, number> = {
  "sample-metadata": 146,
  "sample-bioinfo": 143,
  "host-information": 17,
};

const EMPTY_PROPERTY_CLASSIFICATIONS: Record<string, string[]> = {
  "sample-metadata": [
    "sample collection and processing",
    "sample collecting and processing",
    "public databases",
    "database identifiers",
    "files info",
    "unclassified",
    "sequencing",
    "contributor acknowledgement",
    "other",
    "pathogen diagnostic testing",
    "bioinformatic variants",
  ],
  "sample-bioinfo": [
    "bioinformatics and qc metrics",
    "strain characterization",
    "bioinformatic analysis fields",
    "genomic typing fields",
    "bioinformatics and qc metrics fields",
    "bioinformatic variants",
  ],
  "host-information": [
    "host information",
    "host exposure information",
    "pathogen diagnostic testing",
    "other",
  ],
};

const shouldIncludeSchemaOnlyProperty = (
  sectionId: string,
  classification = ""
) => {
  const normalizedClassification = classification.toLowerCase();
  const allowedClassifications = EMPTY_PROPERTY_CLASSIFICATIONS[sectionId];
  if (!allowedClassifications) return true;
  return allowedClassifications.includes(normalizedClassification);
};

const enrichSectionsWithSchemaOnlyProperties = (
  metadata: any,
  schemaData: any
) => {
  if (!metadata?.sections || !schemaData?.schema_cards) return metadata;

  const populatedKeys = new Set<string>();
  metadata.sections.forEach((section: any) => {
    (section.properties || []).forEach((prop: any) => {
      [
        prop.property_name,
        prop.actual_property_name,
        prop.property,
        prop.display_name,
        prop.name,
      ].forEach((value) => {
        const key = normalizePropertyKey(value);
        if (key) populatedKeys.add(key);
      });
    });
  });

  const schemaOnlyByKey = new Map<string, any>();

  schemaData.schema_cards.forEach((schema: any) => {
    (schema.classifications || []).forEach((classification: any) => {
      (classification.properties || []).forEach((prop: any) => {
        const propertyName = prop.property_name || prop.path || prop.label;
        const candidateKeys = [
          prop.property_name,
          prop.path,
          prop.label,
          prop.label?.replace(/\s+/g, "_"),
        ]
          .map(normalizePropertyKey)
          .filter(Boolean);

        if (candidateKeys.some((key) => populatedKeys.has(key))) return;

        const stableKey = normalizePropertyKey(propertyName);
        if (!stableKey || schemaOnlyByKey.has(stableKey)) return;

        schemaOnlyByKey.set(stableKey, {
          display_name: prop.label || propertyName,
          property_name: propertyName,
          schema_path: prop.path || propertyName,
          description: prop.description,
          group: prop.classification || classification.name,
          type: prop.type,
          enum_values: prop.enum_values || [],
          schema_name: schema.name,
          participant_count: 0,
          participant_share: 0,
        });
      });
    });
  });

  const allSchemaOnlyProperties = Array.from(schemaOnlyByKey.values()).sort(
    (a: any, b: any) =>
      String(a.display_name).localeCompare(String(b.display_name))
  );

  return {
    ...metadata,
    sections: metadata.sections.map((section: any) => {
      const schemaOnlyProperties = allSchemaOnlyProperties.filter((prop: any) =>
        shouldIncludeSchemaOnlyProperty(section.id, prop.group)
      );
      const expectedLimit = EMPTY_PROPERTY_LIMITS[section.id];
      const limitedSchemaOnlyProperties = expectedLimit
        ? schemaOnlyProperties.slice(0, expectedLimit)
        : schemaOnlyProperties;

      return {
        ...section,
        schema_only_empty_properties: limitedSchemaOnlyProperties,
        schema_only_empty_properties_count: limitedSchemaOnlyProperties.length,
      };
    }),
  };
};

export default function MetadataExplorer() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("");
  const [expandedProps, setExpandedProps] = useState<Record<string, boolean>>(
    {}
  );
  const [expandedEmptySections, setExpandedEmptySections] = useState<
    Record<string, boolean>
  >({});
  const [registeredMaps, setRegisteredMaps] = useState<Record<string, boolean>>(
    {}
  );
 const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || "/api/pathocore/v1";
  useEffect(() => {
    async function initializeDashboard() {
      try {
        const dataRes = await fetch(
          `${baseUrl}/databrowser/metadata-summary`
        );
        const json = await dataRes.json();

        let schemaJson = null;
        try {
          const schemaRes = await fetch(
            `${baseUrl}/databrowser/schema-summary`
          );
          if (schemaRes.ok) {
            schemaJson = await schemaRes.json();
          }
        } catch (schemaErr) {
          console.warn("Could not load schemas summary:", schemaErr);
        }

        const enrichedJson = enrichSectionsWithSchemaOnlyProperties(
          json,
          schemaJson
        );
        setData(enrichedJson);
        if (enrichedJson.sections?.length > 0)
          setActiveTab(enrichedJson.sections[0].id);
      } catch (err) {
        console.error("Error initializing metadata dashboard:", err);
      } finally {
        setLoading(false);
      }
    }
    initializeDashboard();
  }, []);

const loadGeoJsonMap = async (mapName: string, geoJsonPath: string) => {
  if (registeredMaps[mapName]) return true;
  try {
    const res = await fetch(geoJsonPath);
    if (!res.ok) return false;

    const geoJson = await res.json();

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

    const officialNamesMap: Record<string, string> = {
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

    if (geoJson && geoJson.features) {
      geoJson.features = geoJson.features.map((feature: any) => {
        const props = feature.properties || {};
        const possibleKeys = [
          "NAME_1",
          "name",
          "NAME",
          "comunidad",
          "texto",
          "label",
        ];
        let detectedName = "";

        for (const key of possibleKeys) {
          if (props[key]) {
            detectedName = props[key];
            break;
          }
        }

        if (!detectedName) {
          const values = Object.values(props);
          const stringVal = values.find((v) => typeof v === "string");
          detectedName = stringVal ? String(stringVal) : "";
        }

        const cleanKey = cleanText(detectedName);
        const finalCorrectedName = officialNamesMap[cleanKey] || detectedName;

        if (finalCorrectedName === "Canarias" && feature.geometry) {
          shiftCoordinates(feature.geometry, 5.5, 7.5);
        }

        return {
          ...feature,
          properties: {
            ...props,
            name: finalCorrectedName,
          },
        };
      });
    }

    echarts.registerMap(mapName, geoJson as any);
    setRegisteredMaps((prev) => ({ ...prev, [mapName]: true }));
    return true;
  } catch (error) {
    console.error(`Error processing geographic map in ${mapName}:`, error);
    return false;
  }
};
  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center text-slate-400 animate-pulse font-medium">
        Loading metadata dashboard...
      </div>
    );
  }

  if (!data || !data?.stats) {
    return (
      <div className="p-20 text-center text-slate-500 font-medium">
        Could not load information from the server.
      </div>
    );
  }

  const currentSection = data.sections?.find((s: any) => s.id === activeTab);

  const toggleProp = (name: string) => {
    setExpandedProps((prev) => ({ ...prev, [name]: !prev[name] }));
  };

  const toggleEmptySection = (sectionId: string) => {
    setExpandedEmptySections((prev) => ({
      ...prev,
      [sectionId]: !prev[sectionId],
    }));
  };

  const getKpiStyle = (index: number) => {
    switch (index) {
      case 0:
        return {
          hoverBorder: "hover:border-[#4f46e5]/30",
          iconBg: "bg-indigo-50/60 text-[#4f46e5] group-hover:bg-[#4f46e5]",
          icon: <FlaskConical className="w-5 h-5" />,
        };
      case 1:
        return {
          hoverBorder: "hover:border-[#8b5cf6]/30",
          iconBg: "bg-indigo-50/60 text-[#4f46e5] group-hover:bg-[#4f46e5]",
          icon: <FolderGit2 className="w-5 h-5" />,
        };
      case 2:
        return {
          hoverBorder: "hover:border-[#ec4899]/30",
          iconBg: "bg-indigo-50/60 text-[#4f46e5] group-hover:bg-[#4f46e5]",
          icon: <FileCode2 className="w-5 h-5" />,
        };
      default:
        return {
          hoverBorder: "hover:border-slate-300",
          iconBg: "bg-indigo-50/60 text-[#4f46e5] group-hover:bg-[#4f46e5]",
          icon: <Tag className="w-5 h-5" />,
        };
    }
  };

  return (
    <div className="space-y-10 animate-in fade-in duration-700">
      <Surface className="p-8 border border-slate-100/80 bg-slate-50/30 rounded-[24px]">
        <div className="flex items-center gap-2 mb-3">
          <span className="px-3 py-1 bg-[#0f172a] text-white rounded-full text-[10px] font-bold uppercase tracking-wider">
            Current section: Metadata
          </span>
        </div>
        <p className="text-sm text-slate-500 max-w-4xl leading-relaxed">
          Detailed explorer of clinical metadata, biological samples, and
          computational properties indexed in PathoCore. Filter distributions by
          valid schemas and view global coverage metrics.
        </p>
      </Surface>
      <div className="grid gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-4">
        {data.stats.map((stat: any, i: number) => {
          const style = getKpiStyle(i);
          return (
            <Surface
              key={i}
              className={`p-6 border border-slate-100 shadow-sm flex items-center justify-between group transition-colors ${style.hoverBorder}`}
            >
              <div className="space-y-1">
                <p className="text-xs font-semibold text-slate-400 tracking-tight">
                  {stat.label}
                </p>
                <p className="text-4xl font-bold text-slate-900 tracking-tight font-mono">
                  {stat.value}
                </p>
                {stat.note && (
                  <p className="text-[11px] text-slate-400 pt-1">{stat.note}</p>
                )}
              </div>
              <div
                className={`p-3.5 rounded-2xl group-hover:text-white transition-all duration-300 ${style.iconBg}`}
              >
                {style.icon}
              </div>
            </Surface>
          );
        })}
      </div>
      <Surface className="p-0 overflow-hidden">
        <div className="p-6 border-b border-slate-100 sm:p-8">
          <SectionHeading
            eyebrow="Exploration"
            title="Metadata subsections"
            description="Filter and visualize metadata properties aggregated by category."
            action={
              <div className="flex flex-wrap gap-2 bg-slate-100/80 p-1 rounded-[18px] border border-slate-200/50">
                {data.sections?.map((section: any) => (
                  <button
                    key={section.id}
                    onClick={() => setActiveTab(section.id)}
                    className={`px-5 py-2 rounded-[14px] text-xs font-semibold transition-all ${
                      activeTab === section.id
                        ? "bg-white text-slate-950 shadow-sm ring-1 ring-slate-200/60"
                        : "text-slate-500 hover:text-slate-900"
                    }`}
                  >
                    {section.title}
                  </button>
                ))}
              </div>
            }
          />
        </div>
        {currentSection && (
          <div className="p-6 space-y-10 sm:p-8 animate-in fade-in slide-in-from-bottom-2 duration-500">
            {currentSection.summary_charts?.length > 0 && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {currentSection.summary_charts.map((chart: any, i: number) => (
                  <div
                    key={i}
                    className="p-6 bg-slate-50/50 rounded-[24px] border border-slate-100 flex flex-col justify-between"
                  >
                    <div>
                      <div className="mb-4">
                        <p className="text-[10px] font-bold text-[#2d2a7d] uppercase tracking-[0.18em]">
                          {chart.kind} summary
                        </p>
                        <h5 className="text-lg font-semibold text-slate-900 mt-1">
                          {chart.title}
                        </h5>
                      </div>
                      <div className="h-64">
                        <ChartRenderer
                          chart_kind={chart.kind}
                          values={chart.values}
                          title={chart.title}
                          loadMap={loadGeoJsonMap}
                          isMapRegistered={!!registeredMaps[chart.title]}
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
            <div className="space-y-4">
              <div className="flex items-center gap-2 mb-4">
                <Activity className="w-4 h-4 text-[#4f46e5]" />
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                  Detailed Properties
                </span>
              </div>

              {currentSection.properties?.map((prop: any, i: number) => {
                const isExpanded = expandedProps[prop.display_name];
                const propKey =
                  prop.property_name ||
                  prop.actual_property_name ||
                  prop.property ||
                  prop.display_name ||
                  prop.name ||
                  i;
                return (
                  <PropertyAccordionItem
                    key={`${currentSection.id}-${propKey}`}
                    prop={prop}
                    isExpanded={isExpanded}
                    onToggle={() => toggleProp(prop.display_name)}
                    loadGeoJsonMap={loadGeoJsonMap}
                    registeredMaps={registeredMaps}
                  />
                );
              })}
            </div>
            {getSectionEmptyProperties(currentSection).length > 0 && (
              <EmptyPropertiesAccordion
                section={currentSection}
                isExpanded={!!expandedEmptySections[currentSection.id]}
                onToggle={() => toggleEmptySection(currentSection.id)}
              />
            )}
              {/* {currentSection.notes?.length > 0 && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-8 border-t border-slate-100">
                  {currentSection.notes.map((note: string, i: number) => (
                    <div
                      key={i}
                      className="flex gap-3 p-4 bg-slate-100/40 rounded-[20px] border border-slate-200/50"
                    >
                      <Info className="w-4 h-4 text-slate-400 shrink-0" />
                      <p className="text-[11px] text-slate-500 italic leading-relaxed">
                        {note}
                      </p>
                    </div>
                  ))}
                </div>
              )} */}
          </div>
        )}
      </Surface>
    </div>
  );
}

function EmptyPropertiesAccordion({
  section,
  isExpanded,
  onToggle,
}: {
  section: any;
  isExpanded: boolean;
  onToggle: () => void;
}) {
  const emptyProperties = getSectionEmptyProperties(section);
  const emptyCount =
    section.schema_only_empty_properties_count ??
    section.empty_properties_count ??
    emptyProperties.length;
  const label =
    section.empty_properties_label || "More properties with 0 samples";

  return (
    <div className="rounded-[24px] border border-dashed border-slate-300 bg-white">
      <button
        type="button"
        onClick={onToggle}
        className="flex w-full items-start justify-between gap-4 p-6 text-left"
      >
        <div className="space-y-2">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="text-sm font-semibold text-slate-950">{label}</h3>
            <span className="rounded-full bg-[#f8fafc] px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-500 ring-1 ring-slate-200">
              {emptyCount} properties
            </span>
            <span className="rounded-full bg-[#f8fafc] px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-[#2d2a7d] ring-1 ring-slate-200">
              schema only
            </span>
          </div>
          <p className="max-w-3xl text-xs leading-5 text-slate-500">
            These properties are registered in the visible schemas, but have no
            samples with values in the current summary. They are listed for
            model traceability and do not load charts or distributions.
          </p>
        </div>
        <span className="inline-flex shrink-0 items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-2 text-[10px] font-bold uppercase tracking-wider text-slate-500 shadow-sm">
          {isExpanded ? "Hide properties" : "Show properties"}
          {isExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
        </span>
      </button>

      {isExpanded && (
        <div className="space-y-3 px-6 pb-6">
          {emptyProperties.map((prop: any, index: number) => {
            const propertyName =
              prop.property_name ||
              prop.property ||
              prop.display_name ||
              prop.name;
            const schemaPath =
              prop.schema_path || prop.schemaPath || prop.actual_property_name;
            const groupLabel =
              prop.group || prop.section || prop.category || section.title;
            const typeLabel =
              prop.type || prop.value_type || prop.data_type || prop.kind;

            return (
              <div
                key={`${propertyName || "empty-property"}-${index}`}
                className="rounded-[16px] border border-slate-200 bg-white p-4 transition-colors hover:border-slate-300"
              >
                <div className="mb-2 flex flex-wrap items-center gap-2">
                  <h4 className="text-sm font-semibold text-slate-950">
                    {prop.display_name || propertyName}
                  </h4>
                  <span className="rounded-full bg-white px-2 py-0.5 text-[10px] font-bold text-slate-500 ring-1 ring-slate-200">
                    0 samples
                  </span>
                  {groupLabel && (
                    <span className="rounded-full bg-white px-2 py-0.5 text-[10px] font-bold text-[#2d2a7d] ring-1 ring-slate-200">
                      {groupLabel}
                    </span>
                  )}
                  {typeLabel && (
                    <span className="rounded-full bg-white px-2 py-0.5 text-[10px] font-bold text-slate-500 ring-1 ring-slate-200">
                      {typeLabel}
                    </span>
                  )}
                  {prop.enum_values?.length > 0 && (
                    <span className="rounded-full bg-white px-2 py-0.5 text-[10px] font-bold text-slate-500 ring-1 ring-slate-200">
                      {prop.enum_values.length} enum values
                    </span>
                  )}
                </div>
                {prop.description && (
                  <p className="mb-3 text-xs leading-5 text-slate-500">
                    {prop.description}
                  </p>
                )}
                <div className="flex flex-wrap gap-x-4 gap-y-1 text-[10px] font-bold uppercase tracking-[0.18em] text-slate-400">
                  {propertyName && <span>Property: {propertyName}</span>}
                  {schemaPath && <span>Schema path: {schemaPath}</span>}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

interface PropertyAccordionItemProps {
  prop: any;
  isExpanded: boolean;
  onToggle: () => void;
  loadGeoJsonMap: (mapName: string, path: string) => Promise<boolean>;
  registeredMaps: Record<string, boolean>;
}
function PropertyAccordionItem({
  prop,
  isExpanded,
  onToggle,
  loadGeoJsonMap,
  registeredMaps,
}: PropertyAccordionItemProps) {
  const [distributionData, setDistributionData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeSubTab, setActiveSubTab] = useState("by-pathogen");
  const propertyKey =
    prop.property_name ||
    prop.actual_property_name ||
    prop.property ||
    prop.display_name?.toLowerCase().replace(/\s+/g, "_") ||
    prop.name?.toLowerCase().replace(/\s+/g, "_");

  useEffect(() => {
    setDistributionData(null);
    setError(null);
    setActiveSubTab("by-pathogen");
  }, [propertyKey]);

  useEffect(() => {
    if (!isExpanded || distributionData) return;

    setLoading(true);
    setError(null);

    const apiBase =
      process.env.NEXT_PUBLIC_API_BASE_URL || "/api/pathocore/v1";

    fetch(
      `${apiBase}/databrowser/metadata/property-distribution?property=${encodeURIComponent(
        propertyKey
      )}`
    )
      .then((res) => {
        if (!res.ok) {
          throw new Error("Could not load distribution subsections");
        }
        return res.json();
      })
      .then((json) => {
        setDistributionData(json);
        setActiveSubTab("by-pathogen");
      })
      .catch((err) => {
        console.error(err);
        setError(err.message || "Connection error");
      })
      .finally(() => {
        setLoading(false);
      });
  }, [isExpanded, propertyKey, distributionData]);
  const subTabs = [
    { id: "by-pathogen", label: "Pathogen" },
    { id: "by-year", label: "Year" },
    { id: "by-location", label: "Location" },
  ];

  const getActiveChartProps = () => {
    if (!distributionData) {
      return { kind: prop.chart_kind || "bar", values: prop.values || [] };
    }

    const breakdownKey = activeSubTab.replace("by-", "");
    let breakdown = distributionData.breakdowns?.[breakdownKey];

    if (!breakdown) {
      if (breakdownKey === "location" || breakdownKey === "geo_loc_state") {
        breakdown =
          distributionData.location_breakdown?.property_name === breakdownKey
            ? distributionData.location_breakdown
            : distributionData.location_breakdown;
      } else {
        breakdown = distributionData.grouped_breakdowns?.find(
          (b: any) =>
            b.property_name === breakdownKey || b.group_by === breakdownKey
        );
      }
    }
    if (!breakdown) {
      return { kind: "bar", values: [] };
    }
    if (
      breakdownKey === "location" ||
      breakdownKey === "geo_loc_state" ||
      breakdown.chart_kind === "choropleth-map"
    ) {
      const targetValues = breakdown.values || breakdown.breakdown_data || [];
      return {
        kind: "geo",
        values: targetValues.map((item: any) => ({
          ...item,
          geoCode: getGeoCode(item),
          label: item.label || item.state_name || "Unknown",
          value: item.value || item.sample_count || 0,
        })),
      };
    }
    if (breakdown.series && Array.isArray(breakdown.series)) {
      const uniqueLabels = new Set<string>();
      breakdown.series.forEach((s: any) => {
        (s.values || []).forEach((v: any) => uniqueLabels.add(v.label));
      });

      const dataKeys = new Set<string>();
      const valuesMapped = Array.from(uniqueLabels).map((label) => {
        const row: any = { label };
        breakdown.series.forEach((s: any) => {
          const match = (s.values || []).find((v: any) => v.label === label);
          if (match) {
            row[s.label] = match.value;
            dataKeys.add(s.label);
          }
        });
        return row;
      });

      return {
        kind: "stacked-bar",
        values: valuesMapped,
        dataKeys: Array.from(dataKeys),
      };
    }

    const simpleValues = breakdown.values || breakdown.breakdown_data;
    if (simpleValues && Array.isArray(simpleValues)) {
      return {
        kind: "bar",
        values: simpleValues.map((item: any) => ({
          label: item.label || item.group_name || "Unknown",
          value: item.value || item.sample_count || 0,
        })),
      };
    }

    return { kind: "bar", values: [] };
  };

  const currentChart = getActiveChartProps();
  const matchedSamplesCount = distributionData?.matched_samples ?? 1;

  return (
    <div
      className={`group border transition-all overflow-hidden rounded-[24px] ${
        isExpanded
          ? "border-[#bfb7ee] bg-white shadow-md"
          : "border-slate-200 bg-white hover:border-slate-300"
      }`}
    >
      <div className="p-6 cursor-pointer" onClick={onToggle}>
        <div className="flex justify-between items-start">
          <div className="space-y-3">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-lg font-semibold text-slate-950">
                {prop.display_name}
              </span>
              <span className="inline-flex rounded-full bg-[#f1efff] px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-widest text-[#2d2a7d]">
                {(prop.participant_share * 100).toFixed(1)}% Coverage
              </span>
            </div>
            <p className="text-sm text-slate-600 max-w-2xl leading-6">
              {prop.description}
            </p>
          </div>
          <div
            className={`p-2 rounded-full transition-colors ${
              isExpanded
                ? "bg-slate-950 text-white"
                : "bg-slate-50 text-slate-400"
            }`}
          >
            {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          </div>
        </div>
      </div>

      {isExpanded && (
        <div className="px-6 pb-8 animate-in zoom-in-95 duration-300">
          <div className="p-6 bg-slate-50/80 rounded-[20px] border border-slate-200/50">
            {loading ? (
              <div className="flex h-48 items-center justify-center text-sm text-slate-400 font-medium">
                <Loader2 className="w-5 h-5 animate-spin mr-2 text-[#4f46e5]" />
                Loading subsection breakdown...
              </div>
            ) : error ? (
              <div className="flex h-32 flex-col items-center justify-center text-sm text-red-500 font-medium gap-2">
                <AlertCircle className="w-5 h-5" />
                <span>{error}</span>
              </div>
            ) : (
              <div className="w-full space-y-6">
                <div className="flex border-b border-slate-200 pb-2 gap-4">
                  {subTabs.map((subTab: any) => (
                    <button
                      key={subTab.id}
                      onClick={() => setActiveSubTab(subTab.id)}
                      className={`pb-2 text-xs font-bold uppercase tracking-wider transition-all border-b-2 ${
                        activeSubTab === subTab.id
                          ? "border-[#4f46e5] text-[#4f46e5]"
                          : "border-transparent text-slate-400 hover:text-slate-600"
                      }`}
                    >
                      {subTab.label}
                    </button>
                  ))}
                </div>
                <div
                  className={
                    currentChart.kind === "geo" ? "w-full" : "h-64 w-full"
                  }
                >
                  {matchedSamplesCount === 0 ||
                  currentChart.values.length === 0 ? (
                    <div className="h-64 flex items-center justify-center text-xs text-slate-400 italic">
                      No samples available with data for this breakdown.
                    </div>
                  ) : (
                    <ChartRenderer
                      chart_kind={currentChart.kind}
                      values={currentChart.values}
                      dataKeys={(currentChart as any).dataKeys}
                      title={prop.display_name}
                      loadMap={loadGeoJsonMap}
                      isMapRegistered={!!registeredMaps[prop.display_name]}
                      showLocationTable={true}
                    />
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

interface ChartRendererProps {
  values: any[];
  chart_kind: string;
  title?: string;
  layout?: "horizontal" | "vertical";
  loadMap: (mapName: string, path: string) => Promise<boolean>;
  isMapRegistered: boolean;
  dataKeys?: string[];
  showLocationTable?: boolean;
}

function ChartRenderer({
  values,
  chart_kind,
  title = "",
  layout = "horizontal",
  loadMap,
  isMapRegistered,
  dataKeys,
  showLocationTable = false,
}: ChartRendererProps) {
  const chartData = values || [];
  const GRADIENT_COLORS = ["#4f46e5", "#8b5cf6"];
  const colors = [
    "#4f46e5",
    "#8b5cf6",
    // "#818cf8",
    "#2d2a7d",
    "#818cf8",
    "#312e81",
    "#6d28d9",
    "#a78bfa",
  ];

  const normalizedTitle = title.toLowerCase();
  const isGeographicCoverage = normalizedTitle.includes("geographic coverage");
  const isSamplesByRegion =
    normalizedTitle.includes("samples by region") ||
    normalizedTitle.includes("geo_loc_state") ||
    normalizedTitle.includes("location");
  const isExplicitMap =
    chart_kind === "geo" ||
    chart_kind === "map" ||
    chart_kind === "choropleth-map";
  const isAnyMap =
    isExplicitMap ||
    (!showLocationTable && (isGeographicCoverage || isSamplesByRegion));

  useEffect(() => {
    if (isAnyMap && !isMapRegistered) {
      loadMap(title, "/data/spain-communities.geojson");
    }
  }, [isAnyMap, title, isMapRegistered, loadMap]);

  if (isAnyMap) {
    if (!isMapRegistered) {
      return (
        <div className="h-full w-full flex items-center justify-center text-slate-400 text-[10px] uppercase tracking-widest animate-pulse font-bold py-24">
          Loading map layout for {title}...
        </div>
      );
    }
    const officialNamesMap: Record<string, string> = {
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

    const mapSeriesData = chartData.map((item) => {
      const cleanKey = cleanText(item.label);
      const finalCorrectedName = officialNamesMap[cleanKey] || item.label;
      return {
        ...item,
        name: finalCorrectedName,
        value: item.value,
      };
    });
    let maxVal =
      mapSeriesData.length > 0
        ? Math.max(...mapSeriesData.map((o) => o.value))
        : 100;
    if (maxVal <= 0 || !Number.isFinite(maxVal)) {
      maxVal = 100;
    }

    const mapOption = {
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
              <p style="margin: 0; color: #cbd5e1; font-weight: 600; font-size: 11px; text-transform: uppercase; letter-spacing: 0.05em;">${params.name}</p>
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
          name: title,
          type: "map",
          map: title,
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
          data: mapSeriesData,
        },
      ],
    };
    const toFiniteNumber = (value: any, fallback = 0) => {
      const parsed = Number(value);
      return Number.isFinite(parsed) ? parsed : fallback;
    };

    const formatShare = (item: any, matched: number, total: number) => {
      const rawShare =
        item.share ??
        item.participant_share ??
        item.coverage ??
        item.percentage;

      if (typeof rawShare === "string" && rawShare.trim()) {
        return rawShare.includes("%") ? rawShare : `${rawShare}%`;
      }

      if (typeof rawShare === "number" && Number.isFinite(rawShare)) {
        const normalizedShare = rawShare <= 1 ? rawShare * 100 : rawShare;
        return `${normalizedShare.toFixed(1)}%`;
      }

      return total > 0 ? `${((matched / total) * 100).toFixed(1)}%` : "0.0%";
    };

    const tableData = mapSeriesData.map((item) => {
      const matched = toFiniteNumber(
        item.matched ?? item.matched_count ?? item.value ?? item.sample_count
      );
      const total = toFiniteNumber(
        item.total ?? item.total_count ?? item.available_count,
        matched
      );

      return {
        location: item.label || item.state_name || item.name || "Unknown",
        geoCode: item.geoCode || getGeoCode(item),
        matched,
        total,
        share: formatShare(item, matched, total),
      };
    });

    return (
      <div className="w-full flex flex-col gap-6">
        <div className="h-64 w-full">
          <ReactECharts
            option={mapOption}
            style={{ height: "100%", width: "100%" }}
            lazyUpdate={true}
          />
        </div>
        {/* {showLocationTable && isExplicitMap && (
          <LocationDistributionTable data={tableData} />
        )} */}
      </div>
    );
  }

  if (chart_kind === "line") {
    return (
      <div className="h-64 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart
            data={chartData}
            margin={{ top: 10, right: 15, left: -20, bottom: 45 }}
          >
            <defs>
              <linearGradient id="lineGradient" x1="0" y1="0" x2="1" y2="0">
                <stop offset="0%" stopColor={GRADIENT_COLORS[0]} />
                <stop offset="100%" stopColor={GRADIENT_COLORS[1]} />
              </linearGradient>
            </defs>
            <CartesianGrid
              vertical={false}
              strokeDasharray="3 3"
              stroke="#e2e8f0"
            />
            <XAxis
              dataKey="label"
              tick={{ fontSize: 9, fontWeight: 600, fill: "#000" }}
              axisLine={false}
              tickLine={false}
              angle={-45}
              textAnchor="end"
              interval="preserveStartEnd"
            />
            <YAxis
              tick={{ fontSize: 10, fill: "#000" }}
              axisLine={false}
              tickLine={false}
            />
            <RechartsTooltip
              contentStyle={{
                borderRadius: "16px",
                border: "none",
                boxShadow: "0 10px 15px -3px rgb(0 0 0 / 0.1)",
              }}
            />
            <Line
              type="monotone"
              dataKey="value"
              stroke="url(#lineGradient)"
              strokeWidth={3}
              dot={{
                r: 4,
                fill: GRADIENT_COLORS[0],
                stroke: "#fff",
                strokeWidth: 2,
              }}
              activeDot={{ r: 6, strokeWidth: 0 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    );
  }

  if (chart_kind === "pie") {
    const nivoPieData = chartData.map((item, index) => ({
      id: item.label,
      label: item.label,
      value: item.value,
      color: colors[index % colors.length],
    }));
    return (
      <div className="h-64 w-full flex flex-col justify-between pb-2">
        <div className="h-[175px] w-full">
          <ResponsivePie
            data={nivoPieData}
            innerRadius={0.75}
            padAngle={1.5}
            cornerRadius={4}
            activeOuterRadiusOffset={4}
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

        <div className="flex flex-wrap gap-2 mt-4 max-h-[75px] overflow-y-auto no-scrollbar justify-start">
          {nivoPieData.map((item) => (
            <Chip key={item.id} item={item} />
          ))}
        </div>
      </div>
    );
  }
  return (
    <div className="h-64 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={chartData} layout={layout}>
          <defs>
            <linearGradient id="barGradient" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor={GRADIENT_COLORS[0]} />
              <stop offset="100%" stopColor={GRADIENT_COLORS[1]} />
            </linearGradient>
          </defs>
          <CartesianGrid
            vertical={layout === "vertical"}
            horizontal={layout === "horizontal"}
            strokeDasharray="3 3"
            stroke="#e2e8f0"
          />
          {layout === "horizontal" ? (
            <>
              <XAxis
                dataKey="label"
                tick={{ fontSize: 9, fontWeight: 600, fill: "#64748b" }}
                axisLine={false}
                tickLine={false}
                dy={10}
              />
              <YAxis
                tick={{ fontSize: 10, fill: "#000" }}
                axisLine={false}
                tickLine={false}
              />
            </>
          ) : (
            <>
              <XAxis type="number" hide />
              <YAxis
                dataKey="label"
                type="category"
                tick={{ fontSize: 9, fontWeight: 600, fill: "#64748b" }}
                axisLine={false}
                tickLine={false}
                width={100}
              />
            </>
          )}
          <RechartsTooltip
            cursor={{ fill: "#f1f5f9", radius: 8 }}
            contentStyle={{
              borderRadius: "16px",
              border: "none",
              boxShadow: "0 10px 15px -3px rgb(0 0 0 / 0.1)",
            }}
          />

          {chart_kind === "stacked-bar" && (
            <Legend wrapperStyle={{ paddingTop: "10px", fontSize: "12px" }} />
          )}

          {chart_kind === "stacked-bar" && dataKeys && dataKeys.length > 0 ? (
            dataKeys.map((key, index) => (
              <Bar
                key={key}
                dataKey={key}
                name={key}
                stackId="a"
                fill={colors[index % colors.length]}
                radius={[2, 2, 0, 0]}
              />
            ))
          ) : (
            <Bar
              dataKey="value"
              name="Samples"
              fill="url(#barGradient)"
              radius={layout === "horizontal" ? [6, 6, 0, 0] : [0, 6, 6, 0]}
            />
          )}
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
