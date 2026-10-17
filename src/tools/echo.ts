import { betaZodTool } from "@anthropic-ai/sdk/helpers/beta/zod";
import { z } from "zod";

// Template tool: copy this file to add a new tool, then register it in tools/index.ts.
export const echo = betaZodTool({
  name: "echo",
  description: "Return the given text unchanged. Useful for testing the tool loop.",
  inputSchema: z.object({ text: z.string() }),
  run: async ({ text }) => text,
});
