"use client";

import { useActionState, useEffect, useId, useState } from "react";
import { Plus } from "lucide-react";

import { createExpenseAction, type ActionResult } from "@/lib/actions/expenses";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const initialState: ActionResult = {};

const CATEGORIES = ["meals", "transport", "supplies", "equipment", "lodging", "other"] as const;

function todayLocal(): string {
  return new Date().toISOString().slice(0, 10);
}

export function CreateExpenseDialog({ jobs }: { jobs: { id: string; name: string }[] }) {
  const [open, setOpen] = useState(false);
  const [state, formAction, pending] = useActionState(createExpenseAction, initialState);
  const id = useId();

  useEffect(() => {
    if (!pending && state === initialState) return;
    // Close the dialog once the server action reports success; this is
    // the one legitimate use of setState-in-effect here, since useActionState
    // gives no other hook into "the action just finished".
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (!pending && !state.error) setOpen(false);
  }, [pending, state]);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus /> Add expense
        </Button>
      </DialogTrigger>
      <DialogContent>
        <form action={formAction} className="space-y-4">
          <DialogHeader>
            <DialogTitle>Add an expense</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor={`${id}-amount`}>Amount</Label>
              <Input id={`${id}-amount`} name="amount" type="number" min="0" step="0.01" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor={`${id}-expenseDate`}>Date</Label>
              <Input id={`${id}-expenseDate`} name="expenseDate" type="date" defaultValue={todayLocal()} required />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor={`${id}-category`}>Category</Label>
            <Select name="category" defaultValue="other">
              <SelectTrigger className="w-full" id={`${id}-category`}>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {CATEGORIES.map((c) => (
                  <SelectItem key={c} value={c} className="capitalize">
                    {c}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          {jobs.length > 0 && (
            <div className="space-y-2">
              <Label htmlFor={`${id}-jobId`}>Job (optional)</Label>
              <Select name="jobId">
                <SelectTrigger className="w-full" id={`${id}-jobId`}>
                  <SelectValue placeholder="None" />
                </SelectTrigger>
                <SelectContent>
                  {jobs.map((job) => (
                    <SelectItem key={job.id} value={job.id}>
                      {job.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}
          <div className="space-y-2">
            <Label htmlFor={`${id}-description`}>Description</Label>
            <Textarea id={`${id}-description`} name="description" rows={2} />
          </div>
          {state.error && <p className="text-sm text-destructive">{state.error}</p>}
          <DialogFooter>
            <Button type="submit" disabled={pending}>
              {pending ? "Saving..." : "Save expense"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
