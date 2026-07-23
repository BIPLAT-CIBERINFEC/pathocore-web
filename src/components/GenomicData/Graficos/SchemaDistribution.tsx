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

interface SchemaDistributionProps {
  data: any[];
  loading: boolean;
}

export default function SchemaDistribution({
  data,
  loading,
}: SchemaDistributionProps) {
  const chartData = (data || []).map((item: any) => ({
    name: item.label,
    value: item.value,
  }));

  return (
    <Surface>
      <SectionHeading
        title="Distribution by schema"
        description="Samples represented by schema"
      />

      <div className="h-[320px] w-full mt-8 relative">
        {loading ? (
          <div className="w-full h-full flex items-center justify-center text-slate-400 text-[10px] font-bold uppercase tracking-widest animate-pulse">
            Loading schema distribution...
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={chartData}
              margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
            >
              <CartesianGrid
                vertical={false}
                strokeDasharray="3 3"
                stroke="#f1f5f9"
              />
              <XAxis
                dataKey="name"
                tick={{ fontSize: 11, fill: "#000", fontWeight: 700 }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                tick={{ fontSize: 11, fill: "#000" }}
                axisLine={false}
                tickLine={false}
              />
              <Tooltip
                content={<CustomTooltip />}
                cursor={{ fill: "#f8fafc", radius: 12 }}
              />
              <Bar dataKey="value" fill="#4D45E1" radius={[14, 14, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>
    </Surface>
  );
}
