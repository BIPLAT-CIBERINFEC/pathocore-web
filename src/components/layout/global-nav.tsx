import { Link, NavLink, useLocation } from "react-router-dom";
import { ChevronDown } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function GlobalNav() {
  const location = useLocation();
  const genericRoutes = new Set(["/", "/overview", "/schema", "/metadata", "/variant"]);
  const genericActive = genericRoutes.has(location.pathname);
  const useCasesActive = location.pathname.startsWith("/use-cases/");

  return (
    <nav className="mt-6 flex flex-wrap gap-2">
      <Link
        className={cn(
          buttonVariants({
            size: "sm",
            variant: genericActive ? "default" : "outline",
          }),
          "rounded-full",
        )}
        to="/"
      >
        Generic Databrowser
      </Link>

      <NavLink
        className={({ isActive }) =>
          cn(
            buttonVariants({
              size: "sm",
              variant: isActive ? "default" : "outline",
            }),
            "rounded-full",
          )
        }
        to="/about-us"
      >
        About Us
      </NavLink>

      <details className="group relative">
        <summary
          className={cn(
            buttonVariants({
              size: "sm",
              variant: useCasesActive ? "default" : "outline",
            }),
            "list-none rounded-full",
          )}
        >
          Casos de uso
          <ChevronDown className="h-4 w-4 transition group-open:rotate-180" />
        </summary>
        <div className="absolute left-0 top-full z-30 mt-2 min-w-[220px] rounded-[1.35rem] border border-slate-200 bg-white p-2 shadow-[0_20px_50px_rgba(15,23,42,0.12)]">
          <NavLink
            className={({ isActive }) =>
              cn(
                "flex rounded-[1rem] px-3 py-2 text-sm transition",
                isActive || useCasesActive
                  ? "bg-slate-900 text-white"
                  : "text-slate-700 hover:bg-slate-50",
              )
            }
            to="/use-cases/mepram"
          >
            MePRAM temporal
          </NavLink>
        </div>
      </details>
    </nav>
  );
}
