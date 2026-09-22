import "server-only";

export function getAnthropicApiKey(): string {
  const value = process.env.ANTHROPIC_API_KEY;
  if (!value) {
    throw new Error(
      "Missing ANTHROPIC_API_KEY. Add it to .env.local (and to your Vercel project's " +
        "environment variables in production) to enable the AI assistant."
    );
  }
  return value;
}
