import { useEffect, useState } from "react";
import { Database, KeyRound, RefreshCw, ShieldCheck, ShieldX } from "lucide-react";
import { DEFAULT_API_BASE_URL } from "@/lib/constants";
import { formatDateTime } from "@/lib/format";
import { useDatabrowser } from "@/hooks/use-databrowser";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import type { ApiCredentials } from "@/types/api";

export function ConnectionPanel() {
  const {
    clearCredentials,
    credentials,
    error,
    lastUpdated,
    refresh,
    saveCredentials,
    status,
  } = useDatabrowser();
  const [open, setOpen] = useState(false);
  const [formCredentials, setFormCredentials] = useState<ApiCredentials>({
    password: credentials?.password ?? "",
    username: credentials?.username ?? "",
  });

  useEffect(() => {
    setFormCredentials({
      password: credentials?.password ?? "",
      username: credentials?.username ?? "",
    });
  }, [credentials]);

  const save = () => {
    if (formCredentials.username && formCredentials.password) {
      saveCredentials(formCredentials);
      return;
    }

    saveCredentials(null);
  };

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center justify-end gap-2">
        <Badge variant={status === "success" ? "default" : status === "error" ? "outline" : "secondary"}>
          {status === "success" ? (
            <ShieldCheck className="mr-1 h-3.5 w-3.5" />
          ) : (
            <ShieldX className="mr-1 h-3.5 w-3.5" />
          )}
          {status === "success"
            ? "Public API snapshot loaded"
            : status === "loading"
              ? "Loading public API data"
              : "API unavailable"}
        </Badge>
        <Button onClick={() => setOpen((value) => !value)} size="sm" variant="outline">
          <KeyRound className="h-4 w-4" />
          API access
        </Button>
        <Button onClick={() => void refresh()} size="sm" variant="ghost">
          <RefreshCw className="h-4 w-4" />
          Refresh
        </Button>
      </div>
      {open ? (
        <Card className="border-white/70 bg-white/92">
          <CardContent className="space-y-4 p-5">
            <div className="flex items-center gap-2 text-sm font-medium text-slate-700">
              <Database className="h-4 w-4" />
              Backend target: {DEFAULT_API_BASE_URL}
            </div>
            <p className="text-sm leading-6 text-slate-500">
              En testing, usa estas credenciales para autenticar contra una API que
              todavía protege los endpoints del databrowser. La vista genérica no usa
              esas credenciales para filtrar por proyecto ni envía `project_name`.
            </p>
            <div className="grid gap-3 sm:grid-cols-2">
              <Input
                onChange={(event) =>
                  setFormCredentials((current) => ({
                    ...current,
                    username: event.target.value,
                  }))
                }
                placeholder="Username"
                value={formCredentials.username}
              />
              <Input
                onChange={(event) =>
                  setFormCredentials((current) => ({
                    ...current,
                    password: event.target.value,
                  }))
                }
                placeholder="Password"
                type="password"
                value={formCredentials.password}
              />
            </div>
            <div className="flex flex-wrap gap-2">
              <Button onClick={save} size="sm">
                Save credentials
              </Button>
              <Button
                onClick={() => {
                  clearCredentials();
                  setFormCredentials({ password: "", username: "" });
                }}
                size="sm"
                variant="outline"
              >
                Clear stored credentials
              </Button>
            </div>
            <div className="text-xs leading-5 text-slate-400">
              <p>Last refresh: {formatDateTime(lastUpdated)}</p>
              {error ? <p className="mt-1 text-red-600">{error}</p> : null}
            </div>
          </CardContent>
        </Card>
      ) : null}
    </div>
  );
}
