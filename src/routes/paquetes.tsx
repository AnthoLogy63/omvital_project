import { createFileRoute } from "@tanstack/react-router";

const html = `<main class="ml-[260px] pt-[64px] min-h-screen p-container_padding">
<div class="mb-stack_lg flex items-center justify-between">
<div>
<h2 class="font-headline-md text-headline-md text-primary">Gestión de Paquetes</h2>
<p class="font-body-md text-body-md text-on-surface-variant">Administración de ventas, pagos y saldos de pacientes.</p>
</div>
<button class="bg-primary text-on-primary px-6 py-2.5 rounded flex items-center gap-2 font-label-md text-label-md shadow-sm hover:opacity-90 transition-all active:scale-95" onclick="document.getElementById('new-sale-modal').classList.toggle('hidden')">
<span class="material-symbols-outlined">add</span>
                NUEVA VENTA
            </button>
</div>
<div class="grid grid-cols-12 gap-gutter">
<!-- Bento Stats Summary -->
<div class="col-span-12 md:col-span-4 border border-outline-variant bg-white p-stack_lg rounded-lg">
<div class="flex items-center justify-between mb-4">
<span class="p-2 bg-primary-fixed text-primary rounded-lg material-symbols-outlined">payments</span>
<span class="text-caption font-bold text-outline">ESTE MES</span>
</div>
<p class="text-caption text-outline mb-1 uppercase tracking-tighter">Recaudación Total</p>
<h3 class="font-headline-md text-headline-md text-on-surface">$124,500.00</h3>
<div class="mt-4 flex items-center text-xs text-secondary font-bold">
<span class="material-symbols-outlined text-sm mr-1">trending_up</span>
<span class="">12% más que el mes pasado</span>
</div>
</div>
<div class="col-span-12 md:col-span-4 border border-outline-variant bg-white p-stack_lg rounded-lg">
<div class="flex items-center justify-between mb-4">
<span class="p-2 bg-tertiary-fixed text-tertiary rounded-lg material-symbols-outlined">pending_actions</span>
<span class="text-caption font-bold text-outline">CRÍTICO</span>
</div>
<p class="text-caption text-outline mb-1 uppercase tracking-tighter">Deuda Pendiente Total</p>
<h3 class="font-headline-md text-headline-md text-error">$18,240.00</h3>
<div class="mt-4 flex items-center text-xs text-outline font-bold">
<span class="material-symbols-outlined text-sm mr-1">group</span>
<span class="">14 pacientes con saldo</span>
</div>
</div>
<div class="col-span-12 md:col-span-4 border border-outline-variant bg-white p-stack_lg rounded-lg">
<div class="flex items-center justify-between mb-4">
<span class="p-2 bg-secondary-container text-secondary rounded-lg material-symbols-outlined">check_circle</span>
<span class="text-caption font-bold text-outline">ACTIVOS</span>
</div>
<p class="text-caption text-outline mb-1 uppercase tracking-tighter">Paquetes en Curso</p>
<h3 class="font-headline-md text-headline-md text-on-surface">42</h3>
<div class="mt-4 flex items-center text-xs text-on-surface-variant">
<span class="material-symbols-outlined text-sm mr-1">history</span>
<span class="">8 paquetes finalizados hoy</span>
</div>
</div>
<!-- Client List Table -->
<div class="col-span-12 border border-outline-variant bg-white rounded-lg overflow-hidden">
<div class="px-6 py-4 border-b border-outline-variant bg-surface-container-low flex items-center justify-between">
<h4 class="font-label-md text-label-md font-bold text-primary uppercase tracking-widest">Listado de Ventas y Seguimiento</h4>
<div class="flex gap-2">
<select class="text-xs border-outline-variant rounded bg-white py-1 focus:ring-primary">
<option>Todos los estados</option>
<option>Al día</option>
<option>Deuda</option>
<option>Parcial</option>
</select>
<button class="p-1 border border-outline-variant rounded hover:bg-surface-container"><span class="material-symbols-outlined text-sm">filter_list</span></button>
</div>
</div>
<div class="overflow-x-auto">
<table class="w-full text-left border-collapse">
<thead class="bg-[#F8FAFB] border-b border-outline-variant">
<tr>
<th class="px-6 py-3 font-label-md text-label-md text-outline">PACIENTE</th>
<th class="px-6 py-3 font-label-md text-label-md text-outline">PAQUETE</th>
<th class="px-6 py-3 font-label-md text-label-md text-outline text-right">TOTAL</th>
<th class="px-6 py-3 font-label-md text-label-md text-outline text-right">PAGADO</th>
<th class="px-6 py-3 font-label-md text-label-md text-outline text-right">DEUDA</th>
<th class="px-6 py-3 font-label-md text-label-md text-outline text-center">ESTADO</th>
<th class="px-6 py-3 font-label-md text-label-md text-outline text-right">ACCIONES</th>
</tr>
</thead>
<tbody class="divide-y divide-outline-variant">
<tr class="hover:bg-surface-container-low transition-colors group">
<td class="px-6 py-4">
<div class="flex items-center gap-3">
<div class="w-8 h-8 rounded-full bg-primary-fixed text-primary flex items-center justify-center text-[10px] font-bold">LM</div>
<div>
<p class="font-body-md text-body-md font-medium">Lucía Méndez</p>
<p class="text-xs text-outline">ID: 45902-B</p>
</div>
</div>
</td>
<td class="px-6 py-4 font-body-md text-body-md">Rehab. Post-Quirúrgica (10 Ses.)</td>
<td class="px-6 py-4 font-body-md text-body-md text-right font-medium">$8,500.00</td>
<td class="px-6 py-4 font-body-md text-body-md text-right text-secondary">$8,500.00</td>
<td class="px-6 py-4 font-body-md text-body-md text-right">$0.00</td>
<td class="px-6 py-4 text-center">
<span class="inline-flex items-center px-2 py-1 rounded-full text-[10px] font-bold bg-secondary-container/20 text-secondary border border-secondary/20">AL DÍA</span>
</td>
<td class="px-6 py-4 text-right">
<div class="flex justify-end gap-2">
<button class="p-1.5 text-outline hover:text-primary" title="Ver historial"><span class="material-symbols-outlined text-lg">history</span></button>
<button class="p-1.5 text-outline hover:text-secondary" title="Registrar pago"><span class="material-symbols-outlined text-lg">add_card</span></button>
</div>
</td>
</tr>
<tr class="hover:bg-surface-container-low transition-colors group">
<td class="px-6 py-4">
<div class="flex items-center gap-3">
<div class="w-8 h-8 rounded-full bg-tertiary-fixed text-tertiary flex items-center justify-center text-[10px] font-bold">RG</div>
<div>
<p class="font-body-md text-body-md font-medium">Roberto Gómez</p>
<p class="text-xs text-outline">ID: 11283-C</p>
</div>
</div>
</td>
<td class="px-6 py-4 font-body-md text-body-md">Paquete Preventivo Gold</td>
<td class="px-6 py-4 font-body-md text-body-md text-right font-medium">$12,000.00</td>
<td class="px-6 py-4 font-body-md text-body-md text-right text-secondary">$4,000.00</td>
<td class="px-6 py-4 font-body-md text-body-md text-right text-error font-bold">$8,000.00</td>
<td class="px-6 py-4 text-center">
<span class="inline-flex items-center px-2 py-1 rounded-full text-[10px] font-bold bg-error-container/20 text-error border border-error/20">DEUDA</span>
</td>
<td class="px-6 py-4 text-right">
<div class="flex justify-end gap-2">
<button class="p-1.5 text-outline hover:text-primary" title="Ver historial"><span class="material-symbols-outlined text-lg">history</span></button>
<button class="p-1.5 text-outline hover:text-secondary" title="Registrar pago"><span class="material-symbols-outlined text-lg">add_card</span></button>
</div>
</td>
</tr>
<tr class="hover:bg-surface-container-low transition-colors group">
<td class="px-6 py-4">
<div class="flex items-center gap-3">
<div class="w-8 h-8 rounded-full bg-secondary-fixed text-secondary flex items-center justify-center text-[10px] font-bold">AS</div>
<div>
<p class="font-body-md text-body-md font-medium">Ana Sandoval</p>
<p class="text-xs text-outline">ID: 99281-A</p>
</div>
</div>
</td>
<td class="px-6 py-4 font-body-md text-body-md">Masoterapia Intensiva</td>
<td class="px-6 py-4 font-body-md text-body-md text-right font-medium">$4,500.00</td>
<td class="px-6 py-4 font-body-md text-body-md text-right text-secondary">$3,000.00</td>
<td class="px-6 py-4 font-body-md text-body-md text-right text-primary">$1,500.00</td>
<td class="px-6 py-4 text-center">
<span class="inline-flex items-center px-2 py-1 rounded-full text-[10px] font-bold bg-primary-container/10 text-primary border border-primary/20">PARCIAL</span>
</td>
<td class="px-6 py-4 text-right">
<div class="flex justify-end gap-2">
<button class="p-1.5 text-outline hover:text-primary" title="Ver historial"><span class="material-symbols-outlined text-lg">history</span></button>
<button class="p-1.5 text-outline hover:text-secondary" title="Registrar pago"><span class="material-symbols-outlined text-lg">add_card</span></button>
</div>
</td>
</tr>
</tbody>
</table>
</div>
<div class="px-6 py-4 bg-surface-container-low border-t border-outline-variant flex items-center justify-between">
<p class="text-caption text-outline">Mostrando 3 de 42 paquetes registrados</p>
<div class="flex gap-2">
<button class="px-3 py-1 border border-outline-variant rounded text-xs hover:bg-white transition-colors">Anterior</button>
<button class="px-3 py-1 bg-primary text-on-primary rounded text-xs hover:opacity-90 transition-colors">Siguiente</button>
</div>
</div>
</div>
</div>
</main>`;

export const Route = createFileRoute("/paquetes")({
  head: () => ({
    meta: [
      { title: "OMVITAL - Paquetes" },
      { name: "description", content: "Gestión de paquetes" },
    ],
  }),
  component: Page,
});

function Page() {
  return <div dangerouslySetInnerHTML={{ __html: html }} />;
}
