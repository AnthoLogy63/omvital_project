import { createFileRoute } from "@tanstack/react-router";

const html = `<main class="pt-[64px] pl-[260px] h-screen overflow-y-auto">
<div class="p-container_padding space-y-stack_lg">
<!-- Welcome Header -->
<div class="flex items-end justify-between">
<div>
<h2 class="font-headline-md text-headline-md text-primary">Vista General</h2>
<p class="font-body-md text-body-md text-on-surface-variant">Resumen financiero y estado de operaciones del día.</p>
</div>
<div class="flex items-center gap-2 bg-secondary-container/30 px-4 py-2 rounded-lg border border-secondary-container">
<span class="w-2.5 h-2.5 bg-secondary rounded-full animate-pulse"></span>
<span class="font-label-md text-label-md text-secondary font-bold">Estado de Caja: ABIERTO</span>
</div>
</div>
<!-- Summary Bento Grid -->
<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-gutter">
<!-- Ingresos -->
<div class="bg-surface-container-lowest border border-outline-variant p-stack_lg rounded-xl flex flex-col justify-between group hover:border-primary transition-all duration-300">
<div class="flex justify-between items-start">
<div class="p-2 bg-primary-container/10 rounded-lg text-primary">
<span class="material-symbols-outlined">trending_up</span>
</div>
<span class="font-caption text-caption text-secondary font-bold">+12.5% vs ayer</span>
</div>
<div class="mt-4">
<p class="font-label-md text-label-md text-on-surface-variant uppercase tracking-wider">Ingresos del día</p>
<h3 class="font-display-lg text-display-lg text-on-surface">$12,450.00</h3>
</div>
</div>
<!-- Egresos -->
<div class="bg-surface-container-lowest border border-outline-variant p-stack_lg rounded-xl flex flex-col justify-between hover:border-error transition-all duration-300">
<div class="flex justify-between items-start">
<div class="p-2 bg-error-container/20 rounded-lg text-error">
<span class="material-symbols-outlined">trending_down</span>
</div>
<span class="font-caption text-caption text-error font-bold">+2.1% vs ayer</span>
</div>
<div class="mt-4">
<p class="font-label-md text-label-md text-on-surface-variant uppercase tracking-wider">Egresos del día</p>
<h3 class="font-display-lg text-display-lg text-on-surface">$2,140.50</h3>
</div>
</div>
<!-- Saldo Actual -->
<div class="bg-surface-container-lowest border border-outline-variant p-stack_lg rounded-xl flex flex-col justify-between hover:border-primary transition-all duration-300">
<div class="flex justify-between items-start">
<div class="p-2 bg-secondary-container/20 rounded-lg text-secondary">
<span class="material-symbols-outlined" style="font-variation-settings: 'FILL' 1;">account_balance</span>
</div>
</div>
<div class="mt-4">
<p class="font-label-md text-label-md text-on-surface-variant uppercase tracking-wider">Saldo en Caja</p>
<h3 class="font-display-lg text-display-lg text-on-surface">$10,309.50</h3>
</div>
</div>
<!-- Alertas Rápidas -->
<div class="bg-primary border border-primary p-stack_lg rounded-xl flex flex-col justify-center relative overflow-hidden">

<div class="relative z-10 text-white">
<p class="font-label-md text-label-md opacity-80 mb-1">Paquetes Pendientes</p>
<div class="flex items-center gap-2">
<span class="font-display-lg text-display-lg font-bold">14</span>
<span class="material-symbols-outlined text-tertiary-fixed">warning</span>
</div>
<p class="font-caption text-caption mt-2 text-primary-fixed underline cursor-pointer">Ver detalles de deuda</p>
</div>
</div>
</div>
<div class="grid grid-cols-1 lg:grid-cols-3 gap-gutter">
<!-- Transactions Table -->
<div class="lg:col-span-2 bg-surface-container-lowest border border-outline-variant rounded-xl overflow-hidden flex flex-col">
<div class="p-stack_lg border-b border-outline-variant flex items-center justify-between">
<h3 class="font-title-lg text-title-lg text-on-surface">Últimos movimientos</h3>
<button class="text-primary font-label-md text-label-md hover:underline">Ver todos</button>
</div>
<div class="overflow-x-auto">
<table class="w-full text-left border-collapse">
<thead class="bg-[#F8FAFB]">
<tr>
<th class="px-6 py-4 font-label-md text-label-md text-on-surface-variant border-b border-outline-variant">Fecha</th>
<th class="px-6 py-4 font-label-md text-label-md text-on-surface-variant border-b border-outline-variant">Descripción</th>
<th class="px-6 py-4 font-label-md text-label-md text-on-surface-variant border-b border-outline-variant">Categoría</th>
<th class="px-6 py-4 font-label-md text-label-md text-on-surface-variant border-b border-outline-variant">Monto</th>
<th class="px-6 py-4 font-label-md text-label-md text-on-surface-variant border-b border-outline-variant">Estado</th>
</tr>
</thead>
<tbody class="divide-y divide-outline-variant">
<tr class="hover:bg-[#F4F6F8] transition-colors">
<td class="px-6 py-4 font-body-md text-body-md">10:45 AM</td>
<td class="px-6 py-4 font-body-md text-body-md">Pago Sesión - García, Elena</td>
<td class="px-6 py-4">
<span class="px-2 py-1 bg-primary-container/10 text-primary text-[11px] font-bold rounded uppercase">Rehabilitación</span>
</td>
<td class="px-6 py-4 font-body-md text-body-md text-secondary font-bold">+$850.00</td>
<td class="px-6 py-4">
<div class="flex items-center gap-2">
<span class="w-2 h-2 bg-secondary rounded-full"></span>
<span class="text-caption">Completado</span>
</div>
</td>
</tr>
<tr class="hover:bg-[#F4F6F8] transition-colors">
<td class="px-6 py-4 font-body-md text-body-md">09:30 AM</td>
<td class="px-6 py-4 font-body-md text-body-md">Insumos Médicos - Proveedor X</td>
<td class="px-6 py-4">
<span class="px-2 py-1 bg-error-container/20 text-error text-[11px] font-bold rounded uppercase">Gasto Gral</span>
</td>
<td class="px-6 py-4 font-body-md text-body-md text-error font-bold">-$1,200.00</td>
<td class="px-6 py-4">
<div class="flex items-center gap-2">
<span class="w-2 h-2 bg-secondary rounded-full"></span>
<span class="text-caption">Completado</span>
</div>
</td>
</tr>
<tr class="hover:bg-[#F4F6F8] transition-colors">
<td class="px-6 py-4 font-body-md text-body-md">08:15 AM</td>
<td class="px-6 py-4 font-body-md text-body-md">Pago Paquete 10s - Pérez, Juan</td>
<td class="px-6 py-4">
<span class="px-2 py-1 bg-primary-container/10 text-primary text-[11px] font-bold rounded uppercase">Paquete</span>
</td>
<td class="px-6 py-4 font-body-md text-body-md text-secondary font-bold">+$4,500.00</td>
<td class="px-6 py-4">
<div class="flex items-center gap-2">
<span class="w-2 h-2 bg-secondary rounded-full"></span>
<span class="text-caption">Completado</span>
</div>
</td>
</tr>
<tr class="hover:bg-[#F4F6F8] transition-colors" style="transform: translateX(0px); transition: transform 0.2s ease-out;">
<td class="px-6 py-4 font-body-md text-body-md">Ayer 18:20</td>
<td class="px-6 py-4 font-body-md text-body-md">Comisión Dr. Smith - Sem 42</td>
<td class="px-6 py-4">
<span class="px-2 py-1 bg-tertiary-fixed/40 text-tertiary text-[11px] font-bold rounded uppercase">Nómina</span>
</td>
<td class="px-6 py-4 font-body-md text-body-md text-error font-bold">-$940.50</td>
<td class="px-6 py-4">
<div class="flex items-center gap-2">
<span class="w-2 h-2 bg-secondary rounded-full"></span>
<span class="text-caption">Completado</span>
</div>
</td>
</tr>
<tr class="hover:bg-[#F4F6F8] transition-colors">
<td class="px-6 py-4 font-body-md text-body-md">Ayer 17:45</td>
<td class="px-6 py-4 font-body-md text-body-md">Pago Sesión - Lopez, Maria</td>
<td class="px-6 py-4">
<span class="px-2 py-1 bg-primary-container/10 text-primary text-[11px] font-bold rounded uppercase">Rehabilitación</span>
</td>
<td class="px-6 py-4 font-body-md text-body-md text-secondary font-bold">+$850.00</td>
<td class="px-6 py-4">
<div class="flex items-center gap-2">
<span class="w-2 h-2 bg-secondary rounded-full"></span>
<span class="text-caption">Completado</span>
</div>
</td>
</tr>
</tbody>
</table>
</div>
</div>
<!-- Lateral Stats: Paquetes & Comisiones -->
<div class="space-y-gutter">
<!-- Paquetes con Deuda -->
<div class="bg-surface-container-lowest border border-outline-variant rounded-xl overflow-hidden shadow-sm">
<div class="p-4 bg-[#F8FAFB] border-b border-outline-variant flex items-center gap-2">
<span class="material-symbols-outlined text-error text-[20px]">warning</span>
<h3 class="font-label-md text-label-md font-bold text-on-surface">Paquetes con deuda</h3>
</div>
<div class="p-4 space-y-4">
<div class="flex justify-between items-center group">
<div>
<p class="font-body-md text-body-md font-medium">Martínez, Roberto</p>
<p class="font-caption text-caption text-on-surface-variant">Paquete 12 Sesiones - 4 pendientes</p>
</div>
<span class="font-label-md text-label-md text-error font-bold">$1,400</span>
</div>
<div class="flex justify-between items-center group">
<div>
<p class="font-body-md text-body-md font-medium">Sánchez, Clara</p>
<p class="font-caption text-caption text-on-surface-variant">Intensivo Post-Op - 2 pendientes</p>
</div>
<span class="font-label-md text-label-md text-error font-bold">$800</span>
</div>
<div class="flex justify-between items-center group">
<div>
<p class="font-body-md text-body-md font-medium">Díaz, Fernando</p>
<p class="font-caption text-caption text-on-surface-variant">Mantenimiento Mensual</p>
</div>
<span class="font-label-md text-label-md text-error font-bold">$550</span>
</div>
<button class="w-full py-2 mt-2 bg-surface-container-high text-on-surface-variant font-label-md text-label-md rounded-lg hover:bg-outline-variant transition-all">Ver todos los deudores</button>
</div>
</div>
<!-- Comisiones Pendientes -->
<div class="bg-surface-container-lowest border border-outline-variant rounded-xl overflow-hidden shadow-sm">
<div class="p-4 bg-[#F8FAFB] border-b border-outline-variant flex items-center gap-2">
<span class="material-symbols-outlined text-primary text-[20px]">payments</span>
<h3 class="font-label-md text-label-md font-bold text-on-surface">Comisiones pendientes</h3>
</div>
<div class="p-4 space-y-4">
<div class="flex items-center gap-3">
<div class="w-8 h-8 rounded-full bg-primary-container/20 flex items-center justify-center text-primary font-bold text-[10px]">LS</div>
<div class="flex-1">
<div class="flex justify-between">
<p class="font-body-md text-body-md font-medium">Lic. Sandra V.</p>
<p class="font-label-md text-label-md font-bold text-on-surface">$3,240</p>
</div>
<div class="w-full bg-surface-container-high h-1.5 rounded-full mt-1">
<div class="bg-primary h-full rounded-full" style="width: 75%"></div>
</div>
</div>
</div>
<div class="flex items-center gap-3">
<div class="w-8 h-8 rounded-full bg-secondary-container/20 flex items-center justify-center text-secondary font-bold text-[10px]">JM</div>
<div class="flex-1">
<div class="flex justify-between">
<p class="font-body-md text-body-md font-medium">Dr. Jorge M.</p>
<p class="font-label-md text-label-md font-bold text-on-surface">$2,100</p>
</div>
<div class="w-full bg-surface-container-high h-1.5 rounded-full mt-1">
<div class="bg-secondary h-full rounded-full" style="width: 45%"></div>
</div>
</div>
</div>
<div class="flex items-center gap-3">
<div class="w-8 h-8 rounded-full bg-tertiary-container/20 flex items-center justify-center text-tertiary font-bold text-[10px]">AF</div>
<div class="flex-1">
<div class="flex justify-between">
<p class="font-body-md text-body-md font-medium">Lic. Ana F.</p>
<p class="font-label-md text-label-md font-bold text-on-surface">$1,850</p>
</div>
<div class="w-full bg-surface-container-high h-1.5 rounded-full mt-1">
<div class="bg-tertiary h-full rounded-full" style="width: 90%"></div>
</div>
</div>
</div>
<button class="w-full py-2 mt-2 border border-primary text-primary font-label-md text-label-md rounded-lg hover:bg-primary/5 transition-all">Generar Pagos</button>
</div>
</div>
</div>
</div>
</div>
</main>`;

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "OMVITAL - Dashboard" },
      { name: "description", content: "Vista general financiera" },
    ],
  }),
  component: Page,
});

function Page() {
  return <div dangerouslySetInnerHTML={{ __html: html }} />;
}
