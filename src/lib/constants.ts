// src/lib/constants.ts

import { EntryCardContent } from "@/types/databrowser";

export const DEFAULT_API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL || "/api/pathocore/v1";

export const KEYCLOAK_URL = process.env.NEXT_PUBLIC_KEYCLOAK_URL || "";
export const KEYCLOAK_REALM =
  process.env.NEXT_PUBLIC_KEYCLOAK_REALM || "ciberisciii_datahub";
export const KEYCLOAK_CLIENT_ID =
  process.env.NEXT_PUBLIC_KEYCLOAK_CLIENT_ID || "pathocore-web";
export const ENTRY_CARD_CONTENT: Omit<EntryCardContent, "stat">[] = [
  {
    id: "overview",
    title: "Overview of Samples",
    subtitle: "Muestras, crecimiento y cobertura",
    description:
      "Vista general de muestras, evolución temporal, patógenos, regiones y distribución por schema.",
    tags: ["Samples", "Growth", "Coverage"],
  },
  {
    id: "schema",
    title: "Schema",
    subtitle: "Schemas y properties disponibles",
    description:
      "Explorador de schemas activos, clasificaciones y properties definidas en el modelo de datos.",
    tags: ["Schemas", "Projects", "Classification"],
  },
  {
    id: "metadata",
    title: "Metadata",
    subtitle: "Muestra, bioinformática y host",
    description:
      "Propiedades agregadas de muestra, bioinformática y host con filtros por schema y distribuciones.",
    tags: ["Sample metadata", "Bioinfo", "Host"],
  },
  {
    id: "variant",
    title: "Variant",
    subtitle: "Búsqueda y resumen de variantes",
    description:
      "Genomas de referencia, conteos de variantes y búsqueda HGVS conectada a la API real.",
    tags: ["Reference genomes", "Variants", "Projects"],
  },
];
