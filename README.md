# PathoCore Web

PathoCore Web is the frontend and local Docker orchestrator for the PathoCore
stack. It runs the web application together with PathoCore API, MePRAM OMOP API,
Keycloak, MySQL services, and local mail tooling for development/testing.

## Stack

- Next.js
- React
- TypeScript
- Tailwind CSS
- Docker Compose
- Keycloak

## Repository Layout

```text
pathocore-web/
  src/                    frontend source
  public/                 static frontend assets
  keycloak/               reproducible realm configuration
  docker/                 container startup helpers
  docker-compose.test.yml local testing stack
  docker-compose.prod.yml production-oriented stack
```

The API repositories are expected as sibling directories when using the
orchestrator:

```text
devel/
  pathocore-web/
  pathocore-api/
  mepram-omop-api/
```

## Local Frontend

```bash
npm install
npm run dev
```

Default local URL:

```text
http://127.0.0.1:3000
```

## Docker Testing Stack

Prepare local configuration:

```bash
cp .env.example .env
```

Start the full testing stack:

```bash
bash container_install.sh --test
```

Start the stack and import testing SQL dumps:

```bash
bash container_install.sh --test \
  --pathocore_api_sql ../pathocore_api_testing_seed.sql \
  --mepram_omop_sql ../dashboard.sql
```

Main local services:

```text
Web:              http://127.0.0.1:3000
PathoCore API:    http://127.0.0.1:8000
MePRAM OMOP API:  http://127.0.0.1:8100
Keycloak:         http://127.0.0.1:8080
Mailpit:          http://127.0.0.1:8025
Adminer:          http://127.0.0.1:8085
```

## Configuration

Use `.env.example` as the public template. Keep real values only in local
`.env` files or deployment-managed environment files.

Frontend-relevant variables:

- `NEXT_PUBLIC_API_BASE_URL`: browser-facing PathoCore API route, normally `/api/v1`.
- `NEXT_PUBLIC_MEPRAM_API_BASE_URL`: browser-facing clinical API route, normally `/api/clinical/v1`.
- `PATHOCORE_API_PROXY_TARGET`: internal proxy target for PathoCore API.
- `MEPRAM_OMOP_API_PROXY_TARGET`: internal proxy target for MePRAM OMOP API.
- `NEXT_PUBLIC_KEYCLOAK_URL`: browser-facing Keycloak URL.
- `NEXT_PUBLIC_KEYCLOAK_REALM`: Keycloak realm.
- `NEXT_PUBLIC_KEYCLOAK_CLIENT_ID`: public frontend client.
- `AUTH_SECRET`: local secret required if NextAuth remains enabled.

## Keycloak Realm

Testing and production realm templates live under `keycloak/`.

Render the testing realm before a clean Keycloak import:

```bash
python keycloak/scripts/render_realm.py --profile test
```

For a full local Keycloak reimport, remove Docker volumes and restart the stack.

## Notes

- Public databrowser routes remain unauthenticated.
- Private use-case routes authenticate through Keycloak.
- The web app does not connect directly to MySQL; it consumes APIs over HTTP.
