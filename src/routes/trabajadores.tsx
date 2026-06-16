import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { 
  getTrabajadores, 
  insertTrabajador, 
  updateTrabajador,
  getReferenciadoresDestacados, 
  type DbTrabajador, 
  type ReferenciadorDestacado 
} from "../lib/api/workers";

export const Route = createFileRoute("/trabajadores")({
  head: () => ({
    meta: [
      { title: "OMVITAL - Trabajadores" },
      { name: "description", content: "Catálogo de trabajadores" },
    ],
  }),
  component: TrabajadoresPage,
});

function TrabajadoresPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<"create" | "edit" | "view">("create");
  const [selectedWorkerId, setSelectedWorkerId] = useState<string | null>(null);
  const [isFilterVisible, setIsFilterVisible] = useState(false);
  const [workers, setWorkers] = useState<DbTrabajador[]>([]);
  const [featuredReferrers, setFeaturedReferrers] = useState<ReferenciadorDestacado[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isFeaturedLoading, setIsFeaturedLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Filters State
  const [searchQuery, setSearchQuery] = useState("");
  const [filterRol, setFilterRol] = useState<"Todos" | "Interno" | "Médico Externo" | "Jaladora">("Todos");
  const [filterEstado, setFilterEstado] = useState<"Todos" | "Activo" | "Inactivo">("Todos");

  const [formData, setFormData] = useState({
    nombre: "",
    dni: "",
    rol: "Interno" as "Interno" | "Médico Externo" | "Jaladora",
    especialidad: "",
    comision_rate: 0,
    estado: "Activo" as "Activo" | "Inactivo",
  });

  const [errorMsg, setErrorMsg] = useState("");

  // Load data on mount
  useEffect(() => {
    async function loadData() {
      try {
        setIsLoading(true);
        setIsFeaturedLoading(true);
        
        const [workersData, featuredData] = await Promise.all([
          getTrabajadores(),
          getReferenciadoresDestacados()
        ]);
        
        setWorkers(workersData);
        setFeaturedReferrers(featuredData);
      } catch (err: any) {
        console.error("Error loading data:", err);
        setErrorMsg("No se pudieron cargar los datos de la base de datos.");
      } finally {
        setIsLoading(false);
        setIsFeaturedLoading(false);
      }
    }
    loadData();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === "comision_rate" ? parseFloat(value) || 0 : value,
    }));
  };

  const handleCreateClick = () => {
    setSelectedWorkerId(null);
    setFormData({
      nombre: "",
      dni: "",
      rol: "Interno",
      especialidad: "",
      comision_rate: 0,
      estado: "Activo",
    });
    setModalMode("create");
    setIsModalOpen(true);
    setErrorMsg("");
  };

  const handleEditClick = (worker: DbTrabajador) => {
    setSelectedWorkerId(worker.id);
    setFormData({
      nombre: worker.nombre,
      dni: worker.dni,
      rol: worker.rol,
      especialidad: worker.especialidad || "",
      comision_rate: worker.comision_rate,
      estado: worker.estado,
    });
    setModalMode("edit");
    setIsModalOpen(true);
    setErrorMsg("");
  };

  const handleViewClick = (worker: DbTrabajador) => {
    setSelectedWorkerId(worker.id);
    setFormData({
      nombre: worker.nombre,
      dni: worker.dni,
      rol: worker.rol,
      especialidad: worker.especialidad || "",
      comision_rate: worker.comision_rate,
      estado: worker.estado,
    });
    setModalMode("view");
    setIsModalOpen(true);
    setErrorMsg("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");

    if (modalMode === "view") {
      setIsModalOpen(false);
      return;
    }

    if (!formData.nombre || !formData.dni) {
      setErrorMsg("Nombre y DNI son campos obligatorios.");
      return;
    }

    // Client-side unique DNI check (excluding current editing worker)
    if (workers.some((w) => w.dni === formData.dni && w.id !== selectedWorkerId)) {
      setErrorMsg("Ya existe otro trabajador registrado con este DNI.");
      return;
    }

    try {
      setIsSubmitting(true);

      if (modalMode === "edit" && selectedWorkerId) {
        const updated = await updateTrabajador({
          data: {
            id: selectedWorkerId,
            nombre: formData.nombre,
            dni: formData.dni,
            rol: formData.rol,
            especialidad: formData.especialidad || null,
            comision_rate: formData.comision_rate,
            estado: formData.estado,
          },
        });

        setWorkers((prev) => prev.map((w) => (w.id === selectedWorkerId ? updated : w)));
      } else {
        const newWorker = await insertTrabajador({
          data: {
            nombre: formData.nombre,
            dni: formData.dni,
            rol: formData.rol,
            especialidad: formData.especialidad || null,
            comision_rate: formData.comision_rate,
            estado: formData.estado,
          },
        });

        setWorkers((prev) => [newWorker, ...prev]);
      }

      setIsModalOpen(false);
      // Reset form
      setFormData({
        nombre: "",
        dni: "",
        rol: "Interno",
        especialidad: "",
        comision_rate: 0,
        estado: "Activo",
      });

      // Reload featured referrers
      const updatedFeatured = await getReferenciadoresDestacados();
      setFeaturedReferrers(updatedFeatured);
    } catch (err: any) {
      console.error("Error saving worker:", err);
      setErrorMsg(err.message || "Error al guardar el trabajador en Supabase.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Export filtered workers list to a professional PDF report
  const handleExportPDF = () => {
    if (filteredWorkers.length === 0) return;

    const doc = new jsPDF({ orientation: "landscape", unit: "mm", format: "a4" });
    const pageW = doc.internal.pageSize.getWidth();
    const pageH = doc.internal.pageSize.getHeight();
    const now = new Date();
    const dateStr = now.toLocaleDateString("es-PE", { year: "numeric", month: "long", day: "numeric" });
    const timeStr = now.toLocaleTimeString("es-PE", { hour: "2-digit", minute: "2-digit" });

    // ── Background header bar ─────────────────────────────────────────────
    doc.setFillColor(30, 64, 175);
    doc.rect(0, 0, pageW, 32, "F");

    // Accent stripe
    doc.setFillColor(59, 130, 246);
    doc.rect(0, 32, pageW, 2, "F");

    // ── Title (sin logo) ──────────────────────────────────────────────────
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(20);
    doc.setFont("helvetica", "bold");
    doc.text("OMVITAL", 10, 14);
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.text("Reporte de Personal — Gestión de Trabajadores", 10, 22);

    // Date on the right
    doc.setFontSize(8);
    doc.setTextColor(219, 234, 254);
    doc.text(`Generado el ${dateStr}`, pageW - 10, 14, { align: "right" });
    doc.text(`a las ${timeStr}`, pageW - 10, 22, { align: "right" });

    // ── Summary cards ─────────────────────────────────────────────────────
    const totalPersonal = workers.length;
    const totalMedicos = workers.filter((w) => w.rol === "Médico Externo").length;
    const totalInternos = workers.filter((w) => w.rol === "Interno").length;
    const totalActivos = workers.filter((w) => w.estado === "Activo").length;
    const pctActivos = totalPersonal > 0 ? Math.round((totalActivos / totalPersonal) * 100) : 0;
    const totalJaladoras = workers.filter((w) => w.rol === "Jaladora").length;

    const cards = [
      { label: "Total Personal",   value: String(totalPersonal),  color: [30, 64, 175]  as [number,number,number] },
      { label: "Internos",         value: String(totalInternos),  color: [2, 132, 199]  as [number,number,number] },
      { label: "Médicos Externos", value: String(totalMedicos),   color: [5, 150, 105]  as [number,number,number] },
      { label: "Jaladoras",        value: String(totalJaladoras), color: [124, 58, 237] as [number,number,number] },
      { label: "Activos",          value: `${pctActivos}%`,       color: [217, 119, 6]  as [number,number,number] },
    ];

    const cardW = (pageW - 20) / 5 - 2.4;
    const cardStartY = 40;
    cards.forEach((card, i) => {
      const x = 10 + i * (cardW + 4);
      // Card background
      doc.setFillColor(248, 250, 252);
      doc.roundedRect(x, cardStartY, cardW, 18, 2, 2, "F");
      // Left accent bar
      doc.setFillColor(...card.color);
      doc.roundedRect(x, cardStartY, 3, 18, 1, 1, "F");
      // Value
      doc.setFontSize(14);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(...card.color);
      doc.text(card.value, x + cardW / 2 + 1.5, cardStartY + 9.5, { align: "center" });
      // Label
      doc.setFontSize(6.5);
      doc.setFont("helvetica", "normal");
      doc.setTextColor(100, 116, 139);
      doc.text(card.label.toUpperCase(), x + cardW / 2 + 1.5, cardStartY + 15, { align: "center" });
    });

    // ── Filter info line ──────────────────────────────────────────────────
    const tableStartY = cardStartY + 24;
    doc.setFontSize(8);
    doc.setFont("helvetica", "italic");
    doc.setTextColor(100, 116, 139);
    const filterLabel = [
      filterRol !== "Todos" ? `Rol: ${filterRol}` : "",
      filterEstado !== "Todos" ? `Estado: ${filterEstado}` : "",
      searchQuery ? `Búsqueda: "${searchQuery}"` : "",
    ].filter(Boolean).join(" · ");
    doc.text(
      filterLabel
        ? `Filtros aplicados — ${filterLabel} — ${filteredWorkers.length} de ${workers.length} registros`
        : `Mostrando todos los registros (${filteredWorkers.length})`,
      10,
      tableStartY - 3
    );

    // ── Main table ────────────────────────────────────────────────────────
    autoTable(doc, {
      startY: tableStartY,
      head: [["#", "Trabajador", "DNI / Documento", "Rol", "Especialidad", "Comisión", "Estado"]],
      body: filteredWorkers.map((w, idx) => [
        String(idx + 1),
        w.nombre,
        w.dni,
        w.rol,
        w.especialidad || "—",
        `${w.comision_rate}%`,
        w.estado,
      ]),
      headStyles: {
        fillColor: [30, 64, 175],
        textColor: [255, 255, 255],
        fontStyle: "bold",
        fontSize: 8.5,
        halign: "left",
        cellPadding: { top: 6, bottom: 6, left: 5, right: 5 },
      },
      alternateRowStyles: { fillColor: [248, 250, 252] },
      bodyStyles: { fontSize: 8.5, textColor: [30, 41, 59], cellPadding: { top: 6, bottom: 6, left: 5, right: 5 } },
      columnStyles: {
        0: { halign: "center", cellWidth: 8 },
        1: { fontStyle: "bold", cellWidth: 52 },
        2: { cellWidth: 30 },
        3: { cellWidth: 30 },
        4: { cellWidth: 40 },
        5: { halign: "center", cellWidth: 32 },
        6: { halign: "center", cellWidth: 22 },
      },
      didDrawCell: (data) => {
        // Color the Estado cell
        if (data.section === "body" && data.column.index === 6) {
          const estado = filteredWorkers[data.row.index]?.estado;
          if (estado === "Activo") {
            doc.setFillColor(220, 252, 231);
            doc.setTextColor(22, 101, 52);
          } else {
            doc.setFillColor(254, 226, 226);
            doc.setTextColor(153, 27, 27);
          }
          doc.roundedRect(
            data.cell.x + 2,
            data.cell.y + 2,
            data.cell.width - 4,
            data.cell.height - 4,
            1, 1, "F"
          );
          doc.setFontSize(7.5);
          doc.setFont("helvetica", "bold");
          doc.text(
            estado || "",
            data.cell.x + data.cell.width / 2,
            data.cell.y + data.cell.height / 2 + 0.8,
            { align: "center" }
          );
        }
      },
      margin: { left: 10, right: 10 },
      tableLineColor: [226, 232, 240],
      tableLineWidth: 0.1,
    });

    // ── Footer ────────────────────────────────────────────────────────────
    const totalPages = (doc as any).internal.getNumberOfPages();
    for (let i = 1; i <= totalPages; i++) {
      doc.setPage(i);
      doc.setFillColor(241, 245, 249);
      doc.rect(0, pageH - 10, pageW, 10, "F");
      doc.setFontSize(7);
      doc.setFont("helvetica", "normal");
      doc.setTextColor(148, 163, 184);
      doc.text("OMVITAL — Sistema de Gestión Integral · Documento generado automáticamente", 10, pageH - 3.5);
      doc.text(`Pág. ${i} / ${totalPages}`, pageW - 10, pageH - 3.5, { align: "right" });
    }

    doc.save(`reporte_trabajadores_omvital_${now.toISOString().split("T")[0]}.pdf`);
  };

  // Filter Logic
  const filteredWorkers = workers.filter((worker) => {
    const matchesRol = filterRol === "Todos" || worker.rol === filterRol;
    const matchesEstado = filterEstado === "Todos" || worker.estado === filterEstado;
    const matchesSearch =
      worker.nombre.toLowerCase().includes(searchQuery.toLowerCase()) ||
      worker.dni.includes(searchQuery) ||
      (worker.especialidad && worker.especialidad.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesRol && matchesEstado && matchesSearch;
  });

  return (
    <main className="ml-[260px] mt-[64px] p-stack_lg h-[calc(100vh-64px)] overflow-y-auto">
      {/* Header Section */}
      <div className="flex items-center justify-between mb-stack_lg">
        <div>
          <h2 className="font-headline-md text-headline-md">Gestión de Trabajadores</h2>
          <p className="text-on-surface-variant font-body-md">
            Catálogo de personal interno y referidores externos para trazabilidad de comisiones.
          </p>
        </div>
        <button
          className="bg-primary text-on-primary px-6 py-2.5 rounded-lg flex items-center font-label-md text-label-md hover:brightness-110 active:scale-95 transition-all shadow-sm cursor-pointer"
          onClick={handleCreateClick}
        >
          <span className="material-symbols-outlined mr-2">person_add</span>
          REGISTRAR TRABAJADOR
        </button>
      </div>

      <div className="grid grid-cols-12 gap-gutter">
        {/* Bento Grid - Stats */}
        <div className="col-span-12 md:col-span-4 border border-outline-variant rounded-xl p-stack_md bg-white flex items-center">
          <div className="w-12 h-12 rounded-full bg-primary-container/10 text-primary flex items-center justify-center mr-4">
            <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>
              groups
            </span>
          </div>
          <div>
            <p className="text-caption text-on-surface-variant uppercase tracking-wider font-semibold">Total Personal</p>
            <p className="font-headline-md text-headline-md">
              {isLoading ? "Cargando..." : workers.length}
            </p>
          </div>
        </div>
        <div className="col-span-12 md:col-span-4 border border-outline-variant rounded-xl p-stack_md bg-white flex items-center">
          <div className="w-12 h-12 rounded-full bg-secondary-container/20 text-secondary flex items-center justify-center mr-4">
            <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>
              medical_services
            </span>
          </div>
          <div>
            <p className="text-caption text-on-surface-variant uppercase tracking-wider font-semibold">Médicos Externos</p>
            <p className="font-headline-md text-headline-md">
              {isLoading ? "Cargando..." : workers.filter((w) => w.rol === "Médico Externo").length}
            </p>
          </div>
        </div>
        <div className="col-span-12 md:col-span-4 border border-outline-variant rounded-xl p-stack_md bg-white flex items-center">
          <div className="w-12 h-12 rounded-full bg-tertiary-container/10 text-tertiary flex items-center justify-center mr-4">
            <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>
              trending_up
            </span>
          </div>
          <div>
            <p className="text-caption text-on-surface-variant uppercase tracking-wider font-semibold">Activos</p>
            <p className="font-headline-md text-headline-md">
              {isLoading
                ? "Cargando..."
                : workers.length > 0
                ? `${Math.round((workers.filter((w) => w.estado === "Activo").length / workers.length) * 100)}%`
                : "0%"}
            </p>
          </div>
        </div>

        {/* Main Catalog Table */}
        <div className="col-span-12 border border-outline-variant rounded-xl bg-white overflow-hidden flex flex-col">
          <div className="px-6 py-4 bg-surface-container-low/50 border-b border-outline-variant flex justify-between items-center">
            <h3 className="font-title-lg text-title-lg">Listado de Referidores y Staff</h3>
            <div className="flex gap-2">
              <button
                onClick={() => setIsFilterVisible(!isFilterVisible)}
                className={`px-3 py-1.5 border rounded text-label-md flex items-center transition-colors cursor-pointer ${
                  isFilterVisible
                    ? "border-primary bg-primary/5 text-primary font-bold"
                    : "border-outline-variant bg-white text-on-surface-variant hover:bg-surface-container-low"
                }`}
              >
                <span className="material-symbols-outlined text-[18px] mr-1">filter_alt</span> Filtrar
              </button>
              <button 
                onClick={handleExportPDF}
                disabled={filteredWorkers.length === 0}
                className="px-3 py-1.5 border border-outline-variant rounded bg-white text-on-surface-variant text-label-md flex items-center hover:bg-surface-container-low cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <span className="material-symbols-outlined text-[18px] mr-1">picture_as_pdf</span> Exportar PDF
              </button>
            </div>
          </div>

          {/* Filter Panel */}
          {isFilterVisible && (
            <div className="p-4 bg-surface-container-low/40 border-b border-outline-variant grid grid-cols-1 md:grid-cols-3 gap-4 animate-in fade-in duration-200">
              <div>
                <label className="block font-label-md text-label-md text-on-surface-variant mb-1">
                  Buscar por Nombre / DNI / Especialidad
                </label>
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Escribe para buscar..."
                  className="w-full border border-outline-variant rounded p-2 focus:border-primary focus:ring-1 focus:ring-primary outline-none bg-white transition-all text-body-md"
                />
              </div>
              <div>
                <label className="block font-label-md text-label-md text-on-surface-variant mb-1">
                  Filtrar por Rol
                </label>
                <select
                  value={filterRol}
                  onChange={(e) => setFilterRol(e.target.value as any)}
                  className="w-full border border-outline-variant rounded p-2 focus:border-primary focus:ring-1 focus:ring-primary outline-none bg-white transition-all text-body-md font-body-md"
                >
                  <option value="Todos">Todos los roles</option>
                  <option value="Interno">Interno</option>
                  <option value="Médico Externo">Médico Externo</option>
                  <option value="Jaladora">Jaladora</option>
                </select>
              </div>
              <div>
                <label className="block font-label-md text-label-md text-on-surface-variant mb-1">
                  Filtrar por Estado
                </label>
                <select
                  value={filterEstado}
                  onChange={(e) => setFilterEstado(e.target.value as any)}
                  className="w-full border border-outline-variant rounded p-2 focus:border-primary focus:ring-1 focus:ring-primary outline-none bg-white transition-all text-body-md font-body-md"
                >
                  <option value="Todos">Todos los estados</option>
                  <option value="Activo">Activo</option>
                  <option value="Inactivo">Inactivo</option>
                </select>
              </div>
            </div>
          )}

          <div className="overflow-x-auto overflow-y-auto max-h-[450px]">
            <table className="w-full text-left border-collapse">
              <thead className="bg-[#F8FAFB]">
                <tr>
                  <th className="px-6 py-3 font-label-md text-label-md text-on-surface-variant">TRABAJADOR</th>
                  <th className="px-6 py-3 font-label-md text-label-md text-on-surface-variant">DNI / ID</th>
                  <th className="px-6 py-3 font-label-md text-label-md text-on-surface-variant">ROL</th>
                  <th className="px-6 py-3 font-label-md text-label-md text-on-surface-variant text-center">TASA COMISIÓN</th>
                  <th className="px-6 py-3 font-label-md text-label-md text-on-surface-variant">ESTADO</th>
                  <th className="px-6 py-3 font-label-md text-label-md text-on-surface-variant text-right">ACCIONES</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-outline-variant">
                {isLoading ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center text-on-surface-variant text-body-md">
                      <div className="flex items-center justify-center gap-2">
                        <span className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin"></span>
                        Cargando trabajadores...
                      </div>
                    </td>
                  </tr>
                ) : filteredWorkers.map((worker) => (
                  <tr key={worker.id || worker.dni} className="hover:bg-[#F4F6F8] transition-colors group">
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        <div className="w-10 h-10 rounded-full bg-primary-fixed text-primary flex items-center justify-center font-bold mr-3">
                          {worker.nombre.split(" ").map(n => n[0]).join("").substring(0, 2).toUpperCase()}
                        </div>
                        <div>
                          <p className="font-label-md text-label-md font-bold">{worker.nombre}</p>
                          <p className="text-caption text-on-surface-variant">{worker.especialidad || "-"}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 font-body-md text-body-md">{worker.dni}</td>
                    <td className="px-6 py-4">
                      <span className={`text-caption px-2 py-1 rounded font-medium ${
                        worker.rol === "Interno" 
                          ? "bg-surface-container-highest text-on-surface-variant" 
                          : worker.rol === "Médico Externo"
                          ? "bg-secondary-container text-on-secondary-container"
                          : "bg-tertiary-fixed text-on-tertiary-fixed-variant"
                      }`}>
                        {worker.rol}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <p className="font-label-md text-label-md text-primary">{worker.comision_rate}%</p>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        worker.estado === "Activo" 
                          ? "bg-green-100 text-green-800" 
                          : "bg-error-container text-on-error-container"
                      }`}>
                        <span className={`w-1.5 h-1.5 rounded-full mr-1.5 ${
                          worker.estado === "Activo" ? "bg-green-500" : "bg-error"
                        }`}></span>
                        {worker.estado}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button 
                        onClick={() => handleEditClick(worker)}
                        className="text-on-surface-variant hover:text-primary transition-colors p-1 cursor-pointer"
                      >
                        <span className="material-symbols-outlined">edit</span>
                      </button>
                      <button 
                        onClick={() => handleViewClick(worker)}
                        className="text-on-surface-variant hover:text-primary transition-colors p-1 cursor-pointer"
                      >
                        <span className="material-symbols-outlined">visibility</span>
                      </button>
                    </td>
                  </tr>
                ))}
                {!isLoading && filteredWorkers.length === 0 && (
                  <tr>
                    <td colSpan={6} className="px-6 py-8 text-center text-on-surface-variant text-body-md">
                      No se encontraron trabajadores que coincidan con los filtros aplicados.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          <div className="px-6 py-4 border-t border-outline-variant flex items-center justify-between bg-surface-container-low/30">
            <p className="text-caption text-on-surface-variant">
              Mostrando {filteredWorkers.length} de {workers.length} registros
            </p>
          </div>
        </div>

        {/* Traceability Insight Card */}
        <div className="col-span-12 rounded-2xl overflow-hidden" style={{ background: "linear-gradient(135deg, #0f172a 0%, #1e1b4b 50%, #0f172a 100%)" }}>
          {/* Header */}
          <div className="px-6 pt-6 pb-4 flex items-start justify-between">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <h4 className="font-title-lg text-white">Referenciadores Destacados</h4>
              </div>
              <p className="text-[11px] text-slate-400">Trabajadores con mayor volumen de pacientes referidos · últimos 30 días</p>
            </div>
            <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: "rgba(255,255,255,0.08)" }}>
              <span className="material-symbols-outlined text-indigo-300 text-[22px]" style={{ fontVariationSettings: "'FILL' 1" }}>insights</span>
            </div>
          </div>

          <div className="px-6 pb-6">
          {isFeaturedLoading ? (
            <div className="py-10 text-center text-slate-400 text-body-md">
              <span className="w-6 h-6 border-2 border-indigo-400 border-t-transparent rounded-full animate-spin inline-block mr-2 align-middle"></span>
              Cargando referenciadores...
            </div>
          ) : featuredReferrers.length === 0 ? (
            <div className="py-8 flex flex-col items-center gap-3 text-center">
              <div className="w-14 h-14 rounded-2xl flex items-center justify-center" style={{ background: "rgba(99,102,241,0.15)" }}>
                <span className="material-symbols-outlined text-indigo-400 text-[28px]" style={{ fontVariationSettings: "'FILL' 0" }}>hub</span>
              </div>
              <p className="text-white font-semibold text-sm">Sin referenciadores activos este mes</p>
              <p className="text-slate-400 text-xs max-w-sm">
                Aquí aparecerán los trabajadores con más pacientes referidos cuando los pacientes tengan el campo <code className="text-indigo-300 font-mono">referido_por_id</code> asignado.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {featuredReferrers.map((ref, idx) => {
                const themes = [
                  {
                    medal: "🥇",
                    cardGrad: "linear-gradient(135deg, #1d4ed8 0%, #4f46e5 100%)",
                    glow: "0 0 24px rgba(99,102,241,0.4)",
                    barGrad: "linear-gradient(90deg, #818cf8, #c7d2fe)",
                    badgeBg: "rgba(255,255,255,0.15)",
                    countColor: "#e0e7ff",
                    labelColor: "#a5b4fc",
                    rankBg: "rgba(255,215,0,0.2)",
                    rankColor: "#fde047",
                  },
                  {
                    medal: "🥈",
                    cardGrad: "linear-gradient(135deg, #6d28d9 0%, #a855f7 100%)",
                    glow: "0 0 24px rgba(168,85,247,0.35)",
                    barGrad: "linear-gradient(90deg, #d8b4fe, #f3e8ff)",
                    badgeBg: "rgba(255,255,255,0.15)",
                    countColor: "#f3e8ff",
                    labelColor: "#d8b4fe",
                    rankBg: "rgba(200,200,220,0.2)",
                    rankColor: "#e2e8f0",
                  },
                  {
                    medal: "🥉",
                    cardGrad: "linear-gradient(135deg, #065f46 0%, #059669 100%)",
                    glow: "0 0 24px rgba(5,150,105,0.35)",
                    barGrad: "linear-gradient(90deg, #6ee7b7, #d1fae5)",
                    badgeBg: "rgba(255,255,255,0.15)",
                    countColor: "#d1fae5",
                    labelColor: "#6ee7b7",
                    rankBg: "rgba(180,120,60,0.2)",
                    rankColor: "#fbbf24",
                  },
                ];
                const theme = themes[idx] || themes[2];
                const maxCount = featuredReferrers[0].pacientesCount || 1;
                const widthPercent = `${(ref.pacientesCount / maxCount) * 100}%`;
                const initials = ref.nombre.split(" ").map((n) => n[0]).join("").substring(0, 2).toUpperCase();

                return (
                  <div
                    key={ref.id}
                    className="rounded-xl p-5 relative overflow-hidden flex flex-col gap-4"
                    style={{ background: theme.cardGrad, boxShadow: theme.glow }}
                  >
                    {/* Decorative blob */}
                    <div className="absolute -top-6 -right-6 w-24 h-24 rounded-full opacity-10" style={{ background: "white" }}></div>

                    {/* Medal + rank */}
                    <div className="flex items-center justify-between">
                      <span className="text-2xl">{theme.medal}</span>
                      <span
                        className="text-[10px] font-bold px-2 py-0.5 rounded-full"
                        style={{ background: theme.rankBg, color: theme.rankColor }}
                      >
                        #{idx + 1} RANKING
                      </span>
                    </div>

                    {/* Avatar + name */}
                    <div className="flex items-center gap-3">
                      <div
                        className="w-12 h-12 rounded-full flex items-center justify-center font-black text-white text-base flex-shrink-0 shadow-lg"
                        style={{ background: theme.badgeBg, border: "2px solid rgba(255,255,255,0.3)" }}
                      >
                        {initials}
                      </div>
                      <div className="min-w-0">
                        <p className="font-bold text-white text-sm truncate leading-tight">{ref.nombre}</p>
                        <span className="text-[10px] font-medium px-1.5 py-0.5 rounded mt-0.5 inline-block" style={{ background: "rgba(255,255,255,0.15)", color: theme.labelColor }}>
                          {ref.rol}
                        </span>
                      </div>
                    </div>

                    {/* Count */}
                    <div>
                      <div className="flex items-end justify-between mb-2">
                        <span className="text-[10px] font-medium" style={{ color: theme.labelColor }}>PACIENTES REFERIDOS</span>
                        <span className="font-black text-3xl leading-none" style={{ color: theme.countColor }}>{ref.pacientesCount}</span>
                      </div>
                      {/* Animated bar */}
                      <div className="w-full h-2.5 rounded-full overflow-hidden" style={{ background: "rgba(0,0,0,0.25)" }}>
                        <div
                          className="h-full rounded-full transition-all duration-1000"
                          style={{ width: widthPercent, background: theme.barGrad }}
                        ></div>
                      </div>
                    </div>

                    {ref.especialidad && (
                      <p className="text-[10px] truncate" style={{ color: theme.labelColor }}>📋 {ref.especialidad}</p>
                    )}
                  </div>
                );
              })}
            </div>
          )}
          </div>
        </div>
      </div>

      {/* Floating Modal for Registering/Editing/Viewing Worker */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/55 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-lg w-full border border-outline-variant p-6 relative animate-in fade-in zoom-in-95 duration-200">
            <button
              onClick={() => {
                setIsModalOpen(false);
                setErrorMsg("");
              }}
              className="absolute top-4 right-4 text-on-surface-variant hover:text-primary transition-colors cursor-pointer"
            >
              <span className="material-symbols-outlined text-[24px]">close</span>
            </button>

            <h3 className="font-headline-sm text-headline-sm text-primary mb-4 flex items-center gap-2">
              <span className="material-symbols-outlined">
                {modalMode === "view" ? "visibility" : modalMode === "edit" ? "edit" : "person_add"}
              </span>
              {modalMode === "view" 
                ? "Detalles del Trabajador" 
                : modalMode === "edit" 
                ? "Editar Trabajador" 
                : "Registrar Trabajador"}
            </h3>

            {errorMsg && (
              <div className="mb-4 p-3 bg-error-container text-on-error-container rounded-lg text-body-md">
                {errorMsg}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block font-label-md text-label-md text-on-surface-variant mb-1">
                  Nombre Completo *
                </label>
                <input
                  type="text"
                  name="nombre"
                  value={formData.nombre}
                  onChange={handleChange}
                  placeholder="Ej. Juan Carlos Pérez"
                  className="w-full border border-outline-variant rounded p-2 focus:border-primary focus:ring-1 focus:ring-primary outline-none bg-white transition-all text-body-md font-body-md disabled:bg-surface-container-low disabled:text-on-surface-variant"
                  required
                  disabled={isSubmitting || modalMode === "view"}
                />
              </div>

              <div>
                <label className="block font-label-md text-label-md text-on-surface-variant mb-1">
                  DNI / Documento de Identidad *
                </label>
                <input
                  type="text"
                  name="dni"
                  value={formData.dni}
                  onChange={handleChange}
                  placeholder="DNI del trabajador"
                  className="w-full border border-outline-variant rounded p-2 focus:border-primary focus:ring-1 focus:ring-primary outline-none bg-white transition-all text-body-md font-body-md disabled:bg-surface-container-low disabled:text-on-surface-variant"
                  required
                  disabled={isSubmitting || modalMode === "view"}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block font-label-md text-label-md text-on-surface-variant mb-1">
                    Rol *
                  </label>
                  <select
                    name="rol"
                    value={formData.rol}
                    onChange={handleChange}
                    className="w-full border border-outline-variant rounded p-2 focus:border-primary focus:ring-1 focus:ring-primary outline-none bg-white transition-all text-body-md font-body-md disabled:bg-surface-container-low disabled:text-on-surface-variant"
                    disabled={isSubmitting || modalMode === "view"}
                  >
                    <option value="Interno">Interno</option>
                    <option value="Médico Externo">Médico Externo</option>
                    <option value="Jaladora">Jaladora</option>
                  </select>
                </div>

                <div>
                  <label className="block font-label-md text-label-md text-on-surface-variant mb-1">
                    Estado
                  </label>
                  <select
                    name="estado"
                    value={formData.estado}
                    onChange={handleChange}
                    className="w-full border border-outline-variant rounded p-2 focus:border-primary focus:ring-1 focus:ring-primary outline-none bg-white transition-all text-body-md font-body-md disabled:bg-surface-container-low disabled:text-on-surface-variant"
                    disabled={isSubmitting || modalMode === "view"}
                  >
                    <option value="Activo">Activo</option>
                    <option value="Inactivo">Inactivo</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-label-md text-label-md text-on-surface-variant mb-1">
                  Especialidad / Descripción
                </label>
                <input
                  type="text"
                  name="especialidad"
                  value={formData.especialidad}
                  onChange={handleChange}
                  placeholder="Ej. Rehabilitación Física, Traumatología"
                  className="w-full border border-outline-variant rounded p-2 focus:border-primary focus:ring-1 focus:ring-primary outline-none bg-white transition-all text-body-md font-body-md disabled:bg-surface-container-low disabled:text-on-surface-variant"
                  disabled={isSubmitting || modalMode === "view"}
                />
              </div>

              <div>
                <label className="block font-label-md text-label-md text-on-surface-variant mb-1">
                  Tasa de Comisión (%)
                </label>
                <input
                  type="number"
                  name="comision_rate"
                  value={formData.comision_rate}
                  onChange={handleChange}
                  placeholder="0.00"
                  step="0.01"
                  min="0"
                  max="100"
                  className="w-full border border-outline-variant rounded p-2 focus:border-primary focus:ring-1 focus:ring-primary outline-none bg-white transition-all text-body-md font-body-md disabled:bg-surface-container-low disabled:text-on-surface-variant"
                  disabled={isSubmitting || modalMode === "view"}
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                {modalMode !== "view" ? (
                  <>
                    <button
                      type="button"
                      onClick={() => {
                        setIsModalOpen(false);
                        setErrorMsg("");
                      }}
                      className="px-4 py-2 border border-outline-variant rounded-lg text-on-surface-variant hover:bg-surface-container-low transition-colors text-label-md cursor-pointer"
                      disabled={isSubmitting}
                    >
                      Cancelar
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-2 bg-primary text-on-primary rounded-lg hover:brightness-110 active:scale-95 transition-all text-label-md shadow-sm cursor-pointer flex items-center gap-2"
                      disabled={isSubmitting}
                    >
                      {isSubmitting && (
                        <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                      )}
                      {modalMode === "edit" ? "Guardar Cambios" : "Guardar Trabajador"}
                    </button>
                  </>
                ) : (
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="px-4 py-2 bg-primary text-on-primary rounded-lg hover:brightness-110 active:scale-95 transition-all text-label-md shadow-sm cursor-pointer"
                  >
                    Cerrar
                  </button>
                )}
              </div>
            </form>
          </div>
        </div>
      )}
    </main>
  );
}
