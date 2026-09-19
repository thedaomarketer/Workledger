import { Sparkles } from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";

export default function AssistantPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold tracking-tight">AI Assistant</h1>
      <Card>
        <CardContent className="flex flex-col items-center gap-3 py-16 text-center">
          <Sparkles className="size-8 text-muted-foreground" />
          <p className="max-w-sm text-sm text-muted-foreground">
            The AI Assistant is coming in a future release. It will answer questions about your hours,
            earnings, and activity by querying your WorkLedger records through controlled tools — never by
            inventing numbers. See <code>docs/ai.md</code> for the planned design.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
