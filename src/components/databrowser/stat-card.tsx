import type { LucideIcon } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

interface StatCardProps {
  icon: LucideIcon;
  label: string;
  note: string;
  value: string;
}

export function StatCard({ icon: Icon, label, note, value }: StatCardProps) {
  return (
    <Card className="overflow-hidden border-white/70 bg-white/88">
      <CardContent className="p-5">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-sm text-slate-500">{label}</p>
            <p className="mt-3 text-3xl font-semibold tracking-tight text-slate-950">
              {value}
            </p>
            <p className="mt-2 text-xs leading-5 text-slate-500">{note}</p>
          </div>
          <div className="rounded-[1.25rem] bg-slate-100 p-3">
            <Icon className="h-5 w-5 text-slate-700" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
