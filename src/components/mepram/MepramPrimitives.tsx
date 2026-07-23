import Link from "next/link";
import { formatInteger } from "@/data/mepramDataBrowser";

export function SectionHeading({
  eyebrow,
  title,
  description,
  action,
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
      <div>
        {eyebrow && (
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#2d2a7d]">{eyebrow}</p>
        )}
        <h2 className="mt-2 text-2xl font-semibold tracking-tight text-slate-950">{title}</h2>
        {description && <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">{description}</p>}
      </div>
      {action}
    </div>
  );
}

export function Surface({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <section
      className={`rounded-[28px] border border-slate-200 bg-white p-5 shadow-[0_16px_40px_rgba(15,23,42,0.05)] sm:p-6 ${className}`}
    >
      {children}
    </section>
  );
}

export function StatCard({
  label,
  value,
  note,
}: {
  label: string;
  value: string;
  note: string;
}) {
  return (
    <div className="rounded-[24px] border border-slate-200 bg-white p-5 shadow-[0_14px_28px_rgba(15,23,42,0.04)]">
      <p className="text-sm text-slate-500">{label}</p>
      <p className="mt-3 text-3xl font-semibold tracking-tight text-slate-950">{value}</p>
      <p className="mt-3 text-sm leading-6 text-slate-600">{note}</p>
    </div>
  );
}

export function HeroMetricCard({
  label,
  value,
  note,
}: {
  label: string;
  value: string;
  note: string;
}) {
  return (
    <div className="rounded-[26px] border border-white/12 bg-white/8 p-5 text-white backdrop-blur-sm">
      <p className="text-xs uppercase tracking-[0.18em] text-indigo-100/90">{label}</p>
      <p className="mt-3 text-3xl font-semibold tracking-tight">{value}</p>
      <p className="mt-3 text-sm leading-6 text-slate-200">{note}</p>
    </div>
  );
}

export function CoverageCard({
  label,
  value,
  description,
}: {
  label: string;
  value: number;
  description: string;
}) {
  return (
    <div className="rounded-[24px] border border-slate-200 bg-slate-50 p-5">
      <div className="flex items-center justify-between gap-4">
        <p className="text-sm font-medium text-slate-700">{label}</p>
        <span className="text-lg font-semibold text-slate-950">{value}%</span>
      </div>
      <div className="mt-4 h-2 rounded-full bg-slate-200">
        <div
          className="h-2 rounded-full bg-[linear-gradient(90deg,#4f46e5,#8b5cf6)]"
          style={{ width: `${value}%` }}
        />
      </div>
      <p className="mt-3 text-sm leading-6 text-slate-600">{description}</p>
    </div>
  );
}

export function SimpleBarChart({
  data,
  format = (value: number) => `${value}`,
  tone = "teal",
}: {
  data: { label: string; value: number }[];
  format?: (value: number) => string;
  tone?: "teal" | "blue" | "slate";
}) {
  const max = Math.max(...data.map((item) => item.value), 1);
  const color =
    tone === "blue"
      ? "bg-[linear-gradient(90deg,#6366f1,#8b5cf6)]"
      : tone === "slate"
        ? "bg-[linear-gradient(90deg,#4338ca,#6d28d9)]"
        : "bg-[linear-gradient(90deg,#4f46e5,#8b5cf6)]";

  return (
    <div className="space-y-4">
      {data.map((item) => (
        <div key={item.label} className="grid grid-cols-[minmax(0,120px)_1fr_auto] items-center gap-3">
          <span className="text-sm text-slate-600">{item.label}</span>
          <div className="h-3 rounded-full bg-slate-100">
            <div className={`h-3 rounded-full ${color}`} style={{ width: `${(item.value / max) * 100}%` }} />
          </div>
          <span className="text-sm font-medium text-slate-900">{format(item.value)}</span>
        </div>
      ))}
    </div>
  );
}

export function Histogram({
  data,
  unit,
}: {
  data: { label: string; value: number }[];
  unit?: string;
}) {
  const max = Math.max(...data.map((item) => item.value), 1);

  return (
    <div>
      <div className="flex h-44 items-end gap-3">
        {data.map((item) => (
          <div key={item.label} className="flex flex-1 flex-col items-center gap-2">
            <div className="text-xs font-medium text-slate-500">{item.value}%</div>
            <div
              className="w-full rounded-t-2xl bg-[linear-gradient(180deg,#8b5cf6,#4f46e5)]"
              style={{ height: `${Math.max((item.value / max) * 100, 12)}%` }}
              title={`${item.label}: ${item.value}%`}
            />
          </div>
        ))}
      </div>
      <div className="mt-3 grid grid-cols-6 gap-3 text-center text-xs text-slate-500">
        {data.map((item) => (
          <div key={item.label}>
            <div>{item.label}</div>
            {unit && <div className="mt-1 uppercase tracking-[0.14em]">{unit}</div>}
          </div>
        ))}
      </div>
    </div>
  );
}

export function TimelineChart({ data }: { data: { label: string; value: number }[] }) {
  const max = Math.max(...data.map((item) => item.value), 1);

  return (
    <div className="space-y-4">
      <div className="flex items-end gap-3 overflow-hidden rounded-[24px] border border-slate-100 bg-slate-50 px-4 py-6">
        {data.map((item) => (
          <div key={item.label} className="flex min-w-0 flex-1 flex-col items-center gap-3">
            <div
              className="w-full rounded-t-[18px] bg-[linear-gradient(180deg,#8b5cf6,#4f46e5)]"
              style={{ height: `${Math.max((item.value / max) * 180, 24)}px` }}
            />
            <div className="text-center">
              <p className="text-sm font-semibold text-slate-900">{formatInteger(item.value)}</p>
              <p className="text-xs text-slate-500">{item.label}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export function DonutStat({
  value,
  label,
}: {
  value: number;
  label: string;
}) {
  const angle = Math.round((value / 100) * 360);
  return (
    <div className="flex items-center gap-4">
      <div
        className="grid h-20 w-20 place-items-center rounded-full"
        style={{
          background: `conic-gradient(#4f46e5 0deg ${angle}deg, #e5e7eb ${angle}deg 360deg)`,
        }}
      >
        <div className="grid h-14 w-14 place-items-center rounded-full bg-white text-sm font-semibold text-slate-950">
          {value}%
        </div>
      </div>
      <div>
        <p className="text-sm text-slate-500">{label}</p>
        <p className="mt-2 text-sm leading-6 text-slate-600">
          Coverage shown directly in the browser to make completeness and interpretability easier to assess.
        </p>
      </div>
    </div>
  );
}

export function DataTable({
  rows,
}: {
  rows: {
    name: string;
    domain: string;
    patients: number;
    events?: number;
    percentage: number;
    coverage: number;
    href?: string;
    vocabulary?: string;
  }[];
}) {
  return (
    <div className="overflow-hidden rounded-[24px] border border-slate-200">
      <div className="grid grid-cols-[minmax(220px,2fr)_120px_110px_110px_110px_160px] gap-4 bg-slate-950 px-5 py-4 text-xs font-semibold uppercase tracking-[0.16em] text-slate-300">
        <span>Concept</span>
        <span>Domain</span>
        <span>Patients</span>
        <span>Events</span>
        <span>% cohort</span>
        <span>Coverage</span>
      </div>
      {rows.map((row) => {
        const content = (
          <>
            <div>
              <p className="font-semibold text-slate-950">{row.name}</p>
              {row.vocabulary && <p className="mt-1 text-xs text-slate-500">{row.vocabulary}</p>}
            </div>
            <span className="text-sm text-slate-600">{row.domain}</span>
            <span className="text-sm text-slate-900">{formatInteger(row.patients)}</span>
            <span className="text-sm text-slate-900">
              {row.events ? formatInteger(row.events) : "—"}
            </span>
            <span className="text-sm text-slate-900">{row.percentage}%</span>
            <span className="text-sm text-slate-900">{row.coverage}%</span>
          </>
        );

        return row.href ? (
          <Link
            key={row.name}
            href={row.href}
            className="grid grid-cols-[minmax(220px,2fr)_120px_110px_110px_110px_160px] gap-4 border-t border-slate-200 bg-white px-5 py-4 hover:bg-slate-50"
          >
            {content}
          </Link>
        ) : (
          <div
            key={row.name}
            className="grid grid-cols-[minmax(220px,2fr)_120px_110px_110px_110px_160px] gap-4 border-t border-slate-200 bg-white px-5 py-4"
          >
            {content}
          </div>
        );
      })}
    </div>
  );
}

export function DomainCard({
  href,
  name,
  description,
  patients,
  concepts,
  coverage,
}: {
  href: string;
  name: string;
  description: string;
  patients: number;
  concepts: number;
  coverage: number;
}) {
  return (
    <Link
      href={href}
      className="group relative overflow-hidden rounded-[28px] border border-slate-200 bg-white p-6 shadow-[0_16px_38px_rgba(15,23,42,0.05)] transition hover:-translate-y-1 hover:border-[#bfb7ee] hover:shadow-[0_20px_52px_rgba(15,23,42,0.08)]"
    >
      <div className="absolute inset-x-0 top-0 h-1 bg-[linear-gradient(90deg,#4f46e5,#8b5cf6,#c084fc)] opacity-80" />
      <div className="flex items-start justify-between gap-4">
        <div>
          <h3 className="text-xl font-semibold text-slate-950">{name}</h3>
          <p className="mt-3 text-sm leading-6 text-slate-600">{description}</p>
        </div>
        <span className="inline-flex whitespace-nowrap rounded-full bg-[#f1efff] px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] leading-none text-[#2d2a7d]">
          {coverage}% coverage
        </span>
      </div>
      <div className="mt-6 grid grid-cols-2 gap-4 border-t border-slate-100 pt-5">
        <div>
          <p className="text-xs uppercase tracking-[0.16em] text-slate-400">Participants</p>
          <p className="mt-2 text-2xl font-semibold text-slate-950">{formatInteger(patients)}</p>
        </div>
        <div>
          <p className="text-xs uppercase tracking-[0.16em] text-slate-400">Concepts</p>
          <p className="mt-2 text-2xl font-semibold text-slate-950">{formatInteger(concepts)}</p>
        </div>
      </div>
      <div className="mt-6 inline-flex items-center gap-2 text-sm font-medium text-[#4f46e5]">
        Explore domain
        <svg viewBox="0 0 24 24" className="h-4 w-4 fill-none stroke-current stroke-2 transition group-hover:translate-x-1">
          <path d="M5 12h14" />
          <path d="m13 5 7 7-7 7" />
        </svg>
      </div>
    </Link>
  );
}

export function InsightPanel({
  title,
  text,
}: {
  title: string;
  text: string;
}) {
  return (
    <div className="rounded-[24px] border border-slate-200 bg-white p-5 shadow-[0_12px_28px_rgba(15,23,42,0.04)]">
      <div className="mb-4 h-10 w-10 rounded-2xl bg-[linear-gradient(135deg,#ede9fe,#818cf8)]" />
      <h3 className="text-lg font-semibold text-slate-950">{title}</h3>
      <p className="mt-3 text-sm leading-6 text-slate-600">{text}</p>
    </div>
  );
}
