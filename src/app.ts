import { App, LogLevel } from "@slack/bolt";
import { config } from "./config";
import { parseAndExecute } from "./commands";

const useSocketMode = Boolean(config.slack.appToken);

const app = new App({
  token: config.slack.botToken,
  signingSecret: config.slack.signingSecret,
  ...(useSocketMode
    ? { socketMode: true, appToken: config.slack.appToken }
    : {}),
  logLevel: LogLevel.INFO,
});

app.event("app_mention", async ({ event, say }) => {
  try {
    const result = await parseAndExecute(event.text);
    await say({ text: result.text, thread_ts: event.ts });
  } catch (error) {
    console.error("Error handling mention:", error);
    await say({ text: "Something went wrong. Please try again.", thread_ts: event.ts });
  }
});

app.message(async ({ message, say }) => {
  if (message.subtype) return;
  if (!("text" in message) || !message.text) return;
  if (message.channel_type !== "im") return;

  try {
    const result = await parseAndExecute(message.text);
    await say(result.text);
  } catch (error) {
    console.error("Error handling DM:", error);
    await say("Something went wrong. Please try again.");
  }
});

export async function start(): Promise<void> {
  await app.start(config.port);
  console.log(`Slack bot is running on port ${config.port} (${useSocketMode ? "Socket Mode" : "HTTP Mode"})`);
}
