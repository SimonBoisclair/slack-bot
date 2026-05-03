import { start } from "./app";

start().catch((error) => {
  console.error("Failed to start the bot:", error);
  process.exit(1);
});
