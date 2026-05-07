import { useEffect, useState } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { AlertCircle, LoaderCircle, MapPinned } from "lucide-react";
import { ApiError, PathocoreApiClient } from "@/api/client";
import { BarChartPanel } from "@/components/databrowser/chart-card";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { formatInteger } from "@/lib/format";
import type {
  DatabrowserDistributionCardResponse,
  DatabrowserGroupedBreakdownResponse,
  DatabrowserLocationBreakdownResponse,
  DatabrowserPropertyDistributionResponse,
  DatabrowserSummaryQuery,
} from "@/types/api";

const chartPalette = [
  "#0f766e",
  "#2563eb",
  "#ea580c",
  "#15803d",
  "#7c3aed",
  "#b45309",
  "#0f172a",
  "#64748b",
];

type LoadStatus = "error" | "idle" | "loading" | "success";

interface PropertyDistributionPanelProps {
  propertyName: string;
  query?: DatabrowserSummaryQuery;
}

function formatShare(value: number | null | undefined) {
  if (typeof value !== "number" || !Number.isFinite(value)) {
    return "0.0%";
  }

  return `${(value * 100).toFixed(1)}%`;
}

const fixedVisualizationCards: DatabrowserDistributionCardResponse[] = [
  {
    data_path: "breakdowns.pathogen.series",
    default_renderer: "grouped-bar",
    id: "by-pathogen",
    title: "Pathogen",
  },
  {
    data_path: "breakdowns.year.series",
    default_renderer: "grouped-bar",
    id: "by-year",
    title: "Year",
  },
  {
    data_path: "breakdowns.location.values",
    default_renderer: "bar",
    id: "by-location",
    title: "Location",
  },
];

function formatTooltipSampleCount(value: unknown) {
  const numericValue = Number(value);

  if (!Number.isFinite(numericValue)) {
    return "0 samples";
  }

  return `${formatInteger(numericValue)} samples`;
}

function visualizationCards(
  response: DatabrowserPropertyDistributionResponse,
): DatabrowserDistributionCardResponse[] {
  const backendCards = new Map((response.cards ?? []).map((card) => [card.id, card]));

  return fixedVisualizationCards.map((card) => {
    const backendCard = backendCards.get(card.id);

    return backendCard ? { ...backendCard, ...card } : card;
  });
}

function pathogenBreakdownToChartData(breakdown: DatabrowserGroupedBreakdownResponse) {
  const pathogenLabels = breakdown.series.map((serie) => serie.label).slice(0, 8);
  const valueLabels = Array.from(
    new Set(
      breakdown.series.flatMap((serie) => serie.values.map((value) => value.label)),
    ),
  ).slice(0, 12);

  const seriesByPathogen = new Map(
    breakdown.series.map((serie) => [
      serie.label,
      new Map(serie.values.map((value) => [value.label, value.value])),
    ]),
  );

  const data = valueLabels.map((valueLabel) => {
    const row: Record<string, number | string> = { label: valueLabel };

    pathogenLabels.forEach((pathogen) => {
      row[pathogen] = seriesByPathogen.get(pathogen)?.get(valueLabel) ?? 0;
    });

    return row;
  });

  return { data, pathogenLabels };
}

function PathogenBreakdownCard({
  breakdown,
  card,
}: {
  breakdown: DatabrowserGroupedBreakdownResponse;
  card: DatabrowserDistributionCardResponse;
}) {
  const { data, pathogenLabels } = pathogenBreakdownToChartData(breakdown);

  return (
    <Card className="border-white/70 bg-white/88">
      <CardHeader className="pb-4">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <CardTitle className="text-xl">{card.title}</CardTitle>
            <p className="mt-2 text-sm text-slate-500">
              {card.description ??
                "Distribución apilada de la property por patógeno. Cada color representa un patógeno."}
            </p>
          </div>
          {breakdown.truncated ? <Badge variant="outline">truncated</Badge> : null}
        </div>
      </CardHeader>
      <CardContent>
        {data.length > 0 && pathogenLabels.length > 0 ? (
          <div className="h-[330px]">
            <ResponsiveContainer height="100%" width="100%">
              <BarChart data={data} margin={{ bottom: 32, left: 0, right: 12, top: 8 }}>
                <CartesianGrid stroke="#e2e8f0" strokeDasharray="3 3" vertical={false} />
                <XAxis
                  angle={-35}
                  axisLine={false}
                  dataKey="label"
                  height={90}
                  interval={0}
                  textAnchor="end"
                  tick={{ fill: "#64748b", fontSize: 12 }}
                  tickLine={false}
                  tickMargin={14}
                />
                <YAxis
                  axisLine={false}
                  tick={{ fill: "#64748b", fontSize: 12 }}
                  tickLine={false}
                />
                <Tooltip
                  formatter={(value, name) => [
                    formatTooltipSampleCount(value),
                    String(name),
                  ]}
                  labelFormatter={(label) => `Value: ${String(label)}`}
                />
                {pathogenLabels.map((label, index) => (
                  <Bar
                    dataKey={label}
                    fill={chartPalette[index % chartPalette.length]}
                    key={label}
                    radius={index === pathogenLabels.length - 1 ? [8, 8, 0, 0] : 0}
                    stackId="pathogens"
                  />
                ))}
              </BarChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <EmptyPanel message="No pathogen breakdown available for this property." />
        )}
        {pathogenLabels.length > 0 ? (
          <div className="mt-4 flex flex-wrap gap-2">
            {pathogenLabels.map((label, index) => (
              <Badge key={label} variant="outline">
                <span
                  className="mr-2 h-2.5 w-2.5 rounded-full"
                  style={{ backgroundColor: chartPalette[index % chartPalette.length] }}
                />
                {label}
              </Badge>
            ))}
          </div>
        ) : null}
      </CardContent>
    </Card>
  );
}

function groupedBreakdownToChartData(breakdown: DatabrowserGroupedBreakdownResponse) {
  const valueLabels = Array.from(
    new Set(
      breakdown.series.flatMap((serie) => serie.values.map((value) => value.label)),
    ),
  ).slice(0, 8);

  const data = breakdown.series.map((serie) => {
    const row: Record<string, number | string> = {
      label: serie.label,
      sample_count: serie.sample_count,
    };

    valueLabels.forEach((label) => {
      row[label] = serie.values.find((value) => value.label === label)?.value ?? 0;
    });

    return row;
  });

  return { data, valueLabels };
}

function GroupedBreakdownCard({
  breakdown,
  card,
}: {
  breakdown: DatabrowserGroupedBreakdownResponse;
  card: DatabrowserDistributionCardResponse;
}) {
  const { data, valueLabels } = groupedBreakdownToChartData(breakdown);

  return (
    <Card className="border-white/70 bg-white/88">
      <CardHeader className="pb-4">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <CardTitle className="text-xl">{card.title}</CardTitle>
            <p className="mt-2 text-sm text-slate-500">
              {card.description ??
                `${breakdown.label}. ${formatInteger(breakdown.groups_returned)} of ${formatInteger(
                  breakdown.groups_total,
                )} groups returned.`}
            </p>
          </div>
          {breakdown.truncated ? <Badge variant="outline">truncated</Badge> : null}
        </div>
      </CardHeader>
      <CardContent>
        {data.length > 0 && valueLabels.length > 0 ? (
          <div className="h-[330px]">
            <ResponsiveContainer height="100%" width="100%">
              <BarChart data={data} margin={{ bottom: 28, left: 0, right: 12, top: 8 }}>
                <CartesianGrid stroke="#e2e8f0" strokeDasharray="3 3" vertical={false} />
                <XAxis
                  angle={-35}
                  axisLine={false}
                  dataKey="label"
                  height={84}
                  interval={0}
                  textAnchor="end"
                  tick={{ fill: "#64748b", fontSize: 12 }}
                  tickLine={false}
                  tickMargin={14}
                />
                <YAxis
                  axisLine={false}
                  tick={{ fill: "#64748b", fontSize: 12 }}
                  tickLine={false}
                />
                <Tooltip />
                {valueLabels.map((label, index) => (
                  <Bar
                    dataKey={label}
                    fill={chartPalette[index % chartPalette.length]}
                    key={label}
                    radius={index === valueLabels.length - 1 ? [8, 8, 0, 0] : 0}
                    stackId="values"
                  />
                ))}
              </BarChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <EmptyPanel message="No grouped data available for this breakdown." />
        )}
        {valueLabels.length > 0 ? (
          <div className="mt-4 flex flex-wrap gap-2">
            {valueLabels.map((label, index) => (
              <Badge key={label} variant="outline">
                <span
                  className="mr-2 h-2.5 w-2.5 rounded-full"
                  style={{ backgroundColor: chartPalette[index % chartPalette.length] }}
                />
                {label}
              </Badge>
            ))}
          </div>
        ) : null}
      </CardContent>
    </Card>
  );
}

function LocationBreakdownCard({
  breakdown,
  card,
}: {
  breakdown: DatabrowserLocationBreakdownResponse;
  card: DatabrowserDistributionCardResponse;
}) {
  const chartData = breakdown.values.map((item) => ({
    label: item.label,
    value: item.value,
  }));

  return (
    <Card className="border-white/70 bg-white/88">
      <CardHeader className="pb-4">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <CardTitle className="text-xl">{card.title}</CardTitle>
            <p className="mt-2 text-sm text-slate-500">
              {card.description ??
                "Distribución territorial de las muestras con esta property."}
            </p>
          </div>
          <Badge variant="outline">
            <MapPinned className="mr-1 h-3.5 w-3.5" />
            map fallback
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-5">
        <BarChartPanel
          data={chartData}
          description="Muestras con esta property por localización."
          title="Location distribution"
        />
        <div className="rounded-[1.1rem] border border-amber-200 bg-amber-50 px-4 py-3 text-sm leading-6 text-amber-900">
          Nota geográfica: las entradas que incluyan <span className="font-mono">geo.code</span>,{" "}
          <span className="font-mono">lat</span> o <span className="font-mono">lon</span>{" "}
          deberán renderizarse como mapa cuando se integre la capa cartográfica; este
          panel mantiene barras como fallback.
        </div>
        <div className="overflow-hidden rounded-[1.25rem] border border-slate-200">
          <table className="min-w-full text-left text-sm">
            <thead className="bg-slate-50 text-xs uppercase tracking-[0.18em] text-slate-400">
              <tr>
                <th className="px-4 py-3 font-semibold">Location</th>
                <th className="px-4 py-3 font-semibold">Geo code</th>
                <th className="px-4 py-3 font-semibold">Matched</th>
                <th className="px-4 py-3 font-semibold">Total</th>
                <th className="px-4 py-3 font-semibold">Share</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {breakdown.values.map((item) => (
                <tr key={`${item.label}-${item.geo?.code ?? "no-code"}`}>
                  <td className="px-4 py-3 font-semibold text-slate-900">
                    {item.tooltip?.title ?? item.label}
                  </td>
                  <td className="px-4 py-3 font-mono text-slate-500">
                    {item.geo?.code ?? "N/A"}
                  </td>
                  <td className="px-4 py-3">{formatInteger(item.matched_samples)}</td>
                  <td className="px-4 py-3">{formatInteger(item.total_samples)}</td>
                  <td className="px-4 py-3">{formatShare(item.matched_share)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}

function EmptyPanel({ message }: { message: string }) {
  return (
    <div className="flex h-[220px] items-center justify-center rounded-[1.4rem] border border-dashed border-slate-200 bg-slate-50 px-6 text-center">
      <div>
        <AlertCircle className="mx-auto h-5 w-5 text-slate-400" />
        <p className="mt-3 text-sm font-medium text-slate-700">{message}</p>
      </div>
    </div>
  );
}

function CardRenderer({
  card,
  response,
}: {
  card: DatabrowserDistributionCardResponse;
  response: DatabrowserPropertyDistributionResponse;
}) {
  if (card.id === "by-pathogen" && response.breakdowns?.pathogen) {
    return <PathogenBreakdownCard breakdown={response.breakdowns.pathogen} card={card} />;
  }

  if (card.id === "by-year" && response.breakdowns?.year) {
    return <GroupedBreakdownCard breakdown={response.breakdowns.year} card={card} />;
  }

  if (card.id === "by-location" && response.breakdowns?.location) {
    return <LocationBreakdownCard breakdown={response.breakdowns.location} card={card} />;
  }

  return <EmptyPanel message={`No ${card.title.toLowerCase()} data available for this property.`} />;
}

export function PropertyDistributionPanel({
  propertyName,
  query,
}: PropertyDistributionPanelProps) {
  const [distribution, setDistribution] =
    useState<DatabrowserPropertyDistributionResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [status, setStatus] = useState<LoadStatus>("idle");

  useEffect(() => {
    let cancelled = false;
    const client = new PathocoreApiClient();

    setDistribution(null);
    setError(null);
    setStatus("loading");

    client
      .getDatabrowserPropertyDistribution(propertyName, query)
      .then((response) => {
        if (cancelled) {
          return;
        }

        setDistribution(response);
        setStatus("success");
      })
      .catch((loadError) => {
        if (cancelled) {
          return;
        }

        if (loadError instanceof ApiError && loadError.status === 404) {
          setDistribution({
            matched_samples: 0,
            property: propertyName,
            total_samples: 0,
            values: [],
          });
          setStatus("success");
          return;
        }

        setError(
          loadError instanceof Error
            ? loadError.message
            : "Unable to load property distribution.",
        );
        setStatus("error");
      });

    return () => {
      cancelled = true;
    };
  }, [propertyName, query]);

  if (status === "loading" || status === "idle") {
    return (
      <div className="flex h-[220px] items-center justify-center rounded-[1.4rem] border border-dashed border-slate-200 bg-slate-50 px-6 text-center text-sm text-slate-500">
        <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />
        Cargando distribución de la property...
      </div>
    );
  }

  if (status === "error") {
    return (
      <div className="flex h-[220px] items-center justify-center rounded-[1.4rem] border border-dashed border-red-200 bg-red-50 px-6 text-center text-sm text-red-600">
        <AlertCircle className="mr-2 h-4 w-4" />
        {error}
      </div>
    );
  }

  if (!distribution) {
    return null;
  }

  const cards = visualizationCards(distribution);

  return (
    <div className="space-y-5">
      {distribution.matched_samples === 0 ? (
        <EmptyPanel message="No samples contain data for this property in the current scope." />
      ) : (
        <Tabs defaultValue={cards[0]?.id}>
          <TabsList>
            {cards.map((card) => (
              <TabsTrigger key={card.id} value={card.id}>
                {card.title}
              </TabsTrigger>
            ))}
          </TabsList>
          {cards.map((card) => (
            <TabsContent key={card.id} value={card.id}>
              <CardRenderer card={card} response={distribution} />
            </TabsContent>
          ))}
        </Tabs>
      )}
    </div>
  );
}
