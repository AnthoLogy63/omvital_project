import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "../lib/supabase";

export type SesionCaja = {
  id: string;
  abierto_por: string | null;
  fecha_apertura: string | null;
  fecha_cierre: string | null;
  monto_apertura: number;
  monto_cierre: number | null;
  estado: "Abierto" | "Cerrado";
  created_at: string;
};

export type Movimiento = {
  id: string;
  caja_id: string;
  tipo: "Ingreso" | "Egreso";
  concepto: string;
  categoria: string;
  metodo: string;
  monto: number;
  estado: string;
  nota: string | null;
  paquete_cliente_id: string | null;
  created_at: string;
};

// --- Queries ---

export function useActiveSession() {
  return useQuery({
    queryKey: ["caja", "activeSession"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("sesiones_caja")
        .select("*")
        .eq("estado", "Abierto")
        .order("created_at", { ascending: false })
        .limit(1)
        .single();

      if (error && error.code !== "PGRST116") { // PGRST116 is "Results contain 0 rows"
        throw error;
      }
      return (data as SesionCaja) || null;
    },
  });
}

export function useMovimientos(cajaId: string | null) {
  return useQuery({
    queryKey: ["caja", "movimientos", cajaId],
    queryFn: async () => {
      if (!cajaId) return [];
      const { data, error } = await supabase
        .from("movimientos")
        .select("*")
        .eq("caja_id", cajaId)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data as Movimiento[];
    },
    enabled: !!cajaId,
  });
}

// --- Mutations ---

export function useOpenSession() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ monto_apertura }: { monto_apertura: number }) => {
      const { data, error } = await supabase
        .from("sesiones_caja")
        .insert([
          {
            monto_apertura,
            estado: "Abierto",
            fecha_apertura: new Date().toISOString(),
          },
        ])
        .select()
        .single();

      if (error) throw error;
      return data as SesionCaja;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["caja", "activeSession"] });
    },
  });
}

export function useCloseSession() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, monto_cierre }: { id: string; monto_cierre: number }) => {
      const { data, error } = await supabase
        .from("sesiones_caja")
        .update({
          estado: "Cerrado",
          fecha_cierre: new Date().toISOString(),
          monto_cierre,
        })
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return data as SesionCaja;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["caja", "activeSession"] });
    },
  });
}

export function useAddMovimiento() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (movimiento: Omit<Movimiento, "id" | "created_at">) => {
      const { data, error } = await supabase
        .from("movimientos")
        .insert([movimiento])
        .select()
        .single();

      if (error) throw error;
      return data as Movimiento;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["caja", "movimientos", variables.caja_id] });
    },
  });
}
