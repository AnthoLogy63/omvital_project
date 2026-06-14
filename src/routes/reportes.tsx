import { createFileRoute } from "@tanstack/react-router";

const html = `<main class="ml-[260px] mt-[64px] p-container_padding min-h-screen">
<!-- Header & Date Filter Section -->
<div class="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
<div>
<h2 class="font-headline-md text-headline-md text-on-surface tracking-tight">Análisis de Reportes</h2>
<p class="font-body-md text-body-md text-on-surface-variant">Visualiza el rendimiento financiero de la clínica</p>
</div>
<div class="flex items-center bg-surface-container p-1 rounded-lg border border-outline-variant">
<button class="px-4 py-2 bg-surface-container-highest rounded-md font-label-md text-label-md text-primary font-bold shadow-sm transition-all">Este Mes</button>
<button class="px-4 py-2 hover:bg-surface-container-highest rounded-md font-label-md text-label-md text-on-surface-variant transition-all">Último Trimestre</button>
<div class="w-[1px] h-4 bg-outline-variant mx-2"></div>
<button class="flex items-center gap-2 px-4 py-2 hover:bg-surface-container-highest rounded-md font-label-md text-label-md text-on-surface-variant transition-all">
<span class="material-symbols-outlined text-[18px]" data-icon="calendar_today">calendar_today</span>
<span class="">Rango Personalizado</span>
</button>
</div>
</div>
<!-- Consolidate Summary: Bento Style -->
<div class="grid grid-cols-1 md:grid-cols-3 gap-gutter mb-gutter">
<!-- Total Income Card -->
<div class="bg-surface border border-outline-variant p-stack_lg rounded-xl flex flex-col justify-between group hover:border-primary transition-colors duration-300">
<div class="flex justify-between items-start">
<div class="w-10 h-10 rounded-lg bg-green-50 flex items-center justify-center">
<span class="material-symbols-outlined text-green-600" data-icon="trending_up">trending_up</span>
</div>
<span class="font-label-md text-label-md text-green-600 bg-green-50 px-2 py-0.5 rounded-full">+12.5%</span>
</div>
<div class="mt-4">
<p class="font-label-md text-label-md text-on-surface-variant uppercase tracking-wider">Total Ingresos</p>
<h3 class="font-display-lg text-display-lg mt-1">$42,850.00</h3>
</div>
<div class="mt-4 pt-4 border-t border-outline-variant/30">
<p class="font-caption text-caption text-on-surface-variant">Basado en 142 transacciones este mes</p>
</div>
</div>
<!-- Total Expenses Card -->
<div class="bg-surface border border-outline-variant p-stack_lg rounded-xl flex flex-col justify-between group hover:border-error transition-colors duration-300">
<div class="flex justify-between items-start">
<div class="w-10 h-10 rounded-lg bg-red-50 flex items-center justify-center">
<span class="material-symbols-outlined text-red-600" data-icon="trending_down">trending_down</span>
</div>
<span class="font-label-md text-label-md text-red-600 bg-red-50 px-2 py-0.5 rounded-full">+4.2%</span>
</div>
<div class="mt-4">
<p class="font-label-md text-label-md text-on-surface-variant uppercase tracking-wider">Total Gastos</p>
<h3 class="font-display-lg text-display-lg mt-1">$12,420.00</h3>
</div>
<div class="mt-4 pt-4 border-t border-outline-variant/30">
<p class="font-caption text-caption text-on-surface-variant">Incluye nómina y mantenimiento</p>
</div>
</div>
<!-- Balance Card -->
<div class="bg-primary-container p-stack_lg rounded-xl flex flex-col justify-between relative overflow-hidden text-white">
<div class="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16 blur-3xl"></div>
<div class="flex justify-between items-start relative z-10">
<div class="w-10 h-10 rounded-lg bg-white/20 flex items-center justify-center">
<span class="material-symbols-outlined text-white" data-icon="account_balance">account_balance</span>
</div>
</div>
<div class="mt-4 relative z-10">
<p class="font-label-md text-label-md text-white/80 uppercase tracking-wider">Balance Neto</p>
<h3 class="font-display-lg text-display-lg mt-1">$30,430.00</h3>
</div>
<div class="mt-4 pt-4 border-t border-white/20 relative z-10">
<p class="font-caption text-caption text-white/70">71% margen de ganancia operativa</p>
</div>
</div>
</div>
<!-- Breakdown & Visualization -->
<div class="grid grid-cols-1 lg:grid-cols-12 gap-gutter">
<!-- Detailed Stats Cards -->
<div class="lg:col-span-4 space-y-gutter">
<!-- Avg Daily Cash -->
<div class="bg-surface border border-outline-variant p-stack_lg rounded-xl">
<div class="flex items-center gap-3 mb-2">
<span class="material-symbols-outlined text-primary" data-icon="payments">payments</span>
<p class="font-label-md text-label-md text-on-surface-variant">Promedio Diario Caja</p>
</div>
<h4 class="font-headline-sm text-headline-sm">$1,428.33</h4>
<div class="mt-4 h-2 bg-surface-container rounded-full overflow-hidden">
<div class="h-full bg-primary w-[85%]"></div>
</div>
<p class="mt-2 font-caption text-caption text-on-surface-variant">Meta diaria: $1,650.00</p>
</div>
<!-- Packages Sold -->
<div class="bg-surface border border-outline-variant p-stack_lg rounded-xl">
<div class="flex items-center gap-3 mb-2">
<span class="material-symbols-outlined text-secondary" data-icon="inventory_2">inventory_2</span>
<p class="font-label-md text-label-md text-on-surface-variant">Paquetes Vendidos</p>
</div>
<h4 class="font-headline-sm text-headline-sm">48 Unidades</h4>
<div class="mt-3 grid grid-cols-4 gap-1">
<div class="h-8 bg-secondary/10 rounded-sm flex items-end"><div class="w-full bg-secondary h-[40%] rounded-sm"></div></div>
<div class="h-8 bg-secondary/10 rounded-sm flex items-end"><div class="w-full bg-secondary h-[65%] rounded-sm"></div></div>
<div class="h-8 bg-secondary/10 rounded-sm flex items-end"><div class="w-full bg-secondary h-[90%] rounded-sm"></div></div>
<div class="h-8 bg-secondary/10 rounded-sm flex items-end"><div class="w-full bg-secondary h-[75%] rounded-sm"></div></div>
</div>
<p class="mt-2 font-caption text-caption text-on-surface-variant">+14% vs mes anterior</p>
</div>
<!-- Commissions Paid -->
<div class="bg-surface border border-outline-variant p-stack_lg rounded-xl">
<div class="flex items-center gap-3 mb-2">
<span class="material-symbols-outlined text-tertiary" data-icon="percent">percent</span>
<p class="font-label-md text-label-md text-on-surface-variant">Comisiones Pagadas</p>
</div>
<h4 class="font-headline-sm text-headline-sm">$5,840.20</h4>
<p class="mt-4 font-body-md text-body-md text-on-surface-variant italic">"El costo de adquisición de servicios se mantiene estable."</p>
</div>
</div>
<!-- Data Tables Section -->
<div class="lg:col-span-8 bg-surface border border-outline-variant rounded-xl overflow-hidden flex flex-col">
<div class="p-stack_lg border-b border-outline-variant flex justify-between items-center bg-white">
<h3 class="font-title-lg text-title-lg text-on-surface">Desglose de Movimientos Recientes</h3>
<button class="text-primary font-label-md text-label-md flex items-center gap-1 hover:underline">
                        Exportar CSV <span class="material-symbols-outlined text-[16px]" data-icon="download">download</span>
</button>
</div>
<div class="overflow-x-auto flex-1">
<table class="w-full text-left border-collapse">
<thead>
<tr class="bg-[#F8FAFB]">
<th class="p-4 font-label-md text-label-md text-on-surface-variant border-b border-outline-variant">Fecha</th>
<th class="p-4 font-label-md text-label-md text-on-surface-variant border-b border-outline-variant">Concepto</th>
<th class="p-4 font-label-md text-label-md text-on-surface-variant border-b border-outline-variant">Categoría</th>
<th class="p-4 font-label-md text-label-md text-on-surface-variant border-b border-outline-variant text-right">Monto</th>
<th class="p-4 font-label-md text-label-md text-on-surface-variant border-b border-outline-variant">Estado</th>
</tr>
</thead>
<tbody class="divide-y divide-outline-variant/30">
<tr class="hover:bg-surface-container-low transition-colors group">
<td class="p-4 font-body-md text-body-md text-on-surface">15 Oct, 2023</td>
<td class="p-4 font-body-md text-body-md text-on-surface font-medium">Paquete Rehabilitación Lumbar</td>
<td class="p-4 font-body-md text-body-md text-on-surface-variant">Servicio</td>
<td class="p-4 font-body-md text-body-md text-right text-green-600 font-bold">+$450.00</td>
<td class="p-4">
<span class="px-2 py-1 bg-green-100 text-green-800 text-[10px] font-bold rounded-full uppercase tracking-tighter">Completado</span>
</td>
</tr>
<tr class="hover:bg-surface-container-low transition-colors group">
<td class="p-4 font-body-md text-body-md text-on-surface">14 Oct, 2023</td>
<td class="p-4 font-body-md text-body-md text-on-surface font-medium">Insumos Médicos - Septiembre</td>
<td class="p-4 font-body-md text-body-md text-on-surface-variant">Gasto Operativo</td>
<td class="p-4 font-body-md text-body-md text-right text-red-600 font-bold">-$1,200.00</td>
<td class="p-4">
<span class="px-2 py-1 bg-red-100 text-red-800 text-[10px] font-bold rounded-full uppercase tracking-tighter">Pagado</span>
</td>
</tr>
<tr class="hover:bg-surface-container-low transition-colors group">
<td class="p-4 font-body-md text-body-md text-on-surface">14 Oct, 2023</td>
<td class="p-4 font-body-md text-body-md text-on-surface font-medium">Comisión Terapeuta - ID #849</td>
<td class="p-4 font-body-md text-body-md text-on-surface-variant">Nómina</td>
<td class="p-4 font-body-md text-body-md text-right text-on-surface-variant font-bold">-$85.00</td>
<td class="p-4">
<span class="px-2 py-1 bg-amber-100 text-amber-800 text-[10px] font-bold rounded-full uppercase tracking-tighter">Pendiente</span>
</td>
</tr>
<tr class="hover:bg-surface-container-low transition-colors group">
<td class="p-4 font-body-md text-body-md text-on-surface">13 Oct, 2023</td>
<td class="p-4 font-body-md text-body-md text-on-surface font-medium">Consulta Fisioterapia Inicial</td>
<td class="p-4 font-body-md text-body-md text-on-surface-variant">Servicio</td>
<td class="p-4 font-body-md text-body-md text-right text-green-600 font-bold">+$120.00</td>
<td class="p-4">
<span class="px-2 py-1 bg-green-100 text-green-800 text-[10px] font-bold rounded-full uppercase tracking-tighter">Completado</span>
</td>
</tr>
<tr class="hover:bg-surface-container-low transition-colors group">
<td class="p-4 font-body-md text-body-md text-on-surface">12 Oct, 2023</td>
<td class="p-4 font-body-md text-body-md text-on-surface font-medium">Suscripción Software OMVITAL</td>
<td class="p-4 font-body-md text-body-md text-on-surface-variant">Tecnología</td>
<td class="p-4 font-body-md text-body-md text-right text-red-600 font-bold">-$299.00</td>
<td class="p-4">
<span class="px-2 py-1 bg-green-100 text-green-800 text-[10px] font-bold rounded-full uppercase tracking-tighter">Suscrito</span>
</td>
</tr>
</tbody>
</table>
</div>
<div class="p-4 border-t border-outline-variant bg-[#F8FAFB] flex justify-center">
<button class="font-label-md text-label-md text-on-surface-variant hover:text-primary transition-all">Ver todos los movimientos (1,248)</button>
</div>
</div>
</div>
<!-- Asymmetric Visual Anchor -->
<div class="mt-gutter grid grid-cols-1 md:grid-cols-2 gap-gutter">
<div class="bg-surface-container-low border border-outline-variant rounded-xl p-stack_lg flex items-center gap-6">
<div class="shrink-0 w-32 h-32 rounded-lg overflow-hidden bg-white border border-outline-variant">
<img class="w-full h-full object-cover" data-alt="A clean, minimalist workspace scene featuring a glass of water, a medical tablet, and soft morning light streaming through high clinic windows. The aesthetic is clinical and serene with a palette of sober blue and crisp white, emphasizing modern professional healthcare administration and financial clarity." src="https://lh3.googleusercontent.com/aida-public/AB6AXuAVhurgKdw2NZTLjc7xc9IkDMsyD2Z97VmoBZhvIlwAi9qc6-eK0Bn1b_UfTreExPcJHTYjFKzF_Iv8QnJobSBmC1_Wh6bIcTwJoG7r7DXF47tGTsGLRexnhcGWK0SRSvHpqJqblgq3sMtXCzouPgg0ONJUcp9IKUp_8uuPNwebv0_NSI1zIjU0kPIPOKsmp_CZSJxCvpig1gOPYkYMRZp_mog-GZ0zJk9L9jNaBe3rmoOfv385HOwLmBUpZxd-2xwmCZ0S44s-D3E">
</div>
<div>
<h4 class="font-title-lg text-title-lg mb-1">Análisis de Tendencias</h4>
<p class="font-body-md text-body-md text-on-surface-variant">El volumen de pacientes ha aumentado un 18% este mes, sugiriendo la necesidad de contratar un nuevo terapeuta para el turno vespertino.</p>
<button class="mt-3 text-primary font-bold font-label-md text-label-md">Leer más del reporte</button>
</div>
</div>
<div class="relative bg-inverse-surface rounded-xl p-stack_lg overflow-hidden flex flex-col justify-center">

<div class="relative z-10 text-white">
<h4 class="font-title-lg text-title-lg mb-2">Proyección Financiera</h4>
<p class="font-body-md text-body-md opacity-80 mb-4">Estimación para Noviembre basada en reservas actuales:</p>
<div class="flex items-baseline gap-2">
<span class="text-3xl font-bold font-display-lg">$48,200</span>
<span class="text-green-400 font-label-md text-label-md">▲ +12% esperado</span>
</div>
</div>
</div>
</div>
</main>`;

export const Route = createFileRoute("/reportes")({
  head: () => ({
    meta: [
      { title: "OMVITAL - Reportes" },
      { name: "description", content: "Reportes financieros" },
    ],
  }),
  component: Page,
});

function Page() {
  return <div dangerouslySetInnerHTML={{ __html: html }} />;
}
