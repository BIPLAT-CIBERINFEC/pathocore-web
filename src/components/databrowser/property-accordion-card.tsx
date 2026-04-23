import { useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";
import { PropertyDistributionPanel } from "@/components/databrowser/property-distribution-panel";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import type { ApiCredentials } from "@/types/api";
import type { PropertyDistributionCard } from "@/types/databrowser";

export function PropertyAccordionCard({
  credentials = null,
  item,
}: {
  credentials?: ApiCredentials | null;
  item: PropertyDistributionCard;
}) {
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
              {item.classification ? (
                <Badge variant="outline">{item.classification}</Badge>
              ) : null}
            </div>
            <p className="mt-3 text-sm leading-6 text-slate-500">{item.description}</p>
          </div>
          <Button variant="outline" onClick={() => setOpen((value) => !value)}>
            {open ? "Hide distribution" : "Expand distribution"}
            {open ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
          </Button>
        </div>
        {open ? (
          <div className="mt-6">
            <PropertyDistributionPanel
              credentials={credentials}
              propertyName={item.propertyName}
            />
          </div>
        ) : null}
      </CardContent>
    </Card>
  );
}
