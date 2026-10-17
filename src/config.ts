export const config = {
  model: process.env.AGENT_MODEL ?? "claude-opus-5-5",
  effort: (process.env.AGENT_EFFORT ?? "medium") as "low" | "medium" | "high" | "xhigh" | "max",
  maxIterations: Number(process.env.AGENT_MAX_ITERATIONS ?? 20),
  maxTokens: 16000,
};

/** Radar 30X models: main reasoning vs bulk classification (set RADAR_BULK_MODEL=claude-haiku-5-5 to cut cost). */
export const radarConfig = {
  model: process.env.RADAR_MODEL ?? "claude-opus-5-5",
  bulkModel: process.env.RADAR_BULK_MODEL ?? "claude-opus-5-5",
  dataDir: process.env.RADAR_DATA_DIR ?? "data",
  reportsDir: process.env.RADAR_REPORTS_DIR ?? "reports",
};
