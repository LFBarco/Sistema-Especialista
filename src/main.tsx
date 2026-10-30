
  import { lazy, Suspense } from "react";
  import { createRoot } from "react-dom/client";
  import "./styles/index.css";

  const App = lazy(() => import("./app/App.tsx"));
  const SolicitarEspecialistaPublico = lazy(() =>
    import("./app/components/integracion/SolicitarEspecialistaPublico.tsx").then((m) => ({
      default: m.SolicitarEspecialistaPublico,
    })),
  );

  const esPaginaIntegracion = window.location.pathname.startsWith("/integracion/solicitar");

  createRoot(document.getElementById("root")!).render(
    <Suspense fallback={null}>
      {esPaginaIntegracion ? <SolicitarEspecialistaPublico /> : <App />}
    </Suspense>,
  );
  