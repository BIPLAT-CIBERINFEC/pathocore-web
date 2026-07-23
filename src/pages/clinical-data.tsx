import Head from "next/head";
import ClinicalDataIndex from "@/components/ClinicalData/index";

export default function ClinicalDataPage() {
  return (
    <>
      <Head>
        <title>Clinical Data | Mepram Data Browser</title>
        <meta
          name="description"
          content="Explorador de datos clínicos y cohorte OMOP"
        />
      </Head>


      <div className="min-h-screen bg-[#f8fafc] px-4 sm:px-6 lg:px-8 py-8">
        <div className="max-w-[1600px] mx-auto">
          <div className="mb-2">
            <h1 className="text-3xl font-bold text-slate-900 tracking-tight font-serif">
              Clinical Data Browser
            </h1>
            <p className="text-sm text-slate-500 mt-2">
              OMOP CDM structural view. Explore patient cohorts, medical
              domains, and aggregated measurements.
            </p>
          </div>

  
          <ClinicalDataIndex />
        </div>
      </div>
    </>
  );
}
