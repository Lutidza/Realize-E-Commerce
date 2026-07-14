/**
 * @file .ai/tools/agent-runtime/src/runtime-gateway/http-routes.mjs
 * @version 0.2.1 - 2026-05-10 16:10
 * @docref DOC-SYSTEM-SPEC-032
 * @docref DOC-SYSTEM-SPEC-042
 * @see /documentation/project/specs/ai-engineering-workflow/DOC-SYSTEM-SPEC-032-agent-runtime-and-worker-sessions.md
 * @see /documentation/project/specs/ai-engineering-workflow/DOC-SYSTEM-SPEC-042-agent-monitor-runtime-observability.md
 * @description Loopback HTTP routes for gateway health, snapshot, and command
 * requests.
 *
 * Changes in version 0.2.1:
 * - Added loopback-only browser CORS for the monitor runtime gateway adapter.
 * - Forwarded revision tracker to command executor for synchronized realtime
 *   delta broadcasting.
 */
import { executeGatewayCommand } from "./command-executor.mjs";
import {
  createErrorPayload,
  maxJsonBodyBytes,
} from "./protocol.mjs";
import {
  createHealthPayload,
  createSnapshotPayload,
} from "./snapshot-reader.mjs";

export async function handleHttpRequest({
  request,
  response,
  database,
  store,
  clients,
  commandResults,
  isLoopbackRequest,
  revisionTracker = null,
}) {
  const requestUrl = new URL(request.url ?? "/", "http://127.0.0.1");

  if (!isLoopbackRequest(request)) {
    respondJson(response, 403, createErrorPayload("Runtime gateway accepts loopback requests only"));
    return;
  }

  applyLoopbackCorsHeaders(request, response);

  if (request.method === "OPTIONS") {
    response.statusCode = 204;
    response.setHeader("Cache-Control", "no-store");
    response.end();
    return;
  }

  if (request.method === "GET" && requestUrl.pathname === "/health") {
    respondJson(response, 200, createHealthPayload(database, clients));
    return;
  }

  if (request.method === "GET" && requestUrl.pathname === "/snapshot") {
    respondJson(response, 200, createSnapshotPayload(database));
    return;
  }

  if (request.method === "POST" && requestUrl.pathname === "/command") {
    const body = await readJsonBody(request);
    const result = executeGatewayCommand({
      body,
      database,
      store,
      clients,
      commandResults,
      revisionTracker,
    });
    respondJson(response, 200, result);
    return;
  }

  respondJson(response, 404, createErrorPayload("Runtime gateway route not found"));
}

export function respondJson(response, statusCode, payload) {
  const body = `${JSON.stringify(payload, null, 2)}\n`;
  response.statusCode = statusCode;
  response.setHeader("Cache-Control", "no-store");
  response.setHeader("Content-Type", "application/json; charset=utf-8");
  response.end(body);
}

function applyLoopbackCorsHeaders(request, response) {
  const origin = request.headers.origin;
  if (!isLoopbackOrigin(origin)) {
    return;
  }

  response.setHeader("Access-Control-Allow-Origin", origin);
  response.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  response.setHeader("Access-Control-Allow-Headers", "content-type");
  response.setHeader("Vary", "Origin");
}

function isLoopbackOrigin(origin) {
  if (typeof origin !== "string" || origin.trim() === "") {
    return false;
  }

  try {
    const originUrl = new URL(origin);
    return (originUrl.protocol === "http:" || originUrl.protocol === "https:")
      && [
        "127.0.0.1",
        "localhost",
        "::1",
        "[::1]",
      ].includes(originUrl.hostname);
  } catch {
    return false;
  }
}

async function readJsonBody(request) {
  const chunks = [];
  let size = 0;
  for await (const chunk of request) {
    size += chunk.length;
    if (size > maxJsonBodyBytes) {
      throw new Error("Runtime gateway request body is too large");
    }
    chunks.push(chunk);
  }
  const text = Buffer.concat(chunks).toString("utf8");
  return text.trim() === "" ? {} : JSON.parse(text);
}
