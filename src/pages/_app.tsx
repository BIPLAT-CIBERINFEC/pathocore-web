import type { AppProps } from "next/app";
import Link from "next/link";
import { Provider } from "react-redux";
import { store } from "../lib/store";
import { AuthProvider } from "@/providers/auth-provider";
import "../styles/globals.css";

export default function MyApp({ Component, pageProps }: AppProps) {
  return (
    <Provider store={store}>
      <AuthProvider>
        <div className="flex flex-col min-h-screen">
          <main className="flex-grow">
            <Component {...pageProps} />
          </main>

          <footer className="w-full py-6 bg-white border-t border-slate-200 text-left pl-6 md:pl-30 text-sm text-slate-500 relative z-30">
            <div className="flex flex-wrap items-center gap-6 mb-6">
              <img
                src="/images/ES_Financiado_por_la_Unión_Europea_RGB_POS.png"
                alt="Financiado por la Unión Europea"
                className="h-12 w-auto object-contain"
              />
              <img
                src="/images/Logo PRTR dos líneas_COLOR.png"
                alt="Plan de Recuperación, Transformación y Resiliencia"
                className="h-26 w-auto object-contain"
              />
                <img
                  src="/images/image006.png"
                  alt="Logo Institucional"
                  className="h-26 w-auto object-contain"
                />
            </div>

          </footer>
            <p className="ml-14"> 
              Developed by{" "}
              <Link
                href="https://www.sombradoble.es"
                target="_blank"
                rel="noopener noreferrer"
                className="font-semibold text-slate-700 hover:text-indigo-600 transition-colors underline underline-offset-4"
              >
                Sombradoble
              </Link>
            </p>
        </div>
      </AuthProvider>
    </Provider>
  );
}
