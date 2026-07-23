import { useRouter } from "next/router";
import { MepramBrowserLayout } from "@/components/mepram/MepramBrowserLayout";
import { Surface } from "@/components/mepram/MepramPrimitives";
import { Activity, Radar, Siren } from "lucide-react";

import { MepramDataPage } from "@/components/UseCases/Mepram/MepramDataPage";
import { MepramExplorer } from "@/components/UseCases/Mepram/MepramExplorer";
import { MepramAlertsBoard } from "@/components/UseCases/Mepram/MepramAlertsBoard";
import { ProtectedRoute } from "@/components/ProtectedRoute";

export default function MepramUseCasePage() {
  const router = useRouter();

  const activeSection = router.query.section || "home";

  const setActiveSection = (section) => {
    router.push(
      {
        pathname: router.pathname,
        query: { section },
      },
      undefined,
      { shallow: true }
    );
  };

  const navigationCards = [
    {
      id: "data",
      title: "Use case data",
      eyebrow: "Metrics",
      description:
        "Quick overview of the use case status with basic metrics, aggregated results, and dashboards.",
      icon: <Radar className="h-6 w-6 text-slate-700" />,
    },
    {
      id: "explorer",
      title: "Isolate explorer",
      eyebrow: "Search",
      description:
        "Operational search for isolates with filters and territorial distribution maps.",
      icon: <Activity className="h-6 w-6 text-slate-700" />,
    },
    {
      id: "alerts",
      title: "Genomic surveillance alerts",
      eyebrow: "Protected",
      description:
        "Surveillance alert layer. Requires authorization to access this sensitive information.",
      icon: <Siren className="h-6 w-6 text-slate-700" />,
    },
  ];

  return (
    <MepramBrowserLayout
      title="PathoCore - Mepram Use Case"
      description="Data and genomic surveillance area for the Mepram use case."
      breadcrumbs={[
        { label: "Use Cases" },
        { label: "Mepram", onClick: () => setActiveSection("home") },
        activeSection !== "home"
          ? {
              label:
                activeSection === "data"
                  ? "Use Case Data"
                  : activeSection === "explorer"
                  ? "Isolate Explorer"
                  : "Alerts",
            }
          : null,
      ].filter(Boolean)}
    >
      {activeSection === "home" ? (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {navigationCards.map((card) => (
            <Surface
              key={card.id}
              className="flex flex-col h-full hover:border-[#4f46e5]/40 transition-all border-slate-100/50 border-2 rounded-[24px] p-0 overflow-hidden cursor-pointer group"
            >
              <div
                className="p-6 flex flex-col h-full w-full text-left select-none"
                onClick={() => setActiveSection(card.id)}
              >
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

                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setActiveSection(card.id);
                  }}
                  className="text-sm font-bold text-slate-900 flex items-center gap-2 group-hover:text-[#4f46e5] transition-colors"
                >
                  Open section{" "}
                  <span className="transition-transform group-hover:translate-x-1">
                    →
                  </span>
                </button>
              </div>
            </Surface>
          ))}
        </div>
      ) : (
        <div className="space-y-8">
          <button
            onClick={() => setActiveSection("home")}
            className="mb-4 text-xs font-bold text-slate-400 hover:text-slate-900 flex items-center gap-2 uppercase tracking-widest"
          >
            ← Back to menu
          </button>

          {activeSection === "data" && <MepramDataPage />}
          {activeSection === "explorer" && <MepramExplorer />}

          {activeSection === "alerts" && (
            <ProtectedRoute>
              <MepramAlertsBoard />
            </ProtectedRoute>
          )}
        </div>
      )}
    </MepramBrowserLayout>
  );
}
