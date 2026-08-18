# Installation settings for PathoCore Web

`docker_test_settings.txt` contains disposable local defaults.
`docker_production_settings.txt` is a template and MUST NOT contain real
production secrets. Operators copy it to an ignored, mode-`0600` file.

| Setting | Required | Secret | Phase | Purpose |
|---|---:|---:|---|---|
| `REPO_PATH`, `INSTALL_PATH` | yes | no | runtime | Application paths in the image |
| `APP_UID`, `APP_GID` | yes | no | runtime | Numeric identity of the unprivileged Node process |
| `APP_PORT` | yes | no | runtime | Next.js HTTP port |
| `NEXT_PUBLIC_*` | yes | no | build | Public values embedded by `next build` |
| `PATHOCORE_API_PROXY_TARGET` | yes | no | runtime | Internal PathoCore API URL used by server-side proxy routes |
| `MEPRAM_OMOP_API_PROXY_TARGET` | yes | no | runtime | Internal MePRAM API URL used by server-side proxy routes |
| `AUTH_SECRET` | yes | yes | runtime | Auth.js session and token secret |
| `AUTH_URL`, `NEXTAUTH_URL` | yes | no | runtime | Public authentication callback origin |
| `AUTH_TRUST_HOST` | yes | no | runtime | Auth.js reverse-proxy host policy |

Changing `NEXT_PUBLIC_*` requires rebuilding the image. Server-only values are
injected when the container starts and MUST never be exposed with a
`NEXT_PUBLIC_` prefix.

## Selected infrastructure add-ons

### Apache

`APACHE_LOG_PATH`, `APACHE_BIND_HOST`, `APACHE_PORT`,
`APACHE_FORWARDED_PROTO`, `APACHE_FORWARDED_PORT`, and
`APACHE_LIMIT_REQUEST_BODY` configure the rendered proxy. They are
operational values, not Django or React application settings.

`APACHE_SERVER_NAME` is the host name handled by the baseline VirtualHost.
`APACHE_UPSTREAM_SERVICE` defaults to `ADDONS.apache.CONFIG_SERVICE`, while
`APACHE_UPSTREAM_PORT` defaults to that service's `APP_PORT`.
`APACHE_PROXY_TIMEOUT` defaults to its `GUNICORN_TIMEOUT` (or 120 seconds), and
`APACHE_LOG_STEM` defaults to a filename-safe form of `APACHE_SERVER_NAME`.
Leave those four derived values empty unless the proxy route needs an override.

`SERVER_STATUS_SERVER_NAME`, `SERVER_STATUS_ALIASES`, and
`SERVER_STATUS_ALLOW_FROM` configure the restricted Apache status endpoint.
Keep its allow-list limited to trusted diagnostic hosts.

Edit the source files under `conf/apache/` to define the application's virtual
hosts, routes, and aliases. During installation they are rendered with the
protected deployment environment into `deployment/apache/`; only those final
files are bind-mounted. `APACHE_LOG_PATH` is the writable persistent host log
source.
