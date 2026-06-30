import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { getTrabajadores, type DbTrabajador as Trabajador } from "../lib/api/workers";
import {
  getComisiones,
  insertComision,
  updateComisionEstado,
  getPacientes,
  deleteComision,
  type DbComision as Comision,
  type DbPaciente as Paciente,
} from "../lib/api/comisiones";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

export const Route = createFileRoute("/comisiones")({
  head: () => ({
    meta: [
      { title: "OMVITAL - Comisiones" },
      { name: "description", content: "Control de comisiones" },
    ],
  }),
  component: Page,
});

function Page() {
  const [comisiones, setComisiones] = useState<Comision[]>([]);
  const [trabajadores, setTrabajadores] = useState<Trabajador[]>([]);
  const [pacientes, setPacientes] = useState<Paciente[]>([]);

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  // Filters State
  const [filterEstado, setFilterEstado] = useState<"Todos" | "Pendiente" | "Pagado">("Todos");
  const [filterMes, setFilterMes] = useState<string>("Todos");

  // Form State
  const [tipoComisionista, setTipoComisionista] = useState<
    "Médico Especialista" | "Jaladora / Promotor"
  >("Médico Especialista");
  const [trabajadorId, setTrabajadorId] = useState("");
  const [pacienteId, setPacienteId] = useState("");
  const [monto, setMonto] = useState("");
  const [fechaComision, setFechaComision] = useState(new Date().toISOString().split("T")[0]);

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  // Dropdown & Deletion States
  const [openDropdownId, setOpenDropdownId] = useState<string | null>(null);
  const [comisionToDelete, setComisionToDelete] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  const fetchData = async () => {
    try {
      setLoading(true);
      setErrorMsg("");

      // Query data using server functions
      const [comData, workData, pacData] = await Promise.all([
        getComisiones(),
        getTrabajadores(),
        getPacientes(),
      ]);

      setComisiones(comData);
      // Filter out inactive workers if any
      setTrabajadores(workData.filter((w) => w.estado === "Activo"));
      setPacientes(pacData);
    } catch (err: any) {
      console.error("Error fetching data:", err);
      setErrorMsg("Ocurrió un error al consultar los datos de la base de datos.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    setTrabajadorId("");
  }, [tipoComisionista]);

  const handleRegisterComision = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");

    if (!trabajadorId) {
      setErrorMsg("Debe seleccionar un comisionista.");
      return;
    }
    if (!pacienteId) {
      setErrorMsg("Debe seleccionar un paciente.");
      return;
    }
    if (!monto || Number(monto) <= 0) {
      setErrorMsg("El monto debe ser un número mayor a cero.");
      return;
    }
    if (!fechaComision) {
      setErrorMsg("Debe ingresar la fecha de la comisión.");
      return;
    }

    try {
      setSubmitting(true);

      await insertComision({
        data: {
          trabajador_id: trabajadorId,
          paciente_id: pacienteId,
          monto: parseFloat(monto),
          fecha_comision: fechaComision,
          estado: "Pendiente",
        },
      });

      // Clear form except date
      setTrabajadorId("");
      setPacienteId("");
      setMonto("");

      await fetchData();
    } catch (err: any) {
      console.error("Error inserting commission:", err);
      setErrorMsg(err.message || "Error al registrar la comisión.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleMarcarPagada = async (id: string) => {
    try {
      setErrorMsg("");
      setLoading(true);

      await updateComisionEstado({
        data: {
          id,
          estado: "Pagado",
        },
      });

      await fetchData();
    } catch (err: any) {
      console.error("Error updating commission state:", err);
      setErrorMsg(err.message || "Error al actualizar el estado de la comisión.");
      setLoading(false);
    }
  };

  const handleDeleteComision = async (id: string) => {
    try {
      setDeleting(true);
      setErrorMsg("");

      await deleteComision({
        data: {
          id,
        },
      });

      setComisionToDelete(null);
      await fetchData();
    } catch (err: any) {
      console.error("Error deleting commission:", err);
      setErrorMsg(err.message || "Error al eliminar la comisión.");
    } finally {
      setDeleting(false);
    }
  };

  // Calculations for Statistics using reduce
  const totalPendiente = comisiones
    .filter((c) => c.estado === "Pendiente")
    .reduce((acc, curr) => acc + Number(curr.monto), 0);

  const currentYear = new Date().getFullYear();
  const currentMonth = new Date().getMonth();

  const totalPagadoEsteMes = comisiones
    .filter((c) => {
      if (c.estado !== "Pagado") return false;
      const [year, month] = c.fecha_comision.split("-").map(Number);
      return year === currentYear && month - 1 === currentMonth;
    })
    .reduce((acc, curr) => acc + Number(curr.monto), 0);

  // Mini History of Paid Commissions
  const ultimosPagos = comisiones.filter((c) => c.estado === "Pagado").slice(0, 3);

  // Workers filtered by type for selection
  const filteredWorkersForForm = trabajadores.filter((w) => {
    if (tipoComisionista === "Médico Especialista") {
      return w.rol === "Médico Externo" || w.rol === "Interno";
    } else {
      return w.rol === "Jaladora";
    }
  });

  // Dynamic Month List for Filter
  const uniqueMonths = Array.from(
    new Set(
      comisiones.map((c) => {
        const [year, month] = c.fecha_comision.split("-");
        return `${year}-${month}`;
      }),
    ),
  )
    .sort()
    .reverse();

  const formatMonthLabel = (yearMonthStr: string) => {
    const [year, month] = yearMonthStr.split("-").map(Number);
    const monthsSpanish = [
      "Enero",
      "Febrero",
      "Marzo",
      "Abril",
      "Mayo",
      "Junio",
      "Julio",
      "Agosto",
      "Septiembre",
      "Octubre",
      "Noviembre",
      "Diciembre",
    ];
    return `${monthsSpanish[month - 1]} ${year}`;
  };

  // Table Filters
  const filteredComisiones = comisiones.filter((c) => {
    const matchesEstado = filterEstado === "Todos" || c.estado === filterEstado;
    let matchesMonth = true;
    if (filterMes !== "Todos") {
      const [year, month] = c.fecha_comision.split("-");
      matchesMonth = `${year}-${month}` === filterMes;
    }
    return matchesEstado && matchesMonth;
  });

  // Pagination
  const totalItems = filteredComisiones.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage) || 1;
  const paginatedComisiones = filteredComisiones.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage,
  );

  useEffect(() => {
    setCurrentPage(1);
  }, [filterEstado, filterMes]);

  const handleExportPDF = () => {
    if (filteredComisiones.length === 0) return;

    const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
    const pageW = doc.internal.pageSize.getWidth();
    const pageH = doc.internal.pageSize.getHeight();
    const now = new Date();
    const dateStr = now.toLocaleDateString("es-PE", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
    const timeStr = now.toLocaleTimeString("es-PE", { hour: "2-digit", minute: "2-digit" });

    // Primary Header Bar
    doc.setFillColor(0, 66, 134);
    doc.rect(0, 0, pageW, 25, "F");

    // Accent line
    doc.setFillColor(52, 103, 97);
    doc.rect(0, 25, pageW, 1.5, "F");

    // System Title
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(18);
    doc.setFont("helvetica", "bold");
    doc.text("OMVITAL", 10, 10);
    doc.setFontSize(9);
    doc.setFont("helvetica", "normal");
    doc.text("Reporte de Comisiones - Registro y Control Financiero", 10, 17);

    // Timestamp
    doc.setFontSize(8);
    doc.text(`Generado: ${dateStr} ${timeStr}`, pageW - 10, 10, { align: "right" });

    // Status Summary Cards
    const yStart = 35;
    doc.setFillColor(243, 243, 250);
    doc.roundedRect(10, yStart, 90, 20, 2, 2, "F");
    doc.setFontSize(7);
    doc.setTextColor(115, 119, 130);
    doc.text("TOTAL COMISIONES PENDIENTES", 15, yStart + 6);
    doc.setFontSize(12);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(0, 66, 134);
    doc.text(
      `$${totalPendiente.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
      15,
      yStart + 14,
    );

    doc.setFillColor(243, 243, 250);
    doc.roundedRect(110, yStart, 90, 20, 2, 2, "F");
    doc.setFontSize(7);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(115, 119, 130);
    doc.text("TOTAL PAGADO ESTE MES", 115, yStart + 6);
    doc.setFontSize(12);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(52, 103, 97);
    doc.text(
      `$${totalPagadoEsteMes.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
      115,
      yStart + 14,
    );

    // Filter info block
    doc.setFontSize(8);
    doc.setFont("helvetica", "italic");
    doc.setTextColor(115, 119, 130);
    const filterInfo = `Estado: ${filterEstado} | Mes: ${filterMes === "Todos" ? "Todos" : formatMonthLabel(filterMes)}`;
    doc.text(
      `Filtros aplicados: ${filterInfo} (${filteredComisiones.length} registros)`,
      10,
      yStart + 27,
    );

    // Auto Table Layout
    autoTable(doc, {
      startY: yStart + 30,
      head: [["Comisionista", "Rol", "Paciente", "Monto", "Estado", "Fecha"]],
      body: filteredComisiones.map((c) => [
        c.trabajadores?.nombre || "—",
        c.trabajadores?.rol === "Médico Externo"
          ? "Médico"
          : c.trabajadores?.rol === "Jaladora"
            ? "Jaladora"
            : c.trabajadores?.rol || "—",
        c.pacientes?.nombre || "—",
        `$${Number(c.monto).toFixed(2)}`,
        c.estado,
        c.fecha_comision,
      ]),
      headStyles: {
        fillColor: [0, 66, 134],
        textColor: [255, 255, 255],
        fontSize: 8.5,
        fontStyle: "bold",
      },
      bodyStyles: {
        fontSize: 8,
        textColor: [25, 28, 33],
      },
      alternateRowStyles: {
        fillColor: [248, 250, 252],
      },
      margin: { left: 10, right: 10 },
    });

    const totalPagesNum = (doc as any).internal.getNumberOfPages();
    for (let i = 1; i <= totalPagesNum; i++) {
      doc.setPage(i);
      doc.setFontSize(7);
      doc.setTextColor(115, 119, 130);
      doc.text("OMVITAL - Sistema de Gestión Integral • Confidencial", 10, pageH - 5);
      doc.text(`Pág. ${i} / ${totalPagesNum}`, pageW - 10, pageH - 5, { align: "right" });
    }

    doc.save(`reporte_comisiones_omvital_${now.toISOString().split("T")[0]}.pdf`);
  };

  return (
    <main className="ml-[260px] pt-[64px] h-screen overflow-y-auto custom-scrollbar bg-background">
      <div className="p-container_padding max-w-[1400px] mx-auto space-y-gutter">
        {/* Header Section */}
        <div className="flex items-end justify-between">
          <div>
            <h2 className="font-headline-md text-headline-md text-primary">
              Gestión de Comisiones
            </h2>
            <p className="font-body-md text-body-md text-on-surface-variant">
              Registro y control de incentivos para médicos y jaladores.
            </p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={handleExportPDF}
              disabled={filteredComisiones.length === 0}
              className="flex items-center gap-2 px-4 py-2 border border-outline text-primary rounded-lg font-label-md text-label-md hover:bg-surface-container transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <span className="material-symbols-outlined text-[18px]">download</span>
              Exportar Reporte
            </button>
          </div>
        </div>

        {errorMsg && (
          <div className="p-4 bg-error-container text-on-error-container rounded-lg border border-error/20 font-body-md text-body-md">
            {errorMsg}
          </div>
        )}

        {/* Bento Layout Grid */}
        <div className="grid grid-cols-12 gap-gutter">
          {/* Registration Form Card */}
          <div className="col-span-12 lg:col-span-4 bg-white border border-outline-variant p-stack_lg flex flex-col space-y-stack_md rounded-lg shadow-sm">
            <div className="flex items-center gap-2 border-b border-outline-variant pb-3 mb-2">
              <span className="material-symbols-outlined text-primary">add_circle</span>
              <h3 className="font-title-lg text-title-lg">Nueva Comisión</h3>
            </div>

            <form onSubmit={handleRegisterComision} className="space-y-4">
              <div>
                <label className="block font-label-md text-label-md text-outline mb-1">
                  Tipo de Comisionista
                </label>
                <select
                  value={tipoComisionista}
                  onChange={(e) => setTipoComisionista(e.target.value as any)}
                  className="w-full border border-outline-variant rounded-lg p-2 text-body-md focus:border-primary focus:ring-1 focus:ring-primary transition-all bg-white"
                >
                  <option value="Médico Especialista">Médico Especialista</option>
                  <option value="Jaladora / Promotor">Jaladora / Promotor</option>
                </select>
              </div>

              <div>
                <label className="block font-label-md text-label-md text-outline mb-1">
                  Nombre del Comisionista
                </label>
                <select
                  value={trabajadorId}
                  onChange={(e) => setTrabajadorId(e.target.value)}
                  className="w-full border border-outline-variant rounded-lg p-2 text-body-md focus:border-primary focus:ring-1 focus:ring-primary transition-all bg-white"
                  required
                >
                  <option value="">Seleccione un comisionista...</option>
                  {filteredWorkersForForm.map((w) => (
                    <option key={w.id} value={w.id}>
                      {w.nombre} (
                      {w.rol === "Médico Externo"
                        ? "Médico"
                        : w.rol === "Jaladora"
                          ? "Jaladora"
                          : w.rol}
                      )
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-label-md text-label-md text-outline mb-1">
                  Paciente Atendido
                </label>
                <select
                  value={pacienteId}
                  onChange={(e) => setPacienteId(e.target.value)}
                  className="w-full border border-outline-variant rounded-lg p-2 text-body-md focus:border-primary focus:ring-1 focus:ring-primary transition-all bg-white"
                  required
                >
                  <option value="">Seleccione un paciente...</option>
                  {pacientes.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.nombre}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block font-label-md text-label-md text-outline mb-1">
                    Monto ($)
                  </label>
                  <input
                    type="number"
                    value={monto}
                    onChange={(e) => setMonto(e.target.value)}
                    className="w-full border border-outline-variant rounded-lg p-2 text-body-md focus:border-primary focus:ring-1 focus:ring-primary transition-all bg-white"
                    placeholder="0.00"
                    step="0.01"
                    min="0"
                    required
                  />
                </div>
                <div>
                  <label className="block font-label-md text-label-md text-outline mb-1">
                    Fecha
                  </label>
                  <input
                    type="date"
                    value={fechaComision}
                    onChange={(e) => setFechaComision(e.target.value)}
                    className="w-full border border-outline-variant rounded-lg p-2 text-body-md focus:border-primary focus:ring-1 focus:ring-primary transition-all bg-white"
                    required
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full bg-primary text-white py-3 rounded-lg font-label-md text-label-md hover:bg-primary-container transition-all shadow-sm active:scale-[0.98] cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {submitting && (
                  <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                )}
                Registrar Comisión
              </button>
            </form>
          </div>

          {/* Main Data Grid & Filters */}
          <div className="col-span-12 lg:col-span-8 space-y-gutter">
            {/* Filters Row */}
            <div className="bg-white border border-outline-variant p-4 flex flex-wrap items-center justify-between gap-4 rounded-lg shadow-sm">
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <span className="font-label-md text-label-md text-outline">Mes:</span>
                  <select
                    value={filterMes}
                    onChange={(e) => setFilterMes(e.target.value)}
                    className="border-none bg-surface-container-low rounded p-1 text-label-md font-medium text-on-surface-variant focus:ring-0 outline-none cursor-pointer"
                  >
                    <option value="Todos">Todos</option>
                    {uniqueMonths.map((m) => (
                      <option key={m} value={m}>
                        {formatMonthLabel(m)}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="flex items-center gap-2">
                  <span className="font-label-md text-label-md text-outline">Estado:</span>
                  <div className="flex bg-surface-container-low rounded-lg p-1">
                    <button
                      onClick={() => setFilterEstado("Todos")}
                      className={`px-3 py-1 text-label-md cursor-pointer transition-all ${
                        filterEstado === "Todos"
                          ? "bg-white rounded shadow-sm text-primary font-bold"
                          : "text-on-surface-variant hover:bg-white/50"
                      }`}
                    >
                      Todos
                    </button>
                    <button
                      onClick={() => setFilterEstado("Pendiente")}
                      className={`px-3 py-1 text-label-md cursor-pointer transition-all ${
                        filterEstado === "Pendiente"
                          ? "bg-white rounded shadow-sm text-primary font-bold"
                          : "text-on-surface-variant hover:bg-white/50"
                      }`}
                    >
                      Pendientes
                    </button>
                    <button
                      onClick={() => setFilterEstado("Pagado")}
                      className={`px-3 py-1 text-label-md cursor-pointer transition-all ${
                        filterEstado === "Pagado"
                          ? "bg-white rounded shadow-sm text-primary font-bold"
                          : "text-on-surface-variant hover:bg-white/50"
                      }`}
                    >
                      Pagados
                    </button>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 text-outline">
                <span className="material-symbols-outlined text-[20px]">filter_list</span>
                <span className="font-label-md text-label-md uppercase tracking-wider">
                  Filtros Avanzados
                </span>
              </div>
            </div>

            {/* Commissions Table */}
            <div className="bg-white border border-outline-variant overflow-hidden rounded-lg shadow-sm">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-surface-container-low border-b border-outline-variant">
                    <th className="px-6 py-4 font-label-md text-label-md text-on-surface-variant">
                      Comisionista
                    </th>
                    <th className="px-6 py-4 font-label-md text-label-md text-on-surface-variant">
                      Paciente
                    </th>
                    <th className="px-6 py-4 font-label-md text-label-md text-on-surface-variant">
                      Monto
                    </th>
                    <th className="px-6 py-4 font-label-md text-label-md text-on-surface-variant">
                      Estado
                    </th>
                    <th className="px-6 py-4 font-label-md text-label-md text-on-surface-variant text-right">
                      Acciones
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-outline-variant">
                  {loading ? (
                    <tr>
                      <td
                        colSpan={5}
                        className="px-6 py-12 text-center text-on-surface-variant text-body-md"
                      >
                        <div className="flex items-center justify-center gap-2">
                          <span className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin"></span>
                          Cargando comisiones...
                        </div>
                      </td>
                    </tr>
                  ) : paginatedComisiones.length === 0 ? (
                    <tr>
                      <td
                        colSpan={5}
                        className="px-6 py-8 text-center text-on-surface-variant text-body-md"
                      >
                        No se encontraron registros de comisiones.
                      </td>
                    </tr>
                  ) : (
                    paginatedComisiones.map((com) => {
                      const isMedico =
                        com.trabajadores?.rol === "Médico Externo" ||
                        com.trabajadores?.rol === "Interno";
                      return (
                        <tr
                          key={com.id}
                          className="hover:bg-surface-container-low transition-colors group"
                        >
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-3">
                              {isMedico ? (
                                <div className="w-8 h-8 rounded-full bg-secondary-container/20 flex items-center justify-center text-secondary">
                                  <span className="material-symbols-outlined text-[18px]">
                                    medical_services
                                  </span>
                                </div>
                              ) : (
                                <div className="w-8 h-8 rounded-full bg-tertiary-fixed/20 flex items-center justify-center text-tertiary">
                                  <span className="material-symbols-outlined text-[18px]">
                                    campaign
                                  </span>
                                </div>
                              )}
                              <div>
                                <p className="font-body-md text-body-md font-semibold">
                                  {com.trabajadores?.nombre || "—"}
                                </p>
                                <p className="text-caption text-outline">
                                  {com.trabajadores?.rol === "Médico Externo"
                                    ? "Médico"
                                    : com.trabajadores?.rol === "Jaladora"
                                      ? "Jaladora"
                                      : com.trabajadores?.rol || "—"}
                                </p>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 text-body-md">{com.pacientes?.nombre || "—"}</td>
                          <td className="px-6 py-4 font-semibold text-primary">
                            ${Number(com.monto).toFixed(2)}
                          </td>
                          <td className="px-6 py-4">
                            {com.estado === "Pagado" ? (
                              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-caption font-medium bg-secondary-container/30 text-secondary border border-secondary/20">
                                Pagado
                              </span>
                            ) : (
                              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-caption font-medium bg-error-container/30 text-error border border-error/20">
                                Pendiente
                              </span>
                            )}
                          </td>
                          <td className="px-6 py-4 text-right">
                            {com.estado === "Pendiente" ? (
                              <button
                                onClick={() => handleMarcarPagada(com.id)}
                                title="Liquidar comisión"
                                className="text-outline hover:text-primary transition-colors cursor-pointer bg-transparent border-none p-1"
                              >
                                <span className="material-symbols-outlined">payments</span>
                              </button>
                            ) : (
                              <div className="relative inline-block text-left">
                                <button
                                  onClick={() =>
                                    setOpenDropdownId(openDropdownId === com.id ? null : com.id)
                                  }
                                  title="Opciones"
                                  className="text-outline hover:text-primary hover:bg-surface-container transition-colors cursor-pointer bg-transparent border-none p-1 rounded-full flex items-center justify-center w-8 h-8"
                                >
                                  <span className="material-symbols-outlined">more_vert</span>
                                </button>
                                {openDropdownId === com.id && (
                                  <>
                                    <div
                                      className="fixed inset-0 z-10"
                                      onClick={() => setOpenDropdownId(null)}
                                    />
                                    <div className="absolute right-0 mt-1 w-44 rounded-lg bg-white border border-outline-variant shadow-lg py-1 z-20 origin-top-right">
                                      <button
                                        type="button"
                                        onClick={() => {
                                          setOpenDropdownId(null);
                                          setComisionToDelete(com.id);
                                        }}
                                        className="w-full text-left px-4 py-2 font-label-md text-label-md text-error hover:bg-error-container/20 flex items-center gap-2 cursor-pointer border-none bg-white transition-colors"
                                      >
                                        <span className="material-symbols-outlined text-[18px]">
                                          delete
                                        </span>
                                        Eliminar comisión
                                      </button>
                                    </div>
                                  </>
                                )}
                              </div>
                            )}
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>

              {/* Table Pagination */}
              <div className="p-4 bg-surface-container-low flex items-center justify-between border-t border-outline-variant">
                <p className="text-caption text-outline">
                  Mostrando {paginatedComisiones.length} de {totalItems} registros
                </p>
                {totalPages > 1 && (
                  <div className="flex gap-1">
                    <button
                      onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                      disabled={currentPage === 1}
                      className="w-8 h-8 flex items-center justify-center border border-outline-variant bg-white rounded hover:bg-surface-container transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <span className="material-symbols-outlined text-[18px]">chevron_left</span>
                    </button>
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                      <button
                        key={p}
                        onClick={() => setCurrentPage(p)}
                        className={`w-8 h-8 flex items-center justify-center border rounded text-caption font-bold cursor-pointer transition-all ${
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
                      className="w-8 h-8 flex items-center justify-center border border-outline-variant bg-white rounded hover:bg-surface-container transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <span className="material-symbols-outlined text-[18px]">chevron_right</span>
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* History Column / Secondary Info */}
          <div className="col-span-12 space-y-gutter">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-gutter">
              {/* Quick Stats */}
              <div className="bg-primary text-white p-stack_lg flex items-center justify-between shadow-sm overflow-hidden relative rounded-lg">
                <div className="z-10">
                  <p className="font-label-md text-label-md opacity-80 uppercase tracking-widest">
                    Total Pendiente
                  </p>
                  <p className="text-display-lg font-display-lg mt-1">
                    $
                    {totalPendiente.toLocaleString("en-US", {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}
                  </p>
                </div>
                <span className="material-symbols-outlined text-[80px] absolute -right-4 -bottom-4 opacity-10 font-normal">
                  account_balance_wallet
                </span>
              </div>

              <div className="bg-secondary text-white p-stack_lg flex items-center justify-between shadow-sm overflow-hidden relative rounded-lg">
                <div className="z-10">
                  <p className="font-label-md text-label-md opacity-80 uppercase tracking-widest">
                    Pagado este Mes
                  </p>
                  <p className="text-display-lg font-display-lg mt-1">
                    $
                    {totalPagadoEsteMes.toLocaleString("en-US", {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}
                  </p>
                </div>
                <span className="material-symbols-outlined text-[80px] absolute -right-4 -bottom-4 opacity-10 font-normal">
                  task_alt
                </span>
              </div>

              {/* Mini History Card */}
              <div className="bg-white border border-outline-variant p-stack_lg flex flex-col h-full rounded-lg shadow-sm">
                <h4 className="font-title-lg text-title-lg mb-4 flex items-center gap-2">
                  <span className="material-symbols-outlined text-primary">history</span>
                  Últimos Pagos
                </h4>
                <div className="space-y-4 flex-1">
                  {ultimosPagos.length === 0 ? (
                    <p className="text-caption text-outline py-4">
                      No hay pagos registrados este mes.
                    </p>
                  ) : (
                    ultimosPagos.map((c) => (
                      <div
                        key={c.id}
                        className="flex items-center gap-3 border-l-2 border-secondary pl-3"
                      >
                        <div className="flex-1">
                          <p className="font-body-md text-body-md font-semibold">
                            {c.movimientos?.metodo || "Transferencia"}: {c.trabajadores?.nombre}
                          </p>
                          <p className="text-caption text-outline">
                            {c.fecha_comision} • Ref: #{c.id.substring(0, 4)}
                          </p>
                        </div>
                        <p className="font-body-md font-bold text-secondary">
                          +${Number(c.monto).toFixed(0)}
                        </p>
                      </div>
                    ))
                  )}
                </div>
                <button
                  onClick={() => {
                    setFilterEstado("Pagado");
                    setFilterMes("Todos");
                  }}
                  className="mt-4 text-center font-label-md text-label-md text-primary hover:underline underline-offset-4 cursor-pointer bg-transparent border-none"
                >
                  Ver Historial Completo
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Deletion Confirmation Modal */}
      {comisionToDelete && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center transition-all">
          {/* Backdrop click to close */}
          <div
            className="absolute inset-0"
            onClick={() => !deleting && setComisionToDelete(null)}
          />

          {/* Modal Body */}
          <div className="bg-white rounded-xl shadow-xl max-w-sm w-full mx-4 p-6 relative border border-outline-variant z-10">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-full bg-error-container/20 flex items-center justify-center text-error flex-shrink-0">
                <span className="material-symbols-outlined text-[24px]">warning</span>
              </div>
              <div className="space-y-2 flex-1">
                <h3 className="font-title-lg text-title-lg text-on-surface">¿Eliminar Comisión?</h3>
                <p className="font-body-md text-body-md text-on-surface-variant">
                  Esta acción es irreversible y eliminará el registro de la comisión de forma
                  permanente de la base de datos.
                </p>
              </div>
            </div>

            <div className="mt-6 flex justify-end gap-3">
              <button
                type="button"
                disabled={deleting}
                onClick={() => setComisionToDelete(null)}
                className="px-4 py-2 border border-outline text-primary rounded-lg font-label-md text-label-md hover:bg-surface-container transition-colors cursor-pointer disabled:opacity-50"
              >
                Cancelar
              </button>
              <button
                type="button"
                disabled={deleting}
                onClick={() => handleDeleteComision(comisionToDelete)}
                className="px-4 py-2 bg-error text-white rounded-lg font-label-md text-label-md hover:bg-error/90 active:scale-[0.98] transition-all cursor-pointer disabled:opacity-50 flex items-center gap-2"
              >
                {deleting ? (
                  <>
                    <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                    Eliminando...
                  </>
                ) : (
                  "Eliminar"
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
