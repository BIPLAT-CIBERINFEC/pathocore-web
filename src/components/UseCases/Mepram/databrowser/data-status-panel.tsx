import { AlertTriangle, LoaderCircle, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Surface } from "@/components/mepram/MepramPrimitives";

export function DataStatusPanel({ error, onRetry, status }: any) {
  const isLoading = status !== "error";

  return (
    <Surface className="border border-slate-100/80 p-12 shadow-sm animate-in fade-in duration-700">
      <div className="flex min-h-[320px] flex-col items-center justify-center text-center">
        {isLoading ? (
          <>
            <LoaderCircle className="h-9 w-9 animate-spin text-[#13776e]" />
            <h2 className="mt-5 text-2xl font-semibold text-slate-950 tracking-tight">
              Loading databrowser snapshot
            </h2>
            <p className="mt-2 max-w-xl text-sm leading-relaxed text-slate-500">
              Fetching schemas, samples and per-sample metadata from the real
              API.
            </p>
          </>
        ) : (
          <div className="group transition-all">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-red-50 text-red-600 border border-red-100">
              <AlertTriangle className="h-5 w-5" />
            </div>
            <h2 className="mt-5 text-2xl font-semibold text-slate-950 tracking-tight">
              API connection needs attention
            </h2>
            <p className="mt-2 max-w-xl text-sm leading-relaxed text-slate-500">
              {error ??
                "The public databrowser could not be loaded. Check that the backend API is reachable."}
            </p>
            {onRetry ? (
              <Button
                className="mt-6 rounded-full border border-slate-200 px-6 py-2 text-xs font-medium bg-white text-slate-600 hover:bg-slate-50 hover:border-indigo-200 hover:text-[#4f46e5] transition-all"
                onClick={onRetry}
                variant="outline"
              >
                <RefreshCw className="mr-2 h-3.5 w-3.5" />
                Retry Connection
              </Button>
            ) : null}
          </div>
        )}
      </div>
    </Surface>
  );
}
