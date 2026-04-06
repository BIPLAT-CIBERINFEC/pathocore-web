import { BrowserRouter } from "react-router-dom";
import { DatabrowserProvider } from "@/app/providers/databrowser-provider";
import { AppShell } from "@/components/layout/app-shell";

export function App() {
  return (
    <BrowserRouter>
      <DatabrowserProvider>
        <AppShell />
      </DatabrowserProvider>
    </BrowserRouter>
  );
}
