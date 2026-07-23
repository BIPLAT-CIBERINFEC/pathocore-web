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
import { Surface, SectionHeading } from "@/components/mepram/MepramPrimitives";

const colors = ["#4f46e5", "#8b5cf6", "#2d2a7d", "#818cf8"];

export function MultiSeriesBarPanel({
  chart,
  description,
  stacked = false,
  title,
  valueSuffix,
}: any) {
  const hasData = chart?.series?.length > 0 && chart?.categories?.length > 0;

  const chartData =
    chart?.categories?.map((category: any, index: any) => {
      const dataPoint: any = { label: category }; 
      chart.series.forEach((serie: any) => {
        (dataPoint as any)[serie.name] = serie.data[index] ?? 0; 
      });
      return dataPoint;
    }) ?? [];

  return (
    <Surface className="p-6 border border-slate-100 shadow-sm transition-all hover:border-slate-200">
      <SectionHeading title={title} description={description} />

      {chart?.simulated && (
        <div className="mt-3">
          <Badge variant="outline" className="rounded-full">
            Controlled simulation
          </Badge>
        </div>
      )}

      {hasData ? (
        <div className="h-[320px] w-full mt-6">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={chartData}
              margin={{ bottom: 10, left: -20, right: 12, top: 10 }}
            >
              <CartesianGrid
                stroke="#f1f5f9"
                strokeDasharray="3 3"
                vertical={false}
              />
              <XAxis
                angle={-35}
                axisLine={false}
                dataKey="label"
                height={65}
                interval={0}
                textAnchor="end"
                tick={{ fill: "#94a3b8", fontSize: 11 }}
                tickLine={false}
                tickMargin={14}
              />
              <YAxis
                axisLine={false}
                tick={{ fill: "#94a3b8", fontSize: 11 }}
                tickFormatter={(value) =>
                  valueSuffix ? `${value}${valueSuffix}` : String(value)
                }
                tickLine={false}
              />
              <Tooltip
                cursor={{ fill: "#f8fafc" }}
                contentStyle={{
                  fontSize: "12px",
                  borderRadius: "12px",
                  boxShadow: "0 10px 15px -3px rgb(0 0 0 / 0.1)",
                  border: "1px solid #f1f5f9",
                }}
              />
              <Legend
                verticalAlign="bottom"
                height={36}
                iconType="circle"
                wrapperStyle={{ fontSize: 12, fill: "#000", paddingTop: 16 }}
              />
              {chart.series.map((serie: any, index: any) => (
                <Bar
                  dataKey={serie.name}
                  fill={colors[index % colors.length]}
                  key={serie.name}
                  name={serie.name}
                  radius={stacked ? 0 : [6, 6, 0, 0]}
                  {...(stacked ? { stackId: "stack" } : {})}
                />
              ))}
            </BarChart>
          </ResponsiveContainer>
        </div>
      ) : (
        <div className="flex h-[260px] items-center justify-center rounded-[24px] border border-dashed border-slate-200 bg-slate-50 px-6 text-center mt-6">
          <div>
            <AlertCircle className="mx-auto h-5 w-5 text-slate-400" />
            <p className="mt-3 text-sm font-medium text-slate-700">
              There is no data for this series
            </p>
            <p className="mt-1 text-xs leading-relaxed text-slate-500">
              The endpoint responded correctly, but the current dataset did not
              contains the fields necessary to build this graph.
            </p>
          </div>
        </div>
      )}
    </Surface>
  );
}
