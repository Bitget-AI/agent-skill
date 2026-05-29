# bitget-agent-skill

[![npm](https://img.shields.io/npm/v/bitget-agent-skill.svg)](https://www.npmjs.com/package/bitget-agent-skill)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

The **skill surface** of the [Bitget Agent Hub](https://github.com/bitget/agent-hub) — installs an AI skill that teaches Claude Code, Codex, and OpenClaw how to use [`bgc`](https://github.com/bitget/agent-cli) for natural-language Bitget trading.

```bash
npm install -g bitget-agent-cli     # the bgc CLI it depends on
npm install -g bitget-agent-skill   # installs the skill into your AI tool
```

The postinstall step writes `SKILL.md` and references into `~/.claude/skills/bitget-agent-skill/` by default.

## Targets

```bash
# Default (Claude Code)
npm install -g bitget-agent-skill

# Pick targets explicitly (use the bin to redeploy)
npx bitget-agent-skill --target claude
npx bitget-agent-skill --target claude,codex
npx bitget-agent-skill --target all

# Or pick interactively
npx bitget-agent-skill --interactive
```

Currently supported skill destinations:

| Target   | Skill location                                |
|----------|-----------------------------------------------|
| Claude Code | `~/.claude/skills/bitget-agent-skill/`     |
| Codex    | `~/.codex/skills/bitget-agent-skill/`         |
| OpenClaw | `~/.openclaw/skills/bitget-agent-skill/`      |

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
                       bgc CLI  (bitget-agent-cli)
                          ↓
                       Bitget API
```

`bitget-agent-skill` is **runtime-free** — it's pure markdown. The actual API calls go through `bgc`.

## License

MIT

---

Part of the **[Bitget Agent Hub](https://github.com/bitget/agent-hub)** — Trading Stack · Surface.
Foundation: [agent-sdk](https://github.com/bitget/agent-sdk) · Other surfaces: [agent-cli](https://github.com/bitget/agent-cli) · [agent-mcp](https://github.com/bitget/agent-mcp)
