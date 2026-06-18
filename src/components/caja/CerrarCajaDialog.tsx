import { useState } from "react";
import { useCloseSession } from "../../hooks/useCaja";
import { Button } from "../ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../ui/dialog";
import { toast } from "sonner";
import { Input } from "../ui/input";
import { Label } from "../ui/label";

type CerrarCajaDialogProps = {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  sessionId: string;
  expectedBalance: number;
};

export function CerrarCajaDialog({ isOpen, onOpenChange, sessionId, expectedBalance }: CerrarCajaDialogProps) {
  const [actualBalance, setActualBalance] = useState<string>(expectedBalance.toString());
  const closeSessionMutation = useCloseSession();

  const handleClose = async () => {
    const amount = parseFloat(actualBalance);
    if (isNaN(amount) || amount < 0) {
      toast.error("Por favor ingresa un monto válido");
      return;
    }

    try {
      await closeSessionMutation.mutateAsync({ id: sessionId, monto_cierre: amount });
      toast.success("Caja cerrada exitosamente");
      onOpenChange(false);
    } catch (error) {
      console.error(error);
      toast.error("Ocurrió un error al cerrar la caja");
    }
  };

  const isDiferencia = parseFloat(actualBalance) !== expectedBalance;
  const diferencia = parseFloat(actualBalance) - expectedBalance;

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Cerrar Caja</DialogTitle>
          <DialogDescription>
            Por favor, confirma el monto final en caja antes de cerrar el turno.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="flex justify-between items-center bg-surface-container-low p-3 rounded-md">
            <span className="text-sm text-on-surface-variant">Monto Esperado (Sistema):</span>
            <span className="font-bold">S/ {expectedBalance.toFixed(2)}</span>
          </div>
          
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="actual_balance" className="col-span-4">
              Monto Físico Actual (S/)
            </Label>
            <Input
              id="actual_balance"
              type="number"
              step="0.10"
              value={actualBalance}
              onChange={(e) => setActualBalance(e.target.value)}
              className="col-span-4"
            />
          </div>

          {!isNaN(diferencia) && isDiferencia && (
            <div className={`text-sm font-medium ${diferencia > 0 ? "text-secondary" : "text-error"}`}>
              Diferencia: {diferencia > 0 ? "+" : ""}S/ {diferencia.toFixed(2)}
            </div>
          )}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancelar</Button>
          <Button 
            onClick={handleClose} 
            disabled={closeSessionMutation.isPending}
            className="bg-error hover:bg-error/90 text-white"
          >
            {closeSessionMutation.isPending ? "Cerrando..." : "Confirmar Cierre"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
