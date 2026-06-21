import { createFileRoute, useRouter } from "@tanstack/react-router";
import { useState, useMemo, useEffect } from "react";
import {
  getPaquetesCliente,
  getPaquetes,
  insertPaqueteCliente,
  insertPagoPaqueteCliente,
  insertSesionPaciente,
  getSesionesPaciente,
  type DbPaqueteCliente as PaqueteCliente,
  type DbPaquete as Paquete,
  type DbSesionPaciente as SesionPaciente,
} from "../lib/api/paquetes";
import { getPacientes, type DbPaciente as Paciente } from "../lib/api/comisiones";
import { getTrabajadores, type DbTrabajador as Trabajador } from "../lib/api/workers";
import { toast } from "sonner";

export const Route = createFileRoute("/paquetes")({
  head: () => ({
    meta: [
      { title: "OMVITAL - Paquetes" },
      { name: "description", content: "Gestión de paquetes" },
    ],
  }),
  loader: async () => {
    try {
      const [sales, patients, packages, workers] = await Promise.all([
        getPaquetesCliente(),
        getPacientes(),
        getPaquetes(),
        getTrabajadores(),
      ]);
      return { sales, patients, packages, workers };
    } catch (error) {
      console.error("Error loading packages page data:", error);
      return { sales: [], patients: [], packages: [], workers: [] };
    }
  },
  component: Page,
});

function formatMoney(amount: number) {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(amount);
}

function getInitials(name: string) {
  const parts = name
    .replace(/(Dr\.|Lic\.)/g, "")
    .trim()
    .split(" ");
  if (parts.length >= 2) return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
  return name.substring(0, 2).toUpperCase();
}

function Page() {
  const router = useRouter();
  const { sales, patients, packages, workers } = Route.useLoaderData();

  // Filters State
  const [search, setSearch] = useState("");
  const [filterEstado, setFilterEstado] = useState<string>("Todos los estados");

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  // Modals States
  const [newSaleModalOpen, setNewSaleModalOpen] = useState(false);
  const [paymentModalSale, setPaymentModalSale] = useState<PaqueteCliente | null>(null);
  const [sessionModalSale, setSessionModalSale] = useState<PaqueteCliente | null>(null);

  // New Sale Form State
  const [newSalePacienteId, setNewSalePacienteId] = useState("");
  const [newSalePaqueteId, setNewSalePaqueteId] = useState("");
  const [newSalePrecioVenta, setNewSalePrecioVenta] = useState("");
  const [newSalePagado, setNewSalePagado] = useState("");
  const [newSaleMetodo, setNewSaleMetodo] = useState<
    "Efectivo" | "Yape" | "Plin" | "Transferencia" | "Tarjeta"
  >("Efectivo");
  const [isSubmittingSale, setIsSubmittingSale] = useState(false);

  // Register Payment Form State
  const [paymentAmount, setPaymentAmount] = useState("");
  const [paymentMetodo, setPaymentMetodo] = useState<
    "Efectivo" | "Yape" | "Plin" | "Transferencia" | "Tarjeta"
  >("Efectivo");
  const [isSubmittingPayment, setIsSubmittingPayment] = useState(false);

  // Register Session Form State
  const [sessionTerapeutaId, setSessionTerapeutaId] = useState("");
  const [sessionNotas, setSessionNotas] = useState("");
  const [sessionHistory, setSessionHistory] = useState<SesionPaciente[]>([]);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);
  const [isSubmittingSession, setIsSubmittingSession] = useState(false);
  const [sessionTab, setSessionTab] = useState<"registrar" | "historial">("registrar");

  // Load selected package price when package changes in New Sale
  useEffect(() => {
    if (newSalePaqueteId) {
      const selected = packages.find((p) => p.id === newSalePaqueteId);
      if (selected) {
        setNewSalePrecioVenta(String(selected.precio_total));
      }
    } else {
      setNewSalePrecioVenta("");
    }
  }, [newSalePaqueteId, packages]);

  // Load session history when sessionModalSale changes
  useEffect(() => {
    if (sessionModalSale) {
      setIsLoadingHistory(true);
      setSessionTab("registrar");
      setSessionTerapeutaId("");
      setSessionNotas("");
      getSesionesPaciente({ data: sessionModalSale.id })
        .then((data) => {
          setSessionHistory(data);
        })
        .catch((err) => {
          console.error("Error loading session history:", err);
          toast.error("Error al cargar el historial de sesiones.");
        })
        .finally(() => {
          setIsLoadingHistory(false);
        });
    }
  }, [sessionModalSale]);

  // Dynamic Bento Grid Calculations
  const bentoStats = useMemo(() => {
    const currentYear = new Date().getFullYear();
    const currentMonth = new Date().getMonth();

    const recaudacionTotal = sales
      .filter((s) => {
        const date = new Date(s.created_at);
        return date.getFullYear() === currentYear && date.getMonth() === currentMonth;
      })
      .reduce((acc, curr) => acc + Number(curr.pagado), 0);

    const deudaPendienteTotal = sales.reduce((acc, curr) => acc + Number(curr.deuda), 0);
    const countDeudores = sales.filter((s) => Number(s.deuda) > 0).length;

    const paquetesEnCurso = sales.filter((s) => {
      const total = s.paquetes?.cantidad_sesiones || 0;
      return s.sesiones_realizadas < total;
    }).length;

    const totalFinalizados = sales.filter((s) => {
      const total = s.paquetes?.cantidad_sesiones || 0;
      return total > 0 && s.sesiones_realizadas >= total;
    }).length;

    return {
      recaudacionTotal,
      deudaPendienteTotal,
      countDeudores,
      paquetesEnCurso,
      totalFinalizados,
    };
  }, [sales]);

  // Filter Sales list based on search and status select
  const filteredSales = useMemo(() => {
    return sales.filter((sale) => {
      const matchesSearch =
        !search ||
        (sale.pacientes?.nombre || "").toLowerCase().includes(search.toLowerCase()) ||
        (sale.pacientes?.codigo || "").toLowerCase().includes(search.toLowerCase());

      const matchesStatus =
        filterEstado === "Todos los estados" ||
        sale.estado.toLowerCase() === filterEstado.toLowerCase();

      return matchesSearch && matchesStatus;
    });
  }, [sales, search, filterEstado]);

  // Paginated Sales list
  const paginatedSales = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredSales.slice(start, start + itemsPerPage);
  }, [filteredSales, currentPage]);

  const totalPages = Math.ceil(filteredSales.length / itemsPerPage) || 1;

  // Reset page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [search, filterEstado]);

  // Filter workers to show active "Interno" (Therapists)
  const activeTherapists = useMemo(() => {
    return workers.filter((w) => w.estado === "Activo" && w.rol === "Interno");
  }, [workers]);

  // Handle New Sale Submit
  const handleCreateSale = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSalePacienteId) {
      toast.error("Debe seleccionar un paciente.");
      return;
    }
    if (!newSalePaqueteId) {
      toast.error("Debe seleccionar un paquete.");
      return;
    }
    const precio = parseFloat(newSalePrecioVenta);
    if (isNaN(precio) || precio <= 0) {
      toast.error("El precio de venta debe ser un número positivo.");
      return;
    }
    const pagado = newSalePagado ? parseFloat(newSalePagado) : 0;
    if (isNaN(pagado) || pagado < 0) {
      toast.error("El pago inicial no puede ser un número negativo.");
      return;
    }
    if (pagado > precio) {
      toast.error("El pago inicial no puede exceder el precio de venta.");
      return;
    }

    try {
      setIsSubmittingSale(true);
      await insertPaqueteCliente({
        data: {
          paciente_id: newSalePacienteId,
          paquete_id: newSalePaqueteId,
          precio_venta: precio,
          pagado: pagado,
          metodo: pagado > 0 ? newSaleMetodo : undefined,
        },
      });

      toast.success("Venta de paquete registrada correctamente.");
      setNewSalePacienteId("");
      setNewSalePaqueteId("");
      setNewSalePrecioVenta("");
      setNewSalePagado("");
      setNewSaleModalOpen(false);
      router.invalidate();
    } catch (err: unknown) {
      console.error(err);
      const errMsg = err instanceof Error ? err.message : "Ocurrió un error al registrar la venta.";
      toast.error(errMsg);
    } finally {
      setIsSubmittingSale(false);
    }
  };

  // Handle Register Payment Submit
  const handleRegisterPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!paymentModalSale) return;

    const amount = parseFloat(paymentAmount);
    if (isNaN(amount) || amount <= 0) {
      toast.error("El monto de abono debe ser mayor a cero.");
      return;
    }
    if (amount > paymentModalSale.deuda) {
      toast.error(
        `El monto de abono no puede exceder la deuda de ${formatMoney(paymentModalSale.deuda)}.`,
      );
      return;
    }

    try {
      setIsSubmittingPayment(true);
      await insertPagoPaqueteCliente({
        data: {
          paquete_cliente_id: paymentModalSale.id,
          monto: amount,
          metodo: paymentMetodo,
        },
      });

      toast.success("Abono registrado con éxito.");
      setPaymentAmount("");
      setPaymentModalSale(null);
      router.invalidate();
    } catch (err: unknown) {
      console.error(err);
      const errMsg = err instanceof Error ? err.message : "Error al registrar el pago.";
      toast.error(errMsg);
    } finally {
      setIsSubmittingPayment(false);
    }
  };

  // Handle Register Session Attendance Submit
  const handleRegisterSession = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!sessionModalSale) return;
    if (!sessionTerapeutaId) {
      toast.error("Debe seleccionar un terapeuta.");
      return;
    }

    try {
      setIsSubmittingSession(true);
      await insertSesionPaciente({
        data: {
          paquete_cliente_id: sessionModalSale.id,
          terapeuta_id: sessionTerapeutaId,
          notas: sessionNotas,
        },
      });

      toast.success("Asistencia registrada.");
      setSessionNotas("");
      setSessionTerapeutaId("");

      // Reload history and router data
      const updatedHistory = await getSesionesPaciente({ data: sessionModalSale.id });
      setSessionHistory(updatedHistory);
      router.invalidate();

      // Update local modal data (increase sessions completed visually)
      setSessionModalSale((prev) => {
        if (!prev) return null;
        return {
          ...prev,
          sesiones_realizadas: prev.sesiones_realizadas + 1,
        };
      });
      setSessionTab("historial");
    } catch (err: unknown) {
      console.error(err);
      const errMsg = err instanceof Error ? err.message : "Error al registrar la asistencia.";
      toast.error(errMsg);
    } finally {
      setIsSubmittingSession(false);
    }
  };

  return (
    <main className="pt-[64px] pl-[260px] h-screen overflow-y-auto relative bg-background">
      <div className="p-container_padding space-y-stack_lg pb-24 max-w-[1400px] mx-auto">
        {/* Header Title */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="font-headline-md text-headline-md text-primary">Gestión de Paquetes</h2>
            <p className="font-body-md text-body-md text-on-surface-variant">
              Administración de ventas, pagos y saldos de pacientes.
            </p>
          </div>
          <button
            className="bg-primary text-white px-6 py-2.5 rounded flex items-center gap-2 font-label-md text-label-md shadow-sm hover:opacity-90 transition-all active:scale-95 cursor-pointer"
            onClick={() => setNewSaleModalOpen(true)}
          >
            <span className="material-symbols-outlined text-[18px]">add</span>
            NUEVA VENTA
          </button>
        </div>

        {/* Bento Stats Summary */}
        <div className="grid grid-cols-12 gap-gutter">
          <div className="col-span-12 md:col-span-4 border border-outline-variant bg-white p-stack_lg rounded-lg flex flex-col justify-between shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <span className="p-2 bg-primary-fixed text-primary rounded-lg material-symbols-outlined">
                payments
              </span>
              <span className="text-caption font-bold text-outline uppercase">ESTE MES</span>
            </div>
            <div>
              <p className="text-caption text-outline mb-1 uppercase tracking-tighter">
                Recaudación Total
              </p>
              <h3 className="font-headline-md text-headline-md text-on-surface">
                {formatMoney(bentoStats.recaudacionTotal)}
              </h3>
            </div>
            <div className="mt-4 flex items-center text-xs text-secondary font-bold">
              <span className="material-symbols-outlined text-sm mr-1">trending_up</span>
              <span>12% más que el mes pasado</span>
            </div>
          </div>

          <div className="col-span-12 md:col-span-4 border border-outline-variant bg-white p-stack_lg rounded-lg flex flex-col justify-between shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <span className="p-2 bg-tertiary-fixed text-tertiary rounded-lg material-symbols-outlined">
                pending_actions
              </span>
              <span className="text-caption font-bold text-outline uppercase">CRÍTICO</span>
            </div>
            <div>
              <p className="text-caption text-outline mb-1 uppercase tracking-tighter">
                Deuda Pendiente Total
              </p>
              <h3 className="font-headline-md text-headline-md text-error">
                {formatMoney(bentoStats.deudaPendienteTotal)}
              </h3>
            </div>
            <div className="mt-4 flex items-center text-xs text-outline font-bold">
              <span className="material-symbols-outlined text-sm mr-1">group</span>
              <span>{bentoStats.countDeudores} pacientes con saldo</span>
            </div>
          </div>

          <div className="col-span-12 md:col-span-4 border border-outline-variant bg-white p-stack_lg rounded-lg flex flex-col justify-between shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <span className="p-2 bg-secondary-container text-secondary rounded-lg material-symbols-outlined">
                check_circle
              </span>
              <span className="text-caption font-bold text-outline uppercase">ACTIVOS</span>
            </div>
            <div>
              <p className="text-caption text-outline mb-1 uppercase tracking-tighter">
                Paquetes en Curso
              </p>
              <h3 className="font-headline-md text-headline-md text-on-surface">
                {bentoStats.paquetesEnCurso}
              </h3>
            </div>
            <div className="mt-4 flex items-center text-xs text-on-surface-variant">
              <span className="material-symbols-outlined text-sm mr-1">history</span>
              <span>{bentoStats.totalFinalizados} paquetes completados</span>
            </div>
          </div>

          {/* Client List Table */}
          <div className="col-span-12 border border-outline-variant bg-white rounded-lg overflow-hidden shadow-sm">
            <div className="px-6 py-4 border-b border-outline-variant bg-surface-container-low flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <h4 className="font-label-md text-label-md font-bold text-primary uppercase tracking-widest">
                Listado de Ventas y Seguimiento
              </h4>
              <div className="flex flex-wrap gap-2">
                <input
                  type="text"
                  placeholder="Buscar paciente..."
                  className="text-xs border border-outline-variant rounded bg-white px-3 py-1.5 focus:ring-1 focus:ring-primary focus:border-primary outline-none"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
                <select
                  className="text-xs border border-outline-variant rounded bg-white py-1 focus:ring-primary outline-none px-2"
                  value={filterEstado}
                  onChange={(e) => setFilterEstado(e.target.value)}
                >
                  <option value="Todos los estados">Todos los estados</option>
                  <option value="Al día">Al día</option>
                  <option value="Deuda">Deuda</option>
                  <option value="Parcial">Parcial</option>
                </select>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead className="bg-[#F8FAFB] border-b border-outline-variant">
                  <tr>
                    <th className="px-6 py-3 font-label-md text-label-md text-outline uppercase">
                      Paciente
                    </th>
                    <th className="px-6 py-3 font-label-md text-label-md text-outline uppercase">
                      Paquete
                    </th>
                    <th className="px-6 py-3 font-label-md text-label-md text-outline uppercase text-right">
                      Total
                    </th>
                    <th className="px-6 py-3 font-label-md text-label-md text-outline uppercase text-right">
                      Pagado
                    </th>
                    <th className="px-6 py-3 font-label-md text-label-md text-outline uppercase text-right">
                      Deuda
                    </th>
                    <th className="px-6 py-3 font-label-md text-label-md text-outline uppercase text-center">
                      Estado
                    </th>
                    <th className="px-6 py-3 font-label-md text-label-md text-outline uppercase text-right">
                      Acciones
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-outline-variant">
                  {paginatedSales.length === 0 ? (
                    <tr>
                      <td
                        colSpan={7}
                        className="px-6 py-12 text-center text-on-surface-variant text-body-md"
                      >
                        No se encontraron registros de ventas de paquetes.
                      </td>
                    </tr>
                  ) : (
                    paginatedSales.map((sale) => {
                      const totalSesiones = sale.paquetes?.cantidad_sesiones || 0;
                      const hasDeuda = sale.deuda > 0;

                      let badgeStyle =
                        "bg-outline-variant/20 text-on-surface border border-outline-variant/30";
                      if (sale.estado === "Al día") {
                        badgeStyle =
                          "bg-secondary-container/20 text-secondary border border-secondary/20";
                      } else if (sale.estado === "Deuda") {
                        badgeStyle = "bg-error-container/20 text-error border border-error/20";
                      } else if (sale.estado === "Parcial") {
                        badgeStyle =
                          "bg-primary-container/10 text-primary border border-primary/20";
                      }

                      return (
                        <tr
                          key={sale.id}
                          className="hover:bg-surface-container-low transition-colors group"
                        >
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-full bg-primary-container/10 text-primary flex items-center justify-center text-[10px] font-bold">
                                {getInitials(sale.pacientes?.nombre || "Paciente")}
                              </div>
                              <div>
                                <p className="font-body-md text-body-md font-medium">
                                  {sale.pacientes?.nombre || "Paciente Desconocido"}
                                </p>
                                <p className="text-xs text-outline">
                                  DNI/Cod: {sale.pacientes?.codigo || "—"}
                                </p>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="font-body-md text-body-md">
                              {sale.paquetes?.nombre || "Paquete"}
                              <span className="text-xs text-outline block mt-0.5">
                                Asistencias: {sale.sesiones_realizadas} / {totalSesiones} ses.
                              </span>
                            </div>
                          </td>
                          <td className="px-6 py-4 font-body-md text-body-md text-right font-medium">
                            {formatMoney(sale.precio_venta)}
                          </td>
                          <td className="px-6 py-4 font-body-md text-body-md text-right text-secondary">
                            {formatMoney(sale.pagado)}
                          </td>
                          <td
                            className={`px-6 py-4 font-body-md text-body-md text-right ${hasDeuda ? "text-error font-bold" : ""}`}
                          >
                            {formatMoney(sale.deuda)}
                          </td>
                          <td className="px-6 py-4 text-center">
                            <span
                              className={`inline-flex items-center px-2 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${badgeStyle}`}
                            >
                              {sale.estado}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-right">
                            <div className="flex justify-end gap-1">
                              <button
                                className="p-1.5 text-outline hover:text-primary hover:bg-surface-container rounded transition-all cursor-pointer"
                                title="Ver bitácora / Registrar Asistencia"
                                onClick={() => setSessionModalSale(sale)}
                              >
                                <span className="material-symbols-outlined text-lg">history</span>
                              </button>
                              <button
                                className={`p-1.5 rounded transition-all ${
                                  hasDeuda
                                    ? "text-outline hover:text-secondary hover:bg-surface-container cursor-pointer"
                                    : "text-outline/30 cursor-not-allowed"
                                }`}
                                title={hasDeuda ? "Registrar abono de deuda" : "Paquete sin deuda"}
                                disabled={!hasDeuda}
                                onClick={() => setPaymentModalSale(sale)}
                              >
                                <span className="material-symbols-outlined text-lg">add_card</span>
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>

            {/* Table Pagination Controls */}
            <div className="px-6 py-4 bg-surface-container-low border-t border-outline-variant flex items-center justify-between">
              <p className="text-caption text-outline">
                Mostrando {paginatedSales.length} de {filteredSales.length} paquetes registrados
              </p>
              {totalPages > 1 && (
                <div className="flex gap-1">
                  <button
                    onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                    disabled={currentPage === 1}
                    className="px-3 py-1 border border-outline-variant rounded text-xs hover:bg-white transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Anterior
                  </button>
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                    <button
                      key={p}
                      onClick={() => setCurrentPage(p)}
                      className={`px-3 py-1 border rounded text-xs font-bold transition-all cursor-pointer ${
                        currentPage === p
                          ? "border-primary bg-primary text-white"
                          : "border-outline-variant bg-white text-outline hover:bg-surface-container"
                      }`}
                    >
                      {p}
                    </button>
                  ))}
                  <button
                    onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                    disabled={currentPage === totalPages}
                    className="px-3 py-1 border border-outline-variant rounded text-xs hover:bg-white transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Siguiente
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* 1. Modal: Nueva Venta */}
      {newSaleModalOpen && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center transition-all p-4">
          <div
            className="absolute inset-0"
            onClick={() => !isSubmittingSale && setNewSaleModalOpen(false)}
          />
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6 relative border border-outline-variant z-10 animate-in fade-in zoom-in-95 duration-200">
            <h3 className="font-title-lg text-title-lg text-primary mb-4 flex items-center gap-2">
              <span className="material-symbols-outlined">add_circle</span>
              Registrar Nueva Venta
            </h3>

            <form onSubmit={handleCreateSale} className="space-y-4">
              <div>
                <label className="block font-label-md text-label-md text-outline mb-1">
                  Paciente *
                </label>
                <select
                  value={newSalePacienteId}
                  onChange={(e) => setNewSalePacienteId(e.target.value)}
                  className="w-full border border-outline-variant rounded-lg p-2 text-body-md focus:border-primary focus:ring-1 focus:ring-primary transition-all bg-white outline-none"
                  required
                >
                  <option value="">Seleccione un paciente...</option>
                  {patients.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.nombre}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-label-md text-label-md text-outline mb-1">
                  Paquete a Vender *
                </label>
                <select
                  value={newSalePaqueteId}
                  onChange={(e) => setNewSalePaqueteId(e.target.value)}
                  className="w-full border border-outline-variant rounded-lg p-2 text-body-md focus:border-primary focus:ring-1 focus:ring-primary transition-all bg-white outline-none"
                  required
                >
                  <option value="">Seleccione un paquete...</option>
                  {packages.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.nombre} ({p.cantidad_sesiones} ses. • Estándar:{" "}
                      {formatMoney(p.precio_total)})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block font-label-md text-label-md text-outline mb-1">
                    Precio Pactado ($) *
                  </label>
                  <input
                    type="number"
                    value={newSalePrecioVenta}
                    onChange={(e) => setNewSalePrecioVenta(e.target.value)}
                    className="w-full border border-outline-variant rounded-lg p-2 text-body-md focus:border-primary focus:ring-1 focus:ring-primary transition-all bg-white outline-none"
                    placeholder="0.00"
                    step="0.01"
                    min="0.01"
                    required
                  />
                </div>
                <div>
                  <label className="block font-label-md text-label-md text-outline mb-1">
                    Pago Inicial ($)
                  </label>
                  <input
                    type="number"
                    value={newSalePagado}
                    onChange={(e) => setNewSalePagado(e.target.value)}
                    className="w-full border border-outline-variant rounded-lg p-2 text-body-md focus:border-primary focus:ring-1 focus:ring-primary transition-all bg-white outline-none"
                    placeholder="0.00"
                    step="0.01"
                    min="0"
                  />
                </div>
              </div>

              {newSalePagado && parseFloat(newSalePagado) > 0 && (
                <div className="p-3 bg-surface-container-low rounded-lg border border-outline-variant animate-in slide-in-from-top-2 duration-200">
                  <label className="block font-label-md text-label-md text-primary font-bold mb-2">
                    Método de Pago para Caja *
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {(["Efectivo", "Yape", "Plin", "Transferencia", "Tarjeta"] as const).map(
                      (m) => (
                        <button
                          key={m}
                          type="button"
                          onClick={() => setNewSaleMetodo(m)}
                          className={`py-1.5 px-2 text-xs border rounded transition-all cursor-pointer ${
                            newSaleMetodo === m
                              ? "bg-primary border-primary text-white font-bold"
                              : "bg-white border-outline-variant hover:bg-surface-container"
                          }`}
                        >
                          {m}
                        </button>
                      ),
                    )}
                  </div>
                </div>
              )}

              <div className="mt-6 flex justify-end gap-3 border-t border-outline-variant pt-4">
                <button
                  type="button"
                  disabled={isSubmittingSale}
                  onClick={() => setNewSaleModalOpen(false)}
                  className="px-4 py-2 border border-outline text-primary rounded-lg font-label-md text-label-md hover:bg-surface-container transition-colors cursor-pointer disabled:opacity-50"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingSale}
                  className="px-4 py-2 bg-primary text-white rounded-lg font-label-md text-label-md hover:bg-primary-container transition-all cursor-pointer active:scale-95 disabled:opacity-50 flex items-center gap-2"
                >
                  {isSubmittingSale ? (
                    <>
                      <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                      Procesando...
                    </>
                  ) : (
                    "Registrar Venta"
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 2. Modal: Registrar Pago / Abono */}
      {paymentModalSale && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center transition-all p-4">
          <div
            className="absolute inset-0"
            onClick={() => !isSubmittingPayment && setPaymentModalSale(null)}
          />
          <div className="bg-white rounded-xl shadow-xl max-w-sm w-full p-6 relative border border-outline-variant z-10 animate-in fade-in zoom-in-95 duration-200">
            <h3 className="font-title-lg text-title-lg text-secondary mb-4 flex items-center gap-2">
              <span className="material-symbols-outlined">add_card</span>
              Registrar Abono de Deuda
            </h3>

            <div className="mb-4 text-body-md text-on-surface-variant p-3 bg-surface-container-low border border-outline-variant rounded-lg space-y-1">
              <p>
                <strong>Paciente:</strong> {paymentModalSale.pacientes?.nombre}
              </p>
              <p>
                <strong>Paquete:</strong> {paymentModalSale.paquetes?.nombre}
              </p>
              <p>
                <strong>Deuda Pendiente:</strong>{" "}
                <span className="text-error font-bold">{formatMoney(paymentModalSale.deuda)}</span>
              </p>
            </div>

            <form onSubmit={handleRegisterPayment} className="space-y-4">
              <div>
                <label className="block font-label-md text-label-md text-outline mb-1">
                  Monto a Abonar ($) *
                </label>
                <input
                  type="number"
                  value={paymentAmount}
                  onChange={(e) => setPaymentAmount(e.target.value)}
                  className="w-full border border-outline-variant rounded-lg p-2 text-body-md focus:border-secondary focus:ring-1 focus:ring-secondary transition-all bg-white outline-none"
                  placeholder="0.00"
                  step="0.01"
                  min="0.01"
                  max={paymentModalSale.deuda}
                  required
                />
              </div>

              <div>
                <label className="block font-label-md text-label-md text-outline mb-1">
                  Método de Pago *
                </label>
                <select
                  value={paymentMetodo}
                  onChange={(e) =>
                    setPaymentMetodo(
                      e.target.value as "Efectivo" | "Yape" | "Plin" | "Transferencia" | "Tarjeta",
                    )
                  }
                  className="w-full border border-outline-variant rounded-lg p-2 text-body-md focus:border-secondary focus:ring-1 focus:ring-secondary transition-all bg-white outline-none"
                  required
                >
                  <option value="Efectivo">Efectivo</option>
                  <option value="Yape">Yape</option>
                  <option value="Plin">Plin</option>
                  <option value="Transferencia">Transferencia</option>
                  <option value="Tarjeta">Tarjeta</option>
                </select>
              </div>

              <div className="mt-6 flex justify-end gap-3 border-t border-outline-variant pt-4">
                <button
                  type="button"
                  disabled={isSubmittingPayment}
                  onClick={() => setPaymentModalSale(null)}
                  className="px-4 py-2 border border-outline text-primary rounded-lg font-label-md text-label-md hover:bg-surface-container transition-colors cursor-pointer disabled:opacity-50"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingPayment}
                  className="px-4 py-2 bg-secondary text-white rounded-lg font-label-md text-label-md hover:brightness-110 transition-all cursor-pointer active:scale-95 disabled:opacity-50 flex items-center gap-2"
                >
                  {isSubmittingPayment ? (
                    <>
                      <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                      Registrando...
                    </>
                  ) : (
                    "Confirmar Pago"
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 3. Modal: Registro de Asistencias & Bitácora */}
      {sessionModalSale && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center transition-all p-4">
          <div
            className="absolute inset-0"
            onClick={() => !isSubmittingSession && setSessionModalSale(null)}
          />
          <div className="bg-white rounded-xl shadow-xl max-w-lg w-full p-6 relative border border-outline-variant z-10 animate-in fade-in zoom-in-95 duration-200 flex flex-col max-h-[90vh]">
            <h3 className="font-title-lg text-title-lg text-primary mb-2 flex items-center gap-2 shrink-0">
              <span className="material-symbols-outlined">history</span>
              Seguimiento y Asistencias de Terapias
            </h3>

            <div className="text-body-md text-on-surface-variant p-3 bg-surface-container-low border border-outline-variant rounded-lg space-y-1 mb-4 shrink-0">
              <p>
                <strong>Paciente:</strong> {sessionModalSale.pacientes?.nombre}
              </p>
              <p>
                <strong>Paquete:</strong> {sessionModalSale.paquetes?.nombre}
              </p>
              <div className="flex items-center justify-between mt-2 text-xs">
                <span>Progreso de Sesiones:</span>
                <span className="font-bold text-primary">
                  {sessionModalSale.sesiones_realizadas} de{" "}
                  {sessionModalSale.paquetes?.cantidad_sesiones || 0} completadas
                </span>
              </div>
              <div className="w-full bg-outline-variant/30 h-2 rounded-full overflow-hidden mt-1">
                <div
                  className="bg-primary h-full transition-all duration-500"
                  style={{
                    width: `${(sessionModalSale.sesiones_realizadas / (sessionModalSale.paquetes?.cantidad_sesiones || 1)) * 100}%`,
                  }}
                />
              </div>
            </div>

            {/* Navigation Tabs */}
            <div className="flex border-b border-outline-variant mb-4 shrink-0">
              <button
                type="button"
                onClick={() => setSessionTab("registrar")}
                className={`flex-1 py-2 text-center text-label-md font-bold border-b-2 cursor-pointer transition-all ${
                  sessionTab === "registrar"
                    ? "border-primary text-primary"
                    : "border-transparent text-outline hover:text-on-surface"
                }`}
              >
                Registrar Asistencia
              </button>
              <button
                type="button"
                onClick={() => setSessionTab("historial")}
                className={`flex-1 py-2 text-center text-label-md font-bold border-b-2 cursor-pointer transition-all ${
                  sessionTab === "historial"
                    ? "border-primary text-primary"
                    : "border-transparent text-outline hover:text-on-surface"
                }`}
              >
                Bitácora de Sesiones ({sessionHistory.length})
              </button>
            </div>

            {/* Tab Contents */}
            <div className="flex-1 overflow-y-auto min-h-[200px] pr-1 custom-scrollbar">
              {sessionTab === "registrar" ? (
                sessionModalSale.sesiones_realizadas >=
                (sessionModalSale.paquetes?.cantidad_sesiones || 0) ? (
                  <div className="text-center py-8 text-secondary font-medium space-y-2">
                    <span className="material-symbols-outlined text-[48px]">task_alt</span>
                    <p>¡Este paquete ya ha completado todas sus terapias!</p>
                  </div>
                ) : (
                  <form onSubmit={handleRegisterSession} className="space-y-4 py-1">
                    <div>
                      <label className="block font-label-md text-label-md text-outline mb-1">
                        Terapeuta que atendió la sesión *
                      </label>
                      <select
                        value={sessionTerapeutaId}
                        onChange={(e) => setSessionTerapeutaId(e.target.value)}
                        className="w-full border border-outline-variant rounded-lg p-2 text-body-md focus:border-primary focus:ring-1 focus:ring-primary transition-all bg-white outline-none"
                        required
                      >
                        <option value="">Seleccione un terapeuta...</option>
                        {activeTherapists.map((w) => (
                          <option key={w.id} value={w.id}>
                            {w.nombre}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block font-label-md text-label-md text-outline mb-1">
                        Notas de evolución médica
                      </label>
                      <textarea
                        value={sessionNotas}
                        onChange={(e) => setSessionNotas(e.target.value)}
                        placeholder="Describa el progreso del paciente o incidencias de la sesión..."
                        className="w-full border border-outline-variant rounded-lg p-2 text-body-md focus:border-primary focus:ring-1 focus:ring-primary transition-all bg-white outline-none h-24 resize-none"
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={isSubmittingSession}
                      className="w-full bg-primary text-white py-2.5 rounded-lg font-label-md text-label-md hover:bg-primary-container transition-all cursor-pointer active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2"
                    >
                      {isSubmittingSession ? (
                        <>
                          <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                          Registrando sesión...
                        </>
                      ) : (
                        "Registrar Asistencia"
                      )}
                    </button>
                  </form>
                )
              ) : isLoadingHistory ? (
                <div className="flex items-center justify-center py-12 gap-2 text-outline">
                  <span className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin"></span>
                  Cargando historial de asistencia...
                </div>
              ) : sessionHistory.length === 0 ? (
                <p className="text-center text-outline text-body-md py-12">
                  No se registran asistencias para este paquete todavía.
                </p>
              ) : (
                <div className="space-y-4 py-1">
                  {sessionHistory.map((s) => (
                    <div
                      key={s.id}
                      className="border-l-2 border-primary bg-surface-container-low p-3 rounded-r-lg space-y-1"
                    >
                      <div className="flex justify-between text-xs text-outline font-bold">
                        <span>Terapeuta: {s.trabajadores?.nombre || "—"}</span>
                        <span>{new Date(s.fecha).toLocaleDateString("es-PE")}</span>
                      </div>
                      {s.notas ? (
                        <p className="text-body-md text-on-surface whitespace-pre-wrap">
                          {s.notas}
                        </p>
                      ) : (
                        <p className="text-body-md text-outline italic">Sin notas de evolución.</p>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="mt-4 border-t border-outline-variant pt-4 flex justify-end shrink-0">
              <button
                type="button"
                onClick={() => setSessionModalSale(null)}
                className="px-4 py-2 bg-outline-variant text-on-surface-variant rounded-lg font-label-md text-label-md hover:brightness-95 transition-colors cursor-pointer"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
