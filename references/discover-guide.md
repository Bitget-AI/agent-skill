# Discovering the Surface with `bgc discover`

`bgc` introspects its own live tool surface. Use `discover` instead of guessing
parameters — it returns the exact, doc-grounded contract for whatever is callable
right now (it respects `--modules`, `--surface`, and `--read-only`, so it shows
exactly what you can run).

All `discover` output is read-only and needs no credentials.

## The four rungs of disclosure

Climb only as far as you need.

### 1. Map — `bgc discover`

Lists the business **domains** and how many verbs each has, plus the `meta` tools
(`raw`, `discover`). Start here when you don't know where a capability lives.

```bash
bgc discover
```

### 2. Domain — `bgc discover --domain <d>`

Lists the verbs in one domain with one-line descriptions, their risk level, write
flag, and the catalog operations each one fronts.

```bash
bgc discover --domain trade
bgc discover --domain funds
```

### 3. Verb — `bgc discover --tool <verb>`

Returns one verb's full input schema and metadata. Two shapes:

- **Action-routed verb** (most verbs): you get an `actions` list and a hint to drill
  into a specific action. The top-level schema is the *union* across all actions —
  don't assemble a call from it; go to rung 4 for the exact per-action contract.
- **Action-less verb** (e.g. `account_overview`): you get an explicit
  `required` / `optional` param split directly — ready to call.

```bash
bgc discover --tool order            # action-routed → see actions list
bgc discover --tool account_overview # action-less → ready-to-call params
```

### 4. Action — `bgc discover --tool <verb> --action <name>`

The authoritative contract: this action's `required` and `optional` params, each
with `type`, `enum` (allowed values), and a doc-grounded `description`, plus the
underlying `method`, `path`, `operationId`, `isWrite`, `riskLevel`
(`read`|`write`|`high`), and `requiresConfirm` (`true` only for the high-risk ops
that need `--confirm`). **Read this before constructing any non-trivial or any
trading command.**

```bash
bgc discover --tool order --action place
bgc discover --tool position --action closeAll
bgc discover --tool withdraw --action submit
```

## Keyword search — `bgc discover --search <q>`

When you don't know the domain or verb, search the whole surface (verb names,
actions, fronts, descriptions). Returns ranked matches and which verb to open next.

```bash
bgc discover --search "funding rate"
bgc discover --search leverage
bgc discover --search withdraw
```

## Widening the surface

By default the CLI exposes `--modules all` at the **intent** surface (the 14 curated
verbs). Two ways to see more:

- **Hidden to-B modules** (`broker`, `inst_loan`) are NOT in `all` — name them
  explicitly to make them discoverable and callable:

  ```bash
  bgc discover --modules broker --domain broker
  bgc broker --action listSubs --modules broker
  ```

- **`--full` / `--surface full`** also exposes the 1:1 generated tool per catalog
  operation (one tool per raw endpoint) for power/debug use. The intent verbs cover
  every operation, so you rarely need this.

## When no verb fits: `raw`

Every catalog operation is reachable by id through the `raw` escape hatch, bypassing
the intent layer. Find the `operationId` from rung 4 (or `commands.md`) and call:

```bash
bgc raw --operationId getTickers --args '{"category":"SPOT","symbol":"BTCUSDT"}'
```

`raw` still flows through the same write-safety gate, so high-risk operations via
`raw` also require `confirm: true` in `--args`.

## Typical flow

```bash
# "What can I do with orders, and how do I place one?"
bgc discover --domain trade                 # find the `order` verb
bgc discover --tool order                   # see its actions
bgc discover --tool order --action place    # get the exact params
bgc order --action place --category SPOT --symbol BTCUSDT \
  --side buy --orderType market --qty 0.001 --dry-run   # preview first
```
