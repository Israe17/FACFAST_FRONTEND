"use client";

import { ConfirmDialog } from "@/shared/components/confirm-dialog";

import { useUpdateUserStatusMutation } from "../queries";
import type { User } from "../types";

type UpdateUserStatusDialogProps = {
  onOpenChange: (open: boolean) => void;
  open: boolean;
  user: User;
};

function UpdateUserStatusDialog({
  onOpenChange,
  open,
  user,
}: UpdateUserStatusDialogProps) {
  const updateStatusMutation = useUpdateUserStatusMutation(user.id);
  const nextStatus = user.status === "active" ? "inactive" : "active";

  async function handleConfirm() {
    try {
      await updateStatusMutation.mutateAsync({ status: nextStatus });
      onOpenChange(false);
    } catch {}
  }

  return (
    <ConfirmDialog
      confirmLabel={nextStatus === "active" ? "Activate" : "Deactivate"}
      description={`This will change ${user.name} to ${nextStatus}.`}
      onConfirm={handleConfirm}
      onOpenChange={onOpenChange}
      open={open}
      title="Update user status"
    />
  );
}

export { UpdateUserStatusDialog };
