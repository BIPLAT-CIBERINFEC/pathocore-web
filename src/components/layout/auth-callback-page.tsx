import { LoaderCircle, LogIn } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export function AuthCallbackPage() {
  const { error, login, status } = useAuth();

  return (
    <Card className="surface-shell border-white/70 bg-white/88">
      <CardContent className="flex min-h-[320px] flex-col items-center justify-center px-8 py-12 text-center">
        {status === "error" ? (
          <>
            <LogIn className="h-8 w-8 text-red-600" />
            <h2 className="mt-5 text-2xl font-semibold text-slate-950">
              Keycloak login could not be completed
            </h2>
            <p className="mt-2 max-w-xl text-sm leading-7 text-slate-500">
              {error ?? "Start login again to access the use-case area."}
            </p>
            <Button className="mt-6" onClick={() => void login("/use-cases/mepram")} variant="outline">
              <LogIn className="h-4 w-4" />
              Login with Keycloak
            </Button>
          </>
        ) : (
          <>
            <LoaderCircle className="h-8 w-8 animate-spin text-teal-700" />
            <h2 className="mt-5 text-2xl font-semibold text-slate-950">
              Completing Keycloak login
            </h2>
            <p className="mt-2 max-w-xl text-sm leading-7 text-slate-500">
              You will be redirected to the requested use-case page.
            </p>
          </>
        )}
      </CardContent>
    </Card>
  );
}
