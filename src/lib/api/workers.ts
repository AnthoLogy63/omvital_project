import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { supabase } from "../supabase.server";

// Define output worker schema for TypeScript
export interface DbTrabajador {
  id: string;
  nombre: string;
  dni: string;
  rol: "Interno" | "Médico Externo" | "Jaladora";
  especialidad?: string | null;
  comision_rate: number;
  estado: "Activo" | "Inactivo";
  created_at: string;
}

export interface ReferenciadorDestacado {
  id: string;
  nombre: string;
  rol: "Interno" | "Médico Externo" | "Jaladora";
  especialidad?: string | null;
  pacientesCount: number;
}

// 1. Fetch workers
export const getTrabajadores = createServerFn({ method: "GET" })
  .handler(async (): Promise<DbTrabajador[]> => {
    const { data, error } = await supabase
      .from("trabajadores")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching workers from Supabase:", error);
      throw new Error(error.message);
    }

    return (data || []) as DbTrabajador[];
  });

// 2. Register worker
export const insertTrabajador = createServerFn({ method: "POST" })
  .validator(
    z.object({
      nombre: z.string().min(1, "El nombre es obligatorio"),
      dni: z.string().min(1, "El DNI es obligatorio"),
      rol: z.enum(["Interno", "Médico Externo", "Jaladora"]),
      especialidad: z.string().optional().nullable(),
      comision_rate: z.number().default(0),
      estado: z.enum(["Activo", "Inactivo"]).default("Activo"),
    })
  )
  .handler(async ({ data: input }): Promise<DbTrabajador> => {
    const { data, error } = await supabase
      .from("trabajadores")
      .insert([
        {
          nombre: input.nombre,
          dni: input.dni,
          rol: input.rol,
          especialidad: input.especialidad || null,
          comision_rate: input.comision_rate,
          estado: input.estado,
        },
      ])
      .select()
      .single();

    if (error) {
      console.error("Error inserting worker into Supabase:", error);
      throw new Error(error.message);
    }

    return data as DbTrabajador;
  });

// 3. Update worker details
export const updateTrabajador = createServerFn({ method: "POST" })
  .validator(
    z.object({
      id: z.string().min(1),
      nombre: z.string().min(1, "El nombre es obligatorio"),
      dni: z.string().min(1, "El DNI es obligatorio"),
      rol: z.enum(["Interno", "Médico Externo", "Jaladora"]),
      especialidad: z.string().optional().nullable(),
      comision_rate: z.number().default(0),
      estado: z.enum(["Activo", "Inactivo"]).default("Activo"),
    })
  )
  .handler(async ({ data: input }): Promise<DbTrabajador> => {
    const { data, error } = await supabase
      .from("trabajadores")
      .update({
        nombre: input.nombre,
        dni: input.dni,
        rol: input.rol,
        especialidad: input.especialidad || null,
        comision_rate: input.comision_rate,
        estado: input.estado,
      })
      .eq("id", input.id)
      .select()
      .single();

    if (error) {
      console.error("Error updating worker in Supabase:", error);
      throw new Error(error.message);
    }

    return data as DbTrabajador;
  });

// 4. Get featured referrers based on referred patient volume in last 30 days
export const getReferenciadoresDestacados = createServerFn({ method: "GET" })
  .handler(async (): Promise<ReferenciadorDestacado[]> => {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    // Get patients created in last 30 days that have a referrer
    const { data: patients, error: pError } = await supabase
      .from("pacientes")
      .select("referido_por_id, created_at")
      .gte("created_at", thirtyDaysAgo.toISOString())
      .not("referido_por_id", "is", null);

    if (pError) {
      console.error("Error fetching patients for referrers:", pError);
      throw new Error(pError.message);
    }

    // Get workers details
    const { data: workers, error: wError } = await supabase
      .from("trabajadores")
      .select("id, nombre, rol, especialidad");

    if (wError) {
      console.error("Error fetching workers for referrers:", wError);
      throw new Error(wError.message);
    }

    // Calculate count per worker
    const counts: Record<string, number> = {};
    patients.forEach((p) => {
      if (p.referido_por_id) {
        counts[p.referido_por_id] = (counts[p.referido_por_id] || 0) + 1;
      }
    });

    // Map, filter, sort and limit to top 3
    const featured = workers
      .map((w) => ({
        id: w.id,
        nombre: w.nombre,
        rol: w.rol as "Interno" | "Médico Externo" | "Jaladora",
        especialidad: w.especialidad as string | null | undefined,
        pacientesCount: counts[w.id] || 0,
      }))
      .filter((w) => w.pacientesCount > 0)
      .sort((a, b) => b.pacientesCount - a.pacientesCount)
      .slice(0, 3);

    return featured;
  });
