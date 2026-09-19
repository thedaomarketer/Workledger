"use client";

import { useState, useTransition } from "react";
import { MoreVertical, Archive, ArchiveRestore, Trash2 } from "lucide-react";
import { toast } from "sonner";

import { deleteJobAction, setJobActiveAction } from "@/lib/actions/jobs";
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

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon">
            <MoreVertical className="size-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem
            onSelect={() =>
              startTransition(async () => {
                await setJobActiveAction(jobId, !isActive);
                toast.success(isActive ? "Job archived." : "Job restored.");
              })
            }
          >
            {isActive ? (
              <>
                <Archive /> Archive
              </>
            ) : (
              <>
                <ArchiveRestore /> Restore
              </>
            )}
          </DropdownMenuItem>
          <DropdownMenuItem variant="destructive" onSelect={() => setConfirmOpen(true)}>
            <Trash2 /> Delete
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
      <Dialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete this job?</DialogTitle>
            <DialogDescription>
              This permanently deletes the job. If it has recorded time or other records attached, delete
              or move those first, or archive the job instead.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setConfirmOpen(false)}>
              Cancel
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
                    toast.success("Job deleted.");
                  }
                  setConfirmOpen(false);
                })
              }
            >
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
