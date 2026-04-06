"use client";

import {
  Sheet,
  SheetBody,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { useAppTranslator } from "@/shared/i18n/use-app-translator";
import { useDialogForm } from "@/shared/hooks/use-dialog-form";
import { useSeedEntityOption } from "@/shared/hooks/use-seed-entity-option";
import type { Branch } from "@/features/branches/types";
import type { User } from "@/features/users/types";
import type { SaleOrder } from "@/features/sales/types";

import {
  emptyDispatchOrderFormValues,
  getDispatchOrderFormValues,
} from "../form-values";
import {
  useCreateDispatchOrderMutation,
  useDispatchOrderQuery,
  useUpdateDispatchOrderMutation,
} from "../queries";
import { createDispatchOrderSchema } from "../schemas";
import type { DispatchOrder, CreateDispatchOrderInput, Route, Vehicle, Warehouse } from "../types";
import { DispatchOrderForm } from "./dispatch-order-form";

type DispatchOrderDialogProps = {
  branches: Branch[];
  users: User[];
  warehouses: Warehouse[];
  routes: Route[];
  vehicles: Vehicle[];
  saleOrders: SaleOrder[];
  order?: DispatchOrder | null;
  onOpenChange: (open: boolean) => void;
  open: boolean;
};

function DispatchOrderDialog({
  branches,
  users,
  warehouses,
  routes,
  vehicles,
  saleOrders,
  order,
  onOpenChange,
  open,
}: DispatchOrderDialogProps) {
  const { t } = useAppTranslator();
  const createMutation = useCreateDispatchOrderMutation({ showErrorToast: false });
  const updateMutation = useUpdateDispatchOrderMutation(order?.id ?? "", {
    showErrorToast: false,
  });

  // Fetch full detail (with stops + expenses) when editing.
  // The list endpoint does not include stops or expenses.
  // When detailQuery resolves, fullOrder changes → useDialogForm's
  // useEffect([open, entity]) fires → form.reset() with complete data.
  const detailQuery = useDispatchOrderQuery(order?.id ? String(order.id) : "");
  const fullOrder = detailQuery.data ?? order;

  // Seed current entity selections into catalog arrays
  const seededBranches = useSeedEntityOption(branches, fullOrder?.branch);
  const seededRoutes = useSeedEntityOption(routes, fullOrder?.route);
  const seededVehicles = useSeedEntityOption(vehicles, fullOrder?.vehicle);
  const seededUsers = useSeedEntityOption(users, fullOrder?.driver_user);
  const seededWarehouses = useSeedEntityOption(warehouses, fullOrder?.origin_warehouse);

  const { form, formError, handleSubmit, isPending } = useDialogForm<
    CreateDispatchOrderInput,
    DispatchOrder
  >({
    open,
    onOpenChange,
    schema: createDispatchOrderSchema,
    defaultValues: emptyDispatchOrderFormValues,
    entity: fullOrder,
    mapEntityToForm: getDispatchOrderFormValues,
    mutation: order ? updateMutation : createMutation,
    fallbackErrorMessage: t(
      order
        ? "inventory.dispatch_order_update_error_fallback"
        : "inventory.dispatch_order_create_error_fallback",
    ),
  });

  return (
    <Sheet onOpenChange={onOpenChange} open={open}>
      <SheetContent >
        <SheetHeader>
          <SheetTitle>
            {order
              ? t("inventory.common.edit_entity", {
                  entity: t("inventory.entity.dispatch_order"),
                })
              : t("inventory.common.create_entity", {
                  entity: t("inventory.entity.dispatch_order"),
                })}
          </SheetTitle>
          <SheetDescription>
            {t("inventory.dispatch.dialog_description")}
          </SheetDescription>
        </SheetHeader>
        <DispatchOrderForm
          branches={seededBranches}
          form={form}
          formError={formError}
          isPending={isPending}
          onSubmit={handleSubmit}
          routes={seededRoutes}
          saleOrders={saleOrders}
          submitLabel={
            order
              ? t("inventory.common.save_changes")
              : t("inventory.common.create_entity", {
                  entity: t("inventory.entity.dispatch_order"),
                })
          }
          users={seededUsers}
          vehicles={seededVehicles}
          warehouses={seededWarehouses}
        />
      </SheetContent>
    </Sheet>
  );
}

export { DispatchOrderDialog };
