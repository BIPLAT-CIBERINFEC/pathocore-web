# Keycloak realm config for PathoCore

This directory contains the reproducible Keycloak realm config used by
PathoCore. The current default profile is local/test.

## Source of truth

The realm import file is generated from:

- [config/realm-config.test.json](./config/realm-config.test.json)
- [config/realm-config.prod.example.json](./config/realm-config.prod.example.json)
- [scripts/render_realm.py](./scripts/render_realm.py)

Do not configure this realm manually in the Keycloak UI. Do not edit files
under `tmp-import/` manually. Regenerate the local/test import JSON with:

```bash
python scripts/render_realm.py
```

This is equivalent to:

```bash
python scripts/render_realm.py --profile test
```

For production, copy and edit the example. Keep the real production file out of
git because it may contain deployment-specific URLs or future secrets:

```bash
cp config/realm-config.prod.example.json config/realm-config.prod.json
python scripts/render_realm.py --config config/realm-config.prod.json
```

Production redirect URIs and web origins must be exact HTTPS URLs. Do not use
localhost or wildcards in production.

## Auth strategy

The realm is configured around standard claims plus Keycloak group membership:

- `iss`: realm issuer
- `aud`: API audience
- `sub`: user id
- `preferred_username`
- `email`
- `groups`: full group paths

No custom hardcoded `projects` claim is emitted. APIs derive authorization from
the canonical group grammar:

```text
/use-cases/<use-case>/view
/use-cases/<use-case>/admin
/use-cases/<use-case>/labs/<lab>/view
/use-cases/<use-case>/labs/<lab>/admin
/superusers
```

This is the current PathoCore pattern:

- `pathocore-web` performs login and receives user access tokens
- `pathocore-api` is only an API audience and does not perform login
- `pathocore-common` is a default scope on `pathocore-web`
- `pathocore-common` adds identity claims, full group paths, and `aud=pathocore-api`

Semantics:

- `/use-cases/<uc>/admin` grants use-case-wide administration
- `/use-cases/<uc>/view` grants use-case-wide read access
- `/use-cases/<uc>/labs/<lab>/admin` grants administration only for that lab
- `/use-cases/<uc>/labs/<lab>/view` grants read access only for that lab
- `/superusers` grants full access across APIs that honor this realm group

## Realm contents

- Realm: `ciberisciii_datahub`
- Group root: `use-cases`
- Use-cases:
  - `mepram`
  - `relecov`
  - `redlabra`
  - `ai-models`
- Clients:
  - `pathocore-web`
  - `pathocore-api`
  - `ai-model-api`
- Shared client scope:
  - `pathocore-common`
- Required mappers in `pathocore-common`:
  - `audience-pathocore-api`
  - `preferred_username`
  - `given_name`
  - `family_name`
  - `name`
  - `sub`
  - `groups`
- Client configuration:
  - `pathocore-web`: public, standard flow enabled, direct grants enabled
  - `pathocore-api`: bearer-only API client, login flows disabled

## Example users

- `daniel` / `dareleplat`
  - `/use-cases/mepram/labs/lab1/admin`
  - `/use-cases/relecov/labs/lab2/view`
- `maria` / `mariapass`
  - `/use-cases/relecov/admin`
- `alba` / `albapass`
  - `/use-cases/redlabra/view`
- `ines` / `inespass`
  - `/use-cases/mepram/labs/lab2/view`
  - `/use-cases/redlabra/admin`
- `nora` / `norapass`
  - `/use-cases/ai-models/admin`

To create a superuser in this dev realm, assign the user to `/superusers`.

## Use From The Orchestrator

Keycloak is started by the top-level compose files in the `pathocore-web`
repository. From the repository root:

```bash
python keycloak/scripts/render_realm.py --profile test
docker compose --env-file .env -f docker-compose.test.yml up -d
docker compose --env-file .env -f docker-compose.test.yml logs -f keycloak
```

Keycloak imports `tmp-import/ciberisciii_datahub-realm.json` automatically on
fresh startup through `--import-realm`. The import file is mounted by the
top-level compose file.

If you changed the config and need a clean re-import, remove the Keycloak data
volume:

```bash
python keycloak/scripts/render_realm.py --profile test
docker compose --env-file .env -f docker-compose.test.yml down -v
docker compose --env-file .env -f docker-compose.test.yml up -d
```

Keycloak will be available at:

```text
http://127.0.0.1:8080
```

Admin console:

```text
http://127.0.0.1:8080/admin
```

Bootstrap admin credentials:

```text
admin / admin
```

## Token examples

Development token through the frontend client:

```bash
curl -sS -X POST \
  "http://127.0.0.1:8080/realms/ciberisciii_datahub/protocol/openid-connect/token" \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "client_id=pathocore-web" \
  -d "grant_type=password" \
  -d "username=daniel" \
  -d "password=dareleplat" | jq
```

The resulting access token should include `sub`, `preferred_username`,
`groups`, and `aud` containing `pathocore-api`.

## Token settings for PathoCore API

Issuer:

```text
http://127.0.0.1:8080/realms/ciberisciii_datahub
```

Audience:

```text
pathocore-api
```

JWKS URL from the host:

```text
http://127.0.0.1:8080/realms/ciberisciii_datahub/protocol/openid-connect/certs
```

JWKS URL from the PathoCore Docker app container:

```text
http://host.docker.internal:8080/realms/ciberisciii_datahub/protocol/openid-connect/certs
```

Stop the full test stack from the repository root with:

```bash
docker compose --env-file .env -f docker-compose.test.yml down
```
