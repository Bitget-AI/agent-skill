# Changelog

All notable changes to `bitget-agent-skill` are documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [3.4.1] - 2026-10-30

### Fixed
- **`bitget-agentic` / `bitget-agentic-connect`** — clarify `mcp_auth` is client-side OAuth (not a server tool); login check uses `getAccountAssets` / `getDeductInfo`; add `guide` → `do_query` / `do_request_open_api` workflow; Claude Code add uses `-s user`; drop hard-coded third-party datahub URL and refresh-token TTL; connect skill is first-time only and defers to local agentic after setup.

## [3.4.0] - 2026-10-30

### Added
- **`bitget-agentic-connect` skill** — first-time guide to install the local Agentic skill, connect remote MCP `https://agent.bitget.com/mcp`, run legacy MCP/API-key checks, and complete browser OAuth. Install with `--skill agentic-connect`.

### Changed
- **`bitget-agentic` skill → 2.2.3** — rewritten for the cloud HTTP MCP (`guide` / `do_query` / `do_request_open_api`), legacy stdio MCP upgrade path, Cursor `CLIENT_ID`, and re-auth / trading / disconnect rules. No longer documents the old local `@bitget-ai/bitget-agent-mcp` OAuth flow.

## [3.3.1] - 2026-09-20

### Fixed
- **`bitget-agentic` skill §6 optional MCP setup** — replaced the `upgrade-all` Skill Hub installer guidance (which pulls in `bitget-signal`/datahub) with the correct two-package split: A) `bitget-agent-cli` (`bgc`) + `bitget-agent-skill` (UTA skill) upgraded individually, no signal; B) cloud Market MCP (HTTP), unchanged. Aligned with the official onboarding guide's Step 1b.

## [3.3.0] - 2026-09-17

### Added
- **`bitget-agentic` skill — network/proxy troubleshooting (§5)** — Agent must recognize bitget.com connectivity failures (timeout/ECONNREFUSED/ENOTFOUND/etc.), probe for a local proxy/VPN, and route through it before retrying OAuth; added boundary case R (regional network unreachable).
- **`bitget-agentic` skill — optional MCP setup (§6)** — guidance for installing the no-key Skill Hub installer and the cloud Market MCP (HTTP transport) alongside the trading MCP.

### Changed
- `bitget-agentic` skill's 禁止 list (renumbered §5 → §7) gains a new prohibition: retrying OAuth repeatedly without first diagnosing the network.

## [3.2.1] - 2026-09-02

### Fixed
- **`scripts/install.js` missing executable bit** — the file shipped as `644` in the published tarball, so npm's `bin` symlink failed with `command not found` on `npx`/global install. Restored the executable bit. Pre-existing since 1.2.0; discovered while verifying 3.2.0 end to end.

## [3.2.0] - 2026-09-02

### Added
- **`bitget-agentic` skill** — OAuth-based Bitget Agentic account skill, merged into this package alongside the existing UTA skill. Install with `--skill agentic` (or `--skill all` for both); default remains the UTA skill only, unchanged for existing users.
- **`scripts/install.js` `--skill` flag** — selects which skill(s) to install (`uta` default, `agentic`, or `all`), independent of `--target`.

### Changed
- `skills/SKILL.md` moved to `skills/uta/SKILL.md`; the Agentic skill lives alongside it at `skills/agentic/SKILL.md`.

## [3.0.0] - 2026-06-18

Full rewrite for the **Bitget Unified Trading Account (UTA / v3)** API. The version
jumps from 1.2.0 to 3.0.0 to track the major of `@bitget-ai/bitget-agent-cli` and
`@bitget-ai/bitget-agent-sdk` (there is no 2.x skill release).

### Changed (BREAKING)
- **New CLI grammar.** `SKILL.md` now teaches `bgc <tool> [--action <name>] [--<param> <value> ...]`, replacing the v2 `bgc <module> <tool_name>` form. There are no separate spot/futures modules — one `--category` (`SPOT`, `MARGIN`, `USDT-FUTURES`, `COIN-FUTURES`, `USDC-FUTURES`) selects the market.
- **16 intent verbs** across 9 domains (market, trade, account, funds, subaccount, loan, tax, plus hidden to-B broker/inst_loan) replace the old 59 flat tools.
- **`references/commands.md` is regenerated from the SDK's own `discover` surface** — every domain, verb, action, and parameter (with enums and doc-grounded descriptions) for 109 operations, guaranteed not to drift from what `bgc` exposes.
- **Error docs** rewritten for the v3 semantic error model: a `{ ok, error: { type, category, message, suggestion, retryable }, timestamp }` payload with category-driven recovery.

### Added
- **`references/discover-guide.md`** — the discover-first workflow (`bgc discover` → `--domain` → `--tool` → `--action`), keyword search, the `raw` escape hatch, and opting into hidden modules.
- **`references/trading-safety.md`** — close-direction rules (one-way vs hedge), TP/SL presets, `qty` unit gotchas (spot market-buy is quote-coin), cancel-all scoping, and withdrawal chain-address safety.
- **Write-safety model** documented end to end: operations graded read < write < high; `--dry-run` previews, `--confirm` gates high-risk ops (`closeAllPositions`, `cancelAllOrders`, `withdrawal`, `brokerSubaccountWithdrawal`), `--read-only` and `--paper-trading` modes.

### Removed
- **`references/trading/`** (12 v2-grammar trading docs) — superseded by `references/trading-safety.md` and the regenerated catalog.

### Dependencies
- Targets `@bitget-ai/bitget-agent-cli` v3 (the `bgc` binary) and `@bitget-ai/bitget-agent-sdk` v3.

## [1.2.0] - 2026-05-29

### Added
- **`bitget-agent-skill` binary** — exposes the installer as a re-runnable command, so users can redeploy the skill to a different AI host without reinstalling the npm package:
  ```bash
  npx bitget-agent-skill --target codex          # add to Codex
  npx bitget-agent-skill --target claude,codex   # multiple targets
  npx bitget-agent-skill --interactive           # interactive picker
  ```
  Previously this script only ran during `postinstall`.
- **Provenance attestations** on published artefacts (`publishConfig.provenance: true`) for supply-chain verification on npm.

### Changed
- **Renamed package: `bitget-skill` → `bitget-agent-skill`.** The new name aligns with the `bitget-agent-*` family naming convention. The previous `bitget-skill` name is no longer maintained on npm.
- **Skill directory renamed:** the postinstall script now writes to `~/.claude/skills/bitget-agent-skill/` (was `~/.claude/skills/bitget-skill/`). Same for Codex and OpenClaw targets. Existing users on the old name should remove the old directory after upgrading.
- **Generated references now reference `@bitget-ai/bitget-agent-sdk`** (was `bitget-core`). The `references/commands.md` catalog of 59 tools is auto-regenerated on publish.
- **Minimum Node.js version: 20.0.0** (was 18). Node 18 reached end-of-life in April 2025.
- **Repository moved** from monorepo `agent_hub/packages/bitget-skill/` to standalone repo [`bitget/agent-skill`](https://github.com/bitget/agent-skill).

### Unchanged
- The skill's trigger description, behaviour, and content. Your AI assistant will recognise the same trading intents and respond the same way.
- Dependency on `bgc` CLI (now `bitget-agent-cli`) — install both for full functionality.

[1.2.0]: https://github.com/bitget/agent-skill/releases/tag/v1.2.0
