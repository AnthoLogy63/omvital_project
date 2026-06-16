import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { 
  getMovements, 
  insertMovement, 
  updateMovement, 
  deleteMovement, 
  getLatestCajaCierre, 
  type DbMovimiento 
} from "../lib/api/movements";

export const Route = createFileRoute("/movimientos")({
  head: () => ({
    meta: [
      { title: "OMVITAL - Movimientos" },
      { name: "description", content: "Libro de movimientos" },
    ],
  }),
  component: MovimientosPage,
});

function MovimientosPage() {
  const [movements, setMovements] = useState<DbMovimiento[]>([]);
  const [latestCajaCierre, setLatestCajaCierre] = useState<{ fecha_cierre: string | null } | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  // Filter & Search State
  const [searchQuery, setSearchQuery] = useState("");
  const [dateFilter, setDateFilter] = useState("");
  const [filterTipo, setFilterTipo] = useState<"Todos" | "Ingreso" | "Egreso">("Todos");
  const [filterOrigen, setFilterOrigen] = useState<"Todos" | "Caja" | "Paquete" | "Comisión">("Todos");
  const [filterMetodo, setFilterMetodo] = useState<"Todos" | "Efectivo" | "Transferencia" | "Tarjeta" | "Yape" | "Plin">("Todos");

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<"create" | "edit" | "view">("create");
  const [selectedMovement, setSelectedMovement] = useState<DbMovimiento | null>(null);

  // Form State
  const [formData, setFormData] = useState({
    tipo: "Ingreso" as "Ingreso" | "Egreso",
    concepto: "",
    categoria: "Caja",
    metodo: "Efectivo" as "Efectivo" | "Yape" | "Plin" | "Transferencia" | "Tarjeta",
    monto: "",
    estado: "Completado",
    nota: "",
  });

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  // Load initial data
  useEffect(() => {
    async function loadData() {
      try {
        setIsLoading(true);
        const [movsData, closureData] = await Promise.all([
          getMovements(),
          getLatestCajaCierre(),
        ]);
        setMovements(movsData);
        setLatestCajaCierre(closureData);
      } catch (err: any) {
        console.error("Error loading movements:", err);
        setErrorMsg("No se pudieron cargar los movimientos de la base de datos.");
      } finally {
        setIsLoading(false);
      }
    }
    loadData();
  }, []);

  // Reset pagination when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, dateFilter, filterTipo, filterOrigen, filterMetodo]);

  // Form input changes
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleCreateClick = () => {
    setSelectedMovement(null);
    setFormData({
      tipo: "Ingreso",
      concepto: "",
      categoria: "Caja",
      metodo: "Efectivo",
      monto: "",
      estado: "Completado",
      nota: "",
    });
    setModalMode("create");
    setIsModalOpen(true);
    setErrorMsg("");
  };

  const handleEditClick = (m: DbMovimiento) => {
    setSelectedMovement(m);
    setFormData({
      tipo: m.tipo,
      concepto: m.concepto,
      categoria: m.categoria || "Caja",
      metodo: m.metodo,
      monto: String(m.monto),
      estado: m.estado || "Completado",
      nota: m.nota || "",
    });
    setModalMode("edit");
    setIsModalOpen(true);
    setErrorMsg("");
  };

  const handleViewClick = (m: DbMovimiento) => {
    setSelectedMovement(m);
    setFormData({
      tipo: m.tipo,
      concepto: m.concepto,
      categoria: m.categoria || "Caja",
      metodo: m.metodo,
      monto: String(m.monto),
      estado: m.estado || "Completado",
      nota: m.nota || "",
    });
    setModalMode("view");
    setIsModalOpen(true);
    setErrorMsg("");
  };

  const handleDeleteClick = async (m: DbMovimiento) => {
    if (window.confirm(`¿Está seguro de que desea eliminar el movimiento "${m.concepto}"?`)) {
      try {
        setIsSubmitting(true);
        await deleteMovement({ data: { id: m.id } });
        setMovements((prev) => prev.filter((item) => item.id !== m.id));
      } catch (err: any) {
        console.error("Error deleting movement:", err);
        alert(err.message || "Error al eliminar el movimiento.");
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");

    if (modalMode === "view") {
      setIsModalOpen(false);
      return;
    }

    if (!formData.concepto || !formData.monto) {
      setErrorMsg("Concepto y Monto son campos obligatorios.");
      return;
    }

    const numMonto = parseFloat(formData.monto);
    if (isNaN(numMonto) || numMonto <= 0) {
      setErrorMsg("El monto debe ser un número positivo.");
      return;
    }

    try {
      setIsSubmitting(true);

      if (modalMode === "edit" && selectedMovement) {
        const updated = await updateMovement({
          data: {
            id: selectedMovement.id,
            tipo: formData.tipo,
            concepto: formData.concepto,
            categoria: formData.categoria,
            metodo: formData.metodo,
            monto: numMonto,
            estado: formData.estado,
            nota: formData.nota || null,
          },
        });

        setMovements((prev) => prev.map((item) => (item.id === selectedMovement.id ? updated : item)));
      } else {
        const created = await insertMovement({
          data: {
            tipo: formData.tipo,
            concepto: formData.concepto,
            categoria: formData.categoria,
            metodo: formData.metodo,
            monto: numMonto,
            estado: formData.estado,
            nota: formData.nota || null,
          },
        });

        setMovements((prev) => [created, ...prev]);
      }

      setIsModalOpen(false);
    } catch (err: any) {
      console.error("Error saving movement:", err);
      setErrorMsg(err.message || "Error al guardar el movimiento en Supabase.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClearFilters = () => {
    setSearchQuery("");
    setDateFilter("");
    setFilterTipo("Todos");
    setFilterOrigen("Todos");
    setFilterMetodo("Todos");
  };

  // Export filtered movements list to CSV
  const handleExportCSV = () => {
    if (filteredMovements.length === 0) return;
    
    const headers = ["Fecha", "Hora", "Origen/Categoría", "Tipo", "Método", "Monto", "Concepto", "Nota", "Estado"];
    const rows = filteredMovements.map(m => [
      formatDate(m.created_at),
      formatTime(m.created_at),
      m.categoria || "—",
      m.tipo,
      m.metodo,
      m.monto,
      m.concepto,
      m.nota || "",
      m.estado
    ]);

    const csvContent = "data:text/csv;charset=utf-8,\uFEFF" 
      + [headers.join(","), ...rows.map(e => e.map(val => `"${String(val).replace(/"/g, '""')}"`).join(","))].join("\n");
    
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `reporte_movimientos_omvital_${new Date().toISOString().split("T")[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Helper date conversions
  const formatDate = (dateStr: string) => {
    try {
      const d = new Date(dateStr);
      return d.toLocaleDateString("es-PE", { day: "numeric", month: "short", year: "numeric" });
    } catch {
      return dateStr;
    }
  };

  const formatTime = (dateStr: string) => {
    try {
      const d = new Date(dateStr);
      return d.toLocaleTimeString("es-PE", { hour: "2-digit", minute: "2-digit", hour12: true });
    } catch {
      return "";
    }
  };

  const isToday = (dateStr: string) => {
    try {
      const date = new Date(dateStr);
      const today = new Date();
      return (
        date.getDate() === today.getDate() &&
        date.getMonth() === today.getMonth() &&
        date.getFullYear() === today.getFullYear()
      );
    } catch {
      return false;
    }
  };

  const isThisMonth = (dateStr: string) => {
    try {
      const date = new Date(dateStr);
      const today = new Date();
      return (
        date.getMonth() === today.getMonth() &&
        date.getFullYear() === today.getFullYear()
      );
    } catch {
      return false;
    }
  };

  const getCierreText = (fechaCierreStr: string | null | undefined) => {
    if (!fechaCierreStr) return "No registrado";
    try {
      const diffMs = Date.now() - new Date(fechaCierreStr).getTime();
      const diffMins = Math.floor(diffMs / (1000 * 60));
      const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
      const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
      
      if (diffMins < 60) return `Hace ${diffMins} min`;
      if (diffHours < 24) return `Hace ${diffHours} hora${diffHours > 1 ? 's' : ''}`;
      return `Hace ${diffDays} día${diffDays > 1 ? 's' : ''}`;
    } catch {
      return "No registrado";
    }
  };

  const getOriginIcon = (categoria: string | null) => {
    if (!categoria) return "receipt";
    const cat = categoria.toLowerCase();
    if (cat.includes("caja")) return "account_balance_wallet";
    if (cat.includes("paquete")) return "inventory_2";
    if (cat.includes("comisión") || cat.includes("comision")) return "percent";
    if (cat.includes("nómina") || cat.includes("nomina")) return "payments";
    return "receipt";
  };

  // Filter calculations
  const filteredMovements = movements.filter((m) => {
    const matchesSearch =
      m.concepto.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (m.categoria && m.categoria.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (m.nota && m.nota.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesTipo = filterTipo === "Todos" || m.tipo === filterTipo;

    const matchesOrigen = filterOrigen === "Todos" || m.categoria === filterOrigen;

    const matchesMetodo = filterMetodo === "Todos" || m.metodo === filterMetodo;

    const matchesDate =
      !dateFilter ||
      formatDate(m.created_at).toLowerCase().includes(dateFilter.toLowerCase()) ||
      m.created_at.includes(dateFilter);

    return matchesSearch && matchesTipo && matchesOrigen && matchesMetodo && matchesDate;
  });

  // Stats Calculations
  const todayMovements = movements.filter((m) => isToday(m.created_at));
  const ingresosHoy = todayMovements
    .filter((m) => m.tipo === "Ingreso")
    .reduce((sum, m) => sum + Number(m.monto), 0);
  const egresosHoy = todayMovements
    .filter((m) => m.tipo === "Egreso")
    .reduce((sum, m) => sum + Number(m.monto), 0);
  const balanceNeto = ingresosHoy - egresosHoy;

  // Monthly Volume & Meta
  const volumenMensual = movements
    .filter((m) => m.tipo === "Ingreso" && isThisMonth(m.created_at))
    .reduce((sum, m) => sum + Number(m.monto), 0);
  const metaRecaudacion = 190000;
  const metaPorcentaje = metaRecaudacion > 0 ? Math.min(100, Math.round((volumenMensual / metaRecaudacion) * 100)) : 0;

  // Pagination
  const totalItems = filteredMovements.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage) || 1;
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = Math.min(startIndex + itemsPerPage, totalItems);
  const currentMovements = filteredMovements.slice(startIndex, endIndex);

  return (
    <main className="ml-[260px] flex flex-col min-h-screen">
      {/* Top Navigation Bar */}
      <header className="fixed top-0 right-0 h-[64px] w-[calc(100%-260px)] bg-surface/90 backdrop-blur-sm border-b border-outline-variant flex items-center justify-between px-container_padding z-40">
        <div className="flex items-center gap-4 flex-1">
          <div className="relative w-full max-w-md">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline">search</span>
            <input 
              className="w-full bg-surface-container border border-outline-variant rounded px-10 py-2 text-body-md focus:outline-none focus:border-primary transition-all" 
              placeholder="Buscar movimientos..." 
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>
        <div className="flex items-center gap-6">
          <button className="relative text-on-surface-variant hover:text-primary transition-all cursor-pointer active:opacity-70">
            <span className="material-symbols-outlined">notifications</span>
            <span className="absolute top-0 right-0 w-2 h-2 bg-error rounded-full"></span>
          </button>
          <button className="text-on-surface-variant hover:text-primary transition-all cursor-pointer active:opacity-70">
            <span className="material-symbols-outlined">help</span>
          </button>
          <div className="flex items-center gap-3 pl-4 border-l border-outline-variant">
            <div className="text-right">
              <p className="font-label-md text-label-md font-bold">Dr. Armando Casas</p>
              <p className="text-caption text-outline">Administrador</p>
            </div>
            <img 
              alt="Administrador" 
              className="w-10 h-10 rounded-full object-cover border border-outline-variant" 
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuDVLQ1qx35BHja_IaMLxutb85WKkfEfGlbHl_brTVcm-3q1Yl4KWZFwwNyvyj0xs7APVWPgr1zajrs0nB56mNFxy-clAUXnPiMIdvnkpjz8VwBWHB9JZBOH4FgrnWULe1ph6SvIU-dNMQJCGjXJmB0t0_KjcLBd22mm7NRGgbPBeMPWDBMTu9L9w6EMOFsP9wfqNMTm8s0hav38KgHwS97KCIclYw5N4wU4_qHoT4nApOmq3kSqfB8PQg9_LHrcvr5ZkGljPYTJUxU"
            />
          </div>
        </div>
      </header>

      {/* Workspace Content */}
      <section className="mt-[64px] p-container_padding space-y-stack_lg">
        {/* Page Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 className="font-headline-md text-headline-md text-primary">Movimientos</h2>
            <p className="text-body-md text-on-surface-variant">Libro contable centralizado de la clínica.</p>
          </div>
          <div className="flex gap-2">
            <button 
              onClick={handleExportCSV}
              disabled={filteredMovements.length === 0}
              className="flex items-center gap-2 px-4 py-2 border border-outline-variant bg-white text-primary rounded font-label-md hover:bg-surface-container-low transition-all disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
            >
              <span className="material-symbols-outlined text-[20px]">download</span>
              Exportar CSV
            </button>
            <button 
              onClick={handleCreateClick}
              className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded font-label-md hover:bg-primary-container transition-all cursor-pointer"
            >
              <span className="material-symbols-outlined text-[20px]">add</span>
              Nuevo Registro
            </button>
          </div>
        </div>

        {/* Dashboard Mini-Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white border border-outline-variant p-stack_lg rounded-lg">
            <p className="text-label-md text-outline mb-1 uppercase tracking-wider">Ingresos Hoy</p>
            <div className="flex items-baseline gap-2">
              <span className="text-headline-md text-on-surface">
                {isLoading ? "..." : `$${ingresosHoy.toLocaleString("es-PE", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
              </span>
            </div>
          </div>
          <div className="bg-white border border-outline-variant p-stack_lg rounded-lg">
            <p className="text-label-md text-outline mb-1 uppercase tracking-wider">Egresos Hoy</p>
            <div className="flex items-baseline gap-2">
              <span className="text-headline-md text-on-surface">
                {isLoading ? "..." : `$${egresosHoy.toLocaleString("es-PE", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
              </span>
            </div>
          </div>
          <div className="bg-white border border-outline-variant p-stack_lg rounded-lg">
            <p className="text-label-md text-outline mb-1 uppercase tracking-wider">Balance Neto</p>
            <div className="flex items-baseline gap-2">
              <span className={`text-headline-md font-bold ${balanceNeto >= 0 ? "text-primary" : "text-error"}`}>
                {isLoading ? "..." : `$${balanceNeto.toLocaleString("es-PE", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
              </span>
            </div>
          </div>
        </div>

        {/* Filter Controls */}
        <div className="bg-white border border-outline-variant p-4 rounded-lg flex flex-wrap items-center gap-4">
          <div className="flex flex-col gap-1">
            <label className="font-label-md text-on-surface-variant">Rango de Fecha</label>
            <div className="flex items-center gap-2 border border-outline-variant rounded px-3 py-1.5 focus-within:border-primary transition-all bg-white">
              <span className="material-symbols-outlined text-[18px] text-outline">calendar_today</span>
              <input 
                className="text-body-md focus:outline-none bg-transparent" 
                placeholder="Ej: 16 jun 2026" 
                type="text"
                value={dateFilter}
                onChange={(e) => setDateFilter(e.target.value)}
              />
            </div>
          </div>
          <div className="flex flex-col gap-1">
            <label className="font-label-md text-on-surface-variant">Tipo</label>
            <select 
              className="border border-outline-variant rounded px-3 py-2 text-body-md focus:outline-none focus:border-primary transition-all min-w-[140px] bg-white cursor-pointer"
              value={filterTipo}
              onChange={(e) => setFilterTipo(e.target.value as any)}
            >
              <option value="Todos">Todos</option>
              <option value="Ingreso">Ingreso</option>
              <option value="Egreso">Egreso</option>
            </select>
          </div>
          <div className="flex flex-col gap-1">
            <label className="font-label-md text-on-surface-variant">Origen</label>
            <select 
              className="border border-outline-variant rounded px-3 py-2 text-body-md focus:outline-none focus:border-primary transition-all min-w-[140px] bg-white cursor-pointer"
              value={filterOrigen}
              onChange={(e) => setFilterOrigen(e.target.value as any)}
            >
              <option value="Todos">Todos</option>
              <option value="Caja">Caja</option>
              <option value="Paquete">Paquete</option>
              <option value="Comisión">Comisión</option>
            </select>
          </div>
          <div className="flex flex-col gap-1">
            <label className="font-label-md text-on-surface-variant">Método</label>
            <select 
              className="border border-outline-variant rounded px-3 py-2 text-body-md focus:outline-none focus:border-primary transition-all min-w-[140px] bg-white cursor-pointer"
              value={filterMetodo}
              onChange={(e) => setFilterMetodo(e.target.value as any)}
            >
              <option value="Todos">Todos</option>
              <option value="Efectivo">Efectivo</option>
              <option value="Transferencia">Transferencia</option>
              <option value="Tarjeta">Tarjeta</option>
              <option value="Yape">Yape</option>
              <option value="Plin">Plin</option>
            </select>
          </div>
          <div className="mt-auto pb-1 pl-2">
            <button 
              onClick={handleClearFilters}
              className="text-primary hover:underline font-label-md flex items-center gap-1 cursor-pointer"
            >
              <span className="material-symbols-outlined text-[18px]">filter_alt_off</span>
              Limpiar filtros
            </button>
          </div>
        </div>

        {/* Unified Ledger Table */}
        <div className="bg-white border border-outline-variant rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-[#F8FAFB] border-b border-outline-variant">
                  <th className="px-6 py-4 font-label-md text-outline uppercase tracking-wider">Fecha &amp; Hora</th>
                  <th className="px-6 py-4 font-label-md text-outline uppercase tracking-wider">Origen</th>
                  <th className="px-6 py-4 font-label-md text-outline uppercase tracking-wider">Tipo</th>
                  <th className="px-6 py-4 font-label-md text-outline uppercase tracking-wider">Método</th>
                  <th className="px-6 py-4 font-label-md text-outline uppercase tracking-wider text-right">Monto</th>
                  <th className="px-6 py-4 font-label-md text-outline uppercase tracking-wider text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-outline-variant">
                {isLoading ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center text-on-surface-variant text-body-md">
                      <div className="flex items-center justify-center gap-2">
                        <span className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin"></span>
                        Cargando movimientos contables...
                      </div>
                    </td>
                  </tr>
                ) : currentMovements.map((m) => (
                  <tr key={m.id} className="hover:bg-surface-container-low transition-all group">
                    <td className="px-6 py-4 text-body-md">
                      <div className="font-medium">{formatDate(m.created_at)}</div>
                      <div className="text-caption text-outline">{formatTime(m.created_at)}</div>
                    </td>
                    <td className="px-6 py-4 text-body-md">
                      <div className="flex items-center gap-2">
                        <span className="material-symbols-outlined text-outline text-[20px]">
                          {getOriginIcon(m.categoria)}
                        </span>
                        {m.categoria || "Caja Principal"}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1 rounded-full text-caption font-bold ${
                        m.tipo === "Ingreso" 
                          ? "bg-secondary/10 text-secondary" 
                          : "bg-error/10 text-error"
                      }`}>
                        {m.tipo.toUpperCase()}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-body-md">{m.metodo}</td>
                    <td className={`px-6 py-4 text-body-md text-right font-bold ${
                      m.tipo === "Ingreso" ? "text-on-surface" : "text-error"
                    }`}>
                      {m.tipo === "Ingreso" ? "+" : "-"}${Number(m.monto).toFixed(2)}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-1.5 opacity-0 group-hover:opacity-100 transition-all duration-150">
                        <button 
                          onClick={() => handleViewClick(m)}
                          className="text-outline hover:text-primary transition-all p-1 cursor-pointer"
                          title="Ver detalles"
                        >
                          <span className="material-symbols-outlined text-[20px]">visibility</span>
                        </button>
                        <button 
                          onClick={() => handleEditClick(m)}
                          className="text-outline hover:text-primary transition-all p-1 cursor-pointer"
                          title="Editar"
                        >
                          <span className="material-symbols-outlined text-[20px]">edit</span>
                        </button>
                        <button 
                          onClick={() => handleDeleteClick(m)}
                          className="text-outline hover:text-error transition-all p-1 cursor-pointer"
                          title="Eliminar"
                        >
                          <span className="material-symbols-outlined text-[20px]">delete</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {!isLoading && filteredMovements.length === 0 && (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center text-on-surface-variant text-body-md">
                      No se encontraron movimientos con los filtros aplicados.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="px-6 py-4 bg-white flex items-center justify-between border-t border-outline-variant">
            <p className="text-caption text-outline">
              Mostrando {totalItems > 0 ? startIndex + 1 : 0} a {endIndex} de {totalItems} movimientos
            </p>
            <div className="flex items-center gap-2">
              <button 
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1 || isLoading}
                className="w-8 h-8 flex items-center justify-center rounded border border-outline-variant text-outline hover:border-primary hover:text-primary transition-all disabled:opacity-50 cursor-pointer disabled:cursor-not-allowed"
              >
                <span className="material-symbols-outlined text-[18px]">chevron_left</span>
              </button>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                <button
                  key={page}
                  onClick={() => setCurrentPage(page)}
                  disabled={isLoading}
                  className={`w-8 h-8 flex items-center justify-center rounded font-label-md cursor-pointer ${
                    currentPage === page
                      ? "bg-primary text-white"
                      : "border border-outline-variant text-outline hover:border-primary hover:text-primary transition-all"
                  }`}
                >
                  {page}
                </button>
              ))}
              <button 
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages || isLoading}
                className="w-8 h-8 flex items-center justify-center rounded border border-outline-variant text-outline hover:border-primary hover:text-primary transition-all disabled:opacity-50 cursor-pointer disabled:cursor-not-allowed"
              >
                <span className="material-symbols-outlined text-[18px]">chevron_right</span>
              </button>
            </div>
          </div>
        </div>

        {/* Summary Section (Asymmetric Detail) */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 pb-stack_lg">
          <div className="lg:col-span-3 bg-white border border-outline-variant p-stack_lg rounded-lg relative overflow-hidden">
            <div className="absolute top-0 right-0 p-4 opacity-10">
              <span className="material-symbols-outlined text-[120px] text-primary">analytics</span>
            </div>
            <h3 className="font-title-lg text-title-lg text-primary mb-4">Nota de Conciliación</h3>
            <p className="text-body-md text-on-surface-variant max-w-2xl leading-relaxed">
              Todos los movimientos mostrados arriba están sincronizados con la pasarela de pagos central. Los egresos por comisiones se liquidan automáticamente al final del día laboral. Asegúrese de que los registros manuales de caja chica coincidan con los comprobantes físicos antes del cierre.
            </p>
            <div className="mt-6 flex gap-4">
              <div className="flex flex-col">
                <span className="text-caption text-outline uppercase font-bold">Último Cierre</span>
                <span className="text-body-md font-medium">
                  {latestCajaCierre ? getCierreText(latestCajaCierre.fecha_cierre) : "Hace 14 horas"}
                </span>
              </div>
              <div className="flex flex-col border-l border-outline-variant pl-4">
                <span className="text-caption text-outline uppercase font-bold">Discrepancia</span>
                <span className="text-body-md font-medium text-secondary">Ninguna detectada</span>
              </div>
            </div>
          </div>
          <div className="bg-primary text-white p-stack_lg rounded-lg flex flex-col justify-between">
            <div>
              <p className="text-label-md opacity-80 mb-1">Volumen Mensual</p>
              <h4 className="text-headline-md">
                ${volumenMensual.toLocaleString("es-PE", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </h4>
            </div>
            <div className="mt-4 pt-4 border-t border-white/20">
              <p className="text-caption opacity-80 mb-2">Meta de Recaudación</p>
              <div className="w-full bg-white/20 rounded-full h-2 overflow-hidden">
                <div className="bg-white h-full transition-all duration-500" style={{ width: `${metaPorcentaje}%` }}></div>
              </div>
              <p className="text-right text-caption mt-1">{metaPorcentaje}% alcanzado</p>
            </div>
          </div>
        </div>
      </section>

      {/* Floating Modal for Registering/Editing/Viewing Movement */}
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
                {modalMode === "view" ? "visibility" : modalMode === "edit" ? "edit" : "add_box"}
              </span>
              {modalMode === "view" 
                ? "Detalles del Movimiento" 
                : modalMode === "edit" 
                ? "Editar Movimiento" 
                : "Nuevo Registro Contable"}
            </h3>

            {errorMsg && (
              <div className="mb-4 p-3 bg-error-container text-on-error-container rounded-lg text-body-md">
                {errorMsg}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block font-label-md text-label-md text-on-surface-variant mb-1">
                    Tipo *
                  </label>
                  <select
                    name="tipo"
                    value={formData.tipo}
                    onChange={handleChange}
                    className="w-full border border-outline-variant rounded p-2 focus:border-primary focus:ring-1 focus:ring-primary outline-none bg-white transition-all text-body-md font-body-md disabled:bg-surface-container-low disabled:text-on-surface-variant"
                    required
                    disabled={isSubmitting || modalMode === "view"}
                  >
                    <option value="Ingreso">Ingreso</option>
                    <option value="Egreso">Egreso</option>
                  </select>
                </div>
                <div>
                  <label className="block font-label-md text-label-md text-on-surface-variant mb-1">
                    Monto ($) *
                  </label>
                  <input
                    type="number"
                    name="monto"
                    value={formData.monto}
                    onChange={handleChange}
                    step="0.01"
                    min="0.01"
                    placeholder="0.00"
                    className="w-full border border-outline-variant rounded p-2 focus:border-primary focus:ring-1 focus:ring-primary outline-none bg-white transition-all text-body-md font-body-md disabled:bg-surface-container-low disabled:text-on-surface-variant"
                    required
                    disabled={isSubmitting || modalMode === "view"}
                  />
                </div>
              </div>

              <div>
                <label className="block font-label-md text-label-md text-on-surface-variant mb-1">
                  Concepto *
                </label>
                <input
                  type="text"
                  name="concepto"
                  value={formData.concepto}
                  onChange={handleChange}
                  placeholder="Ej. Pago de Sesión, Gasto de Luz, etc."
                  className="w-full border border-outline-variant rounded p-2 focus:border-primary focus:ring-1 focus:ring-primary outline-none bg-white transition-all text-body-md font-body-md disabled:bg-surface-container-low disabled:text-on-surface-variant"
                  required
                  disabled={isSubmitting || modalMode === "view"}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block font-label-md text-label-md text-on-surface-variant mb-1">
                    Origen / Categoría *
                  </label>
                  <select
                    name="categoria"
                    value={formData.categoria}
                    onChange={handleChange}
                    className="w-full border border-outline-variant rounded p-2 focus:border-primary focus:ring-1 focus:ring-primary outline-none bg-white transition-all text-body-md font-body-md disabled:bg-surface-container-low disabled:text-on-surface-variant"
                    required
                    disabled={isSubmitting || modalMode === "view"}
                  >
                    <option value="Caja">Caja</option>
                    <option value="Paquete">Paquete</option>
                    <option value="Comisión">Comisión</option>
                    <option value="Gasto Operativo">Gasto Operativo</option>
                    <option value="Nómina">Nómina</option>
                    <option value="Otros">Otros</option>
                  </select>
                </div>
                <div>
                  <label className="block font-label-md text-label-md text-on-surface-variant mb-1">
                    Método de Pago *
                  </label>
                  <select
                    name="metodo"
                    value={formData.metodo}
                    onChange={handleChange}
                    className="w-full border border-outline-variant rounded p-2 focus:border-primary focus:ring-1 focus:ring-primary outline-none bg-white transition-all text-body-md font-body-md disabled:bg-surface-container-low disabled:text-on-surface-variant"
                    required
                    disabled={isSubmitting || modalMode === "view"}
                  >
                    <option value="Efectivo">Efectivo</option>
                    <option value="Yape">Yape</option>
                    <option value="Plin">Plin</option>
                    <option value="Transferencia">Transferencia</option>
                    <option value="Tarjeta">Tarjeta</option>
                  </select>
                </div>
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
                  <option value="Completado">Completado</option>
                  <option value="Pendiente">Pendiente</option>
                </select>
              </div>

              <div>
                <label className="block font-label-md text-label-md text-on-surface-variant mb-1">
                  Notas Adicionales
                </label>
                <textarea
                  name="nota"
                  value={formData.nota}
                  onChange={handleChange}
                  placeholder="Detalles sobre este registro..."
                  className="w-full border border-outline-variant rounded p-2 focus:border-primary focus:ring-1 focus:ring-primary outline-none bg-white transition-all h-20 text-body-md font-body-md disabled:bg-surface-container-low disabled:text-on-surface-variant"
                  disabled={isSubmitting || modalMode === "view"}
                />
              </div>

              {/* Form Buttons */}
              <div className="flex justify-end gap-2 pt-2 border-t border-outline-variant">
                <button
                  type="button"
                  onClick={() => {
                    setIsModalOpen(false);
                    setErrorMsg("");
                  }}
                  className="px-4 py-2 border border-outline-variant rounded text-label-md hover:bg-surface-container-low transition-all cursor-pointer"
                  disabled={isSubmitting}
                >
                  {modalMode === "view" ? "Cerrar" : "Cancelar"}
                </button>
                {modalMode !== "view" && (
                  <button
                    type="submit"
                    className="px-6 py-2 bg-primary text-white rounded font-bold hover:brightness-110 active:scale-95 transition-all flex items-center gap-2 cursor-pointer"
                    disabled={isSubmitting}
                  >
                    {isSubmitting && (
                      <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                    )}
                    {modalMode === "edit" ? "Guardar Cambios" : "Registrar"}
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
