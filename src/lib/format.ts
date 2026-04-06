const compactNumber = new Intl.NumberFormat("es-ES", {
  notation: "compact",
  maximumFractionDigits: 1,
});

const integerNumber = new Intl.NumberFormat("es-ES");

const percentFormatter = new Intl.NumberFormat("es-ES", {
  maximumFractionDigits: 1,
  style: "percent",
});

const longDateFormatter = new Intl.DateTimeFormat("es-ES", {
  dateStyle: "medium",
  timeStyle: "short",
});

export function formatCompactNumber(value: number) {
  if (!Number.isFinite(value)) {
    return "0";
  }

  return compactNumber.format(value);
}

export function formatInteger(value: number) {
  if (!Number.isFinite(value)) {
    return "0";
  }

  return integerNumber.format(value);
}

export function formatPercent(part: number, total: number) {
  if (total <= 0 || !Number.isFinite(part)) {
    return "0%";
  }

  return percentFormatter.format(part / total);
}

export function formatDateTime(value?: string | null) {
  if (!value) {
    return "No disponible";
  }

  const parsed = new Date(value);

  if (Number.isNaN(parsed.getTime())) {
    return value;
  }

  return longDateFormatter.format(parsed);
}

export function stripOntology(value: string) {
  return value.replace(/\s*\[[^\]]+\]\s*/g, "").trim();
}

export function humanizePropertyName(value: string) {
  return value
    .replace(/_/g, " ")
    .replace(/\b\w/g, (match) => match.toUpperCase());
}

export function truncateLabel(value: string, max = 28) {
  return value.length <= max ? value : `${value.slice(0, max - 1)}…`;
}
