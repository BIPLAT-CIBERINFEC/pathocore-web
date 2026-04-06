import { AlertTriangle, LoaderCircle, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

interface DataStatusPanelProps {
  error?: string | null;
  onRetry?: () => void;
  status: "error" | "idle" | "loading" | "success";
}

export function DataStatusPanel({
  error,
  onRetry,
  status,
}: DataStatusPanelProps) {
  const isLoading = status !== "error";

  return (
    <Card className="surface-shell border-white/70 bg-white/88">
      <CardContent className="flex min-h-[320px] flex-col items-center justify-center px-8 py-12 text-center">
        {isLoading ? (
          <>
            <LoaderCircle className="h-8 w-8 animate-spin text-teal-700" />
            <h2 className="mt-5 text-2xl font-semibold text-slate-950">
              Loading databrowser snapshot
            </h2>
            <p className="mt-2 max-w-xl text-sm leading-7 text-slate-500">
              Fetching schemas, samples and per-sample metadata from the real API.
            </p>
          </>
        ) : (
          <>
            <AlertTriangle className="h-8 w-8 text-red-600" />
            <h2 className="mt-5 text-2xl font-semibold text-slate-950">
              API connection needs attention
            </h2>
            <p className="mt-2 max-w-xl text-sm leading-7 text-slate-500">
              {error ??
                "The databrowser could not be loaded. Check credentials or an existing backend session."}
            </p>
            {onRetry ? (
              <Button className="mt-6" onClick={onRetry} variant="outline">
                <RefreshCw className="h-4 w-4" />
                Retry
              </Button>
            ) : null}
          </>
        )}
      </CardContent>
    </Card>
  );
}
