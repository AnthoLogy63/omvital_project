import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error(
    "❌ Error: SUPABASE_URL o SUPABASE_SERVICE_ROLE_KEY/SUPABASE_ANON_KEY no están definidos.",
  );
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

export const basePackages = [
  {
    id: "a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d",
    nombre: "Paquete Básico (5 Sesiones)",
    descripcion: "5 sesiones de rehabilitación física y tratamiento focalizado",
    cantidad_sesiones: 5,
    precio_total: 250.0,
  },
  {
    id: "b2c3d4e5-f6a7-8b9c-0d1e-2f3a4b5c6d7e",
    nombre: "Paquete Intenso (10 Sesiones)",
    descripcion: "10 sesiones de rehabilitación integral con seguimiento continuo",
    cantidad_sesiones: 10,
    precio_total: 450.0,
  },
  {
    id: "c3d4e5f6-a7b8-9c0d-1e2f-3a4b5c6d7e8f",
    nombre: "Paquete Integral OMVITAL (15 Sesiones)",
    descripcion: "15 sesiones de fisioterapia avanzada y reevaluación médica",
    cantidad_sesiones: 15,
    precio_total: 650.0,
  },
  {
    id: "d4e5f6a7-b8c9-0d1e-2f3a-4b5c6d7e8f9a",
    nombre: "Paquete Preventivo (3 Sesiones)",
    descripcion: "3 sesiones de evaluación y terapia preventiva",
    cantidad_sesiones: 3,
    precio_total: 150.0,
  },
  {
    id: "e5f6a7b8-c90d-1e2f-3a4b-5c6d7e8f9a0b",
    nombre: "Paquete Especializado Senior (8 Sesiones)",
    descripcion: "8 sesiones de fisioterapia para adultos mayores y fortalecimiento",
    cantidad_sesiones: 8,
    precio_total: 380.0,
  },
];

async function runSeed() {
  console.log("🌱 Iniciando seed del catálogo de paquetes en Supabase...");
  const { data, error } = await supabase
    .from("paquetes")
    .upsert(basePackages, { onConflict: "id" })
    .select();

  if (error) {
    console.error("❌ Error al poblar paquetes:", error.message);
    process.exit(1);
  }

  console.log(
    `✅ ¡Éxito! Se han registrado/actualizado ${data.length} paquetes base en el catálogo:`,
  );
  data.forEach((pkg) => {
    console.log(`  - [${pkg.nombre}] ${pkg.cantidad_sesiones} sesiones | $${pkg.precio_total}`);
  });
}

runSeed();
