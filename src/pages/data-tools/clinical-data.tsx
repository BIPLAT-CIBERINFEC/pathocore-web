import { TitleOnlyPage } from "@/components/mepram/TitleOnlyPage";

export default function ClinicalDataPage() {
  return (
    <TitleOnlyPage
      title="Clinical data"
      breadcrumbs={[
        { label: "Data Browser", href: "/data-tools/data-browser" },
        { label: "Clinical data" },
      ]}
    />
  );
}
