export const config = {
  model: process.env.AGENT_MODEL ?? "claude-opus-5-5",
  effort: (process.env.AGENT_EFFORT ?? "medium") as "low" | "medium" | "high" | "xhigh" | "max",
  maxIterations: Number(process.env.AGENT_MAX_ITERATIONS ?? 20),
  maxTokens: 16000,
};
