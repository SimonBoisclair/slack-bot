import express, { Request, Response, Router } from "express";
import { WebClient } from "@slack/web-api";
import { config } from "./config";

const slackClient = new WebClient(config.slack.botToken);
const router = Router();

router.use(express.json());

router.get("/api/messages", async (req: Request, res: Response) => {
  const channel = (req.query.channel as string) || config.slack.defaultChannel;

  if (!channel) {
    res.status(400).json({ error: "Missing 'channel' query parameter. Provide ?channel=<CHANNEL_ID> or set SLACK_DEFAULT_CHANNEL." });
    return;
  }

  try {
    const result = await slackClient.conversations.history({
      channel,
      limit: Number(req.query.limit) || 100,
    });

    const messages = (result.messages ?? []).map((msg) => ({
      user: msg.user ?? msg.bot_id ?? "unknown",
      text: msg.text ?? "",
      ts: msg.ts,
      thread_ts: msg.thread_ts,
    }));

    res.json({ ok: true, channel, messages });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : String(error);
    console.error("Failed to fetch conversation:", msg);
    res.status(500).json({ ok: false, error: msg });
  }
});

router.post("/api/messages", async (req: Request, res: Response) => {
  const channel = (req.body.channel as string) || config.slack.defaultChannel;
  const text = req.body.text as string;

  if (!channel) {
    res.status(400).json({ error: "Missing 'channel' in request body. Provide { \"channel\": \"<CHANNEL_ID>\" } or set SLACK_DEFAULT_CHANNEL." });
    return;
  }

  if (!text) {
    res.status(400).json({ error: "Missing 'text' in request body." });
    return;
  }

  try {
    const result = await slackClient.chat.postMessage({
      channel,
      text,
      ...(req.body.thread_ts && { thread_ts: req.body.thread_ts }),
    });

    res.json({
      ok: true,
      channel: result.channel,
      ts: result.ts,
      message: result.message,
    });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : String(error);
    console.error("Failed to send message:", msg);
    res.status(500).json({ ok: false, error: msg });
  }
});

export { router };
