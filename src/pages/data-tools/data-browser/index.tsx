import Link from "next/link";
import { useMemo, useState, useEffect } from "react";
import { useRouter } from "next/router";
import {
  cohortSnapshot,
  domainCards,
  featuredConcepts,
  overviewHighlights,
} from "@/data/mepramDataBrowser";
import {
  CoverageCard,
  DataTable,
  DomainCard,
  SectionHeading,
  SimpleBarChart,
  StatCard,
  Surface,
  TimelineChart,
} from "@/components/mepram/MepramPrimitives";
import { MepramBrowserLayout } from "@/components/mepram/MepramBrowserLayout";

// @ts-ignore
import GenomicDataIndex from "@/components/GenomicData";
import ClinicalDataIndex from "@/components/ClinicalData";

const browserCards = [
  {
    title: "Electronic Health Records",
    subtitle: "Clinical summaries",
    value: "18,742",
    detail: "Participants with linked aggregate EHR coverage",
    href: "/data-tools/clinical-data",
  },
  {
    title: "Conditions",
    subtitle: "OMOP-compatible concepts",
    value: "904",
    detail: "Condition concepts available for frequency browsing",
    href: "/data-tools/data-browser/conditions",
  },
  {
    title: "Lab measurements",
    subtitle: "Observational laboratory layer",
    value: "947",
    detail: "Measurements with distributions and coverage metadata",
    href: "/data-tools/data-browser/catalog",
  },
  {
    title: "Procedures",
    subtitle: "Care pathway events",
    value: "412",
    detail: "Procedures executed inside the clinical records",
    href: "/data-tools/data-browser/procedures",
  },
];

export default function DataBrowserDashboard() {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState("");
  const [activeSection, setActiveSection] = useState("clinical");

  const quickMatches = useMemo(() => {
    if (!searchTerm) return [];
    return browserCards.filter(
      (card) =>
        card.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        card.subtitle.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [searchTerm]);

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };


  useEffect(() => {
    const handleCapture = (e: MouseEvent) => {
      let target = e.target as HTMLElement;
      while (target && target.tagName !== "A") {
        target = target.parentElement as HTMLElement;
      }

      if (target && target.tagName === "A") {
        const href = target.getAttribute("href");
        if (href === "/data-tools/clinical-data") {
          e.preventDefault();
          e.stopPropagation();
          scrollToSection("clinical-section");
        } else if (href === "/data-tools/genomic-data") {
          e.preventDefault();
          e.stopPropagation();
          scrollToSection("genomic-section");
        }
      }
    };

    document.addEventListener("click", handleCapture, true);

    return () => {
      document.removeEventListener("click", handleCapture, true);
    };
  }, []);

  useEffect(() => {
    const observerOptions = {
      root: null,
      rootMargin: "-20% 0px -60% 0px",
      threshold: 0,
    };

    const observerCallback = (entries: IntersectionObserverEntry[]) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          if (entry.target.id === "clinical-section") {
            setActiveSection("clinical");
          } else if (entry.target.id === "genomic-section") {
            setActiveSection("genomic");
          }
        }
      });
    };

    const observer = new IntersectionObserver(
      observerCallback,
      observerOptions
    );
    const clinicalElement = document.getElementById("clinical-section");
    const genomicElement = document.getElementById("genomic-section");

    if (clinicalElement) observer.observe(clinicalElement);
    if (genomicElement) observer.observe(genomicElement);

    return () => {
      if (clinicalElement) observer.unobserve(clinicalElement);
      if (genomicElement) observer.unobserve(genomicElement);
    };
  }, []);

  return (
    <div className={`browser-override active-${activeSection}`}>

      <style
        dangerouslySetInnerHTML={{
          __html: `

        a[href="/data-tools/data-browser"] {
          display: none !important;
        }


        .browser-override.active-clinical a[href="/data-tools/clinical-data"],
        .browser-override.active-genomic a[href="/data-tools/genomic-data"] {
          background-color: #4f46e5 !important;
          color: white !important;
          border-color: #4f46e5 !important;
        }


        .browser-override.active-clinical a[href="/data-tools/clinical-data"] *,
        .browser-override.active-genomic a[href="/data-tools/genomic-data"] * {
           color: white !important;
        }
      `,
        }}
      />

      <MepramBrowserLayout
        title={cohortSnapshot.title}
        description={cohortSnapshot.subtitle}
        breadcrumbs={[{ label: "Data browser" }]}
        hidePageHeader
      >
        <section
          id="clinical-section"
          className="mt-4 relative z-20 scroll-mt-36"
        >
          <SectionHeading
            title="Clinical Data Explorers"
            description="Explore clinical cohort distributions, health conditions, laboratory tests, observations, and procedures mapped to standard OMOP vocabularies."
          />
          <ClinicalDataIndex />
        </section>

        <section
          id="genomic-section"
          className="mt-16 relative z-20 scroll-mt-36"
        >
          <SectionHeading
            title="Genomic Data Explorers"
            description="Direct access to primary sequence observations, variant layouts and active data schemas."
          />
          <GenomicDataIndex />
        </section>
      </MepramBrowserLayout>
    </div>
  );
}
