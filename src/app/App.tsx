import { BrowserRouter } from "react-router-dom";
import { AuthProvider } from "@/app/providers/auth-provider";
import { DatabrowserProvider } from "@/app/providers/databrowser-provider";
import { AppShell } from "@/components/layout/app-shell";
import { RouteChangeScroll } from "@/components/layout/route-change-scroll";

export function App() {
  return (
    <BrowserRouter>
      <RouteChangeScroll />
      <AuthProvider>
        <DatabrowserProvider>
          <AppShell />
        </DatabrowserProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}
