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
import { Surface, SectionHeading } from "@/components/mepram/MepramPrimitives";

const palette = ["#4f46e5", "#8b5cf6", "#2d2a7d", "#818cf8"];

function EmptyChart({ description }: any) {
  return (
    <div className="flex h-[260px] items-center justify-center rounded-[24px] border border-dashed border-slate-200 bg-slate-50 px-6 text-center">
      <div>
        <AlertCircle className="mx-auto h-5 w-5 text-slate-400" />
        <p className="mt-3 text-sm font-medium text-slate-700">
          No data available
        </p>
        <p className="mt-1 text-xs leading-relaxed text-slate-500">
          {description}
        </p>
      </div>
    </div>
  );
}

export function BarChartPanel({
  data,
  description,
  title,
  xAxisLabelMode = "diagonal",
}: any) {
  const hasDiagonalLabels = xAxisLabelMode === "diagonal";

  return (
    <Surface className="p-6 border border-slate-100 shadow-sm transition-all hover:border-slate-200">
      <SectionHeading title={title} description={description} />
      {data.length === 0 ? (
        <EmptyChart description={description} />
      ) : (
        <div className="h-[280px] w-full mt-6">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={data}
              margin={{
                bottom: hasDiagonalLabels ? 22 : 0,
                left: -20,
                right: 10,
                top: 10,
              }}
            >
              <CartesianGrid
                stroke="#f1f5f9"
                strokeDasharray="3 3"
                vertical={false}
              />
              <XAxis
                axisLine={false}
                dataKey="label"
                tick={{ fill: "#94a3b8", fontSize: 11 }}
                tickLine={false}
                angle={hasDiagonalLabels ? -35 : 0}
                height={hasDiagonalLabels ? 82 : 30}
                interval={hasDiagonalLabels ? 0 : 0}
                textAnchor={hasDiagonalLabels ? "end" : "middle"}
                tickMargin={hasDiagonalLabels ? 14 : 8}
              />
              <YAxis
                axisLine={false}
                tick={{ fill: "#94a3b8", fontSize: 11 }}
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
              <Bar dataKey="value" radius={[6, 6, 0, 0]} barSize={45}>
                {data.map((entry: any, index: any) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={palette[index % palette.length]}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
    </Surface>
  );
}

export function LineChartPanel({ data, description, title }: any) {
  return (
    <Surface className="p-6 border border-slate-100 shadow-sm transition-all hover:border-slate-200">
      <SectionHeading title={title} description={description} />
      {data.length === 0 ? (
        <EmptyChart description={description} />
      ) : (
        <div className="h-[280px] w-full mt-6">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={data}
              margin={{ bottom: 8, left: -20, right: 12, top: 10 }}
            >
              <CartesianGrid
                stroke="#f1f5f9"
                strokeDasharray="3 3"
                vertical={false}
              />
              <XAxis
                axisLine={false}
                dataKey="label"
                tick={{ fill: "#94a3b8", fontSize: 11 }}
                tickLine={false}
                dy={10}
              />
              <YAxis
                axisLine={false}
                tick={{ fill: "#94a3b8", fontSize: 11 }}
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
              <Line
                activeDot={{ r: 5, fill: palette[0] }}
                dataKey="value"
                dot={{ r: 3, fill: palette[0] }}
                stroke={palette[0]}
                strokeWidth={2.5}
                type="monotone"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}
    </Surface>
  );
}

export function PieChartPanel({ data, description, title }: any) {
  return (
    <Surface className="p-6 border border-slate-100 shadow-sm transition-all hover:border-slate-200">
      <SectionHeading title={title} description={description} />
      {data.length === 0 ? (
        <EmptyChart description={description} />
      ) : (
        <>
          <div className="h-[260px] w-full mt-4">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  cx="50%"
                  cy="50%"
                  data={data}
                  dataKey="value"
                  innerRadius={65}
                  outerRadius={90}
                  paddingAngle={1.5}
                >
                  {data.map((entry: any, index: any) => (
                    <Cell
                      key={entry.label}
                      fill={palette[index % palette.length]}
                      strokeWidth={0}
                      style={{ outline: "none" }}
                    />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    fontSize: "12px",
                    borderRadius: "12px",
                    boxShadow: "0 10px 15px -3px rgb(0 0 0 / 0.1)",
                    border: "1px solid #f1f5f9",
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-6 flex flex-wrap gap-3">
            {data.map((entry: any, index: any) => {
              const activeColor = palette[index % palette.length];
              return (
                <div
                  key={entry.label}
                  className="flex items-center gap-3 rounded-full border border-slate-100 bg-slate-50/50 px-4 py-1.5 transition-all hover:bg-white hover:shadow-sm"
                >
                  <span
                    className="h-2.5 w-2.5 rounded-full shrink-0"
                    style={{ backgroundColor: activeColor }}
                  />
                  <span className="text-xs font-medium text-slate-600">
                    {entry.label}
                  </span>
                  <span className="text-xs font-bold text-slate-900 font-mono bg-white border border-slate-100 rounded-md px-1.5 py-0.5">
                    {entry.value}
                  </span>
                </div>
              );
            })}
          </div>
        </>
      )}
    </Surface>
  );
}
