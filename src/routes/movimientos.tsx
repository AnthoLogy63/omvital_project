import { createFileRoute } from "@tanstack/react-router";

const html = `<main class="ml-[260px] flex flex-col min-h-screen">
<!-- Top Navigation Bar -->
<header class="fixed top-0 right-0 h-[64px] w-[calc(100%-260px)] bg-surface/90 backdrop-blur-sm border-b border-outline-variant flex items-center justify-between px-container_padding z-40">
<div class="flex items-center gap-4 flex-1">
<div class="relative w-full max-w-md">
<span class="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline">search</span>
<input class="w-full bg-surface-container border border-outline-variant rounded px-10 py-2 text-body-md focus:outline-none focus:border-primary transition-all" placeholder="Buscar movimientos..." type="text">
</div>
</div>
<div class="flex items-center gap-6">
<button class="relative text-on-surface-variant hover:text-primary transition-all cursor-pointer active:opacity-70">
<span class="material-symbols-outlined">notifications</span>
<span class="absolute top-0 right-0 w-2 h-2 bg-error rounded-full"></span>
</button>
<button class="text-on-surface-variant hover:text-primary transition-all cursor-pointer active:opacity-70">
<span class="material-symbols-outlined">help</span>
</button>
<div class="flex items-center gap-3 pl-4 border-l border-outline-variant">
<div class="text-right">
<p class="font-label-md text-label-md font-bold">William Nuñez</p>
<p class="text-caption text-outline">Administrador</p>
</div>
<img alt="Administrador" class="w-10 h-10 rounded-full object-cover border border-outline-variant" data-alt="A professional headshot of a mature male medical administrator with a kind expression, wearing a clinical white coat and a stethoscope. The background is a blurred high-end medical facility with soft sober blue lighting, creating an atmosphere of trust, precision, and institutional stability in line with a clinical design system." src="https://lh3.googleusercontent.com/aida-public/AB6AXuDVLQ1qx35BHja_IaMLxutb85WKkfEfGlbHl_brTVcm-3q1Yl4KWZFwwNyvyj0xs7APVWPgr1zajrs0nB56mNFxy-clAUXnPiMIdvnkpjz8VwBWHB9JZBOH4FgrnWULe1ph6SvIU-dNMQJCGjXJmB0t0_KjcLBd22mm7NRGgbPBeMPWDBMTu9L9w6EMOFsP9wfqNMTm8s0hav38KgHwS97KCIclYw5N4wU4_qHoT4nApOmq3kSqfB8PQg9_LHrcvr5ZkGljPYTJUxU">
</div>
</div>
</header>
<!-- Workspace Content -->
<section class="mt-[64px] p-container_padding space-y-stack_lg">
<!-- Page Header -->
<div class="flex flex-col md:flex-row md:items-center justify-between gap-4">
<div>
<h2 class="font-headline-md text-headline-md text-primary">Movimientos</h2>
<p class="text-body-md text-on-surface-variant">Libro contable centralizado de la clínica.</p>
</div>
<div class="flex gap-2">
<button class="flex items-center gap-2 px-4 py-2 border border-outline-variant bg-white text-primary rounded font-label-md hover:bg-surface-container-low transition-all">
<span class="material-symbols-outlined text-[20px]">download</span>
                        Exportar CSV
                    </button>
<button class="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded font-label-md hover:bg-primary-container transition-all">
<span class="material-symbols-outlined text-[20px]">add</span>
                        Nuevo Registro
                    </button>
</div>
</div>
<!-- Dashboard Mini-Stats -->
<div class="grid grid-cols-1 md:grid-cols-3 gap-6">
<div class="bg-white border border-outline-variant p-stack_lg rounded-lg">
<p class="text-label-md text-outline mb-1 uppercase tracking-wider">Ingresos Hoy</p>
<div class="flex items-baseline gap-2">
<span class="text-headline-md text-on-surface">$4,520.00</span>
<span class="text-secondary text-caption flex items-center font-bold">
<span class="material-symbols-outlined text-[14px]">trending_up</span> 12%
                        </span>
</div>
</div>
<div class="bg-white border border-outline-variant p-stack_lg rounded-lg">
<p class="text-label-md text-outline mb-1 uppercase tracking-wider">Egresos Hoy</p>
<div class="flex items-baseline gap-2">
<span class="text-headline-md text-on-surface">$1,280.00</span>
<span class="text-error text-caption flex items-center font-bold">
<span class="material-symbols-outlined text-[14px]">trending_down</span> 5%
                        </span>
</div>
</div>
<div class="bg-white border border-outline-variant p-stack_lg rounded-lg">
<p class="text-label-md text-outline mb-1 uppercase tracking-wider">Balance Neto</p>
<div class="flex items-baseline gap-2">
<span class="text-headline-md text-primary">$3,240.00</span>
</div>
</div>
</div>
<!-- Filter Controls -->
<div class="bg-white border border-outline-variant p-4 rounded-lg flex flex-wrap items-center gap-4">
<div class="flex flex-col gap-1">
<label class="font-label-md text-on-surface-variant">Rango de Fecha</label>
<div class="flex items-center gap-2 border border-outline-variant rounded px-3 py-1.5 focus-within:border-primary transition-all">
<span class="material-symbols-outlined text-[18px] text-outline">calendar_today</span>
<input class="text-body-md focus:outline-none bg-transparent" placeholder="Hoy - 12 Oct 2023" type="text">
</div>
</div>
<div class="flex flex-col gap-1">
<label class="font-label-md text-on-surface-variant">Tipo</label>
<select class="border border-outline-variant rounded px-3 py-2 text-body-md focus:outline-none focus:border-primary transition-all min-w-[140px]">
<option>Todos</option>
<option>Ingreso</option>
<option>Egreso</option>
</select>
</div>
<div class="flex flex-col gap-1">
<label class="font-label-md text-on-surface-variant">Origen</label>
<select class="border border-outline-variant rounded px-3 py-2 text-body-md focus:outline-none focus:border-primary transition-all min-w-[140px]">
<option>Todos</option>
<option>Caja</option>
<option>Paquete</option>
<option>Comisión</option>
</select>
</div>
<div class="flex flex-col gap-1">
<label class="font-label-md text-on-surface-variant">Método</label>
<select class="border border-outline-variant rounded px-3 py-2 text-body-md focus:outline-none focus:border-primary transition-all min-w-[140px]">
<option>Todos</option>
<option>Efectivo</option>
<option>Transferencia</option>
<option>Tarjeta</option>
</select>
</div>
<div class="mt-auto pb-1">
<button class="text-primary hover:underline font-label-md flex items-center gap-1">
<span class="material-symbols-outlined text-[18px]">filter_alt_off</span>
                        Limpiar filtros
                    </button>
</div>
</div>
<!-- Unified Ledger Table -->
<div class="bg-white border border-outline-variant rounded-lg overflow-hidden">
<table class="w-full text-left border-collapse">
<thead>
<tr class="bg-[#F8FAFB] border-b border-outline-variant">
<th class="px-6 py-4 font-label-md text-outline uppercase tracking-wider">Fecha &amp; Hora</th>
<th class="px-6 py-4 font-label-md text-outline uppercase tracking-wider">Origen</th>
<th class="px-6 py-4 font-label-md text-outline uppercase tracking-wider">Tipo</th>
<th class="px-6 py-4 font-label-md text-outline uppercase tracking-wider">Método</th>
<th class="px-6 py-4 font-label-md text-outline uppercase tracking-wider text-right">Monto</th>
<th class="px-6 py-4 font-label-md text-outline uppercase tracking-wider"></th>
</tr>
</thead>
<tbody class="divide-y divide-outline-variant">
<!-- Row 1 -->
<tr class="hover:bg-surface-container-low transition-all group">
<td class="px-6 py-4 text-body-md">
<div class="font-medium">12 Oct 2023</div>
<div class="text-caption text-outline">09:45 AM</div>
</td>
<td class="px-6 py-4 text-body-md">
<div class="flex items-center gap-2">
<span class="material-symbols-outlined text-outline text-[20px]">account_balance_wallet</span>
                                    Caja Principal
                                </div>
</td>
<td class="px-6 py-4">
<span class="px-3 py-1 rounded-full text-caption font-bold bg-secondary/10 text-secondary">INGRESO</span>
</td>
<td class="px-6 py-4 text-body-md">Transferencia</td>
<td class="px-6 py-4 text-body-md text-right font-bold text-on-surface">+$1,200.00</td>
<td class="px-6 py-4 text-right">
<button class="opacity-0 group-hover:opacity-100 text-outline hover:text-primary transition-all">
<span class="material-symbols-outlined">more_vert</span>
</button>
</td>
</tr>
<!-- Row 2 -->
<tr class="hover:bg-surface-container-low transition-all group">
<td class="px-6 py-4 text-body-md">
<div class="font-medium">12 Oct 2023</div>
<div class="text-caption text-outline">10:15 AM</div>
</td>
<td class="px-6 py-4 text-body-md">
<div class="flex items-center gap-2">
<span class="material-symbols-outlined text-outline text-[20px]">inventory_2</span>
                                    Paquete Rehabilitación
                                </div>
</td>
<td class="px-6 py-4">
<span class="px-3 py-1 rounded-full text-caption font-bold bg-secondary/10 text-secondary">INGRESO</span>
</td>
<td class="px-6 py-4 text-body-md">Tarjeta</td>
<td class="px-6 py-4 text-body-md text-right font-bold text-on-surface">+$850.00</td>
<td class="px-6 py-4 text-right">
<button class="opacity-0 group-hover:opacity-100 text-outline hover:text-primary transition-all">
<span class="material-symbols-outlined">more_vert</span>
</button>
</td>
</tr>
<!-- Row 3 -->
<tr class="hover:bg-surface-container-low transition-all group">
<td class="px-6 py-4 text-body-md">
<div class="font-medium">12 Oct 2023</div>
<div class="text-caption text-outline">11:00 AM</div>
</td>
<td class="px-6 py-4 text-body-md">
<div class="flex items-center gap-2">
<span class="material-symbols-outlined text-outline text-[20px]">percent</span>
                                    Comisión Terapéutica
                                </div>
</td>
<td class="px-6 py-4">
<span class="px-3 py-1 rounded-full text-caption font-bold bg-error/10 text-error">EGRESO</span>
</td>
<td class="px-6 py-4 text-body-md">Efectivo</td>
<td class="px-6 py-4 text-body-md text-right font-bold text-error">-$250.00</td>
<td class="px-6 py-4 text-right">
<button class="opacity-0 group-hover:opacity-100 text-outline hover:text-primary transition-all">
<span class="material-symbols-outlined">more_vert</span>
</button>
</td>
</tr>
<!-- Row 4 -->
<tr class="hover:bg-surface-container-low transition-all group">
<td class="px-6 py-4 text-body-md">
<div class="font-medium">11 Oct 2023</div>
<div class="text-caption text-outline">04:30 PM</div>
</td>
<td class="px-6 py-4 text-body-md">
<div class="flex items-center gap-2">
<span class="material-symbols-outlined text-outline text-[20px]">account_balance_wallet</span>
                                    Caja Chica
                                </div>
</td>
<td class="px-6 py-4">
<span class="px-3 py-1 rounded-full text-caption font-bold bg-error/10 text-error">EGRESO</span>
</td>
<td class="px-6 py-4 text-body-md">Efectivo</td>
<td class="px-6 py-4 text-body-md text-right font-bold text-error">-$45.00</td>
<td class="px-6 py-4 text-right">
<button class="opacity-0 group-hover:opacity-100 text-outline hover:text-primary transition-all">
<span class="material-symbols-outlined">more_vert</span>
</button>
</td>
</tr>
<!-- Row 5 -->
<tr class="hover:bg-surface-container-low transition-all group">
<td class="px-6 py-4 text-body-md">
<div class="font-medium">11 Oct 2023</div>
<div class="text-caption text-outline">03:00 PM</div>
</td>
<td class="px-6 py-4 text-body-md">
<div class="flex items-center gap-2">
<span class="material-symbols-outlined text-outline text-[20px]">inventory_2</span>
                                    Paquete Familiar
                                </div>
</td>
<td class="px-6 py-4">
<span class="px-3 py-1 rounded-full text-caption font-bold bg-secondary/10 text-secondary">INGRESO</span>
</td>
<td class="px-6 py-4 text-body-md">Transferencia</td>
<td class="px-6 py-4 text-body-md text-right font-bold text-on-surface">+$2,400.00</td>
<td class="px-6 py-4 text-right">
<button class="opacity-0 group-hover:opacity-100 text-outline hover:text-primary transition-all">
<span class="material-symbols-outlined">more_vert</span>
</button>
</td>
</tr>
</tbody>
</table>
<!-- Pagination -->
<div class="px-6 py-4 bg-white flex items-center justify-between border-t border-outline-variant">
<p class="text-caption text-outline">Mostrando 1 a 5 de 128 movimientos</p>
<div class="flex items-center gap-2">
<button class="w-8 h-8 flex items-center justify-center rounded border border-outline-variant text-outline hover:border-primary hover:text-primary transition-all disabled:opacity-50" disabled="">
<span class="material-symbols-outlined text-[18px]">chevron_left</span>
</button>
<button class="w-8 h-8 flex items-center justify-center rounded bg-primary text-white font-label-md">1</button>
<button class="w-8 h-8 flex items-center justify-center rounded border border-outline-variant text-outline hover:border-primary hover:text-primary transition-all font-label-md">2</button>
<button class="w-8 h-8 flex items-center justify-center rounded border border-outline-variant text-outline hover:border-primary hover:text-primary transition-all font-label-md">3</button>
<button class="w-8 h-8 flex items-center justify-center rounded border border-outline-variant text-outline hover:border-primary hover:text-primary transition-all">
<span class="material-symbols-outlined text-[18px]">chevron_right</span>
</button>
</div>
</div>
</div>
<!-- Summary Section (Asymmetric Detail) -->
<div class="grid grid-cols-1 lg:grid-cols-4 gap-6 pb-stack_lg">
<div class="lg:col-span-3 bg-white border border-outline-variant p-stack_lg rounded-lg relative overflow-hidden">
<div class="absolute top-0 right-0 p-4 opacity-10">
<span class="material-symbols-outlined text-[120px] text-primary">analytics</span>
</div>
<h3 class="font-title-lg text-title-lg text-primary mb-4">Nota de Conciliación</h3>
<p class="text-body-md text-on-surface-variant max-w-2xl leading-relaxed">
                        Todos los movimientos mostrados arriba están sincronizados con la pasarela de pagos central. Los egresos por comisiones se liquidan automáticamente al final del día laboral. Asegúrese de que los registros manuales de caja chica coincidan con los comprobantes físicos antes del cierre.
                    </p>
<div class="mt-6 flex gap-4">
<div class="flex flex-col">
<span class="text-caption text-outline uppercase font-bold">Último Cierre</span>
<span class="text-body-md font-medium">Hace 14 horas</span>
</div>
<div class="flex flex-col border-l border-outline-variant pl-4">
<span class="text-caption text-outline uppercase font-bold">Discrepancia</span>
<span class="text-body-md font-medium text-secondary">Ninguna detectada</span>
</div>
</div>
</div>
<div class="bg-primary text-white p-stack_lg rounded-lg flex flex-col justify-between">
<div>
<p class="text-label-md opacity-80 mb-1">Volumen Mensual</p>
<h4 class="text-headline-md">$142,800.00</h4>
</div>
<div class="mt-4 pt-4 border-t border-white/20">
<p class="text-caption opacity-80 mb-2">Meta de Recaudación</p>
<div class="w-full bg-white/20 rounded-full h-2 overflow-hidden">
<div class="bg-white h-full" style="width: 75%"></div>
</div>
<p class="text-right text-caption mt-1">75% alcanzado</p>
</div>
</div>
</div>
</section>
</main>`;

export const Route = createFileRoute("/movimientos")({
  head: () => ({
    meta: [
      { title: "OMVITAL - Movimientos" },
      { name: "description", content: "Libro de movimientos" },
    ],
  }),
  component: Page,
});

function Page() {
  return <div dangerouslySetInnerHTML={{ __html: html }} />;
}
