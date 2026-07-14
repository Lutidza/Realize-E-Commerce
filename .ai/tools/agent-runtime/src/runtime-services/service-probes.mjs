/**
 * @file .ai/tools/agent-runtime/src/runtime-services/service-probes.mjs
 * @version 0.1.0 - 2026-05-15 00:00
 * @docref DOC-SYSTEM-SPEC-042
 * @see /documentation/project/specs/ai-engineering-workflow/DOC-SYSTEM-SPEC-042-agent-monitor-runtime-observability.md
 * @description Низкоуровневые loopback HTTP/TCP-проверки для жизненного цикла
 * agent monitor и проверок видимости запуска worker-а.
 */
import net from "node:net";

const defaultProbeTimeoutMs = 1500;

/**
 * Проверяет HTTP endpoint и возвращает структурированную диагностику без stack trace.
 *
 * @param {string} url URL endpoint-а.
 * @param {object} options Параметры проверки.
 * @returns {Promise<object>} Результат проверки.
 */
export async function httpProbe(url, { expectJson = false, includeJson = false, timeoutMs = defaultProbeTimeoutMs } = {}) {
  const startedAt = Date.now();
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const response = await fetch(url, {
      method: "GET",
      signal: controller.signal,
      headers: { accept: expectJson ? "application/json" : "*/*" },
    });
    const text = await response.text();
    const json = expectJson ? parseJsonObject(text) : null;
    return {
      url,
      ok: response.ok,
      reachable: true,
      status: response.status,
      elapsed_ms: Date.now() - startedAt,
      content_type: response.headers.get("content-type"),
      json_type: json === null ? null : json.type ?? null,
      json: includeJson ? json : undefined,
      diagnostic: response.ok ? null : `http_${response.status}`,
    };
  } catch (error) {
    return {
      url,
      ok: false,
      reachable: false,
      status: null,
      elapsed_ms: Date.now() - startedAt,
      error: diagnosticFromError(error),
    };
  } finally {
    clearTimeout(timeout);
  }
}

/**
 * Проверяет, занят ли loopback TCP-порт перед попыткой запуска на фиксированном порту.
 *
 * @param {string} host Имя host.
 * @param {number} port Номер порта.
 * @param {number} timeoutMs Timeout в миллисекундах.
 * @returns {Promise<object>} Результат TCP-проверки.
 */
export function tcpProbe(host, port, timeoutMs = defaultProbeTimeoutMs) {
  return new Promise((resolve) => {
    const socket = net.createConnection({ host, port });
    const startedAt = Date.now();
    let settled = false;

    function finish(payload) {
      if (settled) {
        return;
      }
      settled = true;
      socket.destroy();
      resolve({
        host,
        port,
        elapsed_ms: Date.now() - startedAt,
        ...payload,
      });
    }

    socket.setTimeout(timeoutMs);
    socket.once("connect", () => finish({ open: true, error: null }));
    socket.once("timeout", () => finish({ open: false, error: { code: "timeout", message: "TCP probe timed out." } }));
    socket.once("error", (error) => finish({ open: false, error: diagnosticFromError(error) }));
  });
}

export function diagnosticFromError(error) {
  return {
    code: error?.cause?.code ?? error?.code ?? error?.name ?? "unknown_error",
    message: error?.message ?? "Unknown error",
  };
}

function parseJsonObject(value) {
  try {
    const parsed = JSON.parse(value);
    return parsed && typeof parsed === "object" && !Array.isArray(parsed) ? parsed : null;
  } catch {
    return null;
  }
}
