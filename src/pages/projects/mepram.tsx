import { TitleOnlyPage } from "@/components/mepram/TitleOnlyPage";

export default function MepramProjectPage() {
  return (
    <TitleOnlyPage
      title="Mepram"
      breadcrumbs={[{ label: "Projects" }, { label: "Mepram" }]}
    />
  );
}
