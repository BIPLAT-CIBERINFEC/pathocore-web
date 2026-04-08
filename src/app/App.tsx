import { BrowserRouter } from "react-router-dom";
import { DatabrowserProvider } from "@/app/providers/databrowser-provider";
import { AppShell } from "@/components/layout/app-shell";
import { RouteChangeScroll } from "@/components/layout/route-change-scroll";

export function App() {
  return (
    <BrowserRouter>
      <RouteChangeScroll />
      <DatabrowserProvider>
        <AppShell />
      </DatabrowserProvider>
    </BrowserRouter>
  );
}
