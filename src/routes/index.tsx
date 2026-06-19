import { createFileRoute, Link } from "@tanstack/react-router";
import { getDashboardData } from "../lib/api/dashboard";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "OMVITAL - Dashboard" },
      { name: "description", content: "Vista general financiera" },
    ],
  }),
  loader: async () => {
    return await getDashboardData();
  },
  component: DashboardPage,
});

function formatMoney(amount: number) {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);
}

function getInitials(name: string) {
  const parts = name.replace(/(Dr\.|Lic\.)/g, '').trim().split(' ');
  if (parts.length >= 2) return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
  return name.substring(0, 2).toUpperCase();
}

function getCategoryColor(cat: string) {
  if (!cat) return "bg-outline-variant/20 text-on-surface";
  const catUpper = cat.toUpperCase();
  if (catUpper.includes("REHABILITACIÓN")) return "bg-primary-container/10 text-primary";
  if (catUpper.includes("GASTO") || catUpper.includes("COMPRA")) return "bg-error-container/20 text-error";
  if (catUpper.includes("PAQUETE")) return "bg-primary-container/10 text-primary";
  if (catUpper.includes("NÓMINA") || catUpper.includes("COMISIÓN")) return "bg-tertiary-fixed/40 text-tertiary";
  return "bg-secondary-container/20 text-secondary";
}

function DashboardPage() {
  const { stats, movements, debts, commissions } = Route.useLoaderData();

  return (
    <main className="pt-[64px] pl-[260px] h-screen overflow-y-auto relative">
      <div className="p-container_padding space-y-stack_lg pb-24">
        {/* Welcome Header */}
        <div className="flex items-end justify-between">
          <div>
            <h2 className="font-headline-md text-headline-md text-primary">Vista General</h2>
            <p className="font-body-md text-body-md text-on-surface-variant">
              Resumen financiero y estado de operaciones del día.
            </p>
          </div>
          <div className="flex items-center gap-2 bg-secondary-container/30 px-4 py-2 rounded-lg border border-secondary-container">
            <span className={`w-2.5 h-2.5 rounded-full ${stats.isCajaOpen ? "bg-secondary animate-pulse" : "bg-error"}`}></span>
            <span className={`font-label-md text-label-md font-bold ${stats.isCajaOpen ? "text-secondary" : "text-error"}`}>
              Estado de Caja: {stats.isCajaOpen ? "ABIERTO" : "CERRADO"}
            </span>
          </div>
        </div>

        {/* Summary Bento Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-gutter">
          {/* Ingresos */}
          <div className="bg-surface-container-lowest border border-outline-variant p-stack_lg rounded-xl flex flex-col justify-between group hover:border-primary transition-all duration-300">
            <div className="flex justify-between items-start">
              <div className="p-2 bg-primary-container/10 rounded-lg text-primary">
                <span className="material-symbols-outlined">trending_up</span>
              </div>
            </div>
            <div className="mt-4">
              <p className="font-label-md text-label-md text-on-surface-variant uppercase tracking-wider">
                Ingresos del día
              </p>
              <h3 className="font-display-lg text-display-lg text-on-surface">{formatMoney(stats.ingresos)}</h3>
            </div>
          </div>

          {/* Egresos */}
          <div className="bg-surface-container-lowest border border-outline-variant p-stack_lg rounded-xl flex flex-col justify-between hover:border-error transition-all duration-300">
            <div className="flex justify-between items-start">
              <div className="p-2 bg-error-container/20 rounded-lg text-error">
                <span className="material-symbols-outlined">trending_down</span>
              </div>
            </div>
            <div className="mt-4">
              <p className="font-label-md text-label-md text-on-surface-variant uppercase tracking-wider">
                Egresos del día
              </p>
              <h3 className="font-display-lg text-display-lg text-on-surface">{formatMoney(stats.egresos)}</h3>
            </div>
          </div>

          {/* Saldo Actual */}
          <div className="bg-surface-container-lowest border border-outline-variant p-stack_lg rounded-xl flex flex-col justify-between hover:border-primary transition-all duration-300">
            <div className="flex justify-between items-start">
              <div className="p-2 bg-secondary-container/20 rounded-lg text-secondary">
                <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>
                  account_balance
                </span>
              </div>
            </div>
            <div className="mt-4">
              <p className="font-label-md text-label-md text-on-surface-variant uppercase tracking-wider">
                Saldo en Caja
              </p>
              <h3 className="font-display-lg text-display-lg text-on-surface">{formatMoney(stats.saldo)}</h3>
            </div>
          </div>

          {/* Alertas Rápidas */}
          <div className="bg-primary border border-primary p-stack_lg rounded-xl flex flex-col justify-center relative overflow-hidden">
            <div className="relative z-10 text-white">
              <p className="font-label-md text-label-md opacity-80 mb-1">Paquetes Pendientes</p>
              <div className="flex items-center gap-2">
                <span className="font-display-lg text-display-lg font-bold">{stats.pendingCount}</span>
                {stats.pendingCount > 0 && <span className="material-symbols-outlined text-tertiary-fixed">warning</span>}
              </div>
              <Link to="/paquetes" className="font-caption text-caption mt-2 text-primary-fixed underline cursor-pointer hover:text-white transition-colors block">
                Ver detalles de deuda
              </Link>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-gutter">
          {/* Transactions Table */}
          <div className="lg:col-span-2 bg-surface-container-lowest border border-outline-variant rounded-xl overflow-hidden flex flex-col">
            <div className="p-stack_lg border-b border-outline-variant flex items-center justify-between">
              <h3 className="font-title-lg text-title-lg text-on-surface">Últimos movimientos</h3>
              <Link to="/movimientos" className="text-primary font-label-md text-label-md hover:underline">Ver todos</Link>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead className="bg-[#F8FAFB]">
                  <tr>
                    <th className="px-6 py-4 font-label-md text-label-md text-on-surface-variant border-b border-outline-variant">Fecha</th>
                    <th className="px-6 py-4 font-label-md text-label-md text-on-surface-variant border-b border-outline-variant">Descripción</th>
                    <th className="px-6 py-4 font-label-md text-label-md text-on-surface-variant border-b border-outline-variant">Categoría</th>
                    <th className="px-6 py-4 font-label-md text-label-md text-on-surface-variant border-b border-outline-variant">Monto</th>
                    <th className="px-6 py-4 font-label-md text-label-md text-on-surface-variant border-b border-outline-variant">Estado</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-outline-variant">
                  {movements.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="px-6 py-8 text-center text-on-surface-variant">No hay movimientos recientes.</td>
                    </tr>
                  ) : (
                    movements.map((mov: any) => (
                      <tr key={mov.id} className="hover:bg-[#F4F6F8] transition-colors">
                        <td className="px-6 py-4 font-body-md text-body-md">
                          {new Date(mov.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </td>
                        <td className="px-6 py-4 font-body-md text-body-md truncate max-w-[200px]" title={mov.concepto}>
                          {mov.concepto}
                        </td>
                        <td className="px-6 py-4">
                          <span className={`px-2 py-1 text-[11px] font-bold rounded uppercase ${getCategoryColor(mov.categoria)}`}>
                            {mov.categoria || mov.tipo}
                          </span>
                        </td>
                        <td className={`px-6 py-4 font-body-md text-body-md font-bold ${mov.tipo === 'Egreso' ? 'text-error' : 'text-secondary'}`}>
                          {mov.tipo === 'Egreso' ? '-' : '+'}{formatMoney(mov.monto)}
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <span className={`w-2 h-2 rounded-full ${mov.estado === 'Completado' ? 'bg-secondary' : 'bg-tertiary-fixed'}`}></span>
                            <span className="text-caption">{mov.estado}</span>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Lateral Stats: Paquetes & Comisiones */}
          <div className="space-y-gutter">
            {/* Paquetes con Deuda */}
            <div className="bg-surface-container-lowest border border-outline-variant rounded-xl overflow-hidden shadow-sm">
              <div className="p-4 bg-[#F8FAFB] border-b border-outline-variant flex items-center gap-2">
                <span className="material-symbols-outlined text-error text-[20px]">warning</span>
                <h3 className="font-label-md text-label-md font-bold text-on-surface">Paquetes con deuda</h3>
              </div>
              <div className="p-4 space-y-4">
                {debts.length === 0 ? (
                  <p className="text-center text-sm text-on-surface-variant">No hay deudas pendientes.</p>
                ) : (
                  debts.map((deuda: any) => {
                    const sesionesPendientes = deuda.paquete?.cantidad_sesiones - deuda.sesiones_realizadas;
                    return (
                      <div key={deuda.id} className="flex justify-between items-center group">
                        <div>
                          <p className="font-body-md text-body-md font-medium truncate max-w-[150px]">{deuda.paciente?.nombre || 'Desconocido'}</p>
                          <p className="font-caption text-caption text-on-surface-variant truncate max-w-[150px]">
                            {deuda.paquete?.nombre} - {sesionesPendientes} pend.
                          </p>
                        </div>
                        <span className="font-label-md text-label-md text-error font-bold">{formatMoney(deuda.deuda)}</span>
                      </div>
                    );
                  })
                )}
                <Link to="/paquetes" className="w-full block text-center py-2 mt-2 bg-surface-container-high text-on-surface-variant font-label-md text-label-md rounded-lg hover:bg-outline-variant transition-all">
                  Ver todos los deudores
                </Link>
              </div>
            </div>

            {/* Comisiones Pendientes */}
            <div className="bg-surface-container-lowest border border-outline-variant rounded-xl overflow-hidden shadow-sm">
              <div className="p-4 bg-[#F8FAFB] border-b border-outline-variant flex items-center gap-2">
                <span className="material-symbols-outlined text-primary text-[20px]">payments</span>
                <h3 className="font-label-md text-label-md font-bold text-on-surface">Comisiones pendientes</h3>
              </div>
              <div className="p-4 space-y-4">
                {commissions.length === 0 ? (
                  <p className="text-center text-sm text-on-surface-variant">No hay comisiones pendientes.</p>
                ) : (
                  commissions.map((comision: any) => {
                    const nombre = comision.trabajador?.nombre || 'Desconocido';
                    // Fake progress bar logic just to show visual feedback (using random or fixed % wouldn't be accurate, let's just make it 50% or remove it)
                    // For now, let's keep it to 100% since it's a pending amount
                    return (
                      <div key={comision.id} className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-primary-container/20 flex items-center justify-center text-primary font-bold text-[10px] shrink-0">
                          {getInitials(nombre)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex justify-between">
                            <p className="font-body-md text-body-md font-medium truncate">{nombre}</p>
                            <p className="font-label-md text-label-md font-bold text-on-surface ml-2">{formatMoney(comision.monto)}</p>
                          </div>
                          <div className="w-full bg-surface-container-high h-1.5 rounded-full mt-1">
                            <div className="bg-primary h-full rounded-full" style={{ width: "100%" }}></div>
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
                <Link to="/comisiones" className="w-full block text-center py-2 mt-2 border border-primary text-primary font-label-md text-label-md rounded-lg hover:bg-primary/5 transition-all">
                  Generar Pagos
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Floating Action Button (FAB) */}
      <Link to="/movimientos" className="fixed bottom-8 right-8 w-14 h-14 bg-[#004286] text-white rounded-xl shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex items-center justify-center active:scale-95 z-50">
        <span className="material-symbols-outlined text-[32px]">add</span>
      </Link>
    </main>
  );
}
