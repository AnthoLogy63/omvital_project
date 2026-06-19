import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect, useMemo } from "react";
import { getReportData, type DbMovimiento, type DbComisionReport, type DbPaqueteClienteReport } from "../lib/api/reportes";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
} from "recharts";

// --- SIMULATION DATA GENERATOR ---
const generateSimulationData = () => {
  const movimientos: DbMovimiento[] = [];
  const comisiones: DbComisionReport[] = [];
  const paquetesCliente: DbPaqueteClienteReport[] = [];

  const now = new Date();
  
  // Workers list
  const workerPool = [
    { id: "w1", nombre: "Dr. Carlos Mendoza", rol: "Médico Externo" },
    { id: "w2", nombre: "Lic. Sofia Delgado", rol: "Interno" },
    { id: "w3", nombre: "Maria Rojas", rol: "Jaladora" },
    { id: "w4", nombre: "Dr. Juan Medina", rol: "Médico Externo" },
  ];

  // Patients list
  const patientPool = [
    { id: "p1", nombre: "Juan Perez" },
    { id: "p2", nombre: "Maria Garcia" },
    { id: "p3", nombre: "Lucia Mendez" },
    { id: "p4", nombre: "Pedro Gomez" },
    { id: "p5", nombre: "Ana Torres" },
    { id: "p6", nombre: "David Flores" },
    { id: "p7", nombre: "Elena Ramos" },
    { id: "p8", nombre: "Luis Castro" },
  ];

  // Packages list
  const packagePool = [
    { id: "pkg1", nombre: "Paquete Terapia Lumbar", sesiones: 10, precio: 950 },
    { id: "pkg2", nombre: "Rehabilitación Física Completa", sesiones: 12, precio: 1200 },
    { id: "pkg3", nombre: "Fisioterapia Geriátrica", sesiones: 8, precio: 750 },
    { id: "pkg4", nombre: "Tratamiento Postural", sesiones: 10, precio: 900 },
  ];

  // Let's generate items for the last 60 days
  for (let i = 60; i >= 0; i--) {
    const date = new Date(now);
    date.setDate(now.getDate() - i);
    const dateStr = date.toISOString().split("T")[0];
    const dayOfWeek = date.getDay();
    const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;

    // 1. Generate package sales (say 1 every 3 days)
    if (i % 3 === 0 && !isWeekend) {
      const patient = patientPool[i % patientPool.length];
      const pkg = packagePool[i % packagePool.length];
      const precioVenta = pkg.precio;
      const pagado = i % 2 === 0 ? precioVenta : precioVenta / 2;
      const deuda = precioVenta - pagado;
      const sesionesRealizadas = Math.floor(Math.random() * (pkg.sesiones - 2)) + 2;
      const estado = deuda === 0 ? "Al día" : (pagado === 0 ? "Deuda" : "Parcial");

      const pkgClienteId = `pc-${i}`;
      paquetesCliente.push({
        id: pkgClienteId,
        paciente_id: patient.id,
        paquete_id: pkg.id,
        precio_venta: precioVenta,
        pagado: pagado,
        deuda: deuda,
        sesiones_realizadas: sesionesRealizadas,
        estado: estado as any,
        created_at: date.toISOString(),
        pacientes: { nombre: patient.nombre },
        paquetes: { nombre: pkg.nombre }
      });

      // Generate a movement (Ingreso) for the payment
      if (pagado > 0) {
        movimientos.push({
          id: `m-pkg-${i}`,
          tipo: "Ingreso",
          concepto: `Venta: ${pkg.nombre} - ${patient.nombre}`,
          categoria: "Paquete",
          metodo: ["Efectivo", "Yape", "Plin", "Transferencia", "Tarjeta"][i % 5] as any,
          monto: pagado,
          estado: "Completado",
          nota: "Pago de paquete terapéutico",
          created_at: date.toISOString()
        });
      }

      // Generate a commission if referred
      if (i % 2 === 0) {
        const worker = workerPool[i % workerPool.length];
        const montoComision = Number((precioVenta * 0.1).toFixed(2));
        comisiones.push({
          id: `c-${i}`,
          trabajador_id: worker.id,
          paciente_id: patient.id,
          monto: montoComision,
          estado: i % 4 === 0 ? "Pendiente" : "Pagado",
          fecha_comision: dateStr,
          created_at: date.toISOString(),
          trabajadores: { nombre: worker.nombre, rol: worker.rol }
        });

        // If paid, create an Egreso movement
        if (i % 4 !== 0) {
          movimientos.push({
            id: `m-com-${i}`,
            tipo: "Egreso",
            concepto: `Liquidación Comisión: ${worker.nombre} - Ref. ${patient.nombre}`,
            categoria: "Nómina",
            metodo: "Transferencia",
            monto: montoComision,
            estado: "Completado",
            nota: "Pago de comisión por paciente referido",
            created_at: date.toISOString()
          });
        }
      }
    }

    // 2. Generate daily rehabilitation session payments (Ingresos, say 2-4 per day except weekends)
    if (!isWeekend) {
      const numSessions = Math.floor(Math.random() * 3) + 2; // 2 to 4 sessions
      for (let j = 0; j < numSessions; j++) {
        const patient = patientPool[(i + j) % patientPool.length];
        const monto = 80 + (j * 15);
        movimientos.push({
          id: `m-sess-${i}-${j}`,
          tipo: "Ingreso",
          concepto: `Sesión de Fisioterapia - ${patient.nombre}`,
          categoria: "Rehabilitación",
          metodo: ["Efectivo", "Yape", "Plin", "Tarjeta"][j % 4] as any,
          monto: monto,
          estado: "Completado",
          nota: "Terapia física individual",
          created_at: new Date(date.getTime() + j * 3600000).toISOString()
        });
      }
    }

    // 3. Generate expenses (Egresos)
    // Rent once a month
    if (date.getDate() === 5) {
      movimientos.push({
        id: `m-exp-rent-${i}`,
        tipo: "Egreso",
        concepto: "Alquiler del Local Consultorio",
        categoria: "Gasto Operativo",
        metodo: "Transferencia",
        monto: 2500,
        estado: "Completado",
        nota: "Alquiler mensual consultorio principal",
        created_at: date.toISOString()
      });
    }

    // Utilities on 15th
    if (date.getDate() === 15) {
      movimientos.push({
        id: `m-exp-util-${i}`,
        tipo: "Egreso",
        concepto: "Pago de Luz, Agua e Internet",
        categoria: "Gasto Operativo",
        metodo: "Transferencia",
        monto: 450,
        estado: "Completado",
        nota: "Servicios básicos mensuales",
        created_at: date.toISOString()
      });
    }

    // Software sub on 20th
    if (date.getDate() === 20) {
      movimientos.push({
        id: `m-exp-soft-${i}`,
        tipo: "Egreso",
        concepto: "Suscripción Software OMVITAL",
        categoria: "Tecnología",
        metodo: "Tarjeta",
        monto: 299,
        estado: "Completado",
        nota: "Licencia mensual de software organizacional",
        created_at: date.toISOString()
      });
    }

    // Weekly cleaning supplies (every Friday)
    if (dayOfWeek === 5) {
      movimientos.push({
        id: `m-exp-clean-${i}`,
        tipo: "Egreso",
        concepto: "Insumos de Limpieza y Desinfección",
        categoria: "Mantenimiento",
        metodo: "Efectivo",
        monto: 120,
        estado: "Completado",
        nota: "Artículos de limpieza consultorio",
        created_at: date.toISOString()
      });
    }
  }

  return { movimientos, comisiones, paquetesCliente, totalPacientes: patientPool.length, totalTrabajadores: workerPool.length };
};

// --- CHIPS COLORS ---
const COLORS = ["#004286", "#346761", "#6c3400", "#ea580c", "#ba1a1a", "#7c3aed", "#2563eb", "#db2777"];

export const Route = createFileRoute("/reportes")({
  head: () => ({
    meta: [
      { title: "OMVITAL - Reportes de Gestión" },
      { name: "description", content: "Visualiza el análisis financiero y de rendimiento operativo" },
    ],
  }),
  component: Page,
});

function Page() {
  // Config & Loading State
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState("");
  const [isSimulationMode, setIsSimulationMode] = useState(true); // Default to simulation mode to show dynamic charts immediately
  const [dateRange, setDateRange] = useState<"Este Mes" | "Último Trimestre" | "Año Actual" | "Todos">("Este Mes");

  // Raw Database Data
  const [dbData, setDbData] = useState<{
    movimientos: DbMovimiento[];
    comisiones: DbComisionReport[];
    paquetesCliente: DbPaqueteClienteReport[];
    totalPacientes: number;
    totalTrabajadores: number;
  }>({ movimientos: [], comisiones: [], paquetesCliente: [], totalPacientes: 0, totalTrabajadores: 0 });

  // Simulated Data (cached in memory)
  const simData = useMemo(() => generateSimulationData(), []);

  // Fetch Database Data
  const fetchDbData = async () => {
    try {
      setLoading(true);
      setErrorMsg("");
      const data = await getReportData();
      setDbData(data);
    } catch (err: any) {
      console.error("Error fetching report data:", err);
      setErrorMsg("Error al conectar con la base de datos de Supabase. Mostrando datos simulados.");
      setIsSimulationMode(true); // Force simulation mode on error
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDbData();
  }, []);

  // Active Data Selection (Real vs Simulation)
  const activeData = useMemo(() => {
    if (isSimulationMode) {
      return simData;
    }
    return dbData;
  }, [isSimulationMode, simData, dbData]);

  // Helper function to check date boundaries
  const isWithinDateRange = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    
    if (dateRange === "Este Mes") {
      return date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear();
    } else if (dateRange === "Último Trimestre") {
      const ninetyDaysAgo = new Date();
      ninetyDaysAgo.setDate(now.getDate() - 90);
      return date >= ninetyDaysAgo;
    } else if (dateRange === "Año Actual") {
      return date.getFullYear() === now.getFullYear();
    }
    return true; // "Todos"
  };

  // Filtered lists based on Date Range
  const activeMovimientos = useMemo(() => {
    return activeData.movimientos.filter(m => isWithinDateRange(m.created_at));
  }, [activeData.movimientos, dateRange]);

  const activeComisiones = useMemo(() => {
    // Comisiones table uses fecha_comision which is YYYY-MM-DD
    return activeData.comisiones.filter(c => isWithinDateRange(c.fecha_comision || c.created_at));
  }, [activeData.comisiones, dateRange]);

  const activePaquetesCliente = useMemo(() => {
    return activeData.paquetesCliente.filter(p => isWithinDateRange(p.created_at));
  }, [activeData.paquetesCliente, dateRange]);

  // Table Search and Filters State
  const [searchTerm, setSearchTerm] = useState("");
  const [typeFilter, setTypeFilter] = useState<"Todos" | "Ingreso" | "Egreso">("Todos");
  const [categoryFilter, setCategoryFilter] = useState<string>("Todas");

  // Get unique categories for dropdown filter
  const uniqueCategories = useMemo(() => {
    const cats = new Set<string>();
    activeMovimientos.forEach(m => {
      if (m.categoria) cats.add(m.categoria);
    });
    return ["Todas", ...Array.from(cats)];
  }, [activeMovimientos]);

  // Apply Table Search & Filters
  const filteredMovimientos = useMemo(() => {
    return activeMovimientos.filter(m => {
      const matchesSearch =
        m.concepto.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (m.categoria && m.categoria.toLowerCase().includes(searchTerm.toLowerCase()));
      const matchesType = typeFilter === "Todos" || m.tipo === typeFilter;
      const matchesCategory = categoryFilter === "Todas" || m.categoria === categoryFilter;
      return matchesSearch && matchesType && matchesCategory;
    });
  }, [activeMovimientos, searchTerm, typeFilter, categoryFilter]);

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;
  const totalPages = Math.ceil(filteredMovimientos.length / itemsPerPage) || 1;
  const paginatedMovimientos = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredMovimientos.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredMovimientos, currentPage, itemsPerPage]);

  // Reset pagination on filter change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, typeFilter, categoryFilter, dateRange, isSimulationMode]);

  // --- KPI CALCULATIONS ---
  const kpis = useMemo(() => {
    let totalIngresos = 0;
    let totalEgresos = 0;
    
    activeMovimientos.forEach(m => {
      if (m.tipo === "Ingreso") {
        totalIngresos += Number(m.monto);
      } else {
        totalEgresos += Number(m.monto);
      }
    });

    const balanceNeto = totalIngresos - totalEgresos;
    const paquetesVendidos = activePaquetesCliente.length;
    
    const comisionesPagadas = activeComisiones
      .filter(c => c.estado === "Pagado")
      .reduce((sum, c) => sum + Number(c.monto), 0);

    const deudaPendiente = activePaquetesCliente
      .reduce((sum, p) => sum + Number(p.deuda), 0);

    // Calculate unique days with transactions to get realistic daily cash average
    const uniqueDays = new Set(
      activeMovimientos.map(m => m.created_at.split("T")[0])
    ).size || 1;

    const promedioDiarioCaja = totalIngresos / uniqueDays;

    return {
      totalIngresos,
      totalEgresos,
      balanceNeto,
      paquetesVendidos,
      comisionesPagadas,
      deudaPendiente,
      promedioDiarioCaja
    };
  }, [activeMovimientos, activeComisiones, activePaquetesCliente]);

  // --- CHART 1: INCOMES VS EXPENSES TREND ---
  const trendChartData = useMemo(() => {
    const groups: Record<string, { label: string; date: Date; ingresos: number; egresos: number }> = {};

    activeMovimientos.forEach(m => {
      const date = new Date(m.created_at);
      let key = "";
      let label = "";

      if (dateRange === "Este Mes") {
        key = date.toISOString().split("T")[0];
        label = date.toLocaleDateString("es-PE", { day: "numeric", month: "short" });
      } else {
        key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
        label = date.toLocaleDateString("es-PE", { month: "short", year: "2-digit" });
      }

      if (!groups[key]) {
        groups[key] = { label, date, ingresos: 0, egresos: 0 };
      }

      if (m.tipo === "Ingreso") {
        groups[key].ingresos += Number(m.monto);
      } else {
        groups[key].egresos += Number(m.monto);
      }
    });

    return Object.values(groups)
      .sort((a, b) => a.date.getTime() - b.date.getTime())
      .map(g => ({
        name: g.label,
        Ingresos: parseFloat(g.ingresos.toFixed(2)),
        Gastos: parseFloat(g.egresos.toFixed(2)),
        Balance: parseFloat((g.ingresos - g.egresos).toFixed(2))
      }));
  }, [activeMovimientos, dateRange]);

  // --- CHART 2: EXPENSES DISTRIBUTION (PIE) ---
  const expensesCategoryData = useMemo(() => {
    const groups: Record<string, number> = {};
    activeMovimientos
      .filter(m => m.tipo === "Egreso")
      .forEach(m => {
        const cat = m.categoria || "Gastos Varios";
        groups[cat] = (groups[cat] || 0) + Number(m.monto);
      });

    return Object.entries(groups)
      .map(([name, value]) => ({
        name,
        value: parseFloat(value.toFixed(2))
      }))
      .sort((a, b) => b.value - a.value);
  }, [activeMovimientos]);

  // --- CHART 3: PAYMENT METHODS DISTRIBUTION (PIE) ---
  const paymentMethodsData = useMemo(() => {
    const groups: Record<string, number> = {};
    activeMovimientos
      .filter(m => m.tipo === "Ingreso")
      .forEach(m => {
        const met = m.metodo || "Otros";
        groups[met] = (groups[met] || 0) + Number(m.monto);
      });

    return Object.entries(groups)
      .map(([name, value]) => ({
        name,
        value: parseFloat(value.toFixed(2))
      }))
      .sort((a, b) => b.value - a.value);
  }, [activeMovimientos]);

  // --- DYNAMIC REFERRERS LIST ---
  const referrersSummary = useMemo(() => {
    const summary: Record<string, { id: string; nombre: string; rol: string; pacientesCount: number; comisionesTotal: number }> = {};

    activeComisiones.forEach(c => {
      const workerName = c.trabajadores?.nombre || "Médico Referidor";
      const workerRol = c.trabajadores?.rol || "Médico Externo";
      const workerId = c.trabajador_id;

      if (!summary[workerId]) {
        summary[workerId] = {
          id: workerId,
          nombre: workerName,
          rol: workerRol,
          pacientesCount: 0,
          comisionesTotal: 0
        };
      }

      summary[workerId].pacientesCount += 1;
      summary[workerId].comisionesTotal += Number(c.monto);
    });

    return Object.values(summary)
      .sort((a, b) => b.comisionesTotal - a.comisionesTotal)
      .slice(0, 4);
  }, [activeComisiones]);

  // --- EXPORT PDF ROUTINE ---
  const handleExportPDF = () => {
    const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
    const pageW = doc.internal.pageSize.getWidth();
    const pageH = doc.internal.pageSize.getHeight();
    const now = new Date();
    
    const dateStr = now.toLocaleDateString("es-PE", { year: "numeric", month: "long", day: "numeric" });
    const timeStr = now.toLocaleTimeString("es-PE", { hour: "2-digit", minute: "2-digit" });

    // Primary Header Banner
    doc.setFillColor(0, 66, 134); // primary color (#004286)
    doc.rect(0, 0, pageW, 25, "F");

    // Accent Line
    doc.setFillColor(52, 103, 97); // secondary color (#346761)
    doc.rect(0, 25, pageW, 1.5, "F");

    // Clinic Logo/Title
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(20);
    doc.setFont("helvetica", "bold");
    doc.text("OMVITAL", 12, 11);
    doc.setFontSize(8.5);
    doc.setFont("helvetica", "normal");
    doc.text("Reporte de Gestión Financiera y Operativa", 12, 18);

    // Generation Details
    doc.setFontSize(8);
    doc.text(`Generado: ${dateStr} ${timeStr}`, pageW - 12, 11, { align: "right" });
    doc.text(`Origen: ${isSimulationMode ? "Simulación (Demo)" : "Base de Datos Real"}`, pageW - 12, 18, { align: "right" });

    // Summary Section
    const yStart = 35;
    doc.setTextColor(25, 28, 33);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(11);
    doc.text("Resumen de Indicadores Financieros", 12, yStart);
    
    const cardW = (pageW - 30) / 3;
    
    // Incomes Card (Teal)
    doc.setFillColor(245, 248, 246);
    doc.roundedRect(10, yStart + 3, cardW, 18, 1.5, 1.5, "F");
    doc.setFont("helvetica", "normal");
    doc.setFontSize(7.5);
    doc.setTextColor(115, 119, 130);
    doc.text("TOTAL INGRESOS", 13, yStart + 8);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(10.5);
    doc.setTextColor(52, 103, 97);
    doc.text(`S/ ${kpis.totalIngresos.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`, 13, yStart + 16);

    // Expenses Card (Red)
    doc.setFillColor(254, 243, 243);
    doc.roundedRect(10 + cardW + 5, yStart + 3, cardW, 18, 1.5, 1.5, "F");
    doc.setFont("helvetica", "normal");
    doc.setFontSize(7.5);
    doc.setTextColor(115, 119, 130);
    doc.text("TOTAL GASTOS", 10 + cardW + 8, yStart + 8);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(10.5);
    doc.setTextColor(186, 26, 26);
    doc.text(`S/ ${kpis.totalEgresos.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`, 10 + cardW + 8, yStart + 16);

    // Balance Card (Blue)
    doc.setFillColor(243, 243, 250);
    doc.roundedRect(10 + (cardW + 5) * 2, yStart + 3, cardW, 18, 1.5, 1.5, "F");
    doc.setFont("helvetica", "normal");
    doc.setFontSize(7.5);
    doc.setTextColor(115, 119, 130);
    doc.text("BALANCE NETO", 10 + (cardW + 5) * 2 + 3, yStart + 8);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(10.5);
    doc.setTextColor(0, 66, 134);
    doc.text(`S/ ${kpis.balanceNeto.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`, 10 + (cardW + 5) * 2 + 3, yStart + 16);

    // Context summary tag
    doc.setTextColor(115, 119, 130);
    doc.setFont("helvetica", "italic");
    doc.setFontSize(7.5);
    const summaryText = `Rango seleccionado: ${dateRange} | Paquetes vendidos: ${kpis.paquetesVendidos} | Deuda total pendiente: S/ ${kpis.deudaPendiente.toFixed(2)} | Comisiones liquidadas: S/ ${kpis.comisionesPagadas.toFixed(2)}`;
    doc.text(summaryText, 12, yStart + 26);

    // Table Header Title
    doc.setFont("helvetica", "bold");
    doc.setFontSize(11);
    doc.setTextColor(25, 28, 33);
    doc.text("Desglose de Movimientos del Período", 12, yStart + 34);

    // Autotable construction
    autoTable(doc, {
      startY: yStart + 37,
      head: [["Fecha", "Concepto", "Categoría", "Método", "Tipo", "Monto"]],
      body: filteredMovimientos.map(m => [
        new Date(m.created_at).toLocaleDateString("es-PE"),
        m.concepto,
        m.categoria || "—",
        m.metodo,
        m.tipo,
        `S/ ${Number(m.monto).toFixed(2)}`
      ]),
      headStyles: {
        fillColor: [0, 66, 134],
        textColor: [255, 255, 255],
        fontSize: 8,
        fontStyle: "bold",
      },
      bodyStyles: {
        fontSize: 7.5,
        textColor: [25, 28, 33],
      },
      alternateRowStyles: {
        fillColor: [248, 250, 252],
      },
      margin: { left: 10, right: 10 },
    });

    // Page Numbers in Footer
    const totalPagesNum = (doc as any).internal.getNumberOfPages();
    for (let i = 1; i <= totalPagesNum; i++) {
      doc.setPage(i);
      doc.setFontSize(7.5);
      doc.setTextColor(115, 119, 130);
      doc.text("OMVITAL - Sistema de Gestión Integral de Fisioterapia y Salud", 10, pageH - 6);
      doc.text(`Página ${i} de ${totalPagesNum}`, pageW - 10, pageH - 6, { align: "right" });
    }

    doc.save(`reporte_financiero_omvital_${now.toISOString().split("T")[0]}.pdf`);
  };

  // --- EXPORT CSV ROUTINE ---
  const handleExportCSV = () => {
    if (filteredMovimientos.length === 0) return;
    
    const headers = ["ID", "Fecha", "Tipo", "Concepto", "Categoria", "Metodo", "Monto", "Estado", "Nota"];
    const rows = filteredMovimientos.map(m => [
      m.id,
      m.created_at,
      m.tipo,
      `"${m.concepto.replace(/"/g, '""')}"`,
      m.categoria || "",
      m.metodo,
      m.monto,
      m.estado,
      m.nota ? `"${m.nota.replace(/"/g, '""')}"` : ""
    ]);

    const csvContent = [headers.join(","), ...rows.map(e => e.join(","))].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `movimientos_omvital_${new Date().toISOString().split("T")[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <main className="ml-[260px] pt-[64px] h-screen overflow-y-auto bg-background custom-scrollbar">
      <div className="p-container_padding max-w-[1400px] mx-auto space-y-gutter pb-12">
        
        {/* Header Block & Controls */}
        <div className="flex flex-col xl:flex-row justify-between items-start xl:items-center gap-4 border-b border-outline-variant/40 pb-5">
          <div>
            <h2 className="font-headline-md text-headline-md text-primary flex items-center gap-2">
              <span className="material-symbols-outlined text-[32px] text-primary">assessment</span>
              Análisis y Reportes
            </h2>
            <p className="font-body-md text-body-md text-on-surface-variant mt-1">
              Monitorea los flujos financieros, ingresos de caja, ventas de paquetes y comisiones clínicas.
            </p>
          </div>
          
          <div className="flex flex-wrap items-center gap-3">
            {/* Simulation Mode Switcher */}
            <div className="flex items-center bg-surface-container border border-outline-variant p-1.5 rounded-lg shadow-sm">
              <button
                onClick={() => setIsSimulationMode(false)}
                className={`px-3 py-1.5 rounded-md font-label-md text-label-md transition-all cursor-pointer ${
                  !isSimulationMode
                    ? "bg-white text-primary font-bold shadow-sm"
                    : "text-on-surface-variant hover:text-on-surface"
                }`}
              >
                Base de Datos
              </button>
              <button
                onClick={() => setIsSimulationMode(true)}
                className={`px-3 py-1.5 rounded-md font-label-md text-label-md transition-all cursor-pointer ${
                  isSimulationMode
                    ? "bg-primary text-white font-bold shadow-sm"
                    : "text-on-surface-variant hover:text-on-surface"
                }`}
              >
                Simulación Demo
              </button>
            </div>

            {/* Date Filters */}
            <div className="flex bg-surface-container border border-outline-variant p-1.5 rounded-lg shadow-sm">
              {(["Este Mes", "Último Trimestre", "Año Actual", "Todos"] as const).map((range) => (
                <button
                  key={range}
                  onClick={() => setDateRange(range)}
                  className={`px-3 py-1.5 rounded-md font-label-md text-label-md cursor-pointer transition-all ${
                    dateRange === range
                      ? "bg-secondary text-white font-bold shadow-sm"
                      : "text-on-surface-variant hover:text-on-surface"
                  }`}
                >
                  {range}
                </button>
              ))}
            </div>

            {/* PDF Export Button */}
            <button
              onClick={handleExportPDF}
              className="flex items-center gap-2 bg-primary hover:bg-primary-container text-white px-4 py-2.5 rounded-lg font-label-md text-label-md shadow-md active:scale-95 transition-all cursor-pointer"
            >
              <span className="material-symbols-outlined text-[18px]">picture_as_pdf</span>
              Reporte PDF
            </button>
          </div>
        </div>

        {/* Warning notification regarding RLS */}
        {!isSimulationMode && (
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 flex items-start gap-3">
            <span className="material-symbols-outlined text-amber-600 flex-shrink-0 mt-0.5">warning</span>
            <div>
              <p className="text-body-md font-bold text-amber-800">Advertencia de Seguridad del Sistema</p>
              <p className="text-caption text-amber-700 mt-0.5">
                Las tablas <code className="bg-amber-100/60 px-1 rounded">sesiones_caja</code> y <code className="bg-amber-100/60 px-1 rounded">movimientos</code> no tienen activo el Row Level Security (RLS). Consulte con soporte técnico para aplicar políticas y restringir lecturas de usuarios externos.
              </p>
            </div>
          </div>
        )}

        {/* KPI Bento Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-gutter">
          
          {/* Card 1: Total Ingresos */}
          <div className="bg-white border border-outline-variant rounded-xl p-stack_md flex flex-col justify-between shadow-sm hover:border-secondary transition-all">
            <div className="flex justify-between items-center">
              <span className="text-caption font-bold text-outline uppercase tracking-wider">Ingresos Totales</span>
              <div className="w-8 h-8 rounded-lg bg-green-50 flex items-center justify-center text-green-600">
                <span className="material-symbols-outlined text-[20px]">trending_up</span>
              </div>
            </div>
            <div className="mt-4">
              <h3 className="text-headline-md font-headline-md text-on-surface">
                S/ {kpis.totalIngresos.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </h3>
              <p className="text-caption text-on-surface-variant mt-1">
                Dinero bruto ingresado
              </p>
            </div>
          </div>

          {/* Card 2: Total Egresos */}
          <div className="bg-white border border-outline-variant rounded-xl p-stack_md flex flex-col justify-between shadow-sm hover:border-error transition-all">
            <div className="flex justify-between items-center">
              <span className="text-caption font-bold text-outline uppercase tracking-wider">Gastos Totales</span>
              <div className="w-8 h-8 rounded-lg bg-red-50 flex items-center justify-center text-red-600">
                <span className="material-symbols-outlined text-[20px]">trending_down</span>
              </div>
            </div>
            <div className="mt-4">
              <h3 className="text-headline-md font-headline-md text-on-surface">
                S/ {kpis.totalEgresos.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </h3>
              <p className="text-caption text-on-surface-variant mt-1">
                Nómina, compras y servicios
              </p>
            </div>
          </div>

          {/* Card 3: Balance Neto */}
          <div className={`rounded-xl p-stack_md flex flex-col justify-between shadow-sm border transition-all ${
            kpis.balanceNeto >= 0 
              ? "bg-primary-container text-white border-transparent" 
              : "bg-error-container text-on-error-container border-error"
          }`}>
            <div className="flex justify-between items-center">
              <span className={`text-caption font-bold uppercase tracking-wider ${kpis.balanceNeto >= 0 ? "text-white/80" : "text-on-error-container/80"}`}>
                Balance Neto
              </span>
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                kpis.balanceNeto >= 0 ? "bg-white/20 text-white" : "bg-error text-white"
              }`}>
                <span className="material-symbols-outlined text-[20px]">account_balance</span>
              </div>
            </div>
            <div className="mt-4">
              <h3 className="text-headline-md font-headline-md">
                S/ {kpis.balanceNeto.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </h3>
              <p className={`text-caption mt-1 ${kpis.balanceNeto >= 0 ? "text-white/70" : "text-on-error-container/70"}`}>
                {kpis.totalIngresos > 0 
                  ? `${((kpis.balanceNeto / kpis.totalIngresos) * 100).toFixed(0)}% margen operativo`
                  : "Sin ingresos"
                }
              </p>
            </div>
          </div>

          {/* Card 4: Promedio Diario */}
          <div className="bg-white border border-outline-variant rounded-xl p-stack_md flex flex-col justify-between shadow-sm hover:border-primary transition-all">
            <div className="flex justify-between items-center">
              <span className="text-caption font-bold text-outline uppercase tracking-wider">Promedio Diario</span>
              <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center text-primary">
                <span className="material-symbols-outlined text-[20px]">payments</span>
              </div>
            </div>
            <div className="mt-4">
              <h3 className="text-headline-md font-headline-md text-on-surface">
                S/ {kpis.promedioDiarioCaja.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </h3>
              <p className="text-caption text-on-surface-variant mt-1">
                Ingreso por día laborado
              </p>
            </div>
          </div>

          {/* Card 5: Paquetes Vendidos */}
          <div className="bg-white border border-outline-variant rounded-xl p-stack_md flex flex-col justify-between shadow-sm hover:border-primary transition-all">
            <div className="flex justify-between items-center">
              <span className="text-caption font-bold text-outline uppercase tracking-wider">Paquetes Vendidos</span>
              <div className="w-8 h-8 rounded-lg bg-orange-50 flex items-center justify-center text-orange-600">
                <span className="material-symbols-outlined text-[20px]">inventory_2</span>
              </div>
            </div>
            <div className="mt-4">
              <h3 className="text-headline-md font-headline-md text-on-surface">
                {kpis.paquetesVendidos} U.
              </h3>
              <p className="text-caption text-on-surface-variant mt-1">
                Paquetes contratados
              </p>
            </div>
          </div>

          {/* Card 6: Deuda de Clientes */}
          <div className="bg-white border border-outline-variant rounded-xl p-stack_md flex flex-col justify-between shadow-sm hover:border-amber-600 transition-all">
            <div className="flex justify-between items-center">
              <span className="text-caption font-bold text-outline uppercase tracking-wider">Deuda Pendiente</span>
              <div className="w-8 h-8 rounded-lg bg-amber-50 flex items-center justify-center text-amber-600">
                <span className="material-symbols-outlined text-[20px]">pending_actions</span>
              </div>
            </div>
            <div className="mt-4">
              <h3 className="text-headline-md font-headline-md text-amber-700">
                S/ {kpis.deudaPendiente.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </h3>
              <p className="text-caption text-on-surface-variant mt-1">
                Saldo pendiente de cobro
              </p>
            </div>
          </div>
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-gutter">
          
          {/* Trend Chart (Area Chart) */}
          <div className="lg:col-span-8 bg-white border border-outline-variant rounded-xl p-stack_lg flex flex-col shadow-sm">
            <div className="flex justify-between items-center mb-6">
              <div>
                <h3 className="font-title-lg text-title-lg text-on-surface">Evolución de Caja Clínica</h3>
                <p className="text-caption text-on-surface-variant">Historial comparativo de ingresos, gastos y saldo en el periodo</p>
              </div>
            </div>
            
            <div className="h-[320px] w-full">
              {trendChartData.length === 0 ? (
                <div className="h-full flex items-center justify-center text-on-surface-variant text-body-md">
                  No hay suficientes datos para generar gráficos.
                </div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={trendChartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <defs>
                      <linearGradient id="colorIngresos" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#346761" stopOpacity={0.2}/>
                        <stop offset="95%" stopColor="#346761" stopOpacity={0}/>
                      </linearGradient>
                      <linearGradient id="colorGastos" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#ba1a1a" stopOpacity={0.2}/>
                        <stop offset="95%" stopColor="#ba1a1a" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f3f9" vertical={false} />
                    <XAxis dataKey="name" stroke="#888888" fontSize={11} tickLine={false} axisLine={false} />
                    <YAxis stroke="#888888" fontSize={11} tickLine={false} axisLine={false} tickFormatter={(v) => `S/${v}`} />
                    <Tooltip formatter={(value) => [`S/ ${value}`, ""]} contentStyle={{ borderRadius: "8px", border: "1px solid #c2c6d3" }} />
                    <Legend iconType="circle" wrapperStyle={{ fontSize: "12px", paddingTop: "15px" }} />
                    <Area type="monotone" dataKey="Ingresos" stroke="#346761" strokeWidth={2.5} fillOpacity={1} fill="url(#colorIngresos)" />
                    <Area type="monotone" dataKey="Gastos" stroke="#ba1a1a" strokeWidth={2.5} fillOpacity={1} fill="url(#colorGastos)" />
                  </AreaChart>
                </ResponsiveContainer>
              )}
            </div>
          </div>

          {/* Distribution Charts (Pie Charts) */}
          <div className="lg:col-span-4 bg-white border border-outline-variant rounded-xl p-stack_lg flex flex-col shadow-sm">
            <h3 className="font-title-lg text-title-lg text-on-surface mb-2">Desglose de Egresos</h3>
            <p className="text-caption text-on-surface-variant mb-6">Porcentaje de gastos operativos y nóminas</p>
            
            <div className="flex-1 flex flex-col justify-center">
              {expensesCategoryData.length === 0 ? (
                <div className="h-[200px] flex items-center justify-center text-on-surface-variant text-body-md">
                  No hay gastos registrados en este periodo.
                </div>
              ) : (
                <>
                  <div className="h-[180px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={expensesCategoryData}
                          cx="50%"
                          cy="50%"
                          innerRadius={60}
                          outerRadius={80}
                          paddingAngle={3}
                          dataKey="value"
                        >
                          {expensesCategoryData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip formatter={(value) => [`S/ ${value}`, ""]} />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                  
                  {/* Custom Legend */}
                  <div className="mt-4 grid grid-cols-2 gap-2 max-h-[100px] overflow-y-auto">
                    {expensesCategoryData.map((item, index) => {
                      const total = expensesCategoryData.reduce((acc, curr) => acc + curr.value, 0);
                      const pct = total > 0 ? ((item.value / total) * 100).toFixed(0) : 0;
                      return (
                        <div key={item.name} className="flex items-center gap-1.5 text-caption">
                          <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: COLORS[index % COLORS.length] }}></span>
                          <span className="truncate text-on-surface-variant max-w-[80px]" title={item.name}>{item.name}</span>
                          <span className="font-bold text-on-surface ml-auto">{pct}%</span>
                        </div>
                      );
                    })}
                  </div>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Dynamic Referrers Block & Projections */}
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-gutter">
          
          {/* Referrers Rankings */}
          <div className="xl:col-span-6 bg-white border border-outline-variant rounded-xl p-stack_lg flex flex-col shadow-sm">
            <div className="flex justify-between items-start mb-4 border-b border-outline-variant/40 pb-3">
              <div>
                <h3 className="font-title-lg text-title-lg text-on-surface">Top Referidores Clínicos</h3>
                <p className="text-caption text-on-surface-variant">Médicos y promotores externos que aportan más pacientes</p>
              </div>
            </div>
            
            <div className="space-y-4 flex-1">
              {referrersSummary.length === 0 ? (
                <div className="py-8 text-center text-on-surface-variant text-body-md">
                  No hay registro de comisiones para referidores en este periodo.
                </div>
              ) : (
                referrersSummary.map((ref, idx) => (
                  <div key={ref.id} className="flex items-center justify-between border-b border-outline-variant/30 pb-3 last:border-0 last:pb-0">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center font-bold text-primary text-body-md shrink-0">
                        {idx + 1}
                      </div>
                      <div>
                        <p className="font-body-md text-body-md font-semibold">{ref.nombre}</p>
                        <p className="text-caption text-outline">
                          {ref.rol === "Médico Externo" ? "Médico Externo" : ref.rol === "Jaladora" ? "Jaladora" : ref.rol}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-body-md font-bold text-primary">S/ {ref.comisionesTotal.toFixed(2)}</p>
                      <p className="text-caption text-outline">{ref.pacientesCount} pacientes</p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Payment Methods Breakdown */}
          <div className="xl:col-span-6 bg-white border border-outline-variant rounded-xl p-stack_lg flex flex-col shadow-sm">
            <h3 className="font-title-lg text-title-lg text-on-surface mb-1">Métodos de Cobro Preferidos</h3>
            <p className="text-caption text-on-surface-variant mb-4">Uso de Yape, Plin, Transferencias y Tarjetas en ingresos</p>
            
            <div className="flex-1 flex flex-col justify-center">
              {paymentMethodsData.length === 0 ? (
                <div className="py-8 text-center text-on-surface-variant text-body-md">
                  No hay cobros registrados en este periodo.
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
                  <div className="md:col-span-6 h-[160px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={paymentMethodsData}
                          cx="50%"
                          cy="50%"
                          innerRadius={50}
                          outerRadius={70}
                          paddingAngle={3}
                          dataKey="value"
                        >
                          {paymentMethodsData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[(index + 3) % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip formatter={(value) => [`S/ ${value}`, ""]} />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                  
                  <div className="md:col-span-6 space-y-2 max-h-[180px] overflow-y-auto pr-2">
                    {paymentMethodsData.map((item, index) => {
                      const total = paymentMethodsData.reduce((acc, curr) => acc + curr.value, 0);
                      const pct = total > 0 ? ((item.value / total) * 100).toFixed(0) : 0;
                      return (
                        <div key={item.name} className="flex justify-between items-center text-caption pb-1.5 border-b border-outline-variant/30 last:border-0 last:pb-0">
                          <div className="flex items-center gap-2">
                            <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: COLORS[(index + 3) % COLORS.length] }}></span>
                            <span className="text-on-surface-variant font-medium">{item.name}</span>
                          </div>
                          <div className="text-right">
                            <span className="font-bold text-on-surface mr-2">S/ {item.value.toLocaleString("en-US", { minimumFractionDigits: 0, maximumFractionDigits: 0 })}</span>
                            <span className="text-outline">({pct}%)</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Transactions Table Section */}
        <div className="bg-white border border-outline-variant rounded-xl overflow-hidden shadow-sm">
          
          {/* Table Toolbar */}
          <div className="p-stack_lg border-b border-outline-variant flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white">
            <div>
              <h3 className="font-title-lg text-title-lg text-on-surface">Detalle Contable del Periodo</h3>
              <p className="text-caption text-on-surface-variant">Lista de movimientos financieros registrados</p>
            </div>
            
            <div className="flex flex-wrap items-center gap-3">
              {/* Search Bar */}
              <div className="relative">
                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline text-[20px]">search</span>
                <input
                  type="text"
                  placeholder="Buscar concepto o categoría..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="bg-surface-container-low border border-outline-variant rounded-lg py-1.5 pl-10 pr-4 focus:ring-1 focus:ring-primary focus:border-primary outline-none text-body-md w-[220px]"
                />
              </div>

              {/* Type Filter */}
              <select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value as any)}
                className="bg-white border border-outline-variant rounded-lg px-3 py-1.5 text-body-md focus:ring-primary focus:border-primary outline-none cursor-pointer"
              >
                <option value="Todos">Todos los Flujos</option>
                <option value="Ingreso">Solo Ingresos</option>
                <option value="Egreso">Solo Egresos</option>
              </select>

              {/* Category Filter */}
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="bg-white border border-outline-variant rounded-lg px-3 py-1.5 text-body-md focus:ring-primary focus:border-primary outline-none cursor-pointer max-w-[150px]"
              >
                <option value="Todas">Todas las Categorías</option>
                {uniqueCategories.filter(c => c !== "Todas").map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>

              {/* CSV Download Button */}
              <button
                onClick={handleExportCSV}
                title="Exportar como CSV"
                disabled={filteredMovimientos.length === 0}
                className="flex items-center justify-center p-2 border border-outline-variant hover:bg-surface-container-low rounded-lg transition-colors cursor-pointer text-outline disabled:opacity-50"
              >
                <span className="material-symbols-outlined text-[20px]">download</span>
              </button>
            </div>
          </div>

          {/* Table Container */}
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-[#F8FAFB] border-b border-outline-variant">
                  <th className="px-6 py-4 font-label-md text-label-md text-outline">Fecha</th>
                  <th className="px-6 py-4 font-label-md text-label-md text-outline">Tipo</th>
                  <th className="px-6 py-4 font-label-md text-label-md text-outline">Concepto</th>
                  <th className="px-6 py-4 font-label-md text-label-md text-outline">Categoría</th>
                  <th className="px-6 py-4 font-label-md text-label-md text-outline">Método</th>
                  <th className="px-6 py-4 font-label-md text-label-md text-outline text-right">Monto</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-outline-variant/40">
                {loading ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center text-on-surface-variant text-body-md">
                      <div className="flex items-center justify-center gap-2">
                        <span className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin"></span>
                        Cargando movimientos financieros...
                      </div>
                    </td>
                  </tr>
                ) : paginatedMovimientos.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-10 text-center text-on-surface-variant text-body-md">
                      No se encontraron transacciones en este período.
                    </td>
                  </tr>
                ) : (
                  paginatedMovimientos.map((m) => (
                    <tr key={m.id} className="hover:bg-surface-container-low transition-colors group">
                      <td className="px-6 py-4 text-body-md text-on-surface">
                        {new Date(m.created_at).toLocaleDateString("es-PE", { year: "numeric", month: "short", day: "numeric" })}
                      </td>
                      <td className="px-6 py-4">
                        {m.tipo === "Ingreso" ? (
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-caption font-bold bg-green-50 text-green-700 border border-green-200">
                            Ingreso
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-caption font-bold bg-red-50 text-red-700 border border-red-200">
                            Egreso
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 font-body-md text-body-md text-on-surface font-semibold">
                        {m.concepto}
                      </td>
                      <td className="px-6 py-4 text-body-md text-on-surface-variant">
                        {m.categoria || "—"}
                      </td>
                      <td className="px-6 py-4 text-body-md text-outline">
                        {m.metodo}
                      </td>
                      <td className={`px-6 py-4 text-right font-bold text-body-md ${
                        m.tipo === "Ingreso" ? "text-green-700" : "text-red-700"
                      }`}>
                        {m.tipo === "Ingreso" ? "+" : "-"} S/ {Number(m.monto).toFixed(2)}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Table Pagination */}
          <div className="p-4 bg-[#F8FAFB] flex items-center justify-between border-t border-outline-variant">
            <p className="text-caption text-outline">
              Mostrando {filteredMovimientos.length === 0 ? 0 : (currentPage - 1) * itemsPerPage + 1} a {Math.min(currentPage * itemsPerPage, filteredMovimientos.length)} de {filteredMovimientos.length} transacciones
            </p>
            
            {totalPages > 1 && (
              <div className="flex gap-1">
                <button
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
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
                        ? "border-secondary bg-secondary text-white"
                        : "border-outline-variant bg-white text-outline hover:bg-surface-container"
                    }`}
                  >
                    {p}
                  </button>
                ))}
                <button
                  onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
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
    </main>
  );
}
