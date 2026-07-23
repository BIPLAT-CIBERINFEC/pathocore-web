import Link from "next/link";
import { useRouter } from "next/router";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

const navigationItems = [
  { label: "Home", to: "/" },
  { label: "Overview", to: "/overview" },
  { label: "Schema", to: "/schema" },
  { label: "Metadata", to: "/metadata" },
  { label: "Variant", to: "/variant" },
];

interface GenomicPageHeaderProps {
  currentSection: string;
  sectionDescription: string;
}

export function GenomicPageHeader({
  currentSection,
  sectionDescription,
}: GenomicPageHeaderProps) {
  const router = useRouter();

  return (
    <Card
      className="surface-shell border-white/70 bg-white/84"
      data-route-scroll-anchor="genomic"
    >
      <CardContent className="px-6 py-8 lg:px-8 lg:py-10">
        <p className="section-kicker">Genomic data</p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight text-slate-950">
          PathoCore - genomic data
        </h1>
        <p className="mt-3 max-w-3xl text-sm leading-7 text-slate-600">
          PathoCore genomic data area to explore samples, schemas, metadata and
          variants with data added from the API.
        </p>

        <div className="mt-6 flex flex-wrap gap-2">
          {navigationItems.map((item) => {
            const isActive = router.asPath === item.to;

            return (
              <Link
                key={item.to}
                href={item.to}
                className={cn(
                  buttonVariants({
                    size: "sm",
                    variant: isActive ? "default" : "outline",
                  }),
                  "rounded-full"
                )}
              >
                {item.label}
              </Link>
            );
          })}
        </div>

        <div className="mt-6 rounded-[1.6rem] border border-slate-200 bg-slate-50/85 px-5 py-5">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div className="max-w-3xl">
              <Badge variant="strong">Current section: {currentSection}</Badge>
              <p className="mt-3 text-sm leading-7 text-slate-600">
                {sectionDescription}
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
