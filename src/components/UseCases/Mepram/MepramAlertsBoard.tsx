import { useAuth } from "hooks/use-auth";
import { AlertTriangle, Bell, Radar, ShieldCheck, Siren } from "lucide-react";
import { Surface, SectionHeading } from "@/components/mepram/MepramPrimitives";

type AlertLevel = "critical" | "monitor" | "priority";
type AlertScope = "local" | "national" | "regional";

const LEVEL_META: Record<
  AlertLevel,
  {
    accentClassName: string;
    badgeClassName: string;
    description: string;
    icon: typeof Siren;
    label: string;
  }
> = {
  critical: {
    accentClassName: "border-violet-300 bg-violet-50/90",
    badgeClassName: "border-violet-200 bg-violet-100 text-violet-900",
    description:
      "Señal prioritaria con impacto multi-centro o rápida expansión.",
    icon: Siren,
    label: "Crítica",
  },
  monitor: {
    accentClassName: "border-sky-300 bg-sky-50/90",
    badgeClassName: "border-sky-200 bg-sky-100 text-sky-900",
    description: "Aislamiento de interés bajo seguimiento.",
    icon: Radar,
    label: "Monitor",
  },
  priority: {
    accentClassName: "border-amber-300 bg-amber-50/90",
    badgeClassName: "border-amber-200 bg-amber-100 text-amber-900",
    description: "Alerta de atención primaria.",
    icon: AlertTriangle,
    label: "Prioridad",
  },
};

const SCOPE_META: Record<
  AlertScope,
  {
    label: string;
    description: string;
  }
> = {
  local: {
    label: "Local",
    description: "Afecta a un único centro hospitalario.",
  },
  regional: {
    label: "Regional",
    description: "Múltiples centros en la misma región.",
  },
  national: {
    label: "Nacional",
    description: "Expansión en múltiples regiones.",
  },
};

export function MepramAlertsBoard() {
  const { login, accessToken } = useAuth();

  // if (!accessToken) {
  //   return (
  //     <Surface className="flex flex-col items-center py-16 p-6">
  //       <ShieldCheck className="h-16 w-16 text-slate-300 mb-6" />

  //       <SectionHeading
  //         title="Acceso restringido"
  //         description="La información de vigilancia genómica y alertas epidemiológicas es confidencial y requiere autorización."
  //       />

  //       <button
  //         onClick={() => {
  //           if (typeof login === "function") {
  //             void login();
  //           } else {
  //             console.error(
  //               "The 'login' method is not available in the useAuth hook."
  //             );
  //           }
  //         }}
  //         className="mt-8 rounded-xl bg-slate-900 px-8 py-3.5 text-sm font-bold text-white hover:bg-slate-800 transition-colors shadow-sm"
  //       >
  //         Iniciar sesión con Keycloak
  //       </button>
  //     </Surface>
  //   );
  // }

  return (
    <div className="space-y-6">
      <Surface className="p-6">    

        <div className="flex min-h-[500px] flex-col items-center justify-center text-center">
          <Bell className="h-16 w-16 text-slate-300" />

          <SectionHeading
            eyebrow="COMING SOON"
            title="Genomic Surveillance Dashboard"
            description="This feature is currently under development and will be available in a future release."
          />

          <div className="mt-6 max-w-xl rounded-[1.4rem] border border-slate-200 bg-slate-50 px-6 py-5">
            <p className="text-sm font-semibold text-slate-700">
              🚧 Feature in Progress
            </p>

            <p className="mt-2 text-sm leading-6 text-slate-500">
              We are currently working on the integration of genomic
              surveillance alerts, monitoring tools, and epidemiological
              notifications.
            </p>
          </div>
        </div>

        {/* ===============================
            ORIGINAL COMPONENT
           ===============================

        <SectionHeading
          eyebrow="Alertas"
          title="Tablero de Vigilancia Genómica"
          description="Bienvenido. Tienes acceso al registro de alertas y señales genómicas activas."
        />

        <div className="mt-8 grid gap-6 lg:grid-cols-[1fr_320px]">
          <div className="space-y-4">
            <div className="flex h-[260px] items-center justify-center rounded-[1.4rem] border border-dashed border-slate-200 bg-slate-50 px-6 text-center">
              <div>
                <AlertTriangle className="mx-auto h-5 w-5 text-slate-400" />

                <p className="mt-3 text-sm font-medium text-slate-700">
                  Sistema en conexión
                </p>

                <p className="mt-1 text-xs leading-5 text-slate-500">
                  Conectando a la API de alertas usando el token de sesión
                  seguro.
                </p>
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div className="rounded-[1.65rem] border border-slate-200 bg-white p-5">
              <p className="text-xs uppercase tracking-[0.18em] text-slate-400">
                Niveles de Alerta
              </p>

              <div className="mt-4 grid gap-3">
                {Object.entries(LEVEL_META).map(([key, level]) => (
                  <div
                    key={key}
                    className={`rounded-[1.15rem] border px-4 py-3 ${level.accentClassName}`}
                  >
                    <div className="flex items-center gap-2">
                      <level.icon className="h-4 w-4" />

                      <span className="font-medium text-slate-900">
                        {level.label}
                      </span>
                    </div>

                    <p className="mt-2 text-sm text-slate-700">
                      {level.description}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        ================================= */}
      </Surface>
    </div>
  );
}
