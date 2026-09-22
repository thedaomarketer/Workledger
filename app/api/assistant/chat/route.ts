import { NextResponse } from "next/server";
import { z } from "zod";

import { createClient } from "@/lib/supabase/server";
import { requireUserContext } from "@/lib/data/context";
import { runAssistantTurn } from "@/lib/ai/chat";

const bodySchema = z.object({
  conversationId: z.uuid().optional(),
  message: z.string().trim().min(1, "Enter a message.").max(2000),
});

export async function POST(request: Request) {
  const ctx = await requireUserContext();
  if (!ctx) {
    return NextResponse.json({ error: "You must be signed in." }, { status: 401 });
  }

  const json = await request.json().catch(() => null);
  const parsed = bodySchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Invalid request." },
      { status: 400 }
    );
  }

  const supabase = await createClient();

  const [{ data: profile }, { data: jobs }] = await Promise.all([
    supabase.from("profiles").select("full_name").eq("id", ctx.userId).maybeSingle(),
    supabase.from("jobs").select("id, name").eq("user_id", ctx.userId).eq("is_active", true),
  ]);

  let conversationId = parsed.data.conversationId;

  if (conversationId) {
    const { data: existing } = await supabase
      .from("ai_conversations")
      .select("id")
      .eq("id", conversationId)
      .eq("user_id", ctx.userId)
      .maybeSingle();
    if (!existing) {
      return NextResponse.json({ error: "Conversation not found." }, { status: 404 });
    }
  } else {
    const { data: conversation, error } = await supabase
      .from("ai_conversations")
      .insert({ user_id: ctx.userId, title: parsed.data.message.slice(0, 80) })
      .select("id")
      .single();
    if (error || !conversation) {
      return NextResponse.json({ error: "Couldn't start a new conversation." }, { status: 500 });
    }
    conversationId = conversation.id;
  }

  const { data: historyRows } = await supabase
    .from("ai_messages")
    .select("role, content")
    .eq("conversation_id", conversationId)
    .order("created_at", { ascending: true })
    .limit(40);

  const history = (historyRows ?? [])
    .filter((m): m is { role: "user" | "assistant"; content: string } => m.role === "user" || m.role === "assistant")
    .map((m) => ({ role: m.role, content: m.content }));

  let reply: string;
  try {
    reply = await runAssistantTurn({
      toolContext: {
        supabase,
        userId: ctx.userId,
        timezone: ctx.timezone,
        weekStartsOn: ctx.weekStartsOn,
        currency: ctx.currency,
      },
      fullName: profile?.full_name ?? null,
      jobs: jobs ?? [],
      history,
      userMessage: parsed.data.message,
    });
  } catch (error) {
    console.error("Assistant turn failed", error);
    return NextResponse.json(
      { error: "The assistant couldn't respond right now. Please try again in a moment." },
      { status: 502 }
    );
  }

  await supabase.from("ai_messages").insert([
    { conversation_id: conversationId, user_id: ctx.userId, role: "user", content: parsed.data.message },
    { conversation_id: conversationId, user_id: ctx.userId, role: "assistant", content: reply },
  ]);

  return NextResponse.json({ conversationId, reply });
}
