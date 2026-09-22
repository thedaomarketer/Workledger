import "server-only";

import Anthropic from "@anthropic-ai/sdk";

import { getAnthropicApiKey } from "./env";

let client: Anthropic | null = null;

export function getAnthropicClient(): Anthropic {
  if (!client) {
    client = new Anthropic({ apiKey: getAnthropicApiKey() });
  }
  return client;
}

/**
 * The model the assistant runs on. Defaults to Anthropic's most capable
 * generally-available model; switch to "claude-sonnet-5" or "claude-haiku-4-5"
 * here if you'd rather trade some capability for lower per-message cost.
 */
export const ASSISTANT_MODEL = "claude-opus-5";
