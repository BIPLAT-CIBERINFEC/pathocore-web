# PathoCore Web

Frontend and Docker orchestrator for the PathoCore stack. The web application
consumes PathoCore API for genomic data and MePRAM OMOP API for aggregated OMOP
data. The frontend never connects directly to MySQL.

## Stack

- Next.js
- React
- TypeScript
- Tailwind CSS
- Docker Compose
- Keycloak

## Requirements

- Node.js 22+ for local frontend development
- npm
- Docker with the Compose plugin
- `pathocore-api` and `mepram-omop-api` cloned as sibling repositories when
  using the Docker orchestrator

## Repository Layout

```text
devel/
  pathocore-web/
  pathocore-api/
  mepram-omop-api/
```

Example clone layout:

```bash
mkdir -p ~/path_to/devel
cd ~/path_to/devel

git clone -b develop https://github.com/BIPLAT-CIBERINFEC/pathocore-api.git pathocore-api
git clone -b develop https://github.com/BU-ISCIII/mepram-omop-api.git mepram-omop-api
git clone -b dev https://github.com/BIPLAT-CIBERINFEC/pathocore-web.git pathocore-web
```

## Local Frontend Only

Use this when the APIs are already running elsewhere:

```bash
cd pathocore-web
cp .env.example .env.local
npm install
npm run dev
```

Default URL:

```text
http://127.0.0.1:3000
```

## Docker orchestrator

Prepare local variables:

```bash
cd pathocore-web
cp .env.example .env
```

Start the full stack:

```bash
bash container_install.sh --test
```

Start the stack and import SQL dumps:

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

The testing stack does not run Apache. It exposes application services directly
for local development.

## Frontend API Routes

The browser uses relative API routes exposed by Next.js. These are frontend
proxy routes, not the final backend prefixes:

```text
/api/pathocore/v1/...       -> PathoCore API /v1/...
/api/omop/v1/...  -> MePRAM OMOP API /v1/...
```

Relevant variables:

```text
NEXT_PUBLIC_API_BASE_URL=/api/pathocore/v1
NEXT_PUBLIC_MEPRAM_API_BASE_URL=/api/omop/v1
PATHOCORE_API_PROXY_TARGET=http://pathocore_api:8000
PATHOCORE_API_PROXY_HOST_HEADER=localhost
MEPRAM_OMOP_API_PROXY_TARGET=http://mepram_omop_api:8000
MEPRAM_OMOP_API_PROXY_HOST_HEADER=localhost
NEXT_PUBLIC_KEYCLOAK_URL=http://127.0.0.1:8080
NEXT_PUBLIC_KEYCLOAK_REALM=ciberisciii_datahub
NEXT_PUBLIC_KEYCLOAK_CLIENT_ID=pathocore-web
AUTH_URL=http://127.0.0.1:3000
AUTH_TRUST_HOST=true
NEXTAUTH_URL=http://127.0.0.1:3000
```

Keep real production values in deployment-managed environment files, not in the
repository.

For production, start from the dedicated template instead:

```bash
cp conf/production.env.example /srv/containers/bind/pathocore-web/production.env
```

Every `CHANGE_ME` value in that file must be reviewed before deployment.

## Production Apache Reverse Proxy

Production runs Apache as a Docker Compose service in the same network as the
application containers. Apache is the only service that should be exposed by the
production compose file.

The Apache configuration is versioned under `conf/` and mounted into the
container by `docker-compose.prod.yml`.

Apache routes requests by DNS host name:

```text
mepram-datahub.<domain>            -> pathocore_web:3000
mepram-api-pathocore.<domain>      -> pathocore_api:8000
mepram-keycloak-pathocore.<domain> -> keycloak:8080
mepram-api-omop.<domain>           -> mepram_omop_api:8000
```

Relevant production variables:

```text
HTTP_BIND_HOST=0.0.0.0
HTTP_PORT=80
PATHOCORE_DATAHUB_SERVER_NAME=mepram-datahub.<domain>
PATHOCORE_API_SERVER_NAME=mepram-api-pathocore.<domain>
PATHOCORE_KEYCLOAK_SERVER_NAME=mepram-keycloak-pathocore.<domain>
MEPRAM_OMOP_API_SERVER_NAME=mepram-api-omop.<domain>
PATHOCORE_FORWARDED_PROTO=https
PATHOCORE_FORWARDED_PORT=443
```

Use deployment-managed environment files for the real DNS values and secrets.
Do not use `.env.example` for production deployments.

## Keycloak

Testing and production realm templates live under `keycloak/`.

Render the testing realm before a clean Keycloak import:

```bash
python keycloak/scripts/render_realm.py --profile test
```

If Keycloak already has a persisted database, changing the JSON is not enough:
remove/recreate the Keycloak volume or update the client configuration manually.
