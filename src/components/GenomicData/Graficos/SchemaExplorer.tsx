"use client";

import { useEffect, useState } from "react";
import { SectionHeading } from "@/components/mepram/MepramPrimitives";
import { ChevronDown, Search, Info } from "lucide-react";  

export default function SchemaExplorer() {
  const [schemas, setSchemas] = useState<any[]>([]);
  const [openClassifications, setOpenClassifications] = useState<
    Record<string, boolean>
  >({});
  const [collapsedSchemas, setCollapsedSchemas] = useState<
    Record<string, boolean>
  >({});
  const [selectedProperty, setSelectedProperty] = useState<any>(null);
  const [searchTerms, setSearchTerms] = useState<Record<string, string>>({});

  useEffect(() => {
    fetch("/api/v1/databrowser/schema-summary")
      .then((res) => res.json())
      .then((json) => {
        const data = json.schema_cards || [];
        setSchemas(data);
        if (data.length > 0 && data[0].classifications?.length > 0) {
          const firstClass = data[0].classifications[0];
          setOpenClassifications({
            [`${data[0].name}-${firstClass.name}`]: true,
          });
          setSelectedProperty(firstClass.properties[0]);
        }
      });
  }, []);

  const toggleSchema = (name: string) =>
    setCollapsedSchemas((prev) => ({ ...prev, [name]: !prev[name] }));
  const toggleClassification = (s: string, c: string) =>
    setOpenClassifications((prev) => ({
      ...prev,
      [`${s}-${c}`]: !prev[`${s}-${c}`],
    }));

  return (
    <div className="flex flex-col gap-12 mt-12">
      {schemas.map((schema, sIdx) => (
        <div
          key={sIdx}
          className="bg-white rounded-[32px] border border-slate-200 shadow-sm overflow-hidden"
        >
          <div className="p-10 flex justify-between items-center bg-white border-b border-slate-50">
            <div className="space-y-1">
              <span className="text-[10px] font-bold text-[#13776e] uppercase tracking-[0.2em] block mb-2">
                Schema Block
              </span>
              <h2 className="text-4xl font-serif font-medium text-slate-900">
                {schema.name}
              </h2>
              <p className="text-slate-400 text-sm italic">
                Version {schema.version} • Generated{" "}
                {new Date(schema.generated_at).toLocaleDateString()}
              </p>
            </div>

            <div className="flex items-center gap-12">
              <div className="flex gap-12">
                <Stat label="SAMPLES" value={schema.sample_count} />
                <Stat label="PROPERTIES" value={schema.property_count} />
                <Stat label="GROUPS" value={schema.classification_count} />
              </div>
              <button
                onClick={() => toggleSchema(schema.name)}
                className="p-3 hover:bg-slate-50 rounded-full transition-colors border border-slate-100"
              >
                <ChevronDown
                  className={`w-5 h-5 text-slate-400 transition-transform ${
                    collapsedSchemas[schema.name] ? "" : "rotate-180"
                  }`}
                />
              </button>
            </div>
          </div>

          {!collapsedSchemas[schema.name] && (
            <div className="p-8 bg-slate-50/30 space-y-6">
              {schema.classifications.map((cls: any, cIdx: number) => {
                const classKey = `${schema.name}-${cls.name}`;
                const isOpen = openClassifications[classKey];

                return (
                  <div
                    key={cIdx}
                    className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm"
                  >
                    <button
                      onClick={() =>
                        toggleClassification(schema.name, cls.name)
                      }
                      className="w-full p-6 flex justify-between items-center hover:bg-slate-50/50"
                    >
                      <div className="text-left">
                        <h4 className="text-lg font-bold text-slate-800">
                          {cls.name}
                        </h4>
                        <p className="text-xs text-slate-400 mt-1">
                          Explore property labels and schema paths
                        </p>
                      </div>
                      <div className="flex items-center gap-4">
                        <span className="text-[10px] font-bold bg-slate-100 text-slate-500 px-3 py-1 rounded-full">
                          {cls.property_count} PROPS
                        </span>
                        <ChevronDown
                          className={`w-4 h-4 text-slate-300 transition-transform ${
                            isOpen ? "rotate-180" : ""
                          }`}
                        />
                      </div>
                    </button>

                    {isOpen && (
                      <div className="grid lg:grid-cols-[1fr_380px] gap-0 border-t border-slate-100">
                        <div className="p-6 border-r border-slate-100">
                          <div className="flex flex-wrap gap-2 max-h-[400px] overflow-y-auto pr-4">
                            {cls.properties.map((prop: any, pIdx: number) => (
                              <button
                                key={pIdx}
                                onClick={() => setSelectedProperty(prop)}
                                className={`px-4 py-2 rounded-full border text-xs font-medium transition-all
                                   ${
                                     selectedProperty?.path === prop.path
                                       ? "bg-slate-900 border-slate-900 text-white shadow-lg"
                                       : "bg-white border-slate-200 text-slate-600 hover:border-slate-400"
                                   }`}
                              >
                                {prop.label}
                              </button>
                            ))}
                          </div>
                        </div>

                        <div className="p-8 bg-slate-50/50">
                          {selectedProperty ? (
                            <div className="space-y-6 animate-in fade-in duration-300">
                              <div>
                                <span className="text-[9px] font-black bg-[#13776e] text-white px-2 py-0.5 rounded mr-2 uppercase">
                                  {selectedProperty.type}
                                </span>
                                <h5 className="text-xl font-bold text-slate-900 mt-3">
                                  {selectedProperty.label}
                                </h5>
                                <p className="text-sm text-slate-500 mt-3 leading-relaxed">
                                  {selectedProperty.description}
                                </p>
                              </div>
                              <div className="space-y-4 pt-4 border-t border-slate-200/50">
                                <DetailItem
                                  label="Property Key"
                                  value={selectedProperty.path}
                                />
                                <div>
                                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">
                                    Examples
                                  </p>
                                  <div className="flex flex-wrap gap-2">
                                    {selectedProperty.examples.map(
                                      (ex: string, i: number) => (
                                        <code
                                          key={i}
                                          className="text-[10px] bg-white border border-slate-200 px-2 py-1 rounded text-slate-700"
                                        >
                                          {ex}
                                        </code>
                                      )
                                    )}
                                  </div>
                                </div>
                              </div>
                            </div>
                          ) : (
                            <div className="h-full flex flex-col items-center justify-center text-slate-300 italic text-sm">
                              Select a property to inspect
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

function Stat({ label, value }: { label: string; value: any }) {
  return (
    <div className="text-center min-w-[80px]">
      <p className="text-[10px] font-bold text-slate-400 tracking-tighter mb-1">
        {label}
      </p>
      <p className="text-3xl font-serif font-medium text-slate-900">{value}</p>
    </div>
  );
}

function DetailItem({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">
        {label}
      </p>
      <p className="text-xs font-mono text-slate-600 break-all bg-white p-2 rounded border border-slate-100">
        {value}
      </p>
    </div>
  );
}
