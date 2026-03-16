"use client";

import Link from "next/link";
import { ArrowRightLeft, Building2, Layers3 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { EnterTenantContextForm } from "@/features/platform-context/components/enter-tenant-context-form";
import { DataCard } from "@/shared/components/data-card";
import { PageHeader } from "@/shared/components/page-header";
import { APP_ROUTES } from "@/shared/lib/routes";

export default function SuperadminEnterContextPage() {
  return (
    <>
      <PageHeader
        actions={
          <Button asChild variant="outline">
            <Link href={APP_ROUTES.superadminBusinesses}>
              <Layers3 className="size-4" />
              Ver businesses
            </Link>
          </Button>
        }
        description="Entra a una empresa y, si hace falta, fija una sucursal para operar dentro del dashboard tenant normal."
        eyebrow="Platform"
        title="Enter Tenant Context"
      />

      <div className="grid gap-4 lg:grid-cols-3">
        <DataCard
          description="Seleccion obligatoria del tenant objetivo."
          icon={<Building2 className="size-5" />}
          title="Empresa"
          value="Required"
        />
        <DataCard
          description="La sucursal es opcional y puede quedar a nivel empresa."
          icon={<ArrowRightLeft className="size-5" />}
          title="Sucursal"
          value="Optional"
        />
        <DataCard
          description="Al confirmar, la sesiÃ³n se refresca y el dashboard normal queda activo."
          icon={<Layers3 className="size-5" />}
          title="Destino"
          value="Tenant dashboard"
        />
      </div>

      <EnterTenantContextForm />
    </>
  );
}

