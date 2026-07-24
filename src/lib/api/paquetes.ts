import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { supabase } from "../supabase.server";

export interface DbPaqueteCliente {
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
    id: string;
    nombre: string;
    codigo: string | null;
  } | null;
  paquetes?: {
    id: string;
    nombre: string;
    cantidad_sesiones: number;
    precio_total: number;
  } | null;
}

export interface DbPaquete {
  id: string;
  nombre: string;
  descripcion?: string | null;
  cantidad_sesiones: number;
  precio_total: number;
  created_at: string;
}

export interface DbSesionPaciente {
  id: string;
  paquete_cliente_id: string;
  fecha: string;
  terapeuta_id: string;
  notas?: string | null;
  created_at: string;
  trabajadores?: {
    id: string;
    nombre: string;
  } | null;
}

// 1. Fetch package sales for listing
export const getPaquetesCliente = createServerFn({ method: "GET" }).handler(
  async (): Promise<DbPaqueteCliente[]> => {
    const { data, error } = await supabase
      .from("paquetes_cliente")
      .select(
        `
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
          id,
          nombre,
          codigo
        ),
        paquetes (
          id,
          nombre,
          cantidad_sesiones,
          precio_total
        )
      `,
      )
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching packages client from Supabase:", error);
      throw new Error(error.message);
    }
    return (data || []) as unknown as DbPaqueteCliente[];
  },
);

// 2. Fetch catalog of packages
export const getPaquetes = createServerFn({ method: "GET" }).handler(
  async (): Promise<DbPaquete[]> => {
    const { data, error } = await supabase
      .from("paquetes")
      .select("*")
      .order("nombre", { ascending: true });

    if (error) {
      console.error("Error fetching packages catalog from Supabase:", error);
      throw new Error(error.message);
    }
    return (data || []) as DbPaquete[];
  },
);

// 3. Register a new sale of package
export const insertPaqueteCliente = createServerFn({ method: "POST" })
  .validator(
    z.object({
      paciente_id: z.string().uuid("ID de paciente inválido"),
      paquete_id: z.string().uuid("ID de paquete inválido"),
      precio_venta: z.number().positive("El precio de venta debe ser positivo"),
      pagado: z.number().nonnegative("El monto pagado no puede ser negativo"),
      metodo: z.enum(["Efectivo", "Yape", "Plin", "Transferencia", "Tarjeta"]).optional(),
    }),
  )
  .handler(async ({ data: input }): Promise<DbPaqueteCliente> => {
    // Check if there is an active session of cash if initial payment is made
    let activeCajaId: string | null = null;
    if (input.pagado > 0) {
      const { data: activeCaja, error: cajaError } = await supabase
        .from("sesiones_caja")
        .select("id")
        .eq("estado", "Abierto")
        .order("created_at", { ascending: false })
        .limit(1);

      if (cajaError) {
        console.error("Error checking active cash session:", cajaError);
        throw new Error("Error al validar sesión de caja.");
      }

      if (!activeCaja || activeCaja.length === 0) {
        throw new Error(
          "No hay una sesión de caja abierta. Debe abrir caja antes de registrar un pago inicial.",
        );
      }
      activeCajaId = activeCaja[0].id;
    }

    const deuda = input.precio_venta - input.pagado;
    if (deuda < 0) {
      throw new Error("El monto pagado no puede ser mayor al precio de venta.");
    }

    let estado: "Al día" | "Deuda" | "Parcial" = "Deuda";
    if (deuda === 0) {
      estado = "Al día";
    } else if (input.pagado > 0) {
      estado = "Parcial";
    }

    // Insert new record in paquetes_cliente
    const { data: newSale, error: saleError } = await supabase
      .from("paquetes_cliente")
      .insert([
        {
          paciente_id: input.paciente_id,
          paquete_id: input.paquete_id,
          precio_venta: input.precio_venta,
          pagado: input.pagado,
          deuda: deuda,
          estado: estado,
          sesiones_realizadas: 0,
        },
      ])
      .select(
        `
        *,
        pacientes (
          id,
          nombre,
          codigo
        ),
        paquetes (
          id,
          nombre,
          cantidad_sesiones,
          precio_total
        )
      `,
      )
      .single();

    if (saleError) {
      console.error("Error inserting packages client into Supabase:", saleError);
      throw new Error(saleError.message);
    }

    const createdSale = newSale as unknown as DbPaqueteCliente;

    // Insert movement in movimientos if pagado > 0
    if (input.pagado > 0 && activeCajaId) {
      const pacienteNombre = createdSale.pacientes?.nombre || "Paciente";
      const paqueteNombre = createdSale.paquetes?.nombre || "Paquete";
      const { error: movError } = await supabase.from("movimientos").insert([
        {
          caja_id: activeCajaId,
          tipo: "Ingreso",
          concepto: `Pago Inicial Paquete - ${pacienteNombre} (${paqueteNombre})`,
          categoria: "Paquete",
          metodo: input.metodo || "Efectivo",
          monto: input.pagado,
          estado: "Completado",
          paquete_cliente_id: createdSale.id,
        },
      ]);

      if (movError) {
        console.error("Error creating cash movement for initial payment:", movError);
        throw new Error(
          `Venta registrada, pero falló el registro del movimiento de caja: ${movError.message}`,
        );
      }
    }

    return createdSale;
  });

// 4. Register a payment (amortización)
export const insertPagoPaqueteCliente = createServerFn({ method: "POST" })
  .validator(
    z.object({
      paquete_cliente_id: z.string().uuid("ID de paquete cliente inválido"),
      monto: z.number().positive("El monto de pago debe ser positivo"),
      metodo: z.enum(["Efectivo", "Yape", "Plin", "Transferencia", "Tarjeta"]),
    }),
  )
  .handler(async ({ data: input }): Promise<unknown> => {
    // Check if there is an active session of cash
    const { data: activeCaja, error: cajaError } = await supabase
      .from("sesiones_caja")
      .select("id")
      .eq("estado", "Abierto")
      .order("created_at", { ascending: false })
      .limit(1);

    if (cajaError) {
      console.error("Error checking active cash session:", cajaError);
      throw new Error("Error al validar sesión de caja.");
    }

    if (!activeCaja || activeCaja.length === 0) {
      throw new Error(
        "No hay una sesión de caja abierta. Debe abrir caja antes de registrar un pago.",
      );
    }
    const activeCajaId = activeCaja[0].id;

    // Fetch current package state
    const { data: sale, error: fetchError } = await supabase
      .from("paquetes_cliente")
      .select(
        `
        *,
        pacientes (
          id,
          nombre
        ),
        paquetes (
          id,
          nombre
        )
      `,
      )
      .eq("id", input.paquete_cliente_id)
      .single();

    if (fetchError || !sale) {
      console.error("Error fetching package client for payment:", fetchError);
      throw new Error("No se encontró el paquete del cliente especificado.");
    }

    const currentSale = sale as {
      pagado: number;
      deuda: number;
      pacientes: { nombre: string } | null;
      paquetes: { nombre: string } | null;
    };
    const newPagado = Number(currentSale.pagado) + input.monto;
    const newDeuda = Number(currentSale.deuda) - input.monto;

    if (newDeuda < 0) {
      throw new Error(
        `El monto del pago ($${input.monto}) excede la deuda actual ($${currentSale.deuda}).`,
      );
    }

    let estado: "Al día" | "Deuda" | "Parcial" = "Deuda";
    if (newDeuda === 0) {
      estado = "Al día";
    } else if (newPagado > 0) {
      estado = "Parcial";
    }

    // Update package client
    const { data: updatedSale, error: updateError } = await supabase
      .from("paquetes_cliente")
      .update({
        pagado: newPagado,
        deuda: newDeuda,
        estado: estado,
      })
      .eq("id", input.paquete_cliente_id)
      .select()
      .single();

    if (updateError) {
      console.error("Error updating package client payment:", updateError);
      throw new Error(updateError.message);
    }

    // Insert into movements
    const pacienteNombre = currentSale.pacientes?.nombre || "Paciente";
    const paqueteNombre = currentSale.paquetes?.nombre || "Paquete";
    const { error: movError } = await supabase.from("movimientos").insert([
      {
        caja_id: activeCajaId,
        tipo: "Ingreso",
        concepto: `Abono Paquete - ${pacienteNombre} (${paqueteNombre})`,
        categoria: "Paquete",
        metodo: input.metodo,
        monto: input.monto,
        estado: "Completado",
        paquete_cliente_id: input.paquete_cliente_id,
      },
    ]);

    if (movError) {
      console.error("Error creating cash movement for payment:", movError);
      throw new Error(
        `Pago registrado, pero falló el registro del movimiento de caja: ${movError.message}`,
      );
    }

    return updatedSale;
  });

// 5. Register session attendance
export const insertSesionPaciente = createServerFn({ method: "POST" })
  .validator(
    z.object({
      paquete_cliente_id: z.string().uuid("ID de paquete cliente inválido"),
      terapeuta_id: z.string().uuid("ID de terapeuta inválido"),
      notas: z.string().optional().nullable(),
    }),
  )
  .handler(async ({ data: input }): Promise<unknown> => {
    // Fetch package client status
    const { data: sale, error: fetchError } = await supabase
      .from("paquetes_cliente")
      .select(
        `
        id,
        sesiones_realizadas,
        paquetes (
          cantidad_sesiones
        )
      `,
      )
      .eq("id", input.paquete_cliente_id)
      .single();

    if (fetchError || !sale) {
      console.error("Error fetching package client for session:", fetchError);
      throw new Error("No se encontró el paquete del cliente especificado.");
    }

    const currentSale = sale as {
      id: string;
      sesiones_realizadas: number;
      paquetes: { cantidad_sesiones: number } | null;
    };
    const totalSesiones = currentSale.paquetes?.cantidad_sesiones || 0;
    if (currentSale.sesiones_realizadas >= totalSesiones) {
      throw new Error("El paciente ya completó todas las sesiones de este paquete.");
    }

    // Insert record in sesiones_paciente
    const { data: newSesion, error: insertError } = await supabase
      .from("sesiones_paciente")
      .insert([
        {
          paquete_cliente_id: input.paquete_cliente_id,
          terapeuta_id: input.terapeuta_id,
          notas: input.notas || null,
        },
      ])
      .select()
      .single();

    if (insertError) {
      console.error("Error inserting patient session:", insertError);
      throw new Error(insertError.message);
    }

    // Update paquetes_cliente sesiones_realizadas count
    const { error: updateError } = await supabase
      .from("paquetes_cliente")
      .update({
        sesiones_realizadas: currentSale.sesiones_realizadas + 1,
      })
      .eq("id", input.paquete_cliente_id);

    if (updateError) {
      console.error("Error incrementing sessions count:", updateError);
      throw new Error(updateError.message);
    }

    return newSesion;
  });

// 6. Fetch sessions history for a package
export const getSesionesPaciente = createServerFn({ method: "GET" })
  .validator(z.string().uuid("ID de paquete cliente inválido"))
  .handler(async ({ data: id }): Promise<DbSesionPaciente[]> => {
    const { data, error } = await supabase
      .from("sesiones_paciente")
      .select(
        `
        id,
        paquete_cliente_id,
        fecha,
        terapeuta_id,
        notas,
        created_at,
        trabajadores (
          id,
          nombre
        )
      `,
      )
      .eq("paquete_cliente_id", id)
      .order("fecha", { ascending: false });

    if (error) {
      console.error("Error fetching sessions history from Supabase:", error);
      throw new Error(error.message);
    }

    return (data || []) as unknown as DbSesionPaciente[];
  });
