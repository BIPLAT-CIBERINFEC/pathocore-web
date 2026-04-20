import { ArrowRight, FileText, Globe, Mail, ShieldCheck } from "lucide-react";
import { SectionHeader } from "@/components/databrowser/section-header";
import { MepramAlertsBoard } from "@/components/mepram/mepram-alerts-board";
import { MepramPageHeader } from "@/components/mepram/mepram-page-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

const ALERTS_CONTACT_EMAIL =
  import.meta.env.VITE_USE_CASE_ALERTS_CONTACT_EMAIL?.trim() ||
  import.meta.env.VITE_MEPRAM_ALERTS_CONTACT_EMAIL?.trim() ||
  "";

const moderationSteps = [
  {
    description:
      "La señal automática o la notificación externa entra primero en el buzón de administración de la web.",
    step: "Recepción",
  },
  {
    description:
      "El equipo administrador revisa consistencia, trazabilidad y alcance antes de permitir cualquier publicación.",
    step: "Validación",
  },
  {
    description:
      "Solo las alertas validadas pasan al tablón web y, en una fase posterior, a la intranet institucional.",
    step: "Publicación",
  },
];

const resourceLinks = [
  {
    description: "Herramienta externa para exploración interactiva de clusters y filogenia.",
    href: "https://microreact.org/",
    label: "Microreact",
  },
  {
    description: "Referencia general para criterios interpretativos y contexto AMR.",
    href: "https://www.eucast.org/",
    label: "EUCAST",
  },
  {
    description: "Portal institucional europeo con materiales de vigilancia y resistencia.",
    href: "https://www.ecdc.europa.eu/",
    label: "ECDC",
  },
];

const pendingDocuments = [
  "Procedimiento de validación de alertas por administradores.",
  "Criterios de severidad, alcance y publicación pública.",
  "Guía operativa para salto a web e intranet.",
];

export function MepramAlertsPage() {
  return (
    <div className="space-y-6">
      <MepramPageHeader
        currentSection="Alertas vigilancia genómica"
        sectionDescription="Tablón validado de alertas, workflow de revisión y puntos de contacto para señales de vigilancia del caso de uso."
      />

      <Card className="border-white/70 bg-white/88">
        <CardContent className="p-6">
          <SectionHeader
            description="Esta vista está planteada como capa validada de publicación. No debe mostrar señales automáticas en bruto: primero deben llegar al correo de administración, revisarse y solo después aparecer en la web."
            eyebrow="Enfoque"
            title="Alertas de vigilancia genómica"
          />
          <div className="mt-6 flex flex-wrap gap-2">
            <Badge variant="outline">Simulación controlada</Badge>
            <Badge variant="secondary">Solo alertas validadas</Badge>
            <Badge variant="secondary">Preparado para revisión administrativa</Badge>
          </div>
        </CardContent>
      </Card>

      <MepramAlertsBoard />

      <section className="grid gap-5 xl:grid-cols-[1fr_0.95fr]">
        <Card className="border-white/70 bg-white/88">
          <CardContent className="p-6">
            <SectionHeader
              description="Workflow previsto para que la web no publique alertas sin control. La validación administrativa debe ser obligatoria antes de exponer cualquier señal."
              eyebrow="Workflow"
              title="Flujo de validación y publicación"
            />
            <div className="mt-6 grid gap-4">
              {moderationSteps.map((item, index) => (
                <div
                  className="rounded-[1.5rem] border border-slate-200 bg-slate-50/85 p-5"
                  key={item.step}
                >
                  <div className="flex items-start gap-4">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-slate-900 text-sm font-semibold text-white">
                      {index + 1}
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-slate-950">{item.step}</h3>
                      <p className="mt-2 text-sm leading-7 text-slate-600">
                        {item.description}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-6 rounded-[1.5rem] border border-slate-200 bg-slate-950 px-5 py-4 text-sm leading-7 text-slate-200">
              Regla de producto propuesta: una alerta solo puede verse en la web si su estado
              interno es <span className="font-semibold text-white">validated</span>. Más
              adelante, ese mismo estado podrá habilitar también la publicación en la intranet.
            </div>
          </CardContent>
        </Card>

        <div className="grid gap-5">
          <Card className="border-white/70 bg-white/88">
            <CardContent className="p-6">
              <SectionHeader
                description="Canal central para consultas, comunicación de señales o dudas sobre la interpretación de alertas."
                eyebrow="Contacto"
                title="Buzón de alertas"
              />
              <div className="mt-6 rounded-[1.6rem] border border-slate-200 bg-slate-50/85 p-5">
                <div className="flex items-start gap-3">
                  <div className="rounded-[1rem] bg-slate-900 p-3 text-white">
                    <Mail className="h-5 w-5" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs uppercase tracking-[0.18em] text-slate-400">
                      Correo operativo
                    </p>
                    <p className="mt-2 text-lg font-semibold text-slate-950">
                      {ALERTS_CONTACT_EMAIL || "Pendiente de configurar"}
                    </p>
                    <p className="mt-2 text-sm leading-7 text-slate-600">
                      Este buzón debería recibir consultas, posibles alertas y señales para
                      validación administrativa.
                    </p>
                  </div>
                </div>

                <div className="mt-5 flex flex-wrap gap-2">
                  {ALERTS_CONTACT_EMAIL ? (
                    <Button asChild size="sm" variant="outline">
                      <a href={`mailto:${ALERTS_CONTACT_EMAIL}`}>Escribir al buzón</a>
                    </Button>
                  ) : (
                    <Badge variant="outline">
                      Configurar `VITE_USE_CASE_ALERTS_CONTACT_EMAIL`
                    </Badge>
                  )}
                  <Badge variant="secondary">
                    <ShieldCheck className="mr-1.5 h-3.5 w-3.5" />
                    Punto de validación
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-white/70 bg-white/88">
            <CardContent className="p-6">
              <SectionHeader
                description="Sitios de interés y espacio reservado para documentación descargable del caso de uso."
                eyebrow="Recursos"
                title="Documentación y enlaces"
              />
              <div className="mt-6 grid gap-3">
                {resourceLinks.map((item) => (
                  <a
                    className="rounded-[1.35rem] border border-slate-200 bg-slate-50/80 px-4 py-4 transition hover:bg-white"
                    href={item.href}
                    key={item.label}
                    rel="noreferrer"
                    target="_blank"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="text-base font-semibold text-slate-950">{item.label}</p>
                        <p className="mt-2 text-sm leading-6 text-slate-600">
                          {item.description}
                        </p>
                      </div>
                      <div className="rounded-full border border-slate-200 bg-white p-2 text-slate-500">
                        <Globe className="h-4 w-4" />
                      </div>
                    </div>
                  </a>
                ))}
              </div>

              <div className="mt-6 rounded-[1.6rem] border border-dashed border-slate-200 bg-white p-5">
                <div className="flex items-center gap-2">
                  <FileText className="h-4 w-4 text-slate-500" />
                  <p className="text-sm font-semibold text-slate-900">
                    Documentación descargable prevista
                  </p>
                </div>
                <div className="mt-4 grid gap-3">
                  {pendingDocuments.map((item) => (
                    <div
                      className="rounded-[1.15rem] border border-slate-200 bg-slate-50/70 px-4 py-3 text-sm leading-6 text-slate-600"
                      key={item}
                    >
                      <div className="flex items-center justify-between gap-3">
                        <span>{item}</span>
                        <Badge variant="outline">Pendiente</Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      <Card className="border-white/70 bg-white/88">
        <CardContent className="p-6">
          <SectionHeader
            description="Esta sección se ha diseñado como capa de publicación controlada. Cuando exista backend específico, las alertas visibles deberían venir ya filtradas por estado validado."
            eyebrow="Siguiente paso"
            title="Qué necesitará backend después"
          />
          <div className="mt-6 grid gap-3">
            {[
              "Un endpoint de resumen para contar alertas abiertas, críticas y por tipo.",
              "Un endpoint paginado de alertas con estado interno y alcance territorial.",
              "Una cola o estado de validación que permita distinguir señales internas frente a alertas publicadas.",
              "Integración de correo para notificar primero a administradores antes de publicar en web o intranet.",
            ].map((item) => (
              <div
                className="rounded-[1.35rem] border border-slate-200 bg-slate-50 px-4 py-3 text-sm leading-6 text-slate-600"
                key={item}
              >
                <div className="flex items-start gap-3">
                  <ArrowRight className="mt-1 h-4 w-4 shrink-0 text-slate-400" />
                  <span>{item}</span>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
