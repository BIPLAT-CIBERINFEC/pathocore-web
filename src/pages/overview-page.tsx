import { FileCode2, FlaskConical, FolderTree, Layers3 } from "lucide-react";
import { AreaChartPanel, BarChartPanel, PieChartPanel } from "@/components/databrowser/chart-card";
import { DataStatusPanel } from "@/components/databrowser/data-status-panel";
import { GenomicPageHeader } from "@/components/databrowser/genomic-page-header";
import { SectionHeader } from "@/components/databrowser/section-header";
import { StatCard } from "@/components/databrowser/stat-card";
import { Card, CardContent } from "@/components/ui/card";
import { useDatabrowser } from "@/hooks/use-databrowser";

const kpiIcons = [FlaskConical, FolderTree, FileCode2, Layers3];

export function OverviewPage() {
  const { error, refresh, snapshot, status } = useDatabrowser();

  if (!snapshot) {
    return <DataStatusPanel error={error} onRetry={() => void refresh()} status={status} />;
  }

  return (
    <div className="space-y-6">
      <GenomicPageHeader
        currentSection="Overview"
        sectionDescription="Resumen agregado del contenido de muestras visible en PathoCore, con crecimiento temporal, distribución de patógenos, cobertura geográfica y mezcla de schemas."
      />

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {snapshot.overview.kpis.map((kpi, index) => (
          <StatCard
            key={kpi.label}
            icon={kpiIcons[index % kpiIcons.length]}
            label={kpi.label}
            note={kpi.note}
            value={kpi.value}
          />
        ))}
      </section>

      <section className="grid gap-5 xl:grid-cols-[1.3fr_1fr]">
        <AreaChartPanel
          data={snapshot.overview.sampleGrowth}
          description="Temporal growth of samples using collection date when present"
          title="Sample growth over time"
        />
        <PieChartPanel
          data={snapshot.overview.pathogens}
          description="Pathogen distribution from flat organism fields currently exposed by the API"
          title="Pathogen distribution"
        />
      </section>

      <section className="grid gap-5 xl:grid-cols-[1.3fr_1fr]">
        <BarChartPanel
          data={snapshot.overview.geography}
          description="Coverage by region using geo_loc_state and institution-level fallbacks"
          title="Geographic coverage"
        />
        <PieChartPanel
          data={snapshot.overview.schemaMix}
          description="How the visible dataset is distributed across active schemas"
          title="Samples by schema"
        />
      </section>

      <Card className="border-white/70 bg-white/88">
        <CardContent className="p-6">
          <SectionHeader
            description="Notas metodologicas del overview para que la lectura de las cifras no pierda trazabilidad."
            eyebrow="Method Notes"
            title="How this panel is being computed"
          />
          <div className="mt-6 grid gap-3">
            {[...snapshot.overview.notes, ...snapshot.overview.coverageNotes].map((note) => (
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
