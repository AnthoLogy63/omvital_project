import { createClient } from '@supabase/supabase-js'

// En TanStack Start con Vite, process.env puede estar disponible en ciertos entornos,
// pero si viene del servidor o compilación mixta, aseguramos capturar ambas opciones:
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://pudsbrahsvpwtpecalcj.supabase.co'
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'sb_publishable_hj8OvtCmO8qHIqHaVdWRqA_QQBJgE9P'

if (!supabaseUrl || !supabaseAnonKey) {
    console.warn("⚠️ ¡Faltan las variables de entorno de Supabase en el cliente!")
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true
    }
})