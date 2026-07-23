// src/lib/constants.ts

export const DEFAULT_API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL || "/api/v1";

export const KEYCLOAK_URL = process.env.NEXT_PUBLIC_KEYCLOAK_URL || "";
export const KEYCLOAK_REALM =
  process.env.NEXT_PUBLIC_KEYCLOAK_REALM || "ciberisciii_datahub";
export const KEYCLOAK_CLIENT_ID =
  process.env.NEXT_PUBLIC_KEYCLOAK_CLIENT_ID || "pathocore-web";
