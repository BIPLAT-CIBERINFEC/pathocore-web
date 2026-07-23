import Link from "next/link";
import { MepramBrowserLayout } from "@/components/mepram/MepramBrowserLayout";
const snapshotCards = [
  {
    value: "18,742+",
    label: "Participants",
    text: "Aggregate participant cohort.",
    accent: "from-[#ffb157] to-[#f58a2e]",
    icon: (
      <svg viewBox="0 0 64 64" className="h-16 w-16" fill="none">
        <circle cx="32" cy="19" r="10" fill="#fff4e6" stroke="#2d2a7d" strokeWidth="2.5" />
        <path
          d="M18 49v-3c0-6.6 5.4-12 12-12h4c6.6 0 12 5.4 12 12v3"
          fill="url(#people-fill)"
          stroke="#2d2a7d"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M24 34.5c2.2 1.6 4.9 2.4 8 2.4s5.8-.8 8-2.4"
          stroke="#2d2a7d"
          strokeWidth="2.5"
          strokeLinecap="round"
        />
        <defs>
          <linearGradient id="people-fill" x1="18" x2="46" y1="34" y2="49" gradientUnits="userSpaceOnUse">
            <stop stopColor="#ffc36b" />
            <stop offset="1" stopColor="#f58a2e" />
          </linearGradient>
        </defs>
      </svg>
    ),
  },
  {
    value: "31,406+",
    label: "Clinical Episodes",
    text: "Hospital activity summarized across sites.",
    accent: "from-[#9ee6d7] to-[#47c4b0]",
    icon: (
      <svg viewBox="0 0 64 64" className="h-16 w-16" fill="none">
        <path
          d="M18 14h22l8 8v28a4 4 0 0 1-4 4H18a4 4 0 0 1-4-4V18a4 4 0 0 1 4-4Z"
          fill="#ebfbf8"
          stroke="#2d2a7d"
          strokeWidth="2.5"
        />
        <path d="M40 14v10h10" stroke="#2d2a7d" strokeWidth="2.5" strokeLinejoin="round" />
        <path d="M23 31h16" stroke="#2d2a7d" strokeWidth="2.5" strokeLinecap="round" />
        <path d="M23 39h18" stroke="#2d2a7d" strokeWidth="2.5" strokeLinecap="round" />
        <path d="M23 47h12" stroke="#2d2a7d" strokeWidth="2.5" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    value: "4,286+",
    label: "Standard Concepts",
    text: "Mapped concepts ready for public browsing.",
    accent: "from-[#bfe4ff] to-[#78c3ff]",
    icon: (
      <svg viewBox="0 0 64 64" className="h-16 w-16" fill="none">
        <ellipse cx="32" cy="15" rx="15" ry="6.5" fill="#edf6ff" stroke="#2d2a7d" strokeWidth="2.5" />
        <path
          d="M17 15v14c0 3.6 6.7 6.5 15 6.5s15-2.9 15-6.5V15"
          fill="#bde8de"
          stroke="#2d2a7d"
          strokeWidth="2.5"
        />
        <path
          d="M17 29v14c0 3.6 6.7 6.5 15 6.5s15-2.9 15-6.5V29"
          fill="#d8f3ee"
          stroke="#2d2a7d"
          strokeWidth="2.5"
        />
      </svg>
    ),
  },
];

const projectCards = [
  // {
  //   title: "Redlabra",
  //   href: "/use-cases/mepram",
  //   text: "Public project space for network resources and future analytics.",
  // },
  {
    title: "MePRAM",
    href: "/use-cases/mepram",
    text: "Project area for cohort context, data assets and tools.",
  },
];

const browserHighlights = [
  "Cohort overview and domain coverage",
  "Concept catalogue with counts and mappings",
  "Metadata on provenance, standards and access",
];

const modelHighlights = [
  "Explainable AI services",
  "Model cards and validation summaries",
];

export default function HomePage() {
  return (
    <MepramBrowserLayout
      title="Home"
      description="Public access point to MePRAM data resources, tools and use cases spaces."
      breadcrumbs={[{ label: "Home" }]}
      hidePageHeader
    >
      <section className="overflow-hidden rounded-[40px] border border-slate-200 bg-white shadow-[0_28px_80px_rgba(15,23,42,0.08)]">
        <div className="grid lg:grid-cols-[0.88fr_1.12fr]">
          <div className="relative z-10 px-6 py-10 sm:px-10 sm:py-12 lg:px-12 lg:py-16">
            <span className="inline-flex whitespace-nowrap rounded-full border border-[#d8d4f8] bg-[#f7f5ff] px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] leading-none text-[#2d2a7d]">
              MePRAM public research platform
            </span>
            <h2 className="mt-6 max-w-lg font-serif text-[2.2rem] leading-[1.05] text-[#282461] sm:text-[2.9rem]">
              Explore MePRAM data, tools and translational research use cases
            </h2>
            <p className="mt-5 max-w-xl text-base leading-7 text-slate-700">
              MePRAM brings together aggregate clinical, epidemiological and
              genomic resources for public exploration.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                href="/data-tools/data-browser"
                className="rounded-md bg-[#2d2a7d] px-6 py-4 text-sm font-semibold uppercase tracking-[0.05em] !text-white visited:!text-white transition hover:bg-[#25215f] hover:!text-white"
              >
                Explore the Data Browser
              </Link>
              <Link
                href="/ia-models"
                className="rounded-md border border-slate-300 bg-white px-6 py-4 text-sm font-semibold uppercase tracking-[0.05em] text-slate-800 transition hover:border-slate-400"
              >
                Access IA Models
              </Link>
            </div>
          </div>

          <div className="relative min-h-[340px] overflow-hidden lg:min-h-[620px]">
            <div
              className="absolute inset-0 bg-cover bg-center"
              style={{
                backgroundImage:
                  "linear-gradient(90deg, rgba(255,255,255,0.05) 0%, rgba(255,255,255,0) 30%), url('https://images.unsplash.com/photo-1576086213369-97a306d36557?auto=format&fit=crop&w=1600&q=80')",
              }}
            />
            <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(255,255,255,0.75)_0%,rgba(255,255,255,0.18)_28%,rgba(15,23,42,0.08)_100%)]" />
          </div>
        </div>
      </section>

      <section className="mt-10 rounded-[40px] border border-[#ece9fb] bg-[linear-gradient(180deg,#fffdfa,#fff_100%)] px-6 py-10 shadow-[0_20px_56px_rgba(45,42,125,0.06)] sm:px-10 sm:py-12">
        <div className="mx-auto max-w-4xl text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#2d2a7d]">
            Snapshots
          </p>
          <h2 className="mt-3 font-serif text-4xl text-[#282461] sm:text-5xl">
            Data snapshots
          </h2>
          <p className="mx-auto mt-5 max-w-2xl text-base leading-7 text-slate-700">
            A quick view of cohort scale and data breadth across the platform.
          </p>
        </div>

        <div className="mt-10 grid gap-8 lg:grid-cols-3">
          {snapshotCards.map((item) => (
            <div key={item.label} className="text-center">
              <div className="mx-auto grid h-28 w-28 place-items-center rounded-full border border-[#d8d4f8] bg-white shadow-[0_16px_35px_rgba(45,42,125,0.08)]">
                {item.icon}
              </div>
              <p className="mt-6 text-5xl font-semibold tracking-tight text-[#2d2a7d]">
                {item.value}
              </p>
              <p className="mt-2 text-2xl font-semibold text-[#282461]">
                {item.label}
              </p>
              <p className="mx-auto mt-3 max-w-sm text-sm leading-7 text-slate-600">
                {item.text}
              </p>
              <div
                className={`mx-auto mt-6 h-1.5 w-24 rounded-full bg-gradient-to-r ${item.accent}`}
              />
            </div>
          ))}
        </div>
      </section>

      <section className="mt-10 overflow-hidden rounded-[40px] border border-slate-200 bg-white shadow-[0_24px_64px_rgba(15,23,42,0.07)]">
        <div className="grid items-center gap-10 px-6 py-10 sm:px-10 sm:py-12 lg:grid-cols-[0.9fr_1.1fr] lg:px-12 lg:py-14">
          <div className="max-w-xl">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#2d2a7d]">
              Data &amp; tools
            </p>
            <h2 className="mt-3 font-serif text-4xl text-[#282461] sm:text-5xl">
              Data Browser
            </h2>
            <p className="mt-5 text-base leading-7 text-slate-700">
              Explore aggregate cohort statistics, concept inventories and
              metadata.
            </p>
            <div className="mt-6 space-y-3">
              {browserHighlights.map((item) => (
                <div key={item} className="flex gap-3 text-slate-700">
                  <span className="mt-2 h-2.5 w-2.5 shrink-0 rounded-full bg-[#47c4b0]" />
                  <p className="text-base leading-7">{item}</p>
                </div>
              ))}
            </div>
            <Link
              href="/data-tools/data-browser"
              className="mt-8 inline-flex rounded-md bg-[#2d2a7d] px-6 py-4 text-sm font-semibold uppercase tracking-[0.05em] !text-white visited:!text-white transition hover:bg-[#25215f] hover:!text-white"
            >
              Open Data Browser
            </Link>
          </div>

          <div className="mx-auto w-full max-w-[460px]">
            <div className="rounded-[34px] bg-[linear-gradient(180deg,#edf3ff,#ffffff)] p-4 shadow-[0_32px_60px_rgba(45,42,125,0.12)]">
              <div className="rounded-[30px] border border-slate-200 bg-white p-4">
                <div className="mx-auto h-2 w-24 rounded-full bg-slate-200" />
                <div className="mt-4 rounded-[22px] border border-slate-100 bg-slate-50 p-4">
                  <span className="inline-flex rounded-md bg-[#2d2a7d] px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.12em] text-white">
                    Data disclaimer
                  </span>
                  <p className="mt-4 text-sm font-medium text-slate-700">
                    Top conditions by participant count
                  </p>
                  <div className="mt-4 space-y-3">
                    {[
                      ["Sepsis", "100%"],
                      ["Bacteremia", "77%"],
                      ["Respiratory infection", "63%"],
                      ["Septic shock", "51%"],
                      ["Urinary infection", "38%"],
                    ].map(([label, width]) => (
                      <div
                        key={label}
                        className="grid grid-cols-[110px_1fr] items-center gap-3"
                      >
                        <span className="truncate text-xs text-slate-500">
                          {label}
                        </span>
                        <div className="h-4 rounded-full bg-slate-100">
                          <div
                            className="h-4 rounded-full bg-[linear-gradient(90deg,#4D45E1,#47c4b0)]"
                            style={{ width }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                  <p className="mt-5 text-xs leading-5 text-slate-500">
                    Showing aggregate concept frequencies and coverage summaries
                    for public exploration.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="mt-10 overflow-hidden rounded-[40px] border border-slate-200 bg-white shadow-[0_24px_64px_rgba(15,23,42,0.07)]">
        <div className="grid items-center gap-10 px-6 py-10 sm:px-10 sm:py-12 lg:grid-cols-[0.92fr_1.08fr] lg:px-12 lg:py-14">
          <div className="order-2 lg:order-1">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="rounded-[28px] border border-[#d8d4f8] bg-[#f8f7ff] p-5">
                <div className="grid h-14 w-14 place-items-center rounded-2xl bg-white text-[#2d2a7d] shadow-sm">
                  <svg
                    viewBox="0 0 24 24"
                    className="h-8 w-8 fill-none stroke-current stroke-[1.8]"
                  >
                    <path d="M4 17.5V6.8A1.8 1.8 0 0 1 5.8 5h12.4A1.8 1.8 0 0 1 20 6.8v7.4A1.8 1.8 0 0 1 18.2 16H7.5L4 19.5V17.5Z" />
                    <path d="m8 12 2.2-2.2L13 13l3-4" />
                  </svg>
                </div>
                <p className="mt-4 text-lg font-semibold text-[#282461]">
                  Model cards
                </p>
                <p className="mt-2 text-sm leading-7 text-slate-600">
                  Structured summaries for predictive services and validation
                  evidence.
                </p>
              </div>
              <div className="rounded-[28px] border border-slate-200 bg-slate-50 p-5">
                <div className="grid h-14 w-14 place-items-center rounded-2xl bg-white text-[#2d2a7d] shadow-sm">
                  <svg
                    viewBox="0 0 24 24"
                    className="h-8 w-8 fill-none stroke-current stroke-[1.8]"
                  >
                    <path d="M6 20h12" />
                    <path d="M9 20v-5" />
                    <path d="M15 20v-8" />
                    <path d="M12 20v-3" />
                    <path d="M7 7a5 5 0 1 1 10 0c0 1.9-.7 3.1-2.1 4.3-.8.7-1.4 1.3-1.6 2.2h-2.6c-.2-.9-.8-1.5-1.6-2.2C7.7 10.1 7 8.9 7 7Z" />
                  </svg>
                </div>
                <p className="mt-4 text-lg font-semibold text-[#282461]">
                  Analytical services
                </p>
                <p className="mt-2 text-sm leading-7 text-slate-600">
                  Access point for explainable AI workflows layered on platform
                  datasets.
                </p>
              </div>
            </div>
          </div>

          <div className="order-1 max-w-xl lg:order-2">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#2d2a7d]">
              IA models
            </p>
            <h2 className="mt-3 font-serif text-4xl text-[#282461] sm:text-5xl">
              AI-enabled analysis
            </h2>
            <p className="mt-5 text-base leading-7 text-slate-700">
              Access future model catalogues, validation summaries and AI
              workflows.
            </p>
            <div className="mt-6 space-y-3">
              {modelHighlights.map((item) => (
                <div key={item} className="flex gap-3 text-slate-700">
                  <span className="mt-2 h-2.5 w-2.5 shrink-0 rounded-full bg-[#2d2a7d]" />
                  <p className="text-base leading-7">{item}</p>
                </div>
              ))}
            </div>
            <Link
              href="/ia-models"
              className="mt-8 inline-flex rounded-md bg-[#2d2a7d] px-6 py-4 text-sm font-semibold uppercase tracking-[0.05em] !text-white visited:!text-white transition hover:bg-[#25215f] hover:!text-white"
            >
              View IA Models
            </Link>
          </div>
        </div>
      </section>

      <section className="mt-10 rounded-[40px] border border-slate-200 bg-white px-6 py-10 shadow-[0_24px_64px_rgba(15,23,42,0.07)] sm:px-10 sm:py-12">
        <div className="max-w-3xl">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#2d2a7d]">
            Use cases
          </p>
          <h2 className="mt-3 font-serif text-4xl text-[#282461] sm:text-5xl">
            Use cases available
          </h2>
          <p className="mt-5 text-base leading-7 text-slate-700">
            Browse the use cases currently represented in the platform.
          </p>
        </div>

        <div className="mt-8 grid gap-5 lg:grid-cols-2">
          {projectCards.map((project) => (
            <Link
              key={project.title}
              href={project.href}
              className="group rounded-[30px] border border-slate-200 bg-[linear-gradient(180deg,#ffffff,#f9fbfd)] p-6 transition hover:-translate-y-0.5 hover:border-[#cfcaf6] hover:shadow-[0_20px_48px_rgba(45,42,125,0.08)]"
            >
              <div className="flex items-center justify-between gap-4">
                <h3 className="text-2xl font-semibold text-[#282461]">
                  {project.title}
                </h3>
                <span className="inline-flex whitespace-nowrap rounded-full border border-[#d8d4f8] bg-[#f8f7ff] px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.16em] leading-none text-[#2d2a7d]">
                  Use Case
                </span>
              </div>
              <p className="mt-4 max-w-xl text-sm leading-7 text-slate-600">
                {project.text}
              </p>
              <div className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-[#2d2a7d]">
                Open use case
                <svg
                  viewBox="0 0 24 24"
                  className="h-4 w-4 fill-none stroke-current stroke-2 transition group-hover:translate-x-1"
                >
                  <path d="M5 12h14" />
                  <path d="m13 5 7 7-7 7" />
                </svg>
              </div>
            </Link>
          ))}
        </div>
      </section>
    </MepramBrowserLayout>
  );
}
