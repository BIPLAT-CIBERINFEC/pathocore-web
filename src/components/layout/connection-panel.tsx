import { Database, LogIn, LogOut, RefreshCw, ShieldCheck, ShieldX, UserRound } from "lucide-react";
import { useLocation } from "react-router-dom";
import { DEFAULT_API_BASE_URL } from "@/lib/constants";
import { formatDateTime } from "@/lib/format";
import { useAuth } from "@/hooks/use-auth";
import { useDatabrowser } from "@/hooks/use-databrowser";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export function ConnectionPanel() {
  const location = useLocation();
  const { error, lastUpdated, refresh, status } = useDatabrowser();
  const auth = useAuth();
  const isUseCaseRoute = location.pathname.startsWith("/use-cases/");

  return (
    <div className="flex flex-col items-start gap-3 xl:items-end">
      <div className="flex flex-wrap items-center justify-end gap-2">
        <Badge variant={status === "success" ? "default" : status === "error" ? "outline" : "secondary"}>
          {status === "success" ? (
            <ShieldCheck className="mr-1 h-3.5 w-3.5" />
          ) : (
            <ShieldX className="mr-1 h-3.5 w-3.5" />
          )}
          {status === "success"
            ? "Public databrowser loaded"
            : status === "loading"
              ? "Loading public databrowser"
              : "Public API unavailable"}
        </Badge>

        {auth.status === "authenticated" ? (
          <>
            <Badge variant="secondary">
              <UserRound className="mr-1 h-3.5 w-3.5" />
              {auth.user?.username ?? "Keycloak user"}
            </Badge>
            <Button onClick={auth.logout} size="sm" variant="outline">
              <LogOut className="h-4 w-4" />
              Logout
            </Button>
          </>
        ) : isUseCaseRoute ? (
          <Button
            onClick={() => void auth.login(`${location.pathname}${location.search}`)}
            size="sm"
            variant="outline"
          >
            <LogIn className="h-4 w-4" />
            Keycloak login
          </Button>
        ) : null}

        <Button onClick={() => void refresh()} size="sm" variant="ghost">
          <RefreshCw className="h-4 w-4" />
          Refresh
        </Button>
      </div>

      <div className="flex flex-wrap items-center gap-2 text-xs leading-5 text-slate-500 xl:justify-end">
        <Database className="h-3.5 w-3.5" />
        <span>Public API: {DEFAULT_API_BASE_URL}</span>
        <span>Last refresh: {formatDateTime(lastUpdated)}</span>
        {error ? <span className="text-red-600">{error}</span> : null}
      </div>
    </div>
  );
}
