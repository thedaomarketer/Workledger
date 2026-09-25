import { createClient } from "@/lib/supabase/server";
import { requireUserContext } from "@/lib/data/context";
import { AssistantChat, type ChatMessage } from "@/components/assistant/chat";

export default async function AssistantPage() {
  const ctx = await requireUserContext();
  if (!ctx) return null;

  const supabase = await createClient();

  const { data: conversation } = await supabase
    .from("ai_conversations")
    .select("id")
    .eq("user_id", ctx.userId)
    .order("updated_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  let initialMessages: ChatMessage[] = [];
  if (conversation) {
    const { data: rows } = await supabase
      .from("ai_messages")
      .select("role, content")
      .eq("conversation_id", conversation.id)
      .order("created_at", { ascending: true })
      .limit(40);

    initialMessages = (rows ?? [])
      .filter((r): r is { role: "user" | "assistant"; content: string } => r.role === "user" || r.role === "assistant")
      .map((r) => ({ role: r.role, content: r.content }));
  }

  return (
    <div className="space-y-4">
      <h1 className="text-[28px] leading-tight font-bold tracking-tight md:text-3xl">AI Assistant</h1>
      <AssistantChat
        initialConversationId={conversation?.id ?? null}
        initialMessages={initialMessages}
      />
    </div>
  );
}
