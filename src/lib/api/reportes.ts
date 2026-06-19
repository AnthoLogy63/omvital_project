import { createServerFn } from "@tanstack/react-start";
import { supabase } from "../supabase.server";

export interface DbMovimiento {
  id: string;
  tipo: "Ingreso" | "Egreso";
  concepto: string;
  categoria: string | null;
  metodo: "Efectivo" | "Yape" | "Plin" | "Transferencia" | "Tarjeta";
  monto: number;
  estado: string;
  nota: string | null;
  created_at: string;
}

export interface DbComisionReport {
  id: string;
  trabajador_id: string;
  paciente_id: string;
  monto: number;
  estado: "Pendiente" | "Pagado";
  fecha_comision: string;
  created_at: string;
  trabajadores?: {
    nombre: string;
    rol: string;
  } | null;
}

export interface DbPaqueteClienteReport {
  id: string;
  paciente_id: string;
  paquete_id: string;
  precio_venta: number;
  pagado: number;
  deuda: number;
  sesiones_realizadas: number;
  estado: "Al día" | "Deuda" | "Parcial";
  created_at: string;
  pacientes?: {
    nombre: string;
  } | null;
  paquetes?: {
    nombre: string;
  } | null;
}

export interface ReportDataResponse {
  movimientos: DbMovimiento[];
  comisiones: DbComisionReport[];
  paquetesCliente: DbPaqueteClienteReport[];
  totalPacientes: number;
  totalTrabajadores: number;
}

// Fetch general report details from the server database
export const getReportData = createServerFn({ method: "GET" })
  .handler(async (): Promise<ReportDataResponse> => {
    const [
      { data: movimientos, error: mError },
      { data: comisiones, error: cError },
      { data: paquetesCliente, error: pcError },
      { count: totalPacientes, error: pError },
      { count: totalTrabajadores, error: tError },
    ] = await Promise.all([
      supabase
        .from("movimientos")
        .select("id, tipo, concepto, categoria, metodo, monto, estado, nota, created_at")
        .order("created_at", { ascending: false }),
      supabase
        .from("comisiones")
        .select(`
          id,
          trabajador_id,
          paciente_id,
          monto,
          estado,
          fecha_comision,
          created_at,
          trabajadores (
            nombre,
            rol
          )
        `)
        .order("created_at", { ascending: false }),
      supabase
        .from("paquetes_cliente")
        .select(`
          id,
          paciente_id,
          paquete_id,
          precio_venta,
          pagado,
          deuda,
          sesiones_realizadas,
          estado,
          created_at,
          pacientes (
            nombre
          ),
          paquetes (
            nombre
          )
        `)
        .order("created_at", { ascending: false }),
      supabase.from("pacientes").select("*", { count: "exact", head: true }),
      supabase.from("trabajadores").select("*", { count: "exact", head: true }),
    ]);

    if (mError) {
      console.error("Error fetching report movimientos:", mError);
      throw new Error(mError.message);
    }
    if (cError) {
      console.error("Error fetching report comisiones:", cError);
      throw new Error(cError.message);
    }
    if (pcError) {
      console.error("Error fetching report paquetesCliente:", pcError);
      throw new Error(pcError.message);
    }
    if (pError) {
      console.error("Error counting pacientes:", pError);
      throw new Error(pError.message);
    }
    if (tError) {
      console.error("Error counting trabajadores:", tError);
      throw new Error(tError.message);
    }

    return {
      movimientos: (movimientos || []) as DbMovimiento[],
      comisiones: (comisiones || []) as any as DbComisionReport[],
      paquetesCliente: (paquetesCliente || []) as any as DbPaqueteClienteReport[],
      totalPacientes: totalPacientes || 0,
      totalTrabajadores: totalTrabajadores || 0,
    };
  });
