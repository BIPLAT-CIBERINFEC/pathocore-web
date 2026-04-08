import {
  Database,
  Dna,
  FileCode2,
  Layers3,
  Microscope,
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
      <section className="space-y-5">
        <Card className="border-white/70 bg-white/88">
          <CardContent className="p-6">
            <SectionHeader
              description="Espacio reservado para datos agregados, records y navegación analítica tipo OMOP. Esta parte la completará el equipo de frontend."
              eyebrow="Datos agregados"
              title="Datos agregados / Records"
            />
            <div className="mt-6 rounded-[1.8rem] border border-dashed border-slate-200 bg-slate-50/80 p-6">
              <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                <div className="max-w-3xl">
                  <div className="flex h-12 w-12 items-center justify-center rounded-[1.35rem] bg-white">
                    <Database className="h-5 w-5 text-slate-800" />
                  </div>
                  <h3 className="mt-4 text-2xl font-semibold text-slate-950">
                    Área reservada para datos agregados
                  </h3>
                  <p className="mt-3 text-sm leading-7 text-slate-600">
                    Aquí irá la capa de datos agregados y records no genómicos. La tarjeta
                    queda preparada como placeholder de producto.
                  </p>
                </div>
                <Badge variant="outline">Pendiente de implementación</Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </section>

      <section className="space-y-5">
        <Card className="border-white/70 bg-white/88">
          <CardContent className="p-6">
            <div className="rounded-[2rem] border border-slate-200 bg-gradient-to-br from-white via-slate-50 to-emerald-50/50 p-6">
              <div className="max-w-4xl">
                <SectionHeader
                  description="Área de datos genómicos de PathoCore para explorar muestras, schemas, metadata y variantes con datos agregados desde la API."
                  eyebrow="Datos genómicos"
                  title="PathoCore - datos genómicos"
                />
                <div className="mt-6 flex flex-wrap gap-3">
                  <Badge variant="secondary">API real</Badge>
                  <Badge variant="secondary">Exploración genómica</Badge>
                </div>
              </div>
              <div className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                {snapshot.homeCards.map((item, index) => {
                  const Icon = iconMap[item.id];

                  return (
                    <motion.div
                      key={item.id}
                      initial={{ opacity: 0, y: 14 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05, duration: 0.25 }}
                    >
                      <EntryCard
                        compact
                        icon={Icon}
                        item={item}
                        to={item.id === "overview" ? "/overview" : `/${item.id}`}
                      />
                    </motion.div>
                  );
                })}
              </div>
            </div>
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
