import {
  Activity,
  Building2,
  Microscope,
  MapPinned,
} from "lucide-react";
import {
  LineChartPanel,
  PieChartPanel,
} from "@/components/databrowser/chart-card";
import { DataStatusPanel } from "@/components/databrowser/data-status-panel";
import { SectionHeader } from "@/components/databrowser/section-header";
import { StatCard } from "@/components/databrowser/stat-card";
import { MepramPageHeader } from "@/components/mepram/mepram-page-header";
import { MultiSeriesBarPanel } from "@/components/mepram/multi-series-bar-panel";
import { TerritorialCoverageMap } from "@/components/mepram/territorial-coverage-map";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { useMepram } from "@/hooks/use-mepram";

const statIcons = [Microscope, Activity, MapPinned, Building2];

export function MepramDataPage() {
  const { error, refresh, snapshot, status } = useMepram();

  if (!snapshot) {
    return <DataStatusPanel error={error} onRetry={() => void refresh()} status={status} />;
  }

  return (
    <div className="space-y-6">
      <MepramPageHeader
        currentSection="Datos del caso de uso"
        sectionDescription="Lectura rápida del estado del caso de uso con métricas básicas, resultados agregados y paneles de interés para vigilancia."
      />

      <Card className="border-white/70 bg-white/88">
        <CardContent className="p-6">
          <SectionHeader
            description="Indicadores básicos para saber cuántas muestras y centros están ya dentro de la capa visible del caso de uso."
            eyebrow="Indicadores"
            title="Estado operativo del caso de uso"
          />
          <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {snapshot.overview.kpis.map((kpi, index) => (
              <StatCard
                key={kpi.label}
                icon={statIcons[index % statIcons.length]}
                label={kpi.label}
                note={kpi.note}
                value={kpi.value}
              />
            ))}
          </div>
        </CardContent>
      </Card>

      <Card className="border-white/70 bg-white/88">
        <CardContent className="p-6">
          <SectionHeader
            description="Snapshot específico del caso de uso orientado a investigadores de vigilancia. Cuando la API no expone todavía patógenos o genes de resistencia agregados, la UI lo marca como simulación."
            eyebrow="Datos y resultados"
            title="Panorama de vigilancia del caso de uso"
          />
          <div className="mt-6 flex flex-wrap gap-2">
            {snapshot.overview.pathogenDistributionSimulated ||
            snapshot.overview.specimenSourcesSimulated ||
            snapshot.overview.territorialCoverageSimulated ? (
              <Badge variant="outline">Incluye paneles simulados</Badge>
            ) : null}
            <Badge variant="secondary">Snapshot del caso de uso</Badge>
          </div>
        </CardContent>
      </Card>

      <section className="grid gap-5 xl:grid-cols-[0.9fr_1.1fr]">
        <PieChartPanel
          data={snapshot.overview.projectPathogenDistribution}
          description="Distribución de patógenos de interés en el caso de uso. Si backend no expone organism/species, se muestra una simulación controlada."
          title="Distribución de patógenos"
        />
        <MultiSeriesBarPanel
          chart={snapshot.overview.annualPathogenSeries}
          description="Volumen anual de muestras agrupadas por patógeno para lectura de tendencias del caso de uso."
          title="Muestras anuales agrupadas por patógeno"
        />
      </section>

      <section className="grid gap-5 xl:grid-cols-1">
        <MultiSeriesBarPanel
          chart={snapshot.overview.resistanceSignalsSeries}
          description="Distribución anual de carbapenemasas o genes de resistencia predominantes agrupados por muestra."
          stacked
          title="Top genes de resistencia anualmente agrupados por patógeno"
          valueSuffix="%"
        />
      </section>

      <section className="grid gap-5 xl:grid-cols-[0.9fr_1.1fr]">
        <PieChartPanel
          data={snapshot.overview.specimenSources}
          description="Distribución de las muestras por specimen_source según los valores almacenados en metadata."
          title="Distribución por origen de muestra"
        />
        <LineChartPanel
          data={snapshot.overview.collectionTimeline}
          description="Serie temporal real de aislamientos usando sample_collection_date."
          title="Aislamientos por fecha de recogida"
        />
      </section>

      <TerritorialCoverageMap
        description="Mapa territorial de cobertura con hover y caja descriptiva. Ahora mismo se muestra como simulación controlada hasta disponer del agregado geográfico completo de vigilancia."
        regions={snapshot.overview.territorialCoverage}
        simulated={snapshot.overview.territorialCoverageSimulated}
        title="Cobertura territorial"
      />

      <Card className="border-white/70 bg-white/88">
        <CardContent className="p-6">
          <SectionHeader
            description="Notas para interpretar correctamente qué parte del snapshot viene hoy de la API y qué parte se está simulando a la espera de nuevos endpoints."
            eyebrow="Notas"
            title="Estado de integración"
          />
          <div className="mt-6 grid gap-3">
            {snapshot.overview.notes.map((note) => (
              <div
                key={note}
                className="rounded-[1.35rem] border border-slate-200 bg-slate-50 px-4 py-3 text-sm leading-6 text-slate-600"
              >
                {note}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
