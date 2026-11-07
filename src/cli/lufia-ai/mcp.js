/**
 * Minimal MCP server over stdio: newline-delimited JSON-RPC 2.0, written by hand so the package needs no runtime
 * dependency. Exposes the read-only manifest lookup as three tools. Stdout carries protocol messages only;
 * diagnostics go to stderr.
 */
import { inspectComponent, listComponents, parseLimit, searchComponents } from "./core.js";

// Newest first. 2026-07-28 makes the protocol stateless (no initialize); `server/discover` and the per-request
// `_meta` protocol version below cover it, while `initialize` keeps older clients working.
export const SUPPORTED_VERSIONS = ["2026-07-28", "2025-11-25", "2025-06-18", "2025-03-26", "2024-11-05"];
const HANDSHAKE_VERSIONS = SUPPORTED_VERSIONS.filter((version) => version < "2026-07-28");
const STATELESS_META = "io.modelcontextprotocol/protocolVersion";

const INVALID_REQUEST = -32600;
const METHOD_NOT_FOUND = -32601;
const INVALID_PARAMS = -32602;
const PARSE_ERROR = -32700;

class RpcError extends Error {
  constructor(code, message) {
    super(message);
    this.code = code;
  }
}

export const TOOLS = [
  {
    name: "search_components",
    description:
      "Find Lufia design system components for a UI task or keyword. Returns ranked names, summaries and import paths.",
    inputSchema: {
      type: "object",
      properties: {
        query: {
          type: "string",
          description: "The UI task or component keyword, e.g. searchable async select.",
        },
        limit: { type: "integer", minimum: 1, maximum: 20, description: "Maximum results (default 8)." },
      },
      required: ["query"],
      additionalProperties: false,
    },
    annotations: { readOnlyHint: true },
  },
  {
    name: "get_component",
    description:
      "Get the typed API of one component: import path, props, usage example, accessibility and motion notes.",
    inputSchema: {
      type: "object",
      properties: { name: { type: "string", description: "Component name, e.g. Button." } },
      required: ["name"],
      additionalProperties: false,
    },
    annotations: { readOnlyHint: true },
  },
  {
    name: "list_components",
    description: "List every documented component with category, status and import path.",
    inputSchema: { type: "object", properties: {}, additionalProperties: false },
    annotations: { readOnlyHint: true },
  },
];

const requireString = (args, key) => {
  if (typeof args[key] !== "string" || !args[key].trim()) {
    throw new RpcError(INVALID_PARAMS, `Argument "${key}" must be a non-empty string`);
  }
  return args[key];
};

function callTool(manifest, params) {
  if (!params || typeof params.name !== "string") throw new RpcError(INVALID_PARAMS, "Missing tool name");
  const args = params.arguments ?? {};
  if (typeof args !== "object" || Array.isArray(args))
    throw new RpcError(INVALID_PARAMS, "Arguments must be an object");
  let result;
  switch (params.name) {
    case "search_components": {
      const query = requireString(args, "query");
      let limit;
      try {
        limit = parseLimit(args.limit);
      } catch (error) {
        throw new RpcError(INVALID_PARAMS, error.message);
      }
      result = searchComponents(manifest, query, limit);
      break;
    }
    case "get_component": {
      const name = requireString(args, "name");
      result = inspectComponent(manifest, name);
      if (!result) {
        return { content: [{ type: "text", text: `Unknown component: ${name}` }], isError: true };
      }
      break;
    }
    case "list_components":
      result = listComponents(manifest);
      break;
    default:
      throw new RpcError(INVALID_PARAMS, `Unknown tool: ${params.name}`);
  }
  return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
}

/** Handles one JSON-RPC request; returns the result, or throws RpcError. */
function dispatch(manifest, serverInfo, method, params) {
  switch (method) {
    case "initialize": {
      const asked = params?.protocolVersion;
      return {
        protocolVersion: HANDSHAKE_VERSIONS.includes(asked) ? asked : HANDSHAKE_VERSIONS[0],
        capabilities: { tools: { listChanged: false } },
        serverInfo,
      };
    }
    case "server/discover":
      return {
        supportedVersions: SUPPORTED_VERSIONS,
        capabilities: { tools: { listChanged: false } },
        serverInfo,
      };
    case "ping":
      return {};
    case "tools/list":
      return { tools: TOOLS };
    case "tools/call":
      return callTool(manifest, params);
    default:
      throw new RpcError(METHOD_NOT_FOUND, `Method not found: ${method}`);
  }
}

/**
 * Processes one parsed message. Returns the response object, or null for notifications (and for responses the
 * client sends back, which this server never requests).
 */
export function handleMessage(manifest, serverInfo, message) {
  if (
    !message ||
    typeof message !== "object" ||
    Array.isArray(message) ||
    typeof message.method !== "string"
  ) {
    if (
      message &&
      typeof message === "object" &&
      !Array.isArray(message) &&
      ("result" in message || "error" in message)
    ) {
      return null;
    }
    return {
      jsonrpc: "2.0",
      id: message?.id ?? null,
      error: { code: INVALID_REQUEST, message: "Invalid request" },
    };
  }
  if (!("id" in message)) return null; // notification, e.g. notifications/initialized
  try {
    const result = dispatch(manifest, serverInfo, message.method, message.params);
    if (message.params?._meta?.[STATELESS_META]) result.resultType = "complete";
    return { jsonrpc: "2.0", id: message.id, result };
  } catch (error) {
    if (!(error instanceof RpcError)) {
      process.stderr.write(`lufia-ai mcp: ${error instanceof Error ? error.stack : String(error)}\n`);
      return { jsonrpc: "2.0", id: message.id, error: { code: -32603, message: "Internal error" } };
    }
    return { jsonrpc: "2.0", id: message.id, error: { code: error.code, message: error.message } };
  }
}

/** Reads newline-delimited JSON-RPC from stdin until it closes. */
export function serve(manifest, serverInfo) {
  let buffer = "";
  const send = (message) => process.stdout.write(`${JSON.stringify(message)}\n`);
  const handleLine = (line) => {
    if (!line.trim()) return;
    let message;
    try {
      message = JSON.parse(line);
    } catch {
      send({ jsonrpc: "2.0", id: null, error: { code: PARSE_ERROR, message: "Parse error" } });
      return;
    }
    // Batches were removed from the protocol in 2025-06-18; answer each element anyway when a client sends one.
    const responses = (Array.isArray(message) ? message : [message])
      .map((item) => handleMessage(manifest, serverInfo, item))
      .filter(Boolean);
    if (Array.isArray(message)) {
      if (responses.length) send(responses);
    } else if (responses[0]) send(responses[0]);
  };
  process.stdin.setEncoding("utf8");
  process.stdin.on("data", (chunk) => {
    buffer += chunk;
    let at;
    while ((at = buffer.indexOf("\n")) >= 0) {
      handleLine(buffer.slice(0, at));
      buffer = buffer.slice(at + 1);
    }
  });
  process.stdin.on("end", () => {
    handleLine(buffer);
    process.exit(0);
  });
  process.stderr.write(`lufia-ai mcp: ${serverInfo.name} ${serverInfo.version} ready on stdio\n`);
}
