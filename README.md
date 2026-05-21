# bitget-skill

[![npm](https://img.shields.io/npm/v/bitget-skill.svg)](https://www.npmjs.com/package/bitget-skill)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

The **skill surface** of the [Bitget Agent Hub](https://github.com/bitget/agent-hub) — installs an AI skill that teaches Claude Code, Codex, and OpenClaw how to use [`bgc`](https://github.com/bitget/agent-cli) for natural-language Bitget trading.

```bash
npm install -g bitget-client    # the bgc CLI it depends on
npm install -g bitget-skill     # installs the skill into your AI tool
```

The postinstall step writes `SKILL.md` and references into `~/.claude/skills/bitget-skill/` by default.

## Targets

```bash
# Default (Claude Code)
npm install -g bitget-skill

# Pick targets explicitly
node scripts/install.js --target claude
node scripts/install.js --target claude,codex
node scripts/install.js --target all

# Or pick interactively
node scripts/install.js --interactive
```

Currently supported skill destinations:

| Target   | Skill location                          |
|----------|------------------------------------------|
| Claude Code | `~/.claude/skills/bitget-skill/`     |
| Codex    | `~/.codex/skills/bitget-skill/`         |
| OpenClaw | `~/.openclaw/skills/bitget-skill/`      |

## Why a skill (vs. just installing `bgc`)

The CLI alone gives the AI 56 commands but no semantics. The skill adds:

- A trigger description so the assistant knows **when** to use Bitget
- A reference catalog of every command with parameters and examples
- Guidance for write operations, demo trading, error codes, and auth setup

Result: you say "buy 0.1 BTC at market on Bitget" and it actually works.

## Composition

```
You → Claude Code / Codex / OpenClaw  (with this skill loaded)
                          ↓
                       bgc CLI  (bitget-client)
                          ↓
                       Bitget API
```

`bitget-skill` is **runtime-free** — it's pure markdown. The actual API calls go through `bgc`.

## License

MIT

---

Part of the **[Bitget Agent Hub](https://github.com/bitget/agent-hub)** — Trading Stack · Surface.
Foundation: [agent-sdk](https://github.com/bitget/agent-sdk) · Other surfaces: [agent-cli](https://github.com/bitget/agent-cli) · [agent-mcp](https://github.com/bitget/agent-mcp)
