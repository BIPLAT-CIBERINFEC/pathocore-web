import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { AlertCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { ChartCard } from "@/components/databrowser/chart-card";
import type { MepramMultiSeriesChart } from "@/types/mepram";

interface MultiSeriesBarPanelProps {
  chart: MepramMultiSeriesChart;
  description: string;
  stacked?: boolean;
  title: string;
  valueSuffix?: string;
}

export function MultiSeriesBarPanel({
  chart,
  description,
  stacked = false,
  title,
  valueSuffix,
}: MultiSeriesBarPanelProps) {
  const hasData = chart.series.length > 0 && chart.data.length > 0;

  return (
    <ChartCard description={description} title={title}>
      {chart.simulated ? (
        <div className="mb-4">
          <Badge variant="outline">Simulación controlada</Badge>
        </div>
      ) : null}
      {hasData ? (
        <div className="h-[320px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chart.data} margin={{ bottom: 26, left: 0, right: 12, top: 8 }}>
              <CartesianGrid stroke="#e2e8f0" strokeDasharray="3 3" vertical={false} />
              <XAxis
                angle={-35}
                axisLine={false}
                dataKey="label"
                height={76}
                interval={0}
                textAnchor="end"
                tick={{ fill: "#64748b", fontSize: 12 }}
                tickLine={false}
                tickMargin={14}
              />
              <YAxis
                axisLine={false}
                tick={{ fill: "#64748b", fontSize: 12 }}
                tickFormatter={(value: number) =>
                  valueSuffix ? `${value}${valueSuffix}` : String(value)
                }
                tickLine={false}
              />
              <Tooltip />
              <Legend />
              {chart.series.map((serie) => (
                <Bar
                  dataKey={serie.key}
                  fill={serie.color}
                  key={serie.key}
                  name={serie.label}
                  radius={stacked ? 0 : [10, 10, 0, 0]}
                  {...(stacked ? { stackId: "stack" } : {})}
                />
              ))}
            </BarChart>
          </ResponsiveContainer>
        </div>
      ) : (
        <div className="flex h-[260px] items-center justify-center rounded-[1.4rem] border border-dashed border-slate-200 bg-slate-50 px-6 text-center">
          <div>
            <AlertCircle className="mx-auto h-5 w-5 text-slate-400" />
            <p className="mt-3 text-sm font-medium text-slate-700">
              No hay datos para esta serie
            </p>
            <p className="mt-1 text-xs leading-5 text-slate-500">
              El endpoint ha respondido correctamente, pero el dataset actual no
              contiene los campos necesarios para construir esta grafica.
            </p>
          </div>
        </div>
      )}
    </ChartCard>
  );
}
