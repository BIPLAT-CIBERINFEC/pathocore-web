import { Bell } from "lucide-react";

import { MepramBrowserLayout } from "@/components/mepram/MepramBrowserLayout";
import { SectionHeading, Surface } from "@/components/mepram/MepramPrimitives";
import { TitleOnlyPage } from "@/components/mepram/TitleOnlyPage";

export default function IAModelsPage() {
  return (
    <MepramBrowserLayout
      title="AI Models"
      description="Artificial intelligence models and analytical tools for future platform capabilities."
      breadcrumbs={[{ label: "AI Models" }]}
    >
      <Surface>
        <div className="flex min-h-[500px] flex-col items-center justify-center px-6 py-16 text-center">
          <Bell className="h-16 w-16 text-slate-300" />

          <p className="mt-6 text-xs font-medium uppercase tracking-[0.2em] text-slate-400">
            COMING SOON
          </p>

          <h2 className="mt-3 text-3xl font-semibold text-slate-900">
            AI Models
          </h2>

          <p className="mt-4 max-w-2xl text-sm leading-6 text-slate-500">
            This feature is currently under development and will be available in
            a future release.
          </p>

          <div className="mt-8 max-w-xl rounded-[1.4rem] border border-slate-200 bg-slate-50 px-6 py-5">
            <p className="text-sm font-semibold text-slate-700">
              🚧 Feature in Progress
            </p>

            <p className="mt-2 text-sm leading-6 text-slate-500">
              We are currently working on the AI Models section. New
              functionalities and analytical capabilities will be available
              soon.
            </p>
          </div>
        </div>
      </Surface>

      {/*
      ORIGINAL PAGE

      <TitleOnlyPage
        title="IA models"
        breadcrumbs={[{ label: "IA models" }]}
      />

      */}
    </MepramBrowserLayout>
  );
}
