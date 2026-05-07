export interface AuthUser {
  id: string;
  groups: string[];
  username: string;
}

export type AuthStatus = "anonymous" | "authenticated" | "error" | "loading";

export interface AuthContextValue {
  accessToken: string | null;
  error: string | null;
  login: (returnTo?: string) => Promise<void>;
  logout: () => void;
  status: AuthStatus;
  user: AuthUser | null;
}
