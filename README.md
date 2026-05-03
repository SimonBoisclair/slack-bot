# Slack Bot

A Slack bot built with TypeScript and [@slack/bolt](https://slack.dev/bolt-js/) that exposes an HTTP API to read and write messages in Slack channels. Use it as a bridge between your external services and Slack conversations.

## Features

- **GET /api/messages** — Fetch the full conversation history from a Slack channel
- **POST /api/messages** — Send a message to a Slack channel
- **@mention / DM** the bot in Slack for help
- **Socket Mode** support for local development (no public URL needed)
- **HTTP Mode** for production deployment on Render (free tier, sleeps when idle)

## API Routes

### `GET /api/messages`

Fetch conversation history from a Slack channel.

**Query parameters:**
| Parameter | Required | Default | Description |
|-----------|----------|---------|-------------|
| `channel` | Yes* | `SLACK_DEFAULT_CHANNEL` env var | Slack channel ID |
| `limit` | No | `100` | Max number of messages to return |

**Example:**
```bash
curl "http://localhost:3000/api/messages?channel=C0123ABCDEF"
```

**Response:**
```json
{
  "ok": true,
  "channel": "C0123ABCDEF",
  "messages": [
    { "user": "U0123", "text": "Hello!", "ts": "1234567890.123456" }
  ]
}
```

### `POST /api/messages`

Send a message to a Slack channel.

**Request body (JSON):**
| Field | Required | Default | Description |
|-------|----------|---------|-------------|
| `channel` | Yes* | `SLACK_DEFAULT_CHANNEL` env var | Slack channel ID |
| `text` | Yes | — | Message text to send |
| `thread_ts` | No | — | Thread timestamp to reply in a thread |

**Example:**
```bash
curl -X POST "http://localhost:3000/api/messages" \
  -H "Content-Type: application/json" \
  -d '{"channel": "C0123ABCDEF", "text": "Hello from the API!"}'
```

**Response:**
```json
{
  "ok": true,
  "channel": "C0123ABCDEF",
  "ts": "1234567890.654321",
  "message": { ... }
}
```

> *If you set `SLACK_DEFAULT_CHANNEL` in your environment, you can omit the `channel` parameter in both routes.

## Setup

### 1. Create a Slack App

1. Go to [api.slack.com/apps](https://api.slack.com/apps) and click **Create New App** → **From scratch**
2. Name it (e.g. `My API Bot`) and select your workspace

### 2. Configure Bot Permissions

1. Go to **OAuth & Permissions** → **Scopes** → **Bot Token Scopes** and add:
   - `app_mentions:read`
   - `channels:history`
   - `chat:write`
   - `im:history`
   - `im:read`
   - `im:write`

2. Go to **Event Subscriptions** → toggle **Enable Events** to **On**
   - For **HTTP mode**: set the Request URL to `https://your-render-url.onrender.com/slack/events`
   - For **Socket Mode**: skip this — events are received over WebSocket

3. Under **Subscribe to bot events**, add:
   - `app_mention`
   - `message.im`

4. Go to **App Home** → toggle **Allow users to send Slash commands and messages from the messages tab**

5. Install the app to your workspace (**Install App** in the sidebar)

6. **Invite the bot** to the channel(s) you want it to read: `/invite @YourBotName`

### 3. Get Your Tokens

- **Bot Token** (`xoxb-...`): Found under **OAuth & Permissions** → **Bot User OAuth Token**
- **Signing Secret**: Found under **Basic Information** → **App Credentials**
- **App Token** (optional, for Socket Mode): Under **Basic Information** → **App-Level Tokens**, create one with `connections:write` scope

### 4. Configure Environment Variables

```bash
cp .env.example .env
```

Edit `.env` with your tokens:

```env
SLACK_BOT_TOKEN=xoxb-your-bot-token
SLACK_SIGNING_SECRET=your-signing-secret
SLACK_DEFAULT_CHANNEL=C0123ABCDEF
```

For Socket Mode (local dev), also add:

```env
SLACK_APP_TOKEN=xapp-your-app-level-token
```

### 5. Run Locally

```bash
npm install
npm run build
npm start
```

Or for development:

```bash
npm run dev
```

Then test the API:

```bash
# Fetch messages
curl "http://localhost:3000/api/messages?channel=C0123ABCDEF"

# Send a message
curl -X POST "http://localhost:3000/api/messages" \
  -H "Content-Type: application/json" \
  -d '{"channel": "C0123ABCDEF", "text": "Hello!"}'
```

## Deploy to Render (Free)

1. Push this repo to GitHub
2. Go to [render.com](https://render.com) → **New** → **Web Service**
3. Connect your GitHub repo
4. Render will detect `render.yaml` automatically
5. Add your environment variables in the Render dashboard
6. Deploy — your bot URL will be `https://slack-bot-xxxx.onrender.com`
7. Set the Slack **Request URL** to `https://slack-bot-xxxx.onrender.com/slack/events`

> **Note**: Render's free tier sleeps after 15 minutes of inactivity. The first request after sleep takes ~30 seconds to wake up. Slack retries events automatically, so this works fine.

## Deploy with Docker

```bash
docker build -t slack-bot .
docker run -p 3000:3000 --env-file .env slack-bot
```

## Project Structure

```
src/
├── index.ts     # Entry point
├── app.ts       # Slack Bolt app setup, event handlers, mounts API routes
├── routes.ts    # Express routes: GET /api/messages, POST /api/messages
└── config.ts    # Environment variable configuration
```
