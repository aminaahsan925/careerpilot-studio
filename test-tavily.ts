
import { tavilySearch, researchTechTrends } from "./src/lib/tavily.server.ts";
import { config } from "dotenv";
config();
console.log("TAVILY_API_KEY:", process.env.TAVILY_API_KEY ? "Set" : "Not Set");
researchTechTrends("AI").then(r => console.log("Success:", r.query)).catch(e => console.error("Error:", e));

