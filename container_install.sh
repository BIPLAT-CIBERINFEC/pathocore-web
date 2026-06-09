#!/usr/bin/env bash
set -euo pipefail

PATHOCORE_WEB_VERSION="1.0.0"

usage() {
cat << 'EOF'
This script installs the PathoCore Web test stack and can load the two local API databases.

Usage: $0 [--env_file] [--compose_file] [--pathocore_api_sql] [--mepram_omop_sql] [--engine] [--test]

Options:
    --env_file              Env file used by compose. Default: .env if present, otherwise .env.example
    --compose_file          Compose file to use. Default with --test: docker-compose.test.yml
    --pathocore_api_sql     Path to PathoCore API MySQL seed dump (.sql or .sql.gz)
    --mepram_omop_sql       Path to MePRAM OMOP dashboard.sql imported through Django
    --skip_pathocore_api_sql
                            Skip PathoCore API seed import even if --pathocore_api_sql is provided
    --skip_mepram_omop_sql  Skip MePRAM OMOP SQL import even if --mepram_omop_sql is provided
    --engine                Container engine to use: docker (default) or podman
    --test                  Use the test compose file

Examples:
    Install the full local test stack without loading data:
    bash $0 --test

    Install the full stack and load both API databases:
    bash $0 --test \
      --pathocore_api_sql ../pathocore_api_testing_seed.sql.gz \
      --mepram_omop_sql ../dashboard.sql

EOF
}

reset=true
for arg in "$@"; do
    if [ -n "${reset:-}" ]; then
        unset reset
        set --
    fi
    case "$arg" in
        --env_file)              set -- "$@" -f ;;
        --compose_file)          set -- "$@" -c ;;
        --pathocore_api_sql)     set -- "$@" -p ;;
        --mepram_omop_sql)       set -- "$@" -m ;;
        --skip_pathocore_api_sql) set -- "$@" -P ;;
        --skip_mepram_omop_sql)  set -- "$@" -M ;;
        --engine)                set -- "$@" -e ;;
        --test)                  set -- "$@" -t ;;
        --help)                  set -- "$@" -h ;;
        --version)               set -- "$@" -v ;;
        *)                       set -- "$@" "$arg" ;;
    esac
done

compose_file=""
env_file=""
pathocore_api_sql=""
mepram_omop_sql=""
skip_pathocore_api_sql=false
skip_mepram_omop_sql=false
mode="production"
engine="docker"

ENGINE_CMD=()
COMPOSE_CMD=()

while getopts ":f:c:p:m:e:PMthv" opt; do
    case "$opt" in
        f) env_file="$OPTARG" ;;
        c) compose_file="$OPTARG" ;;
        p) pathocore_api_sql="$OPTARG" ;;
        m) mepram_omop_sql="$OPTARG" ;;
        e)
            engine="$OPTARG"
            if [[ "$engine" != "docker" && "$engine" != "podman" ]]; then
                echo "Invalid engine '$engine'. Use docker or podman."
                exit 1
            fi
            ;;
        P) skip_pathocore_api_sql=true ;;
        M) skip_mepram_omop_sql=true ;;
        t) mode="test" ;;
        h) usage; exit 0 ;;
        v) echo "$PATHOCORE_WEB_VERSION"; exit 0 ;;
        \?) echo "Invalid option: -$OPTARG" >&2; usage; exit 1 ;;
        :) echo "Option -$OPTARG requires an argument." >&2; exit 1 ;;
    esac
done
shift $((OPTIND - 1))

if [ "$mode" = "test" ]; then
    compose_file="${compose_file:-docker-compose.test.yml}"
else
    compose_file="${compose_file:-docker-compose.prod.yml}"
fi

if [ -z "$env_file" ]; then
    if [ -f ".env" ]; then
        env_file=".env"
    else
        env_file=".env.example"
    fi
fi

if [ ! -f "$compose_file" ]; then
    echo "Compose file '$compose_file' not found"
    exit 1
fi

if [ ! -f "$env_file" ]; then
    echo "Env file '$env_file' not found"
    exit 1
fi

if [ -n "$pathocore_api_sql" ] && [ ! -f "$pathocore_api_sql" ]; then
    echo "PathoCore API SQL file '$pathocore_api_sql' not found"
    exit 1
fi

if [ -n "$mepram_omop_sql" ] && [ ! -f "$mepram_omop_sql" ]; then
    echo "MePRAM OMOP SQL file '$mepram_omop_sql' not found"
    exit 1
fi

set_engine() {
    if [ "$engine" = "docker" ]; then
        if ! command -v docker >/dev/null 2>&1; then
            echo "docker not found. Install docker or use --engine podman."
            exit 1
        fi
        ENGINE_CMD=("docker")
        COMPOSE_CMD=("docker" "compose")
    else
        if ! command -v podman >/dev/null 2>&1; then
            echo "podman not found. Install podman or use --engine docker."
            exit 1
        fi
        ENGINE_CMD=("podman")
        if command -v podman-compose >/dev/null 2>&1; then
            COMPOSE_CMD=("podman-compose")
        elif podman compose version >/dev/null 2>&1; then
            COMPOSE_CMD=("podman" "compose")
        else
            echo "podman compose not available. Install podman-compose or use --engine docker."
            exit 1
        fi
    fi
}

engine_exec() {
    "${ENGINE_CMD[@]}" "$@"
}

compose_exec() {
    "${COMPOSE_CMD[@]}" --env-file "$env_file" -f "$compose_file" "$@"
}

read_env_value() {
    local key="$1"
    local default_value="$2"
    local value=""

    value="$(grep -E "^[[:space:]]*${key}=" "$env_file" | tail -n 1 | cut -d= -f2- || true)"
    value="${value%%#*}"
    value="$(printf '%s' "$value" | sed -e 's/^[[:space:]]*//' -e 's/[[:space:]]*$//')"
    value="${value%\"}"
    value="${value#\"}"
    value="${value%\'}"
    value="${value#\'}"

    if [ -z "$value" ]; then
        printf '%s' "$default_value"
    else
        printf '%s' "$value"
    fi
}

service_container_id() {
    compose_exec ps -q "$1" | head -n 1
}

service_exists() {
    local service="$1"
    local listed_service=""

    while IFS= read -r listed_service; do
        if [ "$listed_service" = "$service" ]; then
            return 0
        fi
    done < <(compose_exec config --services 2>/dev/null)

    return 1
}

wait_for_service() {
    local service="$1"
    local attempts="${2:-120}"
    local container_id=""
    local running=""
    local health=""

    if ! service_exists "$service"; then
        echo "Service '$service' is not defined in $compose_file"
        exit 1
    fi

    while [ "$attempts" -gt 0 ]; do
        container_id="$(service_container_id "$service")"
        if [ -n "$container_id" ]; then
            running="$(engine_exec inspect -f '{{.State.Running}}' "$container_id" 2>/dev/null || true)"
            health="$(engine_exec inspect -f '{{if .State.Health}}{{.State.Health.Status}}{{else}}running{{end}}' "$container_id" 2>/dev/null || true)"
            if [ "$running" = "true" ] && { [ "$health" = "healthy" ] || [ "$health" = "running" ]; }; then
                return 0
            fi
        fi
        attempts=$((attempts - 1))
        sleep 2
    done

    echo "Service '$service' did not become ready."
    if [ -n "$container_id" ]; then
        engine_exec logs --tail 200 "$container_id" || true
    fi
    exit 1
}

import_pathocore_api_sql() {
    local sql_path="$1"
    local db_user db_password db_name

    db_user="$(read_env_value DB_USER pathocore)"
    db_password="$(read_env_value DB_PASSWORD pathocore_password)"
    db_name="$(read_env_value DB_NAME pathocore_api)"

    echo "Importing PathoCore API SQL into service pathocore_db database '$db_name'"
    if [[ "$sql_path" == *.gz ]]; then
        gzip -dc "$sql_path" | compose_exec exec -T pathocore_db mysql -u"$db_user" -p"$db_password" "$db_name"
    else
        compose_exec exec -T pathocore_db mysql -u"$db_user" -p"$db_password" "$db_name" < "$sql_path"
    fi
}

ensure_pathocore_api_superuser() {
    local username email password

    username="$(read_env_value DJANGO_SUPERUSER_USERNAME admin)"
    email="$(read_env_value DJANGO_SUPERUSER_EMAIL admin@example.org)"
    password="$(read_env_value DJANGO_SUPERUSER_PASSWORD admin_pass)"

    echo "Ensuring Django superuser '$username' after PathoCore API seed import"
    compose_exec exec -T pathocore_api bash -lc \
        "cd /opt/pathocore-api && virtualenv/bin/python manage.py ensure_default_superuser --username '$username' --email '$email' --password '$password'"
}

ensure_pathocore_api_seed_migrations() {
    local db_user db_password db_name

    db_user="$(read_env_value DB_USER pathocore)"
    db_password="$(read_env_value DB_PASSWORD pathocore_password)"
    db_name="$(read_env_value DB_NAME pathocore_api)"

    echo "Ensuring PathoCore API seed migration state"
    compose_exec exec -T pathocore_db mysql -u"$db_user" -p"$db_password" "$db_name" -e "
        INSERT IGNORE INTO django_migrations (app, name, applied)
        VALUES
            ('core', '0009_alter_schema_user_name_nullable', NOW()),
            ('core', '0010_remove_unused_metadata_models', NOW()),
            ('core', '0011_access_request', NOW()),
            ('core', '0012_access_request_revoked_status', NOW());
    "
}

import_mepram_omop_sql() {
    local sql_path="$1"
    local container_id=""
    local container_path="/data/dashboard.sql"

    container_id="$(service_container_id mepram_omop_api)"
    if [ -z "$container_id" ]; then
        echo "Unable to resolve container for service mepram_omop_api"
        exit 1
    fi

    echo "Copying MePRAM OMOP SQL into service mepram_omop_api"
    compose_exec exec -T mepram_omop_api mkdir -p /data
    engine_exec cp "$sql_path" "${container_id}:${container_path}"

    echo "Importing MePRAM OMOP SQL through Django management command"
    compose_exec exec -T mepram_omop_api python manage.py import_dashboard_sql "$container_path" --truncate
}

set_engine

echo "Deploying PathoCore Web stack"
echo "  compose: $compose_file"
echo "  env:     $env_file"
compose_exec build
compose_exec up -d --remove-orphans

for service in keycloak_db keycloak pathocore_db pathocore_api mepram_omop_db mepram_omop_api pathocore_web; do
    echo "Waiting for service: $service"
    wait_for_service "$service" 120
done

if [ -n "$pathocore_api_sql" ] && [ "$skip_pathocore_api_sql" = false ]; then
    import_pathocore_api_sql "$pathocore_api_sql"
    ensure_pathocore_api_seed_migrations
    ensure_pathocore_api_superuser
else
    echo "Skipping PathoCore API SQL import"
fi

if [ -n "$mepram_omop_sql" ] && [ "$skip_mepram_omop_sql" = false ]; then
    import_mepram_omop_sql "$mepram_omop_sql"
else
    echo "Skipping MePRAM OMOP SQL import"
fi

compose_exec ps

echo "Installation completed"
echo "  Web:              http://127.0.0.1:$(read_env_value PATHOCORE_WEB_PORT 3000)"
echo "  PathoCore API:    http://127.0.0.1:$(read_env_value PATHOCORE_API_PORT 8000)"
echo "  MePRAM OMOP API:  http://127.0.0.1:$(read_env_value MEPRAM_OMOP_API_PORT 8100)"
echo "  Keycloak:         http://127.0.0.1:$(read_env_value KEYCLOAK_PORT 8080)"
