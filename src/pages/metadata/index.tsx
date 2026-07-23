import { metadataSections } from "@/data/mepramDataBrowser";
import { MepramBrowserLayout } from "@/components/mepram/MepramBrowserLayout";
import { SectionHeading, Surface } from "@/components/mepram/MepramPrimitives";

export default function MetadataPage() {
  return (
    <MepramBrowserLayout
      title="Metadata catalog"
      description="Institutional layer for dataset framing, provenance, interoperability and public access conditions, aligned with a HealthDCAT-AP style structure."
      breadcrumbs={[
              { label: "Data browser", href: "/data-tools/data-browser" },
        { label: "Metadata Catalog" },
      ]}
    >
      <Surface className="mb-8">
        <SectionHeading
          eyebrow="Dataset documentation"
          title="Metadata catalog"
          description="Governance, access and interoperability information presented in the same visual language as the rest of the browser."
        />
      </Surface>

      <div className="grid gap-6 xl:grid-cols-2">
        {metadataSections.map((section) => (
          <Surface key={section.title}>
            <SectionHeading title={section.title} />
            <div className="overflow-hidden rounded-[24px] border border-slate-200">
              {section.items.map(([label, value], index) => (
                <div
                  key={label}
                  className={`grid grid-cols-[180px_1fr] gap-4 px-5 py-4 ${
                    index > 0 ? "border-t border-slate-200" : ""
                  }`}
                >
                  <p className="text-sm font-medium text-slate-500">{label}</p>
                  <p className="text-sm leading-6 text-slate-700">{value}</p>
                </div>
              ))}
            </div>
          </Surface>
        ))}
      </div>
    </MepramBrowserLayout>
  );
}
