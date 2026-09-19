"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";

import { deleteAccountAction } from "@/lib/actions/settings";
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
  const [confirmText, setConfirmText] = useState("");
  const [isPending, startTransition] = useTransition();

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="destructive">Delete account</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Delete your account</DialogTitle>
          <DialogDescription>
            This permanently deletes your profile, jobs, shifts, journal entries, expenses, mileage, and
            attachments, and signs you out everywhere. This cannot be undone. Export your data first if you
            want to keep a copy.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-2">
          <label className="text-sm font-medium" htmlFor="confirm-delete">
            Type DELETE to confirm
          </label>
          <Input id="confirm-delete" value={confirmText} onChange={(e) => setConfirmText(e.target.value)} />
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button
            variant="destructive"
            disabled={confirmText !== "DELETE" || isPending}
            onClick={() =>
              startTransition(async () => {
                const result = await deleteAccountAction();
                if (result?.error) toast.error(result.error);
              })
            }
          >
            Permanently delete account
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
