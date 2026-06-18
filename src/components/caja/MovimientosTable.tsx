import { useState } from "react";
import type { Movimiento } from "../../hooks/useCaja";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { Button } from "../ui/button";
import { format } from "date-fns";
import { es } from "date-fns/locale";

type MovimientosTableProps = {
  movimientos: Movimiento[];
};

export function MovimientosTable({ movimientos }: MovimientosTableProps) {
  const [filter, setFilter] = useState<"Todos" | "Ingreso" | "Egreso">("Todos");

  const filteredMovimientos = movimientos.filter((m) => 
    filter === "Todos" ? true : m.tipo === filter
  );

  return (
    <div className="bg-white border border-outline-variant rounded-lg overflow-hidden flex flex-col h-full min-h-[600px]">
      <div className="p-stack_lg border-b border-outline-variant flex flex-wrap items-center justify-between gap-4">
        <div>
          <h3 className="font-headline-sm text-headline-sm">Movimientos del Día</h3>
          <p className="text-caption text-outline">Listado detallado de transacciones de esta sesión</p>
        </div>
        <div className="flex items-center gap-2">
          <Select value={filter} onValueChange={(val) => setFilter(val as any)}>
            <SelectTrigger className="w-[180px] rounded-full">
              <SelectValue placeholder="Filtrar tipo" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Todos">Todos los tipos</SelectItem>
              <SelectItem value="Ingreso">Solo Ingresos</SelectItem>
              <SelectItem value="Egreso">Solo Egresos</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" size="icon">
            <span className="material-symbols-outlined text-sm">filter_list</span>
          </Button>
          <Button variant="outline" size="icon">
            <span className="material-symbols-outlined text-sm">download</span>
          </Button>
        </div>
      </div>
      <div className="overflow-x-auto flex-1">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-[#F8FAFB] border-b border-outline-variant">
              <th className="px-6 py-4 font-label-md text-label-md text-outline">HORA</th>
              <th className="px-6 py-4 font-label-md text-label-md text-outline">CONCEPTO</th>
              <th className="px-6 py-4 font-label-md text-label-md text-outline">MÉTODO</th>
              <th className="px-6 py-4 font-label-md text-label-md text-outline text-right">MONTO</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-outline-variant/50">
            {filteredMovimientos.length === 0 ? (
              <tr>
                <td colSpan={4} className="px-6 py-8 text-center text-outline">
                  No hay movimientos registrados.
                </td>
              </tr>
            ) : (
              filteredMovimientos.map((mov) => (
                <tr key={mov.id} className="hover:bg-surface-container-low transition-colors">
                  <td className="px-6 py-4 text-body-md text-outline">
                    {format(new Date(mov.created_at), "hh:mm a", { locale: es })}
                  </td>
                  <td className="px-6 py-4">
                    <p className="font-bold text-on-surface">{mov.concepto}</p>
                    <p className="text-caption text-outline">{mov.tipo} - {mov.categoria}</p>
                    {mov.nota && <p className="text-caption text-outline italic mt-1">{mov.nota}</p>}
                  </td>
                  <td className="px-6 py-4">
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-tighter ${
                      mov.metodo === "Efectivo" 
                        ? "bg-primary/10 text-primary" 
                        : "bg-secondary-container text-secondary"
                    }`}>
                      {mov.metodo}
                    </span>
                  </td>
                  <td className={`px-6 py-4 text-right font-bold ${
                    mov.tipo === "Ingreso" ? "text-primary" : "text-error"
                  }`}>
                    {mov.tipo === "Ingreso" ? "+" : "-"} S/ {mov.monto.toFixed(2)}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
      <div className="p-4 border-t border-outline-variant bg-surface-container-low flex items-center justify-between">
        <p className="text-caption text-outline">
          Mostrando {filteredMovimientos.length} movimiento(s)
        </p>
      </div>
    </div>
  );
}
