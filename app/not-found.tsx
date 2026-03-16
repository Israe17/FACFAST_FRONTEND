import Link from "next/link";

import { Button } from "@/components/ui/button";
import { EmptyState } from "@/shared/components/empty-state";
import { APP_ROUTES } from "@/shared/lib/routes";

export default function NotFound() {
  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <div className="w-full max-w-2xl">
        <EmptyState
          action={
            <Button asChild>
              <Link href={APP_ROUTES.dashboard}>Volver al dashboard</Link>
            </Button>
          }
          description="La ruta solicitada no existe dentro del shell administrativo actual."
          title="Página no encontrada"
        />
      </div>
    </div>
  );
}
