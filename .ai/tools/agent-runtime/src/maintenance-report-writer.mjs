/**
 * @file .ai/tools/agent-runtime/src/maintenance-report-writer.mjs
 * @version 0.2.0 - 2026-05-07 04:10
 * @docref DOC-SYSTEM-SPEC-032
 * @see /documentation/project/specs/ai-engineering-workflow/DOC-SYSTEM-SPEC-032-agent-runtime-and-worker-sessions.md
 * @description Writes machine-readable maintenance reports for the local
 * agent-runtime tool state without turning runtime output into source code.
 */
import { mkdirSync, renameSync, writeFileSync } from "node:fs";
import path from "node:path";
import { randomBytes } from "node:crypto";
import { enumValue, jsonList, jsonObject, requireRuntimeOperatorActor, required, timestamp } from "./runtime-utils.mjs";

const modes = new Set(["audit_only", "cleanup_allowed", "projection_refresh", "full_maintenance"]);
const decisions = new Set(["passed", "failed", "blocked"]);

export function writeMaintenanceReport(options, defaultOutputDirectory) {
  requireRuntimeOperatorActor(options, "maintenance-report-write");
  const createdAt = timestamp(options["created-at"]);
  const reportId = options["report-id"] ?? id();
  assertSafeReportId(reportId);

  const payload = {
    schema_version: "1.0.0",
    artifact_type: "agent-runtime-maintenance-report",
    report_id: reportId,
    created_at: createdAt,
    created_by: {
      actor_role: String(options["actor-role"] ?? "").toLowerCase(),
      actor_session_id: options["actor-session-id"] ?? null,
    },
    runtime_store: options["runtime-store"] ?? ".ai/tools/agent-runtime/runtime/runtime.sqlite",
    policy_trigger: required(options, "policy-trigger"),
    mode: enumValue(required(options, "mode"), modes, "mode"),
    decision: enumValue(required(options, "decision"), decisions, "decision"),
    summary: options.summary ?? "",
    dry_run_summary: jsonObject(options["dry-run-summary-json"] ?? "{}", "dry-run-summary-json"),
    cleanup_summary: jsonObject(options["cleanup-summary-json"] ?? "{}", "cleanup-summary-json"),
    active_rows_report: jsonObject(options["active-rows-report-json"] ?? "{}", "active-rows-report-json"),
    cutoffs: jsonObject(options["cutoffs-json"] ?? "{}", "cutoffs-json"),
    projection: jsonObject(options["projection-json"] ?? "{}", "projection-json"),
    related_artifacts: jsonList(options["related-artifacts-json"] ?? "[]", "related-artifacts-json"),
  };

  const outputDirectory = options["output-dir"] ?? defaultOutputDirectory;
  mkdirSync(outputDirectory, { recursive: true });
  const timestampPart = createdAt.replace(/[-:]/g, "").replace(".000", "");
  const filePath = path.join(outputDirectory, `${timestampPart}-${reportId}.json`);
  const temporaryPath = `${filePath}.tmp`;
  writeFileSync(temporaryPath, `${JSON.stringify(payload, null, 2)}\n`, "utf8");
  renameSync(temporaryPath, filePath);
  return filePath;
}

function id() {
  const compact = new Date().toISOString().replace(/[-:.TZ]/g, "").slice(0, 14);
  return `amr_${compact}_${randomBytes(6).toString("hex")}`;
}

function assertSafeReportId(reportId) {
  if (!/^[A-Za-z0-9._-]+$/.test(reportId)) {
    throw new Error("Invalid report-id. Use only letters, numbers, dot, underscore or dash.");
  }
}
