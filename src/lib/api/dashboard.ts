import { createServerFn } from "@tanstack/react-start";
import { supabase } from "../supabase.server";

export const getDashboardData = createServerFn({ method: "GET" }).handler(async () => {
  // 1. Stats (Ingresos, Egresos hoy)
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const { data: movs } = await supabase
    .from("movimientos")
    .select("tipo, monto")
    .gte("created_at", today.toISOString());

  let ingresos = 0;
  let egresos = 0;
  if (movs) {
    movs.forEach((m) => {
      if (m.tipo === "Ingreso") ingresos += Number(m.monto);
      if (m.tipo === "Egreso") egresos += Number(m.monto);
    });
  }

  // Saldo en caja actual (Apertura + Ingresos - Egresos)
  const { data: cajas } = await supabase
    .from("sesiones_caja")
    .select("monto_apertura")
    .eq("estado", "Abierto")
    .order("created_at", { ascending: false })
    .limit(1);

  const saldo =
    cajas && cajas.length > 0
      ? Number(cajas[0].monto_apertura) + ingresos - egresos
      : ingresos - egresos;

  // 2. Recent Movements
  const { data: recentMovements } = await supabase
    .from("movimientos")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(5);

  // 3. Debts (Paquetes Pendientes)
  const { data: debts } = await supabase
    .from("paquetes_cliente")
    .select(
      `
        *,
        paciente:pacientes(nombre),
        paquete:paquetes(nombre, cantidad_sesiones)
      `,
    )
    .eq("estado", "Deuda")
    .limit(5);

  const { count: pendingPackagesCount } = await supabase
    .from("paquetes_cliente")
    .select("*", { count: "exact", head: true })
    .eq("estado", "Deuda");

  // 4. Pending Commissions
  const { data: commissions } = await supabase
    .from("comisiones")
    .select(
      `
        *,
        trabajador:trabajadores(nombre)
      `,
    )
    .eq("estado", "Pendiente")
    .limit(5);

  return {
    stats: {
      ingresos,
      egresos,
      saldo,
      pendingCount: pendingPackagesCount || 0,
      isCajaOpen: cajas && cajas.length > 0,
    },
    movements: recentMovements || [],
    debts: debts || [],
    commissions: commissions || [],
  };
});
