import { Database, FileCode2, FolderTree, Layers3 } from "lucide-react";
import { BarChartPanel } from "@/components/databrowser/chart-card";
import { DataStatusPanel } from "@/components/databrowser/data-status-panel";
import { SchemaBlock } from "@/components/databrowser/schema-block";
import { SectionHeader } from "@/components/databrowser/section-header";
import { StatCard } from "@/components/databrowser/stat-card";
import { Card, CardContent } from "@/components/ui/card";
import { useDatabrowser } from "@/hooks/use-databrowser";

const kpiIcons = [FileCode2, FolderTree, Database, Layers3];

export function SchemaPage() {
  const { error, refresh, snapshot, status } = useDatabrowser();

  if (!snapshot) {
    return <DataStatusPanel error={error} onRetry={() => void refresh()} status={status} />;
  }

  return (
    <div className="space-y-6">
      <Card className="surface-shell border-white/70 bg-white/84">
        <CardContent className="px-6 py-8 lg:px-8 lg:py-10">
          <SectionHeader
            description="La vista Schema explora la estructura formal del backend por schema y classification, con bloques colapsables y busqueda de properties del JSON de schema."
            eyebrow="Schema"
            title="Structural organization of the database"
          />
        </CardContent>
      </Card>

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
