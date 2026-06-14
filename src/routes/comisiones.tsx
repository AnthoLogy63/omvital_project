import { createFileRoute } from "@tanstack/react-router";

const html = `<main class="ml-[260px] pt-[64px] h-screen overflow-y-auto custom-scrollbar bg-background">
<div class="p-container_padding max-w-[1400px] mx-auto space-y-gutter">
<!-- Header Section -->
<div class="flex items-end justify-between">
<div>
<h2 class="font-headline-md text-headline-md text-primary">Gestión de Comisiones</h2>
<p class="font-body-md text-body-md text-on-surface-variant">Registro y control de incentivos para médicos y jaladores.</p>
</div>
<div class="flex gap-3">
<button class="flex items-center gap-2 px-4 py-2 border border-outline text-primary rounded-lg font-label-md text-label-md hover:bg-surface-container transition-colors">
<span class="material-symbols-outlined text-[18px]">download</span>
                        Exportar Reporte
                    </button>
</div>
</div>
<!-- Bento Layout Grid -->
<div class="grid grid-cols-12 gap-gutter">
<!-- Registration Form Card -->
<div class="col-span-12 lg:col-span-4 bg-white border border-outline-variant p-stack_lg flex flex-col space-y-stack_md">
<div class="flex items-center gap-2 border-b border-outline-variant pb-3 mb-2">
<span class="material-symbols-outlined text-primary">add_circle</span>
<h3 class="font-title-lg text-title-lg">Nueva Comisión</h3>
</div>
<form class="space-y-4">
<div>
<label class="block font-label-md text-label-md text-outline mb-1">Tipo de Comisionista</label>
<select class="w-full border border-outline-variant rounded-lg p-2 text-body-md focus:border-primary focus:ring-1 focus:ring-primary transition-all">
<option>Médico Especialista</option>
<option>Jaladora / Promotor</option>
</select>
</div>
<div>
<label class="block font-label-md text-label-md text-outline mb-1">Nombre del Comisionista</label>
<input class="w-full border border-outline-variant rounded-lg p-2 text-body-md focus:border-primary focus:ring-1 focus:ring-primary transition-all" placeholder="Ej. Dr. Armando Casas" type="text">
</div>
<div>
<label class="block font-label-md text-label-md text-outline mb-1">Paciente Atendido</label>
<input class="w-full border border-outline-variant rounded-lg p-2 text-body-md focus:border-primary focus:ring-1 focus:ring-primary transition-all" placeholder="Ej. Juan Perez Garcia" type="text">
</div>
<div class="grid grid-cols-2 gap-4">
<div>
<label class="block font-label-md text-label-md text-outline mb-1">Monto ($)</label>
<input class="w-full border border-outline-variant rounded-lg p-2 text-body-md focus:border-primary focus:ring-1 focus:ring-primary transition-all" placeholder="0.00" type="number">
</div>
<div>
<label class="block font-label-md text-label-md text-outline mb-1">Fecha</label>
<input class="w-full border border-outline-variant rounded-lg p-2 text-body-md focus:border-primary focus:ring-1 focus:ring-primary transition-all" type="date">
</div>
</div>
<button class="w-full bg-primary text-white py-3 rounded-lg font-label-md text-label-md hover:bg-primary-container transition-all shadow-sm active:scale-[0.98]" type="submit">
                            Registrar Comisión
                        </button>
</form>
</div>
<!-- Main Data Grid & Filters -->
<div class="col-span-12 lg:col-span-8 space-y-gutter">
<!-- Filters Row -->
<div class="bg-white border border-outline-variant p-4 flex flex-wrap items-center justify-between gap-4">
<div class="flex items-center gap-4">
<div class="flex items-center gap-2">
<span class="font-label-md text-label-md text-outline">Mes:</span>
<select class="border-none bg-surface-container-low rounded p-1 text-label-md font-medium text-on-surface-variant focus:ring-0">
<option>Octubre 2023</option>
<option selected="">Noviembre 2023</option>
<option>Diciembre 2023</option>
</select>
</div>
<div class="flex items-center gap-2">
<span class="font-label-md text-label-md text-outline">Estado:</span>
<div class="flex bg-surface-container-low rounded-lg p-1">
<button class="px-3 py-1 text-label-md bg-white rounded shadow-sm text-primary font-bold">Todos</button>
<button class="px-3 py-1 text-label-md text-on-surface-variant hover:bg-white/50 transition-all">Pendientes</button>
<button class="px-3 py-1 text-label-md text-on-surface-variant hover:bg-white/50 transition-all">Pagados</button>
</div>
</div>
</div>
<div class="flex items-center gap-2 text-outline">
<span class="material-symbols-outlined text-[20px]">filter_list</span>
<span class="font-label-md text-label-md uppercase tracking-wider">Filtros Avanzados</span>
</div>
</div>
<!-- Commissions Table -->
<div class="bg-white border border-outline-variant overflow-hidden">
<table class="w-full text-left border-collapse">
<thead>
<tr class="bg-surface-container-low border-b border-outline-variant">
<th class="px-6 py-4 font-label-md text-label-md text-on-surface-variant">Comisionista</th>
<th class="px-6 py-4 font-label-md text-label-md text-on-surface-variant">Paciente</th>
<th class="px-6 py-4 font-label-md text-label-md text-on-surface-variant">Monto</th>
<th class="px-6 py-4 font-label-md text-label-md text-on-surface-variant">Estado</th>
<th class="px-6 py-4 font-label-md text-label-md text-on-surface-variant text-right">Acciones</th>
</tr>
</thead>
<tbody class="divide-y divide-outline-variant">
<tr class="hover:bg-surface-container-low transition-colors group">
<td class="px-6 py-4">
<div class="flex items-center gap-3">
<div class="w-8 h-8 rounded-full bg-secondary-container/20 flex items-center justify-center text-secondary">
<span class="material-symbols-outlined text-[18px]">medical_services</span>
</div>
<div>
<p class="font-body-md text-body-md font-semibold">Dr. Ricardo Silva</p>
<p class="text-caption text-outline">Médico</p>
</div>
</div>
</td>
<td class="px-6 py-4 text-body-md">Elena Mendoza</td>
<td class="px-6 py-4 font-semibold text-primary">$450.00</td>
<td class="px-6 py-4">
<span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-caption font-medium bg-secondary-container/30 text-secondary border border-secondary/20">
                                            Pagado
                                        </span>
</td>
<td class="px-6 py-4 text-right">
<button class="text-outline hover:text-primary transition-colors">
<span class="material-symbols-outlined">more_vert</span>
</button>
</td>
</tr>
<tr class="hover:bg-surface-container-low transition-colors group">
<td class="px-6 py-4">
<div class="flex items-center gap-3">
<div class="w-8 h-8 rounded-full bg-tertiary-fixed/20 flex items-center justify-center text-tertiary">
<span class="material-symbols-outlined text-[18px]">campaign</span>
</div>
<div>
<p class="font-body-md text-body-md font-semibold">Mariana Velez</p>
<p class="text-caption text-outline">Jaladora</p>
</div>
</div>
</td>
<td class="px-6 py-4 text-body-md">Carlos Ruíz</td>
<td class="px-6 py-4 font-semibold text-primary">$120.00</td>
<td class="px-6 py-4">
<span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-caption font-medium bg-error-container/30 text-error border border-error/20">
                                            Pendiente
                                        </span>
</td>
<td class="px-6 py-4 text-right">
<button class="text-outline hover:text-primary transition-colors">
<span class="material-symbols-outlined">payments</span>
</button>
</td>
</tr>
<tr class="hover:bg-surface-container-low transition-colors group">
<td class="px-6 py-4">
<div class="flex items-center gap-3">
<div class="w-8 h-8 rounded-full bg-secondary-container/20 flex items-center justify-center text-secondary">
<span class="material-symbols-outlined text-[18px]">medical_services</span>
</div>
<div>
<p class="font-body-md text-body-md font-semibold">Dra. Sofía Luna</p>
<p class="text-caption text-outline">Médico</p>
</div>
</div>
</td>
<td class="px-6 py-4 text-body-md">Beatriz Castillo</td>
<td class="px-6 py-4 font-semibold text-primary">$800.00</td>
<td class="px-6 py-4">
<span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-caption font-medium bg-error-container/30 text-error border border-error/20">
                                            Pendiente
                                        </span>
</td>
<td class="px-6 py-4 text-right">
<button class="text-outline hover:text-primary transition-colors">
<span class="material-symbols-outlined">payments</span>
</button>
</td>
</tr>
</tbody>
</table>
<div class="p-4 bg-surface-container-low flex items-center justify-between border-t border-outline-variant">
<p class="text-caption text-outline">Mostrando 3 de 48 registros</p>
<div class="flex gap-1">
<button class="w-8 h-8 flex items-center justify-center border border-outline-variant bg-white rounded hover:bg-surface-container transition-all">
<span class="material-symbols-outlined text-[18px]">chevron_left</span>
</button>
<button class="w-8 h-8 flex items-center justify-center border border-primary bg-primary text-white rounded text-caption font-bold">1</button>
<button class="w-8 h-8 flex items-center justify-center border border-outline-variant bg-white rounded text-caption hover:bg-surface-container">2</button>
<button class="w-8 h-8 flex items-center justify-center border border-outline-variant bg-white rounded hover:bg-surface-container transition-all">
<span class="material-symbols-outlined text-[18px]">chevron_right</span>
</button>
</div>
</div>
</div>
</div>
<!-- History Column / Secondary Info -->
<div class="col-span-12 space-y-gutter">
<div class="grid grid-cols-1 md:grid-cols-3 gap-gutter">
<!-- Quick Stats -->
<div class="bg-primary text-white p-stack_lg flex items-center justify-between shadow-sm overflow-hidden relative">
<div class="z-10">
<p class="font-label-md text-label-md opacity-80 uppercase tracking-widest">Total Pendiente</p>
<p class="text-display-lg font-display-lg mt-1">$12,450.00</p>
</div>
<span class="material-symbols-outlined text-[80px] absolute -right-4 -bottom-4 opacity-10">account_balance_wallet</span>
</div>
<div class="bg-secondary text-white p-stack_lg flex items-center justify-between shadow-sm overflow-hidden relative">
<div class="z-10">
<p class="font-label-md text-label-md opacity-80 uppercase tracking-widest">Pagado este Mes</p>
<p class="text-display-lg font-display-lg mt-1">$34,200.00</p>
</div>
<span class="material-symbols-outlined text-[80px] absolute -right-4 -bottom-4 opacity-10">task_alt</span>
</div>
<!-- Mini History Card -->
<div class="bg-white border border-outline-variant p-stack_lg flex flex-col h-full">
<h4 class="font-title-lg text-title-lg mb-4 flex items-center gap-2">
<span class="material-symbols-outlined text-primary">history</span>
                                Últimos Pagos
                            </h4>
<div class="space-y-4 flex-1">
<div class="flex items-center gap-3 border-l-2 border-secondary pl-3">
<div class="flex-1">
<p class="font-body-md text-body-md font-semibold">Transferencia: Dr. Silva</p>
<p class="text-caption text-outline">Hace 2 horas • Ref: #0921</p>
</div>
<p class="font-body-md font-bold text-secondary">+$450</p>
</div>
<div class="flex items-center gap-3 border-l-2 border-secondary pl-3">
<div class="flex-1">
<p class="font-body-md text-body-md font-semibold">Efectivo: Juan M.</p>
<p class="text-caption text-outline">Ayer • Ref: #0920</p>
</div>
<p class="font-body-md font-bold text-secondary">+$1,200</p>
</div>
</div>
<button class="mt-4 text-center font-label-md text-label-md text-primary hover:underline underline-offset-4">Ver Historial Completo</button>
</div>
</div>
</div>
</div>
</div>
</main>`;

export const Route = createFileRoute("/comisiones")({
  head: () => ({
    meta: [
      { title: "OMVITAL - Comisiones" },
      { name: "description", content: "Control de comisiones" },
    ],
  }),
  component: Page,
});

function Page() {
  return <div dangerouslySetInnerHTML={{ __html: html }} />;
}
