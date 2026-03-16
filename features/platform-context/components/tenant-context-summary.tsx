import { Building2, GitBranch, ShieldCheck } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { SessionMode } from "@/features/auth/types";

type TenantContextSummaryProps = {
  branchId?: string | null;
  branchName?: string | null;
  businessId?: string | null;
  businessName?: string | null;
  mode: SessionMode | null;
};

function getModeLabel(mode: SessionMode | null) {
  if (mode === "platform") {
    return "platform";
  }

  if (mode === "tenant_context") {
    return "tenant_context";
  }

  return "tenant";
}

function TenantContextSummary({
  branchId,
  branchName,
  businessId,
  businessName,
  mode,
}: TenantContextSummaryProps) {
  return (
    <Card className="border-border/70 bg-card/80">
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-2 text-base">
          <ShieldCheck className="size-4 text-primary" />
          Resumen del contexto operativo
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex flex-wrap gap-2">
          <Badge variant="outline">mode = {getModeLabel(mode)}</Badge>
          <Badge variant="outline">FACFAST same shell</Badge>
        </div>

        <div className="grid gap-3 md:grid-cols-2">
          <div className="rounded-xl border border-border/70 p-4">
            <div className="flex items-center gap-2 text-sm font-medium">
              <Building2 className="size-4 text-muted-foreground" />
              Empresa activa
            </div>
            <p className="mt-2 font-medium">{businessName ?? "Sin empresa seleccionada"}</p>
            <p className="text-sm text-muted-foreground">{businessId ?? "Pendiente"}</p>
          </div>

          <div className="rounded-xl border border-border/70 p-4">
            <div className="flex items-center gap-2 text-sm font-medium">
              <GitBranch className="size-4 text-muted-foreground" />
              Sucursal activa
            </div>
            <p className="mt-2 font-medium">{branchName ?? "Nivel empresa"}</p>
            <p className="text-sm text-muted-foreground">{branchId ?? "Sin sucursal fija"}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export { TenantContextSummary };

