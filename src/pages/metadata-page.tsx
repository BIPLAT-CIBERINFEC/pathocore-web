import { useState } from "react";
import {
  ChevronDown,
  ChevronUp,
  Cpu,
  FlaskConical,
  ScanLine,
  SlidersHorizontal,
  UserRound,
} from "lucide-react";
import {
  BarChartPanel,
  LineChartPanel,
  PieChartPanel,
} from "@/components/databrowser/chart-card";
import { DataStatusPanel } from "@/components/databrowser/data-status-panel";
import { GenomicPageHeader } from "@/components/databrowser/genomic-page-header";
import { PropertyAccordionCard } from "@/components/databrowser/property-accordion-card";
import { SectionHeader } from "@/components/databrowser/section-header";
import { StatCard } from "@/components/databrowser/stat-card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useDatabrowser } from "@/hooks/use-databrowser";
import type { PropertyDistributionCard } from "@/types/databrowser";

const statIcons = [FlaskConical, ScanLine, Cpu, UserRound];

function propertyHasSamples(property: PropertyDistributionCard) {
  return property.participantCount > 0 || property.values.some((item) => item.value > 0);
}

function ZeroSamplePropertiesGroup({
  properties,
}: {
  properties: PropertyDistributionCard[];
}) {
  const [open, setOpen] = useState(false);

  if (properties.length === 0) {
    return null;
  }

  return (
    <Card className="border-dashed border-slate-200 bg-slate-50/85 shadow-none">
      <CardContent className="p-5">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="text-lg font-semibold text-slate-950">
                More properties with 0 samples
              </h3>
              <Badge variant="secondary">{properties.length} properties</Badge>
              <Badge variant="outline">schema only</Badge>
            </div>
            <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-500">
              Estas properties están registradas en los schemas visibles, pero no tienen
              muestras con valores en el resumen actual. Se listan para trazabilidad del
              modelo y no cargan gráficos ni distribuciones.
            </p>
          </div>
          <Button onClick={() => setOpen((value) => !value)} variant="outline">
            {open ? "Hide properties" : "Show properties"}
            {open ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
          </Button>
        </div>

        {open ? (
          <div className="mt-5 grid gap-3">
            {properties.map((property) => (
              <div
                className="rounded-[1.25rem] border border-slate-200 bg-white px-4 py-3"
                key={`${property.schemaPath ?? property.propertyName}-${property.propertyName}`}
              >
                <div className="flex flex-wrap items-center gap-2">
                  <p className="font-semibold text-slate-950">{property.displayName}</p>
                  <Badge variant="outline">0 samples</Badge>
                  {property.classification ? (
                    <Badge variant="outline">{property.classification}</Badge>
                  ) : null}
                  {property.schemaType ? (
                    <Badge variant="outline">{property.schemaType}</Badge>
                  ) : null}
                  {(property.enumValues ?? []).length > 0 ? (
                    <Badge variant="outline">
                      {property.enumValues?.length} enum values
                    </Badge>
                  ) : null}
                </div>
                <p className="mt-2 text-sm leading-6 text-slate-500">
                  {property.description}
                </p>
                <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs font-medium uppercase tracking-[0.2em] text-slate-400">
                  <span>Property: {property.propertyName}</span>
                  {property.schemaPath ? <span>Schema path: {property.schemaPath}</span> : null}
                </div>
              </div>
            ))}
          </div>
        ) : null}
      </CardContent>
    </Card>
  );
}

function MetadataSchemaFilter() {
  return (
    <Card className="border-white/70 bg-white/88">
      <CardContent className="p-6">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <div className="flex items-center gap-2">
              <SlidersHorizontal className="h-4 w-4 text-slate-400" />
              <p className="section-kicker">Schema Scope</p>
            </div>
            <h2 className="mt-2 text-2xl font-semibold text-slate-950">
              Filter metadata properties by schema
            </h2>
            <p className="mt-3 max-w-3xl text-sm leading-7 text-slate-500">
              El databrowser genérico muestra una lectura pública y global. El scope
              visible es siempre `All schemas`, independientemente de que existan
              sesiones activas para zonas privadas.
            </p>
          </div>
          <Badge variant="strong">All schemas</Badge>
        </div>
        <div className="mt-5 flex flex-wrap gap-2">
          <Badge variant="secondary">Global database snapshot</Badge>
          <Badge variant="outline">No project scope</Badge>
        </div>
      </CardContent>
    </Card>
  );
}

export function MetadataPage() {
  const { error, refresh, snapshot, status } = useDatabrowser();

  if (!snapshot) {
    return <DataStatusPanel error={error} onRetry={() => void refresh()} status={status} />;
  }

  return (
    <div className="space-y-6">
      <GenomicPageHeader
        currentSection="Metadata"
        sectionDescription="Vista centrada en sample metadata, sample bioinfo y host information, con filtros por schema y propiedades desplegables sobre datos agregados reales."
      />

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {snapshot.metadata.stats.map((kpi, index) => (
          <StatCard
            key={kpi.label}
            icon={statIcons[index % statIcons.length]}
            label={kpi.label}
            note={kpi.note}
            value={kpi.value}
          />
        ))}
      </section>

      <MetadataSchemaFilter />

      <Card className="border-white/70 bg-white/88">
        <CardContent className="p-6">
          <SectionHeader
            description="Cada pestaña mezcla panel superior con graficos agregados y una lista desplegable de properties registradas en los schemas visibles."
            eyebrow="Sections"
            title="Metadata subsections"
          />
          <Tabs className="mt-6" defaultValue={snapshot.metadata.sections[0]?.id}>
            <TabsList>
              {snapshot.metadata.sections.map((section) => (
                <TabsTrigger key={section.id} value={section.id}>
                  {section.title}
                </TabsTrigger>
              ))}
            </TabsList>
            {snapshot.metadata.sections.map((section) => (
              <TabsContent key={section.id} value={section.id}>
                <div className="space-y-6">
                  <Card className="border-slate-200 bg-slate-50/80 shadow-none">
                    <CardContent className="p-6">
                      <h2 className="text-3xl font-semibold text-slate-950">
                        {section.title}
                      </h2>
                      <p className="mt-3 max-w-3xl text-sm leading-7 text-slate-600">
                        {section.description}
                      </p>
                      {section.notes.length > 0 ? (
                        <div className="mt-5 grid gap-2">
                          {section.notes.map((note) => (
                            <div
                              key={note}
                              className="rounded-[1.2rem] border border-slate-200 bg-white px-4 py-3 text-sm leading-6 text-slate-500"
                            >
                              {note}
                            </div>
                          ))}
                        </div>
                      ) : null}
                    </CardContent>
                  </Card>
                  <div className="grid gap-5 xl:grid-cols-2">
                    {section.summaryCharts.map((chart) =>
                      chart.kind === "line" ? (
                        <LineChartPanel
                          key={chart.title}
                          data={chart.values}
                          description={chart.description}
                          title={chart.title}
                        />
                      ) : chart.kind === "pie" ? (
                        <PieChartPanel
                          key={chart.title}
                          data={chart.values}
                          description={chart.description}
                          title={chart.title}
                        />
                      ) : (
                        <BarChartPanel
                          key={chart.title}
                          data={chart.values}
                          description={chart.description}
                          title={chart.title}
                        />
                      ),
                    )}
                  </div>
                  <div className="space-y-4">
                    {section.properties.length > 0 ? (
                      <>
                        {section.properties
                          .filter(propertyHasSamples)
                          .map((property) => (
                            <PropertyAccordionCard
                              item={property}
                              key={`${section.id}-${property.propertyName}`}
                            />
                          ))}
                        <ZeroSamplePropertiesGroup
                          properties={section.properties.filter(
                            (property) => !propertyHasSamples(property),
                          )}
                        />
                      </>
                    ) : (
                      <Card className="border-dashed border-slate-200 bg-slate-50 shadow-none">
                        <CardContent className="p-6 text-sm leading-6 text-slate-500">
                          No registered properties from this subsection are defined or populated
                          in the public global scope.
                        </CardContent>
                      </Card>
                    )}
                  </div>
                </div>
              </TabsContent>
            ))}
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
