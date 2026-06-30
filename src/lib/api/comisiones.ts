import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { supabase } from "../supabase.server";

export interface DbComision {
  id: string;
  trabajador_id: string;
  paciente_id: string;
  monto: number;
  estado: "Pendiente" | "Pagado";
  movimiento_id: string | null;
  fecha_comision: string;
  created_at: string;
  trabajadores?: {
    id: string;
    nombre: string;
    rol: "Interno" | "Médico Externo" | "Jaladora";
    estado: "Activo" | "Inactivo";
  } | null;
  pacientes?: {
    id: string;
    nombre: string;
  } | null;
  movimientos?: {
    id: string;
    metodo: "Efectivo" | "Yape" | "Plin" | "Transferencia" | "Tarjeta";
    created_at: string;
  } | null;
}

export interface DbPaciente {
  id: string;
  nombre: string;
}

// 1. Fetch comisiones joining trabajadores, pacientes, and movements
export const getComisiones = createServerFn({ method: "GET" }).handler(
  async (): Promise<DbComision[]> => {
    const { data, error } = await supabase
      .from("comisiones")
      .select(
        `
        id,
        trabajador_id,
        paciente_id,
        monto,
        estado,
        movimiento_id,
        fecha_comision,
        created_at,
        trabajadores (
          id,
          nombre,
          rol,
          estado
        ),
        pacientes (
          id,
          nombre
        ),
        movimientos (
          id,
          metodo,
          created_at
        )
      `,
      )
      .order("fecha_comision", { ascending: false });

    if (error) {
      console.error("Error fetching commissions from Supabase:", error);
      throw new Error(error.message);
    }

    return (data || []) as any as DbComision[];
  },
);

// 2. Insert commission
export const insertComision = createServerFn({ method: "POST" })
  .validator(
    z.object({
      trabajador_id: z.string().uuid("ID de trabajador inválido"),
      paciente_id: z.string().uuid("ID de paciente inválido"),
      monto: z.number().positive("El monto debe ser positivo"),
      fecha_comision: z.string(),
      estado: z.enum(["Pendiente", "Pagado"]).default("Pendiente"),
    }),
  )
  .handler(async ({ data: input }): Promise<DbComision> => {
    const { data, error } = await supabase
      .from("comisiones")
      .insert([
        {
          trabajador_id: input.trabajador_id,
          paciente_id: input.paciente_id,
          monto: input.monto,
          fecha_comision: input.fecha_comision,
          estado: input.estado,
        },
      ])
      .select()
      .single();

    if (error) {
      console.error("Error inserting commission into Supabase:", error);
      throw new Error(error.message);
    }

    return data as DbComision;
  });

// 3. Mark commission status (e.g. Paid)
export const updateComisionEstado = createServerFn({ method: "POST" })
  .validator(
    z.object({
      id: z.string().uuid(),
      estado: z.enum(["Pendiente", "Pagado"]),
    }),
  )
  .handler(async ({ data: input }) => {
    const { data, error } = await supabase
      .from("comisiones")
      .update({
        estado: input.estado,
      })
      .eq("id", input.id)
      .select()
      .single();

    if (error) {
      console.error("Error updating commission status in Supabase:", error);
      throw new Error(error.message);
    }

    return data;
  });

// 4. Fetch patient list
export const getPacientes = createServerFn({ method: "GET" }).handler(
  async (): Promise<DbPaciente[]> => {
    const { data, error } = await supabase
      .from("pacientes")
      .select("id, nombre")
      .order("nombre", { ascending: true });

    if (error) {
      console.error("Error fetching patients from Supabase:", error);
      throw new Error(error.message);
    }

    return (data || []) as DbPaciente[];
  },
);

// 5. Delete commission
export const deleteComision = createServerFn({ method: "POST" })
  .validator(
    z.object({
      id: z.string().uuid("ID de comisión inválido"),
    }),
  )
  .handler(async ({ data: input }) => {
    const { error } = await supabase.from("comisiones").delete().eq("id", input.id);

    if (error) {
      console.error("Error deleting commission from Supabase:", error);
      throw new Error(error.message);
    }

    return { success: true };
  });
