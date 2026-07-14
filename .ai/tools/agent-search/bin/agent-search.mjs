#!/usr/bin/env node
/**
 * @file .ai/tools/agent-search/bin/agent-search.mjs
 * @version 0.1.0 - 2026-05-07 00:00
 * @description CLI entrypoint for bounded repository search profiles used by
 * AI agents. The file is an internal development-environment tool adapter and
 * does not define a product/runtime contract.
 */
import { spawnSync } from "node:child_process";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const aiRoot = path.resolve(__dirname, "../../..");
const repoRoot = path.dirname(aiRoot);

const modeDefinitions = {
  code: {
    include: ["src", "tests", "scripts", "types"],
    globs: commonExcludeGlobs(),
  },
  docs: {
    include: ["docs", "documentation", "README.md", "AGENTS.md"],
    globs: ["*.md", "!docs/payloadDocs/**"],
  },
  "code-docs": {
    include: [
      "src",
      "tests",
      "scripts",
      "types",
      "docs",
      "documentation",
      "README.md",
      "AGENTS.md",
    ],
    globs: [...commonExcludeGlobs(), "!docs/payloadDocs/**"],
  },
  "ai-active": {
    include: [
      ".ai/rules",
      ".ai/checks",
      ".ai/workflows",
      ".ai/roles",
      ".ai/registry",
      ".codex/skills",
      ".codex/agents",
      ".codex/prompts",
    ],
    globs: [
      ...commonExcludeGlobs(),
      "!.ai/reports/**",
      "!.ai/tasks/history/**",
      "!.ai/tools/agent-runtime/runtime/**",
    ],
  },
  ai: {
    include: [".ai"],
    globs: [
      ...commonExcludeGlobs(),
      "!.ai/reports/**",
      "!.ai/tasks/history/**",
      "!.ai/tools/agent-runtime/runtime/**",
    ],
  },
  codex: {
    include: [".codex"],
    globs: commonExcludeGlobs(),
  },
  "next-routes": {
    include: ["src/app"],
    globs: commonExcludeGlobs(),
  },
  payload: {
    include: ["src/payload.config.ts", "src/collections", "src/domain/collections", "src/migrations"],
    globs: commonExcludeGlobs(),
  },
  domain: {
    include: ["src/domain"],
    globs: commonExcludeGlobs(),
  },
  "search-layer": {
    include: [
      "src/domain/services/search",
      "src/domain/data/searchProfiles",
      "src/app/api/search",
      "src/app/api/filters",
      "docs/filter_elasticsearch_srp.md",
      "docs/elasticsearch_local_setup.md",
    ],
    globs: commonExcludeGlobs(),
  },
  ui: {
    include: ["src/domain/ui", "src/app"],
    globs: commonExcludeGlobs(),
  },
  migrations: {
    include: ["src/migrations"],
    globs: commonExcludeGlobs(),
  },
  reference: {
    include: ["docs/ui-examples", ".ai/reports", ".ai/tasks/history"],
    globs: commonExcludeGlobs(),
    reasonRequired: true,
  },
  special: {
    include: [],
    globs: commonExcludeGlobs(),
    reasonRequired: true,
    pathsRequired: true,
  },
};

function main() {
  const options = parseArgs(process.argv.slice(2));

  if (options.help || options._.length === 0) {
    printHelp();
    process.exitCode = options.help ? 0 : 1;
    return;
  }

  const mode = options.mode ?? "code";
  const definition = modeDefinitions[mode];

  if (!definition) {
    fail(`Unknown --mode=${mode}. Expected one of: ${Object.keys(modeDefinitions).join(", ")}`);
  }

  if (definition.reasonRequired && !options.reason) {
    fail(`--mode=${mode} requires --reason=<why this expanded mode is needed>`);
  }

  const query = options._.join(" ").trim();
  if (!query) {
    fail("Missing search query");
  }

  const limit = parsePositiveInteger(options.limit ?? "80", "--limit");
  const extraPaths = toArray(options.path);
  const include = definition.pathsRequired ? extraPaths : [...definition.include, ...extraPaths];

  if (include.length === 0) {
    fail(`--mode=${mode} requires at least one --path=<relative/path>`);
  }

  const rgArgs = buildRipgrepArgs({ definition, include, options, query });
  printResolvedScope({ mode, query, include, definition, limit, options });

  if (options["dry-run"] === "true" || options["dry-run"] === true) {
    console.log(`command: rg ${rgArgs.map(shellToken).join(" ")}`);
    return;
  }

  const result = spawnSync("rg", rgArgs, {
    cwd: repoRoot,
    encoding: "utf8",
    maxBuffer: 10 * 1024 * 1024,
  });

  if (result.error) {
    fail(result.error.message);
  }

  const stdout = result.stdout ?? "";
  const stderr = result.stderr ?? "";

  if (stderr.trim()) {
    process.stderr.write(stderr);
  }

  const lines = stdout.split(/\r?\n/).filter((line) => line.length > 0);
  const shown = lines.slice(0, limit);

  for (const line of shown) {
    console.log(line);
  }

  if (lines.length > limit) {
    console.log(`-- truncated: ${shown.length}/${lines.length} lines shown; refine query or raise --limit`);
  }

  if (result.status !== 0 && result.status !== 1) {
    process.exitCode = result.status ?? 1;
  }
}

function buildRipgrepArgs({ definition, include, options, query }) {
  const args = ["--line-number", "--color", "never"];

  if (options.ignoreCase === "true" || options.i === true || options.i === "true") {
    args.push("--ignore-case");
  }

  if (options.fixed === "true" || options.F === true || options.F === "true") {
    args.push("--fixed-strings");
  }

  for (const glob of definition.globs) {
    args.push("--glob", glob);
  }

  for (const extension of parseExtensions(options.ext)) {
    args.push("--glob", `*.${extension}`);
  }

  for (const glob of toArray(options.glob)) {
    args.push("--glob", glob);
  }

  args.push("--", query);
  args.push(...include);

  return args;
}

function commonExcludeGlobs() {
  return [
    "!node_modules/**",
    "!.next/**",
    "!dist/**",
    "!build/**",
    "!coverage/**",
    "!*.sqlite",
    "!*.sqlite-wal",
    "!*.sqlite-shm",
    "!*.jsonl",
    "!*.png",
    "!*.jpg",
    "!*.jpeg",
    "!*.gif",
    "!*.webp",
    "!*.zip",
    "!*.tar",
    "!*.gz",
  ];
}

function parseArgs(tokens) {
  const options = { _: [] };

  for (const token of tokens) {
    if (token === "--help" || token === "-h") {
      options.help = true;
      continue;
    }

    if (!token.startsWith("--")) {
      options._.push(token);
      continue;
    }

    const raw = token.slice(2);
    const separator = raw.indexOf("=");

    if (separator === -1) {
      options[raw] = true;
      continue;
    }

    const key = raw.slice(0, separator);
    const value = raw.slice(separator + 1);

    if (options[key] === undefined) {
      options[key] = value;
    } else if (Array.isArray(options[key])) {
      options[key].push(value);
    } else {
      options[key] = [options[key], value];
    }
  }

  return options;
}

function toArray(value) {
  if (value === undefined) {
    return [];
  }

  return Array.isArray(value) ? value : [value];
}

function parsePositiveInteger(value, optionName) {
  const parsed = Number.parseInt(value, 10);

  if (!Number.isInteger(parsed) || parsed < 1) {
    fail(`${optionName} must be a positive integer`);
  }

  return parsed;
}

function parseExtensions(value) {
  return toArray(value)
    .flatMap((item) => String(item).split(","))
    .map((item) => item.trim().replace(/^\./, ""))
    .filter((item) => item.length > 0)
    .map((item) => {
      if (!/^[A-Za-z0-9_+-]+$/.test(item)) {
        fail(`Invalid --ext value: ${item}`);
      }

      return item;
    });
}

function printResolvedScope({ mode, query, include, definition, limit, options }) {
  console.log(`mode: ${mode}`);
  console.log(`query: ${query}`);
  console.log(`include_paths: ${include.join(", ")}`);
  console.log(`rg_globs: ${definition.globs.join(", ") || "none"}`);
  if (options.ext) {
    console.log(`extensions: ${parseExtensions(options.ext).join(", ")}`);
  }
  console.log(`limit: ${limit}`);

  if (options.reason) {
    console.log(`reason: ${options.reason}`);
  }

  console.log("---");
}

function shellToken(value) {
  if (/^[A-Za-z0-9_./:=@+-]+$/.test(value)) {
    return value;
  }

  return JSON.stringify(value);
}

function printHelp() {
  console.log(`agent-search --mode=<mode> [options] <query>

Modes:
  code       src/tests/scripts/types
  docs       docs plus root project markdown
  code-docs  active code plus docs/root project markdown
  ai-active  active .ai rules/checks/workflows/roles/registry and .codex adapters
  ai         .ai operating layer without reports/history/runtime state
  codex      .codex adapter layer
  next-routes
             src/app routes, layouts and route handlers
  payload    Payload config, collections and migrations
  domain
             src/domain contracts, data, services, routes and ui
  search-layer
             Elasticsearch/search API and related docs
  ui         Domain UI and public application route surface
             domain/ui and public Next.js routes
  migrations src/migrations only
  reference  references, reports and historical task evidence; requires --reason
  special    explicit --path entries only; requires --reason

Options:
  --mode=code|docs|code-docs|ai-active|ai|codex|next-routes|payload|domain|search-layer|ui|migrations|reference|special
  --limit=80
  --path=relative/path       Additional include path; repeatable
  --ext=ts                   Restrict to extension; repeatable or comma-separated
  --glob='*.ts'              Additional rg glob; repeatable
  --reason='short reason'    Required for reference and special modes
  --fixed=true              Use fixed-string search
  --ignoreCase=true         Case-insensitive search
  --dry-run=true            Print resolved rg command without running it

Examples:
  npm --prefix .ai/tools/agent-search run search -- --mode=code Listing
  npm --prefix .ai/tools/agent-search run search -- --mode=payload Product
  npm --prefix .ai/tools/agent-search run search -- --mode=next-routes searchParams
  npm --prefix .ai/tools/agent-search run search -- --mode=ui SearchProfiles
  npm --prefix .ai/tools/agent-search run search -- --mode=search-layer elastic
  npm --prefix .ai/tools/agent-search run search -- --mode=docs project-contract
  npm --prefix .ai/tools/agent-search run search -- --mode=ai RULE-SEARCH-SCOPE-DISCIPLINE
  npm --prefix .ai/tools/agent-search run search -- --mode=codex frontend-runtime-evidence
  npm --prefix .ai/tools/agent-search run search -- --mode=ai-active RULE-NO-HISTORICAL-NOISE
  npm --prefix .ai/tools/agent-search run search -- --mode=reference --reason=visual-reference company-create-wizard
  npm --prefix .ai/tools/agent-search run search -- --mode=special --path=.gitignore --reason=ignore-policy node_modules
`);
}

function fail(message) {
  console.error(`error: ${message}`);
  process.exit(1);
}

main();
