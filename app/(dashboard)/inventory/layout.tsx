import type { ReactNode } from "react";

import { InventoryModuleShell } from "@/features/inventory/components/inventory-module-shell";

type InventoryLayoutProps = {
  children: ReactNode;
};

export default function InventoryLayout({ children }: InventoryLayoutProps) {
  return <InventoryModuleShell>{children}</InventoryModuleShell>;
}
