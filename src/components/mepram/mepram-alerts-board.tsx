import { AlertTriangle, Bell, Radar, ShieldCheck, Siren } from "lucide-react";
import { SectionHeader } from "@/components/databrowser/section-header";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { formatDateTime } from "@/lib/format";

type AlertLevel = "critical" | "monitor" | "priority";
type AlertScope = "local" | "national" | "regional";

interface MepramAlertItem {
  affectedCenters: number;
  affectedRegions: string[];
  affectedSamples: number;
  carbapenemase: string;
  description: string;
  detectedAt: string;
  id: string;
  level: AlertLevel;
  pathogen: string;
  publishedAt: string;
  scope: AlertScope;
  sequenceType: string;
  title: string;
}

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
    description: "Señal prioritaria con impacto multi-centro o rápida expansión.",
    icon: Siren,
    label: "Crítica",
  },
  monitor: {
    accentClassName: "border-sky-300 bg-sky-50/90",
    badgeClassName: "border-sky-200 bg-sky-100 text-sky-900",
    description: "Señal en observación, todavía sin evidencia de expansión.",
    icon: Radar,
    label: "Monitorización",
  },
  priority: {
    accentClassName: "border-amber-300 bg-amber-50/90",
    badgeClassName: "border-amber-200 bg-amber-100 text-amber-900",
    description: "Señal relevante que requiere revisión rápida.",
    icon: AlertTriangle,
    label: "Prioritaria",
  },
};

const SCOPE_META: Record<
  AlertScope,
  {
    description: string;
    label: string;
  }
> = {
  local: {
    description: "Impacto limitado a un centro o un entorno asistencial concreto.",
    label: "Local",
  },
  national: {
    description: "Señal con implicación multi-región o lectura coordinada nacional.",
    label: "Nacional",
  },
  regional: {
    description: "Señal con expansión o repetición dentro de una comunidad autónoma.",
    label: "Regional",
  },
};

const VALIDATED_ALERTS: MepramAlertItem[] = [
  {
    affectedCenters: 4,
    affectedRegions: ["Comunidad de Madrid", "Castilla-La Mancha"],
    affectedSamples: 18,
    carbapenemase: "KPC-3",
    description:
      "Incremento sostenido de K. pneumoniae ST307 con patrón KPC-3 y señales compatibles con expansión intercentro en un periodo corto.",
    detectedAt: "2026-04-09T09:20:00Z",
    id: "MEP-ALT-001",
    level: "critical",
    pathogen: "K. pneumoniae",
    publishedAt: "2026-04-11T12:00:00Z",
    scope: "regional",
    sequenceType: "ST307",
    title: "Expansión reciente de ST307 con KPC-3",
  },
  {
    affectedCenters: 2,
    affectedRegions: ["Cataluña"],
    affectedSamples: 7,
    carbapenemase: "NDM-5",
    description:
      "Aumento de aislamientos de E. coli con NDM-5 en hospitales terciarios, aún acotado pero con repetición suficiente para seguimiento.",
    detectedAt: "2026-04-06T15:45:00Z",
    id: "MEP-ALT-002",
    level: "priority",
    pathogen: "E. coli",
    publishedAt: "2026-04-08T10:30:00Z",
    scope: "local",
    sequenceType: "ST131",
    title: "Señal NDM-5 en E. coli hospitalaria",
  },
  {
    affectedCenters: 3,
    affectedRegions: ["Galicia", "País Vasco", "Andalucía"],
    affectedSamples: 11,
    carbapenemase: "VIM-1",
    description:
      "Detección intermitente de Enterobacterales con VIM-1 en distintas regiones. La señal está validada, pero se mantiene en fase de observación.",
    detectedAt: "2026-04-03T08:10:00Z",
    id: "MEP-ALT-003",
    level: "monitor",
    pathogen: "E. cloacae",
    publishedAt: "2026-04-05T11:20:00Z",
    scope: "national",
    sequenceType: "ST78",
    title: "Apariciones dispersas de VIM-1 en Enterobacterales",
  },
];

export function MepramAlertsBoard() {
  const totals = {
    critical: VALIDATED_ALERTS.filter((alert) => alert.level === "critical").length,
    monitor: VALIDATED_ALERTS.filter((alert) => alert.level === "monitor").length,
    priority: VALIDATED_ALERTS.filter((alert) => alert.level === "priority").length,
  };

  return (
    <Card className="border-white/70 bg-white/88">
      <CardHeader>
        <SectionHeader
          action={<Badge variant="secondary">{VALIDATED_ALERTS.length} alertas visibles</Badge>}
          description="Tablón de alertas validadas para la capa pública de MEPRAM. La publicación final debe ocurrir solo después de la revisión administrativa por correo y la validación manual del equipo responsable."
          eyebrow="Alertas"
          title="Tablón de alertas validadas"
        />
      </CardHeader>
      <CardContent className="grid gap-5 pt-0 xl:grid-cols-[1.25fr_0.75fr]">
        <div className="grid gap-4">
          {VALIDATED_ALERTS.map((alert) => {
            const level = LEVEL_META[alert.level];
            const scope = SCOPE_META[alert.scope];
            const Icon = level.icon;

            return (
              <article
                className={`rounded-[1.65rem] border p-5 ${level.accentClassName}`}
                key={alert.id}
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="space-y-2">
                    <div className="flex flex-wrap gap-2">
                      <Badge className={level.badgeClassName} variant="outline">
                        <Icon className="mr-1.5 h-3.5 w-3.5" />
                        {level.label}
                      </Badge>
                      <Badge variant="outline">{scope.label}</Badge>
                      <Badge variant="outline">
                        <ShieldCheck className="mr-1.5 h-3.5 w-3.5" />
                        Validada
                      </Badge>
                    </div>
                    <h3 className="text-2xl font-semibold tracking-tight text-slate-950">
                      {alert.title}
                    </h3>
                    <p className="text-sm leading-7 text-slate-700">{alert.description}</p>
                  </div>
                  <div className="rounded-[1.15rem] border border-white/70 bg-white/80 px-4 py-3 text-right">
                    <p className="text-xs uppercase tracking-[0.18em] text-slate-400">
                      Publicada
                    </p>
                    <p className="mt-2 text-sm font-medium text-slate-900">
                      {formatDateTime(alert.publishedAt)}
                    </p>
                  </div>
                </div>

                <div className="mt-5 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
                  <AlertMetric label="Patógeno" value={alert.pathogen} />
                  <AlertMetric label="ST" value={alert.sequenceType} />
                  <AlertMetric label="Carbapenemasa" value={alert.carbapenemase} />
                  <AlertMetric label="Muestras afectadas" value={String(alert.affectedSamples)} />
                </div>

                <div className="mt-4 flex flex-wrap gap-2">
                  {alert.affectedRegions.map((region) => (
                    <Badge key={`${alert.id}-${region}`} variant="outline">
                      {region}
                    </Badge>
                  ))}
                </div>

                <div className="mt-4 flex flex-wrap items-center justify-between gap-3 text-sm text-slate-600">
                  <span>{scope.description}</span>
                  <span>{alert.affectedCenters} centros implicados</span>
                </div>
              </article>
            );
          })}
        </div>

        <div className="space-y-4">
          <div className="rounded-[1.65rem] border border-slate-200 bg-slate-50/90 p-5">
            <p className="text-xs uppercase tracking-[0.18em] text-slate-400">
              Cómo leer el tablón
            </p>
            <div className="mt-4 grid gap-3">
              {(
                [
                  ["monitor", totals.monitor],
                  ["priority", totals.priority],
                  ["critical", totals.critical],
                ] as const
              ).map(([levelKey, total]) => {
                const level = LEVEL_META[levelKey];
                const Icon = level.icon;

                return (
                  <div
                    className={`rounded-[1.15rem] border px-4 py-3 ${level.accentClassName}`}
                    key={levelKey}
                  >
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex items-center gap-2">
                        <Icon className="h-4 w-4 text-slate-900" />
                        <span className="font-medium text-slate-900">{level.label}</span>
                      </div>
                      <span className="text-sm text-slate-700">{total}</span>
                    </div>
                    <p className="mt-2 text-sm leading-6 text-slate-600">
                      {level.description}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="rounded-[1.65rem] border border-slate-200 bg-white p-5">
            <p className="text-xs uppercase tracking-[0.18em] text-slate-400">
              Alcance de la alerta
            </p>
            <div className="mt-4 grid gap-3">
              {Object.entries(SCOPE_META).map(([scopeKey, scope]) => (
                <div
                  className="rounded-[1.15rem] border border-slate-200 bg-slate-50/70 px-4 py-3"
                  key={scopeKey}
                >
                  <div className="flex items-center gap-2">
                    <Bell className="h-4 w-4 text-slate-500" />
                    <span className="font-medium text-slate-900">{scope.label}</span>
                  </div>
                  <p className="mt-2 text-sm leading-6 text-slate-600">
                    {scope.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function AlertMetric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-[1.15rem] border border-white/80 bg-white/80 px-4 py-3">
      <p className="text-xs uppercase tracking-[0.18em] text-slate-400">{label}</p>
      <p className="mt-2 text-sm font-medium text-slate-900">{value}</p>
    </div>
  );
}
