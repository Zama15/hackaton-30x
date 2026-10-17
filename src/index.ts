import { runAgent } from "./agent/agent.js";

const task = process.argv.slice(2).join(" ") || "What time is it in Tokyo?";
const answer = await runAgent(task);
console.log(answer);
