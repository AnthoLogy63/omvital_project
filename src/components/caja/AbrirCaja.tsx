import { useState } from "react";
import { useOpenSession } from "../../hooks/useCaja";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card";
import { toast } from "sonner";

export function AbrirCaja() {
  const [montoApertura, setMontoApertura] = useState<string>("");
  const openSessionMutation = useOpenSession();

  const handleOpen = async (e: React.FormEvent) => {
    e.preventDefault();
    const amount = parseFloat(montoApertura);
    if (isNaN(amount) || amount < 0) {
      toast.error("Por favor ingresa un monto válido");
      return;
    }

    try {
      await openSessionMutation.mutateAsync({ monto_apertura: amount });
      toast.success("Caja abierta exitosamente");
    } catch (error) {
      console.error(error);
      toast.error("Ocurrió un error al abrir la caja");
    }
  };

  return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <Card className="w-[400px]">
        <CardHeader>
          <CardTitle className="text-2xl">Apertura de Caja</CardTitle>
          <CardDescription>Ingresa el monto inicial para abrir la caja del día.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleOpen} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="monto">Monto Inicial (S/)</Label>
              <Input
                id="monto"
                type="number"
                step="0.10"
                placeholder="0.00"
                value={montoApertura}
                onChange={(e) => setMontoApertura(e.target.value)}
                required
                className="text-lg"
              />
            </div>
            <Button 
              type="submit" 
              className="w-full"
              disabled={openSessionMutation.isPending}
            >
              {openSessionMutation.isPending ? "Abriendo..." : "Abrir Caja"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
