import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet,
  Link,
  createRootRouteWithContext,
  useRouter,
  useRouterState,
  HeadContent,
  Scripts,
  redirect,
} from "@tanstack/react-router";
import { useEffect, type ReactNode } from "react";

import appCss from "../styles.css?url";
import { reportLovableError } from "../lib/lovable-error-reporting";

const TAILWIND_CONFIG = `
tailwind.config = {
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        "on-secondary": "#ffffff","tertiary-fixed": "#ffdcc6","primary-container": "#1f5aa6",
        "on-primary-fixed-variant": "#00468c","on-secondary-fixed": "#00201d","on-primary-fixed": "#001b3e",
        "primary-fixed-dim": "#a9c7ff","error-container": "#ffdad6","surface-tint": "#245eaa",
        "surface-container-highest": "#e1e2e9","surface-container-lowest": "#ffffff","tertiary": "#6c3400",
        "tertiary-container": "#8f4700","primary": "#004286","secondary": "#346761","on-tertiary": "#ffffff",
        "surface-bright": "#f9f9ff","on-secondary-container": "#396b65","outline-variant": "#c2c6d3",
        "surface-dim": "#d9d9e0","on-tertiary-fixed-variant": "#713700","surface-container-low": "#f3f3fa",
        "tertiary-fixed-dim": "#ffb784","on-primary": "#ffffff","on-error-container": "#93000a",
        "surface-container": "#ededf4","secondary-fixed-dim": "#9cd1c9","outline": "#737782",
        "inverse-surface": "#2e3036","background": "#f9f9ff","secondary-fixed": "#b8ede5",
        "inverse-on-surface": "#f0f0f7","on-error": "#ffffff","surface-container-high": "#e7e8ef",
        "secondary-container": "#b5eae2","on-tertiary-container": "#ffc7a2","error": "#ba1a1a",
        "on-tertiary-fixed": "#301400","on-secondary-fixed-variant": "#194f49","on-background": "#191c21",
        "primary-fixed": "#d6e3ff","surface-variant": "#e1e2e9","on-primary-container": "#bdd3ff",
        "on-surface": "#191c21","surface": "#f9f9ff","inverse-primary": "#a9c7ff",
        "on-surface-variant": "#424751"
      },
      borderRadius: { DEFAULT: "0.125rem", lg: "0.25rem", xl: "0.5rem", full: "0.75rem" },
      spacing: {
        container_padding: "2rem", stack_sm: "0.5rem", stack_md: "1rem", stack_lg: "1.5rem",
        gutter: "1.5rem", sidebar_width: "260px", topbar_height: "64px"
      },
      fontFamily: {
        "headline-lg-mobile": ["Inter"], "title-lg": ["Inter"], "body-lg": ["Inter"],
        "display-lg": ["Inter"], "body-md": ["Inter"], "headline-sm": ["Inter"],
        "headline-md": ["Inter"], "label-md": ["Inter"], "caption": ["Inter"]
      },
      fontSize: {
        "headline-lg-mobile": ["24px", { lineHeight: "32px", fontWeight: "600" }],
        "title-lg": ["18px", { lineHeight: "24px", fontWeight: "500" }],
        "body-lg": ["16px", { lineHeight: "24px", fontWeight: "400" }],
        "display-lg": ["32px", { lineHeight: "40px", letterSpacing: "-0.02em", fontWeight: "600" }],
        "body-md": ["14px", { lineHeight: "20px", fontWeight: "400" }],
        "headline-sm": ["20px", { lineHeight: "28px", fontWeight: "600" }],
        "headline-md": ["24px", { lineHeight: "32px", letterSpacing: "-0.01em", fontWeight: "600" }],
        "label-md": ["13px", { lineHeight: "18px", letterSpacing: "0.05em", fontWeight: "500" }],
        "caption": ["12px", { lineHeight: "16px", fontWeight: "400" }]
      }
    }
  }
}
`;

function NotFoundComponent() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-7xl font-bold">404</h1>
        <p className="mt-2 text-sm text-on-surface-variant">Página no encontrada.</p>
        <Link to="/" className="mt-6 inline-flex rounded-lg bg-primary px-4 py-2 text-white">Ir al inicio</Link>
      </div>
    </div>
  );
}

function ErrorComponent({ error, reset }: { error: Error; reset: () => void }) {
  console.error(error);
  const router = useRouter();
  useEffect(() => { reportLovableError(error, { boundary: "tanstack_root_error_component" }); }, [error]);
  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <div className="max-w-md text-center">
        <h1 className="text-xl font-semibold">Algo salió mal</h1>
        <div className="mt-6 flex justify-center gap-2">
          <button onClick={() => { router.invalidate(); reset(); }} className="rounded-lg bg-primary px-4 py-2 text-white">Reintentar</button>
          <a href="/" className="rounded-lg border px-4 py-2">Inicio</a>
        </div>
      </div>
    </div>
  );
}

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  beforeLoad: async ({ location }) => {
    // Si la persona intenta ir a login se permite sin trabas
    if (location.pathname === '/login') return

    const { supabase } = await import('../lib/supabase')
    const { data } = await supabase.auth.getSession()

    // Si no hay una sesión activa, se manda a la pantalla de login
    if (!data.session) {
      throw redirect({
        to: '/login',
        search: {
          redirect: location.href,
        },
      })
    }
  },
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "OMVITAL" },
      { name: "description", content: "OMVITAL - Sistema de Clínica Financiera" },
      { property: "og:title", content: "OMVITAL" },
      { name: "twitter:title", content: "OMVITAL" },
      { property: "og:description", content: "OMVITAL - Sistema de Clínica Financiera" },
      { name: "twitter:description", content: "OMVITAL - Sistema de Clínica Financiera" },
      { property: "og:image", content: "https://pub-bb2e103a32db4e198524a2e9ed8f35b4.r2.dev/1dc316db-caf2-4f19-b331-8f3c749ca3cd/id-preview-a6ec819b--54484d19-c8ce-4240-82eb-4b2ac16f78bd.lovable.app-1781454030134.png" },
      { name: "twitter:image", content: "https://pub-bb2e103a32db4e198524a2e9ed8f35b4.r2.dev/1dc316db-caf2-4f19-b331-8f3c749ca3cd/id-preview-a6ec819b--54484d19-c8ce-4240-82eb-4b2ac16f78bd.lovable.app-1781454030134.png" },
      { name: "twitter:card", content: "summary_large_image" },
      { property: "og:type", content: "website" },
    ],
    links: [
      { rel: "stylesheet", href: appCss },
      { rel: "stylesheet", href: "https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap" },
      { rel: "stylesheet", href: "https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap" },
    ],
    scripts: [
      { src: "https://cdn.tailwindcss.com?plugins=forms,container-queries" },
      { children: TAILWIND_CONFIG },
    ],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent,
});

function RootShell({ children }: { children: ReactNode }) {
  return (
    <html lang="es">
      <head>
        <HeadContent />
      </head>
      <body className="bg-background text-on-surface overflow-hidden">
        {children}
        <Scripts />
      </body>
    </html>
  );
}

const NAV = [
  { to: "/", label: "Dashboard", icon: "dashboard" },
  { to: "/caja", label: "Caja", icon: "account_balance_wallet" },
  { to: "/paquetes", label: "Paquetes", icon: "inventory_2" },
  { to: "/comisiones", label: "Comisiones", icon: "percent" },
  { to: "/movimientos", label: "Movimientos", icon: "swap_horiz" },
  { to: "/reportes", label: "Reportes", icon: "assessment" },
  { to: "/trabajadores", label: "Trabajadores", icon: "badge" },
] as const;

function Sidebar() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const router = useRouter();
  return (
    <aside className="fixed left-0 top-0 h-full w-[260px] border-r border-primary flex flex-col z-50 overflow-y-auto bg-primary-container">
      <div className="px-6 py-8">
        <h1 className="font-title-lg text-title-lg font-bold text-white">OMVITAL</h1>
        <p className="font-body-md text-body-md text-primary-fixed-dim">Financial Clinic System</p>
      </div>
      <nav className="flex-1 px-2 space-y-1">
        {NAV.map((item) => {
          const active = item.to === "/" ? pathname === "/" : pathname.startsWith(item.to);
          return (
            <Link
              key={item.to}
              to={item.to}
              className={
                active
                  ? "flex items-center px-4 py-3 border-l-4 border-white bg-white/10 text-white font-bold transition-all duration-100 active:scale-95 hover:bg-white/10"
                  : "flex items-center px-4 py-3 transition-colors duration-200 text-white hover:bg-white/10"
              }
            >
              <span className="material-symbols-outlined mr-3">{item.icon}</span>
              <span className="font-label-md text-label-md">{item.label}</span>
            </Link>
          );
        })}
      </nav>
      <div className="px-2 py-4 border-t border-primary">
        <a className="flex items-center px-4 py-3 hover:bg-white/10 transition-colors duration-200 text-white" href="#">
          <span className="material-symbols-outlined mr-3">settings</span>
          <span className="font-label-md text-label-md">Configuración</span>
        </a>
        <button
          onClick={async () => {
            const { supabase } = await import('../lib/supabase')
            await supabase.auth.signOut()
            router.navigate({ to: '/login' })
            router.invalidate()
          }}
          className="w-full flex items-center px-4 py-3 hover:bg-white/10 transition-colors duration-200 text-white cursor-pointer text-left"
        >
          <span className="material-symbols-outlined mr-3">logout</span>
          <span className="font-label-md text-label-md">Cerrar Sesión</span>
        </button>
      </div>
    </aside>
  );
}

function TopBar() {
  return (
    <header className="fixed top-0 right-0 h-[64px] w-[calc(100%-260px)] bg-surface/90 backdrop-blur-sm border-b border-outline-variant flex items-center justify-between px-8 z-40">
      <div className="flex items-center flex-1 max-w-xl">
        <div className="relative w-full">
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant">search</span>
          <input className="w-full bg-surface-container-low border border-outline-variant rounded-lg py-1.5 pl-10 pr-4 focus:ring-1 focus:ring-primary focus:border-primary outline-none text-body-md transition-all" placeholder="Buscar pacientes, transacciones..." type="text" />
        </div>
      </div>
      <div className="flex items-center gap-6">
        <div className="flex items-center gap-4">
          <button className="relative p-2 text-on-surface-variant hover:text-primary transition-all active:opacity-70">
            <span className="material-symbols-outlined">notifications</span>
            <span className="absolute top-2 right-2 w-2 h-2 bg-error rounded-full"></span>
          </button>
          <button className="p-2 text-on-surface-variant hover:text-primary transition-all active:opacity-70">
            <span className="material-symbols-outlined">help</span>
          </button>
        </div>
        <div className="h-8 w-px bg-outline-variant"></div>
        <div className="flex items-center gap-3 cursor-pointer group">
          <div className="text-right hidden sm:block">
            <p className="font-label-md text-label-md text-on-surface font-bold">Dr. Armando Casas</p>
            <p className="font-caption text-caption text-on-surface-variant">Administrador</p>
          </div>
          <img alt="Administrador" className="w-10 h-10 rounded-full border border-outline-variant object-cover" src="https://lh3.googleusercontent.com/aida-public/AB6AXuAGxGuSpawvtWTnaiZRbsoO_InEitpMxLx1P5w9HDNHPOvwcIP164yS2o01mm6nsnFp4BS3rshBIxjSnt8ZUQJmuq6cCddwz6whmVKRzEpaGxd8UhcraEcsLK99K0snM25Qys2N3ONvCTEXg_i7PH483mnhvAO4S4ATJe4nZPLjPKkmgYqXVNabrW_FwcAzzb8hI908jhLmYEoHsN4CNF0taUIaygoHWvnZlnEvcxeB2mXV7HBme8MG2h4Hm69ZuX4Z9B8CBZe-5cE" />
        </div>
      </div>
    </header>
  );
}

function RootComponent() {
  const { queryClient } = Route.useRouteContext();
  // Evaluamos la ruta actual del sistema
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const isLoginPage = pathname === '/login';

  return (
    <QueryClientProvider client={queryClient}>
      {isLoginPage ? (
        // Si está en el login, renderiza el contenido limpio sin barras laterales ni superiores
        <main className="w-full min-h-screen bg-background overflow-y-auto">
          <Outlet />
        </main>
      ) : (
        // Si es cualquier otra página, mantiene el Layout con Sidebar y TopBar para tus compañeros
        <>
          <Sidebar />
          <TopBar />
          <main className="pl-[260px] pt-[64px] h-screen overflow-y-auto bg-background">
            <Outlet />
          </main>
        </>
      )}
    </QueryClientProvider>
  );
}
