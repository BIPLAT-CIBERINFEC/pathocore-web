import type { AppProps } from "next/app";
import Image from "next/image";
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

          <footer className="w-full bg-white border-t border-slate-200 px-6 py-6 text-sm text-slate-500 relative z-30">
            <div className="mx-auto flex max-w-7xl flex-col gap-5">
              <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
                <div className="inline-flex w-fit flex-wrap items-center gap-5 rounded border border-slate-200 px-5 py-4">
                  <Link
                    href="https://github.com/BIPLAT-CIBERINFEC/"
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label="BIPLAT-CIBERINFEC GitHub"
                    className="inline-flex items-center transition-opacity hover:opacity-75"
                  >
                    <Image
                      src="/images/biplat_logo_vert.png"
                      alt="BIPLAT-CIBERINFEC"
                      width={1567}
                      height={1004}
                      className="h-20 w-auto object-contain"
                    />
                  </Link>
                  <Link
                    href="https://github.com/BU-ISCIII"
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label="BU-ISCIII GitHub"
                    className="inline-flex items-center transition-opacity hover:opacity-75"
                  >
                    <Image
                      src="/images/buisciii_logo.png"
                      alt="BU-ISCIII"
                      width={240}
                      height={210}
                      className="h-14 w-auto object-contain"
                    />
                  </Link>
                </div>

                <div className="flex flex-wrap items-center gap-6 lg:justify-end">
                  <Image
                    src="/images/ES_Financiado_por_la_Unión_Europea_RGB_POS.png"
                    alt="Financiado por la Unión Europea"
                    width={3522}
                    height={921}
                    className="h-12 w-auto object-contain"
                  />
                  <Image
                    src="/images/logo-prtr-dos-lineas-color.png"
                    alt="Plan de Recuperación, Transformación y Resiliencia"
                    width={1920}
                    height={1080}
                    className="h-24 w-auto object-contain"
                  />
                  <Image
                    src="/images/image006.png"
                    alt="Logo Institucional"
                    width={604}
                    height={195}
                    className="h-24 w-auto object-contain"
                  />
                </div>
              </div>

              <p>
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
          </footer>
        </div>
      </AuthProvider>
    </Provider>
  );
}
