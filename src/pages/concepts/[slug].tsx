import Link from "next/link";
import { useRouter } from "next/router";
import { conceptBySlug } from "@/data/mepramDataBrowser";
import { MepramBrowserLayout } from "@/components/mepram/MepramBrowserLayout";
import {
  DonutStat,
  Histogram,
  SectionHeading,
  SimpleBarChart,
  Surface,
  TimelineChart,
} from "@/components/mepram/MepramPrimitives";

export default function ConceptDetailPage() {
  const router = useRouter();
  const concept = conceptBySlug(typeof router.query.slug === "string" ? router.query.slug : undefined);
  const parentLabel =
    concept.domain === "conditions"
      ? "Conditions"
      : concept.domain === "measurements"
        ? "Variable Catalog"
        : "Variable Catalog";
  const parentHref =
    concept.domain === "conditions"
      ? "/data-tools/data-browser/conditions"
      : "/data-tools/data-browser/catalog";

  return (
    <MepramBrowserLayout
      title={concept.name}
      description={concept.summary}
      breadcrumbs={[
       
        { label: "Data browser", href: "/data-tools/data-browser" },
        { label: parentLabel, href: parentHref },
        { label: concept.name },
      ]}
    >
      <div className="grid gap-4 xl:grid-cols-4">
        {[
          ["Patients", concept.patients.toLocaleString("en-US")],
          ["Events", concept.events?.toLocaleString("en-US") ?? "—"],
          ["% of cohort", `${concept.percentage}%`],
          ["Coverage", `${concept.coverage}%`],
        ].map(([label, value]) => (
          <div key={label} className="rounded-[24px] border border-slate-200 bg-white p-5">
            <p className="text-sm text-slate-500">{label}</p>
            <p className="mt-3 text-3xl font-semibold text-slate-950">{value}</p>
          </div>
        ))}
      </div>

      <div className="mt-8 grid gap-8 xl:grid-cols-[1.05fr_0.95fr]">
        <Surface>
          <SectionHeading
            eyebrow="Demographic breakdown"
            title="Aggregate distribution"
            description="The concept detail view keeps the same browser pattern across conditions, measurements, procedures and genomic features."
          />
          <div className="grid gap-8 lg:grid-cols-2">
            <div>
              <p className="mb-4 text-sm font-medium text-slate-700">By sex / gender</p>
              <SimpleBarChart data={concept.distribution.bySex} format={(value) => `${value}%`} />
            </div>
            <div>
              <p className="mb-4 text-sm font-medium text-slate-700">By age group</p>
              <SimpleBarChart data={concept.distribution.byAge} format={(value) => `${value}%`} tone="blue" />
            </div>
          </div>
        </Surface>

        <Surface>
          <SectionHeading title="Terminology metadata" />
          <div className="space-y-4">
            <div className="rounded-[22px] border border-slate-200 bg-slate-50 p-4">
              <p className="text-xs uppercase tracking-[0.16em] text-slate-500">Vocabulary mapping</p>
              <p className="mt-2 text-lg font-semibold text-slate-950">
                {concept.vocabulary.source} {concept.vocabulary.code}
              </p>
              <p className="mt-2 text-sm leading-6 text-slate-600">{concept.vocabulary.label}</p>
            </div>
            <DonutStat value={concept.coverage} label="Cohort coverage" />
            {concept.hierarchy && (
              <div className="rounded-[22px] border border-slate-200 bg-slate-50 p-4">
                <p className="text-xs uppercase tracking-[0.16em] text-slate-500">Source and descendants</p>
                <p className="mt-2 text-sm font-semibold text-slate-900">{concept.hierarchy.source}</p>
                <div className="mt-4 space-y-2">
                  {concept.hierarchy.descendants.map((item) => (
                    <div
                      key={item}
                      className="rounded-2xl border border-slate-200 bg-white px-3 py-3 text-sm text-slate-700"
                    >
                      {item}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </Surface>
      </div>

      <div className="mt-8 grid gap-8 xl:grid-cols-2">
        <Surface>
          <SectionHeading title="Temporal pattern" />
          {concept.distribution.timeline ? (
            <TimelineChart
              data={concept.distribution.timeline.map((item) => ({
                label: item.label,
                value: Number(item.value),
              }))}
            />
          ) : (
            <p className="text-sm text-slate-500">No temporal profile exposed for this concept.</p>
          )}
        </Surface>

        <Surface>
          <SectionHeading title="Distribution shape" />
          {concept.distribution.histogram ? (
            <Histogram data={concept.distribution.histogram} unit={concept.unit} />
          ) : (
            <div className="space-y-3">
              {concept.distribution.timeline?.map((item) => (
                <div key={item.label} className="rounded-[22px] border border-slate-200 bg-slate-50 p-4">
                  <div className="flex items-center justify-between gap-3">
                    <span className="text-sm text-slate-600">{item.label}</span>
                    <span className="text-sm font-semibold text-slate-900">{item.value}%</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Surface>
      </div>

      <div className="mt-8 rounded-[28px] border border-slate-200 bg-white p-6 shadow-[0_16px_40px_rgba(15,23,42,0.05)]">
        <SectionHeading
          eyebrow="Next steps"
          title="Move across the browser without losing context"
          action={
            <Link
              href={parentHref}
              className="rounded-full border border-[#d8d4f8] px-4 py-2 text-sm text-[#2d2a7d] hover:border-[#bfb7ee]"
            >
              Back
            </Link>
          }
        />
        <div className="grid gap-4 md:grid-cols-3">
          {[
            ["Compare adjacent concepts", "Navigate from condition to measurement or microbiology concept"],
            ["Assess terminology quality", "Review mapping source, descendants and coverage in one place"],
            ["Understand aggregate only", "All charts are cohort-level summaries, never patient-level access"],
          ].map(([title, text]) => (
            <div key={title} className="rounded-[22px] border border-slate-200 bg-slate-50 p-4">
              <h3 className="text-base font-semibold text-slate-950">{title}</h3>
              <p className="mt-2 text-sm leading-6 text-slate-600">{text}</p>
            </div>
          ))}
        </div>
      </div>
    </MepramBrowserLayout>
  );
}
