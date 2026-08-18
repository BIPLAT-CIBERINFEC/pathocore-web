# Actualizacion de PathoCore Web con Podman rootless

Esta guia es la lista de ejecucion para instalar, actualizar y recuperar el
despliegue de produccion. Los comandos generados son reutilizables. Antes de la
aprobacion, el responsable debe registrar las entradas de despliegue indicadas
abajo con valores o referencias institucionales verificadas.

## Indice

- [Requisitos](#requisitos)
- [Estructura de directorios en los servidores](#estructura-de-directorios-en-los-servidores)
- [Preparar checkout y backup](#preparar-checkout-y-backup)
- [Actualizar codigo](#actualizar-codigo)
- [Configurar los ajustes de produccion](#configurar-los-ajustes-de-produccion)
- [Preparar directorios persistentes del host](#preparar-directorios-persistentes-del-host)
- [Backup antes de actualizar](#backup-antes-de-actualizar)
- [Ejecutar la actualizacion](#ejecutar-la-actualizacion)
- [Comprobaciones posteriores](#comprobaciones-posteriores)
- [Rollback](#rollback)
- [Reparar permisos](#reparar-permisos)
- [Operaciones utiles](#operaciones-utiles)
- [Notas de permisos](#notas-de-permisos)

## Requisitos

- Podman rootless y un proveedor de Compose funcionales.
- El mismo usuario sin privilegios para el instalador y Podman.

Entradas de despliegue que deben quedar registradas antes de ejecutar:

| Entrada | Evidencia requerida |
|---|---|
| Revision aprobada | Tag o commit inmutable y aprobacion asociada |
| Exposicion publica | URL, DNS, propietario de TLS y reglas de proxy |
| Dependencias | Base de datos, almacenamiento, correo e identidad aplicables |
| Operacion | Responsable del servicio y contacto de escalado |
| Recuperacion | RPO, RTO, retencion y ubicacion de backups |

```bash
podman info
podman compose version || podman-compose --version
```

No ejecutar `container_install.sh` con `sudo`. Podman rootless, el proveedor de
Compose y el instalador deben usar siempre la misma cuenta. Los ejemplos usan
`podman compose`; si el host proporciona `podman-compose`, sustituir ese prefijo
completo. La libreria compartida detecta ambos proveedores automaticamente.

## Estructura de directorios en los servidores

Todos los despliegues usan esta estructura institucional. El despliegue separa
sus fuentes, binds, logs y backups; un servicio externo puede conservar un
namespace distinto, definido por sus rutas protegidas. Podman administra su
propio storage y no debe modificarse manualmente.

```text
/opt/containers_apps/
└── pathocore-web/
    ├── backup/                         # Backups locales opcionales
    └── pathocore-web/               # Clone Git y configuracion protegida

/srv/containers/
├── backup/
│   └── pathocore-web/               # Backup central recomendado
├── bind/
│   └── <namespace-configurado>/
│       └── settings/                   # settings.py renderizado por servicio
├── shared/                             # Datos compartidos entre aplicaciones
└── storage/
    └── <usuario-podman>/               # Storage rootless gestionado por Podman

/var/log/local/
└── <namespace-configurado>/
    ├── apache/
    └── apps/
```

Persistencia declarada por el despliegue:

| Activo | Ubicacion de produccion | Requisito de recuperacion |
|---|---|---|
| `pathocore_web` Next.js image | Immutable container image | Rebuild from recorded revision |
| `pathocore_api` database | `pathocore_api_db_data` named volume, mounted by `pathocore_api_db` | Logical dump before migration; persistent volume recovery |
| `pathocore_api` documents | `pathocore_api_documents` named volume | Volume backup |
| `pathocore_api` static | `pathocore_api_static` named volume | Replaceable through collectstatic |
| `pathocore_api` logs | Host bind configured by `HOST_LOG_PATH` in `pathocore_api_production_settings.txt` | Retain/rotate per institutional log policy |
| `pathocore_api` rendered settings | Host bind configured by `DJANGO_SETTINGS_PATH` in `pathocore_api_production_settings.txt` | Protected configuration backup |
| `mepram_omop_api` database | `mepram_omop_api_db_data` named volume, mounted by `mepram_omop_api_db` | Logical dump before migration; persistent volume recovery |
| `mepram_omop_api` documents | `mepram_omop_api_documents` named volume | Volume backup |
| `mepram_omop_api` static | `mepram_omop_api_static` named volume | Replaceable through collectstatic |
| `mepram_omop_api` logs | Host bind configured by `HOST_LOG_PATH` in `mepram_omop_api_production_settings.txt` | Retain/rotate per institutional log policy |
| `mepram_omop_api` rendered settings | Host bind configured by `DJANGO_SETTINGS_PATH` in `mepram_omop_api_production_settings.txt` | Protected configuration backup |
| Apache logs | `/var/log/local/pathocore-web/apache` host bind | Retain/rotate per institutional log policy |
| Rendered Apache configuration | `deployment/apache/` in the deployment checkout | Rebuildable; preserve reviewed source configuration |
| Keycloak database | `keycloak_db_data` MySQL named volume | Database and identity backup |
| Keycloak staged realm | `/srv/containers/bind/pathocore-web/keycloak/realm-import/` read-only host bind | Back up with deployment configuration; reproducible bootstrap input, not authoritative identity state |

## Preparar checkout y backup

Crear solo las ubicaciones necesarias para obtener el codigo y guardar backups.
Sustituir `<usuario-podman>` por la cuenta que ejecutara siempre Podman y el
instalador; normalmente es la cuenta de la sesion actual. Los binds y logs se
crean mas adelante, despues de completar los ajustes protegidos.

```bash
sudo mkdir -p /opt/containers_apps/pathocore-web
sudo mkdir -p /srv/containers/backup/pathocore-web
sudo chown -R <usuario-podman>:<usuario-podman> \
  /opt/containers_apps/pathocore-web \
  /srv/containers/backup/pathocore-web
```

## Actualizar codigo

Para un checkout nuevo:

```bash
cd /opt/containers_apps/pathocore-web
git clone https://github.com/BIPLAT-CIBERINFEC/pathocore-web.git pathocore-web
cd pathocore-web
git checkout <revision-aprobada>
```

En un checkout existente, verificar primero que no haya cambios locales y
cambiar a la revision entregada mediante el procedimiento Git de la institucion.
Registrar el commit exacto con `git rev-parse HEAD`.

## Configurar los ajustes de produccion

Crear un fichero ignorado y con modo `0600` por servicio a partir de su
`conf/docker_production_settings.txt`. Resolver todos los `CHANGE_ME` y revisar
la matriz [`conf/INSTALL_SETTINGS.md`](conf/INSTALL_SETTINGS.md). El instalador
genera `.env.production.file` con valores runtime, incluidos secretos copiados
desde estos ficheros protegidos. Mantenerlo con modo `0600`, fuera de Git y
dentro del backup protegido de configuracion. Ninguno de estos ficheros se
copia en las capas de las imagenes.

```bash
install -d -m 0700 deployment/settings
install -m 0600 conf/docker_production_settings.txt deployment/settings/pathocore_web_production_settings.txt
install -m 0600 ../pathocore-api/conf/docker_production_settings.txt deployment/settings/pathocore_api_production_settings.txt
install -m 0600 ../mepram-omop-api/conf/docker_production_settings.txt deployment/settings/mepram_omop_api_production_settings.txt
install -m 0600 conf/apache/apache_production_settings.txt deployment/settings/apache_production_settings.txt
install -m 0600 conf/keycloak/keycloak_production_settings.txt deployment/settings/keycloak_production_settings.txt
```

Valores que requieren decision del responsable de la aplicacion:

- hostnames publicos, TLS y proxy;
- base de datos y credenciales de minimo privilegio;
- rutas persistentes, UID/GID, SELinux y politica de backup;
- correo, identidad, almacenamiento y ajustes propios de la aplicacion;
- administrador inicial y transferencia segura de sus credenciales.

Editar unicamente las copias bajo `deployment/settings/`, completar todas esas
decisiones y resolver cada `CHANGE_ME` antes de continuar. Los comandos de
instalacion y actualizacion usan estas rutas protegidas.

## Preparar directorios persistentes del host

Solo despues de completar y revisar todos los ajustes, crear los binds
exactamente donde indica cada servicio. Los ficheros se cargan como el usuario
actual dentro de subshells; solo `install -d` usa privilegios. Esto incluye
servicios con un namespace de host distinto al despliegue principal.

```bash
PODMAN_USER='<usuario-podman>'
(
  source deployment/settings/pathocore_api_production_settings.txt
  : "${HOST_LOG_PATH:?HOST_LOG_PATH is required for pathocore_api}"
  : "${DJANGO_SETTINGS_PATH:?DJANGO_SETTINGS_PATH is required for pathocore_api}"
  sudo install -d -o "$PODMAN_USER" -g "$PODMAN_USER" \
    "$HOST_LOG_PATH" "$(dirname "$DJANGO_SETTINGS_PATH")"
)
(
  source deployment/settings/mepram_omop_api_production_settings.txt
  : "${HOST_LOG_PATH:?HOST_LOG_PATH is required for mepram_omop_api}"
  : "${DJANGO_SETTINGS_PATH:?DJANGO_SETTINGS_PATH is required for mepram_omop_api}"
  sudo install -d -o "$PODMAN_USER" -g "$PODMAN_USER" \
    "$HOST_LOG_PATH" "$(dirname "$DJANGO_SETTINGS_PATH")"
)
(
  source deployment/settings/apache_production_settings.txt
  : "${APACHE_LOG_PATH:?APACHE_LOG_PATH is required for apache}"
  sudo install -d -o "$PODMAN_USER" -g "$PODMAN_USER" \
    "$APACHE_LOG_PATH"
)
(
  source deployment/settings/keycloak_production_settings.txt
  : "${KEYCLOAK_IMPORT_PATH:?KEYCLOAK_IMPORT_PATH is required for keycloak}"
  sudo install -d -o "$PODMAN_USER" -g "$PODMAN_USER" \
    "$KEYCLOAK_IMPORT_PATH"
)
```

Revisar las rutas resueltas antes de ejecutar. No usar valores procedentes de
una configuracion no revisada y no ejecutar los ficheros completos con `sudo`.
Aplicar despues UID/GID internos, modos y etiquetas SELinux mediante el
instalador. No modificar `/srv/containers/storage/` manualmente.

```bash
bash container_install.sh --action fix-permissions --engine podman \
  --install_conf_map pathocore_web,deployment/settings/pathocore_web_production_settings.txt --install_conf_map pathocore_api,deployment/settings/pathocore_api_production_settings.txt --install_conf_map mepram_omop_api,deployment/settings/mepram_omop_api_production_settings.txt --install_conf_map apache,deployment/settings/apache_production_settings.txt --install_conf_map keycloak,deployment/settings/keycloak_production_settings.txt
```

## Backup antes de actualizar

Crear un directorio identificado y registrar el estado desplegado:

```bash
BACKUP_DIR="/srv/containers/backup/pathocore-web/$(date +%Y%m%d_%H%M%S)"
mkdir -p "$BACKUP_DIR"
git rev-parse HEAD > "$BACKUP_DIR/git-revision.txt"
podman compose --env-file .env.production.file -f docker-compose.prod.yml \
  images > "$BACKUP_DIR/images.txt"
cp .env.production.file "$BACKUP_DIR/"
cp deployment/settings/pathocore_web_production_settings.txt "$BACKUP_DIR/"
cp deployment/settings/pathocore_api_production_settings.txt "$BACKUP_DIR/"
cp deployment/settings/mepram_omop_api_production_settings.txt "$BACKUP_DIR/"
cp deployment/settings/apache_production_settings.txt "$BACKUP_DIR/"
cp deployment/settings/keycloak_production_settings.txt "$BACKUP_DIR/"
chmod -R go-rwx "$BACKUP_DIR"
```

Crear dumps logicos consistentes de las dos bases de datos de aplicacion:

```bash
podman compose --env-file .env.production.file -f docker-compose.prod.yml \
  exec -T pathocore_api_db sh -c \
  'exec mysqldump --single-transaction --routines --triggers -u"$MYSQL_USER" -p"$MYSQL_PASSWORD" "$MYSQL_DATABASE"' \
  > "$BACKUP_DIR/pathocore-api-database.sql"
podman compose --env-file .env.production.file -f docker-compose.prod.yml \
  exec -T mepram_omop_api_db sh -c \
  'exec mysqldump --single-transaction --routines --triggers -u"$MYSQL_USER" -p"$MYSQL_PASSWORD" "$MYSQL_DATABASE"' \
  > "$BACKUP_DIR/mepram-omop-api-database.sql"
```

Localizar y exportar cada volumen no reconstruible declarado en la tabla:

```bash
podman volume ls | grep 'pathocore-web'
podman volume export <volumen-documents> > "$BACKUP_DIR/documents.tar"
podman volume export <volumen-static> > "$BACKUP_DIR/static.tar"
# Dump logico obligatorio del estado autoritativo de Keycloak.
podman compose --env-file .env.production.file -f docker-compose.prod.yml \
  exec -T keycloak_db sh -c \
  'exec mysqldump --single-transaction --routines --triggers -u"$MYSQL_USER" -p"$MYSQL_PASSWORD" "$MYSQL_DATABASE"' \
  > "$BACKUP_DIR/keycloak-database.sql"
```

Exportar `documents` y `static` por cada servicio Django que los declare;
omitir esos comandos para perfiles sin dichos volumenes. Aunque `static` puede
regenerarse con `collectstatic`, conservarlo permite una restauracion exacta.

Guardar tambien los bind mounts persistentes. Los logs se conservan segun su
politica de retencion; la configuracion protegida debe incluirse siempre.

```bash
tar -C /srv/containers/bind -czf "$BACKUP_DIR/bind-mounts.tar.gz" pathocore-web
tar -C /var/log/local -czf "$BACKUP_DIR/logs.tar.gz" pathocore-web
sha256sum "$BACKUP_DIR"/* > "$BACKUP_DIR/SHA256SUMS"
```

No continuar hasta verificar los ficheros, espacio disponible y procedimiento
de restauracion.

## Ejecutar la actualizacion

Ejecutar el comando de instalación/upgrade:

```bash
bash container_install.sh --action upgrade --engine podman \
  --git_revision <nueva-revision-aprobada> \
  --install_conf_map pathocore_web,deployment/settings/pathocore_web_production_settings.txt --install_conf_map pathocore_api,deployment/settings/pathocore_api_production_settings.txt --install_conf_map mepram_omop_api,deployment/settings/mepram_omop_api_production_settings.txt --install_conf_map apache,deployment/settings/apache_production_settings.txt --install_conf_map keycloak,deployment/settings/keycloak_production_settings.txt 2>&1 | tee "$(date +%Y%m%d_%H%M%S)_prod_install.log"
```

Durante `--action upgrade`, `container_install.sh`:

1. valida opciones, configuraciones protegidas y Compose antes de modificar el
   despliegue;
2. genera `.env.production.file` y las configuraciones runtime protegidas;
3. prepara bind mounts, propietarios, modos y etiquetas SELinux;
4. construye las imagenes desde la revision aprobada;
5. recrea la topologia conservando volumenes y bind mounts persistentes;
6. espera readiness y repara los volumenes desde los contenedores en ejecucion;
7. ejecuta el bootstrap requerido por cada perfil —checks, migraciones,
   scripts/fixtures y `collectstatic` para Django—;
8. ejecuta el smoke test y solo entonces declara completada la actualizacion.

Seguir ademas la guia especifica de la version cuando exista. Detenerse ante
cualquier fallo de build, readiness, bootstrap, migracion o smoke test.

## Comprobaciones posteriores

```bash
podman compose --env-file .env.production.file -f docker-compose.prod.yml ps
podman compose --env-file .env.production.file -f docker-compose.prod.yml logs --tail 200
bash scripts/smoke_test.sh --engine podman
```

Completar las comprobaciones que corresponden a la topologia seleccionada:

- `pathocore_web`: confirmar su endpoint `/health/` y un flujo representativo de lectura.
- `pathocore_api`: confirmar su endpoint `/health/` y un flujo representativo de lectura.
- API de `pathocore_api`: confirmar la ruta documentada con autenticacion valida y el rechazo de credenciales ausentes o invalidas.
- `mepram_omop_api`: confirmar su endpoint `/health/` y un flujo representativo de lectura.
- API de `mepram_omop_api`: confirmar la ruta documentada con autenticacion valida y el rechazo de credenciales ausentes o invalidas.
- Apache: confirmar la URL publica registrada, DNS/TLS, proxy, cabeceras reenviadas y el endpoint restringido de server-status.
- Keycloak: confirmar discovery del realm, validacion de tokens OIDC y login/logout; probar acceso administrativo solo cuando el add-on lo habilite.

Verificar tambien correo, tareas programadas y los flujos propios documentados
por la aplicacion. Registrar URL y resultados junto con estado, imagenes y
revision desplegada.

## Rollback

Si el esquema y los formatos persistentes siguen siendo compatibles, desplegar
la revision anterior registrada y repetir las pruebas:

```bash
bash container_install.sh --action upgrade --engine podman \
  --git_revision <revision-anterior> \
  --install_conf_map pathocore_web,deployment/settings/pathocore_web_production_settings.txt --install_conf_map pathocore_api,deployment/settings/pathocore_api_production_settings.txt --install_conf_map mepram_omop_api,deployment/settings/mepram_omop_api_production_settings.txt --install_conf_map apache,deployment/settings/apache_production_settings.txt --install_conf_map keycloak,deployment/settings/keycloak_production_settings.txt
```

Si no son compatibles, detener escrituras y restaurar el punto completo:

```bash
podman compose --env-file .env.production.file -f docker-compose.prod.yml down
podman volume import <volumen-documents> "$BACKUP_DIR/documents.tar"
podman volume import <volumen-static> "$BACKUP_DIR/static.tar"
tar -C /srv/containers/bind -xzf "$BACKUP_DIR/bind-mounts.tar.gz"
install -d -m 0700 deployment/settings
install -m 0600 "$BACKUP_DIR/pathocore_web_production_settings.txt" deployment/settings/pathocore_web_production_settings.txt
install -m 0600 "$BACKUP_DIR/pathocore_api_production_settings.txt" deployment/settings/pathocore_api_production_settings.txt
install -m 0600 "$BACKUP_DIR/mepram_omop_api_production_settings.txt" deployment/settings/mepram_omop_api_production_settings.txt
install -m 0600 "$BACKUP_DIR/apache_production_settings.txt" deployment/settings/apache_production_settings.txt
install -m 0600 "$BACKUP_DIR/keycloak_production_settings.txt" deployment/settings/keycloak_production_settings.txt
bash container_install.sh --action fix-permissions --engine podman \
  --install_conf_map pathocore_web,deployment/settings/pathocore_web_production_settings.txt --install_conf_map pathocore_api,deployment/settings/pathocore_api_production_settings.txt --install_conf_map mepram_omop_api,deployment/settings/mepram_omop_api_production_settings.txt --install_conf_map apache,deployment/settings/apache_production_settings.txt --install_conf_map keycloak,deployment/settings/keycloak_production_settings.txt
# Arrancar solo las bases de datos y esperar readiness antes de restaurar.
podman compose --env-file .env.production.file -f docker-compose.prod.yml \
  up -d pathocore_api_db mepram_omop_api_db keycloak_db
for service in pathocore_api_db mepram_omop_api_db; do
  until podman compose --env-file .env.production.file -f docker-compose.prod.yml \
    exec -T "$service" sh -c \
    'mysqladmin ping -h 127.0.0.1 -u"$MYSQL_USER" -p"$MYSQL_PASSWORD" --silent'; do sleep 2; done
  podman compose --env-file .env.production.file -f docker-compose.prod.yml \
    exec -T "$service" sh -c \
    'exec mysql -u"$MYSQL_USER" -p"$MYSQL_PASSWORD" -e "DROP DATABASE IF EXISTS \`$MYSQL_DATABASE\`; CREATE DATABASE \`$MYSQL_DATABASE\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"'
done
until podman compose --env-file .env.production.file -f docker-compose.prod.yml \
  exec -T keycloak_db sh -c \
  'mysqladmin ping -h 127.0.0.1 -u"$MYSQL_USER" -p"$MYSQL_PASSWORD" --silent'; do sleep 2; done
podman compose --env-file .env.production.file -f docker-compose.prod.yml \
  exec -T keycloak_db sh -c \
  'exec mysql -uroot -p"$MYSQL_ROOT_PASSWORD" -e "DROP DATABASE IF EXISTS \`$MYSQL_DATABASE\`; CREATE DATABASE \`$MYSQL_DATABASE\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"'
podman compose --env-file .env.production.file -f docker-compose.prod.yml \
  exec -T pathocore_api_db sh -c \
  'exec mysql -u"$MYSQL_USER" -p"$MYSQL_PASSWORD" "$MYSQL_DATABASE"' \
  < "$BACKUP_DIR/pathocore-api-database.sql"
podman compose --env-file .env.production.file -f docker-compose.prod.yml \
  exec -T mepram_omop_api_db sh -c \
  'exec mysql -u"$MYSQL_USER" -p"$MYSQL_PASSWORD" "$MYSQL_DATABASE"' \
  < "$BACKUP_DIR/mepram-omop-api-database.sql"
podman compose --env-file .env.production.file -f docker-compose.prod.yml \
  exec -T keycloak_db sh -c \
  'exec mysql -u"$MYSQL_USER" -p"$MYSQL_PASSWORD" "$MYSQL_DATABASE"' \
  < "$BACKUP_DIR/keycloak-database.sql"
```

Restaurar todos los ficheros de ajustes protegidos y desplegar la revision
anotada en `git-revision.txt`. `fix-permissions` regenera
`.env.production.file` antes de cualquier restauracion gestionada por un
add-on. Arrancar y validar antes de reabrir el servicio. Los volumenes deben
existir y estar vacios antes de `podman volume import`; recrearlos con Compose
cuando sea necesario.

La recreacion de esquemas del bloque anterior es destructiva y solo se ejecuta
durante una restauracion completa declarada, despues de preservar el estado
actual. Un rollback compatible de solo aplicacion conserva los tres volumenes
de base de datos sin reinicializarlos.

## Reparar permisos

Ejecutar esta accion cuando:

- se hayan creado o restaurado bind mounts o volumenes;
- se hayan recreado contenedores manualmente;
- hayan cambiado `APP_UID`, `APP_GID` o el usuario rootless;
- existan errores de escritura en logs, documentos, static o configuracion;
- SELinux rechace un bind mount revisado;
- Apache o la aplicacion fallen por propietarios/modos incorrectos.

Primera fase, incluso con los contenedores detenidos:

```bash
bash container_install.sh --action fix-permissions --engine podman \
  --install_conf_map pathocore_web,deployment/settings/pathocore_web_production_settings.txt --install_conf_map pathocore_api,deployment/settings/pathocore_api_production_settings.txt --install_conf_map mepram_omop_api,deployment/settings/mepram_omop_api_production_settings.txt --install_conf_map apache,deployment/settings/apache_production_settings.txt --install_conf_map keycloak,deployment/settings/keycloak_production_settings.txt
```

Esta accion no construye imagenes, no migra la base de datos y no borra datos.
Con los contenedores detenidos repara los bind mounts accesibles desde el host.
Arrancar y repetirla para reparar tambien los volumenes montados:

```bash
podman compose --env-file .env.production.file -f docker-compose.prod.yml up -d
bash container_install.sh --action fix-permissions --engine podman \
  --install_conf_map pathocore_web,deployment/settings/pathocore_web_production_settings.txt --install_conf_map pathocore_api,deployment/settings/pathocore_api_production_settings.txt --install_conf_map mepram_omop_api,deployment/settings/mepram_omop_api_production_settings.txt --install_conf_map apache,deployment/settings/apache_production_settings.txt --install_conf_map keycloak,deployment/settings/keycloak_production_settings.txt
```

## Operaciones utiles

```bash
podman compose --env-file .env.production.file -f docker-compose.prod.yml ps
podman compose --env-file .env.production.file -f docker-compose.prod.yml logs --tail 200
podman compose --env-file .env.production.file -f docker-compose.prod.yml up -d
podman compose --env-file .env.production.file -f docker-compose.prod.yml restart
podman compose --env-file .env.production.file -f docker-compose.prod.yml down
```

### Servicio Django `pathocore_api`

```bash
# Logs separados del servicio.
podman compose --env-file .env.production.file -f docker-compose.prod.yml \
  logs --tail 200 pathocore_api

# Entrar al contenedor.
podman compose --env-file .env.production.file -f docker-compose.prod.yml \
  exec pathocore_api bash

# Regenerar static sin ejecutar migraciones.
podman compose --env-file .env.production.file -f docker-compose.prod.yml \
  exec pathocore_api bash -lc \
  'cd "$INSTALL_PATH" && source virtualenv/bin/activate && python manage.py collectstatic --noinput'

# Diagnostico previo a una recuperacion de bootstrap.
podman compose --env-file .env.production.file -f docker-compose.prod.yml \
  exec pathocore_api bash -lc \
  'cd "$INSTALL_PATH" && source virtualenv/bin/activate && python manage.py check --deploy && python manage.py showmigrations --plan'
```

La recuperacion preferida es corregir la causa y repetir
`container_install.sh --action install|upgrade` con la misma revision y
configuracion protegida. Si el instalador no puede completarse y el responsable
autoriza un bootstrap manual despues del backup:

```bash
podman compose --env-file .env.production.file -f docker-compose.prod.yml \
  exec pathocore_api bash -lc \
  'cd "$INSTALL_PATH" && source virtualenv/bin/activate && python manage.py migrate --noinput && python manage.py collectstatic --noinput'
```

Registrar este procedimiento excepcional y ejecutar despues el smoke test.

### Servicio Django `mepram_omop_api`

```bash
# Logs separados del servicio.
podman compose --env-file .env.production.file -f docker-compose.prod.yml \
  logs --tail 200 mepram_omop_api

# Entrar al contenedor.
podman compose --env-file .env.production.file -f docker-compose.prod.yml \
  exec mepram_omop_api bash

# Regenerar static sin ejecutar migraciones.
podman compose --env-file .env.production.file -f docker-compose.prod.yml \
  exec mepram_omop_api bash -lc \
  'cd "$INSTALL_PATH" && source virtualenv/bin/activate && python manage.py collectstatic --noinput'

# Diagnostico previo a una recuperacion de bootstrap.
podman compose --env-file .env.production.file -f docker-compose.prod.yml \
  exec mepram_omop_api bash -lc \
  'cd "$INSTALL_PATH" && source virtualenv/bin/activate && python manage.py check --deploy && python manage.py showmigrations --plan'
```

La recuperacion preferida es corregir la causa y repetir
`container_install.sh --action install|upgrade` con la misma revision y
configuracion protegida. Si el instalador no puede completarse y el responsable
autoriza un bootstrap manual despues del backup:

```bash
podman compose --env-file .env.production.file -f docker-compose.prod.yml \
  exec mepram_omop_api bash -lc \
  'cd "$INSTALL_PATH" && source virtualenv/bin/activate && python manage.py migrate --noinput && python manage.py collectstatic --noinput'
```

Registrar este procedimiento excepcional y ejecutar despues el smoke test.

### Servicio Apache

```bash
# Logs separados de Apache y validacion de configuracion.
podman compose --env-file .env.production.file -f docker-compose.prod.yml \
  logs --tail 200 apache
podman compose --env-file .env.production.file -f docker-compose.prod.yml \
  exec apache httpd -t

# Estado restringido; usar valores del fichero protegido.
APACHE_PORT='CHANGE_ME'
SERVER_STATUS_SERVER_NAME='localhost'
curl --fail --show-error \
  --header "Host: $SERVER_STATUS_SERVER_NAME" \
  "http://127.0.0.1:$APACHE_PORT/server-status?auto"
```

Para diagnosticos SELinux y ModSecurity, comprobar el bind de logs antes de
reiniciar:

```bash
ls -ldZ /var/log/local/pathocore-web/apache
```

Si aparece `ModSecurity: Failed to open debug log file`, conservar el fichero
para diagnostico, ejecutar `fix-permissions` y reiniciar. Si hay que sustituir
el inode, moverlo primero a un backup en vez de borrarlo.

### Bind de importacion de Keycloak

El instalador copia los JSON versionados desde `KEYCLOAK_REALM_SOURCE_PATH` a
`KEYCLOAK_IMPORT_PATH` antes de iniciar Compose. Con la configuracion generada,
crea automaticamente esta ruta si el usuario del despliegue puede escribir en
`/srv/containers/bind/pathocore-web`:

```text
/srv/containers/bind/pathocore-web/keycloak/realm-import/
```

En hosts donde la politica exija crear previamente cada directorio, ejecutar:

```bash
sudo mkdir -p /srv/containers/bind/pathocore-web/keycloak/realm-import
sudo chown -R <usuario-podman>:<usuario-podman> \
  /srv/containers/bind/pathocore-web/keycloak
```

No modificar permisos ni propietarios de los JSON dentro del repositorio. El
instalador asigna solo las copias staged a `1000:0` con modo `0640`. Incluir el
directorio staged en el backup de binds; `keycloak_db_data` sigue siendo la
fuente autoritativa de identidades.

## Notas de permisos

- Ejecutar siempre Podman y el instalador con el mismo usuario rootless.
- No usar `sudo container_install.sh` ni cambiar propietarios dentro del storage
  de Podman.
- Mantener estables los UID/GID de runtime entre actualizaciones.
- Revisar etiquetas SELinux y propietarios de bind mounts mediante
  `fix-permissions`.
- Preservar evidencias y backups antes de cualquier recuperacion destructiva.
