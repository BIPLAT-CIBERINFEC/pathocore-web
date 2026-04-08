import { useEffect } from "react";
import { useLocation } from "react-router-dom";

export function RouteChangeScroll() {
  const { pathname } = useLocation();

  useEffect(() => {
    const scrollTo = (top: number) => {
      window.scrollTo({
        top,
        behavior: "smooth",
      });
    };

    if (pathname === "/") {
      scrollTo(0);
      return;
    }

    const frameId = window.requestAnimationFrame(() => {
      const anchor = document.querySelector<HTMLElement>(
        "[data-route-scroll-anchor='genomic']",
      );

      if (!anchor) {
        scrollTo(0);
        return;
      }

      const top = window.scrollY + anchor.getBoundingClientRect().top;
      scrollTo(Math.max(0, top - 8));
    });

    return () => {
      window.cancelAnimationFrame(frameId);
    };
  }, [pathname]);

  return null;
}
