#!/usr/bin/env node
/**
 * Bitget Skill Installer
 *
 * Usage (run explicitly — no postinstall side effects):
 *   npx bitget-agent-skill                          # default: uta skill, Claude Code only
 *   npx bitget-agent-skill --interactive            # prompt to choose targets
 *   npx bitget-agent-skill --target all             # install to all supported tools
 *   npx bitget-agent-skill --target claude          # Claude Code only
 *   npx bitget-agent-skill --target codex           # Codex only
 *   npx bitget-agent-skill --target openclaw        # OpenClaw only
 *   npx bitget-agent-skill --target claude,codex    # multiple targets
 *   npx bitget-agent-skill --skill agentic          # install the Agentic (OAuth) skill instead
 *   npx bitget-agent-skill --skill agentic-connect  # first-time cloud MCP connect guide
 *   npx bitget-agent-skill --skill uta,agentic      # install both skills
 *   npx bitget-agent-skill --skill all              # install all skills
 */

import { copyFileSync, mkdirSync, existsSync, readdirSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { homedir } from "node:os";
import { createInterface } from "node:readline";

const __dirname = dirname(fileURLToPath(import.meta.url));
const PKG_ROOT = join(__dirname, "..");
const HOME = homedir();

// Installable skills — each copies its own SKILL.md (and optional reference
// files) into a per-skill subdirectory under the AI tool's skills root.
const SKILLS = {
  uta: {
    label: "UTA trading (manual API key)",
    skillSrcDir: join(PKG_ROOT, "skills", "uta"),
    skillDirName: "bitget-agent-skill",
    refFiles: [
      "commands.md",
      "discover-guide.md",
      "trading-safety.md",
      "error-codes.md",
      "auth-setup.md",
      "demo-trading.md",
    ],
  },
  agentic: {
    label: "Agentic sub-account (OAuth)",
    skillSrcDir: join(PKG_ROOT, "skills", "agentic"),
    skillDirName: "bitget-agentic",
    refFiles: [],
  },
  "agentic-connect": {
    label: "Agentic first-time MCP connect guide",
    skillSrcDir: join(PKG_ROOT, "skills", "agentic-connect"),
    skillDirName: "bitget-agentic-connect",
    refFiles: [],
  },
};

// Skill destinations per AI tool
const TARGETS = {
  claude: {
    label: "Claude Code",
    skillsRoot: join(HOME, ".claude", "skills"),
  },
  codex: {
    label: "Codex",
    skillsRoot: join(HOME, ".codex", "skills"),
  },
  openclaw: {
    label: "OpenClaw",
    skillsRoot: join(HOME, ".openclaw", "skills"),
  },
};

function installTo(targetKey, skillKey) {
  const target = TARGETS[targetKey];
  const skill = SKILLS[skillKey];
  const skillDir = join(target.skillsRoot, skill.skillDirName);
  const refsDir = join(skillDir, "references");

  mkdirSync(skillDir, { recursive: true });

  const skillSrc = join(skill.skillSrcDir, "SKILL.md");
  copyFileSync(skillSrc, join(skillDir, "SKILL.md"));

  if (skill.refFiles.length > 0) {
    mkdirSync(refsDir, { recursive: true });
    for (const f of skill.refFiles) {
      const src = join(PKG_ROOT, "references", f);
      if (existsSync(src)) {
        copyFileSync(src, join(refsDir, f));
      }
    }
  }

  console.log(`  ✓ ${target.label} (${skill.label}) → ${join(skillDir, "SKILL.md")}`);
}

async function promptTargets() {
  const rl = createInterface({ input: process.stdin, output: process.stdout });

  console.log("\nBitget Skill — choose installation targets:\n");
  const keys = Object.keys(TARGETS);
  keys.forEach((k, i) => {
    console.log(`  ${i + 1}. ${TARGETS[k].label}  (${TARGETS[k].skillsRoot})`);
  });
  console.log(`  ${keys.length + 1}. All of the above`);
  console.log();

  return new Promise((resolve) => {
    rl.question(
      `Enter numbers separated by commas [default: 1]: `,
      (answer) => {
        rl.close();
        const trimmed = answer.trim();
        if (!trimmed || trimmed === "1") {
          resolve(["claude"]);
          return;
        }
        if (trimmed === String(keys.length + 1)) {
          resolve(keys);
          return;
        }
        const selected = trimmed
          .split(",")
          .map((s) => parseInt(s.trim(), 10) - 1)
          .filter((i) => i >= 0 && i < keys.length)
          .map((i) => keys[i]);
        resolve(selected.length > 0 ? selected : ["claude"]);
      }
    );
  });
}

function parseListFlag(args, name, validKeys) {
  const arg = args.find((a) => a.startsWith(`--${name}=`) || a === `--${name}`);
  if (!arg) return null;
  const value =
    arg === `--${name}` ? args[args.indexOf(`--${name}`) + 1] : arg.split("=")[1];
  if (!value) return null;
  if (value === "all") return Object.keys(validKeys);
  const keys = value
    .split(",")
    .map((s) => s.trim())
    .filter((k) => k in validKeys);
  if (keys.length === 0) {
    console.warn(
      `Unknown ${name}(s): ${value}. Valid: ${Object.keys(validKeys).join(", ")}, all`
    );
    process.exit(1);
  }
  return keys;
}

async function main() {
  const args = process.argv.slice(2);
  const isInteractive = args.includes("--interactive");
  const targetValue = parseListFlag(args, "target", TARGETS);
  const skillValue = parseListFlag(args, "skill", SKILLS);

  let selectedTargetKeys;
  const selectedSkillKeys = skillValue || ["uta"];

  if (isInteractive) {
    // Interactive mode — prompt user
    try {
      selectedTargetKeys = await promptTargets();
    } catch {
      selectedTargetKeys = ["claude"];
    }
  } else if (targetValue) {
    selectedTargetKeys = targetValue;
  } else {
    // Default postinstall: Claude Code, uta skill only, silent on failure
    try {
      installTo("claude", "uta");
    } catch (err) {
      console.warn("Could not auto-install skill:", err.message);
    }
    return;
  }

  console.log("\nInstalling Bitget skill...");
  let ok = 0;
  const total = selectedTargetKeys.length * selectedSkillKeys.length;
  for (const targetKey of selectedTargetKeys) {
    for (const skillKey of selectedSkillKeys) {
      try {
        installTo(targetKey, skillKey);
        ok++;
      } catch (err) {
        console.warn(`  ✗ ${TARGETS[targetKey].label} (${SKILLS[skillKey].label}): ${err.message}`);
      }
    }
  }
  console.log(`\nDone — installed ${ok} of ${total} target/skill combinations.`);

  if (selectedTargetKeys.includes("claude")) {
    console.log(
      "\nClaude Code: restart Claude Code to pick up the skill, or run:\n" +
        "  claude skills list"
    );
  }
  if (selectedTargetKeys.includes("codex")) {
    console.log("\nCodex: skill will be loaded automatically from ~/.codex/skills/");
  }
  if (selectedTargetKeys.includes("openclaw")) {
    console.log("\nOpenClaw: skill will be loaded automatically from ~/.openclaw/skills/");
  }
}

main();
