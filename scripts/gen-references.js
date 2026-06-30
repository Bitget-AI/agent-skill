#!/usr/bin/env node
// Generates references/commands.md from @bitget-ai/bitget-agent-sdk by walking
// the SDK's own `discover` surface — the same progressive disclosure an agent
// uses at runtime. Driving discover (not raw catalog reads) guarantees the
// static catalog never drifts from what `bgc` actually exposes.
//
// Output is the v3 intent surface: 16 curated verbs (incl. the hidden to-B
// broker/inst_loan), each action's required/optional contract, plus the meta
// tools. The CLI grammar / global-flags block is the stable `bgc` contract.
import { writeFileSync, mkdirSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const refsDir = join(__dirname, "..", "references");
mkdirSync(refsDir, { recursive: true });

const {
  loadConfig,
  buildTools,
  MODULES,
  HIDDEN_MODULES,
  HIGH_RISK_OPERATIONS,
  DISCOVER_TOOL_NAME,
  RAW_TOOL_NAME,
  SERVER_VERSION,
  CATALOG_SPEC_VERSION,
  CATALOG_OPERATION_COUNT,
  API_VARIANT,
} = await import("@bitget-ai/bitget-agent-sdk");

// All modules incl. hidden to-B verbs, intent surface — exactly what `bgc`
// exposes with `--modules all` plus the explicitly-named hidden ones.
const config = loadConfig({ modules: MODULES.join(","), surface: "intent", readOnly: false });
const tools = buildTools(config);
const discover = tools.find((t) => t.name === DISCOVER_TOOL_NAME);
const call = async (args) => (await discover.handler(args, {})).data;

const hidden = new Set(HIDDEN_MODULES);
const highRisk = new Set(HIGH_RISK_OPERATIONS);
const DESC_CAP = 220;

// Collapse OpenAPI paragraph descriptions to a single, table-safe line.
function cell(text) {
  if (text === undefined || text === null) return "";
  let s = String(text).replace(/\s+/g, " ").trim().replace(/\|/g, "\\|");
  if (s.length > DESC_CAP) s = s.slice(0, DESC_CAP - 1) + "…";
  return s;
}

function enumCell(param) {
  if (!Array.isArray(param.enum) || param.enum.length === 0) return "";
  return param.enum.map((v) => `\`${v}\``).join(" \\| ");
}

function paramTable(params) {
  if (!params || params.length === 0) return ["_No parameters._", ""];
  const out = ["| Param | Type | Enum | Description |", "|-------|------|------|-------------|"];
  for (const p of params) {
    out.push(`| \`${p.name}\` | ${p.type ?? "any"} | ${enumCell(p)} | ${cell(p.description)} |`);
  }
  out.push("");
  return out;
}

function anchor(name) {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, "-");
}

function exampleFor(verb, action, required) {
  const parts = [`bgc ${verb}`];
  if (action) parts.push(`--action ${action}`);
  for (const p of required) {
    if (p.name === "action") continue;
    parts.push(`--${p.name} <${p.name}>`);
  }
  return parts.join(" ");
}

const lines = [];
lines.push("# bgc Command Reference (UTA / v3)");
lines.push("");
lines.push(
  `Auto-generated from \`@bitget-ai/bitget-agent-sdk\` v${SERVER_VERSION} ` +
    `(OpenAPI spec ${CATALOG_SPEC_VERSION}, ${CATALOG_OPERATION_COUNT} operations, ${API_VARIANT}).`,
);
lines.push("Do not edit by hand — run `npm run gen-references`.");
lines.push("");
lines.push(
  "This catalog is the **static** mirror of the live surface. For a verb's exact, " +
    "doc-grounded contract at any moment, run `bgc discover --tool <verb> --action <name>`.",
);
lines.push("");

// ── CLI grammar (the stable `bgc` contract) ─────────────────────────────
lines.push("## Grammar");
lines.push("");
lines.push("```");
lines.push("bgc <tool> [--action <name>] [--<param> <value> ...] [global flags]");
lines.push("bgc discover [--domain <d> | --tool <t> [--action <a>] | --search <q>]");
lines.push("bgc raw --operationId <id> [--args '<json>']");
lines.push("```");
lines.push("");
lines.push(
  "One verb per call. `--action` selects the intent for action-routed verbs. " +
    "Values coerce by shape: `true`/`false` → boolean, a value starting with `[` or `{` → JSON " +
    "(e.g. `--orders '[{...}]'`), everything else stays a string. Output is JSON on stdout " +
    "(exit 0); errors are a JSON payload on stderr (exit 1).",
);
lines.push("");

// ── Global flags ─────────────────────────────────────────────────────────
lines.push("## Global flags");
lines.push("");
lines.push("| Flag | Effect |");
lines.push("|------|--------|");
lines.push("| `--action <name>` | Action for an action-routed verb |");
lines.push("| `--modules <list>` | Modules to enable (CLI default: `all`). Name a hidden to-B module to expose it, e.g. `--modules broker` |");
lines.push("| `--surface <mode>` | `intent` (default) or `full` (also expose the 1:1 generated operations) |");
lines.push("| `--full` | Shorthand for `--surface full` |");
lines.push("| `--read-only` | Block all writes (mutually exclusive with `--paper-trading`) |");
lines.push("| `--paper-trading` | Route writes to the Bitget demo environment (needs demo credentials) |");
lines.push("| `--dry-run` | Preview a write without sending it (maps to `dryRun`) |");
lines.push("| `--confirm` | Required to execute destructive (high-risk) writes |");
lines.push("| `--base-url <url>` | Override API base URL (else `BITGET_API_BASE_URL`) |");
lines.push("| `--timeout <ms>` | Per-request timeout (else `BITGET_TIMEOUT_MS`, default 15000) |");
lines.push("| `--pretty` | Pretty-print JSON output |");
lines.push("| `--help`, `--version` | Help / version |");
lines.push("");

// ── Write safety ───────────────────────────────────────────────────────
lines.push("## Write safety");
lines.push("");
lines.push(
  "Every operation is graded **read** < **write** < **high**. Reads run freely. Writes honor " +
    "`--dry-run`, `--read-only`, and `--paper-trading`. **High-risk** operations refuse to run " +
    "without `--confirm` — without it the call returns `{ confirmationRequired: true }` (a normal " +
    "result on stdout, not an error).",
);
lines.push("");
lines.push(`High-risk operations (require \`--confirm\`): ${[...highRisk].map((o) => `\`${o}\``).join(", ")}.`);
lines.push("");
lines.push(
  "Common params available on most verbs (not repeated in the tables below): `dryRun`, `confirm` " +
    "(writes); `view` (`summary`|`full`) and `fields` (read normalization / token economy); " +
    "`fetchAll`, `cursor`, `limit` (paginated reads).",
);
lines.push("");

// ── Walk the surface ─────────────────────────────────────────────────────
const overview = await call({});
const verbsByDomain = new Map();
for (const d of overview.domains) {
  const list = await call({ domain: d.domain });
  verbsByDomain.set(d.domain, list.tools);
}

// Table of contents
lines.push("## Domains");
lines.push("");
for (const d of overview.domains) {
  const verbs = verbsByDomain.get(d.domain);
  const names = verbs.map((v) => `[\`${v.name}\`](#${anchor(v.name)})`).join(", ");
  lines.push(`- **${d.domain}** — ${names}`);
}
lines.push(`- **meta** — [\`${RAW_TOOL_NAME}\`](#raw), [\`${DISCOVER_TOOL_NAME}\`](#discover)`);
lines.push("");

// Per domain → per verb
for (const d of overview.domains) {
  lines.push(`## Domain: ${d.domain}`);
  lines.push("");
  for (const v of verbsByDomain.get(d.domain)) {
    const tool = await call({ tool: v.name });
    lines.push(`### \`${v.name}\``);
    lines.push("");
    const badges = [`risk: **${v.riskLevel}**`, `write: ${v.isWrite ? "yes" : "no"}`, `auth: ${tool.auth}`];
    lines.push(badges.join(" · "));
    lines.push("");
    // Hidden to-B modules have domain === module id (broker, instloan); name the
    // module id in the opt-in hint, not the verb name (inst_loan ≠ instloan).
    if (hidden.has(d.domain)) {
      lines.push(`> Hidden to-B verb — opt in with \`--modules ${d.domain}\` (not in \`--modules all\`).`);
      lines.push("");
    }
    lines.push(cell(tool.description));
    lines.push("");

    if (tool.actions) {
      lines.push(`**Actions:** ${tool.actions.map((a) => `\`${a}\``).join(", ")}`);
      lines.push("");
      for (const action of tool.actions) {
        const c = await call({ tool: v.name, action });
        const danger = highRisk.has(c.operationId) ? " — **[DANGER] requires `--confirm`**" : "";
        lines.push(`#### \`bgc ${v.name} --action ${action}\`${danger}`);
        lines.push("");
        lines.push(`\`${c.method} ${c.path}\` · ${c.auth}${c.isWrite ? " · write" : ""}`);
        lines.push("");
        if (c.summary) {
          lines.push(cell(c.summary));
          lines.push("");
        }
        if (c.required.length > 0) {
          lines.push("Required:");
          lines.push("");
          lines.push(...paramTable(c.required));
        }
        if (c.optional.length > 0) {
          lines.push("Optional:");
          lines.push("");
          lines.push(...paramTable(c.optional));
        }
        if (c.required.length === 0 && c.optional.length === 0) {
          lines.push("_No business parameters._");
          lines.push("");
        }
        lines.push("```bash");
        lines.push(exampleFor(v.name, action, c.required));
        lines.push("```");
        lines.push("");
      }
    } else {
      // Action-less verb (composite fan-out or 1:1 op): explicit param split.
      if (tool.params.required.length > 0) {
        lines.push("Required:");
        lines.push("");
        lines.push(...paramTable(tool.params.required));
      }
      lines.push("Optional:");
      lines.push("");
      lines.push(...paramTable(tool.params.optional));
      lines.push("```bash");
      lines.push(exampleFor(v.name, null, tool.params.required));
      lines.push("```");
      lines.push("");
    }
  }
}

// ── Meta tools ─────────────────────────────────────────────────────────
lines.push("## Meta tools");
lines.push("");
lines.push("### `discover`");
lines.push("");
lines.push(
  "Progressive introspection of the live surface. `bgc discover` lists domains; " +
    "`--domain <d>` lists a domain's verbs; `--tool <t>` returns one verb's full schema; " +
    "`--tool <t> --action <a>` returns one action's exact required/optional contract; " +
    "`--search <q>` keyword-searches the whole surface.",
);
lines.push("");
lines.push("### `raw`");
lines.push("");
lines.push(
  "Escape hatch to any catalog operation by id, bypassing the intent layer: " +
    "`bgc raw --operationId <id> --args '<json>'`. Use when no verb fronts the operation you need.",
);
lines.push("");

writeFileSync(join(refsDir, "commands.md"), lines.join("\n"), "utf8");

const verbCount = [...verbsByDomain.values()].reduce((n, v) => n + v.length, 0);
console.log(
  `Generated references/commands.md — ${overview.domains.length} domains, ${verbCount} verbs ` +
    `(SDK ${SERVER_VERSION}, spec ${CATALOG_SPEC_VERSION}, ${CATALOG_OPERATION_COUNT} ops).`,
);
