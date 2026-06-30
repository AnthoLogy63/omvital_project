import { createFileRoute } from "@tanstack/react-router";

const html = `<main class="ml-[260px] pt-[64px] min-h-screen">
<div class="p-container_padding">
<!-- Summary Bar -->
<div class="grid grid-cols-1 md:grid-cols-4 gap-gutter mb-stack_lg">
<div class="bg-surface border border-outline-variant p-stack_md rounded-lg">
<p class="text-outline text-[11px] font-bold uppercase tracking-wider mb-1">Total Ingresos</p>
<div class="flex items-center justify-between">
<h2 class="font-headline-md text-headline-md text-primary tracking-tight">S/ 4,250.00</h2>
<span class="material-symbols-outlined text-primary bg-primary/10 p-2 rounded-full">trending_up</span>
</div>
</div>
<div class="bg-surface border border-outline-variant p-stack_md rounded-lg">
<p class="text-outline text-[11px] font-bold uppercase tracking-wider mb-1">Total Egresos</p>
<div class="flex items-center justify-between">
<h2 class="font-headline-md text-headline-md text-error tracking-tight">S/ 840.50</h2>
<span class="material-symbols-outlined text-error bg-error/10 p-2 rounded-full">trending_down</span>
</div>
</div>
<div class="bg-surface border border-outline-variant p-stack_md rounded-lg shadow-sm">
<p class="text-outline text-[11px] font-bold uppercase tracking-wider mb-1">Saldo Actual</p>
<div class="flex items-center justify-between">
<h2 class="font-headline-md text-headline-md text-on-surface font-extrabold tracking-tight">S/ 3,409.50</h2>
<span class="material-symbols-outlined text-secondary bg-secondary/10 p-2 rounded-full">payments</span>
</div>
</div>
<div class="flex items-center justify-end">
<button class="flex items-center gap-2 bg-primary text-white px-6 py-3 rounded-lg font-bold hover:brightness-110 active:scale-95 transition-all shadow-md group">
<span class="material-symbols-outlined group-hover:rotate-180 transition-transform duration-500">lock</span>
                        Cierre de Caja
                    </button>
</div>
</div>
<div class="grid grid-cols-12 gap-gutter">
<!-- Registration Forms (Left Column) -->
<div class="col-span-12 lg:col-span-4 space-y-gutter">
<!-- Form Ingresos -->
<section class="bg-white border border-outline-variant rounded-lg p-stack_lg">
<div class="flex items-center gap-2 mb-stack_lg border-b border-outline-variant pb-3">
<span class="material-symbols-outlined text-primary" style="font-variation-settings: 'FILL' 1;">add_circle</span>
<h3 class="font-headline-sm text-headline-sm">Nuevo Ingreso</h3>
</div>
<form class="space-y-4">
<div>
<label class="block font-label-md text-label-md text-on-surface-variant mb-1">Monto (S/)</label>
<input class="w-full border border-outline-variant rounded p-2 focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all" placeholder="0.00" required="" step="0.10" type="number">
</div>
<div>
<label class="block font-label-md text-label-md text-on-surface-variant mb-1">Concepto *</label>
<select class="w-full border border-outline-variant rounded p-2 focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all" required="">
<option value="">Seleccionar concepto...</option>
<option>Pago de Sesión</option>
<option>Venta de Insumos</option>
<option>Paquete de Terapias</option>
<option>Otros Ingresos</option>
</select>
</div>
<div>
<label class="block font-label-md text-label-md text-on-surface-variant mb-1">Método de Pago</label>
<div class="grid grid-cols-2 gap-2">
<label class="flex items-center justify-center gap-2 p-2 border border-outline-variant rounded cursor-pointer hover:bg-surface-container-low transition-colors has-[:checked]:border-primary has-[:checked]:bg-primary/5">
<input checked="" class="hidden" name="pay_method" type="radio">
<span class="material-symbols-outlined text-sm">money</span>
<span class="text-body-md">Efectivo</span>
</label>
<label class="flex items-center justify-center gap-2 p-2 border border-outline-variant rounded cursor-pointer hover:bg-surface-container-low transition-colors has-[:checked]:border-primary has-[:checked]:bg-primary/5">
<input class="hidden" name="pay_method" type="radio">
<span class="material-symbols-outlined text-sm">qr_code_2</span>
<span class="text-body-md">Yape / Plin</span>
</label>
</div>
</div>
<button class="w-full bg-primary text-white py-2 rounded font-bold hover:opacity-90 active:scale-95 transition-all mt-4" type="submit">Registrar Ingreso</button>
</form>
</section>
<!-- Form Egresos -->
<section class="bg-white border border-outline-variant rounded-lg p-stack_lg">
<div class="flex items-center gap-2 mb-stack_lg border-b border-outline-variant pb-3">
<span class="material-symbols-outlined text-error" style="font-variation-settings: 'FILL' 1;">remove_circle</span>
<h3 class="font-headline-sm text-headline-sm">Egreso Operativo</h3>
</div>
<form class="space-y-4">
<div>
<label class="block font-label-md text-label-md text-on-surface-variant mb-1">Monto (S/)</label>
<input class="w-full border border-outline-variant rounded p-2 focus:border-error focus:ring-1 focus:ring-error outline-none transition-all" placeholder="0.00" required="" step="0.10" type="number">
</div>
<div>
<label class="block font-label-md text-label-md text-on-surface-variant mb-1">Concepto *</label>
<input class="w-full border border-outline-variant rounded p-2 focus:border-error focus:ring-1 focus:ring-error outline-none transition-all" placeholder="Ej: Pago de Luz, Alquiler, Limpieza" required="" type="text">
</div>
<div>
<label class="block font-label-md text-label-md text-on-surface-variant mb-1">Nota Adicional</label>
<textarea class="w-full border border-outline-variant rounded p-2 focus:border-error focus:ring-1 focus:ring-error outline-none transition-all h-20 text-body-md" placeholder="Detalles del gasto..."></textarea>
</div>
<button class="w-full border border-error text-error py-2 rounded font-bold hover:bg-error/5 active:scale-95 transition-all mt-4" type="submit">Registrar Gasto</button>
</form>
</section>
</div>
<!-- Transaction History (Right Column) -->
<div class="col-span-12 lg:col-span-8">
<section class="bg-white border border-outline-variant rounded-lg overflow-hidden flex flex-col h-full min-h-[600px]">
<div class="p-stack_lg border-b border-outline-variant flex flex-wrap items-center justify-between gap-4">
<div>
<h3 class="font-headline-sm text-headline-sm">Movimientos del Día</h3>
<p class="text-caption text-outline">Listado detallado de transacciones hoy</p>
</div>
<div class="flex items-center gap-2">
<select class="text-label-md border-outline-variant rounded-full px-4 py-1.5 focus:ring-primary outline-none cursor-pointer">
<option>Todos los tipos</option>
<option>Solo Ingresos</option>
<option>Solo Egresos</option>
</select>
<button class="p-2 border border-outline-variant rounded hover:bg-surface-container-low">
<span class="material-symbols-outlined text-sm">filter_list</span>
</button>
<button class="p-2 border border-outline-variant rounded hover:bg-surface-container-low">
<span class="material-symbols-outlined text-sm">download</span>
</button>
</div>
</div>
<div class="overflow-x-auto">
<table class="w-full text-left border-collapse">
<thead>
<tr class="bg-[#F8FAFB] border-b border-outline-variant">
<th class="px-6 py-4 font-label-md text-label-md text-outline">HORA</th>
<th class="px-6 py-4 font-label-md text-label-md text-outline">CONCEPTO</th>
<th class="px-6 py-4 font-label-md text-label-md text-outline">METODO</th>
<th class="px-6 py-4 font-label-md text-label-md text-outline text-right">MONTO</th>
<th class="px-6 py-4 font-label-md text-label-md text-outline text-right">ACCIONES</th>
</tr>
</thead>
<tbody class="divide-y divide-outline-variant/50">
<tr class="hover:bg-surface-container-low transition-colors">
<td class="px-6 py-4 text-body-md text-outline">08:30 AM</td>
<td class="px-6 py-4">
<p class="font-bold text-on-surface">Pago Sesión - Maria Garcia</p>
<p class="text-caption text-outline">Ingreso por Rehabilitación Física</p>
</td>
<td class="px-6 py-4">
<span class="bg-primary/10 text-primary text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-tighter">Efectivo</span>
</td>
<td class="px-6 py-4 text-right font-bold text-primary">+ S/ 80.00</td>
<td class="px-6 py-4 text-right">
<button class="text-outline hover:text-primary transition-colors"><span class="material-symbols-outlined text-xl">receipt_long</span></button>
</td>
</tr>
<tr class="hover:bg-surface-container-low transition-colors">
<td class="px-6 py-4 text-body-md text-outline">09:15 AM</td>
<td class="px-6 py-4">
<p class="font-bold text-on-surface">Compra Insumos Médicos</p>
<p class="text-caption text-outline">Egreso - Farmacia Central</p>
</td>
<td class="px-6 py-4">
<span class="bg-outline-variant/30 text-on-surface-variant text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-tighter">Transferencia</span>
</td>
<td class="px-6 py-4 text-right font-bold text-error">- S/ 150.00</td>
<td class="px-6 py-4 text-right">
<button class="text-outline hover:text-primary transition-colors"><span class="material-symbols-outlined text-xl">receipt_long</span></button>
</td>
</tr>
<tr class="hover:bg-surface-container-low transition-colors">
<td class="px-6 py-4 text-body-md text-outline">10:45 AM</td>
<td class="px-6 py-4">
<p class="font-bold text-on-surface">Paquete 10 Terapias - Juan Perez</p>
<p class="text-caption text-outline">Ingreso - Promoción Verano</p>
</td>
<td class="px-6 py-4">
<span class="bg-secondary-container text-secondary text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-tighter">Yape</span>
</td>
<td class="px-6 py-4 text-right font-bold text-primary">+ S/ 750.00</td>
<td class="px-6 py-4 text-right">
<button class="text-outline hover:text-primary transition-colors"><span class="material-symbols-outlined text-xl">receipt_long</span></button>
</td>
</tr>
<tr class="hover:bg-surface-container-low transition-colors">
<td class="px-6 py-4 text-body-md text-outline">11:20 AM</td>
<td class="px-6 py-4">
<p class="font-bold text-on-surface">Pago de Arbitrios</p>
<p class="text-caption text-outline">Egreso - Municipalidad</p>
</td>
<td class="px-6 py-4">
<span class="bg-outline-variant/30 text-on-surface-variant text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-tighter">Efectivo</span>
</td>
<td class="px-6 py-4 text-right font-bold text-error">- S/ 45.00</td>
<td class="px-6 py-4 text-right">
<button class="text-outline hover:text-primary transition-colors"><span class="material-symbols-outlined text-xl">receipt_long</span></button>
</td>
</tr>
<tr class="hover:bg-surface-container-low transition-colors">
<td class="px-6 py-4 text-body-md text-outline">01:05 PM</td>
<td class="px-6 py-4">
<p class="font-bold text-on-surface">Pago Sesión - Lucia Mendez</p>
<p class="text-caption text-outline">Ingreso por Terapia Ocupacional</p>
</td>
<td class="px-6 py-4">
<span class="bg-primary/10 text-primary text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-tighter">Efectivo</span>
</td>
<td class="px-6 py-4 text-right font-bold text-primary">+ S/ 80.00</td>
<td class="px-6 py-4 text-right">
<button class="text-outline hover:text-primary transition-colors"><span class="material-symbols-outlined text-xl">receipt_long</span></button>
</td>
</tr>
</tbody>
</table>
</div>
<div class="mt-auto p-4 border-t border-outline-variant bg-surface-container-low flex items-center justify-between">
<p class="text-caption text-outline">Mostrando 5 de 24 movimientos registrados hoy</p>
<div class="flex gap-2">
<button class="w-8 h-8 flex items-center justify-center rounded border border-outline-variant bg-white text-outline hover:text-primary transition-colors">
<span class="material-symbols-outlined text-sm">chevron_left</span>
</button>
<button class="w-8 h-8 flex items-center justify-center rounded border border-primary bg-primary text-white text-sm font-bold">1</button>
<button class="w-8 h-8 flex items-center justify-center rounded border border-outline-variant bg-white text-outline hover:text-primary transition-colors text-sm font-bold">2</button>
<button class="w-8 h-8 flex items-center justify-center rounded border border-outline-variant bg-white text-outline hover:text-primary transition-colors">
<span class="material-symbols-outlined text-sm">chevron_right</span>
</button>
</div>
</div>
</section>
</div>
</div>
</div>
</main>`;

export const Route = createFileRoute("/caja")({
  head: () => ({
    meta: [{ title: "OMVITAL - Caja" }, { name: "description", content: "Control de caja" }],
  }),
  component: Page,
});

function Page() {
  return <div dangerouslySetInnerHTML={{ __html: html }} />;
}
