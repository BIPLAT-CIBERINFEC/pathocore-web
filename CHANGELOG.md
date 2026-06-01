# BIPLAT-CIBERINFEC/pathocore-web: Changelog

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/)
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## v1.0.0 pathocore-web - "Initial Release" 2026/06/01

### `Changed`

- Consolidated the generic genomic databrowser as the main first-screen experience.
- Connected overview, schema, metadata and variant pages to live `pathocore-api` endpoints.
- Moved use-case authentication to Keycloak with browser-side PKCE login.

### `Added`

- Added React/Vite frontend with Tailwind styling, reusable UI primitives and app shell navigation.
- Added databrowser pages for overview KPIs, schema exploration, metadata distributions and HGVS variant search.
- Added MEPRAM use-case pages for data overview, isolate explorer, maps and alerts.
- Added Docker Compose orchestration for local test stacks with web, API, MySQL, Keycloak and Adminer.
- Added reproducible Keycloak realm rendering for test and production profile templates.

### `Fixed`

- Fixed public access for generic databrowser pages while keeping use-case pages behind Keycloak.
- Fixed Keycloak callback/login wiring for the local test stack.
- Sanitized test realm users to use explicit demo-only credentials before public release.
- Fixed metadata and property-distribution rendering when samples or values are missing.
- Fixed use-case isolate explorer display and live data integration issues.

### `Dependencies`

- React 18, Vite, TypeScript, Tailwind CSS, React Router, Recharts, framer-motion, lucide-react and Radix/shadcn-style UI primitives.

### `Deprecated`

- Mock/simulated use-case data remains available only as a development fallback; release deployments should use live API mode.
