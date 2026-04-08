import { Database, FileCode2, FolderTree, Layers3 } from "lucide-react";
import { BarChartPanel } from "@/components/databrowser/chart-card";
import { DataStatusPanel } from "@/components/databrowser/data-status-panel";
import { GenomicPageHeader } from "@/components/databrowser/genomic-page-header";
import { SchemaBlock } from "@/components/databrowser/schema-block";
import { StatCard } from "@/components/databrowser/stat-card";
import { useDatabrowser } from "@/hooks/use-databrowser";

const kpiIcons = [FileCode2, FolderTree, Database, Layers3];

export function SchemaPage() {
  const { error, refresh, snapshot, status } = useDatabrowser();

  if (!snapshot) {
    return <DataStatusPanel error={error} onRetry={() => void refresh()} status={status} />;
  }

  return (
    <div className="space-y-6">
      <GenomicPageHeader
        currentSection="Schema"
        sectionDescription="Explorador estructural del modelo con schemas activos, classifications, propiedades definidas y bloques colapsables para navegar el contenido con más rapidez."
      />

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {snapshot.schema.stats.map((kpi, index) => (
          <StatCard
            key={kpi.label}
            icon={kpiIcons[index % kpiIcons.length]}
            label={kpi.label}
            note={kpi.note}
            value={kpi.value}
          />
        ))}
      </section>

      <section className="grid gap-5 xl:grid-cols-2">
        <BarChartPanel
          data={snapshot.schema.schemaDistribution}
          description="Samples represented by schema"
          title="Distribution by schema"
        />
        <BarChartPanel
          data={snapshot.schema.classificationDistribution}
          description="Property counts grouped by schema classification"
          title="Distribution by classification"
          xAxisLabelMode="diagonal"
        />
      </section>

      <section className="space-y-5">
        {snapshot.schema.schemaCards.map((schemaCard, index) => (
          <SchemaBlock
            defaultOpen={index === 0}
            key={`${schemaCard.name}-${schemaCard.version}`}
            schemaCard={schemaCard}
          />
        ))}
      </section>
    </div>
  );
}
