"use client";

import { ResponsivePie } from "@nivo/pie";
import { Surface, SectionHeading } from "@/components/mepram/MepramPrimitives";
import Chip from "../Auxiliares/Chip";

export type SchemaItem = {
  label: string;
  value: number;
};

interface SamplesBySchemaProps {
  data: SchemaItem[];
  loading: boolean;
}

const COLORS = ["#4f46e5", "#8b5cf6", "#2d2a7d", "#818cf8"];

export default function SamplesBySchema({
  data,
  loading,
}: SamplesBySchemaProps) {
  const chartData = data.map((item, index) => ({
    id: item.label,
    label: item.label,
    value: item.value,
    color: COLORS[index % COLORS.length],
  }));

  return (
    <Surface>
      <SectionHeading
        title="Samples by schema"
        description="How the visible dataset is distributed across active schemas"
      />

      <div className="h-[280px] mt-4 relative">
        {" "}
        {loading ? (
          <div className="w-full h-full flex items-center justify-center text-slate-400 text-[10px] uppercase tracking-widest animate-pulse font-bold">
            Loading schema data...
          </div>
        ) : (
          <ResponsivePie
            data={chartData}
            innerRadius={0.75}
            padAngle={1.5}
            cornerRadius={4}
            activeOuterRadiusOffset={4}
            colors={COLORS}
            enableArcLabels={false}
            enableArcLinkLabels={false}
            theme={{
              tooltip: {
                container: {
                  fontSize: "12px",
                  borderRadius: "12px",
                  boxShadow: "0 10px 15px -3px rgb(0 0 0 / 0.1)",
                },
              },
            }}
          />
        )}
      </div>

      {!loading && (
        <div className="flex flex-wrap gap-3 mt-6">
          {chartData.map((item) => (
            <Chip key={item.id} item={item} />
          ))}
        </div>
      )}
    </Surface>
  );
}
