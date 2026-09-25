"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { Play, Plus } from "lucide-react";
import { toast } from "sonner";

import { clockInAction } from "@/lib/actions/shifts";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface Job {
  id: string;
  name: string;
  color: string;
}

export function ClockInCard({ jobs }: { jobs: Job[] }) {
  const [jobId, setJobId] = useState(jobs[0]?.id ?? "");
  const [isPending, startTransition] = useTransition();

  if (jobs.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center gap-3 py-6 text-center">
          <p className="text-sm text-muted-foreground">Add a job before you clock in.</p>
          <Button asChild>
            <Link href="/jobs?new=1">
              <Plus /> Add your first job
            </Link>
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Ready to start?</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <Select value={jobId} onValueChange={setJobId}>
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Choose a job" />
          </SelectTrigger>
          <SelectContent>
            {jobs.map((job) => (
              <SelectItem key={job.id} value={job.id}>
                <span
                  className="mr-1 inline-block size-2 rounded-full"
                  style={{ backgroundColor: job.color }}
                />
                {job.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Button
          size="lg"
          className="w-full"
          disabled={!jobId || isPending}
          onClick={() =>
            startTransition(async () => {
              const result = await clockInAction(jobId);
              if (result.error) toast.error(result.error);
              else toast.success("Clocked in.");
            })
          }
        >
          <Play /> Clock in
        </Button>
      </CardContent>
    </Card>
  );
}
