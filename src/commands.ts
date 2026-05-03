import { callApi } from "./api-client";

export interface CommandResult {
  text: string;
  blocks?: unknown[];
}

function formatJson(data: unknown): string {
  const json = JSON.stringify(data, null, 2);
  if (json.length > 2900) {
    return json.slice(0, 2900) + "\n... (truncated)";
  }
  return json;
}

export async function handleApiGet(path: string): Promise<CommandResult> {
  const result = await callApi("GET", path);
  if (!result.success) {
    return { text: `Failed: ${result.error}` };
  }
  return {
    text: `\`GET ${path}\`\n\`\`\`\n${formatJson(result.data)}\n\`\`\``,
  };
}

export async function handleApiPost(
  path: string,
  body: Record<string, unknown>
): Promise<CommandResult> {
  const result = await callApi("POST", path, body);
  if (!result.success) {
    return { text: `Failed: ${result.error}` };
  }
  return {
    text: `\`POST ${path}\`\n\`\`\`\n${formatJson(result.data)}\n\`\`\``,
  };
}

export function handleHelp(): CommandResult {
  return {
    text: [
      "*Slack Bot Commands*",
      "",
      "`@bot api get <path>` — Send a GET request to the configured API",
      "`@bot api post <path> <json>` — Send a POST request with a JSON body",
      "`@bot ping` — Check if the bot is alive",
      "`@bot help` — Show this help message",
      "",
      "Example: `@bot api get /users/1`",
      "Example: `@bot api post /posts {\"title\":\"Hello\",\"body\":\"World\"}`",
    ].join("\n"),
  };
}

export async function parseAndExecute(text: string): Promise<CommandResult> {
  const cleaned = text.replace(/<@[A-Z0-9]+>/g, "").trim();

  if (!cleaned) {
    return handleHelp();
  }

  const parts = cleaned.split(/\s+/);
  const command = parts[0]?.toLowerCase();

  switch (command) {
    case "ping":
      return { text: "Pong! :zap: Bot is running." };

    case "help":
      return handleHelp();

    case "api": {
      const method = parts[1]?.toUpperCase();
      const path = parts[2];

      if (!path) {
        return { text: "Usage: `api get <path>` or `api post <path> <json>`" };
      }

      if (method === "GET") {
        return handleApiGet(path);
      }

      if (method === "POST") {
        const jsonStr = parts.slice(3).join(" ");
        try {
          const body = JSON.parse(jsonStr || "{}");
          return handleApiPost(path, body);
        } catch {
          return { text: "Invalid JSON body. Usage: `api post <path> {\"key\":\"value\"}`" };
        }
      }

      return { text: `Unsupported method: ${method}. Use GET or POST.` };
    }

    default:
      return {
        text: `Unknown command: \`${command}\`. Type \`help\` to see available commands.`,
      };
  }
}
