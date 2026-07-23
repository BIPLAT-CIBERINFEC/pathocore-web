import Link from "next/link";
import {
  cohortSnapshot,
  domainCards,
  domainCatalogRows,
} from "@/data/mepramDataBrowser";
import { MepramBrowserLayout } from "@/components/mepram/MepramBrowserLayout";
import {
  DataTable,
  SectionHeading,
  SimpleBarChart,
  Surface,
} from "@/components/mepram/MepramPrimitives";

const conditionsDomain = domainCards.find((domain) => domain.id === "conditions");
const conditionRows = domainCatalogRows.filter((item) => item.domain === "conditions");

export default function ConditionsBrowserPage() {
  return (
    <MepramBrowserLayout
      title="Conditions"
      description="Aggregate condition concepts with cohort counts, top frequencies and detailed drill-down into individual concepts."
      breadcrumbs={[
        { label: "Data Browser", href: "/data-tools/data-browser" },        
        { label: "Conditions" },
      ]}
    >
      <section className="overflow-hidden rounded-[40px] border border-[#ddd9f7] bg-white shadow-[0_28px_80px_rgba(45,42,125,0.08)]">
        <div className="px-6 py-8 sm:px-10 sm:py-10 lg:px-12">
          <div className="max-w-3xl">
            <div className="max-w-3xl">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#2d2a7d]">
                Conditions
              </p>
              <h1 className="mt-3 font-serif text-4xl leading-tight text-[#282461] sm:text-[3rem]">
                Condition concepts in the MePRAM cohort
              </h1>
              <p className="mt-4 max-w-2xl text-base leading-7 text-slate-700">
                Explore the domain inventory, the most frequent condition concepts and the detailed
                aggregate view of each condition.
              </p>
            </div>
          </div>

          <div className="mt-8 grid gap-4 sm:grid-cols-3">
            <div className="rounded-[24px] border border-[#ddd9f7] bg-[#f8f7ff] p-5">
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#6b78a8]">
                Participants
              </p>
              <p className="mt-3 text-3xl font-semibold text-[#282461]">
                {conditionsDomain?.patients.toLocaleString("en-US")}
              </p>
            </div>
            <div className="rounded-[24px] border border-[#ddd9f7] bg-[#f8f7ff] p-5">
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#6b78a8]">
                Concepts
              </p>
              <p className="mt-3 text-3xl font-semibold text-[#282461]">
                {conditionsDomain?.concepts.toLocaleString("en-US")}
              </p>
            </div>
            <div className="rounded-[24px] border border-[#ddd9f7] bg-[#f8f7ff] p-5">
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#6b78a8]">
                Coverage
              </p>
              <p className="mt-3 text-3xl font-semibold text-[#282461]">{conditionsDomain?.coverage}%</p>
            </div>
          </div>
        </div>
      </section>

      <section className="mt-10 grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
        <Surface className="border-[#ece9fb] shadow-[0_20px_56px_rgba(45,42,125,0.06)]">
          <SectionHeading
            title="Top condition concepts"
            description="Most frequent condition concepts in the aggregate cohort."
          />
          <SimpleBarChart data={cohortSnapshot.topConditions} format={(value) => `${value}%`} />
        </Surface>

        <Surface className="border-[#ece9fb] shadow-[0_20px_56px_rgba(45,42,125,0.06)]">
          <SectionHeading
            title="What this view provides"
            description="This page corresponds to the domain-to-concept exploration layer requested by the client."
          />
          <div className="grid gap-4 sm:grid-cols-2">
            {[
              ["Inventory", "Count of concepts available in the conditions domain."],
              ["Top concepts", "Most frequent conditions presented as a chart."],
              ["Summary table", "Events, patients and cohort share per concept."],
              ["Detail access", "Direct entry into concept-level demographic analysis."],
            ].map(([title, text]) => (
              <div key={title} className="rounded-[22px] border border-slate-200 bg-slate-50 p-4">
                <h3 className="text-base font-semibold text-[#282461]">{title}</h3>
                <p className="mt-2 text-sm leading-6 text-slate-600">{text}</p>
              </div>
            ))}
          </div>
        </Surface>
      </section>

      <section className="mt-10">
        <SectionHeading
          title="Condition summary table"
          description="Representative condition concepts with events, patients and percentage of cohort."
        />
        <DataTable
          rows={conditionRows.map((concept) => ({
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
      </section>
    </MepramBrowserLayout>
  );
}
