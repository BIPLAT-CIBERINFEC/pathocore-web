import { SectionHeader } from "@/components/databrowser/section-header";
import { Card, CardContent } from "@/components/ui/card";

export function AboutPage() {
  return (
    <div className="space-y-6">
      <Card className="surface-shell border-white/70 bg-white/84">
        <CardContent className="px-6 py-8 lg:px-8 lg:py-10">
          <SectionHeader
            description="Espacio reservado para la presentación institucional del proyecto, equipo, objetivos y contexto de uso."
            eyebrow="About Us"
            title="Información del proyecto"
          />
          <div className="mt-6 rounded-[1.8rem] border border-dashed border-slate-200 bg-slate-50/85 p-6 text-sm leading-7 text-slate-600">
            Esta sección queda preparada como placeholder. Aquí podrá entrar el
            contenido institucional, partners, alcance del producto y documentación
            general de PathoCore.
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
