import { useState, type Dispatch, type SetStateAction } from "react";
import { Cpu, FlaskConical, ScanLine, SlidersHorizontal, UserRound } from "lucide-react";
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
import type {
  ChartDatum,
  MetadataPanelChart,
  MetadataSchemaOption,
  MetadataSchemaScope,
  MetadataSubsectionData,
  PropertyDistributionCard,
} from "@/types/databrowser";

const statIcons = [FlaskConical, ScanLine, Cpu, UserRound];
const sectionOrder: MetadataSubsectionData["id"][] = [
  "sample-metadata",
  "sample-bioinfo",
  "host-information",
];

interface MetadataScopeOption {
  key: string;
  label: string;
  sampleCount: number;
  schemaCount: number;
  schemaKeys: string[];
}

function buildMetadataScopeOptions(options: MetadataSchemaOption[]) {
  const scopesByProject = new Map<string, MetadataScopeOption>();

  options.forEach((option) => {
    const label = option.projectName?.trim() || "Caso de uso sin nombre";
    const key = label.toLowerCase();
    const current = scopesByProject.get(key) ?? {
      key,
      label,
      sampleCount: 0,
      schemaCount: 0,
      schemaKeys: [],
    };

    scopesByProject.set(key, {
      ...current,
      sampleCount: current.sampleCount + option.sampleCount,
      schemaCount: current.schemaCount + 1,
      schemaKeys: [...current.schemaKeys, option.key],
    });
  });

  return Array.from(scopesByProject.values()).sort((left, right) =>
    left.label.localeCompare(right.label),
  );
}

function sameSchemaScope(left: string[], right: string[]) {
  if (left.length !== right.length) {
    return false;
  }

  const rightSet = new Set(right);

  return left.every((schemaKey) => rightSet.has(schemaKey));
}

function mergeChartValues(
  groupedValues: ChartDatum[][],
  referenceValues: ChartDatum[] = [],
) {
  const counts = new Map<string, number>();

  groupedValues.flat().forEach((item) => {
    counts.set(item.label, (counts.get(item.label) ?? 0) + item.value);
  });

  const ordered = referenceValues
    .filter((item) => counts.has(item.label))
    .map((item) => ({
      label: item.label,
      value: counts.get(item.label) ?? 0,
    }));
  const orderedLabels = new Set(ordered.map((item) => item.label));
  const missing = Array.from(counts.entries())
    .filter(([label]) => !orderedLabels.has(label))
    .map(([label, value]) => ({ label, value }));

  return [...ordered, ...missing];
}

function mergeSummaryCharts(
  sections: MetadataSubsectionData[],
  referenceSection: MetadataSubsectionData,
) {
  return referenceSection.summaryCharts.map<MetadataPanelChart>((referenceChart) => {
    const matchingCharts = sections
      .flatMap((section) => section.summaryCharts)
      .filter((chart) => chart.title === referenceChart.title);

    return {
      description: referenceChart.description,
      kind: referenceChart.kind,
      title: referenceChart.title,
      values: mergeChartValues(
        matchingCharts.map((chart) => chart.values),
        referenceChart.values,
      ),
    };
  });
}

function mergePropertyCards(
  sections: MetadataSubsectionData[],
  referenceSection: MetadataSubsectionData,
  totalSamples: number,
) {
  const propertiesByName = new Map<string, PropertyDistributionCard[]>();

  sections
    .flatMap((section) => section.properties)
    .forEach((property) => {
      const existing = propertiesByName.get(property.propertyName) ?? [];
      existing.push(property);
      propertiesByName.set(property.propertyName, existing);
    });

  return referenceSection.properties
    .map<PropertyDistributionCard | null>((referenceProperty) => {
      const properties = propertiesByName.get(referenceProperty.propertyName) ?? [];
      const firstProperty = properties[0];

      if (!firstProperty) {
        return null;
      }

      const participantCount = properties.reduce(
        (total, property) => total + property.participantCount,
        0,
      );
      const actualPropertyNames = Array.from(
        new Set(
          properties
            .map((property) => property.actualPropertyName)
            .filter((propertyName): propertyName is string => Boolean(propertyName)),
        ),
      );
      const mergedProperty: PropertyDistributionCard = {
        chartKind: referenceProperty.chartKind,
        chartTitle: referenceProperty.chartTitle,
        description: firstProperty.description,
        displayName: referenceProperty.displayName,
        isFallback: properties.some((property) => property.isFallback),
        participantCount,
        participantShare: totalSamples > 0 ? participantCount / totalSamples : 0,
        propertyName: referenceProperty.propertyName,
        values: mergeChartValues(
          properties.map((property) => property.values),
          referenceProperty.values,
        ),
      };

      if (actualPropertyNames.length > 0) {
        mergedProperty.actualPropertyName = actualPropertyNames.join(", ");
      }

      return mergedProperty;
    })
    .filter((property): property is PropertyDistributionCard => Boolean(property));
}

function mergeSectionsForSelectedSchemas(
  scopes: MetadataSchemaScope[],
  referenceSections: MetadataSubsectionData[],
  totalSamples: number,
) {
  return sectionOrder
    .map<MetadataSubsectionData | null>((sectionId) => {
      const referenceSection = referenceSections.find((section) => section.id === sectionId);

      if (!referenceSection) {
        return null;
      }

      const scopedSections = scopes
        .flatMap((scope) => scope.sections)
        .filter((section) => section.id === sectionId);

      return {
        description: referenceSection.description,
        id: referenceSection.id,
        notes: referenceSection.notes,
        properties: mergePropertyCards(scopedSections, referenceSection, totalSamples),
        summaryCharts: mergeSummaryCharts(scopedSections, referenceSection),
        title: referenceSection.title,
      };
    })
    .filter((section): section is MetadataSubsectionData => Boolean(section));
}

function MetadataSchemaFilter({
  isAuthenticated,
  options,
  selectedSchemaKeys,
  setSelectedSchemaKeys,
}: {
  isAuthenticated: boolean;
  options: MetadataSchemaOption[];
  selectedSchemaKeys: string[];
  setSelectedSchemaKeys: Dispatch<SetStateAction<string[]>>;
}) {
  const scopeOptions = buildMetadataScopeOptions(options);
  const selectedScope = scopeOptions.find((scope) =>
    sameSchemaScope(scope.schemaKeys, selectedSchemaKeys),
  );

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
              `All schemas` mantiene la vista agregada pública. Si el usuario
              inicia sesión, la API puede devolver scopes adicionales para ver
              únicamente los datos de su caso de uso.
            </p>
          </div>
          <Badge variant={selectedSchemaKeys.length === 0 ? "strong" : "secondary"}>
            {selectedSchemaKeys.length === 0
              ? "All schemas"
              : selectedScope?.label ?? "Custom scope"}
          </Badge>
        </div>
        <div className="mt-5 flex flex-wrap gap-2">
          <Button
            onClick={() => setSelectedSchemaKeys([])}
            size="sm"
            variant={selectedSchemaKeys.length === 0 ? "default" : "outline"}
          >
            All schemas
          </Button>
          {isAuthenticated
            ? scopeOptions.map((scope) => {
                const selected = sameSchemaScope(scope.schemaKeys, selectedSchemaKeys);

                return (
                  <Button
                    key={scope.key}
                    onClick={() => setSelectedSchemaKeys(scope.schemaKeys)}
                    size="sm"
                    title={`${scope.schemaCount} schemas | ${scope.sampleCount} samples`}
                    variant={selected ? "default" : "outline"}
                  >
                    {scope.label}
                    <span className="rounded-full bg-white/20 px-2 py-0.5 text-[0.65rem]">
                      {scope.sampleCount}
                    </span>
                  </Button>
                );
              })
            : null}
        </div>
        {!isAuthenticated ? (
          <p className="mt-3 text-xs leading-5 text-slate-400">
            Para ver un scope específico de caso de uso, inicia sesión desde `API access`.
            El backend debe validar qué casos de uso puede consultar cada usuario.
          </p>
        ) : null}
      </CardContent>
    </Card>
  );
}

export function MetadataPage() {
  const { credentials, error, refresh, snapshot, status } = useDatabrowser();
  const [selectedSchemaKeys, setSelectedSchemaKeys] = useState<string[]>([]);

  if (!snapshot) {
    return <DataStatusPanel error={error} onRetry={() => void refresh()} status={status} />;
  }

  const activeSchemaScopes = snapshot.metadata.schemaScopes.filter((scope) =>
    selectedSchemaKeys.includes(scope.key),
  );
  const activeSampleCount =
    selectedSchemaKeys.length === 0
      ? snapshot.metadata.schemaOptions.reduce((total, option) => total + option.sampleCount, 0)
      : activeSchemaScopes.reduce((total, scope) => total + scope.sampleCount, 0);
  const sections =
    selectedSchemaKeys.length === 0
      ? snapshot.metadata.sections
      : mergeSectionsForSelectedSchemas(
          activeSchemaScopes,
          snapshot.metadata.sections,
          activeSampleCount,
        );

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

      <MetadataSchemaFilter
        isAuthenticated={Boolean(credentials)}
        options={snapshot.metadata.schemaOptions}
        selectedSchemaKeys={selectedSchemaKeys}
        setSelectedSchemaKeys={setSelectedSchemaKeys}
      />

      <Card className="border-white/70 bg-white/88">
        <CardContent className="p-6">
          <SectionHeader
            description="Cada pestaña mezcla panel superior con graficos agregados y una lista de propiedades prioritarias desplegables con cobertura y distribuciones reales."
            eyebrow="Sections"
            title="Metadata subsections"
          />
          <Tabs className="mt-6" defaultValue={snapshot.metadata.sections[0]?.id}>
            <TabsList>
              {sections.map((section) => (
                <TabsTrigger key={section.id} value={section.id}>
                  {section.title}
                </TabsTrigger>
              ))}
            </TabsList>
            {sections.map((section) => (
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
                      section.properties.map((property) => (
                        <PropertyAccordionCard
                          item={property}
                          key={`${section.id}-${property.propertyName}`}
                        />
                      ))
                    ) : (
                      <Card className="border-dashed border-slate-200 bg-slate-50 shadow-none">
                        <CardContent className="p-6 text-sm leading-6 text-slate-500">
                          No priority properties from this subsection are defined or populated
                          in the selected schema scope.
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
