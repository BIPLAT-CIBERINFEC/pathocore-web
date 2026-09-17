#!/usr/bin/env python3
"""Create or complete protected production settings from their templates.

This file is centrally managed. Applications must not edit vendored copies.

Each --settings TEMPLATE,OUTPUT pair names a committed settings template and
the protected operator copy used by container_install.sh. A missing output is
created from its template; an existing output keeps every value the operator
already set and only has its remaining placeholders filled.

Placeholders:
  CHANGE_ME{NAME}  a named input. Deployment-scoped names are asked once and
                   filled in every file; service-scoped names are asked once
                   per settings file. One value may combine several names,
                   for example 'https://CHANGE_ME{KEYCLOAK_HOSTNAME}'.
  CHANGE_ME...     a legacy unnamed placeholder; the whole value of that
                   setting is asked for that file only.

Inputs owned by this deployment (application secrets, managed database and
Keycloak passwords) are generated and never printed. Answers can be supplied
with --answers, an INI file with a [deployment] section and one section per
output file name; non-secret answers entered interactively are saved there.
With --non-interactive, a missing answer fails before any file is written.

For existing outputs, a key-difference report lists settings added to or
removed from the template, supporting the upgrade configuration review.
"""

from __future__ import annotations

import argparse
import base64
import configparser
import getpass
import io
import os
import re
import secrets
import sys
import tempfile
from dataclasses import dataclass, field
from pathlib import Path
from urllib.parse import urlsplit


NAMED = re.compile(r"CHANGE_ME\{([A-Z][A-Z0-9_]*)\}")
UNNAMED = re.compile(r"CHANGE_ME(?!\{)[A-Z0-9_]*")
ASSIGNMENT = re.compile(r"^(\s*(?:export\s+)?)([A-Z_][A-Z0-9_]*)=(.*)$")
DEPLOYMENT_SECTION = "deployment"
HOSTNAME = re.compile(
    r"(?=.{1,253}$)[A-Za-z0-9](?:[A-Za-z0-9-]{0,61}[A-Za-z0-9])?"
    r"(?:\.[A-Za-z0-9](?:[A-Za-z0-9-]{0,61}[A-Za-z0-9])?)*"
)
DJANGO_SECRET_ALPHABET = "abcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*(-_=+)"


class ConfigureError(Exception):
    """A problem the operator must fix before any file is written."""


@dataclass(frozen=True)
class Input:
    description: str
    kind: str = "text"
    scope: str = "deployment"
    optional: bool = False
    secret: bool = False
    generate: str = ""


# Named inputs used by the standard templates. Applications may use other
# names; those are deployment-scoped plain text inputs.
REGISTRY: dict[str, Input] = {
    "PUBLIC_HOSTNAME": Input(
        "Main public DNS name of the deployment (browser application or default "
        "Apache virtual host), without scheme. Example: pathocore.example.org",
        kind="hostname",
    ),
    "SERVICE_PUBLIC_HOSTNAME": Input(
        "Public DNS name that reaches this Django service, without scheme. "
        "Example: api.pathocore.example.org",
        kind="hostname", scope="service",
    ),
    "KEYCLOAK_HOSTNAME": Input(
        "Public DNS name of Keycloak, without scheme. Example: auth.example.org",
        kind="hostname",
    ),
    "KEYCLOAK_REALM": Input(
        "Keycloak realm shared by the frontend and APIs. Example: pathocore",
        kind="identifier",
    ),
    "KEYCLOAK_FRONTEND_CLIENT_ID": Input(
        "Keycloak client ID of the browser application. Example: pathocore-web",
        kind="identifier",
    ),
    "OIDC_AUDIENCE": Input(
        "Access-token audience accepted by this API. Example: pathocore-api",
        kind="identifier", scope="service",
    ),
    "SMTP_HOST": Input(
        "SMTP server reachable from the containers. Example: smtp.example.org",
        kind="hostname",
    ),
    "SMTP_USER": Input(
        "SMTP login; leave empty when the relay needs no authentication.",
        optional=True,
    ),
    "SMTP_PASSWORD": Input(
        "SMTP password; leave empty when the relay needs no authentication.",
        optional=True, secret=True,
    ),
    "DB_NAME": Input(
        "Database name for this service. Example: pathocore_api",
        kind="identifier", scope="service",
    ),
    "DB_USER": Input(
        "Least-privilege database user for this service. Example: pathocore_api",
        kind="identifier", scope="service",
    ),
    "EXTERNAL_DB_HOST": Input(
        "External database host reachable from the container. Use "
        "host.docker.internal for a database on the container host.",
        kind="hostname", scope="service",
    ),
    "EXTERNAL_DB_PASSWORD": Input(
        "Password of the existing external database user.",
        scope="service", secret=True,
    ),
    "DB_PASSWORD": Input(
        "Password of the Compose-managed database user.",
        scope="service", secret=True, generate="password",
    ),
    "DB_ROOT_PASSWORD": Input(
        "Root password of the Compose-managed database.",
        scope="service", secret=True, generate="password",
    ),
    "DJANGO_SECRET_KEY": Input(
        "Django signing key; preserve it across upgrades.",
        scope="service", secret=True, generate="django-secret-key",
    ),
    "AUTH_SECRET": Input(
        "Auth.js session secret.",
        scope="service", secret=True, generate="base64-32",
    ),
    "KEYCLOAK_DB_PASSWORD": Input(
        "Keycloak database user password.", secret=True, generate="password",
    ),
    "KEYCLOAK_DB_ROOT_PASSWORD": Input(
        "Keycloak database root password.", secret=True, generate="password",
    ),
    "KEYCLOAK_ADMIN_PASSWORD": Input(
        "Keycloak bootstrap administrator password.", secret=True, generate="password",
    ),
    "MAPBOX_ACCESS_TOKEN": Input("Mapbox access token for Nextstrain.", secret=True),
    "VITE_API_BASE_URL": Input(
        "Browser-visible API base URL or path. Example: /api/v1",
        scope="service",
    ),
}
SECRET_KEY_NAME = re.compile(r"(PASSWORD|SECRET|TOKEN|_KEY)$")


@dataclass
class SettingsFile:
    template: Path
    output: Path
    text: str
    exists: bool
    named: dict[str, list[str]] = field(default_factory=dict)
    unnamed: dict[str, str] = field(default_factory=dict)

    @property
    def section(self) -> str:
        return self.output.name


def generate(kind: str) -> str:
    if kind == "django-secret-key":
        return "".join(secrets.choice(DJANGO_SECRET_ALPHABET) for _ in range(50))
    if kind == "base64-32":
        return base64.b64encode(secrets.token_bytes(32)).decode()
    return secrets.token_urlsafe(32)


def validate(name: str, value: str, spec: Input) -> str:
    """Return the normalized value or raise ConfigureError."""
    value = value.strip()
    if "'" in value or "\n" in value or "\r" in value:
        raise ConfigureError(f"{name} must not contain quotes or newlines")
    if not value:
        if spec.optional:
            return value
        raise ConfigureError(f"{name} is required")
    if spec.kind == "hostname":
        if "://" in value or "/" in value or not HOSTNAME.fullmatch(value):
            raise ConfigureError(
                f"{name} must be a DNS name without scheme, port or path: {value!r}"
            )
    elif spec.kind == "identifier":
        if not re.fullmatch(r"[A-Za-z0-9][A-Za-z0-9._-]*", value):
            raise ConfigureError(
                f"{name} may contain only letters, digits, '.', '_' and '-': {value!r}"
            )
    elif spec.kind == "url":
        parts = urlsplit(value)
        if parts.scheme not in {"http", "https"} or not parts.hostname:
            raise ConfigureError(f"{name} must be an http(s) URL: {value!r}")
        value = value.rstrip("/")
    return value


def input_spec(name: str) -> Input:
    return REGISTRY.get(name, Input(f"Application input {name}."))


def read_settings(template: Path, output: Path) -> SettingsFile:
    exists = output.exists()
    source = output if exists else template
    if not source.is_file():
        raise ConfigureError(f"Settings template not found: {source}")
    settings = SettingsFile(template, output, source.read_text(), exists)
    for line in settings.text.splitlines():
        match = ASSIGNMENT.match(line)
        if not match:
            continue
        key, value = match.group(2), match.group(3)
        for name in NAMED.findall(value):
            settings.named.setdefault(name, []).append(key)
        if UNNAMED.search(NAMED.sub("", value)):
            settings.unnamed[key] = value
    return settings


def setting_keys(text: str) -> list[str]:
    return [
        match.group(2)
        for match in map(ASSIGNMENT.match, text.splitlines())
        if match
    ]


def key_difference_report(settings: SettingsFile) -> list[str]:
    if not settings.exists or not settings.template.is_file():
        return []
    template_keys = set(setting_keys(settings.template.read_text()))
    output_keys = set(setting_keys(settings.text))
    lines = []
    for key in sorted(template_keys - output_keys):
        lines.append(f"  added in template, missing here: {key}")
    for key in sorted(output_keys - template_keys):
        lines.append(f"  not in template (removed or application-specific): {key}")
    return lines


class Answers:
    """Supplied and collected answers, keyed by section and input name."""

    def __init__(self, path: Path | None) -> None:
        self.path = path
        self.parser = configparser.ConfigParser(interpolation=None)
        self.parser.optionxform = str  # keep setting names upper case
        self.changed = False
        if path and path.exists():
            self.parser.read(path, encoding="utf-8")

    def get(self, section: str, name: str) -> str | None:
        if self.parser.has_option(section, name):
            return self.parser.get(section, name)
        return None

    def remember(self, section: str, name: str, value: str) -> None:
        if not self.path:
            return
        if not self.parser.has_section(section):
            self.parser.add_section(section)
        self.parser.set(section, name, value)
        self.changed = True


def ask(prompt: str, secret: bool) -> str:
    if secret:
        return getpass.getpass(f"{prompt}: ")
    return input(f"{prompt}: ")


def resolve_value(
    name: str,
    section: str,
    users: list[str],
    spec: Input,
    answers: Answers,
    interactive: bool,
    generated: list[str],
    missing: list[str],
) -> str | None:
    supplied = answers.get(section, name)
    if supplied is not None:
        return validate(name, supplied, spec)
    if spec.generate:
        generated.extend(users)
        return generate(spec.generate)
    if not interactive:
        missing.append(f"[{section}] {name}")
        return None
    print(f"\n{name} (used by {', '.join(users)})\n  {spec.description}", file=sys.stderr)
    while True:
        try:
            value = validate(name, ask(f"  {name}", spec.secret), spec)
        except ConfigureError as exc:
            print(f"  {exc}", file=sys.stderr)
            continue
        if not spec.secret:
            answers.remember(section, name, value)
        return value


def fill(settings: SettingsFile, values: dict[str, str], unnamed: dict[str, str]) -> str:
    lines = []
    for line in settings.text.splitlines(keepends=True):
        match = ASSIGNMENT.match(line.rstrip("\n"))
        if match:
            key = match.group(2)
            if key in unnamed:
                ending = "\n" if line.endswith("\n") else ""
                line = f"{match.group(1)}{key}='{unnamed[key]}'{ending}"
            else:
                line = NAMED.sub(
                    lambda item: values.get(item.group(1), item.group(0)), line
                )
        lines.append(line)
    return "".join(lines)


def write_protected(path: Path, text: str) -> None:
    path.parent.mkdir(mode=0o700, parents=True, exist_ok=True)
    handle, temporary = tempfile.mkstemp(dir=path.parent, prefix=".configure-")
    try:
        with os.fdopen(handle, "w", encoding="utf-8") as stream:
            stream.write(text)
        os.chmod(temporary, 0o600)
        os.replace(temporary, path)
    except BaseException:
        Path(temporary).unlink(missing_ok=True)
        raise


def configure(
    pairs: list[tuple[Path, Path]],
    answers: Answers,
    interactive: bool,
) -> int:
    files = [read_settings(template, output) for template, output in pairs]
    outputs = [settings.output.resolve() for settings in files]
    if len(set(outputs)) != len(outputs):
        raise ConfigureError("Each --settings output must be a different file")

    for settings in files:
        report = key_difference_report(settings)
        if report:
            print(f"Key differences for {settings.output} versus {settings.template}:")
            print("\n".join(report))

    generated: list[str] = []
    missing: list[str] = []
    deployment_values: dict[str, str] = {}
    file_values: list[dict[str, str]] = []
    file_unnamed: list[dict[str, str]] = []

    # Deployment-scoped names are resolved once, in first-use order.
    deployment_names = [
        name for settings in files for name in settings.named
        if input_spec(name).scope == "deployment"
    ]
    for name in dict.fromkeys(deployment_names):
        users = sorted({
            f"{settings.output.name}:{key}"
            for settings in files for key in settings.named.get(name, [])
        })
        value = resolve_value(
            name, DEPLOYMENT_SECTION, users,
            input_spec(name), answers, interactive, generated, missing,
        )
        if value is not None:
            deployment_values[name] = value

    for settings in files:
        values = dict(deployment_values)
        for name, keys in settings.named.items():
            spec = input_spec(name)
            if spec.scope != "service":
                continue
            value = resolve_value(
                name, settings.section,
                [f"{settings.output.name}:{key}" for key in keys],
                spec, answers, interactive, generated, missing,
            )
            if value is not None:
                values[name] = value
        unnamed: dict[str, str] = {}
        for key, template_value in settings.unnamed.items():
            spec = Input(
                f"Complete value for {key}; template value: {template_value}",
                secret=bool(SECRET_KEY_NAME.search(key)),
            )
            value = resolve_value(
                key, settings.section, [f"{settings.output.name}:{key}"],
                spec, answers, interactive, generated, missing,
            )
            if value is not None:
                unnamed[key] = value
        file_values.append(values)
        file_unnamed.append(unnamed)

    if missing:
        raise ConfigureError(
            "Missing answers (add them to the answers file or run interactively):\n  "
            + "\n  ".join(missing)
        )

    for settings, values, unnamed in zip(files, file_values, file_unnamed):
        text = fill(settings, values, unnamed)
        if text != settings.text or not settings.exists:
            write_protected(settings.output, text)
            print(f"written  {settings.output}")
        else:
            os.chmod(settings.output, 0o600)
            print(f"current  {settings.output}")
    for label in dict.fromkeys(generated):
        print(f"generated {label}")
    if answers.changed and answers.path:
        buffer = io.StringIO()
        answers.parser.write(buffer)
        write_protected(answers.path, buffer.getvalue())
        print(f"answers  {answers.path}")
    return 0


def main() -> int:
    parser = argparse.ArgumentParser(
        description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter
    )
    parser.add_argument(
        "--settings", action="append", required=True, metavar="TEMPLATE,OUTPUT",
        help="Template and protected output; repeat for every settings file.",
    )
    parser.add_argument("--answers", type=Path, help="INI answers file to read and update.")
    parser.add_argument(
        "--non-interactive", action="store_true",
        help="Never prompt; fail when an answer is missing.",
    )
    args = parser.parse_args()

    pairs: list[tuple[Path, Path]] = []
    for entry in args.settings:
        template, separator, output = entry.partition(",")
        if not separator or not template or not output:
            parser.error(f"invalid --settings {entry!r}; expected TEMPLATE,OUTPUT")
        pairs.append((Path(template), Path(output)))
    if args.answers and "settings" not in args.answers.name:
        parser.error("the answers file name must contain 'settings' so ignore rules cover it")

    interactive = not args.non_interactive and sys.stdin.isatty()
    return configure(pairs, Answers(args.answers), interactive)


if __name__ == "__main__":
    try:
        raise SystemExit(main())
    except ConfigureError as exc:
        print(f"ERROR: {exc}", file=sys.stderr)
        raise SystemExit(1)
    except (OSError, configparser.Error) as exc:
        print(f"Error: {exc}", file=sys.stderr)
        raise SystemExit(2)
    except (KeyboardInterrupt, EOFError):
        print("\nAborted; no settings file was written.", file=sys.stderr)
        raise SystemExit(130)
