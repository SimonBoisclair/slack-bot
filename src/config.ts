import dotenv from "dotenv";

dotenv.config();

export const config = {
  slack: {
    botToken: process.env.SLACK_BOT_TOKEN!,
    signingSecret: process.env.SLACK_SIGNING_SECRET!,
    appToken: process.env.SLACK_APP_TOKEN,
    defaultChannel: process.env.SLACK_DEFAULT_CHANNEL,
  },
  port: Number(process.env.PORT) || 3000,
};
