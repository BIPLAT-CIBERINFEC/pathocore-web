import { useEffect, useState } from "react";
import { AlertCircle, ChevronDown, ChevronUp, LoaderCircle } from "lucide-react";
import { ApiError, PathocoreApiClient } from "@/api/client";
import { PRIVACY_TEXT } from "@/lib/constants";
import { BarChartPanel, LineChartPanel } from "@/components/databrowser/chart-card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import type { ApiCredentials } from "@/types/api";
import type { ChartDatum, PropertyDistributionCard } from "@/types/databrowser";

function mergeValues(groups: ChartDatum[][]) {
  const counts = new Map<string, number>();

  groups.flat().forEach((item) => {
    counts.set(item.label, (counts.get(item.label) ?? 0) + item.value);
  });

  return Array.from(counts.entries())
    .sort((left, right) => right[1] - left[1] || left[0].localeCompare(right[0], "es"))
    .map(([label, value]) => ({ label, value }));
}

function chartDescription(item: PropertyDistributionCard) {
  if (item.chartKind === "line") {
    return "Number of samples over time";
  }

  if (item.propertyName.toLowerCase().includes("geo")) {
    return "Number of samples by geographic value";
  }

  if ((item.enumValues ?? []).length > 0) {
    return "Number of samples versus enum values";
  }

  return "Number of samples versus values";
}

export function PropertyAccordionCard({
  credentials = null,
  item,
}: {
  credentials?: ApiCredentials | null;
  item: PropertyDistributionCard;
}) {
  const [open, setOpen] = useState(false);
  const [displayItem, setDisplayItem] = useState(item);
  const [distributionStatus, setDistributionStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [distributionError, setDistributionError] = useState<string | null>(null);
  const share = `${(displayItem.participantShare * 100).toFixed(1)}% of visible samples`;

  useEffect(() => {
    setDisplayItem(item);
    setDistributionStatus("idle");
    setDistributionError(null);
  }, [item]);

  useEffect(() => {
    if (!open || displayItem.values.length > 0 || distributionStatus !== "idle") {
      return;
    }

    let cancelled = false;
    const client = new PathocoreApiClient(credentials);
    const queries =
      displayItem.distributionQueries && displayItem.distributionQueries.length > 0
        ? displayItem.distributionQueries
        : [undefined];

    setDistributionStatus("loading");
    setDistributionError(null);

    Promise.all(
      queries.map((query) =>
        client.getDatabrowserPropertyDistribution(displayItem.propertyName, query),
      ),
    )
      .then((responses) => {
        if (cancelled) {
          return;
        }

        const totalSamples = responses.reduce(
          (total, response) => total + response.total_samples,
          0,
        );
        const participantCount = responses.reduce(
          (total, response) => total + response.matched_samples,
          0,
        );

        setDisplayItem((current) => ({
          ...current,
          participantCount,
          participantShare: totalSamples > 0 ? participantCount / totalSamples : 0,
          values: mergeValues(responses.map((response) => response.values)),
        }));
        setDistributionStatus("success");
      })
      .catch((error) => {
        if (cancelled) {
          return;
        }

        if (error instanceof ApiError && error.status === 404) {
          setDistributionStatus("success");
          return;
        }

        setDistributionError(
          error instanceof Error
            ? error.message
            : "No se ha podido cargar la distribución de esta property.",
        );
        setDistributionStatus("error");
      });

    return () => {
      cancelled = true;
    };
  }, [credentials, displayItem, distributionStatus, open]);

  return (
    <Card className="border-white/70 bg-white/88">
      <CardContent className="p-5">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <p className="text-base font-semibold text-slate-950">{displayItem.displayName}</p>
              <Badge variant="secondary">
                {displayItem.participantCount} samples
              </Badge>
              <Badge variant="strong">{share}</Badge>
              {displayItem.classification ? (
                <Badge variant="outline">{displayItem.classification}</Badge>
              ) : null}
              {displayItem.schemaType ? (
                <Badge variant="outline">{displayItem.schemaType}</Badge>
              ) : null}
              {(displayItem.enumValues ?? []).length > 0 ? (
                <Badge variant="outline">{displayItem.enumValues?.length} enum values</Badge>
              ) : null}
              {displayItem.values.length === 0 && distributionStatus === "idle" ? (
                <Badge variant="outline">distribution on demand</Badge>
              ) : null}
              {displayItem.isFallback ? (
                <Badge variant="outline">fallback field used</Badge>
              ) : null}
            </div>
            <p className="mt-3 text-sm leading-6 text-slate-500">{displayItem.description}</p>
            <p className="mt-2 text-xs leading-5 text-slate-400">{PRIVACY_TEXT}</p>
            <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs font-medium uppercase tracking-[0.2em] text-slate-400">
              {displayItem.schemaPath ? <span>Schema path: {displayItem.schemaPath}</span> : null}
              <span>Property: {displayItem.propertyName}</span>
            </div>
            {displayItem.actualPropertyName ? (
              <p className="mt-2 text-xs font-medium uppercase tracking-[0.2em] text-slate-400">
                API field: {displayItem.actualPropertyName}
              </p>
            ) : null}
          </div>
          <Button variant="outline" onClick={() => setOpen((value) => !value)}>
            {open ? "Hide distribution" : "Expand distribution"}
            {open ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
          </Button>
        </div>
        {open ? (
          <div className="mt-6">
            {distributionStatus === "loading" ? (
              <div className="flex h-[220px] items-center justify-center rounded-[1.4rem] border border-dashed border-slate-200 bg-slate-50 px-6 text-center text-sm text-slate-500">
                <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />
                Cargando distribución de la property...
              </div>
            ) : distributionStatus === "error" ? (
              <div className="flex h-[220px] items-center justify-center rounded-[1.4rem] border border-dashed border-red-200 bg-red-50 px-6 text-center text-sm text-red-600">
                <AlertCircle className="mr-2 h-4 w-4" />
                {distributionError}
              </div>
            ) : displayItem.chartKind === "line" ? (
              <LineChartPanel
                data={displayItem.values}
                description={chartDescription(displayItem)}
                title={displayItem.chartTitle}
              />
            ) : (
              <BarChartPanel
                data={displayItem.values}
                description={chartDescription(displayItem)}
                title={displayItem.chartTitle}
              />
            )}
          </div>
        ) : null}
      </CardContent>
    </Card>
  );
}
