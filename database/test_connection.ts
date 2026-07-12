import { createClient } from "@supabase/supabase-js";

// Bun carga automáticamente el archivo .env
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY;

console.log("=== OMVITAL Supabase Connection Test ===");
console.log(`URL: ${supabaseUrl}`);
console.log(`Key length: ${supabaseKey?.length ?? 0} characters`);

if (!supabaseUrl || !supabaseKey) {
  console.error("❌ Error: SUPABASE_URL o SUPABASE_ANON_KEY no están definidos en el entorno.");
  process.exit(1);
}

// 1. Inicializar cliente
console.log("\n1. Inicializando cliente Supabase...");
const supabase = createClient(supabaseUrl, supabaseKey);
console.log("✅ Cliente inicializado correctamente.");

// 2. Probar conexión básica mediante Fetch HTTP simple al endpoint de REST
console.log("\n2. Probando conexión HTTP directa a la API REST de Supabase...");
try {
  const restUrl = `${supabaseUrl}/rest/v1/`;
  const response = await fetch(restUrl, {
    headers: {
      apikey: supabaseKey,
    },
  });

  if (response.ok) {
    console.log(`✅ Conexión HTTP exitosa. Status: ${response.status} ${response.statusText}`);
    const data = await response.json();
    console.log("Info del Servidor REST (Swagger/OpenAPI): Detectado correctamente.");
  } else {
    console.warn(`⚠️ Respuesta del servidor REST no OK: ${response.status} ${response.statusText}`);
  }
} catch (err) {
  console.error("❌ Falló la conexión HTTP directa:", err);
}

// 3. Probar consulta de datos en la tabla trabajadores (Lectura con RLS)
console.log("\n3. Intentando consultar tabla 'trabajadores'...");
try {
  const { data, error, status } = await supabase
    .from("trabajadores")
    .select("id, nombre, rol")
    .limit(5);

  if (error) {
    console.log(`❌ Error devuelto por Supabase al consultar 'trabajadores':`, error);
  } else {
    console.log(`✅ Consulta a 'trabajadores' completada. Status HTTP: ${status}`);
    console.log(`Filas retornadas (anon/no autenticado): ${data.length}`);
    console.log("Datos obtenidos:", data);
  }
} catch (err) {
  console.error("❌ Excepción al intentar consultar 'trabajadores':", err);
}

console.log("\n=== Fin de la prueba de conexión ===");
