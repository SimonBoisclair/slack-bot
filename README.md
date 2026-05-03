# Slack Bot

A Slack bot built with TypeScript and [@slack/bolt](https://slack.dev/bolt-js/) that interacts with a custom API. Mention the bot or DM it to send API requests and get responses directly in Slack.

## Features

- **Mention or DM** the bot to interact with it
- **Call any API endpoint** via `GET` or `POST` from Slack
- **Configurable API** — point it at any REST API with optional auth
- **Socket Mode** support for local development (no public URL needed)
- **HTTP Mode** for production deployment on Render (free tier, sleeps when idle)

## Commands

| Command | Description |
|---|---|
| `@bot ping` | Check if the bot is alive |
| `@bot help` | Show available commands |
| `@bot api get <path>` | Send a GET request to the configured API |
| `@bot api post <path> <json>` | Send a POST request with a JSON body |

### Examples

```
@bot ping
@bot api get /users/1
@bot api post /posts {"title":"Hello","body":"World"}
```

## Setup

### 1. Create a Slack App

1. Go to [api.slack.com/apps](https://api.slack.com/apps) and click **Create New App** → **From scratch**
2. Name it (e.g. `My API Bot`) and select your workspace

### 2. Configure Bot Permissions

1. Go to **OAuth & Permissions** → **Scopes** → **Bot Token Scopes** and add:
   - `app_mentions:read`
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
API_BASE_URL=https://your-api.com
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

Or for development with auto-reload:

```bash
npm run dev
```

## Deploy to Render (Free)

1. Push this repo to GitHub
2. Go to [render.com](https://render.com) → **New** → **Web Service**
3. Connect your GitHub repo
4. Render will detect `render.yaml` automatically
5. Add your environment variables in the Render dashboard
6. Deploy — your bot URL will be `https://slack-bot-xxxx.onrender.com`
7. Set the Slack **Request URL** to `https://slack-bot-xxxx.onrender.com/slack/events`

> **Note**: Render's free tier sleeps after 15 minutes of inactivity. The first request after sleep takes ~30 seconds to wake up. This is fine for a Slack bot since Slack retries events.

## Deploy with Docker

```bash
docker build -t slack-bot .
docker run -p 3000:3000 --env-file .env slack-bot
```

## Project Structure

```
src/
├── index.ts        # Entry point
├── app.ts          # Slack Bolt app setup and event handlers
├── commands.ts     # Command parsing and execution
├── config.ts       # Environment variable configuration
└── api-client.ts   # HTTP client for the custom API
```
