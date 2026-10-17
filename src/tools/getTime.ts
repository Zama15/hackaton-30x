import { betaZodTool } from "@anthropic-ai/sdk/helpers/beta/zod";
import { z } from "zod";

export const getTime = betaZodTool({
  name: "get_time",
  description: "Get the current date and time, optionally in a given IANA time zone.",
  inputSchema: z.object({
    timeZone: z.string().optional().describe("IANA time zone, e.g. Europe/Madrid"),
  }),
  run: async ({ timeZone }) => {
    try {
      return new Date().toLocaleString("en-US", { timeZone: timeZone ?? "UTC" });
    } catch {
      return `Unknown time zone: ${timeZone}`;
    }
  },
});
