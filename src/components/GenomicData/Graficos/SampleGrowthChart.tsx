"use client";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";
import { Surface, SectionHeading } from "@/components/mepram/MepramPrimitives";
import CustomTooltip from "../Auxiliares/CustomTooltip";

interface GrowthDataPoint {
  date: string;
  value: number;
}

interface SampleGrowthChartProps {
  data: GrowthDataPoint[];
  loading: boolean;
}

export default function SampleGrowthChart({
  data,
  loading,
}: SampleGrowthChartProps) {
  return (
    <Surface>
      <SectionHeading
        title="Sample growth over time"
        description="Temporal growth of samples using collection date when present"
      />
      <div className="h-[300px] w-full mt-6">
        {loading ? (
          <div className="h-full flex items-center justify-center text-slate-400 text-[10px] uppercase tracking-widest animate-pulse font-bold">
            Loading growth data...
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={data}
              margin={{ top: 10, right: 15, left: -20, bottom: 45 }}
            >
              <CartesianGrid
                vertical={false}
                strokeDasharray="3 3"
                stroke="#f1f5f9"
              />
              <XAxis
                dataKey="date"
                tick={{ fontSize: 10, fontWeight: 600, fill: "#000" }} 
                axisLine={false}
                tickLine={false}
                angle={-45}
                textAnchor="end"
                interval="preserveStartEnd" 
              />
              <YAxis
                tick={{ fontSize: 12, fill: "#000" }}
                axisLine={false}
                tickLine={false}
              />
              <Tooltip
                content={<CustomTooltip />}
                cursor={{ stroke: "#e2e8f0", strokeWidth: 2 }}
              />
              <Line
                type="monotone"
                dataKey="value"
                stroke="#4f46e5"
                strokeWidth={3}
                dot={{ r: 4, fill: "#4f46e5", stroke: "#fff", strokeWidth: 2 }}
                activeDot={{ r: 6, strokeWidth: 0, fill: "#8b5cf6" }}
              />
            </LineChart>
          </ResponsiveContainer>
        )}
      </div>
    </Surface>
  );
}
