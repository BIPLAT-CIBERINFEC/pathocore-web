import Link from "next/link";
import { useRouter } from "next/router";
import { Activity, Radar, Siren } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Surface } from "@/components/mepram/MepramPrimitives";
import { cn } from "@/lib/utils";

const mepramNavItems = [
  {
    id: "data",
    description: "KPIs and aggregate reading of the use case.",
    icon: Radar,
    label: "Use case data",
  },
  {
    id: "explorer",
    description: "Operational search for isolation.",
    icon: Activity,
    label: "Isolate explorer",
  },
  {
    id: "alerts",
    description: "Future layer of surveillance alerts.",
    icon: Siren,
    label: "Genomic surveillance alerts",
  },
];

export function MepramPageHeader({ currentSection, sectionDescription }: any) {
  const router = useRouter();

  const currentActiveSection = router.query.section || "data";

  return (
    <Surface
      className="overflow-hidden border border-slate-100 p-8 lg:p-10 animate-in fade-in duration-700"
      data-route-scroll-anchor="use-case"
    >
      <div className="flex flex-col gap-6 xl:flex-row xl:items-start xl:justify-between">
        {/* <div className="max-w-4xl">
          <p className="text-xs uppercase tracking-[0.2em] text-slate-400 font-semibold">
            Use cases 
          </p>
          <h1 className="mt-2 text-4xl font-semibold tracking-tight text-slate-950">
            Use case - genomic surveillance
          </h1>
          <p className="mt-4 text-sm leading-7 text-slate-500 max-w-2xl">
            Specific area to explore a genomic surveillance use case:
            operational status, isolation explorer and future alert layer.
          </p>
          <div className="mt-6 flex flex-wrap gap-2">
            <Badge
              variant="strong"
              className="rounded-full bg-[#0f172a] text-white px-3 py-1 text-[10px]"
            >
              Specific use case
            </Badge>
            <Badge
              variant="secondary"
              className="rounded-full bg-slate-100 text-slate-600 px-3 py-1 text-[10px]"
            >
              Genomic surveillance
            </Badge>
            <Badge
              variant="secondary"
              className="rounded-full bg-slate-100 text-slate-600 px-3 py-1 text-[10px]"
            >
              Pending name
            </Badge>
          </div>
        </div> */}

        {/* <div className="max-w-sm w-full rounded-[24px] bg-[#0f172a] p-6 text-white shadow-[0_24px_70px_rgba(15,23,42,0.22)]">
          <p className="text-[10px] uppercase tracking-[0.2em] text-white/60 font-bold">
            Current section
          </p>
          <h2 className="mt-2 text-2xl font-semibold tracking-tight">
            {currentSection}
          </h2>
          <p className="mt-3 text-sm leading-relaxed text-slate-300">
            {sectionDescription}
          </p>
        </div> */}
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        {mepramNavItems.map((item) => {
          const Icon = item.icon;

          const isActive = currentActiveSection === item.id;

          return (
            <Link
              key={item.id}
              href={{
                pathname: "/use-cases/mepram",
                query: { section: item.id },
              }}
              shallow={true}
              className={cn(
                "rounded-[24px] border p-5 transition-all group shadow-sm flex flex-col justify-between",
                isActive
                  ? "border-transparent bg-[#4D45E1] text-white shadow-md"
                  : "border-slate-100 bg-slate-50/40 text-slate-700 hover:bg-white hover:border-indigo-200"
              )}
            >
              <div className="flex items-start gap-4">
                <div
                  className={cn(
                    "rounded-2xl p-3 shrink-0 transition-colors duration-300",
                    isActive
                      ? "bg-white/10 text-white"
                      : "bg-indigo-50/60 text-[#4f46e5] group-hover:bg-[#4f46e5] group-hover:text-white"
                  )}
                >
                  <Icon className="h-5 w-5" />
                </div>
                <div>
                  <p
                    className={cn(
                      "text-sm font-semibold tracking-tight",
                      isActive
                        ? "text-white"
                        : "text-slate-900 group-hover:text-[#4f46e5]"
                    )}
                  >
                    {item.label}
                  </p>
                  <p
                    className={cn(
                      "mt-2 text-xs leading-relaxed",
                      isActive ? "text-slate-300" : "text-slate-400"
                    )}
                  >
                    {item.description}
                  </p>
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    </Surface>
  );
}
