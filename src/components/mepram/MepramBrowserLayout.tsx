import Head from "next/head";
import Link from "next/link";
import { useMemo, useState } from "react";
import { useRouter } from "next/router";
import {
  mepramNavigation,
  platformNavigation,
  searchIndex,
} from "@/data/mepramDataBrowser";
import Image from "next/image";
import img from "../../../public/images/Logo Ciber+Mepram.png";

type Breadcrumb = { label: string; href?: string };

type Props = {
  title: string;
  eyebrow?: string;
  description?: string;
  breadcrumbs?: Breadcrumb[];
  children: React.ReactNode;
  aside?: React.ReactNode;
  hidePageHeader?: boolean;
};

const isActive = (pathname: string, href: string) => {
  if (href === "/") return pathname === "/";
  return pathname.startsWith(href);
};

const isGroupActive = (
  pathname: string,
  item: { href?: string; children?: { href: string }[] }
) => {
  if (item.href && !item.children) {
    return isActive(pathname, item.href);
  }

  return (
    item.children?.some((child) => isActive(pathname, child.href)) ?? false
  );
};

export function MepramBrowserLayout({
  title,
  eyebrow = "MePRAM Data Browser",
  description,
  breadcrumbs = [],
  children,
  aside,
  hidePageHeader = false,
}: Props) {
  const router = useRouter();
  const [query, setQuery] = useState("");

  const results = useMemo(() => {
    const value = query.trim().toLowerCase();
    if (!value) return [];
    return searchIndex.filter((entry) =>
      `${entry.label} ${entry.type} ${entry.meta}`.toLowerCase().includes(value)
    );
  }, [query]);

  return (
    <>
      <Head>
        <title>{title} | MePRAM Data Browser</title>
        <meta
          name="description"
          content={
            description ??
            "Aggregate cohort exploration for the MePRAM research platform."
          }
        />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>

      <div className="min-h-screen bg-white text-slate-900">
        <header className="sticky top-0 z-40 border-b border-slate-200/70 bg-white/78 backdrop-blur-xl">
          <div className="mx-auto flex max-w-[1440px] items-center gap-6 px-4 py-4 sm:px-6 lg:px-8">
            <Link href="/" className="min-w-0">
              <div className="min-w-0">
                <Image
                  src={img}
                  alt="Logo Ciber Mepram"
                  className="h-12 w-auto object-contain" 
                />
              </div>
            </Link>
            <nav className="hidden items-center gap-2 xl:flex">
              {platformNavigation.map((item) => {
                const active = isGroupActive(router.pathname, item);

                if (item.children) {
                  return (
                    <div key={item.label} className="group relative">
                      <Link
                        href={item.href ?? item.children[0].href}
                        className={`rounded-full px-4 py-2 text-sm transition ${
                          active
                            ? "bg-slate-100 text-slate-950"
                            : "text-slate-600 hover:bg-slate-100"
                        }`}
                      >
                        {item.label}
                      </Link>
                      <div className="pointer-events-none absolute left-0 top-[calc(100%+5px)] z-20 min-w-[220px] rounded-3xl border border-slate-200 bg-white p-2 opacity-0 shadow-[0_24px_64px_rgba(15,23,42,0.14)] transition group-hover:pointer-events-auto group-hover:opacity-100">
                        {item.children.map((child) => (
                          <Link
                            key={child.href}
                            href={child.href}
                            className={`block rounded-2xl px-4 py-3 text-sm ${
                              isActive(router.pathname, child.href)
                                ? "bg-slate-950 !text-white visited:!text-white hover:!text-white"
                                : "text-slate-700 hover:bg-slate-50"
                            }`}
                          >
                            {child.label}
                          </Link>
                        ))}
                      </div>
                    </div>
                  );
                }

                if (item.external && item.href) {
                  return (
                    <a
                      key={item.label}
                      href={item.href}
                      target="_blank"
                      rel="noreferrer"
                      className="rounded-full px-4 py-2 text-sm text-slate-600 transition hover:bg-slate-100"
                    >
                      {item.label}
                    </a>
                  );
                }

                if (item.href) {
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={`rounded-full px-4 py-2 text-sm transition ${
                        active
                          ? "bg-slate-100 text-slate-950"
                          : "text-slate-600 hover:bg-slate-100"
                      }`}
                    >
                      {item.label}
                    </Link>
                  );
                }

                return null;
              })}
            </nav>

            <div className="ml-auto">
              <button className="rounded-full px-4 py-2 text-sm text-slate-600 transition hover:bg-slate-100">
                Log in Intranet
              </button>
            </div>
          </div>

          {(router.pathname.startsWith("/data-tools") ||
            router.pathname.startsWith("/catalog") ||
            router.pathname.startsWith("/concepts") ||
            router.pathname.startsWith("/metadata") ||
            router.pathname.startsWith("/domains") ||
            router.pathname.startsWith("/genomic-data")) && (
            <div className="mx-auto flex max-w-[1440px] gap-2 overflow-x-auto px-4 pb-4 sm:px-6 lg:px-8">
              {mepramNavigation.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`whitespace-nowrap rounded-full border px-4 py-2 text-sm transition ${
                    isActive(router.pathname, item.href)
                      ? "border-[#4f46e5] bg-[#4f46e5] !text-white visited:!text-white hover:!text-white"
                      : "border-slate-200 bg-white text-slate-600 hover:border-slate-300"
                  }`}
                >
                  {item.label}
                </Link>
              ))}
            </div>
          )}
        </header>

        <main
          className={`mx-auto max-w-[1440px] bg-white gap-6 px-4 py-6 sm:px-6 lg:px-8 ${
            aside ? "grid lg:grid-cols-[minmax(0,1fr)_320px]" : "block"
          }`}
        >
          <div className="min-w-0">
            {!hidePageHeader && (
              <div className="mb-6 overflow-hidden rounded-[36px] border border-slate-200 bg-white shadow-[0_18px_48px_rgba(15,23,42,0.06)]">
                <div className="px-6 py-5 sm:px-8 sm:py-6">
                  {breadcrumbs.length > 0 && (
                    <div className="mb-5 flex flex-wrap items-center gap-2 text-sm text-slate-500">
                      {breadcrumbs.map((crumb, index) => (
                        <div
                          key={`${crumb.label}-${index}`}
                          className="flex items-center gap-2"
                        >
                          {crumb.href ? (
                            <Link
                              href={crumb.href}
                              className="hover:text-slate-900"
                            >
                              {crumb.label}
                            </Link>
                          ) : (
                            <span className="text-slate-900">
                              {crumb.label}
                            </span>
                          )}
                          {index < breadcrumbs.length - 1 && <span>/</span>}
                        </div>
                      ))}
                    </div>
                  )}

                  <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#2d2a7d]">
                    {eyebrow}
                  </p>
                  <div className="mt-3 max-w-4xl">
                    <h1 className="font-serif text-4xl leading-tight text-slate-950 sm:text-[3.25rem]">
                      {title}
                    </h1>
                    {description && (
                      <p className="mt-4 max-w-3xl text-base leading-7 text-slate-600 sm:text-lg">
                        {description}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            )}

            {children}
          </div>

          {aside ? <aside className="space-y-6">{aside}</aside> : null}
        </main>
      </div>
    </>
  );
}
