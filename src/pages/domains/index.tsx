import Link from "next/link";
import { domainCards } from "@/data/mepramDataBrowser";
import { MepramBrowserLayout } from "@/components/mepram/MepramBrowserLayout";
import { DomainCard, SectionHeading, Surface } from "@/components/mepram/MepramPrimitives";

export default function MepramDomainsPage() {
  return (
    <MepramBrowserLayout
      title="Data domains"
      description="Organized exploration layer inspired by public cohort browsers: browse by domain first, then move into concept-level detail."
      breadcrumbs={[
        { label: "Data Browser", href: "/" },
        { label: "Domains" },
      ]}
    >
      <Surface className="mb-8">
        <SectionHeading
          eyebrow="Navigation architecture"
          title="From cohort overview to domain detail"
          description="Use this view to choose a data surface before moving into variable catalogs or concept-level detail."
        />
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {[
            ["1", "Cohort Overview", "High-level descriptive landing with reach and coverage"],
            ["2", "Domain Browser", "Clinical, microbiology, genomics and OMOP-compatible collections"],
            ["3", "Concept Detail", "Demographic breakdown, temporal shape and terminology metadata"],
            ["4", "Metadata Catalog", "Institutional dataset framing, provenance and interoperability"],
          ].map(([step, title, text]) => (
            <div key={step} className="rounded-[24px] border border-slate-200 bg-slate-50 p-5">
              <div className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-slate-950 text-sm font-semibold text-white">
                {step}
              </div>
              <h3 className="mt-4 text-lg font-semibold text-slate-950">{title}</h3>
              <p className="mt-2 text-sm leading-6 text-slate-600">{text}</p>
            </div>
          ))}
        </div>
      </Surface>

      <SectionHeading
        title="Available domains"
        action={
          <Link
            href="/catalog"
            className="rounded-full border border-slate-200 px-4 py-2 text-sm text-slate-700 hover:border-slate-300"
          >
            Search all variables
          </Link>
        }
      />
      <div className="grid gap-5 md:grid-cols-2 2xl:grid-cols-3">
        {domainCards.map((domain) => (
          <DomainCard
            key={domain.id}
            href={domain.id === "clinical" ? "/domains/clinical-data" : "/catalog"}
            name={domain.name}
            description={domain.description}
            patients={domain.patients}
            concepts={domain.concepts}
            coverage={domain.coverage}
          />
        ))}
      </div>
    </MepramBrowserLayout>
  );
}
