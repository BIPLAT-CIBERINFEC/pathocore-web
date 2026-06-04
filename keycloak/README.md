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

## Email Actions

The test realm includes SMTP settings rendered by
`keycloak/scripts/render_realm.py`. The local Docker Compose test stack uses
Mailpit as an SMTP catcher:

```text
SMTP host: mailpit
SMTP port: 1025
Inbox UI: http://127.0.0.1:8025
Sender: no-reply@pathocore.local
```

When `pathocore-api` approves an access request, it calls Keycloak
`execute-actions-email` with `UPDATE_PASSWORD` and `VERIFY_EMAIL`. In the test
stack, the user email is captured in Mailpit instead of being sent externally.

The API must have action emails enabled:

```env
KEYCLOAK_ADMIN_SEND_ACTION_EMAILS=true
```

For production, configure the SMTP block in
`keycloak/config/realm-config.prod.json` before rendering the realm import. Use
a real sender address and authenticated SMTP credentials. Keep the production
config file out of git if it contains secrets.

Keycloak only imports the realm on fresh startup. If the realm already exists,
changing the import JSON is not enough. Recreate the Keycloak data volume for a
clean test import:

```bash
python keycloak/scripts/render_realm.py --profile test
docker compose --env-file .env -f docker-compose.test.yml down -v
docker compose --env-file .env -f docker-compose.test.yml up -d
```

For an already running local realm, configure SMTP from the admin console under
Realm settings > Email, or use a fresh import as shown above.

## Example users

- `mepram_admin` / `mepram_admin_pass`
  - `/use-cases/mepram/labs/lab1/admin`
  - `/use-cases/relecov/labs/lab2/view`
- `relecov_admin` / `relecov_admin_pass`
  - `/use-cases/relecov/admin`
- `redlabra_viewer` / `redlabra_viewer_pass`
  - `/use-cases/redlabra/view`
- `hybrid_user` / `hybrid_user_pass`
  - `/use-cases/mepram/labs/lab2/view`
  - `/use-cases/redlabra/admin`
- `models_admin` / `models_admin_pass`
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
  -d "username=mepram_admin" \
  -d "password=mepram_admin_pass" | jq
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
