import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { AlertCircle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { ChartDatum } from "@/types/databrowser";

const palette = ["#0f766e", "#2563eb", "#ea580c", "#15803d", "#64748b"];

interface ChartCardProps {
  children: React.ReactNode;
  description: string;
  title: string;
}

interface BarChartPanelProps {
  data: ChartDatum[];
  description: string;
  title: string;
  xAxisLabelMode?: "default" | "diagonal";
}

function EmptyChart({ description }: { description: string }) {
  return (
    <div className="flex h-[260px] items-center justify-center rounded-[1.4rem] border border-dashed border-slate-200 bg-slate-50 px-6 text-center">
      <div>
        <AlertCircle className="mx-auto h-5 w-5 text-slate-400" />
        <p className="mt-3 text-sm font-medium text-slate-700">No data available</p>
        <p className="mt-1 text-xs leading-5 text-slate-500">{description}</p>
      </div>
    </div>
  );
}

export function ChartCard({ children, description, title }: ChartCardProps) {
  return (
    <Card className="border-white/70 bg-white/88">
      <CardHeader className="pb-4">
        <CardTitle className="text-xl">{title}</CardTitle>
        <p className="text-sm text-slate-500">{description}</p>
      </CardHeader>
      <CardContent>{children}</CardContent>
    </Card>
  );
}

export function BarChartPanel({
  data,
  description,
  title,
  xAxisLabelMode = "diagonal",
}: BarChartPanelProps) {
  const hasDiagonalLabels = xAxisLabelMode === "diagonal";
  const xAxisProps = hasDiagonalLabels
    ? {
        angle: -35,
        height: 82,
        interval: 0,
        textAnchor: "end" as const,
        tickMargin: 14,
      }
    : {
        tickMargin: 8,
      };
  const barChartProps = hasDiagonalLabels
    ? {
        margin: { bottom: 22, left: 0, right: 8, top: 8 },
      }
    : {};

  return (
    <ChartCard description={description} title={title}>
      {data.length === 0 ? (
        <EmptyChart description={description} />
      ) : (
        <div className="h-[280px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={data}
              {...barChartProps}
            >
              <CartesianGrid stroke="#e2e8f0" strokeDasharray="3 3" vertical={false} />
              <XAxis
                axisLine={false}
                dataKey="label"
                tick={{ fill: "#64748b", fontSize: 12 }}
                tickLine={false}
                {...xAxisProps}
              />
              <YAxis
                axisLine={false}
                tick={{ fill: "#64748b", fontSize: 12 }}
                tickLine={false}
              />
              <Tooltip />
              <Bar dataKey="value" fill="#0f766e" radius={[10, 10, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
    </ChartCard>
  );
}

export function AreaChartPanel({
  data,
  description,
  title,
}: {
  data: ChartDatum[];
  description: string;
  title: string;
}) {
  return (
    <ChartCard description={description} title={title}>
      {data.length === 0 ? (
        <EmptyChart description={description} />
      ) : (
        <div className="h-[280px]">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data}>
              <defs>
                <linearGradient id="chart-gradient" x1="0" x2="0" y1="0" y2="1">
                  <stop offset="5%" stopColor="#0f766e" stopOpacity={0.42} />
                  <stop offset="95%" stopColor="#0f766e" stopOpacity={0} />
                </linearGradient>
              </defs>
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
                tickLine={false}
              />
              <Tooltip />
              <Area
                dataKey="value"
                fill="url(#chart-gradient)"
                stroke="#0f766e"
                strokeWidth={2}
                type="monotone"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      )}
    </ChartCard>
  );
}

export function LineChartPanel({
  data,
  description,
  title,
}: {
  data: ChartDatum[];
  description: string;
  title: string;
}) {
  return (
    <ChartCard description={description} title={title}>
      {data.length === 0 ? (
        <EmptyChart description={description} />
      ) : (
        <div className="h-[280px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data} margin={{ bottom: 8, left: 0, right: 12, top: 8 }}>
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
                tickLine={false}
              />
              <Tooltip />
              <Line
                activeDot={{ r: 5 }}
                dataKey="value"
                dot={{ r: 3 }}
                stroke="#0f766e"
                strokeWidth={2.5}
                type="monotone"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}
    </ChartCard>
  );
}

export function PieChartPanel({
  data,
  description,
  title,
}: {
  data: ChartDatum[];
  description: string;
  title: string;
}) {
  return (
    <ChartCard description={description} title={title}>
      {data.length === 0 ? (
        <EmptyChart description={description} />
      ) : (
        <div className="h-[280px]">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                cx="50%"
                cy="50%"
                data={data}
                dataKey="value"
                innerRadius={60}
                outerRadius={92}
                paddingAngle={2}
              >
                {data.map((entry, index) => (
                  <Cell key={entry.label} fill={palette[index % palette.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      )}
      {data.length > 0 ? (
        <div className="mt-4 grid gap-2 px-6 pb-6 sm:grid-cols-2">
          {data.map((entry, index) => (
            <div
              key={entry.label}
              className="flex items-center justify-between rounded-2xl bg-slate-50 px-3 py-2"
            >
              <div className="flex items-center gap-2">
                <span
                  className="h-2.5 w-2.5 rounded-full"
                  style={{ backgroundColor: palette[index % palette.length] }}
                />
                <span className="text-sm text-slate-600">{entry.label}</span>
              </div>
              <span className="text-sm font-semibold text-slate-900">{entry.value}</span>
            </div>
          ))}
        </div>
      ) : null}
    </ChartCard>
  );
}
