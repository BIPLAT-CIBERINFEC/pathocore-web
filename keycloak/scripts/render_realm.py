#!/usr/bin/env python3
import argparse
import json
from pathlib import Path


BASE_DIR = Path(__file__).resolve().parent.parent
CONFIG_DIR = BASE_DIR / "config"
DEFAULT_PROFILE = "test"
IMPORT_DIR = BASE_DIR / "tmp-import"

BUILTIN_DEFAULT_CLIENT_SCOPES = ["profile", "email", "roles"]
WEB_DEFAULT_CLIENT_SCOPES = BUILTIN_DEFAULT_CLIENT_SCOPES + ["web-origins"]


def parse_args():
    parser = argparse.ArgumentParser(
        description="Render a reproducible Keycloak realm import file."
    )
    parser.add_argument(
        "--config",
        default=None,
        help="Realm profile config JSON to render.",
    )
    parser.add_argument(
        "--profile",
        default=DEFAULT_PROFILE,
        help=(
            "Realm profile under config/realm-config.<profile>.json. "
            "Ignored when --config is provided."
        ),
    )
    parser.add_argument(
        "--output-dir",
        default=str(IMPORT_DIR),
        help="Directory used by Keycloak --import-realm.",
    )
    return parser.parse_args()


def resolve_config_path(args):
    if args.config:
        return Path(args.config)
    return CONFIG_DIR / f"realm-config.{args.profile}.json"


def load_config(config_path):
    return json.loads(config_path.read_text())


def build_group_tree(config):
    role_names = config["roles"]
    use_cases = []
    for use_case in config["use_cases"]:
        child_groups = [{"name": role_name} for role_name in role_names]
        labs = use_case.get("labs") or []
        if labs:
            child_groups.append(
                {
                    "name": "labs",
                    "subGroups": [
                        {
                            "name": lab_name,
                            "subGroups": [
                                {"name": role_name} for role_name in role_names
                            ],
                        }
                        for lab_name in labs
                    ],
                }
            )
        use_cases.append({"name": use_case["name"], "subGroups": child_groups})
    groups = [{"name": group_name} for group_name in config.get("global_groups", [])]
    groups.append({"name": config["group_root"], "subGroups": use_cases})
    return groups


def build_shared_client_scope(config):
    scope_config = config["shared_client_scope"]
    protocol_mappers = []
    if scope_config.get("include_identity_claims", True):
        protocol_mappers.extend(build_identity_mappers())
        protocol_mappers.append(build_subject_mapper())
    if scope_config.get("include_groups", True):
        protocol_mappers.append(build_groups_mapper())
    protocol_mappers.extend(
        build_audience_mapper(audience)
        for audience in scope_config.get("audiences", [])
    )

    return {
        "name": scope_config["name"],
        "protocol": "openid-connect",
        "attributes": {
            "display.on.consent.screen": "false",
            "include.in.token.scope": "true",
        },
        "protocolMappers": protocol_mappers,
    }


def build_user_property_mapper(name, user_property, token_claim):
    return {
        "name": name,
        "protocol": "openid-connect",
        "protocolMapper": "oidc-usermodel-property-mapper",
        "consentRequired": False,
        "config": {
            "user.attribute": user_property,
            "claim.name": token_claim,
            "jsonType.label": "String",
            "access.token.claim": "true",
            "id.token.claim": "true",
            "userinfo.token.claim": "true",
        },
    }


def build_identity_mappers():
    return [
        build_user_property_mapper(
            "preferred username", "username", "preferred_username"
        ),
        build_user_property_mapper("given name", "firstName", "given_name"),
        build_user_property_mapper("family name", "lastName", "family_name"),
        {
            "name": "full name",
            "protocol": "openid-connect",
            "protocolMapper": "oidc-full-name-mapper",
            "consentRequired": False,
            "config": {
                "access.token.claim": "true",
                "id.token.claim": "true",
                "userinfo.token.claim": "true",
            },
        },
    ]


def build_subject_mapper():
    return {
        "name": "sub",
        "protocol": "openid-connect",
        "protocolMapper": "oidc-sub-mapper",
        "consentRequired": False,
        "config": {
            "access.token.claim": "true",
            "id.token.claim": "true",
            "userinfo.token.claim": "true",
        },
    }


def build_groups_mapper():
    return {
        "name": "groups",
        "protocol": "openid-connect",
        "protocolMapper": "oidc-group-membership-mapper",
        "consentRequired": False,
        "config": {
            "claim.name": "groups",
            "full.path": "true",
            "access.token.claim": "true",
            "id.token.claim": "true",
            "userinfo.token.claim": "true",
        },
    }


def build_audience_mapper(audience_client_id):
    return {
        "name": f"audience-{audience_client_id}",
        "protocol": "openid-connect",
        "protocolMapper": "oidc-audience-mapper",
        "consentRequired": False,
        "config": {
            "included.client.audience": audience_client_id,
            "access.token.claim": "true",
            "id.token.claim": "false",
        },
    }


def build_client(client_config, shared_scope_name):
    is_web_client = client_config.get("kind") == "web"
    default_client_scopes = list(
        WEB_DEFAULT_CLIENT_SCOPES if is_web_client else BUILTIN_DEFAULT_CLIENT_SCOPES
    )
    configured_default_scopes = client_config.get("default_client_scopes")
    if configured_default_scopes is None:
        configured_default_scopes = [shared_scope_name] if is_web_client else []
    default_client_scopes.extend(
        scope
        for scope in configured_default_scopes
        if scope not in default_client_scopes
    )
    optional_client_scopes = client_config.get("optional_client_scopes", [])

    client = {
        "clientId": client_config["client_id"],
        "name": client_config["name"],
        "enabled": True,
        "protocol": "openid-connect",
        "publicClient": bool(client_config.get("public_client", True)),
        "bearerOnly": bool(client_config.get("bearer_only", False)),
        "standardFlowEnabled": bool(client_config.get("standard_flow_enabled", False)),
        "implicitFlowEnabled": bool(client_config.get("implicit_flow_enabled", False)),
        "directAccessGrantsEnabled": bool(
            client_config.get("direct_access_grants_enabled", False)
        ),
        "serviceAccountsEnabled": bool(
            client_config.get("service_accounts_enabled", False)
        ),
        "authorizationServicesEnabled": bool(
            client_config.get("authorization_services_enabled", False)
        ),
        "defaultClientScopes": default_client_scopes,
        "optionalClientScopes": optional_client_scopes,
    }
    if not client["publicClient"] and not client["bearerOnly"]:
        client["clientAuthenticatorType"] = "client-secret"

    redirect_uris = client_config.get("redirect_uris")
    if redirect_uris:
        client["redirectUris"] = redirect_uris
    web_origins = client_config.get("web_origins")
    if web_origins:
        client["webOrigins"] = web_origins
        client["attributes"] = {"pkce.code.challenge.method": "S256"}
    return client


def build_user(user_config):
    return {
        "username": user_config["username"],
        "enabled": True,
        "emailVerified": True,
        "firstName": user_config["first_name"],
        "lastName": user_config["last_name"],
        "email": user_config["email"],
        "credentials": [
            {
                "type": "password",
                "value": user_config["password"],
                "temporary": False,
            }
        ],
        "groups": user_config["groups"],
    }


def render_realm(config):
    shared_scope_name = config["shared_client_scope"]["name"]
    client_scopes = [build_shared_client_scope(config)]

    return {
        "realm": config["realm"],
        "enabled": True,
        "registrationAllowed": False,
        "groups": build_group_tree(config),
        "clientScopes": client_scopes,
        "users": [build_user(user_config) for user_config in config.get("users", [])],
        "clients": [
            build_client(client_config, shared_scope_name)
            for client_config in config["clients"]
        ],
    }


def main():
    args = parse_args()
    config_path = resolve_config_path(args)
    output_dir = Path(args.output_dir)
    config = load_config(config_path)
    output_dir.mkdir(parents=True, exist_ok=True)
    output_path = output_dir / f"{config['realm']}-realm.json"
    output_path.write_text(json.dumps(render_realm(config), indent=2) + "\n")
    print(output_path)


if __name__ == "__main__":
    main()
