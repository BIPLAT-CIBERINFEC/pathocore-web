import { useState } from "react";
import { ChevronDown, ChevronUp, Info, Search } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { formatDateTime } from "@/lib/format";
import { cn } from "@/lib/utils";
import type {
  SchemaCardData,
  SchemaClassificationCard,
  SchemaPropertyCard,
} from "@/types/databrowser";

interface SchemaBlockProps {
  defaultOpen?: boolean;
  schemaCard: SchemaCardData;
}

function propertyMatchesQuery(property: SchemaPropertyCard, query: string) {
  if (!query) {
    return true;
  }

  const searchable = [
    property.label,
    property.propertyName,
    property.description,
    property.path,
    property.type,
    ...property.enumValues,
  ]
    .join(" ")
    .toLowerCase();

  return searchable.includes(query);
}

function SchemaMetric({
  label,
  value,
}: {
  label: string;
  value: number | string;
}) {
  return (
    <div className="rounded-[1.35rem] bg-slate-50 p-4">
      <p className="text-xs uppercase tracking-[0.2em] text-slate-400">{label}</p>
      <p className="mt-2 text-2xl font-semibold text-slate-950">{value}</p>
    </div>
  );
}

function PropertyDetail({ property }: { property: SchemaPropertyCard | null }) {
  if (!property) {
    return (
      <div className="rounded-[1.5rem] border border-dashed border-slate-200 bg-white/80 p-5 text-sm leading-6 text-slate-500">
        Select a property to inspect its schema label, description, path, type and
        enum values.
      </div>
    );
  }

  const enumPreview = property.enumValues.slice(0, 12);
  const examplePreview = property.examples.slice(0, 6);

  return (
    <div className="rounded-[1.5rem] border border-slate-200 bg-white p-5 shadow-[0_14px_45px_-36px_rgba(15,23,42,0.7)]">
      <div className="flex flex-wrap items-center gap-2">
        <Badge variant="strong">{property.type}</Badge>
        <Badge variant="outline">{property.classification}</Badge>
        {property.enumValues.length > 0 ? (
          <Badge variant="secondary">{property.enumValues.length} enum values</Badge>
        ) : null}
      </div>
      <h4 className="mt-4 text-lg font-semibold text-slate-950">{property.label}</h4>
      <p className="mt-3 text-sm leading-6 text-slate-500">{property.description}</p>
      <dl className="mt-5 grid gap-3 text-sm">
        <div>
          <dt className="text-xs uppercase tracking-[0.2em] text-slate-400">Property key</dt>
          <dd className="mt-1 font-mono text-xs text-slate-800">{property.propertyName}</dd>
        </div>
        <div>
          <dt className="text-xs uppercase tracking-[0.2em] text-slate-400">Schema path</dt>
          <dd className="mt-1 break-words font-mono text-xs text-slate-800">
            {property.path}
          </dd>
        </div>
      </dl>
      {enumPreview.length > 0 ? (
        <div className="mt-5">
          <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Enum values</p>
          <div className="mt-3 flex flex-wrap gap-2">
            {enumPreview.map((value) => (
              <Badge key={value} variant="outline">
                {value}
              </Badge>
            ))}
            {property.enumValues.length > enumPreview.length ? (
              <Badge variant="secondary">
                +{property.enumValues.length - enumPreview.length} more
              </Badge>
            ) : null}
          </div>
        </div>
      ) : null}
      {examplePreview.length > 0 ? (
        <div className="mt-5">
          <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Examples</p>
          <div className="mt-3 flex flex-wrap gap-2">
            {examplePreview.map((value) => (
              <Badge key={value} variant="secondary">
                {value}
              </Badge>
            ))}
          </div>
        </div>
      ) : null}
    </div>
  );
}

function SchemaClassificationExplorer({
  classification,
  defaultOpen = false,
}: {
  classification: SchemaClassificationCard;
  defaultOpen?: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen);
  const [query, setQuery] = useState("");
  const [selectedProperty, setSelectedProperty] = useState<SchemaPropertyCard | null>(
    classification.properties[0] ?? null,
  );
  const normalizedQuery = query.trim().toLowerCase();
  const filteredProperties = classification.properties.filter((property) =>
    propertyMatchesQuery(property, normalizedQuery),
  );

  return (
    <div className="rounded-[1.5rem] border border-slate-200 bg-slate-50/80">
      <button
        aria-expanded={open}
        className="flex w-full flex-col gap-4 p-5 text-left transition hover:bg-white/70 sm:flex-row sm:items-center sm:justify-between"
        onClick={() => setOpen((value) => !value)}
        type="button"
      >
        <div>
          <h3 className="text-xl font-semibold text-slate-950">{classification.name}</h3>
          <p className="mt-2 text-sm leading-6 text-slate-500">
            Explore property labels, descriptions, schema paths and enumerations for this
            classification.
          </p>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          <Badge variant="secondary">{classification.propertyCount} properties</Badge>
          <span className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-white text-slate-700">
            {open ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
          </span>
        </div>
      </button>

      {open ? (
        <div className="border-t border-slate-200 p-5">
          <div className="relative">
            <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <Input
              aria-label={`Search properties in ${classification.name}`}
              className="pl-11"
              onChange={(event) => setQuery(event.target.value)}
              placeholder={`Search ${classification.name} properties`}
              value={query}
            />
          </div>

          <div className="mt-5 grid gap-5 xl:grid-cols-[minmax(0,1.15fr)_minmax(320px,0.85fr)]">
            <div>
              <div className="flex items-center gap-2 text-xs uppercase tracking-[0.18em] text-slate-400">
                <Info className="h-3.5 w-3.5" />
                Hover chips for quick context. Click one to inspect the full schema data.
              </div>
              <div className="mt-4 max-h-[24rem] overflow-y-auto rounded-[1.35rem] border border-slate-200 bg-white p-3">
                {filteredProperties.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {filteredProperties.map((property) => {
                      const selected =
                        selectedProperty?.path === property.path &&
                        selectedProperty.propertyName === property.propertyName;

                      return (
                        <button
                          className={cn(
                            "group inline-flex max-w-full items-center gap-2 rounded-full border px-3 py-2 text-left text-xs font-semibold transition",
                            selected
                              ? "border-slate-950 bg-slate-950 text-white shadow-sm"
                              : "border-slate-200 bg-slate-50 text-slate-700 hover:border-slate-300 hover:bg-white",
                          )}
                          key={`${property.path}-${property.propertyName}`}
                          onClick={() => setSelectedProperty(property)}
                          title={`${property.label}: ${property.description}`}
                          type="button"
                        >
                          <span className="truncate">{property.label}</span>
                          <span
                            className={cn(
                              "rounded-full px-2 py-0.5 font-mono text-[0.65rem]",
                              selected
                                ? "bg-white/15 text-white/80"
                                : "bg-white text-slate-400 group-hover:text-slate-600",
                            )}
                          >
                            {property.type}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                ) : (
                  <div className="rounded-[1rem] border border-dashed border-slate-200 bg-slate-50 p-5 text-sm text-slate-500">
                    No schema properties match "{query}".
                  </div>
                )}
              </div>
            </div>
            <PropertyDetail property={selectedProperty} />
          </div>
        </div>
      ) : null}
    </div>
  );
}

export function SchemaBlock({ defaultOpen = false, schemaCard }: SchemaBlockProps) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <Card className="border-white/70 bg-white/88">
      <CardHeader className="gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <p className="section-kicker">Schema Block</p>
          <CardTitle className="mt-2 text-3xl">{schemaCard.name}</CardTitle>
          <p className="mt-3 text-sm leading-7 text-slate-500">
            Project: {schemaCard.projectName} | Version {schemaCard.version} | Generated{" "}
            {formatDateTime(schemaCard.generatedAt)}
          </p>
        </div>
        <div className="flex flex-col gap-3 lg:items-end">
          <div className="grid min-w-[260px] gap-3 sm:grid-cols-3">
            <SchemaMetric label="Samples" value={schemaCard.sampleCount} />
            <SchemaMetric label="Properties" value={schemaCard.propertyCount} />
            <SchemaMetric label="Classifications" value={schemaCard.classificationCount} />
          </div>
          <Button
            aria-expanded={open}
            className="w-full lg:w-auto"
            onClick={() => setOpen((value) => !value)}
            variant="outline"
          >
            {open ? "Collapse schema" : "Explore schema"}
            {open ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
          </Button>
        </div>
      </CardHeader>

      {open ? (
        <CardContent>
          <div className="space-y-4">
            {schemaCard.classifications.map((classification, index) => (
              <SchemaClassificationExplorer
                classification={classification}
                defaultOpen={index === 0}
                key={`${schemaCard.name}-${classification.name}`}
              />
            ))}
          </div>
        </CardContent>
      ) : null}
    </Card>
  );
}
