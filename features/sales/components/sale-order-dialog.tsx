"use client";

import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { useAppTranslator } from "@/shared/i18n/use-app-translator";
import { useDialogForm } from "@/shared/hooks/use-dialog-form";
import { useSeedEntityOption } from "@/shared/hooks/use-seed-entity-option";
import type { Branch } from "@/features/branches/types";
import type { Contact } from "@/features/contacts/types";
import type { User } from "@/features/users/types";
import type { Product, Warehouse, Zone } from "@/features/inventory/types";

import { emptySaleOrderFormValues, getSaleOrderFormValues } from "../form-values";
import {
  useCreateSaleOrderMutation,
  useSaleOrderQuery,
  useUpdateSaleOrderMutation,
} from "../queries";
import { createSaleOrderSchema } from "../schemas";
import type { SaleOrder, CreateSaleOrderInput } from "../types";
import { SaleOrderForm } from "./sale-order-form";

type SaleOrderDialogProps = {
  branches: Branch[];
  contacts: Contact[];
  users: User[];
  warehouses: Warehouse[];
  products: Product[];
  zones: Zone[];
  order?: SaleOrder | null;
  onOpenChange: (open: boolean) => void;
  open: boolean;
};

function SaleOrderDialog({
  branches,
  contacts,
  users,
  warehouses,
  products,
  zones,
  order,
  onOpenChange,
  open,
}: SaleOrderDialogProps) {
  const { t } = useAppTranslator();
  const createMutation = useCreateSaleOrderMutation({ showErrorToast: false });
  const updateMutation = useUpdateSaleOrderMutation(order?.id ?? "", { showErrorToast: false });

  // Fetch full detail (with lines + delivery_charges) when editing.
  // The list endpoint does not include lines or charges.
  // When detailQuery resolves, fullOrder changes → useDialogForm's
  // useEffect([open, entity]) fires → form.reset() with complete data.
  const detailQuery = useSaleOrderQuery(order?.id ? String(order.id) : "");
  const fullOrder = detailQuery.data ?? order;

  // Seed current entity selections into catalog arrays
  const seededBranches = useSeedEntityOption(branches, fullOrder?.branch);
  const seededContacts = useSeedEntityOption(contacts, fullOrder?.customer_contact);
  const seededUsers = useSeedEntityOption(users, fullOrder?.seller);
  const seededWarehouses = useSeedEntityOption(warehouses, fullOrder?.warehouse);
  const seededZones = useSeedEntityOption(zones, fullOrder?.delivery_zone);

  const { form, formError, handleSubmit, isPending } = useDialogForm<CreateSaleOrderInput, SaleOrder>({
    open,
    onOpenChange,
    schema: createSaleOrderSchema,
    defaultValues: emptySaleOrderFormValues,
    entity: fullOrder,
    mapEntityToForm: getSaleOrderFormValues,
    mutation: order ? updateMutation : createMutation,
    fallbackErrorMessage: t(
      order ? "sales.order_update_error_fallback" : "sales.order_create_error_fallback",
    ),
  });

  return (
    <Sheet onOpenChange={onOpenChange} open={open}>
      <SheetContent className="sm:max-w-2xl">
        <SheetHeader>
          <SheetTitle>
            {order
              ? t("inventory.common.edit_entity", { entity: t("sales.entity.sale_order") })
              : t("inventory.common.create_entity", { entity: t("sales.entity.sale_order") })}
          </SheetTitle>
          <SheetDescription>{t("sales.dialog_description")}</SheetDescription>
        </SheetHeader>
        <SaleOrderForm
          branches={seededBranches}
          contacts={seededContacts}
          form={form}
          formError={formError}
          isPending={isPending}
          onSubmit={handleSubmit}
          products={products}
          submitLabel={
            order
              ? t("inventory.common.save_changes")
              : t("inventory.common.create_entity", { entity: t("sales.entity.sale_order") })
          }
          users={seededUsers}
          warehouses={seededWarehouses}
          zones={seededZones}
        />
      </SheetContent>
    </Sheet>
  );
}

export { SaleOrderDialog };
