import { Cpu, Dna, FolderTree, GitBranch } from "lucide-react";
import {
  BarChartPanel,
  LineChartPanel,
  PieChartPanel,
} from "@/components/databrowser/chart-card";
import { DataStatusPanel } from "@/components/databrowser/data-status-panel";
import { SectionHeader } from "@/components/databrowser/section-header";
import { StatCard } from "@/components/databrowser/stat-card";
import { VariantSearchPanel } from "@/components/databrowser/variant-search-panel";
import { Card, CardContent } from "@/components/ui/card";
import { useDatabrowser } from "@/hooks/use-databrowser";

const statIcons = [GitBranch, Dna, Cpu, FolderTree];

export function VariantPage() {
  const { error, refresh, snapshot, status } = useDatabrowser();

  if (!snapshot) {
    return <DataStatusPanel error={error} onRetry={() => void refresh()} status={status} />;
  }

  return (
    <div className="space-y-6">
      <Card className="surface-shell border-white/70 bg-white/84">
        <CardContent className="px-6 py-8 lg:px-8 lg:py-10">
          <SectionHeader
            description="Primera version funcional de Variant conectada a la API real. Se muestran genomas de referencia, recuentos agregados y cobertura por proyecto. Las clases de impacto quedan preparadas, no inventadas."
            eyebrow="Variant"
            title="Reference genomes and variant landscape"
          />
        </CardContent>
      </Card>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {snapshot.variant.stats.map((kpi, index) => (
          <StatCard
            key={kpi.label}
            icon={statIcons[index % statIcons.length]}
            label={kpi.label}
            note={kpi.note}
            value={kpi.value}
          />
        ))}
      </section>

      <section className="grid gap-5 xl:grid-cols-2">
        <PieChartPanel
          data={snapshot.variant.referenceGenomes}
          description="Reference genome accessions observed in current variant-enabled samples"
          title="Reference genomes"
        />
        <LineChartPanel
          data={snapshot.variant.variantCounts}
          description="Samples distributed by number_of_variants_in_consensus values"
          title="Variant counts"
        />
      </section>

      <VariantSearchPanel
        referenceOptions={snapshot.variant.referenceOptions}
        rows={snapshot.variant.searchRows}
      />

      <section className="grid gap-5 xl:grid-cols-2">
        <BarChartPanel
          data={snapshot.variant.variantSoftware}
          description="Variant calling software visible in the current dataset"
          title="Variant software"
        />
        <BarChartPanel
          data={snapshot.variant.projectCoverage}
          description="Projects with at least one sample carrying variant metrics"
          title="Projects with variants"
        />
      </section>

      <Card className="border-white/70 bg-white/88">
        <CardContent className="p-6">
          <SectionHeader
            description="La tarjeta queda lista para incorporar clases de impacto cuando el backend publique una agregacion especifica o metadata per-variant usable."
            eyebrow="Impact Classes"
            title="Prepared for the next backend step"
          />
          {snapshot.variant.impactClassesAvailable ? (
            <div className="mt-6">
              <BarChartPanel
                data={snapshot.variant.impactClasses}
                description="Current impact class distribution"
                title="Impact classes"
              />
            </div>
          ) : (
            <div className="mt-6 rounded-[1.6rem] border border-dashed border-slate-200 bg-slate-50 px-6 py-8 text-sm leading-7 text-slate-600">
              The current API does not expose variant annotations grouped by impact class
              such as `LOW`, `MODERATE` or `HIGH`. This panel is intentionally left in a
              ready state pending a dedicated aggregated endpoint or a per-variant data
              source.
            </div>
          )}
          <div className="mt-6 grid gap-3">
            {snapshot.variant.notes.map((note) => (
              <div
                key={note}
                className="rounded-[1.3rem] border border-slate-200 bg-white px-4 py-3 text-sm leading-6 text-slate-500"
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
