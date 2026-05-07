import { type PropsWithChildren, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { LoaderCircle, LogIn } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export function RequireAuth({ children }: PropsWithChildren) {
  const location = useLocation();
  const { error, login, status } = useAuth();

  useEffect(() => {
    if (status === "anonymous") {
      void login(`${location.pathname}${location.search}`);
    }
  }, [location.pathname, location.search, login, status]);

  if (status === "authenticated") {
    return <>{children}</>;
  }

  return (
    <Card className="surface-shell border-white/70 bg-white/88">
      <CardContent className="flex min-h-[320px] flex-col items-center justify-center px-8 py-12 text-center">
        {status === "error" ? (
          <>
            <LogIn className="h-8 w-8 text-red-600" />
            <h2 className="mt-5 text-2xl font-semibold text-slate-950">
              Keycloak login is required
            </h2>
            <p className="mt-2 max-w-xl text-sm leading-7 text-slate-500">
              {error ?? "The use-case area requires an authenticated session."}
            </p>
            <Button
              className="mt-6"
              onClick={() => void login(`${location.pathname}${location.search}`)}
              variant="outline"
            >
              <LogIn className="h-4 w-4" />
              Login with Keycloak
            </Button>
          </>
        ) : (
          <>
            <LoaderCircle className="h-8 w-8 animate-spin text-teal-700" />
            <h2 className="mt-5 text-2xl font-semibold text-slate-950">
              Redirecting to Keycloak
            </h2>
            <p className="mt-2 max-w-xl text-sm leading-7 text-slate-500">
              Use-case sections require login. The generic databrowser remains public.
            </p>
          </>
        )}
      </CardContent>
    </Card>
  );
}
