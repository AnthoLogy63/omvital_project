import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { supabase } from "../supabase.server";

export interface DbMovimiento {
  id: string;
  caja_id: string;
  tipo: "Ingreso" | "Egreso";
  concepto: string;
  categoria: string | null;
  metodo: "Efectivo" | "Yape" | "Plin" | "Transferencia" | "Tarjeta";
  monto: number;
  estado: string;
  nota: string | null;
  paquete_cliente_id?: string | null;
  created_at: string;
}

// Internal helper to get the active box session, or create one if none exists
async function getOrCreateActiveCajaId(): Promise<string> {
  const { data: activeCaja, error: selectError } = await supabase
    .from("sesiones_caja")
    .select("id")
    .eq("estado", "Abierto")
    .order("fecha_apertura", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (selectError) {
    console.error("Error fetching active caja session:", selectError);
    throw new Error(selectError.message);
  }

  if (activeCaja) {
    return activeCaja.id;
  }

  // Create a new box session if none exists
  const { data: newCaja, error: insertError } = await supabase
    .from("sesiones_caja")
    .insert([
      {
        monto_apertura: 0.00,
        estado: "Abierto",
      },
    ])
    .select("id")
    .single();

  if (insertError) {
    console.error("Error creating active caja session:", insertError);
    throw new Error(insertError.message);
  }

  return newCaja.id;
}

// 1. Fetch all movements
export const getMovements = createServerFn({ method: "GET" })
  .handler(async (): Promise<DbMovimiento[]> => {
    const { data, error } = await supabase
      .from("movimientos")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching movements from Supabase:", error);
      throw new Error(error.message);
    }

    return (data || []) as DbMovimiento[];
  });

// 2. Insert new movement
export const insertMovement = createServerFn({ method: "POST" })
  .validator(
    z.object({
      tipo: z.enum(["Ingreso", "Egreso"]),
      concepto: z.string().min(1, "El concepto es obligatorio"),
      categoria: z.string().nullable().optional(),
      metodo: z.enum(["Efectivo", "Yape", "Plin", "Transferencia", "Tarjeta"]),
      monto: z.number().positive("El monto debe ser mayor a 0"),
      estado: z.string().default("Completado"),
      nota: z.string().nullable().optional(),
    })
  )
  .handler(async ({ data: input }): Promise<DbMovimiento> => {
    const cajaId = await getOrCreateActiveCajaId();

    const { data, error } = await supabase
      .from("movimientos")
      .insert([
        {
          caja_id: cajaId,
          tipo: input.tipo,
          concepto: input.concepto,
          categoria: input.categoria || null,
          metodo: input.metodo,
          monto: input.monto,
          estado: input.estado,
          nota: input.nota || null,
        },
      ])
      .select()
      .single();

    if (error) {
      console.error("Error inserting movement into Supabase:", error);
      throw new Error(error.message);
    }

    return data as DbMovimiento;
  });

// 3. Update movement details
export const updateMovement = createServerFn({ method: "POST" })
  .validator(
    z.object({
      id: z.string().min(1),
      tipo: z.enum(["Ingreso", "Egreso"]),
      concepto: z.string().min(1, "El concepto es obligatorio"),
      categoria: z.string().nullable().optional(),
      metodo: z.enum(["Efectivo", "Yape", "Plin", "Transferencia", "Tarjeta"]),
      monto: z.number().positive("El monto debe ser mayor a 0"),
      estado: z.string().default("Completado"),
      nota: z.string().nullable().optional(),
    })
  )
  .handler(async ({ data: input }): Promise<DbMovimiento> => {
    const { data, error } = await supabase
      .from("movimientos")
      .update({
        tipo: input.tipo,
        concepto: input.concepto,
        categoria: input.categoria || null,
        metodo: input.metodo,
        monto: input.monto,
        estado: input.estado,
        nota: input.nota || null,
      })
      .eq("id", input.id)
      .select()
      .single();

    if (error) {
      console.error("Error updating movement in Supabase:", error);
      throw new Error(error.message);
    }

    return data as DbMovimiento;
  });

// 4. Delete movement
export const deleteMovement = createServerFn({ method: "POST" })
  .validator(
    z.object({
      id: z.string().min(1),
    })
  )
  .handler(async ({ data: input }): Promise<{ success: boolean }> => {
    const { error } = await supabase
      .from("movimientos")
      .delete()
      .eq("id", input.id);

    if (error) {
      console.error("Error deleting movement in Supabase:", error);
      throw new Error(error.message);
    }

    return { success: true };
  });

// 5. Get last closed caja closure details
export const getLatestCajaCierre = createServerFn({ method: "GET" })
  .handler(async (): Promise<{ fecha_cierre: string | null } | null> => {
    const { data, error } = await supabase
      .from("sesiones_caja")
      .select("fecha_cierre")
      .eq("estado", "Cerrado")
      .order("fecha_cierre", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (error) {
      console.error("Error fetching latest caja closure:", error);
      return null;
    }

    return data;
  });
