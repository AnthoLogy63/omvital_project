import { createFileRoute } from "@tanstack/react-router";

const html = `<main class="ml-[260px] mt-[64px] w-full p-stack_lg h-[calc(100vh-64px)] overflow-y-auto scrollbar-hide">
<!-- Header Section -->
<div class="flex items-center justify-between mb-stack_lg">
<div>
<h2 class="font-headline-md text-headline-md">Gestión de Trabajadores</h2>
<p class="text-on-surface-variant font-body-md">Catálogo de personal interno y referidores externos para trazabilidad de comisiones.</p>
</div>
<button class="bg-primary text-on-primary px-6 py-2.5 rounded-lg flex items-center font-label-md text-label-md hover:brightness-110 active:scale-95 transition-all shadow-sm" onclick="openModal()">
<span class="material-symbols-outlined mr-2">person_add</span>
                REGISTRAR TRABAJADOR
            </button>
</div>
<div class="grid grid-cols-12 gap-gutter">
<!-- Bento Grid - Stats -->
<div class="col-span-12 md:col-span-4 border border-outline-variant rounded-xl p-stack_md bg-white flex items-center">
<div class="w-12 h-12 rounded-full bg-primary-container/10 text-primary flex items-center justify-center mr-4">
<span class="material-symbols-outlined" style="font-variation-settings: 'FILL' 1;">groups</span>
</div>
<div>
<p class="text-caption text-on-surface-variant uppercase tracking-wider font-semibold">Total Personal</p>
<p class="font-headline-md text-headline-md">124</p>
</div>
</div>
<div class="col-span-12 md:col-span-4 border border-outline-variant rounded-xl p-stack_md bg-white flex items-center">
<div class="w-12 h-12 rounded-full bg-secondary-container/20 text-secondary flex items-center justify-center mr-4">
<span class="material-symbols-outlined" style="font-variation-settings: 'FILL' 1;">medical_services</span>
</div>
<div>
<p class="text-caption text-on-surface-variant uppercase tracking-wider font-semibold">Médicos Externos</p>
<p class="font-headline-md text-headline-md">32</p>
</div>
</div>
<div class="col-span-12 md:col-span-4 border border-outline-variant rounded-xl p-stack_md bg-white flex items-center">
<div class="w-12 h-12 rounded-full bg-tertiary-container/10 text-tertiary flex items-center justify-center mr-4">
<span class="material-symbols-outlined" style="font-variation-settings: 'FILL' 1;">trending_up</span>
</div>
<div>
<p class="text-caption text-on-surface-variant uppercase tracking-wider font-semibold">Activos este mes</p>
<p class="font-headline-md text-headline-md">89%</p>
</div>
</div>
<!-- Main Catalog Table -->
<div class="col-span-12 border border-outline-variant rounded-xl bg-white overflow-hidden flex flex-col">
<div class="px-6 py-4 bg-surface-container-low/50 border-b border-outline-variant flex justify-between items-center">
<h3 class="font-title-lg text-title-lg">Listado de Referidores y Staff</h3>
<div class="flex gap-2">
<button class="px-3 py-1.5 border border-outline-variant rounded bg-white text-on-surface-variant text-label-md flex items-center hover:bg-surface-container-low">
<span class="material-symbols-outlined text-[18px] mr-1">filter_alt</span> Filtrar
                        </button>
<button class="px-3 py-1.5 border border-outline-variant rounded bg-white text-on-surface-variant text-label-md flex items-center hover:bg-surface-container-low">
<span class="material-symbols-outlined text-[18px] mr-1">download</span> Exportar
                        </button>
</div>
</div>
<div class="overflow-x-auto">
<table class="w-full text-left border-collapse">
<thead class="bg-[#F8FAFB]">
<tr>
<th class="px-6 py-3 font-label-md text-label-md text-on-surface-variant">TRABAJADOR</th>
<th class="px-6 py-3 font-label-md text-label-md text-on-surface-variant">DNI / ID</th>
<th class="px-6 py-3 font-label-md text-label-md text-on-surface-variant">ROL</th>
<th class="px-6 py-3 font-label-md text-label-md text-on-surface-variant text-center">COMISIONES</th>
<th class="px-6 py-3 font-label-md text-label-md text-on-surface-variant">ESTADO</th>
<th class="px-6 py-3 font-label-md text-label-md text-on-surface-variant text-right">ACCIONES</th>
</tr>
</thead>
<tbody class="divide-y divide-outline-variant">
<tr class="hover:bg-[#F4F6F8] transition-colors group">
<td class="px-6 py-4">
<div class="flex items-center">
<div class="w-10 h-10 rounded-full bg-primary-fixed text-primary flex items-center justify-center font-bold mr-3">JC</div>
<div>
<p class="font-label-md text-label-md font-bold">Juan Carlos Pérez</p>
<p class="text-caption text-on-surface-variant">Rehabilitación Física</p>
</div>
</div>
</td>
<td class="px-6 py-4 font-body-md text-body-md">45218809</td>
<td class="px-6 py-4">
<span class="text-caption px-2 py-1 bg-surface-container-highest rounded text-on-surface-variant font-medium">Interno</span>
</td>
<td class="px-6 py-4 text-center">
<p class="font-label-md text-label-md text-primary">S/ 420.00</p>
<p class="text-[10px] text-on-surface-variant uppercase">Este mes</p>
</td>
<td class="px-6 py-4">
<span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
<span class="w-1.5 h-1.5 rounded-full bg-green-500 mr-1.5"></span> Activo
                                    </span>
</td>
<td class="px-6 py-4 text-right">
<button class="text-on-surface-variant hover:text-primary transition-colors p-1"><span class="material-symbols-outlined">edit</span></button>
<button class="text-on-surface-variant hover:text-primary transition-colors p-1"><span class="material-symbols-outlined">visibility</span></button>
</td>
</tr>
<tr class="hover:bg-[#F4F6F8] transition-colors group">
<td class="px-6 py-4">
<div class="flex items-center">
<div class="w-10 h-10 rounded-full bg-secondary-fixed-dim text-on-secondary-fixed flex items-center justify-center font-bold mr-3">MA</div>
<div>
<p class="font-label-md text-label-md font-bold">Dra. María Alva</p>
<p class="text-caption text-on-surface-variant">Traumatología</p>
</div>
</div>
</td>
<td class="px-6 py-4 font-body-md text-body-md">10293847</td>
<td class="px-6 py-4">
<span class="text-caption px-2 py-1 bg-secondary-container text-on-secondary-container rounded font-medium">Médico Externo</span>
</td>
<td class="px-6 py-4 text-center">
<p class="font-label-md text-label-md text-primary">S/ 1,250.00</p>
<p class="text-[10px] text-on-surface-variant uppercase">Este mes</p>
</td>
<td class="px-6 py-4">
<span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
<span class="w-1.5 h-1.5 rounded-full bg-green-500 mr-1.5"></span> Activo
                                    </span>
</td>
<td class="px-6 py-4 text-right">
<button class="text-on-surface-variant hover:text-primary transition-colors p-1"><span class="material-symbols-outlined">edit</span></button>
<button class="text-on-surface-variant hover:text-primary transition-colors p-1"><span class="material-symbols-outlined">visibility</span></button>
</td>
</tr>
<tr class="hover:bg-[#F4F6F8] transition-colors group">
<td class="px-6 py-4">
<div class="flex items-center">
<div class="w-10 h-10 rounded-full bg-tertiary-fixed-dim text-on-tertiary-fixed flex items-center justify-center font-bold mr-3">RS</div>
<div>
<p class="font-label-md text-label-md font-bold">Rosa Sánchez</p>
<p class="text-caption text-on-surface-variant">Referidora de Campo</p>
</div>
</div>
</td>
<td class="px-6 py-4 font-body-md text-body-md">73920112</td>
<td class="px-6 py-4">
<span class="text-caption px-2 py-1 bg-tertiary-fixed text-on-tertiary-fixed-variant rounded font-medium">Jaladora</span>
</td>
<td class="px-6 py-4 text-center">
<p class="font-label-md text-label-md text-primary">S/ 840.00</p>
<p class="text-[10px] text-on-surface-variant uppercase">Este mes</p>
</td>
<td class="px-6 py-4">
<span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
<span class="w-1.5 h-1.5 rounded-full bg-green-500 mr-1.5"></span> Activo
                                    </span>
</td>
<td class="px-6 py-4 text-right">
<button class="text-on-surface-variant hover:text-primary transition-colors p-1"><span class="material-symbols-outlined">edit</span></button>
<button class="text-on-surface-variant hover:text-primary transition-colors p-1"><span class="material-symbols-outlined">visibility</span></button>
</td>
</tr>
<tr class="hover:bg-[#F4F6F8] transition-colors group">
<td class="px-6 py-4">
<div class="flex items-center">
<div class="w-10 h-10 rounded-full bg-surface-variant text-on-surface-variant flex items-center justify-center font-bold mr-3">LM</div>
<div>
<p class="font-label-md text-label-md font-bold">Luis Mendoza</p>
<p class="text-caption text-on-surface-variant">Ex-Personal</p>
</div>
</div>
</td>
<td class="px-6 py-4 font-body-md text-body-md">44093321</td>
<td class="px-6 py-4">
<span class="text-caption px-2 py-1 bg-surface-container-highest rounded text-on-surface-variant font-medium">Interno</span>
</td>
<td class="px-6 py-4 text-center">
<p class="font-label-md text-label-md text-outline">S/ 0.00</p>
<p class="text-[10px] text-on-surface-variant uppercase">Este mes</p>
</td>
<td class="px-6 py-4">
<span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-error-container text-on-error-container">
<span class="w-1.5 h-1.5 rounded-full bg-error mr-1.5"></span> Inactivo
                                    </span>
</td>
<td class="px-6 py-4 text-right">
<button class="text-on-surface-variant hover:text-primary transition-colors p-1"><span class="material-symbols-outlined">edit</span></button>
<button class="text-on-surface-variant hover:text-primary transition-colors p-1"><span class="material-symbols-outlined">visibility</span></button>
</td>
</tr>
</tbody>
</table>
</div>
<div class="px-6 py-4 border-t border-outline-variant flex items-center justify-between bg-surface-container-low/30">
<p class="text-caption text-on-surface-variant">Mostrando 4 de 124 registros</p>
<div class="flex gap-1">
<button class="w-8 h-8 flex items-center justify-center border border-outline-variant rounded hover:bg-white transition-colors"><span class="material-symbols-outlined text-[18px]">chevron_left</span></button>
<button class="w-8 h-8 flex items-center justify-center bg-primary text-on-primary rounded font-bold text-caption">1</button>
<button class="w-8 h-8 flex items-center justify-center border border-outline-variant rounded hover:bg-white transition-colors text-caption">2</button>
<button class="w-8 h-8 flex items-center justify-center border border-outline-variant rounded hover:bg-white transition-colors text-caption">3</button>
<button class="w-8 h-8 flex items-center justify-center border border-outline-variant rounded hover:bg-white transition-colors"><span class="material-symbols-outlined text-[18px]">chevron_right</span></button>
</div>
</div>
</div>
<!-- Traceability Insight Card -->
<div class="col-span-12 border border-outline-variant rounded-xl p-stack_lg bg-white">
<div class="flex items-start justify-between mb-4">
<div>
<h4 class="font-title-lg text-title-lg mb-1">Referenciadores Destacados</h4>
<p class="text-caption text-on-surface-variant">Basado en el volumen de pacientes referidos los últimos 30 días.</p>
</div>
<span class="material-symbols-outlined text-primary text-[32px]">insights</span>
</div>
<div class="grid grid-cols-1 md:grid-cols-3 gap-stack_lg">
<div class="p-4 rounded-lg bg-surface-container-low border border-outline-variant/50">
<div class="flex justify-between items-end mb-2">
<p class="text-label-md font-bold">Dra. Alva</p>
<span class="text-primary font-bold text-headline-sm">42</span>
</div>
<div class="w-full bg-outline-variant/30 h-1.5 rounded-full overflow-hidden">
<div class="bg-primary h-full w-[85%]"></div>
</div>
<p class="text-[10px] mt-2 text-on-surface-variant">Pacientes referidos</p>
</div>
<div class="p-4 rounded-lg bg-surface-container-low border border-outline-variant/50">
<div class="flex justify-between items-end mb-2">
<p class="text-label-md font-bold">Rosa Sánchez</p>
<span class="text-secondary font-bold text-headline-sm">28</span>
</div>
<div class="w-full bg-outline-variant/30 h-1.5 rounded-full overflow-hidden">
<div class="bg-secondary h-full w-[60%]"></div>
</div>
<p class="text-[10px] mt-2 text-on-surface-variant">Pacientes referidos</p>
</div>
<div class="p-4 rounded-lg bg-surface-container-low border border-outline-variant/50">
<div class="flex justify-between items-end mb-2">
<p class="text-label-md font-bold">Clínica San Borja</p>
<span class="text-tertiary font-bold text-headline-sm">15</span>
</div>
<div class="w-full bg-outline-variant/30 h-1.5 rounded-full overflow-hidden">
<div class="bg-tertiary h-full w-[35%]"></div>
</div>
<p class="text-[10px] mt-2 text-on-surface-variant">Pacientes referidos</p>
</div>
</div>
</div>
</div>
</main>`;

export const Route = createFileRoute("/trabajadores")({
  head: () => ({
    meta: [
      { title: "OMVITAL - Trabajadores" },
      { name: "description", content: "Catálogo de trabajadores" },
    ],
  }),
  component: Page,
});

function Page() {
  return <div dangerouslySetInnerHTML={{ __html: html }} />;
}
