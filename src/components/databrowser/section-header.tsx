import type { ReactNode } from "react";

interface SectionHeaderProps {
  action?: ReactNode;
  description: string;
  eyebrow?: string;
  title: string;
}

export function SectionHeader({
  action,
  description,
  eyebrow,
  title,
}: SectionHeaderProps) {
  return (
    <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
      <div className="max-w-3xl">
        {eyebrow ? <p className="section-kicker">{eyebrow}</p> : null}
        <h2 className="mt-2 text-3xl font-semibold tracking-tight text-slate-950">
          {title}
        </h2>
        <p className="mt-3 text-sm leading-7 text-slate-600">{description}</p>
      </div>
      {action ? <div className="shrink-0">{action}</div> : null}
    </div>
  );
}
