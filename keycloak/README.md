# Keycloak Realm and Theme

The PathoCore platform manages Keycloak as a deployment add-on. The
repository-owned realm templates are:

- `conf/keycloak/realm-test.json` for disposable local/test deployments.
- `conf/keycloak/realm-production.json` for production deployments.

They define the `ciberisciii_datahub` group model, the frontend/API clients,
the shared `pathocore-common` client scope, and the bundled email theme. They
are templates, not running Keycloak state.

## Rendering lifecycle

`container_install.sh` reads the protected settings selected for the Keycloak
add-on, renders the selected JSON template into `KEYCLOAK_IMPORT_PATH`, and
mounts that directory read-only in Keycloak. Rendering substitutes the realm
name, frontend callback URL and SMTP settings without writing production values
back into the repository.

For a production deployment, edit only the protected file below
`deployment/settings/`:

```text
deployment/settings/keycloak_production_settings.txt
```

For local/test, `conf/keycloak/keycloak_test_settings.txt` selects Mailpit and
the disposable realm import path.

Keycloak imports a realm only when its database is empty. Changing a template
or its settings does not alter an existing realm. Recreate the disposable test
Keycloak volume to validate a fresh import. In production, manage existing
realm changes explicitly and back up the Keycloak database before modifying it.

## Authorization model

The realm emits standard identity claims and complete Keycloak group paths. The
APIs use the following groups for authorization:

```text
/use-cases/<use-case>/view
/use-cases/<use-case>/admin
/superusers
```

The `pathocore-web` client performs browser login. `pathocore-api` and
`mepram-api` are API audiences. The `pathocore-common` client scope adds
identity claims, group membership and the PathoCore API audience to frontend
tokens.

## Email theme

The application-owned theme is mounted through `ADDONS.keycloak.MOUNTS`:

```text
keycloak/themes/pathocore -> /opt/keycloak/themes/pathocore
```

The realm selects it using `KEYCLOAK_EMAIL_THEME`. SMTP values are configured
through the `KEYCLOAK_SMTP_*` settings. In tests, Mailpit exposes its inbox on
the configured loopback port. Production must use the SMTP endpoint provided by
the deployment environment.
