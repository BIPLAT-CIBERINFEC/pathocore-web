import { useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";
import { PRIVACY_TEXT } from "@/lib/constants";
import { BarChartPanel, LineChartPanel } from "@/components/databrowser/chart-card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import type { PropertyDistributionCard } from "@/types/databrowser";

export function PropertyAccordionCard({ item }: { item: PropertyDistributionCard }) {
  const [open, setOpen] = useState(false);
  const share = `${(item.participantShare * 100).toFixed(1)}% of visible samples`;

  return (
    <Card className="border-white/70 bg-white/88">
      <CardContent className="p-5">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <p className="text-base font-semibold text-slate-950">{item.displayName}</p>
              <Badge variant="secondary">
                {item.participantCount} samples
              </Badge>
              <Badge variant="strong">{share}</Badge>
              {item.isFallback ? (
                <Badge variant="outline">fallback field used</Badge>
              ) : null}
            </div>
            <p className="mt-3 text-sm leading-6 text-slate-500">{item.description}</p>
            <p className="mt-2 text-xs leading-5 text-slate-400">{PRIVACY_TEXT}</p>
            {item.actualPropertyName ? (
              <p className="mt-2 text-xs font-medium uppercase tracking-[0.2em] text-slate-400">
                API field: {item.actualPropertyName}
              </p>
            ) : null}
          </div>
          <Button variant="outline" onClick={() => setOpen((value) => !value)}>
            {open ? "Hide distribution" : "Expand distribution"}
            {open ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
          </Button>
        </div>
        {open ? (
          <div className="mt-6">
            {item.chartKind === "line" ? (
              <LineChartPanel
                data={item.values}
                description="Number of samples over time"
                title={item.chartTitle}
              />
            ) : (
              <BarChartPanel
                data={item.values}
                description="Number of samples versus values/enums"
                title={item.chartTitle}
              />
            )}
          </div>
        ) : null}
      </CardContent>
    </Card>
  );
}
