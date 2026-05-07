"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useAppTranslator } from "@/shared/i18n/use-app-translator";

import type { HaciendaActivity } from "../types";

type ActivityPickerDialogProps = {
  activities: HaciendaActivity[];
  onClose: () => void;
  onSelect: (activity: HaciendaActivity) => void;
  open: boolean;
};

function ActivityPickerDialog({ activities, onClose, onSelect, open }: ActivityPickerDialogProps) {
  const { t } = useAppTranslator();

  return (
    <Dialog onOpenChange={(isOpen) => { if (!isOpen) onClose(); }} open={open}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t("contacts.hacienda.select_activity")}</DialogTitle>
          <DialogDescription>
            {t("contacts.hacienda.select_activity_description")}
          </DialogDescription>
        </DialogHeader>
        <div className="max-h-60 overflow-auto">
          {activities.map((activity) => (
            <button
              className="flex w-full items-center gap-3 rounded-md px-3 py-2.5 text-left text-sm hover:bg-accent"
              key={activity.codigo}
              onClick={() => onSelect(activity)}
              type="button"
            >
              <span className="shrink-0 font-mono text-xs text-muted-foreground">
                {activity.codigo}
              </span>
              <span className="min-w-0 flex-1">{activity.descripcion}</span>
            </button>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
}

export { ActivityPickerDialog };
