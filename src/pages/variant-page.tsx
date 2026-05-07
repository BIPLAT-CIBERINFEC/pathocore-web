import { Cpu, Dna, FolderTree, GitBranch } from "lucide-react";
import {
  BarChartPanel,
  LineChartPanel,
  PieChartPanel,
} from "@/components/databrowser/chart-card";
import { DataStatusPanel } from "@/components/databrowser/data-status-panel";
import { GenomicPageHeader } from "@/components/databrowser/genomic-page-header";
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
      <GenomicPageHeader
        currentSection="Variant"
        sectionDescription="Búsqueda de variantes genómicas en formato HGVS, con resumen agregado, filtros y resultados conectados a los endpoints reales de variantes."
      />

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
        filterOptions={snapshot.variant.filterOptions}
        referenceGenomeOptions={snapshot.variant.referenceGenomeOptions}
      />

      <section>
        <BarChartPanel
          data={snapshot.variant.variantSoftware}
          description="Variant calling software visible in the current dataset"
          title="Variant software"
        />
      </section>

      <Card className="border-white/70 bg-white/88">
        <CardContent className="p-6">
          <SectionHeader
            description="Distribucion de clases de impacto agregadas por el backend para el scope público global."
            eyebrow="Impact Classes"
            title="Impact classes"
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
              No impact classes were returned for the public global scope.
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
