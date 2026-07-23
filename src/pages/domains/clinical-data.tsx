import Link from "next/link";
import {
  concepts,
  cohortSnapshot,
  featuredConcepts,
} from "@/data/mepramDataBrowser";
import { MepramBrowserLayout } from "@/components/mepram/MepramBrowserLayout";
import {
  DataTable,
  SectionHeading,
  SimpleBarChart,
  Surface,
} from "@/components/mepram/MepramPrimitives";

const clinicalHighlights = featuredConcepts.filter((concept) =>
  ["conditions", "procedures", "drugs", "measurements"].includes(concept.domain),
);

export default function ClinicalDomainPage() {
  return (
    <MepramBrowserLayout
      title="Clinical data"
      description="A domain page tuned for translational researchers: acute severity, biomarker activity, therapeutic exposure and intervention intensity in one cohesive workspace."
      breadcrumbs={[
        { label: "Data Browser" },
        { label: "Clinical data" },
      ]}
    >
      <div className="grid gap-8 xl:grid-cols-[1.05fr_0.95fr]">
        <Surface>
          <SectionHeading
            eyebrow="Domain synopsis"
            title="Clinical signal density"
            description="MePRAM concentrates the most frequently queried translational features into a domain view that combines top concepts, severity proxies and intervention markers."
          />
          <div className="grid gap-6 lg:grid-cols-2">
            <div>
              <p className="mb-4 text-sm font-medium text-slate-700">Top conditions</p>
              <SimpleBarChart
                data={cohortSnapshot.topConditions}
                format={(value) => `${value}%`}
                tone="teal"
              />
            </div>
            <div>
              <p className="mb-4 text-sm font-medium text-slate-700">Top measurements</p>
              <SimpleBarChart
                data={cohortSnapshot.topMeasurements}
                format={(value) => `${value}%`}
                tone="blue"
              />
            </div>
          </div>
        </Surface>

        <Surface>
          <SectionHeading title="Clinical domain filters" />
          <div className="grid gap-4 md:grid-cols-2">
            {[
              ["Acute severity", "Sepsis, septic shock, ICU admission, lactate"],
              ["Therapeutics", "Antibiotics, vasoactive agents, treatment patterns"],
              ["Procedural intensity", "Cultures, ventilation, lines, renal replacement therapy"],
              ["Coverage lens", "Show concept prevalence, events and mapping completeness"],
            ].map(([title, text]) => (
              <div key={title} className="rounded-[24px] border border-slate-200 bg-slate-50 p-5">
                <h3 className="text-base font-semibold text-slate-950">{title}</h3>
                <p className="mt-2 text-sm leading-6 text-slate-600">{text}</p>
              </div>
            ))}
          </div>
        </Surface>
      </div>

      <div className="mt-8">
        <SectionHeading
          title="High-value concepts in clinical data"
          action={
            <Link
              href="/data-tools/data-browser/catalog"
              className="rounded-full border border-slate-200 px-4 py-2 text-sm text-slate-700 hover:border-slate-300"
            >
              Go to variable catalog
            </Link>
          }
        />
        <DataTable
          rows={clinicalHighlights.map((concept) => ({
            name: concept.name,
            domain: concept.domain,
            patients: concept.patients,
            events: concept.events,
            percentage: concept.percentage,
            coverage: concept.coverage,
            href: `/data-tools/data-browser/concepts/${concept.slug}`,
            vocabulary: `${concept.vocabulary.source} ${concept.vocabulary.code}`,
          }))}
        />
      </div>

      <div className="mt-8 grid gap-8 xl:grid-cols-2">
        <Surface>
          <SectionHeading
            eyebrow="Product behavior"
            title="Detail pattern carried across the whole browser"
            description="Every concept detail screen keeps the same structure: descriptive header, breakdown by demographics, temporal shape and metadata panel."
          />
          <div className="space-y-3">
            {clinicalHighlights.slice(0, 4).map((concept) => (
              <Link
                key={concept.slug}
                href={`/data-tools/data-browser/concepts/${concept.slug}`}
                className="flex items-start justify-between gap-4 rounded-[22px] border border-slate-200 px-4 py-4 hover:bg-slate-50"
              >
                <div>
                  <p className="font-semibold text-slate-950">{concept.name}</p>
                  <p className="mt-1 text-sm text-slate-500">{concept.summary}</p>
                </div>
                <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold uppercase tracking-[0.14em] text-slate-600">
                  {concept.domain}
                </span>
              </Link>
            ))}
          </div>
        </Surface>

        <Surface>
          <SectionHeading title="Concept inventory excerpt" />
          <div className="space-y-4">
            {concepts
              .filter((concept) => ["conditions", "measurements", "procedures", "drugs"].includes(concept.domain))
              .slice(0, 5)
              .map((concept) => (
                <div key={concept.slug} className="rounded-[22px] border border-slate-200 bg-slate-50 p-4">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="font-semibold text-slate-950">{concept.name}</p>
                      <p className="mt-1 text-sm text-slate-500">
                        {concept.vocabulary.source} {concept.vocabulary.code}
                      </p>
                    </div>
                    <span className="text-sm font-semibold text-slate-900">{concept.coverage}%</span>
                  </div>
                  <div className="mt-3 h-2 rounded-full bg-slate-200">
                    <div
                      className="h-2 rounded-full bg-[linear-gradient(90deg,#1d4ed8,#0f766e)]"
                      style={{ width: `${concept.coverage}%` }}
                    />
                  </div>
                </div>
              ))}
          </div>
        </Surface>
      </div>
    </MepramBrowserLayout>
  );
}
