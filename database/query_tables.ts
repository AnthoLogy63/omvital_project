import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.SUPABASE_URL;
// Use service role key to bypass RLS and view all data
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error("Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function main() {
  console.log("=== Querying database status ===");

  // 1. Check trabajadores
  const { data: workers, error: wErr } = await supabase.from("trabajadores").select("id, nombre, rol");
  if (wErr) console.error("Error trabajadores:", wErr);
  else console.log("Trabajadores count:", workers.length, workers);

  // 2. Check sesiones_caja
  const { data: cajas, error: cErr } = await supabase.from("sesiones_caja").select("*");
  if (cErr) console.error("Error sesiones_caja:", cErr);
  else console.log("Sesiones Caja count:", cajas.length, cajas);

  // 3. Check movimientos
  const { data: movs, error: mErr } = await supabase.from("movimientos").select("*");
  if (mErr) console.error("Error movimientos:", mErr);
  else console.log("Movimientos count:", movs.length, movs);
}

main();
