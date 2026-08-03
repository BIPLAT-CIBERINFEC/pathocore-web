"use client";

import { useState } from "react";
import {
  ClipboardList,
  FlaskConical,
  HeartPulse,
  LayoutGrid,
  Pill,
  Stethoscope,
  Users,
  ChevronLeft,
} from "lucide-react";

import { Surface } from "@/components/mepram/MepramPrimitives";

import CohortOverview from "./CohortOverview";
import DomainDetailView from "./DomainDetailView";
import MeasurementsExplorer from "./MeasurementsExplorer";

const CLINICAL_SECTIONS = [
  {
    id: "cohort",
    label: "Cohort Overview",
    icon: Users,
    iconBg: "bg-indigo-50/60 text-[#4f46e5] group-hover:bg-[#4f46e5]",
    description:
      "General metrics, overall patient distribution, and demographics summary.",
  },
  {
    id: "Condition",
    label: "Condition",
    icon: HeartPulse,
    iconBg: "bg-indigo-50/60 text-[#4f46e5] group-hover:bg-[#4f46e5]",
    description: "OMOP-compatible disease and clinical diagnosis frequencies.",
  },
  {
    id: "Measurement",
    label: "Measurement",
    icon: FlaskConical,
    iconBg: "bg-indigo-50/60 text-[#4f46e5] group-hover:bg-[#4f46e5]",
    description:
      "Laboratory values, vital signs, and structural clinical observations.",
  },
  {
    id: "Procedure",
    label: "Procedure",
    icon: Stethoscope,
    iconBg: "bg-indigo-50/60 text-[#4f46e5] group-hover:bg-[#4f46e5]",
    description: "Medical actions, surgeries, and diagnostic care pathways.",
  },
  {
    id: "Drug",
    label: "Drug",
    icon: Pill,
    iconBg: "bg-indigo-50/60 text-[#4f46e5] group-hover:bg-[#4f46e5]",
    description:
      "Medication exposures, prescriptions, and active ingredient distributions.",
  },
  {
    id: "Observation",
    label: "Observation",
    icon: ClipboardList,
    iconBg: "bg-indigo-50/60 text-[#4f46e5] group-hover:bg-[#4f46e5]",
    description:
      "Clinical facts, qualitative assessments, and general metadata history.",
  },
];

export default function ClinicalDataIndex() {
  const [activeSection, setActiveSection] = useState("home");

  return (
    <div className="space-y-6">
      {activeSection === "home" ? (
        <div className="grid gap-5 md:grid-cols-2 2xl:grid-cols-3 animate-in fade-in duration-300">
          {CLINICAL_SECTIONS.map((card) => {
            const Icon = card.icon;

            return (
              <div
                key={card.id}
                onClick={() => setActiveSection(card.id)}
                className="group flex flex-col justify-between rounded-[24px] border border-slate-100 bg-white p-6 shadow-[0_12px_34px_rgba(45,42,125,0.03)] transition-all duration-300 hover:-translate-y-1 hover:border-[#4f46e5]/30 hover:shadow-[0_20px_44px_rgba(79,70,229,0.08)] cursor-pointer"
              >
                <div>
                  <div
                    className={`mb-4 inline-flex p-3.5 rounded-2xl group-hover:text-white transition-all duration-300 ${card.iconBg}`}
                  >
                    <Icon className="w-5 h-5" />
                  </div>
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-[#f1efff] px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-[#2d2a7d] transition-colors">
                    OMOP Domain
                  </span>
                  <h3 className="mt-3 text-lg font-bold text-slate-800 tracking-tight group-hover:text-[#4f46e5] transition-colors">
                    {card.label}
                  </h3>
                  <p className="mt-2 text-xs leading-relaxed text-slate-500 line-clamp-2">
                    {card.description}
                  </p>
                </div>
                <div className="mt-6 pt-4 border-t border-slate-50 text-xs font-bold text-slate-400 flex items-center gap-1 group-hover:text-[#4f46e5] transition-all">
                  Explore entries
                  <span className="transition-transform group-hover:translate-x-1">
                    →
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="space-y-2 p-6 bg-white border border-slate-200 rounded-[32px] shadow-xs relative z-20 animate-in slide-in-from-bottom-4 duration-300">
          <div className="sticky top-26 z-30 bg-white/95 backdrop-blur-md pt-2 pb-4 border-b border-slate-100 space-y-4 -mx-6 px-6">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <button
                onClick={() => setActiveSection("home")}
                className="text-xs font-bold text-slate-400 hover:text-slate-900 flex items-center gap-1.5 uppercase tracking-wider cursor-pointer transition-colors border-none bg-transparent outline-none group"
              >
                <ChevronLeft className="w-4 h-4 transition-transform group-hover:-translate-x-0.5" />
                Back to Grid View
              </button>
              <span className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-widest bg-slate-50 px-2.5 py-1 rounded-md border border-slate-100">
                Active Scope: {activeSection.toUpperCase()}
              </span>
            </div>

            <div className="overflow-x-auto w-full scrollbar-none pb-0.5">
              <div className="flex items-center gap-2 min-w-max p-1 bg-slate-50/90 border border-slate-100 rounded-2xl shadow-xs">
                <button
                  onClick={() => setActiveSection("home")}
                  className="p-2.5 text-slate-400 hover:text-slate-700 hover:bg-white rounded-xl transition-all cursor-pointer border-none bg-transparent"
                  title="View Dashboard Grid"
                >
                  <LayoutGrid className="w-4 h-4" />
                </button>

                <div className="h-4 w-px bg-slate-200 mx-1" />

                {CLINICAL_SECTIONS.map((tab) => {
                  const isActive = activeSection === tab.id;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveSection(tab.id)}
                      className={`px-4 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer border-none uppercase tracking-wide duration-150 ${
                        isActive
                          ? "bg-[#4f46e5] text-white shadow-sm shadow-indigo-500/20 scale-[1.02]"
                          : "text-slate-500 hover:text-slate-800 hover:bg-white"
                      }`}
                    >
                      {tab.label}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          <div className="pt-4">
            {activeSection === "cohort" ? (
              <CohortOverview
                activeSection={activeSection}
                setActiveSection={setActiveSection}
              />
            ) : activeSection === "Measurement" ? (
              <MeasurementsExplorer
                activeSection={activeSection}
                setActiveSection={setActiveSection}
              />
            ) : (
              <DomainDetailView domainId={activeSection} />
            )}
          </div>
        </div>
      )}
    </div>
  );
}
