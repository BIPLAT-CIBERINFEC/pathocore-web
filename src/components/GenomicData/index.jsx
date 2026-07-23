"use client";

import { useState } from "react";
import { BarChart3, Database, Dna, FlaskConical } from "lucide-react";
import { Surface } from "@/components/mepram/MepramPrimitives";

import OverviewSamples from "@/components/GenomicData/OverviewSamples";
import SchemaExplorer from "@/components/GenomicData/SchemaExplorer";
import MetadataExplorer from "@/components/GenomicData/MetadataExplorer";
import VariantExplorer from "@/components/GenomicData/VariantExplorer";

const TABS = [
  { id: "overview", label: "Overview" },
  { id: "schema", label: "Schema" },
  { id: "metadata", label: "Metadata" },
  { id: "variant", label: "Variant" },
];

const CARD_ICON_STYLES = {
  overview: {
    icon: FlaskConical,
    iconBg: "bg-indigo-50/60 text-[#4f46e5] group-hover:bg-[#4f46e5]",
  },
  schema: {
    icon: Database,
    iconBg: "bg-indigo-50/60 text-[#4f46e5] group-hover:bg-[#4f46e5]",
  },
  metadata: {
    icon: BarChart3,
    iconBg: "bg-indigo-50/60 text-[#4f46e5] group-hover:bg-[#4f46e5]",
  },
  variant: {
    icon: Dna,
    iconBg: "bg-indigo-50/60 text-[#4f46e5] group-hover:bg-[#4f46e5]",
  },
};

export default function GenomicDataIndex() {
  const [activeSection, setActiveSection] = useState("home");

  const navigationCards = [
    {
      id: "overview",
      title: "Overview of Samples",
      eyebrow: "48 samples",
      description:
        "Overview of samples, temporal evolution, pathogens, regions and distribution by schema.",
      icon: "🔬",
      tags: ["Samples", "Growth", "Coverage"],
    },
    {
      id: "schema",
      title: "Schema",
      eyebrow: "2 schemas",
      description:
        "Explorer of active schemas, classifications and properties defined in the data model.",
      icon: "🗂️",
      tags: ["Schemas", "Projects", "Classification"],
    },
    {
      id: "metadata",
      title: "Metadata",
      eyebrow: "15 priority properties",
      description:
        "Aggregated sample, bioinformatics, and host properties with filters by schema and distributions.",
      icon: "📊",
      tags: ["Sample metadata", "Bioinfo", "Host"],
    },
    {
      id: "variant",
      title: "Variant",
      eyebrow: "30.4 mil variant observations",
      description:
        "Reference genomes, variant counts and HGVS search connected to the real API.",
      icon: "🧬",
      tags: ["Reference genomes", "Variants", "Projects"],
    },
  ];

  const handleCardClick = (id) => {
    setActiveSection(id);
  };

  return (
    <div className="w-full relative z-10 my-6">
      {activeSection === "home" ? (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {navigationCards.map((card) => {
            const iconConfig = CARD_ICON_STYLES[card.id];
            const Icon = iconConfig.icon;

            return (
              <div
                key={card.id}
                className="flex flex-col h-full border border-slate-200 hover:border-[#4f46e5]/30 transition-all duration-200 cursor-pointer p-5 bg-white rounded-2xl group select-none shadow-xs hover:-translate-y-0.5"
                onClick={() => handleCardClick(card.id)}
              >
                <div className="flex justify-between items-start mb-6 pointer-events-none">
                  <div
                    className={`p-3.5 rounded-2xl group-hover:text-white transition-all duration-300 ${iconConfig.iconBg}`}
                  >
                    <Icon className="w-5 h-5" />
                  </div>
                  <span className="text-[10px] font-bold py-1 px-3 bg-slate-100 rounded-full text-slate-500 uppercase tracking-wider">
                    {card.eyebrow}
                  </span>
                </div>

                <h3 className="text-xl font-bold text-slate-900 mb-3 font-serif pointer-events-none">
                  {card.title}
                </h3>

                <p className="text-sm text-slate-500 leading-relaxed mb-6 flex-grow pointer-events-none">
                  {card.description}
                </p>

                <div className="flex flex-wrap gap-2 mb-6 pointer-events-none">
                  {card.tags.map((tag) => (
                    <span
                      key={tag}
                      className="text-[10px] px-2 py-1 bg-[#f1efff] border border-indigo-100 rounded-md text-[#2d2a7d] font-medium"
                    >
                      {tag}
                    </span>
                  ))}
                </div>

                <div className="text-sm font-bold text-slate-900 flex items-center gap-2 group-hover:text-[#4f46e5] mt-auto pointer-events-none">
                  Open section{" "}
                  <span className="transition-transform group-hover:translate-x-1">
                    →
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="p-6 bg-white border border-slate-200 rounded-[32px] shadow-xs relative z-20">
          <div className="sticky top-30 z-50 bg-white/95 backdrop-blur-md pt-6 pb-5 -mt-6 -mx-6 px-6 border-b border-slate-100 rounded-t-[32px] mb-6 shadow-sm">
            <button
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                setActiveSection("home");
              }}
              className="mb-4 text-xs font-bold text-slate-400 hover:text-slate-900 flex items-center gap-2 uppercase tracking-widest cursor-pointer transition-colors"
            >
              ← Close the genomic menu
            </button>

            <div className="flex flex-wrap items-center gap-2">
              {TABS.map((tab) => {
                const isActive = activeSection === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveSection(tab.id)}
                    className={`px-5 py-2 rounded-full text-xs font-medium tracking-wide transition-all border ${
                      isActive
                        ? "bg-[#0f172a] text-white border-transparent shadow-sm"
                        : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50 hover:border-indigo-200 hover:text-[#4f46e5]"
                    }`}
                  >
                    {tab.label}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="pb-2">
            {activeSection === "overview" && <OverviewSamples />}
            {activeSection === "schema" && <SchemaExplorer />}
            {activeSection === "metadata" && <MetadataExplorer />}
            {activeSection === "variant" && <VariantExplorer />}
          </div>
        </div>
      )}
    </div>
  );
}
