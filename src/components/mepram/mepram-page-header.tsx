import { NavLink } from "react-router-dom";
import { Activity, Radar, Siren } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

const mepramNavItems = [
  {
    description: "KPIs y lectura agregada del caso de uso.",
    icon: Radar,
    label: "Datos del caso de uso",
    to: "/use-cases/mepram/data",
  },
  {
    description: "Búsqueda operativa de aislamientos.",
    icon: Activity,
    label: "Isolate explorer",
    to: "/use-cases/mepram/operational-isolate-explorer",
  },
  {
    description: "Capa futura de alertas de vigilancia.",
    icon: Siren,
    label: "Alertas vigilancia genómica",
    to: "/use-cases/mepram/alerts-genomic-surveillance",
  },
];

interface MepramPageHeaderProps {
  currentSection: string;
  sectionDescription: string;
}

export function MepramPageHeader({
  currentSection,
  sectionDescription,
}: MepramPageHeaderProps) {
  return (
    <Card
      className="surface-shell overflow-hidden border-white/70 bg-white/84"
      data-route-scroll-anchor="use-case"
    >
      <CardContent className="px-6 py-8 lg:px-8 lg:py-10">
        <div className="flex flex-col gap-6 xl:flex-row xl:items-start xl:justify-between">
          <div className="max-w-4xl">
            <p className="section-kicker">Casos de uso · Nombre pendiente</p>
            <h1 className="mt-2 text-4xl font-semibold tracking-tight text-slate-950">
              Caso de uso - vigilancia genómica
            </h1>
            <p className="mt-4 text-sm leading-7 text-slate-600">
              Área específica para explorar un caso de uso de vigilancia
              genómica: estado operativo, explorer de aislamientos y futura capa
              de alertas.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Badge variant="strong">Caso de uso específico</Badge>
              <Badge variant="secondary">Vigilancia genómica</Badge>
              <Badge variant="secondary">Nombre pendiente</Badge>
            </div>
          </div>
          <div className="max-w-sm rounded-[1.7rem] bg-slate-950 p-5 text-white shadow-[0_24px_70px_rgba(15,23,42,0.22)]">
            <p className="text-xs uppercase tracking-[0.2em] text-white/60">
              Sección actual
            </p>
            <h2 className="mt-2 text-2xl font-semibold tracking-tight">
              {currentSection}
            </h2>
            <p className="mt-3 text-sm leading-7 text-slate-300">
              {sectionDescription}
            </p>
          </div>
        </div>

        <div className="mt-8 grid gap-3 lg:grid-cols-3">
          {mepramNavItems.map((item) => {
            const Icon = item.icon;

            return (
              <NavLink
                className={({ isActive }) =>
                  cn(
                    "rounded-[1.6rem] border px-5 py-4 transition",
                    isActive
                      ? "border-slate-900 bg-slate-900 text-white"
                      : "border-slate-200 bg-slate-50/85 text-slate-700 hover:bg-white",
                  )
                }
                key={item.to}
                to={item.to}
              >
                <div className="flex items-center gap-3">
                  <div
                    className={cn(
                      "rounded-[1rem] p-3",
                      "bg-white/10 text-current",
                    )}
                  >
                    <Icon className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-base font-semibold">{item.label}</p>
                    <p className="mt-1 text-sm leading-6 text-current/75">
                      {item.description}
                    </p>
                  </div>
                </div>
              </NavLink>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
