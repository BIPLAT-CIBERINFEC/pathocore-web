import {
  Database,
} from "lucide-react";
import { motion } from "framer-motion";
import { Navigate, Route, Routes } from "react-router-dom";
import { AuthCallbackPage } from "@/components/layout/auth-callback-page";
import { ConnectionPanel } from "@/components/layout/connection-panel";
import { GlobalNav } from "@/components/layout/global-nav";
import { RequireAuth } from "@/components/layout/require-auth";
import { AboutPage } from "@/pages/about-page";
import { DatabrowserHomePage } from "@/pages/home-page";
import { MepramAlertsPage } from "@/pages/mepram-alerts-page";
import { MepramExplorerPage } from "@/pages/mepram-explorer-page";
import { MetadataPage } from "@/pages/metadata-page";
import { MepramDataPage } from "@/pages/mepram-page";
import { OverviewPage } from "@/pages/overview-page";
import { SchemaPage } from "@/pages/schema-page";
import { VariantPage } from "@/pages/variant-page";

export function AppShell() {
  return (
    <div className="relative">
      <div className="pointer-events-none absolute inset-0 bg-grid opacity-[0.16]" />
      <div className="relative mx-auto flex min-h-screen w-full max-w-[1400px] flex-col px-4 py-5 sm:px-6 lg:px-8">
        <header className="surface-shell mb-6 border-white/70 bg-white/80 px-6 py-6">
          <div className="flex flex-col gap-6 xl:flex-row xl:items-start xl:justify-between">
            <div className="max-w-4xl">
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-[1.3rem] bg-teal-700 text-white shadow-glow">
                  <Database className="h-5 w-5" />
                </div>
                <div>
                  <p className="section-kicker">PathoCore</p>
                  <h1 className="text-4xl font-semibold tracking-tight text-slate-950">
                    Databrowser
                  </h1>
                </div>
              </div>
              <p className="mt-5 max-w-3xl text-sm leading-7 text-slate-600">
                Portal web para consultar datos agregados y datos genómicos de
                PathoCore desde la API.
              </p>
              <GlobalNav />
            </div>
            <ConnectionPanel />
          </div>
        </header>
        <main className="flex-1">
          <motion.div
            animate={{ opacity: 1, y: 0 }}
            initial={{ opacity: 0, y: 12 }}
            transition={{ duration: 0.28 }}
          >
            <Routes>
              <Route element={<AboutPage />} path="/about-us" />
              <Route element={<DatabrowserHomePage />} path="/" />
              <Route element={<OverviewPage />} path="/overview" />
              <Route element={<SchemaPage />} path="/schema" />
              <Route element={<MetadataPage />} path="/metadata" />
              <Route element={<VariantPage />} path="/variant" />
              <Route
                element={<AuthCallbackPage />}
                path="/auth/callback"
              />
              <Route
                element={<Navigate replace to="/use-cases/mepram/data" />}
                path="/use-cases/mepram"
              />
              <Route
                element={(
                  <RequireAuth>
                    <MepramDataPage />
                  </RequireAuth>
                )}
                path="/use-cases/mepram/data"
              />
              <Route
                element={(
                  <RequireAuth>
                    <MepramExplorerPage />
                  </RequireAuth>
                )}
                path="/use-cases/mepram/operational-isolate-explorer"
              />
              <Route
                element={(
                  <RequireAuth>
                    <MepramAlertsPage />
                  </RequireAuth>
                )}
                path="/use-cases/mepram/alerts-genomic-surveillance"
              />
              <Route element={<Navigate replace to="/" />} path="*" />
            </Routes>
          </motion.div>
        </main>
      </div>
    </div>
  );
}
