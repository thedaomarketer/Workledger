import * as React from "react";

import { cn } from "@/lib/utils";

function Textarea({ className, ...props }: React.ComponentProps<"textarea">) {
  return (
    <textarea
      data-slot="textarea"
      className={cn(
        "flex min-h-20 w-full rounded-xl border border-transparent bg-muted px-3.5 py-2.5 text-base transition-[background-color,box-shadow] outline-none placeholder:text-muted-foreground focus-visible:bg-card focus-visible:border-ring focus-visible:ring-ring/25 focus-visible:ring-[3px] disabled:cursor-not-allowed disabled:opacity-50 aria-invalid:ring-destructive/20 aria-invalid:border-destructive md:text-sm",
        className
      )}
      {...props}
    />
  );
}

export { Textarea };
