#!/usr/bin/env node
/**
 * @file .ai/tools/agent-runtime/bin/agent-runtime.mjs
 * @version 0.3.0 - 2026-05-15 00:00
 * @docref DOC-SYSTEM-SPEC-032
 * @see /documentation/project/specs/ai-engineering-workflow/DOC-SYSTEM-SPEC-032-agent-runtime-and-worker-sessions.md
 * @description CLI-точка входа локального runtime-инструмента ИИ-агентов.
 * Команда владеет доступом к runtime database, запуском gateway, экспортом
 * projection и записью maintenance reports внутри контура agent-runtime.
 * Worker launch tracking uses external `codex exec` process records.
 */
import path from "node:path";
import { fileURLToPath } from "node:url";
import { openRuntimeDatabase } from "../src/runtime-schema/index.mjs";
import { RuntimeStore } from "../src/runtime-store/index.mjs";
import { parseOptions } from "../src/runtime-utils.mjs";
import { WorkerSessionProjectionExporter } from "../src/projection-exporter.mjs";
import { writeMaintenanceReport } from "../src/maintenance-report-writer.mjs";
import { executeRuntimeStoreCommand } from "../src/runtime-commands.mjs";
import {
  collectMonitorServiceStatus,
  startMonitorServices,
} from "../src/runtime-services/monitor-service-lifecycle.mjs";
import { runWorkerLaunchPreflight } from "../src/runtime-checks/worker-launch-preflight.mjs";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const toolRoot = path.resolve(__dirname, "..");
const aiRoot = path.resolve(__dirname, "../../..");
const repoRoot = path.dirname(aiRoot);
const defaultDatabase = path.join(toolRoot, "runtime/runtime.sqlite");
const defaultMaintenanceHistory = path.join(toolRoot, "runtime/maintenance-history");

async function main() {
  const [command, ...tokens] = process.argv.slice(2);

  if (command === undefined || command === "help" || command === "--help" || command === "-h") {
    printHelp();
    process.exitCode = command === undefined ? 1 : 0;
    return;
  }

  const options = parseOptions(normalizeFlagTokens(tokens, new Set(["json"])));
  const databasePath = resolveWorkspacePath(options.database ?? defaultDatabase);
  delete options.database;

  if (command === "projection-export") {
    const outputRoot = resolveWorkspacePath(options["output-root"]);
    if (!outputRoot) {
      throw new Error("Missing required option --output-root");
    }
    new WorkerSessionProjectionExporter(databasePath).export(outputRoot);
    console.log(`Worker session projection exported to ${outputRoot}`);
    return;
  }

  if (command === "maintenance-report-write") {
    const maintenanceHistory = resolveWorkspacePath(options["output-dir"] ?? defaultMaintenanceHistory);
    delete options["output-dir"];
    const database = openRuntimeDatabase(databasePath);
    database.close();
    const runtimeStorePath = path.resolve(databasePath);
    console.log(`ok maintenance-report-write ${writeMaintenanceReport({ ...options, "runtime-store": runtimeStorePath }, maintenanceHistory)}`);
    return;
  }

  if (command === "gateway") {
    const { startRuntimeGateway } = await import("../src/runtime-gateway/index.mjs");
    await startRuntimeGateway({
      databasePath,
      host: options.host ?? "127.0.0.1",
      port: Number(options.port ?? 8765),
    });
    return;
  }

  const database = openRuntimeDatabase(databasePath);
  const store = new RuntimeStore(database);

  try {
    if (command === "monitor-service-status") {
      requireJsonOutput(options, command);
      console.log(JSON.stringify(await collectMonitorServiceStatus(store), null, 2));
    } else if (command === "monitor-service-start") {
      requireJsonOutput(options, command);
      console.log(JSON.stringify(await startMonitorServices({
        mode: options.mode,
        repoRoot,
        store,
      }), null, 2));
    } else if (command === "worker-launch-preflight") {
      requireJsonOutput(options, command);
      console.log(JSON.stringify(await runWorkerLaunchPreflight(store, options), null, 2));
    } else if (command === "init") {
      console.log("ok init runtime.sqlite");
    } else {
      for (const line of executeRuntimeStoreCommand(store, command, options)) {
        console.log(line);
      }
    }
  } finally {
    database.close();
  }
}

function resolveWorkspacePath(value) {
  if (!value) {
    return value;
  }

  if (path.isAbsolute(value)) {
    return value;
  }

  if (value === ".ai" || value.startsWith(".ai/")) {
    return path.resolve(repoRoot, value);
  }

  return path.resolve(process.cwd(), value);
}

function normalizeFlagTokens(tokens, supportedFlags) {
  return tokens.map((token) => {
    if (token.startsWith("--") && !token.includes("=") && supportedFlags.has(token.slice(2))) {
      return `${token}=true`;
    }
    return token;
  });
}

function requireJsonOutput(options, command) {
  if (options.json !== "true") {
    throw new Error(`${command} requires --json`);
  }
  delete options.json;
}

function printHelp() {
  console.log(`agent-runtime.mjs <command> [--key=value]

Commands:
  init
  session-upsert --actor-role=dialog_assistant --session-id=ID --role=ROLE --status=running [--mission=TEXT]
  event-append --session-id=ID --event-type=status-update --summary=TEXT
  presence-set --session-id=ID --presence-state=working [--current-activity=TEXT]
  message-send --source-session-id=ID --target-session-id=ID --message-type=peer --correlation-id=ID --requires-ack=true|false --summary=TEXT --payload-json='{"job_id":"ID"}'
  message-ack --message-id=ID --session-id=ID [--summary=TEXT]
  notification-create --source-session-id=ID --actor-session-id=ID --target-role=dialog_assistant --notification-type=result_ready|final_result --summary=TEXT
  notification-update --actor-role=dialog_assistant --notification-id=ID --status=acknowledged|resolved|dismissed
  notification-list [--target-role=dialog_assistant] [--status=unread]
  job-upsert --job-id=ID --status=queued [--session-id=ID] [--assignee-session-id=ID]
  group-upsert --actor-role=dialog_assistant --group-id=ID --returns-to-session-id=dialog-assistant --status=running [--group-closer-session-id=ID]
  group-member-upsert --actor-role=dialog_assistant --group-id=ID --session-id=ID --role=ROLE [--member-status=active] [--write-allowed=false]
  group-edge-upsert --actor-role=dialog_assistant --group-id=ID --source-session-id=ID --target-session-id=ID --edge-type=peer|depends_on|handoff|review|result_return|closure
  group-acceptance-record --actor-role=dialog_assistant --group-id=ID --evidence-type=review|audit|acceptance --evidence-status=recorded|accepted|rejected|blocked --summary=TEXT
  group-close --actor-role=dialog_assistant --group-id=ID --resolution=accepted --summary=TEXT [--acceptance-evidence-json='{}']
  process-upsert --process-id=ID --session-id=ID --backend=codex_exec --cwd=PATH --status=running
  stream-append --process-id=ID --stream=stdout --content-text=TEXT
  operator-command-create --actor-session-id=ID --command-type=worker.launch [--target-session-id=ID] [--idempotency-key=KEY]
  operator-command-update --operator-command-id=ID --status=completed|failed [--result-json='{}']
  operator-command-dispatch --actor-session-id=ID --target-session-id=ID --command-type=ping|request_status|send_message|stop|accept_result|request_worker [--message-text=TEXT] [--request-json='{\"role\":\"<role>\",\"mission\":\"<mission>\",\"model\":\"<model>\",\"allowed_paths\":[\".ai/tools\"]}']
  active-rows-report --actor-role=dialog_assistant
  retention-cleanup --actor-role=dialog_assistant [--dry-run=true]
  maintenance-report-write --actor-role=dialog_assistant --policy-trigger=TEXT --mode=audit_only|cleanup_allowed|projection_refresh|full_maintenance --decision=passed|failed|blocked
  gateway [--host=127.0.0.1] [--port=8765]
  monitor-service-status --json
  monitor-service-start --mode=preview --json
  worker-launch-preflight --session-id=ID [--group-id=ID] --json
  projection-export --database=.ai/tools/agent-runtime/runtime/runtime.sqlite --output-root=.ai/tools/agent-runtime/runtime/worker-sessions

JSON options must contain valid JSON text:
  --metadata-json={} --payload-json={} --allowed-paths-json=[] --forbidden-paths-json=[]
  --dry-run-summary-json={} --cleanup-summary-json={} --active-rows-report-json={}
  --cutoffs-json={} --projection-json={} --related-artifacts-json=[]
  --allowed-actions-json=[]

Ownership options:
  --assignee-session-id=ID --current-actor-session-id=ID --actor-session-id=ID
  --lease-status=unassigned|waiting|claimed|released|transferred|blocked|completed
  --execution-backend=codex_exec|external_worker|delivery_worker
  --execution-handle=HANDLE --actor-action=bridge_result_record|review_or_acceptance|close_transition
  --handoff-target=dialog-assistant

Worker group options:
  --group-id=ID --task-id=ID --job-id=ID --owner-session-id=ID
  --returns-to-session-id=ID --group-closer-session-id=ID
  --acceptance-status=pending|review-ready|accepted|rejected|blocked
  --member-status=planned|active|result-ready|needs-review|blocked|closed|removed
  --state=active|satisfied|blocked|closed
  --acceptance-evidence-json={} --evidence-id=ID --session-id=ID

Optional:
  --database=.ai/tools/agent-runtime/runtime/runtime.sqlite
  --output-dir=.ai/tools/agent-runtime/runtime/maintenance-history
`);
}

main().catch((error) => {
  console.error(`error: ${error.message}`);
  process.exitCode = 1;
});
