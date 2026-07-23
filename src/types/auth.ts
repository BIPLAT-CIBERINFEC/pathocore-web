export interface AuthUser {
  groups: string[];
  id: string;
  username: string;
}

export interface AuthContextValue {
  accessToken: string | null;
  error: string | null;
  login: (returnTo?: string) => Promise<void>;
  logout: () => void;
  status: "anonymous" | "error" | "loading" | "authenticated";
  user: AuthUser | null;
}
