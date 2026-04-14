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
  return (
    <ChartCard description={description} title={title}>
      {chart.simulated ? (
        <div className="mb-4">
          <Badge variant="outline">Simulación controlada</Badge>
        </div>
      ) : null}
      <div className="h-[320px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chart.data} margin={{ bottom: 8, left: 0, right: 12, top: 8 }}>
            <CartesianGrid stroke="#e2e8f0" strokeDasharray="3 3" vertical={false} />
            <XAxis
              axisLine={false}
              dataKey="label"
              tick={{ fill: "#64748b", fontSize: 12 }}
              tickLine={false}
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
    </ChartCard>
  );
}
