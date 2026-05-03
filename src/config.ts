import dotenv from "dotenv";

dotenv.config();

export const config = {
  slack: {
    botToken: process.env.SLACK_BOT_TOKEN!,
    signingSecret: process.env.SLACK_SIGNING_SECRET!,
    appToken: process.env.SLACK_APP_TOKEN,
  },
  api: {
    baseUrl: process.env.API_BASE_URL || "https://jsonplaceholder.typicode.com",
    apiKey: process.env.API_KEY,
    timeoutMs: Number(process.env.API_TIMEOUT_MS) || 10000,
  },
  port: Number(process.env.PORT) || 3000,
};
