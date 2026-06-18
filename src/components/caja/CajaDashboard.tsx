import { useState } from "react";
import { type SesionCaja, type Movimiento, useMovimientos, useAddMovimiento } from "../../hooks/useCaja";
import { MovimientosTable } from "./MovimientosTable";
import { CerrarCajaDialog } from "./CerrarCajaDialog";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Textarea } from "../ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { toast } from "sonner";

type CajaDashboardProps = {
  session: SesionCaja;
};

export function CajaDashboard({ session }: CajaDashboardProps) {
  const { data: movimientos = [] } = useMovimientos(session.id);
  const addMovimientoMutation = useAddMovimiento();
  const [isCerrarDialogOpen, setIsCerrarDialogOpen] = useState(false);

  // States for forms
  const [ingresoMonto, setIngresoMonto] = useState("");
  const [ingresoConcepto, setIngresoConcepto] = useState("");
  const [ingresoMetodo, setIngresoMetodo] = useState("Efectivo");

  const [egresoMonto, setEgresoMonto] = useState("");
  const [egresoConcepto, setEgresoConcepto] = useState("");
  const [egresoNota, setEgresoNota] = useState("");

  const totalIngresos = movimientos.filter(m => m.tipo === "Ingreso").reduce((acc, m) => acc + m.monto, 0);
  const totalEgresos = movimientos.filter(m => m.tipo === "Egreso").reduce((acc, m) => acc + m.monto, 0);
  const saldoActual = session.monto_apertura + totalIngresos - totalEgresos;

  const handleIngreso = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!ingresoMonto || !ingresoConcepto) return;
    try {
      await addMovimientoMutation.mutateAsync({
        caja_id: session.id,
        tipo: "Ingreso",
        monto: parseFloat(ingresoMonto),
        concepto: ingresoConcepto,
        categoria: "Servicio",
        metodo: ingresoMetodo,
        estado: "Completado",
        nota: null,
        paquete_cliente_id: null
      });
      toast.success("Ingreso registrado");
      setIngresoMonto("");
      setIngresoConcepto("");
    } catch (error) {
      toast.error("Error al registrar ingreso");
    }
  };

  const handleEgreso = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!egresoMonto || !egresoConcepto) return;
    try {
      await addMovimientoMutation.mutateAsync({
        caja_id: session.id,
        tipo: "Egreso",
        monto: parseFloat(egresoMonto),
        concepto: egresoConcepto,
        categoria: "Operativo",
        metodo: "Efectivo", // o el que elijan
        estado: "Completado",
        nota: egresoNota || null,
        paquete_cliente_id: null
      });
      toast.success("Egreso registrado");
      setEgresoMonto("");
      setEgresoConcepto("");
      setEgresoNota("");
    } catch (error) {
      toast.error("Error al registrar egreso");
    }
  };

  return (
    <div className="space-y-6">
      {/* Summary Bar */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-gutter mb-stack_lg">
        <div className="bg-surface border border-outline-variant p-stack_md rounded-lg">
          <p className="text-outline text-[11px] font-bold uppercase tracking-wider mb-1">Apertura</p>
          <div className="flex items-center justify-between">
            <h2 className="font-headline-md text-headline-md text-on-surface tracking-tight">
              S/ {session.monto_apertura.toFixed(2)}
            </h2>
            <span className="material-symbols-outlined text-outline bg-outline/10 p-2 rounded-full">play_arrow</span>
          </div>
        </div>
        <div className="bg-surface border border-outline-variant p-stack_md rounded-lg">
          <p className="text-outline text-[11px] font-bold uppercase tracking-wider mb-1">Total Ingresos</p>
          <div className="flex items-center justify-between">
            <h2 className="font-headline-md text-headline-md text-primary tracking-tight">
              S/ {totalIngresos.toFixed(2)}
            </h2>
            <span className="material-symbols-outlined text-primary bg-primary/10 p-2 rounded-full">trending_up</span>
          </div>
        </div>
        <div className="bg-surface border border-outline-variant p-stack_md rounded-lg">
          <p className="text-outline text-[11px] font-bold uppercase tracking-wider mb-1">Total Egresos</p>
          <div className="flex items-center justify-between">
            <h2 className="font-headline-md text-headline-md text-error tracking-tight">
              S/ {totalEgresos.toFixed(2)}
            </h2>
            <span className="material-symbols-outlined text-error bg-error/10 p-2 rounded-full">trending_down</span>
          </div>
        </div>
        <div className="bg-surface border border-outline-variant p-stack_md rounded-lg shadow-sm">
          <p className="text-outline text-[11px] font-bold uppercase tracking-wider mb-1">Saldo Actual</p>
          <div className="flex items-center justify-between">
            <h2 className="font-headline-md text-headline-md text-on-surface font-extrabold tracking-tight">
              S/ {saldoActual.toFixed(2)}
            </h2>
            <span className="material-symbols-outlined text-secondary bg-secondary/10 p-2 rounded-full">payments</span>
          </div>
        </div>
      </div>

      <div className="flex justify-end mb-4">
        <Button 
          onClick={() => setIsCerrarDialogOpen(true)}
          className="flex items-center gap-2 bg-primary text-white px-6 py-3 rounded-lg font-bold hover:brightness-110 shadow-md group h-auto"
        >
          <span className="material-symbols-outlined group-hover:rotate-180 transition-transform duration-500">lock</span>
          Cierre de Caja
        </Button>
      </div>

      <div className="grid grid-cols-12 gap-gutter">
        {/* Registration Forms (Left Column) */}
        <div className="col-span-12 lg:col-span-4 space-y-gutter">
          
          {/* Form Ingresos */}
          <section className="bg-white border border-outline-variant rounded-lg p-stack_lg">
            <div className="flex items-center gap-2 mb-stack_lg border-b border-outline-variant pb-3">
              <span className="material-symbols-outlined text-primary" style={{fontVariationSettings: "'FILL' 1"}}>add_circle</span>
              <h3 className="font-headline-sm text-headline-sm">Nuevo Ingreso</h3>
            </div>
            <form className="space-y-4" onSubmit={handleIngreso}>
              <div>
                <Label>Monto (S/)</Label>
                <Input type="number" step="0.10" value={ingresoMonto} onChange={e => setIngresoMonto(e.target.value)} required placeholder="0.00" />
              </div>
              <div>
                <Label>Concepto *</Label>
                <Select value={ingresoConcepto} onValueChange={setIngresoConcepto} required>
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccionar concepto..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Pago de Sesión">Pago de Sesión</SelectItem>
                    <SelectItem value="Venta de Insumos">Venta de Insumos</SelectItem>
                    <SelectItem value="Paquete de Terapias">Paquete de Terapias</SelectItem>
                    <SelectItem value="Otros Ingresos">Otros Ingresos</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Método de Pago</Label>
                <div className="grid grid-cols-2 gap-2 mt-2">
                  <label className="flex items-center justify-center gap-2 p-2 border border-outline-variant rounded cursor-pointer hover:bg-surface-container-low transition-colors has-[:checked]:border-primary has-[:checked]:bg-primary/5">
                    <input type="radio" name="pay_method" value="Efectivo" checked={ingresoMetodo === "Efectivo"} onChange={() => setIngresoMetodo("Efectivo")} className="hidden" />
                    <span className="material-symbols-outlined text-sm">money</span>
                    <span className="text-body-md">Efectivo</span>
                  </label>
                  <label className="flex items-center justify-center gap-2 p-2 border border-outline-variant rounded cursor-pointer hover:bg-surface-container-low transition-colors has-[:checked]:border-primary has-[:checked]:bg-primary/5">
                    <input type="radio" name="pay_method" value="Yape/Plin" checked={ingresoMetodo === "Yape/Plin"} onChange={() => setIngresoMetodo("Yape/Plin")} className="hidden" />
                    <span className="material-symbols-outlined text-sm">qr_code_2</span>
                    <span className="text-body-md">Yape / Plin</span>
                  </label>
                </div>
              </div>
              <Button type="submit" className="w-full mt-4" disabled={addMovimientoMutation.isPending}>Registrar Ingreso</Button>
            </form>
          </section>

          {/* Form Egresos */}
          <section className="bg-white border border-outline-variant rounded-lg p-stack_lg">
            <div className="flex items-center gap-2 mb-stack_lg border-b border-outline-variant pb-3">
              <span className="material-symbols-outlined text-error" style={{fontVariationSettings: "'FILL' 1"}}>remove_circle</span>
              <h3 className="font-headline-sm text-headline-sm">Egreso Operativo</h3>
            </div>
            <form className="space-y-4" onSubmit={handleEgreso}>
              <div>
                <Label>Monto (S/)</Label>
                <Input type="number" step="0.10" value={egresoMonto} onChange={e => setEgresoMonto(e.target.value)} required placeholder="0.00" className="focus-visible:ring-error border-error/50" />
              </div>
              <div>
                <Label>Concepto *</Label>
                <Input type="text" value={egresoConcepto} onChange={e => setEgresoConcepto(e.target.value)} required placeholder="Ej: Pago de Luz, Alquiler" className="focus-visible:ring-error border-error/50" />
              </div>
              <div>
                <Label>Nota Adicional</Label>
                <Textarea value={egresoNota} onChange={e => setEgresoNota(e.target.value)} placeholder="Detalles del gasto..." className="focus-visible:ring-error border-error/50 resize-none h-20" />
              </div>
              <Button type="submit" variant="outline" className="w-full mt-4 border-error text-error hover:bg-error/5 hover:text-error" disabled={addMovimientoMutation.isPending}>Registrar Gasto</Button>
            </form>
          </section>
        </div>

        {/* Transaction History (Right Column) */}
        <div className="col-span-12 lg:col-span-8">
          <MovimientosTable movimientos={movimientos} />
        </div>
      </div>

      <CerrarCajaDialog 
        isOpen={isCerrarDialogOpen} 
        onOpenChange={setIsCerrarDialogOpen}
        sessionId={session.id}
        expectedBalance={saldoActual}
      />
    </div>
  );
}
