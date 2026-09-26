"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";

import { deleteAccountAction } from "@/lib/actions/settings";
import { fmt } from "@/lib/i18n/config";
import { useI18n } from "@/lib/i18n/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

export function DeleteAccountDialog() {
  const [open, setOpen] = useState(false);
  const { m } = useI18n();
  const t = m.settings.danger;
  const [confirmText, setConfirmText] = useState("");
  const [isPending, startTransition] = useTransition();

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="destructive">{t.deleteAccount}</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t.dialogTitle}</DialogTitle>
          <DialogDescription>{t.dialogBody}</DialogDescription>
        </DialogHeader>
        <div className="space-y-2">
          <label className="text-sm font-medium" htmlFor="confirm-delete">
            {fmt(t.typeToConfirm, { word: t.confirmWord })}
          </label>
          <Input
            id="confirm-delete"
            value={confirmText}
            onChange={(e) => setConfirmText(e.target.value)}
            autoCapitalize="characters"
            autoComplete="off"
          />
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>
            {m.common.cancel}
          </Button>
          <Button
            variant="destructive"
            disabled={confirmText.trim() !== t.confirmWord || isPending}
            onClick={() =>
              startTransition(async () => {
                const result = await deleteAccountAction();
                if (result?.error) toast.error(result.error);
              })
            }
          >
            {t.permanentlyDelete}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
