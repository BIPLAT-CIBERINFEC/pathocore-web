"use client";

import { useEffect, useState, useMemo } from "react";
import { Surface } from "@/components/mepram/MepramPrimitives";
import {
  Search,
  ChevronDown,
  Info,
  Database,
  Layers,
  FolderGit2,
  FileCode2,
} from "lucide-react";

import ClassificationDistribution from "./Graficos/ClassificationDistribution";
import SchemaDistribution from "./Graficos/SchemaDistribution";

export interface Property {
  label: string;
  type: string;
  path: string;
  description: string;
  examples: string[];
  classification: string;
}

export interface Classification {
  name: string;
  property_count: number;
  properties: Property[];
}

export interface SchemaCard {
  name: string;
  version: string;
  generated_at: string;
  sample_count: number;
  property_count: number;
  classification_count: number;
  classifications: Classification[];
}

export default function SchemaExplorer() {
  const [schemas, setSchemas] = useState<SchemaCard[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [collapsedSchemas, setCollapsedSchemas] = useState<
    Record<string, boolean>
  >({});
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(
    null
  );

  const [classificationDistData, setClassificationDistData] = useState<any[]>(
    []
  );
  const [schemaDistData, setSchemaDistData] = useState<any[]>([]);
const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;
  useEffect(() => {
    setLoading(true);
    fetch(`${baseUrl}/databrowser/schema-summary`)
      .then((res) => {
        if (!res.ok) throw new Error("Error en la API interna");
        return res.json();
      })
      .then((json) => {
        const data = json.schema_cards || (Array.isArray(json) ? json : []);
        setSchemas(data);

        setClassificationDistData(json.classification_distribution || []);
        setSchemaDistData(json.schema_distribution || []);

        if (data.length > 0) {
          const firstSchema = data[0];
          if (firstSchema.classifications?.length > 0) {
            const firstClass = firstSchema.classifications[0];
            if (firstClass.properties?.length > 0) {
              setSelectedProperty(firstClass.properties[0]);
            }
          }
        }
      })
      .catch((err) => {
        console.error("Error cargando el schema:", err);
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  const kpiData = useMemo(() => {
    let totalSamples = 0;
    const uniqueClassifications = new Set<string>();

    schemas.forEach((schema) => {
      totalSamples += schema.sample_count || 0;
      schema.classifications?.forEach((cls) => {
        if (cls.name) {
          uniqueClassifications.add(cls.name);
        }
      });
    });

    return {
      schemasCount: schemas.length,
      samples: totalSamples,
      classificationsCount: uniqueClassifications.size,
    };
  }, [schemas]);

  return (
    <div className="space-y-10 animate-in fade-in duration-700">
      <Surface className="p-8 border border-slate-100/80 bg-slate-50/30 rounded-[24px]">
        <div className="flex items-center gap-2 mb-3">
          <span className="px-3 py-1 bg-[#0f172a] text-white rounded-full text-[10px] font-bold uppercase tracking-wider">
            Current section: Schema
          </span>
        </div>
        <p className="text-sm text-slate-500 max-w-4xl leading-relaxed">
          Detailed exploration of molecular data architecture. Inspects the
          complete hierarchy of validation schemes, structural distributions,
          clinical classifications and dictionaries of defined properties.
        </p>
      </Surface>

      <div className="grid gap-6 grid-cols-1 md:grid-cols-3">
        <Surface className="p-6 border border-slate-100 shadow-sm flex items-center justify-between group hover:border-[#4f46e5]/30 transition-colors">
          <div className="space-y-1">
            <p className="text-xs text-slate-400 font-medium">Active schemas</p>
            <p
              className={`text-4xl font-bold text-slate-900 tracking-tight ${
                loading ? "animate-pulse text-slate-300" : ""
              }`}
            >
              {loading ? "..." : kpiData.schemasCount}
            </p>
            <p className="text-[11px] text-slate-400 pt-1">
              Marked schemas in use in the backend
            </p>
          </div>
          <div className="p-3.5 bg-indigo-50/60 text-[#4f46e5] rounded-2xl group-hover:bg-[#4f46e5] group-hover:text-white transition-all duration-300">
            <FileCode2 className="w-5 h-5" />
          </div>
        </Surface>

        <Surface className="p-6 border border-slate-100 shadow-sm flex items-center justify-between group hover:border-[#8b5cf6]/30 transition-colors">
          <div className="space-y-1">
            <p className="text-xs text-slate-400 font-medium">Samples</p>
            <p
              className={`text-4xl font-bold text-slate-900 tracking-tight ${
                loading ? "animate-pulse text-slate-300" : ""
              }`}
            >
              {loading ? "..." : kpiData.samples}
            </p>
            <p className="text-[11px] text-slate-400 pt-1">
              Added samples for structural view
            </p>
          </div>
          <div className="p-3.5 bg-indigo-50/60 text-[#4f46e5] rounded-2xl group-hover:bg-[#4f46e5] group-hover:text-white transition-all duration-300">
            <FolderGit2 className="w-5 h-5" />
          </div>
        </Surface>

        <Surface className="p-6 border border-slate-100 shadow-sm flex items-center justify-between group hover:border-[#ec4899]/30 transition-colors">
          <div className="space-y-1">
            <p className="text-xs text-slate-400 font-medium">
              Classification types
            </p>
            <p
              className={`text-4xl font-bold text-slate-900 tracking-tight ${
                loading ? "animate-pulse text-slate-300" : ""
              }`}
            >
              {loading ? "..." : kpiData.classificationsCount}
            </p>
            <p className="text-[11px] text-slate-400 pt-1">
              Different classifications present in active schemas
            </p>
          </div>
          <div className="p-3.5 bg-indigo-50/60 text-[#4f46e5] rounded-2xl group-hover:bg-[#4f46e5] group-hover:text-white transition-all duration-300">
            <Database className="w-5 h-5" />
          </div>
        </Surface>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <SchemaDistribution data={schemaDistData} loading={loading} />
        <ClassificationDistribution
          data={classificationDistData}
          loading={loading}
        />
      </div>

      <div className="pt-4 border-t border-slate-100">
        <h3 className="text-[10px] font-bold text-[#2d2a7d] uppercase tracking-[0.2em]">
          Data Dictionary
        </h3>
        <p className="text-xs text-slate-500">
          Explore the hierarchy of properties and defined types.
        </p>
      </div>

      <div className="space-y-6">
        {loading ? (
          <div className="p-20 text-center text-slate-400 animate-pulse font-bold tracking-widest text-[10px] uppercase">
            Loading data architecture...
          </div>
        ) : (
          schemas.map((schema, sIdx) => (
            <Surface
              key={sIdx}
              className="p-0 overflow-hidden border-slate-200 shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="p-6 lg:p-8 flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 bg-white border-b border-slate-50">
                <div className="flex items-center gap-5">
                  <div className="p-4 bg-gradient-to-br from-[#4f46e5]/10 to-[#8b5cf6]/10 rounded-2xl text-[#4f46e5]">
                    <Database className="w-6 h-6" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-semibold tracking-tight text-slate-900">
                      {schema.name}
                    </h2>
                    <div className="flex items-center gap-3 mt-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                      <span className="bg-slate-100 px-2 py-0.5 rounded text-slate-500">
                        v{schema.version}
                      </span>
                      <span>•</span>
                      <span>{schema.sample_count} Samples</span>
                      <span>•</span>
                      <span>{schema.property_count} Properties</span>
                    </div>
                  </div>
                </div>
                <button
                  onClick={() =>
                    setCollapsedSchemas((p) => ({
                      ...p,
                      [schema.name]: !p[schema.name],
                    }))
                  }
                  className="p-3 hover:bg-slate-50 rounded-xl transition-colors border border-transparent hover:border-slate-100"
                >
                  <ChevronDown
                    className={`w-5 h-5 text-slate-400 transition-transform duration-300 ${
                      collapsedSchemas[schema.name] ? "" : "rotate-180"
                    }`}
                  />
                </button>
              </div>

              {!collapsedSchemas[schema.name] && (
                <div className="p-4 lg:p-6 bg-slate-50/30 space-y-6">
                  {schema.classifications.map((cls, cIdx) => (
                    <ClassificationBlock
                      key={`${schema.name}-${cls.name}-${cIdx}`}
                      schema={schema}
                      cls={cls}
                      selectedProperty={selectedProperty}
                      setSelectedProperty={setSelectedProperty}
                    />
                  ))}
                </div>
              )}
            </Surface>
          ))
        )}
      </div>
    </div>
  );
}


interface ClassificationBlockProps {
  schema: SchemaCard;
  cls: Classification;
  selectedProperty: Property | null;
  setSelectedProperty: (prop: Property | null) => void;
}

function ClassificationBlock({
  cls,
  selectedProperty,
  setSelectedProperty,
}: ClassificationBlockProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [localSearch, setLocalSearch] = useState("");

  const filteredProperties = useMemo(() => {
    if (!localSearch) return cls.properties;
    const query = localSearch.toLowerCase();
    return cls.properties.filter(
      (prop) =>
        prop.label.toLowerCase().includes(query) ||
        prop.path.toLowerCase().includes(query)
    );
  }, [cls.properties, localSearch]);

  return (
    <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden transition-all duration-200">
      <div
        onClick={() => setIsOpen(!isOpen)}
        className="p-5 border-b border-slate-100 flex items-center justify-between gap-4 bg-slate-50/50 cursor-pointer hover:bg-slate-50 select-none"
      >
        <div className="flex items-center gap-3">
          <div className="p-2 bg-indigo-50 text-[#4f46e5] rounded-lg">
            <Layers className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-base font-bold text-slate-900 font-sans">
              {cls.name}
            </h4>
            <p className="text-xs text-slate-500 mt-0.5">
              Explore property labels, descriptions, schema paths and
              enumerations for this classification.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <span className="px-2.5 py-1 bg-slate-100 text-slate-600 text-xs font-semibold rounded-full">
            {cls.properties.length} properties
          </span>
          <ChevronDown
            className={`w-4 h-4 text-slate-400 transition-transform duration-300 ${
              isOpen ? "rotate-180" : ""
            }`}
          />
        </div>
      </div>

      {isOpen && (
        <div className="p-5 flex flex-col gap-4 border-t border-slate-100 animate-in slide-in-from-top-1 duration-200">
          <div className="relative w-full">
            <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 pointer-events-none text-slate-400">
              <Search className="w-4 h-4" />
            </span>
            <input
              type="text"
              placeholder={`Search ${cls.name} properties`}
              value={localSearch}
              onChange={(e) => {
                setLocalSearch(e.target.value);
                const matches = cls.properties.filter(
                  (p) =>
                    p.label
                      .toLowerCase()
                      .includes(e.target.value.toLowerCase()) ||
                    p.path.toLowerCase().includes(e.target.value.toLowerCase())
                );
                if (
                  matches.length > 0 &&
                  !matches.some((m) => m.path === selectedProperty?.path)
                ) {
                  setSelectedProperty(matches[0]);
                }
              }}
              className="w-full pl-11 pr-4 py-2.5 bg-slate-50 hover:bg-slate-100/70 focus:bg-white border border-slate-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 rounded-xl text-xs transition-all outline-none text-slate-800 placeholder-slate-400"
            />
          </div>

          <div className="text-[10px] font-bold tracking-wider text-slate-400 flex items-center gap-1.5 px-0.5 uppercase">
            <Info className="w-3.5 h-3.5" />
            HOVER CHIPS FOR QUICK CONTEXT. CLICK ONE TO INSPECT THE FULL SCHEMA
            DATA.
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start mt-1">
            <div className="lg:col-span-7 border border-slate-200/80 rounded-xl p-4 bg-slate-50/30 max-h-[380px] overflow-y-auto flex flex-wrap gap-2.5 content-start">
              {filteredProperties.length > 0 ? (
                filteredProperties.map((prop, pIdx) => {
                  const isSelected = selectedProperty?.path === prop.path;
                  return (
                    <button
                      key={pIdx}
                      onClick={() => setSelectedProperty(prop)}
                      className={`inline-flex items-center gap-2 px-3.5 py-2 text-xs font-bold rounded-xl border transition-all ${
                        isSelected
                          ? "bg-[#4f46e5] border-[#4f46e5] text-white shadow-lg shadow-indigo-100 scale-[1.01]"
                          : "bg-white border-slate-200 text-slate-500 hover:border-[#bfb7ee] hover:text-[#4f46e5]"
                      }`}
                    >
                      <span>{prop.label}</span>
                      <span
                        className={`text-[9px] px-1.5 py-0.5 rounded font-mono font-bold ${
                          isSelected
                            ? "bg-slate-900/30 text-indigo-50"
                            : "bg-slate-100 text-slate-400"
                        }`}
                      >
                        {prop.type}
                      </span>
                    </button>
                  );
                })
              ) : (
                <div className="w-full py-8 text-center text-xs text-slate-400 font-medium">
                  No properties matched your search.
                </div>
              )}
            </div>

            <div className="lg:col-span-5 bg-white border border-slate-200 rounded-xl p-6 shadow-sm min-h-[320px] flex flex-col justify-between">
              {selectedProperty ? (
                <div className="flex flex-col gap-4">
                  <div className="flex flex-wrap gap-2">
                    <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold font-mono bg-slate-900 text-white uppercase tracking-wider">
                      {selectedProperty.type}
                    </span>
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded text-xs font-medium bg-slate-100 text-slate-600">
                      {selectedProperty.classification || cls.name}
                    </span>
                  </div>

                  <div>
                    <h3 className="text-xl font-bold text-slate-950 font-serif tracking-tight">
                      {selectedProperty.label}
                    </h3>
                    <p className="text-xs text-slate-500 mt-2 leading-relaxed">
                      {selectedProperty.description ||
                        `No description provided for ${selectedProperty.label}.`}
                    </p>
                  </div>

                  <div className="flex flex-col gap-3 pt-3 border-t border-slate-100">
                    <div>
                      <span className="block text-[9px] font-bold text-slate-400 uppercase tracking-widest">
                        PROPERTY KEY
                      </span>
                      <div className="text-xs bg-slate-50 text-slate-600 px-3 py-2 rounded-xl border border-slate-200/60 block mt-1 break-all font-mono">
                        {selectedProperty.path.split(".").pop() ||
                          selectedProperty.path}
                      </div>
                    </div>
                    <div>
                      <span className="block text-[9px] font-bold text-slate-400 uppercase tracking-widest">
                        SCHEMA PATH
                      </span>
                      <div className="text-xs bg-slate-50 text-slate-600 px-3 py-2 rounded-xl border border-slate-200/60 block mt-1 break-all font-mono">
                        {selectedProperty.path}
                      </div>
                    </div>
                  </div>

                  {selectedProperty.examples &&
                    selectedProperty.examples.length > 0 && (
                      <div className="pt-1">
                        <span className="block text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">
                          EXAMPLES
                        </span>
                        <div className="flex flex-wrap gap-1.5">
                          {selectedProperty.examples.map((ex, exIdx) => (
                            <span
                              key={exIdx}
                              className="inline-block text-[11px] bg-slate-100/80 text-slate-700 font-mono px-2.5 py-1 rounded-lg border border-slate-200"
                            >
                              {String(ex)}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                </div>
              ) : (
                <div className="h-full flex flex-col items-center justify-center text-slate-400 gap-2 py-12">
                  <Info className="w-6 h-6" />
                  <p className="text-xs font-medium">
                    Select a property chip to view its details
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
