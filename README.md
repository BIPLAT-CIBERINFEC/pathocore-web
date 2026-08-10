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
```

`AUTH_URL` is the public web URL used by Auth.js;
PathoCore API host settings use the explicit `PATHOCORE_API_LOCAL_SERVER_IP`
and `PATHOCORE_API_DNS_URL` names in the environment files.

Keep real production values in deployment-managed environment files, not in the
repository.

For production, start from the dedicated template instead:

```bash
cp conf/production.env.example /srv/containers/bind/pathocore-web/production.env
```

Every `CHANGE_ME` value in that file must be reviewed before deployment.

## Important Environment Variables

Use `.env.example` for local testing and `conf/production.env.example` as the
starting point for server deployments. Do not commit real deployment files.

### Public Web URLs

These values must match the URL used by users in the browser:

| Variable | Example | Purpose |
|---|---|---|
| `AUTH_URL` | `https://mepram-datahub.<domain>` | Public URL of the web app used by Auth.js session handling. |
| `NEXT_PUBLIC_KEYCLOAK_URL` | `https://mepram-keycloak-pathocore.<domain>` | Public Keycloak URL used by the browser for login. |
| `KEYCLOAK_PUBLIC_URL` | `https://mepram-keycloak-pathocore.<domain>` | Public Keycloak URL used by the Keycloak container hostname config. |

`NEXTAUTH_URL` is intentionally not configured by users. Docker Compose derives
it from `AUTH_URL` for compatibility with the underlying auth library.

### Frontend API Routes

These are browser-facing relative paths. They should usually stay unchanged:

| Variable | Default | Purpose |
|---|---|---|
| `NEXT_PUBLIC_API_BASE_URL` | `/api/pathocore/v1` | Browser path for PathoCore API calls through Next.js. |
| `NEXT_PUBLIC_MEPRAM_API_BASE_URL` | `/api/omop/v1` | Browser path for MePRAM OMOP API calls through Next.js. |

The browser should not call container names or internal ports directly.

### Internal Service Targets

These values are used inside the Docker network:

| Variable | Default | Purpose |
|---|---|---|
| `PATHOCORE_API_PROXY_TARGET` | `http://pathocore_api:8000` | Internal target for PathoCore API proxy requests. |
| `MEPRAM_OMOP_API_PROXY_TARGET` | `http://mepram_omop_api:8000` | Internal target for MePRAM OMOP API proxy requests. |
| `KEYCLOAK_JWKS_URL` | `http://keycloak:8080/.../certs` | Internal URL used by PathoCore API to validate Keycloak tokens. |
| `KEYCLOAK_ADMIN_BASE_URL` | `http://keycloak:8080` | Internal URL used by PathoCore API for Keycloak admin operations. |

In Docker/Podman deployments, these should normally use service names, not
public DNS names.

### Apache Host Routing

These variables only apply to production, where Apache runs as a container and
routes requests by the incoming `Host` header:

| Variable | Example | Purpose |
|---|---|---|
| `PATHOCORE_DATAHUB_SERVER_NAME` | `mepram-datahub.<domain>` | Hostname routed to the web container. |
| `PATHOCORE_API_SERVER_NAME` | `mepram-api-pathocore.<domain>` | Hostname routed to PathoCore API. |
| `PATHOCORE_KEYCLOAK_SERVER_NAME` | `mepram-keycloak-pathocore.<domain>` | Hostname routed to Keycloak. |
| `MEPRAM_OMOP_API_SERVER_NAME` | `mepram-api-omop.<domain>` | Hostname routed to MePRAM OMOP API. |

These are not full URLs. They are hostnames used by Apache `ServerName`.

### Derived MePRAM OMOP API Settings

In production, the orchestrator derives these MePRAM OMOP API settings from the
public hostnames above:

```text
MEPRAM_API_ALLOWED_HOSTS      <- MEPRAM_OMOP_API_SERVER_NAME
MEPRAM_CSRF_TRUSTED_ORIGINS  <- PATHOCORE_FORWARDED_PROTO://MEPRAM_OMOP_API_SERVER_NAME
MEPRAM_CORS_ALLOWED_ORIGINS  <- PATHOCORE_FORWARDED_PROTO://PATHOCORE_DATAHUB_SERVER_NAME
```

Set those variables explicitly only when a deployment needs extra aliases or
additional frontend origins. `USE_X_FORWARDED_HOST` is configured by
`mepram-omop-api`, not by this orchestrator.

### PathoCore API Host Settings

These values are passed to the `pathocore-api` installer:

| Variable | Example | Purpose |
|---|---|---|
| `PATHOCORE_API_LOCAL_SERVER_IP` | `127.0.0.1` | Host/IP inserted into PathoCore API Django settings. |
| `PATHOCORE_API_DNS_URL` | `mepram-api-pathocore.<domain>` | Public API hostname inserted into PathoCore API Django settings. |

`PATHOCORE_API_SERVER_NAME` and `PATHOCORE_API_DNS_URL` usually have the same
value in production, but they are used by different layers: Apache routing vs.
PathoCore API configuration.

### Secrets and Credentials

These must be changed for any shared or production deployment:

| Variable | Purpose |
|---|---|
| `AUTH_SECRET` | Auth.js cookie/session signing secret. Generate with `openssl rand -base64 48`. |
| `DB_PASSWORD`, `DB_ROOT_PASSWORD` | PathoCore API database credentials. |
| `MEPRAM_DB_PASSWORD`, `MEPRAM_DB_ROOT_PASSWORD` | MePRAM OMOP database credentials. |
| `KEYCLOAK_DB_PASSWORD`, `KEYCLOAK_DB_ROOT_PASSWORD` | Keycloak database credentials. |
| `KC_BOOTSTRAP_ADMIN_PASSWORD` | Initial Keycloak admin password. |
| `KEYCLOAK_ADMIN_PASSWORD` | Password used by PathoCore API for Keycloak admin API calls. |
| `DJANGO_SUPERUSER_PASSWORD` | Optional PathoCore API superuser password. |
| `MEPRAM_DJANGO_SUPERUSER_PASSWORD` | Optional MePRAM OMOP API superuser password. |

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
