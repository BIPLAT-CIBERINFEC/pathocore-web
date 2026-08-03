import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { useAuth } from "hooks/use-auth";
import { MepramBrowserLayout } from "@/components/mepram/MepramBrowserLayout";
import { Surface } from "@/components/mepram/MepramPrimitives";
import {
  Activity,
  Radar,
  Siren,
  ShieldAlert,
  Lock,
  LogIn,
  User,
} from "lucide-react";
import { Button } from "@/components/ui/button";

import { MepramDataPage } from "@/components/UseCases/Mepram/MepramDataPage";
import { MepramExplorer } from "@/components/UseCases/Mepram/MepramExplorer";
import { MepramAlertsBoard } from "@/components/UseCases/Mepram/MepramAlertsBoard";
import { MepramAdminBoard } from "@/components/UseCases/Mepram/MepramAdminBoard";
import Link from "next/link";

// Utilidad para decodificar el JWT de Keycloak de forma segura
const decodeToken = (token: string) => {
  try {
    const base64Url = token.split(".")[1];
    const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
    const jsonPayload = decodeURIComponent(
      window
        .atob(base64)
        .split("")
        .map(function (c) {
          return "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2);
        })
        .join("")
    );
    return JSON.parse(jsonPayload);
  } catch (error) {
    return null;
  }
};

export default function MepramUseCasePage() {
  const router = useRouter();
  const { accessToken, login } = useAuth();

  // 1. Estado para controlar si ya estamos en el cliente
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const activeSection = router.query.section || "home";

  // Verificación de rol de administrador
  const tokenPayload = accessToken ? decodeToken(accessToken) : null;
  const isAdmin =
    tokenPayload?.groups?.includes("/use-cases/mepram/admin") ?? false;

  const setActiveSection = (section: string) => {
    router.push(
      {
        pathname: router.pathname,
        query: { section },
      },
      undefined,
      { shallow: true }
    );
  };

  const navigationCards = [
    {
      id: "data",
      title: "Use case data",
      eyebrow: "Metrics",
      description:
        "Quick overview of the use case status with basic metrics, aggregated results, and dashboards.",
      icon: <Radar className="h-6 w-6 text-slate-700" />,
    },
    {
      id: "explorer",
      title: "Isolate explorer",
      eyebrow: "Search",
      description:
        "Operational search for isolates with filters and territorial distribution maps.",
      icon: <Activity className="h-6 w-6 text-slate-700" />,
    },
    {
      id: "alerts",
      title: "Genomic surveillance alerts",
      eyebrow: "Protected",
      description:
        "Surveillance alert layer. Requires authorization to access this sensitive information.",
      icon: <Siren className="h-6 w-6 text-slate-700" />,
    },
  ];

  // 2. Mientras no esté montado, renderizamos un esqueleto neutral idéntico
  // tanto en el SSR como en el primer render del cliente para evitar el mismatch.
  if (!isMounted) {
    return (
      <MepramBrowserLayout
        title="PathoCore - Mepram Use Case"
        description="Data and genomic surveillance area for the Mepram use case."
        breadcrumbs={[{ label: "Use Cases" }, { label: "Mepram" }]}
      >
        <div className="flex min-h-[60vh] items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-slate-200 border-t-[#4f46e5]" />
        </div>
      </MepramBrowserLayout>
    );
  }

  if (!accessToken) {
    return (
      <MepramBrowserLayout
        title="PathoCore - Mepram Use Case"
        description="Data and genomic surveillance area for the Mepram use case."
        breadcrumbs={[{ label: "Use Cases" }, { label: "Mepram" }]}
      >
        <div className="flex min-h-[60vh] items-center justify-center px-4">
          <Surface className="w-full max-w-md border border-slate-100 p-8 text-center rounded-[24px] shadow-xl bg-white/80 backdrop-blur-sm">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-amber-50 text-amber-600 border border-amber-200">
              <Lock className="h-5 w-5" />
            </div>

            <h2 className="text-xl font-bold text-slate-800 tracking-tight">
              Authentication Required
            </h2>

            <div className="mt-2 space-y-3 text-sm text-slate-600 leading-relaxed">
              <p>
                The Mepram Use Case section requires an active session to
                securely access analytical and genomic data.
              </p>
              <p>
                Click the button below to be redirected to the secure Keycloak
                login panel and access the tools.
              </p>
            </div>

            <div className="mt-6 flex flex-col gap-3">
              <Button
                onClick={() => {
                  if (typeof login === "function") {
                    void login();
                  } else {
                    console.error("The 'login' method is not available.");
                  }
                }}
                className="flex w-full items-center justify-center gap-2 rounded-full bg-[#4D45E1] py-2.5 text-sm font-medium text-white shadow-md transition-all hover:bg-slate-800 active:scale-[0.98]"
              >
                <LogIn className="h-4 w-4" />
                Log In with Keycloak
              </Button>

              <Link
                href="/signin"
                className="flex w-full items-center justify-center gap-2 rounded-full bg-[#4D45E1] py-2.5 text-sm font-medium text-white shadow-md transition-all hover:bg-slate-800 active:scale-[0.98]"
                style={{ color: "white" }}
              >
                <User className="h-4 w-4" />
                Sign in
              </Link>
            </div>
          </Surface>
        </div>
      </MepramBrowserLayout>
    );
  }
  // =========================================================================

  // Si pasa la barrera, renderizamos la app normalmente
  return (
    <MepramBrowserLayout
      title="PathoCore - Mepram Use Case"
      description="Data and genomic surveillance area for the Mepram use case."
      breadcrumbs={
        [
          { label: "Use Cases" },
          { label: "Mepram", onClick: () => setActiveSection("home") },
          activeSection !== "home"
            ? {
                label:
                  activeSection === "data"
                    ? "Use Case Data"
                    : activeSection === "explorer"
                    ? "Isolate Explorer"
                    : activeSection === "admin"
                    ? "Admin Panel"
                    : "Alerts",
              }
            : null,
        ].filter(Boolean) as any
      }
    >
      {/* Botón superior de Admin (violeta institucional) por encima de las cards */}
      {isAdmin && activeSection === "home" && (
        <div className="mb-6 flex justify-end">
          <Button
            onClick={() => setActiveSection("admin")}
            className="flex items-center gap-2 rounded-xl bg-[#4f46e5] px-4 py-2.5 text-sm font-semibold text-white shadow-md transition-all hover:bg-[#4338ca]"
          >
            <ShieldAlert className="h-4 w-4 text-white" />
            Administration Panel
          </Button>
        </div>
      )}

      {activeSection === "home" ? (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {navigationCards.map((card) => (
            <Surface
              key={card.id}
              className="flex flex-col h-full hover:border-[#4f46e5]/40 transition-all border-slate-100/50 border-2 rounded-[24px] p-0 overflow-hidden cursor-pointer group"
            >
              <div
                className="p-6 flex flex-col h-full w-full text-left select-none"
                onClick={() => setActiveSection(card.id)}
              >
                <div className="flex justify-between items-start mb-6">
                  <div className="p-3 bg-slate-50 rounded-xl text-xl group-hover:bg-[#4f46e5]/10 transition-colors">
                    {card.icon}
                  </div>
                  <span className="text-[10px] font-bold py-1 px-3 bg-slate-100 rounded-full text-slate-500 uppercase tracking-wider">
                    {card.eyebrow}
                  </span>
                </div>

                <h3 className="text-lg font-semibold text-slate-900 mb-3 tracking-tight">
                  {card.title}
                </h3>
                <p className="text-sm text-slate-500 leading-relaxed mb-6 flex-grow">
                  {card.description}
                </p>

                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setActiveSection(card.id);
                  }}
                  className="text-sm font-bold text-slate-900 flex items-center gap-2 group-hover:text-[#4f46e5] transition-colors"
                >
                  Open section{" "}
                  <span className="transition-transform group-hover:translate-x-1">
                    →
                  </span>
                </button>
              </div>
            </Surface>
          ))}
        </div>
      ) : (
        <div className="space-y-8">
          <button
            onClick={() => setActiveSection("home")}
            className="mb-4 text-xs font-bold text-slate-400 hover:text-slate-900 flex items-center gap-2 uppercase tracking-widest"
          >
            ← Back to menu
          </button>

          {activeSection === "data" && <MepramDataPage />}
          {activeSection === "explorer" && <MepramExplorer />}
          {activeSection === "alerts" && <MepramAlertsBoard />}
          {activeSection === "admin" && isAdmin && <MepramAdminBoard />}
        </div>
      )}
    </MepramBrowserLayout>
  );
}
