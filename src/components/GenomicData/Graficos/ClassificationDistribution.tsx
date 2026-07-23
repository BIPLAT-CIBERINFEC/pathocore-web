"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  ResponsiveContainer,
  CartesianGrid,
  Tooltip,
} from "recharts";
import { Surface, SectionHeading } from "@/components/mepram/MepramPrimitives";
import CustomTooltip from "../Auxiliares/CustomTooltip";

interface ClassificationDistributionProps {
  data: any[];
  loading: boolean;
}

export default function ClassificationDistribution({
  data,
  loading,
}: ClassificationDistributionProps) {
  const chartData = (data || []).map((item: any) => ({
    name: item.label,
    value: item.value,
  }));

  return (
    <Surface>
      <SectionHeading
        title="Distribution by classification"
        description="Property counts grouped by schema classification"
      />

      <div className="h-[400px] w-full mt-8 relative">
        {loading ? (
          <div className="w-full h-full flex items-center justify-center text-slate-400 text-[10px] font-bold uppercase tracking-widest animate-pulse">
            Loading classifications...
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={chartData}
              margin={{ top: 10, right: 10, left: -20, bottom: 60 }}
            >
              <defs>
                <linearGradient id="barGradCls" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#8b5cf6" />
                  <stop offset="100%" stopColor="#4f46e5" />
                </linearGradient>
              </defs>
              <CartesianGrid
                vertical={false}
                strokeDasharray="3 3"
                stroke="#f1f5f9"
              />
              <XAxis
                dataKey="name"
                tick={{ fontSize: 10, fill: "#000", fontWeight: 600 }}
                axisLine={false}
                tickLine={false}
                angle={-45}
                textAnchor="end"
                interval={0}
              />
              <YAxis
                tick={{ fontSize: 11, fill: "#000" }}
                axisLine={false}
                tickLine={false}
              />
              <Tooltip
                content={<CustomTooltip />}
                cursor={{ fill: "#f8fafc", radius: 8 }}
              />
              <Bar
                dataKey="value"
                fill="url(#barGradCls)"
                radius={[8, 8, 0, 0]}
                barSize={32}
              />
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>
    </Surface>
  );
}
