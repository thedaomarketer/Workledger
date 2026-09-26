"use client";

import { useState, useTransition } from "react";
import { MoreVertical, Archive, ArchiveRestore, Trash2 } from "lucide-react";
import { toast } from "sonner";

import { deleteJobAction, setJobActiveAction } from "@/lib/actions/jobs";
import { useI18n } from "@/lib/i18n/client";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

export function JobActionsMenu({ jobId, isActive }: { jobId: string; isActive: boolean }) {
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const { m } = useI18n();

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon" aria-label={m.jobs.moreActions}>
            <MoreVertical className="size-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem
            onSelect={() =>
              startTransition(async () => {
                await setJobActiveAction(jobId, !isActive);
                toast.success(isActive ? m.jobs.archivedToast : m.jobs.restoredToast);
              })
            }
          >
            {isActive ? (
              <>
                <Archive /> {m.jobs.archive}
              </>
            ) : (
              <>
                <ArchiveRestore /> {m.jobs.restore}
              </>
            )}
          </DropdownMenuItem>
          <DropdownMenuItem variant="destructive" onSelect={() => setConfirmOpen(true)}>
            <Trash2 /> {m.common.delete}
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
      <Dialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{m.jobs.deleteTitle}</DialogTitle>
            <DialogDescription>{m.jobs.deleteBody}</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setConfirmOpen(false)}>
              {m.common.cancel}
            </Button>
            <Button
              variant="destructive"
              disabled={isPending}
              onClick={() =>
                startTransition(async () => {
                  const result = await deleteJobAction(jobId);
                  if (result.error) {
                    toast.error(result.error);
                  } else {
                    toast.success(m.jobs.deletedToast);
                  }
                  setConfirmOpen(false);
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
