import { MepramBrowserLayout } from "@/components/mepram/MepramBrowserLayout";

type Props = {
  title: string;
  breadcrumbs?: { label: string; href?: string }[];
};

export function TitleOnlyPage({ title, breadcrumbs = [] }: Props) {
  return (
    <MepramBrowserLayout title={title} breadcrumbs={breadcrumbs}>
      <section className="rounded-[28px] border border-slate-200 bg-white px-6 py-10 shadow-[0_16px_40px_rgba(15,23,42,0.05)]">
        <h2 className="font-serif text-3xl text-slate-950">{title}</h2>
      </section>
    </MepramBrowserLayout>
  );
}
