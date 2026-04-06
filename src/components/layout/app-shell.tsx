import {
  ChartBar,
  Database,
  Dna,
  FileCode2,
  Layers3,
  Microscope,
} from "lucide-react";
import { motion } from "framer-motion";
import { NavLink, Navigate, Route, Routes } from "react-router-dom";
import { ConnectionPanel } from "@/components/layout/connection-panel";
import { cn } from "@/lib/utils";
import { DatabrowserHomePage } from "@/pages/home-page";
import { MetadataPage } from "@/pages/metadata-page";
import { OverviewPage } from "@/pages/overview-page";
import { SchemaPage } from "@/pages/schema-page";
import { VariantPage } from "@/pages/variant-page";

const navigationItems = [
  { icon: Microscope, label: "Home", to: "/" },
  { icon: ChartBar, label: "Overview", to: "/overview" },
  { icon: FileCode2, label: "Schema", to: "/schema" },
  { icon: Layers3, label: "Metadata", to: "/metadata" },
  { icon: Dna, label: "Variant", to: "/variant" },
];

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
                    Generic Genomic Databrowser
                  </h1>
                </div>
              </div>
              <p className="mt-5 max-w-3xl text-sm leading-7 text-slate-600">
                Frontend React para la exploracion agregada de muestras genomicas,
                schemas y metadata cientifica usando la API real de PathoCore.
              </p>
            </div>
            <ConnectionPanel />
          </div>
          <nav className="mt-6 flex flex-wrap gap-2">
            {navigationItems.map((item) => (
              <NavLink
                key={item.to}
                className={({ isActive }) =>
                  cn(
                    "inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium transition-all",
                    isActive
                      ? "bg-slate-900 text-white shadow-glow"
                      : "bg-slate-100 text-slate-600 hover:bg-slate-200",
                  )
                }
                to={item.to}
              >
                <item.icon className="h-4 w-4" />
                {item.label}
              </NavLink>
            ))}
          </nav>
        </header>
        <main className="flex-1">
          <motion.div
            animate={{ opacity: 1, y: 0 }}
            initial={{ opacity: 0, y: 12 }}
            transition={{ duration: 0.28 }}
          >
            <Routes>
              <Route element={<DatabrowserHomePage />} path="/" />
              <Route element={<OverviewPage />} path="/overview" />
              <Route element={<SchemaPage />} path="/schema" />
              <Route element={<MetadataPage />} path="/metadata" />
              <Route element={<VariantPage />} path="/variant" />
              <Route element={<Navigate replace to="/" />} path="*" />
            </Routes>
          </motion.div>
        </main>
      </div>
    </div>
  );
}
