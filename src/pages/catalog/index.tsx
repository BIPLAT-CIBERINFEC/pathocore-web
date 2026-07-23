import { useMemo, useState } from "react";
import Link from "next/link";
import { domainCatalogRows, domainCards } from "@/data/mepramDataBrowser";
import { MepramBrowserLayout } from "@/components/mepram/MepramBrowserLayout";
import { DataTable, SectionHeading, Surface } from "@/components/mepram/MepramPrimitives";

export default function CatalogPage() {
  const [domainFilter, setDomainFilter] = useState("all");
  const [query, setQuery] = useState("");

  const filteredRows = useMemo(() => {
    const term = query.trim().toLowerCase();
    return domainCatalogRows.filter((row) => {
      const domainMatch = domainFilter === "all" || row.domain === domainFilter;
      const queryMatch =
        !term ||
        `${row.name} ${row.domain} ${row.vocabulary.source} ${row.vocabulary.code}`
          .toLowerCase()
          .includes(term);
      return domainMatch && queryMatch;
    });
  }, [domainFilter, query]);

  return (
    <MepramBrowserLayout
      title="Variable catalog"
      description="Searchable inventory of concepts and variables organized by domains for public aggregate exploration."
      breadcrumbs={[
       
        { label: "Data browser", href: "/data-tools/data-browser" },
        { label: "Variable Catalog" },
      ]}
    >
      <Surface className="mb-8">
        <SectionHeading
          eyebrow="Search across data types"
          title="Find concepts by name, domain or terminology"
          description="This view combines cards, filters and tables so the user can move from broad browsing into exact concept lookup without changing mental model."
        />
        <div className="grid gap-4 lg:grid-cols-[1.2fr_0.8fr]">
          <label className="block">
            <span className="mb-2 block text-sm font-medium text-slate-700">Search</span>
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Sepsis, lactate, LOINC 2524-7, piperacillin..."
              className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none focus:border-[#8d85dd] focus:bg-white"
            />
          </label>
          <label className="block">
            <span className="mb-2 block text-sm font-medium text-slate-700">Filter by domain</span>
            <select
              value={domainFilter}
              onChange={(event) => setDomainFilter(event.target.value)}
              className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none focus:border-[#8d85dd] focus:bg-white"
            >
              <option value="all">All domains</option>
              {domainCards.map((domain) => (
                <option key={domain.id} value={domain.id}>
                  {domain.name}
                </option>
              ))}
            </select>
          </label>
        </div>
      </Surface>

      <div className="mb-8 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {domainCards.slice(0, 4).map((domain) => (
          <div key={domain.id} className="rounded-[24px] border border-slate-200 bg-white p-5">
            <div className="flex items-center justify-between gap-3">
              <h3 className="text-base font-semibold text-slate-950">{domain.name}</h3>
              <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">
                {domain.coverage}%
              </span>
            </div>
            <p className="mt-2 text-sm leading-6 text-slate-600">{domain.description}</p>
          </div>
        ))}
      </div>

      <SectionHeading
        title={`Catalog results (${filteredRows.length})`}
        action={
          <Link
            href="/data-tools/data-browser/metadata"
            className="rounded-full border border-[#d8d4f8] px-4 py-2 text-sm text-[#2d2a7d] hover:border-[#bfb7ee]"
          >
            Open metadata
          </Link>
        }
      />
      <DataTable
        rows={filteredRows.map((concept) => ({
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
    </MepramBrowserLayout>
  );
}
