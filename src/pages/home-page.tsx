import {
  Dna,
  FileCode2,
  Layers3,
  Microscope,
  ScanSearch,
  Sparkles,
} from "lucide-react";
import { motion } from "framer-motion";
import { DataStatusPanel } from "@/components/databrowser/data-status-panel";
import { EntryCard } from "@/components/databrowser/entry-card";
import { SectionHeader } from "@/components/databrowser/section-header";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { useDatabrowser } from "@/hooks/use-databrowser";

const iconMap = {
  metadata: Layers3,
  overview: Microscope,
  schema: FileCode2,
  variant: Dna,
};

export function DatabrowserHomePage() {
  const { error, refresh, snapshot, status } = useDatabrowser();

  if (!snapshot) {
    return <DataStatusPanel error={error} onRetry={() => void refresh()} status={status} />;
  }

  return (
    <div className="space-y-6">
      <Card className="surface-shell overflow-hidden border-white/70 bg-white/84">
        <CardContent className="relative px-6 py-8 lg:px-8 lg:py-10">
          <div className="absolute right-0 top-0 h-40 w-40 rounded-full bg-teal-700/10 blur-3xl" />
          <SectionHeader
            description="Primera fase del frontend real para PathoCore. Esta home actua como puerta de entrada a las cuatro tarjetas principales del databrowser y resume el estado agregado del dataset actualmente visible por la API."
            eyebrow="Databrowser Home"
            title="A structural snapshot of the PathoCore genomic database"
          />
          <div className="mt-8 flex flex-wrap gap-3">
            <Badge variant="secondary">
              <Sparkles className="mr-1 h-3.5 w-3.5" />
              Real API integration
            </Badge>
            <Badge variant="secondary">
              <ScanSearch className="mr-1 h-3.5 w-3.5" />
              Aggregated structural browsing
            </Badge>
          </div>
        </CardContent>
      </Card>

      <section className="grid gap-5 xl:grid-cols-2 2xl:grid-cols-4">
        {snapshot.homeCards.map((item, index) => {
          const Icon = iconMap[item.id];
          return (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05, duration: 0.25 }}
            >
              <EntryCard icon={Icon} item={item} to={item.id === "overview" ? "/overview" : `/${item.id}`} />
            </motion.div>
          );
        })}
      </section>

      <section className="grid gap-5 lg:grid-cols-[1.3fr_1fr]">
        <Card className="border-white/70 bg-white/88">
          <CardContent className="p-6">
            <SectionHeader
              description="Las primeras lecturas agregadas de la API ya permiten distinguir el peso de las muestras, la organizacion de schemas y la cobertura actual de metadata visible."
              eyebrow="Live Snapshot"
              title="What this first build is already surfacing"
            />
            <div className="mt-6 grid gap-4 md:grid-cols-2">
              {snapshot.overview.kpis.map((kpi) => (
                <div
                  key={kpi.label}
                  className="rounded-[1.5rem] border border-slate-200 bg-slate-50/80 p-4"
                >
                  <p className="text-sm text-slate-500">{kpi.label}</p>
                  <p className="mt-2 text-2xl font-semibold text-slate-950">
                    {kpi.value}
                  </p>
                  <p className="mt-1 text-xs leading-5 text-slate-500">{kpi.note}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="border-white/70 bg-slate-950 text-white">
          <CardContent className="p-6">
            <p className="section-kicker text-teal-200">Current Caveats</p>
            <h2 className="mt-2 text-3xl font-semibold tracking-tight">
              API gaps stay visible
            </h2>
            <div className="mt-5 space-y-4 text-sm leading-7 text-slate-300">
              <p>
                Metadata complex fields nested inside arrays/objects are not exposed by
                the current `sample metadata` endpoint, so this frontend aggregates only
                what the backend returns today.
              </p>
              <p>
                Variant impact classes are not available in v1. The view is prepared and
                documented without inventing synthetic data.
              </p>
            </div>
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
