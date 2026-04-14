import { SectionHeader } from "@/components/databrowser/section-header";
import { MepramExplorer } from "@/components/mepram/mepram-explorer";
import { MepramPageHeader } from "@/components/mepram/mepram-page-header";
import { DataStatusPanel } from "@/components/databrowser/data-status-panel";
import { Card, CardContent } from "@/components/ui/card";
import { useMepram } from "@/hooks/use-mepram";

export function MepramExplorerPage() {
  const { error, refresh, snapshot, status } = useMepram();

  if (!snapshot) {
    return <DataStatusPanel error={error} onRetry={() => void refresh()} status={status} />;
  }

  return (
    <div className="space-y-6">
      <MepramPageHeader
        currentSection="Operational isolate explorer"
        sectionDescription="Capa de trabajo operativo para buscar, filtrar y revisar aislamientos del proyecto en una tabla accionable."
      />

      <Card className="border-white/70 bg-white/88">
        <CardContent className="p-6">
          <SectionHeader
            description="Explorer específico para analistas del proyecto con cuatro filtros operativos visibles, capa geográfica enlazada con la tabla y un bloque avanzado para fechas, plataforma y perfil de resistencia."
            eyebrow="Explorer"
            title="Operational isolate explorer"
          />
        </CardContent>
      </Card>

      <MepramExplorer explorer={snapshot.explorer} />

      <Card className="border-white/70 bg-white/88" id="mepram-endpoints">
        <CardContent className="p-6">
          <SectionHeader
            description="Puntos concretos que necesita la API para convertir este explorer en una herramienta completa de vigilancia."
            eyebrow="API gaps"
            title="Pendientes para la siguiente iteración"
          />
          <div className="mt-6 grid gap-3">
            {snapshot.integrationGaps.map((gap) => (
              <div
                key={gap}
                className="rounded-[1.35rem] border border-slate-200 bg-slate-50 px-4 py-3 text-sm leading-6 text-slate-600"
              >
                {gap}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
