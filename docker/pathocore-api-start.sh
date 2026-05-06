#!/usr/bin/env bash
set -euo pipefail

APP_INSTALL_PATH="${APP_INSTALL_PATH:-/opt/pathocore-api}"
APP_REPO_PATH="${APP_REPO_PATH:-/srv/pathocore-api}"
APP_PORT="${APP_PORT:-8000}"
APP_UID="${APP_UID:-1001}"
APP_GID="${APP_GID:-1001}"
APP_USER_NAME="${APP_USER_NAME:-pathocore}"
INSTALL_CONF="/tmp/pathocore-api-install-settings.txt"

DB_USER="${DB_USER:-pathocore}"
DB_PASSWORD="${DB_PASSWORD:-${DB_PASS:-pathocore_password}}"
DB_NAME="${DB_NAME:-pathocore_api}"
DB_HOST="${DB_HOST:-pathocore_db}"
DB_PORT="${DB_PORT:-3306}"

create_runtime_user() {
    if ! getent group "${APP_GID}" >/dev/null; then
        groupadd --gid "${APP_GID}" "${APP_USER_NAME}"
    fi

    local group_name
    group_name="$(getent group "${APP_GID}" | cut -d: -f1)"

    if ! getent passwd "${APP_UID}" >/dev/null; then
        useradd --uid "${APP_UID}" --gid "${APP_GID}" --home-dir "/home/${APP_USER_NAME}" --create-home --shell /bin/bash "${APP_USER_NAME}"
    fi

    APP_USER_NAME="$(getent passwd "${APP_UID}" | cut -d: -f1)"
    export APP_USER_NAME
    export APP_GROUP_NAME="${group_name}"
}

write_install_conf() {
    cat > "${INSTALL_CONF}" <<EOF
INSTALL_PATH='${APP_INSTALL_PATH}'
PROJECT_NAME='pathocore_api'
REQUIRED_MODULES='core'
PYTHON_BIN_PATH='python3'

DB_USER='${DB_USER}'
DB_PASS='${DB_PASSWORD}'
DB_NAME='${DB_NAME}'
DB_SERVER_IP='${DB_HOST}'
DB_PORT=${DB_PORT}

LOCAL_SERVER_IP='${LOCAL_SERVER_IP:-127.0.0.1}'
DNS_URL='${DNS_URL:-localhost}'

EMAIL_HOST_SERVER='${EMAIL_HOST_SERVER:-localhost}'
EMAIL_PORT='${EMAIL_PORT:-25}'
EMAIL_HOST_USER='${EMAIL_HOST_USER:-}'
EMAIL_HOST_PASSWORD='${EMAIL_HOST_PASSWORD:-}'
EMAIL_USE_TLS='${EMAIL_USE_TLS:-False}'

PATHOCORE_ENABLE_LEGACY_BASIC_AUTH='${PATHOCORE_ENABLE_LEGACY_BASIC_AUTH:-true}'
KEYCLOAK_ISSUER='${KEYCLOAK_ISSUER:-}'
KEYCLOAK_JWKS_URL='${KEYCLOAK_JWKS_URL:-}'
KEYCLOAK_AUDIENCE='${KEYCLOAK_AUDIENCE:-pathocore-api}'
KEYCLOAK_CLIENT_ID='${KEYCLOAK_CLIENT_ID:-pathocore-web}'
KEYCLOAK_JWKS_CACHE_TTL_SECONDS=${KEYCLOAK_JWKS_CACHE_TTL_SECONDS:-300}
KEYCLOAK_JWKS_TIMEOUT_SECONDS=${KEYCLOAK_JWKS_TIMEOUT_SECONDS:-5}

LOG_TYPE='regular_folder'
LOG_PATH=''
EOF
}

install_or_update_app() {
    cd "${APP_REPO_PATH}"

    if [ ! -f "${APP_INSTALL_PATH}/manage.py" ]; then
        bash install.sh --install app --docker --git_revision "${GIT_REVISION:-current}" --conf "${INSTALL_CONF}"
    else
        yes Y | bash install.sh --upgrade app --docker --git_revision "${GIT_REVISION:-current}" --conf "${INSTALL_CONF}"
    fi
}

run_management_tasks() {
    cd "${APP_INSTALL_PATH}"
    source virtualenv/bin/activate
    python manage.py migrate --noinput
    python manage.py collectstatic --noinput

    if [ "${LOAD_INITIAL_TABLES:-false}" = "true" ]; then
        python manage.py loaddata conf/first_install_tables.json
    fi
}

start_app() {
    cd "${APP_INSTALL_PATH}"
    chown -R "${APP_UID}:${APP_GID}" "${APP_INSTALL_PATH}/documents" "${APP_INSTALL_PATH}/logs" "${APP_INSTALL_PATH}/static" 2>/dev/null || true

    if [ "${DATABROWSER_CACHE_SCHEDULER_ENABLED:-true}" = "true" ]; then
        su -s /bin/bash "${APP_USER_NAME}" -c "cd '${APP_INSTALL_PATH}' && source virtualenv/bin/activate && '${APP_REPO_PATH}/scripts/databrowser_cache_scheduler.sh'" &
    fi

    exec su -s /bin/bash "${APP_USER_NAME}" -c "cd '${APP_INSTALL_PATH}' && source virtualenv/bin/activate && exec gunicorn pathocore_api.wsgi:application --bind 0.0.0.0:${APP_PORT} --workers ${GUNICORN_WORKERS:-2} --threads ${GUNICORN_THREADS:-2} --timeout ${GUNICORN_TIMEOUT:-120} --access-logfile - --error-logfile - --capture-output --log-level ${GUNICORN_LOG_LEVEL:-info}"
}

create_runtime_user
write_install_conf
install_or_update_app
run_management_tasks
start_app
