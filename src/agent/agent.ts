import Anthropic from "@anthropic-ai/sdk";
import { config } from "../config.js";
import { tools } from "../tools/index.js";
import { SYSTEM_PROMPT } from "./prompt.js";

const client = new Anthropic();

/** Runs one task through the tool loop and returns the final text answer. */
export async function runAgent(task: string): Promise<string> {
  const runner = client.beta.messages.toolRunner({
    model: config.model,
    max_tokens: config.maxTokens,
    max_iterations: config.maxIterations,
    // If a safety classifier declines, the server retries on a fallback model.
    betas: ["server-side-fallback-2026-07-01"],
    fallbacks: "default",
    thinking: { type: "adaptive" },
    output_config: { effort: config.effort },
    system: SYSTEM_PROMPT,
    tools,
    messages: [{ role: "user", content: task }],
  });

  for await (const message of runner) {
    for (const block of message.content) {
      if (block.type === "tool_use") console.error(`[tool] ${block.name} ${JSON.stringify(block.input)}`);
    }
  }

  const final = await runner.done();
  if (final.stop_reason === "refusal") return "[the model declined this request]";
  return final.content
    .filter((b) => b.type === "text")
    .map((b) => b.text)
    .join("\n");
}
