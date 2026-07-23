import { useEffect, useState } from "react";
import { Surface } from "@/components/mepram/MepramPrimitives";
import { Database, Search, ChevronRight, X, Info } from "lucide-react";

const TABS = [
  { id: "cohort", label: "Cohort Overview" },
  { id: "insights", label: "Clinical Insights" },
  { id: "domains", label: "Domains" },
  { id: "measurements", label: "Measurements" },
];

interface DomainsExplorerProps {
  activeSection: string;
  setActiveSection: (section: string) => void;
  accessToken: string;
}

export default function DomainsExplorer({
  activeSection,
  setActiveSection,
  accessToken,
}: DomainsExplorerProps) {
  const [domains, setDomains] = useState<any[]>([]);
  const [selectedDomain, setSelectedDomain] = useState<string>("Condition");
  const [concepts, setConcepts] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  const [selectedConceptId, setSelectedConceptId] = useState<number | null>(
    null
  );
  const [conceptDetail, setConceptDetail] = useState<any>(null);
  const [detailLoading, setDetailLoading] = useState(false);

  useEffect(() => {
    if (!accessToken) return;
    const controller = new AbortController();

    fetch("/api/omop/v1/domains", {
      signal: controller.signal,
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
    })
      .then((res) => {
        if (!res.ok) throw new Error("Fetch error");
        return res.json();
      })
      .then((data) => {
        if (Array.isArray(data) && !controller.signal.aborted) {
          setDomains(data);
          setLoading(false);
        }
      })
      .catch((err) => {
        if (err.name !== "AbortError") {
          console.error("Error fetching domains:", err);
          setLoading(false);
        }
      });

    return () => controller.abort();
  }, [accessToken]);

  useEffect(() => {
    if (!selectedDomain || !accessToken) return;
    const controller = new AbortController();

    fetch(`/api/omop/v1/domains/${selectedDomain}/concepts`, {
      signal: controller.signal,
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
    })
      .then((res) => {
        if (!res.ok) throw new Error("Fetch error");
        return res.json();
      })
      .then((data) => {
        if (!controller.signal.aborted) {
          setConcepts(data);
        }
      })
      .catch((err) => {
        if (err.name !== "AbortError")
          console.error("Error fetching concepts:", err);
      });

    return () => controller.abort();
  }, [selectedDomain, accessToken]);

  useEffect(() => {
    if (!selectedConceptId || !accessToken) return;
    const controller = new AbortController();
    setDetailLoading(true);

    fetch(`/api/omop/v1/concepts/${selectedConceptId}/detail`, {
      signal: controller.signal,
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
    })
      .then((res) => {
        if (!res.ok) throw new Error("Fetch error");
        return res.json();
      })
      .then((data) => {
        if (!controller.signal.aborted) {
          setConceptDetail(data);
          setDetailLoading(false);
        }
      })
      .catch((err) => {
        if (err.name !== "AbortError") {
          console.error("Error fetching concept details:", err);
          setDetailLoading(false);
        }
      });

    return () => controller.abort();
  }, [selectedConceptId, accessToken]);

  const filteredConcepts =
    concepts?.data?.filter((c: any) =>
      c.concept_name?.toLowerCase().includes(searchQuery.toLowerCase())
    ) || [];

  if (loading) {
    return (
      <div className="p-20 text-center animate-pulse text-xs font-bold uppercase tracking-widest text-slate-400">
        Loading Clinical Domains...
      </div>
    );
  }

  const safeDomains = Array.isArray(domains) ? domains : [];

  return (
    <div className="space-y-10 animate-in fade-in duration-700">
      <div className="flex flex-wrap items-center gap-2 pb-2">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveSection(tab.id)}
            className={`px-5 py-2 rounded-full text-xs font-medium tracking-wide transition-all border ${
              activeSection === tab.id
                ? "bg-[#0f172a] text-white border-transparent shadow-sm"
                : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50 hover:text-[#8b5cf6]"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 relative">
        <div className="space-y-3">
          {safeDomains.map((d) => (
            <div
              key={d.domain_id}
              onClick={() => setSelectedDomain(d.domain_id)}
              className={`p-4 rounded-2xl cursor-pointer border transition-all ${
                selectedDomain === d.domain_id
                  ? "bg-indigo-600 text-white border-indigo-600 shadow-lg"
                  : "bg-white border-slate-100 hover:border-slate-300"
              }`}
            >
              <div className="flex items-center gap-3">
                <Database className="w-4 h-4 opacity-70" />
                <span className="font-bold text-xs uppercase tracking-wider">
                  {d.domain_id}
                </span>
              </div>
              <p
                className={`text-[10px] mt-2 font-medium ${
                  selectedDomain === d.domain_id
                    ? "text-indigo-100"
                    : "text-slate-400"
                }`}
              >
                {d.medical_concepts?.toLocaleString() || 0} Concepts |{" "}
                {d.participants?.toLocaleString() || 0} Patients
              </p>
            </div>
          ))}
        </div>

        <div className="lg:col-span-3">
          <Surface className="p-0 border-slate-200 shadow-sm bg-white overflow-hidden">
            <div className="p-6 border-b border-slate-50 flex items-center justify-between bg-slate-50/50">
              <h2 className="text-lg font-bold text-slate-800">
                {selectedDomain}
              </h2>
              <div className="relative w-64">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  placeholder="Filter concept..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 border border-slate-200 rounded-xl text-xs outline-none focus:ring-2 focus:ring-indigo-500/20 text-slate-800 bg-white"
                />
              </div>
            </div>

            <div className="max-h-[500px] overflow-y-auto">
              <table className="w-full text-left border-collapse">
                <thead className="sticky top-0 bg-white shadow-sm text-[10px] uppercase font-bold text-slate-400 border-b border-slate-100 z-10">
                  <tr>
                    <th className="p-4 pl-8">Concept</th>
                    <th className="p-4 text-center">Frecuency</th>
                    <th className="p-4 text-center">% Coverage</th>
                    <th className="p-4"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50 text-slate-700">
                  {filteredConcepts.map((row: any) => (
                    <tr
                      key={row.concept_id}
                      className="hover:bg-slate-50 group transition-colors cursor-pointer"
                      onClick={() => setSelectedConceptId(row.concept_id)}
                    >
                      <td className="p-4 pl-8">
                        <p className="font-semibold text-slate-700 text-xs">
                          {row.concept_name}
                        </p>
                        <p className="text-[10px] text-slate-400 font-mono mt-1">
                          {row.vocabulary_id} · {row.concept_code}
                        </p>
                      </td>
                      <td className="p-4 text-center font-bold text-slate-600 text-xs">
                        {row.participants?.toLocaleString() || 0}
                      </td>
                      <td className="p-4 text-center">
                        <div className="flex items-center justify-center gap-2">
                          <div className="w-16 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-indigo-600"
                              style={{ width: `${row.pct || 0}%` }}
                            />
                          </div>
                          <span className="text-[10px] font-bold text-indigo-600">
                            {(row.pct || 0).toFixed(1)}%
                          </span>
                        </div>
                      </td>
                      <td className="p-4 text-right pr-8">
                        <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-indigo-600 transition-colors" />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Surface>
        </div>

        {selectedConceptId && (
          <div className="fixed inset-y-0 right-0 w-[400px] bg-white shadow-2xl z-50 p-8 border-l border-slate-100 animate-in slide-in-from-right duration-300">
            <button
              onClick={() => setSelectedConceptId(null)}
              className="absolute top-6 right-6 p-2 hover:bg-slate-100 rounded-full cursor-pointer transition-colors"
            >
              <X className="w-5 h-5 text-slate-400" />
            </button>

            {detailLoading ? (
              <div className="h-full flex items-center justify-center text-sm font-medium text-slate-400 animate-pulse">
                Loading clinical details...
              </div>
            ) : (
              conceptDetail && (
                <div className="space-y-8 overflow-y-auto h-full pr-2 pb-12">
                  <div>
                    <span className="px-3 py-1 bg-slate-100 text-indigo-600 rounded-full text-[10px] font-bold uppercase tracking-widest">
                      Clinical Detail
                    </span>
                    <h3 className="text-xl font-bold text-slate-900 mt-4 leading-tight">
                      {conceptDetail.concept?.concept_name}
                    </h3>
                    <p className="text-xs text-slate-500 mt-2 font-mono">
                      Vocabulary: {conceptDetail.concept?.vocabulary_id} | ID:{" "}
                      {conceptDetail.concept?.concept_id}
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-4 bg-slate-50 rounded-2xl text-center">
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tight">
                        Cohort Presence
                      </p>
                      <p className="text-xl font-bold text-slate-800 mt-1">
                        {(conceptDetail.summary?.[0]?.patient_pct || 0).toFixed(
                          2
                        )}
                        %
                      </p>
                    </div>
                    <div className="p-4 bg-slate-50 rounded-2xl text-center">
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tight">
                        Records
                      </p>
                      <p className="text-xl font-bold text-slate-800 mt-1">
                        {conceptDetail.summary?.[0]?.record_count?.toLocaleString() ||
                          0}
                      </p>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <p className="text-xs font-bold text-slate-400 uppercase flex items-center gap-2">
                      <Info className="w-3.5 h-3.5 text-indigo-600" /> Age
                      Distribution
                    </p>
                    <div className="space-y-3">
                      {Array.isArray(conceptDetail.by_age) &&
                        conceptDetail.by_age.map((item: any) => (
                          <div key={item.age_group} className="space-y-1">
                            <div className="flex justify-between text-[10px] font-bold">
                              <span className="text-slate-600">
                                {item.age_group} years
                              </span>
                              <span className="text-indigo-600">
                                {(item.patient_pct_group || 0).toFixed(1)}%
                              </span>
                            </div>
                            <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                              <div
                                className="h-full bg-indigo-600 rounded-full"
                                style={{
                                  width: `${item.patient_pct_group || 0}%`,
                                }}
                              />
                            </div>
                          </div>
                        ))}
                    </div>
                  </div>
                </div>
              )
            )}
          </div>
        )}
      </div>
    </div>
  );
}
