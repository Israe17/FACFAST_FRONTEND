"use client";

import { useState } from "react";
import type * as React from "react";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

type ConfirmDialogProps = {
  cancelLabel?: string;
  confirmLabel?: string;
  description: string;
  onConfirm: () => void | Promise<void>;
  onOpenChange?: (open: boolean) => void;
  open?: boolean;
  title: string;
  trigger?: React.ReactNode;
};

function ConfirmDialog({
  cancelLabel = "Cancelar",
  confirmLabel = "Confirmar",
  description,
  onConfirm,
  onOpenChange,
  open,
  title,
  trigger,
}: ConfirmDialogProps) {
  const [isPending, setIsPending] = useState(false);

  async function handleConfirm() {
    setIsPending(true);

    try {
      await onConfirm();
    } finally {
      setIsPending(false);
    }
  }

  return (
    <AlertDialog onOpenChange={onOpenChange} open={open}>
      {trigger ? <AlertDialogTrigger asChild>{trigger}</AlertDialogTrigger> : null}
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{title}</AlertDialogTitle>
          <AlertDialogDescription>{description}</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isPending}>{cancelLabel}</AlertDialogCancel>
          <AlertDialogAction disabled={isPending} onClick={handleConfirm}>
            {confirmLabel}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

export { ConfirmDialog };
