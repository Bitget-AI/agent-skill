# Changelog

All notable changes to `bitget-agent-skill` are documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

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
- **Generated references now reference `bitget-agent-sdk`** (was `bitget-core`). The `references/commands.md` catalog of 59 tools is auto-regenerated on publish.
- **Minimum Node.js version: 20.0.0** (was 18). Node 18 reached end-of-life in April 2025.
- **Repository moved** from monorepo `agent_hub/packages/bitget-skill/` to standalone repo [`bitget/agent-skill`](https://github.com/bitget/agent-skill).

### Unchanged
- The skill's trigger description, behaviour, and content. Your AI assistant will recognise the same trading intents and respond the same way.
- Dependency on `bgc` CLI (now `bitget-agent-cli`) — install both for full functionality.

[1.2.0]: https://github.com/bitget/agent-skill/releases/tag/v1.2.0
