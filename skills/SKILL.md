---
name: bitget
description: >
  Use this skill whenever the user wants to check prices, pull candlesticks / K-line
  (OHLCV) history, the orderbook or other market data, manage account balances,
  place or cancel orders, manage futures/spot/margin positions, set leverage or
  margin/position mode, transfer funds, deposit or withdraw, check funding rates,
  use demo/paper trading, take loans, or do anything else on the Bitget exchange.
  Invoke this skill even when the user doesn't say "Bitget" by name — action phrases
  like "check my open orders", "cancel my BTC position", "move USDT to futures",
  "what's my P&L", "place a market sell", "how much can I withdraw", "show my
  positions", "set leverage to 10x", "what's the funding rate", "show me BTC daily
  candles", "pull the 4h K-line" all require this skill. Also invoke for
  Chinese-language trading requests such as "查看我的账户",
  "下一个限价单", "查看持仓盈亏", "转账到合约账户", "BTC现在多少钱", "看下K线", "查历史K线",
  "设置杠杆", "提币" —
  these are Bitget operations even without the exchange name. Always invoke this
  skill before attempting any exchange trading task from scratch.
---

# Bitget Skill (Unified Trading Account / v3)

Drive the Bitget exchange through the `bgc` CLI — one Unified Trading Account (UTA)
covering spot, margin, and futures, plus funds, sub-accounts, loans, and broker
operations. The CLI is a thin shell over the Bitget Agent SDK: the SDK owns action
dispatch, input validation, write-safety, and discovery, so this skill teaches you
the **grammar** and the **safe workflow**, then points you at the reference docs.

Reference docs live in this skill's `references/` directory (alongside this file).

## Step 1: Check prerequisites

```bash
bgc --version
```

If not found → tell the user: `npm install -g @bitget-ai/bitget-agent-cli`

Public market data needs no credentials. Everything else (account, trading,
transfers, withdrawals) needs API credentials as environment variables. See
`references/auth-setup.md`.

## Step 2: The grammar (this replaced the old v2 grammar)

```
bgc <tool> [--action <name>] [--<param> <value> ...] [global flags]
```

- **One verb per call.** There are 14 intent verbs (e.g. `market`, `order`,
  `position`, `account_overview`, `transfer_funds`, `withdraw`).
- **`--action`** picks the intent for an action-routed verb
  (`bgc order --action place`, `bgc position --action closeAll`).
  A few verbs take no action (e.g. `account_overview` is a single-shot snapshot).
- **Values coerce by shape:** `true`/`false` → boolean, a value starting with `[`
  or `{` → JSON (e.g. `--orders '[{...}]'`), everything else stays a string.

> The old v2 form `bgc <module> <tool_name>` (e.g. `bgc spot spot_get_ticker`) is
> **gone**. There are no separate spot/futures modules — one `--category` param
> (`SPOT`, `MARGIN`, `USDT-FUTURES`, `COIN-FUTURES`, `USDC-FUTURES`) selects the market.

## Step 3: Discover before you assemble a call

Don't guess parameters. The CLI introspects its own live surface:

```bash
bgc discover                              # list domains + verb counts
bgc discover --domain trade               # verbs in a domain
bgc discover --tool order                 # one verb: actions + full schema
bgc discover --tool order --action place  # exact required/optional contract
bgc discover --search "funding rate"      # keyword-search the whole surface
```

`bgc discover --tool <verb> --action <name>` is the authoritative, always-current
parameter contract. **Read it before constructing any non-trivial command**, especially
for trading. Full guide: `references/discover-guide.md`.

A complete **static** catalog of every verb, action, and parameter is in
`references/commands.md` (auto-generated from the SDK — navigate by its domain TOC).

## Output contract

All output is JSON.

- **Success** → stdout, exit 0: `{ endpoint, requestTime, data }` — `data` is the result.
- **Error** → stderr, exit 1: `{ ok: false, error: { type, category, message, suggestion, retryable }, timestamp }`.
- **`--dry-run`** → stdout, exit 0: `{ dryRun: true, operationId, wouldSend, ... }` — the would-send request, nothing sent.
- **Confirmation gate** → stdout, exit 0: `{ confirmationRequired: true, operationId, hint, ... }` — a high-risk write that was NOT executed because `--confirm` was absent. This is a **normal result, not an error.**

On error, branch on `error.category`: `auth`/`param` → fix the request and resend;
`balance`/`risk` → surface to the user (cannot self-heal); `rate`/`network` → back
off and retry; `config` → check account mode / credentials. See `references/error-codes.md`.

## The 14 verbs

| Domain | Verb | Use for |
|--------|------|---------|
| market | `market` | Tickers, orderbook, candles, instruments, funding rate, open interest (public) |
| trade | `order` | Place/cancel/modify orders (single or batch), open/history/fills, max-openable |
| trade | `position` | Current/history positions, ADL rank, **close** (one, by symbol) / **closeAll** |
| trade | `strategy_order` | Trigger/plan orders: place/cancel/modify/open/history |
| account | `account_overview` | One-call snapshot: assets, settings, funding assets, (opt.) positions + fee rate |
| account | `account_config` | Account settings: leverage, position/holding mode (one-way/hedge), account mode (basic/advanced) |
| account | `repayment` | Repay liabilities |
| funds | `transfer_funds` | Transfer between accounts / sub-accounts |
| funds | `deposit` | Deposit address & records |
| funds | `withdraw` | **Withdraw** (high-risk) & records |
| funds | `funds_records` | Funding/transfer/deposit/withdraw history |
| subaccount | `subaccount` | Create/list sub-accounts, manage their API keys & assets |
| loan | `loan` | Crypto loans: borrow, repay, orders, collateral |
| tax | `tax` | Tax/transaction records |

Use `discover` for the actions and exact params of any verb.

## Write safety: two different "confirms" — don't conflate them

Operations are graded **read < write < high**. There are TWO separate confirmation
concepts here, and mixing them up is the single biggest source of trading mistakes:

1. **Confirm with the USER — for every write.** Before running ANY write (placing or
   cancelling orders, transfers, withdrawals, setting leverage, borrowing, repaying),
   summarize what it will do and get the user's go-ahead. This is your *behavior*, not
   a CLI flag. Never silently execute a write.
   > Example: "This places a limit BUY of 0.01 BTC at $70,000 on BTCUSDT (SPOT). OK to send?"

2. **The `--confirm` flag — for high-risk ops only.** This is a CLI gate that ONLY four
   operations require: `closeAllPositions`, `cancelAllOrders`, `withdrawal`,
   `brokerSubaccountWithdrawal`. Without `--confirm` they return
   `{ confirmationRequired: true }` and send nothing (a normal result, not an error).

**Ordinary writes do NOT take `--confirm`.** A plain `order --action place`, a single
`cancel`, a `transfer_funds`, a leverage change — these execute **live** the moment you
omit `--dry-run`. `--confirm` is not their gate and adding it changes nothing; the
user's go-ahead (concept 1) is what authorizes them.

**Don't guess which kind an action is — read its contract.**
`bgc discover --tool <verb> --action <name>` reports `riskLevel` (`read`|`write`|`high`)
and `requiresConfirm` (`true` only for the four high-risk ops).

Safety flags:
- `--dry-run` — preview the would-send request without sending it (great for showing the user exactly what will happen).
- `--confirm` — execute a **high-risk** operation. No effect on an ordinary write or a read.
- `--read-only` — block all writes for the session.
- `--paper-trading` — route writes to the Bitget demo environment (see below).

**Recommended patterns:**
- *Ordinary write:* preview with `--dry-run` (or just summarize the effect), get the user's OK, then run it — no `--confirm`.
- *High-risk write:* `--dry-run` to preview → show the user the `wouldSend` payload → on their OK, re-run with `--confirm`.

## Trading specifics — read before trading

Before constructing futures close / TP-SL / withdrawal commands, read
`references/trading-safety.md`. Critical rules:

- **Close ONE position at market: `position --action close --symbol <PAIR>`.** High-risk →
  needs `--confirm`; in hedge mode add `--posSide long|short`. It hard-requires `--symbol`, so it
  can never flatten the whole category by omission.
- **Close EVERYTHING in a category: `position --action closeAll --category <CAT>`** (optionally
  narrowed by `--symbol`) — also high-risk, needs `--confirm`.
- **Close at YOUR price instead of market:** `order --action place` with the OPPOSITE side — one-way
  mode add `--reduceOnly yes`; hedge mode set `--posSide` to the side you're closing. (Selling to
  "close" a short actually opens more short — check `position --action info` first.)
- **Limit orders require `--price`** (market orders take none); in hedge mode `--posSide` is required
  too. `discover --tool order --action place` reports these under `conditionalRequired`.
- **TP/SL:** preset `--takeProfit` / `--stopLoss` on the opening order, or manage after entry via `strategy_order`.
- **Spot market BUY `qty` is in quote coin (USDT), not base coin** — confirm intent to avoid mis-sized orders.
- **Withdrawals:** always show the chain and destination address in the confirmation; wrong chain is irreversible.

## Demo / paper trading

When the user wants to practice or says "demo"/"paper"/"simulated", add `--paper-trading`
to writes (needs separate demo credentials; mutually exclusive with `--read-only`). Keep
the whole session in one mode — never mix live and demo. See `references/demo-trading.md`.

## Output presentation

- **Prices/tickers:** symbol, last price, 24h change, volume — readable summary, not raw JSON.
- **Order lists:** table with orderId, symbol, side, price, qty, status.
- **Balances:** coin, available, frozen; skip dust (< 0.0001).
- **Positions:** symbol, side (long/short), size, entry, mark, unrealized PnL, **liquidation price**, leverage. Never omit liquidation price.
- **Funding rates:** current rate, annualized, next settlement time.
- For raw data the user didn't ask to see: summarize, don't dump full JSON. Use `--view summary` (default) and `--fields` to trim large payloads.

## Escape hatch

If no verb fronts the operation you need, reach any catalog operation by id:

```bash
bgc raw --operationId <id> --args '{"category":"SPOT","symbol":"BTCUSDT"}'
```
