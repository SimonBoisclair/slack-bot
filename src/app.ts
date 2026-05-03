import { App, LogLevel } from "@slack/bolt";
import { config } from "./config";
import { router } from "./routes";

const useSocketMode = Boolean(config.slack.appToken);

const app = new App({
  token: config.slack.botToken,
  signingSecret: config.slack.signingSecret,
  ...(useSocketMode
    ? { socketMode: true, appToken: config.slack.appToken }
    : {}),
  logLevel: LogLevel.INFO,
});

// Register custom API routes on the underlying Express receiver
const expressApp = (app as unknown as { receiver: { app: import("express").Express } }).receiver.app;
expressApp.use(router);

// Respond to @mentions with a help message
app.event("app_mention", async ({ event, say }) => {
  try {
    await say({
      text: [
        "Hi! I'm the API bridge bot. Use the HTTP API to interact with this conversation:",
        "",
        "`GET /api/messages?channel=<id>` — Fetch conversation history",
        "`POST /api/messages` — Send a message (`{ \"channel\": \"<id>\", \"text\": \"Hello\" }`)",
      ].join("\n"),
      thread_ts: event.ts,
    });
  } catch (error) {
    console.error("Error handling mention:", error);
    await say({ text: "Something went wrong. Please try again.", thread_ts: event.ts });
  }
});

// Respond to DMs with help
app.message(async ({ message, say }) => {
  if (message.subtype) return;
  if (!("text" in message) || !message.text) return;
  if (message.channel_type !== "im") return;

  try {
    await say(
      "Hi! Use the HTTP API to interact with Slack conversations. " +
      "See the README for available endpoints."
    );
  } catch (error) {
    console.error("Error handling DM:", error);
    await say("Something went wrong. Please try again.");
  }
});

export async function start(): Promise<void> {
  await app.start(config.port);
  console.log(`Slack bot is running on port ${config.port} (${useSocketMode ? "Socket Mode" : "HTTP Mode"})`);
  console.log(`API routes available at http://localhost:${config.port}/api/messages`);
}
