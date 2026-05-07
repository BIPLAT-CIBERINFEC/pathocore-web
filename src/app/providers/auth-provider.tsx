import {
  type PropsWithChildren,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";
import {
  KEYCLOAK_CLIENT_ID,
  KEYCLOAK_REALM,
  KEYCLOAK_URL,
} from "@/lib/constants";
import { AuthContext } from "@/app/providers/auth-context";
import type { AuthContextValue, AuthUser } from "@/types/auth";

const AUTH_SESSION_KEY = "pathocore-web.keycloak.session";
const PKCE_SESSION_KEY = "pathocore-web.keycloak.pkce";

interface StoredAuthSession {
  accessToken: string;
  expiresAt: number;
  user: AuthUser;
}

interface StoredPkceState {
  codeVerifier: string;
  returnTo: string;
  state: string;
}

interface TokenResponse {
  access_token: string;
  expires_in: number;
}

interface JwtClaims {
  exp?: number;
  groups?: string[];
  preferred_username?: string;
  sub?: string;
}

function keycloakRealmUrl() {
  return `${KEYCLOAK_URL.replace(/\/$/, "")}/realms/${encodeURIComponent(KEYCLOAK_REALM)}`;
}

function randomString() {
  const bytes = new Uint8Array(32);
  crypto.getRandomValues(bytes);
  return btoa(String.fromCharCode(...bytes))
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
}

async function sha256Base64Url(value: string) {
  const data = new TextEncoder().encode(value);
  const hash = await crypto.subtle.digest("SHA-256", data);
  return btoa(String.fromCharCode(...new Uint8Array(hash)))
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
}

function decodeJwtClaims(token: string): JwtClaims {
  const payload = token.split(".")[1];
  if (!payload) {
    return {};
  }

  const paddedPayload = payload + "=".repeat((4 - (payload.length % 4)) % 4);
  return JSON.parse(atob(paddedPayload.replace(/-/g, "+").replace(/_/g, "/"))) as JwtClaims;
}

function userFromToken(token: string): AuthUser {
  const claims = decodeJwtClaims(token);
  return {
    groups: claims.groups ?? [],
    id: claims.sub ?? "",
    username: claims.preferred_username ?? claims.sub ?? "unknown",
  };
}

function readStoredSession(): StoredAuthSession | null {
  const rawSession = sessionStorage.getItem(AUTH_SESSION_KEY);
  if (!rawSession) {
    return null;
  }

  try {
    const session = JSON.parse(rawSession) as StoredAuthSession;
    if (session.expiresAt <= Date.now() + 10_000) {
      sessionStorage.removeItem(AUTH_SESSION_KEY);
      return null;
    }
    return session;
  } catch {
    sessionStorage.removeItem(AUTH_SESSION_KEY);
    return null;
  }
}

export function AuthProvider({ children }: PropsWithChildren) {
  const [session, setSession] = useState<StoredAuthSession | null>(() =>
    readStoredSession(),
  );
  const [status, setStatus] = useState<AuthContextValue["status"]>(() =>
    readStoredSession() ? "authenticated" : "anonymous",
  );
  const [error, setError] = useState<string | null>(null);

  const logout = useCallback(() => {
    sessionStorage.removeItem(AUTH_SESSION_KEY);
    setSession(null);
    setStatus("anonymous");
    setError(null);
  }, []);

  const login = useCallback(async (returnTo = window.location.pathname) => {
    if (!KEYCLOAK_URL || !KEYCLOAK_REALM || !KEYCLOAK_CLIENT_ID) {
      setError("Keycloak frontend configuration is incomplete.");
      setStatus("error");
      return;
    }

    setStatus("loading");
    setError(null);

    const state = randomString();
    const codeVerifier = randomString();
    const codeChallenge = await sha256Base64Url(codeVerifier);
    const redirectUri = `${window.location.origin}/auth/callback`;

    const storedState: StoredPkceState = {
      codeVerifier,
      returnTo,
      state,
    };
    sessionStorage.setItem(PKCE_SESSION_KEY, JSON.stringify(storedState));

    const authorizeUrl = new URL(`${keycloakRealmUrl()}/protocol/openid-connect/auth`);
    authorizeUrl.searchParams.set("client_id", KEYCLOAK_CLIENT_ID);
    authorizeUrl.searchParams.set("code_challenge", codeChallenge);
    authorizeUrl.searchParams.set("code_challenge_method", "S256");
    authorizeUrl.searchParams.set("redirect_uri", redirectUri);
    authorizeUrl.searchParams.set("response_type", "code");
    authorizeUrl.searchParams.set("scope", "openid profile");
    authorizeUrl.searchParams.set("state", state);

    window.location.assign(authorizeUrl.toString());
  }, []);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const code = params.get("code");
    const state = params.get("state");

    if (window.location.pathname !== "/auth/callback" || !code || !state) {
      return;
    }

    const authCode = code;
    const authState = state;
    let cancelled = false;

    async function completeLogin() {
      setStatus("loading");
      setError(null);

      try {
        const rawPkceState = sessionStorage.getItem(PKCE_SESSION_KEY);
        if (!rawPkceState) {
          throw new Error("Login state is missing. Start login again.");
        }

        const pkceState = JSON.parse(rawPkceState) as StoredPkceState;
        if (pkceState.state !== authState) {
          throw new Error("Login state does not match.");
        }

        const redirectUri = `${window.location.origin}/auth/callback`;
        const response = await fetch(
          `${keycloakRealmUrl()}/protocol/openid-connect/token`,
          {
            body: new URLSearchParams({
              client_id: KEYCLOAK_CLIENT_ID,
              code: authCode,
              code_verifier: pkceState.codeVerifier,
              grant_type: "authorization_code",
              redirect_uri: redirectUri,
            }),
            headers: {
              "Content-Type": "application/x-www-form-urlencoded",
            },
            method: "POST",
          },
        );

        if (!response.ok) {
          throw new Error("Keycloak token exchange failed.");
        }

        const tokenResponse = (await response.json()) as TokenResponse;
        const user = userFromToken(tokenResponse.access_token);
        const claims = decodeJwtClaims(tokenResponse.access_token);
        const expiresAt = claims.exp
          ? claims.exp * 1000
          : Date.now() + tokenResponse.expires_in * 1000;
        const nextSession = {
          accessToken: tokenResponse.access_token,
          expiresAt,
          user,
        };

        sessionStorage.setItem(AUTH_SESSION_KEY, JSON.stringify(nextSession));
        sessionStorage.removeItem(PKCE_SESSION_KEY);

        if (!cancelled) {
          setSession(nextSession);
          setStatus("authenticated");
          window.location.replace(pkceState.returnTo || "/");
        }
      } catch (loginError) {
        if (!cancelled) {
          setError(
            loginError instanceof Error
              ? loginError.message
              : "Keycloak login failed.",
          );
          setStatus("error");
        }
      }
    }

    void completeLogin();

    return () => {
      cancelled = true;
    };
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      accessToken: session?.accessToken ?? null,
      error,
      login,
      logout,
      status,
      user: session?.user ?? null,
    }),
    [error, login, logout, session, status],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
