import { createFileRoute, useRouter } from '@tanstack/react-router'
import { useForm } from 'react-hook-form'
import { useState } from 'react'
import { supabase } from '../lib/supabase'

export const Route = createFileRoute('/login')({
    component: LoginComponent,
})

type LoginFormInputs = {
    email: string
    password: Record<string, any> // Evitamos usar tipos complejos innecesariamente
}

function LoginComponent() {
    const router = useRouter()
    const [errorMsg, setErrorMsg] = useState<string | null>(null)
    const [loading, setLoading] = useState(false)

    const { register, handleSubmit } = useForm<LoginFormInputs>()

    const onSubmit = async (data: LoginFormInputs) => {
        setLoading(true)
        setErrorMsg(null)

        try {
            const { error } = await supabase.auth.signInWithPassword({
                email: data.email,
                password: String(data.password),
            })

            if (error) {
                setErrorMsg(error.message === 'Invalid login credentials'
                    ? 'Credenciales incorrectas. Verifica tu correo y contraseña.'
                    : error.message)
            } else {
                // Login exitoso: Redirigimos al Dashboard (ruta raíz) e invalidamos el router para refrescar el estado
                router.navigate({ to: '/' })
                router.invalidate()
            }
        } catch (err) {
            setErrorMsg('Ocurrió un error inesperado al intentar iniciar sesión.')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="flex min-h-screen items-center justify-center bg-background px-4">
            <div className="w-full max-w-md space-y-6 rounded-xl border border-outline-variant bg-surface-container-lowest p-8 shadow-md">
                <div className="text-center">
                    <h1 className="font-headline-md text-headline-md font-bold text-primary">OMVITAL</h1>
                    <p className="font-body-md text-body-md text-on-surface-variant mt-1">Sistema de Clínica Financiera</p>
                </div>

                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                    {errorMsg && (
                        <div className="rounded-lg bg-error-container p-3 text-sm text-error font-medium flex items-center gap-2">
                            <span className="material-symbols-outlined text-[18px]">error</span>
                            {errorMsg}
                        </div>
                    )}

                    <div>
                        <label className="block font-label-md text-label-md text-on-surface mb-1 font-bold">
                            Correo Electrónico
                        </label>
                        <input
                            type="email"
                            required
                            {...register('email')}
                            className="w-full bg-surface-container-low border border-outline-variant rounded-lg py-2 px-3 focus:ring-1 focus:ring-primary focus:border-primary outline-none text-body-md transition-all"
                            placeholder="correo@ejemplo.com"
                        />
                    </div>

                    <div>
                        <label className="block font-label-md text-label-md text-on-surface mb-1 font-bold">
                            Contraseña
                        </label>
                        <input
                            type="password"
                            required
                            {...register('password')}
                            className="w-full bg-surface-container-low border border-outline-variant rounded-lg py-2 px-3 focus:ring-1 focus:ring-primary focus:border-primary outline-none text-body-md transition-all"
                            placeholder="••••••••"
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full mt-6 rounded-lg bg-primary py-2.5 text-white font-bold hover:bg-primary-container transition-all active:scale-[0.98] disabled:opacity-50"
                    >
                        {loading ? 'Iniciando sesión...' : 'Ingresar'}
                    </button>
                </form>
            </div>
        </div>
    )
}