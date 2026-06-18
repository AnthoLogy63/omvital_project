import { createFileRoute } from "@tanstack/react-router";
import { useActiveSession } from "../hooks/useCaja";
import { AbrirCaja } from "../components/caja/AbrirCaja";
import { CajaDashboard } from "../components/caja/CajaDashboard";

export const Route = createFileRoute("/caja")({
  head: () => ({
    meta: [
      { title: "OMVITAL - Caja" },
      { name: "description", content: "Control de caja" },
    ],
  }),
  component: CajaView,
});

function CajaView() {
  const { data: session, isLoading, error } = useActiveSession();

  if (isLoading) {
    return (
      <main className="ml-[260px] pt-[64px] min-h-screen bg-background p-container_padding flex items-center justify-center">
        <p className="text-outline">Cargando estado de caja...</p>
      </main>
    );
  }

  if (error) {
    return (
      <main className="ml-[260px] pt-[64px] min-h-screen bg-background p-container_padding flex items-center justify-center">
        <p className="text-error font-bold">Error al cargar la sesión de caja. Verifica tu conexión.</p>
      </main>
    );
  }

  return (
    <main className="ml-[260px] pt-[64px] min-h-screen bg-background">
      <div className="p-container_padding">
        {!session ? (
          <AbrirCaja />
        ) : (
          <CajaDashboard session={session} />
        )}
      </div>
    </main>
  );
}
