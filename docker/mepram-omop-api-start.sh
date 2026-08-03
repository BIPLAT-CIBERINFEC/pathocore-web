#!/usr/bin/env bash
set -euo pipefail

APP_INSTALL_PATH="${APP_INSTALL_PATH:-/srv/mepram-omop-api}"
APP_REPO_PATH="${APP_REPO_PATH:-/srv/mepram-omop-api}"
APP_PORT="${APP_PORT:-8000}"
INSTALL_CONF="/tmp/mepram-omop-api-install-settings.txt"

write_install_conf() {
    cat > "${INSTALL_CONF}" <<EOF
INSTALL_PATH='${APP_INSTALL_PATH}'
APP_INSTALL_PATH='${APP_INSTALL_PATH}'
PROJECT_NAME='conf'
REQUIRED_MODULES='conf core manage.py'
PYTHON_BIN_PATH='python3'

MEPRAM_DB_HOST='${MEPRAM_DB_HOST:-mepram_omop_db}'
MEPRAM_DB_PORT='${MEPRAM_DB_PORT:-3306}'
MEPRAM_DB_NAME='${MEPRAM_DB_NAME:-mepram_omop_api}'
MEPRAM_DB_USER='${MEPRAM_DB_USER:-mepram}'
MEPRAM_DB_PASSWORD='${MEPRAM_DB_PASSWORD:-mepram_password}'
MEPRAM_DASHBOARD_SCHEMA='${MEPRAM_DASHBOARD_SCHEMA:-mepram_omop_api}'

MEPRAM_API_DEBUG='${MEPRAM_API_DEBUG:-false}'
MEPRAM_API_ALLOWED_HOSTS='${MEPRAM_API_ALLOWED_HOSTS:-localhost,127.0.0.1,0.0.0.0}'
MEPRAM_CORS_ALLOWED_ORIGINS='${MEPRAM_CORS_ALLOWED_ORIGINS:-http://127.0.0.1:3000,http://localhost:3000}'
PUBLIC_API_THROTTLE_RATE='${PUBLIC_API_THROTTLE_RATE:-500/hour}'

MEPRAM_DOCS_REQUIRE_STAFF='${MEPRAM_DOCS_REQUIRE_STAFF:-true}'
MEPRAM_CREATE_DEFAULT_SUPERUSER='${MEPRAM_CREATE_DEFAULT_SUPERUSER:-true}'
DJANGO_SUPERUSER_USERNAME='${DJANGO_SUPERUSER_USERNAME:-admin}'
DJANGO_SUPERUSER_EMAIL='${DJANGO_SUPERUSER_EMAIL:-admin@example.org}'
DJANGO_SUPERUSER_PASSWORD='${DJANGO_SUPERUSER_PASSWORD:-admin_pass}'
EOF
}

install_or_update_app() {
    cd "${APP_REPO_PATH}"
    bash install.sh --bootstrap install --git_revision "${GIT_REVISION:-current}" --conf "${INSTALL_CONF}" --skip_apache_restart
}

start_app() {
    cd "${APP_INSTALL_PATH}"
    exec gunicorn conf.wsgi:application \
        --bind "0.0.0.0:${APP_PORT}" \
        --workers "${GUNICORN_WORKERS:-2}" \
        --threads "${GUNICORN_THREADS:-2}" \
        --timeout "${GUNICORN_TIMEOUT:-120}" \
        --access-logfile - \
        --error-logfile - \
        --capture-output \
        --log-level "${GUNICORN_LOG_LEVEL:-info}"
}

write_install_conf
install_or_update_app
start_app
