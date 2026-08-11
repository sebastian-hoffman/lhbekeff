import { CheckinSearch } from "@/components/admin/checkin-search";

export default function AdminIngresoPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Ingreso</h1>
        <p className="text-sm text-muted-foreground">
          Buscá por apellido, nombre, número de entrada o código de compra.
        </p>
      </div>
      <CheckinSearch />
    </div>
  );
}
