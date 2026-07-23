# PathoCore Import Notes

This branch is prepared as a clean import base for the Sombradoble frontend.

## Repository Hygiene

Generated files and local configuration must not be committed:

- `.env`
- `.next/`
- `node_modules/`
- `__MACOSX/`
- `tsconfig.tsbuildinfo`

Use `.env.example` as the public template and keep real values only in local
`.env` files or deployment-managed environment files.

## Integration Notes

The visual Next.js implementation is intentionally left untouched in this
cleanup branch. The next integration pass should focus on:

- replacing hardcoded localhost API URLs with configurable relative routes;
- aligning PathoCore API calls with `/api/v1`;
- aligning clinical API calls behind a dedicated proxy route;
- choosing one Keycloak authentication implementation;
- replacing the bundled Keycloak test realm with the current PathoCore realm
  rendering/import system before this code becomes the official web frontend.
