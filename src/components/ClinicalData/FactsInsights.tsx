import { useEffect, useState } from "react";
import { Surface } from "@/components/mepram/MepramPrimitives";
import { Trophy, TrendingUp, Users } from "lucide-react";

const TABS = [
  { id: "cohort", label: "Cohort Overview" },
  { id: "insights", label: "Clinical Insights" },
  { id: "domains", label: "Domains" },
  { id: "measurements", label: "Measurements" },
];

interface FactsInsightsProps {
  activeSection: string;
  setActiveSection: (section: string) => void;
  accessToken: string;
}

export default function FactsInsights({
  activeSection,
  setActiveSection,
  accessToken,
}: FactsInsightsProps) {
  const [facts, setFacts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!accessToken) return;
    const controller = new AbortController();

    fetch("/api/omop/v1/facts/concepts?stratification=age_sex&limit=20", {
      signal: controller.signal,
      headers: { Authorization: `Bearer ${accessToken}` },
    })
      .then((res) => {
        if (!res.ok) throw new Error("Network response was not ok");
        return res.json();
      })
      .then((data) => {
        if (Array.isArray(data) && !controller.signal.aborted) {
          setFacts(data);
          setLoading(false);
        }
      })
      .catch((err) => {
        if (err.name !== "AbortError") {
          console.error("Error fetching insights:", err);
          setLoading(false);
        }
      });

    return () => controller.abort();
  }, [accessToken]);

  if (loading) {
    return (
      <div className="p-20 text-center animate-pulse text-xs font-bold uppercase tracking-widest text-slate-400">
        Analyzing patterns...
      </div>
    );
  }

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

      <div className="max-w-2xl">
        <h2 className="text-2xl font-bold text-slate-900">
          Prevalent Clinical Findings
        </h2>
        <p className="text-sm text-slate-500 mt-2">
          Automatic detection of conditions and measurements with greater impact
          according to demographic stratification.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {facts.slice(0, 6).map((fact, idx) => (
          <Surface
            key={idx}
            className="p-6 border-slate-100 shadow-sm relative overflow-hidden group hover:border-indigo-500/30 transition-all bg-white"
          >
            <div className="flex items-start justify-between">
              <div className="p-3 bg-indigo-50 text-indigo-600 rounded-2xl group-hover:bg-indigo-600 group-hover:text-white transition-all">
                <Trophy className="w-5 h-5" />
              </div>
              <span className="px-2 py-1 bg-slate-100 text-slate-500 rounded text-[9px] font-bold uppercase tracking-tighter">
                {fact.domain_id}
              </span>
            </div>
            <h4 className="font-bold text-slate-900 mt-4 h-12 line-clamp-2 leading-tight">
              {fact.concept_name}
            </h4>

            <div className="mt-6 space-y-3">
              <div className="flex items-center gap-2">
                <Users className="w-3 h-3 text-slate-300" />
                <span className="text-[11px] font-bold text-slate-600">
                  Group: {fact.age_group} · {fact.gender}
                </span>
              </div>
              <div className="flex items-center justify-between pt-2 border-t border-slate-50">
                <p className="text-[10px] font-bold text-slate-400 uppercase">
                  Group Prevalence
                </p>
                <p className="text-sm font-bold text-indigo-600">
                  {fact.patient_pct_group.toFixed(1)}%
                </p>
              </div>
            </div>
            <TrendingUp className="absolute -bottom-2 -right-2 w-16 h-16 text-slate-50 opacity-50 group-hover:text-indigo-500/5 transition-colors" />
          </Surface>
        ))}
      </div>
    </div>
  );
}
