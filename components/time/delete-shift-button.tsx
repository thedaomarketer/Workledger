"use client";

import { useState, useTransition } from "react";
import { Trash2 } from "lucide-react";
import { toast } from "sonner";

import { deleteShiftAction } from "@/lib/actions/shifts";
import { useI18n } from "@/lib/i18n/client";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

export function DeleteShiftButton({ shiftId }: { shiftId: string }) {
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const { m } = useI18n();

  return (
    <>
      <Button variant="ghost" size="icon" aria-label={m.time.deleteShiftLabel} onClick={() => setOpen(true)}>
        <Trash2 className="size-4" />
      </Button>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{m.time.deleteShiftTitle}</DialogTitle>
            <DialogDescription>{m.time.deleteShiftBody}</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>
              {m.common.cancel}
            </Button>
            <Button
              variant="destructive"
              disabled={isPending}
              onClick={() =>
                startTransition(async () => {
                  const result = await deleteShiftAction(shiftId);
                  if (result.error) toast.error(result.error);
                  else toast.success(m.time.shiftDeleted);
                  setOpen(false);
                })
              }
            >
              {m.common.delete}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
