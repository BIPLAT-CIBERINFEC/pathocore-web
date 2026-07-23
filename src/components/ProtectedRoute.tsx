import { useAuth } from "hooks/use-auth";
import { ReactNode, useEffect } from "react";


interface ProtectedRouteProps {
  children: ReactNode;
}

export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { status, login } = useAuth();

  useEffect(() => {
    if (status === "anonymous") {
      void login(window.location.pathname);
    }
  }, [status, login]);

  if (status === "loading") {
    return (
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "100vh",
        }}
      >
        <p style={{ fontFamily: "sans-serif", color: "#666" }}>
          Cargando verificación de seguridad...
        </p>
      </div>
    );
  }

  if (status === "authenticated") {
    return <>{children}</>;
  }

  return null;
}
