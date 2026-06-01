# BIPLAT-CIBERINFEC/pathocore-web: Changelog

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/)
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## v1.0.0 pathocore-web - "Initial Release" 2026/06/01

### `Changed`

- [#1](https://github.com/BIPLAT-CIBERINFEC/pathocore-web/pull/1) Consolidate the first generic PathoCore databrowser views.
- [#2](https://github.com/BIPLAT-CIBERINFEC/pathocore-web/pull/2) Keep the generic databrowser project-agnostic and add the first use-case mockup flow.
- [#4](https://github.com/BIPLAT-CIBERINFEC/pathocore-web/pull/4) Split public databrowser access from Keycloak-protected use-case routes.
- [#5](https://github.com/BIPLAT-CIBERINFEC/pathocore-web/pull/5) Move MEPRAM use-case panels from mock data toward live API-backed data.

### `Added`

- [#1](https://github.com/BIPLAT-CIBERINFEC/pathocore-web/pull/1) Add React/Vite databrowser pages for home, overview, schema, metadata and variants.
- [#2](https://github.com/BIPLAT-CIBERINFEC/pathocore-web/pull/2) Add MEPRAM use-case pages, maps, explorer, alerts and reusable data panels.
- [#3](https://github.com/BIPLAT-CIBERINFEC/pathocore-web/pull/3) Add on-demand metadata property distribution views by pathogen, year and location.
- [#4](https://github.com/BIPLAT-CIBERINFEC/pathocore-web/pull/4) Add Docker test/prod orchestration, Apache, Adminer, Keycloak and reproducible realm rendering.
- [#4](https://github.com/BIPLAT-CIBERINFEC/pathocore-web/pull/4) Add Keycloak PKCE login, auth callback handling and protected use-case route guards.
- [#5](https://github.com/BIPLAT-CIBERINFEC/pathocore-web/pull/5) Add live MEPRAM API client integration and live isolate/data overview support.

### `Fixed`

- [#3](https://github.com/BIPLAT-CIBERINFEC/pathocore-web/pull/3) Hide empty metadata charts while keeping zero-sample properties discoverable.
- [#4](https://github.com/BIPLAT-CIBERINFEC/pathocore-web/pull/4) Fix Docker/Vite Keycloak redirect and callback handling for local testing.
- [#5](https://github.com/BIPLAT-CIBERINFEC/pathocore-web/pull/5) Fix use-case isolate explorer and live MEPRAM rendering edge cases.
- [#6](https://github.com/BIPLAT-CIBERINFEC/pathocore-web/pull/6) Persist Keycloak test realm session/token timeout settings in the rendered import.
- [#6](https://github.com/BIPLAT-CIBERINFEC/pathocore-web/pull/6) Sanitize test realm users to explicit demo-only credentials before public release.

### `Dependencies`

| Tool / library | Version |
| -------------- | ------- |
| React | 18.3.1 |
| Vite | 5.4.10 |
| TypeScript | 5.6.2 |
| Tailwind CSS | 3.4.17 |
| React Router | 6.30.3 |
| Recharts | 3.8.1 |
| framer-motion | 12.38.0 |
| lucide-react | 1.7.0 |
| Keycloak container | 26.6.1 |
| MySQL container | 8.0 |

### `Deprecated`

- [#5](https://github.com/BIPLAT-CIBERINFEC/pathocore-web/pull/5) Keep simulated use-case data only as a development fallback; release deployments should use live API mode.
