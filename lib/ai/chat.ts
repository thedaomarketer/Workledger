import "server-only";

import type Anthropic from "@anthropic-ai/sdk";

import { ASSISTANT_MODEL, getAnthropicClient } from "./client";
import type { Locale } from "@/lib/i18n/config";
import { buildSystemPrompt } from "./system-prompt";
import { buildToolHandlers, buildTools, type ToolContext } from "./tools";

export interface RunChatParams {
  toolContext: ToolContext;
  fullName: string | null;
  locale: Locale;
  jobs: { id: string; name: string }[];
  history: { role: "user" | "assistant"; content: string }[];
  userMessage: string;
}

const MAX_TOOL_TURNS = 6;

export async function runAssistantTurn(params: RunChatParams): Promise<string> {
  const client = getAnthropicClient();
  const tools = buildTools();
  const handlers = buildToolHandlers(params.toolContext);

  const system = buildSystemPrompt({
    fullName: params.fullName,
    timezone: params.toolContext.timezone,
    currency: params.toolContext.currency,
    now: new Date(),
    locale: params.locale,
    jobs: params.jobs,
  });

  const messages: Anthropic.MessageParam[] = [
    ...params.history.map((m): Anthropic.MessageParam => ({ role: m.role, content: m.content })),
    { role: "user", content: params.userMessage },
  ];

  for (let turn = 0; turn < MAX_TOOL_TURNS; turn++) {
    const response = await client.messages.create({
      model: ASSISTANT_MODEL,
      max_tokens: 2048,
      system,
      tools,
      messages,
    });

    if (response.stop_reason === "tool_use") {
      messages.push({ role: "assistant", content: response.content });

      const toolUseBlocks = response.content.filter(
        (block): block is Anthropic.ToolUseBlock => block.type === "tool_use"
      );

      const toolResults: Anthropic.ToolResultBlockParam[] = [];
      for (const block of toolUseBlocks) {
        const handler = handlers[block.name];
        try {
          const result = handler
            ? await handler((block.input as Record<string, unknown>) ?? {})
            : { error: `Unknown tool: ${block.name}` };
          toolResults.push({
            type: "tool_result",
            tool_use_id: block.id,
            content: JSON.stringify(result),
          });
        } catch (error) {
          toolResults.push({
            type: "tool_result",
            tool_use_id: block.id,
            is_error: true,
            content: error instanceof Error ? error.message : "Tool call failed.",
          });
        }
      }

      messages.push({ role: "user", content: toolResults });
      continue;
    }

    if (response.stop_reason === "pause_turn") {
      messages.push({ role: "assistant", content: response.content });
      continue;
    }

    if (response.stop_reason === "refusal") {
      return "I'm not able to help with that.";
    }

    const text = response.content
      .filter((block): block is Anthropic.TextBlock => block.type === "text")
      .map((block) => block.text)
      .join("\n")
      .trim();

    return text || "I couldn't come up with a response. Try rephrasing your question.";
  }

  return "That took more steps than expected to answer -- try asking a narrower question.";
}
