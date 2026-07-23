"use client"; 

import { useState } from "react";
import { MepramBrowserLayout } from "@/components/mepram/MepramBrowserLayout";
import { Surface } from "@/components/mepram/MepramPrimitives";

import OverviewSamples from "@/components/GenomicData/OverviewSamples";
import SchemaExplorer from "@/components/GenomicData/SchemaExplorer";
import MetadataExplorer from "@/components/GenomicData/MetadataExplorer";
import VariantExplorer from "@/components/GenomicData/VariantExplorer";

export default function GenomicDataPage() {
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

  const renderContent = () => {
    switch (activeSection) {
      case "overview":
        return (
          <OverviewSamples
            activeSection={activeSection}
            setActiveSection={setActiveSection}
          />
        );
      case "schema":
        return (
          <SchemaExplorer
            activeSection={activeSection}
            setActiveSection={setActiveSection}
          />
        );
      case "metadata":
        return (
          <MetadataExplorer
            activeSection={activeSection}
            setActiveSection={setActiveSection}
          />
        );
      case "variant":
        return (
          <VariantExplorer
            activeSection={activeSection}
            setActiveSection={setActiveSection}
          />
        );
      default:
        return null;
    }
  };

  return (
    <MepramBrowserLayout
      title="PathoCore - genomic data"
      description="PathoCore genomic data area to explore samples, schemas, metadata and variants."
      breadcrumbs={[
        { label: "Data browser" },
        {
          label: "Genomic Data",
          onClick: (e) => {
            e?.preventDefault();
            setActiveSection("home");
          },
        },
        activeSection !== "home"
          ? {
              label:
                navigationCards.find((c) => c.id === activeSection)?.title ||
                activeSection,
            }
          : null,
      ].filter(Boolean)}
    >
      {activeSection === "home" ? (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {navigationCards.map((card) => (
            <div
              key={card.id}
              onClick={() => setActiveSection(card.id)}
              className="cursor-pointer group"
            >
              <Surface className="flex flex-col h-full hover:border-[#4f46e5]/40 transition-all border-slate-100/50 border-2 rounded-[24px]">
                <div className="flex justify-between items-start mb-6">
                  <div className="p-3 bg-slate-50 rounded-xl text-xl group-hover:bg-[#4f46e5]/10 transition-colors">
                    {card.icon}
                  </div>
                  <span className="text-[10px] font-bold py-1 px-3 bg-slate-100 rounded-full text-slate-500 uppercase tracking-wider">
                    {card.eyebrow}
                  </span>
                </div>

                <h3 className="text-lg font-semibold text-slate-900 mb-3 tracking-tight">
                  {card.title}
                </h3>
                <p className="text-sm text-slate-500 leading-relaxed mb-6 flex-grow">
                  {card.description}
                </p>

                <div className="flex flex-wrap gap-2 mb-6">
                  {card.tags.map((tag) => (
                    <span
                      key={tag}
                      className="text-[10px] px-2 py-1 bg-slate-50 border border-slate-100 rounded-md text-slate-400 font-medium"
                    >
                      {tag}
                    </span>
                  ))}
                </div>

                <div className="text-sm font-bold text-slate-900 flex items-center gap-2 group-hover:text-[#4f46e5] transition-colors">
                  Open section
                  <span className="transition-transform group-hover:translate-x-1">
                    →
                  </span>
                </div>
              </Surface>
            </div>
          ))}
        </div>
      ) : (
        <div className="space-y-6 animate-in fade-in duration-500">
          <button
            onClick={() => setActiveSection("home")}
            className="text-[10px] font-bold text-slate-400 hover:text-[#4f46e5] flex items-center gap-2 uppercase tracking-widest transition-colors"
          >
            ← Return to Genomic Data menu
          </button>

          {renderContent()}
        </div>
      )}
    </MepramBrowserLayout>
  );
}
